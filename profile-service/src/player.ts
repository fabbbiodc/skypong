import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { getProfileDB } from "./database/dbPlayers";
import { getDbHelpers } from "./utils/helpers";
import * as ProfileTypes from "./types/profile.types";
import * as ProfileInterfaces from "./types/profile.interfaces";
import * as ProfileEnums from "./types/profile.enums";

// --- CONFIGURATION ---
const MAX_RETRIES = 5;

const AVATARS_DIR = path.join("/app/uploads", "avatars");
const DEFAULT_AVATAR_PATH = path.join("/app/static", "default-avatar.webp");
const DEFAULT_AVATAR = "/static/default-avatar.webp";

const AUTH_API = process.env.AUTH_SERVICE_URL!;

if (!process.env.AUTH_SERVICE_URL) {
  throw new Error("AUTH_SERVICE_URL env variable is required");
}

console.log("[profile] Auth service URL:", AUTH_API);

const STATS_API = process.env.STATS_SERVICE_URL!;

if (!process.env.STATS_SERVICE_URL) {
  throw new Error("STATS_SERVICE_URL env variable is required");
}

console.log("[profile] Statistics service URL:", STATS_API);

const SERVICE_TOKEN = process.env.SERVICE_TOKEN!;

if (!process.env.SERVICE_TOKEN) {
  throw new Error("SERVICE_TOKEN env variable is required");
}

console.log("[profile] Auth service token:", SERVICE_TOKEN);

// --- DB ---
const db = getDbHelpers(getProfileDB());

// --- TYPES ---
const AI_USER_IDS = new Set<string>(Object.values(ProfileEnums.AIUserType));

const AI_RATES: Record<ProfileEnums.AIUserType, number> = {
  [ProfileEnums.AIUserType.EASY]: 800,
  [ProfileEnums.AIUserType.MEDIUM]: 1200,
  [ProfileEnums.AIUserType.HARD]: 1600,
};

// --- UTILS FOR DB ---
const PROFILE_QUERY = `
  SELECT
    p.user_id,
    p.nickname,
    p.avatarUrl,
    p.winPhrase,
    p.localization,
    p.created_at,
    p.last_access_at,
    p.logged,
    p.access_expires_at,

    s.played,
    s.wins,
    s.losses,
    s.winrate,
    s.rate,
    s.updated_at AS stats_updated_at
  FROM players p
  LEFT JOIN player_stats s ON s.user_id = p.user_id
  WHERE p.user_id = ?
    AND p.deleted = 0
  LIMIT 1
`;

// --- UTILS ---
function generateNickname(isDeleted: boolean): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString("base64url");

  const tail = (ts + rand).slice(0, 10);

  return isDeleted ? `deleted_${tail}` : `u_${tail}`;
}

// --- CALCULATION OF RATE FOR PVP AND AI ---

function calculateRate(
  userRate: number,
  opponentRate: number,
  result: "win" | "loss",
): number {
  const K = 42;

  const expected = 1 / (1 + Math.pow(10, (opponentRate - userRate) / 400));

  const score = result === "win" ? 1 : 0;

  const final = Math.round(userRate + K * (score - expected));

  return Math.max(final, 0);
}

function calculateHumanAiRate(
  humanRate: number,
  aiUserId: string,
  result: "win" | "loss",
): number {
  const aiRate = AI_RATES[aiUserId as ProfileEnums.AIUserType];
  return calculateRate(humanRate, aiRate, result);
}

async function apply(userId: string, result: "win" | "loss", rate: number) {
  await db.run(
    `
        UPDATE player_stats
        SET
          wins = wins + ?,
          losses = losses + ?,
          played = played + 1,
          winrate = ((wins + ?) * 1.0 / (played + 1)),
          rate = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
    [
      result === "win" ? 1 : 0,
      result === "loss" ? 1 : 0,
      result === "win" ? 1 : 0,
      rate,
      userId,
    ],
  );
}

async function applyAi(userId: string, result: "win" | "loss", rate: number) {
  await db.run(
    `
        UPDATE player_ai_stats
        SET
          wins = wins + ?,
          losses = losses + ?,
          played = played + 1,
          winrate = ((wins + ?) * 1.0 / (played + 1)),
          rate = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
    [
      result === "win" ? 1 : 0,
      result === "loss" ? 1 : 0,
      result === "win" ? 1 : 0,
      rate,
      userId,
    ],
  );
}

// --- CHECKER IF AVATAR EXISTS ---
export async function ensureAvatarIsAlive(
  userId: string,
  avatarUrl: string | null,
) {
  if (!avatarUrl) {
    await updatePlayerAvatar(userId, DEFAULT_AVATAR);
    console.log(
      `[ensureAvatarIsAlive] Avatar missing for ${userId}, set default.`,
    );
    return;
  }

  if (avatarUrl === DEFAULT_AVATAR) return;

  const filename = path.basename(avatarUrl);
  const filePath = path.join(AVATARS_DIR, filename);

  try {
    await fs.promises.access(filePath);
    return;
  } catch {
    await updatePlayerAvatar(userId, DEFAULT_AVATAR);
    console.log(
      `[ensureAvatarIsAlive] Avatar missing for ${userId}, set default.`,
    );
  }
}

// GET PLAYER
export async function getPlayerById(
  userId: string,
): Promise<ProfileInterfaces.PlayerInfo | null> {
  const row = await db.get<any>(PROFILE_QUERY, [userId]);

  if (!row) return null;

  return {
    id: row.user_id,
    nickname: row.nickname,
    avatarUrl: row.avatarUrl ?? null,
    winPhrase: row.winPhrase ?? null,
    localization: row.localization,
    created_at: row.created_at,
    last_access_at: row.last_access_at,
    logged: row.logged,
    access_expires_at: row.access_expires_at,

    stats: {
      played: row.played ?? 0,
      wins: row.wins ?? 0,
      losses: row.losses ?? 0,
      winrate: row.winrate ?? 0,
      rate: row.rate ?? 0,
      updated_at: row.stats_updated_at ?? null,
    },
  };
}

// CREATE PLAYER
export async function createPlayer(userId: string) {
  for (let i = 1; i <= MAX_RETRIES; i++) {
    const nickname = generateNickname(false);

    try {
      let exp = await getUserSessionExpire(userId);

      if (!exp) {
        exp = "2025-12-01";
      }

      await db.run(
        `INSERT INTO players (user_id, nickname, last_access_at, logged, access_expires_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, 1, ?)`,
        [userId, nickname, exp],
      );

      await db.run(
        `
		   INSERT OR IGNORE INTO player_stats
		   (user_id, played, wins, losses, winrate, rate, updated_at)
		   VALUES
		   (?, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP)
		   `,
        [userId],
      );

      await db.run(
        `
           INSERT OR IGNORE INTO player_ai_stats
           (user_id, played, wins, losses, winrate, rate, updated_at)
           VALUES
           (?, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP)
           `,
        [userId],
      );

      const player = await getPlayerById(userId);

      if (!player) {
        throw new Error("Player not found after create");
      }

      console.log("[createPlayer]", userId, nickname);

      return player;
    } catch (err: any) {
      if (err?.code === "SQLITE_CONSTRAINT") {
        if (i === MAX_RETRIES) {
          throw new Error("Nickname collision limit");
        }

        continue;
      }

      throw err;
    }
  }

  throw new Error("createPlayer failed");
}

// UPDATE TEXT INFO
export async function updatePlayerInfo(
  userId: string,
  data: ProfileInterfaces.UpdatePlayerInfo,
) {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.nickname !== undefined) {
    fields.push("nickname = ?");
    values.push(data.nickname);
  }

  if (data.winPhrase !== undefined) {
    fields.push("winPhrase = ?");
    values.push(data.winPhrase);
  }

  if (data.localization !== undefined) {
    fields.push("localization = ?");
    values.push(data.localization);
  }

  if (!fields.length) return;

  values.push(userId);

  const sql = `
    UPDATE players
    SET ${fields.join(", ")}
    WHERE user_id = ?
  `;

  await db.run(sql, values);
}

// UPDATE AVATAR
export async function updatePlayerAvatar(userId: string, avatarUrl: string) {
  const final = avatarUrl && avatarUrl.length ? avatarUrl : DEFAULT_AVATAR;
  console.info("Updating avatar in DB: ", final);
  await db.run(`UPDATE players SET avatarUrl = ? WHERE user_id = ?`, [
    final,
    userId,
  ]);
}

// UPDATE PLAYER'S ONLINE STATUS
export async function getUserSessionExpire(
  userId: string,
): Promise<string | null> {
  try {
    const url = `${AUTH_API}/internal/auth/session_state/${userId}`;
    const response = await axios.get<{ exp: string }>(url, {
      headers: {
        Authorization: `Bearer ${SERVICE_TOKEN}`,
      },
    });

    return response.data.exp ?? null;
  } catch (err: any) {
    console.error("Failed to get user session expire:", err.message);
    return null;
  }
}

export async function updatePlayerOnlineStatus(
  userId: string,
  logged: boolean,
) {
  const repoDate = "2025-12-01";

  console.info(
    "[profile: Player updayePlayerOnlineStatus] Updating player state...",
  );

  try {
    const exp = await getUserSessionExpire(userId);

    if (logged) {
      if (exp) {
        await db.run(
          `UPDATE players 
                     SET last_access_at = CURRENT_TIMESTAMP, logged = 1, access_expires_at = ? 
                     WHERE user_id = ?`,
          [exp, userId],
        );
      } else {
        await db.run(
          `UPDATE players 
                     SET last_access_at = CURRENT_TIMESTAMP, logged = 0, access_expires_at = ? 
                     WHERE user_id = ?`,
          [repoDate, userId],
        );
      }

      console.info("User set as logged with date ...");
    } else {
      await db.run(
        `UPDATE players 
                 SET last_access_at = CURRENT_TIMESTAMP, logged = 0, access_expires_at = ? 
                 WHERE user_id = ?`,
        [repoDate, userId],
      );

      console.info("User set as logged OUT with REPO date ...");
    }
  } catch (err) {
    console.error("Failed to update player online status:", err);
  }
}

// SOFT DELETE
export async function softdeletePlayer(userId: string) {
  const nickname = generateNickname(true);

  await db.run("BEGIN TRANSACTION");

  try {
    await db.run(
      `
				   UPDATE players
			   	   SET
			 	   nickname = ?,
			 	   avatarUrl = ?,
			 	   deleted = 1,
			 	   deleted_at = CURRENT_TIMESTAMP,
				   access_expires_at = '2025-12-01'
			   	   WHERE user_id = ?
			   	   `,
      [nickname, DEFAULT_AVATAR, userId],
    );

    await db.run(
      `
				   DELETE FROM friends 
				   WHERE user1_id = ? OR user2_id = ?
				   `,
      [userId, userId],
    );

    await db.run("COMMIT");
  } catch (err) {
    await db.run("ROLLBACK");
    throw err;
  }
}

// UPDATE STATS (TRANSACTION)
export async function updatePlayerStats(
  gameId: string,
  p1: ProfileTypes.PlayerResult,
  p2: ProfileTypes.PlayerResult,
): Promise<ProfileTypes.ApplyResult> {
  await db.exec("BEGIN IMMEDIATE");

  try {
    // Do reserve game
    const reserve = await db.run(
      `
      INSERT OR IGNORE INTO processed_games(game_id, processed_at)
      VALUES (?, CURRENT_TIMESTAMP)
      `,
      [gameId],
    );

    if (reserve.changes === 0) {
      await db.exec("ROLLBACK");
      return { applied: false };
    }

    if (AI_USER_IDS.has(p1.user_id) || AI_USER_IDS.has(p2.user_id)) {
      const humanUserId = AI_USER_IDS.has(p1.user_id) ? p2.user_id : p1.user_id;
      const aiUserId = AI_USER_IDS.has(p1.user_id) ? p1.user_id : p2.user_id;

      console.log("Human player ID:", humanUserId);

      const player = await db.all<{
        user_id: string;
        wins: number;
        losses: number;
        rate: number;
      }>(
        `
		   SELECT user_id, wins, losses, rate
		   FROM player_ai_stats
		   WHERE user_id = ?
		   `,
        [humanUserId],
      );

      if (player.length !== 1) {
        await db.exec("ROLLBACK");
        return { applied: false };
      }

      const humanResult = p1.user_id === humanUserId ? p1.result : p2.result;

      const newHumanRate = calculateHumanAiRate(
        player[0].rate,
        aiUserId,
        humanResult,
      );

      console.log("New human rate:", newHumanRate);

      await applyAi(player[0].user_id, humanResult, newHumanRate);

      await db.exec("COMMIT");

      return {
        applied: true,
        rate: newHumanRate,
      };
    } else {
      // Load players
      const players = await db.all<{
        user_id: string;
        wins: number;
        losses: number;
        rate: number;
      }>(
        `
      SELECT user_id, wins, losses, rate
      FROM player_stats
      WHERE user_id IN (?, ?)
      `,
        [p1.user_id, p2.user_id],
      );

      if (players.length !== 2) {
        await db.exec("ROLLBACK");
        return { applied: false };
      }

      const A = players.find((p) => p.user_id === p1.user_id)!;
      const B = players.find((p) => p.user_id === p2.user_id)!;

      const newA = calculateRate(A.rate, B.rate, p1.result);
      const newB = calculateRate(B.rate, A.rate, p2.result);

      await apply(A.user_id, p1.result, newA);
      await apply(B.user_id, p2.result, newB);

      await db.exec("COMMIT");

      return {
        applied: true,
        rate: newA,
      };
    }
  } catch (err) {
    await db.exec("ROLLBACK");
    throw err;
  }
}

// LEADERBOARD
export async function getLeaderboard(lastSync: string) {
  const rows = await db.all<ProfileTypes.LeaderboardRow>(
    `
    SELECT
      s.user_id,
      s.played,
      s.wins,
      s.losses,
      s.winrate,
      s.rate,
      s.updated_at

    FROM player_stats s
    JOIN players p ON p.user_id = s.user_id

    WHERE
      s.updated_at > ?
      AND p.deleted = 0

    ORDER BY s.updated_at
    LIMIT 1000
    `,
    [lastSync],
  );

  return {
    last: rows.at(-1)?.updated_at || lastSync,
    players: rows,
  };
}

// GET BATCH OF PROFILES
export async function getBatchProfiles(userIds: string[]) {
  if (!Array.isArray(userIds)) {
    throw new Error("INVALID_IDS");
  }

  if (userIds.length > 100) {
    throw new Error("TOO_MANY_IDS");
  }

  return getProfilesByIds(userIds);
}

async function getProfilesByIds(userIds: string[]) {
  if (!userIds.length) return [];

  const db = getProfileDB();

  const placeholders = userIds.map(() => "?").join(",");

  const sql = `
				SELECT
		  		user_id,
				nickname,
				avatarUrl,
		  		last_access_at,
				logged,
		  		access_expires_at
				FROM players
				WHERE user_id IN (${placeholders})
			  	`;

  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, userIds, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// PUBLIC PROFILE
export async function getUserPublicProfile(
  userId: string,
): Promise<ProfileInterfaces.PlayerInfo | null> {
  const row = await db.get<any>(PROFILE_QUERY, [userId]);

  if (!row) return null;

  return {
    id: row.user_id,
    nickname: row.nickname,
    avatarUrl: row.avatarUrl ?? null,
    winPhrase: row.winPhrase ?? null,
    localization: row.localization,
    created_at: row.created_at,
    last_access_at: row.last_access_at,
    logged: row.logged,
    access_expires_at: row.access_expires_at,

    stats: {
      played: row.played ?? 0,
      wins: row.wins ?? 0,
      losses: row.losses ?? 0,
      winrate: row.winrate ?? 0,
      rate: row.rate ?? 0,
      updated_at: row.stats_updated_at ?? null,
    },
  };
}

// HISTORY OF USER'S GAMES
export async function getUserGameHistory(
  userId: string,
): Promise<ProfileInterfaces.GameHistoryItem[]> {
  try {
    const url = `${STATS_API}/internal/statistics/games/history/${userId}`;
    const response = await axios.get<any[]>(url, {
      headers: { Authorization: `Bearer ${SERVICE_TOKEN}` },
    });

    const games = response.data;

    console.log("Games:", games);

    const result: ProfileInterfaces.GameHistoryItem[] = [];

    for (const game of games) {
      // Player 1
      let player1:
        | ProfileInterfaces.PlayerGamesHistoryData
        | ProfileInterfaces.AIGamesHistoryData;
      if (Object.values(ProfileEnums.AIUserType).includes(game.user1_id)) {
        player1 = {
          id: game.user1_id,
          nickname: game.user1_id,
          avatar: null,
          points: game.user1_score,
          session_expires_at: null,
          last_access: null,
          logged: 1,
        };
      } else {
        const p1 = await getPlayerById(game.user1_id);
        if (!p1) continue;
        player1 = {
          id: p1.id,
          nickname: p1.nickname,
          avatar: p1.avatarUrl,
          points: game.user1_score,
          session_expires_at: p1.access_expires_at,
          last_access: p1.last_access_at,
          logged: p1.logged,
        };
      }

      // Player 2
      let player2:
        | ProfileInterfaces.PlayerGamesHistoryData
        | ProfileInterfaces.AIGamesHistoryData;
      if (Object.values(ProfileEnums.AIUserType).includes(game.user2_id)) {
        player2 = {
          id: game.user2_id,
          nickname: game.user2_id,
          avatar: null,
          points: game.user2_score,
          session_expires_at: null,
          last_access: null,
          logged: 1,
        };
      } else {
        const p2 = await getPlayerById(game.user2_id);
        if (!p2) continue;
        player2 = {
          id: p2.id,
          nickname: p2.nickname,
          avatar: p2.avatarUrl,
          points: game.user2_score,
          session_expires_at: p2.access_expires_at,
          last_access: p2.last_access_at,
          logged: p2.logged,
        };
      }

      // Winner - if User1 - 0, if User2 - 1 - for serializacion at frontend
      const winner = game.user1_result === "win" ? 0 : 1;

      result.push({
        gameId: game.game_id,
        gameMode: game.game_mode || "local-pvp",
        gameDate: game.end_at,
        player1,
        player2,
        winner,
      });
    }

    return result;
  } catch (err) {
    console.error("Failed to fetch game history", err);
    return [];
  }
}

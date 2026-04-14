import { getStatisticsDB } from "./database/dbStats";
import { getDbHelpers } from "./utils/helpers";
import * as StatsTypes from "./types/stats.types";
import * as StatsEnums from "./types/stats.enums";

export { StatsEnums };

// --- DB ---
const db = getDbHelpers(getStatisticsDB());

// --- UTILS ---
const AI_USER_IDS = new Set<string>(Object.values(StatsEnums.AIUserType));

// --- MAIN FUNCTIONS ---

function detectGameMode(user1Id: string, user2Id: string): StatsEnums.GameMode {
  if (AI_USER_IDS.has(user1Id) || AI_USER_IDS.has(user2Id)) {
    return StatsEnums.GameMode.AI;
  }

  return StatsEnums.GameMode.REMOTE;
}

export async function getGamesHistoryByUserId(
  userId: string,
): Promise<StatsTypes.GameHistoryRow[]> {
  const { all } = db;

  const rows = await all<StatsTypes.GameHistoryRow>(
    `
    SELECT
      game_id,
      user1_id,
      user2_id,
      user1_score,
      user2_score,
      user1_result,
      user2_result,
      start_at,
      end_at,
      game_mode
    FROM games_and_results
    WHERE user1_id = ? OR user2_id = ?
    ORDER BY end_at DESC
    `,
    [userId, userId],
  );

  return rows ?? [];
}

export async function addGameStats(game: StatsTypes.GameResult): Promise<void> {
  const { run } = db;

  if (game.players.length !== 2) {
    throw new Error("Game must have exactly 2 players");
  }

  let [p1, p2] = game.players;

  if (p1.user_id > p2.user_id) {
    [p1, p2] = [p2, p1];
  }

  const game_mode = detectGameMode(p1.user_id, p2.user_id);

  console.log("[stats addGameStats game mode: ]", game_mode);

  await run(
    `
	    	INSERT OR IGNORE INTO games_and_results (
		  	game_id,

		  	user1_id,
		  	user2_id,

		  	user1_score,
		  	user2_score,

		  	user1_result,
		  	user2_result,

		  	start_at,
		  	end_at,

			game_mode

	    	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	    	`,
    [
      game.game_id,

      p1.user_id,
      p2.user_id,

      p1.user_score,
      p2.user_score,

      p1.user_result,
      p2.user_result,

      game.start_at,
      game.end_at,

      game_mode,
    ],
  );
}

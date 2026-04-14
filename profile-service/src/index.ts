import Fastify from "fastify";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { access, unlink, constants } from "fs/promises";
import chalk from "chalk";
import { initProfileDB, getProfileDB } from "./database/dbPlayers";
import {
  getPlayerById,
  getBatchProfiles,
  createPlayer,
  updatePlayerInfo,
  ensureAvatarIsAlive,
  updatePlayerAvatar,
  updatePlayerOnlineStatus,
  updatePlayerStats,
  getLeaderboard,
  softdeletePlayer,
  getUserPublicProfile,
  getUserGameHistory,
} from "./player";
import * as friendService from "./friendService";
import { publicKey } from "./keys";
import { updatePlayerInfoSchema } from "./validation/checkInput";
import * as ProfileTypes from "./types/profile.types";
import * as ProfileInterfaces from "./types/profile.interfaces";

// --- CONFIGURATION ---
const fastify = Fastify({ logger: true });

const chatClients = new Set<ProfileTypes.ChatClient>();

function encodeWebSocketTextFrame(text: string): Buffer {
  const payload = Buffer.from(text, "utf8");
  const payloadLength = payload.length;

  if (payloadLength < 126) {
    return Buffer.concat([Buffer.from([0x81, payloadLength]), payload]);
  }

  if (payloadLength <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payloadLength, 2);
    return Buffer.concat([header, payload]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(payloadLength), 2);
  return Buffer.concat([header, payload]);
}

function encodeWebSocketPongFrame(payload: Buffer): Buffer {
  return Buffer.concat([Buffer.from([0x8a, payload.length]), payload]);
}

function decodeWebSocketFrames(buffer: Buffer): {
  frames: { opcode: number; payload: Buffer; fin: boolean }[];
  remaining: Buffer;
} {
  const frames: { opcode: number; payload: Buffer; fin: boolean }[] = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const byte1 = buffer[offset];
    const byte2 = buffer[offset + 1];
    const fin = (byte1 & 0x80) !== 0;
    const opcode = byte1 & 0x0f;
    const masked = (byte2 & 0x80) !== 0;
    let payloadLength = byte2 & 0x7f;
    let headerLength = 2;

    if (payloadLength === 126) {
      if (offset + 4 > buffer.length) break;
      payloadLength = buffer.readUInt16BE(offset + 2);
      headerLength += 2;
    } else if (payloadLength === 127) {
      if (offset + 10 > buffer.length) break;
      const lengthAsBigInt = buffer.readBigUInt64BE(offset + 2);
      if (lengthAsBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
        break;
      }
      payloadLength = Number(lengthAsBigInt);
      headerLength += 8;
    }

    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + payloadLength;
    if (offset + frameLength > buffer.length) break;

    const payloadStart = offset + headerLength + maskLength;
    const payload = buffer.subarray(payloadStart, payloadStart + payloadLength);
    const unmaskedPayload = Buffer.from(payload);

    if (masked) {
      const mask = buffer.subarray(
        offset + headerLength,
        offset + headerLength + 4,
      );
      for (let i = 0; i < payloadLength; i += 1) {
        unmaskedPayload[i] = payload[i] ^ mask[i % 4];
      }
    }

    frames.push({ opcode, payload: unmaskedPayload, fin });
    offset += frameLength;
  }

  return { frames, remaining: buffer.subarray(offset) };
}

function broadcastChatMessage(message: {
  sender: string;
  text: string;
  timestamp: string;
}): void {
  const payload = encodeWebSocketTextFrame(JSON.stringify(message));
  for (const client of chatClients) {
    if (!client.socket.destroyed) {
      client.socket.write(payload);
    }
  }
}

function parseCookies(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce(
    (acc, item) => {
      const [rawKey, ...rest] = item.trim().split("=");
      if (!rawKey || rest.length === 0) return acc;
      acc[rawKey] = decodeURIComponent(rest.join("="));
      return acc;
    },
    {} as Record<string, string>,
  );
}

async function getChatUserFromUpgrade(
  req: any,
): Promise<{ userId: string; sender: string } | null> {
  const cookies = parseCookies(req.headers.cookie);
  const accessToken = cookies.access_token;

  if (!accessToken) return null;

  try {
    const verified = jwt.verify(accessToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "transcendence",
    }) as any;

    const userId = verified?.sub;
    if (!userId) return null;

    const player = await getPlayerById(userId);
    return {
      userId,
      sender: player?.nickname || userId,
    };
  } catch {
    return null;
  }
}

// Register metrics plugin
fastify.register(require("fastify-metrics"), {
  endpoint: "/metrics", // The route that Prometheus looks for
  defaultMetrics: { enabled: true }, // System metrics (CPU, RAM, Event Loop)
  routeMetrics: { enabled: true }, // Your route metrics (requests/second, latency)
});

const SERVICE_TOKEN = process.env.SERVICE_TOKEN!;

if (!process.env.SERVICE_TOKEN) {
  throw new Error("SERVICE_TOKEN env variable is required");
}

console.log("[auth] Auth service token:", SERVICE_TOKEN);

// --- DDOS PROTECTION VIA FILE SIZE <= 2 MB ---
fastify.register(multipart, {
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

// --- ALLOWED IMAGE FILE TYPES ---
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

// --- TYPES ---

declare module "fastify" {
  interface FastifyRequest {
    user: {
      sub: string; // Este es el user.id
      pv: number | string; // Password version
      tv: number | string; // Token version
      iss: string; // Issuer (auth-service)
      aud: string; // Audience (transcendence)
    };
  }
}

fastify.get("/healthz", async (request, reply) => {
  return { status: "ok" };
});

// --- PROFILE INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {
  const auth = req.headers.authorization;

  if (!auth) {
    return reply.status(401).send({ error: "Missing auth" });
  }

  const token = auth.replace("Bearer ", "");

  /* TODO uncomment process.env.SERVICE_OKEN in prod */

  if (token !== SERVICE_TOKEN) {
    //      	if (token !== process.env.SERVICE_TOKEN) {
    return reply.status(403).send({ error: "Forbidden" });
  }
}

fastify.register(require("@fastify/cookie"), {});

async function verifyToken(req: any, reply: any) {
  const accessToken = req.cookies?.access_token;

  console.info("------> Verifiying accestoken:", accessToken);
  if (!accessToken) {
    return reply.status(401).send({ error: "No access token" });
  }

  try {
    const verified = jwt.verify(accessToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "transcendence",
    }) as any;

    req.user = verified;
    console.info("----> Access Token Verified:", verified);
    console.info("----> req.user set to:", req.user);
    return;
  } catch (err) {
    console.error("Error verifying access token:", err);
    return reply.status(403).send({ error: "Invalid Token" });
  }
}
// --- INTERNAL PROFILE ROUTE ---
fastify.get<{ Params: { id: string } }>(
  "/internal/profile/by-user-id/:id",
  { preHandler: requireServiceAuth },
  async (req, reply) => {
    try {
      const userId = req.params.id;

      let player: ProfileInterfaces.Player | null = (await getPlayerById(
        userId,
      )) as ProfileInterfaces.Player | null;

      if (!player) {
        player = (await createPlayer(userId)) as ProfileInterfaces.Player;
      } else {
        const logged = true;
        await updatePlayerOnlineStatus(userId, logged);
      }

      return reply.send({ nickname: player.nickname });
    } catch (err) {
      req.log.error(err, "Error fetching/creating player");
      return reply.status(500).send();
    }
  },
);

fastify.get<{ Params: { id: string } }>(
  "/internal/profile/logout/:id",
  { preHandler: requireServiceAuth },
  async (req, reply) => {
    try {
      const userId = req.params.id;
      const logged = false;
      await updatePlayerOnlineStatus(userId, logged);
    } catch (err) {
      req.log.error(err, "Error user logout");
      return reply.status(500).send();
    }
  },
);

// --- PUBLIC PROFILE USER ---
fastify.get("/profile/me", { preHandler: verifyToken }, async (req, reply) => {
  console.info("!!!!! HANDLER REACHED !!!!!"); // does this appear in logs?
  console.info("----> req.user in handler:", req.user);
  try {
    const userId = req.user?.sub;

    console.info("User /me:", req.user);
    if (!userId) {
      return reply.status(401).send("User not found.");
    }

    //This is private user info so can return all info
    let player = await getPlayerById(userId);
    console.info("Player /me:", player);

    // create new player if it was authorized (signup), but no profile in database
    if (!player) {
      console.info("Creating new player for user:", userId);
      player = await createPlayer(userId);
    }

    await ensureAvatarIsAlive(userId, player.avatarUrl);

    console.info("----> Sending player profile info: ", player);
    return reply.send(player);
  } catch (err: any) {
    fastify.log.error(err);
    req.log.error(err);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

// --- PUBLIC PROFILE ---
fastify.get("/profile/:id", { preHandler: verifyToken }, async (req, reply) => {
  const { id } = req.params as { id: string };

  const user = await getUserPublicProfile(id);

  if (!user) {
    return reply.status(404).send({
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
      },
    });
  }

  await ensureAvatarIsAlive(user.id, user.avatarUrl);
  if (!user) {
    return reply.status(404).send({
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
      },
    });
  }

  await ensureAvatarIsAlive(user.id, user.avatarUrl);

  return { user };
});

// --- PRIVATE CHANGE PROFILE ---
fastify.patch(
  "/profile/updateme",
  { preHandler: verifyToken },
  async (req, reply) => {
    try {
      const userId = req.user.sub;

      const result = updatePlayerInfoSchema.safeParse(req.body);

      if (!result.success) {
        return reply.status(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.issues[0].message,
          },
        });
      }

      const data = result.data;

      // 1. Actualizamos
      await updatePlayerInfo(userId, data);

      // 2. We fetch the updated user (use the function you already have for GET profile)
      const updatedUser = await getPlayerById(userId);

      // 3. Devolvemos el objeto completo
      return reply.send({
        status: "Player info updated",
        user: updatedUser,
      });
    } catch (err: any) {
      fastify.log.error(err);
      reply.status(500).send();
    }
  },
);

// --- GET ALL USER GAMES ---
fastify.get("/profile/game-history/:id", async (req, reply) => {
  const { id: userId } = req.params as { id: string };

  try {
    const games = await getUserGameHistory(userId);
    return reply.send(games);
  } catch (err) {
    req.log.error(err, "Failed to get game history from statistics-service");
    return reply.status(500).send({
      error: "Failed to fetch game history",
    });
  }
});

// --- UPDATE USER STATS ---
fastify.post(
  "/internal/profile/gameresult/update",
  { preHandler: requireServiceAuth },
  async (req: any, reply) => {
    const res: ProfileTypes.GameResult = req.body;

    if (!res.game_id || !res.players || res.players.length !== 2) {
      return reply.status(400).send({ error: "Invalid payload" });
    }

    const [p1, p2] = res.players;

    if (
      !p1.user_id ||
      !p2.user_id ||
      !["win", "loss"].includes(p1.result) ||
      !["win", "loss"].includes(p2.result)
    ) {
      return reply.code(400).send({ error: "Invalid players" });
    }

    if (p1.result === p2.result) {
      return reply.code(400).send({ error: "Invalid match result" });
    }

    try {
      const result = await updatePlayerStats(res.game_id, p1, p2);

      if (!result.applied) {
        return reply
          .status(400)
          .send({ error: "One or both players not found in profile" });
      }

      reply.send({ status: "ok", rate: result.rate });
    } catch (err) {
      req.log.error(err);
      reply.status(500).send({ error: "PROFILE_STATS_UPDATE_FAILED" });
    }
  },
);

// --- GET UPDATED LEADERBOARD ---
fastify.get(
  "/internal/profile/leaderboard/updates",
  { preHandler: requireServiceAuth },
  async (req: any, reply) => {
    const since = req.query?.since || "2025-12-01";

    try {
      const leaderboard = await getLeaderboard(since);
      reply.send(leaderboard);
    } catch (err) {
      req.log.error(err);
      reply.status(500).send({ error: "LEADERBOARD_UPDATE_FAILED" });
    }
  },
);

// --- GET BATCH OF USERS FOR LEADERBOARD ---
fastify.post<{ Body: { userIds: string[] } }>(
  "/internal/profile/batch",
  { preHandler: requireServiceAuth },
  async (req, reply) => {
    try {
      const { userIds } = req.body;

      const profiles = await getBatchProfiles(userIds);

      console.log("---> ALL PROFILES FOR LEADERBOARD: ", profiles);

      reply.send({ profiles });
    } catch (err) {
      req.log.error(err);
      reply.status(500).send({
        error: "BATCH_PROFILE_REQUEST_FAILED",
      });
    }
  },
);

fastify.get(
  "/profile/leaderboard",
  { preHandler: verifyToken },
  async (req: any, reply) => {
    const since = req.query?.since || "2025-12-01"; //UPDATE THIS TO A SUITABLE DATE: THIS MONTH?

    try {
      const leaderboard = await getLeaderboard(since);
      reply.send(leaderboard);
    } catch (err) {
      req.log.error(err);
      reply.status(500).send({ error: "LEADERBOARD_FETCH_FAILED" });
    }
  },
);

// --- DELETE PROFILE ---
fastify.post(
  "/internal/profile/delete",
  { preHandler: requireServiceAuth },
  async (req: any, reply) => {
    console.info("-----> REQUEST", req);
    const { userId } = req.body as { userId: string };

    console.info("----> USER ID: ", userId);

    if (!userId) {
      return reply.status(400).send({ error: "userId required" });
    }

    const path = require("path");
    const AVATAR_DIR = AVATARS_DIR;
    //        const AVATAR_DIR = '/app/uploads/avatars/'; // Or the path where you physically store files

    const filePath = path.join(AVATAR_DIR, `${userId}.webp`);
    try {
      await softdeletePlayer(userId);

      // Verificamos si el archivo existe antes de intentar borrarlo
      try {
        await access(filePath, constants.F_OK);
        await unlink(filePath);
      } catch (fsErr) {
        // Si el archivo no existe, simplemente ignoramos el error y seguimos
        req.log.warn(
          `No avatar found for user ${userId}, skipping file deletion.`,
        );
      }

      reply.send({ status: "profile_deleted" });
    } catch (err) {
      req.log.error(err);

      reply.status(500).send({
        error: "PROFILE_DELETE_FAILED",
      });
    }
  },
);

// Use profile-service volume to persist avatars
//const AVATARS_DIR = process.env.AVATARS_PATH || path.join(process.cwd(), 'uploads', 'avatars');
const AVATARS_DIR = path.join("/app/uploads", "avatars");
const DEFAULT_AVATAR_PATH = path.join("/app/static", "default-avatar.webp");

// Creates service image directory
(async () => {
  try {
    await fs.mkdir(AVATARS_DIR, { recursive: true });
    console.log(`✅ Avatars directory ready: ${AVATARS_DIR}`);
  } catch (error) {
    console.error("Error creating avatars directory:", error);
  }
})();
// --- CHANGE PROFILE AVATAR ---
fastify.post(
  "/profile/avatar",
  { preHandler: verifyToken },
  async (req, reply) => {
    try {
      const userId = req?.user?.sub;
      console.info("Trying to upload avatar from", userId);

      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const file = await req.file();
      console.info("File:", file);

      if (!file) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      if (!ALLOWED_MIME.includes(file.mimetype)) {
        return reply.status(400).send({
          error: "Only PNG, JPG, WebP allowed",
        });
      }

      const buffer = await file.toBuffer();

      // Valida la imagen
      let meta;
      try {
        meta = await sharp(buffer).metadata();
      } catch {
        return reply.status(400).send({
          error: 1, //Invalid image file
        });
      }

      if (!meta.format || !["png", "jpeg", "webp"].includes(meta.format)) {
        return reply.status(400).send({
          error: 1, //Invalid image format
        });
      }

      // Procesa la imagen
      const avatar = await sharp(buffer)
        .resize(256, 256, {
          fit: "cover",
          position: "center",
        })
        .toFormat("webp", {
          quality: 80,
        })
        .toBuffer();

      // ✅ CORRECTION: Save to persistent volume
      console.log("Uploading Avatar to:", AVATARS_DIR);

      const filePath = path.join(AVATARS_DIR, `${userId}.webp`);
      await fs.writeFile(filePath, avatar);

      console.log("✅ Avatar saved at:", filePath);

      // ✅ Public avatar URL
      const avatarUrl = `/api/profile/avatars/${userId}.webp`;

      // Actualiza en la base de datos
      await updatePlayerAvatar(userId, avatarUrl);

      return reply.status(200).send({
        success: true,
        avatar: avatarUrl,
      });
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      return reply.status(500).send({
        error: err.code || "UPLOAD_ERROR",
        message: err.message || "Failed to upload avatar",
      });
    }
  },
);

fastify.get("/profile/avatars/:filename", async (req, reply) => {
  try {
    const { filename } = req.params as { filename: string };

    if (
      !filename.endsWith(".webp") ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return reply.status(400).send({ error: "Invalid filename" });
    }

    const userAvatarPath = path.join(AVATARS_DIR, filename);

    try {
      await fs.access(userAvatarPath);

      return reply
        .type("image/webp")
        .header("Cache-Control", "public, max-age=3600")
        .send(await fs.readFile(userAvatarPath));
    } catch {
      // fallback → default avatar

      const userId = filename.replace(".webp", "");
      await ensureAvatarIsAlive(userId, DEFAULT_AVATAR_PATH);

      return reply
        .type("image/png")
        .header("Cache-Control", "public, max-age=86400")
        .send(await fs.readFile(DEFAULT_AVATAR_PATH));
    }
  } catch (error) {
    console.error("Error serving avatar:", error);
    return reply.status(500).send({ error: "Failed to serve avatar" });
  }
});

fastify.addHook("onRequest", async (request, reply) => {
  console.log(`Received request: ${request.method} ${request.url}`);
});

// GET friends
fastify.get(
  "/profile/friends",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    return friendService.getFriendsService(userId);
  },
);

// GET friends of target
fastify.get(
  "/profile/friends/:targetId",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    return friendService.getFriendsOfTargetService(userId, targetId);
  },
);

// GET incoming requests
fastify.get(
  "/profile/friends/requests/incoming",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    return friendService.getIncomingRequestsService(userId);
  },
);

// GET outgoing requests
fastify.get(
  "/profile/friends/requests/outgoing",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    return friendService.getOutgoingRequestsService(userId);
  },
);

// SEND request
fastify.post(
  "/profile/friends/:toId",
  { preHandler: verifyToken },
  async (req, reply) => {
    const fromId = req.user.sub;
    const { toId } = req.params as { toId: string };
    try {
      await friendService.sendFriendRequestService(fromId, toId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// ACCEPT
fastify.post(
  "/profile/friends/:requesterId/accept",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
      await friendService.acceptFriendRequestService(userId, requesterId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// REJECT
fastify.post(
  "/profile/friends/:requesterId/reject",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
      await friendService.rejectFriendRequestService(userId, requesterId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// CANCEL
fastify.post(
  "/profile/friends/:requesterId/cancel",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { requesterId } = req.params as { requesterId: string };
    try {
      await friendService.cancelFriendRequestService(userId, requesterId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// REMOVE
fastify.delete(
  "/profile/friends/:friendId",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { friendId } = req.params as { friendId: string };
    console.info("For Player ", userId, " remove ", friendId);
    try {
      await friendService.removeFriendService(userId, friendId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// BLOCK
fastify.post(
  "/profile/friends/:targetId/block",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    console.info("---->>> For Player ", userId, " blocks ", targetId);
    try {
      await friendService.blockUserService(userId, targetId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// UNBLOCK
fastify.post(
  "/profile/friends/:targetId/unblock",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    try {
      await friendService.unblockUserService(userId, targetId);
      return { success: true };
    } catch (err: any) {
      return reply
        .status(400)
        .send({ error: { code: err.message, message: err.message } });
    }
  },
);

// --- GET FRIEND STATUS ---
fastify.get(
  "/profile/friends/status/:targetId",
  { preHandler: verifyToken },
  async (req, reply) => {
    const userId = req.user.sub;
    const { targetId } = req.params as { targetId: string };
    const status = await friendService.getFriendStatusService(userId, targetId);
    return status ?? { status: null };
  },
);

fastify.server.on("upgrade", (req, socket, _head) => {
  const requestPath = (req.url || "").split("?")[0];
  if (requestPath !== "/chat/ws") {
    socket.destroy();
    return;
  }

  (async () => {
    const user = await getChatUserFromUpgrade(req);
    if (!user) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    const wsKey = req.headers["sec-websocket-key"];
    if (!wsKey || typeof wsKey !== "string") {
      socket.write("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }

    const acceptKey = crypto
      .createHash("sha1")
      .update(`${wsKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");

    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`,
    );

    const client: ProfileTypes.ChatClient = {
      socket,
      userId: user.userId,
      sender: user.sender,
      buffer: Buffer.alloc(0),
    };

    chatClients.add(client);

    const cleanup = () => {
      chatClients.delete(client);
    };

    socket.on("data", (chunk: Buffer) => {
      client.buffer = Buffer.concat([client.buffer, chunk]);
      const { frames, remaining } = decodeWebSocketFrames(client.buffer);
      client.buffer = remaining;

      for (const frame of frames) {
        if (!frame.fin) {
          socket.destroy();
          return;
        }

        if (frame.opcode === 0x8) {
          socket.end();
          return;
        }

        if (frame.opcode === 0x9) {
          socket.write(encodeWebSocketPongFrame(frame.payload));
          continue;
        }

        if (frame.opcode !== 0x1) {
          continue;
        }

        try {
          const data = JSON.parse(frame.payload.toString("utf8")) as {
            text?: string;
          };
          const text = (data.text || "").trim();
          if (!text) continue;

          broadcastChatMessage({
            sender: client.sender,
            text: text.slice(0, 1000),
            timestamp: new Date().toISOString(),
          });
        } catch {
          continue;
        }
      }
    });

    socket.on("error", cleanup);
    socket.on("close", cleanup);
    socket.on("end", cleanup);
  })().catch(() => {
    socket.destroy();
  });
});

// --- START SERVER ---
const start = async () => {
  try {
    await initProfileDB();
    console.log(chalk.green.bold("[profile] Database initialized"));
    await fastify.listen({ port: 5000, host: "0.0.0.0" });
    console.log(
      chalk.green.bold("[profile] Player service is running on :5000"),
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

import { Client } from "colyseus.js";
import { SERVER_CONNECTION } from "./server-config";

export interface RoomInfo {
  id: string;
  name: string;
  creatorName: string;
  players: number;
  status: string;
}

let clientInstance: Client | null = null;

function getClient(): Client {
  if (!clientInstance) {
    // console.log('[RoomService] Creating new Colyseus client');
    clientInstance = new Client(SERVER_CONNECTION.WS_URL);
    // console.log('[RoomService] Client created with URL:', SERVER_CONNECTION.WS_URL);
  }
  return clientInstance;
}

function describeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      details: error,
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      message: "Non-Error throwable received",
      details: error,
    };
  }

  return {
    message: String(error),
    details: error,
  };
}

export async function getAvailableRooms(): Promise<RoomInfo[]> {
  const client = getClient();
  //   console.log('[RoomService] Connecting to:', SERVER_CONNECTION.WS_URL);
  //   console.log('[RoomService] Room type:', SERVER_CONNECTION.ROOMS.PVP_ROOM);

  try {
    const rooms = await client.getAvailableRooms(
      SERVER_CONNECTION.ROOMS.PVP_ROOM,
    );

    // console.log('[RoomService] Received rooms:', rooms);

    return rooms
      .filter((room) => room.clients < room.maxClients)
      .map((room) => ({
        id: room.roomId,
        name: room.metadata?.roomName || `Room ${room.roomId.slice(0, 6)}`,
        creatorName: room.metadata?.player1Name || "",
        players: room.clients,
        status: room.metadata?.waitingForOpponent ? "WAITING" : "FULL",
      }));
  } catch (error: unknown) {
    const describedError = describeError(error);
    console.error("[RoomService] Failed to get available rooms");
    console.error("[RoomService] Server URL:", SERVER_CONNECTION.WS_URL);
    console.error("[RoomService] Room type:", SERVER_CONNECTION.ROOMS.PVP_ROOM);
    console.error("[RoomService] Error details:", describedError);
    return [];
  }
}

export async function createRoom(options: {
  playerName: string;
  playerColor: string;
  winningScore?: number;
  playerId?: string;
  roomName?: string;
}): Promise<{ roomId: string }> {
  const client = getClient();

  //   console.log('[RoomService] Creating room with options:', options);
  //   console.log('[RoomService] Server URL:', SERVER_CONNECTION.WS_URL);

  try {
    const room = await client.create(SERVER_CONNECTION.ROOMS.PVP_ROOM, {
      playerName: options.playerName,
      playerColor: options.playerColor,
      winningScore: options.winningScore,
      playerId: options.playerId,
      roomName: options.roomName,
    });

    // console.log('[RoomService] Room created:', room.roomId);
    return { roomId: room.roomId };
  } catch (error: unknown) {
    console.error("[RoomService] Failed to create room:", describeError(error));
    throw error;
  }
}

export async function joinRoom(
  roomId: string,
  options: {
    playerName: string;
    playerColor: string;
    winningScore?: number;
    playerId?: string;
  },
): Promise<void> {
  const client = getClient();

  try {
    await client.joinById(roomId, {
      playerName: options.playerName,
      playerColor: options.playerColor,
      winningScore: options.winningScore,
      playerId: options.playerId,
    });
  } catch (error: unknown) {
    console.error(
      `[RoomService] Failed to join room ${roomId}:`,
      describeError(error),
    );
    throw error;
  }
}

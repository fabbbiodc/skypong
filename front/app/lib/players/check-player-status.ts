"use client";

/*_____________________________ GLOBALS _______________________________*/
const ACTIVE_MINS = 1;

export const PLAYER_STATUS = {
  inactive: "INACTIVE",
  absent: "ABSENT",
  active: "ACTIVE",
  blocked: "BLOCKED",
};

interface PlayerStatusInput {
  access_expires_at?: string;
  last_access_at?: string;
  logged?: boolean | number;
  blocked?: boolean;
}

function normalizePlayerStatusInput(player: unknown): PlayerStatusInput {
  if (typeof player !== "object" || player === null) {
    return {};
  }

  const candidate = player as Record<string, unknown>;

  return {
    access_expires_at:
      typeof candidate.access_expires_at === "string"
        ? candidate.access_expires_at
        : undefined,
    last_access_at:
      typeof candidate.last_access_at === "string"
        ? candidate.last_access_at
        : undefined,
    logged:
      typeof candidate.logged === "boolean" || typeof candidate.logged === "number"
        ? candidate.logged
        : undefined,
    blocked: typeof candidate.blocked === "boolean" ? candidate.blocked : undefined,
  };
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If it already has T and Z, it's valid ISO, don't modify
  if (dateStr.includes("T") || dateStr.endsWith("Z")) return new Date(dateStr);
  // If it's SQLite format "2026-03-07 14:05:03", convert
  return new Date(dateStr.replace(" ", "T") + "Z");
}

/*_____________________________ CHECKS ________________________________*/
function isConnected(sessionexpiredat: string, isLogged: boolean): boolean {
  if (!sessionexpiredat || !isLogged) return false;
  const connected =
    Date.now() < new Date(sessionexpiredat.replace(" ", "T") + "Z").getTime();
  return connected;
}

function isAbsent(lastLogin: string): boolean {
  if (!lastLogin) return false;
  const now = Date.now();
  const date = now - new Date(lastLogin.replace(" ", "T") + "Z").getTime();
  const mins = date / 60000; //milliseconds 1s * 1000 = 1000 ms | 1min * 60 * 1000 = 60000 ms
  const isAbsent = mins >= ACTIVE_MINS;
  return isAbsent;
}

/*_____________________________ Exports ________________________________*/
export function checkPlayerStatus(player: unknown): string {
  const normalizedPlayer = normalizePlayerStatusInput(player);

  const connected = isConnected(
    normalizedPlayer.access_expires_at,
    Boolean(normalizedPlayer.logged),
  );
  const absent = isAbsent(normalizedPlayer.last_access_at);

  if (normalizedPlayer.blocked) return PLAYER_STATUS.blocked;
  else if (!connected) return PLAYER_STATUS.inactive;
  else if (connected && absent) return PLAYER_STATUS.absent;
  else return PLAYER_STATUS.active;
}

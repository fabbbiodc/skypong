"use client";

/*_____________________________ GLOBALS _______________________________*/
const ACTIVE_MINS = 1;

export const PLAYER_STATUS = {
  inactive: "INACTIVE",
  absent: "ABSENT",
  active: "ACTIVE",
  blocked: "BLOCKED",
};

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Si ya tiene T y Z es ISO válido, no tocar
  if (dateStr.includes("T") || dateStr.endsWith("Z")) return new Date(dateStr);
  // Si es formato SQLite "2026-03-07 14:05:03", convertir
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
export function checkPlayerStatus(player: any): string {
  const connected = isConnected(player.access_expires_at, player.logged);
  const absent = isAbsent(player.last_access_at);

  if (player.blocked) return PLAYER_STATUS.blocked;
  else if (!connected) return PLAYER_STATUS.inactive;
  else if (connected && absent) return PLAYER_STATUS.absent;
  else return PLAYER_STATUS.active;
}

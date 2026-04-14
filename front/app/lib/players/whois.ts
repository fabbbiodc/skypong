export function whoisURL(playerId: string, userId: string): string {
  return userId === playerId ? "/me" : `/${playerId}`;
}

export function isMe(playerId: string, userId: string): boolean {
  return userId === playerId;
}

export function isAI(playerId: string) {
  if (
    playerId === "ai-easy" ||
    playerId === "ai-medium" ||
    playerId === "ai-hard"
  )
    return true;
  return false;
}

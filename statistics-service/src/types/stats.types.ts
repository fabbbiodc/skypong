import * as StatsEnums from "./stats.enums";

export { StatsEnums };

export type GameHistoryRow = {
  game_id: string;
  user1_id: string;
  user2_id: string;
  user1_score: number;
  user2_score: number;
  user1_result: "win" | "loss";
  user2_result: "win" | "loss";
  start_at: string;
  end_at: string;
  game_mode: StatsEnums.GameMode | "local-pvp" | null;
};

export type GameResult = {
  game_id: string;
  start_at: string;
  end_at: string;

  players: PlayerResult[];
};

export type GameRow = {
  game_id: string;
  user1_id: string;
  user2_id: string;
  user1_result: string;
  user2_result: string;
};

export type LeaderboardQuery = {
  by?: string;
  limit?: number;

  offset?: number;
};

export type LeaderboardRow = {
  user_id: string;

  played: number;
  wins: number;
  losses: number;

  winrate: number;
  rate: number;
  updated_at: string;

  nickname?: string;
  avatarUrl?: string;
  last_access_at?: string;
  logged?: number;
  access_expires_at?: string;
};

export type PlayerResult = {
  user_id: string;
  user_score: number;
  user_result: "win" | "loss";
};

export type PlayerStat = {
  user_id: number;

  played: number;
  wins: number;
  losses: number;

  winrate: number;
  rate: number;

  updated_at: string;
};

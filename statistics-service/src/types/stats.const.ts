export const LEADERBOARD_INDEXES = {
  rate: {
    column: 'rate',
    order: 'DESC',
  },
  winrate: {
    column: 'winrate',
    order: 'DESC',
  },
  played: {
    column: 'played',
    order: 'DESC',
  },
  wins: {
    column: 'wins',
    order: 'DESC',
  },
} as const;

export type LeaderboardIndex = keyof typeof LEADERBOARD_INDEXES;

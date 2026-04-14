export type ApplyResult =
  | { applied: false }
  | { applied: true; rate: number };

export type ChatClient = {
		socket: any;
		userId: string;
		sender: string;
		buffer: Buffer;
};

export type FriendUser = {
        user_id: string;
        nickname: string;
        avatarUrl: string | null;
        created_at: string;
        last_access_at?: string;
        logged?: number;
};

export type GameResult = {
		game_id: string;
		players: {
					user_id: string;
					result: 'win' | 'loss';
				 }[];
};

export type LeaderboardRow = {
		user_id: string;

		played: number;
		wins: number;
		losses: number;

		winrate: number;
		rate: number;

		updated_at: string;
};

export type PlayerResult = {
		user_id: string;
		result: 'win' | 'loss';
};


export type RelationRow = {
        status: 'pending' | 'accepted' | 'blocked';
        requester_id: string;
        blocked_by: string | null;
};


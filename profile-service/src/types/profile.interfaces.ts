import * as ProfileEnums from './profile.enums';

export interface AIGamesHistoryData {
	id: ProfileEnums.AIUserType;
	nickname: string;
	avatar: string | null;
	points: number;
	session_expires_at: null;
	last_access: null;	
	logged: number;
}

export interface GameHistoryItem {
	gameId: string;
	gameMode: 'ai' | 'remote-pvp';
	gameDate: string;
	player1: PlayerGamesHistoryData | AIGamesHistoryData;
	player2: PlayerGamesHistoryData | AIGamesHistoryData;	
	winner: number;
}

export interface Player {
	id: string;
	nickname: string;
	avatar?: string;
}

export interface PlayerInfo {
	id: string;
	nickname: string;
	avatarUrl: string | null;
	winPhrase: string | null;
	localization: string;
	created_at: string;
	last_access_at: string;
	logged: number;
	access_expires_at: string | null;
	stats: PlayerStats;
}

export interface PlayerGamesHistoryData {
	id: string;
	nickname: string;
	avatar: string | null;
	points: number;
	session_expires_at: string | null;
	last_access: string | null;
	logged: number;
}

export interface PlayerStats {
	played: number;
	wins: number;
	losses: number;
	winrate: number;
	rate: number;
	updated_at: string | null;
}

export interface UpdatePlayerInfo {
	nickname?: string;
	winPhrase?: string;
	localization?: string;
}


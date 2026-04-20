"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Badge } from "../base";
import { useTranslation } from "../../hooks/use-translation";
import { LoadingState } from "../patterns";
import Link from "next/link";
import { isMe, isAI } from "../../lib/players/whois";
import { useAuth } from "../../context/auth-context";
import api from "../../api/api";

interface PlayerGamesHistoryData {
  id: string;
  nickname: string;
  avatar: string | null;
  points: number;
  session_expires_at: string | null;
  last_access: string | null;
  logged: number;
}

interface AIGamesHistoryData {
  id: string;
  nickname: string;
  avatar: string | null;
  points: number;
  session_expires_at: null;
  last_access: null;
  logged: number;
}

interface GameHistoryItem {
  gameId: string;
  gameMode: "ai" | "remote-pvp";
  gameDate: string;
  player1: PlayerGamesHistoryData | AIGamesHistoryData;
  player2: PlayerGamesHistoryData | AIGamesHistoryData;
  winner: number; // 0 = player1, 1 = player2
}

function useGameHistory(userId: string) {
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api(`/api/profile/game-history/${userId}`)
      .then(setGames)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { games, loading, error };
}

function getPlayerLink(profileId: string, playerId: string, nickname: string) {
  const { user } = useAuth();

  if (
    playerId === profileId ||
    (user && isMe(playerId, user.id)) ||
    isAI(playerId)
  )
    return <span className="text-sm font-medium text-gray-900">{nickname}</span>;
  else
    return (
      <Link
        href={`/${playerId}`}
        className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200"
      >
        {nickname}
      </Link>
    );
}

function GameRow({
  game,
  profileId,
}: {
  game: GameHistoryItem;
  profileId: string;
}) {
  const { t } = useTranslation();

  const isPlayer1 = game.player1.id === profileId;
  const me = isPlayer1 ? game.player1 : game.player2;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const myNumber = isPlayer1 ? 0 : 1;
  const won = game.winner === myNumber;
  const draw = game.player1.points === game.player2.points;

  const result = draw ? "draw" : won ? "win" : "loss";
  const resultVariant = { win: "success", loss: "danger", draw: "neutral" }[
    result
  ] as "success" | "danger" | "neutral";

  const date = new Date(game.gameDate.replace(" ", "T"));
  const dateStr = date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="game-row">
      {/* Result badge */}
      <Badge
        variant={resultVariant}
        size="sm"
        shape="pill"
        className="min-w-[4rem] md:min-w-[5rem] text-center"
      >
        {t.profile.gameHistory[result]}
      </Badge>

      {/* Players */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            size="sm"
            src={me.avatar || "/avatar/default-avatar.webp"}
            fallbackText={me.nickname}
          />
          {getPlayerLink(profileId, me.id, me.nickname)}
          <span className="text-muted text-sm">{me.points}</span>
        </div>
        <span className="text-muted text-sm">vs</span>
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            size="sm"
            src={opponent.avatar || "/avatar/default-avatar.webp"}
            fallbackText={opponent.nickname}
          />
          {getPlayerLink(profileId, opponent.id, opponent.nickname)}
          <span className="text-muted text-sm">{opponent.points}</span>
        </div>
      </div>

      {/* Mode badge */}
      <Badge
        size="sm"
        variant="neutral"
        className="min-w-[3.5rem] md:min-w-[4rem] text-center shrink-0"
      >
        {game.gameMode === "ai"
          ? t.profile.gameHistory.vsAI
          : t.profile.gameHistory.pvp}
      </Badge>

      {/* Date & time */}
      <div className="text-xs text-muted text-right shrink-0 min-w-[5rem]">
        <span className="md:hidden whitespace-nowrap">
          {dateStr} {timeStr}
        </span>
        <span className="hidden md:block whitespace-nowrap">
          {dateStr}
          <br />
          {timeStr}
        </span>
      </div>
    </div>
  );
}

interface GameHistoryProps {
  userId: string;
}

export default function GameHistory({ userId }: GameHistoryProps) {
  const { t } = useTranslation();
  const { games, loading, error } = useGameHistory(userId);

  return (
    <div className="space-y-3">
      {loading && (
        <LoadingState
          variant="spinner"
          size="md"
          text={t.profile.gameHistory.loading}
        />
      )}
      {error && (
        <p className="text-danger text-sm">
          {t.profile.gameHistory.error} {error}
        </p>
      )}
      {!loading && !error && games.length === 0 && (
        <p className="text-muted text-sm text-center py-8">
          {t.profile.gameHistory.noGames}
        </p>
      )}
      {games.map((game) => (
        <GameRow key={game.gameId} game={game} profileId={userId} />
      ))}
    </div>
  );
}

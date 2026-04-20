/**
 * AchievementsSection
 *
 * Props:
 *   stats: { wins: number, losses: number, winrate: number }
 *
 * Usage:
 *   <AchievementsSection stats={player.stats} />
 */

"use client";

import { useMemo } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { ProgressBar, Badge } from "../base";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGamepad,
  faCalendar,
  faMedal,
  faBolt,
  faFire,
  faCrown,
  faBullseye,
  faTrophy,
  faStar,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import type { TranslationDictionary } from "@/lib/types/translation";

interface AchievementStats {
  wins?: number;
  losses?: number;
  winrate?: number;
}

interface AchievementItem {
  id: string;
  category: "log" | "win" | "games";
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
  comingSoon?: boolean;
  progress?: number;
  goal?: number;
}

// ─── Achievement unlock logic ────────────────────────────────────────────────
function computeAchievements(
  stats: AchievementStats | undefined,
  t: TranslationDictionary,
): AchievementItem[] {
  if (!t?.achievements?.logAchievements) return [];

  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const rate = stats?.winrate ?? 0;
  const totalGames = wins + losses;

  return [
    // ── Login achievements ──────────────────────────────────────────────────
    {
      id: "firstLogin",
      category: "log",
      icon: <FontAwesomeIcon icon={faGamepad} className="text-primary" />,
      title: t.achievements.logAchievements.firstLogin,
      description: t.achievements.logAchievements.firstLoginDesc,
      unlocked: true, // Always unlocked — if you're here, you logged in
    },
    {
      id: "login7Days",
      category: "log",
      icon: <FontAwesomeIcon icon={faCalendar} className="text-primary" />,
      title: t.achievements.logAchievements.login7Days,
      description: t.achievements.logAchievements.login7DaysDesc,
      unlocked: false, // needs backend streak data — locked by default
      comingSoon: true,
    },
    {
      id: "login30Days",
      category: "log",
      icon: <FontAwesomeIcon icon={faMedal} className="text-primary" />,
      title: t.achievements.logAchievements.login30Days,
      description: t.achievements.logAchievements.login30DaysDesc,
      unlocked: false,
      comingSoon: true,
    },

    // ── Win achievements ────────────────────────────────────────────────────
    {
      id: "firstWin",
      category: "win",
      icon: <FontAwesomeIcon icon={faBolt} className="text-primary" />,
      title: t.achievements.winAchievements.firstWin,
      description: t.achievements.winAchievements.firstWinDesc,
      unlocked: wins >= 1,
    },
    {
      id: "win10Games",
      category: "win",
      icon: <FontAwesomeIcon icon={faFire} className="text-primary" />,
      title: t.achievements.winAchievements.win10Games,
      description: t.achievements.winAchievements.win10GamesDesc,
      unlocked: wins >= 10,
      progress: Math.min(wins, 10),
      goal: 10,
    },
    {
      id: "win100Games",
      category: "win",
      icon: <FontAwesomeIcon icon={faCrown} className="text-primary" />,
      title: t.achievements.winAchievements.win100Games,
      description: t.achievements.winAchievements.win100GamesDesc,
      unlocked: wins >= 100,
      progress: Math.min(wins, 100),
      goal: 100,
    },

    // ── Played games achievements ──────────────────────────────────────────────
    {
      id: "firstGame",
      category: "games",
      icon: <FontAwesomeIcon icon={faGamepad} className="text-primary" />,
      title: t.achievements.playGamesAchievements.firstgame,
      description: t.achievements.playGamesAchievements.firstgameDesc,
      unlocked: totalGames >= 1,
    },
    {
      id: "play5Games",
      category: "games",
      icon: <FontAwesomeIcon icon={faBullseye} className="text-primary" />,
      title: t.achievements.playGamesAchievements.play5Games,
      description: t.achievements.playGamesAchievements.play5GamesDesc,
      unlocked: totalGames >= 5,
      progress: Math.min(totalGames, 5),
      goal: 5,
    },
    {
      id: "play50Games",
      category: "games",
      icon: <FontAwesomeIcon icon={faTrophy} className="text-primary" />,
      title: t.achievements.playGamesAchievements.play50Games,
      description: t.achievements.playGamesAchievements.play50GamesDesc,
      unlocked: totalGames >= 50,
      progress: Math.min(totalGames, 50),
      goal: 50,
    },
    {
      id: "play500Games",
      category: "games",
      icon: <FontAwesomeIcon icon={faStar} className="text-primary" />,
      title: t.achievements.playGamesAchievements.play500Games,
      description: t.achievements.playGamesAchievements.play500GamesDesc,
      unlocked: totalGames >= 500,
      progress: Math.min(totalGames, 500),
      goal: 500,
    },
  ];
}

// ─── Single achievement card ──────────────────────────────────────────────────
function AchievementCard({ achievement }: { achievement: AchievementItem }) {
  const { icon, title, description, unlocked, comingSoon, progress, goal } =
    achievement;
  const hasProgress = progress !== undefined && goal !== undefined;
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "achievement-card",
        unlocked ? "achievement-unlocked" : "achievement-locked",
      )}
    >
      {/* Icon */}
      <div className="achievement-icon">{icon}</div>

      {/* Content */}
      <div className="achievement-content">
        <h4 className="text-sm md:text-base font-semibold font-display text-gray-900 mb-1">
          {title}
        </h4>
        <p className="text-xs md:text-sm text-muted mb-3">{description}</p>

        {/* Progress bar for achievements with progress */}
        {hasProgress && (
          <div className="achievement-progress">
            <ProgressBar
              value={progress}
              max={goal}
              color={unlocked ? "success" : "neutral"}
              size="sm"
              label={`${progress}/${goal}`}
              showLabel
              showPercentage
            />
          </div>
        )}

        {/* Coming soon badge */}
        {comingSoon && (
          <div className="mt-2">
            <Badge size="sm" variant="info">
              {t?.achievements?.commingSoon}
            </Badge>
          </div>
        )}

        {/* Lock indicator for locked achievements */}
        {!unlocked && !comingSoon && (
          <div className="absolute top-3 right-3 text-gray-400 text-sm">
            <FontAwesomeIcon icon={faLock} className="text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AchievementsSection({
  stats,
}: {
  stats?: AchievementStats;
}) {
  const { t } = useTranslation();
  const achievements = useMemo(() => computeAchievements(stats, t), [stats, t]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

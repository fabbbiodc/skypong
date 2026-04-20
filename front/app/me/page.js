"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/use-translation";
import { Navbar, Tabs, Footer } from "../ui/base";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import PlayerInfo from "../ui/player-public-profile/player-info-ui";
import AchievementsSection from "../ui/player-public-profile/AchievementsSection";
import FriendsSection from "../ui/player-public-profile/FriendsSection";
import GameHistory from "../ui/player-public-profile/GameHistory";
import Leaderboard from "../ui/Leaderboard";
import {
  PageContainerScrollable,
  ContentContainer,
  ProfileTabsContainer,
  ProfileTabContent,
} from "../ui/patterns";
import { mainContainers } from "../lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScroll,
  faUsers,
  faTrophy,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/api";

export default function ProfilePageMe() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const { user, authloading } = useAuth();
  const [activeTab, setActiveTab] = useState("history");

  const getCookie = (name) => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  };

  useEffect(() => {
    if (authloading) return;

    if (!user) {
      router.push("/");
      return;
    }
    setProfile(user);
  }, [user, authloading, router]);

  // Count achievements (locked vs unlocked)
  const games = (stats) => {
    return stats.wins + stats.losses;
  };
  const achievementCount = profile?.stats
    ? (() => {
        const stats = profile.stats;
        // console.info("Player stats:", profile.stats);
        let count = 1;
        const totalGames = games(stats);
        // console.info("Player Total Games: ", totalGames);
        if (totalGames >= 1) count++;
        if (totalGames >= 10) count++;
        if (totalGames >= 50) count++;
        if (totalGames >= 100) count++;
        if (stats.wins >= 1) count++;
        if (stats.wins >= 10) count++;
        if (stats.wins >= 50) count++;
        if (stats.total_games > 0 && stats.wins / stats.total_games >= 0.7)
          count++;
        // console.log("Total achievements: ". count);
        return count;
      })()
    : 0;

  // Count friends
  const [friendsCount, setFriendsCount] = useState(0);
  useEffect(() => {
    if (!profile?.id) return;
    const csrf = getCookie("csrf_token");
    api("/api/profile/friends", {
      headers: { "x-csrf-token": csrf || "" },
    })
      .then((data) => setFriendsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setFriendsCount(0));
  }, [profile?.id]);

  const tabs = [
    {
      key: "history",
      label: t.profile.tabs.history,
      icon: <FontAwesomeIcon icon={faScroll} className="text-slate-200" />,
      badge: profile?.stats?.total_games || undefined,
    },
    {
      key: "friends",
      label: t.profile.tabs.friends,
      icon: <FontAwesomeIcon icon={faUsers} className="text-slate-200" />,
      badge: friendsCount > 0 ? friendsCount : undefined,
    },
    {
      key: "achievements",
      label: t.profile.tabs.achievements,
      icon: <FontAwesomeIcon icon={faTrophy} className="text-slate-200" />,
      badge: achievementCount > 0 ? achievementCount : undefined,
    },
    {
      key: "leaderboard",
      label: t.profile.tabs.leaderboard,
      icon: <FontAwesomeIcon icon={faChartBar} className="text-slate-200" />,
    },
  ];

  return (
    <main className={mainContainers.scrollableLayout.wrapper}>
      <Navbar />
      <div className={mainContainers.scrollableLayout.contentArea}>
        <PageContainerScrollable>
          <ContentContainer size="xl">
            {/* Player Info - Always visible */}
            {profile && <PlayerInfo profile={profile} />}

            {/* Tabs */}
            {profile && (
              <ProfileTabsContainer>
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                {/* Tab Content */}
                <ProfileTabContent>
                  {activeTab === "history" && (
                    <GameHistory userId={profile.id} />
                  )}

                  {activeTab === "friends" && (
                    <FriendsSection
                      currentUserId={profile.id}
                      csrfToken={getCookie("csrf_token") || ""}
                      onNavigateProfile={(id) => router.push(`/${id}`)}
                    />
                  )}

                  {activeTab === "achievements" && (
                    <AchievementsSection stats={profile?.stats} />
                  )}

                  {activeTab === "leaderboard" && (
                    <Leaderboard userId={user?.id} />
                  )}
                </ProfileTabContent>
              </ProfileTabsContainer>
            )}
          </ContentContainer>
        </PageContainerScrollable>
      </div>
      <div className={mainContainers.scrollableLayout.footer}>
        <Footer />
      </div>
    </main>
  );
}

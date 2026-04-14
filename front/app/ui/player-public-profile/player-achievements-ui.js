import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/use-translation";
import Link from "next/link";
import { useStyles } from "../../hooks/use-styles";
import { useAuth } from "../../context/auth-context";
import AchievementUI from "./player-single-achievement-ui.js";

const mobileStyles = { nav: "flex justify-between p-2 text-3xl" };
const desktopStyles = { nav: "" };

export default function PlayerAchievementsUI({ home, userURL, stats }) {
  const { t } = useTranslation();
  const { styles } = useStyles(mobileStyles, desktopStyles);
  const { logout } = useAuth();

  return (
    <section className={styles.nav}>
      <AchievementUI
        icon={"/avatar/default-avatar.webp"}
        achievement={t.achievements.logAchievements.firstLogin}
        description={t?.achievements?.logAchievements?.firstLoginDesc}
      />
    </section>
  );
}

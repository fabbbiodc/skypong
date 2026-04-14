import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/use-translation";
import Link from "next/link";
import { useStyles } from "../../hooks/use-styles";

const mobileStyles = {
  icon: "aspect-square max-w-20",
};
const desktopStyles = { nav: "" };

export default function AchievementUI({ iconUrl, achievement, description }) {
  const { t } = useTranslation();
  const { styles } = useStyles(mobileStyles, desktopStyles);
  return (
    <article className={styles.achievementWrapper}>
      <img src={iconUrl} className={styles.icon} alt={description} />
      <p className={styles.description}>{achievement}</p>
    </article>
  );
}

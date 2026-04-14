"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../hooks/use-translation";
import { Button } from "../ui/base";

export default function PlayButtonUI({ onClick, isModalOpen }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() => onClick(false)}
      className={`flex items-center justify-center gap-4 self-center uppercase ${isModalOpen ? "appear" : ""}`}
    >
      <FontAwesomeIcon icon={faGamepad} />
      {t.game.playButton}
    </Button>
  );
}

"use client";
import { useTranslation } from "../context/language-context";
import { Button } from "./base/Button";

export default function NavigationLanguageUI() {
  const { changeLanguage } = useTranslation();

  return (
    <nav className="flex gap-4">
      <Button
        onClick={() => changeLanguage("es")}
        variant="ghost"
        size="sm"
        font="body"
      >
        ESP
      </Button>
      <Button
        onClick={() => changeLanguage("en")}
        variant="ghost"
        size="sm"
        font="body"
      >
        ENG
      </Button>
      <Button
        onClick={() => changeLanguage("it")}
        variant="ghost"
        size="sm"
        font="body"
      >
        ITA
      </Button>
    </nav>
  );
}

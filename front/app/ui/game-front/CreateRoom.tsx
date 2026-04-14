"use client";

import { useState } from "react";
import { useTranslation } from "../../hooks/use-translation";

type Props = {
  onCreate: (roomName: string) => void;
  onBack: () => void;
  error?: string | null;
  isBusy?: boolean;
};

export default function CreateRoom({
  onCreate,
  onBack,
  error = null,
  isBusy = false,
}: Props) {
  const { t } = useTranslation();
  const [roomName, setRoomName] = useState("");
  const createLabel = t?.gameMode?.remote?.title ?? "Create room";
  const backLabel = t?.navigation?.goBack ?? "Back";

  const canSubmit = roomName.trim().length > 0 && !isBusy;

  return (
    <section className="create-room">
      <h2>{createLabel}</h2>

      <input
        value={roomName}
        onChange={(event) => setRoomName(event.target.value)}
        placeholder={t?.game?.roomNameField || "Room Name"}
        disabled={isBusy}
      />

      {error ? <p>{error}</p> : null}

      <button
        type="button"
        onClick={() => onCreate(roomName.trim())}
        disabled={!canSubmit}
      >
        {createLabel}
      </button>

      <button type="button" onClick={onBack} disabled={isBusy}>
        {backLabel}
      </button>
    </section>
  );
}

"use client";

import { useTranslation } from "../../hooks/use-translation";

export type Room = {
  id: string;
  name: string;
  players?: number;
  status?: string;
};

type Props = {
  rooms: Room[];
  isLoading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onJoin: (roomId: string) => void;
  onBack: () => void;
};

export default function JoinRoom({
  rooms,
  isLoading,
  error = null,
  onRefresh,
  onJoin,
  onBack,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className="join-room">
      <h2>{t?.play?.roomListTitle || "Room list"}</h2>

      <button type="button" onClick={onRefresh} disabled={isLoading}>
        {isLoading
          ? (t?.signInPage?.loading ?? "Loading...")
          : t?.signInPage?.refresh || "Refresh"}
      </button>

      {error ? <p>{error}</p> : null}

      {!isLoading && rooms.length === 0 ? (
        <p>{t?.play?.noRoomAvailable || "No rooms available"}</p>
      ) : null}

      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <span>{room.name}</span>
            <button type="button" onClick={() => onJoin(room.id)}>
              {t?.play?.joinRoomBtn || "Join Room"}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onBack}>
        {t?.navigation?.goBack ?? "Back"}
      </button>
    </section>
  );
}

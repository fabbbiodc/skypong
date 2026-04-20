import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { playerDataSchema } from "../../lib/form-validation/player-data";
import { Button, TextField } from "../base";

interface PlayerProfile {
  nickname: string;
  winPhrase: string;
}

interface PlayerDataResponse {
  user?: Partial<PlayerProfile>;
}

interface UpdateProfileErrorResponse {
  error?: {
    message?: string;
  };
}

const getCsrfToken = (): string | undefined => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

export default function PlayerUI() {
  const router = useRouter();
  const { user, authloading } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlayerProfile>({
    resolver: zodResolver(playerDataSchema(t)),
    mode: "onBlur",
  });

  useEffect(() => {
    if (authloading) return;

    if (!user) {
      router.push("/");
      return;
    }

    const fetchMyProfile = async () => {
      setIsLoading(true);
      setServerError("");

      try {
        const response = await fetch(`/api/profile/${user.id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) setServerError(t.serverError.notFound);
          else setServerError(t.serverError.unknownError);
          return;
        }

        const data = (await response.json()) as PlayerDataResponse;
        const profile: PlayerProfile = {
          nickname: data.user?.nickname || "",
          winPhrase: data.user?.winPhrase || "",
        };

        setPlayer(profile);
        setValue("nickname", profile.nickname);
        setValue("winPhrase", profile.winPhrase);
      } catch (error) {
        console.error("Error en fetchMyProfile:", error);
        setServerError(t.serverError.connectionError);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMyProfile();
  }, [authloading, user, router, setValue, t.serverError.connectionError, t.serverError.notFound, t.serverError.unknownError]);

  const onSubmit = async (data: PlayerProfile) => {
    try {
      const csrfToken = getCsrfToken();

      setIsLoading(true);
      setServerError("");

      const response = await fetch("/api/profile/updateme", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData =
          (await response.json().catch(() => ({}))) as UpdateProfileErrorResponse;
        setServerError(errorData.error?.message || "Error al actualizar");
        return;
      }

      const result = (await response.json()) as PlayerDataResponse;
      setPlayer({
        nickname: result.user?.nickname || data.nickname,
        winPhrase: result.user?.winPhrase || data.winPhrase,
      });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setServerError(t.serverError.connectionError);
    } finally {
      setIsLoading(false);
    }
  };

  if (authloading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <p className="text-muted">{t.common.loading}</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center py-4 gap-4">
        <p className="error-message">
          {serverError || t.serverError.unknownError || "Unable to load profile"}
        </p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          {t.common.backHome}
        </Button>
      </div>
    );
  }

  return (
    <form
      id="playerDataForm"
      onSubmit={handleSubmit(onSubmit)}
      className="form-wrapper"
    >
      <h2 className="form-title">{t.user.userData}</h2>

      <TextField
        name="nickname"
        type="text"
        label={t.form.labels.nickname}
        placeholder={t.form.placeholders.nickname}
        autoComplete="nickname"
        register={register}
        error={errors.nickname?.message}
        disabled={isSubmitting}
      />

      <TextField
        name="winPhrase"
        type="text"
        label={t.form.labels.winPhrase}
        placeholder={t.form.placeholders.winPhrase}
        autoComplete="winPhrase"
        register={register}
        error={errors.winPhrase?.message}
        disabled={isSubmitting}
      />

      <div className="error-message-space">
        {serverError && <p className="error-message">{serverError}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? t.form.submitting : t.common.save}
      </Button>
    </form>
  );
}

import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { playerDataSchema } from "../../lib/form-validation/player-data";
import { TextField, Button } from "../base";
import Toast from "../messaging/toast";

export default function PlayerUI({ userURL }) {
  const router = useRouter();
  const { user, authloading, checkAuth } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [player, setPlayer] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(playerDataSchema(t)),
    mode: "onBlur",
  });

  useEffect(() => {
    // 1. Si el AuthContext aún está verificando la cookie, esperamos.
    if (authloading) return;

    // 2. Si ya terminó de cargar y NO hay usuario, mandamos a home.
    if (!user) {
      router.push("/");
      return;
    }

    const fetchMyProfile = async () => {
      // Iniciamos carga local para el perfil
      setIsLoading(true);
      setServerError("");
      if (player) return;
      try {
        const response = await fetch(`/api/profile/${user?.id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) setServerError(t.serverError.notFound);
          else setServerError(t.serverError.unknownError);
          return;
        }

        const data = await response.json();

        // Seteamos el player con los datos de la API
        setPlayer(data.user);
        if (data.user) {
          setValue("nickname", data.user.nickname || "");
          setValue("winPhrase", data.user.winPhrase || "");
        }
      } catch (error) {
        console.error("Error en fetchMyProfile:", error);
        setServerError(t.serverError.conectionError);
      } finally {
        // Solo dejamos de cargar cuando la petición termina (éxito o error)
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, [authloading, user, router]);

  const onSubmit = async (data) => {
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];
      setIsLoading(true);
      setServerError("");
      const response = await fetch(`/api/profile/updateme`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "", // <-- para el middleware de CSRF
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.error?.message || "Error al actualizar");
        return;
      }

      const result = await response.json();

      // Actualiza el player local
      setPlayer(result.user);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setServerError(t.serverError.conectionError);
    } finally {
      setIsLoading(false);
    }
  };

  // Muestra loading
  if (authloading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <p className="text-muted">{t.common?.loading || "Loading..."}</p>
      </div>
    );
  }

  // Muestra error si no hay player
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center py-4 gap-4">
        <p className="error-message">
          {serverError ||
            t.serverError?.unknownError ||
            "Unable to load profile"}
        </p>
        <Button variant="secondary" onClick={() => router.push("/")}>
          {t.common?.backHome || "Back to Home"}
        </Button>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <img src={`/api/profile/avatars/${user?.id}.webp`} />
      ) : (
        <form
          id="playerDataForm"
          onSubmit={handleSubmit(onSubmit)}
          className="form-wrapper"
        >
          <h2 className="form-title">{t.user.userData}</h2>
          {/* Nickname Field */}
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
          {/* Winphrase Field */}
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
          {/* Error del servidor */}
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
      )}
    </>
  );
}

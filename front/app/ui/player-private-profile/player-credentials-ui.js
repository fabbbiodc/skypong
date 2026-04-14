import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { playerPasswordSchema } from "../../lib/form-validation/player-data";
import { TextField, Button } from "../base";

const getCookie = (name) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

export default function PlayerCredentialsUI({ userURL }) {
  const router = useRouter();
  const { user, authloading, logout } = useAuth();
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
    resolver: zodResolver(playerPasswordSchema(t)),
    mode: "onBlur",
  });

  // ✅ Handler para actualizar datos
  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setServerError("");

      const csrfToken = getCookie("csrf_token");

      if (!csrfToken) {
        setServerError("CSRF token missing");
        return;
      }

      const response = await fetch(`/api/auth/password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password,
        }),
      });

      if (response.status === 204) {
        alert(t?.form?.passwordUpdateLoginAgain);
        logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.error?.message || "Error al actualizar");
        return;
      }
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
      <h2 className="form-title">
        {t.user?.changePassword || "Change Password"}
      </h2>
      {/* Current Password */}
      <TextField
        name="old_password"
        type="password"
        label={t.form.labels.currentPassword}
        placeholder={t.form.placeholders.currentPassword}
        autoComplete="current-password"
        register={register}
        error={errors.old_password?.message}
      />

      {/* New Password */}
      <TextField
        name="new_password"
        type="password"
        label={t.form.labels.newPassword}
        placeholder={t.form.placeholders.newPassword}
        autoComplete="new-password"
        register={register}
        error={errors.new_password?.message}
      />

      {/* Confirm New Password */}
      <TextField
        name="confirm_password"
        type="password"
        label={t.form.labels.confirmPassword}
        placeholder={t.form.placeholders.confirmPassword}
        autoComplete="new-password"
        register={register}
        error={errors.confirm_password?.message}
      />

      <div className="error-message-space">
        {serverError && <p className="error-message">{serverError}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading || isSubmitting}
        className="w-full"
      >
        {isLoading ? t.form.submitting : t.common.save}
      </Button>
    </form>
  );
}

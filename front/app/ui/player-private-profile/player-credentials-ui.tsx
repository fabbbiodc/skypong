import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { playerPasswordSchema } from "../../lib/form-validation/player-data";
import { Button, TextField } from "../base";

interface PasswordFormData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordErrorResponse {
  error?: {
    message?: string;
  };
}

const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
};

export default function PlayerCredentialsUI() {
  const router = useRouter();
  const { authloading, logout } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(playerPasswordSchema(t)),
    mode: "onBlur",
  });

  const onSubmit = async (formData: PasswordFormData) => {
    try {
      setIsLoading(true);
      setServerError("");

      const csrfToken = getCookie("csrf_token");

      if (!csrfToken) {
        setServerError("CSRF token missing");
        return;
      }

      const response = await fetch("/api/auth/password", {
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
        alert(t.form.passwordUpdateLoginAgain);
        await logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData =
          (await response.json().catch(() => ({}))) as PasswordErrorResponse;
        setServerError(errorData.error?.message || "Error updating password");
        return;
      }
    } catch (error) {
      console.error("Error updating password:", error);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
      <h2 className="form-title">{t.user.changePassword}</h2>

      <TextField
        name="old_password"
        type="password"
        label={t.form.labels.currentPassword}
        placeholder={t.form.placeholders.currentPassword}
        autoComplete="current-password"
        register={register}
        error={errors.old_password?.message}
      />

      <TextField
        name="new_password"
        type="password"
        label={t.form.labels.newPassword}
        placeholder={t.form.placeholders.newPassword}
        autoComplete="new-password"
        register={register}
        error={errors.new_password?.message}
      />

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

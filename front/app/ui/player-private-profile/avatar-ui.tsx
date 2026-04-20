"use client";

import { useRef, useState } from "react";
import { useAuth } from "../../context/auth-context";
import { useTranslation } from "../../hooks/use-translation";
import { Button } from "../base";
import { LoadingState } from "../patterns";

const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
};

export default function AvatarUpload() {
  const { user, authloading } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultAvatar = user?.avatarUrl || "/avatar/default-avatar.webp";
  const displayImage = preview || defaultAvatar;

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setServerError("");

    const formData = new FormData();
    formData.append("uploads/avatars/", file);

    try {
      const rawCookie = getCookie("csrf_token");
      const csrfToken = rawCookie ? decodeURIComponent(rawCookie) : "";

      if (!csrfToken) {
        setServerError("CSRF token missing");
        return;
      }

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken,
        },
      });

      if (!response.ok) {
        if (response.status === 413) setServerError(t.avatar.error.tooLarge);
        else if (response.status === 415)
          setServerError(t.avatar.error.invalidImageFormat);
        else if (response.status === 400)
          setServerError(t.avatar.error.invalidImageFile);
        else setServerError(t.avatar.error.unknownError);
        return;
      }
    } catch (error) {
      console.error("Error avatar:", error);
      setServerError(t.avatar.error.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    void uploadFile(file);
  };

  const handleButtonClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  if (authloading) {
    return <LoadingState variant="spinner" size="md" text={t.common.loading} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-32 h-32 overflow-hidden rounded-full border-2 border-slate-700">
        <img src={displayImage} alt="Avatar" className="w-full h-full object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
            {t.common.uploading}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="md"
        disabled={uploading}
        type="button"
        onClick={handleButtonClick}
      >
        {uploading ? t.common.loading : t.avatar.changeImage}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="error-message-space">
        {serverError && <p className="error-message">{serverError}</p>}
      </div>
    </div>
  );
}

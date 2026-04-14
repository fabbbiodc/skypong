"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavigationAppUI from "../ui/navigation-app-ui";
import { useTranslation } from "../hooks/use-translation";
import { useAuth } from "../context/auth-context";
import Link from "next/link";
import AvatarUpload from "../ui/player-private-profile/avatar-ui";
import PlayerUI from "../ui/player-private-profile/player-ui";
import PlayerCredentialsUI from "../ui/player-private-profile/player-credentials-ui";
import PlayerDeleteUI from "../ui/player-private-profile/player-delete-account-ui";
import FooterTermsPolicy from "../ui/footer-terms-policy";

const getCsrfToken = () =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];

export default function ProfilePagePrivate() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user, authloading } = useAuth();
  const [player, setPlayer] = useState(null);
  const [serverError, setServerError] = useState("");

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
        let csrfToken = getCsrfToken();

        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "x-csrf-token": csrfToken || "" },
        });

        if (refreshRes.ok) {
          csrfToken = getCsrfToken();
        }

        const profileRes = await fetch("/api/profile/me", {
          method: "GET",
          credentials: "include",
          headers: { "x-csrf-token": csrfToken || "" },
        });

        if (!profileRes.ok) {
          if (profileRes.status === 404) setServerError(t.serverError.notFound);
          else setServerError(t.serverError.unknownError);
          return;
        }

        const data = await profileRes.json();
        setPlayer(data);
      } catch (err) {
        console.error("Error en fetchMyProfile:", err);
        setServerError(t.serverError.connectionError);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) fetchMyProfile();
    else setIsLoading(false);
  }, [authloading, user, router, t]);

  if (isLoading)
    return (
      <main className="h-dvh bg-page-bg flex flex-col items-center justify-center">
        <p className="text-muted">{t?.common?.loading || "Loading..."}</p>
      </main>
    );

  return (
    <>
      {serverError ? (
        <main className="h-dvh bg-page-bg flex flex-col items-center justify-center">
          <p className="error-message">{serverError}</p>
        </main>
      ) : (
        <main className="min-h-dvh bg-page-bg flex flex-col">
          <NavigationAppUI />
          <div className="flex flex-1 items-start justify-center page-wrapper-with-nav">
            <div className="page-content-container-scrollable">
              <div className="content-container-md">
                <h1>{t?.profilePage?.title}</h1>
                <AvatarUpload />
                <PlayerUI />
                <PlayerCredentialsUI />
                <div className="flex-row justify-center">
                  <Link href="/me" className="link-primary">
                    {t?.profilePage?.viewProfile || "View My Profile"}
                  </Link>
                </div>
                <PlayerDeleteUI />
              </div>
            </div>
          </div>
          <div className="pb-4">
            <FooterTermsPolicy />
          </div>
        </main>
      )}
    </>
  );
}

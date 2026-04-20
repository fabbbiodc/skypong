"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/form-validation/auth";
import { useTranslation } from "../hooks/use-translation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { TextField, Button, Footer } from "../ui/base";
import {
  LoadingState,
  PageContainer,
  ContentContainer,
  FormCard,
} from "../ui/patterns";

export default function SignInPage() {
  const router = useRouter();
  const { user, checkAuth, hasCredentials } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema(t)),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError("");

      // Call API here
      const apiURL = "/api/auth/login";
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text());
        setServerError(t.serverError.apiRouteError(apiURL));
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setServerError(t.form.errors.userNotRegistered);
        } else if (response.status === 401) {
          console.warn("401 Unauthorized: ", t.form.errors.invalidCredentials);
          setServerError(t.form.errors.invalidCredentials);
        } else if (response.status === 403) {
          setServerError(t.form.errors.accountBlocked);
        } else {
          setServerError(result.message || t.form.errors.serverError);
        }
        return;
      }

      // console.log("Login exitoso:", result);
      const hasCredentials = await checkAuth();
      // console.log("Has Credentials: ", hasCredentials);
      if (hasCredentials) router.push("/");
      else setServerError("Error validating credentials");
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingState
          variant="spinner"
          size="md"
          text={t.common.loading}
        />
      ) : (
        <main className="h-dvh bg-page-bg flex flex-col">
          <div className="absolute top-6 left-6 z-10">
            <Link href="/" className="skypong-logo">
              SKYPONG
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <PageContainer>
              <ContentContainer size="sm">
                <FormCard className="form-wrapper">
                  <div className="text-center">
                    <span className="text-sm md:text-lg mb-2 block">
                      {t.signInPage.title}
                    </span>
                    <h1 className="text-lg md:text-xl mb-6">
                      {t.homePage.title}
                    </h1>
                  </div>

                  <form
                    className="flex flex-col gap-4 w-full"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    {/* Email Field */}
                    <div className="w-full">
                      <TextField
                        name="email"
                        type="email"
                        label={t.form.labels.email}
                        placeholder={t.form.placeholders.email}
                        autoComplete="email"
                        register={register}
                        error={errors.email?.message}
                      />
                    </div>

                    {/* Password Field */}
                    <div className="w-full">
                      <TextField
                        name="password"
                        type="password"
                        label={t.form.labels.password}
                        placeholder={t.form.placeholders.password}
                        autoComplete="current-password"
                        register={register}
                        error={errors.password?.message}
                      />
                    </div>

                    {/* Server Error - Reserved space to prevent layout shift */}
                    <div className="error-message-space">
                      {serverError && (
                        <p className="error-message">{serverError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting
                        ? t.signInPage.loading
                        : t.signInPage.submitButton}
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <Link
                      href="/signup"
                      className="text-primary hover:text-primary-hover transition-colors duration-200"
                    >
                      {t.signUpPage.createAccount}
                    </Link>
                  </div>
                </FormCard>
              </ContentContainer>
            </PageContainer>
          </div>

          <div className="mt-auto pb-4">
            <Footer />
          </div>
        </main>
      )}
    </>
  );
}

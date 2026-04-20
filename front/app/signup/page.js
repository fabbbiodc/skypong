"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../lib/form-validation/auth";
import { useTranslation } from "../hooks/use-translation";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import Link from "next/link";
import { TextField, Button, Footer, Navbar } from "../ui/base";
import {
  LoadingState,
  PageContainer,
  ContentContainer,
  FormCard,
} from "../ui/patterns";
import { authPages, mainContainers } from "../lib/design-tokens";

export default function SignUpPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const { t } = useTranslation();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema(t)),
    mode: "onBlur", // Valida cuando el usuario sale del campo
  });

  const onSubmit = async (data) => {
    try {
      // console.log("Datos validados:", data);
      setIsLoading(true);
      setServerError(""); // Limpia errores anteriores

      // Llamada a la API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...data, avatarURL: "default-avatar.webp" }),
      });
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text());
        setServerError(t.serverError.apiRouteError("/api/auth/signup"));
        return;
      }
      if (!response.ok) {
        if (response.status === 400) {
          const result = await response.json();
          setServerError(result.message || t.form.errors.invalidPassword);
        }
        if (response.status === 409) {
          // console.log("Error 409: ", t.form.errors.userAlreadyExists);
          setServerError(t.form.errors.userAlreadyExists);
        } else {
          setServerError(t.form.errors.serverError);
        }
        return;
      }

      const result = await response.json();
      const hasCredentials = await checkAuth();
      if (hasCredentials) router.push("/updateme");
      else setServerError("Error validating credentials");
    } catch (error) {
      console.error("Error:", error);
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
        <main className={mainContainers.topLayout.wrapper}>
          <Navbar />

          <div className={mainContainers.topLayout.contentArea}>
            <PageContainer>
              <ContentContainer size="sm">
                <FormCard className="form-wrapper">
                  <div className="text-center">
                    <span className={authPages.formTitle.subtitle}>
                      {t.signUpPage.title}
                    </span>
                    <h1 className={authPages.formTitle.title}>
                      {t.homePage.title}
                    </h1>
                  </div>

                  {/* Use handleSubmit */}
                  <form
                    className={authPages.form.layout}
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    {/* Email Field */}
                    <div className={authPages.formField}>
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
                    <div className={authPages.formField}>
                      <TextField
                        name="password"
                        type="password"
                        label={t.form.labels.newPassword}
                        placeholder={t.form.placeholders.newPassword}
                        autoComplete="new-password"
                        register={register}
                        error={errors.password?.message}
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div className={authPages.formField}>
                      <TextField
                        name="confirmPassword"
                        type="password"
                        label={t.form.labels.confirmPassword}
                        placeholder={t.form.placeholders.confirmPassword}
                        autoComplete="new-password"
                        register={register}
                        error={errors.confirmPassword?.message}
                      />
                    </div>

                    {/* Server Error - Reserved space to prevent layout shift */}
                    <div className={authPages.errorSpace}>
                      {serverError && (
                        <p className={authPages.errorMessage}>
                          {/* { console.log("Error:", serverError)}*/}
                          {serverError}
                        </p>
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
                        ? t.signUpPage.submitting
                        : t.signUpPage.submitButton}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <Link
                      href="/login"
                      className={authPages.link}
                    >
                      {t.signUpPage.hasAccount}
                    </Link>
                  </div>
                </FormCard>
              </ContentContainer>
            </PageContainer>
          </div>

          <div className={mainContainers.topLayout.footer}>
            <Footer />
          </div>
        </main>
      )}
    </>
  );
}

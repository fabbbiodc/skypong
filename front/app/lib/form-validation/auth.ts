// /app/lib/form-validation/auth.ts
import { z } from "zod";
import type { TranslationDictionary } from "@/lib/types/translation";

export const loginSchema = (t: TranslationDictionary) => {
  // Define errores con valores por defecto
  const errors = {
    emailRequired: t?.form?.errors?.emailRequired || "Email is required",
    emailInvalid: t?.form?.errors?.emailInvalid || "Invalid email format",
    emailMinLength:
      t?.form?.errors?.emailMinLength || "Email must be at least 8 characters",
    passwordMinLength:
      t?.form?.errors?.passwordMinLength ||
      "Password must be at least 8 characters",
    passwordLetter: t?.form?.errors?.containsLetter || "Must contain a letter",
    passwordNumber: t?.form?.errors?.containsNumber || "Must contain a number",
    passwordSpecial:
      t?.form?.errors?.containsSpecialCharacter ||
      "Must contain a special character",
  };

  return z.object({
    email: z
      .string()
      .min(1, { message: errors.emailRequired })
      .min(8, { message: errors.emailMinLength })
      .email({ message: errors.emailInvalid }),

    password: z
      .string()
      .min(8, { message: errors.passwordMinLength })
      .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
      .regex(/[0-9]/, { message: errors.passwordNumber })
      .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),
  });
};

export const signUpSchema = (t: TranslationDictionary) => {
  const errors = {
    emailRequired: t?.form?.errors?.emailRequired || "Email is required",
    emailMinLength:
      t?.form?.errors?.emailMinLength || "Email must be at least 8 characters",
    emailInvalid: t?.form?.errors?.invalidEmail || "Invalid email",
    passwordTooShort:
      t?.form?.errors?.passwordTooShort || "Password is too short",
    passwordLetter: t?.form?.errors?.containsLetter || "Must contain a letter",
    passwordNumber: t?.form?.errors?.containsNumber || "Must contain a number",
    passwordSpecial:
      t?.form?.errors?.containsSpecialCharacter ||
      "Must contain a special character",
    confirmPasswordTooShort:
      t?.form?.errors?.confirmPasswordTooShort ||
      "Confirm password is too short",
    passwordsDoNotMatch:
      t?.form?.errors?.passwordsDoNotMatch || "Passwords do not match",
  };

  return z
    .object({
      email: z
        .string()
        .min(1, { message: errors.emailRequired })
        .min(8, { message: errors.emailMinLength })
        .email({ message: errors.emailInvalid }),

      password: z
        .string()
        .min(8, { message: errors.passwordTooShort })
        .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
        .regex(/[0-9]/, { message: errors.passwordNumber })
        .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),

      confirmPassword: z
        .string()
        .min(8, { message: errors.confirmPasswordTooShort })
        .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
        .regex(/[0-9]/, { message: errors.passwordNumber })
        .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: errors.passwordsDoNotMatch,
      path: ["confirmPassword"],
    });
};

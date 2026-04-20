// /app/lib/form-validation/auth.ts
import { z } from "zod";
import type { TranslationDictionary } from "@/lib/types/translation";

export const playerDataSchema = (t: TranslationDictionary) => {
  // Define errores con valores por defecto
  const errors = {
    nicknameRequired:
      t?.user?.errors?.nicknameRequired || "Nickname is required",
    nicknameMinLength:
      t?.user?.errors?.nicknameMinLength(4) ||
      "Nickname must be at least 8 characters",
    whinphraseRequired:
      t?.user?.errors?.winphraseRequired || "Winphrase is required",
    winphraseMinLength:
      t?.user?.errors?.winphraseMinLength(4) ||
      "Winphrase must be at least 8 characters",
  };

  return z.object({
    nickname: z
      .string()
      .min(1, { message: errors.nicknameRequired })
      .min(4, { message: errors.nicknameMinLength }),
    winPhrase: z.string().min(1, { message: errors.whinphraseRequired }),
  });
};

export const playerPasswordSchema = (t: TranslationDictionary) => {
  const errors = {
    passwordRequired:
      t?.form?.errors?.passwordTooShort || "Password is too short",
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
      old_password: z
        .string()
        .min(1, { message: errors.passwordRequired })
        .min(8, { message: errors.passwordTooShort })
        .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
        .regex(/[0-9]/, { message: errors.passwordNumber })
        .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),
      new_password: z
        .string()
        .min(1, { message: errors.passwordRequired })
        .min(8, { message: errors.passwordTooShort })
        .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
        .regex(/[0-9]/, { message: errors.passwordNumber })
        .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),

      confirm_password: z
        .string()
        .min(1, { message: errors.passwordRequired })
        .min(8, { message: errors.confirmPasswordTooShort })
        .regex(/[a-zA-Z]/, { message: errors.passwordLetter })
        .regex(/[0-9]/, { message: errors.passwordNumber })
        .regex(/[^a-zA-Z0-9]/, { message: errors.passwordSpecial }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: errors.passwordsDoNotMatch,
      path: ["confirm_password"],
    });
};

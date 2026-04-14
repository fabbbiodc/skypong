import { z } from "zod";

// --- CHECKING USERS INPUTS: EMAIL AND PASSWORD ---
export const emailSchema = z.string()
  .min(1, { message: "Email is required" })
  .min(8, { message: "Email must be at least 8 characters" })
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: "Invalid email format",
  });

export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-zA-Z]/, { message: "Must contain a letter" })
  .regex(/[0-9]/, { message: "Must contain a number" })
  .regex(/[^a-zA-Z0-9]/, { message: "Must contain a special character" });

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, { message: "Old password is required" }),
  new_password: passwordSchema,
}).refine((data) => data.old_password !== data.new_password, {
  message: "New password must be different from old password",
  path: ["new_password"],
});

import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required").trim(),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required").trim(), // TODO: Add regex validation
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(1, "Password is required").trim(), // TODO: Add regex validation
});

export const MagicLinkSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

export const Verify2faSchema = z.object({
  verify2fa: z
    .string()
    .min(1, "Two-factor is required")
    .max(6, "Maximum number exited")
    .trim(),
});

export const Recover2faSchema = z.object({
  backupCode: z.string().min(1, "Two-factor is required").trim(),
});

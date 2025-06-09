import * as z from "zod";

export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 20,
  HAS_CAPITAL: /[A-Z]/,
  HAS_NUMBER: /\d/,
  NO_SPACES: /^\S*$/,
};

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required").trim(),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(
        PASSWORD_RULES.MIN_LENGTH,
        `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`,
      )
      .max(
        PASSWORD_RULES.MAX_LENGTH,
        `Password cannot exceed ${PASSWORD_RULES.MAX_LENGTH} characters`,
      )
      .regex(
        PASSWORD_RULES.HAS_CAPITAL,
        "Password must include at least one capital letter",
      )
      .regex(
        PASSWORD_RULES.HAS_NUMBER,
        "Password must include at least one number",
      )
      .regex(PASSWORD_RULES.NO_SPACES, "Password cannot contain spaces")
      .trim(),
    confirmPassword: z.string().min(1, "Confirm password is required").trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
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
  password: z
    .string()
    .min(
      PASSWORD_RULES.MIN_LENGTH,
      `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`,
    )
    .max(
      PASSWORD_RULES.MAX_LENGTH,
      `Password cannot exceed ${PASSWORD_RULES.MAX_LENGTH} characters`,
    )
    .regex(
      PASSWORD_RULES.HAS_CAPITAL,
      "Password must include at least one capital letter",
    )
    .regex(
      PASSWORD_RULES.HAS_NUMBER,
      "Password must include at least one number",
    )
    .regex(PASSWORD_RULES.NO_SPACES, "Password cannot contain spaces")
    .trim(),
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

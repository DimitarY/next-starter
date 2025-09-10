import * as z from "zod";
import { PASSWORD_RULES } from "@/schemas/auth";

export const GeneralSettings_ProfileName = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

export const GeneralSettings_ProfileEmail = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

export const SecuritySettings_Password = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").trim(),
    newPassword: z
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
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" })
      .trim(),
    revokeOtherSessions: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }
  });

export const SecuritySettings_SetPassword = z
  .object({
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
    path: ["confirmPassword"], // Specify which field the error message should be associated with
  });

export const SecuritySettings_EmailVerification = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

export const SecuritySettings_CreatePasskey = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

export const SecuritySettings_EditPasskey = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").trim(),
});

export const SecuritySettings_TwoFactorGenerate = z.object({
  password: z.string().min(1, "Password is required").trim(),
});

export const SecuritySettings_TwoFactorVerify = z.object({
  code: z.string().min(6, "Code is required").trim(),
});

export const SecuritySettings_TwoFactorDelete = z.object({
  password: z.string().min(1, "Password is required").trim(),
});

export const DeleteProfile = z.object({
  accept: z.boolean().default(false).optional(),
});

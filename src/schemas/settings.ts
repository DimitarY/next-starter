import * as z from "zod";

export const GeneralSettings_Profile = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
});

export const SecuritySettings_Password = z.object({
  currentPassword: z.string().min(1, "Current password is required").trim(),
  newPassword: z.string().min(1, "New password is required").trim(), // TODO: Add regex validation
});

export const SecuritySettings_SetPassword = z.object({
  password: z.string().min(1, "Password is required").trim(),
  confirmPassword: z.string().min(1, "Confirm password is required").trim(), // TODO: Add regex validation
});

export const DeleteProfile = z.object({
  accept: z.boolean().default(false).optional(),
});

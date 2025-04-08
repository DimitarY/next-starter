import * as z from "zod";

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
    newPassword: z.string().min(1, "New password is required").trim(), // TODO: Add regex validation
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" })
      .trim(),
    revokeOtherSessions: z.boolean().optional().default(false),
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
    password: z.string().min(1, "Password is required").trim(),
    confirmPassword: z.string().min(1, "Confirm password is required").trim(), // TODO: Add regex validation
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
  name: z.string().min(1, "Name is required").trim(),
});

export const DeleteProfile = z.object({
  accept: z.boolean().default(false).optional(),
});

import { z } from "zod";

import { accountTypes, locales } from "@/types/domain";
import { optionalUrlSchema } from "@/lib/validators/shared";

export const signupSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  locale: z.enum(locales).default("en"),
  interests: z.array(z.uuid()).max(10).default([]),
  avatarUrl: optionalUrlSchema,
  requestedAccountType: z.enum(accountTypes).default("user"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(8),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

import { z } from "zod";

import { accountTypes, locales } from "@/types/domain";
import {
  optionalEmailSchema,
  optionalUrlSchema,
  slugSchema,
} from "@/lib/validators/shared";

export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  slug: slugSchema,
  email: optionalEmailSchema,
  avatarUrl: optionalUrlSchema,
  bio: z.string().trim().max(300).optional(),
  city: z.string().trim().min(2).max(80).default("Reykjavik"),
  languages: z.array(z.string().trim().min(2).max(32)).max(6).default([]),
  interests: z.array(z.uuid()).max(10).default([]),
  locale: z.enum(locales).default("en"),
  ageRange: z.string().trim().max(40).optional(),
  accountType: z.enum(accountTypes).default("user"),
  isPremium: z.boolean().default(false),
  premiumTier: z.string().trim().max(40).optional(),
});

export const onboardingSchema = z.object({
  locale: z.enum(locales),
  interests: z.array(z.uuid()).min(3).max(10),
  avatarUrl: optionalUrlSchema,
});

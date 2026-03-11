import { z } from "zod";

import {
  groupStatuses,
  groupVisibilities,
  joinModes,
} from "@/types/domain";
import { richTextSchema, slugSchema } from "@/lib/validators/shared";

export const groupSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: slugSchema,
  description: richTextSchema.max(2400),
  categoryId: z.uuid(),
  tags: z.array(z.string().trim().min(2).max(24)).max(8).default([]),
  bannerUrl: z.string().url().optional(),
  city: z.string().trim().min(2).max(80).default("Reykjavik"),
  visibility: z.enum(groupVisibilities).default("public"),
  joinMode: z.enum(joinModes).default("open"),
  organizerId: z.uuid(),
  status: z.enum(groupStatuses).default("pending"),
  isFeatured: z.boolean().default(false),
});

export const groupMembershipSchema = z.object({
  groupId: z.uuid(),
  userId: z.uuid(),
  role: z.enum(["organizer", "co_organizer", "member"]).default("member"),
  status: z.enum(["active", "pending", "banned", "left"]).default("active"),
});

import { z } from "zod";

import {
  eventStatuses,
  eventTypes,
  rsvpModes,
  rsvpStatuses,
} from "@/types/domain";
import {
  dateSchema,
  isoDateTimeSchema,
  optionalUrlSchema,
  richTextSchema,
  slugSchema,
} from "@/lib/validators/shared";

const eventVisibilityModes = ["public", "approval", "members_only", "invite_only"] as const;

export const eventInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  description: richTextSchema,
  groupId: z.uuid().optional(),
  hostId: z.uuid(),
  venueId: z.uuid().optional(),
  categoryId: z.uuid(),
  eventType: z.enum(eventTypes).default("in_person"),
  status: z.enum(eventStatuses).default("draft"),
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema.optional(),
  venueName: z.string().trim().max(160).optional(),
  venueAddress: z.string().trim().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  onlineLink: optionalUrlSchema,
  featuredPhotoUrl: optionalUrlSchema,
  galleryPhotos: z.array(z.string().url()).max(12).default([]),
  attendeeLimit: z.number().int().positive().optional(),
  guestLimit: z.number().int().min(0).default(0),
  ageRestriction: z.string().trim().max(40).default("none"),
  ageMin: z.number().int().min(13).max(99).optional(),
  ageMax: z.number().int().min(13).max(99).optional(),
  isFree: z.boolean().default(true),
  visibilityMode: z.enum(eventVisibilityModes).default("public"),
  isFeatured: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  rsvpMode: z.enum(rsvpModes).default("open"),
  reminderPolicy: z.string().trim().max(120).default("24h and 2h before start"),
  guestQuestion: z.string().trim().max(255).optional(),
  hostContact: z.string().trim().max(120).optional(),
  coHostNames: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  recurrenceRule: z.string().trim().max(255).optional(),
  recurrenceEnd: dateSchema.optional(),
});

export const eventSchema = eventInputSchema
  .refine(
    (value) => !value.endsAt || value.endsAt > value.startsAt,
    {
      message: "Event end must be after the start.",
      path: ["endsAt"],
    },
  )
  .refine(
    (value) =>
      value.ageMin === undefined ||
      value.ageMax === undefined ||
      value.ageMax >= value.ageMin,
    {
      message: "Maximum age must be greater than or equal to minimum age.",
      path: ["ageMax"],
    },
  );

export const rsvpSchema = z.object({
  eventId: z.uuid(),
  userId: z.uuid(),
  ticketTierId: z.uuid().optional(),
  status: z.enum(rsvpStatuses).default("going"),
  guestCount: z.number().int().min(0).max(6).default(0),
});

export const eventCommentSchema = z.object({
  eventId: z.uuid(),
  userId: z.uuid(),
  text: z.string().trim().min(1).max(1200),
  parentId: z.uuid().optional(),
});

export const eventRatingSchema = z.object({
  eventId: z.uuid(),
  userId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(1200).optional(),
});

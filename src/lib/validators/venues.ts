import { z } from "zod";

import {
  bookingStatuses,
  costTypes,
  dealTiers,
  dealTypes,
  partnershipTiers,
  reviewerTypes,
  venueStatuses,
  venueTypes,
} from "@/types/domain";
import {
  dateSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
  optionalUrlSchema,
  richTextSchema,
  slugSchema,
  timeSchema,
} from "@/lib/validators/shared";

export const venueSchema = z.object({
  ownerId: z.uuid(),
  name: z.string().trim().min(2).max(140),
  slug: slugSchema,
  legalName: z.string().trim().max(160).optional(),
  kennitala: z.string().trim().max(32).optional(),
  type: z.enum(venueTypes),
  description: richTextSchema.max(3000),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80).default("Reykjavik"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  capacitySeated: z.number().int().min(0).optional(),
  capacityStanding: z.number().int().min(0).optional(),
  capacityTotal: z.number().int().min(0).optional(),
  amenities: z.array(z.string().trim().min(2).max(40)).max(24).default([]),
  photos: z.array(z.string().url()).max(20).default([]),
  heroPhotoUrl: optionalUrlSchema,
  website: optionalUrlSchema,
  phone: optionalPhoneSchema,
  email: optionalEmailSchema,
  socialLinks: z.record(z.string(), z.string().url()).default({}),
  openingHours: z.record(z.string(), z.string()).default({}),
  happyHour: z.record(z.string(), z.string()).default({}),
  partnershipTier: z.enum(partnershipTiers).default("free"),
  status: z.enum(venueStatuses).default("pending"),
});

export const venueAvailabilitySchema = z
  .object({
    venueId: z.uuid(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    specificDate: dateSchema.optional(),
    startTime: timeSchema,
    endTime: timeSchema,
    capacityOverride: z.number().int().min(0).optional(),
    costType: z.enum(costTypes).optional(),
    costAmount: z.number().min(0).optional(),
    notes: z.string().trim().max(500).optional(),
    isRecurring: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
  })
  .refine(
    (value) => value.dayOfWeek !== undefined || value.specificDate !== undefined,
    {
      message: "Provide either a day of week or a specific date.",
      path: ["dayOfWeek"],
    },
  );

export const venueDealSchema = z.object({
  venueId: z.uuid(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  dealType: z.enum(dealTypes),
  dealTier: z.enum(dealTiers),
  discountValue: z.string().trim().max(80).optional(),
  validFrom: z.string().datetime({ offset: true }).optional(),
  validUntil: z.string().datetime({ offset: true }).optional(),
  isActive: z.boolean().default(true),
});

export const venueReviewSchema = z.object({
  venueId: z.uuid(),
  reviewerId: z.uuid(),
  eventId: z.uuid(),
  reviewerType: z.enum(reviewerTypes),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(1500).optional(),
  venueResponse: z.string().trim().max(1500).optional(),
});

export const bookingRequestSchema = z.object({
  venueId: z.uuid(),
  organizerId: z.uuid(),
  eventId: z.uuid().optional(),
  requestedDate: dateSchema,
  requestedStart: timeSchema,
  requestedEnd: timeSchema,
  expectedAttendance: z.number().int().min(0).max(5000).optional(),
  eventDescription: z.string().trim().max(1500).optional(),
  message: z.string().trim().max(1500).optional(),
  status: z.enum(bookingStatuses).default("pending"),
  venueResponse: z.string().trim().max(1500).optional(),
  counterOffer: z.record(z.string(), z.unknown()).optional(),
});

import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use lowercase letters, numbers, and hyphens only.",
  });

export const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const optionalEmailSchema = z
  .string()
  .trim()
  .email()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(32)
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const richTextSchema = z.string().trim().min(1).max(5000);

export const uuidSchema = z.uuid();

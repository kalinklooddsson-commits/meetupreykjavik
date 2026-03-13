export const locales = ["en", "is"] as const;
export type Locale = (typeof locales)[number];

export const accountTypes = ["admin", "venue", "organizer", "user"] as const;
export type AccountType = (typeof accountTypes)[number];

export const venueTypes = [
  "bar",
  "restaurant",
  "club",
  "cafe",
  "coworking",
  "studio",
  "outdoor",
  "other",
] as const;
export type VenueType = (typeof venueTypes)[number];

export const partnershipTiers = ["free", "standard", "premium"] as const;
export type PartnershipTier = (typeof partnershipTiers)[number];

export const venueStatuses = [
  "pending",
  "active",
  "waitlisted",
  "suspended",
  "rejected",
] as const;
export type VenueStatus = (typeof venueStatuses)[number];

export const costTypes = [
  "free",
  "minimum_spend",
  "flat_fee",
  "negotiable",
] as const;
export type CostType = (typeof costTypes)[number];

export const dealTypes = [
  "percentage",
  "fixed_price",
  "free_item",
  "happy_hour",
  "group_package",
  "welcome_drink",
] as const;
export type DealType = (typeof dealTypes)[number];

export const dealTiers = ["bronze", "silver", "gold"] as const;
export type DealTier = (typeof dealTiers)[number];

export const reviewerTypes = ["organizer", "attendee"] as const;
export type ReviewerType = (typeof reviewerTypes)[number];

export const bookingStatuses = [
  "pending",
  "accepted",
  "declined",
  "counter_offered",
  "cancelled",
  "completed",
] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const groupVisibilities = ["public", "private"] as const;
export type GroupVisibility = (typeof groupVisibilities)[number];

export const joinModes = ["open", "approval"] as const;
export type JoinMode = (typeof joinModes)[number];

export const groupStatuses = ["pending", "active", "archived"] as const;
export type GroupStatus = (typeof groupStatuses)[number];

export const groupMemberRoles = [
  "organizer",
  "co_organizer",
  "member",
] as const;
export type GroupMemberRole = (typeof groupMemberRoles)[number];

export const groupMemberStatuses = [
  "active",
  "pending",
  "banned",
  "left",
] as const;
export type GroupMemberStatus = (typeof groupMemberStatuses)[number];

export const eventTypes = ["in_person", "online", "hybrid"] as const;
export type EventType = (typeof eventTypes)[number];

export const eventStatuses = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "cancelled",
  "completed",
] as const;
export type EventStatus = (typeof eventStatuses)[number];

export const rsvpModes = ["open", "approval", "invite_only"] as const;
export type RsvpMode = (typeof rsvpModes)[number];

export const inviteStatuses = ["pending", "accepted", "declined"] as const;
export type InviteStatus = (typeof inviteStatuses)[number];

export const blockScopes = ["platform", "group", "event", "venue"] as const;
export type BlockScope = (typeof blockScopes)[number];

export const rsvpStatuses = [
  "going",
  "not_going",
  "waitlisted",
  "cancelled",
] as const;
export type RsvpStatus = (typeof rsvpStatuses)[number];

export const attendanceStatuses = ["attended", "no_show"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];

export const notificationTypes = [
  "event_reminder",
  "new_event",
  "rsvp_confirmed",
  "waitlist_promoted",
  "booking_request",
  "booking_response",
  "new_member",
  "review",
  "admin_message",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const transactionTypes = [
  "subscription",
  "ticket",
  "promotion",
  "venue_partnership",
  "refund",
] as const;
export type TransactionType = (typeof transactionTypes)[number];

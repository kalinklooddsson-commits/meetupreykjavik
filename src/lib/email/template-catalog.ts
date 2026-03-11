export type EmailTemplateDefinition = {
  key: string;
  name: string;
  audience: string;
  subject: string;
  preheader: string;
  headline: string;
  intro: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  footer: string;
  tone: "indigo" | "coral" | "sage";
};

export const emailTemplateCatalog: EmailTemplateDefinition[] = [
  {
    key: "weekly-digest",
    name: "Weekly digest",
    audience: "All users",
    subject: "This week in Reykjavik",
    preheader:
      "Three city-shaped picks, one newcomer-safe social, and one venue partner worth noticing.",
    headline: "A warmer week of events across Reykjavik",
    intro:
      "Lead with one hosted social, one practical workshop, and one venue-backed format so the city feels alive without sounding noisy.",
    bullets: [
      "Open with the safest newcomer-friendly event in the city this week.",
      "Give one strong partner venue a human angle instead of a generic promo.",
      "End with a clear browse-events CTA and one featured group to continue the rhythm.",
    ],
    ctaLabel: "Explore this week's events",
    ctaHref: "/events",
    footer: "Sent as part of your MeetupReykjavik digest preferences.",
    tone: "indigo",
  },
  {
    key: "waitlist-promotion",
    name: "Waitlist promotion",
    audience: "Selected attendees",
    subject: "A seat just opened for you",
    preheader:
      "The room shape changed and a confirmed slot is now available if you still want it.",
    headline: "You moved off the waitlist",
    intro:
      "Use this when a curated attendee is promoted. The copy should feel calm, time-bound, and trustworthy rather than frantic.",
    bullets: [
      "Name the event, venue, and expiry time clearly in the first screenful.",
      "Reassure the attendee why they were selected or promoted.",
      "Keep the CTA singular: confirm seat, not browse the app.",
    ],
    ctaLabel: "Confirm my seat",
    ctaHref: "/dashboard",
    footer: "This notification was triggered by event availability.",
    tone: "coral",
  },
  {
    key: "venue-approved",
    name: "Venue approved",
    audience: "Venue partners",
    subject: "Your venue is approved on MeetupReykjavik",
    preheader:
      "Verification is complete and your partner profile is ready for live organizer discovery.",
    headline: "Your venue profile is now live",
    intro:
      "This email should feel operational and premium. Tell the venue exactly what they unlocked and what to do next.",
    bullets: [
      "Confirm verified status, partner tier, and what surfaces are now visible.",
      "Point to bookings, deals, and profile editing as the next operator actions.",
      "Use confident platform language without sounding automated or generic.",
    ],
    ctaLabel: "Open venue dashboard",
    ctaHref: "/venue/dashboard",
    footer: "Need changes? Reply to the partnerships team for review.",
    tone: "sage",
  },
  {
    key: "group-approved",
    name: "Group approved",
    audience: "Organizers",
    subject: "Your group is live",
    preheader:
      "Your community is approved and ready to publish its first public event.",
    headline: "Your group is ready to grow",
    intro:
      "Focus this message on momentum. Approval matters, but the real job is guiding the organizer into a strong first event and clear community rhythm.",
    bullets: [
      "State the approval clearly and link it to the first event workflow.",
      "Remind the organizer what kind of rhythm performs best on the platform.",
      "Invite them to browse venue matches if they need a strong room for launch.",
    ],
    ctaLabel: "Create first event",
    ctaHref: "/events/new",
    footer: "Organizer tools are available from your portal.",
    tone: "indigo",
  },
  {
    key: "payment-reminder",
    name: "Payment reminder",
    audience: "Premium members and paid-event attendees",
    subject: "Complete your booking or membership payment",
    preheader:
      "Your seat, upgrade, or renewal is still waiting, but the hold window is limited.",
    headline: "Complete payment before the hold expires",
    intro:
      "This template should be very clear, low-drama, and operational. Explain what is being held and what happens if payment does not clear.",
    bullets: [
      "Name the seat, plan, or booking being held.",
      "Show the expiry timing in plain language.",
      "Keep the CTA direct and singular with no extra branching.",
    ],
    ctaLabel: "Complete payment",
    ctaHref: "/settings",
    footer: "If you already paid, you can ignore this reminder.",
    tone: "coral",
  },
];

export function getEmailTemplateByKey(key: string) {
  return emailTemplateCatalog.find((template) => template.key === key);
}

import { categories, events, groups, venues } from "@/lib/home-data";
import { siteConfig } from "@/lib/constants";
import {
  minimumTicketPriceIsk,
  organizerTiers,
  ticketCommissionRate,
  venueTiers,
} from "@/lib/public-data";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const mockProfiles = [
  {
    id: "demo-user-1",
    displayName: "Anna Jonsdottir",
    slug: "anna-jonsdottir",
    accountType: "user",
    city: "Reykjavik",
    locale: "en",
  },
  {
    id: "demo-organizer-1",
    displayName: "Kari Sigurdsson",
    slug: "kari-sigurdsson",
    accountType: "organizer",
    city: "Reykjavik",
    locale: "is",
  },
] as const;

export const mockEvents = events.map((event, index) => ({
  id: `event-${index + 1}`,
  slug: slugify(event.title),
  title: event.title,
  description:
    "Event details are being loaded.",
  venue: event.venue,
  dateLabel: `${event.day} at ${event.time}`,
  attendees: event.attendees,
  category: event.tag,
}));

export const mockGroups = groups.map((group, index) => ({
  id: `group-${index + 1}`,
  slug: slugify(group.name),
  name: group.name,
  category: group.category,
  members: group.members,
  description: group.description,
}));

export const mockVenues = venues.map((venue, index) => ({
  id: `venue-${index + 1}`,
  slug: slugify(venue.name),
  name: venue.name,
  type: venue.type,
  area: venue.area,
  rating: venue.rating,
  events: venue.events,
  deal: venue.deal,
}));

export const mockAdminSettings = {
  siteName: siteConfig.name,
  defaultLocale: "en",
  moderation: {
    groupApproval: true,
    venueApproval: true,
  },
  billing: {
    minimumTicketPriceIsk,
    organizerStarterIsk: 4900,
    venuePartnerIsk: 9900,
    venuePremiumIsk: 19900,
    ticketCommissionPercent: ticketCommissionRate,
  },
  plans: {
    organizers: organizerTiers,
    venues: venueTiers,
  },
};

export const mockCatalog = {
  categories,
  events: mockEvents,
  groups: mockGroups,
  venues: mockVenues,
  users: mockProfiles,
};

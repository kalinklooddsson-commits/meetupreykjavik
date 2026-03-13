/**
 * Async data fetchers for dashboard portals.
 *
 * Pattern: try Supabase first for real user-specific data,
 * fall back to rich mock data from dashboard-data.ts when
 * the database is unavailable or no user is authenticated.
 */

import { hasSupabaseEnv } from "@/lib/env";
import { getUser } from "@/lib/auth/guards";
import { getUserRsvps } from "@/lib/db/rsvps";
import { getUserNotifications } from "@/lib/db/notifications";
import { getUserConversations } from "@/lib/db/messages";
import { getProfileById } from "@/lib/db/profiles";
import { getEvents } from "@/lib/db/events";
import { getUserTransactions, getPlatformRevenue } from "@/lib/db/transactions";
import { getVenueBookings } from "@/lib/db/bookings";
import { getVenues } from "@/lib/db/venues";
import {
  memberProfile as mockMemberProfile,
  memberPortalData as mockMemberPortalData,
  organizerPortalData as mockOrganizerPortalData,
  venuePortalData as mockVenuePortalData,
  adminPortalData as mockAdminPortalData,
  getManagedOrganizerEvent as mockGetManagedOrganizerEvent,
} from "@/lib/dashboard-data";

// ────────────────────────────────────────────
// Member dashboard
// ────────────────────────────────────────────

type MemberProfile = typeof mockMemberProfile;

export async function getMemberProfile(): Promise<MemberProfile> {
  const session = await getUser();

  if (!session) {
    return mockMemberProfile;
  }

  if (!hasSupabaseEnv()) {
    // Use session identity to personalise mock data
    const name = session.displayName ?? mockMemberProfile.name;
    const initials = name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return { ...mockMemberProfile, name, initials, slug: session.slug ?? mockMemberProfile.slug };
  }

  const profile = await getProfileById(session.id);

  if (!profile) {
    return mockMemberProfile;
  }

  return {
    slug: profile.slug,
    name: profile.display_name,
    initials: profile.display_name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    tier: profile.account_type === "user" ? "Free member" : "Plus member",
    city: profile.city ?? "Reykjavik",
    memberSince: new Date(profile.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    bio: profile.bio ?? "",
    completion: calculateProfileCompletion(profile as unknown as Record<string, unknown>),
    pronouns: "",
    languages: (profile.languages ?? ["English"]) as string[],
    interests: (profile.interests ?? []) as string[],
    badges: [] as string[],
    stats: mockMemberProfile.stats,
    highlights: mockMemberProfile.highlights,
    recentAttendance: mockMemberProfile.recentAttendance,
    venuePreferences: mockMemberProfile.venuePreferences,
    privacySnapshot: mockMemberProfile.privacySnapshot,
    formatAffinities: mockMemberProfile.formatAffinities,
    communityStyle: mockMemberProfile.communityStyle,
    relationshipTimeline: mockMemberProfile.relationshipTimeline,
    organizerGuidance: mockMemberProfile.organizerGuidance,
  } as MemberProfile;
}

function calculateProfileCompletion(profile: Record<string, unknown>) {
  const fields = [
    "display_name",
    "bio",
    "city",
    "languages",
    "interests",
    "avatar_url",
    "pronouns",
  ];
  const filled = fields.filter(
    (f) => profile[f] != null && profile[f] !== "" && !(Array.isArray(profile[f]) && (profile[f] as unknown[]).length === 0),
  ).length;
  return `${Math.round((filled / fields.length) * 100)}%`;
}

type MemberPortalData = typeof mockMemberPortalData;

export async function getMemberPortalData(): Promise<MemberPortalData> {
  const session = await getUser();

  if (!session || !hasSupabaseEnv()) {
    return mockMemberPortalData;
  }

  try {
    const [rsvps, notifications, conversations] = await Promise.all([
      getUserRsvps(session.id),
      getUserNotifications(session.id),
      getUserConversations(session.id),
    ]);

    const upcomingEvents =
      rsvps.length > 0
        ? rsvps.slice(0, 5).map((rsvp: Record<string, unknown>) => {
            const event = rsvp.events as Record<string, unknown> | null;
            const venue = event?.venues as Record<string, string> | null;
            return {
              event: {
                slug: String(event?.slug ?? ""),
                title: String(event?.title ?? "Untitled"),
                venueName: String(venue?.name ?? "TBD"),
                area: "Reykjavik" as string,
              },
              status: rsvp.status === "going" ? "Confirmed" : "Waitlist",
              note: "" as string,
              seat: "" as string,
            };
          })
        : mockMemberPortalData.upcomingEvents;

    const inbox =
      notifications.length > 0
        ? notifications.slice(0, 5).map((n: Record<string, unknown>) => ({
            key: n.id as string,
            title: (n.title as string) ?? "Notification",
            detail: (n.body as string) ?? "",
            meta: formatRelativeTime(n.created_at as string),
            tone: (n.is_read ? "sage" : "coral") as "sage" | "coral" | "indigo",
          }))
        : mockMemberPortalData.inbox;

    const messages =
      conversations.length > 0
        ? conversations.slice(0, 5).map((m: Record<string, unknown>) => {
            const sender = m.profiles as Record<string, string> | null;
            return {
              key: m.id as string,
              counterpart: sender?.display_name ?? "Unknown",
              role: "Member",
              subject: ((m.body as string) ?? "").slice(0, 60),
              preview: (m.body as string) ?? "",
              channel: "Direct message",
              status: "Unread",
              meta: formatRelativeTime(m.created_at as string),
            };
          })
        : mockMemberPortalData.messages;

    return {
      ...mockMemberPortalData,
      metrics: [
        {
          label: "Upcoming RSVPs",
          value: String(rsvps.length),
          delta: rsvps.length > 0 ? `${rsvps.length} active` : "None yet",
          detail: "Your confirmed event reservations.",
        },
        mockMemberPortalData.metrics[1],
        mockMemberPortalData.metrics[2],
        mockMemberPortalData.metrics[3],
      ],
      upcomingEvents,
      inbox,
      notifications:
        notifications.length > 0
          ? notifications.slice(0, 5).map((n: Record<string, unknown>) => ({
              key: n.id as string,
              title: (n.title as string) ?? "Notification",
              detail: (n.body as string) ?? "",
              channel: (n.type as string) ?? "System",
              status: n.is_read ? "Read" : "New",
              meta: formatRelativeTime(n.created_at as string),
              tone: (n.is_read ? "sage" : "indigo") as "sage" | "coral" | "indigo",
            }))
          : mockMemberPortalData.notifications,
      messages,
    } as MemberPortalData;
  } catch (error) {
    console.error("Failed to fetch member dashboard data:", error);
    return mockMemberPortalData;
  }
}

// ────────────────────────────────────────────
// Organizer dashboard
// ────────────────────────────────────────────

type OrganizerPortalData = typeof mockOrganizerPortalData;

export async function getOrganizerPortalData(): Promise<OrganizerPortalData> {
  const session = await getUser();

  if (!session || !hasSupabaseEnv()) {
    return mockOrganizerPortalData;
  }

  try {
    const [eventsResult, transactions] = await Promise.all([
      getEvents({ limit: 50 }),
      getUserTransactions(session.id),
    ]);

    const managedEvents = eventsResult.data.filter(
      (e: Record<string, unknown>) => e.host_id === session.id,
    );

    if (managedEvents.length === 0) {
      return mockOrganizerPortalData;
    }

    const totalRevenue = transactions.reduce(
      (sum: number, t: Record<string, unknown>) =>
        sum + ((t.amount_isk as number) ?? 0),
      0,
    );

    return {
      ...mockOrganizerPortalData,
      metrics: [
        {
          label: "Live events",
          value: String(managedEvents.length),
          delta: `${managedEvents.length} published`,
          detail: "Events you manage that are currently live.",
        },
        mockOrganizerPortalData.metrics[1],
        mockOrganizerPortalData.metrics[2],
        {
          label: "Revenue",
          value: `${totalRevenue.toLocaleString()} ISK`,
          delta: "All time",
          detail: "Total ticket and membership revenue.",
        },
      ],
    } as OrganizerPortalData;
  } catch (error) {
    console.error("Failed to fetch organizer dashboard data:", error);
    return mockOrganizerPortalData;
  }
}

export { mockGetManagedOrganizerEvent as getManagedOrganizerEvent };

// ────────────────────────────────────────────
// Venue dashboard
// ────────────────────────────────────────────

type VenuePortalData = typeof mockVenuePortalData;

export async function getVenuePortalData(): Promise<VenuePortalData> {
  const session = await getUser();

  if (!session || !hasSupabaseEnv()) {
    return mockVenuePortalData;
  }

  try {
    const venues = await getVenues({ limit: 10 });
    const ownedVenue = venues.data.find(
      (v: Record<string, unknown>) => v.owner_id === session.id,
    );

    if (!ownedVenue) {
      return mockVenuePortalData;
    }

    const bookings = await getVenueBookings(ownedVenue.id as string);

    return {
      ...mockVenuePortalData,
      metrics: [
        {
          label: "Active bookings",
          value: String(bookings.length),
          delta: bookings.length > 0 ? "This period" : "None yet",
          detail: "Current confirmed bookings for your venue.",
        },
        mockVenuePortalData.metrics[1],
        mockVenuePortalData.metrics[2],
        mockVenuePortalData.metrics[3],
      ],
    } as VenuePortalData;
  } catch (error) {
    console.error("Failed to fetch venue dashboard data:", error);
    return mockVenuePortalData;
  }
}

// ────────────────────────────────────────────
// Admin dashboard
// ────────────────────────────────────────────

type AdminPortalData = typeof mockAdminPortalData;

export async function getAdminPortalData(): Promise<AdminPortalData> {
  if (!hasSupabaseEnv()) {
    return mockAdminPortalData;
  }

  try {
    const [eventsResult, venuesResult, revenue] = await Promise.all([
      getEvents({ limit: 1 }),
      getVenues({ limit: 1 }),
      getPlatformRevenue(),
    ]);

    return {
      ...mockAdminPortalData,
      metrics: [
        {
          label: "Total events",
          value: String(eventsResult.count),
          delta: "All time",
          detail: "Total published events on the platform.",
        },
        {
          label: "Active venues",
          value: String(venuesResult.count),
          delta: "Partners",
          detail: "Venues currently in the partner network.",
        },
        {
          label: "Revenue",
          value: `${revenue.total_isk.toLocaleString()} ISK`,
          delta: "All time",
          detail: "Total platform revenue.",
        },
        mockAdminPortalData.metrics[3],
      ],
    } as AdminPortalData;
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    return mockAdminPortalData;
  }
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "Yesterday";

  return `${diffD}d ago`;
}

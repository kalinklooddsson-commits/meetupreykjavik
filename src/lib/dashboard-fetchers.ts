/**
 * Async data fetchers for dashboard portals.
 *
 * Pattern: try Supabase first for real user-specific data,
 * fall back to rich mock data from dashboard-data.ts when
 * the database is unavailable or no user is authenticated.
 */

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/guards";
import { getUserRsvps } from "@/lib/db/rsvps";
import { getUserNotifications } from "@/lib/db/notifications";
import { getUserConversations } from "@/lib/db/messages";
import { getProfileById } from "@/lib/db/profiles";
import { getEvents, getEventsByHost } from "@/lib/db/events";
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
    return { ...mockMemberProfile, name, initials, slug: session.slug ?? mockMemberProfile.slug, email: session.email ?? mockMemberProfile.email };
  }

  const profile = await getProfileById(session.id);

  if (!profile) {
    return mockMemberProfile;
  }

  // Build real profile stats from DB
  const supabase = await createSupabaseServerClient();
  let rsvpCount = 0;
  let groupCount = 0;
  if (supabase) {
    const [rsvpResult, groupResult] = await Promise.all([
      supabase.from("rsvps").select("id", { count: "exact", head: true }).eq("user_id", session.id).eq("status", "going"),
      supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", session.id),
    ]);
    rsvpCount = rsvpResult.count ?? 0;
    groupCount = groupResult.count ?? 0;
  }

  return {
    slug: profile.slug,
    name: profile.display_name,
    email: profile.email ?? "",
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
    stats: {
      eventsAttended: rsvpCount,
      groupsJoined: groupCount,
      memberSinceYear: new Date(profile.created_at).getFullYear(),
    },
    highlights: [] as typeof mockMemberProfile.highlights,
    recentAttendance: [] as typeof mockMemberProfile.recentAttendance,
    venuePreferences: [] as typeof mockMemberProfile.venuePreferences,
    privacySnapshot: { visibility: "Members only", showEmail: false, showLocation: true },
    formatAffinities: [] as typeof mockMemberProfile.formatAffinities,
    communityStyle: { label: "Explorer", detail: "You're still exploring — attend more events to build your profile." },
    relationshipTimeline: [] as typeof mockMemberProfile.relationshipTimeline,
    organizerGuidance: [
      "Join events and groups to build your community presence.",
    ],
  } as unknown as MemberProfile;
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

    // Count groups from DB
    let groupCount = 0;
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { count } = await supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", session.id);
      groupCount = count ?? 0;
    }

    const upcomingEvents = rsvps.slice(0, 5).map((rsvp: Record<string, unknown>) => {
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
    });

    const inbox = notifications.slice(0, 5).map((n: Record<string, unknown>) => ({
      key: n.id as string,
      title: (n.title as string) ?? "Notification",
      detail: (n.body as string) ?? "",
      meta: formatRelativeTime(n.created_at as string),
      tone: (n.is_read ? "sage" : "coral") as "sage" | "coral" | "indigo",
    }));

    const mappedMessages = conversations.slice(0, 5).map((m: Record<string, unknown>) => {
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
    });

    const mappedNotifications = notifications.slice(0, 5).map((n: Record<string, unknown>) => ({
      key: n.id as string,
      title: (n.title as string) ?? "Notification",
      detail: (n.body as string) ?? "",
      channel: (n.type as string) ?? "System",
      status: n.is_read ? "Read" : "New",
      meta: formatRelativeTime(n.created_at as string),
      tone: (n.is_read ? "sage" : "indigo") as "sage" | "coral" | "indigo",
    }));

    // Compute real recommendations count from upcoming events the user hasn't RSVP'd to
    let recommendationCount = 0;
    if (supabase) {
      const { count } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString());
      recommendationCount = Math.max(0, (count ?? 0) - rsvps.length);
    }

    return {
      ...mockMemberPortalData,
      metrics: [
        {
          label: "Upcoming RSVPs",
          value: String(rsvps.length),
          delta: rsvps.length > 0 ? `${rsvps.length} active` : "None yet",
          detail: "Your confirmed event reservations.",
        },
        {
          label: "Groups joined",
          value: String(groupCount),
          delta: groupCount > 0 ? `${groupCount} active` : "None yet",
          detail: "Groups you're a member of.",
        },
        {
          label: "Recommendations",
          value: String(recommendationCount),
          delta: recommendationCount > 0 ? "Events you might like" : "Check back soon",
          detail: "Upcoming events you haven't RSVP'd to.",
        },
        mockMemberPortalData.metrics[3],
      ],
      upcomingEvents,
      inbox,
      notifications: mappedNotifications,
      messages: mappedMessages,
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
    const [managedEvents, transactions, rsvpTrendData] = await Promise.all([
      getEventsByHost(session.id, { limit: 50 }),
      getUserTransactions(session.id),
      (async () => {
        // Build RSVP trend from last 7 days
        try {
          const supabase = await createSupabaseServerClient();
          if (!supabase) return null;
          const eventIds = (await getEventsByHost(session.id, { limit: 100 })).map(
            (e: Record<string, unknown>) => e.id as string,
          );
          if (eventIds.length === 0) return null;
          const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
          const { data: recentRsvps } = await supabase
            .from("rsvps")
            .select("created_at")
            .in("event_id", eventIds)
            .gte("created_at", sevenDaysAgo);
          if (!recentRsvps || recentRsvps.length === 0) return null;
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const counts = new Array(7).fill(0);
          for (const r of recentRsvps) {
            counts[new Date(r.created_at as string).getDay()]++;
          }
          // Start from Monday
          return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ label: days[d], value: counts[d] }));
        } catch {
          return null;
        }
      })(),
    ]);

    const totalRevenue = transactions.reduce(
      (sum: number, t: Record<string, unknown>) =>
        sum + ((t.amount_isk as number) ?? 0),
      0,
    );

    const totalRsvps = managedEvents.reduce(
      (sum: number, e: Record<string, unknown>) =>
        sum + ((e.rsvp_count as number) ?? 0),
      0,
    );

    const nextEvents = managedEvents.slice(0, 10).map((e: Record<string, unknown>) => {
      const venue = e.venues as Record<string, unknown> | null;
      const group = e.groups as Record<string, unknown> | null;
      const startsAt = new Date(e.starts_at as string);
      const dateLabel = startsAt.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        hour12: false, timeZone: "Atlantic/Reykjavik",
      });
      return {
        slug: e.slug as string,
        title: e.title as string,
        groupName: (group?.name as string) ?? "",
        dateLabel,
        venueName: (venue?.name as string) ?? (e.venue_name as string) ?? "TBA",
        status: ((e.status as string) ?? "draft").replace(/^\w/, (c: string) => c.toUpperCase()),
        approvalMode: (e.rsvp_mode as string) ?? "open",
        rsvps: (e.rsvp_count as number) ?? 0,
        capacity: (e.attendee_limit as number) ?? 50,
        waitlist: 0,
        ticketsSold: 0,
        revenue: "0 ISK",
        checkIns: `0 / ${(e.rsvp_count as number) ?? 0}`,
        notes: "",
        timeline: [] as { time: string; label: string }[],
        attendees: [] as { name: string; status: string; ticket: string; checkedIn: string; note: string }[],
        coOrganizers: [] as string[],
        commentsSummary: "",
      };
    });

    return {
      ...mockOrganizerPortalData,
      metrics: [
        {
          label: "Live events",
          value: String(managedEvents.length),
          delta: `${managedEvents.length} published`,
          detail: "Events you manage that are currently live.",
        },
        {
          label: "Total RSVPs",
          value: String(totalRsvps),
          delta: totalRsvps > 0 ? "Across all events" : "None yet",
          detail: "Total confirmed RSVPs for your events.",
        },
        {
          label: "Avg. fill rate",
          value: managedEvents.length > 0
            ? `${Math.round(managedEvents.reduce((sum: number, e: Record<string, unknown>) => sum + ((e.rsvp_count as number ?? 0) / Math.max(e.attendee_limit as number ?? 50, 1)) * 100, 0) / managedEvents.length)}%`
            : "—",
          delta: managedEvents.length > 0 ? "Across events" : "No events yet",
          detail: "Average attendance vs. capacity.",
        },
        {
          label: "Revenue",
          value: `${totalRevenue.toLocaleString()} ISK`,
          delta: totalRevenue > 0 ? "All time" : "No revenue yet",
          detail: "Total ticket and membership revenue.",
        },
      ],
      nextEvents,
      ...(rsvpTrendData ? { rsvpTrend: rsvpTrendData } : {}),
    } as unknown as OrganizerPortalData;
  } catch (error) {
    console.error("Failed to fetch organizer dashboard data:", error);
    return mockOrganizerPortalData;
  }
}

export async function getManagedOrganizerEvent(slug: string) {
  if (!hasSupabaseEnv()) return mockGetManagedOrganizerEvent(slug);

  try {
    const { getEventBySlug } = await import("@/lib/db/events");
    const row = await getEventBySlug(slug);
    if (!row) return mockGetManagedOrganizerEvent(slug);

    const venue = (row as Record<string, unknown>).venues as Record<string, unknown> | null;
    const group = (row as Record<string, unknown>).groups as Record<string, unknown> | null;
    const startsAt = new Date(row.starts_at);
    const dateLabel = startsAt.toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      hour12: false, timeZone: "Atlantic/Reykjavik",
    });

    return {
      slug: row.slug,
      title: row.title,
      groupName: (group?.name as string) ?? "",
      dateLabel,
      venueName: (venue?.name as string) ?? row.venue_name ?? "TBA",
      status: (row.status ?? "draft").replace(/^\w/, (c: string) => c.toUpperCase()),
      approvalMode: row.rsvp_mode ?? "open",
      rsvps: row.rsvp_count ?? 0,
      capacity: row.attendee_limit ?? 50,
      waitlist: 0,
      ticketsSold: 0,
      revenue: "0 ISK",
      checkIns: `0 / ${row.rsvp_count ?? 0}`,
      notes: row.description ?? "",
      timeline: [] as { time: string; label: string }[],
      attendees: [] as { name: string; status: string; ticket: string; checkedIn: string; note: string }[],
      coOrganizers: [] as string[],
      commentsSummary: "",
    };
  } catch {
    return mockGetManagedOrganizerEvent(slug);
  }
}

/**
 * Fetch raw event data for the edit form wizard.
 * Returns a partial form-shaped object or null if not found.
 */
export async function getEventFormData(slug: string) {
  if (!hasSupabaseEnv()) return null;

  try {
    const { getEventBySlug } = await import("@/lib/db/events");
    const row = await getEventBySlug(slug);
    if (!row) return null;

    const r = row as Record<string, unknown>;
    const startsAt = r.starts_at ? new Date(r.starts_at as string) : null;
    const endsAt = r.ends_at ? new Date(r.ends_at as string) : null;
    const group = r.groups as Record<string, unknown> | null;

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    return {
      title: (r.title as string) ?? "",
      description: (r.description as string) ?? "",
      groupSlug: (group?.slug as string) ?? (r.group_slug as string) ?? "",
      eventType: (r.event_type as string) ?? "in_person",
      locationMode: (r.event_type as string) === "online" ? "online" as const : "venue" as const,
      startsOn: startsAt ? formatDate(startsAt) : "",
      startTime: startsAt ? formatTime(startsAt) : "",
      endTime: endsAt ? formatTime(endsAt) : "",
      venueSlug: (r.venue_slug as string) ?? "",
      venueAddress: (r.venue_address as string) ?? "",
      onlineLink: (r.online_link as string) ?? "",
      attendeeLimit: (r.attendee_limit as number) ?? 60,
      guestLimit: (r.guest_limit as number) ?? 0,
      rsvpMode: (r.rsvp_mode as string) ?? "open",
      ageRestriction: (r.age_restriction as string) ?? "",
      ageMin: r.age_min != null ? String(r.age_min) : "",
      ageMax: r.age_max != null ? String(r.age_max) : "",
      isFree: (r.is_free as boolean) ?? false,
      commentsEnabled: (r.comments_enabled as boolean) ?? true,
      recurring: !!(r.recurrence_rule as string),
      recurrenceRule: (r.recurrence_rule as string) ?? "",
      recurrenceEnds: (r.recurrence_end as string) ?? "",
      featuredPhotoUrl: (r.featured_photo_url as string) ?? "",
      tags: Array.isArray(r.tags) ? (r.tags as string[]).join(", ") : "",
    };
  } catch {
    return null;
  }
}

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

    const pendingCount = bookings.filter((b: Record<string, unknown>) => b.status === "pending").length;

    const venueBookingsList = bookings.slice(0, 10).map((b: Record<string, unknown>) => {
      const organizer = b.profiles as Record<string, unknown> | null;
      return {
        key: b.id as string,
        organizer: (organizer?.display_name as string) ?? "Unknown",
        event: (b.event_title as string) ?? "Booking request",
        date: (b.requested_date as string) ?? "",
        attendance: String((b.expected_attendance as number) ?? 0),
        message: (b.message as string) ?? "",
        status: (b.status as string) ?? "pending",
      };
    });

    // Count events at this venue and compute rating
    const supabase = await createSupabaseServerClient();
    let eventCount = 0;
    let avgRating = 0;
    if (supabase) {
      const { count: evtCount } = await supabase.from("events").select("id", { count: "exact", head: true }).eq("venue_id", ownedVenue.id as string);
      eventCount = evtCount ?? 0;
      const { data: reviews } = await supabase.from("venue_reviews").select("rating").eq("venue_id", ownedVenue.id as string);
      if (reviews && reviews.length > 0) {
        avgRating = Math.round(reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length * 10) / 10;
      }
    }

    return {
      ...mockVenuePortalData,
      venue: ownedVenue,
      metrics: [
        {
          label: "Active bookings",
          value: String(bookings.length),
          delta: bookings.length > 0 ? "This period" : "None yet",
          detail: "Current confirmed bookings for your venue.",
        },
        {
          label: "Events hosted",
          value: String(eventCount),
          delta: eventCount > 0 ? "At your venue" : "None yet",
          detail: "Total events that have been held at your venue.",
        },
        {
          label: "Rating",
          value: avgRating > 0 ? `${avgRating} / 5` : "—",
          delta: avgRating > 0 ? "Average from reviews" : "No reviews yet",
          detail: "Your average venue rating from organizers.",
        },
        {
          label: "Pending bookings",
          value: String(pendingCount),
          delta: pendingCount > 0 ? "Needs response" : "All clear",
          detail: "Booking requests awaiting your response.",
        },
      ],
      bookings: venueBookingsList,
    } as unknown as VenuePortalData;
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
    const supabase = await createSupabaseServerClient();
    const profileCountPromise = supabase
      ? supabase.from("profiles").select("*", { count: "exact", head: true }).then((r) => r.count ?? 0)
      : Promise.resolve(0);

    const [eventsResult, venuesResult, revenue, profileCount, revenueTrend] = await Promise.all([
      getEvents({ limit: 50 }),
      getVenues({ limit: 50 }),
      getPlatformRevenue(),
      profileCountPromise,
      (async () => {
        // Revenue trend: transaction amounts by day for last 7 days
        try {
          if (!supabase) return null;
          const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
          const { data: txns } = await supabase
            .from("transactions")
            .select("amount_isk, created_at")
            .eq("status", "completed")
            .gte("created_at", sevenDaysAgo);
          if (!txns || txns.length === 0) return null;
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const sums = new Array(7).fill(0);
          for (const t of txns) {
            sums[new Date(t.created_at as string).getDay()] += (t.amount_isk as number) ?? 0;
          }
          return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ label: days[d], value: sums[d] }));
        } catch {
          return null;
        }
      })(),
    ]);

    return {
      ...mockAdminPortalData,
      metrics: [
        {
          label: "Users",
          value: String(profileCount),
          delta: "Registered",
          detail: "Total registered members on the platform.",
        },
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
        mockAdminPortalData.metrics[4] ?? {
          label: "System health",
          value: "Operational",
          delta: "All checks passing",
          detail: "Platform systems are running normally.",
        },
      ],
      ...(revenueTrend ? { revenueTrend } : {}),
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

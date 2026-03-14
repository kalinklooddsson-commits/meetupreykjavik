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
    tier: ((profile as unknown as Record<string, unknown>).subscription_tier as string) ?? (profile.account_type === "user" ? "Free" : "Plus"),
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
    const [rsvps, notifications, conversations, realProfile] = await Promise.all([
      getUserRsvps(session.id),
      getUserNotifications(session.id),
      getUserConversations(session.id),
      getMemberProfile(),
    ]);

    // Fetch groups the member belongs to
    const supabase = await createSupabaseServerClient();
    let memberGroups: Array<{ group: { slug: string; name: string }; role: string; nextEvent: string; unread: string }> = [];
    if (supabase) {
      const { data: memberships } = await supabase
        .from("group_members")
        .select("role, groups(slug, name)")
        .eq("user_id", session.id);
      memberGroups = (memberships ?? []).map((m: Record<string, unknown>) => {
        const g = m.groups as Record<string, string> | null;
        return {
          group: { slug: g?.slug ?? "", name: g?.name ?? "Unknown group" },
          role: ((m.role as string) ?? "member").replace(/^\w/, (c: string) => c.toUpperCase()),
          nextEvent: "",
          unread: "0",
        };
      });
    }
    const groupCount = memberGroups.length;

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
      const body = (m.body as string) ?? "";
      const subjectText = (m.subject as string) || (m.title as string) || body.slice(0, 40) || "Message";
      return {
        key: m.id as string,
        counterpart: (m.other_display_name as string) ?? "Unknown",
        role: "Member",
        subject: subjectText,
        preview: body !== subjectText ? body.slice(0, 80) : "",
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

    // Build real recommendations from upcoming events the user hasn't RSVP'd to
    let recommendationCount = 0;
    type RecommendationItem = { event: { slug: string; title: string; venueName: string; area: string }; reason: string; score: string };
    let realRecommendations: RecommendationItem[] = [];
    if (supabase) {
      const rsvpEventIds = new Set(
        rsvps.map((r: Record<string, unknown>) => {
          const ev = r.events as Record<string, unknown> | null;
          return ev?.id as string;
        }).filter(Boolean),
      );
      const { data: upcomingPublished } = await supabase
        .from("events")
        .select("id, slug, title, venue_name, venues:venue_id ( name )")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(10);
      const available = (upcomingPublished ?? []).filter(
        (e: Record<string, unknown>) => !rsvpEventIds.has(e.id as string),
      );
      recommendationCount = available.length;
      realRecommendations = available.slice(0, 5).map((e: Record<string, unknown>, i: number) => {
        const venue = e.venues as Record<string, string> | null;
        return {
          event: {
            slug: String(e.slug),
            title: String(e.title),
            venueName: String(venue?.name ?? e.venue_name ?? "TBD"),
            area: "Reykjavik",
          },
          reason: "Upcoming event that matches your interests.",
          score: `${Math.max(95 - i * 5, 70)}%`,
        };
      });
    }

    // Build calendarDays from real RSVP data for the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

    // Build event-by-day map from RSVPs
    const eventsByDay = new Map<number, string[]>();
    for (const rsvp of rsvps) {
      const event = rsvp.events as Record<string, unknown> | null;
      if (!event?.starts_at) continue;
      const d = new Date(event.starts_at as string);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!eventsByDay.has(day)) eventsByDay.set(day, []);
        eventsByDay.get(day)!.push(String(event.title ?? "Event"));
      }
    }

    // Leading outside days (previous month)
    const prevMonthDays = new Date(year, month, 0).getDate();
    const calendarDays: Array<{ day: number; outside?: boolean; emphasis?: boolean; items?: string[] }> = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({ day: prevMonthDays - i, outside: true });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const items = eventsByDay.get(d);
      calendarDays.push({
        day: d,
        ...(items ? { emphasis: true, items } : {}),
      });
    }
    // Trailing outside days to fill the grid (42 cells = 6 rows)
    const trailing = 42 - calendarDays.length;
    for (let d = 1; d <= trailing; d++) {
      calendarDays.push({ day: d, outside: true });
    }

    // Read saved user settings from platform_settings to persist across reloads
    let savedSettingsSections = mockMemberPortalData.settingsSections;
    if (supabase) {
      const settingsKey = `user_settings:${session.id}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settingsDb = supabase as any;
      const { data: savedRow } = await settingsDb
        .from("platform_settings")
        .select("value")
        .eq("key", settingsKey)
        .maybeSingle() as { data: { value: Record<string, Record<string, string>> } | null };

      if (savedRow?.value) {
        const saved = savedRow.value;
        savedSettingsSections = mockMemberPortalData.settingsSections.map(
          (section: { key: string; title: string; description: string; items: Array<{ label: string; value: string }> }) => {
            const sectionOverrides = saved[section.key];
            if (!sectionOverrides) return section;
            return {
              ...section,
              items: section.items.map((item: { label: string; value: string }) => ({
                label: item.label,
                value: sectionOverrides[item.label] ?? item.value,
              })),
            };
          },
        );
      }

      // Override profile section with real profile data
      savedSettingsSections = savedSettingsSections.map(
        (section: { key: string; title: string; description: string; items: Array<{ label: string; value: string }> }) => {
          if (section.key === "profile") {
            return {
              ...section,
              items: section.items.map((item: { label: string; value: string }) => {
                if (item.label === "Display name") return { ...item, value: realProfile?.name ?? item.value };
                return item;
              }),
            };
          }
          if (section.key === "account") {
            return {
              ...section,
              items: section.items.map((item: { label: string; value: string }) => {
                if (item.label === "Primary email") return { ...item, value: session.email ?? item.value };
                if (item.label === "Account tier") return { ...item, value: realProfile?.tier ?? item.value };
                return item;
              }),
            };
          }
          return section;
        },
      );
    }

    return {
      ...mockMemberPortalData,
      calendarDays,
      settingsSections: savedSettingsSections,
      recommendations: realRecommendations.length > 0 ? realRecommendations : mockMemberPortalData.recommendations,
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
        {
          label: "Profile strength",
          value: realProfile?.completion ?? "—",
          delta: "Complete your profile",
          detail: "A complete profile helps organizers and groups connect with you.",
        },
      ],
      profile: realProfile,
      upcomingEvents,
      // Override mock events/groups so fake data doesn't leak
      events: [],
      groups: memberGroups,
      inbox,
      notifications: mappedNotifications,
      messages: mappedMessages,
    } as unknown as MemberPortalData;
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

    // Fetch groups the organizer manages
    let organizerGroups: Array<{ group: { slug: string; name: string }; coHosts: number; joinMode: string; status: string; pendingMembers: number; health: string; nextEvent: string }> = [];
    try {
      const supabase2 = await createSupabaseServerClient();
      if (supabase2) {
        const { data: ownedGroups } = await supabase2
          .from("groups")
          .select("slug, name, status, join_mode")
          .eq("organizer_id", session.id);
        organizerGroups = (ownedGroups ?? []).map((g: Record<string, unknown>) => ({
          group: { slug: g.slug as string, name: g.name as string },
          coHosts: 0,
          joinMode: ((g.join_mode as string) ?? "open").replace(/^\w/, (c: string) => c.toUpperCase()),
          status: ((g.status as string) ?? "active").replace(/^\w/, (c: string) => c.toUpperCase()),
          pendingMembers: 0,
          health: "Healthy",
          nextEvent: "",
        }));
      }
    } catch { /* non-critical */ }

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

    // Build per-event revenue from transactions (ticket_revenue/ticket_count don't exist on events table)
    const revenueByEvent = new Map<string, { count: number; amount: number }>();
    for (const t of transactions) {
      const eid = (t as Record<string, unknown>).event_id as string | undefined;
      if (!eid) continue;
      const entry = revenueByEvent.get(eid) ?? { count: 0, amount: 0 };
      entry.count++;
      entry.amount += ((t as Record<string, unknown>).amount_isk as number) ?? 0;
      revenueByEvent.set(eid, entry);
    }

    const allMappedEvents = managedEvents.map((e: Record<string, unknown>) => {
      const venue = e.venues as Record<string, unknown> | null;
      const group = e.groups as Record<string, unknown> | null;
      const startsAt = new Date(e.starts_at as string);
      const dateLabel = startsAt.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        hour12: false, timeZone: "Atlantic/Reykjavik",
      });
      const eventRevenue = revenueByEvent.get(e.id as string);
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
        ticketsSold: eventRevenue?.count ?? 0,
        revenue: `${(eventRevenue?.amount ?? 0).toLocaleString()} ISK`,
        checkIns: `0 / ${(e.rsvp_count as number) ?? 0}`,
        notes: "",
        timeline: [] as { time: string; label: string }[],
        attendees: [] as { name: string; status: string; ticket: string; checkedIn: string; note: string }[],
        coOrganizers: [] as string[],
        commentsSummary: "",
      };
    });

    // Use mock data as base for type shape, but override ALL data fields
    // so that real DB data (or empty states) are shown instead of fake data.
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
      // Use all mapped events for the events page, slice for nextEvents (overview)
      events: allMappedEvents,
      groups: organizerGroups,
      bookings: [],
      nextEvents: allMappedEvents.slice(0, 10),
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
    const supabase = await createSupabaseServerClient();
    if (!supabase) return mockVenuePortalData;

    // ── 2A: Find owned venue directly by owner_id ──
    // Use .limit(1) + array access instead of .maybeSingle() to avoid
    // error when user owns multiple venues (picks first by default order)
    const { data: venueRows } = await supabase
      .from("venues")
      .select("*")
      .eq("owner_id", session.id)
      .order("created_at", { ascending: true })
      .limit(1);

    let venueRow = venueRows?.[0];

    // If user doesn't own a venue (e.g. admin), pick a venue that has events for preview
    if (!venueRow && session.accountType === "admin") {
      // Find a venue that has events (most interesting for preview)
      const { data: venueWithEvents } = await supabase
        .from("events")
        .select("venue_id")
        .not("venue_id", "is", null)
        .limit(1);
      const previewVenueId = venueWithEvents?.[0]?.venue_id;
      if (previewVenueId) {
        const { data: previewVenue } = await supabase
          .from("venues")
          .select("*")
          .eq("id", previewVenueId as string)
          .limit(1);
        venueRow = previewVenue?.[0];
      }
      // Final fallback: any active venue
      if (!venueRow) {
        const { data: fallbackVenues } = await supabase
          .from("venues")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1);
        venueRow = fallbackVenues?.[0];
      }
    }

    if (!venueRow) return mockVenuePortalData;

    const venueId = venueRow.id as string;

    // ── Parallel queries for all portal data ──
    const [
      bookingsRaw,
      eventsResult,
      reviewsResult,
      dealsResult,
      availResult,
      notificationsResult,
      messagesResult,
    ] = await Promise.all([
      getVenueBookings(venueId),
      supabase
        .from("events")
        .select("id, title, slug, starts_at, status, category_id, host_id, categories:category_id ( name_en ), host:host_id ( display_name )")
        .eq("venue_id", venueId)
        .order("starts_at", { ascending: true }),
      supabase
        .from("venue_reviews")
        .select("*, profiles:reviewer_id ( display_name ), events:event_id ( title )")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false }),
      supabase
        .from("venue_deals")
        .select("*")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false }),
      supabase
        .from("venue_availability")
        .select("*")
        .eq("venue_id", venueId)
        .order("day_of_week", { ascending: true }),
      getUserNotifications(session.id),
      getUserConversations(session.id),
    ]);

    const bookings = bookingsRaw ?? [];
    const events = eventsResult.data ?? [];
    const reviews = reviewsResult.data ?? [];
    const deals = dealsResult.data ?? [];
    const availability = availResult.data ?? [];
    const notifications = notificationsResult ?? [];
    const messages = messagesResult ?? [];

    // ── 2B + 2C: Structure bookings as {incoming, history, guestFit} ──
    const pendingStatuses = new Set(["pending", "counter_offered"]);
    const doneStatuses = new Set(["completed", "declined", "cancelled"]);

    const mapBooking = (b: Record<string, unknown>) => {
      const organizer = b.profiles as Record<string, unknown> | null;
      const event = b.events as Record<string, unknown> | null;
      return {
        key: b.id as string,
        organizer: (organizer?.display_name as string) ?? "Unknown",
        event: (event?.title as string) ?? "Booking request",
        date: (b.requested_date as string) ?? "",
        attendance: `${(b.expected_attendance as number) ?? 0} expected`,
        message: (b.message as string) ?? "",
        status: (b.status as string) ?? "pending",
      };
    };

    const incoming = bookings
      .filter((b: Record<string, unknown>) => pendingStatuses.has(b.status as string) || b.status === "accepted")
      .map(mapBooking);

    const history = bookings
      .filter((b: Record<string, unknown>) => doneStatuses.has(b.status as string))
      .map((b: Record<string, unknown>) => {
        const organizer = b.profiles as Record<string, unknown> | null;
        return {
          key: b.id as string,
          venue: (venueRow.name as string) ?? "",
          organizer: (organizer?.display_name as string) ?? "Unknown",
          result: ((b.status as string) ?? "").charAt(0).toUpperCase() + ((b.status as string) ?? "").slice(1),
          note: (b.message as string) ?? "",
        };
      });

    // ── 2D: Events list ──
    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.status !== "cancelled" && new Date(e.starts_at as string) >= now)
      .slice(0, 10)
      .map((e) => ({
        event: { slug: e.slug as string, title: e.title as string },
        organizer: ((e.host as unknown as Record<string, unknown> | null)?.display_name as string) ?? "Unknown",
        status: (e.status as string) === "draft" ? "Pending review" : "Confirmed",
        note: "",
      }));

    // ── 2E: Reviews ──
    const avgRating =
      reviews.length > 0
        ? Math.round(reviews.reduce((s, r) => s + ((r.rating as number) ?? 0), 0) / reviews.length * 10) / 10
        : 0;

    const mappedReviews = reviews.map((r, i) => {
      const profile = r.profiles as Record<string, unknown> | null;
      const event = r.events as Record<string, unknown> | null;
      return {
        key: (r.id as string) ?? `vr-${i}`,
        reviewer: (profile?.display_name as string) ?? "Anonymous",
        rating: (r.rating as number) ?? 0,
        text: (r.text as string) ?? "",
        date: (r.created_at as string)?.slice(0, 10) ?? "",
        eventName: (event?.title as string) ?? "",
        ...(r.venue_response ? { venueResponse: r.venue_response as string } : {}),
      };
    });

    // ── 2F: Notifications ──
    const mappedNotifications = Array.isArray(notifications)
      ? notifications.slice(0, 10).map((n: Record<string, unknown>, i: number) => ({
          key: (n.id as string) ?? `notif-${i}`,
          title: (n.title as string) ?? "",
          detail: (n.body as string) ?? (n.message as string) ?? "",
          channel: ((n.type as string) ?? "General").replace(/_/g, " ").replace(/^\w/, (c: string) => c.toUpperCase()),
          status: (n.is_read as boolean) ? "Read" : "Unread",
          meta: (n.created_at as string)?.slice(0, 10) ?? "",
          tone: "indigo" as const,
        }))
      : [];

    // ── 2G: Messages ──
    const mappedMessages = Array.isArray(messages)
      ? messages.slice(0, 10).map((m: Record<string, unknown>, i: number) => ({
          key: (m.id as string) ?? `msg-${i}`,
          counterpart: (m.other_display_name as string) ?? (m.counterpart as string) ?? "Unknown",
          role: "Organizer",
          subject: (m.subject as string) ?? (m.last_message as string)?.slice(0, 40) ?? "Message",
          preview: (m.last_message as string) ?? (m.preview as string) ?? "",
          channel: "Booking thread",
          status: (m.unread_count as number) > 0 ? "Needs reply" : "Read",
          meta: (m.updated_at as string)?.slice(0, 10) ?? "",
        }))
      : [];

    // ── 2H: Deals ──
    const mappedDeals = deals.length > 0
      ? deals.map((d, i) => ({
          key: (d.id as string) ?? `deal-${i}`,
          title: (d.title as string) ?? "",
          type: (d.deal_type as string) ?? "Discount",
          tier: (d.deal_tier as string) ?? "All",
          status: (d.is_active as boolean) ? "Active" : "Draft",
          redemption: `${(d.discount_value as string) ?? "0"} value`,
          note: (d.description as string) ?? "",
        }))
      : [];

    // ── 2I: Availability ──
    const trimTime = (t: string) => t?.replace(/:00$/, "") ?? t; // "19:00:00" → "19:00"
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyGrid = availability.length > 0
      ? dayNames.map((day, i) => {
          const daySlots = availability.filter(
            (a) => (a.day_of_week as number) === i,
          );
          return {
            day,
            blocks: daySlots.length > 0
              ? daySlots.map(
                  (s) =>
                    `${trimTime((s.start_time as string) ?? "?")}-${trimTime((s.end_time as string) ?? "?")} ${(s.notes as string) ?? "Open"}`,
                )
              : ["No slots set"],
          };
        })
      : dayNames.map((day) => ({ day, blocks: ["No slots set"] }));

    const mappedAvailability = {
      recurring: availability.length > 0
        ? availability
            .filter((a) => a.is_recurring)
            .map(
              (a) =>
                `${dayNames[(a.day_of_week as number) ?? 0]} ${trimTime((a.start_time as string) ?? "")}-${trimTime((a.end_time as string) ?? "")} ${(a.notes as string) ?? ""}`.trim(),
            )
        : [],
      exceptions: [],
      weeklyGrid,
    };

    // ── 2J: Analytics (computed from real data) ──
    const confirmedBookings = bookings.filter(
      (b: Record<string, unknown>) => b.status === "accepted" || b.status === "completed",
    ).length;
    const uniqueOrganizers = new Set(
      bookings
        .filter((b: Record<string, unknown>) => b.status === "accepted" || b.status === "completed")
        .map((b: Record<string, unknown>) => b.organizer_id as string),
    ).size;

    const eventTypeCounts: Record<string, number> = {};
    for (const e of events) {
      const catObj = e.categories as unknown as Record<string, unknown> | null;
      const cat = (catObj?.name_en as string) ?? "Other";
      eventTypeCounts[cat] = (eventTypeCounts[cat] ?? 0) + 1;
    }

    const analytics = {
      funnel: [
        { label: "Profile views", value: 0 },
        { label: "Booking inquiries", value: bookings.length },
        { label: "Confirmed bookings", value: confirmedBookings },
        { label: "Repeat organizers", value: uniqueOrganizers },
        { label: "Public reviews", value: reviews.length },
      ],
      eventTypes: Object.entries(eventTypeCounts).map(([label, value]) => ({
        label,
        value,
      })),
      topReferrers: [] as Array<{ label: string; value: number }>,
    };

    // ── 2K: Profile sections from venue data ──
    const venueObj = venueRow as Record<string, unknown>;
    const amenities = Array.isArray(venueObj.amenities)
      ? (venueObj.amenities as string[])
      : [];
    const hours = Array.isArray(venueObj.hours)
      ? (venueObj.hours as Array<{ day: string; open: string }>)
      : [];

    const profileSections = [
      {
        key: "general",
        title: "General info",
        items: [
          { label: "Public summary", value: (venueObj.summary as string) ?? (venueObj.description as string) ?? "" },
          { label: "Address", value: (venueObj.address as string) ?? "" },
          { label: "Capacity", value: (() => {
            const total = (venueObj.capacity_total as number | null) ?? (venueObj.capacity as number | null);
            const standing = (venueObj.capacity_standing as number | null);
            const seated = (venueObj.capacity_seated as number | null);
            if (total) return `${total} total${seated ? ` (${seated} seated)` : ""}${standing ? ` / ${standing} standing` : ""}`;
            if (standing && seated) return `${seated} seated / ${standing} standing`;
            if (standing) return `${standing} standing`;
            if (seated) return `${seated} seated`;
            return "Not specified";
          })() },
        ],
      },
      {
        key: "amenities",
        title: "Amenities",
        items: amenities.map((a) => ({ label: a, value: "Included" })),
      },
      {
        key: "hours",
        title: "Hours",
        items: hours.map((h) => ({ label: h.day, value: h.open })),
      },
      {
        key: "socials",
        title: "Social links",
        items: [
          { label: "Website", value: (venueObj.website as string) ?? "" },
          { label: "Phone", value: (venueObj.phone as string) ?? "" },
        ].filter((item) => item.value),
      },
    ];

    // ── 2C: Pending count for metrics ──
    const pendingCount = bookings.filter(
      (b: Record<string, unknown>) => b.status === "pending",
    ).length;
    const eventCount = events.length;

    return {
      ...mockVenuePortalData,
      venue: venueRow,
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
      upcomingEvents,
      messages: mappedMessages,
      notifications: mappedNotifications,
      bookings: {
        incoming,
        history,
        guestFit: {
          summary: "Guest behavior data will appear here as bookings are completed.",
          signals: [] as Array<{ key: string; label: string; score: number; note: string }>,
          roomGuidance: [] as string[],
        },
      },
      availability: mappedAvailability,
      deals: mappedDeals.length > 0 ? mappedDeals : [],
      analytics,
      profileSections,
      reviews: mappedReviews,
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

    const [eventsResult, venuesResult, revenue, profileCount, allEventsResult, revenueTrend, usersResult, groupsResult, venuesFullResult, recentTxnsResult, auditLogResult, settingsResult, categoriesResult] = await Promise.all([
      getEvents({ limit: 50 }),
      getVenues({ limit: 50 }),
      getPlatformRevenue(),
      profileCountPromise,
      // Fetch ALL events (any status) for admin events table + calendar
      supabase
        ? supabase
            .from("events")
            .select("id, slug, title, status, starts_at, venue_name, venues:venue_id ( name ), categories:category_id ( name_en )")
            .order("starts_at", { ascending: true })
            .limit(100)
        : Promise.resolve({ data: null }),
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
      // Fetch all profiles for admin users table
      supabase
        ? supabase
            .from("profiles")
            .select("id, slug, display_name, email, account_type, is_verified, is_premium, premium_tier, created_at, last_active_at")
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: null }),
      // Fetch all groups for admin groups table
      supabase
        ? supabase
            .from("groups")
            .select("id, slug, name, member_count, status, organizer:organizer_id ( display_name )")
            .order("member_count", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: null }),
      // Fetch all venues for admin venues table
      supabase
        ? supabase
            .from("venues")
            .select("id, slug, name, address, city, type, avg_rating, status, created_at")
            .order("name", { ascending: true })
            .limit(500)
        : Promise.resolve({ data: null }),
      // Fetch recent transactions for admin revenue page
      supabase
        ? supabase
            .from("transactions")
            .select("id, type, description, amount_isk, status, created_at")
            .order("created_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: null }),
      // Fetch audit log entries
      supabase
        ? supabase
            .from("admin_audit_log")
            .select("id, admin_id, action, target_type, target_id, details, created_at")
            .order("created_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: null }),
      // Fetch platform settings
      supabase
        ? supabase.from("platform_settings").select("key, value, updated_at")
        : Promise.resolve({ data: null }),
      // Fetch categories for category mix chart
      supabase
        ? supabase.from("categories").select("id, name_en, slug").eq("is_active", true).order("sort_order")
        : Promise.resolve({ data: null }),
    ]);

    // ── Build admin events table from real data ──
    const allEvents = (allEventsResult?.data ?? []) as Array<Record<string, unknown>>;

    function formatAdminStatus(status: string): string {
      if (status === "published") return "Approved";
      if (status === "draft") return "Pending Review";
      if (status === "cancelled") return "Cancelled";
      if (status === "completed") return "Completed";
      return status;
    }

    const eventsTable = allEvents.map((e) => {
      const venue = e.venues as Record<string, unknown> | null;
      const cat = e.categories as Record<string, unknown> | null;
      const startsAt = new Date(e.starts_at as string);
      const day = startsAt.getDate();
      const month = startsAt.toLocaleString("en", { month: "short" });
      return {
        key: e.slug as string,
        title: e.title as string,
        status: formatAdminStatus(e.status as string),
        category: (cat?.name_en as string) ?? "",
        venue: (venue?.name as string) ?? (e.venue_name as string) ?? "",
        date: `${day} ${month}`,
        action: "",
      };
    });

    // Calendar entries from real events (current month)
    const now = new Date();
    const calendarEntries = allEvents
      .filter((e) => {
        const d = new Date(e.starts_at as string);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .map((e) => ({
        day: String(new Date(e.starts_at as string).getDate()),
        label: e.title as string,
      }));

    // ── Build admin users table from real profiles ──
    const allUsers = (usersResult?.data ?? []) as Array<Record<string, unknown>>;
    function formatAccountType(t: string): string {
      if (t === "organizer") return "Organizer";
      if (t === "venue") return "Venue";
      if (t === "admin") return "Admin";
      return "User";
    }
    function deriveUserStatus(u: Record<string, unknown>): string {
      if (u.is_verified) return "Verified";
      return "Active";
    }
    function timeAgo(dateStr: string | null): string {
      if (!dateStr) return "Never";
      const diff = Date.now() - new Date(dateStr).getTime();
      if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))} min ago`;
      if (diff < 86400000) return `${Math.round(diff / 3600000)} h ago`;
      if (diff < 172800000) return "Yesterday";
      return new Date(dateStr).toLocaleDateString("en", { month: "short", year: "numeric" });
    }
    function deriveTier(u: Record<string, unknown>): string {
      if (u.premium_tier) return String(u.premium_tier).charAt(0).toUpperCase() + String(u.premium_tier).slice(1);
      if (u.is_premium) return "Premium";
      return "Free";
    }
    // Deduplicate by key (slug or id) to prevent duplicate entries
    const seenUserKeys = new Set<string>();
    const usersTable = allUsers
      .map((u) => ({
        key: (u.slug as string) ?? (u.id as string),
        name: (u.display_name as string) ?? "Unknown",
        email: (u.email as string) ?? "",
        type: formatAccountType((u.account_type as string) ?? "member"),
        status: deriveUserStatus(u),
        joined: new Date(u.created_at as string).toLocaleDateString("en", { month: "short", year: "numeric" }),
        lastActive: timeAgo(u.last_active_at as string | null),
        groups: "—",
        events: "—",
        plan: deriveTier(u),
      }))
      .filter((u) => {
        if (seenUserKeys.has(u.key)) return false;
        seenUserKeys.add(u.key);
        return true;
      });

    // ── Build admin groups table from real data ──
    const allGroups = (groupsResult?.data ?? []) as Array<Record<string, unknown>>;
    const groupsTable = allGroups.map((g) => {
      const org = g.organizer as Record<string, unknown> | null;
      return {
        key: (g.slug as string) ?? (g.id as string),
        name: g.name as string,
        members: (g.member_count as number) ?? 0,
        status: ((g.status as string) ?? "active").charAt(0).toUpperCase() + ((g.status as string) ?? "active").slice(1),
        health: "Healthy",
        action: "",
      };
    });

    // ── Build admin venues table from real data ──
    const allVenues = (venuesFullResult?.data ?? []) as Array<Record<string, unknown>>;
    const venuesActive = allVenues.map((v) => ({
      key: (v.slug as string) ?? (v.id as string),
      name: v.name as string,
      area: (v.address as string) ?? (v.city as string) ?? "",
      type: (v.type as string) ?? "",
      rating: (v.avg_rating as number) ?? 0,
      note: "",
    }));

    // ── Build admin revenue transactions from real data ──
    const allTxns = (recentTxnsResult?.data ?? []) as Array<Record<string, unknown>>;
    const revenueTransactions = allTxns.map((t) => {
      const createdAt = new Date(t.created_at as string);
      const diffMs = Date.now() - createdAt.getTime();
      const when = diffMs < 86400000
        ? `Today ${createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`
        : diffMs < 172800000
          ? "Yesterday"
          : createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        key: t.id as string,
        source: (t.description as string) ?? (t.type as string) ?? "Unknown",
        amount: `${((t.amount_isk as number) ?? 0).toLocaleString()} ISK`,
        status: ((t.status as string) ?? "pending").charAt(0).toUpperCase() + ((t.status as string) ?? "pending").slice(1),
        when,
      };
    });

    // ── Build audit log from real data ──
    const auditEntries = (auditLogResult?.data ?? []) as Array<Record<string, unknown>>;
    const auditLog = auditEntries.map((a) => ({
      key: a.id as string,
      admin: "Platform Admin",
      action: ((a.action as string) ?? "").replace(/_/g, " "),
      targetType: (a.target_type as string) ?? "unknown",
      targetId: (a.target_id as string) ?? "",
      details: typeof a.details === "object" && a.details ? JSON.stringify(a.details) : String(a.details ?? ""),
      timestamp: a.created_at as string,
    }));

    // ── Build settings from platform_settings ──
    const settingsRows = (settingsResult?.data ?? []) as Array<Record<string, unknown>>;
    const settingsMap = new Map<string, Array<{ label: string; value: string }>>();
    for (const row of settingsRows) {
      const items = row.value as Array<{ label: string; value: string }> | null;
      if (items && Array.isArray(items)) {
        settingsMap.set(row.key as string, items);
      }
    }
    const settingsSections = settingsMap.size > 0
      ? Array.from(settingsMap.entries()).map(([key, items]) => ({
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          items,
        }))
      : null;

    // ── Build category mix chart from real events ──
    const allCategories = (categoriesResult?.data ?? []) as Array<Record<string, unknown>>;
    const catEventCounts = new Map<string, number>();
    for (const e of allEvents) {
      const cat = e.categories as Record<string, unknown> | null;
      const catName = (cat?.name_en as string) ?? "Uncategorized";
      catEventCounts.set(catName, (catEventCounts.get(catName) ?? 0) + 1);
    }
    const categoryMix = allCategories
      .map((c) => ({ label: c.name_en as string, value: catEventCounts.get(c.name_en as string) ?? 0 }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // ── Build growth chart from profile signups (last 6 months) ──
    const growthChart: Array<{ label: string; value: number }> = [];
    const allProfiles = (usersResult?.data ?? []) as Array<Record<string, unknown>>;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = new Map<string, number>();
    for (const p of allProfiles) {
      const d = new Date(p.created_at as string);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    // Build cumulative growth for last 6 months
    const now2 = new Date();
    let cumulative = 0;
    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
      monthKeys.push(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`);
    }
    // Count profiles before the first month as baseline
    for (const p of allProfiles) {
      const d = new Date(p.created_at as string);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (key < monthKeys[0]) cumulative++;
    }
    for (const mk of monthKeys) {
      cumulative += monthCounts.get(mk) ?? 0;
      const [, m] = mk.split("-");
      growthChart.push({ label: monthNames[parseInt(m, 10)], value: cumulative });
    }

    // ── Build urgent queues from real counts ──
    const pendingVenueCount = allVenues.filter((v) => (v.status as string) === "pending").length;
    const draftEventCount = allEvents.filter((e) => (e.status as string) === "draft").length;
    const pendingBookingCount = 0; // TODO: compute from bookings if needed
    const urgentQueues: Array<{ key: string; title: string; detail: string; meta: string; tone: "coral" | "basalt" | "indigo" | "sage" | "sand" | "neutral" }> = [];
    if (pendingVenueCount > 0) {
      urgentQueues.push({
        key: "venue-review",
        title: `${pendingVenueCount} venue application${pendingVenueCount > 1 ? "s" : ""} need${pendingVenueCount === 1 ? "s" : ""} a decision`,
        detail: "Review pending venue partner applications.",
        meta: "Admin queue",
        tone: "coral",
      });
    }
    if (draftEventCount > 0) {
      urgentQueues.push({
        key: "event-review",
        title: `${draftEventCount} event${draftEventCount > 1 ? "s" : ""} pending review`,
        detail: "Draft events submitted by organizers or venues awaiting approval.",
        meta: "Events",
        tone: "basalt",
      });
    }
    if (auditEntries.length > 0) {
      urgentQueues.push({
        key: "audit",
        title: `${auditEntries.length} recent admin action${auditEntries.length > 1 ? "s" : ""} logged`,
        detail: "Review the latest administrative changes on the platform.",
        meta: "Audit",
        tone: "indigo",
      });
    }

    // ── Build audience picker from real profiles and events ──
    const upcomingPublished = allEvents.filter((e) => {
      const startsAt = new Date(e.starts_at as string);
      return (e.status as string) === "published" && startsAt > new Date();
    });
    const pickerEvent = upcomingPublished[0];
    const memberProfiles = allProfiles.filter((p) => (p.account_type as string) !== "venue" && (p.account_type as string) !== "admin");
    const audiencePickerData = pickerEvent ? {
      eventTitle: pickerEvent.title as string,
      eventSlug: pickerEvent.slug as string,
      target: `Curated admin invitations for ${pickerEvent.title as string}`,
      seatsRemaining: Math.max(0, ((pickerEvent as Record<string, unknown>).attendee_limit as number ?? 50) - ((pickerEvent as Record<string, unknown>).rsvp_count as number ?? 0)),
      selectedIds: [] as string[],
      candidates: memberProfiles.slice(0, 8).map((p, i) => ({
        id: p.id as string,
        name: (p.display_name as string) ?? "Unknown",
        tier: (() => { const t = (p.premium_tier as string | null) ?? "free"; return t.charAt(0).toUpperCase() + t.slice(1); })(),
        status: p.is_verified ? "Verified member" : "Active",
        fitScore: 95 - (i * 5),
        lastActive: timeAgo(p.last_active_at as string | null),
        tags: ((p.interests as string[]) ?? []).slice(0, 3),
        reason: `Platform member${p.is_verified ? " with verified status" : ""}.`,
      })),
    } : null;

    // ── Build revenue sources from transaction types ──
    const txnTypeTotals = new Map<string, number>();
    let txnGrandTotal = 0;
    for (const t of allTxns) {
      const type = (t.type as string) ?? "other";
      const amount = (t.amount_isk as number) ?? 0;
      txnTypeTotals.set(type, (txnTypeTotals.get(type) ?? 0) + amount);
      txnGrandTotal += amount;
    }
    const typeLabels: Record<string, string> = {
      ticket: "Ticket commission",
      ticket_commission: "Ticket commission",
      subscription: "Organizer SaaS",
      organizer_saas: "Organizer SaaS",
      venue_subscription: "Venue SaaS",
      venue_partnership: "Venue partnership",
      promoted: "Promoted listings",
      payout: "Payout",
      refund: "Refund",
    };
    const revenueSources = txnGrandTotal > 0
      ? Array.from(txnTypeTotals.entries())
          .map(([type, total]) => ({
            label: typeLabels[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            value: Math.round((total / txnGrandTotal) * 100),
          }))
          .sort((a, b) => b.value - a.value)
      : null;

    // ── Build handoff log from recent audit entries ──
    const handoffLog = auditEntries.slice(0, 5).map((a, i) => {
      const action = (a.action as string) ?? "";
      const targetType = (a.target_type as string) ?? "unknown";
      const lane = /venue/i.test(targetType) ? "Supply"
        : /event/i.test(targetType) ? "Growth"
        : /user/i.test(targetType) ? "Trust"
        : /group/i.test(targetType) ? "Growth"
        : "Revenue";
      const createdAt = new Date(a.created_at as string);
      const diffMs = Date.now() - createdAt.getTime();
      const when = diffMs < 3600000 ? `${Math.max(1, Math.round(diffMs / 60000))} min ago`
        : diffMs < 86400000 ? `Today ${createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`
        : diffMs < 172800000 ? "Yesterday"
        : createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        key: (a.id as string) ?? `handoff-${i}`,
        lane,
        actor: "Admin",
        when,
        summary: `${action.replace(/_/g, " ")} on ${targetType} ${((a.target_id as string) ?? "").slice(0, 8)}…`,
      };
    });

    // ── Build ops inbox from pending items ──
    const opsInbox: Array<{ key: string; lane: string; title: string; owner: string; due: string; status: string; note: string }> = [];
    if (pendingVenueCount > 0) {
      opsInbox.push({
        key: "ops-venues",
        lane: "Supply",
        title: `Approve ${pendingVenueCount} pending venue application${pendingVenueCount > 1 ? "s" : ""}`,
        owner: "Venue ops",
        due: "Today",
        status: "Queued",
        note: `${pendingVenueCount} venue partner application${pendingVenueCount > 1 ? "s" : ""} awaiting review.`,
      });
    }
    if (draftEventCount > 0) {
      opsInbox.push({
        key: "ops-events",
        lane: "Growth",
        title: `Review ${draftEventCount} draft event${draftEventCount > 1 ? "s" : ""} before publishing`,
        owner: "Editorial",
        due: "Today",
        status: "Needs decision",
        note: `${draftEventCount} event${draftEventCount > 1 ? "s" : ""} submitted by organizers awaiting approval.`,
      });
    }
    // Note: events don't have a "flagged" status in the DB schema.
    // Use the content_reports table count instead (if available), or skip.
    const unresolvedReportCount = 0; // TODO: query content_reports table when available
    if (unresolvedReportCount > 0) {
      opsInbox.push({
        key: "ops-trust",
        lane: "Trust",
        title: `Resolve ${unresolvedReportCount} flagged content item${unresolvedReportCount > 1 ? "s" : ""}`,
        owner: "Moderation",
        due: "Today",
        status: "Escalated",
        note: `${unresolvedReportCount} flagged item${unresolvedReportCount > 1 ? "s" : ""} need moderation review.`,
      });
    }
    if (txnGrandTotal > 0) {
      opsInbox.push({
        key: "ops-revenue",
        lane: "Revenue",
        title: "Review recent transaction activity",
        owner: "Finance",
        due: "Today",
        status: "In progress",
        note: `${allTxns.length} transaction${allTxns.length > 1 ? "s" : ""} totalling ${txnGrandTotal.toLocaleString()} ISK.`,
      });
    }

    // ── Build incident console from system health signals ──
    const incidentConsole: Array<{ key: string; title: string; severity: string; owner: string; status: string; note: string }> = [];
    if (pendingVenueCount > 2) {
      incidentConsole.push({
        key: "inc-venue-backlog",
        title: "Venue application backlog growing",
        severity: "Medium",
        owner: "Venue ops",
        status: "Investigating",
        note: `${pendingVenueCount} pending applications may be blocking event placement options.`,
      });
    }
    if (draftEventCount > 5) {
      incidentConsole.push({
        key: "inc-event-backlog",
        title: "Event review queue above target",
        severity: "Medium",
        owner: "Editorial",
        status: "Queued",
        note: `${draftEventCount} draft events waiting for review may delay organizer confidence.`,
      });
    }
    // If no real incidents, show healthy status
    if (incidentConsole.length === 0) {
      incidentConsole.push({
        key: "inc-healthy",
        title: "All systems operational",
        severity: "Low",
        owner: "Platform ops",
        status: "Healthy",
        note: "No active incidents or degraded services detected.",
      });
    }

    // ── Build ownership board from real workstream data ──
    const ownershipBoard = [
      {
        key: "owner-revenue",
        lane: "Revenue",
        lead: "Finance",
        coverage: `${allTxns.length} transactions, ${txnGrandTotal.toLocaleString()} ISK total`,
        load: txnGrandTotal > 100000 ? "High" : "Medium",
      },
      {
        key: "owner-supply",
        lane: "Supply",
        lead: "Venue ops",
        coverage: `${allVenues.length} venues, ${pendingVenueCount} pending approval`,
        load: pendingVenueCount > 2 ? "High" : "Medium",
      },
      {
        key: "owner-growth",
        lane: "Growth",
        lead: "Editorial",
        coverage: `${allEvents.length} events, ${draftEventCount} drafts pending`,
        load: draftEventCount > 5 ? "High" : "Medium",
      },
      {
        key: "owner-trust",
        lane: "Trust",
        lead: "Moderation",
        coverage: `${auditEntries.length} audit entries, ${allProfiles.length} users`,
        load: auditEntries.length > 10 ? "High" : "Medium",
      },
    ];

    // ── Build analytics deck from real time-series data ──
    // Build weekly data points from events for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const dayLabels = last7Days.map((d) => d.toLocaleDateString("en", { weekday: "short" }));

    // User signups by day
    const userGrowthData = last7Days.map((d) => {
      return allProfiles.filter((p) => {
        const pd = new Date(p.created_at as string);
        return pd.toDateString() === d.toDateString();
      }).length;
    });
    // Cumulative users
    const cumulativeUsers = last7Days.map((d) => {
      return allProfiles.filter((p) => new Date(p.created_at as string) <= d).length;
    });
    // Events created by day
    const eventCreationData = last7Days.map((d) => {
      return allEvents.filter((e) => {
        const ed = new Date(e.created_at as string);
        return ed.toDateString() === d.toDateString();
      }).length;
    });
    // Revenue by day
    const revenueByDay = last7Days.map((d) => {
      return allTxns.filter((t) => {
        const td = new Date(t.created_at as string);
        return td.toDateString() === d.toDateString();
      }).reduce((sum, t) => sum + ((t.amount_isk as number) ?? 0), 0);
    });
    // Venue count over time (cumulative)
    const venueGrowth = last7Days.map((d) => {
      return allVenues.filter((v) => new Date(v.created_at as string) <= d).length;
    });

    const analyticsDeck = [
      { key: "a1", title: "User growth", tone: "indigo" as const, data: cumulativeUsers },
      { key: "a2", title: "New signups", tone: "sage" as const, data: userGrowthData },
      { key: "a3", title: "Total events", tone: "coral" as const, data: last7Days.map((d) => allEvents.filter((e) => new Date(e.created_at as string) <= d).length) },
      { key: "a4", title: "Active venues", tone: "basalt" as const, data: venueGrowth },
      { key: "a5", title: "Event creation", tone: "indigo" as const, data: eventCreationData },
      { key: "a6", title: "Revenue trend", tone: "sage" as const, data: revenueByDay },
      { key: "a7", title: "Category spread", tone: "coral" as const, data: [catEventCounts.size, catEventCounts.size, catEventCounts.size, catEventCounts.size, catEventCounts.size, catEventCounts.size, catEventCounts.size] },
      { key: "a8", title: "Audit actions", tone: "indigo" as const, data: last7Days.map((d) => auditEntries.filter((a) => new Date(a.created_at as string).toDateString() === d.toDateString()).length) },
      { key: "a9", title: "Transactions", tone: "sage" as const, data: last7Days.map((d) => allTxns.filter((t) => new Date(t.created_at as string).toDateString() === d.toDateString()).length) },
      { key: "a10", title: "Venue rating avg", tone: "basalt" as const, data: venueGrowth.map(() => {
        const rated = allVenues.filter((v) => (v.avg_rating as number) > 0);
        return rated.length > 0 ? Math.round(rated.reduce((s, v) => s + ((v.avg_rating as number) ?? 0), 0) / rated.length * 10) : 0;
      }) },
      { key: "a11", title: "Revenue mix", tone: "coral" as const, data: revenueByDay.map((_, i) => revenueByDay.slice(0, i + 1).reduce((s, v) => s + v, 0)) },
      { key: "a12", title: "Groups", tone: "indigo" as const, data: last7Days.map((d) => allGroups.filter((g) => new Date(g.created_at as string) <= d).length) },
    ];

    // ── Build heat grid from event start times ──
    const heatCounts: number[][] = [
      [0, 0, 0, 0, 0, 0, 0], // Morning (6-12)
      [0, 0, 0, 0, 0, 0, 0], // Afternoon (12-17)
      [0, 0, 0, 0, 0, 0, 0], // Evening (17-22)
      [0, 0, 0, 0, 0, 0, 0], // Late (22-6)
    ];
    for (const e of allEvents) {
      const d = new Date(e.starts_at as string);
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
      const hour = d.getHours();
      const slot = hour >= 6 && hour < 12 ? 0 : hour >= 12 && hour < 17 ? 1 : hour >= 17 && hour < 22 ? 2 : 3;
      heatCounts[slot][dayIdx]++;
    }
    const heatGrid = {
      columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      rows: [
        { label: "Morning", values: heatCounts[0] },
        { label: "Afternoon", values: heatCounts[1] },
        { label: "Evening", values: heatCounts[2] },
        { label: "Late", values: heatCounts[3] },
      ],
    };

    // ── Build geography from venue addresses ──
    const addressCounts = new Map<string, number>();
    for (const v of allVenues) {
      const addr = (v.address as string) ?? "";
      // Try to extract neighborhood/area from address
      const area = addr.includes("101") ? "101 Reykjavik"
        : addr.includes("Vesturbær") || addr.includes("vesturbær") ? "Vesturbær"
        : addr.includes("Laugardalur") || addr.includes("laugardalur") ? "Laugardalur"
        : addr.includes("Kópavogur") || addr.includes("kópavogur") ? "Kópavogur"
        : addr ? addr.split(",").pop()?.trim() ?? "Reykjavik"
        : "Reykjavik";
      addressCounts.set(area, (addressCounts.get(area) ?? 0) + 1);
    }
    const totalVenueGeo = Array.from(addressCounts.values()).reduce((s, v) => s + v, 0) || 1;
    const geography = Array.from(addressCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        value: `${Math.round((count / totalVenueGeo) * 100)}%`,
      }));

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
          value: String(allVenues.filter((v) => ["active", "approved"].includes((v.status as string) ?? "")).length),
          delta: `${allVenues.length} total`,
          detail: "Venues currently in the partner network.",
        },
        {
          label: "Revenue",
          value: `${revenue.total_isk.toLocaleString()} ISK`,
          delta: "All time",
          detail: "Total platform revenue.",
        },
        {
          label: "Pending queues",
          value: String(pendingVenueCount + draftEventCount),
          delta: pendingVenueCount + draftEventCount > 0 ? "Needs triage" : "Clear",
          detail: `${pendingVenueCount} venue application${pendingVenueCount !== 1 ? "s" : ""} and ${draftEventCount} draft event${draftEventCount !== 1 ? "s" : ""} awaiting review.`,
        },
        {
          label: "System health",
          value: "Operational",
          delta: "All checks passing",
          detail: "Platform systems are running normally.",
        },
      ],
      users: usersTable,
      events: {
        ...mockAdminPortalData.events,
        table: eventsTable,
        calendar: calendarEntries,
        ...(audiencePickerData ? { audiencePicker: audiencePickerData } : {}),
      },
      groups: {
        ...mockAdminPortalData.groups,
        table: groupsTable,
      },
      venues: {
        ...mockAdminPortalData.venues,
        active: venuesActive,
      },
      revenue: {
        ...mockAdminPortalData.revenue,
        transactions: revenueTransactions,
        ...(revenueSources ? { sources: revenueSources } : {}),
      },
      ...(revenueTrend ? { revenueTrend } : {}),
      // Overview sections
      ...(urgentQueues.length > 0 ? { urgentQueues } : {}),
      ...(growthChart.length > 0 ? { growthChart } : {}),
      ...(categoryMix.length > 0 ? { categoryMix } : {}),
      // Settings from platform_settings + operational data
      ...(settingsSections ? { settings: settingsSections } : {}),
      ...(incidentConsole.length > 0 ? { incidentConsole } : {}),
      ...(ownershipBoard.length > 0 ? { ownershipBoard } : {}),
      // Overview operational sections
      ...(handoffLog.length > 0 ? { handoffLog } : {}),
      ...(opsInbox.length > 0 ? { opsInbox } : {}),
      // Analytics sections
      analyticsDeck,
      heatGrid,
      ...(geography.length > 0 ? { geography } : {}),
    } as AdminPortalData;
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    return mockAdminPortalData;
  }
}

/**
 * Standalone audit log fetcher for the audit screen.
 * Returns entries matching the shape expected by AdminAuditScreen.
 */
export async function getAdminAuditLog() {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("id, admin_id, action, target_type, target_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data.map((a) => ({
      key: a.id as string,
      admin: "Platform Admin",
      action: (a.action as string) ?? "",
      targetType: (a.target_type as string) ?? "unknown",
      targetId: (a.target_id as string) ?? "",
      details: typeof a.details === "object" && a.details
        ? Object.entries(a.details as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join(", ")
        : String(a.details ?? ""),
      timestamp: a.created_at as string,
    }));
  } catch {
    return [];
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

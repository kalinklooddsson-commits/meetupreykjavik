export type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiSpecRoute = {
  category: string;
  method: ApiMethod;
  pattern: string;
  description: string;
  implementation: "mock" | "scaffold";
};

export type ApiRouteMatch = {
  route: ApiSpecRoute;
  params: Record<string, string>;
};

export const apiSpecRoutes: ApiSpecRoute[] = [
  { category: "auth", method: "POST", pattern: "/api/auth/signup", description: "Create account via Supabase Auth.", implementation: "scaffold" },
  { category: "auth", method: "POST", pattern: "/api/auth/login", description: "Sign in and redirect by account type.", implementation: "scaffold" },
  { category: "auth", method: "POST", pattern: "/api/auth/logout", description: "Sign out and clear the session.", implementation: "scaffold" },
  { category: "auth", method: "POST", pattern: "/api/auth/forgot-password", description: "Send password reset email.", implementation: "scaffold" },
  { category: "auth", method: "POST", pattern: "/api/auth/reset-password", description: "Set a new password from a reset token.", implementation: "scaffold" },
  { category: "auth", method: "GET", pattern: "/api/auth/me", description: "Return current session and account type.", implementation: "mock" },

  { category: "auth", method: "POST", pattern: "/api/onboarding/complete", description: "Persist onboarding preferences to user profile.", implementation: "scaffold" },

  { category: "users", method: "GET", pattern: "/api/users", description: "List users with filters.", implementation: "scaffold" },
  { category: "users", method: "GET", pattern: "/api/users/[id]", description: "Get a single user profile.", implementation: "mock" },
  { category: "users", method: "PATCH", pattern: "/api/users/[id]", description: "Update a profile.", implementation: "scaffold" },
  { category: "users", method: "PATCH", pattern: "/api/profile", description: "Update the current user's profile.", implementation: "scaffold" },
  { category: "users", method: "DELETE", pattern: "/api/users/[id]", description: "Delete an account.", implementation: "scaffold" },
  { category: "users", method: "PATCH", pattern: "/api/users/[id]/type", description: "Change account type.", implementation: "scaffold" },
  { category: "users", method: "PATCH", pattern: "/api/users/[id]/status", description: "Suspend, activate, or ban a user.", implementation: "scaffold" },

  { category: "groups", method: "GET", pattern: "/api/groups", description: "List groups with filters.", implementation: "mock" },
  { category: "groups", method: "POST", pattern: "/api/groups", description: "Create a group.", implementation: "scaffold" },
  { category: "groups", method: "GET", pattern: "/api/groups/[slug]", description: "Get a group detail view.", implementation: "mock" },
  { category: "groups", method: "PATCH", pattern: "/api/groups/[slug]", description: "Update a group.", implementation: "scaffold" },
  { category: "groups", method: "DELETE", pattern: "/api/groups/[slug]", description: "Delete a group.", implementation: "scaffold" },
  { category: "groups", method: "POST", pattern: "/api/groups/[slug]/join", description: "Join a group.", implementation: "scaffold" },
  { category: "groups", method: "POST", pattern: "/api/groups/[slug]/leave", description: "Leave a group.", implementation: "scaffold" },
  { category: "groups", method: "GET", pattern: "/api/groups/[slug]/members", description: "List group members.", implementation: "scaffold" },
  { category: "groups", method: "PATCH", pattern: "/api/groups/[slug]/members/[userId]", description: "Change a member role or status.", implementation: "scaffold" },
  { category: "groups", method: "POST", pattern: "/api/groups/[slug]/block/[userId]", description: "Block a user from a group.", implementation: "scaffold" },

  { category: "events", method: "GET", pattern: "/api/events", description: "List events with filters.", implementation: "mock" },
  { category: "events", method: "POST", pattern: "/api/events", description: "Create an event.", implementation: "scaffold" },
  { category: "events", method: "GET", pattern: "/api/events/[slug]", description: "Get full event detail.", implementation: "mock" },
  { category: "events", method: "PATCH", pattern: "/api/events/[slug]", description: "Update an event.", implementation: "scaffold" },
  { category: "events", method: "DELETE", pattern: "/api/events/[slug]", description: "Delete or cancel an event.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/rsvp", description: "Create an RSVP.", implementation: "scaffold" },
  { category: "events", method: "DELETE", pattern: "/api/events/[slug]/rsvp", description: "Cancel an RSVP.", implementation: "scaffold" },
  { category: "events", method: "PATCH", pattern: "/api/events/[slug]/rsvp/[userId]/approve", description: "Approve an RSVP.", implementation: "scaffold" },
  { category: "events", method: "PATCH", pattern: "/api/events/[slug]/rsvp/[userId]/reject", description: "Reject an RSVP.", implementation: "scaffold" },
  { category: "events", method: "DELETE", pattern: "/api/events/[slug]/rsvp/[userId]", description: "Remove an attendee.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/rsvp/override", description: "Admin override RSVP.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/invite", description: "Invite specific users.", implementation: "scaffold" },
  { category: "events", method: "GET", pattern: "/api/events/[slug]/attendees", description: "List event attendees.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/checkin/[userId]", description: "Check a user in.", implementation: "scaffold" },
  { category: "events", method: "GET", pattern: "/api/events/[slug]/comments", description: "List threaded comments.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/comments", description: "Add an event comment.", implementation: "scaffold" },
  { category: "events", method: "POST", pattern: "/api/events/[slug]/rate", description: "Rate an event.", implementation: "scaffold" },

  { category: "blocking", method: "POST", pattern: "/api/users/[id]/block", description: "Block a user from a scope.", implementation: "scaffold" },
  { category: "blocking", method: "DELETE", pattern: "/api/users/[id]/block", description: "Unblock a user.", implementation: "scaffold" },
  { category: "blocking", method: "GET", pattern: "/api/admin/blocked", description: "List blocked users.", implementation: "scaffold" },
  { category: "blocking", method: "POST", pattern: "/api/venues/[slug]/block/[userId]", description: "Block a user from a venue.", implementation: "scaffold" },

  { category: "venues", method: "GET", pattern: "/api/venues", description: "List venues with filters.", implementation: "mock" },
  { category: "venues", method: "POST", pattern: "/api/venues", description: "Create a venue application.", implementation: "scaffold" },
  { category: "venues", method: "GET", pattern: "/api/venues/[slug]", description: "Get full venue detail.", implementation: "mock" },
  { category: "venues", method: "PATCH", pattern: "/api/venues/[slug]", description: "Update a venue.", implementation: "scaffold" },
  { category: "venues", method: "GET", pattern: "/api/venues/[slug]/availability", description: "Get venue availability.", implementation: "scaffold" },
  { category: "venues", method: "POST", pattern: "/api/venues/[slug]/availability", description: "Set venue availability.", implementation: "scaffold" },
  { category: "venues", method: "PATCH", pattern: "/api/venues/availability", description: "Update venue availability (owner, session-inferred).", implementation: "scaffold" },
  { category: "venues", method: "GET", pattern: "/api/venues/[slug]/deals", description: "List active deals.", implementation: "scaffold" },
  { category: "venues", method: "POST", pattern: "/api/venues/[slug]/deals", description: "Create a deal.", implementation: "scaffold" },
  { category: "venues", method: "POST", pattern: "/api/venues/deals", description: "Create a deal (owner, session-inferred).", implementation: "scaffold" },
  { category: "venues", method: "PATCH", pattern: "/api/deals/[id]", description: "Update a deal.", implementation: "scaffold" },
  { category: "venues", method: "DELETE", pattern: "/api/deals/[id]", description: "Delete a deal.", implementation: "scaffold" },
  { category: "venues", method: "GET", pattern: "/api/venues/[slug]/reviews", description: "List venue reviews.", implementation: "scaffold" },
  { category: "venues", method: "POST", pattern: "/api/venues/[slug]/reviews", description: "Create a venue review.", implementation: "scaffold" },

  { category: "bookings", method: "POST", pattern: "/api/bookings", description: "Create a booking request.", implementation: "scaffold" },
  { category: "bookings", method: "GET", pattern: "/api/bookings", description: "List bookings.", implementation: "scaffold" },
  { category: "bookings", method: "PATCH", pattern: "/api/bookings/[id]", description: "Update a booking status.", implementation: "scaffold" },

  { category: "admin", method: "GET", pattern: "/api/admin/stats", description: "Platform stats summary.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/analytics/[type]", description: "Analytics data by type.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/transactions", description: "List transactions for admins.", implementation: "scaffold" },
  { category: "admin", method: "PATCH", pattern: "/api/admin/events/[id]/feature", description: "Toggle event featured status.", implementation: "scaffold" },
  { category: "admin", method: "PATCH", pattern: "/api/admin/groups/[id]/approve", description: "Approve or reject a group.", implementation: "scaffold" },
  { category: "admin", method: "PATCH", pattern: "/api/admin/venues/[id]/approve", description: "Approve or reject a venue.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/moderation", description: "Moderation queue.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/announcements", description: "Send an announcement.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/settings", description: "Get platform settings.", implementation: "mock" },
  { category: "admin", method: "PATCH", pattern: "/api/admin/settings", description: "Update platform settings.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/audit-log", description: "List admin audit entries.", implementation: "scaffold" },
  { category: "admin", method: "GET", pattern: "/api/admin/export/[type]", description: "Export CSV data.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/users/action", description: "Perform admin action on a user (role change, verify, suspend, premium toggle).", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/notes", description: "Add or remove admin notes on a client.", implementation: "scaffold" },
  { category: "admin", method: "DELETE", pattern: "/api/admin/notes", description: "Remove an admin note from a client.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/refund", description: "Process an admin refund.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/ops/action", description: "Perform admin ops inbox action.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/incidents/action", description: "Update an incident status.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/venues/action", description: "Perform admin venue action (verify, suspend, approve).", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/moderation/action", description: "Perform moderation action on a report.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/content/action", description: "Update content section or blog post status.", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/comms/send", description: "Send a communication (email, push, announcement).", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/groups/action", description: "Perform admin group action (approve, reject, suspend).", implementation: "scaffold" },
  { category: "admin", method: "POST", pattern: "/api/admin/events/action", description: "Perform admin event action (cancel, feature, suspend).", implementation: "scaffold" },

  { category: "organizer", method: "POST", pattern: "/api/attendees/action", description: "Approve or reject an attendee RSVP.", implementation: "scaffold" },

  { category: "member", method: "PATCH", pattern: "/api/member/settings", description: "Update member account settings.", implementation: "scaffold" },

  { category: "payments", method: "POST", pattern: "/api/payments/subscribe", description: "Start a subscription checkout.", implementation: "scaffold" },
  { category: "payments", method: "POST", pattern: "/api/payments/webhook", description: "Receive PayPal webhooks.", implementation: "scaffold" },
  { category: "payments", method: "POST", pattern: "/api/payments/ticket", description: "Purchase a ticket.", implementation: "scaffold" },
  { category: "payments", method: "POST", pattern: "/api/payments/refund", description: "Refund a payment.", implementation: "scaffold" },

  { category: "notifications", method: "GET", pattern: "/api/notifications", description: "List user notifications.", implementation: "scaffold" },
  { category: "notifications", method: "PATCH", pattern: "/api/notifications/read", description: "Mark notifications as read.", implementation: "scaffold" },
  { category: "messages", method: "GET", pattern: "/api/messages", description: "List message threads.", implementation: "scaffold" },
  { category: "messages", method: "POST", pattern: "/api/messages", description: "Send a message.", implementation: "scaffold" },
  { category: "messages", method: "GET", pattern: "/api/messages/[threadId]", description: "Get a single thread.", implementation: "scaffold" },

  { category: "cron", method: "POST", pattern: "/api/cron/event-reminders", description: "Send reminder emails for upcoming events.", implementation: "scaffold" },
  { category: "cron", method: "POST", pattern: "/api/cron/weekly-digest", description: "Send weekly digests.", implementation: "scaffold" },
  { category: "cron", method: "POST", pattern: "/api/cron/post-event-rating", description: "Send post-event rating requests.", implementation: "scaffold" },
];

function patternToRegex(pattern: string) {
  const paramNames = [...pattern.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]);
  const regexString = `^${pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[([^\]]+)\\\]/g, "([^/]+)")}$`;

  return {
    paramNames,
    regex: new RegExp(regexString),
  };
}

export function findApiSpecRoute(method: ApiMethod, path: string): ApiRouteMatch | null {
  for (const route of apiSpecRoutes) {
    if (route.method !== method) {
      continue;
    }

    const { paramNames, regex } = patternToRegex(route.pattern);
    const match = path.match(regex);

    if (!match) {
      continue;
    }

    const params = paramNames.reduce<Record<string, string>>((accumulator, name, index) => {
      accumulator[name] = match[index + 1] ?? "";
      return accumulator;
    }, {});

    return { route, params };
  }

  return null;
}

export function routeKey(route: ApiSpecRoute) {
  return `${route.method} ${route.pattern}`;
}

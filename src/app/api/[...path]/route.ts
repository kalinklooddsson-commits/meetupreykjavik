import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

import { env, hasLiveSupabaseAuth, hasSupabaseEnv } from "@/lib/env";
import {
  clearMockSessionCookie,
  createMockSessionFromAccount,
  createMockSignupSession,
  findMockAccountByEmail,
  portalPathForRole,
  readMockSessionFromRequest,
  withMockSessionCookie,
} from "@/lib/auth/mock-auth";
import { getOrCreateSessionForSupabaseUser } from "@/lib/auth/session";
import {
  adminPortalData,
  memberPortalData,
  organizerPortalData,
  venuePortalData,
} from "@/lib/dashboard-data";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, signupSchema } from "@/lib/validators/auth";
import {
  eventCommentSchema,
  eventInputSchema,
  eventRatingSchema,
  eventSchema,
  rsvpSchema,
} from "@/lib/validators/events";
import { groupSchema } from "@/lib/validators/groups";
import { profileSchema, onboardingSchema } from "@/lib/validators/profiles";
import {
  bookingRequestSchema,
  venueAvailabilitySchema,
  venueDealSchema,
  venueReviewSchema,
  venueSchema,
} from "@/lib/validators/venues";
import { findApiSpecRoute, routeKey, type ApiMethod } from "@/lib/api/spec-routes";
import { mockAdminSettings, mockCatalog } from "@/lib/api/mock-data";
import {
  publicEvents,
  publicGroups,
  publicVenues,
} from "@/lib/public-data";
import { hasTrustedOrigin } from "@/lib/security/request";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
  AUTH_RATE_LIMIT,
} from "@/lib/security/rate-limit";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  notFoundResponse,
  scaffoldResponse,
  serviceUnavailableResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/responses";
import { forbiddenResponse } from "@/lib/security/response";

// Database layer imports
import { createEvent, updateEvent, deleteEvent, getEvents, getEventBySlug } from "@/lib/db/events";
import { createGroup, getGroups, getGroupBySlug, joinGroup, leaveGroup } from "@/lib/db/groups";
import { createVenue, updateVenue, getVenues, getVenueBySlug } from "@/lib/db/venues";
import { createRsvp, cancelRsvp, getEventRsvps } from "@/lib/db/rsvps";
import { createBooking, getVenueBookings, updateBookingStatus } from "@/lib/db/bookings";
import { updateProfile, getProfileById } from "@/lib/db/profiles";
import { getUserNotifications, markNotificationRead } from "@/lib/db/notifications";
import { getUserConversations, sendMessage } from "@/lib/db/messages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchemaMap: Record<string, ZodType> = {
  "POST /api/auth/signup": signupSchema,
  "POST /api/auth/login": loginSchema,
  "POST /api/auth/forgot-password": forgotPasswordSchema,
  "POST /api/auth/reset-password": resetPasswordSchema,
  "POST /api/onboarding/complete": onboardingSchema,
  "PATCH /api/users/[id]": profileSchema.partial(),
  "POST /api/groups": groupSchema,
  "PATCH /api/groups/[slug]": groupSchema.partial(),
  "POST /api/events": eventSchema,
  "PATCH /api/events/[slug]": eventInputSchema.partial(),
  "POST /api/events/[slug]/rsvp": rsvpSchema,
  "POST /api/events/[slug]/comments": eventCommentSchema,
  "POST /api/events/[slug]/rate": eventRatingSchema,
  "POST /api/venues": venueSchema,
  "PATCH /api/venues/[slug]": venueSchema.partial(),
  "POST /api/venues/[slug]/availability": venueAvailabilitySchema,
  "POST /api/venues/[slug]/deals": venueDealSchema,
  "PATCH /api/deals/[id]": venueDealSchema.partial(),
  "POST /api/venues/[slug]/reviews": venueReviewSchema,
  "POST /api/bookings": bookingRequestSchema,
  "PATCH /api/bookings/[id]": bookingRequestSchema.partial(),
};

async function parseValidatedBody(request: NextRequest, key: string) {
  const schema = bodySchemaMap[key];

  if (!schema) {
    return null;
  }

  const body = await request.json();
  return schema.parse(body);
}

function validationMessage(message: string, field?: string) {
  return validationErrorResponse({
    formErrors: [message],
    fieldErrors: field ? { [field]: [message] } : {},
  });
}

function isMissingAuthSessionMessage(message: string | undefined) {
  return message?.toLowerCase().includes("auth session missing") ?? false;
}

function getMockResponse(
  match: NonNullable<ReturnType<typeof findApiSpecRoute>>,
  request: NextRequest,
) {
  const pathname = match.route.pattern;

  switch (routeKey(match.route)) {
    case "GET /api/auth/me":
      const session = readMockSessionFromRequest(request);

      return successResponse({
        user: session,
        accountType: session?.accountType ?? null,
        redirectTo: session ? portalPathForRole(session.accountType) : null,
        note: session
          ? "Mock session active until Supabase credentials are connected."
          : "No active session yet.",
      });
    case "GET /api/users/[id]":
      return successResponse(
        mockCatalog.users.find((user) => user.id === match.params.id) ?? null,
      );
    case "GET /api/groups":
      return successResponse(publicGroups);
    case "GET /api/groups/[slug]":
      return successResponse(
        publicGroups.find((group) => group.slug === match.params.slug) ?? null,
      );
    case "GET /api/events":
      return successResponse(publicEvents);
    case "GET /api/events/[slug]":
      return successResponse(
        publicEvents.find((event) => event.slug === match.params.slug) ?? null,
      );
    case "GET /api/venues":
      return successResponse(publicVenues);
    case "GET /api/venues/[slug]":
      return successResponse(
        publicVenues.find((venue) => venue.slug === match.params.slug) ?? null,
      );
    case "GET /api/admin/settings":
      return successResponse(adminPortalData.settings ?? mockAdminSettings);
    default:
      return successResponse({
        route: pathname,
        params: match.params,
        note: "This endpoint is marked mock in the manifest but has not been given a custom payload yet.",
      });
  }
}

async function resolveAppSession(request: NextRequest) {
  if (!hasLiveSupabaseAuth()) {
    return readMockSessionFromRequest(request);
  }

  const routeClient = createSupabaseRouteClient(request);

  if (!routeClient) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await routeClient.supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return getOrCreateSessionForSupabaseUser(user);
}

function seededMessagesForRole(accountType: string | null | undefined) {
  switch (accountType) {
    case "organizer":
      return organizerPortalData.messages;
    case "venue":
      return venuePortalData.messages;
    case "admin":
      return [
        {
          key: "admin-msg-1",
          counterpart: adminPortalData.selectedUser.name,
          role: adminPortalData.selectedUser.role,
          subject: "Organizer quality review",
          preview: adminPortalData.selectedUser.notes,
          channel: "Admin oversight",
          status: "Open",
          meta: "Today",
        },
        {
          key: "admin-msg-2",
          counterpart: adminPortalData.clientDossier.name,
          role: adminPortalData.clientDossier.tier,
          subject: "Client curation note",
          preview: adminPortalData.clientDossier.summary,
          channel: "Client dossier",
          status: "Pinned",
          meta: "Today",
        },
      ];
    default:
      return memberPortalData.messages;
  }
}

function seededNotificationsForRole(accountType: string | null | undefined) {
  switch (accountType) {
    case "organizer":
      return organizerPortalData.notifications;
    case "venue":
      return venuePortalData.notifications;
    case "admin":
      return adminPortalData.urgentQueues.map((item) => ({
        key: item.key,
        title: item.title,
        detail: item.detail,
        channel: item.meta,
        status: "Needs review",
        meta: item.meta,
        tone: item.tone,
      }));
    default:
      return memberPortalData.notifications;
  }
}

function seededBookingsForRole(accountType: string | null | undefined) {
  switch (accountType) {
    case "organizer":
      return {
        pipeline: organizerPortalData.bookingPipeline,
        venues: organizerPortalData.venueMatches,
      };
    case "venue":
      return venuePortalData.bookings;
    case "admin":
      return {
        transactions: adminPortalData.revenue.transactions,
        venueApplications: adminPortalData.venues.applications,
      };
    default:
      return [];
  }
}

function seededAdminAnalytics(type: string) {
  switch (type) {
    case "growth":
      return {
        growthChart: adminPortalData.growthChart,
        geography: adminPortalData.geography,
      };
    case "content":
      return adminPortalData.content;
    case "revenue":
      return adminPortalData.revenue;
    case "moderation":
      return adminPortalData.moderation;
    default:
      return {
        deck: adminPortalData.analyticsDeck,
        heatGrid: adminPortalData.heatGrid,
        categoryMix: adminPortalData.categoryMix,
      };
  }
}

async function getSeededReadResponse(
  match: NonNullable<ReturnType<typeof findApiSpecRoute>>,
  request: NextRequest,
) {
  const session = await resolveAppSession(request);
  const key = routeKey(match.route);

  switch (key) {
    case "GET /api/messages":
      return successResponse({
        accountType: session?.accountType ?? "user",
        threads: seededMessagesForRole(session?.accountType),
      });
    case "GET /api/messages/[threadId]": {
      const threads = seededMessagesForRole(session?.accountType);
      return successResponse(
        threads.find((thread) => thread.key === match.params.threadId) ?? null,
      );
    }
    case "GET /api/notifications":
      return successResponse({
        accountType: session?.accountType ?? "user",
        notifications: seededNotificationsForRole(session?.accountType),
      });
    case "GET /api/bookings":
      return successResponse({
        accountType: session?.accountType ?? "user",
        data: seededBookingsForRole(session?.accountType),
      });
    case "GET /api/admin/stats":
      if (session?.accountType !== "admin") return forbiddenResponse("Admin access required.");
      return successResponse({
        metrics: adminPortalData.metrics,
        opsInbox: adminPortalData.opsInbox,
        urgentQueues: adminPortalData.urgentQueues,
      });
    case "GET /api/admin/analytics/[type]":
      if (session?.accountType !== "admin") return forbiddenResponse("Admin access required.");
      return successResponse(seededAdminAnalytics(match.params.type));
    case "GET /api/admin/transactions":
      if (session?.accountType !== "admin") return forbiddenResponse("Admin access required.");
      return successResponse(adminPortalData.revenue.transactions);
    case "GET /api/admin/moderation":
      if (session?.accountType !== "admin") return forbiddenResponse("Admin access required.");
      return successResponse(adminPortalData.moderation);
    case "GET /api/admin/audit-log":
      if (session?.accountType !== "admin") return forbiddenResponse("Admin access required.");
      return successResponse(adminPortalData.moderation.auditLog);
    default:
      return null;
  }
}

async function getLiveSessionResponse(request: NextRequest) {
  const routeClient = createSupabaseRouteClient(request);

  if (!routeClient) {
    return serviceUnavailableResponse(
      findApiSpecRoute("GET", "/api/auth/me")!,
    );
  }

  const {
    data: { user },
    error,
  } = await routeClient.supabase.auth.getUser();

  if (error && !isMissingAuthSessionMessage(error.message)) {
    return validationMessage(error.message);
  }

  if (!user) {
    return successResponse({
      user: null,
      accountType: null,
      redirectTo: null,
      note: "No active session yet.",
    });
  }

  const session = await getOrCreateSessionForSupabaseUser(user);

  if (!session) {
    return serviceUnavailableResponse(findApiSpecRoute("GET", "/api/auth/me")!);
  }

  return routeClient.applyCookies(
    successResponse({
      user: session,
      accountType: session.accountType,
      redirectTo: portalPathForRole(session.accountType),
      note: "Supabase session active.",
    }),
  );
}

async function handleMockAuthRequest(request: NextRequest, key: string) {
  switch (key) {
    case "POST /api/auth/login": {
      const body = (await parseValidatedBody(request, key)) as { email: string };
      const account = findMockAccountByEmail(String(body?.email ?? ""));

      if (!account) {
        return validationErrorResponse({
          formErrors: [
            "Use one of the demo accounts shown on the login screen until Supabase is connected.",
          ],
          fieldErrors: {
            email: ["Unknown demo account email."],
          },
        });
      }

      const session = createMockSessionFromAccount(account);
      const response = successResponse({
        user: session,
        accountType: session.accountType,
        redirectTo: portalPathForRole(session.accountType),
      });

      return withMockSessionCookie(response, session);
    }

    case "POST /api/auth/signup": {
      const body = (await parseValidatedBody(request, key)) as {
        displayName: string;
        email: string;
        locale?: "en" | "is";
        requestedAccountType?: "admin" | "venue" | "organizer" | "user";
      };
      const session = createMockSignupSession({
        displayName: String(body?.displayName ?? ""),
        email: String(body?.email ?? ""),
        locale: (body?.locale as "en" | "is") ?? "en",
        requestedAccountType: (() => {
          const requestedRole =
            (body?.requestedAccountType as "admin" | "venue" | "organizer" | "user") ??
            "user";

          if (requestedRole === "admin" && process.env.ALLOW_MOCK_ADMIN_SIGNUP !== "true") {
            return "user";
          }

          return requestedRole;
        })(),
      });
      const response = successResponse(
        {
          user: session,
          accountType: session.accountType,
          redirectTo: "/onboarding",
          note: "Mock account created locally. Replace with Supabase auth tonight.",
        },
        { status: 201 },
      );

      return withMockSessionCookie(response, session);
    }

    case "POST /api/auth/logout": {
      return clearMockSessionCookie(
        successResponse({
          user: null,
          accountType: null,
          redirectTo: "/login",
        }),
      );
    }

    case "POST /api/auth/forgot-password": {
      return successResponse({
        message:
          "Password recovery is mocked right now. Supabase email recovery will replace this when service keys are connected.",
      });
    }

    case "POST /api/auth/reset-password": {
      return successResponse({
        message:
          "Password reset is mocked right now. The final flow will use Supabase recovery tokens.",
      });
    }

    default:
      return null;
  }
}

async function handleLiveAuthRequest(request: NextRequest, key: string) {
  const routeClient = createSupabaseRouteClient(request);

  if (!routeClient) {
    return null;
  }

  switch (key) {
    case "POST /api/auth/login": {
      const body = (await parseValidatedBody(request, key)) as {
        email: string;
        password: string;
      };
      const { data, error } = await routeClient.supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

      if (error || !data.user) {
        return validationMessage(
          error?.message ?? "Unable to sign in with those credentials.",
          "email",
        );
      }

      const session = await getOrCreateSessionForSupabaseUser(data.user);

      if (!session) {
        return serviceUnavailableResponse(findApiSpecRoute("POST", "/api/auth/login")!);
      }

      return routeClient.applyCookies(
        successResponse({
          user: session,
          accountType: session.accountType,
          redirectTo: portalPathForRole(session.accountType),
        }),
      );
    }

    case "POST /api/auth/signup": {
      const body = (await parseValidatedBody(request, key)) as {
        displayName: string;
        email: string;
        password: string;
        locale?: "en" | "is";
        requestedAccountType?: "admin" | "venue" | "organizer" | "user";
      };

      const requestedAccountType =
        body.requestedAccountType === "admin" && process.env.ALLOW_MOCK_ADMIN_SIGNUP !== "true"
          ? "user"
          : body.requestedAccountType;

      const { data, error } = await routeClient.supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/callback`,
          data: {
            display_name: body.displayName,
            locale: body.locale ?? "en",
            requestedAccountType: requestedAccountType ?? "user",
          },
        },
      });

      if (error || !data.user) {
        return validationMessage(
          error?.message ?? "Unable to create the account right now.",
          "email",
        );
      }

      const session = await getOrCreateSessionForSupabaseUser(
        data.user,
        requestedAccountType ?? "user",
      );

      if (!session) {
        return serviceUnavailableResponse(findApiSpecRoute("POST", "/api/auth/signup")!);
      }

      return routeClient.applyCookies(
        successResponse(
          {
            user: session,
            accountType: session.accountType,
            redirectTo: data.session ? "/onboarding" : "/login",
            message: data.session
              ? "Account created. Continue into onboarding."
              : "Account created. Check your email if confirmation is required before signing in.",
          },
          { status: 201 },
        ),
      );
    }

    case "POST /api/auth/logout": {
      const { error } = await routeClient.supabase.auth.signOut();

      if (error) {
        return validationMessage(error.message);
      }

      return routeClient.applyCookies(
        successResponse({
          user: null,
          accountType: null,
          redirectTo: "/login",
        }),
      );
    }

    case "POST /api/auth/forgot-password": {
      const body = (await parseValidatedBody(request, key)) as { email: string };
      const { error } = await routeClient.supabase.auth.resetPasswordForEmail(body.email, {
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/callback?next=/reset-password`,
      });

      if (error) {
        return validationMessage(error.message, "email");
      }

      return routeClient.applyCookies(
        successResponse({
          message:
            "If that email exists, a recovery link has been sent with a route back to reset-password.",
        }),
      );
    }

    case "POST /api/auth/reset-password": {
      const body = (await parseValidatedBody(request, key)) as {
        token: string;
        password: string;
      };

      const { error: verifyError } = await routeClient.supabase.auth.verifyOtp({
        token_hash: body.token,
        type: "recovery",
      });

      if (verifyError) {
        return validationMessage(
          "That recovery token is invalid or expired. Open the latest recovery email and try again.",
          "token",
        );
      }

      const { error: updateError } = await routeClient.supabase.auth.updateUser({
        password: body.password,
      });

      if (updateError) {
        return validationMessage(updateError.message, "password");
      }

      return routeClient.applyCookies(
        successResponse({
          message: "Password updated. You can sign in with the new password now.",
          redirectTo: "/login",
        }),
      );
    }

    default:
      return null;
  }
}

/**
 * Live Supabase data handler — dispatches validated requests to real db functions.
 * Returns null if the route isn't handled yet (falls through to scaffold).
 */
async function handleLiveDataRequest(
  request: NextRequest,
  key: string,
  match: NonNullable<ReturnType<typeof findApiSpecRoute>>,
) {
  const session = await resolveAppSession(request);

  try {
    switch (key) {
      // ── Events CRUD ──
      case "GET /api/events": {
        const url = request.nextUrl;
        const result = await getEvents({
          category: url.searchParams.get("category") ?? undefined,
          limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100),
          offset: Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0),
          status: url.searchParams.get("status") ?? "published",
        });
        return successResponse(result);
      }
      case "GET /api/events/[slug]": {
        const data = await getEventBySlug(match.params.slug);
        if (!data) return successResponse(null);
        return successResponse(data);
      }
      case "POST /api/events": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = await parseValidatedBody(request, key);
        const slug = `${(body as Record<string, string>).title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        const data = await createEvent({
          ...(body as Record<string, unknown>),
          slug,
          host_id: session.id,
          status: "draft",
        } as Parameters<typeof createEvent>[0]);
        return successResponse(data, { status: 201 });
      }
      case "PATCH /api/events/[slug]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const eventToUpdate = await getEventBySlug(match.params.slug);
        if (!eventToUpdate) return validationMessage("Event not found.");
        if (eventToUpdate.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("You can only edit your own events.");
        }
        const body = await parseValidatedBody(request, key);
        const data = await updateEvent(match.params.slug, body as Parameters<typeof updateEvent>[1]);
        return successResponse(data);
      }
      case "DELETE /api/events/[slug]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const eventToDelete = await getEventBySlug(match.params.slug);
        if (!eventToDelete) return validationMessage("Event not found.");
        if (eventToDelete.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("You can only delete your own events.");
        }
        await deleteEvent(match.params.slug);
        return successResponse({ deleted: true });
      }

      // ── RSVPs ──
      case "POST /api/events/[slug]/rsvp": {
        if (!session) return forbiddenResponse("Authentication required.");
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        const body = (await parseValidatedBody(request, key)) as Record<string, string> | null;
        const data = await createRsvp(event.id, session.id, body?.ticketTierId);
        return successResponse(data, { status: 201 });
      }
      case "DELETE /api/events/[slug]/rsvp": {
        if (!session) return forbiddenResponse("Authentication required.");
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        const data = await cancelRsvp(event.id, session.id);
        return successResponse(data);
      }
      case "GET /api/events/[slug]/attendees": {
        const event = await getEventBySlug(match.params.slug);
        if (!event) return successResponse([]);
        const data = await getEventRsvps(event.id);
        return successResponse(data);
      }

      // ── Event comments ──
      case "POST /api/events/[slug]/comments": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const { data, error } = await supabase
          .from("event_comments")
          .insert({
            event_id: event.id,
            user_id: session.id,
            text: body.text as string,
            parent_id: (body.parentId as string) ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }
      case "GET /api/events/[slug]/comments": {
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return successResponse([]);
        const { data } = await supabase
          .from("event_comments")
          .select("*, profiles:user_id (*)")
          .eq("event_id", event.id)
          .order("created_at", { ascending: true });
        return successResponse(data ?? []);
      }

      // ── Event ratings ──
      case "POST /api/events/[slug]/rate": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        // Prevent duplicate ratings
        const { data: existingRating } = await supabase
          .from("event_ratings")
          .select("id")
          .eq("event_id", event.id)
          .eq("user_id", session.id)
          .maybeSingle();
        if (existingRating) {
          return validationMessage("You have already rated this event.");
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const { data, error } = await supabase
          .from("event_ratings")
          .insert({
            event_id: event.id,
            user_id: session.id,
            rating: body.rating as number,
            text: (body.text as string) ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }

      // ── Groups CRUD ──
      case "GET /api/groups": {
        const url = request.nextUrl;
        const data = await getGroups({
          category: url.searchParams.get("category") ?? undefined,
          limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100),
        });
        return successResponse(data);
      }
      case "GET /api/groups/[slug]": {
        const data = await getGroupBySlug(match.params.slug);
        if (!data) return successResponse(null);
        return successResponse(data);
      }
      case "POST /api/groups": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = await parseValidatedBody(request, key);
        const slug = `${(body as Record<string, string>).name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        const data = await createGroup({
          ...(body as Record<string, unknown>),
          slug,
          organizer_id: session.id,
          status: "pending",
        } as Parameters<typeof createGroup>[0]);
        return successResponse(data, { status: 201 });
      }
      case "POST /api/groups/[slug]/join": {
        if (!session) return forbiddenResponse("Authentication required.");
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        const data = await joinGroup(group.id, session.id);
        return successResponse(data, { status: 201 });
      }
      case "POST /api/groups/[slug]/leave": {
        if (!session) return forbiddenResponse("Authentication required.");
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        await leaveGroup(group.id, session.id);
        return successResponse({ left: true });
      }
      case "GET /api/groups/[slug]/members": {
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return successResponse([]);
        const { data } = await supabase
          .from("group_members")
          .select("*, profiles:user_id (*)")
          .eq("group_id", group.id);
        return successResponse(data ?? []);
      }

      // ── Venues CRUD ──
      case "GET /api/venues": {
        const url = request.nextUrl;
        const result = await getVenues({
          type: url.searchParams.get("type") ?? undefined,
          limit: Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100),
        });
        return successResponse(result.data);
      }
      case "GET /api/venues/[slug]": {
        const data = await getVenueBySlug(match.params.slug);
        if (!data) return successResponse(null);
        return successResponse(data);
      }
      case "POST /api/venues": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = await parseValidatedBody(request, key);
        const slug = `${(body as Record<string, string>).name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        const data = await createVenue({
          ...(body as Record<string, unknown>),
          slug,
          owner_id: session.id,
          status: "pending",
        } as Parameters<typeof createVenue>[0]);
        return successResponse(data, { status: 201 });
      }
      case "PATCH /api/venues/[slug]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const venueToUpdate = await getVenueBySlug(match.params.slug);
        if (!venueToUpdate) return validationMessage("Venue not found.");
        if (venueToUpdate.owner_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("You can only edit your own venues.");
        }
        const body = await parseValidatedBody(request, key);
        const data = await updateVenue(match.params.slug, body as Parameters<typeof updateVenue>[1]);
        return successResponse(data);
      }

      // ── Venue deals ──
      case "POST /api/venues/[slug]/deals": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return validationMessage("Venue not found.");
        if (venue.owner_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the venue owner can manage deals.");
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const { data, error } = await supabase
          .from("venue_deals")
          .insert({
            venue_id: venue.id,
            title: body.title as string,
            description: (body.description as string) ?? null,
            deal_type: body.dealType as string,
            deal_tier: body.dealTier as string,
            discount_value: (body.discountValue as string) ?? null,
            valid_from: (body.validFrom as string) ?? null,
            valid_until: (body.validUntil as string) ?? null,
            is_active: (body.isActive as boolean) ?? true,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }
      case "GET /api/venues/[slug]/deals": {
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return successResponse([]);
        const { data } = await supabase
          .from("venue_deals")
          .select("*")
          .eq("venue_id", venue.id)
          .eq("is_active", true);
        return successResponse(data ?? []);
      }

      // ── Venue reviews ──
      case "POST /api/venues/[slug]/reviews": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return validationMessage("Venue not found.");
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const { data, error } = await supabase
          .from("venue_reviews")
          .insert({
            venue_id: venue.id,
            reviewer_id: session.id,
            rating: body.rating as number,
            text: (body.text as string) ?? null,
            reviewer_type: (body.reviewerType as string) ?? "attendee",
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }
      case "GET /api/venues/[slug]/reviews": {
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return successResponse([]);
        const { data } = await supabase
          .from("venue_reviews")
          .select("*, profiles:reviewer_id (*)")
          .eq("venue_id", venue.id)
          .order("created_at", { ascending: false });
        return successResponse(data ?? []);
      }

      // ── Venue availability ──
      case "POST /api/venues/[slug]/availability": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return validationMessage("Venue not found.");
        if (venue.owner_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the venue owner can manage availability.");
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const { data, error } = await supabase
          .from("venue_availability")
          .insert({
            venue_id: venue.id,
            day_of_week: (body.dayOfWeek as number) ?? null,
            specific_date: (body.specificDate as string) ?? null,
            start_time: body.startTime as string,
            end_time: body.endTime as string,
            capacity_override: (body.capacityOverride as number) ?? null,
            cost_type: (body.costType as string) ?? null,
            cost_amount: (body.costAmount as number) ?? null,
            notes: (body.notes as string) ?? null,
            is_recurring: (body.isRecurring as boolean) ?? false,
            is_blocked: (body.isBlocked as boolean) ?? false,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }
      case "GET /api/venues/[slug]/availability": {
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return successResponse([]);
        const { data } = await supabase
          .from("venue_availability")
          .select("*")
          .eq("venue_id", venue.id)
          .eq("is_blocked", false);
        return successResponse(data ?? []);
      }

      // ── Bookings ──
      case "POST /api/bookings": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const data = await createBooking({
          ...body,
          organizer_id: session.id,
          status: "pending",
        } as Parameters<typeof createBooking>[0]);
        return successResponse(data, { status: 201 });
      }
      case "GET /api/bookings": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        // Fetch bookings where user is organizer
        const { data: asOrganizer } = await supabase
          .from("venue_bookings")
          .select("*, profiles:organizer_id (*), venues:venue_id (*)")
          .eq("organizer_id", session.id)
          .order("requested_date", { ascending: false });
        // Fetch bookings for venues the user owns
        const { data: ownedVenues } = await supabase
          .from("venues")
          .select("id")
          .eq("owner_id", session.id);
        const ownedVenueIds = (ownedVenues ?? []).map((v) => v.id);
        let asVenueOwner: typeof asOrganizer = [];
        if (ownedVenueIds.length > 0) {
          const { data } = await supabase
            .from("venue_bookings")
            .select("*, profiles:organizer_id (*), venues:venue_id (*)")
            .in("venue_id", ownedVenueIds)
            .order("requested_date", { ascending: false });
          asVenueOwner = data ?? [];
        }
        // Merge and deduplicate
        const seen = new Set<string>();
        const merged = [...(asOrganizer ?? []), ...asVenueOwner].filter((b) => {
          if (seen.has(b.id)) return false;
          seen.add(b.id);
          return true;
        });
        return successResponse(merged);
      }
      case "PATCH /api/bookings/[id]": {
        if (!session) return forbiddenResponse("Authentication required.");
        // Verify the user is the booking organizer or the venue owner
        const supabaseForBooking = await createSupabaseServerClient();
        if (!supabaseForBooking) return null;
        const { data: bookingToUpdate } = await supabaseForBooking
          .from("venue_bookings")
          .select("organizer_id, venue_id, venues:venue_id (owner_id)")
          .eq("id", match.params.id)
          .single();
        if (!bookingToUpdate) return validationMessage("Booking not found.");
        const venueOwner = (bookingToUpdate.venues as unknown as { owner_id: string })?.owner_id;
        if (
          bookingToUpdate.organizer_id !== session.id &&
          venueOwner !== session.id &&
          session.accountType !== "admin"
        ) {
          return forbiddenResponse("You can only manage your own bookings.");
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const data = await updateBookingStatus(
          match.params.id,
          body.status as import("@/types/domain").BookingStatus,
          body.counterOffer as Parameters<typeof updateBookingStatus>[2],
        );
        return successResponse(data);
      }

      // ── Onboarding ──
      case "POST /api/onboarding/complete": {
        if (!session) return forbiddenResponse("Authentication required.");
        const onbBody = (await parseValidatedBody(request, key)) as {
          locale: string;
          interests: string[];
          avatarUrl?: string;
        };
        const onbData = await updateProfile(session.id, {
          locale: onbBody.locale as "en" | "is",
          interests: onbBody.interests,
          ...(onbBody.avatarUrl ? { avatar_url: onbBody.avatarUrl } : {}),
        });
        return successResponse(onbData);
      }

      // ── Users / Profiles ──
      case "PATCH /api/users/[id]": {
        if (!session) return forbiddenResponse("Authentication required.");
        if (match.params.id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("You can only edit your own profile.");
        }
        const body = await parseValidatedBody(request, key);
        const data = await updateProfile(match.params.id, body as Parameters<typeof updateProfile>[1]);
        return successResponse(data);
      }
      case "GET /api/users/[id]": {
        const data = await getProfileById(match.params.id);
        return successResponse(data);
      }

      // ── Notifications ──
      case "GET /api/notifications": {
        if (!session) return forbiddenResponse("Authentication required.");
        const data = await getUserNotifications(session.id);
        return successResponse({ accountType: session.accountType, notifications: data });
      }
      case "PATCH /api/notifications/read": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = await request.json();
        if (body.id) {
          await markNotificationRead(body.id, session.id);
        }
        return successResponse({ marked: true });
      }

      // ── Messages ──
      case "GET /api/messages": {
        if (!session) return forbiddenResponse("Authentication required.");
        const data = await getUserConversations(session.id);
        return successResponse({ accountType: session.accountType, threads: data });
      }
      case "POST /api/messages": {
        if (!session) return forbiddenResponse("Authentication required.");
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const data = await sendMessage({
          sender_id: session.id,
          receiver_id: body.receiverId as string,
          subject: (body.subject as string) ?? "",
          body: body.body as string,
        });
        return successResponse(data, { status: 201 });
      }

      // ── Admin stats ──
      case "GET /api/admin/stats": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const [users, events, groups, venues] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("groups").select("id", { count: "exact", head: true }),
          supabase.from("venues").select("id", { count: "exact", head: true }),
        ]);
        return successResponse({
          totalUsers: users.count ?? 0,
          totalEvents: events.count ?? 0,
          totalGroups: groups.count ?? 0,
          totalVenues: venues.count ?? 0,
        });
      }

      default: {
        // ── Admin Featured Placement Toggle ──
        // PATCH /api/admin/events/:slug/featured
        if (
          key.startsWith("PATCH /api/admin/events/") &&
          key.endsWith("/featured") &&
          session?.accountType === "admin"
        ) {
          const supabase = await createSupabaseServerClient();
          if (!supabase) return null;
          const slug = match.params?.slug ?? key.split("/")[4];
          const body = await request.json();
          const isFeatured = Boolean(body.is_featured);
          const { data, error } = await supabase
            .from("events")
            .update({ is_featured: isFeatured })
            .eq("slug", slug)
            .select()
            .single();
          if (error)
            return validationErrorResponse({
              formErrors: [error.message],
              fieldErrors: {},
            });
          return successResponse(data);
        }

        return null; // Fall through to scaffold
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database operation failed";
    console.error(`Live handler error for ${key}:`, err);
    return validationErrorResponse({
      formErrors: [message],
      fieldErrors: {},
    });
  }
}

async function handleApiRequest(request: NextRequest, method: ApiMethod) {
  const path = request.nextUrl.pathname;
  const match = findApiSpecRoute(method, path);

  if (!match) {
    return notFoundResponse(path, method);
  }

  if (routeKey(match.route) === "GET /api/auth/me" && hasLiveSupabaseAuth()) {
    return getLiveSessionResponse(request);
  }

  if (match.route.implementation === "mock") {
    return getMockResponse(match, request);
  }

  const key = routeKey(match.route);

  try {
    if (method !== "GET" && !hasTrustedOrigin(request)) {
      return forbiddenResponse("Cross-site state changes are not allowed.");
    }

    if (method === "GET") {
      const seededReadResponse = await getSeededReadResponse(match, request);

      if (seededReadResponse) {
        return seededReadResponse;
      }
    }

    if (match.route.category === "auth") {
      // Rate-limit mutating auth endpoints (login, signup, forgot-password, reset-password)
      if (method !== "GET") {
        const rlKey = rateLimitKeyFromRequest(request, "auth");
        const rl = checkRateLimit(rlKey, AUTH_RATE_LIMIT);
        if (!rl.allowed) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
              status: 429,
              headers: {
                "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
              },
            },
          );
        }
      }

      const response = hasLiveSupabaseAuth()
        ? await handleLiveAuthRequest(request, key)
        : await handleMockAuthRequest(request, key);

      if (response) {
        return response;
      }

      const validatedBody = await parseValidatedBody(request, key);
      return serviceUnavailableResponse(match, { body: validatedBody });
    }

    // Attempt live Supabase handler before falling back to scaffold
    if (hasSupabaseEnv()) {
      const liveResult = await handleLiveDataRequest(request, key, match);
      if (liveResult) return liveResult;
    }

    const validatedBody = await parseValidatedBody(request, key);
    return scaffoldResponse(match, { body: validatedBody });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.flatten());
    }

    if (error instanceof SyntaxError) {
      return validationErrorResponse({
        formErrors: ["Body must be valid JSON."],
        fieldErrors: {},
      });
    }

    throw error;
  }
}

export async function GET(request: NextRequest) {
  return handleApiRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleApiRequest(request, "POST");
}

export async function PATCH(request: NextRequest) {
  return handleApiRequest(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return handleApiRequest(request, "DELETE");
}

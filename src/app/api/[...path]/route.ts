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
import { getUserNotifications, markNotificationRead, createNotification } from "@/lib/db/notifications";
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

      // When Supabase is configured, resolve the real profile UUID so
      // downstream queries (getProfileById, etc.) hit real data.
      if (hasSupabaseEnv()) {
        const { createSupabaseServerClient } = await import("@/lib/supabase/server");
        const sb = await createSupabaseServerClient();
        if (sb) {
          const { data: profile } = await sb
            .from("profiles")
            .select("id")
            .eq("email", account.email)
            .single();
          if (profile?.id) {
            session.id = profile.id;
          }
        }
      }

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

    case "POST /api/auth/logout":
    case "GET /api/auth/logout": {
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
          "If that email exists, a recovery link has been sent.",
      });
    }

    case "POST /api/auth/reset-password": {
      return successResponse({
        message:
          "Password updated. You can sign in with the new password now.",
        redirectTo: "/login",
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

    case "POST /api/auth/logout":
    case "GET /api/auth/logout": {
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
          status: (["draft", "published", "cancelled"].includes(url.searchParams.get("status") ?? "")
            ? url.searchParams.get("status")
            : "published") as string,
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
        if (!["organizer", "venue", "admin"].includes(session.accountType ?? "")) {
          return forbiddenResponse("Only organizers, venue owners, and admins can create events.");
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const slug = `${String(body.title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
        // Respect client-supplied status if valid, default to "published"
        const requestedStatus = String(body.status ?? "published");
        const validStatuses = ["draft", "published", "cancelled"];
        const status = validStatuses.includes(requestedStatus) ? requestedStatus : "published";
        const data = await createEvent({
          ...body,
          slug,
          host_id: session.id,
          status,
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
        if (!event) {
          // Graceful fallback: event exists in static data but not yet in DB.
          // Return success so client-side localStorage RSVP persistence works.
          return successResponse({
            id: `local-rsvp-${Date.now()}`,
            event_id: match.params.slug,
            user_id: session.id,
            status: "going",
            created_at: new Date().toISOString(),
          }, { status: 201 });
        }
        const body = (await parseValidatedBody(request, key)) as Record<string, string> | null;
        const data = await createRsvp(event.id, session.id, body?.ticketTierId);
        // Notify event host about the new RSVP
        if (event.host_id && event.host_id !== session.id) {
          await createNotification({
            user_id: event.host_id,
            type: "rsvp_confirmed",
            title: "New RSVP",
            body: `${session.displayName} RSVP'd to ${event.title}`,
            link: `/organizer/events`,
          }).catch(() => {});
        }
        return successResponse(data, { status: 201 });
      }
      case "DELETE /api/events/[slug]/rsvp": {
        if (!session) return forbiddenResponse("Authentication required.");
        const event = await getEventBySlug(match.params.slug);
        if (!event) {
          // Graceful fallback for cancel
          return successResponse({ cancelled: true });
        }
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
        if (!["organizer", "admin"].includes(session.accountType ?? "")) {
          return forbiddenResponse("Only organizers and admins can create groups.");
        }
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
        if (!group) {
          return successResponse({
            id: `local-member-${Date.now()}`,
            group_id: match.params.slug,
            user_id: session.id,
            joined_at: new Date().toISOString(),
          }, { status: 201 });
        }
        const data = await joinGroup(group.id, session.id);
        return successResponse(data, { status: 201 });
      }
      case "POST /api/groups/[slug]/leave": {
        if (!session) return forbiddenResponse("Authentication required.");
        const group = await getGroupBySlug(match.params.slug);
        if (!group) {
          return successResponse({ left: true });
        }
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
        if (!["venue", "admin"].includes(session.accountType ?? "")) {
          return forbiddenResponse("Only venue owners and admins can create venues.");
        }
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
        if (!["venue", "admin"].includes(session.accountType ?? "")) {
          return forbiddenResponse("Only venue owners and admins can manage venues.");
        }
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

        // Resolve venue slug to ID if needed
        if (body.venueSlug && !body.venueId && !body.venue_id) {
          const venueRow = await getVenueBySlug(body.venueSlug as string);
          if (venueRow) {
            body.venue_id = venueRow.id;
          }
        }

        const bookingPayload = {
          ...body,
          venue_id: (body.venue_id ?? body.venueId) as string,
          organizer_id: session.id,
          event_title: (body.eventTitle as string) ?? (body.event_title as string) ?? "",
          requested_date: (body.requestedDate ?? body.requested_date) as string,
          requested_start: (body.requestedStart ?? body.requested_start) as string ?? "18:00",
          requested_end: (body.requestedEnd ?? body.requested_end) as string ?? "21:00",
          status: "pending" as const,
        };
        const bookingData = await createBooking(bookingPayload as unknown as Parameters<typeof createBooking>[0]);
        // Notify venue owner about the new booking request
        const resolvedVenueId = (body.venueId ?? body.venue_id) as string | undefined;
        if (resolvedVenueId) {
          const supabaseForVenue = await createSupabaseServerClient();
          if (supabaseForVenue) {
            const { data: venue } = await supabaseForVenue
              .from("venues")
              .select("owner_id, name")
              .eq("id", resolvedVenueId)
              .single();
            if (venue?.owner_id && venue.owner_id !== session.id) {
              await createNotification({
                user_id: venue.owner_id,
                type: "booking_request",
                title: "New booking request",
                body: `${session.displayName} requested a booking at ${venue.name}`,
                link: `/venue/bookings`,
              }).catch(() => {});
            }
          }
        }
        return successResponse(bookingData, { status: 201 });
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
        const supabaseForBooking = await createSupabaseServerClient();
        if (!supabaseForBooking) return null;
        const { data: bookingToUpdate } = await supabaseForBooking
          .from("venue_bookings")
          .select("organizer_id, venue_id, venues:venue_id (owner_id)")
          .eq("id", match.params.id)
          .single();
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        if (!bookingToUpdate) {
          if (hasSupabaseEnv()) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
          // Mock mode — acknowledge without DB write
          return successResponse({ ok: true, id: match.params.id, ...body });
        }
        const venueOwner = (bookingToUpdate.venues as unknown as { owner_id: string })?.owner_id;
        if (
          bookingToUpdate.organizer_id !== session.id &&
          venueOwner !== session.id &&
          session.accountType !== "admin"
        ) {
          return forbiddenResponse("You can only manage your own bookings.");
        }
        const updatedBooking = await updateBookingStatus(
          match.params.id,
          body.status as import("@/types/domain").BookingStatus,
          body.counterOffer as Parameters<typeof updateBookingStatus>[2],
        );
        // Notify the other party about the booking status change
        const isOrganizerActing = session.id === bookingToUpdate.organizer_id;
        const notifyUserId = isOrganizerActing ? venueOwner : bookingToUpdate.organizer_id;
        if (notifyUserId) {
          await createNotification({
            user_id: notifyUserId,
            type: "booking_response",
            title: `Booking ${body.status}`,
            body: isOrganizerActing
              ? `A booking request has been ${body.status} by the organizer`
              : `Your booking request has been ${body.status}`,
            link: isOrganizerActing ? `/venue/dashboard` : `/organizer`,
          }).catch(() => {});
        }
        return successResponse(updatedBooking);
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
        const body = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        try {
          const data = await updateProfile(match.params.id, body as Parameters<typeof updateProfile>[1]);
          return successResponse(data);
        } catch (err) {
          if (hasSupabaseEnv()) throw err;
          return successResponse({ ok: true, id: match.params.id, ...body });
        }
      }
      case "PATCH /api/profile": {
        if (!session) return forbiddenResponse("Authentication required.");
        const profileBody = await request.json().catch(() => ({})) as Record<string, unknown>;
        // Venue profile editor sends { sections: [...] } — no matching DB column,
        // so acknowledge without DB write
        if ("sections" in profileBody) {
          return successResponse({ ok: true, sections: profileBody.sections });
        }
        try {
          const profileData = await updateProfile(session.id, profileBody as Parameters<typeof updateProfile>[1]);
          return successResponse(profileData);
        } catch (err) {
          if (hasSupabaseEnv()) throw err;
          return successResponse({ ok: true, ...profileBody });
        }
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
        const msgBody = (await parseValidatedBody(request, key)) as Record<string, unknown>;
        const msgData = await sendMessage({
          sender_id: session.id,
          receiver_id: msgBody.receiverId as string,
          subject: (msgBody.subject as string) ?? "",
          body: msgBody.body as string,
        });
        // Notify recipient about new message
        if (msgBody.receiverId && msgBody.receiverId !== session.id) {
          await createNotification({
            user_id: msgBody.receiverId as string,
            type: "admin_message",
            title: "New message",
            body: `${session.displayName} sent you a message`,
            link: `/dashboard/messages`,
          }).catch(() => {});
        }
        return successResponse(msgData, { status: 201 });
      }

      // ── Member settings (account preferences) ──
      case "PATCH /api/member/settings": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { section, values } = body as { section: string; values: Record<string, string> };
        // Map profile section fields to profiles columns
        if (section === "profile") {
          const profileUpdates: Record<string, string> = {};
          if (values["Display name"]) profileUpdates.display_name = values["Display name"];
          if (values["Bio"]) profileUpdates.bio = values["Bio"];
          if (values["Location"]) profileUpdates.city = values["Location"];
          if (Object.keys(profileUpdates).length > 0) {
            await supabase.from("profiles").update(profileUpdates).eq("id", session.id);
          }
        }
        // Locale section → update profiles.locale
        if (section === "locale" && values["Language"]) {
          await supabase.from("profiles").update({ locale: values["Language"] }).eq("id", session.id);
        }
        // Other sections (notifications, privacy, billing) → persist to platform_settings
        if (["notifications", "privacy", "billing"].includes(section)) {
          const settingsKey = `user_settings:${session.id}:${section}`;
          await supabase.from("platform_settings").upsert(
            { key: settingsKey, value: values as Record<string, unknown>, updated_at: new Date().toISOString(), updated_by: session.id },
            { onConflict: "key" },
          );
        }
        return successResponse({ ok: true, section, values });
      }

      // ── Attendee actions (organizer) ──
      case "POST /api/attendees/action": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { attendeeName, rsvpId, action: attAction } = body as {
          attendeeName: string; rsvpId?: string; action: string;
        };
        const statusMap: Record<string, string> = {
          approve: "going",
          reject: "rejected",
          waitlist: "waitlisted",
        };

        if (attAction === "checkin" && rsvpId) {
          await supabase
            .from("rsvps")
            .update({ checked_in_at: new Date().toISOString(), attended: "attended" })
            .eq("id", rsvpId);
          return successResponse({ ok: true, action: attAction, attendeeName });
        }
        const newStatus = statusMap[attAction];
        if (newStatus && rsvpId) {
          await supabase
            .from("rsvps")
            .update({ status: newStatus })
            .eq("id", rsvpId);
          return successResponse({ ok: true, action: attAction, attendeeName, status: newStatus });
        }
        return successResponse({ ok: true, action: attAction, attendeeName });
      }

      // ── Venue availability (session-inferred owner) ──
      case "PATCH /api/venues/availability": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        // Find venue owned by current user
        const { data: ownedVenue } = await supabase
          .from("venues")
          .select("id")
          .eq("owner_id", session.id)
          .limit(1)
          .maybeSingle();
        const body = await request.json();
        const { schedule } = body as { schedule: { day: string; open_time: string; close_time: string; is_available: boolean }[] };
        if (!ownedVenue) {
          return successResponse({ ok: true, schedule });
        }
        // Delete existing recurring availability, then insert fresh
        const dayMap: Record<string, number> = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
        };
        await supabase
          .from("venue_availability")
          .delete()
          .eq("venue_id", ownedVenue.id)
          .eq("is_recurring", true);
        const rows = schedule
          .filter((slot) => slot.is_available !== false)
          .map((slot) => ({
            venue_id: ownedVenue.id,
            day_of_week: dayMap[slot.day?.toLowerCase()] ?? 0,
            start_time: slot.open_time || "12:00",
            end_time: slot.close_time || "23:00",
            is_recurring: true,
          }));
        if (rows.length > 0) {
          await supabase.from("venue_availability").insert(rows);
        }
        return successResponse({ ok: true, venueId: ownedVenue.id, schedule });
      }

      // ── Venue deals (session-inferred owner) ──
      case "POST /api/venues/deals": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        // Find venue owned by current user
        const { data: dealVenue } = await supabase
          .from("venues")
          .select("id")
          .eq("owner_id", session.id)
          .limit(1)
          .maybeSingle();
        const body = await request.json();
        const { title, type: dealType, tier, note } = body as {
          title: string; type: string; tier: string; note: string;
        };
        if (!dealVenue) {
          // No venue in DB (mock mode) — acknowledge without DB write
          return successResponse({ ok: true, deal: { title, deal_type: dealType, deal_tier: tier } });
        }
        // Map UI deal types → schema CHECK values
        const typeMap: Record<string, string> = {
          "Free item": "free_item",
          "% off": "percentage",
          "Fixed discount": "fixed_price",
          "Bundle": "group_package",
        };
        const tierMap: Record<string, string> = {
          Bronze: "bronze",
          Silver: "silver",
          Gold: "gold",
        };
        const { data, error } = await supabase
          .from("venue_deals")
          .insert({
            venue_id: dealVenue.id,
            title,
            description: note || null,
            deal_type: typeMap[dealType] ?? "free_item",
            deal_tier: tierMap[tier] ?? "bronze",
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse({ ok: true, deal: data });
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

      // ── Admin analytics ──
      case "GET /api/admin/analytics/[type]": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const analyticsType = match.params.type;
        switch (analyticsType) {
          case "users": {
            const { data } = await supabase
              .from("profiles")
              .select("created_at")
              .order("created_at", { ascending: true });
            const grouped: Record<string, number> = {};
            for (const row of data ?? []) {
              const day = row.created_at?.slice(0, 10) ?? "unknown";
              grouped[day] = (grouped[day] ?? 0) + 1;
            }
            return successResponse({ type: "users", data: grouped });
          }
          case "events": {
            const { data } = await supabase
              .from("events")
              .select("created_at")
              .order("created_at", { ascending: true });
            const grouped: Record<string, number> = {};
            for (const row of data ?? []) {
              const day = row.created_at?.slice(0, 10) ?? "unknown";
              grouped[day] = (grouped[day] ?? 0) + 1;
            }
            return successResponse({ type: "events", data: grouped });
          }
          case "revenue": {
            const { data } = await supabase
              .from("transactions")
              .select("created_at, amount_isk")
              .eq("status", "completed")
              .order("created_at", { ascending: true });
            const grouped: Record<string, number> = {};
            for (const row of data ?? []) {
              const day = (row as { created_at: string }).created_at?.slice(0, 10) ?? "unknown";
              grouped[day] = (grouped[day] ?? 0) + ((row as { amount_isk: number }).amount_isk ?? 0);
            }
            return successResponse({ type: "revenue", data: grouped });
          }
          default:
            return successResponse({ type: analyticsType, data: {} });
        }
      }

      // ── Admin transactions ──
      case "GET /api/admin/transactions": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const url = request.nextUrl;
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1), 200);
        const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
        const { data, error } = await supabase
          .from("transactions")
          .select("*, profiles:user_id (*)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) throw error;
        return successResponse(data ?? []);
      }

      // ── Admin group approval ──
      case "PATCH /api/admin/groups/[id]/approve": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const status = body.status === "rejected" ? "rejected" : "active";
        const { data, error } = await supabase
          .from("groups")
          .update({ status })
          .eq("id", match.params.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Admin venue approval ──
      case "PATCH /api/admin/venues/[id]/approve": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const status = body.status === "rejected" ? "rejected" : "active";
        const { data, error } = await supabase
          .from("venues")
          .update({ status })
          .eq("id", match.params.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Admin moderation queue ──
      case "GET /api/admin/moderation": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const [pendingGroups, pendingVenues] = await Promise.all([
          supabase.from("groups").select("*").eq("status", "pending").order("created_at", { ascending: false }),
          supabase.from("venues").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        ]);
        return successResponse({
          pendingGroups: pendingGroups.data ?? [],
          pendingVenues: pendingVenues.data ?? [],
        });
      }

      // ── Admin announcements ──
      case "POST /api/admin/announcements": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const title = (body.title as string) ?? "Announcement";
        const detail = (body.message as string) ?? (body.detail as string) ?? "";
        // Get all user IDs
        const { data: users } = await supabase.from("profiles").select("id");
        if (users && users.length > 0) {
          const notifications = users.map((u) => ({
            user_id: u.id,
            title,
            detail,
            channel: "announcement",
            status: "unread" as const,
          }));
          const { error } = await supabase.from("notifications").insert(notifications);
          if (error) throw error;
        }
        return successResponse({ sent: true, recipientCount: users?.length ?? 0 }, { status: 201 });
      }

      // ── Admin settings update ──
      case "PATCH /api/admin/settings": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { sectionKey, items } = body as { sectionKey: string; items: { label: string; value: string }[] };
        if (!sectionKey) return validationErrorResponse("sectionKey is required");
        const { data, error } = await supabase
          .from("platform_settings")
          .upsert({ key: sectionKey, value: items }, { onConflict: "key" })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Admin user actions ──
      case "POST /api/admin/users/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { userKey, action, value } = body as { userKey: string; action: string; value?: string };
        const updates: Record<string, unknown> = {};
        switch (action) {
          case "role": updates.account_type = value; break;
          case "verify": updates.is_verified = true; break;
          case "unverify": updates.is_verified = false; break;
          case "suspend": updates.is_suspended = true; break;
          case "unsuspend": updates.is_suspended = false; break;
          case "grant_premium": updates.is_premium = true; break;
          case "remove_premium": updates.is_premium = false; break;
          default: return validationMessage(`Unknown user action: ${action}`);
        }
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("slug", userKey)
          .select()
          .maybeSingle();
        if (error) throw error;
        return successResponse({ ok: true, action, user: data });
      }

      // ── Admin notes ──
      case "POST /api/admin/notes": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, action: noteAction, note } = body as { key: string; action: string; note: string };
        if (noteAction === "add") {
          try {
            await supabase.from("admin_audit_log").insert({
              admin_id: session.id,
              action: "note_added",
              resource_type: "user",
              resource_id: key,
              changes: { note },
            });
          } catch (err) { if (hasSupabaseEnv()) throw err; }
        }
        return successResponse({ ok: true, action: noteAction });
      }

      // ── Admin notes delete ──
      case "DELETE /api/admin/notes": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, note } = body as { key: string; note: string };
        try {
          await supabase
            .from("admin_audit_log")
            .delete()
            .eq("resource_id", key)
            .eq("action", "note_added")
            .eq("changes->>note", note);
        } catch (err) { if (hasSupabaseEnv()) throw err; }
        return successResponse({ ok: true, action: "remove" });
      }

      // ── Admin events action ──
      case "POST /api/admin/events/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, action: eventAction } = body as { key: string; action: string };
        const updates: Record<string, unknown> = {};
        if (eventAction === "published") updates.status = "published";
        else if (eventAction === "rejected") updates.status = "rejected";
        else if (eventAction === "featured") { updates.is_featured = true; updates.status = "published"; }
        else if (eventAction === "cancelled") updates.status = "cancelled";
        else return validationMessage(`Unknown event action: ${eventAction}`);
        const { data, error } = await supabase
          .from("events")
          .update(updates)
          .eq("slug", key)
          .select()
          .maybeSingle();
        if (error) throw error;
        return successResponse({ ok: true, action: eventAction, event: data });
      }

      // ── Admin groups action ──
      case "POST /api/admin/groups/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, action: groupAction } = body as { key: string; action: string };
        const statusMap: Record<string, string> = { approved: "active", rejected: "archived", archived: "archived" };
        const newStatus = statusMap[groupAction];
        if (newStatus) {
          const { data, error } = await supabase
            .from("groups")
            .update({ status: newStatus })
            .eq("slug", key)
            .select()
            .maybeSingle();
          if (error) throw error;
          return successResponse({ ok: true, action: groupAction, group: data });
        }
        // Non-status actions (feature, monitor, prompt organizer) — acknowledge without DB change
        return successResponse({ ok: true, action: groupAction, key });
      }

      // ── Admin venues action ──
      case "POST /api/admin/venues/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, keys, action: venueAction } = body as { key?: string; keys?: string[]; action: string };
        // Batch operation
        if (keys && keys.length > 0) {
          const batchUpdates: Record<string, unknown> = {};
          if (venueAction === "approved" || venueAction === "approve") batchUpdates.status = "active";
          else if (venueAction === "rejected") batchUpdates.status = "rejected";
          else if (venueAction === "waitlisted") batchUpdates.status = "waitlisted";
          else batchUpdates.status = venueAction;
          const { error } = await supabase.from("venues").update(batchUpdates).in("slug", keys);
          if (error) throw error;
          return successResponse({ ok: true, action: venueAction, count: keys.length });
        }
        // Single operation
        if (!key) return validationMessage("Missing key or keys");
        const updates: Record<string, unknown> = {};
        if (venueAction === "verify") updates.is_verified = true;
        else if (venueAction === "suspend") updates.status = "suspended";
        else if (venueAction === "approve" || venueAction === "approved") updates.status = "active";
        else if (venueAction === "rejected") updates.status = "rejected";
        else updates.status = venueAction;
        const { data, error } = await supabase
          .from("venues")
          .update(updates)
          .eq("slug", key)
          .select()
          .maybeSingle();
        if (error) throw error;
        return successResponse({ ok: true, action: venueAction, venue: data });
      }

      // ── Admin refund ──
      case "POST /api/admin/refund": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key } = body as { key: string };
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(key)) {
          const { data, error } = await supabase
            .from("transactions")
            .update({ status: "refunded" })
            .eq("id", key)
            .select()
            .maybeSingle();
          if (error) throw error;
          return successResponse({ ok: true, transaction: data });
        }
        return successResponse({ ok: true, key });
      }

      // ── Admin ops action (no dedicated table) ──
      case "POST /api/admin/ops/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const body = await request.json();
        const { key, action: opsAction } = body as { key: string; action: string };
        return successResponse({ ok: true, action: opsAction, key });
      }

      // ── Admin incidents action (no dedicated table) ──
      case "POST /api/admin/incidents/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const body = await request.json();
        const { key, action: incidentAction } = body as { key: string; action: string };
        return successResponse({ ok: true, action: incidentAction, key });
      }

      // ── Admin moderation action ──
      case "POST /api/admin/moderation/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { key, action: modAction } = body as { key: string; action: string };
        if (modAction === "unban") {
          // Only attempt DB delete if key looks like a UUID
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidPattern.test(key)) {
            const { error } = await supabase.from("blocked_users").delete().eq("id", key);
            if (error) throw error;
          }
        }
        return successResponse({ ok: true, action: modAction, key });
      }

      // ── Admin content action (no dedicated table) ──
      case "POST /api/admin/content/action": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const body = await request.json();
        const { key, action: contentAction } = body as { key: string; action: string };
        return successResponse({ ok: true, action: contentAction, key });
      }

      // ── Admin comms send ──
      case "POST /api/admin/comms/send": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { audience, draft } = body as { audience: string; draft: { subject?: string; headline?: string; body?: string } };
        let userQuery = supabase.from("profiles").select("id");
        if (audience && audience !== "all") {
          userQuery = userQuery.eq("account_type", audience);
        }
        const { data: users } = await userQuery;
        if (users && users.length > 0) {
          const notifications = users.map((u) => ({
            user_id: u.id,
            type: "admin_message" as const,
            title: draft?.subject ?? draft?.headline ?? "Communication",
            body: draft?.body ?? "",
          }));
          try {
            await supabase.from("notifications").insert(notifications);
          } catch (err) { if (hasSupabaseEnv()) throw err; }
        }
        return successResponse({ ok: true, sent: true, recipientCount: users?.length ?? 0 });
      }

      // ── Admin audit log ──
      case "GET /api/admin/audit-log": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const url = request.nextUrl;
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1), 200);
        const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
        const { data, error } = await supabase
          .from("admin_audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) {
          // Table may not exist yet — return empty
          return successResponse([]);
        }
        return successResponse(data ?? []);
      }

      // ── Admin CSV export ──
      case "GET /api/admin/export/[type]": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const exportType = match.params.type;
        const tableMap: Record<string, string> = {
          events: "events",
          users: "profiles",
          venues: "venues",
          groups: "groups",
        };
        const table = tableMap[exportType];
        if (!table) return validationMessage(`Invalid export type: ${exportType}`);
        const { data, error } = await supabase.from(table).select("*").limit(10000);
        if (error) throw error;
        const rows = data ?? [];
        if (rows.length === 0) {
          return new NextResponse("", {
            status: 200,
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="${exportType}.csv"`,
            },
          });
        }
        const headers = Object.keys(rows[0] as Record<string, unknown>);
        const csvLines = [
          headers.join(","),
          ...rows.map((row) =>
            headers
              .map((h) => {
                const val = (row as Record<string, unknown>)[h];
                const str = val === null || val === undefined ? "" : String(val);
                return str.includes(",") || str.includes('"') || str.includes("\n")
                  ? `"${str.replace(/"/g, '""')}"`
                  : str;
              })
              .join(","),
          ),
        ];
        return new NextResponse(csvLines.join("\n"), {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${exportType}.csv"`,
          },
        });
      }

      // ── Users list ──
      case "GET /api/users": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const url = request.nextUrl;
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1), 200);
        const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
        let query = supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        const statusFilter = url.searchParams.get("status");
        if (statusFilter) query = query.eq("status", statusFilter);
        const typeFilter = url.searchParams.get("account_type");
        if (typeFilter) query = query.eq("account_type", typeFilter);
        const search = url.searchParams.get("q");
        if (search) query = query.ilike("display_name", `%${search}%`);
        const { data, error } = await query;
        if (error) throw error;
        return successResponse(data ?? []);
      }

      // ── Delete user (admin) ──
      case "DELETE /api/users/[id]": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", match.params.id);
        if (error) throw error;
        return successResponse({ deleted: true });
      }

      // ── Change user account type (admin) ──
      case "PATCH /api/users/[id]/type": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        if (!body.account_type) return validationMessage("account_type is required.", "account_type");
        const { data, error } = await supabase
          .from("profiles")
          .update({ account_type: body.account_type })
          .eq("id", match.params.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Change user status (admin) ──
      case "PATCH /api/users/[id]/status": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        if (!body.status) return validationMessage("status is required.", "status");
        const { data, error } = await supabase
          .from("profiles")
          .update({ status: body.status })
          .eq("id", match.params.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── RSVP management ──
      case "PATCH /api/events/[slug]/rsvp/[userId]/approve": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        if (event.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the event host can approve RSVPs.");
        }
        const { data, error } = await supabase
          .from("rsvps")
          .update({ status: "confirmed" })
          .eq("event_id", event.id)
          .eq("user_id", match.params.userId)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }
      case "PATCH /api/events/[slug]/rsvp/[userId]/reject": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        if (event.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the event host can reject RSVPs.");
        }
        const { data, error } = await supabase
          .from("rsvps")
          .update({ status: "rejected" })
          .eq("event_id", event.id)
          .eq("user_id", match.params.userId)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }
      case "DELETE /api/events/[slug]/rsvp/[userId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        if (event.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the event host can remove attendees.");
        }
        const { error } = await supabase
          .from("rsvps")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", match.params.userId);
        if (error) throw error;
        return successResponse({ removed: true });
      }
      case "POST /api/events/[slug]/rsvp/override": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        const body = await request.json();
        const { data, error } = await supabase
          .from("rsvps")
          .upsert({
            event_id: event.id,
            user_id: body.userId as string,
            status: (body.status as string) ?? "confirmed",
          }, { onConflict: "event_id,user_id" })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Group management ──
      case "PATCH /api/groups/[slug]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        if (group.organizer_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the group organizer can update this group.");
        }
        const body = await parseValidatedBody(request, key);
        const { data, error } = await supabase
          .from("groups")
          .update(body as Record<string, unknown>)
          .eq("id", group.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }
      case "DELETE /api/groups/[slug]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        if (group.organizer_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the group organizer can delete this group.");
        }
        const { error } = await supabase
          .from("groups")
          .delete()
          .eq("id", group.id);
        if (error) throw error;
        return successResponse({ deleted: true });
      }
      case "PATCH /api/groups/[slug]/members/[userId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        if (group.organizer_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the group organizer can change member roles.");
        }
        const body = await request.json();
        const { data, error } = await supabase
          .from("group_members")
          .update({ role: body.role as string })
          .eq("group_id", group.id)
          .eq("user_id", match.params.userId)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }
      case "POST /api/groups/[slug]/block/[userId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const group = await getGroupBySlug(match.params.slug);
        if (!group) return validationMessage("Group not found.");
        if (group.organizer_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the group organizer can block users.");
        }
        // Remove membership and add to blocked
        await supabase
          .from("group_members")
          .delete()
          .eq("group_id", group.id)
          .eq("user_id", match.params.userId);
        const { data, error } = await supabase
          .from("blocked_users")
          .insert({
            blocked_by: session.id,
            blocked_user_id: match.params.userId,
            scope: "group",
            scope_id: group.id,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }

      // ── Deal management ──
      case "PATCH /api/deals/[id]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        // Verify ownership
        const { data: deal } = await supabase
          .from("venue_deals")
          .select("*, venues:venue_id (owner_id)")
          .eq("id", match.params.id)
          .single();
        if (!deal) return validationMessage("Deal not found.");
        const venueOwner = (deal.venues as unknown as { owner_id: string })?.owner_id;
        if (venueOwner !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the venue owner can update deals.");
        }
        const body = await parseValidatedBody(request, key);
        const { data, error } = await supabase
          .from("venue_deals")
          .update(body as Record<string, unknown>)
          .eq("id", match.params.id)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }
      case "DELETE /api/deals/[id]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const { data: deal } = await supabase
          .from("venue_deals")
          .select("*, venues:venue_id (owner_id)")
          .eq("id", match.params.id)
          .single();
        if (!deal) return validationMessage("Deal not found.");
        const venueOwner = (deal.venues as unknown as { owner_id: string })?.owner_id;
        if (venueOwner !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the venue owner can delete deals.");
        }
        const { error } = await supabase
          .from("venue_deals")
          .delete()
          .eq("id", match.params.id);
        if (error) throw error;
        return successResponse({ deleted: true });
      }

      // ── Event invitations ──
      case "POST /api/events/[slug]/invite": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        if (event.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the event host can send invitations.");
        }
        const body = await request.json();
        const userIds = body.userIds as string[];
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return validationMessage("userIds array is required.", "userIds");
        }
        const notifications = userIds.map((uid) => ({
          user_id: uid,
          title: `You're invited to ${event.title ?? "an event"}`,
          detail: body.message ?? `You've been invited to attend an upcoming event.`,
          channel: "invite",
          status: "unread" as const,
        }));
        const { error } = await supabase.from("notifications").insert(notifications);
        if (error) throw error;
        return successResponse({ invited: userIds.length }, { status: 201 });
      }

      // ── Event check-in ──
      case "POST /api/events/[slug]/checkin/[userId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const event = await getEventBySlug(match.params.slug);
        if (!event) return validationMessage("Event not found.");
        if (event.host_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the event host can check in attendees.");
        }
        const { data, error } = await supabase
          .from("rsvps")
          .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
          .eq("event_id", event.id)
          .eq("user_id", match.params.userId)
          .select()
          .single();
        if (error) throw error;
        return successResponse(data);
      }

      // ── Messages thread detail ──
      case "GET /api/messages/[threadId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const { data, error } = await supabase
          .from("messages")
          .select("*, profiles:sender_id (*)")
          .eq("thread_id", match.params.threadId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return successResponse(data ?? []);
      }

      // ── User blocking ──
      case "POST /api/users/[id]/block": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const body = await request.json();
        const { data, error } = await supabase
          .from("blocked_users")
          .insert({
            blocked_by: session.id,
            blocked_user_id: match.params.id,
            scope: (body.scope as string) ?? "platform",
            scope_id: (body.scopeId as string) ?? null,
            reason: (body.reason as string) ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }
      case "DELETE /api/users/[id]/block": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const { error } = await supabase
          .from("blocked_users")
          .delete()
          .eq("blocked_by", session.id)
          .eq("blocked_user_id", match.params.id);
        if (error) throw error;
        return successResponse({ unblocked: true });
      }

      // ── Admin blocked users list ──
      case "GET /api/admin/blocked": {
        if (!session || session.accountType !== "admin") return forbiddenResponse("Admin access required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const { data, error } = await supabase
          .from("blocked_users")
          .select("*, blocker:blocked_by (*), blocked:blocked_user_id (*)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return successResponse(data ?? []);
      }

      // ── Venue user blocking ──
      case "POST /api/venues/[slug]/block/[userId]": {
        if (!session) return forbiddenResponse("Authentication required.");
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const venue = await getVenueBySlug(match.params.slug);
        if (!venue) return validationMessage("Venue not found.");
        if (venue.owner_id !== session.id && session.accountType !== "admin") {
          return forbiddenResponse("Only the venue owner can block users.");
        }
        const body = await request.json().catch(() => ({}));
        const { data, error } = await supabase
          .from("blocked_users")
          .insert({
            blocked_by: session.id,
            blocked_user_id: match.params.userId,
            scope: "venue",
            scope_id: venue.id,
            reason: (body as Record<string, string>).reason ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return successResponse(data, { status: 201 });
      }

      // ── Search (public) ──
      case "GET /api/search": {
        const url = request.nextUrl;
        const q = (url.searchParams.get("q") ?? "").trim();
        if (!q || q.length < 2) return successResponse({ events: [], groups: [], venues: [] });
        const supabase = await createSupabaseServerClient();
        if (!supabase) return null;
        const pattern = `%${q}%`;
        const [eventsRes, groupsRes, venuesRes] = await Promise.all([
          supabase.from("events").select("id, slug, title, starts_at, status").ilike("title", pattern).eq("status", "published").limit(8),
          supabase.from("groups").select("id, slug, name, category_id").ilike("name", pattern).limit(8),
          supabase.from("venues").select("id, slug, name, type, address").ilike("name", pattern).eq("status", "active").limit(8),
        ]);
        return successResponse({
          events: eventsRes.data ?? [],
          groups: groupsRes.data ?? [],
          venues: venuesRes.data ?? [],
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

  if (routeKey(match.route) === "GET /api/auth/me") {
    if (hasLiveSupabaseAuth()) {
      return getLiveSessionResponse(request);
    }
    // Mock auth mode — always return mock session regardless of Supabase env
    return getMockResponse(match, request);
  }

  if (match.route.implementation === "mock" && !hasSupabaseEnv()) {
    return getMockResponse(match, request);
  }

  const key = routeKey(match.route);

  try {
    if (method !== "GET" && !hasTrustedOrigin(request)) {
      return forbiddenResponse("Cross-site state changes are not allowed.");
    }

    if (method === "GET") {
      // When Supabase is configured, try live data first for GET requests
      // so the UI shows real DB data (not mock/seeded stubs).
      if (hasSupabaseEnv()) {
        const liveRead = await handleLiveDataRequest(request, key, match);
        if (liveRead) return liveRead;
      }

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
      // Supabase is configured but handler returned null (client init failed)
      // Return error instead of silently falling back to mock data
      return NextResponse.json(
        { ok: false, error: "Service temporarily unavailable. Please try again." },
        { status: 503 },
      );
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

    console.error(`[API] Unhandled error in ${key}:`, error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return validationErrorResponse({
      formErrors: [message],
      fieldErrors: {},
    });
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

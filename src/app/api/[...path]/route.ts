import { NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";

import { env, hasLiveSupabaseAuth } from "@/lib/env";
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
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, signupSchema } from "@/lib/validators/auth";
import {
  eventCommentSchema,
  eventInputSchema,
  eventRatingSchema,
  eventSchema,
  rsvpSchema,
} from "@/lib/validators/events";
import { groupSchema } from "@/lib/validators/groups";
import { profileSchema } from "@/lib/validators/profiles";
import {
  bookingRequestSchema,
  venueAvailabilitySchema,
  venueDealSchema,
  venueReviewSchema,
  venueSchema,
} from "@/lib/validators/venues";
import { findApiSpecRoute, routeKey, type ApiMethod } from "@/lib/api/spec-routes";
import { mockAdminSettings, mockCatalog } from "@/lib/api/mock-data";
import { hasTrustedOrigin } from "@/lib/security/request";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  notFoundResponse,
  scaffoldResponse,
  serviceUnavailableResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api/responses";
import { forbiddenResponse } from "@/lib/security/response";

const bodySchemaMap: Record<string, ZodType> = {
  "POST /api/auth/signup": signupSchema,
  "POST /api/auth/login": loginSchema,
  "POST /api/auth/forgot-password": forgotPasswordSchema,
  "POST /api/auth/reset-password": resetPasswordSchema,
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
      return successResponse(mockCatalog.groups);
    case "GET /api/groups/[slug]":
      return successResponse(
        mockCatalog.groups.find((group) => group.slug === match.params.slug) ?? null,
      );
    case "GET /api/events":
      return successResponse(mockCatalog.events);
    case "GET /api/events/[slug]":
      return successResponse(
        mockCatalog.events.find((event) => event.slug === match.params.slug) ?? null,
      );
    case "GET /api/venues":
      return successResponse(mockCatalog.venues);
    case "GET /api/venues/[slug]":
      return successResponse(
        mockCatalog.venues.find((venue) => venue.slug === match.params.slug) ?? null,
      );
    case "GET /api/admin/settings":
      return successResponse(mockAdminSettings);
    default:
      return successResponse({
        route: pathname,
        params: match.params,
        note: "This endpoint is marked mock in the manifest but has not been given a custom payload yet.",
      });
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
          emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/login`,
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
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/reset-password`,
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

    if (match.route.category === "auth") {
      const response = hasLiveSupabaseAuth()
        ? await handleLiveAuthRequest(request, key)
        : await handleMockAuthRequest(request, key);

      if (response) {
        return response;
      }

      const validatedBody = await parseValidatedBody(request, key);
      return serviceUnavailableResponse(match, { body: validatedBody });
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

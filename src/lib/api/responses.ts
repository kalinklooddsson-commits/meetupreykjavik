import { NextResponse } from "next/server";

import type { ApiRouteMatch } from "@/lib/api/spec-routes";

export function notFoundResponse(path: string, method: string) {
  return NextResponse.json(
    {
      ok: false,
      error: "Not found",
      message: `No spec route matches ${method} ${path}.`,
    },
    { status: 404 },
  );
}

export function validationErrorResponse(error: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: "Validation failed",
      details: error,
    },
    { status: 400 },
  );
}

export function scaffoldResponse(match: ApiRouteMatch, options?: { body?: unknown; note?: string }) {
  return NextResponse.json(
    {
      ok: false,
      status: "scaffolded",
      category: match.route.category,
      method: match.route.method,
      route: match.route.pattern,
      params: match.params,
      description: match.route.description,
      note:
        options?.note ??
        "This feature is not yet available. Please try again later.",
      receivedBody: options?.body ?? null,
    },
    { status: 501 },
  );
}

export function serviceUnavailableResponse(match: ApiRouteMatch, options?: { body?: unknown }) {
  return NextResponse.json(
    {
      ok: false,
      status: "service_unavailable",
      category: match.route.category,
      method: match.route.method,
      route: match.route.pattern,
      params: match.params,
      description: match.route.description,
      note:
        "This service is temporarily unavailable. Please try again later.",
      receivedBody: options?.body ?? null,
    },
    { status: 503 },
  );
}

export function successResponse(data: unknown, options?: { status?: number }) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status: options?.status ?? 200 },
  );
}

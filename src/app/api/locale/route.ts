import { NextRequest, NextResponse } from "next/server";

import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import { locales, type Locale } from "@/types/domain";

const localeSet = new Set<Locale>(locales);

export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request)) {
    return forbiddenResponse("Cross-site locale changes are not allowed.");
  }

  const body = (await request.json().catch(() => null)) as
    | { locale?: string }
    | null;
  const locale = body?.locale;

  if (!locale || !localeSet.has(locale as Locale)) {
    return NextResponse.json(
      { error: "Invalid locale." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set({
    name: "NEXT_LOCALE",
    value: locale,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

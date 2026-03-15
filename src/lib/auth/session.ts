import type { User } from "@supabase/supabase-js";

import { hasLiveSupabaseAuth } from "@/lib/env";
import {
  portalPathForRole,
  readServerMockSession,
} from "@/lib/auth/mock-auth";
import type { MockSession } from "@/lib/auth/mock-auth-config";
import { isMockAuthAllowed } from "@/lib/auth/mock-auth-config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountTypes, locales, type AccountType, type Locale } from "@/types/domain";
import type { Database } from "@/types/database";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "slug" | "email" | "locale" | "account_type" | "is_premium" | "premium_tier"
>;
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

type SupabaseProfileSeed = {
  id: string;
  email?: string | null;
  displayName?: string | null;
  locale?: string | null;
  requestedAccountType?: string | null;
};

export type AppSession = MockSession;

function isAccountType(value: string | null | undefined): value is AccountType {
  return Boolean(value && accountTypes.includes(value as AccountType));
}

function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function titleCase(value: string) {
  return value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fallbackDisplayName(seed: SupabaseProfileSeed) {
  if (seed.displayName?.trim()) {
    return seed.displayName.trim();
  }

  const emailPrefix = seed.email?.split("@")[0];

  if (emailPrefix) {
    return titleCase(emailPrefix);
  }

  return "Meetup Reykjavik Member";
}

function normaliseLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : "en";
}

function normaliseAccountType(value: string | null | undefined): AccountType {
  return isAccountType(value) ? value : "user";
}

function mapProfileToSession(profile: ProfileRow): AppSession {
  return {
    id: profile.id,
    email: profile.email ?? "",
    displayName: profile.display_name,
    slug: profile.slug,
    accountType: normaliseAccountType(profile.account_type),
    locale: normaliseLocale(profile.locale),
    premiumTier: profile.is_premium ? (profile.premium_tier ?? "plus") : null,
  };
}

async function createUniqueSlug(baseValue: string, userId: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return slugify(baseValue) || `user-${userId.slice(0, 8)}`;
  }

  const baseSlug = slugify(baseValue) || `user-${userId.slice(0, 8)}`;

  for (let suffix = 0; suffix < 25; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  return `${baseSlug}-${userId.slice(0, 8)}`;
}

async function ensureSupabaseProfile(seed: SupabaseProfileSeed) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return null;
  }

  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("id, display_name, slug, email, locale, account_type, is_premium, premium_tier")
    .eq("id", seed.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing satisfies ProfileRow;
  }

  const displayName = fallbackDisplayName(seed);
  const locale = normaliseLocale(seed.locale);
  const slug = await createUniqueSlug(displayName, seed.id);

  const insertPayload: ProfileInsert = {
    id: seed.id,
    display_name: displayName,
    slug,
    email: seed.email ?? null,
    locale,
    account_type: normaliseAccountType(seed.requestedAccountType),
    city: "Reykjavik",
    languages: locale === "is" ? ["is", "en"] : ["en"],
  };

  const { data, error } = await admin
    .from("profiles")
    .insert(insertPayload as never)
    .select("id, display_name, slug, email, locale, account_type, is_premium, premium_tier")
    .single();

  if (error) {
    throw error;
  }

  return data satisfies ProfileRow;
}

export async function getOrCreateSessionForSupabaseUser(
  user: User,
  fallbackAccountType?: AccountType,
) {
  const profile = await ensureSupabaseProfile({
    id: user.id,
    email: user.email,
    displayName:
      typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
    locale:
      typeof user.user_metadata?.locale === "string"
        ? user.user_metadata.locale
        : null,
    requestedAccountType:
      typeof user.user_metadata?.requestedAccountType === "string"
        ? user.user_metadata.requestedAccountType
        : typeof user.user_metadata?.account_type === "string"
          ? user.user_metadata.account_type
          : fallbackAccountType ?? null,
  });

  return profile ? mapProfileToSession(profile) : null;
}

export async function getCurrentAppSession() {
  if (!hasLiveSupabaseAuth()) {
    // Block mock auth in production — force real Supabase auth
    if (!isMockAuthAllowed()) {
      return null;
    }
    return readServerMockSession();
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return getOrCreateSessionForSupabaseUser(user);
}

export { portalPathForRole };

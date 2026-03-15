import type { AccountType, Locale } from "@/types/domain";

/**
 * Production guard — mock auth must NEVER be used in production.
 * Check this before calling any mock auth function.
 */
export function isMockAuthAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_MOCK_AUTH === "true";
}

export const MOCK_PASSWORD_HINT = "meetup123";

export type MockSession = {
  id: string;
  email: string;
  displayName: string;
  slug: string;
  accountType: AccountType;
  locale: Locale;
  premiumTier?: string | null;
};

export type MockAccount = MockSession & {
  password: string;
};

export const mockAccounts: MockAccount[] = [
  {
    id: "mock-user",
    email: "anna@example.com",
    displayName: "Anna Jonsdottir",
    slug: "anna-jonsdottir",
    accountType: "user",
    locale: "en",
    premiumTier: "plus",
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-organizer",
    email: "kari@meetupreykjavik.is",
    displayName: "Kari Sigurdsson",
    slug: "kari-sigurdsson",
    accountType: "organizer",
    locale: "en",
    premiumTier: "pro",
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-venue",
    email: "lebowski@meetupreykjavik.is",
    displayName: "Lebowski Bar",
    slug: "lebowski-bar",
    accountType: "venue",
    locale: "en",
    premiumTier: "partner",
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-admin",
    email: "admin@meetupreykjavik.is",
    displayName: "Platform Admin",
    slug: "admin",
    accountType: "admin",
    locale: "en",
    premiumTier: null,
    password: MOCK_PASSWORD_HINT,
  },
];

/**
 * Demo accounts shown on the login page.
 *
 * When ENABLE_SUPABASE_AUTH=true, these use real Supabase credentials.
 * When mock-mode is active, they use the mock accounts above.
 */
export const demoAuthAccounts = [
  {
    email: "anna@example.com",
    displayName: "Anna Jonsdottir",
    accountType: "user" as AccountType,
    passwordHint: MOCK_PASSWORD_HINT,
  },
  {
    email: "kari@meetupreykjavik.is",
    displayName: "Kari Sigurdsson",
    accountType: "organizer" as AccountType,
    passwordHint: MOCK_PASSWORD_HINT,
  },
  {
    email: "lebowski@meetupreykjavik.is",
    displayName: "Lebowski Bar",
    accountType: "venue" as AccountType,
    passwordHint: MOCK_PASSWORD_HINT,
  },
  {
    email: "admin@meetupreykjavik.is",
    displayName: "Platform Admin",
    accountType: "admin" as AccountType,
    passwordHint: MOCK_PASSWORD_HINT,
  },
];

export function portalPathForRole(accountType: AccountType) {
  switch (accountType) {
    case "admin":
      return "/admin";
    case "venue":
      return "/venue/dashboard";
    case "organizer":
      return "/organizer";
    case "user":
    default:
      return "/dashboard";
  }
}

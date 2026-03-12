import type { AccountType, Locale } from "@/types/domain";

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
    email: "user@meetupreykjavik.is",
    displayName: "Kari Sigurdsson",
    slug: "kari-sigurdsson",
    accountType: "user",
    locale: "en",
    premiumTier: null, // Free tier member
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-organizer",
    email: "organizer@meetupreykjavik.is",
    displayName: "Bjorn Olafsson",
    slug: "bjorn-olafsson",
    accountType: "organizer",
    locale: "en",
    premiumTier: "pro", // Organizer Pro tier for testing
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-venue",
    email: "venue@meetupreykjavik.is",
    displayName: "Lebowski Bar",
    slug: "lebowski-bar",
    accountType: "venue",
    locale: "en",
    premiumTier: "partner", // Venue Partner tier for testing
    password: MOCK_PASSWORD_HINT,
  },
  {
    id: "mock-admin",
    email: "admin@meetupreykjavik.is",
    displayName: "Super Admin",
    slug: "super-admin",
    accountType: "admin",
    locale: "en",
    premiumTier: null, // Admin gets everything regardless
    password: MOCK_PASSWORD_HINT,
  },
];

export const demoAuthAccounts = mockAccounts.map((account) => ({
  email: account.email,
  displayName: account.displayName,
  accountType: account.accountType,
  passwordHint: account.password,
}));

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

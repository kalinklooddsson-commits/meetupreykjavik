export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ?? "",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ?? "",
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ?? "",
  PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN ?? "meetupreykjavik.com",
} as const;

export function hasSupabaseEnv() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

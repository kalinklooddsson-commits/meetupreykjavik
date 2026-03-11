import { AuthPanel } from "@/components/ui/auth-panel";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      mode="reset-password"
      eyebrow="Reset password"
      title="Set a new password and get back in"
      description="This reset screen already mirrors the final recovery step. It accepts a mock token tonight and can later be wired to Supabase recovery tokens without redesign."
      primaryLabel="Set new password"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

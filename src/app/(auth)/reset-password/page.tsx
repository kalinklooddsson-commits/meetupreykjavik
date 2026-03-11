import { AuthPanel } from "@/components/ui/auth-panel";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      mode="reset-password"
      eyebrow="Reset password"
      title="Set a new password and get back in"
      description="This reset screen accepts the recovery token from the email link and returns the user to login without redesigning the auth flow."
      primaryLabel="Set new password"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

import { AuthPanel } from "@/components/ui/auth-panel";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      mode="forgot-password"
      eyebrow="Password reset"
      title="Recover your account"
      description="Enter your email and we'll send a recovery link."
      primaryLabel="Send recovery email"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

import { AuthPanel } from "@/components/ui/auth-panel";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      mode="forgot-password"
      eyebrow="Password reset"
      title="Reset your password"
      description="Enter your email address and we'll send you a link to create a new password."
      primaryLabel="Send recovery email"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

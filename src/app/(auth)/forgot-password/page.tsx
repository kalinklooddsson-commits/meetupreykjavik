import { AuthPanel } from "@/components/ui/auth-panel";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      mode="forgot-password"
      eyebrow="Password reset"
      title="Recover access without losing the flow"
      description="This mocked recovery surface already holds the final route and UX shape. Live recovery email delivery can be connected later without changing the frontend."
      primaryLabel="Send recovery email"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

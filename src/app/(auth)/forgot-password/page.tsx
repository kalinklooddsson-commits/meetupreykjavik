import { AuthPanel } from "@/components/ui/auth-panel";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      mode="forgot-password"
      eyebrow="Password reset"
      title="Recover access without losing the flow"
      description="Send a recovery email, keep the same route shape, and return people to the correct portal without changing the frontend design."
      primaryLabel="Send recovery email"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

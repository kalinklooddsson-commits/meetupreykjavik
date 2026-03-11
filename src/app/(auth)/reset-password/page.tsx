import { AuthPanel } from "@/components/ui/auth-panel";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      mode="reset-password"
      eyebrow="Reset password"
      title="Set a new password"
      description="Enter your reset token and choose a new password."
      primaryLabel="Set new password"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

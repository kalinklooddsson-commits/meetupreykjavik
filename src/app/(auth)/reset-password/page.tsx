import { AuthPanel } from "@/components/ui/auth-panel";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      mode="reset-password"
      eyebrow="New password"
      title="Choose a new password"
      description="Enter the code from your recovery email and set a new password."
      primaryLabel="Set new password"
      secondaryHref="/login"
      secondaryLabel="Back to login"
    />
  );
}

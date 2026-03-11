import { AuthPanel } from "@/components/ui/auth-panel";

export default function SignupPage() {
  return (
    <AuthPanel
      mode="signup"
      eyebrow="Signup"
      title="Create the account that matches your role"
      description="Choose whether you are joining as a member, organizer, venue partner, or admin. The next steps already reflect the business and dashboard structure of the platform."
      primaryLabel="Create account"
      secondaryHref="/login"
      secondaryLabel="Already have an account? Sign in"
    />
  );
}

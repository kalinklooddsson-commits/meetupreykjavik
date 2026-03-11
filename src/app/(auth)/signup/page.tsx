import { AuthPanel } from "@/components/ui/auth-panel";

export default function SignupPage() {
  return (
    <AuthPanel
      mode="signup"
      eyebrow="Get started"
      title="Create your account"
      description="Join as a member, organizer, or venue partner."
      primaryLabel="Create account"
      secondaryHref="/login"
      secondaryLabel="Already have an account? Sign in"
    />
  );
}

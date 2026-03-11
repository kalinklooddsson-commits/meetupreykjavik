import { AuthPanel } from "@/components/ui/auth-panel";

export default function SignupPage() {
  return (
    <AuthPanel
      mode="signup"
      eyebrow="Sign up"
      title="Join Meetup Reykjavik"
      description="Create your account and start discovering events, groups, and venues in the city."
      primaryLabel="Create account"
      secondaryHref="/login"
      secondaryLabel="Already have an account? Sign in"
    />
  );
}

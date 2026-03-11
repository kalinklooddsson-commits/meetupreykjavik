import { AuthPanel } from "@/components/ui/auth-panel";

export default function LoginPage() {
  return (
    <AuthPanel
      mode="login"
      eyebrow="Login"
      title="Return to your lane in the city"
      description="Sign in with email and password now. The funnel already routes by role so members, organizers, venues, and admin all land in the correct product surface."
      primaryLabel="Sign in"
      secondaryHref="/signup"
      secondaryLabel="Need an account? Create one"
    />
  );
}

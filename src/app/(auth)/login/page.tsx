import { AuthPanel } from "@/components/ui/auth-panel";

export default function LoginPage() {
  return (
    <AuthPanel
      mode="login"
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Enter your email and password to access your dashboard."
      primaryLabel="Sign in"
      secondaryHref="/signup"
      secondaryLabel="Need an account? Create one"
    />
  );
}

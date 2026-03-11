import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { getCurrentSession } from "@/lib/auth/guards";

export default async function OnboardingPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/signup");
  }

  return (
    <OnboardingFlow
      displayName={session.displayName}
      accountType={session.accountType}
      defaultLocale={session.locale}
    />
  );
}

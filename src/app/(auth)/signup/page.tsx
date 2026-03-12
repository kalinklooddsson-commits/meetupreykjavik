import { getTranslations } from "next-intl/server";

import { AuthPanel } from "@/components/ui/auth-panel";

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");
  return (
    <AuthPanel
      mode="signup"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      primaryLabel={t("primaryLabel")}
      secondaryHref="/login"
      secondaryLabel={t("secondaryLabel")}
    />
  );
}

import { getTranslations } from "next-intl/server";

import { AuthPanel } from "@/components/ui/auth-panel";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <AuthPanel
      mode="login"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      primaryLabel={t("primaryLabel")}
      secondaryHref="/signup"
      secondaryLabel={t("secondaryLabel")}
    />
  );
}

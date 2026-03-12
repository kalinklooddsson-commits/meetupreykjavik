import { getTranslations } from "next-intl/server";

import { AuthPanel } from "@/components/ui/auth-panel";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");
  return (
    <AuthPanel
      mode="forgot-password"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      primaryLabel={t("primaryLabel")}
      secondaryHref="/login"
      secondaryLabel={t("secondaryLabel")}
    />
  );
}

import { getTranslations } from "next-intl/server";

import { AuthPanel } from "@/components/ui/auth-panel";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.resetPassword");
  return (
    <AuthPanel
      mode="reset-password"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      primaryLabel={t("primaryLabel")}
      secondaryHref="/login"
      secondaryLabel={t("secondaryLabel")}
    />
  );
}

import {defineRouting} from "next-intl/routing";
import {locales} from "@/types/domain";

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "never",
});

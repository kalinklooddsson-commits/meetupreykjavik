import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const uiSans = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const displaySerif = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const locale = await getLocale();

  const siteTitle = t("siteTitle");
  const siteDescription = t("siteDescription");
  const titleTemplate = t("siteTitleTemplate");

  return {
    title: {
      default: siteTitle,
      template: titleTemplate,
    },
    description: siteDescription,
    metadataBase: new URL("https://meetupreykjavik.vercel.app"),
    openGraph: {
      type: "website",
      locale: locale === "is" ? "is_IS" : "en_IS",
      siteName: "MeetupReykjavik",
      title: siteTitle,
      description: siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("font-sans", uiSans.variable, displaySerif.variable)}
    >
      <body className="antialiased overflow-x-hidden">
        <NextIntlClientProvider>
          <ToastProvider>
            {children}
            <ScrollToTop />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

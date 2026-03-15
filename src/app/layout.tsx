import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
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
      className={cn("font-sans", geist.variable)}
    >
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased overflow-x-hidden`}>
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

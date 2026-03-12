import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";

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

export const metadata: Metadata = {
  title: {
    default: "MeetupReykjavik — Find your people in Reykjavik",
    template: "%s | MeetupReykjavik",
  },
  description:
    "Discover events, join groups, and explore venue partners across Reykjavik. Free to join, built for the local community.",
  metadataBase: new URL("https://meetupreykjavik.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_IS",
    siteName: "MeetupReykjavik",
    title: "MeetupReykjavik — Find your people in Reykjavik",
    description:
      "Discover events, join groups, and explore venue partners across Reykjavik. Free to join, built for the local community.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetupReykjavik — Find your people in Reykjavik",
    description:
      "Discover events, join groups, and explore venue partners across Reykjavik.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}
    >
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        <NextIntlClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

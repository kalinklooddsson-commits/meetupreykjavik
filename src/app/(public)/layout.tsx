import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell page-backdrop">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="public-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

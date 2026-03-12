import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";

type PortalPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  links: Array<{ href: Route; label: string; active?: boolean }>;
  panelTitle: string;
  panelBody: string;
};

export function PortalPlaceholder({
  eyebrow,
  title,
  description,
  links,
  panelTitle,
  panelBody,
}: PortalPlaceholderProps) {
  return (
    <PortalShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      links={links}
    >
      <div className="paper-panel rounded-[1.75rem] p-7">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-brand-text-light">
          {panelTitle}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-brand-text-muted">
          {panelBody}
        </p>
      </div>
    </PortalShell>
  );
}

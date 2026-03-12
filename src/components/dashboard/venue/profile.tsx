import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  KeyValueList,
  ToneBadge,
} from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { resolveVenueTier } from "@/lib/entitlements";

/* ── Helpers ─────────────────────────────────────────────────── */

function venueLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/venue/dashboard" as Route },
    { key: "bookings", label: "Bookings", href: "/venue/bookings" as Route },
    { key: "availability", label: "Availability", href: "/venue/availability" as Route },
    { key: "deals", label: "Deals", href: "/venue/deals" as Route },
    { key: "events", label: "Events", href: "/venue/events" as Route },
    { key: "reviews", label: "Reviews", href: "/venue/reviews" as Route },
    { key: "analytics", label: "Analytics", href: "/venue/analytics" as Route },
    { key: "profile", label: "Profile", href: "/venue/profile" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueProfileScreen() {
  const data = await getVenuePortalData();
  const tier = resolveVenueTier(data.partnershipTier);

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Venue Profile"
      description="Public profile information visible to organizers and attendees."
      links={venueLinks("profile")}
      roleMode="venue"
    >
      {/* ── Tier badge ───────────────────────────────────── */}
      <Surface
        eyebrow="Partnership"
        title={data.venue.name}
        description="Your venue listing and partnership details."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ToneBadge tone={tier === "premium" ? "indigo" : tier === "partner" ? "sage" : "neutral"}>
            {data.partnershipTier}
          </ToneBadge>
          <span className="text-sm text-brand-text-muted">
            Onboarding: {data.onboarding.completion}
          </span>
        </div>
      </Surface>

      {/* ── Profile sections ─────────────────────────────── */}
      {data.profileSections.map((section) => (
        <Surface
          key={section.key}
          eyebrow="Profile"
          title={section.title}
          description={`Your ${section.title.toLowerCase()} as shown on your public venue page.`}
          actionLabel="Edit"
          actionHref={"/venue/profile" as Route}
        >
          <KeyValueList
            items={section.items.map((item, i) => ({
              key: `${section.key}-${i}`,
              label: item.label,
              value: item.value,
            }))}
          />
        </Surface>
      ))}
    </PortalShell>
  );
}

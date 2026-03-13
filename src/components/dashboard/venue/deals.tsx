import type { Route } from "next";
import { Tag } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getVenuePortalData } from "@/lib/dashboard-fetchers";
import { venueHasFeature } from "@/lib/entitlements";
import { VenueDealStudio } from "./panels";

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

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|counter/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function VenueDealsScreen() {
  const data = await getVenuePortalData();
  const hasDealManagement = venueHasFeature(data.partnershipTier, "deal_management");

  if (!hasDealManagement) {
    return (
      <PortalShell
        eyebrow="Venue portal"
        title="Deals"
        description="Create and manage member and organizer deals."
        links={venueLinks("deals")}
        roleMode="venue"
      >
        <Surface
          eyebrow="Upgrade required"
          title="Deal Management"
          description="Upgrade to the Partner or Premium tier to create deals and track redemption."
        >
          <div className="flex items-center gap-4 rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
            <Tag className="h-8 w-8 text-brand-text-muted" />
            <div>
              <p className="text-sm font-medium text-brand-text">
                Deal management is available on Partner and Premium plans.
              </p>
              <p className="mt-1 text-sm text-brand-text-muted">
                Offer welcome drinks, group discounts, and special perks to members and organizers booking your venue.
              </p>
            </div>
          </div>
        </Surface>
      </PortalShell>
    );
  }

  const activeDeals = data.deals.filter((d) => /active/i.test(d.status));
  const draftDeals = data.deals.filter((d) => /draft/i.test(d.status));

  return (
    <PortalShell
      eyebrow="Venue portal"
      title="Deals"
      description="Manage perks and promotions for members and organizers."
      links={venueLinks("deals")}
      roleMode="venue"
    >
      {/* ── Active deals ─────────────────────────────────── */}
      <Surface
        eyebrow="Live"
        title="Active deals"
        description="Deals currently available to members and organizers."
      >
        <DashboardTable
          columns={["Deal", "Type", "Tier", "Redemption", "Status", "Note"]}
          rows={activeDeals.map((d) => ({
            key: d.key,
            cells: [
              <span key="title" className="font-medium">{d.title}</span>,
              <ToneBadge key="type" tone="neutral">{d.type}</ToneBadge>,
              <ToneBadge key="tier" tone="indigo">{d.tier}</ToneBadge>,
              <span key="redemption" className="text-sm font-medium text-brand-text">{d.redemption}</span>,
              <ToneBadge key="status" tone={statusTone(d.status)}>{d.status}</ToneBadge>,
              <span key="note" className="text-brand-text-muted">{d.note}</span>,
            ],
          }))}
          caption="Active venue deals"
        />
      </Surface>

      {/* ── Draft deals ──────────────────────────────────── */}
      {draftDeals.length > 0 && (
        <Surface
          eyebrow="Drafts"
          title="Draft deals"
          description="Deals that are not yet live. Finalize and publish when ready."
        >
          <DashboardTable
            columns={["Deal", "Type", "Tier", "Status", "Note"]}
            rows={draftDeals.map((d) => ({
              key: d.key,
              cells: [
                <span key="title" className="font-medium">{d.title}</span>,
                <ToneBadge key="type" tone="neutral">{d.type}</ToneBadge>,
                <ToneBadge key="tier" tone="sand">{d.tier}</ToneBadge>,
                <ToneBadge key="status" tone="sand">{d.status}</ToneBadge>,
                <span key="note" className="text-brand-text-muted">{d.note}</span>,
              ],
            }))}
            caption="Draft venue deals"
          />
        </Surface>
      )}

      {/* ── Create & manage deals (interactive) ────────── */}
      <Surface
        eyebrow="Manage"
        title="Deal studio"
        description="Create new deals and manage existing ones."
      >
        <VenueDealStudio deals={data.deals} />
      </Surface>
    </PortalShell>
  );
}

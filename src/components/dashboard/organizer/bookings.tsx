import type { Route } from "next";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  DecisionStrip,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";
import { organizerHasFeature } from "@/lib/entitlements";
import { ArrowRight, Lock } from "lucide-react";
import { OrganizerVenueRequestStudio } from "./panels";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "analytics", label: "Analytics", href: "/organizer/analytics" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
    { key: "notifications", label: "Notifications", href: "/organizer/notifications" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|confirmed/i.test(s))
    return "sage";
  if (/pending|draft|waitlisted|countered/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerBookingsScreen() {
  const data = await getOrganizerPortalData();
  const hasVenueWorkflows = organizerHasFeature(null, "venue_request_workflows");

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Bookings"
      description="Track your venue booking requests, counter-offers, and confirmations."
      links={organizerLinks("bookings")}
      roleMode="organizer"
    >
      <div className="space-y-6">
        {/* Tier gate for venue request workflows */}
        {!hasVenueWorkflows && (
          <DecisionStrip
            eyebrow="Feature locked"
            title="Venue request workflows"
            description="Advanced booking workflows are available on the Pro and Studio plans. Upgrade to send structured venue requests and manage counter-offers."
            items={[
              {
                key: "upgrade",
                label: "Pro feature",
                summary: "Unlock venue request workflows",
                meta: "Upgrade to send booking requests with full context and manage replies in one place.",
                tone: "indigo",
              },
            ]}
          />
        )}

        {/* Booking pipeline */}
        <Surface
          eyebrow="Pipeline"
          title="Booking pipeline"
          description="All your venue booking requests and their current status."
        >
          {data.bookingPipeline.length > 0 ? (
            <DashboardTable
              columns={["Venue", "Status", "Date", "Note"]}
              rows={data.bookingPipeline.map((b) => ({
                key: b.key,
                cells: [
                  <span key="venue" className="font-medium text-brand-text">
                    {b.venue}
                  </span>,
                  <ToneBadge key="status" tone={statusTone(b.status)}>
                    {b.status}
                  </ToneBadge>,
                  b.date,
                  <span key="note" className="text-brand-text-muted">
                    {b.note}
                  </span>,
                ],
              }))}
              caption="Booking pipeline"
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No booking requests yet. Request a venue booking to get started.
            </p>
          )}
        </Surface>
      </div>
    </PortalShell>
  );
}

export async function OrganizerVenuesScreen() {
  const data = await getOrganizerPortalData();
  const hasVenueWorkflows = organizerHasFeature(null, "venue_request_workflows");

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Venues"
      description="Browse venue matches and send booking requests to partners."
      links={organizerLinks("venues")}
      roleMode="organizer"
    >
      <div className="space-y-6">
        {/* Venue matches */}
        <Surface
          eyebrow="Recommendations"
          title="Venue matches"
          description="Venues ranked by fit score based on your event history, group size, and format preferences."
        >
          <DashboardTable
            columns={["Venue", "Fit score", "Next available slot", "Why it fits"]}
            rows={data.venueMatches.map((v) => ({
              key: v.venue.slug,
              cells: [
                <div key="venue">
                  <Link
                    href={`/venues/${v.venue.slug}` as Route}
                    className="font-medium text-brand-indigo hover:underline"
                  >
                    {v.venue.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-brand-text-muted">
                    {v.venue.area}
                  </div>
                </div>,
                <ToneBadge key="score" tone="indigo">
                  {v.score}
                </ToneBadge>,
                <span key="slot" className="text-sm">
                  {v.nextSlot}
                </span>,
                <span key="fit" className="text-sm text-brand-text-muted">
                  {v.fit}
                </span>,
              ],
            }))}
            caption="Venue matches by fit score"
          />
        </Surface>

        {/* Venue request form */}
        {hasVenueWorkflows ? (
          <Surface
            eyebrow="Send request"
            title="New venue booking request"
            description="Select a venue and send a structured booking request."
          >
            <OrganizerVenueRequestStudio venues={data.venueMatches} />
          </Surface>
        ) : (
          <div className="rounded-xl border border-brand-border-light bg-brand-sand-light p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand-text-muted" />
                <div>
                  <div className="text-sm font-semibold text-brand-text">
                    Venue request workflows
                  </div>
                  <p className="mt-0.5 text-sm text-brand-text-muted">
                    Upgrade to Pro to send structured booking requests and
                    manage venue counter-offers directly from your dashboard.
                  </p>
                </div>
              </div>
              <Link
                href={"/pricing" as Route}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-indigo/90"
              >
                View plans
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

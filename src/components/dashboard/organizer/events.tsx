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
import { resolveOrganizerTier, getMaxActiveEvents } from "@/lib/entitlements";
import { AlertTriangle, ArrowRight } from "lucide-react";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|countered/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

export async function OrganizerEventsScreen() {
  const data = await getOrganizerPortalData();
  const tier = resolveOrganizerTier(null);
  const maxEvents = getMaxActiveEvents(null);
  const activeCount = data.events.length;
  const atLimit = tier === "starter" && activeCount >= maxEvents;

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Events"
      description="All events you manage. Create, edit, and track attendance from here."
      links={organizerLinks("events")}
      roleMode="organizer"
      primaryAction={
        atLimit
          ? undefined
          : { href: "/organizer/events/new" as Route, label: "Create event" }
      }
    >
      <div className="space-y-6">
        {/* Tier limit banner */}
        {atLimit && (
          <DecisionStrip
            eyebrow="Plan limit"
            title="You have reached your active event limit"
            description={`The Starter plan allows up to ${maxEvents} active events. Upgrade to Pro or Studio for unlimited events and advanced features.`}
            items={[
              {
                key: "limit",
                label: "At limit",
                summary: `${activeCount} of ${maxEvents} events active`,
                meta: "Archive or complete an event to free a slot, or upgrade your plan.",
                tone: "coral",
              },
            ]}
          />
        )}

        {/* Events table */}
        <Surface
          eyebrow="All events"
          title="Your events"
          description="Click an event title to see its full detail page with attendees, timeline, and check-in tools."
        >
          <DashboardTable
            columns={["Event", "Status", "Date", "RSVPs / Cap", "Revenue", "Actions"]}
            rows={data.events.map((e) => ({
              key: e.slug,
              cells: [
                <div key="title">
                  <Link
                    href={`/organizer/events/${e.slug}` as Route}
                    className="font-medium text-brand-indigo hover:underline"
                  >
                    {e.title}
                  </Link>
                  <div className="mt-0.5 text-xs text-brand-text-muted">
                    {e.groupName}
                  </div>
                </div>,
                <ToneBadge key="status" tone={statusTone(e.status)}>
                  {e.status}
                </ToneBadge>,
                e.dateLabel,
                <span key="rsvps" className="tabular-nums">
                  {e.rsvps} / {e.capacity}
                  {e.waitlist > 0 && (
                    <span className="ml-1 text-xs text-brand-text-muted">
                      +{e.waitlist} wl
                    </span>
                  )}
                </span>,
                <span key="revenue" className="tabular-nums">
                  {e.revenue}
                </span>,
                <Link
                  key="detail"
                  href={`/organizer/events/${e.slug}` as Route}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-indigo hover:underline"
                >
                  Manage
                  <ArrowRight className="h-3 w-3" />
                </Link>,
              ],
            }))}
            caption="All managed events"
          />
        </Surface>

        {/* Templates surface */}
        {data.templates.length > 0 && (
          <Surface
            eyebrow="Reusable formats"
            title="Event templates"
            description="Clone a proven format to save setup time on your next event."
          >
            <div className="flex flex-wrap gap-2">
              {data.templates.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-lg border border-brand-border-light bg-brand-sand-light px-3 py-1.5 text-sm font-medium text-brand-text"
                >
                  {t}
                </span>
              ))}
            </div>
          </Surface>
        )}

        {/* Upgrade nudge for starter tier */}
        {tier === "starter" && !atLimit && (
          <div className="rounded-xl border border-brand-border-light bg-brand-sand-light p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-text-muted" />
                <div>
                  <div className="text-sm font-semibold text-brand-text">
                    {activeCount} of {maxEvents} event slots used
                  </div>
                  <p className="mt-0.5 text-sm text-brand-text-muted">
                    Upgrade to Pro for unlimited events, approval controls, and venue booking workflows.
                  </p>
                </div>
              </div>
              <Link
                href={"/pricing" as Route}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo/90"
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

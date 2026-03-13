import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  ActivityFeed,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { MessageActions } from "../member/message-actions";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";

function organizerLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/organizer" as Route },
    { key: "events", label: "Events", href: "/organizer/events" as Route },
    { key: "groups", label: "Groups", href: "/organizer/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/organizer/bookings" as Route },
    { key: "venues", label: "Venues", href: "/organizer/venues" as Route },
    { key: "analytics", label: "Analytics", href: "/organizer/analytics" as Route },
    { key: "messages", label: "Messages", href: "/organizer/messages" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function messageTone(status: string): DashboardTone {
  if (/needs reply|urgent/i.test(status)) return "coral";
  if (/unread|new/i.test(status)) return "indigo";
  if (/read|resolved|closed/i.test(status)) return "sage";
  return "neutral";
}

export async function OrganizerMessagesScreen() {
  const data = await getOrganizerPortalData();

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Messages"
      description="Conversations with attendees, venue partners, and co-hosts."
      links={organizerLinks("messages")}
      roleMode="organizer"
    >
      <div className="space-y-6">
        <Surface
          eyebrow="Inbox"
          title="Messages"
          description="All conversations related to your events and venue partnerships."
        >
          <DashboardTable
            columns={["From", "Subject", "Channel", "Status", "Action"]}
            rows={data.messages.map((m) => ({
              key: m.key,
              cells: [
                <div key="from">
                  <span className="font-medium text-brand-text">
                    {m.counterpart}
                  </span>
                  <div className="mt-0.5 text-xs text-brand-text-muted">
                    {m.role}
                  </div>
                </div>,
                <div key="subject">
                  <div className="font-medium text-brand-text">{m.subject}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-brand-text-muted">
                    {m.preview}
                  </p>
                </div>,
                <ToneBadge key="channel" tone="neutral">
                  {m.channel}
                </ToneBadge>,
                <ToneBadge key="status" tone={messageTone(m.status)}>
                  {m.status}
                </ToneBadge>,
                <MessageActions key="action" messageKey={m.key} subject={m.subject} />,
              ],
            }))}
            caption="Organizer messages"
          />
        </Surface>
      </div>
    </PortalShell>
  );
}

export async function OrganizerNotificationsScreen() {
  const data = await getOrganizerPortalData();

  const notificationFeed = data.notifications.map((n) => ({
    key: n.key,
    title: n.title,
    detail: n.detail,
    meta: `${n.channel} — ${n.meta}`,
    tone: n.tone,
  }));

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Notifications"
      description="System alerts, approval reminders, and milestone updates for your events."
      links={organizerLinks("messages")}
      roleMode="organizer"
    >
      <div className="space-y-6">
        <Surface
          eyebrow="Alerts"
          title="Notifications"
          description="Important updates about your events, approvals, revenue targets, and system actions."
        >
          <ActivityFeed items={notificationFeed} />
        </Surface>
      </div>
    </PortalShell>
  );
}

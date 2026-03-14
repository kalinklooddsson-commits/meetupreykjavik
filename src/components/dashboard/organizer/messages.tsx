import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  ActivityFeed,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { MessageActions, MessageStatusBadge, ComposeMessageButton } from "../member/message-actions";
import { MarkAllReadButton } from "../notification-actions";
import { getOrganizerPortalData } from "@/lib/dashboard-fetchers";
import { getUserConversations } from "@/lib/db/messages";
import { getUser } from "@/lib/auth/guards";

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
  const session = await getUser().catch(() => null);

  // Fetch real messages from the database for the organizer
  let messages: Array<{
    key: string;
    counterpart: string;
    role: string;
    subject: string;
    preview: string;
    channel: string;
    status: string;
  }> = [];

  if (session?.id) {
    try {
      const dbMessages = await getUserConversations(session.id);
      messages = dbMessages.map((m: Record<string, unknown>) => ({
        key: (m.id as string) ?? "",
        counterpart: (m.other_display_name as string) ?? "Unknown",
        role: "User",
        subject: (m.subject as string) ?? "No subject",
        preview: ((m.body as string) ?? "").slice(0, 100),
        channel: "Direct",
        status: m.is_read ? "Read" : "Unread",
      }));
    } catch {
      // Fall back to mock data from organizer portal
    }
  }

  // If no real messages, use mock/seeded data
  if (messages.length === 0) {
    const data = await getOrganizerPortalData();
    messages = data.messages;
  }

  return (
    <PortalShell
      eyebrow="Organizer portal"
      title="Messages"
      description="Conversations with attendees, venue partners, and co-hosts."
      links={organizerLinks("messages")}
      roleMode="organizer"
    >
      {/* ── Compose button ──────────────────────────────────── */}
      <ComposeMessageButton />

      <div className="space-y-6">
        <Surface
          eyebrow="Inbox"
          title="Messages"
          description="All conversations related to your events and venue partnerships."
        >
          {messages.length > 0 ? (
            <DashboardTable
              columns={["From", "Subject", "Channel", "Status", "Action"]}
              rows={messages.map((m) => ({
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
                  <MessageStatusBadge key="status" messageKey={m.key} serverStatus={m.status} />,
                  <MessageActions key="action" messageKey={m.key} subject={m.subject} />,
                ],
              }))}
              caption="Organizer messages"
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No messages yet. You&apos;ll see conversations with venues and attendees here.
            </p>
          )}
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

  // Unread notification IDs for "Mark all read"
  const unreadIds = data.notifications
    .filter((n) => n.status === "Unread" || n.status === "New" || n.tone === "coral" || n.tone === "indigo")
    .map((n) => n.key);

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
          {unreadIds.length > 0 && (
            <div className="mb-4 flex justify-end">
              <MarkAllReadButton ids={unreadIds} />
            </div>
          )}
          <ActivityFeed items={notificationFeed} />
        </Surface>
      </div>
    </PortalShell>
  );
}

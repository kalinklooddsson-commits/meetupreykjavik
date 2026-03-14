import type { Route } from "next";
import { MessageSquare, Users, AlertCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { MessageActions, MessageStatusBadge, ComposeMessageButton } from "../member/message-actions";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import { getUserConversations } from "@/lib/db/messages";
import { getUser } from "@/lib/auth/guards";

function adminLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/admin" as Route },
    { key: "users", label: "Users", href: "/admin/users" as Route },
    { key: "events", label: "Events", href: "/admin/events" as Route },
    { key: "venues", label: "Venues", href: "/admin/venues" as Route },
    { key: "groups", label: "Groups", href: "/admin/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/admin/bookings" as Route },
    { key: "revenue", label: "Revenue", href: "/admin/revenue" as Route },
    { key: "payouts", label: "Payouts", href: "/admin/payouts" as Route },
    { key: "messages", label: "Messages", href: "/admin/messages" as Route },
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function messageTone(status: string): DashboardTone {
  if (/needs reply|urgent|unread/i.test(status)) return "coral";
  if (/new/i.test(status)) return "indigo";
  if (/read|resolved|closed/i.test(status)) return "sage";
  return "neutral";
}

export async function AdminMessagesScreen() {
  const session = await getUser().catch(() => null);

  // Fetch real messages from the database for the admin user
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
      // Fall back to mock data from admin portal
    }
  }

  // If no real messages, use mock/seeded data
  if (messages.length === 0) {
    const data = await getAdminPortalData();
    // The admin portal data doesn't have a messages array by default,
    // so we provide a helpful empty state
  }

  const unreadCount = messages.filter((m) => m.status === "Unread").length;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Messages"
      description="View and manage messages from organizers, venues, and members."
      links={adminLinks("messages")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Compose button ──────────────────────────────────── */}
      <ComposeMessageButton />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total messages"
          value={String(messages.length)}
          detail="Across all user communications."
          icon={MessageSquare}
          tone="indigo"
        />
        <StatCard
          label="Unread"
          value={String(unreadCount)}
          detail={unreadCount > 0 ? "Messages awaiting response." : "All caught up."}
          tone={unreadCount > 0 ? "coral" : "sage"}
          icon={AlertCircle}
        />
        <StatCard
          label="Users reached"
          value={String(new Set(messages.map((m) => m.counterpart)).size)}
          detail="Unique contacts in your inbox."
          icon={Users}
          tone="neutral"
        />
      </div>

      {/* ── Messages table ──────────────────────────────────── */}
      <Surface
        eyebrow="Inbox"
        title="All messages"
        description="Messages from organizers, venues, and members across the platform."
      >
        {messages.length > 0 ? (
          <DashboardTable
            columns={["From", "Subject", "Channel", "Status", "Action"]}
            rows={messages.map((m) => ({
              key: m.key,
              cells: [
                <div key="from" className="flex items-center gap-2">
                  <AvatarStamp name={m.counterpart} size="sm" />
                  <div>
                    <div className="font-medium text-brand-text">{m.counterpart}</div>
                    <div className="text-xs text-brand-text-muted">{m.role}</div>
                  </div>
                </div>,
                <div key="subject">
                  <div className="font-medium">{m.subject}</div>
                  <div className="mt-0.5 text-xs text-brand-text-muted line-clamp-1">
                    {m.preview}
                  </div>
                </div>,
                <ToneBadge key="channel" tone="neutral">{m.channel}</ToneBadge>,
                <MessageStatusBadge key="status" messageKey={m.key} serverStatus={m.status} />,
                <MessageActions key="action" messageKey={m.key} subject={m.subject} />,
              ],
            }))}
            caption="Admin messages"
          />
        ) : (
          <div className="py-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-brand-text-light" />
            <p className="mt-3 text-sm text-gray-500">
              No messages yet. Use the &quot;New message&quot; button above to contact organizers, venues, or members.
            </p>
          </div>
        )}
      </Surface>
    </PortalShell>
  );
}

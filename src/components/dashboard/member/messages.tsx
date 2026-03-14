import Link from "next/link";
import type { Route } from "next";
import { MessageSquare, Lock } from "lucide-react";
import { MessageActions, MessageStatusBadge, ComposeMessageButton } from "./message-actions";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
  StatCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberPortalData, getMemberProfile } from "@/lib/dashboard-fetchers";
import { resolveMemberTier } from "@/lib/entitlements";
import { canSendDirectMessage } from "@/lib/features/member-features";

/* ── Shared helpers ──────────────────────────────────────────── */

function memberLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/dashboard" as Route },
    { key: "events", label: "My Events", href: "/dashboard/calendar" as Route },
    { key: "groups", label: "Groups", href: "/dashboard/groups" as Route },
    { key: "messages", label: "Messages", href: "/dashboard/messages" as Route },
    { key: "transactions", label: "Payments", href: "/dashboard/transactions" as Route },
    { key: "profile", label: "Profile", href: "/settings" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed|read/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist|pinned/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined|unread/i.test(s)) return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function MemberMessagesScreen() {
  const [data, profile] = await Promise.all([
    getMemberPortalData(),
    getMemberProfile(),
  ]);

  const tier = resolveMemberTier(profile.tier);
  const canMessage = canSendDirectMessage(profile.tier);

  const unreadCount = data.messages.filter((m) => m.status === "Unread").length;

  return (
    <PortalShell
      eyebrow="Member portal"
      title="Messages"
      description="Direct messages, group threads, and venue notes."
      links={memberLinks("messages")}
      roleMode="member"
    >
      {/* ── Tier gate: upgrade banner for free users ────────── */}
      {!canMessage ? (
        <div className="rounded-xl border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.04)] p-5">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]">
              <Lock className="h-5 w-5 text-brand-indigo" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-brand-text">
                Direct messaging is a Plus feature
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
                Upgrade to Plus or Pro to send direct messages to organizers and other members.
                You can still view group threads and venue notes on your free plan.
              </p>
              <Link
                href={"/pricing" as Route}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark"
              >
                View upgrade options
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Compose button ──────────────────────────────────── */}
      {canMessage && <ComposeMessageButton />}

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total conversations"
          value={String(data.messages.length)}
          detail="Active threads across all channels."
          icon={MessageSquare}
          tone="indigo"
        />
        <StatCard
          label="Unread"
          value={String(unreadCount)}
          detail={unreadCount > 0 ? "Messages waiting for your attention." : "You are all caught up."}
          tone={unreadCount > 0 ? "coral" : "sage"}
        />
      </div>

      {/* ── Messages table ──────────────────────────────────── */}
      <Surface
        eyebrow="Inbox"
        title="Conversations"
        description="Your recent messages sorted by activity."
      >
        <DashboardTable
          columns={["From", "Subject", "Channel", "Status", "Action"]}
          rows={data.messages.map((m) => ({
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
          caption="Your messages"
        />
      </Surface>
    </PortalShell>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { CreditCard, Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  StatCard,
  KeyValueList,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getMemberProfile } from "@/lib/dashboard-fetchers";
import { memberTransactions as mockMemberTransactions } from "@/lib/dashboard-data";
import { resolveMemberTier } from "@/lib/entitlements";
import { getUser } from "@/lib/auth/guards";
import { getUserTransactions } from "@/lib/db/transactions";

/* ── Shared helpers ──────────────────────────────────────────── */

function memberLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/dashboard" as Route },
    { key: "events", label: "My Events", href: "/dashboard/calendar" as Route },
    { key: "groups", label: "Groups", href: "/dashboard/groups" as Route },
    { key: "messages", label: "Messages", href: "/dashboard/messages" as Route },
    { key: "transactions", label: "Payments", href: "/dashboard/transactions" as Route },
    { key: "notifications", label: "Notifications", href: "/dashboard/notifications" as Route },
    { key: "profile", label: "Profile", href: "/settings" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/active|published|approved|going|accepted|completed/i.test(s)) return "sage";
  if (/pending|draft|waitlisted|waitlist/i.test(s)) return "sand";
  if (/cancelled|rejected|suspended|declined/i.test(s)) return "coral";
  return "neutral";
}

function typeTone(type: string): DashboardTone {
  if (type === "ticket") return "indigo";
  if (type === "subscription") return "sage";
  if (type === "refund") return "coral";
  return "neutral";
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function MemberTransactionsScreen() {
  const profile = await getMemberProfile();
  const tier = resolveMemberTier(profile.tier);

  // Fetch real transactions from DB, fall back to mock if empty
  const session = await getUser().catch(() => null);
  let memberTransactions: readonly { key: string; type: string; description: string; amount: string; status: string; date: string; eventSlug?: string }[] = [];
  if (session?.id) {
    try {
      const dbTxns = await getUserTransactions(session.id);
      if (dbTxns.length > 0) {
        memberTransactions = dbTxns.map((t: Record<string, unknown>) => ({
          key: (t.id as string) ?? "",
          type: (t.type as string) ?? "ticket",
          description: (t.description as string) ?? (t.event_title as string) ?? "Transaction",
          amount: `${((t.amount_isk as number) ?? 0).toLocaleString()} ISK`,
          status: (t.status as string) ?? "completed",
          date: ((t.created_at as string) ?? "").slice(0, 10),
          eventSlug: (t.event_slug as string) ?? undefined,
        }));
      }
    } catch { /* fall through to mock */ }
  }
  // Use mock data only if no real transactions found
  if (memberTransactions.length === 0) {
    memberTransactions = mockMemberTransactions;
  }

  const completedTotal = memberTransactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => {
      const num = parseInt(t.amount.replace(/\s/g, "").replace("ISK", ""), 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const subscriptionTx = memberTransactions.find((t) => t.type === "subscription");

  return (
    <PortalShell
      eyebrow="Member portal"
      title="Payments"
      description="Your transaction history, subscription, and billing details."
      links={memberLinks("transactions")}
      roleMode="member"
    >
      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total transactions"
          value={String(memberTransactions.length)}
          detail="All ticket purchases, subscriptions, and refunds."
          icon={Receipt}
          tone="indigo"
        />
        <StatCard
          label="Total spent"
          value={`${completedTotal.toLocaleString()} ISK`}
          detail="Completed payments across all events and subscriptions."
          icon={CreditCard}
          tone="sage"
        />
        <StatCard
          label="Current plan"
          value={tier === "free" ? "Free" : tier === "plus" ? "Plus" : "Pro"}
          detail={subscriptionTx ? `Last billed ${subscriptionTx.date}` : "No active subscription."}
          tone={tier === "free" ? "neutral" : "indigo"}
        />
      </div>

      {/* ── Subscription info ───────────────────────────────── */}
      <Surface
        eyebrow="Subscription"
        title="Membership plan"
        description="Your current subscription details and renewal information."
        actionLabel={tier === "free" ? "Upgrade" : "Manage plan"}
        actionHref={"/pricing" as Route}
      >
        <KeyValueList
          items={[
            { key: "plan", label: "Current plan", value: tier === "free" ? "Free" : tier === "plus" ? "Plus" : "Pro" },
            {
              key: "status",
              label: "Status",
              value: tier === "free" ? "No active subscription" : "Active",
            },
            {
              key: "last-billed",
              label: "Last billed",
              value: subscriptionTx?.date ?? "N/A",
            },
          ]}
        />
      </Surface>

      {/* ── Transaction table ───────────────────────────────── */}
      <Surface
        eyebrow="History"
        title="Transaction log"
        description="All your payments, ticket purchases, and refunds."
      >
        {memberTransactions.length > 0 ? (
          <DashboardTable
            columns={["Type", "Description", "Amount", "Status", "Date"]}
            rows={memberTransactions.map((t) => ({
              key: t.key,
              cells: [
                <div key="type" className="flex items-center gap-2">
                  {t.type === "refund" ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-brand-coral" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-brand-indigo" />
                  )}
                  <ToneBadge tone={typeTone(t.type)}>
                    {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                  </ToneBadge>
                </div>,
                <div key="desc">
                  {"eventSlug" in t && t.eventSlug ? (
                    <Link
                      href={`/events/${t.eventSlug}` as Route}
                      className="font-medium text-brand-indigo hover:underline"
                    >
                      {t.description}
                    </Link>
                  ) : (
                    <span className="font-medium">{t.description}</span>
                  )}
                </div>,
                <span
                  key="amount"
                  className={`font-medium tabular-nums ${t.amount.startsWith("-") ? "text-brand-coral" : "text-brand-text"}`}
                >
                  {t.amount}
                </span>,
                <ToneBadge key="status" tone={statusTone(t.status)}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </ToneBadge>,
                <span key="date" className="text-sm text-brand-text-muted">{t.date}</span>,
              ],
            }))}
            caption="Transaction history"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No transactions yet. Your ticket purchases, refunds, and subscription payments will appear here.
          </p>
        )}
      </Surface>
    </PortalShell>
  );
}

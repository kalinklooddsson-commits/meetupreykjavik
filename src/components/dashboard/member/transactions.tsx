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
import { memberTransactions as mockTransactions } from "@/lib/dashboard-data";
import { resolveMemberTier } from "@/lib/entitlements";
import { hasSupabaseEnv } from "@/lib/env";
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

function formatAmount(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("is-IS");
  return amount < 0 ? `-${formatted} ISK` : `${formatted} ISK`;
}

interface TransactionRow {
  key: string;
  type: string;
  description: string;
  amount: string;
  status: string;
  date: string;
  eventSlug?: string;
}

/* ── Screen ──────────────────────────────────────────────────── */

export async function MemberTransactionsScreen() {
  const profile = await getMemberProfile();
  const tier = resolveMemberTier(profile.tier);

  // Fetch real transactions from DB when available, fall back to mock
  let transactions: TransactionRow[];

  const session = await getUser();
  if (session && hasSupabaseEnv()) {
    const dbTransactions = await getUserTransactions(session.id);
    if (dbTransactions.length > 0) {
      transactions = dbTransactions.map((t) => ({
        key: t.id,
        type: t.type ?? "ticket",
        description: t.description ?? "Transaction",
        amount: formatAmount(t.amount_isk ?? 0),
        status: t.status ?? "completed",
        date: new Date(t.created_at).toLocaleDateString("en-CA"),
        eventSlug: (t.metadata as Record<string, string> | null)?.event_slug,
      }));
    } else {
      transactions = [...mockTransactions];
    }
  } else {
    transactions = [...mockTransactions];
  }

  const completedTotal = transactions
    .filter((t) => t.status === "completed" && !t.amount.startsWith("-"))
    .reduce((sum, t) => {
      const num = parseInt(t.amount.replace(/\s/g, "").replace("ISK", "").replace(/\./g, ""), 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  const subscriptionTx = transactions.find((t) => t.type === "subscription");

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
          value={String(transactions.length)}
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
            { key: "plan", label: "Current plan", value: profile.tier },
            { key: "tier", label: "Tier", value: tier.charAt(0).toUpperCase() + tier.slice(1) },
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
        <DashboardTable
          columns={["Type", "Description", "Amount", "Status", "Date"]}
          rows={transactions.map((t) => ({
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
                {t.eventSlug ? (
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
      </Surface>
    </PortalShell>
  );
}

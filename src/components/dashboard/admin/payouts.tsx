import type { Route } from "next";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";
import { DollarSign, Users, TrendingUp } from "lucide-react";

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
    { key: "analytics", label: "Analytics", href: "/admin/analytics" as Route },
    { key: "content", label: "Content", href: "/admin/content" as Route },
    { key: "comms", label: "Comms", href: "/admin/comms" as Route },
    { key: "moderation", label: "Moderation", href: "/admin/moderation" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/paid|completed|captured/i.test(s)) return "sage";
  if (/pending|processing/i.test(s)) return "sand";
  if (/failed|overdue/i.test(s)) return "coral";
  return "neutral";
}

export async function AdminPayoutsScreen() {
  const data = await getAdminPortalData();

  // Use the actual revenue metric from the admin dashboard
  const revenueMetric = data.metrics?.find((m) => m.label === "Revenue");
  const revenueValue = revenueMetric?.value ?? "0 ISK";

  // Use real transaction data from revenue section
  const transactions = data.revenue?.transactions ?? [];
  const completedTxns = transactions.filter(
    (t) => /completed/i.test(t.status),
  );

  // Calculate total payout amounts from completed transactions
  const totalAmount = completedTxns.reduce((sum, t) => {
    const numericStr = t.amount.replace(/[^\d]/g, "");
    return sum + (parseInt(numericStr, 10) || 0);
  }, 0);

  // Build payout rows from transactions
  const payoutRows = transactions.map((t, idx) => ({
    key: t.key ?? `payout-${idx}`,
    cells: [
      <span key="src" className="font-medium">{t.source}</span>,
      t.amount,
      <ToneBadge key="status" tone={statusTone(t.status)}>
        {t.status}
      </ToneBadge>,
      t.when,
    ] as React.ReactNode[],
  }));

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Payouts"
      description="Track organizer earnings and manage commission payouts."
      links={adminLinks("payouts")}
      variant="admin"
      roleMode="admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Platform Revenue"
          value={revenueValue}
          detail="Total from all transactions"
          icon={DollarSign}
          tone="indigo"
        />
        <StatCard
          label="Commission Rate"
          value="5%"
          detail="Applied to all ticket sales"
          icon={TrendingUp}
          tone="sage"
        />
        <StatCard
          label="Transactions"
          value={String(transactions.length)}
          detail={`${completedTxns.length} completed`}
          icon={Users}
          tone="neutral"
        />
      </div>

      <Surface
        eyebrow="Transactions"
        title="Payout Ledger"
        description="All platform transactions contributing to organizer payouts and commission tracking."
        className="mt-6"
      >
        {payoutRows.length > 0 ? (
          <DashboardTable
            columns={["Description", "Amount", "Status", "Date"]}
            rows={payoutRows}
            caption="Transaction history"
          />
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">
            No payout data yet. Payouts appear when organizers sell tickets through the platform.
          </p>
        )}
      </Surface>
    </PortalShell>
  );
}

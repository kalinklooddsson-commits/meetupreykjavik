"use client";

import type { Route } from "next";
import { useEffect, useState, useTransition } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  ToneBadge,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
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

function payoutStatusTone(s: string): DashboardTone {
  if (/paid/i.test(s)) return "sage";
  if (/pending|unpaid/i.test(s)) return "sand";
  if (/failed|overdue/i.test(s)) return "coral";
  return "neutral";
}

/* ── Types for payout entries ──────────────────────────────── */

interface PayoutEntry {
  key: string;
  organizer: string;
  eventCount: number;
  grossEarnings: string;
  commission: string;
  netPayout: string;
  status: string;
}

/* ── Mark-as-paid button (client component) ────────────────── */

function MarkAsPaidButton({
  payoutKey,
  currentStatus,
  onMarked,
}: {
  payoutKey: string;
  currentStatus: string;
  onMarked: (key: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (/paid/i.test(currentStatus)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700">
        Paid
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          // TODO: call API route POST /api/admin/payouts/mark-paid { payoutKey }
          onMarked(payoutKey);
        });
      }}
      className="rounded bg-brand-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-brand-primary/90 disabled:opacity-50"
    >
      {isPending ? "Processing..." : "Mark as Paid"}
    </button>
  );
}

/* ── Screen (client) ───────────────────────────────────────── */

export function AdminPayoutsScreen({
  initialPayouts,
  totalGross,
  totalCommission,
  totalNet,
}: {
  initialPayouts: PayoutEntry[];
  totalGross: string;
  totalCommission: string;
  totalNet: string;
}) {
  const [payouts, setPayouts] = useState(initialPayouts);

  const unpaidCount = payouts.filter((p) => !/paid/i.test(p.status)).length;

  function handleMarked(key: string) {
    setPayouts((prev) =>
      prev.map((p) => (p.key === key ? { ...p, status: "paid" } : p)),
    );
  }

  const payoutRows = payouts.map((p) => ({
    key: p.key,
    cells: [
      <span key="org" className="font-medium">{p.organizer}</span>,
      <span key="events" className="tabular-nums">{p.eventCount}</span>,
      <span key="gross" className="tabular-nums">{p.grossEarnings}</span>,
      <span key="comm" className="tabular-nums text-brand-text-muted">{p.commission}</span>,
      <span key="net" className="tabular-nums font-semibold">{p.netPayout}</span>,
      <ToneBadge key="status" tone={payoutStatusTone(p.status)}>
        {p.status}
      </ToneBadge>,
      <MarkAsPaidButton
        key="action"
        payoutKey={p.key}
        currentStatus={p.status}
        onMarked={handleMarked}
      />,
    ] as React.ReactNode[],
  }));

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Payouts"
      description="Manage organizer earnings, commission deductions, and payout status."
      links={adminLinks("payouts")}
      variant="admin"
      roleMode="admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Gross Earnings"
          value={totalGross}
          detail="Organizer earnings before commission"
          icon={DollarSign}
          tone="indigo"
        />
        <StatCard
          label="Platform Commission"
          value={totalCommission}
          detail="5% commission retained"
          icon={TrendingUp}
          tone="sage"
        />
        <StatCard
          label="Pending Payouts"
          value={String(unpaidCount)}
          detail={`of ${payouts.length} organizers`}
          icon={Users}
          tone={unpaidCount > 0 ? "sand" : "neutral"}
        />
      </div>

      <Surface
        eyebrow="Organizer payouts"
        title="Earnings Ledger"
        description="Organizer earnings with commission breakdown. Mark payouts as completed once funds are transferred."
        className="mt-6"
      >
        {payoutRows.length > 0 ? (
          <DashboardTable
            columns={["Organizer", "Events", "Gross", "Commission (5%)", "Net Payout", "Status", "Action"]}
            rows={payoutRows}
            caption="Organizer payout ledger"
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

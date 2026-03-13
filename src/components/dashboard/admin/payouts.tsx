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
import { DollarSign, Users, FileDown } from "lucide-react";

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
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
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

  // Use the revenue breakdown data from admin portal
  const revenueMetrics = data.metrics ?? [];
  const revenueValue = revenueMetrics.find((m) => m.label === "Platform revenue")?.value ?? "0 ISK";

  // Extract event data for payout breakdown
  const eventsTable = (data.events as Record<string, unknown>)?.table as Record<string, unknown>[] ?? [];
  const payoutRows = eventsTable
    .filter((evt) => (evt.status as string)?.toLowerCase() === "paid")
    .map((evt, idx) => {
      const title = (evt.title as string) ?? "—";
      const category = (evt.category as string) ?? "—";
      const status = "Pending";

      return {
        key: `payout-${idx}`,
        cells: [
          title,
          category,
          (evt.venue as string) ?? "—",
          (evt.date as string) ?? "—",
          status,
        ] as React.ReactNode[],
      };
    });

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Payouts"
      description="Track organizer earnings and manage commission payouts."
      links={adminLinks("payouts")}
      variant="admin"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Platform Revenue"
          value={String(revenueValue)}
          icon={DollarSign}
        />
        <StatCard
          label="Commission Rate"
          value="5%"
          detail="Applied to all ticket sales"
          icon={DollarSign}
        />
        <StatCard
          label="Organizers with Sales"
          value={String(payoutRows.length)}
          icon={Users}
        />
      </div>

      <Surface title="Organizer Payouts" className="mt-6">
        {payoutRows.length > 0 ? (
          <DashboardTable
            columns={[
              "Event",
              "Category",
              "Venue",
              "Date",
              "Payout Status",
            ]}
            rows={payoutRows}
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

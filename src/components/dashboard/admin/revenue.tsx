import type { Route } from "next";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  MapPin,
  PieChart,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import {
  Surface,
  StatCard,
  DashboardTable,
  ToneBadge,
  TrendChart,
  KeyValueList,
  HeatGrid,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";

/* ── Shared helpers ──────────────────────────────────────────── */

function adminLinks(activeKey: string) {
  return [
    { key: "overview", label: "Overview", href: "/admin" as Route },
    { key: "users", label: "Users", href: "/admin/users" as Route },
    { key: "events", label: "Events", href: "/admin/events" as Route },
    { key: "venues", label: "Venues", href: "/admin/venues" as Route },
    { key: "groups", label: "Groups", href: "/admin/groups" as Route },
    { key: "bookings", label: "Bookings", href: "/admin/bookings" as Route },
    { key: "revenue", label: "Revenue", href: "/admin/revenue" as Route },
    { key: "settings", label: "Settings", href: "/admin/settings" as Route },
    { key: "audit", label: "Audit Log", href: "/admin/audit" as Route },
  ].map((l) => ({ href: l.href, label: l.label, active: l.key === activeKey }));
}

function statusTone(s: string): DashboardTone {
  if (/captured|completed|active/i.test(s)) return "sage";
  if (/pending/i.test(s)) return "sand";
  if (/failed|refund/i.test(s)) return "coral";
  return "neutral";
}

/* ── Revenue Screen ──────────────────────────────────────────── */

export async function AdminRevenueScreen() {
  const data = await getAdminPortalData();
  const { revenue } = data;

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Revenue"
      description="Track platform revenue sources, recent transactions, and pricing policies."
      links={adminLinks("revenue")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Revenue sources chart ──────────────────────────── */}
      <Surface
        eyebrow="Revenue mix"
        title="Revenue by source"
        description="Percentage breakdown of platform revenue across subscriptions, commissions, and promoted placements."
      >
        <TrendChart
          data={revenue.sources}
          tone="indigo"
          formatValue={(v) => `${v}%`}
        />
      </Surface>

      {/* ── Recent transactions ────────────────────────────── */}
      <Surface
        eyebrow="Transactions"
        title="Recent transactions"
        description="Latest platform transactions including subscription captures, ticket fees, and payouts."
      >
        <DashboardTable
          columns={["Source", "Amount", "Status", "When"]}
          rows={revenue.transactions.map((t) => ({
            key: t.key,
            cells: [
              <span key="src" className="font-medium">{t.source}</span>,
              <span key="amt" className="tabular-nums font-semibold">{t.amount}</span>,
              <ToneBadge key="status" tone={statusTone(t.status)}>{t.status}</ToneBadge>,
              <span key="when" className="text-brand-text-muted">{t.when}</span>,
            ],
          }))}
          caption="Recent platform transactions"
        />
      </Surface>

      {/* ── Pricing policies ───────────────────────────────── */}
      <Surface
        eyebrow="Policies"
        title="Pricing and commission policies"
        description="Current platform pricing rules that govern ticket minimums, commissions, and access tiers."
      >
        <KeyValueList
          items={revenue.policies.map((p, i) => ({
            key: `policy-${i}`,
            label: p.label,
            value: p.value,
          }))}
        />
      </Surface>
    </PortalShell>
  );
}

/* ── Analytics Screen ────────────────────────────────────────── */

export async function AdminAnalyticsScreen() {
  const data = await getAdminPortalData();
  const { analyticsDeck, heatGrid, geography } = data;

  const deckTones: DashboardTone[] = ["indigo", "sage", "coral", "basalt"];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <PortalShell
      eyebrow="Admin portal"
      title="Analytics"
      description="Deep-dive analytics across user engagement, event performance, revenue trends, and geographic reach."
      links={adminLinks("revenue")}
      variant="admin"
      roleMode="admin"
    >
      {/* ── Analytics deck ─────────────────────────────────── */}
      <Surface
        eyebrow="Metrics deck"
        title="Platform analytics"
        description="Weekly trend sparklines across 12 key platform health indicators."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {analyticsDeck.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-brand-border-light bg-white p-4"
            >
              <div className="mb-2 text-sm font-semibold text-brand-text">{card.title}</div>
              <TrendChart
                data={card.data.map((value, i) => ({
                  label: weekLabels[i] ?? `D${i + 1}`,
                  value,
                }))}
                tone={card.tone}
                heightClassName="h-24"
              />
            </div>
          ))}
        </div>
      </Surface>

      {/* ── Heat grid ──────────────────────────────────────── */}
      <Surface
        eyebrow="Engagement"
        title="Event attendance heatmap"
        description="When users attend events across the week. Higher intensity indicates more attendance."
      >
        <HeatGrid columns={heatGrid.columns} rows={heatGrid.rows} />
      </Surface>

      {/* ── Geography ──────────────────────────────────────── */}
      <Surface
        eyebrow="Geography"
        title="User distribution"
        description="Where platform users are located across the Reykjavik metro area."
      >
        <KeyValueList
          items={geography.map((g, i) => ({
            key: `geo-${i}`,
            label: g.label,
            value: g.value,
          }))}
        />
      </Surface>
    </PortalShell>
  );
}

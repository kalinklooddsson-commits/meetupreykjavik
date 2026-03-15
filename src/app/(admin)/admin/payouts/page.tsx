import { AdminPayoutsScreen } from "@/components/dashboard/admin/payouts";
import { getAdminPortalData } from "@/lib/dashboard-fetchers";

export default async function AdminPayoutsPage() {
  const data = await getAdminPortalData();
  const transactions = data.revenue?.transactions ?? [];

  // Derive organizer payout entries from transactions.
  // Group by source (organizer/venue name) and compute earnings + commission.
  const byOrganizer = new Map<
    string,
    { grossCents: number; eventCount: number; keys: string[] }
  >();

  for (const t of transactions) {
    const name = t.source ?? "Unknown";
    const existing = byOrganizer.get(name) ?? {
      grossCents: 0,
      eventCount: 0,
      keys: [],
    };
    const numericStr = t.amount.replace(/[^\d]/g, "");
    existing.grossCents += parseInt(numericStr, 10) || 0;
    existing.eventCount += 1;
    existing.keys.push(t.key);
    byOrganizer.set(name, existing);
  }

  const COMMISSION_RATE = 0.05;
  let totalGross = 0;
  let totalCommission = 0;

  const payouts = Array.from(byOrganizer.entries()).map(
    ([organizer, info]) => {
      const gross = info.grossCents;
      const commission = Math.round(gross * COMMISSION_RATE);
      const net = gross - commission;
      totalGross += gross;
      totalCommission += commission;

      return {
        key: `payout-${info.keys[0]}`,
        organizer,
        eventCount: info.eventCount,
        grossEarnings: `${gross.toLocaleString("en")} ISK`,
        commission: `${commission.toLocaleString("en")} ISK`,
        netPayout: `${net.toLocaleString("en")} ISK`,
        status: "unpaid",
      };
    },
  );

  const totalNet = totalGross - totalCommission;

  return (
    <AdminPayoutsScreen
      initialPayouts={payouts}
      totalGross={`${totalGross.toLocaleString("en")} ISK`}
      totalCommission={`${totalCommission.toLocaleString("en")} ISK`}
      totalNet={`${totalNet.toLocaleString("en")} ISK`}
    />
  );
}

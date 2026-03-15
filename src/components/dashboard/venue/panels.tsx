"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Save,
  Plus,
  Trash2,
  Clock,
  Pencil,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

/* ── Booking Command Center ──────────────────────────────────── */

type BookingItem = {
  readonly key: string;
  readonly organizer: string;
  readonly event: string;
  readonly date: string;
  readonly attendance: string;
  readonly message: string;
  readonly status: string;
};

export function VenueBookingCommandCenter({
  bookings,
}: {
  bookings: readonly BookingItem[];
}) {
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [counterNotes, setCounterNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleDecision(key: string, action: string) {
    setLoading(`${key}-${action}`);
    try {
      const res = await fetch(`/api/bookings/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          counterOffer: counterNotes[key] || undefined,
        }),
      });
      const result = await res.json();
      if (result.ok) {
        setDecisions((prev) => ({ ...prev, [key]: action }));
        toast("success", `Booking ${action} successfully`);
      } else {
        toast("error", result.error ?? `Could not ${action} booking. Please try again.`);
      }
    } catch {
      toast("error", `Could not ${action} booking. Please try again.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const decision = decisions[b.key];
        return (
          <article
            key={b.key}
            className="rounded-xl border border-brand-border-light bg-white p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-brand-text">{b.event}</h3>
                <p className="mt-0.5 text-sm text-brand-text-muted">
                  {b.organizer} &middot; {b.date} &middot; {b.attendance}
                </p>
              </div>
              {decision ? (
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
                    decision === "accepted"
                      ? "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-brand-sage"
                      : decision === "declined"
                        ? "border-[rgba(232,97,77,0.22)] bg-[rgba(232,97,77,0.09)] text-brand-coral"
                        : "border-[rgba(245,240,232,0.95)] bg-[rgba(245,240,232,0.96)] text-brand-text"
                  }`}
                >
                  {decision.charAt(0).toUpperCase() + decision.slice(1)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md border border-[rgba(245,240,232,0.95)] bg-[rgba(245,240,232,0.96)] px-2.5 py-1 text-xs font-medium text-brand-text">
                  {b.status}
                </span>
              )}
            </div>

            {b.message && (
              <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
                {b.message}
              </p>
            )}

            {!decision && (
              <div className="mt-4 space-y-3 border-t border-brand-border-light pt-4">
                {/* Counter note input */}
                <div>
                  <label
                    htmlFor={`counter-${b.key}`}
                    className="block text-xs font-medium text-brand-text-muted"
                  >
                    Counter offer note (optional)
                  </label>
                  <input
                    id={`counter-${b.key}`}
                    type="text"
                    value={counterNotes[b.key] ?? ""}
                    onChange={(e) =>
                      setCounterNotes((prev) => ({
                        ...prev,
                        [b.key]: e.target.value,
                      }))
                    }
                    placeholder="e.g. Can we move to an earlier slot?"
                    className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecision(b.key, "accepted")}
                    disabled={loading === `${b.key}-accepted`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {loading === `${b.key}-accepted` ? "..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(b.key, "declined")}
                    disabled={loading === `${b.key}-declined`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-coral hover:text-brand-coral disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {loading === `${b.key}-declined` ? "..." : "Decline"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(b.key, "countered")}
                    disabled={loading === `${b.key}-countered`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo disabled:opacity-50"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    {loading === `${b.key}-countered` ? "..." : "Counter"}
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {bookings.length === 0 && (
        <div className="rounded-lg border border-brand-border-light bg-brand-sand-light p-6 text-center">
          <p className="text-sm text-brand-text-muted">No pending booking requests.</p>
        </div>
      )}
    </div>
  );
}

/* ── Availability Studio ─────────────────────────────────────── */

type WeeklyGridDay = {
  readonly day: string;
  readonly blocks: readonly string[];
};

export function VenueAvailabilityStudio({
  weeklyGrid,
  venueId,
}: {
  weeklyGrid: readonly WeeklyGridDay[];
  venueId?: string;
}) {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [localGrid, setLocalGrid] = useState<
    { day: string; blocks: string[] }[]
  >(weeklyGrid.map((d) => ({ day: d.day, blocks: [...d.blocks] })));

  function addBlock(day: string) {
    if (!newBlock.trim()) return;
    setLocalGrid((prev) =>
      prev.map((d) =>
        d.day === day ? { ...d, blocks: [...d.blocks, newBlock.trim()] } : d,
      ),
    );
    setNewBlock("");
    setEditingDay(null);
  }

  function removeBlock(day: string, blockIndex: number) {
    setLocalGrid((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, blocks: d.blocks.filter((_, i) => i !== blockIndex) }
          : d,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {localGrid.map((day) => (
          <div
            key={day.day}
            className="rounded-lg border border-brand-border-light bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-indigo" />
                <h3 className="text-sm font-semibold text-brand-text">{day.day}</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingDay(editingDay === day.day ? null : day.day)
                }
                className="inline-flex h-6 w-6 items-center justify-center rounded text-brand-text-muted transition hover:text-brand-indigo"
                title={`Edit ${day.day}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              {day.blocks.map((block, i) => (
                <div
                  key={`${day.day}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-md bg-brand-sand-light px-2.5 py-1.5"
                >
                  <span className="text-xs font-medium text-brand-text">{block}</span>
                  {editingDay === day.day && (
                    <button
                      type="button"
                      onClick={() => removeBlock(day.day, i)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-brand-text-muted transition hover:text-brand-coral"
                      title="Remove block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editingDay === day.day && (
              <div className="relative z-10 mt-3 flex gap-2">
                <input
                  type="text"
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  placeholder="e.g. 18:00-22:00 Open"
                  className="flex-1 rounded-lg border border-brand-border-light bg-white px-2.5 py-1.5 text-xs text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addBlock(day.day);
                  }}
                />
                <button
                  type="button"
                  onClick={() => addBlock(day.day)}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-indigo px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-indigo-dark"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const res = await fetch("/api/venues/availability", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schedule: localGrid, ...(venueId ? { venue_id: venueId } : {}) }),
              });
              const result = await res.json();
              if (result.ok) {
                toast("success", "Schedule saved successfully");
              } else {
                toast("error", result.error ?? "Could not save schedule. Please try again.");
              }
            } catch {
              toast("error", "Could not save schedule. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save schedule"}
        </button>
      </div>
    </div>
  );
}

/* ── Blocked Dates Manager ───────────────────────────────────── */

type BlockedDate = {
  readonly id: string;
  readonly date: string;
  readonly reason: string;
};

export function VenueBlockedDatesManager({
  blockedDates: initialDates,
  venueId,
}: {
  blockedDates: readonly BlockedDate[];
  venueId?: string;
}) {
  const [dates, setDates] = useState<BlockedDate[]>(
    initialDates.map((d) => ({ ...d })),
  );
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleAdd() {
    if (!newDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/venues/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocked_date: newDate,
          reason: newReason.trim() || null,
          ...(venueId ? { venue_id: venueId } : {}),
        }),
      });
      const result = await res.json();
      if (result.ok) {
        setDates((prev) => [
          ...prev,
          { id: result.id ?? newDate, date: newDate, reason: newReason.trim() },
        ]);
        toast("success", "Blocked date added");
        setNewDate("");
        setNewReason("");
        setShowForm(false);
      } else {
        toast("error", result.error ?? "Could not add blocked date.");
      }
    } catch {
      toast("error", "Could not add blocked date. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      const res = await fetch("/api/venues/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.ok) {
        setDates((prev) => prev.filter((d) => d.id !== id));
        toast("success", "Blocked date removed");
      } else {
        toast("error", result.error ?? "Could not remove blocked date.");
      }
    } catch {
      toast("error", "Could not remove blocked date. Please try again.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-3">
      {dates.map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-brand-border-light bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-brand-coral" />
            <div>
              <span className="text-sm font-medium text-brand-text">{d.date}</span>
              {d.reason && (
                <span className="ml-2 text-sm text-brand-text-muted">— {d.reason}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(d.id)}
            disabled={removing === d.id}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-brand-text-muted transition hover:text-brand-coral disabled:opacity-50"
            title="Remove blocked date"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {dates.length === 0 && !showForm && (
        <p className="text-sm text-brand-text-muted">No blocked dates set.</p>
      )}

      {showForm ? (
        <div className="rounded-xl border border-brand-indigo/20 bg-white p-4">
          <h4 className="text-sm font-semibold text-brand-text">Add blocked date</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="blocked-date" className="block text-xs font-medium text-brand-text-muted">
                Date
              </label>
              <input
                id="blocked-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
            <div>
              <label htmlFor="blocked-reason" className="block text-xs font-medium text-brand-text-muted">
                Reason (optional)
              </label>
              <input
                id="blocked-reason"
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g. Private event, Maintenance"
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving || !newDate}
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Add blocked date"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewDate(""); setNewReason(""); }}
              className="inline-flex items-center rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-coral hover:text-brand-coral"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-brand-sand-light p-4 text-sm font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
        >
          <Plus className="h-4 w-4" />
          Add blocked date
        </button>
      )}
    </div>
  );
}

/* ── Deal Studio ─────────────────────────────────────────────── */

type DealItem = {
  readonly key: string;
  readonly title: string;
  readonly type: string;
  readonly tier: string;
  readonly status: string;
  readonly redemption: string;
  readonly note: string;
};

export function VenueDealStudio({
  deals,
  venueId,
}: {
  deals: readonly DealItem[];
  venueId?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localDeals, setLocalDeals] = useState<DealItem[]>([...deals]);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    type: "Free item",
    tier: "Bronze",
    note: "",
  });

  function startEdit(d: DealItem) {
    setFormData({ title: d.title, type: d.type, tier: d.tier, note: d.note ?? "" });
    setEditingKey(d.key);
    setShowForm(true);
  }

  async function deleteDeal(key: string) {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      const res = await fetch("/api/venues/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, venue_id: venueId }),
      });
      const result = await res.json();
      if (result.ok) {
        setLocalDeals((prev) => prev.filter((d) => d.key !== key));
        toast("success", "Deal deleted");
      } else {
        toast("error", result.error ?? "Could not delete deal.");
      }
    } catch {
      toast("error", "Could not delete deal. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing deals */}
      <div className="space-y-3">
        {localDeals.map((d) => (
          <article
            key={d.key}
            className="rounded-lg border border-brand-border-light bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-brand-text">{d.title}</h3>
                <p className="mt-0.5 text-xs text-brand-text-muted">
                  {d.type} &middot; {d.tier} tier &middot; {d.redemption}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                    /active/i.test(d.status)
                      ? "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-brand-sage"
                      : "border-[rgba(245,240,232,0.95)] bg-[rgba(245,240,232,0.96)] text-brand-text"
                  }`}
                >
                  {d.status}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(d)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-text transition hover:bg-brand-sand-light"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteDeal(d.key)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
            {d.note && (
              <p className="mt-2 text-sm text-brand-text-muted">{d.note}</p>
            )}
          </article>
        ))}
      </div>

      {/* New deal form */}
      {showForm ? (
        <div className="rounded-xl border border-brand-indigo/20 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-text">{editingKey ? "Edit deal" : "New deal"}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="deal-title" className="block text-xs font-medium text-brand-text-muted">
                Deal title
              </label>
              <input
                id="deal-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Welcome drink for hosts"
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
            <div>
              <label htmlFor="deal-type" className="block text-xs font-medium text-brand-text-muted">
                Type
              </label>
              <select
                id="deal-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              >
                <option>Free item</option>
                <option>% off</option>
                <option>Fixed discount</option>
                <option>Bundle</option>
              </select>
            </div>
            <div>
              <label htmlFor="deal-tier" className="block text-xs font-medium text-brand-text-muted">
                Tier
              </label>
              <select
                id="deal-tier"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              >
                <option>Bronze</option>
                <option>Silver</option>
                <option>Gold</option>
              </select>
            </div>
            <div>
              <label htmlFor="deal-note" className="block text-xs font-medium text-brand-text-muted">
                Note
              </label>
              <input
                id="deal-note"
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Internal note for your team"
                className="mt-1 w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving || !formData.title}
              onClick={async () => {
                setSaving(true);
                try {
                  const payload = { ...formData, ...(venueId ? { venue_id: venueId } : {}), ...(editingKey ? { key: editingKey } : {}) };
                  const res = await fetch("/api/venues/deals", {
                    method: editingKey ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  const result = await res.json();
                  if (result.ok) {
                    if (editingKey) {
                      setLocalDeals((prev) => prev.map((d) =>
                        d.key === editingKey ? { ...d, ...formData } : d
                      ));
                      toast("success", "Deal updated");
                    } else {
                      toast("success", "Deal created successfully");
                    }
                    setShowForm(false);
                    setEditingKey(null);
                    setFormData({ title: "", type: "Free item", tier: "Bronze", note: "" });
                  } else {
                    toast("error", result.error ?? `Could not ${editingKey ? "update" : "create"} deal. Please try again.`);
                  }
                } catch {
                  toast("error", "Could not save deal. Please try again.");
                } finally {
                  setSaving(false);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : editingKey ? "Update deal" : "Save deal"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingKey(null); setFormData({ title: "", type: "Free item", tier: "Bronze", note: "" }); }}
              className="inline-flex items-center rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-coral hover:text-brand-coral"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-brand-sand-light p-4 text-sm font-medium text-brand-text-muted transition hover:border-brand-indigo hover:text-brand-indigo"
        >
          <Plus className="h-4 w-4" />
          Create new deal
        </button>
      )}
    </div>
  );
}

/* ── Profile Section Editor ──────────────────────────────────── */

type ProfileSection = {
  readonly key: string;
  readonly title: string;
  readonly items: readonly { readonly label: string; readonly value: string }[];
};

export function VenueProfileSectionEditor({
  sections,
}: {
  sections: readonly ProfileSection[];
}) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [localSections, setLocalSections] = useState<
    { key: string; title: string; items: { label: string; value: string }[] }[]
  >(
    sections.map((s) => ({
      key: s.key,
      title: s.title,
      items: s.items.map((item) => ({ label: item.label, value: item.value })),
    })),
  );

  function updateItem(sectionKey: string, itemIndex: number, newValue: string) {
    setLocalSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey
          ? {
              ...s,
              items: s.items.map((item, i) =>
                i === itemIndex ? { ...item, value: newValue } : item,
              ),
            }
          : s,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {localSections.map((section) => {
        const isEditing = editingSection === section.key;

        return (
          <div
            key={section.key}
            className="rounded-xl border border-brand-border-light bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-text">
                {section.title}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setEditingSection(isEditing ? null : section.key)
                }
                className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo"
              >
                <Pencil className="h-3 w-3" />
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>

            {section.items.length > 0 ? (
              <div className="mt-4 divide-y divide-brand-border-light rounded-lg border border-brand-border-light">
                {section.items.map((item, i) => (
                  <div
                    key={`${section.key}-${i}`}
                    className="flex items-start justify-between gap-4 px-3 py-2.5"
                  >
                    <dt className="text-sm text-brand-text-muted">{item.label}</dt>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) =>
                          updateItem(section.key, i, e.target.value)
                        }
                        className="w-60 rounded-md border border-brand-border-light bg-white px-2 py-1 text-right text-sm font-medium text-brand-text focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                      />
                    ) : (
                      <dd className="text-right text-sm font-medium text-brand-text">
                        {item.value}
                      </dd>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-brand-text-muted">
                {section.key === "hours"
                  ? "No hours set \u2014 click Edit to add your opening hours."
                  : `No ${section.title.toLowerCase()} added yet \u2014 click Edit to get started.`}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sections: localSections }),
              });
              const result = await res.json();
              if (result.ok) {
                toast("success", "Profile saved successfully");
              } else {
                toast("error", result.error ?? "Could not save profile. Please try again.");
              }
            } catch {
              toast("error", "Could not save profile. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Venue Review Reply
// ────────────────────────────────────────────

export function VenueReviewReply({
  reviewKey,
  existingResponse,
}: {
  reviewKey: string;
  existingResponse?: string;
}) {
  const [mode, setMode] = useState<"idle" | "editing" | "saving" | "done">("idle");
  const [text, setText] = useState(existingResponse ?? "");
  const [savedText, setSavedText] = useState(existingResponse ?? "");
  const { toast } = useToast();

  async function handleSave() {
    if (!text.trim()) return;
    setMode("saving");
    try {
      const res = await fetch(`/api/venues/reviews/${reviewKey}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: text.trim() }),
      });
      const result = await res.json();
      if (result.ok) {
        toast("success", "Reply saved");
        setSavedText(text.trim());
        setMode("done");
      } else {
        toast("error", result.error ?? "Could not save reply. Please try again.");
        setMode("editing");
      }
    } catch {
      toast("error", "Could not save reply. Please try again.");
      setMode("editing");
    }
  }

  if (savedText && mode !== "editing") {
    return (
      <div className="max-w-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-[rgba(124,154,130,0.1)] px-2.5 py-1 text-xs font-semibold text-brand-sage">
            Responded
          </span>
          <button
            type="button"
            onClick={() => setMode("editing")}
            className="text-xs text-brand-indigo hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="mt-1 text-xs text-brand-text-muted line-clamp-2">{savedText}</p>
      </div>
    );
  }

  if (mode === "idle" && !existingResponse) {
    return (
      <button
        type="button"
        onClick={() => setMode("editing")}
        className="inline-flex items-center gap-1 rounded-md border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-indigo transition hover:bg-brand-indigo/5"
      >
        <Pencil className="h-3 w-3" />
        Reply
      </button>
    );
  }

  if (mode === "editing" || mode === "saving") {
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Thank the reviewer or address their feedback..."
          className="w-full rounded-lg border border-brand-border-light bg-white px-3 py-2 text-xs text-brand-text placeholder:text-brand-text-light focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim() || mode === "saving"}
            className="rounded-md bg-brand-indigo px-2.5 py-1 text-xs font-medium text-white transition hover:bg-brand-indigo/90 disabled:opacity-50"
          >
            {mode === "saving" ? "Saving..." : "Save reply"}
          </button>
          <button
            type="button"
            onClick={() => { setText(savedText); setMode("idle"); }}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-brand-text-muted hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Venue Image Editor (Hero + Gallery) ─────────────────────── */

import { ImageUpload } from "@/components/ui/image-upload";

export function VenueImageEditor({
  venueSlug,
  heroImage,
  gallery,
}: {
  venueSlug: string;
  heroImage: string;
  gallery: string[];
}) {
  const [heroUrl, setHeroUrl] = useState(heroImage);
  const [photos, setPhotos] = useState<string[]>(gallery);
  const [savingHero, setSavingHero] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const { toast } = useToast();

  async function patchVenue(body: Record<string, unknown>) {
    const res = await fetch(`/api/venues/${venueSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok ? await res.json() : null;
  }

  async function saveHero() {
    setSavingHero(true);
    try {
      const result = await patchVenue({ heroPhotoUrl: heroUrl });
      if (result) {
        toast("success", "Hero image saved");
      } else {
        toast("error", "Could not save hero image. Please try again.");
      }
    } catch {
      toast("error", "Could not save hero image. Please try again.");
    } finally {
      setSavingHero(false);
    }
  }

  async function saveGallery() {
    setSavingGallery(true);
    try {
      const result = await patchVenue({ photos });
      if (result) {
        toast("success", "Gallery saved");
      } else {
        toast("error", "Could not save gallery. Please try again.");
      }
    } catch {
      toast("error", "Could not save gallery. Please try again.");
    } finally {
      setSavingGallery(false);
    }
  }

  function removeGalleryPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      {/* ── Hero / Cover Image ──────────────────────────── */}
      <div className="rounded-xl border border-brand-border-light bg-white p-5">
        <h3 className="text-base font-semibold text-brand-text">
          Cover image
        </h3>
        <p className="mt-1 text-sm text-brand-text-muted">
          The main photo shown on your venue listing. Recommended 1200 x 600 px.
        </p>
        <div className="mt-4">
          <ImageUpload
            value={heroUrl}
            onChange={(url) => setHeroUrl(url)}
            label="Upload cover image"
            hint="PNG, JPG or WebP up to 5 MB"
            aspectHint="2:1 landscape"
            folder="venues"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={savingHero}
            onClick={saveHero}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {savingHero ? "Saving..." : "Save cover image"}
          </button>
        </div>
      </div>

      {/* ── Photo Gallery ───────────────────────────────── */}
      <div className="rounded-xl border border-brand-border-light bg-white p-5">
        <h3 className="text-base font-semibold text-brand-text">
          Photo gallery
        </h3>
        <p className="mt-1 text-sm text-brand-text-muted">
          Additional photos of your venue. Up to 20 images.
        </p>

        {/* Existing gallery thumbnails */}
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((url, i) => (
              <div
                key={`gallery-${i}`}
                className="group relative overflow-hidden rounded-xl border border-brand-border bg-brand-sand-light"
              >
                <img
                  src={url}
                  alt={`Gallery photo ${i + 1}`}
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryPhoto(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  title="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new photo uploader */}
        {photos.length < 20 && (
          <div className="mt-4">
            <ImageUpload
              onChange={(url) => {
                if (url) setPhotos((prev) => [...prev, url]);
              }}
              label="Add gallery photo"
              hint={`${photos.length} / 20 photos`}
              folder="venues"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={savingGallery}
            onClick={saveGallery}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {savingGallery ? "Saving..." : "Save gallery"}
          </button>
        </div>
      </div>
    </div>
  );
}

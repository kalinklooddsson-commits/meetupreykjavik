"use client";

import { useState } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  Crown,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Eye,
  Send,
  Star,
  AlertTriangle,
  ArrowUpCircle,
  Download,
  Calendar,
  Trash2,
  Plus,
  Save,
  Edit2,
  Flag,
  Check,
  X,
  RotateCcw,
  MapPin,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Surface,
  DashboardTable,
  ToneBadge,
  AvatarStamp,
  FilterChips,
  KeyValueList,
  ActivityFeed,
  StreamCard,
} from "@/components/dashboard/primitives";
import type { DashboardTone } from "@/components/dashboard/primitives";

/* ═══════════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════════ */

const btnPrimary =
  "inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-indigo-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo";
const btnDanger =
  "inline-flex items-center gap-1.5 rounded-lg bg-brand-coral px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90";
const btnOutline =
  "inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo";
const btnGhost =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-text-muted transition hover:bg-brand-sand-light hover:text-brand-text";
const inputClass =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20";
const selectClass =
  "rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-text transition focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-brand-indigo/20";

function toneForStatus(status: string): DashboardTone {
  const s = status.toLowerCase();
  if (/active|approved|published|resolved|paid|verified|sent|live/i.test(s)) return "sage";
  if (/pending|draft|review|open|waitlist|hold/i.test(s)) return "indigo";
  if (/rejected|cancelled|suspended|banned|failed|critical|overdue|flagged/i.test(s)) return "coral";
  if (/archived|closed|completed/i.test(s)) return "basalt";
  return "neutral";
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-xl border border-brand-border-light bg-white p-5 shadow-lg">
        <p className="text-sm text-brand-text">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={btnOutline}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={btnDanger}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackToast({ message }: { message: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-sage/20 bg-brand-sage/10 px-3 py-1.5 text-sm font-medium text-brand-sage">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   1. AdminUserCommandCenter
   ═══════════════════════════════════════════════════ */

type UserRow = {
  key: string;
  name: string;
  email: string;
  type: string;
  status: string;
  joined: string;
  lastActive: string;
  groups: string;
  events: string;
  plan: string;
};

export function AdminUserCommandCenter({
  users,
}: {
  users: readonly UserRow[];
}) {
  const [localUsers, setLocalUsers] = useState<UserRow[]>([...users]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [preSuspendStatus, setPreSuspendStatus] = useState<Record<string, string>>(() => {
    // Initialize with the original status of every non-suspended user so that
    // suspending and then unsuspending restores the correct status (e.g. "Verified")
    const map: Record<string, string> = {};
    for (const u of users) {
      if (u.status !== "Suspended") {
        map[u.key] = u.status;
      }
    }
    return map;
  });
  const { toast } = useToast();

  const roleChips = [
    { key: "all", label: "All", active: roleFilter === "all" },
    { key: "admin", label: "Admin", active: roleFilter === "admin", tone: "indigo" as DashboardTone },
    { key: "organizer", label: "Organizer", active: roleFilter === "organizer", tone: "sage" as DashboardTone },
    { key: "venue", label: "Venue", active: roleFilter === "venue", tone: "coral" as DashboardTone },
    { key: "user", label: "User", active: roleFilter === "user" },
  ];

  const filtered = localUsers.filter((u) => {
    const matchRole = roleFilter === "all" || u.type.toLowerCase().includes(roleFilter);
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const selected = selectedKey ? localUsers.find((u) => u.key === selectedKey) : null;

  function updateUser(key: string, patch: Partial<UserRow>) {
    setLocalUsers((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted">
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-indigo px-1.5 text-[11px] font-semibold tabular-nums text-white">
            {filtered.length}
          </span>
          {filtered.length !== localUsers.length
            ? `of ${localUsers.length} accounts`
            : "accounts"}
        </span>
      </div>
      <FilterChips items={roleChips} onSelect={(k) => setRoleFilter(k)} />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Users table */}
        <DashboardTable
          columns={["User", "Role", "Status", "Joined", "Plan", ""]}
          rows={filtered.map((u) => ({
            key: u.key,
            cells: [
              <div key="u" className="flex items-center gap-2">
                <AvatarStamp name={u.name} size="sm" />
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-brand-text-muted">{u.email}</div>
                </div>
              </div>,
              <ToneBadge key="r" tone={u.type.toLowerCase() === "admin" ? "indigo" : u.type.toLowerCase() === "organizer" ? "sage" : "neutral"}>
                {u.type}
              </ToneBadge>,
              <ToneBadge key="s" tone={toneForStatus(u.status)}>{u.status}</ToneBadge>,
              u.joined,
              u.plan,
              <button key="a" type="button" onClick={() => setSelectedKey(u.key)} className={btnGhost}>
                <Eye className="h-3.5 w-3.5" /> Details
              </button>,
            ],
          }))}
          dense
          caption="Platform users"
        />

        {/* Selected user detail */}
        {selected && (
          <Surface eyebrow="User detail" title={selected.name}>
            <div className="space-y-4">
              <KeyValueList
                items={[
                  { key: "email", label: "Email", value: selected.email },
                  { key: "type", label: "Role", value: selected.type },
                  { key: "status", label: "Status", value: selected.status },
                  { key: "joined", label: "Joined", value: selected.joined },
                  { key: "lastActive", label: "Last active", value: selected.lastActive },
                  { key: "groups", label: "Groups", value: selected.groups },
                  { key: "events", label: "Events", value: selected.events },
                  { key: "plan", label: "Plan", value: selected.plan },
                ]}
              />

              {/* Role change */}
              <div>
                <label className="block text-xs font-medium text-brand-text-muted mb-1">Change role</label>
                <select
                  className={selectClass}
                  value={selected.type.toLowerCase()}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    try {
                      const res = await fetch("/api/admin/users/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userKey: selected.key, action: "role", value: newRole }),
                      });
                      if (!res.ok) { toast("error", "Could not change role. Please try again."); return; }
                      const result = await res.json();
                      if (result.ok) {
                        updateUser(selected.key, { type: newRole.charAt(0).toUpperCase() + newRole.slice(1) });
                        toast("success", `Role changed to ${newRole}`);
                      } else {
                        toast("error", result.error ?? `Could not change role. Please try again.`);
                      }
                    } catch {
                      toast("error", `Could not change role. Please try again.`);
                    }
                  }}
                >
                  <option value="user">User</option>
                  <option value="organizer">Organizer</option>
                  <option value="venue">Venue</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnOutline}
                  onClick={async () => {
                    const action = selected.status === "Verified" ? "unverify" : "verify";
                    const msg = selected.status === "Verified" ? "Verification removed" : "User verified";
                    try {
                      const res = await fetch("/api/admin/users/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userKey: selected.key, action, value: action }),
                      });
                      if (!res.ok) { toast("error", "Could not update verification. Please try again."); return; }
                      const result = await res.json();
                      if (result.ok) {
                        updateUser(selected.key, { status: selected.status === "Verified" ? "Unverified" : "Verified" });
                        toast("success", msg);
                      } else {
                        toast("error", result.error ?? `Could not update verification. Please try again.`);
                      }
                    } catch {
                      toast("error", `Could not update verification. Please try again.`);
                    }
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {selected.status === "Verified" ? "Unverify" : "Verify"}
                </button>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={async () => {
                    const isPremium = selected.plan === "Premium" || selected.plan === "Plus";
                    const action = isPremium ? "remove_premium" : "grant_premium";
                    const msg = isPremium ? "Premium removed" : "Premium granted";
                    const newPlan = isPremium ? "Free" : "Plus";
                    try {
                      const res = await fetch("/api/admin/users/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userKey: selected.key, action, value: action }),
                      });
                      if (!res.ok) { toast("error", "Could not update premium status. Please try again."); return; }
                      const result = await res.json();
                      if (result.ok) {
                        updateUser(selected.key, { plan: newPlan });
                        toast("success", msg);
                      } else {
                        toast("error", result.error ?? `Could not update premium status. Please try again.`);
                      }
                    } catch {
                      toast("error", `Could not update premium status. Please try again.`);
                    }
                  }}
                >
                  <Crown className="h-3.5 w-3.5" />
                  Toggle premium
                </button>
                <button
                  type="button"
                  className={selected.status === "Suspended" ? btnPrimary : btnDanger}
                  onClick={async () => {
                    const isSuspended = selected.status === "Suspended";
                    const action = isSuspended ? "unsuspend" : "suspend";
                    const msg = isSuspended ? "User unsuspended" : "User suspended";
                    try {
                      const res = await fetch("/api/admin/users/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userKey: selected.key, action, value: action }),
                      });
                      if (!res.ok) { toast("error", "Could not update suspension status. Please try again."); return; }
                      const result = await res.json();
                      if (result.ok) {
                        if (isSuspended) {
                          const restored = preSuspendStatus[selected.key] || "Active";
                          updateUser(selected.key, { status: restored });
                        } else {
                          setPreSuspendStatus((prev) => ({ ...prev, [selected.key]: selected.status }));
                          updateUser(selected.key, { status: "Suspended" });
                        }
                        toast("success", msg);
                      } else {
                        toast("error", result.error ?? `Could not update suspension status. Please try again.`);
                      }
                    } catch {
                      toast("error", `Could not update suspension status. Please try again.`);
                    }
                  }}
                >
                  <Ban className="h-3.5 w-3.5" />
                  {selected.status === "Suspended" ? "Unsuspend" : "Suspend"}
                </button>
              </div>
            </div>
          </Surface>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   2. AdminEventAudiencePicker
   ═══════════════════════════════════════════════════ */

type AudienceCandidate = {
  id: string;
  name: string;
  tier: string;
  status: string;
  fitScore: number;
  lastActive: string;
  tags: string[];
  reason: string;
};

type AudienceData = {
  eventTitle: string;
  eventSlug: string;
  target: string;
  seatsRemaining: number;
  selectedIds: string[];
  candidates: readonly AudienceCandidate[];
};

export function AdminEventAudiencePicker({ audience }: { audience: AudienceData }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(audience.selectedIds));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <Surface eyebrow="Audience curation" title={audience.eventTitle} description={`Target: ${audience.target}`}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
            <div className="text-lg font-semibold tabular-nums text-brand-text">{audience.seatsRemaining}</div>
            <div className="text-xs text-brand-text-muted">Seats remaining</div>
          </div>
          <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
            <div className="text-lg font-semibold tabular-nums text-brand-indigo">{selectedIds.size}</div>
            <div className="text-xs text-brand-text-muted">Selected</div>
          </div>
          <div className="rounded-lg border border-brand-border-light bg-white px-3 py-2 text-center">
            <div className="text-lg font-semibold tabular-nums text-brand-text-muted">{audience.candidates.length}</div>
            <div className="text-xs text-brand-text-muted">Candidates</div>
          </div>
        </div>

        <DashboardTable
          columns={["", "Candidate", "Tier", "Fit", "Status", "Reason", ""]}
          rows={audience.candidates.map((c) => ({
            key: c.id,
            cells: [
              <input
                key="cb"
                type="checkbox"
                checked={selectedIds.has(c.id)}
                onChange={() => toggle(c.id)}
                className="rounded border-brand-border text-brand-indigo focus:ring-brand-indigo/20"
              />,
              <div key="n" className="flex items-center gap-2">
                <AvatarStamp name={c.name} size="sm" />
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="flex gap-1 mt-0.5">
                    {c.tags.map((t) => (
                      <span key={t} className="rounded bg-brand-sand px-1.5 py-0.5 text-[10px] font-medium text-brand-text-muted">{t}</span>
                    ))}
                  </div>
                </div>
              </div>,
              <ToneBadge key="t" tone={c.tier.toLowerCase().includes("gold") ? "coral" : c.tier.toLowerCase().includes("silver") ? "basalt" : "neutral"}>{c.tier}</ToneBadge>,
              <div key="f" className="flex items-center gap-1">
                <div
                  className="h-2 rounded-full bg-brand-indigo"
                  style={{ width: `${c.fitScore}%`, maxWidth: 60 }}
                />
                <span className="text-xs tabular-nums font-medium text-brand-text-muted">{c.fitScore}%</span>
              </div>,
              <ToneBadge key="s" tone={toneForStatus(c.status)}>{c.status}</ToneBadge>,
              <span key="r" className="text-xs text-brand-text-muted">{c.reason}</span>,
              <button
                key="a"
                type="button"
                className={selectedIds.has(c.id) ? btnDanger : btnPrimary}
                onClick={() => toggle(c.id)}
              >
                {selectedIds.has(c.id) ? "Remove" : "Select"}
              </button>,
            ],
          }))}
          dense
          caption="Audience candidates"
        />
      </Surface>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   3. AdminClientCurationWorkbench
   ═══════════════════════════════════════════════════ */

type CurationDossier = {
  name: string;
  tier: string;
  summary: string;
  items: readonly { key: string; label: string; value: string }[];
  interests: string[];
  badges: string[];
  recentAttendance: readonly { title: string; venue: string; note: string }[];
  venuePreferences: readonly { venue: string; reason: string }[];
  privacySnapshot: readonly { label: string; value: string }[];
  fitBreakdown: readonly { label: string; value: string }[];
  accessRules: readonly { label: string; value: string }[];
  curationTimeline: readonly { key: string; title: string; meta: string; detail: string }[];
  adminNotes: string[];
  playbook: string[];
};

export function AdminClientCurationWorkbench({ dossier }: { dossier: CurationDossier }) {
  const [notes, setNotes] = useState<string[]>([...dossier.adminNotes]);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

  async function addNote() {
    if (!newNote.trim()) return;
    const note = newNote.trim();
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: dossier.name, action: "add", note }),
      });
      if (!res.ok) { toast("error", "Could not add note. Please try again."); return; }
      setNotes((prev) => [...prev, note]);
      setNewNote("");
      toast("success", "Note added");
    } catch {
      toast("error", "Could not add note. Please try again.");
    }
  }

  async function removeNote(idx: number) {
    try {
      const res = await fetch("/api/admin/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: dossier.name, action: "remove", note: notes[idx] }),
      });
      if (!res.ok) { toast("error", "Could not remove note. Please try again."); return; }
      setNotes((prev) => prev.filter((_, i) => i !== idx));
      toast("success", "Note removed");
    } catch {
      toast("error", "Could not remove note. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Surface eyebrow="Client dossier" title={dossier.name} description={dossier.summary}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ToneBadge tone="indigo">{dossier.tier}</ToneBadge>
          {dossier.badges.map((b) => (
            <ToneBadge key={b} tone="sage">{b}</ToneBadge>
          ))}
        </div>

        {/* Core info */}
        <KeyValueList items={dossier.items.map((i) => ({ key: i.key, label: i.label, value: i.value }))} />
      </Surface>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Interests */}
        <Surface eyebrow="Profile" title="Interests">
          <div className="flex flex-wrap gap-1.5">
            {dossier.interests.map((i) => (
              <span key={i} className="rounded-md border border-brand-border-light bg-brand-sand-light px-2.5 py-1 text-xs font-medium text-brand-text">{i}</span>
            ))}
          </div>
        </Surface>

        {/* Venue preferences */}
        <Surface eyebrow="Preferences" title="Venue preferences">
          <div className="space-y-2">
            {dossier.venuePreferences.map((vp) => (
              <div key={vp.venue} className="flex items-start justify-between gap-3 rounded-lg border border-brand-border-light bg-white p-3">
                <div className="text-sm font-medium text-brand-text">{vp.venue}</div>
                <div className="text-xs text-brand-text-muted">{vp.reason}</div>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      {/* Recent attendance */}
      <Surface eyebrow="History" title="Recent attendance">
        <DashboardTable
          columns={["Event", "Venue", "Note"]}
          rows={dossier.recentAttendance.map((a, i) => ({
            key: `att-${i}`,
            cells: [a.title, a.venue, a.note],
          }))}
          dense
        />
      </Surface>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Privacy snapshot */}
        <Surface eyebrow="Compliance" title="Privacy snapshot">
          <KeyValueList items={dossier.privacySnapshot.map((p, i) => ({ key: `p-${i}`, label: p.label, value: p.value }))} />
        </Surface>

        {/* Fit breakdown */}
        <Surface eyebrow="Scoring" title="Fit breakdown">
          <KeyValueList items={dossier.fitBreakdown.map((f, i) => ({ key: `f-${i}`, label: f.label, value: f.value }))} />
        </Surface>

        {/* Access rules */}
        <Surface eyebrow="Access" title="Access rules">
          <KeyValueList items={dossier.accessRules.map((a, i) => ({ key: `a-${i}`, label: a.label, value: a.value }))} />
        </Surface>
      </div>

      {/* Curation timeline */}
      <Surface eyebrow="Timeline" title="Curation timeline">
        <ActivityFeed
          items={dossier.curationTimeline.map((t) => ({
            key: t.key,
            title: t.title,
            detail: t.detail,
            meta: t.meta,
            tone: "indigo" as DashboardTone,
          }))}
        />
      </Surface>

      {/* Admin notes */}
      <Surface eyebrow="Internal" title="Admin notes">
        <div className="space-y-2 mt-2">
          {notes.map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-brand-border-light bg-white p-3">
              <p className="text-sm text-brand-text">{n}</p>
              <button type="button" onClick={() => removeNote(i)} aria-label="Remove note" className={btnGhost}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Add a note..."
              className={inputClass}
            />
            <button type="button" onClick={addNote} className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>
      </Surface>

      {/* Playbook */}
      <Surface eyebrow="Playbook" title="Recommended steps">
        <div className="space-y-2">
          {dossier.playbook.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-brand-border-light bg-white p-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 text-xs font-semibold text-brand-indigo">
                {i + 1}
              </span>
              <p className="text-sm text-brand-text">{step}</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   4. AdminGroupOperationsDesk
   ═══════════════════════════════════════════════════ */

type GroupRow = {
  key: string;
  name: string;
  organizer: string;
  status: string;
  note: string;
};

export function AdminGroupOperationsDesk({
  groups,
}: {
  groups: readonly GroupRow[];
}) {
  const [localGroups, setLocalGroups] = useState<GroupRow[]>([...groups]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  async function updateGroup(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/groups/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast("error", (body as Record<string, string>).error ?? "Could not update group.");
        return;
      }
      setLocalGroups((prev) => prev.map((g) => (g.key === key ? { ...g, status } : g)));
      toast("success", `Group ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update group. Please try again.`);
    }
  }

  const filtered = search
    ? localGroups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.organizer.toLowerCase().includes(search.toLowerCase()))
    : localGroups;

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm placeholder:text-brand-text-muted focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((g) => (
          <StreamCard
            key={g.key}
            eyebrow={g.organizer}
            title={g.name}
            description={g.note}
            badge={<ToneBadge tone={toneForStatus(g.status)}>{g.status}</ToneBadge>}
            avatarName={g.name}
          />
        ))}
      </div>
      <DashboardTable
        columns={["Group", "Organizer", "Status", "Actions"]}
        rows={filtered.map((g) => ({
          key: g.key,
          cells: [
            <a key="n" href={`/groups/${g.key}`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-coral hover:underline">{g.name}</a>,
            g.organizer,
            <ToneBadge key="s" tone={toneForStatus(g.status)}>{g.status}</ToneBadge>,
            <div key="a" className="flex gap-1.5">
              {g.status !== "Approved" && (
                <button type="button" className={btnGhost} onClick={() => updateGroup(g.key, "Approved")}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Approve
                </button>
              )}
              {g.status !== "Rejected" && (
                <button type="button" className={btnGhost} onClick={() => updateGroup(g.key, "Rejected")}>
                  <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Reject
                </button>
              )}
              {g.status !== "Archived" && (
                <button type="button" className={btnGhost} onClick={() => updateGroup(g.key, "Archived")}>
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              )}
              {g.status !== "Featured" && g.status !== "Rejected" && g.status !== "Suspended" && (
                <button type="button" className={btnGhost} onClick={() => updateGroup(g.key, "Featured")}>
                  <Star className="h-3.5 w-3.5 text-brand-coral" /> Feature
                </button>
              )}
              {g.status !== "Suspended" && (
                <button type="button" className={btnGhost} onClick={() => {
                  if (window.confirm(`Are you sure you want to suspend the group "${g.name}"?`)) {
                    updateGroup(g.key, "Suspended");
                  }
                }}>
                  <Ban className="h-3.5 w-3.5 text-brand-coral" /> Suspend
                </button>
              )}
              <button type="button" className={btnGhost} onClick={() => window.open(`/groups/${g.key}`, "_blank")}>
                <Eye className="h-3.5 w-3.5" /> View
              </button>
            </div>,
          ],
        }))}
        dense
        caption="Group operations"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   5. AdminEventOperationsDesk
   ═══════════════════════════════════════════════════ */

type EventRow = {
  key: string;
  title: string;
  status: string;
  category: string;
  venue: string;
  venueSlug?: string;
  date: string;
  action: string;
};

export function AdminEventOperationsDesk({
  events,
}: {
  events: readonly EventRow[];
}) {
  const [localEvents, setLocalEvents] = useState<EventRow[]>([...events]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState("");
  const { toast } = useToast();

  const statusChips = [
    { key: "all", label: "All", active: statusFilter === "all" },
    { key: "pending", label: "Pending", active: statusFilter === "pending", tone: "sand" as DashboardTone },
    { key: "published", label: "Published", active: statusFilter === "published", tone: "sage" as DashboardTone },
    { key: "cancelled", label: "Cancelled", active: statusFilter === "cancelled", tone: "coral" as DashboardTone },
  ];

  const filtered = localEvents.filter((e) => {
    const matchStatus = statusFilter === "all" || e.status.toLowerCase().includes(statusFilter);
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function updateEvent(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/events/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast("error", (body as Record<string, string>).error ?? "Could not update event.");
        setConfirmKey(null);
        return;
      }
      setLocalEvents((prev) => prev.map((e) => (e.key === key ? { ...e, status } : e)));
      toast("success", `Event ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update event. Please try again.`);
    }
    setConfirmKey(null);
  }

  function requestConfirm(key: string, action: string) {
    setConfirmKey(key);
    setConfirmAction(action);
  }

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title, venue, or category..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <span className="text-xs text-brand-text-muted">
          {filtered.length} of {localEvents.length} events
        </span>
      </div>
      <FilterChips items={statusChips} onSelect={(k) => setStatusFilter(k)} />

      {confirmKey && (
        <ConfirmDialog
          message={`Are you sure you want to ${confirmAction === "Cancelled" ? "cancel" : confirmAction === "Published" ? "approve and publish" : confirmAction === "Rejected" ? "decline" : confirmAction.toLowerCase()} this event?`}
          onConfirm={() => updateEvent(confirmKey, confirmAction)}
          onCancel={() => setConfirmKey(null)}
        />
      )}
      <DashboardTable
        columns={["Event", "Category", "Venue", "Date", "Status", "Actions"]}
        rows={filtered.map((e) => ({
          key: e.key,
          cells: [
            <a key="t" href={`/events/${e.key}`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-coral hover:underline">{e.title}</a>,
            <ToneBadge key="c" tone="neutral">{e.category}</ToneBadge>,
            e.venueSlug ? (
              <a key="v" href={`/venues/${e.venueSlug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-coral hover:underline">{e.venue}</a>
            ) : (
              e.venue
            ),
            e.date,
            <ToneBadge key="s" tone={toneForStatus(e.status)}>{e.status}</ToneBadge>,
            <div key="a" className="flex gap-1.5">
              {(() => {
                const isCancelled = /^cancelled$/i.test(e.status);
                const isRejected = /^rejected$/i.test(e.status);
                return (
                  <>
                    {e.status === "Pending Review" && !isCancelled && (
                      <>
                        <button type="button" className={btnGhost} onClick={() => requestConfirm(e.key, "Published")}>
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Approve
                        </button>
                        <button type="button" className={btnGhost} onClick={() => requestConfirm(e.key, "Rejected")}>
                          <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Decline
                        </button>
                      </>
                    )}
                    {e.status === "Draft" && !isCancelled && (
                      <button type="button" className={btnGhost} onClick={() => requestConfirm(e.key, "Published")}>
                        <Send className="h-3.5 w-3.5 text-brand-sage" /> Publish
                      </button>
                    )}
                    {!isCancelled && !isRejected && e.status !== "Pending Review" && (
                      <button type="button" className={btnGhost} onClick={() => updateEvent(e.key, "Featured")}>
                        <Star className="h-3.5 w-3.5 text-brand-coral" /> Feature
                      </button>
                    )}
                    {!isCancelled && !isRejected && (
                      <button type="button" className={btnGhost} onClick={() => requestConfirm(e.key, "Cancelled")}>
                        <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Cancel
                      </button>
                    )}
                  </>
                );
              })()}
            </div>,
          ],
        }))}
        dense
        caption="Event operations"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   6. AdminRevenueControlDesk
   ═══════════════════════════════════════════════════ */

type TransactionRow = {
  key: string;
  source: string;
  amount: string;
  status: string;
  when: string;
};

export function AdminRevenueControlDesk({
  transactions,
}: {
  transactions: readonly TransactionRow[];
}) {
  const [localTx, setLocalTx] = useState<TransactionRow[]>([...transactions]);
  const [refundKey, setRefundKey] = useState<string | null>(null);
  const { toast } = useToast();

  async function processRefund(key: string) {
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast("error", (body as Record<string, string>).error ?? "Could not process refund.");
        setRefundKey(null);
        return;
      }
      setLocalTx((prev) => prev.map((t) => (t.key === key ? { ...t, status: "Refunded" } : t)));
      toast("success", "Refund processed");
    } catch {
      toast("error", "Could not process refund. Please try again.");
    }
    setRefundKey(null);
  }

  return (
    <div className="space-y-4">
      {refundKey && (
        <ConfirmDialog
          message="Are you sure you want to process this refund? This action cannot be undone."
          onConfirm={() => processRefund(refundKey)}
          onCancel={() => setRefundKey(null)}
        />
      )}
      <DashboardTable
        columns={["Source", "Amount", "Status", "Date", ""]}
        rows={localTx.map((t) => ({
          key: t.key,
          cells: [
            <span key="s" className="font-medium">{t.source}</span>,
            <span key="a" className="tabular-nums font-semibold">{t.amount}</span>,
            <ToneBadge key="st" tone={toneForStatus(t.status)}>{t.status}</ToneBadge>,
            t.when,
            t.status !== "Refunded" ? (
              <button key="r" type="button" className={btnDanger} onClick={() => setRefundKey(t.key)}>
                <RotateCcw className="h-3.5 w-3.5" /> Refund
              </button>
            ) : (
              <span key="r" className="text-xs text-brand-text-muted">Refunded</span>
            ),
          ],
        }))}
        dense
        caption="Transactions"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   7. AdminRevenueOperationsDesk
   ═══════════════════════════════════════════════════ */

type RevenueSource = {
  label: string;
  value: number;
};

export function AdminRevenueOperationsDesk({
  sources,
}: {
  sources: readonly RevenueSource[];
}) {
  const [exported, setExported] = useState(false);
  const total = sources.reduce((sum, s) => sum + s.value, 0);

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  return (
    <Surface eyebrow="Revenue" title="Revenue breakdown" description="Breakdown by source">
      <div className="space-y-4">
        <div className="space-y-2">
          {sources.map((s) => {
            const pct = total > 0 ? (s.value / total) * 100 : 0;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-lg border border-brand-border-light bg-white p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand-text">{s.label}</span>
                    <span className="text-sm tabular-nums font-semibold text-brand-text">${s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-brand-sand-light">
                    <div className="h-2 rounded-full bg-brand-indigo" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs tabular-nums text-brand-text-muted">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-brand-border-light pt-3">
          <div className="text-sm font-semibold text-brand-text">
            Total: <span className="tabular-nums">${total.toLocaleString()}</span>
          </div>
          <button type="button" className={btnOutline} onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            {exported ? "Exported!" : "Export CSV"}
          </button>
        </div>
      </div>
    </Surface>
  );
}

/* ═══════════════════════════════════════════════════
   8. AdminAnalyticsOperationsDesk
   ═══════════════════════════════════════════════════ */

type AnalyticsDeck = {
  key: string;
  title: string;
  tone: string;
  data: number[];
};

export function AdminAnalyticsOperationsDesk({
  deck,
}: {
  deck: readonly AnalyticsDeck[];
}) {
  const [range, setRange] = useState("7d");

  const ranges = [
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "90d", label: "90 days" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-brand-text-muted" />
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition",
                range === r.key
                  ? "bg-brand-indigo text-white"
                  : "bg-white border border-brand-border-light text-brand-text-muted hover:text-brand-text"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {deck.map((card) => {
          const max = Math.max(...card.data, 1);
          const latest = card.data[card.data.length - 1] ?? 0;
          const tone = (card.tone as DashboardTone) || "indigo";

          return (
            <div key={card.key} className="rounded-xl border border-brand-border-light bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-brand-text">{card.title}</h3>
                <ToneBadge tone={tone}>{latest}</ToneBadge>
              </div>
              {/* Mini spark line */}
              <div className="flex items-end gap-0.5 h-12">
                {card.data.map((v, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm transition-all",
                      tone === "coral" ? "bg-brand-coral/60" : tone === "sage" ? "bg-brand-sage/60" : "bg-brand-indigo/60"
                    )}
                    style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-brand-text-muted">
                Range: {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   9. AdminOpsInboxDesk
   ═══════════════════════════════════════════════════ */

type OpsItem = {
  key: string;
  lane: string;
  title: string;
  owner: string;
  due: string;
  status: string;
  note: string;
};

export function AdminOpsInboxDesk({
  inbox,
}: {
  inbox: readonly OpsItem[];
}) {
  const [items, setItems] = useState<OpsItem[]>([...inbox]);
  const { toast } = useToast();

  const lanes = [...new Set(items.map((i) => i.lane))];

  async function updateItem(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/ops/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update item."); return; }
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status } : i)));
      toast("success", `Item ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update item. Please try again.`);
    }
  }

  return (
    <div className="space-y-4">
      {lanes.map((lane) => {
        const laneItems = items.filter((i) => i.lane === lane);
        return (
          <Surface key={lane} eyebrow="Ops lane" title={lane}>
            <div className="space-y-2">
              {laneItems.map((item) => (
                <div key={item.key} className="flex flex-col gap-2 rounded-lg border border-brand-border-light bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-brand-text">{item.title}</span>
                      <ToneBadge tone={toneForStatus(item.status)}>{item.status}</ToneBadge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-brand-text-muted">
                      <span>Owner: {item.owner}</span>
                      <span>Due: {item.due}</span>
                    </div>
                    {item.note && <p className="mt-1 text-xs text-brand-text-muted">{item.note}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button" className={btnGhost} onClick={() => updateItem(item.key, "Assigned")}>
                      <UserCog className="h-3.5 w-3.5" /> Assign
                    </button>
                    <button type="button" className={btnGhost} onClick={() => updateItem(item.key, "Completed")}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Complete
                    </button>
                    <button type="button" className={btnGhost} onClick={() => updateItem(item.key, "Escalated")}>
                      <ArrowUpCircle className="h-3.5 w-3.5 text-brand-coral" /> Escalate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   10. AdminIncidentCommandDesk
   ═══════════════════════════════════════════════════ */

type Incident = {
  key: string;
  title: string;
  severity: string;
  owner: string;
  status: string;
  note: string;
};

function severityTone(sev: string): DashboardTone {
  const s = sev.toLowerCase();
  if (s === "critical" || s === "high") return "coral";
  if (s === "medium") return "indigo";
  return "neutral";
}

export function AdminIncidentCommandDesk({
  incidents,
}: {
  incidents: readonly Incident[];
}) {
  const [localIncidents, setLocalIncidents] = useState<Incident[]>([...incidents]);
  const { toast } = useToast();

  async function updateIncident(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/incidents/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update incident."); return; }
      setLocalIncidents((prev) => prev.map((i) => (i.key === key ? { ...i, status } : i)));
      toast("success", `Incident ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update incident. Please try again.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {localIncidents.map((inc) => (
          <div key={inc.key} className="rounded-xl border border-brand-border-light bg-white p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-brand-text">{inc.title}</h3>
              <ToneBadge tone={severityTone(inc.severity)}>
                <AlertTriangle className="mr-1 h-3 w-3" />
                {inc.severity}
              </ToneBadge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <ToneBadge tone={toneForStatus(inc.status)}>{inc.status}</ToneBadge>
              <span className="text-xs text-brand-text-muted">Owner: {inc.owner}</span>
            </div>
            {inc.note && <p className="text-xs text-brand-text-muted mb-3">{inc.note}</p>}
            <div className="flex gap-1.5 border-t border-brand-border-light pt-3">
              {inc.status !== "Acknowledged" && (
                <button type="button" className={btnGhost} onClick={() => updateIncident(inc.key, "Acknowledged")}>
                  <Eye className="h-3.5 w-3.5" /> Ack
                </button>
              )}
              {inc.status !== "Resolved" && (
                <button type="button" className={btnGhost} onClick={() => updateIncident(inc.key, "Resolved")}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Resolve
                </button>
              )}
              {inc.status !== "Escalated" && (
                <button type="button" className={btnGhost} onClick={() => updateIncident(inc.key, "Escalated")}>
                  <ArrowUpCircle className="h-3.5 w-3.5 text-brand-coral" /> Escalate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   11. AdminVenueOperationsDesk
   ═══════════════════════════════════════════════════ */

type VenueRow = {
  key: string;
  name: string;
  area: string;
  type: string;
  rating: number;
  note: string;
};

const VENUES_PER_PAGE = 25;

export function AdminVenueOperationsDesk({
  venues,
}: {
  venues: readonly VenueRow[];
}) {
  const [localVenues, setLocalVenues] = useState<VenueRow[]>([...venues]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  function updateVenue(key: string, patch: Partial<VenueRow>) {
    setLocalVenues((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  const filtered = localVenues.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.area.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / VENUES_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * VENUES_PER_PAGE, (safePage + 1) * VENUES_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search venues by name, area, or type..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <span className="text-xs text-brand-text-muted">
          {filtered.length} of {localVenues.length} venues
        </span>
      </div>
      <DashboardTable
        columns={["Venue", "Area", "Type", "Rating", "Actions"]}
        rows={paged.map((v) => ({
          key: v.key,
          cells: [
            <div key="n" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-text-muted" />
              <div>
                <a href={`/venues/${v.key}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-primary hover:underline">{v.name}</a>
                {v.note && <div className="text-xs text-brand-text-muted">{v.note}</div>}
              </div>
            </div>,
            v.area,
            <ToneBadge key="t" tone="neutral">{v.type}</ToneBadge>,
            <div key="r" className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-brand-coral" />
              <span className="text-sm tabular-nums font-medium">{v.rating.toFixed(1)}</span>
            </div>,
            <div key="a" className="flex gap-1.5">
              <button
                type="button"
                className={btnGhost}
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/venues/action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ key: v.key, action: "verify" }),
                    });
                    if (!res.ok) { toast("error", `Could not verify ${v.name}.`); return; }
                    toast("success", `${v.name} verified`);
                  } catch {
                    toast("error", `Could not verify ${v.name}. Please try again.`);
                  }
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brand-sage" /> Verify
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/venues/action", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ key: v.key, action: "suspend" }),
                    });
                    if (!res.ok) { toast("error", `Could not suspend ${v.name}.`); return; }
                    toast("success", `${v.name} suspended`);
                  } catch {
                    toast("error", `Could not suspend ${v.name}. Please try again.`);
                  }
                }}
              >
                <Ban className="h-3.5 w-3.5 text-brand-coral" /> Suspend
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  window.open(`/venues/${v.key}`, "_blank");
                }}
              >
                <Edit2 className="h-3.5 w-3.5" /> View
              </button>
            </div>,
          ],
        }))}
        dense
        caption="Venue operations"
      />
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-brand-border-light pt-3">
          <span className="text-xs text-brand-text-muted">
            Page {safePage + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={cn(btnGhost, "disabled:opacity-40")}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className={cn(btnGhost, "disabled:opacity-40")}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   12. AdminModerationOperationsDesk
   ═══════════════════════════════════════════════════ */

type ModerationReport = {
  key: string;
  subject: string;
  priority: string;
  status: string;
  note: string;
};

export function AdminModerationOperationsDesk({
  reports,
}: {
  reports: readonly ModerationReport[];
}) {
  const [localReports, setLocalReports] = useState<ModerationReport[]>([...reports]);
  const { toast } = useToast();

  async function updateReport(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/moderation/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update report."); return; }
      setLocalReports((prev) => prev.map((r) => (r.key === key ? { ...r, status } : r)));
      toast("success", `Report ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update report. Please try again.`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {localReports.map((r) => (
          <div key={r.key} className="rounded-xl border border-brand-border-light bg-white p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-brand-text">{r.subject}</h3>
              <ToneBadge tone={r.priority.toLowerCase() === "high" ? "coral" : r.priority.toLowerCase() === "medium" ? "indigo" : "neutral"}>
                {r.priority}
              </ToneBadge>
            </div>
            <ToneBadge tone={toneForStatus(r.status)}>{r.status}</ToneBadge>
            {r.note && <p className="mt-2 text-xs text-brand-text-muted">{r.note}</p>}
            <div className="flex gap-1.5 border-t border-brand-border-light pt-3 mt-3">
              <button type="button" className={btnGhost} onClick={() => updateReport(r.key, "Dismissed")}>
                <X className="h-3.5 w-3.5" /> Dismiss
              </button>
              <button type="button" className={btnGhost} onClick={() => updateReport(r.key, "Warned")}>
                <AlertTriangle className="h-3.5 w-3.5 text-brand-coral" /> Warn
              </button>
              <button type="button" className={btnGhost} onClick={() => updateReport(r.key, "Suspended")}>
                <Ban className="h-3.5 w-3.5 text-brand-coral" /> Suspend
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   13. AdminVenueApprovalConsole
   ═══════════════════════════════════════════════════ */

type VenueApplication = {
  key: string;
  name: string;
  type: string;
  status: string;
  note: string;
};

export function AdminVenueApprovalConsole({
  applications,
}: {
  applications: readonly VenueApplication[];
}) {
  const [localApps, setLocalApps] = useState<VenueApplication[]>([...applications]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  async function updateApp(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/venues/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update application."); return; }
      setLocalApps((prev) => prev.map((a) => (a.key === key ? { ...a, status } : a)));
      toast("success", `Application ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update application. Please try again.`);
    }
  }

  async function batchUpdate(status: string) {
    const count = selected.size;
    const keys = [...selected];
    try {
      const res = await fetch("/api/admin/venues/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update applications."); return; }
      setLocalApps((prev) => prev.map((a) => (selected.has(a.key) ? { ...a, status } : a)));
      toast("success", `${count} applications ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update applications. Please try again.`);
    }
    setSelected(new Set());
  }

  function toggleSelect(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-indigo/20 bg-brand-indigo/5 p-3">
          <span className="text-sm font-medium text-brand-text">{selected.size} selected</span>
          <button type="button" className={btnPrimary} onClick={() => batchUpdate("Approved")}>
            Approve all
          </button>
          <button type="button" className={btnDanger} onClick={() => batchUpdate("Rejected")}>
            Reject all
          </button>
          <button type="button" className={btnOutline} onClick={() => batchUpdate("Waitlisted")}>
            Waitlist
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {localApps.map((app) => (
          <div key={app.key} className={cn("rounded-xl border bg-white p-4 transition", selected.has(app.key) ? "border-brand-indigo" : "border-brand-border-light")}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(app.key)}
                onChange={() => toggleSelect(app.key)}
                className="mt-0.5 rounded border-brand-border text-brand-indigo focus:ring-brand-indigo/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-brand-text">{app.name}</h3>
                  <ToneBadge tone={toneForStatus(app.status)}>{app.status}</ToneBadge>
                </div>
                <ToneBadge tone="neutral">{app.type}</ToneBadge>
                {app.note && <p className="mt-2 text-xs text-brand-text-muted">{app.note}</p>}
              </div>
            </div>
            <div className="flex gap-1.5 border-t border-brand-border-light pt-3 mt-3">
              <button type="button" className={btnGhost} onClick={() => updateApp(app.key, "Approved")}>
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Approve
              </button>
              <button type="button" className={btnGhost} onClick={() => updateApp(app.key, "Rejected")}>
                <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Reject
              </button>
              <button type="button" className={btnGhost} onClick={() => updateApp(app.key, "Waitlisted")}>
                <Clock className="h-3.5 w-3.5" /> Waitlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   14. AdminModerationConsole
   ═══════════════════════════════════════════════════ */

type BannedItem = {
  key: string;
  name: string;
  reason: string;
  appeal: string;
};

export function AdminModerationConsole({
  items,
}: {
  items: readonly BannedItem[];
}) {
  const [localItems, setLocalItems] = useState<BannedItem[]>([...items]);
  const { toast } = useToast();

  async function unban(key: string) {
    try {
      const res = await fetch("/api/admin/moderation/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: "unban" }),
      });
      if (!res.ok) { toast("error", "Could not unban user."); return; }
      setLocalItems((prev) => prev.filter((i) => i.key !== key));
      toast("success", "User unbanned");
    } catch {
      toast("error", "Could not unban user. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <DashboardTable
        columns={["User", "Reason", "Appeal", "Actions"]}
        rows={localItems.map((item) => ({
          key: item.key,
          cells: [
            <div key="n" className="flex items-center gap-2">
              <AvatarStamp name={item.name} size="sm" tone="coral" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>,
            <span key="r" className="text-xs text-brand-text-muted">{item.reason}</span>,
            item.appeal ? (
              <div key="a" className="max-w-xs">
                <ToneBadge tone="indigo">Has appeal</ToneBadge>
                <p className="mt-1 text-xs text-brand-text-muted">{item.appeal}</p>
              </div>
            ) : (
              <span key="a" className="text-xs text-brand-text-muted">No appeal</span>
            ),
            <div key="act" className="flex gap-1.5">
              <button type="button" className={btnPrimary} onClick={() => unban(item.key)}>
                <Shield className="h-3.5 w-3.5" /> Unban
              </button>
              {item.appeal && (
                <button type="button" className={btnOutline} onClick={() => toast("info", `Appeal from ${item.name}: "${item.appeal}". Use Unban to reinstate.`)}>
                  <FileText className="h-3.5 w-3.5" /> Review
                </button>
              )}
            </div>,
          ],
        }))}
        dense
        caption="Banned users"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   15. AdminSettingsControlCenter
   ═══════════════════════════════════════════════════ */

type SettingsSection = {
  key: string;
  title: string;
  items: readonly { label: string; value: string }[];
};

export function AdminSettingsControlCenter({
  settings,
}: {
  settings: readonly SettingsSection[];
}) {
  const [sections, setSections] = useState(
    settings.map((s) => ({
      ...s,
      items: s.items.map((i) => ({ ...i })),
    }))
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { toast } = useToast();

  function updateItem(sectionKey: string, label: string, value: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.key === sectionKey
          ? { ...s, items: s.items.map((i) => (i.label === label ? { ...i, value } : i)) }
          : s
      )
    );
  }

  async function saveSection(sectionKey: string) {
    const section = sections.find((s) => s.key === sectionKey);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey, items: section?.items }),
      });
      if (!res.ok) { toast("error", "Could not save settings."); return; }
      toast("success", `${sectionKey} settings saved`);
    } catch {
      toast("error", `Could not save ${sectionKey} settings. Please try again.`);
    }
    setEditingSection(null);
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isEditing = editingSection === section.key;
        return (
          <Surface key={section.key} eyebrow="Settings" title={section.title}>
            {isEditing ? (
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label}>
                    <label className="block text-sm font-medium text-brand-text mb-1">{item.label}</label>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateItem(section.key, item.label, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button type="button" className={btnPrimary} onClick={() => saveSection(section.key)}>
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button type="button" className={btnOutline} onClick={() => setEditingSection(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <KeyValueList
                  items={section.items.map((i, idx) => ({ key: `${section.key}-${idx}`, label: i.label, value: i.value }))}
                />
                <div className="mt-3">
                  <button type="button" className={btnOutline} onClick={() => setEditingSection(section.key)}>
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </>
            )}
          </Surface>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   16. AdminContentControlCenter
   ═══════════════════════════════════════════════════ */

type ContentData = {
  sections: readonly { key: string; title: string; status: string; note: string }[];
  categories: readonly { key: string; name: string; count: string; tone: string }[];
  blogQueue: readonly { key: string; title: string; category: string; status: string }[];
};

export function AdminContentControlCenter({ content }: { content: ContentData }) {
  const [sections, setSections] = useState([...content.sections.map((s) => ({ ...s }))]);
  const [blogQueue, setBlogQueue] = useState([...content.blogQueue.map((b) => ({ ...b }))]);
  const { toast } = useToast();

  async function updateSection(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/content/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update section."); return; }
      setSections((prev) => prev.map((s) => (s.key === key ? { ...s, status } : s)));
      toast("success", `Section ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update section. Please try again.`);
    }
  }

  async function updateBlog(key: string, status: string) {
    try {
      const res = await fetch("/api/admin/content/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: status.toLowerCase() }),
      });
      if (!res.ok) { toast("error", "Could not update post."); return; }
      setBlogQueue((prev) => prev.map((b) => (b.key === key ? { ...b, status } : b)));
      toast("success", `Post ${status.toLowerCase()}`);
    } catch {
      toast("error", `Could not update post. Please try again.`);
    }
  }

  return (
    <div className="space-y-4">

      {/* Content sections */}
      <Surface eyebrow="Content" title="Sections">
        <DashboardTable
          columns={["Section", "Status", "Note", "Actions"]}
          rows={sections.map((s) => ({
            key: s.key,
            cells: [
              <span key="t" className="font-medium">{s.title}</span>,
              <ToneBadge key="s" tone={toneForStatus(s.status)}>{s.status}</ToneBadge>,
              <span key="n" className="text-xs text-brand-text-muted">{s.note}</span>,
              <div key="a" className="flex gap-1.5">
                <button type="button" className={btnGhost} onClick={() => updateSection(s.key, "Approved")}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Approve
                </button>
                <button type="button" className={btnGhost} onClick={() => updateSection(s.key, "Flagged")}>
                  <Flag className="h-3.5 w-3.5 text-brand-coral" /> Flag
                </button>
                <button type="button" className={btnGhost} onClick={() => updateSection(s.key, "Removed")}>
                  <Trash2 className="h-3.5 w-3.5 text-brand-coral" /> Remove
                </button>
              </div>,
            ],
          }))}
          dense
        />
      </Surface>

      {/* Categories */}
      <Surface eyebrow="Taxonomy" title="Categories">
        <div className="flex flex-wrap gap-2">
          {content.categories.map((c) => (
            <div key={c.key} className="rounded-lg border border-brand-border-light bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <ToneBadge tone={(c.tone as DashboardTone) || "neutral"}>{c.name}</ToneBadge>
                <span className="text-xs tabular-nums text-brand-text-muted">{c.count}</span>
              </div>
            </div>
          ))}
        </div>
      </Surface>

      {/* Blog queue */}
      <Surface eyebrow="Blog" title="Publishing queue">
        <DashboardTable
          columns={["Title", "Category", "Status", "Actions"]}
          rows={blogQueue.map((b) => ({
            key: b.key,
            cells: [
              <span key="t" className="font-medium">{b.title}</span>,
              <ToneBadge key="c" tone="neutral">{b.category}</ToneBadge>,
              <ToneBadge key="s" tone={toneForStatus(b.status)}>{b.status}</ToneBadge>,
              <div key="a" className="flex gap-1.5">
                {b.status !== "Published" && (
                  <button type="button" className={btnGhost} onClick={() => updateBlog(b.key, "Published")}>
                    <Send className="h-3.5 w-3.5 text-brand-sage" /> Publish
                  </button>
                )}
                {b.status !== "Rejected" && (
                  <button type="button" className={btnGhost} onClick={() => updateBlog(b.key, "Rejected")}>
                    <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Reject
                  </button>
                )}
              </div>,
            ],
          }))}
          dense
        />
      </Surface>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   17. AdminCommsStudio
   ═══════════════════════════════════════════════════ */

type CommsData = {
  audiences: string[];
  draft: {
    templateKey: string;
    subject: string;
    preview: string;
    preheader: string;
    headline: string;
    ctaLabel: string;
    footer: string;
  };
  history: readonly { key: string; title: string; audience: string; sent: string; result: string }[];
};

export function AdminCommsStudio({ comms }: { comms: CommsData }) {
  const [draft, setDraft] = useState({ ...comms.draft });
  const [selectedAudience, setSelectedAudience] = useState(comms.audiences[0] ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  function updateDraft(field: keyof typeof draft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (sending || !draft.subject?.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/comms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience: selectedAudience, draft }),
      });
      if (!res.ok) { toast("error", "Could not send message. Please try again."); return; }
      const result = await res.json();
      if (result.ok) {
        toast("success", `Message sent to "${selectedAudience}"`);
      } else {
        toast("error", result.error ?? `Could not send message. Please try again.`);
      }
    } catch {
      toast("error", `Could not send message. Please try again.`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Draft editor */}
        <Surface eyebrow="Compose" title="Draft editor">
          <div className="space-y-3">
            {/* Audience selector */}
            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Audience</label>
              <select
                className={selectClass + " w-full"}
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
              >
                {comms.audiences.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Subject</label>
              <input type="text" value={draft.subject} onChange={(e) => updateDraft("subject", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Preheader</label>
              <input type="text" value={draft.preheader} onChange={(e) => updateDraft("preheader", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Headline</label>
              <input type="text" value={draft.headline} onChange={(e) => updateDraft("headline", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Preview text</label>
              <textarea
                value={draft.preview}
                onChange={(e) => updateDraft("preview", e.target.value)}
                rows={3}
                className={cn(inputClass, "resize-y")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-text-muted mb-1">CTA Label</label>
                <input type="text" value={draft.ctaLabel} onChange={(e) => updateDraft("ctaLabel", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text-muted mb-1">Footer</label>
                <input type="text" value={draft.footer} onChange={(e) => updateDraft("footer", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" className={btnPrimary} onClick={handleSend}>
                <Send className="h-3.5 w-3.5" /> Send
              </button>
              <button type="button" className={btnOutline} onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-3.5 w-3.5" /> {showPreview ? "Hide preview" : "Preview"}
              </button>
            </div>
          </div>
        </Surface>

        {/* Preview */}
        {showPreview && (
          <Surface eyebrow="Preview" title="Email preview">
            <div className="rounded-lg border border-brand-border-light bg-brand-sand-light p-4 space-y-3">
              <div className="text-xs text-brand-text-muted">To: {selectedAudience}</div>
              <div className="text-sm font-semibold text-brand-text">{draft.subject}</div>
              <div className="text-xs text-brand-text-muted italic">{draft.preheader}</div>
              <hr className="border-brand-border-light" />
              <h3 className="text-lg font-bold text-brand-text">{draft.headline}</h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">{draft.preview}</p>
              <div className="pt-2">
                <button type="button" className={btnPrimary}>{draft.ctaLabel}</button>
              </div>
              <hr className="border-brand-border-light" />
              <div className="text-xs text-brand-text-light">{draft.footer}</div>
            </div>
          </Surface>
        )}
      </div>

      {/* History */}
      <Surface eyebrow="History" title="Sent communications">
        <DashboardTable
          columns={["Title", "Audience", "Sent", "Result"]}
          rows={comms.history.map((h) => ({
            key: h.key,
            cells: [
              <span key="t" className="font-medium">{h.title}</span>,
              <ToneBadge key="a" tone="neutral">{h.audience}</ToneBadge>,
              h.sent,
              <ToneBadge key="r" tone={toneForStatus(h.result)}>{h.result}</ToneBadge>,
            ],
          }))}
          dense
          caption="Communication history"
        />
      </Surface>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Generic action button for admin tables
   ═══════════════════════════════════════════════════ */

export function AdminActionButton({
  actionKey,
  actionLabel,
  endpoint,
}: {
  actionKey: string;
  actionLabel: string;
  endpoint: string;
}) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: actionKey, action: actionLabel.toLowerCase() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast("error", (body as Record<string, string>).error ?? `Could not complete "${actionLabel}".`);
        setLoading(false);
        return;
      }
      setDone(true);
      toast("success", `Action "${actionLabel}" completed`);
    } catch {
      toast("error", `Could not complete "${actionLabel}". Please try again.`);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <span className="text-xs text-brand-text-muted">
        <Check className="mr-1 inline h-3 w-3" />
        Done
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="text-sm font-medium text-brand-indigo transition hover:text-brand-indigo-dark hover:underline disabled:opacity-50"
    >
      {loading ? "..." : actionLabel}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   BOOKING ACTIONS TABLE (client component for admin/bookings)
   ═══════════════════════════════════════════════════ */

type BookingRow = {
  key: string;
  organizer: string;
  venue: string;
  date: string;
  time: string;
  attendance: string;
  status: string;
  message?: string;
};

export function AdminBookingActionsTable({
  bookings,
}: {
  bookings: readonly BookingRow[];
}) {
  const [local, setLocal] = useState<BookingRow[]>([...bookings]);
  const [filter, setFilter] = useState("All");
  const { toast } = useToast();

  async function updateBooking(key: string, newStatus: string) {
    try {
      const res = await fetch("/api/admin/bookings/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, action: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast("error", (body as Record<string, string>).error ?? "Could not update booking.");
        return;
      }
      setLocal((prev) => prev.map((b) => (b.key === key ? { ...b, status: newStatus } : b)));
      toast("success", `Booking ${newStatus}`);
    } catch {
      toast("error", "Could not update booking. Please try again.");
    }
  }

  const filtered = filter === "All" ? local : local.filter((b) => b.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-brand-text-muted">Status:</span>
        {["All", "pending", "accepted", "cancelled"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-2.5 py-1 transition ${filter === s ? "bg-brand-indigo text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <DashboardTable
        columns={["Organizer", "Venue", "Date", "Time", "Status", "Actions"]}
        rows={filtered.map((b) => ({
          key: b.key,
          cells: [
            <span key="org" className="font-medium">{b.organizer}</span>,
            b.venue,
            b.date,
            b.time,
            <ToneBadge key="s" tone={toneForStatus(b.status)}>
              {b.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </ToneBadge>,
            <div key="a" className="flex gap-1.5">
              {b.status === "pending" && (
                <>
                  <button type="button" className={btnGhost} onClick={() => updateBooking(b.key, "accepted")}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-sage" /> Approve
                  </button>
                  <button type="button" className={btnGhost} onClick={() => updateBooking(b.key, "declined")}>
                    <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Decline
                  </button>
                </>
              )}
              {b.status === "accepted" && (
                <button type="button" className={btnGhost} onClick={() => updateBooking(b.key, "cancelled")}>
                  <XCircle className="h-3.5 w-3.5 text-brand-coral" /> Cancel
                </button>
              )}
              {(b.status === "cancelled" || b.status === "declined") && (
                <span className="text-xs text-brand-text-muted">No actions</span>
              )}
            </div>,
          ],
        }))}
        dense
        caption="Venue booking requests"
      />
    </div>
  );
}

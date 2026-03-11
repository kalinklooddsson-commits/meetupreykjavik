"use client";

import { startTransition, useDeferredValue, useState } from "react";
import {
  Ban,
  CheckCheck,
  CreditCard,
  Crown,
  Eye,
  Flag,
  LayoutTemplate,
  MailPlus,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  UserRoundCog,
  UserRoundPlus,
  X,
} from "lucide-react";
import { ToneBadge } from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

type AdminUser = {
  key: string;
  name: string;
  email: string;
  type: string;
  status: string;
  joined: string;
  lastActive: string;
  groups: string;
  events: string;
  revenue: string;
};

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

type AudiencePicker = {
  eventTitle: string;
  eventSlug: string;
  target: string;
  seatsRemaining: number;
  selectedIds: string[];
  candidates: AudienceCandidate[];
};

type ClientFitSignal = {
  key: string;
  label: string;
  score: number;
  note: string;
};

type ClientTimelineEntry = {
  key: string;
  title: string;
  meta: string;
  detail: string;
};

type ClientDossier = {
  name: string;
  fitBreakdown: ClientFitSignal[];
  accessRules: Array<{ label: string; value: string }>;
  curationTimeline: ClientTimelineEntry[];
  playbook: string[];
  adminNotes: string[];
};

type VenueApplication = {
  key: string;
  name: string;
  type: string;
  status: string;
  note: string;
};

type ModerationReport = {
  key: string;
  subject: string;
  priority: string;
  status: string;
  note: string;
};

type BannedUser = {
  key: string;
  name: string;
  reason: string;
  appeal: string;
};

type SettingsSection = {
  key: string;
  title: string;
  items: Array<{ label: string; value: string }>;
};

type AdminGroupRow = {
  key: string;
  name: string;
  members: number;
  status: string;
  health: string;
  action: string;
};

type AdminEventRow = {
  key: string;
  title: string;
  status: string;
  category: string;
  venue: string;
  date: string;
  action: string;
};

type AdminRevenuePlan = {
  name: string;
  price: string;
  description: string;
};

type RevenuePolicy = {
  label: string;
  value: string;
};

type RevenueTransaction = {
  key: string;
  source: string;
  amount: string;
  status: string;
  when: string;
};

type RevenueSource = {
  label: string;
  value: number;
};

type AnalyticsCard = {
  key: string;
  title: string;
  tone: "indigo" | "coral" | "sage" | "basalt";
  data: number[];
};

type GeographySlice = {
  label: string;
  value: string;
};

type HeatGridRow = {
  label: string;
  values: number[];
};

type OpsInboxItem = {
  key: string;
  lane: string;
  title: string;
  owner: string;
  due: string;
  status: string;
  note: string;
};

type HandoffEntry = {
  key: string;
  lane: string;
  actor: string;
  when: string;
  summary: string;
};

type IncidentItem = {
  key: string;
  title: string;
  severity: string;
  owner: string;
  status: string;
  note: string;
};

type OwnershipLane = {
  key: string;
  lane: string;
  lead: string;
  coverage: string;
  load: string;
};

type ActiveVenue = {
  key: string;
  name: string;
  area: string;
  type: string;
  rating: number;
  note: string;
};

const pillBase =
  "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold";
const integerFormatter = new Intl.NumberFormat("is-IS");

type AudienceMode =
  | "all"
  | "high_fit"
  | "selected"
  | "review"
  | "trusted"
  | "newcomers";

type AudienceLane = "invite" | "approve" | "waitlist" | "hold";

function defaultLaneForCandidate(candidate: AudienceCandidate): AudienceLane {
  const status = candidate.status.toLowerCase();

  if (status.includes("waitlist")) {
    return "waitlist";
  }

  if (status.includes("review")) {
    return "hold";
  }

  if (status.includes("trusted") || status.includes("reliable") || candidate.fitScore >= 92) {
    return "approve";
  }

  return "invite";
}

function laneClasses(lane: AudienceLane) {
  if (lane === "approve") {
    return "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]";
  }

  if (lane === "waitlist") {
    return "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]";
  }

  if (lane === "hold") {
    return "border-[rgba(30,27,46,0.16)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]";
  }

  return "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]";
}

function laneLabel(lane: AudienceLane) {
  if (lane === "approve") {
    return "Approve";
  }

  if (lane === "waitlist") {
    return "Waitlist";
  }

  if (lane === "hold") {
    return "Hold";
  }

  return "Invite";
}

function ActionButton({
  label,
  onClick,
  tone = "indigo",
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  tone?: "indigo" | "coral" | "sage" | "basalt";
  icon?: typeof Eye;
}) {
  const toneClass =
    tone === "coral"
      ? "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]"
      : tone === "sage"
        ? "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]"
        : tone === "basalt"
          ? "border-[rgba(30,27,46,0.18)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]"
          : "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ops-action-button inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
        toneClass,
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
    </button>
  );
}

export function AdminUserCommandCenter({ users }: { users: AdminUser[] }) {
  const [directory, setDirectory] = useState(users);
  const [selectedId, setSelectedId] = useState(users[0]?.key ?? "");
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    users.slice(0, 2).map((user) => user.key),
  );
  const [search, setSearch] = useState("");
  const [bulkMessage, setBulkMessage] = useState(
    `${Math.min(users.length, 2)} accounts are staged for admin bulk control.`,
  );
  const deferredSearch = useDeferredValue(search);

  const filteredUsers = directory.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.type} ${user.status}`.toLowerCase();
    return haystack.includes(deferredSearch.toLowerCase());
  });

  const selectedUser =
    directory.find((user) => user.key === selectedId) ?? filteredUsers[0] ?? users[0];
  const selectedUsers = directory.filter((user) => selectedKeys.includes(user.key));
  const flaggedCount = selectedUsers.filter((user) =>
    user.status.toLowerCase().includes("flag"),
  ).length;
  const organizerCount = selectedUsers.filter((user) =>
    user.type.toLowerCase().includes("organizer"),
  ).length;

  function mutateSelected(next: Partial<AdminUser>) {
    if (!selectedUser) {
      return;
    }

    startTransition(() => {
      setDirectory((current) =>
        current.map((user) =>
          user.key === selectedUser.key ? { ...user, ...next } : user,
        ),
      );
    });
  }

  function toggleSelectedKey(key: string) {
    startTransition(() => {
      setSelectedKeys((current) =>
        current.includes(key)
          ? current.filter((entry) => entry !== key)
          : [...current, key],
      );
    });
  }

  function mutateMany(next: Partial<AdminUser>, message: string) {
    if (!selectedKeys.length) {
      setBulkMessage("Select at least one account before using batch actions.");
      return;
    }

    startTransition(() => {
      setDirectory((current) =>
        current.map((user) =>
          selectedKeys.includes(user.key) ? { ...user, ...next } : user,
        ),
      );
      setBulkMessage(message);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <label className="ops-search-shell flex items-center gap-3 rounded-full border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--brand-text-light)]" />
            <input
              type="search"
              name="admin-user-search"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                startTransition(() => setSearch(value));
              }}
              aria-label="Search users"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search users, emails, roles, or status"
              className="w-full border-none bg-transparent text-sm text-[var(--brand-text)] outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                pillBase,
                "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]",
              )}
            >
              {filteredUsers.length} visible
            </span>
            <span
              className={cn(
                pillBase,
                "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]",
              )}
            >
              {selectedKeys.length} selected
            </span>
            <span
              className={cn(
                pillBase,
                "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]",
              )}
            >
              {flaggedCount} flagged
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] bg-[linear-gradient(140deg,rgba(30,27,46,0.98),rgba(55,48,163,0.94),rgba(232,97,77,0.74))] p-5 text-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/58">
                Bulk control
              </div>
              <div className="font-editorial mt-3 text-3xl tracking-[-0.05em] text-white">
                Act on account cohorts, not one row at a time
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/74">
                This turns user admin into a real operations surface: select people in groups,
                change posture quickly, and keep a visible note of what was staged.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Selected now",
                  value: String(selectedKeys.length),
                },
                {
                  label: "Organizer mix",
                  value: String(organizerCount),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/54">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton
              label="Select visible"
              onClick={() => {
                startTransition(() => {
                  setSelectedKeys(filteredUsers.map((user) => user.key));
                  setBulkMessage(
                    `${filteredUsers.length} visible accounts staged for admin batch control.`,
                  );
                });
              }}
              icon={CheckCheck}
            />
            <ActionButton
              label="Promote selected"
              onClick={() =>
                mutateMany(
                  { type: "Admin", status: "Privileged" },
                  `${selectedKeys.length} selected accounts promoted into the privileged lane.`,
                )
              }
              tone="indigo"
              icon={Crown}
            />
            <ActionButton
              label="Convert to Organizer"
              onClick={() =>
                mutateMany(
                  { type: "Organizer", status: "Verified" },
                  `${selectedKeys.length} selected accounts moved into the organizer lane.`,
                )
              }
              tone="sage"
              icon={UserRoundPlus}
            />
            <ActionButton
              label="Suspend selected"
              onClick={() =>
                mutateMany(
                  { status: "Suspended" },
                  `${selectedKeys.length} selected accounts moved into suspended status.`,
                )
              }
              tone="coral"
              icon={Ban}
            />
            <ActionButton
              label="Reactivate selected"
              onClick={() =>
                mutateMany(
                  { status: "Active" },
                  `${selectedKeys.length} selected accounts reactivated.`,
                )
              }
              tone="sage"
              icon={RotateCcw}
            />
            <ActionButton
              label="Queue outreach"
              onClick={() =>
                setBulkMessage(
                  `${selectedKeys.length} selected accounts queued for direct admin outreach.`,
                )
              }
              tone="basalt"
              icon={MailPlus}
            />
            <ActionButton
              label="Clear selection"
              onClick={() => {
                startTransition(() => setSelectedKeys([]));
                setBulkMessage("Selection cleared. Choose a new cohort to continue.");
              }}
              tone="basalt"
              icon={X}
            />
          </div>

          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[1.1rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/76"
          >
            {bulkMessage}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <article
              key={user.key}
              onClick={() => setSelectedId(user.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedId(user.key);
                }
              }}
              role="button"
              tabIndex={0}
              className={cn(
                "ops-selection-card block w-full cursor-pointer rounded-[1.2rem] border p-4 text-left transition",
                user.key === selectedUser?.key
                  ? "ops-selection-card-active border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-white/78 hover:border-[rgba(79,70,229,0.16)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-[var(--brand-text)]">{user.name}</div>
                  <p className="mt-1 text-sm text-[var(--brand-text-muted)]">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSelectedKey(user.key);
                    }}
                    className={cn(
                      pillBase,
                      selectedKeys.includes(user.key)
                        ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                        : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                    )}
                  >
                    {selectedKeys.includes(user.key) ? "Selected" : "Select"}
                  </button>
                  <span
                    className={cn(
                      pillBase,
                      "border-[rgba(79,70,229,0.16)] bg-white/80 text-[var(--brand-text-muted)]",
                    )}
                  >
                    {user.type}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--brand-text-light)]">
                <span>{user.status}</span>
                <span>•</span>
                <span>{user.lastActive}</span>
                <span>•</span>
                <span>{user.events} events</span>
              </div>
            </article>
          ))}
        </div>

        {selectedUser ? (
          <div className="ops-detail-panel rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {selectedUser.name}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {selectedUser.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={cn(pillBase, "border-[rgba(79,70,229,0.16)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
                  {selectedUser.type}
                </span>
                <span className={cn(pillBase, "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]")}>
                  {selectedUser.status}
                </span>
                {selectedKeys.includes(selectedUser.key) ? (
                  <span className={cn(pillBase, "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]")}>
                    In bulk queue
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Joined", value: selectedUser.joined },
                { label: "Last active", value: selectedUser.lastActive },
                { label: "Groups", value: selectedUser.groups },
                { label: "Events", value: selectedUser.events },
                { label: "Revenue", value: selectedUser.revenue },
                { label: "Current role", value: selectedUser.type },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <ActionButton
                label="Impersonate"
                onClick={() => mutateSelected({ lastActive: "Impersonated now" })}
                icon={Eye}
              />
              <ActionButton
                label="Promote to Admin"
                onClick={() => mutateSelected({ type: "Admin", status: "Privileged" })}
                tone="indigo"
                icon={Crown}
              />
              <ActionButton
                label="Convert to Organizer"
                onClick={() => mutateSelected({ type: "Organizer", status: "Verified" })}
                tone="sage"
                icon={UserRoundPlus}
              />
              <ActionButton
                label="Suspend"
                onClick={() => mutateSelected({ status: "Suspended" })}
                tone="coral"
                icon={Ban}
              />
              <ActionButton
                label="Reactivate"
                onClick={() => mutateSelected({ status: "Active" })}
                tone="sage"
                icon={RotateCcw}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminEventAudiencePicker({ audience }: { audience: AudiencePicker }) {
  const [selectedIds, setSelectedIds] = useState(audience.selectedIds);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<AudienceMode>("all");
  const [activeId, setActiveId] = useState(
    audience.selectedIds[0] ?? audience.candidates[0]?.id ?? "",
  );
  const [batchNote, setBatchNote] = useState(
    "Curated invite queue is ready for admin review.",
  );
  const [laneById, setLaneById] = useState<Record<string, AudienceLane>>(() =>
    Object.fromEntries(
      audience.candidates.map((candidate) => [
        candidate.id,
        defaultLaneForCandidate(candidate),
      ]),
    ),
  );
  const deferredSearch = useDeferredValue(search);

  const filteredCandidates = audience.candidates.filter((candidate) => {
    if (mode === "high_fit" && candidate.fitScore < 85) {
      return false;
    }

    if (mode === "selected" && !selectedIds.includes(candidate.id)) {
      return false;
    }

    if (mode === "review" && !candidate.status.toLowerCase().includes("review")) {
      return false;
    }

    if (
      mode === "trusted" &&
      !(
        candidate.status.toLowerCase().includes("trusted") ||
        candidate.status.toLowerCase().includes("reliable") ||
        candidate.fitScore >= 90
      )
    ) {
      return false;
    }

    if (mode === "newcomers" && !candidate.status.toLowerCase().includes("newcomer")) {
      return false;
    }

    const haystack = `${candidate.name} ${candidate.tier} ${candidate.status} ${candidate.tags.join(" ")}`.toLowerCase();
    return haystack.includes(deferredSearch.toLowerCase());
  });

  const selectedCandidates = audience.candidates.filter((candidate) =>
    selectedIds.includes(candidate.id),
  );
  const activeCandidate =
    audience.candidates.find((candidate) => candidate.id === activeId) ??
    filteredCandidates[0] ??
    selectedCandidates[0] ??
    audience.candidates[0];
  const averageFit = selectedCandidates.length
    ? Math.round(
        selectedCandidates.reduce((total, candidate) => total + candidate.fitScore, 0) /
          selectedCandidates.length,
      )
    : 0;
  const topTags = Array.from(
    selectedCandidates
      .flatMap((candidate) => candidate.tags)
      .reduce((map, tag) => map.set(tag, (map.get(tag) ?? 0) + 1), new Map<string, number>())
      .entries(),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const laneCounts = selectedCandidates.reduce(
    (counts, candidate) => {
      counts[laneById[candidate.id] ?? "invite"] += 1;
      return counts;
    },
    {
      invite: 0,
      approve: 0,
      waitlist: 0,
      hold: 0,
    } satisfies Record<AudienceLane, number>,
  );

  function toggleCandidate(id: string) {
    startTransition(() => {
      setSelectedIds((current) =>
        current.includes(id)
          ? current.filter((candidateId) => candidateId !== id)
          : [...current, id],
      );
      setActiveId(id);
    });
  }

  function setLane(id: string, lane: AudienceLane) {
    startTransition(() => {
      setLaneById((current) => ({ ...current, [id]: lane }));
      setSelectedIds((current) => (current.includes(id) ? current : [...current, id]));
      setActiveId(id);
    });
  }

  const remaining = Math.max(audience.seatsRemaining - selectedIds.length, 0);

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              {audience.eventTitle}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--brand-text-muted)]">
              {audience.target}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn(pillBase, "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
              {selectedIds.length} chosen
            </span>
            <span className={cn(pillBase, "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]")}>
              {remaining} seats left
            </span>
            <span className={cn(pillBase, "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]")}>
              {averageFit}% avg fit
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-full border border-[var(--brand-border)] bg-[var(--brand-sand-light)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--brand-text-light)]" />
            <input
              type="search"
              name="admin-client-search"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                startTransition(() => setSearch(value));
              }}
              aria-label="Search event clients"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search by client, status, tier, or tag"
              className="w-full border-none bg-transparent text-sm text-[var(--brand-text)] outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All clients"],
              ["high_fit", "High fit"],
              ["trusted", "Trusted"],
              ["newcomers", "Newcomers"],
              ["selected", "Selected"],
              ["review", "Needs review"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  startTransition(() => setMode(key as AudienceMode))
                }
                className={cn(
                  pillBase,
                  mode === key
                    ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                    : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {filteredCandidates.map((candidate) => {
            const selected = selectedIds.includes(candidate.id);
            const active = candidate.id === activeCandidate?.id;
            const lane = laneById[candidate.id] ?? defaultLaneForCandidate(candidate);

            return (
              <article
                key={candidate.id}
                onClick={() => setActiveId(candidate.id)}
                className={cn(
                  "rounded-[1.3rem] border p-4 transition cursor-pointer",
                  selected
                    ? "border-[rgba(79,70,229,0.22)] bg-[rgba(79,70,229,0.08)]"
                    : active
                      ? "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.05)]"
                      : "border-[rgba(153,148,168,0.12)] bg-white/82",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">{candidate.name}</div>
                    <p className="mt-1 text-sm text-[var(--brand-text-muted)]">
                      {candidate.tier} · {candidate.status} · Last active {candidate.lastActive}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(pillBase, "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]")}>
                      {candidate.fitScore}% fit
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCandidate(candidate.id)}
                      className={cn(
                        pillBase,
                        selected
                          ? "border-[rgba(30,27,46,0.18)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]"
                          : "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]",
                      )}
                    >
                      {selected ? "Remove" : "Select"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {candidate.reason}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        pillBase,
                        "border-[rgba(153,148,168,0.14)] bg-white/78 text-[var(--brand-text-muted)]",
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["invite", "approve", "waitlist", "hold"] as const).map((nextLane) => (
                    <button
                      key={nextLane}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLane(candidate.id, nextLane);
                      }}
                      className={cn(
                        pillBase,
                        lane === nextLane
                          ? laneClasses(nextLane)
                          : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                      )}
                    >
                      {laneLabel(nextLane)}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          {activeCandidate ? (
            <div className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                    {activeCandidate.name}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {activeCandidate.reason}
                  </p>
                </div>
                <span className={cn(pillBase, laneClasses(laneById[activeCandidate.id] ?? "invite"))}>
                  {laneLabel(laneById[activeCandidate.id] ?? "invite")}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/84 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    Fit score
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                    {activeCandidate.fitScore}% · {activeCandidate.tier}
                  </div>
                </div>
                <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/84 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    Last active
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                    {activeCandidate.lastActive}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Selected clients
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              Admin can hand-pick people, assign an action lane, and manage room shape without leaving the event.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Approvals",
                value: String(laneCounts.approve),
                tone: "sage" as const,
              },
              {
                label: "Invites",
                value: String(laneCounts.invite),
                tone: "indigo" as const,
              },
              {
                label: "Waitlist",
                value: String(laneCounts.waitlist),
                tone: "coral" as const,
              },
              {
                label: "Hold",
                value: String(laneCounts.hold),
                tone: "basalt" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3"
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                  {item.label}
                </div>
                <div className={cn("mt-2 text-sm font-semibold", item.tone === "sage"
                  ? "text-[var(--brand-sage)]"
                  : item.tone === "coral"
                    ? "text-[var(--brand-coral)]"
                    : item.tone === "basalt"
                      ? "text-[var(--brand-basalt)]"
                      : "text-[var(--brand-indigo)]")}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {selectedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--brand-text)]">{candidate.name}</div>
                    <div className="text-xs text-[var(--brand-text-muted)]">
                      {candidate.fitScore}% fit · {candidate.tier}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCandidate(candidate.id)}
                    className="text-[var(--brand-coral)] transition hover:opacity-80"
                    aria-label={`Remove ${candidate.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["invite", "approve", "waitlist", "hold"] as const).map((lane) => (
                    <button
                      key={lane}
                      type="button"
                      onClick={() => setLane(candidate.id, lane)}
                      className={cn(
                        pillBase,
                        (laneById[candidate.id] ?? "invite") === lane
                          ? laneClasses(lane)
                          : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                      )}
                    >
                      {laneLabel(lane)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              Audience mix
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className={cn(
                    pillBase,
                    "border-[rgba(79,70,229,0.18)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {tag} · {count}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]">
            {batchNote}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <ActionButton
              label="Queue invites"
              onClick={() =>
                setBatchNote(
                  `${selectedCandidates.length} client records prepared for curated invite outreach.`,
                )
              }
              icon={MailPlus}
            />
            <ActionButton
              label="Approve selected"
              onClick={() => {
                startTransition(() => {
                  setLaneById((current) => ({
                    ...current,
                    ...Object.fromEntries(
                      selectedCandidates.map((candidate) => [candidate.id, "approve"]),
                    ),
                  }));
                });
                setBatchNote(
                  `${selectedCandidates.length} selected clients moved into the approval lane.`,
                );
              }}
              tone="sage"
              icon={CheckCheck}
            />
            <ActionButton
              label="Promote from waitlist"
              onClick={() => {
                const promoted = selectedCandidates.filter(
                  (candidate) => (laneById[candidate.id] ?? "invite") === "waitlist",
                );
                startTransition(() => {
                  setLaneById((current) => ({
                    ...current,
                    ...Object.fromEntries(
                      promoted.map((candidate) => [candidate.id, "approve"]),
                    ),
                  }));
                });
                setBatchNote(
                  promoted.length
                    ? `${promoted.length} waitlisted clients promoted into the approval lane.`
                    : "No selected waitlist candidates were queued for promotion.",
                );
              }}
              tone="coral"
              icon={Sparkles}
            />
            <ActionButton
              label="Hold for review"
              onClick={() => {
                startTransition(() => {
                  setLaneById((current) => ({
                    ...current,
                    ...Object.fromEntries(
                      selectedCandidates.map((candidate) => [candidate.id, "hold"]),
                    ),
                  }));
                });
                setBatchNote(
                  `${selectedCandidates.length} selected clients moved into the admin review lane.`,
                );
              }}
              tone="basalt"
              icon={ShieldAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminClientCurationWorkbench({
  dossier,
}: {
  dossier: ClientDossier;
}) {
  const [disposition, setDisposition] = useState<
    "priority_invite" | "fast_track" | "standard" | "cool_down" | "restricted"
  >("priority_invite");
  const [flags, setFlags] = useState([
    "Warm arrival handoff",
    "Protect messaging preference",
  ]);
  const [note, setNote] = useState(dossier.playbook[0] ?? "");

  function toggleFlag(flag: string) {
    startTransition(() => {
      setFlags((current) =>
        current.includes(flag)
          ? current.filter((entry) => entry !== flag)
          : [...current, flag],
      );
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {dossier.name}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  Admin curation stance, trust flags, and fit scoring all stay editable here.
                </p>
              </div>
              <span
                className={cn(
                  pillBase,
                  disposition === "fast_track"
                    ? "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]"
                    : disposition === "cool_down" || disposition === "restricted"
                      ? "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]"
                      : "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]",
                )}
              >
                {disposition.replaceAll("_", " ")}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ["priority_invite", "Priority invite"],
                ["fast_track", "Fast-track approval"],
                ["standard", "Standard matching"],
                ["cool_down", "Cooldown"],
                ["restricted", "Restricted"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    startTransition(
                      () =>
                        setDisposition(
                          value as
                            | "priority_invite"
                            | "fast_track"
                            | "standard"
                            | "cool_down"
                            | "restricted",
                        ),
                    )
                  }
                  className={cn(
                    pillBase,
                    disposition === value
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dossier.fitBreakdown.map((signal) => (
              <article
                key={signal.key}
                className="rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{signal.label}</div>
                  <span className={cn(pillBase, "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
                    {signal.score}%
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-[rgba(245,240,232,0.92)]">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      signal.score >= 85
                        ? "bg-[var(--brand-sage)]"
                        : signal.score >= 65
                          ? "bg-[var(--brand-coral)]"
                          : "bg-[var(--brand-basalt)]",
                    )}
                    style={{ width: `${signal.score}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {signal.note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Access and flags
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              These flags tell admin and organizers how to treat this profile during invite and approval workflows.
            </p>
          </div>
          <div className="grid gap-3">
            {dossier.accessRules.map((rule) => (
              <div
                key={rule.label}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3"
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                  {rule.label}
                </div>
                <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                  {rule.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              Admin flags
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Warm arrival handoff",
                "Protect messaging preference",
                "Good for premium rooms",
                "Bridge-builder",
                "Do not auto-match nightlife",
              ].map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  className={cn(
                    pillBase,
                    flags.includes(flag)
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              Admin note
            </div>
            <textarea
              value={note}
              onChange={(event) => {
                const value = event.target.value;
                startTransition(() => setNote(value));
              }}
              rows={5}
              className="mt-3 w-full rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text)] outline-none"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {dossier.playbook.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/80 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
            >
              {item}
            </div>
          ))}
          {dossier.adminNotes.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {dossier.curationTimeline.map((entry) => (
            <div
              key={entry.key}
              className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{entry.title}</div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                  {entry.meta}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {entry.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminGroupOperationsDesk({
  queue,
  groups,
}: {
  queue: Array<{ key: string; name: string; organizer: string; status: string; note: string }>;
  groups: AdminGroupRow[];
}) {
  const [activeQueue, setActiveQueue] = useState(queue);
  const [inventory, setInventory] = useState(groups);
  const [selectedKeys, setSelectedKeys] = useState(groups.slice(0, 2).map((group) => group.key));
  const [selectedKey, setSelectedKey] = useState(groups[0]?.key ?? "");
  const [message, setMessage] = useState(
    `${Math.min(groups.length, 2)} groups staged for admin operations.`,
  );

  const selectedGroup =
    inventory.find((group) => group.key === selectedKey) ??
    inventory.find((group) => selectedKeys.includes(group.key)) ??
    inventory[0];

  function toggleKey(key: string) {
    startTransition(() => {
      setSelectedKeys((current) =>
        current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
      );
      setSelectedKey(key);
    });
  }

  function mutateSelected(next: Partial<AdminGroupRow>, nextMessage: string) {
    if (!selectedKeys.length) {
      setMessage("Select at least one group before applying an admin action.");
      return;
    }

    startTransition(() => {
      setInventory((current) =>
        current.map((group) => (selectedKeys.includes(group.key) ? { ...group, ...next } : group)),
      );
      setMessage(nextMessage);
    });
  }

  function updateQueue(key: string, status: string, nextMessage: string) {
    startTransition(() => {
      setActiveQueue((current) =>
        current.map((group) => (group.key === key ? { ...group, status } : group)),
      );
      setMessage(nextMessage);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Group operations desk
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              Admin can feature, cool down, archive, or rescue groups from one place instead of
              working line by line across separate views.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn(pillBase, "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
              {selectedKeys.length} selected
            </span>
            <span className={cn(pillBase, "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]")}>
              {activeQueue.length} in queue
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton
            label="Feature selected"
            tone="sage"
            icon={Sparkles}
            onClick={() =>
              mutateSelected(
                { status: "Featured", action: "Monitor", health: "Excellent" },
                `${selectedKeys.length} groups moved into featured status.`,
              )
            }
          />
          <ActionButton
            label="Prompt organizer"
            tone="indigo"
            icon={MailPlus}
            onClick={() =>
              mutateSelected(
                { action: "Prompt organizer", health: "Needs cadence" },
                `${selectedKeys.length} groups queued for organizer outreach.`,
              )
            }
          />
          <ActionButton
            label="Archive selected"
            tone="coral"
            icon={Ban}
            onClick={() =>
              mutateSelected(
                { status: "Archived", action: "Archive none", health: "Archived" },
                `${selectedKeys.length} groups moved out of the live marketplace.`,
              )
            }
          />
        </div>
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
        >
          {message}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="space-y-3">
          {inventory.map((group) => (
            <article
              key={group.key}
              onClick={() => setSelectedKey(group.key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedKey(group.key);
                }
              }}
              role="button"
              tabIndex={0}
              className={cn(
                "cursor-pointer rounded-[1.2rem] border p-4 transition",
                group.key === selectedGroup?.key
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-white/82",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleKey(group.key);
                  }}
                  className={cn(
                    pillBase,
                    selectedKeys.includes(group.key)
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {selectedKeys.includes(group.key) ? "Selected" : "Select"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToneBadge tone={group.status.toLowerCase().includes("feature") ? "sage" : "indigo"}>
                  {group.status}
                </ToneBadge>
                <ToneBadge tone={group.health.toLowerCase().includes("need") ? "coral" : "sand"}>
                  {group.health}
                </ToneBadge>
              </div>
              <div className="mt-3 text-sm text-[var(--brand-text-muted)]">
                {integerFormatter.format(group.members)} members · {group.action}
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Approval and recovery queue
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              Work new communities, feature opportunities, and groups that need help without
              leaving the dashboard.
            </p>
          </div>
          <div className="space-y-3">
            {activeQueue.map((group) => (
              <div
                key={group.key}
                className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{group.name}</div>
                  <ToneBadge tone={group.status.toLowerCase().includes("feature") ? "sage" : "coral"}>
                    {group.status}
                  </ToneBadge>
                </div>
                <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  Organizer: {group.organizer}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {group.note}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton
                    label="Approve"
                    tone="sage"
                    icon={CheckCheck}
                    onClick={() =>
                      updateQueue(group.key, "Approved", `${group.name} approved for the live group layer.`)
                    }
                  />
                  <ActionButton
                    label="Feature"
                    tone="indigo"
                    icon={Sparkles}
                    onClick={() =>
                      updateQueue(group.key, "Feature candidate", `${group.name} moved into the feature review lane.`)
                    }
                  />
                  <ActionButton
                    label="Health flag"
                    tone="coral"
                    icon={ShieldAlert}
                    onClick={() =>
                      updateQueue(group.key, "Health flag", `${group.name} marked for cadence recovery.`)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminEventOperationsDesk({
  events,
}: {
  events: AdminEventRow[];
}) {
  const [inventory, setInventory] = useState(events);
  const [selectedKeys, setSelectedKeys] = useState(events.slice(0, 2).map((event) => event.key));
  const [selectedKey, setSelectedKey] = useState(events[0]?.key ?? "");
  const [message, setMessage] = useState(
    `${Math.min(events.length, 2)} events staged for admin event operations.`,
  );

  const selectedEvent =
    inventory.find((event) => event.key === selectedKey) ??
    inventory.find((event) => selectedKeys.includes(event.key)) ??
    inventory[0];

  function toggleKey(key: string) {
    startTransition(() => {
      setSelectedKeys((current) =>
        current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
      );
      setSelectedKey(key);
    });
  }

  function mutateSelected(next: Partial<AdminEventRow>, nextMessage: string) {
    if (!selectedKeys.length) {
      setMessage("Select at least one event before using batch controls.");
      return;
    }

    startTransition(() => {
      setInventory((current) =>
        current.map((event) => (selectedKeys.includes(event.key) ? { ...event, ...next } : event)),
      );
      setMessage(nextMessage);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Event control desk
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              Admin can approve, feature, pause, or hold monetized events in batches while keeping
              venue, date, and category context attached.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn(pillBase, "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
              {selectedKeys.length} selected
            </span>
            <span className={cn(pillBase, "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]")}>
              {inventory.filter((event) => event.status.toLowerCase().includes("paid")).length} paid
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton
            label="Feature selected"
            tone="sage"
            icon={Sparkles}
            onClick={() =>
              mutateSelected(
                { action: "Homepage feature", status: "Featured" },
                `${selectedKeys.length} events pushed into the feature lane.`,
              )
            }
          />
          <ActionButton
            label="Approve selected"
            tone="indigo"
            icon={CheckCheck}
            onClick={() =>
              mutateSelected(
                { status: "Approved", action: "Monitor waitlist" },
                `${selectedKeys.length} events approved for the live public stack.`,
              )
            }
          />
          <ActionButton
            label="Hold for review"
            tone="basalt"
            icon={ShieldAlert}
            onClick={() =>
              mutateSelected(
                { status: "Review hold", action: "Manual review" },
                `${selectedKeys.length} events moved into the review-hold lane.`,
              )
            }
          />
          <ActionButton
            label="Pause monetization"
            tone="coral"
            icon={Ban}
            onClick={() =>
              mutateSelected(
                { status: "Approval mode", action: "Check payout" },
                `${selectedKeys.length} events moved back to tighter admin control.`,
              )
            }
          />
        </div>
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
        >
          {message}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {inventory.map((event) => (
            <article
              key={event.key}
              onClick={() => setSelectedKey(event.key)}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                  keyboardEvent.preventDefault();
                  setSelectedKey(event.key);
                }
              }}
              role="button"
              tabIndex={0}
              className={cn(
                "cursor-pointer rounded-[1.2rem] border p-4 transition",
                event.key === selectedEvent?.key
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-white/82",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{event.title}</div>
                <button
                  type="button"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    toggleKey(event.key);
                  }}
                  className={cn(
                    pillBase,
                    selectedKeys.includes(event.key)
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {selectedKeys.includes(event.key) ? "Selected" : "Select"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToneBadge tone={event.status.toLowerCase().includes("paid") ? "coral" : "indigo"}>
                  {event.status}
                </ToneBadge>
                <ToneBadge tone="sand">{event.category}</ToneBadge>
              </div>
              <div className="mt-3 text-sm text-[var(--brand-text-muted)]">
                {event.venue} · {event.date}
              </div>
              <div className="mt-2 text-xs text-[var(--brand-text-light)]">{event.action}</div>
            </article>
          ))}
        </div>

        {selectedEvent ? (
          <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {selectedEvent.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  Category, venue, and admin action posture stay attached while moderation moves.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToneBadge tone={selectedEvent.status.toLowerCase().includes("paid") ? "coral" : "indigo"}>
                  {selectedEvent.status}
                </ToneBadge>
                <ToneBadge tone="sand">{selectedEvent.category}</ToneBadge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Venue", value: selectedEvent.venue },
                { label: "Date", value: selectedEvent.date },
                { label: "Action", value: selectedEvent.action },
                { label: "State", value: selectedEvent.status },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--brand-text)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminRevenueControlDesk({
  plans,
  policies,
}: {
  plans: AdminRevenuePlan[];
  policies: RevenuePolicy[];
}) {
  const [planInventory, setPlanInventory] = useState(plans);
  const [policyInventory, setPolicyInventory] = useState(policies);
  const [selectedPlanName, setSelectedPlanName] = useState(plans[0]?.name ?? "");
  const [message, setMessage] = useState("Revenue controls are live and ready for admin tuning.");

  const selectedPlan =
    planInventory.find((plan) => plan.name === selectedPlanName) ?? planInventory[0];

  function updatePlan(name: string, next: Partial<AdminRevenuePlan>, nextMessage: string) {
    startTransition(() => {
      setPlanInventory((current) =>
        current.map((plan) => (plan.name === name ? { ...plan, ...next } : plan)),
      );
      setMessage(nextMessage);
    });
  }

  function updatePolicy(label: string, value: string) {
    startTransition(() => {
      setPolicyInventory((current) =>
        current.map((policy) => (policy.label === label ? { ...policy, value } : policy)),
      );
      setMessage(`${label} updated inside the admin revenue control desk.`);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Plan controls
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Change pricing posture, rewrite positioning, and keep the commercial stack coherent.
          </p>
        </div>

        <div className="space-y-3">
          {planInventory.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setSelectedPlanName(plan.name)}
              className={cn(
                "block w-full rounded-[1.2rem] border p-4 text-left transition",
                plan.name === selectedPlan?.name
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-white/82",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{plan.name}</div>
                <ToneBadge tone="sand">{plan.price}</ToneBadge>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {plan.description}
              </p>
            </button>
          ))}
        </div>

        {selectedPlan ? (
          <div className="rounded-[1.2rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4">
            <div className="font-semibold text-[var(--brand-text)]">{selectedPlan.name}</div>
            <label className="mt-4 block text-sm font-semibold text-[var(--brand-text)]">
              Price
              <input
                value={selectedPlan.price}
                onChange={(event) =>
                  updatePlan(
                    selectedPlan.name,
                    { price: event.target.value },
                    `${selectedPlan.name} pricing updated to ${event.target.value}.`,
                  )
                }
                className="mt-2 w-full rounded-[1rem] border border-[var(--brand-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold text-[var(--brand-text)]">
              Positioning
              <textarea
                value={selectedPlan.description}
                onChange={(event) =>
                  updatePlan(
                    selectedPlan.name,
                    { description: event.target.value },
                    `${selectedPlan.name} positioning updated inside the revenue desk.`,
                  )
                }
                rows={4}
                className="mt-2 w-full rounded-[1.2rem] border border-[var(--brand-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Policy guardrail editor
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Keep minimum ticket price, commission, and platform rules editable in the dashboard.
          </p>
        </div>

        <div className="space-y-3">
          {policyInventory.map((policy) => (
            <label
              key={policy.label}
              className="block rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4"
            >
              <div className="text-sm font-semibold text-[var(--brand-text)]">{policy.label}</div>
              <input
                value={policy.value}
                onChange={(event) => updatePolicy(policy.label, event.target.value)}
                className="mt-3 w-full rounded-[1rem] border border-[var(--brand-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
          ))}
        </div>

        <div
          role="status"
          aria-live="polite"
          className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
        >
          {message}
        </div>
      </div>
    </div>
  );
}

export function AdminRevenueOperationsDesk({
  transactions,
  sources,
}: {
  transactions: RevenueTransaction[];
  sources: RevenueSource[];
}) {
  const [ledger, setLedger] = useState(transactions);
  const [selectedKey, setSelectedKey] = useState(transactions[0]?.key ?? "");
  const [message, setMessage] = useState(
    "Revenue operations are live. Use this desk to hold payouts, clear fees, and keep the money layer explainable.",
  );
  const [actionLog, setActionLog] = useState([
    {
      key: "rev-log-1",
      action: "Held one fee payout for manual review",
      meta: "Today 08:42",
    },
    {
      key: "rev-log-2",
      action: "Confirmed organizer subscription capture batch",
      meta: "Today 07:55",
    },
  ]);

  const selected =
    ledger.find((entry) => entry.key === selectedKey) ?? ledger[0];
  const capturedCount = ledger.filter((entry) => entry.status.toLowerCase().includes("captured")).length;
  const payoutWatchCount = ledger.filter((entry) => entry.status.toLowerCase().includes("payout")).length;

  function updateTransaction(key: string, status: string, nextMessage: string) {
    startTransition(() => {
      setLedger((current) =>
        current.map((entry) => (entry.key === key ? { ...entry, status } : entry)),
      );
      setMessage(nextMessage);
      setActionLog((current) => [
        { key: `rev-log-${current.length + 1}`, action: nextMessage, meta: "Just now" },
        ...current,
      ]);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Money movement desk
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Review live captures, payout holds, and fee anomalies without leaving admin revenue.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
              Captured
            </div>
            <div className="font-editorial tabular-data mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              {capturedCount}
            </div>
          </div>
          <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
              Payout watch
            </div>
            <div className="font-editorial tabular-data mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              {payoutWatchCount}
            </div>
          </div>
          <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
              Top source
            </div>
            <div className="font-editorial tabular-data mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              {sources[0]?.value ?? 0}%
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {ledger.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setSelectedKey(entry.key)}
              className={cn(
                "block w-full rounded-[1.1rem] border p-4 text-left transition",
                entry.key === selected?.key
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.72)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{entry.source}</div>
                <ToneBadge tone={entry.status.toLowerCase().includes("captured") ? "sage" : "coral"}>
                  {entry.status}
                </ToneBadge>
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                {entry.amount} · {entry.when}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {selected ? (
          <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {selected.source}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  Work the selected money event directly from the dashboard.
                </p>
              </div>
              <ToneBadge tone="sand">{selected.amount}</ToneBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                label="Mark captured"
                tone="sage"
                icon={CheckCheck}
                onClick={() =>
                  updateTransaction(selected.key, "Captured", `${selected.source} marked captured and cleared.`)
                }
              />
              <ActionButton
                label="Hold payout"
                tone="coral"
                icon={Ban}
                onClick={() =>
                  updateTransaction(selected.key, "Pending payout", `${selected.source} moved into payout watch.`)
                }
              />
              <ActionButton
                label="Flag anomaly"
                tone="indigo"
                icon={Flag}
                onClick={() =>
                  updateTransaction(selected.key, "Anomaly review", `${selected.source} flagged for finance anomaly review.`)
                }
              />
            </div>
          </article>
        ) : null}

        <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            Finance action journal
          </div>
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
          >
            {message}
          </div>
          <div className="mt-4 space-y-3">
            {actionLog.map((entry) => (
              <div
                key={entry.key}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[var(--brand-text)]">{entry.action}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    {entry.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export function AdminAnalyticsOperationsDesk({
  charts,
  heatRows,
  geography,
}: {
  charts: AnalyticsCard[];
  heatRows: HeatGridRow[];
  geography: GeographySlice[];
}) {
  const [watchList, setWatchList] = useState(charts.slice(0, 4));
  const [message, setMessage] = useState(
    "Analytics watch desk is live. Use it to escalate weak signals before they become product or revenue problems.",
  );

  const hottestSlot = heatRows
    .flatMap((row) => row.values.map((value, index) => ({ slot: `${row.label} ${index + 1}`, value })))
    .sort((a, b) => b.value - a.value)[0];
  const strongestGeo = geography[0];

  function moveWatch(key: string, status: string) {
    startTransition(() => {
      setWatchList((current) =>
        current.map((chart) =>
          chart.key === key ? { ...chart, title: `${chart.title} · ${status}` } : chart,
        ),
      );
      setMessage(`${key} moved into ${status.toLowerCase()} inside analytics watch.`);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Signal watch list
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Promote important charts into a watch lane when marketplace shape, supply quality, or conversion needs hands-on attention.
          </p>
        </div>
        <div className="space-y-3">
          {watchList.map((chart) => (
            <div
              key={chart.key}
              className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{chart.title}</div>
                <ToneBadge tone={chart.tone === "coral" ? "coral" : chart.tone === "sage" ? "sage" : "indigo"}>
                  watch
                </ToneBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton
                  label="Escalate"
                  tone="coral"
                  icon={ShieldAlert}
                  onClick={() => moveWatch(chart.key, "Escalated")}
                />
                <ActionButton
                  label="Needs content"
                  tone="indigo"
                  icon={LayoutTemplate}
                  onClick={() => moveWatch(chart.key, "Content follow-up")}
                />
                <ActionButton
                  label="Revenue check"
                  tone="sage"
                  icon={CreditCard}
                  onClick={() => moveWatch(chart.key, "Revenue follow-up")}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            Marketplace pressure summary
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                Hottest slot
              </div>
              <div className="font-editorial tabular-data mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                {hottestSlot?.value ?? 0}
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">{hottestSlot?.slot ?? "n/a"}</div>
            </div>
            <div className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                Strongest geography
              </div>
              <div className="font-editorial tabular-data mt-2 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                {strongestGeo?.value ?? "n/a"}
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">{strongestGeo?.label ?? "n/a"}</div>
            </div>
          </div>
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
          >
            {message}
          </div>
        </article>

        <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            Operator prompts
          </div>
          <div className="mt-4 space-y-3">
            {[
              "If late-week evening density rises again, push venue quality and moderation capacity up before adding more paid supply.",
              "If ticket funnel weakness persists, review public event copy and pricing posture before pushing more spend into comms.",
              "If remote demand keeps growing, surface more hybrid and online-friendly supply in category and homepage rails.",
            ].map((prompt) => (
              <div
                key={prompt}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4 text-sm leading-7 text-[var(--brand-text-muted)]"
              >
                {prompt}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export function AdminOpsInboxDesk({
  items,
  handoffs,
}: {
  items: OpsInboxItem[];
  handoffs: HandoffEntry[];
}) {
  const [inbox, setInbox] = useState(items);
  const [selectedKey, setSelectedKey] = useState(items[0]?.key ?? "");
  const [message, setMessage] = useState(
    "Ops inbox is live. Use it to keep revenue, supply, trust, and editorial work moving through one admin command queue.",
  );

  const selected = inbox.find((item) => item.key === selectedKey) ?? inbox[0];

  function updateItem(key: string, status: string, nextMessage: string) {
    startTransition(() => {
      setInbox((current) =>
        current.map((item) => (item.key === key ? { ...item, status } : item)),
      );
      setMessage(nextMessage);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Ops inbox
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            One queue for the work that cannot be dropped: money, trust, supply, and editorial execution.
          </p>
        </div>
        <div className="space-y-3">
          {inbox.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              className={cn(
                "block w-full rounded-[1.1rem] border p-4 text-left transition",
                item.key === selected?.key
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.72)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                <ToneBadge tone={item.status.toLowerCase().includes("escalated") ? "coral" : item.status.toLowerCase().includes("progress") ? "indigo" : "sand"}>
                  {item.status}
                </ToneBadge>
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                {item.lane} · {item.owner} · {item.due}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {selected ? (
          <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {selected.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">{selected.note}</p>
              </div>
              <ToneBadge tone="indigo">{selected.lane}</ToneBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                label="Start work"
                tone="indigo"
                icon={Sparkles}
                onClick={() => updateItem(selected.key, "In progress", `${selected.title} moved into active work.`)}
              />
              <ActionButton
                label="Escalate"
                tone="coral"
                icon={ShieldAlert}
                onClick={() => updateItem(selected.key, "Escalated", `${selected.title} escalated for senior admin review.`)}
              />
              <ActionButton
                label="Resolve"
                tone="sage"
                icon={CheckCheck}
                onClick={() => updateItem(selected.key, "Resolved", `${selected.title} resolved from the ops inbox.`)}
              />
            </div>
          </article>
        ) : null}

        <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            Handoff log
          </div>
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
          >
            {message}
          </div>
          <div className="mt-4 space-y-3">
            {handoffs.map((entry) => (
              <div
                key={entry.key}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{entry.actor}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                    {entry.when}
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                  {entry.lane}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export function AdminIncidentCommandDesk({
  incidents,
  ownership,
}: {
  incidents: IncidentItem[];
  ownership: OwnershipLane[];
}) {
  const [queue, setQueue] = useState(incidents);
  const [owners, setOwners] = useState(ownership);
  const [message, setMessage] = useState(
    "Incident command is live. Use it to push issues into the right lane and keep ownership visible during active work.",
  );
  const [selectedKey, setSelectedKey] = useState(incidents[0]?.key ?? "");

  const selected = queue.find((item) => item.key === selectedKey) ?? queue[0];

  function updateIncident(key: string, status: string, nextMessage: string) {
    startTransition(() => {
      setQueue((current) =>
        current.map((item) => (item.key === key ? { ...item, status } : item)),
      );
      setMessage(nextMessage);
    });
  }

  function updateOwner(key: string, load: string) {
    startTransition(() => {
      setOwners((current) =>
        current.map((item) => (item.key === key ? { ...item, load } : item)),
      );
      setMessage(`Ownership load updated for ${key.replace("owner-", "lane ")}.`);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Incident command
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Keep reliability, trust, and supply incidents inside one visible admin command queue.
          </p>
        </div>
        <div className="space-y-3">
          {queue.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              className={cn(
                "block w-full rounded-[1.1rem] border p-4 text-left transition",
                item.key === selected?.key
                  ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                  : "border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.72)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
                <ToneBadge tone={item.severity.toLowerCase().includes("high") ? "coral" : item.severity.toLowerCase().includes("medium") ? "indigo" : "sand"}>
                  {item.severity}
                </ToneBadge>
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                {item.owner} · {item.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {selected ? (
          <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                  {selected.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">{selected.note}</p>
              </div>
              <ToneBadge tone="indigo">{selected.owner}</ToneBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                label="Investigate"
                tone="indigo"
                icon={Eye}
                onClick={() => updateIncident(selected.key, "Investigating", `${selected.title} moved into active investigation.`)}
              />
              <ActionButton
                label="Escalate"
                tone="coral"
                icon={ShieldAlert}
                onClick={() => updateIncident(selected.key, "Escalated", `${selected.title} escalated for immediate admin attention.`)}
              />
              <ActionButton
                label="Stabilized"
                tone="sage"
                icon={CheckCheck}
                onClick={() => updateIncident(selected.key, "Stabilized", `${selected.title} marked stabilized and ready for follow-up.`)}
              />
            </div>
          </article>
        ) : null}

        <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            Ownership board
          </div>
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
          >
            {message}
          </div>
          <div className="mt-4 space-y-3">
            {owners.map((entry) => (
              <div
                key={entry.key}
                className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--brand-text)]">{entry.lane}</div>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((load) => (
                      <button
                        key={load}
                        type="button"
                        onClick={() => updateOwner(entry.key, load)}
                        className={cn(
                          pillBase,
                          entry.load === load
                            ? load === "High"
                              ? "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]"
                              : load === "Medium"
                                ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                                : "border-[rgba(124,154,130,0.22)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]"
                            : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                        )}
                      >
                        {load}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                  {entry.lead} · {entry.coverage}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

export function AdminVenueOperationsDesk({
  applications,
  active,
}: {
  applications: VenueApplication[];
  active: ActiveVenue[];
}) {
  const [queue, setQueue] = useState(applications);
  const [partners, setPartners] = useState(active);
  const [selectedKeys, setSelectedKeys] = useState(
    applications.slice(0, 2).map((application) => application.key),
  );
  const [message, setMessage] = useState(
    `${Math.min(applications.length, 2)} venue applications staged for admin handling.`,
  );

  function toggleKey(key: string) {
    startTransition(() => {
      setSelectedKeys((current) =>
        current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
      );
    });
  }

  function updateMany(status: string, nextMessage: string) {
    if (!selectedKeys.length) {
      setMessage("Select at least one venue application before using batch controls.");
      return;
    }

    startTransition(() => {
      setQueue((current) =>
        current.map((application) =>
          selectedKeys.includes(application.key) ? { ...application, status } : application,
        ),
      );
      setMessage(nextMessage);
    });
  }

  function updatePartner(key: string, note: string) {
    startTransition(() => {
      setPartners((current) =>
        current.map((partner) => (partner.key === key ? { ...partner, note } : partner)),
      );
      setMessage("Venue supply guidance updated for the selected live partner.");
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Venue supply desk
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Batch-handle venue applications, push them into the right lane, and keep supply
            quality visible from one dashboard surface.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            label="Approve selected"
            tone="sage"
            icon={CheckCheck}
            onClick={() =>
              updateMany(
                "Approved",
                `${selectedKeys.length} venue applications approved for onboarding.`,
              )
            }
          />
          <ActionButton
            label="Waitlist selected"
            tone="indigo"
            icon={ShieldAlert}
            onClick={() =>
              updateMany(
                "Waitlisted",
                `${selectedKeys.length} venue applications moved into the waitlist lane.`,
              )
            }
          />
          <ActionButton
            label="Request info"
            tone="coral"
            icon={MailPlus}
            onClick={() =>
              updateMany(
                "Request info",
                `${selectedKeys.length} venue applications marked for follow-up.`,
              )
            }
          />
        </div>
        <div className="space-y-3">
          {queue.map((application) => (
            <article
              key={application.key}
              className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{application.name}</div>
                <button
                  type="button"
                  onClick={() => toggleKey(application.key)}
                  className={cn(
                    pillBase,
                    selectedKeys.includes(application.key)
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {selectedKeys.includes(application.key) ? "Selected" : "Select"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToneBadge tone="sand">{application.type}</ToneBadge>
                <ToneBadge tone={application.status.toLowerCase().includes("approve") ? "sage" : "coral"}>
                  {application.status}
                </ToneBadge>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {application.note}
              </p>
            </article>
          ))}
        </div>
        <div
          role="status"
          aria-live="polite"
          className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
        >
          {message}
        </div>
      </div>

      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div>
          <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            Live partner steering
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
            Keep active partner notes current so event matching stays deliberate.
          </p>
        </div>
        <div className="space-y-3">
          {partners.slice(0, 4).map((partner) => (
            <label
              key={partner.key}
              className="block rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{partner.name}</div>
                <ToneBadge tone="sage">{partner.rating}</ToneBadge>
              </div>
              <div className="mt-2 text-sm text-[var(--brand-text-muted)]">
                {partner.type} · {partner.area}
              </div>
              <input
                value={partner.note}
                onChange={(event) => updatePartner(partner.key, event.target.value)}
                className="mt-3 w-full rounded-[1rem] border border-[var(--brand-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand-coral)]"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminModerationOperationsDesk({
  reports,
}: {
  reports: ModerationReport[];
}) {
  const [queue, setQueue] = useState(reports);
  const [selectedKeys, setSelectedKeys] = useState(reports.slice(0, 2).map((report) => report.key));
  const [message, setMessage] = useState(
    `${Math.min(reports.length, 2)} moderation reports staged for batch action.`,
  );

  function toggleKey(key: string) {
    startTransition(() => {
      setSelectedKeys((current) =>
        current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key],
      );
    });
  }

  function updateMany(status: string, nextMessage: string) {
    if (!selectedKeys.length) {
      setMessage("Select at least one moderation report before using batch actions.");
      return;
    }

    startTransition(() => {
      setQueue((current) =>
        current.map((report) =>
          selectedKeys.includes(report.key) ? { ...report, status } : report,
        ),
      );
      setMessage(nextMessage);
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              Moderation batch desk
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              Work multiple reports in one flow when the platform is under pressure instead of
              handling every incident separately.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Resolve selected"
              tone="sage"
              icon={CheckCheck}
              onClick={() =>
                updateMany(
                  "Resolved",
                  `${selectedKeys.length} reports resolved from the batch moderation desk.`,
                )
              }
            />
            <ActionButton
              label="Escalate selected"
              tone="indigo"
              icon={ShieldAlert}
              onClick={() =>
                updateMany(
                  "Escalated",
                  `${selectedKeys.length} reports moved into the escalation lane.`,
                )
              }
            />
            <ActionButton
              label="Ban source"
              tone="coral"
              icon={Ban}
              onClick={() =>
                updateMany(
                  "Banned source",
                  `${selectedKeys.length} reports converted into source-ban actions.`,
                )
              }
            />
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {queue.map((report) => (
            <article
              key={report.key}
              className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.84)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[var(--brand-text)]">{report.subject}</div>
                <button
                  type="button"
                  onClick={() => toggleKey(report.key)}
                  className={cn(
                    pillBase,
                    selectedKeys.includes(report.key)
                      ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                      : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                  )}
                >
                  {selectedKeys.includes(report.key) ? "Selected" : "Select"}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <ToneBadge tone="coral">{report.priority}</ToneBadge>
                <ToneBadge tone={report.status.toLowerCase().includes("resolve") ? "sage" : "sand"}>
                  {report.status}
                </ToneBadge>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {report.note}
              </p>
            </article>
          ))}
        </div>
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
        >
          {message}
        </div>
      </div>
    </div>
  );
}

export function AdminVenueApprovalConsole({
  applications,
}: {
  applications: VenueApplication[];
}) {
  const [queue, setQueue] = useState(applications);

  function updateStatus(key: string, status: string) {
    startTransition(() => {
      setQueue((current) =>
        current.map((application) =>
          application.key === key ? { ...application, status } : application,
        ),
      );
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {queue.map((venue) => (
        <article
          key={venue.key}
          className="rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-[var(--brand-text)]">{venue.name}</div>
            <span className={cn(pillBase, "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]")}>
              {venue.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--brand-text-muted)]">{venue.type}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
            {venue.note}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton label="Approve" onClick={() => updateStatus(venue.key, "Approved")} tone="sage" icon={CheckCheck} />
            <ActionButton label="Waitlist" onClick={() => updateStatus(venue.key, "Waitlisted")} icon={ShieldAlert} />
            <ActionButton label="Request info" onClick={() => updateStatus(venue.key, "Request info")} tone="indigo" icon={UserRoundCog} />
            <ActionButton label="Reject" onClick={() => updateStatus(venue.key, "Rejected")} tone="coral" icon={Ban} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function AdminModerationConsole({
  reports,
  banned,
}: {
  reports: ModerationReport[];
  banned: BannedUser[];
}) {
  const [reportQueue, setReportQueue] = useState(reports);
  const [banList, setBanList] = useState(banned);

  function resolveReport(key: string, status: string) {
    startTransition(() => {
      setReportQueue((current) =>
        current.map((report) => (report.key === key ? { ...report, status } : report)),
      );
    });
  }

  function restoreUser(key: string) {
    startTransition(() => {
      setBanList((current) =>
        current.map((entry) =>
          entry.key === key ? { ...entry, appeal: "Accepted", reason: "Restored" } : entry,
        ),
      );
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        {reportQueue.map((report) => (
          <article
            key={report.key}
            className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/82 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{report.subject}</div>
              <span className={cn(pillBase, "border-[rgba(232,97,77,0.18)] bg-[rgba(232,97,77,0.08)] text-[var(--brand-coral)]")}>
                {report.priority}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
              {report.note}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton label="Resolve" onClick={() => resolveReport(report.key, "Resolved")} tone="sage" icon={CheckCheck} />
              <ActionButton label="Escalate" onClick={() => resolveReport(report.key, "Escalated")} icon={ShieldAlert} />
              <ActionButton label="Ban source" onClick={() => resolveReport(report.key, "Banned source")} tone="coral" icon={Ban} />
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-4 rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
        <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
          Banned and appeals
        </div>
        {banList.map((entry) => (
          <div
            key={entry.key}
            className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--brand-text)]">{entry.name}</div>
              <span className={cn(pillBase, "border-[rgba(30,27,46,0.16)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]")}>
                {entry.appeal}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--brand-text-muted)]">{entry.reason}</p>
            <div className="mt-4 flex gap-2">
              <ActionButton label="Restore" onClick={() => restoreUser(entry.key)} tone="sage" icon={RotateCcw} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsControlCenter({
  sections,
}: {
  sections: SettingsSection[];
}) {
  const [config, setConfig] = useState(() =>
    sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        enabled:
          item.value.toLowerCase().includes("enabled") ||
          item.value.toLowerCase().includes("on") ||
          item.value.toLowerCase().includes("healthy"),
      })),
    })),
  );
  const [selectedSectionKey, setSelectedSectionKey] = useState(sections[0]?.key ?? "");
  const [message, setMessage] = useState(
    "Settings control center is live. Changes stay local in this dashboard until the real backend is connected.",
  );
  const [changeLog, setChangeLog] = useState([
    {
      key: "settings-log-1",
      actor: "Super admin",
      action: "Raised payout review threshold to 50,000 ISK",
      when: "Today 08:42",
    },
    {
      key: "settings-log-2",
      actor: "Super admin",
      action: "Kept venue application gate enabled after supply review",
      when: "Today 07:15",
    },
    {
      key: "settings-log-3",
      actor: "Platform ops",
      action: "Left incident banner off after overnight checks cleared",
      when: "Yesterday 22:04",
    },
  ]);
  const [accessMatrix, setAccessMatrix] = useState([
    { capability: "Override event approvals", admin: true, organizer: false, venue: false, member: false },
    { capability: "Freeze payouts", admin: true, organizer: false, venue: false, member: false },
    { capability: "View client dossiers", admin: true, organizer: true, venue: true, member: false },
    { capability: "Send platform-wide announcements", admin: true, organizer: false, venue: false, member: false },
    { capability: "Edit venue availability", admin: true, organizer: false, venue: true, member: false },
  ]);

  const selectedSection =
    config.find((section) => section.key === selectedSectionKey) ?? config[0];
  const enabledCount = config.flatMap((section) => section.items).filter((item) => item.enabled).length;
  const flaggedCount = config.flatMap((section) => section.items).filter((item) =>
    item.label.toLowerCase().includes("maintenance") ||
    item.label.toLowerCase().includes("incident") ||
    item.label.toLowerCase().includes("payout"),
  ).length;

  function appendLog(action: string) {
    setChangeLog((current) => [
      {
        key: `settings-log-${current.length + 1}`,
        actor: "Super admin",
        action,
        when: "Just now",
      },
      ...current,
    ]);
  }

  function toggleItem(sectionKey: string, label: string) {
    startTransition(() => {
      setConfig((current) =>
        current.map((section) =>
          section.key === sectionKey
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.label === label
                    ? {
                        ...item,
                        enabled: !item.enabled,
                        value: !item.enabled ? "Enabled" : "Disabled",
                      }
                    : item,
                ),
              }
            : section,
        ),
      );
      setMessage(`${label} toggled inside ${sectionKey.replaceAll("-", " ")} settings.`);
      appendLog(`${label} toggled in ${sectionKey.replaceAll("-", " ")} settings`);
    });
  }

  function updateItemValue(sectionKey: string, label: string, value: string) {
    startTransition(() => {
      setConfig((current) =>
        current.map((section) =>
          section.key === sectionKey
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.label === label
                    ? {
                        ...item,
                        value,
                        enabled:
                          value.toLowerCase().includes("enabled") ||
                          value.toLowerCase().includes("on") ||
                          value.toLowerCase().includes("healthy"),
                      }
                    : item,
                ),
              }
            : section,
        ),
      );
      setMessage(`${label} updated to "${value}" in ${sectionKey.replaceAll("-", " ")}.`);
    });
  }

  function triggerEmergencyAction(label: string, sectionKey: string, itemLabel: string, value: string) {
    updateItemValue(sectionKey, itemLabel, value);
    appendLog(label);
  }

  function toggleCapability(capability: string, role: "admin" | "organizer" | "venue" | "member") {
    startTransition(() => {
      setAccessMatrix((current) =>
        current.map((entry) =>
          entry.capability === capability ? { ...entry, [role]: !entry[role] } : entry,
        ),
      );
      setMessage(`${role} access updated for ${capability.toLowerCase()}.`);
      appendLog(`${role} access updated for ${capability.toLowerCase()}`);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {[
          { label: "Config domains", value: String(config.length), detail: "Every major platform lane is editable from here." },
          { label: "Enabled controls", value: String(enabledCount), detail: "Live toggles currently left on across the platform." },
          { label: "Risk-critical items", value: String(flaggedCount), detail: "Maintenance, incident, and payout rules need fast reach." },
          { label: "Recent actions", value: String(changeLog.length), detail: "Admin changes remain visible for handoff and audit." },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.3rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
              {item.label}
            </div>
            <div className="font-editorial tabular-data mt-2 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
              {item.value}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">{item.detail}</p>
          </article>
        ))}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] px-4 py-3 text-sm leading-7 text-[var(--brand-text-muted)]"
      >
        {message}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              Settings domains
            </div>
            <div className="mt-4 space-y-3">
              {config.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setSelectedSectionKey(section.key)}
                  className={cn(
                    "block w-full rounded-[1.1rem] border px-4 py-4 text-left transition",
                    section.key === selectedSection?.key
                      ? "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)]"
                      : "border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.72)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[var(--brand-text)]">{section.title}</div>
                    <ToneBadge tone={section.key === selectedSection?.key ? "indigo" : "sand"}>
                      {section.items.length} rules
                    </ToneBadge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    {section.items.map((item) => item.label).slice(0, 2).join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
            <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
              Emergency controls
            </div>
            <div className="mt-4 grid gap-3">
              <ActionButton
                label="Freeze payouts"
                tone="coral"
                icon={Ban}
                onClick={() =>
                  triggerEmergencyAction(
                    "Payouts frozen for manual finance review",
                    "payments",
                    "Payout review threshold",
                    "Manual freeze active",
                  )
                }
              />
              <ActionButton
                label="Pause signups"
                tone="basalt"
                icon={ShieldAlert}
                onClick={() =>
                  triggerEmergencyAction(
                    "Open signup disabled for controlled intake",
                    "registration",
                    "Open signup",
                    "Disabled",
                  )
                }
              />
              <ActionButton
                label="Enable read-only mode"
                tone="indigo"
                icon={Eye}
                onClick={() =>
                  triggerEmergencyAction(
                    "Read-only mode enabled across the platform",
                    "maintenance",
                    "Read-only mode",
                    "Enabled",
                  )
                }
              />
              <ActionButton
                label="Show incident banner"
                tone="sage"
                icon={Sparkles}
                onClick={() =>
                  triggerEmergencyAction(
                    "Incident banner enabled for all signed-in users",
                    "maintenance",
                    "Incident banner",
                    "Enabled",
                  )
                }
              />
            </div>
          </article>
        </div>

        <div className="space-y-6">
          {selectedSection ? (
            <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-editorial text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                    {selectedSection.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                    Edit values directly, then use the toggle when the rule should be fully on or off.
                  </p>
                </div>
                <ToneBadge tone="indigo">{selectedSection.items.length} controls</ToneBadge>
              </div>
              <div className="mt-5 space-y-4">
                {selectedSection.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[var(--brand-text)]">{item.label}</div>
                      <button
                        type="button"
                        onClick={() => toggleItem(selectedSection.key, item.label)}
                        className={cn(
                          "inline-flex h-7 w-12 rounded-full border p-1 transition",
                          item.enabled
                            ? "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.16)]"
                            : "border-[rgba(153,148,168,0.18)] bg-white/72",
                        )}
                        aria-label={`${item.enabled ? "Disable" : "Enable"} ${item.label}`}
                      >
                        <span
                          className={cn(
                            "h-5 w-5 rounded-full transition",
                            item.enabled
                              ? "translate-x-5 bg-[var(--brand-sage)]"
                              : "translate-x-0 bg-[var(--brand-text-light)]",
                          )}
                        />
                      </button>
                    </div>
                    <input
                      value={item.value}
                      onChange={(event) =>
                        updateItemValue(selectedSection.key, item.label, event.target.value)
                      }
                      className="mt-3 w-full rounded-[1rem] border border-[var(--brand-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-coral)]"
                    />
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
            <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
              <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                Access matrix
              </div>
              <div className="mt-4 space-y-3">
                {accessMatrix.map((entry) => (
                  <div
                    key={entry.capability}
                    className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4"
                  >
                    <div className="text-sm font-semibold text-[var(--brand-text)]">
                      {entry.capability}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["admin", "organizer", "venue", "member"] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleCapability(entry.capability, role)}
                          className={cn(
                            pillBase,
                            entry[role]
                              ? "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]"
                              : "border-[rgba(153,148,168,0.14)] bg-white/80 text-[var(--brand-text-muted)]",
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.45rem] border border-[rgba(153,148,168,0.12)] bg-white/84 p-5">
              <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
                Change journal
              </div>
              <div className="mt-4 space-y-3">
                {changeLog.map((entry) => (
                  <div
                    key={entry.key}
                    className="rounded-[1rem] border border-[rgba(153,148,168,0.12)] bg-[rgba(245,240,232,0.82)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[var(--brand-text)]">{entry.actor}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                        {entry.when}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
                      {entry.action}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

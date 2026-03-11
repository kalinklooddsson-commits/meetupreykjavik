import Link from "next/link";
import type { ReactNode } from "react";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAvatarDataUrl, initialsForName } from "@/lib/visuals";

export type DashboardTone =
  | "indigo"
  | "coral"
  | "sage"
  | "sand"
  | "basalt"
  | "neutral";

type SurfaceProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: Route;
  children: ReactNode;
  className?: string;
};

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  delta?: string;
  tone?: DashboardTone;
  icon?: LucideIcon;
};

type QuickActionCardProps = {
  href: Route;
  title: string;
  description: string;
  icon?: LucideIcon;
};

type CommandCenterDeckProps = {
  eyebrow: string;
  title: string;
  description: string;
  prompt: string;
  action: { href: Route; label: string };
  secondaryAction?: { href: Route; label: string };
  suggestions: string[];
  stats: Array<{
    label: string;
    value: string;
    detail: string;
    icon?: LucideIcon;
    tone?: DashboardTone;
  }>;
};

type TableProps = {
  columns: string[];
  rows: Array<{ key: string; cells: ReactNode[] }>;
  dense?: boolean;
  caption?: string;
};

type TrendChartProps = {
  data: Array<{ label: string; value: number }>;
  tone?: DashboardTone;
  formatValue?: (value: number) => string;
  heightClassName?: string;
};

type SignalRailProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    key: string;
    label: string;
    value: string;
    detail: string;
    tone?: DashboardTone;
  }>;
};

type DecisionStripProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    key: string;
    label: string;
    summary: string;
    meta: string;
    tone?: DashboardTone;
  }>;
};

type FeedItem = {
  key: string;
  title: string;
  detail: string;
  meta: string;
  tone?: DashboardTone;
};

type ProgressStep = {
  key: string;
  title: string;
  detail: string;
  status: "done" | "active" | "upcoming";
};

type StreamCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  meta?: ReactNode;
  badge?: ReactNode;
  className?: string;
  avatarName?: string;
  avatarSrc?: string;
  avatarTone?: DashboardTone;
};

type CalendarDay = {
  day: number;
  outside?: boolean;
  emphasis?: boolean;
  items?: string[];
};

type HeatRow = {
  label: string;
  values: number[];
};

const toneClasses: Record<DashboardTone, string> = {
  indigo:
    "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]",
  coral:
    "border-[rgba(232,97,77,0.22)] bg-[rgba(232,97,77,0.09)] text-[var(--brand-coral)]",
  sage:
    "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-[var(--brand-sage)]",
  sand:
    "border-[rgba(245,240,232,0.95)] bg-[rgba(245,240,232,0.96)] text-[var(--brand-text)]",
  basalt:
    "border-[rgba(30,27,46,0.16)] bg-[rgba(30,27,46,0.08)] text-[var(--brand-basalt)]",
  neutral:
    "border-[rgba(153,148,168,0.18)] bg-[rgba(255,255,255,0.74)] text-[var(--brand-text-muted)]",
};

const chartToneClasses: Record<DashboardTone, string> = {
  indigo: "from-[var(--brand-indigo)] to-[var(--brand-indigo-light)]",
  coral: "from-[var(--brand-coral)] to-[#f48b77]",
  sage: "from-[var(--brand-sage)] to-[#a5beaa]",
  sand: "from-[#e8dcca] to-[#f7efe4]",
  basalt: "from-[var(--brand-basalt)] to-[#5f5878]",
  neutral: "from-[#c9c4d4] to-[#e7e3ec]",
};

export function Surface({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: SurfaceProps) {
  return (
    <section
      className={cn(
        "dashboard-surface dashboard-grid-surface paper-panel rounded-[1.75rem] border border-[rgba(255,255,255,0.72)] p-6 sm:p-7",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="font-editorial mt-3 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--brand-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgba(79,70,229,0.12)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-text)] transition hover:border-[rgba(79,70,229,0.2)] hover:text-[var(--brand-indigo)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-coral)]"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CommandCenterDeck({
  eyebrow,
  title,
  description,
  prompt,
  action,
  secondaryAction,
  suggestions,
  stats,
}: CommandCenterDeckProps) {
  return (
    <Surface
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="overflow-hidden"
    >
      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[1.65rem] bg-[linear-gradient(145deg,rgba(30,27,46,1),rgba(55,48,163,0.94),rgba(232,97,77,0.84))] p-5 text-white sm:p-6">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/54">
            Command center
          </div>
          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="text-base font-semibold tracking-[-0.02em] text-white">{prompt}</div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              This section is built to compress the next decision, the next route, and the most
              important live signals into one scan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <span
                  key={suggestion}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/78"
                >
                  {suggestion}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--brand-text)] transition hover:-translate-y-0.5"
              >
                {action.label}
                <ArrowRight className="h-4 w-4 text-[var(--brand-indigo)]" />
              </Link>
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Workspace posture",
                value: "Data-dense, role-aware",
              },
              {
                label: "Operating goal",
                value: "Less switching, faster decisions",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4"
              >
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/54">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="dashboard-stat-card paper-panel rounded-[1.5rem] border border-[rgba(255,255,255,0.7)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
                  {stat.label}
                </div>
                {stat.icon ? (
                  <span
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
                      toneClasses[stat.tone ?? "indigo"],
                    )}
                  >
                    <stat.icon className="h-5 w-5" />
                  </span>
                ) : null}
              </div>
              <div className="font-editorial tabular-data mt-4 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
                {stat.value}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {stat.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Surface>
  );
}

export function StatCard({
  label,
  value,
  detail,
  delta,
  tone = "indigo",
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="dashboard-stat-card paper-panel rounded-[1.5rem] border border-[rgba(255,255,255,0.7)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
          {label}
        </div>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl border",
              toneClasses[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="font-editorial tabular-data mt-4 text-[2.65rem] leading-none tracking-[-0.07em] text-[var(--brand-text)] sm:text-5xl">
        {value}
      </div>
      {delta ? (
        <div
          className={cn(
            "mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
            toneClasses[tone],
          )}
        >
          {delta}
        </div>
      ) : null}
      {detail ? (
        <p className="mt-4 text-sm leading-7 text-[var(--brand-text-muted)]">{detail}</p>
      ) : null}
    </article>
  );
}

export function SignalRail({ eyebrow, title, description, items }: SignalRailProps) {
  return (
    <section className="dashboard-signal-rail paper-panel overflow-hidden rounded-[1.9rem] border border-[rgba(255,255,255,0.72)] p-6 sm:p-7">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
            {eyebrow}
          </div>
          <h2 className="font-editorial mt-3 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--brand-text-muted)]">
            {description}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.key}
              className="rounded-[1.4rem] border border-[rgba(153,148,168,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,248,244,0.82))] p-4 shadow-[0_18px_34px_rgba(42,38,56,0.06)]"
            >
              <div
                className={cn(
                  "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                  toneClasses[item.tone ?? "indigo"],
                )}
              >
                {item.label}
              </div>
              <div className="font-editorial tabular-data mt-4 text-[2.35rem] leading-none tracking-[-0.07em] text-[var(--brand-text)]">
                {item.value}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DecisionStrip({
  eyebrow,
  title,
  description,
  items,
}: DecisionStripProps) {
  return (
    <section className="dashboard-decision-strip paper-panel overflow-hidden rounded-[1.9rem] border border-[rgba(255,255,255,0.72)] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)]">
            {eyebrow}
          </div>
          <h2 className="font-editorial mt-3 text-3xl tracking-[-0.05em] text-[var(--brand-text)]">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--brand-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.key}
            className="dashboard-decision-card rounded-[1.4rem] border border-[rgba(153,148,168,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,248,244,0.84))] p-5 shadow-[0_18px_34px_rgba(42,38,56,0.06)]"
          >
            <div
              className={cn(
                "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                toneClasses[item.tone ?? "indigo"],
              )}
            >
              {item.label}
            </div>
            <div className="mt-4 text-lg font-bold tracking-[-0.02em] text-[var(--brand-text)]">
              {item.summary}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{item.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function StreamCard({
  eyebrow,
  title,
  description,
  meta,
  badge,
  className,
  avatarName,
  avatarSrc,
  avatarTone = "indigo",
}: StreamCardProps) {
  return (
    <article
      className={cn(
        "dashboard-stream-card rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,248,244,0.82))] p-4 shadow-[0_16px_30px_rgba(42,38,56,0.06)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {avatarName ? (
            <AvatarStamp
              name={avatarName}
              src={avatarSrc}
              tone={avatarTone}
              size="md"
            />
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                {eyebrow}
              </div>
            ) : null}
          </div>
        </div>
        {badge}
      </div>
      <div className="font-editorial mt-4 text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
        {title}
      </div>
      <div className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">{description}</div>
      {meta ? (
        <div className="mt-4 text-sm font-semibold text-[var(--brand-indigo)]">{meta}</div>
      ) : null}
    </article>
  );
}

export function AvatarStamp({
  name,
  src,
  tone = "indigo",
  size = "md",
}: {
  name: string;
  src?: string;
  tone?: DashboardTone;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "sm"
      ? "h-10 w-10 rounded-2xl text-xs"
      : size === "lg"
        ? "h-20 w-20 rounded-[1.8rem] text-2xl"
        : "h-12 w-12 rounded-[1.1rem] text-sm";
  const paletteKey =
    tone === "coral" || tone === "sage" || tone === "sand"
      ? tone
      : "indigo";
  const imageSrc = src || createAvatarDataUrl(name, paletteKey);

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden border border-white/70 bg-cover bg-center shadow-[0_14px_28px_rgba(42,38,56,0.12)]",
        sizeClasses,
      )}
      style={{ backgroundImage: `url("${imageSrc}")` }}
      aria-label={name}
      role="img"
      title={name}
    >
      <span className="sr-only">{initialsForName(name)}</span>
    </div>
  );
}

export function ToneBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: DashboardTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_10px_18px_rgba(42,38,56,0.04)]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

export function FilterChips({
  items,
}: {
  items: Array<{ key: string; label: string; active?: boolean; tone?: DashboardTone }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_10px_22px_rgba(42,38,56,0.04)]",
            item.active
              ? toneClasses[item.tone ?? "indigo"]
              : "border-[rgba(153,148,168,0.16)] bg-white/78 text-[var(--brand-text-muted)]",
          )}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="dashboard-quick-action group paper-panel block rounded-[1.5rem] border border-[rgba(255,255,255,0.72)] p-5 transition hover:-translate-y-1 hover:border-[rgba(79,70,229,0.18)] hover:shadow-[0_24px_48px_rgba(42,38,56,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-coral)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
            {title}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--brand-text-muted)]">
            {description}
          </p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.08)] text-[var(--brand-indigo)]">
          {Icon ? <Icon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </span>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-indigo)]">
        Open
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function DashboardTable({ columns, rows, dense = false, caption }: TableProps) {
  return (
    <div className="dashboard-table-shell overflow-hidden rounded-[1.35rem] border border-[rgba(153,148,168,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,248,244,0.88))] shadow-[0_18px_42px_rgba(42,38,56,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-[linear-gradient(180deg,rgba(245,240,232,0.95),rgba(250,248,244,0.8))]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={cn(
                    "px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-text-light)] first:pl-5 last:pr-5",
                    dense ? "sm:px-3" : "sm:px-4",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="dashboard-table-row border-t border-[rgba(153,148,168,0.12)] bg-white/82 align-top transition-colors hover:bg-[rgba(79,70,229,0.05)]"
              >
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${index}`}
                    className={cn(
                      "px-4 py-4 text-sm leading-6 text-[var(--brand-text)] first:pl-5 last:pr-5",
                      dense ? "sm:px-3 sm:py-3" : "sm:px-4 sm:py-4",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TrendChart({
  data,
  tone = "indigo",
  formatValue = (value) => String(value),
  heightClassName = "h-44",
}: TrendChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={cn("grid grid-cols-6 gap-3 sm:grid-cols-7", heightClassName)}>
      {data.map((item) => {
        const barHeight = `${Math.max((item.value / max) * 100, 12)}%`;

        return (
          <div key={item.label} className="flex h-full flex-col justify-end gap-3">
            <div className="relative flex-1 rounded-[1.25rem] bg-[rgba(245,240,232,0.8)] p-2">
              <div
                className={cn(
                  "absolute inset-x-2 bottom-2 rounded-[1rem] bg-gradient-to-t",
                  chartToneClasses[tone],
                )}
                style={{ height: barHeight }}
              />
              <div className="tabular-data absolute inset-x-0 top-2 text-center text-[11px] font-semibold text-[var(--brand-text-muted)]">
                {formatValue(item.value)}
              </div>
            </div>
            <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex gap-4 rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(250,248,244,0.8))] p-4 shadow-[0_14px_28px_rgba(42,38,56,0.05)]"
        >
          <span
            className={cn(
              "mt-1 inline-flex h-3 w-3 shrink-0 rounded-full",
              item.tone === "coral"
                ? "bg-[var(--brand-coral)]"
                : item.tone === "sage"
                  ? "bg-[var(--brand-sage)]"
                  : item.tone === "basalt"
                    ? "bg-[var(--brand-basalt)]"
                    : "bg-[var(--brand-indigo)]",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-[var(--brand-text)]">{item.title}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
                {item.meta}
              </div>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function KeyValueList({
  items,
}: {
  items: Array<{ key: string; label: string; value: ReactNode }>;
}) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-start justify-between gap-6 rounded-[1.15rem] border border-[rgba(153,148,168,0.12)] bg-white/72 px-4 py-3"
        >
          <dt className="text-sm text-[var(--brand-text-muted)]">{item.label}</dt>
          <dd className="text-right text-sm font-semibold text-[var(--brand-text)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProgressSteps({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className="flex gap-4 rounded-[1.25rem] border border-[rgba(153,148,168,0.12)] bg-white/76 p-4"
        >
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                step.status === "done"
                  ? "bg-[rgba(124,154,130,0.14)] text-[var(--brand-sage)]"
                  : step.status === "active"
                    ? "bg-[rgba(79,70,229,0.12)] text-[var(--brand-indigo)]"
                    : "bg-[rgba(245,240,232,0.86)] text-[var(--brand-text-muted)]",
              )}
            >
              {index + 1}
            </span>
            {index < steps.length - 1 ? (
              <span className="mt-2 h-full w-px bg-[rgba(153,148,168,0.16)]" />
            ) : null}
          </div>
          <div className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold text-[var(--brand-text)]">{step.title}</div>
              <ToneBadge
                tone={
                  step.status === "done"
                    ? "sage"
                    : step.status === "active"
                      ? "indigo"
                      : "neutral"
                }
              >
                {step.status === "done"
                  ? "Done"
                  : step.status === "active"
                    ? "Current"
                    : "Upcoming"}
              </ToneBadge>
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--brand-text-muted)]">
              {step.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarMatrix({
  monthLabel,
  weekdays,
  days,
}: {
  monthLabel: string;
  weekdays: string[];
  days: CalendarDay[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-[rgba(153,148,168,0.12)] bg-white/78 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-editorial text-2xl tracking-[-0.04em] text-[var(--brand-text)]">
          {monthLabel}
        </div>
        <ToneBadge tone="sand">Monthly RSVP view</ToneBadge>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={`${day.day}-${index}`}
            className={cn(
              "min-h-28 rounded-[1rem] border p-2",
              day.outside
                ? "border-[rgba(153,148,168,0.08)] bg-[rgba(255,255,255,0.45)] text-[var(--brand-text-light)]"
                : day.emphasis
                  ? "border-[rgba(79,70,229,0.16)] bg-[rgba(79,70,229,0.06)]"
                  : "border-[rgba(153,148,168,0.12)] bg-white/74",
            )}
          >
            <div className="text-sm font-semibold">{day.day}</div>
            <div className="mt-2 space-y-1">
              {day.items?.slice(0, 2).map((item) => (
                <div
                  key={item}
                  className="rounded-full bg-[rgba(232,97,77,0.08)] px-2 py-1 text-[11px] font-medium leading-4 text-[var(--brand-text)]"
                >
                  {item}
                </div>
              ))}
              {(day.items?.length ?? 0) > 2 ? (
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-light)]">
                  +{(day.items?.length ?? 0) - 2} more
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeatGrid({
  columns,
  rows,
}: {
  columns: string[];
  rows: HeatRow[];
}) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(153,148,168,0.12)] bg-white/78">
      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-px bg-[rgba(153,148,168,0.12)]">
        <div className="bg-[rgba(245,240,232,0.88)] px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]">
          Segment
        </div>
        {columns.map((column) => (
          <div
            key={column}
            className="bg-[rgba(245,240,232,0.88)] px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-text-light)]"
          >
            {column}
          </div>
        ))}
        {rows.map((row) => (
          <FragmentRow key={row.label} label={row.label} values={row.values} />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({ label, values }: HeatRow) {
  return (
    <>
      <div className="bg-white/90 px-3 py-3 text-sm font-semibold text-[var(--brand-text)]">
        {label}
      </div>
      {values.map((value, index) => (
        <div
          key={`${label}-${index}`}
          className="flex items-center justify-center bg-white/90 px-2 py-3"
        >
          <span
            className="block h-8 w-full rounded-lg"
            style={{
              background: `rgba(79, 70, 229, ${0.1 + value * 0.14})`,
            }}
            aria-label={`${label} ${value}`}
          />
        </div>
      ))}
    </>
  );
}

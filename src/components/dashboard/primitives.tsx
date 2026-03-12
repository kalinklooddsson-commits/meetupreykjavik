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
    "border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.08)] text-brand-indigo",
  coral:
    "border-[rgba(232,97,77,0.22)] bg-[rgba(232,97,77,0.09)] text-brand-coral",
  sage:
    "border-[rgba(124,154,130,0.24)] bg-[rgba(124,154,130,0.12)] text-brand-sage",
  sand:
    "border-[rgba(245,240,232,0.95)] bg-[rgba(245,240,232,0.96)] text-brand-text",
  basalt:
    "border-[rgba(30,27,46,0.16)] bg-[rgba(30,27,46,0.08)] text-brand-basalt",
  neutral:
    "border-[rgba(153,148,168,0.18)] bg-[rgba(255,255,255,0.74)] text-brand-text-muted",
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
        "dashboard-surface rounded-xl border border-brand-border-light bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-1 text-lg font-semibold text-brand-text">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
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
    <section className="dashboard-surface dashboard-grid-surface rounded-xl border border-brand-border-light bg-white p-5 sm:p-6">
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-lg font-semibold text-brand-text">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
          {description}
        </p>
      </div>

      <div className="rounded-lg border border-brand-border-light bg-brand-sand-light p-4">
        <p className="text-sm font-medium text-brand-text">{prompt}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => (
            <span
              key={suggestion}
              className="inline-flex items-center rounded-md border border-brand-border-light bg-white px-2 py-0.5 text-xs font-medium text-brand-text-muted"
            >
              {suggestion}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-indigo-dark"
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-indigo hover:text-brand-indigo"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-brand-border-light bg-white p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
                {stat.label}
              </div>
              {stat.icon ? (
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg border",
                    toneClasses[stat.tone ?? "indigo"],
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </span>
              ) : null}
            </div>
            <div className="tabular-nums mt-2 text-2xl font-semibold text-brand-text">
              {stat.value}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">
              {stat.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
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
    <article className="dashboard-stat-card rounded-xl border border-brand-border-light bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
          {label}
        </div>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border",
              toneClasses[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className="tabular-nums mt-2 text-2xl font-semibold text-brand-text">
        {value}
      </div>
      {delta ? (
        <div
          className={cn(
            "mt-1.5 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
            toneClasses[tone],
          )}
        >
          {delta}
        </div>
      ) : null}
      {detail ? (
        <p className="mt-2 text-xs leading-relaxed text-brand-text-muted">{detail}</p>
      ) : null}
    </article>
  );
}

export function SignalRail({ eyebrow, title, description, items }: SignalRailProps) {
  return (
    <section className="dashboard-signal-rail rounded-xl border border-brand-border-light bg-white p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
            {eyebrow}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-brand-text">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-text-muted">
            {description}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.key}
              className="rounded-lg border border-brand-border-light bg-white p-3"
            >
              <div
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  toneClasses[item.tone ?? "indigo"],
                )}
              >
                {item.label}
              </div>
              <div className="tabular-nums mt-2 text-2xl font-semibold text-brand-text">
                {item.value}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">
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
    <section className="dashboard-decision-strip rounded-xl border border-brand-border-light bg-white p-5 sm:p-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-brand-text-light">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-lg font-semibold text-brand-text">
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-text-muted">
          {description}
        </p>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.key}
            className="dashboard-decision-card rounded-lg border border-brand-border-light bg-white p-4"
          >
            <div
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                toneClasses[item.tone ?? "indigo"],
              )}
            >
              {item.label}
            </div>
            <div className="mt-2 text-sm font-semibold text-brand-text">
              {item.summary}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">{item.meta}</p>
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
        "rounded-lg border border-brand-border-light bg-white p-3",
        "dashboard-stream-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
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
              <div className="text-xs font-medium text-brand-text-light">
                {eyebrow}
              </div>
            ) : null}
          </div>
        </div>
        {badge}
      </div>
      <div className="mt-2 text-sm font-semibold text-brand-text">
        {title}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-brand-text-muted">{description}</div>
      {meta ? (
        <div className="mt-2 text-sm font-medium text-brand-indigo">{meta}</div>
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
      ? "h-8 w-8 rounded-lg text-xs"
      : size === "lg"
        ? "h-16 w-16 rounded-xl text-xl"
        : "h-10 w-10 rounded-lg text-sm";
  const paletteKey =
    tone === "coral" || tone === "sage" || tone === "sand"
      ? tone
      : "indigo";
  const imageSrc = src || createAvatarDataUrl(name, paletteKey);

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden border border-brand-border-light bg-cover bg-center",
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
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
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
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium",
            item.active
              ? toneClasses[item.tone ?? "indigo"]
              : "border-brand-border-light bg-white text-brand-text-muted",
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
      className="dashboard-quick-action group block rounded-xl border border-brand-border-light bg-white p-4 transition hover:border-brand-indigo hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-brand-text">
            {title}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
            {description}
          </p>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(55,48,163,0.06)] text-brand-indigo">
          {Icon ? <Icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </span>
      </div>
      <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-indigo">
        Open
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function DashboardTable({ columns, rows, dense = false, caption }: TableProps) {
  return (
    <div className="dashboard-table-shell overflow-hidden rounded-lg border border-brand-border-light">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-brand-sand-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-brand-text-light first:pl-4 last:pr-4",
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
                className="dashboard-table-row border-t border-brand-border-light bg-white align-top"
              >
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${index}`}
                    className={cn(
                      "px-4 py-3 text-sm leading-relaxed text-brand-text first:pl-4 last:pr-4",
                      dense ? "sm:px-3 sm:py-2.5" : "sm:px-4 sm:py-3",
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
  heightClassName = "h-40",
}: TrendChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const barColor = tone === "coral" ? "var(--brand-coral)" : tone === "sage" ? "var(--brand-sage)" : "var(--brand-indigo)";

  return (
    <div className={cn("grid grid-cols-6 gap-2 sm:grid-cols-7", heightClassName)}>
      {data.map((item) => {
        const barHeight = `${Math.max((item.value / max) * 100, 8)}%`;

        return (
          <div key={item.label} className="flex h-full flex-col justify-end gap-1.5">
            <div className="relative flex-1 rounded-md bg-brand-sand-light p-1">
              <div
                className="absolute inset-x-1 bottom-1 rounded"
                style={{ height: barHeight, background: barColor, opacity: 0.8 }}
              />
              <div className="tabular-nums absolute inset-x-0 top-1 text-center text-[11px] font-medium text-brand-text-muted">
                {formatValue(item.value)}
              </div>
            </div>
            <div className="text-center text-[10px] font-medium uppercase tracking-wider text-brand-text-light">
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
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex gap-3 rounded-lg border border-brand-border-light bg-white p-3"
        >
          <span
            className={cn(
              "mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full",
              item.tone === "coral"
                ? "bg-brand-coral"
                : item.tone === "sage"
                  ? "bg-brand-sage"
                  : item.tone === "basalt"
                    ? "bg-brand-basalt"
                    : "bg-brand-indigo",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-brand-text">{item.title}</div>
              <div className="text-xs font-medium text-brand-text-light">
                {item.meta}
              </div>
            </div>
            <p className="mt-0.5 text-sm leading-relaxed text-brand-text-muted">
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
    <dl className="divide-y divide-brand-border-light rounded-lg border border-brand-border-light">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-start justify-between gap-4 px-3 py-2.5"
        >
          <dt className="text-sm text-brand-text-muted">{item.label}</dt>
          <dd className="text-right text-sm font-medium text-brand-text">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ProgressSteps({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className="flex gap-3 rounded-lg border border-brand-border-light bg-white p-3"
        >
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                step.status === "done"
                  ? "bg-[rgba(124,154,130,0.14)] text-brand-sage"
                  : step.status === "active"
                    ? "bg-[rgba(55,48,163,0.1)] text-brand-indigo"
                    : "bg-brand-sand text-brand-text-muted",
              )}
            >
              {index + 1}
            </span>
            {index < steps.length - 1 ? (
              <span className="mt-1 h-full w-px bg-brand-border-light" />
            ) : null}
          </div>
          <div className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium text-brand-text">{step.title}</div>
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
            <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
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
    <div className="rounded-lg border border-brand-border-light bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-base font-semibold text-brand-text">
          {monthLabel}
        </div>
        <ToneBadge tone="sand">RSVP view</ToneBadge>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-brand-text-light">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={`${day.day}-${index}`}
            className={cn(
              "min-h-24 rounded-md border p-1.5",
              day.outside
                ? "border-transparent bg-brand-sand-light text-brand-text-light"
                : day.emphasis
                  ? "border-[rgba(55,48,163,0.15)] bg-[rgba(55,48,163,0.04)]"
                  : "border-brand-border-light bg-white",
            )}
          >
            <div className="text-xs font-medium">{day.day}</div>
            <div className="mt-1 space-y-0.5">
              {day.items?.slice(0, 2).map((item) => (
                <div
                  key={item}
                  className="rounded bg-[rgba(55,48,163,0.06)] px-1 py-0.5 text-[10px] font-medium leading-tight text-brand-text"
                >
                  {item}
                </div>
              ))}
              {(day.items?.length ?? 0) > 2 ? (
                <div className="text-[10px] font-medium text-brand-text-light">
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
    <div className="overflow-hidden rounded-lg border border-brand-border-light">
      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] gap-px bg-brand-border-light">
        <div className="bg-brand-sand-light px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-brand-text-light">
          Segment
        </div>
        {columns.map((column) => (
          <div
            key={column}
            className="bg-brand-sand-light px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-brand-text-light"
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
      <div className="bg-white px-3 py-2.5 text-sm font-medium text-brand-text">
        {label}
      </div>
      {values.map((value, index) => (
        <div
          key={`${label}-${index}`}
          className="flex items-center justify-center bg-white px-1.5 py-2.5"
        >
          <span
            className="block h-6 w-full rounded"
            style={{
              background: `rgba(55, 48, 163, ${0.08 + value * 0.12})`,
            }}
            aria-label={`${label} ${value}`}
          />
        </div>
      ))}
    </>
  );
}

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { healthBg, type Health } from "@/lib/motoriq-data";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  right,
  children,
  className = "",
  padding = "p-5",
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <section className={`card-elev ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          {title && (
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          )}
          {right}
        </header>
      )}
      <div className={padding}>{children}</div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number; // percentage
  tone?: "neutral" | Health;
  hint?: string;
}) {
  const toneRing =
    tone === "healthy"
      ? "text-healthy"
      : tone === "warning"
        ? "text-warning"
        : tone === "critical"
          ? "text-critical"
          : "text-primary";
  const trendIcon =
    trend === undefined ? null : trend > 0 ? (
      <ArrowUpRight className="h-3 w-3" />
    ) : trend < 0 ? (
      <ArrowDownRight className="h-3 w-3" />
    ) : (
      <Minus className="h-3 w-3" />
    );
  const trendColor =
    trend === undefined
      ? ""
      : trend > 0
        ? tone === "critical" || tone === "warning"
          ? "text-critical"
          : "text-healthy"
        : trend < 0
          ? tone === "critical" || tone === "warning"
            ? "text-healthy"
            : "text-critical"
          : "text-muted-foreground";

  return (
    <div className="card-elev p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent ${toneRing}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        {trend !== undefined ? (
          <span className={`inline-flex items-center gap-0.5 ${trendColor}`}>
            {trendIcon}
            {Math.abs(trend).toFixed(1)}% vs 24h
          </span>
        ) : (
          <span />
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function HealthBadge({ health }: { health: Health }) {
  const label =
    health === "healthy" ? "Healthy" : health === "warning" ? "Warning" : "Critical";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${healthBg(
        health,
      )}`}
    >
      <span className="status-dot" style={{ backgroundColor: "currentColor" }} />
      {label}
    </span>
  );
}

export function Bar({
  value,
  tone = "primary",
  height = "h-1.5",
}: {
  value: number; // 0-100
  tone?: "primary" | Health;
  height?: string;
}) {
  const color =
    tone === "healthy"
      ? "bg-healthy"
      : tone === "warning"
        ? "bg-warning"
        : tone === "critical"
          ? "bg-critical"
          : "bg-primary";
  return (
    <div className={`w-full overflow-hidden rounded-full bg-muted ${height}`}>
      <div
        className={`h-full ${color} transition-[width] duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function SectionGrid({
  cols = 4,
  children,
}: {
  cols?: 2 | 3 | 4 | 6;
  children: ReactNode;
}) {
  const map: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };
  return <div className={`grid grid-cols-1 gap-4 ${map[cols]}`}>{children}</div>;
}

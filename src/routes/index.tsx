import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Thermometer,
  Zap,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  BatteryCharging,
  TrendingUp,
  Clock,
  Waves,
} from "lucide-react";
import { KpiCard, PageHeader, Panel, SectionGrid, HealthBadge, Bar } from "@/components/motoriq/primitives";
import { Sparkline, TrendChart } from "@/components/motoriq/Sparkline";
import { useMotors, useTrend, aiInsights, healthBg } from "@/lib/motoriq-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MotorIQ" },
      { name: "description", content: "Real-time KPIs across all monitored induction motors: health, temperature, vibration, current and plant availability." },
      { property: "og:title", content: "MotorIQ Dashboard" },
      { property: "og:description", content: "Live motor health KPIs and AI insights across the plant." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const motors = useMotors();
  const trend = useTrend("M-311", "vibration", 60);

  const total = motors.length;
  const healthy = motors.filter((m) => m.health === "healthy").length;
  const warning = motors.filter((m) => m.health === "warning").length;
  const critical = motors.filter((m) => m.health === "critical").length;
  const avg = (fn: (n: number) => number) =>
    (motors.reduce((s, m) => s + fn(m as any), 0) / motors.length).toFixed(1);
  const avgTemp = avg((m: any) => m.temperature);
  const avgVib = avg((m: any) => m.vibration);
  const avgCurrent = avg((m: any) => m.current);
  const avgVoltage = avg((m: any) => m.voltage);
  const avgRpm = Math.round(motors.reduce((s, m) => s + m.rpm, 0) / motors.length);
  const health = Math.round(motors.reduce((s, m) => s + m.healthScore, 0) / motors.length);
  const availability = 97.4;
  const uptime = 99.82;

  return (
    <>
      <PageHeader
        title="Plant Dashboard"
        subtitle="Fleet-wide health snapshot across three-phase induction motors"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-healthy/10 px-3 py-1.5 text-xs font-medium text-healthy border border-healthy/20">
            <span className="status-dot animate-pulse-soft" style={{ backgroundColor: "currentColor" }} />
            Streaming — {motors.length} motors online
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Total Motors" value={total} icon={Cpu} hint="fleet" />
        <KpiCard label="Healthy" value={healthy} icon={ShieldCheck} tone="healthy" hint={`${((healthy/total)*100).toFixed(0)}%`} />
        <KpiCard label="Warning" value={warning} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Critical" value={critical} icon={AlertOctagon} tone="critical" />
        <KpiCard label="Avg Temperature" value={avgTemp} unit="°C" icon={Thermometer} trend={1.2} />
        <KpiCard label="Avg Vibration" value={avgVib} unit="mm/s" icon={Waves} trend={4.6} tone="warning" />
        <KpiCard label="Avg Current" value={avgCurrent} unit="A" icon={Zap} trend={-0.8} />
        <KpiCard label="Avg Voltage" value={avgVoltage} unit="V" icon={BatteryCharging} trend={0.1} />
        <KpiCard label="Avg RPM" value={avgRpm} icon={Gauge} trend={-0.2} />
        <KpiCard label="Plant Health" value={health} unit="/ 100" icon={Activity} tone={health >= 80 ? "healthy" : health >= 60 ? "warning" : "critical"} trend={-1.4} />
        <KpiCard label="Availability" value={availability} unit="%" icon={TrendingUp} trend={0.3} tone="healthy" />
        <KpiCard label="System Uptime" value={uptime} unit="%" icon={Clock} trend={0.05} tone="healthy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Fleet Vibration — Critical Asset (M-311)"
          right={<span className="text-xs text-muted-foreground">Last 3 minutes · live</span>}
          className="lg:col-span-2"
        >
          <TrendChart data={trend} color="var(--color-critical)" unit="mm/s" height={280} />
        </Panel>

        <Panel title="AI Insights" right={<span className="text-xs text-primary">Auto-refreshed</span>}>
          <ul className="space-y-3">
            {aiInsights.map((i, idx) => (
              <li key={idx} className={`rounded-md border p-3 text-sm ${healthBg(i.tone)}`}>
                <div className="text-[13px] font-semibold text-foreground">{i.title}</div>
                <p className="mt-1 text-xs text-foreground/80">{i.body}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          title="Monitored Assets"
          right={
            <Link to="/plant-overview" className="text-xs font-medium text-primary hover:underline">
              View plant overview →
            </Link>
          }
          padding="p-0"
        >
          <div className="divide-y divide-border">
            {motors.map((m) => (
              <Link
                key={m.id}
                to="/equipment/$id"
                params={{ id: m.id }}
                className="grid grid-cols-2 gap-3 px-5 py-4 transition-colors hover:bg-accent/40 md:grid-cols-[1.4fr_repeat(5,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.id} · {m.equipmentType}
                  </div>
                </div>
                <MiniStat label="Health" value={`${m.healthScore.toFixed(0)}`} tone={m.health} />
                <MiniStat label="Temp" value={`${m.temperature.toFixed(1)}°C`} />
                <MiniStat label="Vibration" value={`${m.vibration.toFixed(2)} mm/s`} />
                <MiniStat label="Current" value={`${m.current.toFixed(1)} A`} />
                <MiniStat label="RPM" value={`${m.rpm}`} />
                <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                  <HealthBadge health={m.health} />
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: any }) {
  const color =
    tone === "healthy" ? "text-healthy" : tone === "warning" ? "text-warning" : tone === "critical" ? "text-critical" : "text-foreground";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/motoriq/primitives";
import { TrendChart, MultiLine } from "@/components/motoriq/Sparkline";
import { useMotors, useTrend } from "@/lib/motoriq-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MotorIQ" },
      { name: "description", content: "Trend analytics and plant-wide effectiveness metrics for the motor fleet." },
      { property: "og:title", content: "Analytics — MotorIQ" },
      { property: "og:description", content: "Interactive charts for vibration, temperature, current and OEE." },
    ],
  }),
  component: Analytics,
});

const ranges = ["Last Minute", "Last Hour", "Today", "Last Week", "Last Month"];

function Analytics() {
  const motors = useMotors();
  const [id, setId] = useState(motors[0]?.id ?? "M-101");
  const [range, setRange] = useState("Last Hour");
  const vib = useTrend(id, "vibration", 60);
  const temp = useTrend(id, "temperature", 60);
  const cur = useTrend(id, "current", 60);
  const volt = useTrend(id, "voltage", 60);
  const rpm = useTrend(id, "rpm", 60);
  const pw = useTrend(id, "power", 60);
  const hp = useTrend(id, "healthScore", 60);

  const oee = 87.4;
  const efficiency = 91.2;
  const energy = 128_540;
  const downtime = 6.3;
  const avgHealth = Math.round(motors.reduce((s, m) => s + m.healthScore, 0) / motors.length);

  // Failure distribution
  const failures = [
    { t: "Bearing", n: 14 },
    { t: "Misalignment", n: 8 },
    { t: "Imbalance", n: 5 },
    { t: "Stator", n: 3 },
    { t: "Overheating", n: 6 },
  ];

  const monthly = [
    { t: "Feb", n: 4 }, { t: "Mar", n: 6 }, { t: "Apr", n: 3 },
    { t: "May", n: 5 }, { t: "Jun", n: 2 }, { t: "Jul", n: 4 },
  ];

  return (
    <>
      <PageHeader
        title="Trend Analytics"
        subtitle="Deep-dive KPIs across the monitored fleet"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={id} onChange={(e) => setId(e.target.value)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
              {motors.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}
            </select>
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              {ranges.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs ${range === r ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"}`}>{r}</button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel title={`Vibration · ${range}`}><TrendChart data={vib} color="var(--color-critical)" unit="mm/s" height={180} /></Panel>
        <Panel title={`Temperature · ${range}`}><TrendChart data={temp} color="var(--color-warning)" unit="°C" height={180} /></Panel>
        <Panel title={`Current · ${range}`}><TrendChart data={cur} color="var(--color-primary)" unit="A" height={180} /></Panel>
        <Panel title={`Voltage · ${range}`}><TrendChart data={volt} color="var(--color-chart-5)" unit="V" height={180} /></Panel>
        <Panel title={`RPM · ${range}`}><TrendChart data={rpm} color="var(--color-chart-2)" unit="RPM" height={180} /></Panel>
        <Panel title={`Power · ${range}`}><TrendChart data={pw} color="var(--color-chart-4)" unit="kW" height={180} /></Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Overall Equipment Effectiveness"><Big value={`${oee}%`} sub="OEE · this month" /></Panel>
        <Panel title="Motor Efficiency"><Big value={`${efficiency}%`} sub="Fleet weighted average" /></Panel>
        <Panel title="Energy Consumption"><Big value={`${(energy/1000).toFixed(1)} MWh`} sub="Rolling 30 days" /></Panel>
        <Panel title="Downtime Analysis"><Big value={`${downtime} h`} sub="Unplanned · last 30 d" /></Panel>
        <Panel title="Average Health Score"><Big value={`${avgHealth}`} sub="Fleet average · 0–100" /></Panel>
        <Panel title="Equipment Availability"><Big value="97.4%" sub="Line 2 · rolling 7 d" /></Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Fault Distribution">
          <ul className="space-y-2">
            {failures.map((f) => {
              const max = Math.max(...failures.map((x) => x.n));
              return (
                <li key={f.t} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{f.t}</span>
                    <span className="tabular-nums text-muted-foreground">{f.n}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${(f.n / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Monthly Failure Trend">
          <MultiLine data={monthly.map((m) => ({ t: m.t, Failures: m.n }))} series={[{ key: "Failures", color: "var(--color-primary)", label: "Failures" }]} height={200} />
        </Panel>
        <Panel title="Maintenance Cost Trend">
          <MultiLine data={[
            { t: "Feb", USD: 3200 }, { t: "Mar", USD: 4100 }, { t: "Apr", USD: 2700 },
            { t: "May", USD: 3600 }, { t: "Jun", USD: 2200 }, { t: "Jul", USD: 3900 },
          ]} series={[{ key: "USD", color: "var(--color-chart-4)", label: "USD" }]} height={200} />
        </Panel>
        <Panel title="Fleet Health Score"><TrendChart data={hp} color="var(--color-healthy)" unit="" height={200} /></Panel>
      </div>
    </>
  );
}

function Big({ value, sub }: { value: string; sub: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

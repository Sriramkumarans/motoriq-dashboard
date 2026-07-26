import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Cog, Timer, AlertOctagon, Sparkles } from "lucide-react";
import { PageHeader, Panel, Bar, HealthBadge } from "@/components/motoriq/primitives";
import { useMotors, healthBg, type Motor } from "@/lib/motoriq-data";

export const Route = createFileRoute("/ai-diagnostics")({
  head: () => ({
    meta: [
      { title: "AI Diagnostics — MotorIQ" },
      { name: "description", content: "Edge-AI fault classification, bearing/rotor/stator condition and remaining useful life predictions." },
      { property: "og:title", content: "AI Diagnostics — MotorIQ" },
      { property: "og:description", content: "AI-driven fault classification and RUL for every monitored motor." },
    ],
  }),
  component: AIDiagnostics,
});

function AIDiagnostics() {
  const motors = useMotors();
  const [id, setId] = useState(motors[0]?.id ?? "M-311");
  const m = motors.find((x) => x.id === id) ?? motors[0];
  const d = diagnose(m);

  return (
    <>
      <PageHeader
        title="AI Diagnostics"
        subtitle="On-edge neural inference · CNN + spectral features"
        actions={
          <select value={id} onChange={(e) => setId(e.target.value)} className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">
            {motors.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-1" title="Overall Motor Health">
          <div className="flex flex-col items-center py-2">
            <RadialScore value={m.healthScore} tone={m.health} />
            <div className="mt-3"><HealthBadge health={m.health} /></div>
            <div className="mt-4 text-center text-sm">
              <div className="text-muted-foreground">Fault Classification</div>
              <div className="mt-0.5 text-base font-semibold">{d.faultClass}</div>
            </div>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Confidence</span>
                <span className="font-semibold tabular-nums">{d.confidence}%</span>
              </div>
              <div className="mt-1.5"><Bar value={d.confidence} tone={m.health} /></div>
            </div>
          </div>
        </Panel>

        <Panel className="lg:col-span-2" title="Component Condition">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Condition label="Bearing Condition" value={d.bearing} />
            <Condition label="Rotor Condition" value={d.rotor} />
            <Condition label="Stator Condition" value={d.stator} />
            <Condition label="Misalignment" value={d.misalignment} inverted />
            <Condition label="Imbalance" value={d.imbalance} inverted />
            <Condition label="Overheating Risk" value={d.overheating} inverted />
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Remaining Useful Life" right={<Timer className="h-4 w-4 text-muted-foreground" />}>
          <div className="text-4xl font-semibold tabular-nums">{d.rulDays}<span className="ml-1 text-sm font-normal text-muted-foreground">days</span></div>
          <p className="mt-2 text-xs text-muted-foreground">Estimated with 90% CI · updated 5 s ago</p>
        </Panel>
        <Panel title="Maintenance Priority" right={<AlertOctagon className="h-4 w-4 text-muted-foreground" />}>
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${healthBg(m.health)}`}>
            {d.priority}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Priority auto-set from severity, RUL and criticality of {m.equipmentType}.</p>
        </Panel>
        <Panel title="Recommended Action" right={<Cog className="h-4 w-4 text-muted-foreground" />}>
          <p className="text-sm">{d.action}</p>
          <p className="mt-2 text-xs text-muted-foreground">Aligned with ISO 10816 vibration severity zones.</p>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Model Insight">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div className="text-sm text-muted-foreground">
              MotorIQ's edge model fuses 3-axis vibration FFT, thermal drift and stator current signature analysis (MCSA).
              A confidence of <span className="font-semibold text-foreground">{d.confidence}%</span> is reported for the current
              fault class <span className="font-semibold text-foreground">{d.faultClass}</span> on{" "}
              <span className="font-mono text-foreground">{m.id}</span>.
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function diagnose(m: Motor) {
  const base = m.healthScore;
  const faultClass =
    m.health === "critical" ? "Bearing Fault (Outer Race)"
    : m.health === "warning" ? "Shaft Misalignment"
    : "No Significant Fault";
  const confidence = Math.min(99, Math.round(72 + (100 - base) * 0.3));
  const bearing = clamp(base - (m.vibration > 5 ? 40 : m.vibration > 3 ? 15 : 4));
  const rotor = clamp(base - (m.current > m.ratedCurrent * 1.05 ? 20 : 3));
  const stator = clamp(base - (m.temperature > 85 ? 25 : 4));
  const misalignment = clamp(m.vibration > 4 ? 68 : 22);
  const imbalance = clamp(m.vibration > 5 ? 55 : 18);
  const overheating = clamp(m.temperature > 85 ? 76 : m.temperature > 70 ? 42 : 12);
  const rulDays =
    m.health === "critical" ? 9 : m.health === "warning" ? 28 : 120;
  const priority = m.health === "critical" ? "Critical" : m.health === "warning" ? "High" : "Low";
  const action =
    m.health === "critical"
      ? "Schedule bearing replacement within 72 hours; increase sampling to 4 kHz."
      : m.health === "warning"
        ? "Perform laser alignment at next stop; monitor 1× RPM harmonic."
        : "No action required. Continue standard monitoring cadence.";
  return { faultClass, confidence, bearing, rotor, stator, misalignment, imbalance, overheating, rulDays, priority, action };
}
function clamp(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }

function Condition({ label, value, inverted = false }: { label: string; value: number; inverted?: boolean }) {
  const good = inverted ? 100 - value : value;
  const tone = good >= 75 ? "healthy" : good >= 50 ? "warning" : "critical";
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="mt-2"><Bar value={value} tone={tone as any} /></div>
    </div>
  );
}

function RadialScore({ value, tone }: { value: number; tone: "healthy" | "warning" | "critical" }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = tone === "healthy" ? "var(--color-healthy)" : tone === "warning" ? "var(--color-warning)" : "var(--color-critical)";
  return (
    <div className="relative">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} stroke="var(--color-muted)" strokeWidth="10" fill="none" />
        <circle
          cx="70" cy="70" r={r}
          stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-semibold tabular-nums">{value.toFixed(0)}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</div>
        </div>
      </div>
    </div>
  );
}

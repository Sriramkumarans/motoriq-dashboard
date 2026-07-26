import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Thermometer,
  Waves,
  Zap,
  Gauge,
  BatteryCharging,
  Activity,
  Clock,
  ShieldCheck,
  Radio,
  Cloud,
  Cpu,
  Wrench,
  ChevronLeft,
} from "lucide-react";
import { PageHeader, Panel, KpiCard, HealthBadge, Bar, Stat } from "@/components/motoriq/primitives";
import { TrendChart } from "@/components/motoriq/Sparkline";
import { useMotor, useTrend, healthColor } from "@/lib/motoriq-data";

export const Route = createFileRoute("/equipment/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Motor ${params.id} — MotorIQ` },
      { name: "description", content: `Live sensor data, AI diagnostics and maintenance history for motor ${params.id}.` },
      { property: "og:title", content: `Motor ${params.id} — MotorIQ` },
      { property: "og:description", content: `Detailed live monitoring for motor ${params.id}.` },
    ],
  }),
  component: EquipmentDetail,
  notFoundComponent: () => (
    <div className="p-8 text-sm text-muted-foreground">Motor not found.</div>
  ),
});

function EquipmentDetail() {
  const { id } = Route.useParams();
  const m = useMotor(id);
  const vib = useTrend(id, "vibration", 60);
  const temp = useTrend(id, "temperature", 60);
  const cur = useTrend(id, "current", 60);
  const rpm = useTrend(id, "rpm", 60);
  if (!m) throw notFound();

  return (
    <>
      <div className="mb-2">
        <Link
          to="/plant-overview"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Plant Overview
        </Link>
      </div>
      <PageHeader
        title={m.name}
        subtitle={`${m.id} · ${m.equipmentType} · ${m.section}`}
        actions={<HealthBadge health={m.health} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Equipment" className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <MotorIllustration type={m.equipmentType} />
            <div className="mt-4 grid w-full grid-cols-2 gap-y-3">
              <Stat label="Motor Power" value={m.ratedPower} unit="kW" />
              <Stat label="Rated Voltage" value={m.ratedVoltage} unit="V" />
              <Stat label="Rated Current" value={m.ratedCurrent} unit="A" />
              <Stat label="Rated Speed" value={m.ratedRpm} unit="RPM" />
              <Stat label="Operating Hours" value={m.operatingHours.toFixed(0)} unit="h" />
              <Stat label="Last Maintenance" value={m.lastMaintenance} />
              <Stat label="Next Maintenance" value={m.nextMaintenance} />
              <Stat label="Condition" value={m.health === "healthy" ? "Normal" : m.health === "warning" ? "Degraded" : "At Risk"} />
            </div>

            <div className="mt-4 w-full space-y-2 rounded-lg bg-surface-2 p-3 text-xs">
              <StatusRow icon={Radio} label="Sensor node" ok={m.sensorOk} />
              <StatusRow icon={Cloud} label="Edge gateway" ok={m.gatewayOk} />
            </div>

            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Health Score</span>
                <span className={`font-semibold tabular-nums ${healthColor(m.health)}`}>
                  {m.healthScore.toFixed(1)} / 100
                </span>
              </div>
              <div className="mt-1.5"><Bar value={m.healthScore} tone={m.health} /></div>
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard label="Vibration" value={m.vibration.toFixed(2)} unit="mm/s" icon={Waves} tone={m.vibration > 4.5 ? "critical" : m.vibration > 3 ? "warning" : "healthy"} />
            <KpiCard label="Temperature" value={m.temperature.toFixed(1)} unit="°C" icon={Thermometer} tone={m.temperature > 85 ? "critical" : m.temperature > 70 ? "warning" : "healthy"} />
            <KpiCard label="Current" value={m.current.toFixed(1)} unit="A" icon={Zap} />
            <KpiCard label="Voltage" value={m.voltage.toFixed(1)} unit="V" icon={BatteryCharging} />
            <KpiCard label="Speed" value={m.rpm} unit="RPM" icon={Gauge} />
            <KpiCard label="Power" value={m.power.toFixed(2)} unit="kW" icon={Activity} />
            <KpiCard label="Power Factor" value={m.powerFactor.toFixed(2)} icon={ShieldCheck} tone={m.powerFactor >= 0.85 ? "healthy" : "warning"} />
            <KpiCard label="Op. Hours" value={m.operatingHours.toFixed(0)} unit="h" icon={Clock} />
            <KpiCard label="Running" value={m.running ? "Yes" : "No"} icon={Cpu} tone={m.running ? "healthy" : "warning"} />
            <KpiCard label="Sensor Health" value="OK" icon={Radio} tone="healthy" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel title="Vibration Trend"><TrendChart data={vib} color="var(--color-critical)" unit="mm/s" height={200} /></Panel>
            <Panel title="Temperature Trend"><TrendChart data={temp} color="var(--color-warning)" unit="°C" height={200} /></Panel>
            <Panel title="Current Trend"><TrendChart data={cur} color="var(--color-primary)" unit="A" height={200} /></Panel>
            <Panel title="RPM Trend"><TrendChart data={rpm} color="var(--color-chart-5)" unit="RPM" height={200} /></Panel>
          </div>

          <Panel title="Recent AI Findings" right={<Link to="/ai-diagnostics" className="text-xs font-medium text-primary hover:underline">Open diagnostics →</Link>}>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><Wrench className="mt-0.5 h-4 w-4 text-warning" /> Bearing envelope energy trending upward — probable outer-race defect.</li>
              <li className="flex items-start gap-2"><Wrench className="mt-0.5 h-4 w-4 text-primary" /> Recommended: replace drive-end bearing during next planned stop.</li>
              <li className="flex items-start gap-2"><Wrench className="mt-0.5 h-4 w-4 text-muted-foreground" /> No stator winding faults detected in last 24 h.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatusRow({ icon: Icon, label, ok }: { icon: any; label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={`inline-flex items-center gap-1.5 font-medium ${ok ? "text-healthy" : "text-critical"}`}>
        <span className="status-dot animate-pulse-soft" style={{ backgroundColor: "currentColor" }} />
        {ok ? "Online" : "Offline"}
      </span>
    </div>
  );
}

function MotorIllustration({ type }: { type: string }) {
  return (
    <svg viewBox="0 0 320 180" className="h-40 w-full">
      <defs>
        <linearGradient id="ill-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="var(--color-surface-2)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill="url(#ill-g)" rx="12" />
      {/* body */}
      <rect x="90" y="60" width="140" height="70" rx="10" fill="var(--color-primary)" opacity="0.9" />
      <rect x="86" y="70" width="8" height="50" fill="var(--color-primary)" />
      <rect x="226" y="70" width="8" height="50" fill="var(--color-primary)" />
      {/* shaft */}
      <rect x="230" y="90" width="60" height="10" fill="var(--color-muted-foreground)" opacity="0.6" />
      {/* fins */}
      {[...Array(9)].map((_, i) => (
        <rect key={i} x={98 + i * 15} y="52" width="6" height="8" fill="var(--color-primary)" opacity="0.7" />
      ))}
      {/* nameplate */}
      <rect x="120" y="80" width="70" height="30" rx="4" fill="#fff" opacity="0.9" />
      <text x="155" y="99" textAnchor="middle" fontSize="10" fill="var(--color-primary)" fontWeight="700">MotorIQ</text>
      {/* sensor node */}
      <g>
        <rect x="145" y="40" width="30" height="16" rx="3" fill="var(--color-healthy)" />
        <circle cx="160" cy="48" r="2.5" fill="#fff" className="animate-pulse-soft" />
        <line x1="160" y1="56" x2="160" y2="60" stroke="var(--color-healthy)" strokeWidth="2" />
      </g>
      <text x="160" y="34" textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)">Sensor Node</text>
      <text x="160" y="152" textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">{type}</text>
    </svg>
  );
}

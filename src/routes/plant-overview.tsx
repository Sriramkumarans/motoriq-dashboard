import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, MapPin, Clock, Thermometer, Waves, Zap, Gauge } from "lucide-react";
import { PageHeader, Panel, HealthBadge, Bar } from "@/components/motoriq/primitives";
import { useMotors, type Motor } from "@/lib/motoriq-data";

export const Route = createFileRoute("/plant-overview")({
  head: () => ({
    meta: [
      { title: "Plant Overview — MotorIQ" },
      { name: "description", content: "Equipment health cards for every monitored motor across the beverage plant." },
      { property: "og:title", content: "Plant Overview — MotorIQ" },
      { property: "og:description", content: "Real-time health cards for pumps, conveyors, compressors and mixers." },
    ],
  }),
  component: PlantOverview,
});

function PlantOverview() {
  const motors = useMotors();
  return (
    <>
      <PageHeader
        title="Plant Overview"
        subtitle="Non-Alcoholic Beverage Manufacturing · Production Line 2"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {motors.map((m) => (
          <EquipmentCard key={m.id} motor={m} />
        ))}
      </div>
    </>
  );
}

function EquipmentCard({ motor: m }: { motor: Motor }) {
  return (
    <Link
      to="/equipment/$id"
      params={{ id: m.id }}
      className="group card-elev block overflow-hidden p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">
                {m.id}
              </span>
              <HealthBadge health={m.health} />
            </div>
            <h3 className="mt-0.5 text-base font-semibold tracking-tight truncate">
              {m.name}
            </h3>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {m.equipmentType} ·{" "}
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {m.section}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            m.running
              ? "bg-healthy/10 text-healthy border-healthy/20"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          <span
            className="status-dot animate-pulse-soft"
            style={{ backgroundColor: "currentColor" }}
          />
          {m.running ? "Running" : "Stopped"}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Health Score</span>
          <span className="font-semibold tabular-nums">{m.healthScore.toFixed(1)} / 100</span>
        </div>
        <div className="mt-1.5">
          <Bar value={m.healthScore} tone={m.health} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 rounded-lg bg-surface-2 p-3">
        <Metric icon={Thermometer} label="Temp" value={`${m.temperature.toFixed(1)}°C`} />
        <Metric icon={Waves} label="Vibration" value={`${m.vibration.toFixed(2)}`} unit="mm/s" />
        <Metric icon={Zap} label="Current" value={`${m.current.toFixed(1)}`} unit="A" />
        <Metric icon={Gauge} label="RPM" value={`${m.rpm}`} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Updated {new Date(m.updatedAt).toLocaleTimeString()}
        </span>
        <span className="text-primary group-hover:underline">Open detail →</span>
      </div>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

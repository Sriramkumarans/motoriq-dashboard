import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Thermometer, Waves, Zap, Gauge, BatteryCharging, Activity, ShieldCheck, Clock, Cpu, Radio,
} from "lucide-react";
import { PageHeader, Panel, KpiCard } from "@/components/motoriq/primitives";
import { TrendChart } from "@/components/motoriq/Sparkline";
import { useMotors, useTrend } from "@/lib/motoriq-data";

export const Route = createFileRoute("/live-monitoring")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — MotorIQ" },
      { name: "description", content: "Streaming vibration, temperature, current and power telemetry from edge sensors." },
      { property: "og:title", content: "Live Monitoring — MotorIQ" },
      { property: "og:description", content: "Streaming sensor telemetry from the plant floor." },
    ],
  }),
  component: LiveMonitoring,
});

function LiveMonitoring() {
  const motors = useMotors();
  const [id, setId] = useState(motors[0]?.id ?? "M-101");
  const m = motors.find((x) => x.id === id) ?? motors[0];
  const vib = useTrend(id, "vibration", 50);
  const temp = useTrend(id, "temperature", 50);
  const cur = useTrend(id, "current", 50);
  const pw = useTrend(id, "power", 50);

  return (
    <>
      <PageHeader
        title="Live Monitoring"
        subtitle="Streaming edge inference · 1.5 s cadence"
        actions={
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            {motors.map((x) => (
              <option key={x.id} value={x.id}>
                {x.id} · {x.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Vibration" value={m.vibration.toFixed(2)} unit="mm/s" icon={Waves} tone={m.vibration > 4.5 ? "critical" : m.vibration > 3 ? "warning" : "healthy"} />
        <KpiCard label="Temperature" value={m.temperature.toFixed(1)} unit="°C" icon={Thermometer} tone={m.temperature > 85 ? "critical" : m.temperature > 70 ? "warning" : "healthy"} />
        <KpiCard label="Current" value={m.current.toFixed(1)} unit="A" icon={Zap} />
        <KpiCard label="Voltage" value={m.voltage.toFixed(1)} unit="V" icon={BatteryCharging} />
        <KpiCard label="RPM" value={m.rpm} icon={Gauge} />
        <KpiCard label="Power" value={m.power.toFixed(2)} unit="kW" icon={Activity} />
        <KpiCard label="Power Factor" value={m.powerFactor.toFixed(2)} icon={ShieldCheck} tone={m.powerFactor >= 0.85 ? "healthy" : "warning"} />
        <KpiCard label="Operating Hours" value={m.operatingHours.toFixed(0)} unit="h" icon={Clock} />
        <KpiCard label="Running" value={m.running ? "Yes" : "No"} icon={Cpu} tone="healthy" />
        <KpiCard label="Sensor Health" value="OK" icon={Radio} tone="healthy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Vibration"><TrendChart data={vib} color="var(--color-critical)" unit="mm/s" /></Panel>
        <Panel title="Temperature"><TrendChart data={temp} color="var(--color-warning)" unit="°C" /></Panel>
        <Panel title="Current"><TrendChart data={cur} color="var(--color-primary)" unit="A" /></Panel>
        <Panel title="Power"><TrendChart data={pw} color="var(--color-chart-5)" unit="kW" /></Panel>
      </div>
    </>
  );
}

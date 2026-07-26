import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/motoriq/primitives";
import { Cpu, Radio, Cloud, Brain, Monitor, Wrench, ArrowDown, Wifi } from "lucide-react";

export const Route = createFileRoute("/system-architecture")({
  head: () => ({
    meta: [
      { title: "System Architecture — MotorIQ" },
      { name: "description", content: "End-to-end architecture: sensor node → edge gateway → cloud → AI engine → dashboard." },
      { property: "og:title", content: "System Architecture — MotorIQ" },
      { property: "og:description", content: "How data flows from motor sensor nodes to the maintenance team." },
    ],
  }),
  component: SystemArchitecture,
});

const layers = [
  { icon: Cpu, title: "Three-Phase Induction Motor", sub: "Instrumented asset on the plant floor", tone: "primary" },
  { icon: Radio, title: "Distributed Sensor Node", sub: "MEMS vibration · thermistor · CT · Hall-effect", tone: "primary" },
  { icon: Wifi, title: "Edge Gateway", sub: "ARM Cortex-A53 · TinyML inference · 4G/LoRa fallback", tone: "primary" },
  { icon: Cloud, title: "MQTT / TLS 1.3", sub: "Publish sensor+features to cloud broker", tone: "muted" },
  { icon: Cloud, title: "Cloud Platform", sub: "Time-series DB · Kafka streaming · event store", tone: "muted" },
  { icon: Brain, title: "AI Prediction Engine", sub: "CNN + spectral MCSA · RUL regression", tone: "healthy" },
  { icon: Monitor, title: "Web Dashboard", sub: "Operator UI · alerts · digital twin", tone: "primary" },
  { icon: Wrench, title: "Maintenance Team", sub: "Work orders · mobile notifications", tone: "warning" },
];

function SystemArchitecture() {
  return (
    <>
      <PageHeader
        title="System Architecture"
        subtitle="From sensor node on the motor housing to the maintenance team"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Data Flow" right={<span className="text-xs text-muted-foreground">Live · animated</span>}>
          <div className="mx-auto flex max-w-md flex-col items-stretch gap-2">
            {layers.map((l, i) => {
              const Icon = l.icon;
              const color =
                l.tone === "healthy" ? "text-healthy border-healthy/30 bg-healthy/5"
                : l.tone === "warning" ? "text-warning border-warning/30 bg-warning/5"
                : l.tone === "muted" ? "text-muted-foreground border-border bg-surface"
                : "text-primary border-primary/25 bg-primary/5";
              return (
                <div key={l.title}>
                  <div className={`flex items-center gap-3 rounded-lg border p-3 ${color}`}>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-background">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.sub}</div>
                    </div>
                  </div>
                  {i < layers.length - 1 && (
                    <div className="flex justify-center py-1">
                      <svg width="8" height="26" viewBox="0 0 8 26">
                        <line x1="4" y1="0" x2="4" y2="24" stroke="var(--color-primary)" strokeWidth="1.5" className="animate-flow" />
                        <polygon points="0,20 8,20 4,26" fill="var(--color-primary)" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Sensor Node Specification">
            <ul className="space-y-2 text-sm">
              <Spec k="Vibration" v="ADXL356 · ±40 g · 3-axis · 4 kHz sampling" />
              <Spec k="Temperature" v="PT-100 RTD · ±0.3 °C · surface mount" />
              <Spec k="Current" v="Split-core CT · 0-50 A · 1000:1" />
              <Spec k="Voltage" v="Isolated resistor divider · 3-phase 415 V" />
              <Spec k="Speed" v="Hall-effect · rotor slot count derivation" />
              <Spec k="Power" v="Energy-harvest + Li-ion backup · 5 y" />
            </ul>
          </Panel>
          <Panel title="Edge / Cloud Contract">
            <ul className="space-y-2 text-sm">
              <Spec k="Protocol" v="MQTT 5.0 over TLS 1.3" />
              <Spec k="Payload" v="CBOR · features + raw window on anomaly" />
              <Spec k="Latency" v="&lt; 250 ms edge → cloud" />
              <Spec k="AI Model" v="Quantized CNN · 380 kB · 3 ms inference" />
              <Spec k="Retention" v="Raw 30 d · features 5 y · alerts forever" />
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </li>
  );
}

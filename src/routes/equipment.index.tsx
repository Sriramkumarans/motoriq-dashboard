import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, HealthBadge } from "@/components/motoriq/primitives";
import { useMotors } from "@/lib/motoriq-data";
import { Cpu } from "lucide-react";

export const Route = createFileRoute("/equipment/")({
  head: () => ({
    meta: [
      { title: "Equipment — MotorIQ" },
      { name: "description", content: "Registry of every monitored three-phase induction motor with live status." },
      { property: "og:title", content: "Equipment Registry — MotorIQ" },
      { property: "og:description", content: "Every monitored motor with equipment type, section and live status." },
    ],
  }),
  component: EquipmentList,
});

function EquipmentList() {
  const motors = useMotors();
  return (
    <>
      <PageHeader title="Equipment Registry" subtitle="Every monitored three-phase induction motor" />
      <Panel padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Motor</th>
                <th className="px-5 py-3 text-left font-medium">Equipment</th>
                <th className="px-5 py-3 text-left font-medium">Section</th>
                <th className="px-5 py-3 text-right font-medium">Health</th>
                <th className="px-5 py-3 text-right font-medium">Temp</th>
                <th className="px-5 py-3 text-right font-medium">Vibration</th>
                <th className="px-5 py-3 text-right font-medium">RPM</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {motors.map((m) => (
                <tr key={m.id} className="hover:bg-accent/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-primary">
                        <Cpu className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{m.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{m.equipmentType}</td>
                  <td className="px-5 py-3 text-muted-foreground">{m.section}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{m.healthScore.toFixed(0)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.temperature.toFixed(1)} °C</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.vibration.toFixed(2)} mm/s</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.rpm}</td>
                  <td className="px-5 py-3 text-right"><HealthBadge health={m.health} /></td>
                  <td className="px-5 py-3">
                    <Link to="/equipment/$id" params={{ id: m.id }} className="text-xs font-medium text-primary hover:underline">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

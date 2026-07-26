import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, HealthBadge } from "@/components/motoriq/primitives";
import { alerts } from "@/lib/motoriq-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Center — MotorIQ" },
      { name: "description", content: "Active and historical alerts across the motor fleet with severity and actions." },
      { property: "og:title", content: "Alert Center — MotorIQ" },
      { property: "og:description", content: "Fault alerts with severity, detection time and recommended actions." },
    ],
  }),
  component: Alerts,
});

const statusStyle: Record<string, string> = {
  Open: "bg-critical/10 text-critical border-critical/20",
  Acknowledged: "bg-warning/15 text-warning-foreground border-warning/30",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Resolved: "bg-healthy/10 text-healthy border-healthy/20",
};

function Alerts() {
  return (
    <>
      <PageHeader title="Alert Center" subtitle="Realtime and historical fault events" />
      <Panel padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Alert</th>
                <th className="px-5 py-3 text-left font-medium">Motor</th>
                <th className="px-5 py-3 text-left font-medium">Equipment</th>
                <th className="px-5 py-3 text-left font-medium">Location</th>
                <th className="px-5 py-3 text-left font-medium">Fault Type</th>
                <th className="px-5 py-3 text-left font-medium">Severity</th>
                <th className="px-5 py-3 text-left font-medium">Detected</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-accent/30">
                  <td className="px-5 py-3 font-mono text-xs">{a.id}</td>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium">{a.motorName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{a.motorId}</div>
                  </td>
                  <td className="px-5 py-3">{a.equipment}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.location}</td>
                  <td className="px-5 py-3">{a.faultType}</td>
                  <td className="px-5 py-3"><HealthBadge health={a.severity} /></td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{a.detectedAt}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyle[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, KpiCard } from "@/components/motoriq/primitives";
import { maintenanceTasks } from "@/lib/motoriq-data";
import { CalendarClock, Wrench, Timer, DollarSign } from "lucide-react";

export const Route = createFileRoute("/predictive-maintenance")({
  head: () => ({
    meta: [
      { title: "Predictive Maintenance — MotorIQ" },
      { name: "description", content: "Predictive work orders, remaining useful life estimates and technician scheduling." },
      { property: "og:title", content: "Predictive Maintenance — MotorIQ" },
      { property: "og:description", content: "Predictive work orders and RUL-driven maintenance planner." },
    ],
  }),
  component: PredictiveMaintenance,
});

const priorityStyle: Record<string, string> = {
  Critical: "bg-critical/10 text-critical border-critical/20",
  High: "bg-warning/15 text-warning-foreground border-warning/30",
  Medium: "bg-primary/10 text-primary border-primary/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusStyle: Record<string, string> = {
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Scheduled: "bg-accent text-accent-foreground border-border",
  "Pending Parts": "bg-warning/15 text-warning-foreground border-warning/30",
  Completed: "bg-healthy/10 text-healthy border-healthy/20",
};

function PredictiveMaintenance() {
  const open = maintenanceTasks.filter((t) => t.status !== "Completed").length;
  const upcoming = maintenanceTasks.filter((t) => t.status === "Scheduled").length;
  const nextFail = maintenanceTasks.slice().sort((a, b) => a.rulDays - b.rulDays)[0];

  return (
    <>
      <PageHeader
        title="Predictive Maintenance"
        subtitle="RUL-driven work orders across the motor fleet"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Open Tasks" value={open} icon={Wrench} tone="warning" />
        <KpiCard label="Upcoming" value={upcoming} icon={CalendarClock} />
        <KpiCard label="Next Predicted Failure" value={`${nextFail.rulDays} d`} icon={Timer} tone="critical" hint={nextFail.motorName} />
        <KpiCard label="Est. Monthly Spend" value="USD 1.9k" icon={DollarSign} />
      </div>

      <div className="mt-6">
        <Panel title="Maintenance Planner" padding="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Work Order</th>
                  <th className="px-5 py-3 text-left font-medium">Motor</th>
                  <th className="px-5 py-3 text-left font-medium">Task</th>
                  <th className="px-5 py-3 text-left font-medium">Priority</th>
                  <th className="px-5 py-3 text-left font-medium">Due</th>
                  <th className="px-5 py-3 text-left font-medium">RUL</th>
                  <th className="px-5 py-3 text-left font-medium">Technician</th>
                  <th className="px-5 py-3 text-left font-medium">Downtime</th>
                  <th className="px-5 py-3 text-left font-medium">Cost</th>
                  <th className="px-5 py-3 text-left font-medium">Parts</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenanceTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/30">
                    <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium">{t.motorName}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{t.motorId}</div>
                    </td>
                    <td className="px-5 py-3">{t.task}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityStyle[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{t.dueDate}</td>
                    <td className="px-5 py-3 tabular-nums">{t.rulDays} d</td>
                    <td className="px-5 py-3">{t.technician}</td>
                    <td className="px-5 py-3 tabular-nums">{t.estDowntime}</td>
                    <td className="px-5 py-3 tabular-nums">{t.estCost}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.parts}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyle[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

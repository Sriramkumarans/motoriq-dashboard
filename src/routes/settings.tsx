import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/motoriq/primitives";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MotorIQ" },
      { name: "description", content: "Configure thresholds, notifications and integration endpoints for MotorIQ." },
      { property: "og:title", content: "Settings — MotorIQ" },
      { property: "og:description", content: "Configure MotorIQ thresholds, integrations and notification channels." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Thresholds, notifications and integrations" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Alert Thresholds">
          <div className="space-y-4 text-sm">
            <Row label="Vibration warning" value="3.0 mm/s" />
            <Row label="Vibration critical" value="4.5 mm/s" />
            <Row label="Temperature warning" value="70 °C" />
            <Row label="Temperature critical" value="85 °C" />
            <Row label="Power factor floor" value="0.85" />
          </div>
        </Panel>
        <Panel title="Notifications">
          <div className="space-y-4 text-sm">
            <Row label="Email digest" value="Daily · 07:00" />
            <Row label="SMS on critical" value="Enabled · +94 77 xxx xxx" />
            <Row label="Slack channel" value="#reliability-ops" />
            <Row label="Escalation" value="15 min if unacknowledged" />
          </div>
        </Panel>
        <Panel title="Cloud Integration">
          <div className="space-y-4 text-sm">
            <Row label="MQTT broker" value="mqtts://gw.motoriq.io:8883" />
            <Row label="Historian" value="InfluxDB Cloud · region: ap-south" />
            <Row label="CMMS" value="SAP PM · outbound webhook" />
            <Row label="API keys" value="3 active · rotated 12 d ago" />
          </div>
        </Panel>
        <Panel title="AI Model">
          <div className="space-y-4 text-sm">
            <Row label="Active model" value="motoriq-cnn · v4.2.0" />
            <Row label="Last retrained" value="2026-07-01" />
            <Row label="Drift monitor" value="Nominal · KS 0.04" />
            <Row label="Fallback rule engine" value="Active" />
          </div>
        </Panel>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Panel, HealthBadge } from "@/components/motoriq/primitives";
import { useMotors, type Motor } from "@/lib/motoriq-data";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — MotorIQ" },
      { name: "description", content: "Live plant floor twin with motor, sensor node and edge gateway status." },
      { property: "og:title", content: "Digital Twin — MotorIQ" },
      { property: "og:description", content: "Interactive plant floor with live health indicators for every asset." },
    ],
  }),
  component: DigitalTwin,
});

function DigitalTwin() {
  const motors = useMotors();
  const navigate = useNavigate();

  const layout: Record<string, { x: number; y: number; w: number; h: number }> = {
    "M-101": { x: 40, y: 60, w: 220, h: 130 },
    "M-204": { x: 300, y: 220, w: 380, h: 90 },
    "M-311": { x: 40, y: 260, w: 220, h: 130 },
    "M-408": { x: 720, y: 60, w: 200, h: 140 },
  };

  return (
    <>
      <PageHeader
        title="Digital Twin"
        subtitle="Plant floor layout · click any asset for detailed analytics"
      />
      <Panel padding="p-0">
        <div className="relative">
          <svg viewBox="0 0 960 440" className="block w-full">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-surface-2)" />
                <stop offset="100%" stopColor="var(--color-background)" />
              </linearGradient>
            </defs>
            <rect width="960" height="440" fill="url(#floor)" />
            <rect width="960" height="440" fill="url(#grid)" />

            {/* Section labels */}
            <text x="20" y="30" fontSize="11" fill="var(--color-muted-foreground)">Water Treatment</text>
            <text x="280" y="210" fontSize="11" fill="var(--color-muted-foreground)">Bottling Line 2</text>
            <text x="20" y="240" fontSize="11" fill="var(--color-muted-foreground)">Utility Room</text>
            <text x="700" y="40" fontSize="11" fill="var(--color-muted-foreground)">Syrup Room</text>

            {/* Edge Gateway */}
            <g>
              <rect x="440" y="360" width="80" height="42" rx="6" fill="var(--color-primary)" opacity="0.1" stroke="var(--color-primary)" />
              <text x="480" y="378" textAnchor="middle" fontSize="10" fill="var(--color-primary)" fontWeight="600">EDGE</text>
              <text x="480" y="392" textAnchor="middle" fontSize="9" fill="var(--color-primary)">Gateway</text>
            </g>

            {motors.map((m) => {
              const L = layout[m.id];
              if (!L) return null;
              const color = m.health === "healthy" ? "var(--color-healthy)" : m.health === "warning" ? "var(--color-warning)" : "var(--color-critical)";
              const cx = L.x + L.w / 2;
              const cy = L.y + L.h / 2;
              return (
                <g key={m.id} onClick={() => navigate({ to: "/equipment/$id", params: { id: m.id } })} style={{ cursor: "pointer" }}>
                  {/* connection */}
                  <line x1={cx} y1={cy} x2="480" y2="381" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" className="animate-flow" />
                  {/* body */}
                  <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="10" fill="var(--color-card)" stroke={color} strokeWidth="1.5" />
                  {/* status dot */}
                  <circle cx={L.x + 14} cy={L.y + 16} r="5" fill={color} className="animate-pulse-soft" />
                  <text x={L.x + 28} y={L.y + 20} fontSize="11" fontWeight="600" fill="var(--color-foreground)">{m.name}</text>
                  <text x={L.x + 28} y={L.y + 34} fontSize="9" fill="var(--color-muted-foreground)">{m.id} · {m.equipmentType}</text>

                  {/* mini metrics */}
                  <text x={L.x + 14} y={L.y + 56} fontSize="10" fill="var(--color-muted-foreground)">Health</text>
                  <text x={L.x + L.w - 14} y={L.y + 56} fontSize="11" fontWeight="700" fill={color} textAnchor="end">{m.healthScore.toFixed(0)}</text>

                  <text x={L.x + 14} y={L.y + 72} fontSize="10" fill="var(--color-muted-foreground)">Temp</text>
                  <text x={L.x + L.w - 14} y={L.y + 72} fontSize="11" fill="var(--color-foreground)" textAnchor="end">{m.temperature.toFixed(1)} °C</text>

                  <text x={L.x + 14} y={L.y + 88} fontSize="10" fill="var(--color-muted-foreground)">Vibration</text>
                  <text x={L.x + L.w - 14} y={L.y + 88} fontSize="11" fill="var(--color-foreground)" textAnchor="end">{m.vibration.toFixed(2)} mm/s</text>

                  <text x={L.x + 14} y={L.y + 104} fontSize="10" fill="var(--color-muted-foreground)">Current</text>
                  <text x={L.x + L.w - 14} y={L.y + 104} fontSize="11" fill="var(--color-foreground)" textAnchor="end">{m.current.toFixed(1)} A</text>

                  {/* sensor node */}
                  <g>
                    <rect x={L.x + L.w - 44} y={L.y + 8} width="34" height="14" rx="3" fill={color} opacity="0.15" stroke={color} />
                    <text x={L.x + L.w - 27} y={L.y + 18} fontSize="8" textAnchor="middle" fill={color} fontWeight="600">SENSOR</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        {motors.map((m) => (
          <div key={m.id} className="card-elev p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">{m.name}</span>
              <HealthBadge health={m.health} />
            </div>
            <div className="mt-1 text-muted-foreground">
              {m.id} · Sensor node linked to Edge Gateway
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

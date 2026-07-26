import { useEffect, useState } from "react";

export type Health = "healthy" | "warning" | "critical";

export interface Motor {
  id: string;
  name: string;
  equipmentType:
    | "Centrifugal Pump"
    | "Conveyor System"
    | "Air Compressor"
    | "Industrial Mixer";
  section: string;
  running: boolean;
  health: Health;
  healthScore: number; // 0-100
  temperature: number; // °C
  vibration: number; // mm/s
  current: number; // A
  voltage: number; // V
  rpm: number;
  power: number; // kW
  powerFactor: number;
  operatingHours: number;
  ratedPower: number;
  ratedVoltage: number;
  ratedCurrent: number;
  ratedRpm: number;
  lastMaintenance: string;
  nextMaintenance: string;
  sensorOk: boolean;
  gatewayOk: boolean;
  updatedAt: number;
}

const seed: Motor[] = [
  {
    id: "M-101",
    name: "RO Feed Pump",
    equipmentType: "Centrifugal Pump",
    section: "Water Treatment",
    running: true,
    health: "healthy",
    healthScore: 92,
    temperature: 58,
    vibration: 2.1,
    current: 14.2,
    voltage: 411,
    rpm: 2955,
    power: 8.6,
    powerFactor: 0.89,
    operatingHours: 12480,
    ratedPower: 11,
    ratedVoltage: 415,
    ratedCurrent: 21,
    ratedRpm: 2960,
    lastMaintenance: "2026-05-14",
    nextMaintenance: "2026-08-14",
    sensorOk: true,
    gatewayOk: true,
    updatedAt: Date.now(),
  },
  {
    id: "M-204",
    name: "Bottling Conveyor Motor",
    equipmentType: "Conveyor System",
    section: "Bottling Line 2",
    running: true,
    health: "warning",
    healthScore: 71,
    temperature: 74,
    vibration: 4.8,
    current: 9.8,
    voltage: 408,
    rpm: 1465,
    power: 5.2,
    powerFactor: 0.84,
    operatingHours: 18630,
    ratedPower: 7.5,
    ratedVoltage: 415,
    ratedCurrent: 15,
    ratedRpm: 1470,
    lastMaintenance: "2026-03-02",
    nextMaintenance: "2026-08-02",
    sensorOk: true,
    gatewayOk: true,
    updatedAt: Date.now(),
  },
  {
    id: "M-311",
    name: "Plant Air Compressor",
    equipmentType: "Air Compressor",
    section: "Utility Room",
    running: true,
    health: "critical",
    healthScore: 46,
    temperature: 91,
    vibration: 7.6,
    current: 32.5,
    voltage: 402,
    rpm: 2870,
    power: 18.4,
    powerFactor: 0.81,
    operatingHours: 26410,
    ratedPower: 22,
    ratedVoltage: 415,
    ratedCurrent: 41,
    ratedRpm: 2950,
    lastMaintenance: "2026-01-20",
    nextMaintenance: "2026-07-30",
    sensorOk: true,
    gatewayOk: true,
    updatedAt: Date.now(),
  },
  {
    id: "M-408",
    name: "Syrup Mixer Drive",
    equipmentType: "Industrial Mixer",
    section: "Syrup Room",
    running: true,
    health: "healthy",
    healthScore: 88,
    temperature: 62,
    vibration: 2.8,
    current: 11.6,
    voltage: 414,
    rpm: 1478,
    power: 6.8,
    powerFactor: 0.87,
    operatingHours: 9820,
    ratedPower: 9,
    ratedVoltage: 415,
    ratedCurrent: 18,
    ratedRpm: 1480,
    lastMaintenance: "2026-06-10",
    nextMaintenance: "2026-09-10",
    sensorOk: true,
    gatewayOk: true,
    updatedAt: Date.now(),
  },
];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function jitter(base: number, range: number, min: number, max: number) {
  return clamp(base + (Math.random() - 0.5) * range, min, max);
}

function healthFrom(score: number): Health {
  if (score >= 80) return "healthy";
  if (score >= 60) return "warning";
  return "critical";
}

let store: Motor[] = seed.map((m) => ({ ...m }));
let listeners = new Set<() => void>();
const API ="https://oa8s63r1ta.execute-api.ap-south-1.amazonaws.com/prod/motor-data";

async function tick() {
  try {
    const response = await fetch(API);

    const data = await response.json();

    store = store.map((m) => {
      if (m.id !== "M-101") return m;

      const health =
        data.health >= 80
          ? "healthy"
          : data.health >= 60
          ? "warning"
          : "critical";

      return {
        ...m,

        temperature: data.temperature,
        vibration: data.vibration,
        current: data.current,
        voltage: data.voltage,
        rpm: data.rpm,
        power: data.power,

        healthScore: data.health,
        health,

        updatedAt: Date.now(),
      };
    });

    listeners.forEach((l) => l());
  } catch (err) {
    console.log(err);
  }
}

let timer: ReturnType<typeof setInterval> | null = null;
function ensureTicker() {
  if (typeof window === "undefined") return;
  if (timer) return;
  timer = setInterval(tick, 1500);
}

export function useMotors(): Motor[] {
  const [snap, setSnap] = useState(store);
  useEffect(() => {
    ensureTicker();
    const l = () => setSnap([...store]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snap;
}

export function useMotor(id: string): Motor | undefined {
  return useMotors().find((m) => m.id === id);
}

/** Deterministic-ish rolling trend for a metric */
export function useTrend(motorId: string, metric: keyof Motor, points = 40) {
  const [data, setData] = useState<{ t: string; v: number }[]>(() => {
    const now = Date.now();
    const m = store.find((x) => x.id === motorId);
    const base = (m?.[metric] as number) ?? 0;
    return Array.from({ length: points }, (_, i) => ({
      t: new Date(now - (points - i) * 3000).toLocaleTimeString(),
      v: Math.round((base + (Math.random() - 0.5) * base * 0.1) * 100) / 100,
    }));
  });
  useEffect(() => {
    ensureTicker();
    const l = () => {
      const m = store.find((x) => x.id === motorId);
      if (!m) return;
      setData((prev) => {
        const next = [
          ...prev.slice(1),
          {
            t: new Date().toLocaleTimeString(),
            v: m[metric] as number,
          },
        ];
        return next;
      });
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [motorId, metric]);
  return data;
}

export const plant = {
  name: "BevCo Bottling Plant — Colombo",
  line: "Production Line 2",
};

export function healthColor(h: Health) {
  return h === "healthy"
    ? "text-healthy"
    : h === "warning"
      ? "text-warning"
      : "text-critical";
}

export function healthBg(h: Health) {
  return h === "healthy"
    ? "bg-healthy/10 text-healthy border-healthy/20"
    : h === "warning"
      ? "bg-warning/15 text-warning-foreground border-warning/30"
      : "bg-critical/10 text-critical border-critical/20";
}

export interface AlertRow {
  id: string;
  motorId: string;
  motorName: string;
  equipment: string;
  location: string;
  faultType: string;
  severity: Health;
  detectedAt: string;
  status: "Open" | "Acknowledged" | "In Progress" | "Resolved";
  action: string;
}

export const alerts: AlertRow[] = [
  {
    id: "AL-9021",
    motorId: "M-311",
    motorName: "Plant Air Compressor",
    equipment: "Air Compressor",
    location: "Utility Room",
    faultType: "Bearing Wear (Outer Race)",
    severity: "critical",
    detectedAt: "2026-07-24 08:12",
    status: "In Progress",
    action: "Schedule bearing replacement within 72 hours",
  },
  {
    id: "AL-9019",
    motorId: "M-311",
    motorName: "Plant Air Compressor",
    equipment: "Air Compressor",
    location: "Utility Room",
    faultType: "Overheating",
    severity: "critical",
    detectedAt: "2026-07-24 06:44",
    status: "Acknowledged",
    action: "Inspect cooling fan and clean intake filter",
  },
  {
    id: "AL-9008",
    motorId: "M-204",
    motorName: "Bottling Conveyor Motor",
    equipment: "Conveyor System",
    location: "Bottling Line 2",
    faultType: "Shaft Misalignment",
    severity: "warning",
    detectedAt: "2026-07-23 22:07",
    status: "Open",
    action: "Verify coupling alignment during next stop",
  },
  {
    id: "AL-8994",
    motorId: "M-204",
    motorName: "Bottling Conveyor Motor",
    equipment: "Conveyor System",
    location: "Bottling Line 2",
    faultType: "Rising Vibration Trend",
    severity: "warning",
    detectedAt: "2026-07-23 15:31",
    status: "Open",
    action: "Increase sampling rate; monitor for 24h",
  },
  {
    id: "AL-8971",
    motorId: "M-101",
    motorName: "RO Feed Pump",
    equipment: "Centrifugal Pump",
    location: "Water Treatment",
    faultType: "Voltage Imbalance (minor)",
    severity: "healthy",
    detectedAt: "2026-07-22 09:18",
    status: "Resolved",
    action: "Cleared after transformer tap adjustment",
  },
];

export interface MaintenanceTask {
  id: string;
  motorId: string;
  motorName: string;
  task: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
  technician: string;
  estDowntime: string;
  estCost: string;
  parts: string;
  status: "Scheduled" | "In Progress" | "Pending Parts" | "Completed";
  rulDays: number;
}

export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "WO-4412",
    motorId: "M-311",
    motorName: "Plant Air Compressor",
    task: "Replace drive-end bearing (6314-C3)",
    priority: "Critical",
    dueDate: "2026-07-27",
    technician: "N. Perera",
    estDowntime: "4 h",
    estCost: "USD 1,240",
    parts: "6314-C3 bearing, grease, gasket kit",
    status: "In Progress",
    rulDays: 9,
  },
  {
    id: "WO-4408",
    motorId: "M-204",
    motorName: "Bottling Conveyor Motor",
    task: "Laser align coupling; retorque baseplate",
    priority: "High",
    dueDate: "2026-08-02",
    technician: "S. Fernando",
    estDowntime: "2 h",
    estCost: "USD 420",
    parts: "Alignment shims (0.05 mm)",
    status: "Scheduled",
    rulDays: 28,
  },
  {
    id: "WO-4405",
    motorId: "M-101",
    motorName: "RO Feed Pump",
    task: "Quarterly vibration survey & re-greasing",
    priority: "Medium",
    dueDate: "2026-08-14",
    technician: "K. Silva",
    estDowntime: "1 h",
    estCost: "USD 180",
    parts: "SKF LGWM 2 grease",
    status: "Scheduled",
    rulDays: 62,
  },
  {
    id: "WO-4401",
    motorId: "M-408",
    motorName: "Syrup Mixer Drive",
    task: "Insulation resistance test (IR/PI)",
    priority: "Low",
    dueDate: "2026-09-10",
    technician: "R. Jayasuriya",
    estDowntime: "0.5 h",
    estCost: "USD 90",
    parts: "—",
    status: "Scheduled",
    rulDays: 118,
  },
];

export const aiInsights = [
  {
    tone: "critical" as Health,
    title: "Bearing failure predicted — Air Compressor (M-311)",
    body:
      "High-frequency vibration signature at 3.2× line frequency indicates outer-race bearing wear. Estimated failure in 9 days.",
  },
  {
    tone: "warning" as Health,
    title: "Vibration trend rising — Conveyor Motor (M-204)",
    body:
      "Overall vibration up 12% over 24 h. Likely coupling misalignment. Schedule laser alignment at next planned stop.",
  },
  {
    tone: "warning" as Health,
    title: "Efficiency drop — Air Compressor (M-311)",
    body: "Motor efficiency reduced by 6% versus baseline; power factor drifting to 0.81.",
  },
  {
    tone: "healthy" as Health,
    title: "Estimated downtime avoided",
    body:
      "Predictive actions this month prevented ~14 h of unplanned downtime, saving an estimated USD 8,600.",
  },
];

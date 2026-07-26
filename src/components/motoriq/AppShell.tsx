import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Factory,
  Cpu,
  Activity,
  LineChart,
  Brain,
  Wrench,
  Bell,
  Boxes,
  Network,
  Settings,
  Search,
  ChevronRight,
  Waves,
  Radio,
  Cloud,
  CircleUser,
} from "lucide-react";
import type { ReactNode } from "react";
import { plant } from "@/lib/motoriq-data";
import { useEffect, useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/plant-overview", label: "Plant Overview", icon: Factory },
  { to: "/equipment", label: "Equipment", icon: Cpu },
  { to: "/live-monitoring", label: "Live Monitoring", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/ai-diagnostics", label: "AI Diagnostics", icon: Brain },
  { to: "/predictive-maintenance", label: "Predictive Maintenance", icon: Wrench },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/digital-twin", label: "Digital Twin", icon: Boxes },
  { to: "/system-architecture", label: "System Architecture", icon: Network },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return now;
}

function MotorIQLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Waves className="h-5 w-5" />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">MotorIQ</div>
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Motor Health Platform
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  ok,
  icon: Icon,
}: {
  label: string;
  ok: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs md:inline-flex">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`status-dot animate-pulse-soft ${ok ? "text-healthy" : "text-critical"}`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span className={ok ? "text-healthy" : "text-critical"}>
        {ok ? "Online" : "Down"}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useNow();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <MotorIQLogo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-accent/50 p-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-accent-foreground">
              <span className="status-dot text-healthy animate-pulse-soft" style={{ backgroundColor: "currentColor" }} />
              Live Simulation Active
            </div>
            <p className="mt-1 text-muted-foreground">
              Streaming edge inference @ 1.5 s cadence
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border lg:hidden"
              aria-label="Toggle sidebar"
            >
              <span className="i-lucide-menu">≡</span>
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{plant.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {plant.line} · Non-Alcoholic Beverage Manufacturing
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs md:inline-flex">
                <span className="text-muted-foreground">Local time</span>
                <span className="font-mono tabular-nums">
                  {now.toLocaleTimeString()}
                </span>
              </div>
              <StatusPill label="Gateway" ok={true} icon={Radio} />
              <StatusPill label="Cloud" ok={true} icon={Cloud} />
              <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs lg:inline-flex">
                <span className="text-muted-foreground">Last sync</span>
                <span className="font-mono tabular-nums text-foreground">
                  {new Date(now.getTime() - 4000).toLocaleTimeString()}
                </span>
              </div>
              <button className="relative grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-accent">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-critical text-[10px] font-semibold text-critical-foreground">
                  4
                </span>
              </button>
              <button className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  RA
                </span>
                <span className="hidden text-xs sm:block">
                  <span className="block font-medium leading-tight">Reliability Ops</span>
                  <span className="block text-muted-foreground leading-tight">
                    Plant Engineer
                  </span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-border bg-background px-6 py-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-medium text-foreground">
              MotorIQ — Intelligent Predictive Maintenance Platform
            </span>
            <span>Version 2.4.1</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="status-dot text-healthy" style={{ backgroundColor: "currentColor" }} />
              Cloud Connected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="status-dot text-healthy" style={{ backgroundColor: "currentColor" }} />
              Gateway Connected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="status-dot text-healthy animate-pulse-soft" style={{ backgroundColor: "currentColor" }} />
              Live Simulation Active
            </span>
            <span className="ml-auto">© 2026 MotorIQ Systems</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

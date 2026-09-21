import React from "react";
import {
  LayoutDashboard,
  Radio,
  TrendingUp,
  FilePenLine,
  CloudSun,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange, pendingCount }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "signals", label: "15-Signal Fabric", icon: Radio },
    { id: "analysis", label: "Production & Estimator", icon: TrendingUp },
    { id: "capture", label: "Field Capture", icon: FilePenLine, badge: pendingCount > 0 ? pendingCount : null },
    { id: "weather", label: "Live Telemetry", icon: CloudSun },
    { id: "advisor", label: "AI Advisor", icon: Sparkles, highlight: true },
    { id: "governance", label: "Governance", icon: ShieldAlert },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-stone-800 text-white shadow-sm ring-1 ring-stone-700"
                    : tab.highlight
                    ? "text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                    : "text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-emerald-400"
                      : tab.highlight
                      ? "text-emerald-400"
                      : "text-stone-500"
                  }`}
                />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    {tab.badge}
                  </span>
                )}

                {tab.highlight && !isActive && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

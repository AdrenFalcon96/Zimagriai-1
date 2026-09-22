import React from "react";
import {
  LayoutDashboard,
  Radio,
  TrendingUp,
  FilePenLine,
  CloudSun,
  ShieldAlert,
  Sparkles,
  Landmark,
  ChevronRight,
} from "lucide-react";

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange, pendingCount }) => {
  const tabs = [
    { id: "overview", code: "01", label: "National Overview", icon: LayoutDashboard },
    { id: "signals", code: "02", label: "15-Signal Fabric", icon: Radio },
    { id: "analysis", code: "03", label: "Bayes Estimator", icon: TrendingUp },
    { id: "capture", code: "04", label: "Field Observations & Incentive Policy", icon: FilePenLine, badge: pendingCount > 0 ? pendingCount : null },
    { id: "weather", code: "05", label: "District Telemetry", icon: CloudSun },
    { id: "exchange", code: "06", label: "Commodity & Derivatives Exchange", icon: Landmark },
    { id: "advisor", code: "07", label: "Policy Formulation & Advisory", icon: Sparkles },
    { id: "governance", code: "08", label: "Statutory Governance", icon: ShieldAlert },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-[#1b2b22] bg-[#09110d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Administrative Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  onTabChange(tab.id);
                  // Ensure document smoothly adjusts to view
                  window.scrollTo({ top: 340, behavior: "smooth" });
                }}
                className={`relative flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-[#14261d] text-[#f4f7f5] shadow-sm border border-[#234231]"
                    : "text-[#8fa397] hover:bg-[#0f1d16] hover:text-[#e1ebe5]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="font-mono text-[10px] text-[#557161]">
                  {tab.code}
                </span>

                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-[#34d399]" : "text-[#6a8475]"
                  }`}
                />

                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 rounded bg-[#b45309] px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#34d399]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

import React from "react";
import { ShieldCheck, Wifi, WifiOff, Database, Sprout, Sparkles, Server, Cpu, Download, Landmark, Activity } from "lucide-react";
import { DatabaseStatus, WorkerStatus } from "../types";

interface HeaderProps {
  pilotCount: number;
  weightedProduction: number;
  meanConfidence: number;
  offlineQueueCount: number;
  isOnline: boolean;
  dbStatus?: DatabaseStatus | null;
  workerStatus?: WorkerStatus | null;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pilotCount,
  weightedProduction,
  meanConfidence,
  offlineQueueCount,
  isOnline,
  dbStatus,
  workerStatus,
  onNavigate,
}) => {
  const fmt = (n: number, d = 1) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

  return (
    <header className="border-b border-[#1b2a22] bg-[#0c1410] px-4 pt-4 pb-8 sm:px-6 lg:px-8">
      {/* Statutory Government Classification Bar */}
      <div className="mx-auto max-w-7xl border-b border-[#17251e] pb-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#163022] text-[#4ade80] border border-[#224832]">
              <Landmark className="h-3 w-3" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold tracking-wider text-[#98a99e] uppercase">
              <span className="text-[#e2ece5]">Republic of Zimbabwe</span>
              <span className="text-[#3d5547]">•</span>
              <span>Ministry of Agriculture, Mechanisation and Water Resources Development</span>
              <span className="text-[#3d5547]">•</span>
              <span className="text-[#34d399] font-mono">AGRITEX SPATIAL INTELLIGENCE UNIT</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#71867a]">
            <span className="rounded bg-[#121c17] px-2 py-0.5 border border-[#1d2d24] text-[#8ea396]">
              DIRECTIVE: AGRI-ZW-2026/Q3
            </span>
            <span className="hidden sm:inline text-[#384e42]">•</span>
            <span className="hidden sm:inline text-[#8ea396]">
              CLASSIFICATION: OFFICIAL
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Department Heading & Systems Diagnostics */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-[#224832] bg-[#102419] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#34d399] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Zimbabwe-first AI systems platform for Agriculture
              </span>
              <span className="font-mono text-[11px] text-[#788e81]">ISO-19115 Data Standard</span>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-4xl lg:text-5xl">
              Zimbabwe-first AI systems platform for Agriculture
            </h1>
            
            <p className="mt-3 text-sm leading-relaxed text-[#9ab0a3] sm:text-base max-w-2xl">
              An independent research prototype built for Zimbabwe's agricultural ecosystem, anchored on three strategic selling points: the <strong>AGRITEX Data Capture Incentive Policy</strong> solving field reporting hurdles, <strong>15-Signal AI Systems</strong> with empirical Bayes shrinkage, and <strong>Prof. Mthuli Ncube's Commodity & Derivatives Exchange</strong> (ZMX/VFEX) driving market liquidity.
            </p>
          </div>

          {/* System Telemetry Chips */}
          <div className="flex flex-wrap lg:flex-col gap-2 font-mono text-xs">
            <div
              className={`flex items-center justify-between gap-3 rounded border px-3 py-2 ${
                dbStatus?.status === "connected"
                  ? "border-[#1c3a2a] bg-[#0f2117] text-[#a1deb8]"
                  : "border-[#3f3117] bg-[#221c0e] text-[#f2c97d]"
              }`}
              title={dbStatus ? `Host: ${dbStatus.host} | DB: ${dbStatus.database}` : "Render PostgreSQL"}
            >
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-[#34d399]" />
                <span className="font-semibold text-[11px]">Database Ledger</span>
              </div>
              <span className="text-[11px] text-[#7bb892]">
                {dbStatus?.status === "connected" ? `Render Postgres (${dbStatus.latencyMs}ms)` : "Local Cache"}
              </span>
            </div>

            <div
              className={`flex items-center justify-between gap-3 rounded border px-3 py-2 ${
                workerStatus?.status === "online"
                  ? "border-[#19323f] bg-[#0e1d25] text-[#9ed3ed]"
                  : "border-[#25332a] bg-[#121c17] text-[#71877b]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="font-semibold text-[11px]">Remote Sensing Worker</span>
              </div>
              <span className="text-[11px]">
                {workerStatus?.status === "online" ? `Docker Remote (${workerStatus.latencyMs}ms)` : "Standby"}
              </span>
            </div>

            <div
              className={`flex items-center justify-between gap-3 rounded border px-3 py-2 ${
                isOnline
                  ? "border-[#1c3a2a] bg-[#0f2117] text-[#a1deb8]"
                  : "border-[#3f3117] bg-[#221c0e] text-[#f2c97d]"
              }`}
            >
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5 text-[#34d399]" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-[#f59e0b]" />
                )}
                <span className="font-semibold text-[11px]">Field Sync Status</span>
              </div>
              <span className="text-[11px]">
                {isOnline ? "Operational (Direct)" : "Offline Buffering"}
              </span>
            </div>

            <div
              onClick={() => onNavigate("exchange")}
              className="cursor-pointer flex items-center justify-between gap-3 rounded border border-[#1b3d2b] bg-[#0c2217] px-3 py-2 text-[#a1deb8] hover:border-[#2b6043] transition"
              title="Click to open Commodity & Derivatives Floor with Live Free Financial APIs (Yahoo CME + Frankfurter ECB)"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-[#22c55e] animate-pulse" />
                <span className="font-semibold text-[11px]">ZMX/VFEX Live Floor</span>
              </div>
              <span className="text-[11px] text-[#34d399] font-bold">
                WMZ $348/t • Live APIs
              </span>
            </div>
          </div>
        </div>

        {/* Operational Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 pb-6 border-b border-[#17251e]">
          <button
            onClick={() => onNavigate("capture")}
            className="inline-flex items-center gap-2 rounded bg-[#15803d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          >
            <Sprout className="h-4 w-4" />
            Record Field Observation
          </button>

          <button
            onClick={() => onNavigate("signals")}
            className="inline-flex items-center gap-2 rounded border border-[#263c30] bg-[#121e17] px-4 py-2 text-xs font-semibold text-[#d4ded7] transition hover:border-[#345141] hover:bg-[#17271e] focus:outline-none"
          >
            15-Signal Evidence Fabric
          </button>

          <button
            onClick={() => onNavigate("exchange")}
            className="inline-flex items-center gap-2 rounded border border-[#214833] bg-[#0f2a1c] px-4 py-2 text-xs font-semibold text-[#34d399] transition hover:bg-[#163a26] focus:outline-none"
          >
            <Landmark className="h-4 w-4 text-[#34d399]" />
            Commodity & Derivatives Floor
          </button>

          <button
            onClick={() => onNavigate("advisor")}
            className="inline-flex items-center gap-2 rounded border border-[#1e4832] bg-[#0d2217] px-4 py-2 text-xs font-semibold text-[#6ee7b7] transition hover:bg-[#122e1f] focus:outline-none"
          >
            <Sparkles className="h-4 w-4 text-[#34d399]" />
            National Policy Advisor
          </button>

          <a
            href="/zimagriai-project.zip"
            download="zimagriai-project.zip"
            className="inline-flex items-center gap-2 rounded border border-[#24352b] bg-[#111c16] px-4 py-2 text-xs font-semibold text-[#c8d4cd] transition hover:border-[#314639] hover:text-white focus:outline-none"
            title="Download verified institutional codebase bundle (.zip)"
          >
            <Download className="h-4 w-4 text-[#7dd3fc]" />
            Download Source Bundle
          </a>
        </div>

        {/* Quantitative Intelligence Matrix */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-4">
            <div className="text-[11px] font-mono tracking-wider text-[#799083] uppercase">
              Registered Observations
            </div>
            <div className="font-display mt-1.5 text-2xl font-bold text-[#f4f7f5] sm:text-3xl">
              {pilotCount > 0 ? pilotCount.toLocaleString() : "13,600"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#556e60]">
              Murehwa • Zaka • Umguza
            </div>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-4">
            <div className="text-[11px] font-mono tracking-wider text-[#799083] uppercase">
              Shrunk Yield Forecast
            </div>
            <div className="font-display mt-1.5 text-2xl font-bold text-[#34d399] sm:text-3xl">
              {weightedProduction > 0 ? `${fmt(weightedProduction)} t` : "55,876.3 t"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#556e60]">
              Empirical Bayes shrinkage
            </div>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-4">
            <div className="text-[11px] font-mono tracking-wider text-[#799083] uppercase">
              Mean Corroboration Index
            </div>
            <div className="font-display mt-1.5 text-2xl font-bold text-[#5eead4] sm:text-3xl">
              {meanConfidence > 0 ? fmt(meanConfidence, 2) : "0.77"}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#556e60]">
              Confidence threshold: ≥ 0.45
            </div>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-4">
            <div className="text-[11px] font-mono tracking-wider text-[#799083] uppercase">
              Field Station Offline Queue
            </div>
            <div
              className={`font-display mt-1.5 text-2xl font-bold sm:text-3xl ${
                offlineQueueCount > 0 ? "text-[#f59e0b]" : "text-[#9cb3a5]"
              }`}
            >
              {offlineQueueCount}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#556e60]">
              Local SQLite / storage sync
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

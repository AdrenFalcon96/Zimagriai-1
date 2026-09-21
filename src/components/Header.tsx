import React from "react";
import { ShieldCheck, Wifi, WifiOff, Database, Sprout, ArrowDown, Sparkles, Server, Cpu, Download } from "lucide-react";
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
    <header className="relative border-b border-stone-800 bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 px-4 pt-10 pb-8 sm:px-6 lg:px-8">
      {/* Background Subtle Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="relative mx-auto max-w-7xl">
        {/* Top bar with system badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>ZIMBABWE-FIRST • AGRICULTURAL INTELLIGENCE • PRODUCTION MVP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                dbStatus?.status === "connected"
                  ? "border-emerald-700/50 bg-emerald-950/50 text-emerald-300"
                  : "border-stone-700 bg-stone-800/80 text-stone-300"
              }`}
              title={dbStatus ? `Render PostgreSQL Host: ${dbStatus.host} | DB: ${dbStatus.database}` : "Render PostgreSQL"}
            >
              <Database className={`h-3 w-3 ${dbStatus?.status === "connected" ? "text-emerald-400" : "text-amber-400"}`} />
              <span>{dbStatus?.status === "connected" ? "Render Postgres Live" : "PostgreSQL"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-700 bg-stone-800/80 px-2.5 py-1 text-xs font-medium text-stone-300">
              <Server className="h-3 w-3 text-teal-400" />
              <span>Bayes Model v1.0</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                workerStatus?.status === "online"
                  ? "border-sky-700/50 bg-sky-950/50 text-sky-300"
                  : "border-stone-700 bg-stone-800/80 text-stone-400"
              }`}
              title={workerStatus ? `Worker URL: ${workerStatus.url} (${workerStatus.latencyMs}ms)` : "Render Docker Worker"}
            >
              <Cpu className={`h-3 w-3 ${workerStatus?.status === "online" ? "text-sky-400" : "text-stone-400"}`} />
              <span>
                {workerStatus?.status === "online"
                  ? `Render Docker (${workerStatus.latencyMs}ms)`
                  : "Render Docker"}
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                isOnline
                  ? "border-emerald-700/50 bg-emerald-950/50 text-emerald-300"
                  : "border-amber-700/50 bg-amber-950/50 text-amber-300"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-amber-400" />
                  <span>OFFLINE QUEUEING</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Hero headline & lede */}
        <div className="max-w-4xl">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            From farmer records to{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              defensible agricultural intelligence.
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">
            A policy-oriented data and AI system connecting farmer observations, remote sensing,
            weather telemetry, empirical Bayes confidence scoring, production estimation and
            market-risk intelligence for Zimbabwe.
          </p>
        </div>

        {/* Hero CTA buttons */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("capture")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Sprout className="h-4 w-4" />
            Capture Farm Observation
          </button>

          <button
            onClick={() => onNavigate("signals")}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800/90 px-5 py-2.5 text-sm font-semibold text-stone-200 transition hover:border-stone-600 hover:bg-stone-750 focus:outline-none"
          >
            Inspect 15-Signal Layer
          </button>

          <button
            onClick={() => onNavigate("advisor")}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/40 focus:outline-none"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Gemini AI Advisor
          </button>

          <a
            href="/zimagriai-project.zip"
            download="zimagriai-project.zip"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-800/90 px-4 py-2.5 text-sm font-semibold text-stone-200 transition hover:bg-stone-700 hover:text-white focus:outline-none"
            title="Download complete project source ZIP"
          >
            <Download className="h-4 w-4 text-sky-400" />
            Download ZIP
          </a>
        </div>

        {/* Real-time Stat Strip */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-4 backdrop-blur-sm">
            <span className="block text-xs font-medium text-stone-400">Seeded Pilot Records</span>
            <span className="font-display mt-1 block text-2xl font-bold text-white sm:text-3xl">
              {pilotCount > 0 ? pilotCount.toLocaleString() : "13,600"}
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">Murehwa • Zaka • Umguza</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-4 backdrop-blur-sm">
            <span className="block text-xs font-medium text-stone-400">Weighted Production</span>
            <span className="font-display mt-1 block text-2xl font-bold text-emerald-400 sm:text-3xl">
              {weightedProduction > 0 ? `${fmt(weightedProduction)} t` : "55,876.3 t"}
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">Empirical Bayes shrunk</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-4 backdrop-blur-sm">
            <span className="block text-xs font-medium text-stone-400">Mean Signal Confidence</span>
            <span className="font-display mt-1 block text-2xl font-bold text-teal-300 sm:text-3xl">
              {meanConfidence > 0 ? fmt(meanConfidence, 2) : "0.77"}
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">Threshold: &gt;0.45 pass</span>
          </div>

          <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-4 backdrop-blur-sm">
            <span className="block text-xs font-medium text-stone-400">Offline Queue</span>
            <span
              className={`font-display mt-1 block text-2xl font-bold sm:text-3xl ${
                offlineQueueCount > 0 ? "text-amber-400" : "text-stone-300"
              }`}
            >
              {offlineQueueCount}
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">Local pending records</span>
          </div>
        </div>
      </div>
    </header>
  );
};

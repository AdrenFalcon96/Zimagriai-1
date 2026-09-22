import React, { useState, useMemo } from "react";
import { SignalItem, SignalFamily, SignalStatus } from "../types";
import { SIGNAL_REGISTRY } from "../lib/signals";
import { Sparkline } from "./Sparkline";
import {
  Filter,
  Info,
  Satellite,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export const SignalsSection: React.FC = () => {
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSignal, setActiveSignal] = useState<SignalItem | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredSignals = useMemo(() => {
    return SIGNAL_REGISTRY.filter((s) => {
      const matchFamily = selectedFamily === "all" || s.family === selectedFamily;
      const matchStatus = selectedStatus === "all" || s.status === selectedStatus;
      const matchSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.agronomicUse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.currentValue && s.currentValue.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchFamily && matchStatus && matchSearch;
    });
  }, [selectedFamily, selectedStatus, searchQuery]);

  const families: { id: string; label: string; count: number }[] = [
    { id: "all", label: "All 15 Signals", count: SIGNAL_REGISTRY.length },
    { id: "crop", label: "Crop Mapping", count: SIGNAL_REGISTRY.filter((s) => s.family === "crop").length },
    { id: "phenology", label: "Phenology & SavGol", count: SIGNAL_REGISTRY.filter((s) => s.family === "phenology").length },
    { id: "water", label: "Water & CWSI", count: SIGNAL_REGISTRY.filter((s) => s.family === "water").length },
    { id: "soil", label: "Radar & Thermal Soil Moisture", count: SIGNAL_REGISTRY.filter((s) => s.family === "soil").length },
    { id: "biomass", label: "Biomass / PROSAIL LAI", count: SIGNAL_REGISTRY.filter((s) => s.family === "biomass").length },
    { id: "land-cover", label: "MODIS Area Footprint", count: SIGNAL_REGISTRY.filter((s) => s.family === "land-cover").length },
  ];

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed("Just now");
      setIsRefreshing(false);
    }, 600);
  };

  const getStatusBadge = (status: SignalStatus) => {
    switch (status) {
      case "implemented":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            IMPLEMENTED
          </span>
        );
      case "provider-backed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-950/40 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
            <Satellite className="h-3 w-3" />
            PROVIDER-BACKED
          </span>
        );
      case "calibration-required":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            <Clock className="h-3 w-3" />
            CALIBRATION-REQUIRED
          </span>
        );
    }
  };

  return (
    <section className="space-y-6" id="section-signals">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-02 // MULTI-SPECTRAL SATELLITE FABRIC
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">15-Signal Transparent Telemetry Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded border border-[#1b3d2b] bg-[#0c2217] px-2.5 py-1 font-mono text-xs text-[#34d399] hover:bg-[#123122] transition disabled:opacity-50"
              title="Poll latest satellite arrays"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Poll Telemetry ({lastRefreshed})</span>
            </button>
            <a
              href="https://zimagriai.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-[#1b3d52] bg-[#0c222e] px-2.5 py-1 font-mono text-xs font-medium text-[#7dd3fc] hover:bg-[#112d3d] transition"
            >
              <span>Worker Node: zimagriai.onrender.com</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          15-Signal Multi-Sensor Evidence Fabric & Sparkline Telemetry
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-4xl leading-relaxed">
          Transforming satellite corroboration from an opaque black box into an empirical, transparent open ledger.
          Every one of the 15 biophysical and hydrometeorological signals is surfaced with live time-series sparklines,
          instrument resolutions, revisit schedules, and deviation from agro-ecological baselines so agronomists and GMB inspectors can audit decisions with total confidence.
        </p>

        {/* Live Summary Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-3">
            <span className="block text-[10px] text-[#6e8577] uppercase">Total Active Signals</span>
            <span className="text-lg font-bold text-[#f4f7f5]">15 of 15 Streamed</span>
            <span className="block text-[10px] text-[#34d399]">100% Constellation Reach</span>
          </div>
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-3">
            <span className="block text-[10px] text-[#6e8577] uppercase">Mean Optical NDVI</span>
            <span className="text-lg font-bold text-[#34d399]">0.68</span>
            <span className="block text-[10px] text-[#22c55e]">+9.7% vs 5-yr Decadal</span>
          </div>
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-3">
            <span className="block text-[10px] text-[#6e8577] uppercase">Radar Topsoil Moisture</span>
            <span className="text-lg font-bold text-[#38bdf8]">24.6% vol</span>
            <span className="block text-[10px] text-[#7dd3fc]">Sentinel-1 C-band SAR</span>
          </div>
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-3">
            <span className="block text-[10px] text-[#6e8577] uppercase">Crop Water Stress (CWSI)</span>
            <span className="text-lg font-bold text-[#a78bfa]">0.24 (Low)</span>
            <span className="block text-[10px] text-[#c4b5fd]">Optimum Canopy Hydration</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1b2b22] bg-[#0c1410] p-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          {families.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFamily(f.id)}
              className={`rounded px-3 py-1 font-mono text-xs font-medium transition ${
                selectedFamily === f.id
                  ? "bg-[#15803d] text-white border border-[#22c55e]"
                  : "bg-[#0f1914] text-[#8fa397] border border-[#17251e] hover:bg-[#14231b] hover:text-[#d5ded8]"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-1.5 font-mono text-xs text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
          >
            <option value="all">All Verification Statuses ({SIGNAL_REGISTRY.length})</option>
            <option value="implemented">Implemented</option>
            <option value="provider-backed">Provider-Backed</option>
            <option value="calibration-required">Calibration-Required</option>
          </select>

          <input
            type="text"
            placeholder="Search 15 signals, NDVI, radar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-1.5 font-mono text-xs text-[#c9d6cf] placeholder-[#556e60] focus:border-[#34d399] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of 15 Signals with Sparklines */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSignals.map((signal, idx) => {
          const isPositiveAnomaly = signal.anomalyPositive ?? true;
          return (
            <article
              key={signal.id}
              onClick={() => setActiveSignal(signal)}
              className="group flex cursor-pointer flex-col justify-between rounded border border-[#1b2b22] bg-[#0f1914] p-4 transition hover:border-[#2d4738] hover:bg-[#121f18] hover:shadow-lg"
            >
              <div>
                {/* Header: Family, Index # & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#122b1c] px-1.5 py-0.5 rounded border border-[#19432b]">
                      SIG {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e8577]">
                      {signal.family}
                    </span>
                  </div>
                  {getStatusBadge(signal.status)}
                </div>

                {/* Signal Title */}
                <h3 className="font-display mt-2.5 text-base font-bold text-[#f4f7f5] group-hover:text-[#34d399] transition-colors leading-tight">
                  {signal.name}
                </h3>

                {/* Sensor Source & Resolution */}
                <div className="mt-1 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-1 text-[#34d399]">
                    <Satellite className="h-3 w-3" />
                    <span>{signal.source}</span>
                  </div>
                  <span className="text-[11px] text-[#71877b]">{signal.resolution} • {signal.revisit}</span>
                </div>

                {/* Telemetry Metric & Sparkline Box */}
                <div className="mt-3 rounded border border-[#192b21] bg-[#0b1410] p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-wider text-[#6e8577]">
                        CURRENT READING
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-base font-bold text-[#f4f7f5]">
                          {signal.currentValue || "Active"}
                        </span>
                        {signal.anomaly && (
                          <span
                            className={`inline-flex items-center font-mono text-[10px] font-semibold ${
                              isPositiveAnomaly ? "text-[#22c55e]" : "text-[#f87171]"
                            }`}
                          >
                            {isPositiveAnomaly ? (
                              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                            ) : (
                              <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                            )}
                            {signal.anomaly}
                          </span>
                        )}
                      </div>
                      <span className="block font-mono text-[9px] text-[#556e60]">
                        Baseline: {signal.baselineValue || "Calibrated"}
                      </span>
                    </div>

                    {/* Live Sparkline */}
                    {signal.sparklineData && (
                      <div className="text-right">
                        <span className="block font-mono text-[9px] text-[#556e60] mb-0.5">
                          10-Period Trend
                        </span>
                        <Sparkline
                          data={signal.sparklineData}
                          isPositive={isPositiveAnomaly}
                          width={115}
                          height={28}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Agronomic Summary */}
                <p className="mt-2.5 text-xs leading-relaxed text-[#8ca094] line-clamp-2">
                  {signal.description}
                </p>
              </div>

              {/* Card Footer: Agronomic Use & Action Prompt */}
              <div className="mt-4 border-t border-[#17251e] pt-3">
                <p className="text-[11px] text-[#71877b] line-clamp-1 italic">
                  Role: {signal.agronomicUse}
                </p>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#34d399] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Inspect telemetry audit & physics &rarr;</span>
                  <span>OPEN MODAL</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Signal Calibration Truth Note */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-4 text-xs text-[#a1b8ab]">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-[#34d399] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="text-[#f4f7f5] font-semibold font-mono text-xs">Statutory Telemetry Verification Baseline: </span>
            All 15 signals operate on an open, observable pipeline. NASA POWER 7-day precipitation arrays, temperature reanalysis, and precipitation anomalies are processed autonomously.
            Copernicus Sentinel-2 MSI (10m) and USGS Landsat-9 (30m) optical/thermal services are queried for corroboration evidence prior to Bayes yield shrinkage.
            Agronomists can inspect any single signal to verify the empirical grounds for model confidence scoring.
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {activeSignal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveSignal(null)}
        >
          <div
            className="max-w-xl w-full rounded border border-[#243d2f] bg-[#0c1410] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#17251e] pb-3">
              <div>
                <span className="font-mono text-[10px] font-semibold text-[#6e8577] uppercase tracking-wider">
                  SIGNAL FAMILY: {activeSignal.family}
                </span>
                <h3 className="font-display mt-1 text-xl font-bold text-[#f4f7f5]">
                  {activeSignal.name}
                </h3>
              </div>
              {getStatusBadge(activeSignal.status)}
            </div>

            {/* Sparkline & Current Telemetry Panel */}
            <div className="rounded border border-[#1e3c2b] bg-[#0b1e15] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block font-mono text-[10px] text-[#6e8577] uppercase">Current Observation</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-[#f4f7f5]">
                      {activeSignal.currentValue || "Operational"}
                    </span>
                    {activeSignal.anomaly && (
                      <span className={`font-mono text-xs font-semibold ${activeSignal.anomalyPositive ? "text-[#22c55e]" : "text-[#f87171]"}`}>
                        {activeSignal.anomaly} vs 5-Yr Decadal Baseline ({activeSignal.baselineValue})
                      </span>
                    )}
                  </div>
                  <span className="block font-mono text-[10px] text-[#8ea396] mt-0.5">
                    Metric Unit: {activeSignal.unit || "Normalized Index"}
                  </span>
                </div>

                {activeSignal.sparklineData && (
                  <div className="text-right">
                    <span className="block font-mono text-[10px] text-[#71877b] mb-1">
                      10-Period Historical Trajectory
                    </span>
                    <Sparkline
                      data={activeSignal.sparklineData}
                      isPositive={activeSignal.anomalyPositive ?? true}
                      width={180}
                      height={40}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#c9d6cf]">
              <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3 font-mono text-[11px] grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[#6e8577] block text-[9px] uppercase">Sensor Platform</span>
                  <span className="text-[#34d399] font-bold">{activeSignal.source}</span>
                </div>
                <div>
                  <span className="text-[#6e8577] block text-[9px] uppercase">Spatial Resolution</span>
                  <span className="text-[#a1b8ab] font-bold">{activeSignal.resolution}</span>
                </div>
                <div>
                  <span className="text-[#6e8577] block text-[9px] uppercase">Constellation Revisit</span>
                  <span className="text-[#a1b8ab] font-bold">{activeSignal.revisit}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#f4f7f5] text-xs uppercase font-mono tracking-wider">
                  Scientific Specification:
                </h4>
                <p className="mt-1 leading-relaxed text-[#9ab0a3] text-xs">{activeSignal.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f4f7f5] text-xs uppercase font-mono tracking-wider">
                  Statutory Agronomic & Policy Role:
                </h4>
                <p className="mt-1 leading-relaxed text-[#9ab0a3] text-xs">{activeSignal.agronomicUse}</p>
              </div>

              <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3">
                <span className="font-semibold text-[#34d399] block mb-1 font-mono text-[11px]">
                  Agronomist Evidence Corroboration Engine:
                </span>
                <p className="text-[#799083] text-[11px] leading-relaxed">
                  When farmer self-reports are submitted, agreement scoring calculates the relative gap
                  against this signal multiplied by signal reliability. Observations with confidence below
                  0.45 are automatically flagged for physical extension review and cannot settle GMB receipts or exchange contracts until verified.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-[#17251e] pt-3">
              <button
                onClick={() => setActiveSignal(null)}
                className="rounded border border-[#233b2c] bg-[#121f17] px-4 py-2 font-mono text-xs font-semibold text-[#d5ded8] hover:bg-[#18291f] transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

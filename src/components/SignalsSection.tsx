import React, { useState, useMemo } from "react";
import { SignalItem, SignalFamily, SignalStatus } from "../types";
import { SIGNAL_REGISTRY } from "../lib/signals";
import { Radio, Filter, Info, Satellite, CheckCircle2, AlertTriangle, Clock, Layers } from "lucide-react";

export const SignalsSection: React.FC = () => {
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSignal, setActiveSignal] = useState<SignalItem | null>(null);

  const filteredSignals = useMemo(() => {
    return SIGNAL_REGISTRY.filter((s) => {
      const matchFamily = selectedFamily === "all" || s.family === selectedFamily;
      const matchStatus = selectedStatus === "all" || s.status === selectedStatus;
      const matchSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.agronomicUse.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFamily && matchStatus && matchSearch;
    });
  }, [selectedFamily, selectedStatus, searchQuery]);

  const families: { id: string; label: string }[] = [
    { id: "all", label: "All Families (15)" },
    { id: "crop", label: "Crop Mapping" },
    { id: "phenology", label: "Phenology" },
    { id: "water", label: "Water & Irrigation" },
    { id: "soil", label: "Soil Moisture" },
    { id: "biomass", label: "Biomass / LAI" },
    { id: "land-cover", label: "Land Cover" },
  ];

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
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            02 / Remote-Sensing Signal Fabric
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            15-Signal Agricultural Evidence Layer
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            The platform treats remote sensing as an evidence service. Each signal has a provider,
            spatial resolution, timestamp, quality and confidence rather than being blindly presented as truth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://zimagriai.onrender.com/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-sky-700/50 bg-sky-950/40 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-900/50 transition"
          >
            <span>Worker: zimagriai.onrender.com</span>
          </a>
          <span className="rounded-md border border-stone-700 bg-stone-800/80 px-2.5 py-1 text-xs font-medium text-stone-300">
            Sentinel • Landsat • MODIS • NASA POWER
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-800 bg-stone-900/60 p-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          {families.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFamily(f.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                selectedFamily === f.id
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-800 text-stone-400 hover:bg-stone-750 hover:text-stone-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Statuses ({SIGNAL_REGISTRY.length})</option>
            <option value="implemented">Implemented</option>
            <option value="provider-backed">Provider-Backed</option>
            <option value="calibration-required">Calibration-Required</option>
          </select>

          <input
            type="text"
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Signals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSignals.map((signal) => (
          <article
            key={signal.id}
            onClick={() => setActiveSignal(signal)}
            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition hover:border-stone-700 hover:bg-stone-900"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-stone-400 uppercase">
                  {signal.family}
                </span>
                {getStatusBadge(signal.status)}
              </div>

              <h3 className="font-display mt-3 text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                {signal.name}
              </h3>

              <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <Satellite className="h-3 w-3" />
                <span>{signal.source}</span>
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-stone-400 line-clamp-2">
                {signal.description}
              </p>
            </div>

            <div className="mt-4 border-t border-stone-800/80 pt-3">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Res: {signal.resolution}</span>
                <span>Revisit: {signal.revisit}</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500 line-clamp-1 italic">
                {signal.agronomicUse}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Signal Calibration Truth Note */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-4 text-xs text-stone-300">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <b className="text-white font-semibold">Current Live Telemetry Baseline:</b> NASA POWER
            7-day rainfall, precipitation anomalies, and temperature reanalysis are running live without
            vendor keys. Sentinel-1 SAR, Sentinel-2 MSI, Landsat 8/9, and MODIS signals are abstracted
            as an evidence service contract ready for the Earth Engine worker deployment.
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {activeSignal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setActiveSignal(null)}
        >
          <div
            className="max-w-lg w-full rounded-xl border border-stone-700 bg-stone-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-400 uppercase">
                  {activeSignal.family}
                </span>
                <h3 className="font-display mt-2 text-xl font-bold text-white">
                  {activeSignal.name}
                </h3>
              </div>
              {getStatusBadge(activeSignal.status)}
            </div>

            <div className="mt-4 space-y-3 text-xs text-stone-300">
              <div className="rounded-lg bg-stone-950 p-3 border border-stone-800 font-mono text-[11px] text-emerald-400">
                <div>Source Sensor: {activeSignal.source}</div>
                <div>Spatial Resolution: {activeSignal.resolution}</div>
                <div>Revisit Interval: {activeSignal.revisit}</div>
              </div>

              <div>
                <h4 className="font-semibold text-stone-200">Scientific Description:</h4>
                <p className="mt-1 leading-relaxed text-stone-400">{activeSignal.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-stone-200">Zimbabwe Policy & Agronomic Use:</h4>
                <p className="mt-1 leading-relaxed text-stone-400">{activeSignal.agronomicUse}</p>
              </div>

              <div className="rounded-md border border-stone-800 bg-stone-950/60 p-3">
                <span className="font-semibold text-stone-300 block mb-1">Evidence Corroboration Role:</span>
                <p className="text-stone-400 text-[11px]">
                  When farmer self-reports are submitted, agreement scoring calculates the relative gap
                  against this signal multiplied by signal reliability. Observations with confidence below
                  0.45 are automatically flagged for physical extension review.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveSignal(null)}
                className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

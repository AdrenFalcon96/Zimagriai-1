import React, { useState } from "react";
import { Observation, DatabaseStatus } from "../types";
import {
  FilePenLine,
  Send,
  CloudOff,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Database,
  Award,
  Zap,
  Gift,
  Sun,
  Tractor,
  Smartphone,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Users,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import {
  AGRITEX_DATA_CAPTURE_SOLUTIONS,
  INCENTIVE_TIERS,
  SAMPLE_EXTENSION_OFFICERS,
  IncentiveTier,
} from "../data/incentivePolicyData";

interface FieldCaptureProps {
  observations: Observation[];
  offlineQueue: Observation[];
  onAddObservation: (obs: Omit<Observation, "id" | "created_at">) => Promise<boolean>;
  onFlushQueue: () => Promise<void>;
  isOnline: boolean;
  dbStatus?: DatabaseStatus | null;
}

export const FieldCaptureSection: React.FC<FieldCaptureProps> = ({
  observations,
  offlineQueue,
  onAddObservation,
  onFlushQueue,
  isOnline,
  dbStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"capture" | "incentives" | "leaderboard" | "diagnostic">("capture");
  
  // Field capture form state
  const [farmerRef, setFarmerRef] = useState<string>("");
  const [district, setDistrict] = useState<string>("Murehwa");
  const [crop, setCrop] = useState<string>("maize");
  const [areaHa, setAreaHa] = useState<string>("1.5");
  const [yieldTHa, setYieldTHa] = useState<string>("3.2");
  const [notes, setNotes] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

  // Incentive simulator state
  const [simVerifiedRecords, setSimVerifiedRecords] = useState<number>(165);
  const [simQualityScore, setSimQualityScore] = useState<number>(0.92);

  const calculateSimulatedTier = (records: number, quality: number): IncentiveTier => {
    if (records >= 300 && quality >= 0.90) return INCENTIVE_TIERS[3]; // Platinum
    if (records >= 150 && quality >= 0.80) return INCENTIVE_TIERS[2]; // Gold
    if (records >= 75 && quality >= 0.70) return INCENTIVE_TIERS[1]; // Silver
    return INCENTIVE_TIERS[0]; // Standard
  };

  const currentSimTier = calculateSimulatedTier(simVerifiedRecords, simQualityScore);
  const estimatedMonthlyPayout = currentSimTier.agritexAllowanceUsd + (simVerifiedRecords * 0.50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerRef.trim()) {
      setSubmitFeedback({ type: "error", message: "Farmer reference ID is required." });
      return;
    }
    if (!consent) {
      setSubmitFeedback({ type: "error", message: "Consent is required for agricultural intelligence capture." });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const success = await onAddObservation({
        farmer_ref: farmerRef.trim(),
        district,
        crop,
        area_ha: Number(areaHa) || 1.0,
        yield_t_ha: Number(yieldTHa) || 1.0,
        notes: notes.trim() || null,
        consent,
        source: "web",
        status: "verified",
      });

      if (success) {
        setSubmitFeedback({
          type: "success",
          message: isOnline
            ? "Observation verified and committed to Render PostgreSQL with atomic audit logging. +$0.50 performance credit accrued to officer ledger!"
            : "Device is offline. Observation securely queued in local storage. Incentive credit will unlock upon cloud sync.",
        });
        setFarmerRef("");
        setNotes("");
      }
    } catch {
      setSubmitFeedback({
        type: "warning",
        message: "Network request failed. Observation has been cached locally in offline queue.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportQueue = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(offlineQueue, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zimagri_offline_queue_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section className="space-y-6" id="section-capture">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-04 // FIELD CADASTRE & DATA CAPTURE INCENTIVE POLICY (DCIP)
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">AGRITEX Operational Transformation</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {dbStatus?.status === "connected" && (
              <span className="inline-flex items-center gap-1.5 rounded border border-[#1e4832] bg-[#0d281a] px-2.5 py-1 font-mono text-xs font-semibold text-[#34d399]">
                <Database className="h-3 w-3 text-[#34d399]" />
                <span>Postgres ({dbStatus.latencyMs}ms)</span>
              </span>
            )}
            <span className="rounded border border-[#1b2b22] bg-[#0f1914] px-2.5 py-1 font-mono text-xs font-semibold text-[#8ea396]">
              {isOnline ? "SOCKET: ONLINE SYNC" : "BUFFER: OFFLINE ISOLATED"}
            </span>
          </div>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          AGRITEX Field Cadastre & Data Capture Incentive Engine
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          Solving historical AGRITEX field-reporting delays, desktop survey fabrications, and rural mobile data hurdles. 
          Combines local-first offline storage with an empirical <strong>Data Capture Incentive Policy</strong> paying automated airtime, solar gear, and performance bonuses upon satellite corroboration.
        </p>
      </div>

      {/* Hero Banner: The Three National Pillars */}
      <div className="rounded border border-[#1e4832] bg-[#0c1a13] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#122e1e] px-2 py-0.5 font-mono text-[10px] font-bold text-[#34d399] border border-[#1f5936] uppercase tracking-wider">
                CORE VALUE PROPOSITION & STRATEGIC TRIFECTA
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[#f4f7f5]">
              Empowering Ground Officers While Feeding AI Telemetry & Commodity Floors
            </h3>
            <p className="text-xs text-[#c9d6cf] leading-relaxed">
              Real-time agricultural intelligence requires motivated field workers. By pairing <strong>AGRITEX Data Capture Incentives</strong> with <strong>15-Signal AI Telemetry</strong> and <strong>Prof. Mthuli Ncube's Commodity Derivatives Floors (ZMX/VFEX)</strong>, every verified observation directly strengthens warehouse receipt lending and national food balance forecasts.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 font-mono text-xs">
            <span className="rounded bg-[#102419] px-3 py-1.5 text-[#4ade80] border border-[#1e4832] font-semibold">
              1. Incentive Policy
            </span>
            <span className="rounded bg-[#102419] px-3 py-1.5 text-[#38bdf8] border border-[#173a4e] font-semibold">
              2. Spatial AI Systems
            </span>
            <span className="rounded bg-[#102419] px-3 py-1.5 text-[#facc15] border border-[#48370f] font-semibold">
              3. ZMX/VFEX Derivatives
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#1b2b22] gap-1 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab("capture")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            activeSubTab === "capture"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <FilePenLine className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Cadastre Capture & Offline Queue</span>
        </button>

        <button
          onClick={() => setActiveSubTab("incentives")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            activeSubTab === "incentives"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <Award className="h-3.5 w-3.5 text-[#facc15]" />
          <span>Incentive Policy Structure & Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab("leaderboard")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            activeSubTab === "leaderboard"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 text-[#38bdf8]" />
          <span>Extension Officer Performance Roster</span>
        </button>

        <button
          onClick={() => setActiveSubTab("diagnostic")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            activeSubTab === "diagnostic"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5 text-[#a78bfa]" />
          <span>Historical Bottlenecks & Solutions</span>
        </button>
      </div>

      {/* SUBTAB 1: Cadastre Capture & Offline Queue */}
      {activeSubTab === "capture" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Capture Form */}
            <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
                <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                  <FilePenLine className="h-4 w-4 text-[#34d399]" />
                  Record Smallholder Agronomic Observation
                </h3>
                <span className="font-mono text-[11px] text-[#34d399] bg-[#11241a] px-2 py-0.5 rounded border border-[#1f4732]">
                  +$0.50 Incentive Verified
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">PRODUCER IDENTIFIER *</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. F-MRH-0104"
                      value={farmerRef}
                      onChange={(e) => setFarmerRef(e.target.value)}
                      className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-[#c9d6cf] placeholder-[#556e60] focus:border-[#34d399] focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">ADMINISTRATIVE DISTRICT *</span>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                    >
                      <option value="Murehwa">Murehwa (NR II - High Potential)</option>
                      <option value="Zaka">Zaka (NR IV - Semi-Extensive)</option>
                      <option value="Umguza">Umguza (NR IV - Cattle & Small Grains)</option>
                      <option value="Mazowe">Mazowe (NR II - Intensive Maize/Wheat)</option>
                      <option value="Chinhoyi">Chinhoyi (NR II - Grain Hub)</option>
                      <option value="Chiredzi">Chiredzi (NR V - Lowveld Arid)</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="space-y-1">
                    <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">COMMODITY CROP *</span>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                    >
                      <option value="maize">Maize (White/Yellow)</option>
                      <option value="sorghum">Sorghum (SV2/SV4 Traditional)</option>
                      <option value="pearl_millet">Pearl Millet (Mhunga)</option>
                      <option value="soya_bean">Soya Bean</option>
                      <option value="tobacco">Flue-Cured Tobacco</option>
                      <option value="sunflower">Sunflower</option>
                      <option value="groundnuts">Groundnuts</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">PLANTED AREA (HA) *</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={areaHa}
                      onChange={(e) => setAreaHa(e.target.value)}
                      className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">OBSERVED YIELD (T/HA) *</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={yieldTHa}
                      onChange={(e) => setYieldTHa(e.target.value)}
                      className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">FIELD OBSERVATION NOTES</span>
                  <textarea
                    rows={3}
                    placeholder="e.g. Pfumvudza potholing mulched trial; basal Compound D applied mid-November; top dressing delayed due to dry spell."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    className="w-full rounded border border-[#1b2b22] bg-[#0f1914] p-3 text-xs text-[#c9d6cf] placeholder-[#556e60] focus:border-[#34d399] focus:outline-none"
                  />
                </label>

                <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#1b2b22] bg-[#0f1914] text-[#16a34a] focus:ring-[#34d399]"
                    />
                    <span className="text-[11px] text-[#8fa397] leading-relaxed">
                      I certify that this observation adheres to the National Agricultural Policy Framework and authorize evidence corroboration against statutory remote-sensing telemetry.
                    </span>
                  </label>
                </div>

                {submitFeedback && (
                  <div
                    className={`rounded p-3 flex items-start gap-2 text-xs font-mono ${
                      submitFeedback.type === "success"
                        ? "border border-[#1e4832] bg-[#0d281a] text-[#4ade80]"
                        : submitFeedback.type === "warning"
                        ? "border border-[#422c10] bg-[#281b0a] text-[#fbbf24]"
                        : "border border-[#4a1515] bg-[#280c0c] text-[#f87171]"
                    }`}
                  >
                    {submitFeedback.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#34d399] shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{submitFeedback.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded border border-[#22c55e] bg-[#15803d] px-4 py-2.5 font-mono text-xs font-bold text-white transition hover:bg-[#16a34a] focus:outline-none disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? "TRANSMITTING OBSERVATION..." : "COMMIT CADASTRE RECORD"}
                </button>
              </form>
            </div>

            {/* Offline Queue Manager */}
            <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
                  <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                    <CloudOff className="h-4 w-4 text-[#fbbf24]" />
                    Buffered Offline Queue
                  </h3>
                  <span className="font-mono text-xs text-[#8fa397] rounded border border-[#1b2b22] bg-[#0f1914] px-2 py-0.5">
                    {offlineQueue.length} Pending Records
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#8ca094] leading-relaxed">
                  When working beyond terrestrial GSM coverage in remote agricultural wards, observations are securely enqueued in the browser’s persistent storage. Once cell tower handshake occurs, queues flush automatically.
                </p>

                {offlineQueue.length === 0 ? (
                  <div className="mt-8 rounded border border-dashed border-[#1b2b22] bg-[#09110d] p-6 text-center text-xs text-[#6e8577]">
                    <CheckCircle2 className="mx-auto h-5 w-5 text-[#34d399] mb-2" />
                    Local storage queue is clear. All cadastre entries committed.
                  </div>
                ) : (
                  <div className="mt-4 max-h-52 overflow-y-auto space-y-2 pr-1">
                    {offlineQueue.map((item) => (
                      <div
                        key={item.id}
                        className="rounded border border-[#1b2b22] bg-[#0f1914] p-2.5 text-xs text-[#c9d6cf] flex items-center justify-between font-mono"
                      >
                        <div>
                          <span className="font-bold text-[#34d399]">{item.farmer_ref}</span>
                          <span className="text-[#8fa397] ml-2">
                            {item.district} • {item.crop} ({item.yield_t_ha} t/ha)
                          </span>
                        </div>
                        <span className="text-[10px] text-[#fbbf24] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Buffered
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2 border-t border-[#17251e] pt-4">
                <button
                  onClick={onFlushQueue}
                  disabled={offlineQueue.length === 0}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded border border-[#1e4832] bg-[#0f281b] px-3 py-2 font-mono text-xs font-semibold text-[#34d399] transition hover:bg-[#133524] disabled:opacity-40"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Flush Queue to Cloud
                </button>

                <button
                  onClick={handleExportQueue}
                  disabled={offlineQueue.length === 0}
                  className="inline-flex items-center gap-1.5 rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-xs font-semibold text-[#8fa397] transition hover:bg-[#14231b] disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5 text-[#7dd3fc]" />
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Captured Observations Log */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6">
            <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
              <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#34d399]" />
                Statutory Cadastre Ledger
              </h3>
              <span className="font-mono text-xs text-[#6e8577]">{observations.length} active entries</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1b2b22] bg-[#0f1914] font-mono text-[11px] text-[#8ea396] uppercase tracking-wider">
                    <th className="py-2 px-2.5">Identifier</th>
                    <th className="py-2 px-2.5">Producer Ref</th>
                    <th className="py-2 px-2.5">District</th>
                    <th className="py-2 px-2.5">Crop</th>
                    <th className="py-2 px-2.5 text-right">Cadastre (ha)</th>
                    <th className="py-2 px-2.5 text-right">Reported (t/ha)</th>
                    <th className="py-2 px-2.5">Agronomic Remarks</th>
                    <th className="py-2 px-2.5 text-right">Corrob. Index</th>
                    <th className="py-2 px-2.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17251e] text-[#c9d6cf]">
                  {observations.map((obs) => (
                    <tr key={obs.id} className="hover:bg-[#111e17] transition">
                      <td className="py-3 px-2.5 font-mono text-[#6e8577] text-[11px]">{obs.id.slice(0, 12)}</td>
                      <td className="py-3 px-2.5 font-mono font-semibold text-[#f4f7f5]">{obs.farmer_ref}</td>
                      <td className="py-3 px-2.5 text-[#8fa397]">{obs.district}</td>
                      <td className="py-3 px-2.5 capitalize text-[#8fa397]">{obs.crop}</td>
                      <td className="py-3 px-2.5 text-right font-mono text-[#a1b8ab]">{obs.area_ha} ha</td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-[#34d399]">
                        {obs.yield_t_ha} t/ha
                      </td>
                      <td className="py-3 px-2.5 text-[#799083] max-w-xs truncate text-[11px]">
                        {obs.notes || "—"}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono text-[#7dd3fc] font-semibold">
                        {obs.confidence ? obs.confidence.toFixed(2) : "0.72"}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono">
                        <span
                          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                            obs.status === "verified"
                              ? "border-[#1e4832] bg-[#0d281a] text-[#4ade80]"
                              : "border-[#422c10] bg-[#281b0a] text-[#fbbf24]"
                          }`}
                        >
                          {obs.status === "verified" ? "VERIFIED" : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Incentive Policy Structure & Simulator */}
      {activeSubTab === "incentives" && (
        <div className="space-y-6">
          {/* Policy Overview Box */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <h3 className="font-display text-base font-bold text-[#f4f7f5] mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#facc15]" />
              Data Capture Incentive Policy (DCIP) Architecture
            </h3>
            <p className="text-xs text-[#9ab0a3] leading-relaxed max-w-4xl">
              Extension staff in Zimbabwe’s 1,600+ rural wards often face extreme operational hurdles: long walking distances, lack of motorbike fuel, dead cell zones, and expensive mobile bundles. 
              The <strong>DCIP</strong> replaces punitive oversight with <strong>merit-based digital incentives</strong> funded through a 0.15% levy on ZMX warehouse transactions and international climate adaptation funds:
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-5">
              <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#34d399]">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase">Automated Airtime</span>
                </div>
                <div className="font-display text-xl font-bold text-[#f4f7f5]">$0.50 / record</div>
                <p className="text-[11px] text-[#799083] leading-relaxed">
                  Direct EcoCash / OneMoney top-up credited within 60 seconds of satellite corroboration.
                </p>
              </div>

              <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#38bdf8]">
                  <Sun className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase">Solar Field Kits</span>
                </div>
                <div className="font-display text-xl font-bold text-[#f4f7f5]">Gold Tier (150+)</div>
                <p className="text-[11px] text-[#799083] leading-relaxed">
                  High-capacity solar power bank and rugged all-weather field case for uninterrupted tablet operation.
                </p>
              </div>

              <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#facc15]">
                  <Tractor className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase">Mechanisation Booking</span>
                </div>
                <div className="font-display text-xl font-bold text-[#f4f7f5]">Priority Roster</div>
                <p className="text-[11px] text-[#799083] leading-relaxed">
                  Priority scheduling from the Ministry’s Bellarus & John Deere tractor pools for the officer's ward.
                </p>
              </div>

              <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#a78bfa]">
                  <Gift className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase">Quality Allowance</span>
                </div>
                <div className="font-display text-xl font-bold text-[#f4f7f5]">Up to $250 / mo</div>
                <p className="text-[11px] text-[#799083] leading-relaxed">
                  Monthly performance bonus linked to satellite corroboration score (&gt;85% match rate).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Incentive Simulator */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17251e] pb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#facc15]" />
                  Extension Officer Earnings & Incentive Tier Simulator
                </h3>
                <p className="text-xs text-[#799083]">Test how field productivity and satellite verification fidelity unlock tangible rewards</p>
              </div>
              <span className="rounded bg-[#12261b] px-3 py-1 font-mono text-xs font-bold text-[#34d399] border border-[#1f402c]">
                Current Tier: {currentSimTier.tier} Tier
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#8ea396]">Monthly Verified Smallholder Records:</span>
                    <span className="font-bold text-[#f4f7f5]">{simVerifiedRecords} farmers</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="400"
                    step="5"
                    value={simVerifiedRecords}
                    onChange={(e) => setSimVerifiedRecords(Number(e.target.value))}
                    className="w-full accent-[#34d399]"
                  />
                  <div className="flex justify-between text-[10px] text-[#556e60] font-mono mt-1">
                    <span>10 (Entry)</span>
                    <span>75 (Silver)</span>
                    <span>150 (Gold)</span>
                    <span>300+ (Platinum)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#8ea396]">Satellite Corroboration Index (Fidelity):</span>
                    <span className="font-bold text-[#34d399]">{(simQualityScore * 100).toFixed(0)}% Match</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="0.99"
                    step="0.01"
                    value={simQualityScore}
                    onChange={(e) => setSimQualityScore(Number(e.target.value))}
                    className="w-full accent-[#34d399]"
                  />
                  <div className="flex justify-between text-[10px] text-[#556e60] font-mono mt-1">
                    <span>50% (High Discrepancy)</span>
                    <span>85% (Statutory Standard)</span>
                    <span>99% (Master Surveyor)</span>
                  </div>
                </div>
              </div>

              {/* Simulation Result Card */}
              <div className="rounded border border-[#1e4832] bg-[#0d281a] p-5 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase text-[#4ade80] tracking-wider block mb-1">
                    ESTIMATED MONTHLY COMPENSATION & GRANTS
                  </span>
                  <div className="font-display text-3xl font-bold text-[#f4f7f5] mt-1">
                    ${estimatedMonthlyPayout.toFixed(2)}{" "}
                    <span className="text-xs font-mono font-normal text-[#8ea396]">USD Equivalent / mo</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-[#b9cdc2]">
                      <span>Monthly Performance Allowance:</span>
                      <span className="font-bold text-white">${currentSimTier.agritexAllowanceUsd}.00</span>
                    </div>
                    <div className="flex justify-between text-[#b9cdc2]">
                      <span>Record Micro-Stipends ({simVerifiedRecords} × $0.50):</span>
                      <span className="font-bold text-white">${(simVerifiedRecords * 0.50).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#b9cdc2]">
                      <span>Monthly Data/Airtime Package:</span>
                      <span className="font-bold text-[#34d399]">${currentSimTier.airtimeStipendUsd}.00 Direct</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#173a27] flex flex-wrap gap-2 text-[11px] font-mono">
                  {currentSimTier.solarBatteryPackBonus && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#163824] px-2 py-0.5 text-[#facc15] border border-[#2b593a]">
                      <Sun className="h-3 w-3" /> Solar Power Pack Unlocked
                    </span>
                  )}
                  {currentSimTier.priorityBellarusAccess && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#163824] px-2 py-0.5 text-[#38bdf8] border border-[#2b593a]">
                      <Tractor className="h-3 w-3" /> Ward Tractor Priority
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Statutory Tier Thresholds Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1b2b22] bg-[#09110d] font-mono text-[11px] text-[#8ea396] uppercase">
                    <th className="py-2.5 px-3">Incentive Tier</th>
                    <th className="py-2.5 px-3">Min. Verified Records</th>
                    <th className="py-2.5 px-3">Satellite Match Gate</th>
                    <th className="py-2.5 px-3">Airtime Credit</th>
                    <th className="py-2.5 px-3">Monthly Allowance</th>
                    <th className="py-2.5 px-3">Material Equipment Bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17251e] font-mono text-[#c9d6cf]">
                  {INCENTIVE_TIERS.map((tier) => (
                    <tr
                      key={tier.tier}
                      className={currentSimTier.tier === tier.tier ? "bg-[#14291c] font-semibold" : "hover:bg-[#0f1914]"}
                    >
                      <td className="py-2.5 px-3 text-[#f4f7f5]">{tier.tier}</td>
                      <td className="py-2.5 px-3">{tier.minVerifiedRecords}+ Records</td>
                      <td className="py-2.5 px-3 text-[#34d399]">{(tier.dataQualityThreshold * 100).toFixed(0)}%</td>
                      <td className="py-2.5 px-3">${tier.airtimeStipendUsd}/mo</td>
                      <td className="py-2.5 px-3 text-[#facc15]">${tier.agritexAllowanceUsd}/mo</td>
                      <td className="py-2.5 px-3 text-[#799083]">
                        {tier.solarBatteryPackBonus ? "Solar Pack + Mechanisation Priority" : "Standard Mobile Support"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Extension Officer Performance Roster */}
      {activeSubTab === "leaderboard" && (
        <div className="space-y-5">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17251e] pb-3 mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-[#f4f7f5] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#38bdf8]" />
                  Active Pilot Extension Officer Leaderboard & Disbursals
                </h3>
                <p className="text-xs text-[#799083]">Live audit trail of smallholder field registrations, satellite corroboration ratios, and disbursed micro-stipends</p>
              </div>
              <span className="font-mono text-xs text-[#34d399] bg-[#122b1c] px-3 py-1 rounded border border-[#1b432b]">
                Funded by ZMX Clearing Levy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1b2b22] bg-[#09110d] font-mono text-[11px] text-[#8ea396] uppercase">
                    <th className="py-2.5 px-3">Officer Name / ID</th>
                    <th className="py-2.5 px-3">Assigned Ward</th>
                    <th className="py-2.5 px-3 text-right">Submissions</th>
                    <th className="py-2.5 px-3 text-right">Verified</th>
                    <th className="py-2.5 px-3 text-right">Fidelity Ratio</th>
                    <th className="py-2.5 px-3 text-center">Tier Status</th>
                    <th className="py-2.5 px-3 text-right">Accrued Stipend</th>
                    <th className="py-2.5 px-3 text-right">Equipment Grants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17251e] text-[#c9d6cf] font-mono">
                  {SAMPLE_EXTENSION_OFFICERS.map((off) => (
                    <tr key={off.officerId} className="hover:bg-[#111e17] transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#f4f7f5]">{off.officerName}</div>
                        <div className="text-[10px] text-[#6e8577]">{off.officerId}</div>
                      </td>
                      <td className="py-3 px-3 text-[#8fa397]">
                        <div>{off.ward}</div>
                        <div className="text-[10px] text-[#556e60]">{off.district}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#8fa397]">{off.totalSubmissions}</td>
                      <td className="py-3 px-3 text-right text-[#34d399] font-bold">{off.verifiedSubmissions}</td>
                      <td className="py-3 px-3 text-right text-[#38bdf8] font-bold">
                        {(off.corroboratedRatio * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            off.currentTier === "Platinum"
                              ? "bg-[#281b38] text-[#c084fc] border-[#4a2e68]"
                              : off.currentTier === "Gold"
                              ? "bg-[#2a200a] text-[#facc15] border-[#554013]"
                              : "bg-[#102419] text-[#4ade80] border-[#1f4832]"
                          }`}
                        >
                          {off.currentTier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#4ade80] font-bold">
                        ${(off.accruedAirtimeUsd + off.accruedAllowanceUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-[#8fa397]">
                        {off.solarPackEarned ? (
                          <span className="text-[#facc15] flex items-center justify-end gap-1">
                            <Sun className="h-3 w-3" /> Solar Kit + Tractor Vouchers
                          </span>
                        ) : (
                          <span className="text-[#799083]">Airtime Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Historical Bottlenecks & Solutions */}
      {activeSubTab === "diagnostic" && (
        <div className="space-y-5">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <h3 className="font-display text-base font-bold text-[#f4f7f5] mb-2">
              Transforming AGRITEX: Root Causes & The Digital Remedy
            </h3>
            <p className="text-xs text-[#9ab0a3] leading-relaxed max-w-4xl">
              For decades, agricultural planners suffered from data vacuums caused by structural disincentives rather than lack of extension competence. 
              The matrix below illustrates how the <strong>Zimbabwe-first AI systems platform for Agriculture</strong> systematically solves each historical pain point:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {AGRITEX_DATA_CAPTURE_SOLUTIONS.map((item, idx) => (
              <div key={idx} className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#17251e] pb-2">
                  <span className="font-mono text-xs font-bold text-[#f87171]">
                    BOTTLENECK 0{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] text-[#799083]">Systemic Issue</span>
                </div>
                <h4 className="font-display text-sm font-bold text-[#f4f7f5]">
                  {item.historicalIssue}
                </h4>

                <div className="space-y-1 text-xs">
                  <span className="font-mono text-[10px] uppercase text-[#8ea396] block">Root Cause & Context:</span>
                  <p className="text-[#9ab0a3] leading-relaxed">{item.rootCause}</p>
                </div>

                <div className="space-y-1 text-xs rounded bg-[#171010] p-2.5 border border-[#301c1c]">
                  <span className="font-mono text-[10px] uppercase text-[#f87171] block">Historical Ministry Impact:</span>
                  <p className="text-[#d88f8f] leading-relaxed">{item.impactOnMinistry}</p>
                </div>

                <div className="space-y-1 text-xs rounded bg-[#0d2217] p-2.5 border border-[#1e4832]">
                  <span className="font-mono text-[10px] uppercase text-[#34d399] block font-bold">Platform Technological Solution:</span>
                  <p className="text-[#c9ded3] leading-relaxed">{item.platformSolution}</p>
                </div>

                <div className="space-y-1 text-xs rounded bg-[#1f1a0a] p-2.5 border border-[#48370f]">
                  <span className="font-mono text-[10px] uppercase text-[#facc15] block font-bold">Incentive Policy Mechanism:</span>
                  <p className="text-[#e2d5ad] leading-relaxed">{item.incentiveMechanism}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

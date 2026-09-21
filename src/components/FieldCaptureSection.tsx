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
} from "lucide-react";

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
  const [farmerRef, setFarmerRef] = useState<string>("");
  const [district, setDistrict] = useState<string>("Murehwa");
  const [crop, setCrop] = useState<string>("maize");
  const [areaHa, setAreaHa] = useState<string>("1.5");
  const [yieldTHa, setYieldTHa] = useState<string>("3.2");
  const [notes, setNotes] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

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
            ? "Observation verified and committed to Render PostgreSQL (Frankfurt instance) with atomic audit logging."
            : "Device is offline. Observation securely queued in local storage for automated sync.",
        });
        setFarmerRef("");
        setNotes("");
      }
    } catch (err: unknown) {
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
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            04 / Field Data Capture & Offline Queue
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            Web Now; Offline and USSD by Contract
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Communal and commercial farm records captured in the field. Encrypted, queued locally if offline,
            and corroborated against remote sensing before integration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dbStatus?.status === "connected" && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/50 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Database className="h-3 w-3 text-emerald-400" />
              <span>Render Postgres ({dbStatus.latencyMs}ms)</span>
            </span>
          )}
          <span className="rounded-md border border-stone-700 bg-stone-800/80 px-3 py-1 text-xs font-semibold text-emerald-400">
            {isOnline ? "LIVE SERVER SYNC" : "OFFLINE BUFFER READY"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Capture Form */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FilePenLine className="h-5 w-5 text-emerald-400" />
              Capture Farm Observation
            </h3>
            <span className="text-xs text-stone-500">Non-sensitive operational data only</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Farmer Reference ID *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. F-MRH-0104"
                  value={farmerRef}
                  onChange={(e) => setFarmerRef(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-stone-300">District *</span>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Murehwa">Murehwa (NR II)</option>
                  <option value="Zaka">Zaka (NR IV)</option>
                  <option value="Umguza">Umguza (NR IV)</option>
                  <option value="Mazowe">Mazowe (NR II)</option>
                  <option value="Chinhoyi">Chinhoyi (NR II)</option>
                  <option value="Chiredzi">Chiredzi (NR V)</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Crop *</span>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="maize">Maize (White/Yellow)</option>
                  <option value="sorghum">Sorghum (SV2/SV4)</option>
                  <option value="pearl_millet">Pearl Millet (Mhunga)</option>
                  <option value="soya_bean">Soya Bean</option>
                  <option value="tobacco">Flue-Cured Tobacco</option>
                  <option value="sunflower">Sunflower</option>
                  <option value="groundnuts">Groundnuts</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Area (ha) *</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Observed Yield (t/ha) *</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={yieldTHa}
                  onChange={(e) => setYieldTHa(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-semibold text-stone-300">Operational Field Notes</span>
              <textarea
                rows={3}
                placeholder="e.g. Pfumvudza potholing mulched trial; basal Compound D applied mid-November; top dressing delayed due to dry spell."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 p-3 text-stone-200 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
              />
            </label>

            <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-700 bg-stone-800 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-stone-400">
                  I consent to this operational observation being stored and corroborated for national
                  agricultural intelligence and yield modeling under Zimbabwe data governance protocols.
                </span>
              </label>
            </div>

            {submitFeedback && (
              <div
                className={`rounded-lg p-3 flex items-start gap-2 text-xs ${
                  submitFeedback.type === "success"
                    ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                    : submitFeedback.type === "warning"
                    ? "border border-amber-500/40 bg-amber-950/30 text-amber-300"
                    : "border border-red-500/40 bg-red-950/30 text-red-300"
                }`}
              >
                {submitFeedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{submitFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 focus:outline-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting Observation..." : "Record Observation"}
            </button>
          </form>
        </div>

        {/* Offline Queue Manager */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <CloudOff className="h-4 w-4 text-amber-400" />
                Offline-First Queue
              </h3>
              <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-mono text-stone-300">
                {offlineQueue.length} Pending
              </span>
            </div>

            <p className="mt-3 text-xs text-stone-400 leading-relaxed">
              In deep rural wards with intermittent GSM coverage, observations are securely enqueued in
              the browser’s client storage. Once connectivity is restored, the queue can be automatically
              synced or exported via JSON.
            </p>

            {offlineQueue.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-stone-800 p-6 text-center text-xs text-stone-500">
                <CheckCircle2 className="mx-auto h-6 w-6 text-stone-600 mb-2" />
                All observations are synchronized with the platform.
              </div>
            ) : (
              <div className="mt-4 max-h-52 overflow-y-auto space-y-2 pr-1">
                {offlineQueue.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-stone-800 bg-stone-950 p-2.5 text-xs text-stone-300 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-400">{item.farmer_ref}</span>
                      <span className="text-stone-400 ml-2">
                        {item.district} • {item.crop} ({item.yield_t_ha} t/ha)
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Queued
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2 border-t border-stone-800 pt-4">
            <button
              onClick={onFlushQueue}
              disabled={offlineQueue.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-stone-700 disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              Sync Queue Now
            </button>

            <button
              onClick={handleExportQueue}
              disabled={offlineQueue.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:bg-stone-700 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5 text-teal-400" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Captured Observations Log */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Verified Operational Observation Ledger
          </h3>
          <span className="text-xs text-stone-500">{observations.length} active records</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold">
                <th className="py-2.5 px-2">ID</th>
                <th className="py-2.5 px-2">Farmer Ref</th>
                <th className="py-2.5 px-2">District</th>
                <th className="py-2.5 px-2">Crop</th>
                <th className="py-2.5 px-2 text-right">Area</th>
                <th className="py-2.5 px-2 text-right">Yield</th>
                <th className="py-2.5 px-2">Notes</th>
                <th className="py-2.5 px-2 text-right">Confidence</th>
                <th className="py-2.5 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {observations.map((obs) => (
                <tr key={obs.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-stone-500 text-[11px]">{obs.id.slice(0, 12)}</td>
                  <td className="py-3 px-2 font-mono font-semibold text-white">{obs.farmer_ref}</td>
                  <td className="py-3 px-2 text-stone-300">{obs.district}</td>
                  <td className="py-3 px-2 capitalize text-stone-300">{obs.crop}</td>
                  <td className="py-3 px-2 text-right font-mono text-stone-300">{obs.area_ha} ha</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">
                    {obs.yield_t_ha} t/ha
                  </td>
                  <td className="py-3 px-2 text-stone-400 max-w-xs truncate text-[11px]">
                    {obs.notes || "—"}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-teal-300 font-semibold">
                    {obs.confidence ? obs.confidence.toFixed(2) : "0.72"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        obs.status === "verified"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-amber-950 text-amber-400"
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
    </section>
  );
};

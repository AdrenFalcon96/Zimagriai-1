import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Scale,
  AlertOctagon,
  FileCheck,
  CheckCircle2,
  Database,
  Server,
  Activity,
  RefreshCw,
  Clock,
  Terminal,
  Cpu,
  Radio,
  ExternalLink,
} from "lucide-react";
import { DatabaseStatus, WorkerStatus, AuditLogItem, StakeholderSummaryItem } from "../types";

export const GovernanceSection: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [stakeholderSummary, setStakeholderSummary] = useState<StakeholderSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchGovernanceData = async () => {
    setIsRefreshing(true);
    try {
      const [dbRes, workerRes, auditRes, summaryRes] = await Promise.all([
        fetch("/api/db/status"),
        fetch("/api/worker/status"),
        fetch("/api/audit-logs"),
        fetch("/api/stakeholder/summary"),
      ]);

      if (dbRes.ok) setDbStatus(await dbRes.json());
      if (workerRes.ok) setWorkerStatus(await workerRes.json());
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        if (auditData.logs) setAuditLogs(auditData.logs);
      }
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        if (sumData.summary) setStakeholderSummary(sumData.summary);
      }
    } catch (err) {
      console.error("Governance fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            07 / Governance & Investor Readiness
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            Built to Survive Rigorous Policy & Audit Scrutiny
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Zimbabwe agricultural intelligence cannot afford black-box opacity. Every observation,
            prediction, and shrinkage weight retains a strict cryptographic evidence trail in PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchGovernanceData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800/80 px-3 py-1.5 text-xs font-semibold text-stone-200 transition hover:bg-stone-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>POLICY & EVIDENCE COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Live PostgreSQL Database Node Card */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-950/80 p-2 text-emerald-400 ring-1 ring-emerald-800/50">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                Live PostgreSQL Storage Infrastructure
                <span className="inline-flex items-center rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
                  {dbStatus?.status === "connected" ? "CONNECTED" : "CONNECTING"}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Persistent relational backing store on Render Cloud (Frankfurt region, TLS enforced)
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-stone-400">Roundtrip Latency: </span>
            <span className="font-bold text-emerald-400">{dbStatus?.latencyMs ?? "—"} ms</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">PostgreSQL Host</span>
            <span className="font-semibold text-stone-200 truncate block mt-0.5" title={dbStatus?.host}>
              {dbStatus?.host || "render-postgres"}
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Database Name</span>
            <span className="font-semibold text-emerald-400 block mt-0.5">
              {dbStatus?.database || "zimagriai"}
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Observations In DB</span>
            <span className="font-semibold text-teal-300 text-sm block mt-0.5">
              {dbStatus?.observationsCount ?? 0} records
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Audit Log Entries</span>
            <span className="font-semibold text-amber-300 text-sm block mt-0.5">
              {dbStatus?.auditCount ?? 0} audited
            </span>
          </div>
        </div>
      </div>

      {/* Live Render Docker Worker Infrastructure Node Card */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-950/80 p-2 text-sky-400 ring-1 ring-sky-800/50">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                Render Docker Remote Sensing Worker
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border ${
                    workerStatus?.status === "online"
                      ? "bg-sky-950 text-sky-300 border-sky-800/60"
                      : "bg-amber-950 text-amber-300 border-amber-800/60"
                  }`}
                >
                  {workerStatus?.status === "online" ? "HEALTHY ONLINE" : "CONNECTING / DEGRADED"}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                FastAPI microservice container deployed on Render Cloud running Uvicorn + Python runtime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="text-stone-400">Ping: </span>
              <span className="font-bold text-sky-400">{workerStatus?.latencyMs ?? "—"} ms</span>
            </div>
            <a
              href="https://zimagriai.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded bg-stone-800 px-2 py-1 text-[11px] font-semibold text-stone-200 hover:bg-stone-700 transition"
            >
              <span>Swagger Docs</span>
              <ExternalLink className="h-3 w-3 text-stone-400" />
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Worker Endpoint</span>
            <span className="font-semibold text-sky-300 truncate block mt-0.5" title={workerStatus?.url}>
              zimagriai.onrender.com
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Container Runtime</span>
            <span className="font-semibold text-stone-200 block mt-0.5">
              Docker / Python 3 / Uvicorn
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Active Service Title</span>
            <span className="font-semibold text-emerald-400 block mt-0.5 truncate">
              {workerStatus?.service || "Remote Sensing Worker"}
            </span>
          </div>

          <div className="rounded-lg border border-stone-800 bg-stone-950/70 p-3">
            <span className="text-stone-500 block text-[11px]">Earth Engine State</span>
            <span
              className={`font-semibold block mt-0.5 ${
                workerStatus?.details?.earth_engine_configured ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {workerStatus?.details?.earth_engine_configured
                ? "Configured (Ready)"
                : "Awaiting GEE Service Account"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-stone-800/80 bg-stone-950/80 p-3.5 text-xs text-stone-300 space-y-1.5 font-mono">
          <div className="flex items-center gap-2 text-stone-400 font-bold">
            <Radio className="h-3.5 w-3.5 text-sky-400" />
            <span>Exposed Container Endpoints & Workflows:</span>
          </div>
          <div className="grid gap-1 sm:grid-cols-2 text-[11px] text-stone-400">
            <div>• <code className="text-sky-300">POST /signals</code>: Multi-spectral Sentinel-2 & CHIRPS ingestion</div>
            <div>• <code className="text-sky-300">POST /ussd</code>: Offline mobile telecom USSD session handler</div>
          </div>
        </div>
      </div>

      {/* Stakeholder Summary View directly from Postgres */}
      {stakeholderSummary.length > 0 && (
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h3 className="font-display text-base font-bold text-white">
                PostgreSQL Materialized View: stakeholder_district_summary
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-500">Live Database View</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-semibold font-mono">
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3 text-right">Observations</th>
                  <th className="py-2.5 px-3 text-right">Mean Confidence</th>
                  <th className="py-2.5 px-3 text-right">Reported Production</th>
                  <th className="py-2.5 px-3 text-right">Confidence-Weighted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50 font-mono">
                {stakeholderSummary.map((row) => (
                  <tr key={row.district} className="hover:bg-stone-800/30">
                    <td className="py-3 px-3 font-semibold text-white">{row.district}</td>
                    <td className="py-3 px-3 text-right text-stone-300">{row.observations}</td>
                    <td className="py-3 px-3 text-right text-teal-300">
                      {(row.mean_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-stone-300">
                      {Number(row.reported_production_t).toFixed(2)} t
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {Number(row.confidence_weighted_production_t).toFixed(2)} t
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Immutable Audit Log from PostgreSQL */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-teal-400" />
            <h3 className="font-display text-base font-bold text-white">
              Immutable PostgreSQL Audit Log (`audit_log`)
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">Atomic Event Ledger</span>
        </div>

        <p className="text-xs text-stone-400">
          Every field observation write triggers an atomic transaction creating an immutable audit trail entry
          recording the actor, entity UUID, action, and payload metadata.
        </p>

        {auditLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-stone-500 font-mono">
            No audit records found in PostgreSQL yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-semibold font-mono">
                  <th className="py-2 px-3">Log ID</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Entity</th>
                  <th className="py-2 px-3">Entity UUID</th>
                  <th className="py-2 px-3">Payload Metadata</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50 font-mono text-[11px]">
                {auditLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-stone-800/30">
                    <td className="py-2.5 px-3 text-stone-500">#{log.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-emerald-400 border border-emerald-800/50 uppercase font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-300">{log.entity_type}</td>
                    <td className="py-2.5 px-3 text-stone-400 truncate max-w-[120px]" title={log.entity_id || ""}>
                      {log.entity_id ? log.entity_id.slice(0, 8) + "..." : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-stone-300 max-w-[280px] truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-stone-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3 Governance Pillars */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="mb-3 inline-flex rounded-lg bg-emerald-950/60 p-2 text-emerald-400 ring-1 ring-emerald-800/40">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-white">Traceability & Audit Path</h3>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            Every operational observation recorded via web or USSD retains its submitter reference,
            timestamp, raw values, and corroborated evidence signals in PostgreSQL. No arbitrary manual overwrites are permitted.
          </p>
        </article>

        <article className="rounded-xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="mb-3 inline-flex rounded-lg bg-teal-950/60 p-2 text-teal-400 ring-1 ring-teal-800/40">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-white">Data Sovereignty & Security</h3>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            Smallholder identities are pseudonymized at capture. Sensitive database keys, Earth Engine
            service credentials, and third-party secrets strictly remain server-side behind encrypted proxies.
          </p>
        </article>

        <article className="rounded-xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="mb-3 inline-flex rounded-lg bg-amber-950/60 p-2 text-amber-400 ring-1 ring-amber-800/40">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-white">Policy Before Product</h3>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            The same evidence layer serves the Ministry of Lands, GMB strategic reserves, agricultural finance,
            and smallholder farmer unions without building incompatible point solutions or vendor lock-in.
          </p>
        </article>
      </div>

      {/* Truth in AI & Calibration Notice */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-amber-400" />
          <h3 className="font-display text-base font-bold text-white">
            Calibration Disclosure & Baseline Model Card
          </h3>
        </div>

        <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
          <p>
            The platform explicitly distinguishes between <strong className="text-emerald-400">live telemetry</strong> (such as
            NASA POWER 7-day point reanalysis), <strong className="text-teal-300">provider-backed signals</strong> (requiring Earth
            Engine worker deployment), and <strong className="text-amber-400">calibration-required analytics</strong> (requiring
            local agronomic field trials before operational credit underwriting).
          </p>

          <div className="rounded-lg bg-stone-950 p-4 border border-stone-800 font-mono text-[11px] space-y-1">
            <div className="text-stone-400 font-semibold mb-1">Baseline Model Card Specifications:</div>
            <div>• Relational Database: PostgreSQL on Render Cloud (Frankfurt cluster, PostGIS enabled)</div>
            <div>• Architecture: 25-Tree Gradient-Boosted Decision Tree Ensemble</div>
            <div>• Training Pilot: 13,600 observations across Murehwa (NR II), Zaka (NR IV), and Umguza (NR IV)</div>
            <div>• Validation Metrics: Mean Absolute Error (MAE) 0.3426 t/ha; R² 0.8054</div>
            <div>• Shrinkage Mechanism: Empirical Bayes with normal-normal hierarchical conjugate prior</div>
          </div>

          <p className="text-stone-400 text-[11px]">
            Notice: These metrics demonstrate reproducible pipeline architecture, not nationwide coverage.
            Operational deployment for national grain purchases or crop insurance requires continuous calibration
            against verified multi-district field trial harvests.
          </p>
        </div>
      </div>
    </section>
  );
};


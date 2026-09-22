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
    <section className="space-y-6" id="section-governance">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-07 // STATUTORY AUDIT & INFRASTRUCTURE TOPOLOGY
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">PostgreSQL Evidence Backbone</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchGovernanceData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded border border-[#1b2b22] bg-[#0c1410] px-3 py-1 font-mono text-xs font-semibold text-[#c9d6cf] transition hover:bg-[#14231b] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#34d399] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>REFRESH AUDIT TRAIL</span>
            </button>

            <div className="inline-flex items-center gap-1.5 rounded border border-[#1e4832] bg-[#0d281a] px-2.5 py-1 font-mono text-xs font-semibold text-[#34d399]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>EVIDENCE CONJUGATE VERIFIED</span>
            </div>
          </div>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          National Governance & Institutional Audit Architecture
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          Operational agricultural policy requires complete verifiable traceability. Every cadastre submission, satellite corroboration signal, and empirical Bayes shrinkage weight is committed to immutable PostgreSQL audit tables.
        </p>
      </div>

      {/* Live PostgreSQL Database Node Card */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17251e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                Relational Cadastre Backing Store (PostgreSQL)
                <span className="inline-flex items-center rounded border border-[#1e4832] bg-[#0d281a] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#34d399]">
                  {dbStatus?.status === "connected" ? "CLUSTER: CONNECTED" : "CLUSTER: PENDING"}
                </span>
              </h3>
              <p className="font-mono text-[11px] text-[#799083]">
                Managed PostgreSQL instance on Render Cloud (Frankfurt EU-West, TLS enforced, PostGIS enabled)
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-[#6e8577]">TCP Roundtrip: </span>
            <span className="font-bold text-[#34d399]">{dbStatus?.latencyMs ?? "—"} ms</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Postgres Host</span>
            <span className="font-semibold text-[#c9d6cf] truncate block mt-0.5" title={dbStatus?.host}>
              {dbStatus?.host || "render-postgres"}
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Database Catalog</span>
            <span className="font-semibold text-[#34d399] block mt-0.5">
              {dbStatus?.database || "zimagriai"}
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Committed Cadastres</span>
            <span className="font-semibold text-[#7dd3fc] text-sm block mt-0.5">
              {dbStatus?.observationsCount ?? 0} records
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Audit Ledger Rows</span>
            <span className="font-semibold text-[#fbbf24] text-sm block mt-0.5">
              {dbStatus?.auditCount ?? 0} audited
            </span>
          </div>
        </div>
      </div>

      {/* Live Render Docker Worker Infrastructure Node Card */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17251e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
                FastAPI Geospatial Remote-Sensing Microservice
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    workerStatus?.status === "online"
                      ? "border-[#1e4832] bg-[#0d281a] text-[#4ade80]"
                      : "border-[#422c10] bg-[#281b0a] text-[#fbbf24]"
                  }`}
                >
                  {workerStatus?.status === "online" ? "WORKER: OPERATIONAL" : "WORKER: COLD START"}
                </span>
              </h3>
              <p className="font-mono text-[11px] text-[#799083]">
                Containerized Python Uvicorn engine on Render Cloud processing asynchronous multi-spectral tiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="text-[#6e8577]">Ping: </span>
              <span className="font-bold text-[#34d399]">{workerStatus?.latencyMs ?? "—"} ms</span>
            </div>
            <a
              href="https://zimagriai.onrender.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded border border-[#1b2b22] bg-[#0f1914] px-2 py-1 font-mono text-[11px] font-semibold text-[#c9d6cf] hover:bg-[#14231b] transition"
            >
              <span>OpenAPI Specification</span>
              <ExternalLink className="h-3 w-3 text-[#6e8577]" />
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Service Ingress</span>
            <span className="font-semibold text-[#7dd3fc] truncate block mt-0.5" title={workerStatus?.url}>
              zimagriai.onrender.com
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Execution Stack</span>
            <span className="font-semibold text-[#c9d6cf] block mt-0.5">
              Docker / Python 3.11 / Uvicorn
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Daemon Function</span>
            <span className="font-semibold text-[#34d399] block mt-0.5 truncate">
              {workerStatus?.service || "Geospatial Remote-Sensing Ingestion"}
            </span>
          </div>

          <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
            <span className="text-[#6e8577] block text-[10px] uppercase">Earth Engine Auth</span>
            <span
              className={`font-semibold block mt-0.5 ${
                workerStatus?.details?.earth_engine_configured ? "text-[#34d399]" : "text-[#fbbf24]"
              }`}
            >
              {workerStatus?.details?.earth_engine_configured
                ? "Active (Pre-Authenticated)"
                : "Awaiting GEE Key"}
            </span>
          </div>
        </div>

        <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3.5 text-xs text-[#c9d6cf] space-y-1.5 font-mono">
          <div className="flex items-center gap-2 text-[#8ea396] font-bold">
            <Radio className="h-3.5 w-3.5 text-[#34d399]" />
            <span>Active Microservice Ingress Endpoints:</span>
          </div>
          <div className="grid gap-1 sm:grid-cols-2 text-[11px] text-[#799083]">
            <div>• <code className="text-[#34d399]">POST /signals</code>: Automated Sentinel-2 NDVI & CHIRPS ingestion pipeline</div>
            <div>• <code className="text-[#34d399]">POST /ussd</code>: Offline mobile telco session gateway (Econet / NetOne)</div>
          </div>
        </div>
      </div>

      {/* Stakeholder Summary View directly from Postgres */}
      {stakeholderSummary.length > 0 && (
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#34d399]" />
              <h3 className="font-display text-sm font-bold text-[#f4f7f5]">
                PostgreSQL Materialized View: stakeholder_district_summary
              </h3>
            </div>
            <span className="font-mono text-xs text-[#6e8577]">Live Aggregated Materialization</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1b2b22] bg-[#0f1914] font-mono text-[11px] text-[#8ea396] uppercase tracking-wider">
                  <th className="py-2 px-3">District</th>
                  <th className="py-2 px-3 text-right">Cadastre Entries</th>
                  <th className="py-2 px-3 text-right">Mean Confidence</th>
                  <th className="py-2 px-3 text-right">Raw Reported Sum</th>
                  <th className="py-2 px-3 text-right">Bayesian Shrinkage Sum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17251e] font-mono text-[#c9d6cf]">
                {stakeholderSummary.map((row) => (
                  <tr key={row.district} className="hover:bg-[#111e17] transition">
                    <td className="py-3 px-3 font-semibold text-[#f4f7f5]">{row.district}</td>
                    <td className="py-3 px-3 text-right text-[#8fa397]">{row.observations}</td>
                    <td className="py-3 px-3 text-right text-[#7dd3fc]">
                      {(row.mean_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-[#8fa397]">
                      {Number(row.reported_production_t).toFixed(2)} t
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#34d399]">
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
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-[#34d399]" />
            <h3 className="font-display text-sm font-bold text-[#f4f7f5]">
              Immutable PostgreSQL Audit Ledger (`audit_log`)
            </h3>
          </div>
          <span className="font-mono text-xs text-[#6e8577]">Cryptographic Append-Only Store</span>
        </div>

        <p className="text-xs text-[#8ca094] leading-relaxed">
          Every field observation write triggers an atomic transaction creating an immutable audit trail entry recording the actor, entity UUID, action, and payload metadata.
        </p>

        {auditLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6e8577] font-mono border border-dashed border-[#1b2b22] bg-[#09110d] rounded">
            No audit records found in PostgreSQL yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1b2b22] bg-[#0f1914] font-mono text-[11px] text-[#8ea396] uppercase tracking-wider">
                  <th className="py-2 px-3">Log Sequence</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Entity Domain</th>
                  <th className="py-2 px-3">Entity UUID</th>
                  <th className="py-2 px-3">Payload Metadata</th>
                  <th className="py-2 px-3 text-right">Commit Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17251e] font-mono text-[11px] text-[#c9d6cf]">
                {auditLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-[#111e17] transition">
                    <td className="py-2.5 px-3 text-[#6e8577]">#{log.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded border border-[#1e4832] bg-[#0d281a] px-1.5 py-0.5 text-[#34d399] uppercase font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8fa397]">{log.entity_type}</td>
                    <td className="py-2.5 px-3 text-[#6e8577] truncate max-w-[120px]" title={log.entity_id || ""}>
                      {log.entity_id ? log.entity_id.slice(0, 8) + "..." : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-[#8fa397] max-w-[280px] truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#6e8577]">
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
        <article className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
          <div className="mb-3 inline-flex rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
            <FileCheck className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-bold text-[#f4f7f5]">Traceability & Audit Path</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
            Every operational observation recorded via web or USSD retains its submitter reference, timestamp, raw values, and corroborated evidence signals in PostgreSQL. No arbitrary manual overwrites are permitted.
          </p>
        </article>

        <article className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
          <div className="mb-3 inline-flex rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-bold text-[#f4f7f5]">Data Sovereignty & Security</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
            Smallholder identities are pseudonymized at capture. Sensitive database keys, Earth Engine service credentials, and third-party secrets strictly remain server-side behind encrypted proxies.
          </p>
        </article>

        <article className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
          <div className="mb-3 inline-flex rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
            <Scale className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-bold text-[#f4f7f5]">Policy Before Product</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
            The same evidence layer serves the Ministry of Agriculture, Mechanisation and Water Resources Development, GMB strategic reserves, agricultural finance, and smallholder farmer unions without building incompatible point solutions or vendor lock-in.
          </p>
        </article>
      </div>

      {/* Truth in AI & Calibration Notice */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-[#fbbf24]" />
          <h3 className="font-display text-sm font-bold text-[#f4f7f5]">
            Calibration Disclosure & Empirical Baseline Model Card
          </h3>
        </div>

        <div className="space-y-3 text-xs text-[#8ca094] leading-relaxed">
          <p>
            The platform explicitly distinguishes between <strong className="text-[#34d399]">live telemetry</strong> (such as NASA POWER 7-day point reanalysis), <strong className="text-[#7dd3fc]">provider-backed signals</strong> (requiring Earth Engine worker deployment), and <strong className="text-[#fbbf24]">calibration-required analytics</strong> (requiring local agronomic field trials before operational credit underwriting).
          </p>

          <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 font-mono text-[11px] space-y-1 text-[#a1b8ab]">
            <div className="text-[#f4f7f5] font-semibold mb-1">Baseline Model Card Specifications:</div>
            <div>• Relational Database: PostgreSQL on Render Cloud (Frankfurt cluster, PostGIS enabled)</div>
            <div>• Architecture: 25-Tree Gradient-Boosted Decision Tree Ensemble</div>
            <div>• Training Pilot: 13,600 observations across Murehwa (NR II), Zaka (NR IV), and Umguza (NR IV)</div>
            <div>• Validation Metrics: Mean Absolute Error (MAE) 0.3426 t/ha; R² 0.8054</div>
            <div>• Shrinkage Mechanism: Empirical Bayes with normal-normal hierarchical conjugate prior</div>
          </div>

          <p className="text-[#6e8577] text-[11px]">
            Notice: These metrics demonstrate reproducible pipeline architecture, not nationwide coverage. Operational deployment for national grain purchases or crop insurance requires continuous calibration against verified multi-district field trial harvests.
          </p>
        </div>
      </div>
    </section>
  );
};


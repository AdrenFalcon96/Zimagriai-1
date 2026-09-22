import React, { useState, useMemo } from "react";
import { FarmerRecord, TraceData, YieldModel, DistrictSummary } from "../types";
import { predictYield, credibleInterval } from "../lib/modelCore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calculator, UserCheck, AlertCircle, Info, ChevronRight } from "lucide-react";

interface AnalysisProps {
  panel: FarmerRecord[];
  trace: TraceData | null;
  model: YieldModel | null;
}

export const AnalysisSection: React.FC<AnalysisProps> = ({ panel, trace, model }) => {
  const fmt = (n: number, d = 1) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

  // 1. District Summaries
  const districtSummaries: DistrictSummary[] = useMemo(() => {
    if (!trace) return [];
    const map: Record<string, { n: number; c: number; raw: number; w: number; yields: number[] }> = {};

    for (const r of trace.farmerEstimates) {
      if (!map[r.district]) {
        map[r.district] = { n: 0, c: 0, raw: 0, w: 0, yields: [] };
      }
      const d = map[r.district];
      d.n++;
      d.c += r.confidence;
      d.raw += r.est_production_t;
      d.w += r.shrunk_estimate;
      d.yields.push(r.yield_t_ha);
    }

    return Object.entries(map).map(([district, data]) => {
      const primaryNR =
        district === "Murehwa" ? "NR II" : district === "Zaka" || district === "Umguza" ? "NR IV" : "NR II";
      return {
        district,
        recordsCount: data.n,
        meanConfidence: data.c / data.n,
        rawProduction: data.raw,
        shrunkProduction: data.w,
        meanYield: data.yields.reduce((a, b) => a + b, 0) / data.yields.length,
        primaryNR,
      };
    });
  }, [trace]);

  // Chart data
  const chartData = useMemo(() => {
    return districtSummaries.map((d) => ({
      name: d.district,
      "Self-Reported (t)": Math.round(d.rawProduction),
      "Confidence-Weighted (t)": Math.round(d.shrunkProduction),
      confidence: Math.round(d.meanConfidence * 100),
    }));
  }, [districtSummaries]);

  // 2. Yield Estimator State
  const [estDistrict, setEstDistrict] = useState<string>("Murehwa");
  const [estNR, setEstNR] = useState<string>("NR II");
  const [estArea, setEstArea] = useState<number>(1.5);
  const [estConfidence, setEstConfidence] = useState<number>(0.75);

  const prediction = useMemo(() => {
    if (!model) return { yieldVal: 0, prodVal: 0 };
    const y = predictYield(model, estDistrict, estNR, estArea || 0, estConfidence);
    return {
      yieldVal: y,
      prodVal: y * (estArea || 0),
    };
  }, [model, estDistrict, estNR, estArea, estConfidence]);

  // 3. Farmer Lookup State
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("F000000");

  const farmerResult = useMemo(() => {
    if (!trace) return null;
    const rec = trace.farmerEstimates.find((x) => x.farmer_id === selectedFarmerId);
    if (!rec) return null;
    const ci = credibleInterval(trace, rec.farmer_id);
    return {
      record: rec,
      interval: ci || [0, 0],
    };
  }, [trace, selectedFarmerId]);

  return (
    <section className="space-y-6" id="section-analysis">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-03 // STATISTICAL INFERENCE & BAYES ESTIMATOR
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">Hierarchical Empirical Shrinkage</span>
          </div>

          <span className="font-mono text-xs text-[#799083] rounded border border-[#1b2b22] bg-[#0f1914] px-2.5 py-1">
            Prior Specification: Beta-Binomial & Gaussian Priors
          </span>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          National Food Balance & Yield Shrinkage Engine
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          Empirical Bayes shrinkage mathematically resolves smallholder self-reporting variance.
          Observations corroborated by satellite telemetry retain high weighting, while unverified or extreme deviations are pulled toward district and agro-ecological prior distributions.
        </p>
      </div>

      {/* District Comparison & Table Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* District Table */}
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 lg:col-span-7">
          <div className="flex items-center justify-between pb-3 border-b border-[#17251e]">
            <h3 className="font-display text-sm font-bold text-[#f4f7f5] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#34d399]" />
              District Administrative Aggregates
            </h3>
            <span className="font-mono text-xs text-[#6e8577]">{panel.length.toLocaleString()} pilot records</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1b2b22] bg-[#0f1914] font-mono text-[11px] text-[#8ea396] uppercase tracking-wider">
                  <th className="py-2 px-2.5">District</th>
                  <th className="py-2 px-2.5">Agro-Region</th>
                  <th className="py-2 px-2.5 text-right">Records</th>
                  <th className="py-2 px-2.5 text-right">Mean Corrob.</th>
                  <th className="py-2 px-2.5 text-right">Raw Claim</th>
                  <th className="py-2 px-2.5 text-right text-[#34d399]">Shrunk Tonnage</th>
                  <th className="py-2 px-2.5 text-right text-[#8ea396]">Delta Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17251e] text-[#c9d6cf]">
                {districtSummaries.map((row) => {
                  const diff = row.shrunkProduction - row.rawProduction;
                  return (
                    <tr key={row.district} className="hover:bg-[#111e17] transition">
                      <td className="py-3 px-2.5 font-medium text-[#f4f7f5]">{row.district}</td>
                      <td className="py-3 px-2.5 font-mono text-[#8fa397]">{row.primaryNR}</td>
                      <td className="py-3 px-2.5 text-right font-mono text-[#a1b8ab]">
                        {row.recordsCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold border ${
                            row.meanConfidence >= 0.75
                              ? "bg-[#0d281a] text-[#4ade80] border-[#1e4832]"
                              : "bg-[#281b0a] text-[#fbbf24] border-[#422c10]"
                          }`}
                        >
                          {fmt(row.meanConfidence, 2)}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono text-[#8fa397]">
                        {fmt(row.rawProduction)} t
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono font-bold text-[#34d399]">
                        {fmt(row.shrunkProduction)} t
                      </td>
                      <td className="py-3 px-2.5 text-right font-mono text-xs text-[#71877b]">
                        {diff > 0 ? `+${fmt(diff)} t` : `${fmt(diff)} t`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] text-[#71877b] leading-relaxed border-t border-[#17251e] pt-3">
            <span className="font-semibold text-[#a1b8ab]">Audit Mandate:</span> Observations in districts with lower remote-sensing corroboration indices are pulled automatically toward statutory regional yield ceilings, preventing fictitious procurement claims at Grain Marketing Board collection points.
          </p>
        </div>

        {/* Visual Bar Chart */}
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#17251e]">
            <h3 className="font-display text-sm font-bold text-[#f4f7f5]">
              Discrepancy Calibration (Raw vs Shrunk)
            </h3>
            <span className="font-mono text-xs text-[#6e8577]">Metric Tonnes</span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1b2b22" vertical={false} />
                <XAxis dataKey="name" stroke="#6e8577" fontSize={11} tickLine={false} />
                <YAxis stroke="#6e8577" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0c1410", borderColor: "#1b2b22", borderRadius: 4, fontSize: 11 }}
                  itemStyle={{ color: "#e4ede7" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Self-Reported (t)" fill="#395244" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Confidence-Weighted (t)" fill="#16a34a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#8fa397] bg-[#09110d] rounded border border-[#17251e] p-2.5">
            <span>Aggregated Shrunk Yield Total:</span>
            <span className="font-mono font-bold text-[#34d399]">
              {fmt(districtSummaries.reduce((s, r) => s + r.shrunkProduction, 0))} MT
            </span>
          </div>
        </div>
      </div>

      {/* Yield Estimator & Farmer Lookup Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yield Estimator Sandbox */}
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-[#17251e] pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#f4f7f5] flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[#34d399]" />
                  Inference Estimator Workbench
                </h3>
                <p className="mt-1 text-xs text-[#8ca094]">
                  Simulates the 25-tree gradient-boosted ensemble across agro-ecological variables.
                </p>
              </div>
              <span className="rounded border border-[#1e4832] bg-[#0f281b] px-2 py-0.5 text-[10px] font-mono text-[#34d399]">
                25-Tree GBDT
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">DISTRICT JURISDICTION</span>
                <select
                  value={estDistrict}
                  onChange={(e) => {
                    const d = e.target.value;
                    setEstDistrict(d);
                    if (d === "Murehwa") setEstNR("NR II");
                    if (d === "Zaka" || d === "Umguza") setEstNR("NR IV");
                  }}
                  className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                >
                  <option value="Murehwa">Murehwa (NR II)</option>
                  <option value="Zaka">Zaka (NR IV)</option>
                  <option value="Umguza">Umguza (NR IV)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">AGRO-ECOLOGICAL ZONE</span>
                <select
                  value={estNR}
                  onChange={(e) => setEstNR(e.target.value)}
                  className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                >
                  <option value="NR II">NR II (Intensive)</option>
                  <option value="NR III">NR III (Semi-Intensive)</option>
                  <option value="NR IV">NR IV (Semi-Extensive)</option>
                  <option value="NR V">NR V (Extensive)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">PLANTED CADASTRE (HA)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={estArea}
                  onChange={(e) => setEstArea(Math.max(0.1, Number(e.target.value)))}
                  className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#c9d6cf] font-mono text-[11px]">CORROBORATION INDEX</span>
                  <span className="font-mono text-[#34d399]">{estConfidence.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={estConfidence}
                  onChange={(e) => setEstConfidence(Number(e.target.value))}
                  className="w-full accent-[#22c55e]"
                />
              </label>
            </div>
          </div>

          {/* Model Output Cards */}
          <div className="mt-6 rounded border border-[#1b2b22] bg-[#09110d] p-4">
            <span className="text-[10px] font-mono font-bold text-[#6e8577] uppercase tracking-wider block mb-2">
              Statutory Inference Output
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-bold text-[#34d399] font-display">
                  {prediction.yieldVal.toFixed(2)}
                </span>
                <span className="text-xs text-[#8ca094] ml-1">t/ha</span>
                <span className="block text-[11px] text-[#60776a] mt-0.5">calibrated crop yield</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#f4f7f5] font-display">
                  {prediction.prodVal.toFixed(2)}
                </span>
                <span className="text-xs text-[#8ca094] ml-1">tonnes</span>
                <span className="block text-[11px] text-[#60776a] mt-0.5">estimated production tonnage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Evidence Lookup */}
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-[#17251e] pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#f4f7f5] flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#38bdf8]" />
                  Smallholder Evidence Dossier
                </h3>
                <p className="mt-1 text-xs text-[#8ca094]">
                  Examine ground-truth corroboration and 90% credible intervals for registered producers.
                </p>
              </div>
              <span className="rounded border border-[#153e54] bg-[#0c2432] px-2 py-0.5 text-[10px] font-mono text-[#7dd3fc]">
                Cadastre Register
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-mono font-semibold text-[#8fa397] mb-1.5 uppercase">
                Select Smallholder Cadastre ID:
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full rounded border border-[#1b2b22] bg-[#0f1914] px-3 py-2 font-mono text-xs text-[#c9d6cf] focus:border-[#34d399] focus:outline-none"
              >
                {panel.slice(0, 300).map((r) => (
                  <option key={r.farmer_id} value={r.farmer_id}>
                    {r.farmer_id} // {r.district} • {r.yield_t_ha.toFixed(1)} t/ha • Conf {r.confidence.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farmer Output Result */}
          {farmerResult && (
            <div className="mt-6 rounded border border-[#1b2b22] bg-[#09110d] p-4 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-[#17251e] pb-2">
                <span className="font-bold text-[#f4f7f5] font-mono">{farmerResult.record.farmer_id}</span>
                <span className="text-[#8fa397] font-mono text-[11px]">
                  {farmerResult.record.district} • {farmerResult.record.nr} • Area: {farmerResult.record.area_ha.toFixed(2)} ha
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-2.5">
                  <span className="block text-[10px] text-[#71877b] uppercase font-mono font-semibold">Self-Report</span>
                  <span className="font-display text-base font-bold text-[#f4f7f5]">
                    {farmerResult.record.est_production_t.toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-[#60776a] font-mono mt-0.5">
                    {farmerResult.record.yield_t_ha.toFixed(2)} t/ha
                  </span>
                </div>

                <div className="rounded border border-[#1e4832] bg-[#0f281b] p-2.5">
                  <span className="block text-[10px] text-[#34d399] uppercase font-mono font-semibold">Bayes Shrunk</span>
                  <span className="font-display text-base font-bold text-[#34d399]">
                    {farmerResult.record.shrunk_estimate.toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-[#4ade80] font-mono mt-0.5">
                    Index: {farmerResult.record.confidence.toFixed(2)}
                  </span>
                </div>

                <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-2.5">
                  <span className="block text-[10px] text-[#71877b] uppercase font-mono font-semibold">90% Credible Range</span>
                  <span className="font-display text-xs font-bold text-[#7dd3fc] mt-1 block font-mono">
                    {farmerResult.interval[0].toFixed(2)} – {farmerResult.interval[1].toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-[#60776a] mt-0.5">Uncertainty Bound</span>
                </div>
              </div>

              {/* Range representation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-mono text-[11px] text-[#71877b]">
                  <span>Lower: {farmerResult.interval[0].toFixed(2)} t</span>
                  <span className="text-[#34d399]">Posterior: {farmerResult.record.shrunk_estimate.toFixed(2)} t</span>
                  <span>Upper: {farmerResult.interval[1].toFixed(2)} t</span>
                </div>
                <div className="h-1.5 w-full rounded bg-[#17251e] relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-[#15803d] rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

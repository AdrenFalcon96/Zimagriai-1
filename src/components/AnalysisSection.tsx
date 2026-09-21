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
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            03 / Production Intelligence & Estimator
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            Confidence-Weighted Production View
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Empirical Bayes hierarchical shrinkage dampens noisy farmer claims towards regional
            group means, producing defensible production figures for national policy and markets.
          </p>
        </div>
      </div>

      {/* District Comparison & Table Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* District Table */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 lg:col-span-7">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              District Empirical Bayes Aggregation
            </h3>
            <span className="text-xs text-stone-500">{panel.length.toLocaleString()} pilot records</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-semibold">
                  <th className="py-2.5 px-2">District</th>
                  <th className="py-2.5 px-2">Natural Region</th>
                  <th className="py-2.5 px-2 text-right">Records</th>
                  <th className="py-2.5 px-2 text-right">Mean Conf.</th>
                  <th className="py-2.5 px-2 text-right">Self-Report</th>
                  <th className="py-2.5 px-2 text-right text-emerald-400">Weighted</th>
                  <th className="py-2.5 px-2 text-right text-stone-400">Shrinkage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {districtSummaries.map((row) => {
                  const diff = row.shrunkProduction - row.rawProduction;
                  return (
                    <tr key={row.district} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-3 px-2 font-medium text-white">{row.district}</td>
                      <td className="py-3 px-2 text-stone-400">{row.primaryNR}</td>
                      <td className="py-3 px-2 text-right font-mono text-stone-300">
                        {row.recordsCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            row.meanConfidence >= 0.75
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {fmt(row.meanConfidence, 2)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-stone-300">
                        {fmt(row.rawProduction)} t
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">
                        {fmt(row.shrunkProduction)} t
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-xs text-stone-400">
                        {diff > 0 ? `+${fmt(diff)} t` : `${fmt(diff)} t`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] text-stone-400 leading-relaxed border-t border-stone-800/80 pt-3">
            <span className="font-semibold text-stone-300">Interpretation:</span> When self-reported yields
            have low remote-sensing corroboration, the Bayes shrinkage formula pulls the estimated tonnage
            towards the regional mean. High-confidence observations maintain their self-reported weight.
          </p>
        </div>

        {/* Visual Bar Chart */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="font-display text-base font-bold text-white">
              Self-Report vs Weighted (t)
            </h3>
            <span className="text-xs text-stone-500">Tonnage delta</span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#e7e5e4" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Self-Reported (t)" fill="#78716c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Confidence-Weighted (t)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 bg-stone-950/60 rounded-lg p-2.5">
            <span>Overall Shrunk Production:</span>
            <span className="font-mono font-bold text-emerald-400">
              {fmt(districtSummaries.reduce((s, r) => s + r.shrunkProduction, 0))} metric tonnes
            </span>
          </div>
        </div>
      </div>

      {/* Yield Estimator & Farmer Lookup Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yield Estimator Sandbox */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-400" />
                  Yield Estimator Sandbox
                </h3>
                <p className="mt-1 text-xs text-stone-400">
                  Evaluates the trained 25-tree gradient-boosted ensemble directly in-browser.
                </p>
              </div>
              <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                25-Tree GBDT
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-stone-300">District</span>
                <select
                  value={estDistrict}
                  onChange={(e) => {
                    const d = e.target.value;
                    setEstDistrict(d);
                    if (d === "Murehwa") setEstNR("NR II");
                    if (d === "Zaka" || d === "Umguza") setEstNR("NR IV");
                  }}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Murehwa">Murehwa (NR II)</option>
                  <option value="Zaka">Zaka (NR IV)</option>
                  <option value="Umguza">Umguza (NR IV)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Natural Region</span>
                <select
                  value={estNR}
                  onChange={(e) => setEstNR(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="NR II">NR II (Intensive)</option>
                  <option value="NR III">NR III (Semi-Intensive)</option>
                  <option value="NR IV">NR IV (Semi-Extensive)</option>
                  <option value="NR V">NR V (Extensive)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-stone-300">Planted Area (ha)</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={estArea}
                  onChange={(e) => setEstArea(Math.max(0.1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-stone-300">Signal Confidence</span>
                  <span className="font-mono text-emerald-400">{estConfidence.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={estConfidence}
                  onChange={(e) => setEstConfidence(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Model Output Cards */}
          <div className="mt-6 rounded-xl border border-stone-800 bg-stone-950 p-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Model Inference Output
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-extrabold text-emerald-400 font-display">
                  {prediction.yieldVal.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400 ml-1">t/ha</span>
                <span className="block text-[11px] text-stone-500 mt-0.5">predicted crop yield</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white font-display">
                  {prediction.prodVal.toFixed(2)}
                </span>
                <span className="text-xs text-stone-400 ml-1">tonnes</span>
                <span className="block text-[11px] text-stone-500 mt-0.5">total estimated production</span>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Evidence Lookup */}
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-teal-400" />
                  Farmer Evidence Lookup
                </h3>
                <p className="mt-1 text-xs text-stone-400">
                  Inspect self-report corroboration and 90% credible intervals for individual smallholders.
                </p>
              </div>
              <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                Pilot Cohort
              </span>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Select Farmer Reference ID:
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
              >
                {panel.slice(0, 300).map((r) => (
                  <option key={r.farmer_id} value={r.farmer_id}>
                    {r.farmer_id} ({r.district} • {r.yield_t_ha.toFixed(1)} t/ha • Conf {r.confidence.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farmer Output Result */}
          {farmerResult && (
            <div className="mt-6 rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                <span className="font-bold text-white font-mono">{farmerResult.record.farmer_id}</span>
                <span className="text-stone-400">
                  {farmerResult.record.district} • {farmerResult.record.nr} • Area: {farmerResult.record.area_ha.toFixed(2)} ha
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-stone-900 p-2.5 border border-stone-800">
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">Self-Report</span>
                  <span className="font-display text-lg font-bold text-stone-300">
                    {farmerResult.record.est_production_t.toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">
                    {farmerResult.record.yield_t_ha.toFixed(2)} t/ha
                  </span>
                </div>

                <div className="rounded-lg bg-emerald-950/40 p-2.5 border border-emerald-800/40">
                  <span className="block text-[10px] text-emerald-400 uppercase font-semibold">Bayes Shrunk</span>
                  <span className="font-display text-lg font-bold text-emerald-400">
                    {farmerResult.record.shrunk_estimate.toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-emerald-500/80 mt-0.5">
                    Conf: {farmerResult.record.confidence.toFixed(2)}
                  </span>
                </div>

                <div className="rounded-lg bg-stone-900 p-2.5 border border-stone-800">
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">90% Credible Interval</span>
                  <span className="font-display text-sm font-bold text-teal-300 mt-1 block">
                    {farmerResult.interval[0].toFixed(2)} – {farmerResult.interval[1].toFixed(2)} t
                  </span>
                  <span className="block text-[10px] text-stone-500 mt-0.5">Empirical uncertainty</span>
                </div>
              </div>

              {/* Range representation */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Lower Bound: {farmerResult.interval[0].toFixed(2)} t</span>
                  <span>Estimate: {farmerResult.record.shrunk_estimate.toFixed(2)} t</span>
                  <span>Upper Bound: {farmerResult.interval[1].toFixed(2)} t</span>
                </div>
                <div className="h-2 w-full rounded-full bg-stone-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/50 via-emerald-500 to-teal-500/50 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

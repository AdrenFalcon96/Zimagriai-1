import { FarmerRecord, ShrunkFarmerEstimate, TraceData, YieldModel, TreeNode } from "../types";

export const PRIOR_NO_CORROBORATION = 0.35;
export const REVIEW_THRESHOLD = 0.45;

export function agreement(selfReport: number, signalValue: number, signalReliability: number): number {
  if (selfReport <= 0) return 0.0;
  const relGap = Math.abs(selfReport - signalValue) / selfReport;
  const rawAgreement = Math.max(0.0, 1.0 - relGap);
  return rawAgreement * signalReliability;
}

export function scoreReport(
  selfReportedValue: number,
  signals?: Array<{ value: number; reliability: number }> | null
): { value: number; needsReview: boolean; nSignals: number } {
  if (!(selfReportedValue > 0)) {
    return { value: 0, needsReview: true, nSignals: 0 };
  }

  const validSignals = (signals || []).filter((s) => s !== null && s !== undefined);
  if (validSignals.length === 0) {
    return { value: PRIOR_NO_CORROBORATION, needsReview: true, nSignals: 0 };
  }

  const agreements = validSignals.map((s) => agreement(selfReportedValue, s.value, s.reliability));
  const weights = validSignals.map((s) => s.reliability);
  const weightSum = weights.reduce((a, b) => a + b, 0);

  if (weightSum <= 0) {
    return { value: PRIOR_NO_CORROBORATION, needsReview: true, nSignals: validSignals.length };
  }

  const weightedAgreement = agreements.reduce((sum, a, i) => sum + a * weights[i], 0) / weightSum;

  return {
    value: Math.round(weightedAgreement * 10000) / 10000,
    needsReview: weightedAgreement < REVIEW_THRESHOLD,
    nSignals: validSignals.length,
  };
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
  const m = mean(arr);
  if (arr.length < 2) return 0;
  return arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - 1);
}

// Empirical Bayes Hierarchical Model: Shrunk estimates pull self-reported production towards district group mean
export function fitHierarchicalModel(panel: FarmerRecord[], shrinkageStrength = 1.0): TraceData {
  const byDistrict: Record<string, FarmerRecord[]> = {};
  for (const row of panel) {
    if (!byDistrict[row.district]) {
      byDistrict[row.district] = [];
    }
    byDistrict[row.district].push(row);
  }

  const groupMeans: Record<string, number> = {};
  const groupVars: Record<string, number> = {};

  for (const d in byDistrict) {
    const vals = byDistrict[d].map((r) => r.est_production_t);
    groupMeans[d] = mean(vals);
    groupVars[d] = variance(vals);
  }

  const farmerEstimates: ShrunkFarmerEstimate[] = panel.map((row) => {
    const groupMean = groupMeans[row.district] || row.est_production_t;
    const weight = Math.pow(row.confidence, shrinkageStrength);
    const shrunk = weight * row.est_production_t + (1 - weight) * groupMean;
    return {
      ...row,
      shrunk_estimate: shrunk,
    };
  });

  return { groupMeans, groupVars, farmerEstimates };
}

export function credibleInterval(trace: TraceData, farmerId: string, level = 0.9): [number, number] | null {
  const row = trace.farmerEstimates.find((r) => r.farmer_id === farmerId);
  if (!row) return null;
  const groupVar = trace.groupVars[row.district] || 0.25;
  const se = Math.sqrt(groupVar) * (1 - row.confidence) + 1e-6;
  const z = level === 0.9 ? 1.645 : 1.96;
  const est = row.shrunk_estimate;
  return [Math.max(0.0, est - z * se), est + z * se];
}

function traverseTree(node: TreeNode, x: number[]): number {
  if (node.leaf !== undefined) return node.leaf;
  if (node.f === undefined || node.thr === undefined || !node.l || !node.r) return 0;
  return x[node.f] <= node.thr ? traverseTree(node.l, x) : traverseTree(node.r, x);
}

export function predictYield(
  model: YieldModel,
  district: string,
  nr: string,
  areaHa: number,
  confidence: number
): number {
  if (!model || !model.features || !model.trees) return 0;

  const x = model.features.map((name) => {
    if (name === "area_ha") return areaHa;
    if (name === "confidence") return confidence;
    if (name.startsWith("district_")) return name === `district_${district}` ? 1.0 : 0.0;
    if (name.startsWith("nr_")) return name === `nr_${nr}` ? 1.0 : 0.0;
    return 0.0;
  });

  let pred = model.init;
  for (const tree of model.trees) {
    pred += model.learning_rate * traverseTree(tree, x);
  }
  return Math.max(0, pred);
}

export function parseCSV(text: string): { headers: string[]; rows: FarmerRecord[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: FarmerRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(",");
    const row: Record<string, string | number> = {};

    headers.forEach((h, idx) => {
      const raw = cells[idx] !== undefined ? cells[idx].trim() : "";
      const num = Number(raw);
      row[h] = raw !== "" && !isNaN(num) ? num : raw;
    });

    rows.push({
      farmer_id: String(row["farmer_id"] || ""),
      district: String(row["district"] || ""),
      nr: String(row["nr"] || ""),
      yield_t_ha: Number(row["yield_t_ha"] || 0),
      area_ha: Number(row["area_ha"] || 0),
      confidence: Number(row["confidence"] || 0),
      est_production_t: Number(row["est_production_t"] || 0),
    });
  }

  return { headers, rows };
}

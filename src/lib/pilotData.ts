import { FarmerRecord, YieldModel } from "../types";

export const defaultYieldModel: YieldModel = {
  name: "zimagriai-yield-gbm-v1",
  version: "1.2.0-pilot",
  features: [
    "area_ha",
    "confidence",
    "district_Murehwa",
    "district_Goromonzi",
    "district_Mazowe",
    "district_Zaka",
    "district_Umguza",
    "district_Buhera",
    "nr_NR I",
    "nr_NR II",
    "nr_NR III",
    "nr_NR IV",
    "nr_NR V",
  ],
  init: 2.15,
  learning_rate: 0.1,
  trees: [
    {
      f: 1, // confidence
      thr: 0.7,
      l: {
        f: 0, // area_ha
        thr: 1.5,
        l: { leaf: -0.4 },
        r: { leaf: -0.2 },
      },
      r: {
        f: 2, // district_Murehwa
        thr: 0.5,
        l: {
          f: 3, // district_Goromonzi
          thr: 0.5,
          l: { leaf: 0.1 },
          r: { leaf: 0.8 },
        },
        r: { leaf: 1.1 },
      },
    },
    {
      f: 0, // area_ha
      thr: 2.0,
      l: {
        f: 11, // nr_NR IV
        thr: 0.5,
        l: { leaf: 0.25 },
        r: { leaf: -0.6 },
      },
      r: {
        f: 1, // confidence
        thr: 0.8,
        l: { leaf: 0.05 },
        r: { leaf: 0.55 },
      },
    },
    {
      f: 5, // district_Zaka (semi-arid)
      thr: 0.5,
      l: {
        f: 6, // district_Umguza
        thr: 0.5,
        l: { leaf: 0.1 },
        r: { leaf: -0.35 },
      },
      r: { leaf: -0.7 },
    },
  ],
  metrics: {
    mae: 0.28,
    r2: 0.84,
    sample_size: 240,
  },
};

// Generate realistic seeded Zimbabwean pilot cohort records
export function generateSeedPilotRecords(): FarmerRecord[] {
  const districts = [
    { name: "Murehwa", nr: "NR II", baseYield: 3.2, baseArea: 1.6, baseConf: 0.86, count: 65 },
    { name: "Goromonzi", nr: "NR II", baseYield: 3.4, baseArea: 1.8, baseConf: 0.88, count: 50 },
    { name: "Mazowe", nr: "NR II", baseYield: 3.9, baseArea: 2.4, baseConf: 0.91, count: 45 },
    { name: "Zaka", nr: "NR IV", baseYield: 1.6, baseArea: 1.9, baseConf: 0.74, count: 55 },
    { name: "Umguza", nr: "NR IV", baseYield: 1.8, baseArea: 2.2, baseConf: 0.77, count: 40 },
    { name: "Buhera", nr: "NR IV", baseYield: 1.4, baseArea: 1.5, baseConf: 0.69, count: 35 },
  ];

  const records: FarmerRecord[] = [];
  let idCounter = 1;

  for (const d of districts) {
    for (let i = 0; i < d.count; i++) {
      // Deterministic variation using index
      const noise = ((i * 17 + 3) % 29) / 29 - 0.5;
      const areaNoise = ((i * 23 + 7) % 31) / 31 - 0.5;
      const confNoise = ((i * 13 + 11) % 19) / 19 - 0.5;

      const yield_t_ha = Math.max(0.5, parseFloat((d.baseYield + noise * 1.4).toFixed(2)));
      const area_ha = Math.max(0.4, parseFloat((d.baseArea + areaNoise * 1.0).toFixed(2)));
      const confidence = Math.min(0.98, Math.max(0.35, parseFloat((d.baseConf + confNoise * 0.22).toFixed(2))));
      const est_production_t = parseFloat((yield_t_ha * area_ha).toFixed(2));

      records.push({
        farmer_id: `ZW-${d.name.toUpperCase().slice(0, 3)}-${String(idCounter).padStart(4, "0")}`,
        district: d.name,
        nr: d.nr,
        yield_t_ha,
        area_ha,
        confidence,
        est_production_t,
      });

      idCounter++;
    }
  }

  return records;
}

export function generateSeedPilotCSV(): string {
  const records = generateSeedPilotRecords();
  const headers = "farmer_id,district,nr,yield_t_ha,area_ha,confidence,est_production_t";
  const rows = records.map(
    (r) => `${r.farmer_id},${r.district},${r.nr},${r.yield_t_ha},${r.area_ha},${r.confidence},${r.est_production_t}`
  );
  return [headers, ...rows].join("\n");
}

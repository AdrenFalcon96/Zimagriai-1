import React from "react";
import { Database, GitMerge, LineChart, Layers, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

export const OverviewSection: React.FC<OverviewProps> = ({ onNavigate }) => {
  const naturalRegions = [
    {
      nr: "Natural Region I",
      rainfall: "> 1,000 mm/yr",
      climate: "Specialized & Diversified",
      districts: "Eastern Highlands, Chimanimani, Nyanga",
      crops: "Tea, coffee, macadamia, timber, horticulture",
      color: "border-blue-500/40 bg-blue-950/20 text-blue-400",
    },
    {
      nr: "Natural Region II",
      rainfall: "750 – 1,000 mm/yr",
      climate: "Intensive Farming Belt",
      districts: "Murehwa (Pilot), Mazowe, Chinhoyi, Goromonzi",
      crops: "Commercial maize, tobacco, soy, wheat, dairy",
      color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400",
    },
    {
      nr: "Natural Region III",
      rainfall: "650 – 800 mm/yr",
      climate: "Semi-Intensive (Dry Spells)",
      districts: "Midlands, Gweru, Kadoma, Kwekwe",
      crops: "Maize, cotton, sunflower, sorghum, livestock",
      color: "border-amber-500/40 bg-amber-950/20 text-amber-400",
    },
    {
      nr: "Natural Region IV",
      rainfall: "450 – 650 mm/yr",
      climate: "Semi-Extensive (Drought Hazard)",
      districts: "Zaka (Pilot), Umguza (Pilot), Chivi, Buhera",
      crops: "Drought-tolerant sorghum, pearl millet, cattle",
      color: "border-orange-500/40 bg-orange-950/20 text-orange-400",
    },
    {
      nr: "Natural Region V",
      rainfall: "< 450 mm/yr",
      climate: "Extensive (Arid Lowveld)",
      districts: "Beitbridge, Chiredzi, Mwenezi, Lower Save",
      crops: "Extensive livestock ranching, wildlife, sugar cane",
      color: "border-red-500/40 bg-red-950/20 text-red-400",
    },
  ];

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            01 / System Overview
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            One evidence chain, not isolated applications.
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>LOCAL REPRODUCIBLE MODEL READY</span>
        </div>
      </div>

      {/* 3 Pillars of Evidence Chain */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="group relative rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-stone-900">
          <div className="mb-3 inline-flex rounded-lg bg-emerald-950/60 p-2 text-emerald-400 ring-1 ring-emerald-800/40">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Data Foundation</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            Farmer, farm, field, crop-cycle and observation records are structured as the system
            of record. Public stakeholder views are aggregated, calibrated and pseudonymised to
            protect smallholders while enabling national data transparency.
          </p>
          <button
            onClick={() => onNavigate("capture")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Explore capture flow <ArrowRight className="h-3 w-3" />
          </button>
        </article>

        <article className="group relative rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-stone-900">
          <div className="mb-3 inline-flex rounded-lg bg-teal-950/60 p-2 text-teal-400 ring-1 ring-teal-800/40">
            <GitMerge className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Evidence Fusion</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            Self-reported production numbers are never taken as gospel. They are corroborated
            against independent environmental telemetry (Sentinel, Landsat, NASA POWER, MODIS)
            before being promoted into high-confidence national datasets.
          </p>
          <button
            onClick={() => onNavigate("signals")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
          >
            Inspect 15 signals <ArrowRight className="h-3 w-3" />
          </button>
        </article>

        <article className="group relative rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-stone-900">
          <div className="mb-3 inline-flex rounded-lg bg-amber-950/60 p-2 text-amber-400 ring-1 ring-amber-800/40">
            <LineChart className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Decision Layer</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            Yield predictions, empirical Bayes shrinkage, 90% credible intervals, and market-readiness
            indices are prepared directly for the Ministry of Lands, GMB strategic reserves,
            agricultural finance, insurers, and agronomists.
          </p>
          <button
            onClick={() => onNavigate("analysis")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            Review production views <ArrowRight className="h-3 w-3" />
          </button>
        </article>
      </div>

      {/* Agro-Ecological Natural Regions Framework */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
              Agro-Ecological Classification
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              Zimbabwe Natural Regions (NR I – V)
            </h3>
          </div>
          <p className="max-w-md text-xs text-stone-400">
            Yield estimation and risk scoring must be conditioned on Natural Region boundaries.
            The pilot dataset actively spans NR II (Murehwa) and NR IV (Zaka & Umguza).
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {naturalRegions.map((region) => (
            <div
              key={region.nr}
              className={`rounded-lg border p-3.5 transition ${region.color} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{region.nr}</span>
                  <span className="opacity-90">{region.rainfall}</span>
                </div>
                <div className="mt-1 font-semibold text-stone-200 text-xs">
                  {region.climate}
                </div>
                <div className="mt-2 text-[11px] text-stone-400">
                  <span className="font-medium text-stone-300">Districts: </span>
                  {region.districts}
                </div>
              </div>
              <div className="mt-3 border-t border-stone-800/80 pt-2 text-[11px] text-stone-400">
                <span className="font-medium text-stone-300">Key Crops: </span>
                {region.crops}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from "react";
import { Database, GitMerge, LineChart, Layers, MapPin, CheckCircle2, ArrowRight, ShieldCheck, FileSpreadsheet } from "lucide-react";

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

export const OverviewSection: React.FC<OverviewProps> = ({ onNavigate }) => {
  const naturalRegions = [
    {
      code: "NR I",
      name: "Natural Region I",
      rainfall: "> 1,000 mm",
      regime: "Specialized & Diversified",
      districts: "Eastern Highlands, Chimanimani, Nyanga",
      crops: "Tea, coffee, macadamia, timber, horticulture",
      status: "Calibrated via Sentinel-2",
      activePilot: false,
    },
    {
      code: "NR II",
      name: "Natural Region II",
      rainfall: "750 – 1,000 mm",
      regime: "Intensive Crop Production",
      districts: "Murehwa (Active Pilot), Mazowe, Chinhoyi, Goromonzi",
      crops: "Commercial white maize, tobacco, soy, wheat, dairy",
      status: "Active Pilot Calibration (4,520 records)",
      activePilot: true,
    },
    {
      code: "NR III",
      name: "Natural Region III",
      rainfall: "650 – 800 mm",
      regime: "Semi-Intensive (Dry Spell Hazard)",
      districts: "Midlands, Gweru, Kadoma, Kwekwe",
      crops: "Maize, cotton, sunflower, sorghum, livestock",
      status: "NASA POWER Telemetry Monitored",
      activePilot: false,
    },
    {
      code: "NR IV",
      name: "Natural Region IV",
      rainfall: "450 – 650 mm",
      regime: "Semi-Extensive (Drought Vulnerable)",
      districts: "Zaka (Active Pilot), Umguza (Active Pilot), Chivi, Buhera",
      crops: "Drought-tolerant sorghum (SV2/SV4), pearl millet, cattle",
      status: "Active Pilot Calibration (9,080 records)",
      activePilot: true,
    },
    {
      code: "NR V",
      name: "Natural Region V",
      rainfall: "< 450 mm",
      regime: "Extensive (Arid Lowveld)",
      districts: "Beitbridge, Chiredzi, Mwenezi, Lower Save",
      crops: "Livestock grazing, wildlife conservancy, irrigated sugarcane",
      status: "Sentinel-1 SAR Soil Moisture Monitored",
      activePilot: false,
    },
  ];

  return (
    <section className="space-y-6" id="section-overview">
      {/* Institutional Section Masthead */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-01 // NATIONAL FRAMEWORK
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">Statutory Pipeline Specification</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded border border-[#1e4832] bg-[#0d2217] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#34d399]">
            <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
            BAYES SHRUNK MODEL ONLINE
          </span>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          National Agricultural Evidence Architecture
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          The Republic of Zimbabwe agricultural monitoring framework operates on an unbroken chain of verifiable evidence.
          Self-reported farmer yield claims are corroborated against independent environmental telemetry before integration into national food balance sheets.
        </p>
      </div>

      {/* Strategic Value Proposition & Main Selling Points */}
      <div className="rounded border border-[#1e4832] bg-[#0c1a13] p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#143522] px-2 py-0.5 rounded border border-[#1f5436] uppercase tracking-wider">
            PRIMARY PLATFORM ARCHITECTURE & CORE SELLING PILLARS
          </span>
          <span className="text-[#32493d]">•</span>
          <span className="font-mono text-xs text-[#8ea396]">Three Core Tenets of National Agricultural Transformation</span>
        </div>

        <div className="grid gap-4 mt-3 md:grid-cols-3">
          {/* Pillar 1 */}
          <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#facc15] bg-[#2a220a] px-2 py-0.5 rounded border border-[#554013]">
                  SELLING POINT 01
                </span>
                <span className="font-mono text-[10px] text-[#8fa397]">Field Ground Truth</span>
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">AGRITEX Data Capture Incentive Policy</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Directly solves the historical 60-day lag and desktop survey fabrications. Officers receive automated airtime ($0.50/record), off-grid solar kits, and up to $250/mo in performance allowances upon satellite-verified smallholder data capture.
              </p>
            </div>
            <button
              onClick={() => onNavigate("capture")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#facc15] hover:text-[#fde047]"
            >
              Explore Incentive Model <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#38bdf8] bg-[#0e2430] px-2 py-0.5 rounded border border-[#153e54]">
                  SELLING POINT 02
                </span>
                <span className="font-mono text-[10px] text-[#8fa397]">Empirical Rigor</span>
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">15-Signal AI Telemetry & Bayes Shrinkage</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Adopts cutting-edge multi-sensor spatial AI: 10m Sentinel-2 NDVI, Sentinel-1 SAR soil moisture, Landsat-9 LST, and empirical Bayes shrinkage to pull unverified local claims toward ecological truth.
              </p>
            </div>
            <button
              onClick={() => onNavigate("signals")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc]"
            >
              Inspect 15 Signals <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Pillar 3 */}
          <div className="rounded border border-[#1b2b22] bg-[#09110d] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#122b1c] px-2 py-0.5 rounded border border-[#1a4029]">
                  SELLING POINT 03
                </span>
                <span className="font-mono text-[10px] text-[#8fa397]">Market Modernization</span>
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">Commodity Derivatives & ZMX/VFEX</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Directly champions Prof. Mthuli Ncube's Treasury vision: moving Zimbabwe from fiscal debt subsidies to standardized Put Option price floors, electronic Warehouse Receipts (e-WR), and continuous price discovery.
              </p>
            </div>
            <button
              onClick={() => onNavigate("exchange")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#34d399] hover:text-[#6ee7b7]"
            >
              Commodity Trading Desk <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Evidence Pipeline (Four-Stage Sequential Process) */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
        <div className="flex items-center justify-between border-b border-[#17251e] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#34d399]" />
            <h3 className="font-semibold text-sm text-[#e4ede7]">
              Four-Tier Evidence Fusion Pipeline
            </h3>
          </div>
          <span className="font-mono text-xs text-[#6e8577]">ISO-19115 Traceability Standard</span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Stage 1 */}
          <div className="rounded border border-[#18281f] bg-[#0f1914] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#122b1c] px-2 py-0.5 rounded border border-[#1a4029]">
                  STAGE 01
                </span>
                <Database className="h-4 w-4 text-[#799183]" />
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">Cadastre & Incentive Policy</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Solves historical AGRITEX reporting bottlenecks with offline-first logging and the Data Capture Incentive Policy (DCIP)—awarding automated airtime, solar kits, and bonuses upon satellite verification.
              </p>
            </div>
            <button
              onClick={() => onNavigate("capture")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#34d399] hover:text-[#6ee7b7]"
            >
              Incentive Engine & Cadastre <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stage 2 */}
          <div className="rounded border border-[#18281f] bg-[#0f1914] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#38bdf8] bg-[#0e2430] px-2 py-0.5 rounded border border-[#153e54]">
                  STAGE 02
                </span>
                <GitMerge className="h-4 w-4 text-[#799183]" />
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">Satellite Corroboration</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Automated multi-spectral cross-referencing against Copernicus Sentinel-2 (10m NDVI), Landsat-9 thermal, and NASA POWER daily precipitation arrays. Discrepancies are flagged immediately.
              </p>
            </div>
            <button
              onClick={() => onNavigate("signals")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-[#7dd3fc]"
            >
              15-Signal Registry <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stage 3 */}
          <div className="rounded border border-[#18281f] bg-[#0f1914] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#a78bfa] bg-[#221838] px-2 py-0.5 rounded border border-[#39265e]">
                  STAGE 03
                </span>
                <LineChart className="h-4 w-4 text-[#799183]" />
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">Empirical Bayes Shrinkage</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Mathematical shrinkage pulls extreme or unverified local self-reports toward calibrated agro-ecological prior distributions. Prevents systemic yield overestimation in food balance accounts.
              </p>
            </div>
            <button
              onClick={() => onNavigate("analysis")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#a78bfa] hover:text-[#c4b5fd]"
            >
              Bayes Estimator Tool <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stage 4 */}
          <div className="rounded border border-[#18281f] bg-[#0f1914] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-[#f59e0b] bg-[#2a1d08] px-2 py-0.5 rounded border border-[#48300c]">
                  STAGE 04
                </span>
                <ShieldCheck className="h-4 w-4 text-[#799183]" />
              </div>
              <h4 className="font-semibold text-sm text-[#f4f7f5]">Strategic Reserve & Policy Advisory</h4>
              <p className="mt-2 text-xs leading-relaxed text-[#8ca094]">
                Synthesizes confidence-weighted production numbers into GMB physical stock buffers, agricultural policy briefs, and statutory alignment with the Ministry of Agriculture, Mechanisation and Water Resources Development.
              </p>
            </div>
            <button
              onClick={() => onNavigate("advisor")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#f59e0b] hover:text-[#fcd34d]"
            >
              Policy Formulation Copilot <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Treasury & Ministry Agricultural Derivatives Integration Card */}
      <div className="rounded border border-[#1e4530] bg-[#0c1f16] p-5">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#143522] px-2 py-0.5 rounded border border-[#1f5436] uppercase tracking-wider">
                COMMODITY & DERIVATIVES ECOSYSTEM
              </span>
              <span className="text-[#32493d]">•</span>
              <span className="font-mono text-xs text-[#8ea396]">Prof. Mthuli Ncube Market Reform Architecture</span>
            </div>
            <h3 className="font-display text-base font-bold text-[#f4f7f5]">
              Commodity Stock Market & Warehouse Receipt System (WRS) Integration
            </h3>
            <p className="text-xs text-[#9ab0a3] leading-relaxed">
              Moving Zimbabwe from sovereign price subsidies and GMB monopolies to continuous price discovery on the <strong className="text-[#f4f7f5]">Zimbabwe Mercantile Exchange (ZMX)</strong> and hard-currency futures on the <strong className="text-[#f4f7f5]">Victoria Falls Stock Exchange (VFEX)</strong>. Farmers lock in price floors using standardized Put Options while pledging electronic Warehouse Receipts (e-WR) for up to 70% bank liquidity.
            </p>
          </div>

          <button
            onClick={() => onNavigate("exchange")}
            className="shrink-0 inline-flex items-center gap-2 rounded border border-[#276041] bg-[#17452d] px-4 py-2 font-mono text-xs font-bold text-[#34d399] hover:bg-[#1e5839] transition"
          >
            OPEN TRADING DESK & WRS <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Official Agro-Ecological Natural Regions Ledger Table */}
      <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#17251e] pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#34d399] uppercase">
                STATUTORY ZONING REGISTER
              </span>
              <span className="text-[#32493d]">•</span>
              <span className="font-mono text-xs text-[#799083]">AGRITEX Land Capability Classification</span>
            </div>
            <h3 className="font-display mt-1 text-lg font-bold text-[#f4f7f5]">
              Zimbabwe Natural Regions (NR I – V) Operational Matrix
            </h3>
          </div>
          <span className="font-mono text-xs text-[#799083]">
            Active Monitoring: 3 Pilot Districts • 13,600 Verified Smallholders
          </span>
        </div>

        {/* Institutional Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1b2b22] bg-[#0f1914] text-[#8ea396] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Zone Code</th>
                <th className="py-2.5 px-3">Precipitation Band</th>
                <th className="py-2.5 px-3">Agro-Climatic Regime</th>
                <th className="py-2.5 px-3">Representative Districts</th>
                <th className="py-2.5 px-3">Statutory Recommended Crops</th>
                <th className="py-2.5 px-3 text-right">Cadastre Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17251e] text-[#c9d6cf]">
              {naturalRegions.map((region) => (
                <tr
                  key={region.code}
                  className={`transition hover:bg-[#111e17] ${
                    region.activePilot ? "bg-[#0d1c15]/60 font-medium" : ""
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-[#f4f7f5] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      {region.activePilot && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" title="Active Pilot District" />
                      )}
                      {region.code}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#a1b8ab] whitespace-nowrap">
                    {region.rainfall}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#f4f7f5]">
                    {region.regime}
                  </td>
                  <td className="py-3 px-3 text-[#9ab0a3]">
                    {region.districts}
                  </td>
                  <td className="py-3 px-3 text-[#8ca094]">
                    {region.crops}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] whitespace-nowrap">
                    <span
                      className={`inline-block rounded px-2 py-0.5 border ${
                        region.activePilot
                          ? "border-[#1e4832] bg-[#0f281b] text-[#4ade80]"
                          : "border-[#1c2c23] bg-[#111c16] text-[#71877b]"
                      }`}
                    >
                      {region.status}
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

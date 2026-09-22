import React, { useState, useEffect } from "react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  Building,
  Coins,
  DollarSign,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Layers,
  ShieldCheck,
  ChevronRight,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  COMMODITY_TICKERS,
  ORDER_BOOKS,
  CERTIFIED_WAREHOUSES,
  ELECTRONIC_WAREHOUSE_RECEIPTS,
  HISTORICAL_POLICY_MILESTONES,
  MTHULI_NCUBE_DOCTRINE,
  RELATED_ZSE_AGRIBUSINESS,
} from "../data/commodityExchangeData";
import { CommodityTicker, ExchangeVenue, OrderBookEntry, CommodityOrderBook } from "../types";
import { LiveMarketTerminal, LiveMarketPayload } from "./LiveMarketTerminal";

export const CommodityExchangeSection: React.FC = () => {
  // Navigation sub-views
  const [subView, setSubView] = useState<
    "trading_floor" | "derivatives_desk" | "warehouse_network" | "historical_chronicle" | "zse_equities"
  >("trading_floor");

  // Currency toggle: USD vs ZiG
  const [currency, setCurrency] = useState<"USD" | "ZiG">("USD");

  // Venue filter
  const [selectedVenue, setSelectedVenue] = useState<"ALL" | ExchangeVenue>("ALL");

  // Active selected ticker for Order Book & Order Placement
  const [selectedSymbol, setSelectedSymbol] = useState<string>("ZMX-WMZ");

  // White maize contract mode: 'all' | 'spot' | 'contract'
  const [maizeViewMode, setMaizeViewMode] = useState<"all" | "spot" | "contract">("all");

  // Order Placement Simulator state
  const [orderAction, setOrderAction] = useState<"BUY" | "SELL">("BUY");
  const [orderVolumeMT, setOrderVolumeMT] = useState<number>(25);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Warehouse collateral calculator state
  const [calcCrop, setCalcCrop] = useState<string>("White Maize");
  const [calcTonnage, setCalcTonnage] = useState<number>(50);
  const [calcMoisture, setCalcMoisture] = useState<number>(12.0);

  // Live Market Feed State (Yahoo Finance + Frankfurter Open FX)
  const [marketData, setMarketData] = useState<LiveMarketPayload | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(15);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);

  const fetchLiveMarketData = async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch("/api/market/live");
      if (res.ok) {
        const data = await res.json();
        setMarketData(data);
      }
    } catch (err) {
      console.error("Failed to load live market feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchLiveMarketData();
  }, []);

  useEffect(() => {
    if (!autoRefresh || refreshIntervalSec <= 0) return;
    setSecondsUntilRefresh(refreshIntervalSec);
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchLiveMarketData();
          return refreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshIntervalSec]);

  // Combine static fallbacks with real-time live market feed
  const currentTickers: CommodityTicker[] =
    marketData?.tickers && marketData.tickers.length > 0 ? marketData.tickers : COMMODITY_TICKERS;
  const currentOrderBooks = marketData?.orderBooks
    ? { ...ORDER_BOOKS, ...marketData.orderBooks }
    : ORDER_BOOKS;
  const currentZseEquities =
    marketData?.zseAgribusiness && marketData.zseAgribusiness.length > 0
      ? marketData.zseAgribusiness
      : RELATED_ZSE_AGRIBUSINESS;

  const activeTicker =
    currentTickers.find((t) => t.symbol === selectedSymbol) || currentTickers[0];
  const activeOrderBook =
    currentOrderBooks[selectedSymbol] || currentOrderBooks["ZMX-WMZ"] || ORDER_BOOKS["ZMX-WMZ"];

  const filteredTickers = currentTickers.filter((ticker) => {
    // Venue filter
    if (selectedVenue !== "ALL" && ticker.venue !== selectedVenue) {
      return false;
    }
    // White Maize mode filter
    if (maizeViewMode === "spot") {
      // Show spot tickers or non-maize tickers if all venue, or specifically white maize spot
      if (ticker.crop === "White Maize" && ticker.type !== "spot") {
        return false;
      }
    } else if (maizeViewMode === "contract") {
      // Show futures & options contracts for White Maize
      if (ticker.crop === "White Maize" && ticker.type === "spot") {
        return false;
      }
    }
    return true;
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost =
      currency === "USD"
        ? orderVolumeMT * activeTicker.spotPriceUSD
        : orderVolumeMT * activeTicker.spotPriceZiG;
    const margin = activeTicker.marginRequirementPct
      ? (totalCost * activeTicker.marginRequirementPct) / 100
      : totalCost;

    const ticketId = `TRD-${Math.floor(100000 + Math.random() * 900000)}`;
    const msg = `MATCHED: ${orderAction} ${orderVolumeMT} MT ${activeTicker.name} @ ${
      currency === "USD" ? `$${activeTicker.spotPriceUSD}/MT` : `ZiG ${activeTicker.spotPriceZiG.toLocaleString()}/MT`
    } | Finsec Ticket #${ticketId} | Committed Margin: ${
      currency === "USD" ? `$${margin.toFixed(2)}` : `ZiG ${margin.toFixed(0)}`
    }`;

    setOrderNotification(msg);
    setTimeout(() => {
      setOrderNotification(null);
    }, 8000);
  };

  // Calculate warehouse collateral estimation
  const getCropUnitPrice = (crop: string) => {
    const match = currentTickers.find(
      (t) => t.crop.toLowerCase() === crop.toLowerCase() && t.type === "spot"
    );
    if (match) return match.spotPriceUSD;
    switch (crop) {
      case "White Maize":
        return 348;
      case "Wheat":
        return 460;
      case "Soya Beans":
        return 518;
      case "Sorghum":
        return 295;
      case "Groundnuts":
        return 785;
      default:
        return 340;
    }
  };

  const cropPrice = getCropUnitPrice(calcCrop);
  const moistureDiscount = calcMoisture > 12.5 ? (calcMoisture - 12.5) * 0.05 : 0;
  const effectivePrice = cropPrice * (1 - moistureDiscount);
  const grossValueUSD = calcTonnage * effectivePrice;
  const ltvRatio = 0.7; // 70% Loan to Value
  const borrowingCapacityUSD = grossValueUSD * ltvRatio;
  const monthlyStorageFeeUSD = calcTonnage * 4.5; // $4.50/MT per month

  return (
    <section className="space-y-6" id="section-exchange">
      {/* Section Masthead */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-08 // COMMODITY EXCHANGE & DERIVATIVES DESK
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">
              SI 184/188 • SECZIM / FINSEC / VFEX Certified
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded border border-[#1e4832] bg-[#0d281a] px-2.5 py-0.5 font-bold text-[#34d399]">
              <Activity className="h-3 w-3 animate-pulse text-[#22c55e]" />
              ZMX & VFEX TRADING SESSIONS OPEN
            </span>
          </div>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          Agricultural Commodities & Derivatives Market Ecosystem
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-4xl leading-relaxed">
          Inspired by Minister of Finance <strong className="text-[#f4f7f5]">Prof. Mthuli Ncube’s</strong>{" "}
          push to introduce agricultural derivatives, price discovery, and warehouse receipt systems across Zimbabwe.
          Mirroring active operations on the <strong className="text-[#34d399]">Zimbabwe Mercantile Exchange (ZMX)</strong>,{" "}
          the <strong className="text-[#38bdf8]">Victoria Falls Stock Exchange (VFEX)</strong>, and{" "}
          <strong className="text-[#fbbf24]">FINSEC Derivatives</strong>, backed by certified GMB & commercial silos.
        </p>
      </div>

      {/* Prof. Mthuli Ncube Doctrine Banner */}
      <div className="rounded border border-[#1e4230] bg-[#0b1b13] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-[#163826] px-2 py-0.5 font-mono text-[10px] font-bold text-[#34d399] uppercase tracking-wider">
                <Landmark className="h-3 w-3" />
                Treasury Economic Reform Directive
              </span>
              <span className="font-mono text-xs text-[#8ea396]">
                Architect: {MTHULI_NCUBE_DOCTRINE.minister}
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-[#f4f7f5]">
              The Mathematical Finance Doctrine: From Fiscal Subsidies to Derivative Risk Hedging
            </h3>
            <p className="text-xs text-[#9ab0a3] leading-relaxed">
              Leveraging stochastic volatility modeling and option pricing mechanisms (rooted in Prof. Ncube's Cambridge
              doctoral research in mathematical finance) to replace arbitrary state-fixed prices with market-cleared
              hedging. Smallholders secure guaranteed price floors via Put Options ($340/MT strike) while millers hedge
              drought shocks through deliverable futures and rainfall parametric swaps.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto font-mono text-xs">
            <div
              onClick={() => {
                setSelectedVenue("ZMX");
                setMaizeViewMode("spot");
                setSelectedSymbol("ZMX-WMZ");
              }}
              className={`cursor-pointer rounded border p-2.5 text-center transition hover:border-[#34d399] ${
                selectedVenue === "ZMX" && maizeViewMode === "spot"
                  ? "border-[#34d399] bg-[#122e1f] shadow-md ring-1 ring-[#34d399]"
                  : "border-[#1b2b22] bg-[#09110d] hover:bg-[#0d1a13]"
              }`}
              title="Click to view ZMX White Maize Spot Floor (Instant Physical Delivery)"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="block text-[10px] text-[#6e8577] uppercase font-bold">ZMX White Maize Spot</span>
              </div>
              <span className="font-bold text-[#34d399] text-sm block">
                {currency === "USD" ? "$348.0/t" : "ZiG 9,466/t"}
              </span>
              <span className="block text-[10px] text-[#22c55e]">Click: Spot Floor</span>
            </div>

            <div
              onClick={() => {
                setSelectedVenue("VFEX");
                setMaizeViewMode("contract");
                setSelectedSymbol("VFEX-WMZ-JUL26");
              }}
              className={`cursor-pointer rounded border p-2.5 text-center transition hover:border-[#38bdf8] ${
                selectedVenue === "VFEX" && maizeViewMode === "contract"
                  ? "border-[#38bdf8] bg-[#0e2733] shadow-md ring-1 ring-[#38bdf8]"
                  : "border-[#1b2b22] bg-[#09110d] hover:bg-[#0c181f]"
              }`}
              title="Click to view VFEX White Maize Futures & Options Contract Floor"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="block text-[10px] text-[#6e8577] uppercase font-bold">VFEX Maize Contracts</span>
              </div>
              <span className="font-bold text-[#38bdf8] text-sm block">
                {currency === "USD" ? "$335.0/t" : "ZiG 9,112/t"}
              </span>
              <span className="block text-[10px] text-[#7dd3fc]">Click: Futures/Options</span>
            </div>

            <div className="rounded border border-[#1b2b22] bg-[#09110d] p-2.5 text-center">
              <span className="block text-[10px] text-[#6e8577] uppercase">WRS Custody</span>
              <span className="font-bold text-[#f4f7f5] text-sm">384,200 MT</span>
              <span className="block text-[10px] text-[#8ea396]">48 Silos</span>
            </div>
            <div className="rounded border border-[#1b2b22] bg-[#09110d] p-2.5 text-center">
              <span className="block text-[10px] text-[#6e8577] uppercase">Bank Liquidity</span>
              <span className="font-bold text-[#fbbf24] text-sm">70% LTV</span>
              <span className="block text-[10px] text-[#fcd34d]">CBZ / AFC</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of the Agricultural Commodities Architecture */}
        <div className="mt-4 pt-4 border-t border-[#172f22] grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {MTHULI_NCUBE_DOCTRINE.pillars.map((pillar, i) => (
            <div key={i} className="rounded border border-[#162e21] bg-[#0c1611] p-3 space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#34d399]">PILLAR 0{i + 1}</span>
              <h4 className="font-semibold text-[#f4f7f5] text-[11px]">{pillar.title}</h4>
              <p className="text-[11px] text-[#8ea396] leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Global Benchmark Terminal & Free API Stream */}
      <LiveMarketTerminal
        marketData={marketData}
        isLoading={isLoadingFeed}
        autoRefresh={autoRefresh}
        refreshIntervalSec={refreshIntervalSec}
        secondsUntilRefresh={secondsUntilRefresh}
        onRefreshNow={fetchLiveMarketData}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onChangeInterval={(sec) => {
          setRefreshIntervalSec(sec);
          setAutoRefresh(sec > 0);
        }}
      />

      {/* Sub-Navigation Windows Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2b22] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setSubView("trading_floor")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-semibold transition ${
              subView === "trading_floor"
                ? "border border-[#224e36] bg-[#122e1f] text-[#34d399]"
                : "border border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:text-[#c9d6cf]"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>01 / LIVE TRADING FLOOR</span>
          </button>

          <button
            onClick={() => setSubView("derivatives_desk")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-semibold transition ${
              subView === "derivatives_desk"
                ? "border border-[#224e36] bg-[#122e1f] text-[#34d399]"
                : "border border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:text-[#c9d6cf]"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>02 / DERIVATIVES & OPTIONS SUITE</span>
          </button>

          <button
            onClick={() => setSubView("warehouse_network")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-semibold transition ${
              subView === "warehouse_network"
                ? "border border-[#224e36] bg-[#122e1f] text-[#34d399]"
                : "border border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:text-[#c9d6cf]"
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>03 / WAREHOUSE RECEIPTS (WRS)</span>
          </button>

          <button
            onClick={() => setSubView("historical_chronicle")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-semibold transition ${
              subView === "historical_chronicle"
                ? "border border-[#224e36] bg-[#122e1f] text-[#34d399]"
                : "border border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:text-[#c9d6cf]"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>04 / ZIMACE & REFORM ARCHIVE</span>
          </button>

          <button
            onClick={() => setSubView("zse_equities")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-semibold transition ${
              subView === "zse_equities"
                ? "border border-[#224e36] bg-[#122e1f] text-[#34d399]"
                : "border border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:text-[#c9d6cf]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>05 / ZSE AGRIBUSINESS BLUE-CHIPS</span>
          </button>
        </div>

        {/* Currency & Venue Control */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center rounded border border-[#1b2b22] bg-[#0c1410] p-0.5">
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                currency === "USD"
                  ? "bg-[#183927] text-[#34d399]"
                  : "text-[#6e8577] hover:text-[#c9d6cf]"
              }`}
            >
              USD ($/t)
            </button>
            <button
              onClick={() => setCurrency("ZiG")}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                currency === "ZiG"
                  ? "bg-[#183927] text-[#34d399]"
                  : "text-[#6e8577] hover:text-[#c9d6cf]"
              }`}
            >
              ZiG (Gold-Backed)
            </button>
          </div>
        </div>
      </div>

      {/* Global Order Execution Notification */}
      {orderNotification && (
        <div className="rounded border border-[#1e4832] bg-[#0d281a] p-3 font-mono text-xs text-[#34d399] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
            <span>{orderNotification}</span>
          </div>
          <span className="text-[10px] text-[#799083]">CENTRAL SECURITIES DEPOSITORY COMMITTED</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* WINDOW 01: LIVE TRADING FLOOR                                  */}
      {/* ============================================================== */}
      {subView === "trading_floor" && (
        <div className="space-y-6">
          {/* Venue & Asset Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1410] p-3 rounded border border-[#1b2b22]">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-[#6e8577]">EXCHANGE VENUE:</span>
              {(["ALL", "ZMX", "VFEX", "FINSEC"] as const).map((venue) => (
                <button
                  key={venue}
                  onClick={() => setSelectedVenue(venue)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                    selectedVenue === venue
                      ? "bg-[#163523] text-[#34d399] border border-[#234e35]"
                      : "bg-[#09110d] text-[#799083] border border-[#1b2b22] hover:text-[#c9d6cf]"
                  }`}
                >
                  {venue === "ALL" ? "ALL EXCHANGES" : venue}
                </button>
              ))}

              <span className="text-[#32493d] ml-1 mr-1">|</span>

              {/* White Maize Spot vs Contract Quick Toggle for Traders */}
              <span className="text-[#6e8577]">WHITE MAIZE:</span>
              <button
                onClick={() => {
                  setMaizeViewMode("all");
                }}
                className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                  maizeViewMode === "all"
                    ? "bg-[#1f3026] text-[#f4f7f5] border border-[#2b4436]"
                    : "bg-[#09110d] text-[#799083] border border-[#1b2b22] hover:text-[#c9d6cf]"
                }`}
              >
                All Maize
              </button>
              <button
                onClick={() => {
                  setMaizeViewMode("spot");
                  setSelectedSymbol("ZMX-WMZ");
                }}
                className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                  maizeViewMode === "spot"
                    ? "bg-[#122e1f] text-[#34d399] border border-[#22c55e]"
                    : "bg-[#09110d] text-[#799083] border border-[#1b2b22] hover:text-[#34d399]"
                }`}
              >
                Spot Only (ZMX $348/t)
              </button>
              <button
                onClick={() => {
                  setMaizeViewMode("contract");
                  setSelectedSymbol("VFEX-WMZ-JUL26");
                }}
                className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                  maizeViewMode === "contract"
                    ? "bg-[#0e2733] text-[#38bdf8] border border-[#38bdf8]"
                    : "bg-[#09110d] text-[#799083] border border-[#1b2b22] hover:text-[#38bdf8]"
                }`}
              >
                Contract/Futures (VFEX $335/t)
              </button>
            </div>

            <div className="font-mono text-xs text-[#6e8577]">
              <span>ACTIVE INSTRUMENTS: {filteredTickers.length} CONTRACTS</span>
            </div>
          </div>

          {/* Tickers Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTickers.map((ticker) => {
              const isSelected = ticker.symbol === selectedSymbol;
              const isPositive = ticker.change24hPct >= 0;

              return (
                <div
                  key={ticker.symbol}
                  onClick={() => setSelectedSymbol(ticker.symbol)}
                  className={`cursor-pointer rounded border p-3.5 transition flex flex-col justify-between ${
                    isSelected
                      ? "border-[#2b6043] bg-[#0f2419] shadow-md"
                      : "border-[#1b2b22] bg-[#0c1410] hover:border-[#283d31] hover:bg-[#0e1913]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#f4f7f5]">
                          {ticker.symbol}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase ${
                            ticker.venue === "ZMX"
                              ? "bg-[#0f3422] text-[#34d399] border border-[#1a4a32]"
                              : ticker.venue === "VFEX"
                              ? "bg-[#0f2b38] text-[#38bdf8] border border-[#184254]"
                              : "bg-[#291e0a] text-[#fbbf24] border border-[#443314]"
                          }`}
                        >
                          {ticker.venue}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center font-mono text-xs font-semibold ${
                          isPositive ? "text-[#22c55e]" : "text-[#f87171]"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                        )}
                        {isPositive ? `+${ticker.change24hPct}%` : `${ticker.change24hPct}%`}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#e1ebe5] line-clamp-1">
                      {ticker.name}
                    </h4>

                    <p className="mt-1 font-mono text-[10px] text-[#6e8577] line-clamp-1">
                      {ticker.gradingStandard}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#17251e] flex items-end justify-between">
                    <div>
                      <span className="block font-mono text-[10px] text-[#6e8577]">
                        {ticker.type === "put_option"
                          ? "OPTION PREMIUM"
                          : ticker.type === "future"
                          ? "FUTURES PRICE"
                          : "SPOT PRICE"}
                      </span>
                      <span className="font-mono text-base font-bold text-[#f4f7f5]">
                        {currency === "USD"
                          ? `$${ticker.spotPriceUSD.toFixed(1)}`
                          : `ZiG ${ticker.spotPriceZiG.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-[#6e8577] ml-1 font-mono">/ MT</span>
                    </div>

                    <div className="text-right font-mono text-[10px] text-[#8ea396]">
                      <span>VOL: {ticker.volume24hMT.toLocaleString()} MT</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Order Book & Trade Execution Window */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Order Book Depth (Col 7) */}
            <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between border-b border-[#17251e] pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#f4f7f5]">
                        {activeTicker.symbol} // DEPTH OF MARKET (LEVEL 2)
                      </span>
                      <span className="font-mono text-[10px] text-[#34d399] bg-[#0f281b] px-1.5 py-0.5 rounded border border-[#1e4832]">
                        {activeTicker.venue} LIVE
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#6e8577]">
                      Spread: ${activeOrderBook.spreadUSD.toFixed(2)} USD • Last Traded: {activeOrderBook.lastTradeTime}
                    </span>
                  </div>

                  <div className="font-mono text-right text-xs">
                    <span className="block text-[10px] text-[#6e8577]">LAST MATCHED PRICE</span>
                    <span className="text-base font-bold text-[#34d399]">
                      {currency === "USD"
                        ? `$${activeOrderBook.lastTradePriceUSD.toFixed(2)}`
                        : `ZiG ${(activeOrderBook.lastTradePriceUSD * 27.2).toFixed(1)}`}
                    </span>
                  </div>
                </div>

                {/* Depth Table */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Bids Column */}
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#34d399] border-b border-[#1b2b22] pb-1.5 mb-2 font-bold uppercase">
                      <span>BIDS (BUYERS)</span>
                      <span>QTY (MT)</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      {activeOrderBook.bids.map((bid: OrderBookEntry, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded bg-[#09150f] px-2.5 py-1 text-[#34d399] border border-[#142c1e]"
                        >
                          <span className="font-bold">
                            {currency === "USD" ? `$${bid.priceUSD.toFixed(2)}` : `ZiG ${(bid.priceUSD * 27.2).toFixed(0)}`}
                          </span>
                          <span className="text-[#a4e6be]">{bid.quantityMT.toLocaleString()} MT</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Asks Column */}
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#f87171] border-b border-[#1b2b22] pb-1.5 mb-2 font-bold uppercase">
                      <span>ASKS (SELLERS)</span>
                      <span>QTY (MT)</span>
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      {activeOrderBook.asks.map((ask: OrderBookEntry, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded bg-[#190c0c] px-2.5 py-1 text-[#f87171] border border-[#3b1717]"
                        >
                          <span className="font-bold">
                            {currency === "USD" ? `$${ask.priceUSD.toFixed(2)}` : `ZiG ${(ask.priceUSD * 27.2).toFixed(0)}`}
                          </span>
                          <span className="text-[#fca5a5]">{ask.quantityMT.toLocaleString()} MT</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instrument Metadata Footer */}
              <div className="mt-5 pt-3 border-t border-[#17251e] grid grid-cols-3 gap-2 font-mono text-[11px] text-[#6e8577]">
                <div>
                  <span className="block text-[10px] text-[#556e60]">Standard Lot</span>
                  <span className="text-[#c9d6cf]">{activeTicker.lotSizeMT} Metric Tonnes</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#556e60]">Margin Rate</span>
                  <span className="text-[#c9d6cf]">
                    {activeTicker.marginRequirementPct ? `${activeTicker.marginRequirementPct}%` : "100% Cash / Spot"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#556e60]">Settlement Venue</span>
                  <span className="text-[#34d399] font-bold">{activeTicker.venue} / FINSEC CSD</span>
                </div>
              </div>
            </div>

            {/* Simulated Trade Execution Form (Col 5) */}
            <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-[#17251e] pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-[#f4f7f5]">
                      FINSEC Automated Contract Writing Terminal
                    </h3>
                    <span className="font-mono text-[10px] text-[#34d399] border border-[#1e4832] bg-[#0b2416] px-2 py-0.5 rounded">
                      DIRECT ACCESS
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#799083]">
                    Execute spot purchases, open futures hedges, or purchase smallholder downside put options.
                  </p>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {/* Buy vs Sell Tabs */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setOrderAction("BUY")}
                      className={`rounded py-2 font-bold transition ${
                        orderAction === "BUY"
                          ? "bg-[#183d28] text-[#34d399] border border-[#296844]"
                          : "bg-[#09110d] text-[#6e8577] border border-[#1b2b22] hover:text-[#c9d6cf]"
                      }`}
                    >
                      LONG / BUY (BID)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderAction("SELL")}
                      className={`rounded py-2 font-bold transition ${
                        orderAction === "SELL"
                          ? "bg-[#381414] text-[#f87171] border border-[#682424]"
                          : "bg-[#09110d] text-[#6e8577] border border-[#1b2b22] hover:text-[#c9d6cf]"
                      }`}
                    >
                      SHORT / SELL (OFFER)
                    </button>
                  </div>

                  {/* Selected Contract Info */}
                  <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3 text-xs space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-[#6e8577]">Selected Symbol:</span>
                      <span className="font-bold text-[#f4f7f5]">{activeTicker.symbol}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#6e8577]">Instrument Type:</span>
                      <span className="font-bold text-[#34d399] uppercase">{activeTicker.type}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#6e8577]">Market Quote:</span>
                      <span className="font-bold text-[#f4f7f5]">
                        {currency === "USD"
                          ? `$${activeTicker.spotPriceUSD.toFixed(1)} / MT`
                          : `ZiG ${activeTicker.spotPriceZiG.toLocaleString()} / MT`}
                      </span>
                    </div>
                  </div>

                  {/* Volume Input */}
                  <div>
                    <label className="block font-mono text-xs text-[#8ea396] mb-1">
                      ORDER VOLUME (METRIC TONNES)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="5000"
                        step="5"
                        value={orderVolumeMT}
                        onChange={(e) => setOrderVolumeMT(Number(e.target.value))}
                        className="w-full rounded border border-[#1b2b22] bg-[#09110d] px-3 py-2 font-mono text-sm text-[#f4f7f5] focus:border-[#34d399] focus:outline-none"
                      />
                      <span className="font-mono text-xs text-[#6e8577]">MT</span>
                    </div>
                    <div className="flex gap-2 mt-1.5 font-mono text-[10px]">
                      {[10, 25, 50, 100, 250].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setOrderVolumeMT(v)}
                          className="rounded border border-[#1b2b22] bg-[#0e1813] px-2 py-0.5 text-[#799083] hover:text-[#34d399]"
                        >
                          {v} MT
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary Box */}
                  <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-[#8ea396]">
                      <span>Notional Contract Value:</span>
                      <span className="font-bold text-[#f4f7f5]">
                        {currency === "USD"
                          ? `$${(orderVolumeMT * activeTicker.spotPriceUSD).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}`
                          : `ZiG ${(orderVolumeMT * activeTicker.spotPriceZiG).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#34d399]">
                      <span>Required Initial Margin:</span>
                      <span className="font-bold">
                        {currency === "USD"
                          ? `$${(
                              (orderVolumeMT *
                                activeTicker.spotPriceUSD *
                                (activeTicker.marginRequirementPct || 100)) /
                              100
                            ).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : `ZiG ${(
                              (orderVolumeMT *
                                activeTicker.spotPriceZiG *
                                (activeTicker.marginRequirementPct || 100)) /
                              100
                            ).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full rounded py-2.5 font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2 ${
                      orderAction === "BUY"
                        ? "bg-[#163a25] text-[#34d399] hover:bg-[#1e4d32] border border-[#25633e]"
                        : "bg-[#451818] text-[#fca5a5] hover:bg-[#5a1f1f] border border-[#782929]"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>
                      TRANSMIT {orderAction} ORDER // {orderVolumeMT} MT TO {activeTicker.venue}
                    </span>
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-[#17251e] font-mono text-[10px] text-[#6e8577]">
                Cleared through FINSEC Automated Central Securities Depository. Subject to ZMX rules under SI 188 of 2021.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WINDOW 02: DERIVATIVES & OPTIONS SUITE                         */}
      {/* ============================================================== */}
      {subView === "derivatives_desk" && (
        <div className="space-y-6">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                RISK MANAGEMENT & STOCHASTIC VOLATILITY ARCHITECTURE
              </span>
              <h3 className="font-display text-lg font-bold text-[#f4f7f5] mt-1">
                Standardized Agricultural Derivatives Instruments
              </h3>
              <p className="text-xs text-[#8ea396] leading-relaxed mt-1">
                As advocated by Minister Prof. Mthuli Ncube, agricultural derivatives enable farmers and millers to transfer
                systemic weather and price volatility to institutional liquidity providers without relying on treasury bailouts.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-6">
              {/* Instrument 1: Farmer Price Floor Put Option */}
              <div className="rounded border border-[#1e4832] bg-[#0d2217] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#34d399] bg-[#123321] px-2 py-0.5 rounded border border-[#1b4b31]">
                      OPTION CONTRACT // PUT
                    </span>
                    <Scale className="h-4 w-4 text-[#34d399]" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#f4f7f5]">
                    Smallholder Price Floor Put Option (Strike $340/MT)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ab0a3]">
                    Guarantees smallholders (Pfumvudza clusters and A1/A2 farmers) a minimum selling price of $340/tonne at harvest.
                    If bumper yields or regional gluts crash the spot market to $280/t, the farmer exercises the Put option at $340/t.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#173a27] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Option Premium:</span>
                    <span className="text-[#34d399] font-bold">$14.50 / MT (4.2%)</span>
                  </div>
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Payoff Mechanism:</span>
                    <span className="text-[#c9d6cf]">Max(0, $340 - Spot Price)</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSymbol("VFEX-WMZ-PUT340");
                      setSubView("trading_floor");
                    }}
                    className="mt-3 w-full rounded border border-[#22573a] bg-[#143d28] py-1.5 text-center font-bold text-[#34d399] hover:bg-[#1a4f34]"
                  >
                    TRADE PUT FLOOR CONTRACT
                  </button>
                </div>
              </div>

              {/* Instrument 2: Deliverable Grain Futures */}
              <div className="rounded border border-[#1b3d52] bg-[#0c1f2b] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#38bdf8] bg-[#0e2c3d] px-2 py-0.5 rounded border border-[#154661]">
                      FUTURES CONTRACT // HARVEST
                    </span>
                    <TrendingUp className="h-4 w-4 text-[#38bdf8]" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#f4f7f5]">
                    White Maize & Wheat Deliverable Futures
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ab0a3]">
                    Binding forward contracts tradable on VFEX in hard currency (USD). Used by industrial millers (National Foods,
                    Blue Ribbon) to lock in procurement supply 3–6 months ahead, completely immunizing cashflows against inflation.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#163a4d] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Contract Delivery:</span>
                    <span className="text-[#38bdf8] font-bold">JUL-2026 / OCT-2026</span>
                  </div>
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Delivery Depots:</span>
                    <span className="text-[#c9d6cf]">GMB Lion's Den / TSL</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSymbol("VFEX-WMZ-JUL26");
                      setSubView("trading_floor");
                    }}
                    className="mt-3 w-full rounded border border-[#184d69] bg-[#12384d] py-1.5 text-center font-bold text-[#38bdf8] hover:bg-[#164761]"
                  >
                    TRADE VFEX HARVEST FUTURES
                  </button>
                </div>
              </div>

              {/* Instrument 3: NASA POWER Parametric Weather Swap */}
              <div className="rounded border border-[#4d3a12] bg-[#211808] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#fbbf24] bg-[#33260c] px-2 py-0.5 rounded border border-[#543e14]">
                      WEATHER DERIVATIVE // NASA
                    </span>
                    <Activity className="h-4 w-4 text-[#fbbf24]" />
                  </div>
                  <h4 className="font-semibold text-sm text-[#f4f7f5]">
                    NASA POWER Parametric Rainfall Deficit Swap
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#9ab0a3]">
                    Pegged directly to the 7-day cumulative rainfall telemetry from our live NASA POWER satellite array.
                    If precipitation in drought-prone districts like Zaka or Umguza falls below 25mm during pollination, automatic payout triggers.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#3b2b0d] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Trigger Threshold:</span>
                    <span className="text-[#fbbf24] font-bold">&lt; 25mm / 7-Day Window</span>
                  </div>
                  <div className="flex justify-between text-[#8ea396]">
                    <span>Parametric Payout:</span>
                    <span className="text-[#c9d6cf]">$60 / Hectare Guaranteed</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSymbol("FINSEC-RAIN-ZAK26");
                      setSubView("trading_floor");
                    }}
                    className="mt-3 w-full rounded border border-[#523b0f] bg-[#36270b] py-1.5 text-center font-bold text-[#fbbf24] hover:bg-[#47330d]"
                  >
                    TRADE PARAMETRIC RAIN SWAP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WINDOW 03: WAREHOUSE RECEIPTS (WRS) & COLLATERAL FINANCING     */}
      {/* ============================================================== */}
      {subView === "warehouse_network" && (
        <div className="space-y-6">
          {/* Warehouse Network Map & Directory */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#17251e] pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                  STATUTORY INSTRUMENT 184 OF 2021 ACCREDITED NETWORK
                </span>
                <h3 className="font-display text-lg font-bold text-[#f4f7f5] mt-1">
                  Certified Silo Custodians & Collateral Managers
                </h3>
              </div>
              <span className="font-mono text-xs text-[#6e8577]">
                Total Certified Capacity: 324,000 MT • Average Utilization: 74.5%
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CERTIFIED_WAREHOUSES.map((wh) => (
                <div key={wh.id} className="rounded border border-[#182a20] bg-[#0f1914] p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[#34d399] font-bold">{wh.id}</span>
                      <h4 className="font-semibold text-xs text-[#f4f7f5]">{wh.name}</h4>
                      <span className="text-[11px] text-[#799083]">
                        {wh.province} ({wh.district})
                      </span>
                    </div>
                    <span className="rounded bg-[#0d2217] px-2 py-0.5 font-mono text-[10px] text-[#34d399] border border-[#1a452d]">
                      {wh.utilizationPct}% Full
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[#1b2b22] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#22c55e] rounded"
                      style={{ width: `${wh.utilizationPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] text-[#8ea396] pt-1">
                    <span>Stock: {wh.currentStockMT.toLocaleString()} MT</span>
                    <span>Cap: {wh.capacityMT.toLocaleString()} MT</span>
                  </div>

                  <div className="pt-2 border-t border-[#17251e] text-[10px] text-[#6e8577]">
                    <span className="block font-mono text-[#8ea396]">Operator: {wh.operator}</span>
                    <span className="block mt-0.5 text-[#556e60]">
                      Accepts: {wh.acceptedCrops.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Electronic Warehouse Receipts (e-WR) Active Ledger */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#17251e] pb-3 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                  FINSEC CENTRAL SECURITIES DEPOSITORY (CSD)
                </span>
                <h3 className="font-display text-base font-bold text-[#f4f7f5] mt-1">
                  Active Electronic Warehouse Receipts (e-WR) Registry
                </h3>
              </div>
              <span className="font-mono text-xs text-[#6e8577]">
                Live Collateral Registry • Anti-Duplication Cryptographic Hash
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1b2b22] text-[10px] text-[#6e8577] uppercase">
                    <th className="pb-2">Receipt ID</th>
                    <th className="pb-2">Depositor</th>
                    <th className="pb-2">Warehouse</th>
                    <th className="pb-2">Crop & Grade</th>
                    <th className="pb-2">Assay (Mois/Afla)</th>
                    <th className="pb-2">Volume</th>
                    <th className="pb-2">Valuation</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17251e] text-[#c9d6cf]">
                  {ELECTRONIC_WAREHOUSE_RECEIPTS.map((rcpt) => (
                    <tr key={rcpt.receiptId} className="hover:bg-[#0f1d16]">
                      <td className="py-2.5 font-bold text-[#34d399]">{rcpt.receiptId}</td>
                      <td className="py-2.5">
                        <span className="block text-[#f4f7f5]">{rcpt.depositorRef}</span>
                        <span className="text-[10px] text-[#6e8577]">{rcpt.depositorType}</span>
                      </td>
                      <td className="py-2.5 text-[#8ea396]">{rcpt.warehouseName}</td>
                      <td className="py-2.5">
                        <span className="font-bold text-[#f4f7f5]">{rcpt.crop}</span>
                        <span className="block text-[10px] text-[#34d399]">{rcpt.grade}</span>
                      </td>
                      <td className="py-2.5 text-[11px]">
                        <span>{rcpt.moisturePct}%</span> • <span>{rcpt.aflatoxinPpb} ppb</span>
                      </td>
                      <td className="py-2.5 font-bold text-[#f4f7f5]">{rcpt.quantityMT} MT</td>
                      <td className="py-2.5 text-[#34d399]">
                        ${rcpt.assessedValueUSD.toLocaleString()} USD
                      </td>
                      <td className="py-2.5">
                        {rcpt.status === "pledged_collateral" && (
                          <span className="rounded bg-[#1a2810] px-2 py-0.5 text-[10px] font-bold text-[#fbbf24] border border-[#3b3512]">
                            Pledged: {rcpt.pledgedBank?.split(" ")[0]}
                          </span>
                        )}
                        {rcpt.status === "listed_exchange" && (
                          <span className="rounded bg-[#0f241a] px-2 py-0.5 text-[10px] font-bold text-[#34d399] border border-[#1e4832]">
                            Listed on ZMX
                          </span>
                        )}
                        {rcpt.status === "unencumbered" && (
                          <span className="rounded bg-[#111c16] px-2 py-0.5 text-[10px] font-bold text-[#799083] border border-[#1b2b22]">
                            Unencumbered
                          </span>
                        )}
                        {rcpt.status === "delivery_warrant_issued" && (
                          <span className="rounded bg-[#0d2230] px-2 py-0.5 text-[10px] font-bold text-[#38bdf8] border border-[#163f54]">
                            Delivery Warrant
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive e-WR Collateral Bank Financing Calculator */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="border-b border-[#17251e] pb-3 mb-4">
              <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                FINANCIAL INCLUSION TERMINAL
              </span>
              <h3 className="font-display text-base font-bold text-[#f4f7f5] mt-1">
                e-Warehouse Receipt Collateral Liquidity Estimator (70% LTV)
              </h3>
              <p className="text-xs text-[#8ea396] mt-0.5">
                Simulate how smallholders and commercial estates unlock immediate working capital from CBZ Bank or AFC
                Commercial Bank by pledging certified grain receipts, preventing distress selling at low post-harvest prices.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
              <div className="space-y-4 md:col-span-6">
                <div>
                  <label className="block font-mono text-xs text-[#8ea396] mb-1">CROP COMMODITY</label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    className="w-full rounded border border-[#1b2b22] bg-[#09110d] px-3 py-2 font-mono text-xs text-[#f4f7f5] focus:border-[#34d399] focus:outline-none"
                  >
                    <option value="White Maize">White Maize (Spot $348/MT)</option>
                    <option value="Wheat">Hard Milling Wheat (Spot $460/MT)</option>
                    <option value="Soya Beans">Industrial Soya Beans (Spot $518/MT)</option>
                    <option value="Sorghum">Red Sorghum (Spot $295/MT)</option>
                    <option value="Groundnuts">Shelled Groundnuts (Spot $785/MT)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-xs text-[#8ea396] mb-1">DEPOSIT VOLUME (MT)</label>
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      value={calcTonnage}
                      onChange={(e) => setCalcTonnage(Number(e.target.value))}
                      className="w-full rounded border border-[#1b2b22] bg-[#09110d] px-3 py-2 font-mono text-xs text-[#f4f7f5] focus:border-[#34d399] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[#8ea396] mb-1">MOISTURE CONTENT (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="8"
                      max="16"
                      value={calcMoisture}
                      onChange={(e) => setCalcMoisture(Number(e.target.value))}
                      className="w-full rounded border border-[#1b2b22] bg-[#09110d] px-3 py-2 font-mono text-xs text-[#f4f7f5] focus:border-[#34d399] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded bg-[#09110d] p-3 text-[11px] text-[#6e8577] border border-[#1b2b22]">
                  Standard safe storage threshold is ≤12.5% moisture. Moisture exceeding 12.5% incurs an automated 5% dockage per 1% excess moisture for mechanical aeration costs.
                </div>
              </div>

              {/* Calculator Output */}
              <div className="rounded border border-[#1e4832] bg-[#0d2217] p-4 md:col-span-6 flex flex-col justify-between font-mono text-xs">
                <div>
                  <span className="font-bold text-[#34d399] uppercase">COLLATERAL APPRAISAL RESULT</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between border-b border-[#183d28] pb-1.5 text-[#9ab0a3]">
                      <span>Gross Grain Valuation:</span>
                      <span className="font-bold text-[#f4f7f5]">${grossValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                    </div>

                    <div className="flex justify-between border-b border-[#183d28] pb-1.5 text-[#9ab0a3]">
                      <span>Loan-to-Value (LTV) Cap:</span>
                      <span className="font-bold text-[#34d399]">70.0% Statutory Cap</span>
                    </div>

                    <div className="flex justify-between border-b border-[#183d28] pb-1.5 text-[#9ab0a3]">
                      <span>Max Instant Bank Borrowing:</span>
                      <span className="font-bold text-[#22c55e] text-sm">
                        ${borrowingCapacityUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    </div>

                    <div className="flex justify-between text-[#799083]">
                      <span>Estimated Monthly Silo Storage:</span>
                      <span>${monthlyStorageFeeUSD.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#183d28] text-[10px] text-[#799083]">
                  Participating Banks: CBZ Bank, AFC Commercial Bank, FBC Bank, Stanbic Bank Zimbabwe under the AMA WRS Framework.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WINDOW 04: HISTORICAL CHRONICLE (ZIMACE TO REFORMS)            */}
      {/* ============================================================== */}
      {subView === "historical_chronicle" && (
        <div className="space-y-6">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="border-b border-[#17251e] pb-3 mb-4">
              <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                HISTORICAL RETROSPECTIVE & LEGISLATIVE FOUNDATIONS
              </span>
              <h3 className="font-display text-lg font-bold text-[#f4f7f5] mt-1">
                The 30-Year Evolution of Agricultural Commodity Exchanges in Zimbabwe
              </h3>
              <p className="text-xs text-[#8ea396] leading-relaxed mt-1">
                A historical analysis of past attempts to establish formal agricultural commodity trading in Zimbabwe,
                why earlier models failed, and how the current Mthuli Ncube framework prevents a repeat of the 2001 collapse.
              </p>
            </div>

            <div className="space-y-4">
              {HISTORICAL_POLICY_MILESTONES.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#1b2b22] bg-[#09110d] p-4 transition hover:border-[#2b4836]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#17251e] pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#122e1f] px-2 py-0.5 font-mono text-[10px] font-bold text-[#34d399] border border-[#1e4832]">
                        {m.era}
                      </span>
                      <h4 className="font-semibold text-sm text-[#f4f7f5]">{m.title}</h4>
                    </div>
                    <span className="font-mono text-xs text-[#6e8577]">Architects: {m.leadArchitect}</span>
                  </div>

                  <p className="text-xs text-[#9ab0a3] leading-relaxed">{m.description}</p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs font-mono">
                    <div className="rounded border border-[#192b21] bg-[#0c1611] p-2.5">
                      <span className="block text-[10px] font-bold text-[#34d399] uppercase">
                        Structural Outcome
                      </span>
                      <p className="text-[11px] text-[#c9d6cf] mt-0.5">{m.outcome}</p>
                    </div>

                    <div className="rounded border border-[#301c1c] bg-[#1a0e0e] p-2.5">
                      <span className="block text-[10px] font-bold text-[#f87171] uppercase">
                        Systemic Vulnerability / Lesson
                      </span>
                      <p className="text-[11px] text-[#fca5a5] mt-0.5">{m.riskWarning}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crucial Takeaway on Why ZimAgriAI Completes the Equation */}
            <div className="mt-5 rounded border border-[#1e4832] bg-[#0d2217] p-4 text-xs text-[#9ab0a3] leading-relaxed">
              <span className="font-mono font-bold text-[#34d399] block mb-1 uppercase">
                Why Satellite Telemetry is the Missing Link:
              </span>
              Historical commodity markets (like ZIMACE) failed because they lacked immutable, tamper-proof verification of
              regional production and silo inventories. By marrying ground-level e-Warehouse Receipts with independent
              Sentinel-2 NDVI and NASA POWER weather telemetry, the modern exchange protects against phantom warehousing,
              enforces transparent price discovery, and provides the actuarial backing necessary for long-term derivative liquidity.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WINDOW 05: ZSE AGRIBUSINESS BLUE-CHIPS CORRELATION             */}
      {/* ============================================================== */}
      {subView === "zse_equities" && (
        <div className="space-y-6">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-5">
            <div className="border-b border-[#17251e] pb-3 mb-4">
              <span className="font-mono text-xs font-bold text-[#34d399] uppercase tracking-wider">
                EQUITY MARKET INTEGRATION // ZIMBABWE STOCK EXCHANGE (ZSE)
              </span>
              <h3 className="font-display text-lg font-bold text-[#f4f7f5] mt-1">
                Industrial Off-Taker Correlation & Agribusiness Blue-Chips
              </h3>
              <p className="text-xs text-[#8ea396] leading-relaxed mt-1">
                Publicly quoted industrial conglomerates on the Zimbabwe Stock Exchange whose corporate earnings, stockfeed
                crush margins, and beverage production depend directly on the ZMX spot market and derivative commodity hedges.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentZseEquities.map((corp) => (
                <div key={corp.symbol} className="rounded border border-[#18281f] bg-[#0f1914] p-4 flex flex-col justify-between transition hover:border-[#284836]">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#34d399] bg-[#122e1f] px-2 py-0.5 rounded border border-[#1e4832]">
                          {corp.symbol}
                        </span>
                        <span className="font-mono text-[10px] text-[#6e8577]">ZSE</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="block text-xs font-bold text-[#f4f7f5]">
                          ZiG {corp.sharePriceZiG.toLocaleString()}
                        </span>
                        {corp.sharePriceUSD && (
                          <span className="block text-[10px] text-[#8ea396]">
                            ${corp.sharePriceUSD.toFixed(2)} USD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <h4 className="font-bold text-sm text-[#f4f7f5]">{corp.name}</h4>
                      {corp.changePct != null && (
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            corp.changePct >= 0 ? "text-[#22c55e]" : "text-[#f87171]"
                          }`}
                        >
                          {corp.changePct >= 0 ? "+" : ""}
                          {corp.changePct.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#6e8577]">{corp.sector}</span>

                    <p className="mt-2 text-xs text-[#8ea396] leading-relaxed">
                      {corp.agriLinkage}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#17251e] flex items-center justify-between font-mono text-[10px] text-[#6e8577]">
                    <span>Mkt Cap: ${corp.marketCapUSDm}M USD</span>
                    <span>P/E Ratio: {corp.peRatio}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

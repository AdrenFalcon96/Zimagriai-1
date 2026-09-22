export interface FarmerRecord {
  farmer_id: string;
  district: string;
  nr: string;
  yield_t_ha: number;
  area_ha: number;
  confidence: number;
  est_production_t: number;
}

export interface ShrunkFarmerEstimate extends FarmerRecord {
  shrunk_estimate: number;
}

export interface TraceData {
  groupMeans: Record<string, number>;
  groupVars: Record<string, number>;
  farmerEstimates: ShrunkFarmerEstimate[];
}

export interface DistrictSummary {
  district: string;
  recordsCount: number;
  meanConfidence: number;
  rawProduction: number;
  shrunkProduction: number;
  meanYield: number;
  primaryNR: string;
}

export interface TreeNode {
  leaf?: number;
  f?: number;
  thr?: number;
  l?: TreeNode;
  r?: TreeNode;
}

export interface YieldModel {
  name: string;
  version: string;
  features: string[];
  init: number;
  learning_rate: number;
  trees: TreeNode[];
  metrics?: {
    mae?: number;
    r2?: number;
    sample_size?: number;
  };
}

export type SignalFamily = "crop" | "phenology" | "water" | "land-cover" | "biomass" | "soil";
export type SignalStatus = "implemented" | "provider-backed" | "calibration-required";

export interface SignalItem {
  id: string;
  name: string;
  source: string;
  family: SignalFamily;
  status: SignalStatus;
  resolution?: string;
  revisit?: string;
  description: string;
  agronomicUse: string;
  currentValue?: string;
  baselineValue?: string;
  anomaly?: string;
  anomalyPositive?: boolean;
  unit?: string;
  sparklineData?: number[];
}

export interface Observation {
  id: string;
  farmer_ref: string;
  district: string;
  crop: string;
  area_ha: number;
  yield_t_ha: number;
  est_production_t?: number;
  notes?: string | null;
  consent: boolean;
  source: string;
  created_at: string;
  confidence?: number;
  status: "verified" | "pending_corroboration" | "flagged";
  queuedLocally?: boolean;
}

export interface DatabaseStatus {
  status: "connected" | "error";
  host: string;
  database: string;
  observationsCount: number;
  auditCount: number;
  latencyMs: number;
  lastSyncAt: string;
  isFallback: boolean;
  error?: string;
}

export interface WorkerStatus {
  status: "online" | "degraded" | "unreachable";
  url: string;
  service: string;
  latencyMs: number;
  details?: {
    ok?: boolean;
    earth_engine_configured?: boolean;
  };
  error?: string;
}

export interface StakeholderSummaryItem {
  district: string;
  observations: number;
  mean_confidence: number;
  reported_production_t: number;
  confidence_weighted_production_t: number;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}


export interface WeatherDay {
  date: string;
  rain: number;
  temp: number;
}

export interface DistrictWeather {
  district: string;
  lat: number;
  lon: number;
  naturalRegion: string;
  dates: string[];
  rainfall: number[];
  temp: number[];
  totalRainfall: number;
  avgTemp: number;
  source: string;
  daily: WeatherDay[];
  error?: string;
}

export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedAction?: string;
}

// -------------------------------------------------------------
// Commodity Exchange, Derivatives & Warehouse Receipt System
// Mirroring ZMX, VFEX, FINSEC, and Minister Prof. Mthuli Ncube's initiative
// -------------------------------------------------------------

export type ExchangeVenue = "ZMX" | "VFEX" | "FINSEC";
export type CommodityInstrumentType = "spot" | "future" | "put_option" | "call_option" | "weather_swap";

export interface CommodityTicker {
  symbol: string;
  name: string;
  venue: ExchangeVenue;
  type: CommodityInstrumentType;
  crop: string;
  contractMonth?: string;
  strikePriceUSD?: number;
  spotPriceUSD: number;
  spotPriceZiG: number;
  change24hPct: number;
  volume24hMT: number;
  openInterestMT?: number;
  high24hUSD: number;
  low24hUSD: number;
  gradingStandard: string;
  lotSizeMT: number;
  marginRequirementPct?: number;
  underlyingMaturity?: string;
}

export interface OrderBookEntry {
  priceUSD: number;
  quantityMT: number;
  ordersCount: number;
}

export interface CommodityOrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastTradePriceUSD: number;
  lastTradeTime: string;
  spreadUSD: number;
}

export interface CertifiedWarehouse {
  id: string;
  name: string;
  operator: string;
  province: string;
  district: string;
  capacityMT: number;
  currentStockMT: number;
  utilizationPct: number;
  acceptedCrops: string[];
  accreditationBody: string;
  securityFeatures: string[];
  lat: number;
  lon: number;
}

export interface ElectronicWarehouseReceipt {
  receiptId: string;
  depositorRef: string;
  depositorType: "Smallholder Cooperative" | "Commercial Estate" | "Pfumvudza Cluster";
  warehouseId: string;
  warehouseName: string;
  crop: string;
  quantityMT: number;
  grade: "Grade A" | "Grade B" | "Grade C";
  moisturePct: number;
  aflatoxinPpb: number;
  issuanceDate: string;
  expiryDate: string;
  status: "unencumbered" | "pledged_collateral" | "listed_exchange" | "delivery_warrant_issued";
  pledgedBank?: string;
  collateralLTVPct?: number;
  assessedValueUSD: number;
  finsecCsdNumber: string;
}

export interface HistoricalPolicyMilestone {
  era: string;
  year: string;
  title: string;
  leadArchitect: string;
  description: string;
  outcome: string;
  riskWarning: string;
}

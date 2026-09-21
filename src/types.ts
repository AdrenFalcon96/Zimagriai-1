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

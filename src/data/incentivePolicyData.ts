export interface IncentiveTier {
  tier: "Standard" | "Silver" | "Gold" | "Platinum";
  minVerifiedRecords: number;
  dataQualityThreshold: number; // e.g., 0.85
  airtimeStipendUsd: number;
  solarBatteryPackBonus: boolean;
  priorityBellarusAccess: boolean; // Priority booking for ministry mechanisation pool
  agritexAllowanceUsd: number; // Monthly performance allowance
}

export interface OfficerIncentiveProfile {
  officerId: string;
  officerName: string;
  ward: string;
  district: string;
  totalSubmissions: number;
  verifiedSubmissions: number;
  corroboratedRatio: number;
  currentTier: "Standard" | "Silver" | "Gold" | "Platinum";
  accruedAirtimeUsd: number;
  accruedAllowanceUsd: number;
  solarPackEarned: boolean;
  fertilizerVoucherIssued: boolean;
  lastSyncTimestamp: string;
}

export interface DataCaptureProblemSolution {
  historicalIssue: string;
  rootCause: string;
  impactOnMinistry: string;
  platformSolution: string;
  incentiveMechanism: string;
}

export const AGRITEX_DATA_CAPTURE_SOLUTIONS: DataCaptureProblemSolution[] = [
  {
    historicalIssue: "Paper-based, Delayed Field Forms (60–90 day lag)",
    rootCause: "Extension officers rely on paper questionnaires collected at ward level and manually ferried to provincial offices, causing massive reporting lag during critical planting & harvest windows.",
    impactOnMinistry: "GMB strategic reserve estimates and Treasury food balance sheets were compiled months too late, triggering panic grain imports or emergency fiscal outlays.",
    platformSolution: "Offline-First Mobile PWA with Local Cryptographic Queue. Extension officers record field cadastre directly on cheap Android phones even with zero GSM signal.",
    incentiveMechanism: "Micro-Stipends per Verified Record ($0.50 – $1.20 automated airtime/data credit credited upon satellite corroboration).",
  },
  {
    historicalIssue: "Fabricated / 'Desktop Survey' Crop Yields",
    rootCause: "Due to lack of motorcycle fuel, harsh terrain, or poor motivation, field officers often estimate yields sitting under a tree without walking the transects.",
    impactOnMinistry: "Distorted national yield figures (often over-reporting production by 30–45%), leading to unexpected silo shortages.",
    platformSolution: "Dual-Verification Gate: Mobile submissions are instantly matched with 15-Signal Multi-Sensor telemetry (Sentinel-2 10m NDVI & SAR soil moisture). Submissions with >30% variance trigger empirical Bayes confidence penalties.",
    incentiveMechanism: "Quality-Gated Allowance Multipliers: Officers with >85% satellite corroboration unlock the Gold Tier, receiving double monthly allowances plus fuel coupons.",
  },
  {
    historicalIssue: "High Mobile Data Costs & Deep Rural Connectivity Loss",
    rootCause: "Econet/NetOne rural network dead-zones and high cost of mobile broadband out-of-pocket for civil servants.",
    impactOnMinistry: "Low submission rates from the most vulnerable, food-insecure rural wards (Chivi, Zaka, Binga, Mwenezi).",
    platformSolution: "Ultra-compact binary JSON payloads (<1.5 KB per record) that automatically queue offline and sync via asynchronous background sync when cell tower handshake occurs.",
    incentiveMechanism: "Zero-Rated Carrier Gateway & Automated Monthly Data Allowance: Direct automated NetOne/Econet data bundling financed through ZMX warehouse transaction levies.",
  },
  {
    historicalIssue: "Lack of Tangible Career & Material Motivation",
    rootCause: "AGRITEX extension officers are frontline agronomic heroes but historically under-equipped with solar chargers, rugged tablets, and career recognition.",
    impactOnMinistry: "High attrition rate and low morale among ward supervisors and extension staff.",
    platformSolution: "Transparent National Extension Leaderboard & Verified Digital Portfolio: Every officer builds an auditable, cryptographic track record of verified wards.",
    incentiveMechanism: "Productivity Equipment Grants: Reaching 250 verified smallholder records awards an off-grid solar power bank, rugged field kit, and priority mechanized service vouchers.",
  },
];

export const INCENTIVE_TIERS: IncentiveTier[] = [
  {
    tier: "Standard",
    minVerifiedRecords: 0,
    dataQualityThreshold: 0.65,
    airtimeStipendUsd: 10,
    solarBatteryPackBonus: false,
    priorityBellarusAccess: false,
    agritexAllowanceUsd: 25,
  },
  {
    tier: "Silver",
    minVerifiedRecords: 75,
    dataQualityThreshold: 0.75,
    airtimeStipendUsd: 25,
    solarBatteryPackBonus: false,
    priorityBellarusAccess: false,
    agritexAllowanceUsd: 60,
  },
  {
    tier: "Gold",
    minVerifiedRecords: 150,
    dataQualityThreshold: 0.85,
    airtimeStipendUsd: 50,
    solarBatteryPackBonus: true,
    priorityBellarusAccess: true,
    agritexAllowanceUsd: 120,
  },
  {
    tier: "Platinum",
    minVerifiedRecords: 300,
    dataQualityThreshold: 0.92,
    airtimeStipendUsd: 100,
    solarBatteryPackBonus: true,
    priorityBellarusAccess: true,
    agritexAllowanceUsd: 250,
  },
];

export const SAMPLE_EXTENSION_OFFICERS: OfficerIncentiveProfile[] = [
  {
    officerId: "EXT-MRH-042",
    officerName: "Tendai Chiwara",
    ward: "Ward 8 (Musami)",
    district: "Murehwa",
    totalSubmissions: 184,
    verifiedSubmissions: 172,
    corroboratedRatio: 0.935,
    currentTier: "Gold",
    accruedAirtimeUsd: 86.0,
    accruedAllowanceUsd: 206.4,
    solarPackEarned: true,
    fertilizerVoucherIssued: true,
    lastSyncTimestamp: "Today, 08:24 CAT",
  },
  {
    officerId: "EXT-ZAK-019",
    officerName: "Blessing Moyo",
    ward: "Ward 14 (Chivamba)",
    district: "Zaka",
    totalSubmissions: 142,
    verifiedSubmissions: 129,
    corroboratedRatio: 0.908,
    currentTier: "Silver",
    accruedAirtimeUsd: 64.5,
    accruedAllowanceUsd: 154.8,
    solarPackEarned: false,
    fertilizerVoucherIssued: true,
    lastSyncTimestamp: "Yesterday, 17:15 CAT",
  },
  {
    officerId: "EXT-UMG-007",
    officerName: "Sipho Ndlovu",
    ward: "Ward 5 (Nyamandlovu)",
    district: "Umguza",
    totalSubmissions: 210,
    verifiedSubmissions: 198,
    corroboratedRatio: 0.942,
    currentTier: "Gold",
    accruedAirtimeUsd: 99.0,
    accruedAllowanceUsd: 237.6,
    solarPackEarned: true,
    fertilizerVoucherIssued: true,
    lastSyncTimestamp: "Today, 11:42 CAT",
  },
  {
    officerId: "EXT-MZW-088",
    officerName: "Ruvimbo Mupfumi",
    ward: "Ward 3 (Concession)",
    district: "Mazowe",
    totalSubmissions: 312,
    verifiedSubmissions: 298,
    corroboratedRatio: 0.955,
    currentTier: "Platinum",
    accruedAirtimeUsd: 149.0,
    accruedAllowanceUsd: 357.6,
    solarPackEarned: true,
    fertilizerVoucherIssued: true,
    lastSyncTimestamp: "Today, 12:05 CAT",
  },
];

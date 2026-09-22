export interface PolicyInstrument {
  id: string;
  category: "constitutional" | "statutory_act" | "statutory_instrument" | "national_strategy" | "ministerial_program";
  title: string;
  reference: string;
  institutionalCustodian: string;
  enactedYear: string;
  coreObjective: string;
  constitutionalBasis?: string;
  platformComplementaryRole: string; // How this AI platform facilitatively empowers and operationalizes the policy
  keyMetricsOrTargets: string[];
}

export interface PolicyHistoryMilestone {
  era: string;
  policyName: string;
  ministryContext: string;
  doctrine: string;
  institutionalImpact: string;
  keyLessonLearned: string;
  platformAlignment: string;
}

export const ZIMBABWE_CONSTITUTIONAL_FOUNDATIONS = [
  {
    section: "Section 15",
    title: "Food Security Directive",
    text: "The State must encourage people to grow and store adequate food; secure the establishment of adequate food reserves; and encourage and promote adequate and proper nutrition through programmes and information campaigns.",
    application: "ZimAgriAI directly serves Section 15 by calculating empirical Bayes shrinkage national harvest predictions and strategic GMB silo reserve import triggers.",
  },
  {
    section: "Section 20(1)(c)",
    title: "Youth in Agriculture and Economic Empowerment",
    text: "The State and all institutions and agencies of government at every level must take reasonable measures, including affirmative action programmes, to ensure that youths are afforded opportunities for employment and other avenues to economic empowerment.",
    application: "Enables youth smallholders and agri-fintech entrepreneurs to access ZMX/VFEX commodity floors and warehouse receipt liquidity.",
  },
  {
    section: "Section 72",
    title: "Agricultural Land Vesting and Custody",
    text: "All agricultural land is vested in the State for the public benefit, with sovereign stewardship over allocation and productivity verification.",
    application: "Empowers the Ministry of Lands and Rural Development and AGRITEX with objective remote-sensing crop cadastre verification.",
  },
  {
    section: "Section 77",
    title: "Right to Food and Water",
    text: "Every person has the right to safe, clean and potable water and sufficient food.",
    application: "Informs the Ministry of Agriculture, Mechanisation and Water Resources Development on dam hydrology, irrigation scheduling, and drought mitigation.",
  },
  {
    section: "Section 104(1)",
    title: "Cabinet Structure & Executive Portfolios",
    text: "Empowers the President to assign ministerial portfolios and execute administrative reorganization.",
    application: "Formalizes the 2026 restructuring splitting the portfolio into the Ministry of Agriculture, Mechanisation and Water Resources Development (Dr. A.J. Masuka) and Ministry of Lands and Rural Development (V. Haritatos).",
  },
];

export const POLICY_INSTRUMENTS: PolicyInstrument[] = [
  {
    id: "ndsb-agri",
    category: "national_strategy",
    title: "National Development Strategy 1 & 2 (NDS1 / NDS2) — Agriculture Sector Transformation",
    reference: "NDS1 Agriculture Anchor (2021–2025) / NDS2 (2026–2030)",
    institutionalCustodian: "Ministry of Agriculture, Mechanisation and Water Resources Development & Office of the President and Cabinet (OPC)",
    enactedYear: "2021 / 2026",
    coreObjective: "Drive rural industrialization, transform agriculture from a subsistence sector into an $8.2B+ economic juggernaut, achieve food self-sufficiency, and establish climate-resilient water infrastructure.",
    constitutionalBasis: "Section 15 & Section 77",
    platformComplementaryRole: "Provides granular district-level yield estimation and multi-sensor corroboration so macroeconomic planners track NDS benchmarks against satellite ground truth.",
    keyMetricsOrTargets: [
      "Gross Agricultural Output target: $8.2 Billion+",
      "Cereal self-sufficiency: ≥2.2 Million MT White Maize annually",
      "Horticulture recovery: Export surplus exceeding $250 Million",
      "Wheat sovereignty: 450,000+ MT Winter Wheat production",
    ],
  },
  {
    id: "pfumvudza-intwasa",
    category: "ministerial_program",
    title: "Pfumvudza / Intwasa Climate-Proofed Presidential Inputs Scheme",
    reference: "National Agro-Ecological Tailoring Directive",
    institutionalCustodian: "Department of Agricultural, Technical and Extension Services (AGRITEX)",
    enactedYear: "2020 to Present",
    coreObjective: "Household and national food security through zero-tillage potholing, permanent soil organic cover (mulching), precise micro-dosed fertilization, and strict agro-ecological crop matching (maize in NR II/III; sorghum and millet in NR IV/V).",
    constitutionalBasis: "Section 15 (Food Security)",
    platformComplementaryRole: "Matches extension field logs with satellite phenology (Savitzky-Golay) and NASA POWER dry-spell alerts to guide extension officers on optimal planting windows and split top-dressing schedules.",
    keyMetricsOrTargets: [
      "Targeted households: 3.5 Million smallholder families nationwide",
      "Plot specification: 5 standard plots (39m x 16m) yielding food security + commercial surplus",
      "Grain yield target: >1.0 MT per 0.06 ha plot (>15 t/ha agronomic ceiling)",
    ],
  },
  {
    id: "gmb-act",
    category: "statutory_act",
    title: "Grain Marketing Act [Chapter 18:14] & Strategic Grain Reserve (SGR)",
    reference: "Chapter 18:14 as amended",
    institutionalCustodian: "Grain Marketing Board (GMB) / Ministry of Agriculture, Mechanisation and Water Resources Development",
    enactedYear: "1931 / 1966 / 2001 / 2023 Consolidated",
    coreObjective: "Ensure physical availability of grain, maintain the Strategic Grain Reserve (SGR) buffer (minimum 500,000 MT physical grain), manage buyer of last resort provisions, and stabilize grain prices.",
    constitutionalBasis: "Section 15(a) & (b)",
    platformComplementaryRole: "Supplies empirical Bayes shrinkage models that give GMB and Treasury objective, satellite-corroborated harvest totals months ahead of harvest, preventing emergency fiscal over-importation or unexpected domestic shortfalls.",
    keyMetricsOrTargets: [
      "Minimum Physical SGR Buffer: 500,000 MT maize & traditional grains",
      "Strategic Cash Reserve: Dynamic Treasury import buffer allocation",
      "Quality assurance: Moisture ≤12.5%, Defective ≤3.0%, Aflatoxin <5 ppb",
    ],
  },
  {
    id: "si-184-188",
    category: "statutory_instrument",
    title: "Warehouse Receipt System Act & Statutory Instruments 184 & 188 of 2021 (ZMX Framework)",
    reference: "SI 184 of 2021 / SI 188 of 2021",
    institutionalCustodian: "Agricultural Marketing Authority (AMA) & Securities and Exchange Commission of Zimbabwe (SECZIM)",
    enactedYear: "2021",
    coreObjective: "Legally mandate the issuance of transferable Electronic Warehouse Receipts (e-WR) backed by certified physical silos (GMB and private), creating collateralized liquidity and transparent open-market pricing.",
    constitutionalBasis: "Section 13 (National Development) & Section 15",
    platformComplementaryRole: "Provides satellite crop yield verification for the surrounding silo catchment areas, corroborating warehouse physical stock entries to eliminate phantom receipts and lower bank collateral haircut rates from 40% to 15%.",
    keyMetricsOrTargets: [
      "Certified Silos: 48 operational facilities across 10 provinces",
      "Bank Loan-to-Value (LTV): Up to 70% collateralized borrowing (CBZ, AFC)",
      "Zero phantom inventory: Central Securities Depository (CSD) immutable ledger",
    ],
  },
  {
    id: "water-act-zinwa",
    category: "statutory_act",
    title: "Water Act [Chapter 20:24] & Zimbabwe National Water Authority (ZINWA) Act [Chapter 20:25]",
    reference: "Chapter 20:24 & Chapter 20:25",
    institutionalCustodian: "ZINWA / Ministry of Agriculture, Mechanisation and Water Resources Development",
    enactedYear: "1998 / Revised 2022",
    coreObjective: "Vesting all commercial water bodies in the State, catchment and sub-catchment participatory management, equitable water allocation, and irrigation infrastructure sustainability.",
    constitutionalBasis: "Section 77(a) (Right to Safe Water)",
    platformComplementaryRole: "Monitors dam catchment NDVI, Crop Water Stress Index (CWSI), and SAR topsoil radar moisture across commercial irrigation basins (Tugwi-Mukosi, Lake Mutirikwi, Osborne, Mazowe) to optimize water release scheduling.",
    keyMetricsOrTargets: [
      "Irrigated hectarage expansion: Target 350,000 Ha under functional center-pivots/drip by 2028",
      "National Dam Capacity: Overseeing >10,000 inland water bodies",
      "Winter Wheat Irrigation Guarantee: 100% water security for 120,000 Ha",
    ],
  },
  {
    id: "mechanisation-alliance",
    category: "ministerial_program",
    title: "National Agricultural Mechanisation Transformation Facility (Bellarus & John Deere Facilities)",
    reference: "Bellarus Phase I/II & John Deere Facility Bilateral Agreements",
    institutionalCustodian: "Department of Agricultural Engineering and Mechanisation",
    enactedYear: "2019 to Present",
    coreObjective: "Equip smallholders, A1/A2 farmers, and youth agricultural syndicates with high-efficiency tractors, combine harvesters, planters, and pivot systems on concessionary terms to lift national tillage capacity.",
    constitutionalBasis: "Section 13 (Economic Development)",
    platformComplementaryRole: "Corroborates field preparation dates and sowing windows against satellite Sentinel-2 phenology, enabling the Mechanisation Directorate to deploy machinery pools to districts with impending rainfall windows.",
    keyMetricsOrTargets: [
      "Tractors deployed: >3,500 units into national farming clusters",
      "Combine harvesters: Dedicated pool to reduce post-harvest wheat loss below 3%",
      "Mechanisation density: Moving toward 1.5 kW/ha national standard",
    ],
  },
  {
    id: "agritex-data-incentive-framework",
    category: "ministerial_program",
    title: "AGRITEX Field Cadastre & Data Capture Incentive Policy (DCIP)",
    reference: "National Extension Modernization & Telemetry Verification Framework",
    institutionalCustodian: "Department of Agricultural, Technical and Extension Services (AGRITEX)",
    enactedYear: "2026 Statutory Framework",
    coreObjective: "Eliminate paper-based reporting delays, fabricated 'desktop' surveys, and out-of-pocket field data costs by rewarding extension officers with micro-stipends, solar charging kits, and automated performance allowances upon satellite-verified smallholder telemetry capture.",
    constitutionalBasis: "Section 15 (Food Security Evidence) & Section 195 (Public Administration Integrity)",
    platformComplementaryRole: "Provides the underlying local-first offline cryptographic queue, automated 15-signal Sentinel-2/SAR corroboration gate, and instant automated airtime/allowance disbursement engine.",
    keyMetricsOrTargets: [
      "Field-to-Cloud Latency: Reduced from 60–90 days to <4 hours upon cell tower handshake",
      "Desktop Survey Fabrication Rate: Decreased from estimated 35% to <2.5% through satellite corroboration gates",
      "Extension Officer Direct Earnings: $50 – $250/month in quality-linked performance stipends and airtime credits",
      "Verified Smallholder Cadastre Coverage: Scaling to 3.5 Million Pfumvudza/Intwasa farming households",
    ],
  },
];

export const POLICY_HISTORY_MILESTONES: PolicyHistoryMilestone[] = [
  {
    era: "1980 – 1990",
    policyName: "Post-Independence Communal Grain Expansion",
    ministryContext: "Ministry of Agriculture",
    doctrine: "Universal state-guaranteed producer pricing, massive GMB collection depot expansion into communal areas, credit subsidies through the Agricultural Finance Corporation (AFC).",
    institutionalImpact: "Smallholders expanded from 10% to over 60% of national marketed white maize deliveries. However, fiscal strain mounted as GMB carried unsustainably large storage losses.",
    keyLessonLearned: "Subsidies without empirical production forecasting and market clearing lead to unsustainable fiscal debt cycles.",
    platformAlignment: "Provides live empirical Bayes cost-benefit modeling to prevent fiscal over-commitments while protecting farmgate viability.",
  },
  {
    era: "1991 – 2000",
    policyName: "ESAP Deregulation & ZIMACE Era",
    ministryContext: "Ministry of Agriculture and Fisheries",
    doctrine: "Market liberalization under the Economic Structural Adjustment Programme (ESAP). Launch of the Zimbabwe Agricultural Commodity Exchange (ZIMACE) in 1994 as a private forward and spot bourse.",
    institutionalImpact: "Private grain trading surged and commercial hedging emerged. However, communal and smallholder farmers remained disconnected from the exchange due to lack of certified rural grading silos and information asymmetry.",
    keyLessonLearned: "Commodity exchanges cannot function equitably without decentralized certified warehouse receipt infrastructure accessible to smallholders.",
    platformAlignment: "Directly integrates smallholder field cadastre into ZMX and VFEX floor mechanisms, democratizing price discovery down to ward level.",
  },
  {
    era: "2001 – 2017",
    policyName: "Fast-Track Land Reform & Command Agriculture (CBZ/FSG)",
    ministryContext: "Ministry of Agriculture, Mechanisation and Irrigation Development",
    doctrine: "Redistribution of commercial farmland to over 300,000 smallholders (A1) and commercial farms (A2). Statutory Instrument 235 of 2001 designating grain as a controlled product. Later replaced by Targeted Command Agriculture (Special Programme for Import Substitution).",
    institutionalImpact: "Democratized land access, but initial production suffered from capital scarcity, lack of collateral tenure, and reliance on unhedged government input credits.",
    keyLessonLearned: "Land tenure requires bankable, movable asset collateral (such as Warehouse Receipts) and independent yield verification to unlock commercial private lending.",
    platformAlignment: "Eliminates phantom crop claims through multi-spectral satellite corroboration, allowing banks (CBZ, AFC) to lend against verified standing crops and warehouse receipts.",
  },
  {
    era: "2018 – 2025",
    policyName: "Pfumvudza/Intwasa & Commodity Modernization (ZMX & VFEX)",
    ministryContext: "Ministry of Lands, Agriculture, Fisheries, Water and Rural Development",
    doctrine: "Climate-proofing smallholder agriculture via conservation farming (Pfumvudza). Revitalizing market discovery with ZMX (SI 184/188 of 2021) and Treasury's agricultural derivatives doctrine under Prof. Mthuli Ncube.",
    institutionalImpact: "Historic winter wheat self-sufficiency (over 450,000 MT in 2023/2024), eradication of wheat imports, and launch of electronic warehouse receipts backed by SECZIM and GMB.",
    keyLessonLearned: "Blended models combining disciplined state input support (Pfumvudza) with modern capital market instruments (ZMX/VFEX) yield the highest resilience.",
    platformAlignment: "Serves as the technical bridge between Pfumvudza field plots and capital market hedging floors.",
  },
  {
    era: "2026 – Present",
    policyName: "Constitutional Portfolio Realignment & Spatial AI Integration",
    ministryContext: "Ministry of Agriculture, Mechanisation and Water Resources Development (Minister Dr. A.J. Masuka) & Ministry of Lands and Rural Development (Minister V. Haritatos)",
    doctrine: "Presidential restructuring under Section 104(1) of the Constitution to sharply specialize on production mechanics, national water harvesting, dam irrigation, and mechanization, while land tenure and rural cadastre reside in Lands and Rural Development.",
    institutionalImpact: "Laser focus on water security, 350,000 Ha irrigation target, farm machinery pool expansion, and data-driven agro-ecological governance.",
    keyLessonLearned: "Effective policy execution requires specialized ministerial structures supported by sovereign, unmanipulated spatial AI evidence.",
    platformAlignment: "Fully aligned with the Ministry of Agriculture, Mechanisation and Water Resources Development as an institutional, constitutional facilitatory copilot.",
  },
];

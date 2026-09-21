import { Pool, types } from "pg";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Parse PostgreSQL numeric types (OID 1700) as JavaScript numbers
types.setTypeParser(1700, (val: string) => (val === null ? null : parseFloat(val)));

const defaultRenderUrl =
  "postgresql://zimagriai_user:Uk0MyxIJBFq6oDyrUSjqL1gLVNcIcwR2@dpg-dalgj9qjnfac739gj2u0-a.frankfurt-postgres.render.com/zimagriai";

const connectionString = process.env.DATABASE_URL || defaultRenderUrl;

// Initialize PostgreSQL Connection Pool with SSL configured for Render
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

export interface DBObservation {
  id: string;
  owner_id?: string | null;
  field_id?: string | null;
  farmer_ref: string;
  district: string;
  crop: string;
  area_ha: number;
  yield_t_ha: number;
  est_production_t: number;
  confidence: number;
  notes?: string | null;
  source: "web" | "mobile" | "ussd" | "import" | "api";
  consent: boolean;
  created_at: string;
  updated_at: string;
  status?: "verified" | "pending_corroboration" | "flagged";
}

export interface DBAuditLog {
  id: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DBStakeholderSummary {
  district: string;
  observations: number;
  mean_confidence: number;
  reported_production_t: number;
  confidence_weighted_production_t: number;
}

// In-memory fallback if database connection drops
const fallbackObservations: DBObservation[] = [
  {
    id: "obs-fallback-01",
    farmer_ref: "F-MUREHWA-042",
    district: "Murehwa",
    crop: "maize",
    area_ha: 1.8,
    yield_t_ha: 3.4,
    est_production_t: 6.12,
    confidence: 0.88,
    notes: "SC513 hybrid variety, Pfumvudza mulched basin trial with top dressing applied early January.",
    source: "web",
    consent: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "verified",
  },
  {
    id: "obs-fallback-02",
    farmer_ref: "F-ZAKA-109",
    district: "Zaka",
    crop: "sorghum",
    area_ha: 2.2,
    yield_t_ha: 1.9,
    est_production_t: 4.18,
    confidence: 0.76,
    notes: "Sorghum SV2 drought-tolerant seed, low moisture stress observed in early vegetative phase.",
    source: "ussd",
    consent: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: "verified",
  },
  {
    id: "obs-fallback-03",
    farmer_ref: "F-UMGUZA-015",
    district: "Umguza",
    crop: "maize",
    area_ha: 3.0,
    yield_t_ha: 2.1,
    est_production_t: 6.3,
    confidence: 0.82,
    notes: "Supplemental borehole pivot irrigation during dry spell.",
    source: "mobile",
    consent: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    status: "verified",
  },
];

/**
 * Get overall PostgreSQL database health and stats
 */
export async function getDatabaseStatus() {
  const start = Date.now();
  try {
    const timeRes = await pool.query("SELECT NOW() as now;");
    const latencyMs = Date.now() - start;

    const obsCountRes = await pool.query("SELECT COUNT(*) as count FROM observations;");
    const auditCountRes = await pool.query("SELECT COUNT(*) as count FROM audit_log;");

    // Mask credentials in connection string for security
    const parsedUrl = new URL(connectionString);
    const host = parsedUrl.host;
    const database = parsedUrl.pathname.replace("/", "");

    return {
      status: "connected" as const,
      host,
      database,
      observationsCount: parseInt(obsCountRes.rows[0].count, 10),
      auditCount: parseInt(auditCountRes.rows[0].count, 10),
      latencyMs,
      lastSyncAt: timeRes.rows[0].now,
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database connection failed";
    return {
      status: "error" as const,
      host: "frankfurt-postgres.render.com",
      database: "zimagriai",
      observationsCount: fallbackObservations.length,
      auditCount: 0,
      latencyMs: Date.now() - start,
      lastSyncAt: new Date().toISOString(),
      isFallback: true,
      error: message,
    };
  }
}

/**
 * Retrieve all field observations from PostgreSQL
 */
export async function fetchObservations(): Promise<{ observations: DBObservation[]; source: "postgres" | "fallback" }> {
  try {
    const res = await pool.query(`
      SELECT 
        id, 
        owner_id, 
        field_id, 
        farmer_ref, 
        district, 
        COALESCE(crop, 'maize') as crop, 
        COALESCE(area_ha, 1.0) as area_ha, 
        COALESCE(yield_t_ha, 1.0) as yield_t_ha, 
        COALESCE(est_production_t, area_ha * yield_t_ha, 1.0) as est_production_t, 
        COALESCE(confidence, 0.72) as confidence, 
        notes, 
        source, 
        consent, 
        created_at, 
        updated_at
      FROM observations
      ORDER BY created_at DESC;
    `);

    const formatted: DBObservation[] = res.rows.map((row) => ({
      id: row.id,
      owner_id: row.owner_id,
      field_id: row.field_id,
      farmer_ref: row.farmer_ref,
      district: row.district,
      crop: row.crop,
      area_ha: Number(row.area_ha),
      yield_t_ha: Number(row.yield_t_ha),
      est_production_t: Number(row.est_production_t),
      confidence: Number(row.confidence),
      notes: row.notes,
      source: row.source,
      consent: row.consent,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      status: Number(row.confidence) >= 0.5 ? "verified" : "pending_corroboration",
    }));

    return { observations: formatted, source: "postgres" };
  } catch (err) {
    console.error("PostgreSQL fetch failed, returning in-memory fallback:", err);
    return { observations: fallbackObservations, source: "fallback" };
  }
}

/**
 * Create a new observation in PostgreSQL and log to audit_log atomically
 */
export async function createObservation(data: {
  farmer_ref: string;
  district: string;
  crop?: string;
  area_ha: number;
  yield_t_ha: number;
  notes?: string | null;
  consent: boolean;
  source?: string;
}): Promise<DBObservation> {
  // Normalize source enum to match PostgreSQL observation_source enum
  let normalizedSource: "web" | "mobile" | "ussd" | "import" | "api" = "web";
  const s = String(data.source || "web").toLowerCase();
  if (s.includes("mobile")) normalizedSource = "mobile";
  else if (s.includes("ussd")) normalizedSource = "ussd";
  else if (s.includes("import")) normalizedSource = "import";
  else if (s.includes("api")) normalizedSource = "api";
  else normalizedSource = "web";

  const areaHa = Number(data.area_ha);
  const yieldTHa = Number(data.yield_t_ha);
  const estProduction = parseFloat((areaHa * yieldTHa).toFixed(4));
  const crop = data.crop ? data.crop.trim() : "maize";

  // Prior confidence scoring
  const confidence = yieldTHa > 0 && yieldTHa <= 10 ? 0.78 : 0.35;
  const newId = crypto.randomUUID();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO observations (
        id, 
        farmer_ref, 
        district, 
        crop, 
        area_ha, 
        yield_t_ha, 
        est_production_t, 
        confidence, 
        notes, 
        source, 
        consent, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *;
    `;

    const res = await client.query(insertQuery, [
      newId,
      data.farmer_ref.trim(),
      data.district.trim(),
      crop,
      areaHa,
      yieldTHa,
      estProduction,
      confidence,
      data.notes ? data.notes.trim() : null,
      normalizedSource,
      Boolean(data.consent),
    ]);

    // Insert corresponding audit log entry
    const auditQuery = `
      INSERT INTO audit_log (action, entity_type, entity_id, metadata, created_at)
      VALUES ($1, $2, $3, $4, NOW());
    `;

    await client.query(auditQuery, [
      "create",
      "observation",
      newId,
      JSON.stringify({
        farmer_ref: data.farmer_ref,
        district: data.district,
        crop,
        area_ha: areaHa,
        yield_t_ha: yieldTHa,
        source: normalizedSource,
      }),
    ]);

    await client.query("COMMIT");

    const row = res.rows[0];
    const createdObs: DBObservation = {
      id: row.id,
      farmer_ref: row.farmer_ref,
      district: row.district,
      crop: row.crop,
      area_ha: Number(row.area_ha),
      yield_t_ha: Number(row.yield_t_ha),
      est_production_t: Number(row.est_production_t),
      confidence: Number(row.confidence),
      notes: row.notes,
      source: row.source,
      consent: row.consent,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      status: confidence >= 0.5 ? "verified" : "pending_corroboration",
    };

    return createdObs;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database insert failed, falling back to local memory store:", err);

    // If Postgres is unreachable or errors, store in local fallback
    const fallbackObs: DBObservation = {
      id: newId,
      farmer_ref: data.farmer_ref.trim(),
      district: data.district.trim(),
      crop,
      area_ha: areaHa,
      yield_t_ha: yieldTHa,
      est_production_t: estProduction,
      confidence,
      notes: data.notes ? data.notes.trim() : null,
      source: normalizedSource,
      consent: Boolean(data.consent),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: confidence >= 0.5 ? "verified" : "pending_corroboration",
    };
    fallbackObservations.unshift(fallbackObs);
    return fallbackObs;
  } finally {
    client.release();
  }
}

/**
 * Fetch stakeholder district summary (view from PostgreSQL)
 */
export async function fetchStakeholderSummary(): Promise<DBStakeholderSummary[]> {
  try {
    const res = await pool.query(`
      SELECT 
        district, 
        COALESCE(observations, 0) as observations, 
        COALESCE(mean_confidence, 0) as mean_confidence, 
        COALESCE(reported_production_t, 0) as reported_production_t, 
        COALESCE(confidence_weighted_production_t, 0) as confidence_weighted_production_t
      FROM stakeholder_district_summary;
    `);

    return res.rows.map((r) => ({
      district: r.district,
      observations: parseInt(r.observations, 10),
      mean_confidence: Number(r.mean_confidence),
      reported_production_t: Number(r.reported_production_t),
      confidence_weighted_production_t: Number(r.confidence_weighted_production_t),
    }));
  } catch (err) {
    console.error("Error querying stakeholder_district_summary:", err);
    return [];
  }
}

/**
 * Fetch recent audit logs from PostgreSQL
 */
export async function fetchAuditLogs(): Promise<DBAuditLog[]> {
  try {
    const res = await pool.query(`
      SELECT id, actor_id, action, entity_type, entity_id, metadata, created_at
      FROM audit_log
      ORDER BY created_at DESC
      LIMIT 25;
    `);

    return res.rows.map((r) => ({
      id: String(r.id),
      actor_id: r.actor_id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      metadata: r.metadata,
      created_at: new Date(r.created_at).toISOString(),
    }));
  } catch (err) {
    console.error("Error querying audit_log:", err);
    return [];
  }
}

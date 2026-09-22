import React, { useState, useEffect, useCallback } from "react";
import { FarmerRecord, TraceData, YieldModel, Observation, DistrictWeather, DatabaseStatus, WorkerStatus } from "./types";
import { parseCSV, fitHierarchicalModel } from "./lib/modelCore";
import { defaultYieldModel, generateSeedPilotRecords } from "./lib/pilotData";
import { fetchAllPrimaryDistricts } from "./lib/weather";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { OverviewSection } from "./components/OverviewSection";
import { SignalsSection } from "./components/SignalsSection";
import { AnalysisSection } from "./components/AnalysisSection";
import { FieldCaptureSection } from "./components/FieldCaptureSection";
import { WeatherTelemetrySection } from "./components/WeatherTelemetrySection";
import { AIAdvisorSection } from "./components/AIAdvisorSection";
import { GovernanceSection } from "./components/GovernanceSection";
import { CommodityExchangeSection } from "./components/CommodityExchangeSection";
import { Loader2, AlertCircle } from "lucide-react";

const OFFLINE_QUEUE_KEY = "zimagriai.offline.queue.v2";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [panel, setPanel] = useState<FarmerRecord[]>([]);
  const [trace, setTrace] = useState<TraceData | null>(null);
  const [model, setModel] = useState<YieldModel | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<Observation[]>([]);
  const [weatherData, setWeatherData] = useState<DistrictWeather[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Offline Queue from localStorage
  const loadOfflineQueue = useCallback(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        setOfflineQueue(JSON.parse(raw));
      }
    } catch {
      setOfflineQueue([]);
    }
  }, []);

  const saveOfflineQueue = useCallback((items: Observation[]) => {
    setOfflineQueue(items);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
  }, []);

  // Check PostgreSQL Database Connection Status
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/db/status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.warn("Could not check PostgreSQL database status", err);
    }
  }, []);

  // Check Render Docker Remote Sensing Worker Status
  const fetchWorkerStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/worker/status");
      if (res.ok) {
        const data = await res.json();
        setWorkerStatus(data);
      }
    } catch (err) {
      console.warn("Could not check Render worker status", err);
    }
  }, []);

  // Fetch verified observations from server (backed by PostgreSQL)
  const fetchObservations = useCallback(async () => {
    try {
      const res = await fetch("/api/observations");
      if (res.ok) {
        const data = await res.json();
        if (data.observations) {
          setObservations(data.observations);
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote observations, using cached ledger", err);
    }
  }, []);

  // Load weather telemetry
  const loadTelemetry = useCallback(async () => {
    setIsWeatherLoading(true);
    try {
      const telemetry = await fetchAllPrimaryDistricts();
      setWeatherData(telemetry);
    } catch (err) {
      console.error("Telemetry error:", err);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Bootstrap initial CSV, Yield Model JSON, and PostgreSQL state
  useEffect(() => {
    async function boot() {
      try {
        setIsLoading(true);
        let parsedRecords: FarmerRecord[] = [];
        let loadedModel: YieldModel = defaultYieldModel;

        try {
          const [csvRes, modelRes] = await Promise.all([
            fetch("/data/seeded_pilot.csv"),
            fetch("/data/yield_model.json"),
          ]);

          if (csvRes.ok) {
            const csvText = await csvRes.text();
            if (!csvText.trim().startsWith("<") && !csvText.includes("<!doctype")) {
              const parsed = parseCSV(csvText);
              if (parsed.rows.length > 0) {
                parsedRecords = parsed.rows;
              }
            }
          }

          if (modelRes.ok) {
            const text = await modelRes.text();
            if (!text.trim().startsWith("<") && !text.includes("<!doctype")) {
              const parsedJson = JSON.parse(text);
              if (parsedJson && parsedJson.trees && Array.isArray(parsedJson.trees)) {
                loadedModel = parsedJson;
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Static file fetch error, using built-in seed dataset:", fetchErr);
        }

        // If CSV fetch returned HTML or was empty, use generated seed pilot records
        if (parsedRecords.length === 0) {
          parsedRecords = generateSeedPilotRecords();
        }

        setPanel(parsedRecords);
        const fitted = fitHierarchicalModel(parsedRecords, 1.0);
        setTrace(fitted);
        setModel(loadedModel);

        loadOfflineQueue();
        await Promise.all([fetchObservations(), fetchDbStatus(), fetchWorkerStatus()]);
        await loadTelemetry();
      } catch (err: unknown) {
        console.error("Boot error:", err);
        setLoadError(err instanceof Error ? err.message : "Error loading agricultural data");
      } finally {
        setIsLoading(false);
      }
    }

    boot();
  }, [loadOfflineQueue, fetchObservations, fetchDbStatus, fetchWorkerStatus, loadTelemetry]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-flush queue when connection restores
      flushQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Submit new observation
  const handleAddObservation = async (newObs: Omit<Observation, "id" | "created_at">): Promise<boolean> => {
    const fullObs: Observation = {
      ...newObs,
      id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      confidence: newObs.yield_t_ha > 0 && newObs.yield_t_ha < 12 ? 0.76 : 0.35,
    };

    if (!isOnline) {
      // Enqueue locally
      const updated = [fullObs, ...offlineQueue];
      saveOfflineQueue(updated);
      return true;
    }

    try {
      const res = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullObs),
      });

      if (res.ok) {
        const data = await res.json();
        setObservations((prev) => [data.observation || fullObs, ...prev]);
        fetchDbStatus();
        return true;
      } else {
        throw new Error("Server rejected observation");
      }
    } catch (err) {
      // Network failed; store in local offline queue
      const updated = [fullObs, ...offlineQueue];
      saveOfflineQueue(updated);
      return true;
    }
  };

  // Flush offline queue to server
  const flushQueue = async () => {
    if (offlineQueue.length === 0 || !isOnline) return;

    const remaining: Observation[] = [];
    const synced: Observation[] = [];

    for (const item of offlineQueue) {
      try {
        const res = await fetch("/api/observations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (res.ok) {
          const data = await res.json();
          synced.push(data.observation || item);
        } else {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    saveOfflineQueue(remaining);
    if (synced.length > 0) {
      setObservations((prev) => [...synced, ...prev]);
      fetchDbStatus();
    }
  };

  // Stats calculation
  const totalShrunkProduction = trace
    ? trace.farmerEstimates.reduce((s, r) => s + r.shrunk_estimate, 0)
    : 55876.3;

  const meanConfidence = panel.length > 0
    ? panel.reduce((s, r) => s + r.confidence, 0) / panel.length
    : 0.77;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09110d] text-[#f4f7f5] p-6 selection:bg-[#34d399] selection:text-[#09110d]">
        <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-8 max-w-md w-full text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#34d399] mx-auto" />
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#34d399]">
              SYSTEM INITIALIZATION // BOOTSTRAP
            </div>
            <h2 className="font-display text-lg font-bold text-[#f4f7f5] mt-1">
              Initializing ZimAgriAI National Engine
            </h2>
          </div>
          <p className="text-xs text-[#8ea396] font-mono leading-relaxed">
            Calibrating 13,600 pilot observations, verifying empirical Bayes shrinkage matrices, and mounting telemetry nodes...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09110d] text-[#f4f7f5] p-6 selection:bg-[#34d399] selection:text-[#09110d]">
        <div className="max-w-md w-full rounded border border-[#7f1d1d] bg-[#1a0c0c] p-6 text-center space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-[#f87171]" />
          <h2 className="font-display text-base font-bold text-[#fef2f2]">System Telemetry Boot Failure</h2>
          <p className="text-xs text-[#fca5a5] font-mono">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded border border-[#991b1b] bg-[#b91c1c] px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-[#dc2626]"
          >
            RETRY BOOTSTRAP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09110d] text-[#f4f7f5] flex flex-col justify-between selection:bg-[#34d399] selection:text-[#09110d]">
      <div>
        {/* Hero Header */}
        <Header
          pilotCount={panel.length}
          weightedProduction={totalShrunkProduction}
          meanConfidence={meanConfidence}
          offlineQueueCount={offlineQueue.length}
          isOnline={isOnline}
          dbStatus={dbStatus}
          workerStatus={workerStatus}
          onNavigate={(sec) => {
            setActiveTab(sec);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Sticky Nav Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          pendingCount={offlineQueue.length}
        />

        {/* Main Tab Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === "overview" && (
            <OverviewSection onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} />
          )}

          {activeTab === "signals" && <SignalsSection />}

          {activeTab === "analysis" && (
            <AnalysisSection panel={panel} trace={trace} model={model} />
          )}

          {activeTab === "capture" && (
            <FieldCaptureSection
              observations={observations}
              offlineQueue={offlineQueue}
              onAddObservation={handleAddObservation}
              onFlushQueue={flushQueue}
              isOnline={isOnline}
              dbStatus={dbStatus}
            />
          )}

          {activeTab === "weather" && (
            <WeatherTelemetrySection
              weatherData={weatherData}
              onRefresh={loadTelemetry}
              isLoading={isWeatherLoading}
            />
          )}

          {activeTab === "exchange" && <CommodityExchangeSection />}

          {activeTab === "advisor" && (
            <AIAdvisorSection
              weatherData={weatherData}
              weightedProduction={totalShrunkProduction}
              meanConfidence={meanConfidence}
            />
          )}

          {activeTab === "governance" && <GovernanceSection />}
        </main>
      </div>

      {/* Institutional Footer */}
      <footer className="border-t border-[#1b2b22] bg-[#0c1410] px-4 py-6 sm:px-6 lg:px-8 text-xs text-[#6e8577]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="font-bold text-[#f4f7f5]">Zimbabwe-first AI systems platform for Agriculture</span>
              <span className="text-[#32493d]">|</span>
              <span className="text-[#34d399]">15-SIGNAL MULTI-SENSOR FABRIC</span>
              <span className="text-[#32493d]">|</span>
              <span className="text-[#6e8577]">ZMX / VFEX DERIVATIVES</span>
            </div>
            
            {/* User Requested Pitch Disclaimer */}
            <div className="rounded border border-[#2d3a24] bg-[#141b11] px-2.5 py-1 text-[11px] text-[#facc15] font-mono inline-block">
              Notice: Independent research prototype, not an official Ministry portal
            </div>

            <p className="text-[11px] text-[#6e8577] max-w-2xl leading-relaxed">
              Empirical Bayes shrinkage baseline model cross-referenced against multi-spectral satellite reflectance (Sentinel-2 MSI / Landsat-9), 15-signal telemetry, and NASA POWER ground meteorological observations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#8ea396]">
            <span className="rounded border border-[#1b2b22] bg-[#09110d] px-2 py-1">NASA POWER LIVE</span>
            <span className="rounded border border-[#1b2b22] bg-[#09110d] px-2 py-1">15-SIGNAL TELEMETRY</span>
            <span className="rounded border border-[#1b2b22] bg-[#09110d] px-2 py-1">ZMX & VFEX FLOOR</span>
            <span className="rounded border border-[#1b2b22] bg-[#09110d] px-2 py-1">EMPIRICAL BAYES</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

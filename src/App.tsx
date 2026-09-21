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
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 text-white p-6">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
        <h2 className="font-display text-xl font-bold">Initializing ZimAgriAI Engine...</h2>
        <p className="mt-2 text-xs text-stone-400 font-mono">
          Loading 13,600 pilot observations & fitting Empirical Bayes shrinkage model
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 text-white p-6">
        <div className="max-w-md rounded-xl border border-red-500/40 bg-red-950/20 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <h2 className="font-display text-lg font-bold text-white">System Boot Error</h2>
          <p className="mt-2 text-xs text-red-300">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
          >
            Retry Boot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
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
          onNavigate={(sec) => setActiveTab(sec)}
        />

        {/* Sticky Nav Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          pendingCount={offlineQueue.length}
        />

        {/* Main Tab Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === "overview" && (
            <OverviewSection onNavigate={(tab) => setActiveTab(tab)} />
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

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950/80 px-4 py-6 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-stone-400">ZimAgriAI Platform</span> • Early Production MVP v1.0.0
            <span className="block mt-0.5 text-stone-600">
              The baseline yield model is a validated empirical Bayes research ensemble. National policy deployment
              requires continuous calibration against verified field harvests.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400 font-mono">
            <span>NASA POWER Live</span>
            <span>•</span>
            <span>Sentinel/Landsat Provider Ready</span>
            <span>•</span>
            <span>Empirical Bayes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

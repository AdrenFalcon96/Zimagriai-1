import React, { useState } from "react";
import { DistrictWeather } from "../types";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CloudRain, Thermometer, RefreshCw, Satellite, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WeatherProps {
  weatherData: DistrictWeather[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export const WeatherTelemetrySection: React.FC<WeatherProps> = ({
  weatherData,
  onRefresh,
  isLoading,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Murehwa");

  const activeWeather = weatherData.find((w) => w.district === selectedDistrict) || weatherData[0];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            05 / Live Agro-Climatic Telemetry
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            NASA POWER Atmospheric & Moisture Reanalysis
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Real daily precipitation (PRECTOTCORR) and 2-meter air temperature (T2M) point observations
            for Zimbabwean agricultural wards, providing ground truth for dry spell corroboration.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-200 transition hover:bg-stone-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Querying NASA POWER..." : "Refresh Telemetry"}
        </button>
      </div>

      {/* District Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {weatherData.map((w) => (
          <button
            key={w.district}
            onClick={() => setSelectedDistrict(w.district)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              selectedDistrict === w.district
                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                : "border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            }`}
          >
            <span>{w.district}</span>
            <span className="rounded bg-stone-800 px-1.5 py-0.2 text-[10px] font-mono text-stone-400">
              {w.naturalRegion}
            </span>
          </button>
        ))}
      </div>

      {/* Active Weather Highlight Card */}
      {activeWeather && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Metrics summary */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{activeWeather.district}</h3>
                  <span className="text-xs text-stone-400">
                    {activeWeather.naturalRegion} • Lat {activeWeather.lat.toFixed(2)}, Lon {activeWeather.lon.toFixed(2)}
                  </span>
                </div>
                <Satellite className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-lg bg-stone-950 p-3 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="h-4 w-4 text-blue-400" />
                      7-Day Cumulative Rainfall
                    </span>
                    <span className="font-mono font-bold text-blue-300 text-sm">
                      {activeWeather.totalRainfall.toFixed(1)} mm
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (activeWeather.totalRainfall / 50) * 100)}%` }}
                    />
                  </div>
                  <span className="block text-[10px] text-stone-500 mt-1">
                    {activeWeather.totalRainfall < 10
                      ? "⚠️ Dry spell condition: high water-stress risk for vegetative maize."
                      : "Adequate moisture for active crop transpiration."}
                  </span>
                </div>

                <div className="rounded-lg bg-stone-950 p-3 border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4 text-amber-400" />
                      Mean 2m Air Temperature
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {activeWeather.avgTemp.toFixed(1)} °C
                    </span>
                  </div>
                  <span className="block text-[10px] text-stone-500">
                    Diurnal range within normal agro-ecological range for grain filling.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between">
              <span>Source: {activeWeather.source}</span>
              <span className="text-emerald-400 font-mono">Live API</span>
            </div>
          </div>

          {/* Dual Charts: Rainfall and Temperature */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="font-display text-base font-bold text-white">
                Daily Precipitation & Temperature History (7-Day)
              </h4>
              <span className="text-xs text-stone-500">NASA POWER temporal point query</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {/* Rainfall Chart */}
              <div>
                <span className="text-xs font-semibold text-stone-300 block mb-2">
                  Daily Rainfall (mm)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeWeather.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={10} tickLine={false} />
                      <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: 8, fontSize: 11 }}
                        itemStyle={{ color: "#38bdf8" }}
                      />
                      <Bar dataKey="rain" name="Rain (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature Chart */}
              <div>
                <span className="text-xs font-semibold text-stone-300 block mb-2">
                  Daily Temperature (°C)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeWeather.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={10} tickLine={false} />
                      <YAxis stroke="#78716c" fontSize={10} domain={["auto", "auto"]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: 8, fontSize: 11 }}
                        itemStyle={{ color: "#f59e0b" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        name="Temp (°C)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#f59e0b" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-stone-950 p-3 text-[11px] text-stone-400 border border-stone-800">
              <span className="font-semibold text-stone-300">Model Verification Role:</span> Rainfall and
              temperature anomalies directly feed into the 15-signal water stress and NDVI phenology engines.
              Anomalies are compared against self-reported planting dates to detect false-start planting or
              terminal drought stress.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

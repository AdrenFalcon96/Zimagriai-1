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
    <section className="space-y-6" id="section-weather">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-05 // ATMOSPHERIC METEOROLOGY & REANALYSIS
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">NASA POWER Geospatial API</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded border border-[#1b2b22] bg-[#0c1410] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#c9d6cf] transition hover:bg-[#14231b] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#34d399] ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "POLLING SATELLITE ARRAYS..." : "QUERY SATELLITE REANALYSIS"}
          </button>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          NASA POWER Meteorological & Precipitation Reanalysis
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          Daily point-corrected precipitation (<code className="text-[#34d399] font-mono">PRECTOTCORR</code>) and 2-meter air temperature (<code className="text-[#fbbf24] font-mono">T2M</code>) observations for sentinel agricultural districts across Zimbabwe.
        </p>
      </div>

      {/* District Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1b2b22] pb-2">
        {weatherData.map((w) => (
          <button
            key={w.district}
            onClick={() => setSelectedDistrict(w.district)}
            className={`flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs transition ${
              selectedDistrict === w.district
                ? "border-[#1e4832] bg-[#0f281b] text-[#34d399] font-bold"
                : "border-[#1b2b22] bg-[#0c1410] text-[#799083] hover:border-[#283d31] hover:text-[#c9d6cf]"
            }`}
          >
            <span>{w.district}</span>
            <span className="rounded border border-[#1b2b22] bg-[#09110d] px-1 py-0.2 text-[10px] text-[#6e8577]">
              {w.naturalRegion}
            </span>
          </button>
        ))}
      </div>

      {/* Active Weather Highlight Card */}
      {activeWeather && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Metrics summary */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#f4f7f5]">{activeWeather.district}</h3>
                  <span className="font-mono text-xs text-[#799083]">
                    {activeWeather.naturalRegion} • Coord: {activeWeather.lat.toFixed(2)}°S, {activeWeather.lon.toFixed(2)}°E
                  </span>
                </div>
                <div className="rounded border border-[#1e4832] bg-[#0d281a] p-1.5 text-[#34d399]">
                  <Satellite className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
                  <div className="flex items-center justify-between text-xs text-[#8ea396] mb-1">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <CloudRain className="h-3.5 w-3.5 text-[#7dd3fc]" />
                      7-DAY CUMULATIVE PRECIPITATION
                    </span>
                    <span className="font-mono font-bold text-[#7dd3fc] text-sm">
                      {activeWeather.totalRainfall.toFixed(1)} mm
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1b2b22] rounded overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-[#0284c7] rounded"
                      style={{ width: `${Math.min(100, (activeWeather.totalRainfall / 50) * 100)}%` }}
                    />
                  </div>
                  <span className="block font-mono text-[10px] text-[#6e8577] mt-1.5">
                    {activeWeather.totalRainfall < 10
                      ? "DRY SPELL ALERT: High evapotranspiration deficit in vegetative canopy."
                      : "SUFFICIENT MOISTURE: Phenological transpiration requirements met."}
                  </span>
                </div>

                <div className="rounded border border-[#1b2b22] bg-[#0f1914] p-3">
                  <div className="flex items-center justify-between text-xs text-[#8ea396] mb-1">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Thermometer className="h-3.5 w-3.5 text-[#fbbf24]" />
                      MEAN 2-METER AIR TEMPERATURE
                    </span>
                    <span className="font-mono font-bold text-[#fbbf24] text-sm">
                      {activeWeather.avgTemp.toFixed(1)} °C
                    </span>
                  </div>
                  <span className="block font-mono text-[10px] text-[#6e8577] mt-1">
                    Thermal accumulation within normal agro-ecological range for regional crop development.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#17251e] font-mono text-[11px] text-[#6e8577] flex items-center justify-between">
              <span>Station: {activeWeather.source}</span>
              <span className="text-[#34d399]">REAL-TIME REANALYSIS</span>
            </div>
          </div>

          {/* Dual Charts: Rainfall and Temperature */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-6 lg:col-span-8 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#17251e] pb-3">
              <h4 className="font-display text-sm font-bold text-[#f4f7f5]">
                Daily Precipitation & Air Temperature Time-Series (7-Day)
              </h4>
              <span className="font-mono text-xs text-[#6e8577]">NASA POWER Temporal Reanalysis</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {/* Rainfall Chart */}
              <div>
                <span className="font-mono text-xs font-semibold text-[#8ea396] block mb-2 uppercase tracking-wider">
                  Daily Precipitation (mm)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeWeather.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#17251e" vertical={false} />
                      <XAxis dataKey="date" stroke="#556e60" fontSize={10} tickLine={false} fontFamily="monospace" />
                      <YAxis stroke="#556e60" fontSize={10} tickLine={false} fontFamily="monospace" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0c1410", borderColor: "#1b2b22", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}
                        itemStyle={{ color: "#7dd3fc" }}
                      />
                      <Bar dataKey="rain" name="Rain (mm)" fill="#0284c7" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature Chart */}
              <div>
                <span className="font-mono text-xs font-semibold text-[#8ea396] block mb-2 uppercase tracking-wider">
                  Daily Mean Air Temperature (°C)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeWeather.daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#17251e" vertical={false} />
                      <XAxis dataKey="date" stroke="#556e60" fontSize={10} tickLine={false} fontFamily="monospace" />
                      <YAxis stroke="#556e60" fontSize={10} domain={["auto", "auto"]} tickLine={false} fontFamily="monospace" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0c1410", borderColor: "#1b2b22", borderRadius: 4, fontSize: 11, fontFamily: "monospace" }}
                        itemStyle={{ color: "#fbbf24" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        name="Temp (°C)"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#fbbf24" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded border border-[#1b2b22] bg-[#09110d] p-3 text-[11px] text-[#8ca094]">
              <span className="font-mono font-semibold text-[#f4f7f5]">Model Evidence Pipeline:</span> Daily
              precipitation and thermal anomalies feed directly into the multi-spectral corroboration engine.
              Unseasonal dry spells trigger confidence shrinkage on reported high yields to guard against strategic reserve misallocation.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

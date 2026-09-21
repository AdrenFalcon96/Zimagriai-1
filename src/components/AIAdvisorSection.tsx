import React, { useState } from "react";
import { AdvisorMessage, DistrictWeather } from "../types";
import { Sparkles, Send, Bot, User, RefreshCcw, FileText, CheckCircle2 } from "lucide-react";

interface AIAdvisorProps {
  weatherData: DistrictWeather[];
  weightedProduction: number;
  meanConfidence: number;
}

export const AIAdvisorSection: React.FC<AIAdvisorProps> = ({
  weatherData,
  weightedProduction,
  meanConfidence,
}) => {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `Welcome to the **ZimAgriAI Agronomy & Policy Intelligence Advisor**.
I am grounded in Zimbabwe's agro-ecological zones (Natural Regions I–V), empirical Bayes confidence scoring, NASA POWER weather telemetry, and national food security frameworks (including GMB reserves and Pfumvudza/Intwasa practices).

**How can I assist you today?** Select a recommended inquiry below or enter your specific agronomic question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const presetQueries = [
    {
      label: "🌾 NR IV Small Grains vs Maize in Zaka",
      prompt:
        "Analyze the agronomic and drought-risk trade-offs of promoting small grains (sorghum SV2/SV4 and pearl millet) over white maize in Zaka and Umguza (Natural Region IV), incorporating recent dry spell telemetry and yield confidence.",
    },
    {
      label: "🌽 Murehwa Pfumvudza Basin Protocol",
      prompt:
        "Provide an optimized Pfumvudza/Intwasa conservation farming protocol for Murehwa (Natural Region II). Address mulching depth, pothole dimensions, basal Compound D application, and split ammonium nitrate (AN) top-dressing timing.",
    },
    {
      label: "📊 GMB Strategic Reserve Policy Brief",
      prompt:
        "Draft an executive policy brief for the Ministry of Lands, Agriculture, Fisheries, Water and Rural Development on utilizing empirical Bayes confidence-shrunk harvest forecasts to calculate Grain Marketing Board (GMB) strategic reserve import buffers.",
    },
    {
      label: "🛰️ Remote Sensing Discrepancy Corroboration",
      prompt:
        "Explain how the platform reconciles a farmer self-report claiming 4.5 t/ha maize in Natural Region IV when Sentinel-2 NDVI and NASA POWER 7-day rainfall indicate moderate water stress. Detail the agreement calculation.",
    },
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Package contextual evidence from the dashboard to ground the AI
      const context = {
        platform: "ZimAgriAI Early Production MVP",
        overallWeightedProductionT: weightedProduction,
        meanConfidenceScore: meanConfidence,
        districtsWeather: weatherData.map((w) => ({
          district: w.district,
          naturalRegion: w.naturalRegion,
          totalRainfallMm: w.totalRainfall,
          avgTempC: w.avgTemp,
        })),
      };

      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          context,
          mode: "policy_and_agronomy",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Advisor request failed (${res.status})`);
      }

      const data = await res.json();
      const assistantMessage: AdvisorMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg: AdvisorMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Advisory Service Notice**: ${
          err instanceof Error ? err.message : "Unable to reach Gemini Advisor."
        }\nPlease verify that the GEMINI_API_KEY is configured in your project settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Minimal Markdown renderer helper for clean display
  const renderMarkdown = (text: string) => {
    // Split into paragraphs / lines
    return text.split("\n\n").map((para, i) => {
      // Check for bullet list
      if (para.startsWith("- ") || para.startsWith("* ")) {
        const items = para.split("\n").filter((line) => line.trim());
        return (
          <ul key={i} className="list-disc pl-5 my-2 space-y-1 text-stone-300">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^[-*]\s+/, "")) }} />
            ))}
          </ul>
        );
      }
      // Check for numbered list
      if (/^\d+\.\s/.test(para)) {
        const items = para.split("\n").filter((line) => line.trim());
        return (
          <ol key={i} className="list-decimal pl-5 my-2 space-y-1 text-stone-300">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item.replace(/^\d+\.\s+/, "")) }} />
            ))}
          </ol>
        );
      }
      // Check for heading
      if (para.startsWith("### ")) {
        return (
          <h4 key={i} className="font-bold text-white text-sm mt-3 mb-1">
            {para.replace("### ", "")}
          </h4>
        );
      }
      if (para.startsWith("## ")) {
        return (
          <h3 key={i} className="font-bold text-emerald-400 text-base mt-4 mb-1.5">
            {para.replace("## ", "")}
          </h3>
        );
      }
      return (
        <p
          key={i}
          className="my-2 leading-relaxed text-stone-300 text-xs sm:text-sm"
          dangerouslySetInnerHTML={{ __html: formatInline(para) }}
        />
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-emerald-300'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='rounded bg-stone-800 px-1 py-0.5 text-emerald-400 font-mono text-[11px]'>$1</code>");
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            06 / Gemini AI Agronomy & Policy Intelligence
          </span>
          <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
            National Agricultural Decision Intelligence
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Grounded in Zimbabwean agro-ecological zones, real-time NASA POWER telemetry, Pfumvudza conservation
            protocols, and empirical Bayes production estimates.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini 3.8 Flash • Agro-Ecological Engine</span>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-400 block">Recommended Inquiries:</span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {presetQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              disabled={isLoading}
              className="rounded-lg border border-stone-800 bg-stone-900/80 p-3 text-left transition hover:border-emerald-500/50 hover:bg-stone-850 disabled:opacity-50"
            >
              <span className="font-display text-xs font-bold text-white block">{item.label}</span>
              <span className="mt-1 text-[11px] text-stone-400 line-clamp-2 block">{item.prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat / Advisory Feed */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-6 flex flex-col h-[520px]">
        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-xs sm:text-sm ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`rounded-lg p-2 shrink-0 ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-950/60 text-emerald-400 ring-1 ring-emerald-800/40"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-xl p-4 ${
                  msg.role === "user"
                    ? "bg-emerald-950/50 border border-emerald-800/40 text-stone-200"
                    : "bg-stone-950 border border-stone-800 text-stone-300"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                  <span className="font-semibold">
                    {msg.role === "user" ? "Agronomist / Policy Operator" : "ZimAgriAI Intelligence Engine"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <div className="rounded-lg bg-emerald-950/60 p-2 text-emerald-400 ring-1 ring-emerald-800/40">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="rounded-xl bg-stone-950 border border-stone-800 p-3.5 flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                <span className="font-mono text-xs text-stone-400">
                  Synthesizing agro-climatic evidence & policy models...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-3 border-t border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an agronomic, weather correlation, or policy intelligence question..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs sm:text-sm text-stone-200 placeholder-stone-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 focus:outline-none disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

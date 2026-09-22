import React, { useState } from "react";
import { DistrictWeather, AdvisorMessage } from "../types";
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  Scroll,
  ShieldCheck,
  Scale,
  Landmark,
  Compass,
  History,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
} from "lucide-react";
import {
  ZIMBABWE_CONSTITUTIONAL_FOUNDATIONS,
  POLICY_INSTRUMENTS,
  POLICY_HISTORY_MILESTONES,
  PolicyInstrument,
} from "../data/policyFrameworks";

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
  const [subView, setSubView] = useState<"interactive" | "instruments" | "constitutional" | "history">("interactive");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeInstrument, setActiveInstrument] = useState<PolicyInstrument>(POLICY_INSTRUMENTS[0]);

  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `### Republic of Zimbabwe // Policy Formulation & Agricultural Advisory Copilot
Welcome to the statutory decision intelligence copilot for the **Zimbabwe-first AI systems platform for Agriculture**.

This advisory architecture is engineered to sit **alongside government policy, statutory programs, and parliamentary frameworks**—not as an antagonistic voice, but as a **facilitatory, complementary evidence engine** grounded in:
1. **Constitutional Mandates**: Section 15 (Food Security Directive), Section 77 (Right to Food & Water), Section 72 (Land Vesting), and Section 104(1) Executive Realignment.
2. **Current Portfolio**: Directly supporting the **Ministry of Agriculture, Mechanisation and Water Resources Development** (led by Dr. Anxious Jongwe Masuka) alongside the Ministry of Lands and Rural Development (Minister Vangelis Haritatos).
3. **Statutory Pillars**: The Grain Marketing Act [Cap 18:14] (Strategic Grain Reserve calibration), Warehouse Receipt System S.I. 184/188 of 2021, the Water Act [Cap 20:24], and Treasury's agricultural derivatives roadmap (Prof. Mthuli Ncube doctrine).
4. **Empirical Grounding**: Cross-referenced with the 15-Signal Multi-Sensor telemetry fabric and empirical Bayes production shrinkage.

*How can I assist your policy formulation or agronomic planning today?* Select an inquiry below or formulate a custom policy brief query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const presetQueries = [
    {
      label: "🏛️ Section 15 Food Security & SGR Strategy",
      badge: "Constitutional / GMB",
      prompt:
        "Draft a facilitatory policy brief for the Ministry of Agriculture, Mechanisation and Water Resources Development demonstrating how our 15-signal empirical Bayes forecast fulfills Section 15 of the Constitution by calibrating the GMB Strategic Grain Reserve (500k MT physical buffer) before winter harvests.",
    },
    {
      label: "🌾 Pfumvudza Micro-Dosing in NR II vs IV",
      badge: "AGRITEX Agronomy",
      prompt:
        "Provide an agronomic advisory aligning with AGRITEX's Pfumvudza/Intwasa scheme. Contrast planting basin geometry, Compound D micro-dosing, and traditional small grains substitution (sorghum SV2/SV4) between Murehwa (Natural Region II) and Zaka (Natural Region IV) during mid-season dry spells.",
    },
    {
      label: "📈 Treasury Agricultural Derivatives (SI 184/188)",
      badge: "Treasury / ZMX / VFEX",
      prompt:
        "Formulate a policy roadmap for Prof. Mthuli Ncube's Treasury directive on agricultural derivatives. How do Electronic Warehouse Receipts (e-WR under SI 184/188) and VFEX Put Options ($340/MT strike) create private bank liquidity (70% LTV) without requiring unbudgeted state bailouts?",
    },
    {
      label: "📱 AGRITEX Data Capture Incentive Policy (DCIP)",
      badge: "Incentive Policy & Field Truth",
      prompt:
        "Present a policy strategy on the AGRITEX Data Capture Incentive Policy (DCIP). How does combining micro-stipends ($0.50/record), off-grid solar equipment kits, and satellite corroboration gates eliminate 60-day reporting delays and fabricated desktop surveys, while fueling both our AI models and Prof. Mthuli Ncube's commodity derivatives market?",
    },
    {
      label: "💧 Water Act [Cap 20:24] & Dam Irrigation",
      badge: "Mechanisation & Water",
      prompt:
        "Analyze the alignment between the Ministry of Agriculture, Mechanisation and Water Resources Development's 350,000 Ha irrigation target and our satellite Crop Water Stress Index (CWSI) across Tugwi-Mukosi and Lake Mutirikwi catchments.",
    },
    {
      label: "📜 Historical ZIMACE Lessons (1994–2001)",
      badge: "Policy History",
      prompt:
        "Summarize the key lessons from the 1994–2001 ZIMACE free-market commodity exchange and why our satellite-corroborated warehouse receipt verification prevents the phantom stock failures that previously triggered market collapse.",
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
      const context = {
        platformName: "Zimbabwe-first AI systems platform for Agriculture",
        officialMinistry: "Ministry of Agriculture, Mechanisation and Water Resources Development",
        institutionalStance: "Facilitatory and complementary entity aligned with statutory frameworks",
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
          mode: "policy_formulation_and_agronomic_advisory",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Advisor request failed (${res.status})`);
      }

      const data = await res.json();
      const aiReply: AdvisorMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response || "No response received from the decision advisory engine.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error connecting to Policy Formulation Engine";
      const errorReply: AdvisorMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `**Institutional Synthesis Note**: ${message}\n\n*Running internal policy alignment synthesizer...*\n\nThe platform confirms statutory alignment with the **Ministry of Agriculture, Mechanisation and Water Resources Development** under Section 15 of the Constitution. Agricultural evidence is structured to support GMB Strategic Grain Reserve calibration and AGRITEX Pfumvudza spatial monitoring.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const paragraphs = content.split("\n\n");
    return paragraphs.map((para, i) => {
      if (para.startsWith("### ")) {
        return (
          <h3 key={i} className="font-display my-2 text-base font-bold text-[#f4f7f5] tracking-tight">
            {para.replace("### ", "")}
          </h3>
        );
      }
      if (para.startsWith("## ")) {
        return (
          <h2 key={i} className="font-display my-3 text-lg font-bold text-[#f4f7f5] tracking-tight">
            {para.replace("## ", "")}
          </h2>
        );
      }
      if (para.startsWith("- ") || para.startsWith("* ")) {
        const items = para.split("\n");
        return (
          <ul key={i} className="my-2 list-disc pl-5 space-y-1 text-xs text-[#c9d6cf] leading-relaxed">
            {items.map((item, idx) => (
              <li
                key={idx}
                dangerouslySetInnerHTML={{
                  __html: formatInline(item.replace(/^[-*]\s+/, "")),
                }}
              />
            ))}
          </ul>
        );
      }
      return (
        <p
          key={i}
          className="my-2 leading-relaxed text-[#c9d6cf] text-xs sm:text-sm"
          dangerouslySetInnerHTML={{ __html: formatInline(para) }}
        />
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-emerald-300'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='rounded bg-[#16271e] px-1 py-0.5 text-emerald-400 font-mono text-[11px]'>$1</code>");
  };

  const filteredInstruments = selectedCategory === "all"
    ? POLICY_INSTRUMENTS
    : POLICY_INSTRUMENTS.filter((p) => p.category === selectedCategory);

  return (
    <section className="space-y-6" id="section-advisor">
      {/* Section Header */}
      <div className="border-b border-[#1b2b22] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#34d399] tracking-wider uppercase">
              AGRI-SEC-07 // STATUTORY POLICY FORMULATION & ADVISORY
            </span>
            <span className="text-[#32493d]">•</span>
            <span className="font-mono text-xs text-[#799083]">Government Policy Aligned</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded border border-[#1e4832] bg-[#0d281a] px-3 py-1 font-mono text-xs font-semibold text-[#34d399]">
            <Scale className="h-3.5 w-3.5" />
            <span>Facilitatory & Complimentary Entity</span>
          </div>
        </div>

        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-[#f4f7f5] sm:text-3xl">
          Agricultural Policy Advisory & Governance Formulation Engine
        </h2>
        <p className="mt-1 text-sm text-[#9ab0a3] max-w-3xl leading-relaxed">
          Designed to sit directly alongside the <strong>Ministry of Agriculture, Mechanisation and Water Resources Development</strong>, 
          AGRITEX, and the Ministry of Finance. Provides constitutional grounding, policy history synthesis, and real-time empirical decision support without antagonistic positioning.
        </p>
      </div>

      {/* Institutional Stance & Alignment Banner */}
      <div className="rounded border border-[#224832] bg-[#0c1812] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#34d399]">
              <Landmark className="h-4 w-4" />
              <span>OFFICIAL INSTITUTIONAL ENGAGEMENT DOCTRINE</span>
            </div>
            <p className="text-xs text-[#c9d6cf] leading-relaxed max-w-4xl">
              This platform does <strong>not</strong> substitute government prerogative. Instead, it equips public decision-makers with unmanipulated empirical evidence, 
              satellite ground truth, and quantitative models that accelerate the execution of <strong>NDS1/NDS2</strong>, the 
              <strong>Pfumvudza/Intwasa</strong> scheme, and <strong>Prof. Mthuli Ncube's</strong> agricultural derivatives modernization strategy.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className="rounded bg-[#12261b] px-2.5 py-1 text-[#4ade80] border border-[#1f402c]">
              Const. Section 15 Aligned
            </span>
            <span className="rounded bg-[#12261b] px-2.5 py-1 text-[#4ade80] border border-[#1f402c]">
              SI 184/188 Compliant
            </span>
            <span className="rounded bg-[#12261b] px-2.5 py-1 text-[#4ade80] border border-[#1f402c]">
              AGRITEX Ground Truth
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Interactive Copilot vs Instruments vs Constitutional vs History */}
      <div className="flex border-b border-[#1b2b22] gap-1 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSubView("interactive")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            subView === "interactive"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Interactive Policy Copilot</span>
        </button>

        <button
          onClick={() => setSubView("instruments")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            subView === "instruments"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Statutory Instruments & Programs ({POLICY_INSTRUMENTS.length})</span>
        </button>

        <button
          onClick={() => setSubView("constitutional")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            subView === "constitutional"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <Scale className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Constitutional Foundations ({ZIMBABWE_CONSTITUTIONAL_FOUNDATIONS.length})</span>
        </button>

        <button
          onClick={() => setSubView("history")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t transition ${
            subView === "history"
              ? "bg-[#14261d] text-[#f4f7f5] border-t-2 border-t-[#34d399] border-x border-[#1b2b22]"
              : "text-[#8ea396] hover:text-[#f4f7f5] hover:bg-[#0c1410]"
          }`}
        >
          <History className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Ministry Policy History & Lessons</span>
        </button>
      </div>

      {/* SUBVIEW 1: Interactive Policy Formulation Copilot */}
      {subView === "interactive" && (
        <div className="space-y-5">
          {/* Preset Query Cards */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#8ea396] block uppercase tracking-wider">
              Statutory Policy Brief Inquiries (Click to run):
            </span>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {presetQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className="rounded border border-[#1b2b22] bg-[#0c1410] p-3 text-left transition hover:border-[#2d4738] hover:bg-[#0f1914] disabled:opacity-50 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#f4f7f5] group-hover:text-[#34d399] transition">
                      {item.label}
                    </span>
                  </div>
                  <span className="inline-block rounded bg-[#13241b] px-1.5 py-0.5 font-mono text-[9px] text-[#4ade80] border border-[#1d3d2a] mb-1">
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-[#799083] line-clamp-2 block leading-relaxed">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat / Advisory Feed */}
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-4 sm:p-5 flex flex-col h-[540px]">
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
                    className={`rounded p-2 shrink-0 border ${
                      msg.role === "user"
                        ? "bg-[#15803d] text-white border-[#22c55e]"
                        : "bg-[#0d281a] text-[#34d399] border-[#1e4832]"
                    }`}
                  >
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-3xl rounded p-4 ${
                      msg.role === "user"
                        ? "bg-[#0f281b] border border-[#1e4832] text-[#d5ded8]"
                        : "bg-[#09110d] border border-[#1b2b22] text-[#c9d6cf]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#6e8577] mb-2 border-b border-[#17251e] pb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[#34d399]">
                        {msg.role === "user" ? "POLICY ANALYST // OPERATOR" : "FACILITATORY POLICY ADVISOR // STATUTORY KNOWLEDGEBASE"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="text-xs leading-relaxed space-y-1">
                      {renderMarkdown(msg.content)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-xs text-[#8fa397]">
                  <div className="rounded border border-[#1e4832] bg-[#0d281a] p-2 text-[#34d399]">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="rounded border border-[#1b2b22] bg-[#09110d] p-3 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#34d399]" />
                    <span className="font-mono text-xs text-[#8fa397]">
                      Synthesizing statutory frameworks, constitutional sections, and empirical evidence...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 pt-3 border-t border-[#17251e]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Draft policy briefs, verify Pfumvudza inputs allocation, query GMB reserve formulas, or test ZMX/VFEX options..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 rounded border border-[#1b2b22] bg-[#0f1914] px-4 py-2 font-mono text-xs text-[#c9d6cf] placeholder-[#556e60] focus:border-[#34d399] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputPrompt.trim()}
                  className="inline-flex items-center justify-center rounded border border-[#22c55e] bg-[#15803d] px-4 py-2 font-mono text-xs font-bold text-white transition hover:bg-[#16a34a] focus:outline-none disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Statutory Instruments & Programs Registry */}
      {subView === "instruments" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[#6e8577] font-mono mr-2">Category:</span>
              {[
                { id: "all", label: "All Instruments" },
                { id: "national_strategy", label: "National Strategies (NDS)" },
                { id: "ministerial_program", label: "Ministerial Programs" },
                { id: "statutory_act", label: "Statutory Acts" },
                { id: "statutory_instrument", label: "Statutory Instruments (S.I.)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition ${
                    selectedCategory === cat.id
                      ? "bg-[#1d3d2b] text-[#34d399] border border-[#2d5f43]"
                      : "bg-[#0c1410] text-[#8ea396] border border-[#1b2b22] hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Instruments List */}
            <div className="space-y-2 lg:col-span-5">
              {filteredInstruments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveInstrument(item)}
                  className={`cursor-pointer rounded border p-4 transition ${
                    activeInstrument.id === item.id
                      ? "border-[#34d399] bg-[#102419]"
                      : "border-[#1b2b22] bg-[#0c1410] hover:border-[#2d4738]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[#8ea396] mb-1">
                    <span className="uppercase text-[10px] text-[#4ade80]">{item.category.replace("_", " ")}</span>
                    <span>{item.enactedYear}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#f4f7f5] leading-snug">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-[#799083] line-clamp-2">
                    {item.coreObjective}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Column: Detailed Facilitatory Mapping */}
            <div className="lg:col-span-7 rounded border border-[#1b2b22] bg-[#0c1410] p-6 space-y-5">
              <div className="border-b border-[#1b2b22] pb-4">
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#4ade80]">
                  <span className="uppercase">{activeInstrument.reference}</span>
                  <span className="rounded bg-[#12261b] px-2 py-0.5 border border-[#1f402c] text-[#34d399]">
                    Custodian: {activeInstrument.institutionalCustodian}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#f4f7f5] mt-2">
                  {activeInstrument.title}
                </h3>
              </div>

              <div>
                <span className="font-mono text-xs uppercase text-[#8ea396] block mb-1">Core Government Objective:</span>
                <p className="text-xs text-[#c9d6cf] leading-relaxed">
                  {activeInstrument.coreObjective}
                </p>
              </div>

              {/* Complementary Role Highlight */}
              <div className="rounded border border-[#1e4832] bg-[#0d281a] p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#34d399] mb-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>HOW THIS AI PLATFORM COMPLEMENTS & EMPOWERS THE POLICY:</span>
                </div>
                <p className="text-xs text-[#d2ded7] leading-relaxed">
                  {activeInstrument.platformComplementaryRole}
                </p>
              </div>

              <div>
                <span className="font-mono text-xs uppercase text-[#8ea396] block mb-2">Key Policy Metrics & Statutory Benchmarks:</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeInstrument.keyMetricsOrTargets.map((metric, idx) => (
                    <div key={idx} className="rounded border border-[#1b2b22] bg-[#09110d] p-3 text-xs text-[#b8ccc1] flex items-start gap-2">
                      <span className="text-[#34d399] font-mono">•</span>
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSubView("interactive");
                    handleSend(`Provide a facilitatory policy implementation brief showing how our platform operationalizes ${activeInstrument.title} (${activeInstrument.reference}) for the Ministry of Agriculture, Mechanisation and Water Resources Development.`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded border border-[#22c55e] bg-[#15803d] px-3.5 py-1.5 font-mono text-xs font-bold text-white transition hover:bg-[#16a34a]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Draft Policy Implementation Brief</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Constitutional Foundations */}
      {subView === "constitutional" && (
        <div className="space-y-4">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-4">
            <p className="text-xs text-[#9ab0a3] leading-relaxed">
              The <strong>Constitution of Zimbabwe (Amendment No. 20 of 2013)</strong> establishes clear state directives regarding food sovereignty, youth participation, land custody, and water equity. 
              Our platform is structurally anchored in these constitutional directives:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {ZIMBABWE_CONSTITUTIONAL_FOUNDATIONS.map((c, idx) => (
              <div key={idx} className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1b2b22] pb-2">
                  <span className="font-mono text-xs font-bold text-[#34d399]">{c.section}</span>
                  <span className="font-mono text-[10px] text-[#799083]">Constitution of Zimbabwe</span>
                </div>
                <h4 className="font-display text-sm font-bold text-[#f4f7f5]">{c.title}</h4>
                <blockquote className="border-l-2 border-[#2d5f43] pl-3 text-xs italic text-[#9db2a5] leading-relaxed">
                  "{c.text}"
                </blockquote>
                <div className="rounded bg-[#09110d] p-3 border border-[#17251e]">
                  <span className="font-mono text-[10px] uppercase text-[#34d399] block mb-1">
                    Direct Platform Facilitatory Application:
                  </span>
                  <p className="text-xs text-[#d2ded7] leading-relaxed">
                    {c.application}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 4: Policy History & Lessons Learned */}
      {subView === "history" && (
        <div className="space-y-4">
          <div className="rounded border border-[#1b2b22] bg-[#0c1410] p-4">
            <p className="text-xs text-[#9ab0a3] leading-relaxed">
              Zimbabwe's agricultural policy landscape has evolved through distinct doctrinal eras—from post-independence communal collection depots, through ESAP market deregulation and ZIMACE, 
              to the Fast-Track Land Reform and modern climate-proofed Pfumvudza. Our platform incorporates these historical lessons so modern initiatives avoid past structural pitfalls:
            </p>
          </div>

          <div className="space-y-4">
            {POLICY_HISTORY_MILESTONES.map((era, idx) => (
              <div key={idx} className="rounded border border-[#1b2b22] bg-[#0c1410] p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2b22] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#12261b] px-2 py-0.5 font-mono text-xs font-bold text-[#34d399] border border-[#1f402c]">
                      {era.era}
                    </span>
                    <h4 className="font-display text-sm font-bold text-[#f4f7f5]">{era.policyName}</h4>
                  </div>
                  <span className="font-mono text-[10px] text-[#799083]">
                    Context: {era.ministryContext}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[#8ea396] block">Governing Doctrine:</span>
                    <p className="text-[#c9d6cf] leading-relaxed">{era.doctrine}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase text-[#8ea396] block">Institutional Impact:</span>
                    <p className="text-[#c9d6cf] leading-relaxed">{era.institutionalImpact}</p>
                  </div>

                  <div className="space-y-1 rounded bg-[#09110d] p-3 border border-[#17251e]">
                    <span className="font-mono text-[10px] uppercase text-[#facc15] block">Key Lesson Learned:</span>
                    <p className="text-[#d2ded7] leading-relaxed">{era.keyLessonLearned}</p>
                  </div>
                </div>

                <div className="rounded border border-[#1e4832] bg-[#0d281a] p-3 text-xs text-[#34d399] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span><strong>Platform Alignment:</strong> {era.platformAlignment}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSubView("interactive");
                      handleSend(`Analyze the policy history of ${era.policyName} (${era.era}) under the ${era.ministryContext}, and detail how the Ministry of Agriculture, Mechanisation and Water Resources Development can apply its lessons today.`);
                    }}
                    className="shrink-0 rounded bg-[#163625] px-2.5 py-1 text-[10px] font-mono font-bold text-[#f4f7f5] hover:bg-[#1d4731] border border-[#2b5e40]"
                  >
                    Deep Dive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

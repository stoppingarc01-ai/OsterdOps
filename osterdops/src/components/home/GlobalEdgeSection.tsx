"use client";

import React, { useState } from "react";
import {
  Globe,
  Zap,
  Activity,
  ShieldCheck,
  Server,
  ArrowUpRight,
  Wifi,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface EdgeNode {
  id: string;
  city: string;
  country: string;
  region: string;
  latencyMs: number;
  uptime: string;
  status: "active" | "optimal";
  cacheHitRatio: string;
  coordinates: { x: number; y: number }; // Percentage for CSS placement & SVG mapping
  svgX: number; // 0-1000 scale
  svgY: number; // 0-500 scale
  upstreamHop: string;
}

const EDGE_NODES: EdgeNode[] = [
  {
    id: "sjc",
    city: "San Jose",
    country: "United States",
    region: "us-west-1",
    latencyMs: 4.8,
    uptime: "99.999%",
    status: "optimal",
    cacheHitRatio: "44.2%",
    coordinates: { x: 17, y: 38 },
    svgX: 170,
    svgY: 190,
    upstreamHop: "OpenAI US-West (Direct Peering)",
  },
  {
    id: "lhr",
    city: "London",
    country: "United Kingdom",
    region: "eu-west-2",
    latencyMs: 5.9,
    uptime: "99.999%",
    status: "optimal",
    cacheHitRatio: "39.5%",
    coordinates: { x: 48, y: 27 },
    svgX: 480,
    svgY: 135,
    upstreamHop: "Azure OpenAI UK-South",
  },
  {
    id: "fra",
    city: "Frankfurt",
    country: "Germany",
    region: "eu-central-1",
    latencyMs: 6.2,
    uptime: "99.998%",
    status: "optimal",
    cacheHitRatio: "41.8%",
    coordinates: { x: 51, y: 30 },
    svgX: 510,
    svgY: 150,
    upstreamHop: "Anthropic EU-Central / Mistral Paris",
  },
  {
    id: "tyo",
    city: "Tokyo",
    country: "Japan",
    region: "ap-northeast-1",
    latencyMs: 8.4,
    uptime: "99.997%",
    status: "optimal",
    cacheHitRatio: "38.1%",
    coordinates: { x: 84, y: 37 },
    svgX: 840,
    svgY: 185,
    upstreamHop: "Google Cloud Tokyo (Vertex AI)",
  },
  {
    id: "sin",
    city: "Singapore",
    country: "Singapore",
    region: "ap-southeast-1",
    latencyMs: 9.1,
    uptime: "99.998%",
    status: "optimal",
    cacheHitRatio: "36.7%",
    coordinates: { x: 77, y: 58 },
    svgX: 770,
    svgY: 290,
    upstreamHop: "AWS Singapore / Bedrock SG",
  },
  {
    id: "bom",
    city: "Mumbai",
    country: "India",
    region: "ap-south-1",
    latencyMs: 8.9,
    uptime: "99.996%",
    status: "optimal",
    cacheHitRatio: "42.0%",
    coordinates: { x: 68, y: 48 },
    svgX: 680,
    svgY: 240,
    upstreamHop: "Azure Central India / OpenAI Edge",
  },
  {
    id: "syd",
    city: "Sydney",
    country: "Australia",
    region: "ap-southeast-2",
    latencyMs: 11.2,
    uptime: "99.995%",
    status: "active",
    cacheHitRatio: "35.4%",
    coordinates: { x: 88, y: 76 },
    svgX: 880,
    svgY: 380,
    upstreamHop: "AWS Sydney / Claude Bedrock",
  },
  {
    id: "gru",
    city: "São Paulo",
    country: "Brazil",
    region: "sa-east-1",
    latencyMs: 12.4,
    uptime: "99.994%",
    status: "active",
    cacheHitRatio: "34.1%",
    coordinates: { x: 32, y: 72 },
    svgX: 320,
    svgY: 360,
    upstreamHop: "Google Cloud São Paulo",
  },
];

// Active edge network routing links
const NETWORK_LINKS = [
  { from: "sjc", to: "lhr", d: "M 170 190 Q 325 105 480 135" },
  { from: "lhr", to: "fra", d: "M 480 135 Q 495 140 510 150" },
  { from: "fra", to: "bom", d: "M 510 150 Q 590 180 680 240" },
  { from: "bom", to: "sin", d: "M 680 240 Q 720 270 770 290" },
  { from: "fra", to: "tyo", d: "M 510 150 Q 675 95 840 185" },
  { from: "sin", to: "tyo", d: "M 770 290 Q 820 235 840 185" },
  { from: "sin", to: "syd", d: "M 770 290 Q 830 335 880 380" },
  { from: "sjc", to: "gru", d: "M 170 190 Q 235 285 320 360" },
  { from: "gru", to: "lhr", d: "M 320 360 Q 420 245 480 135" },
];

export function GlobalEdgeSection() {
  const [selectedNode, setSelectedNode] = useState<EdgeNode>(EDGE_NODES[0]);

  return (
    <section className="py-24 sm:py-32 bg-[#080808] border-t border-[#161720] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(223,178,119,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DFB277]/10 border border-[#DFB277]/25 text-[#DFB277] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(223,178,119,0.15)]">
            <Globe className="w-3.5 h-3.5 text-[#DFB277]" />
            <span>Global Anycast Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            Sub-10ms P99 Routing via <span className="text-[#DFB277]">35+ Edge Points of Presence</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
            Your AI requests never travel across the globe for proxy processing. OsterdOps terminates TLS at the nearest Anycast edge, executes pre-flight FinOps rules in-memory, and routes directly to the closest upstream model cluster.
          </p>
        </div>

        {/* Global Edge Interactive Map & Benchmark Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Visual Real Vector World Map (Left 8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-[#0D0E14] border border-[#1A1C28] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Global Edge Mesh Status: All Nodes Optimal
                  </span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  Real-time BGP Anycast routing • Autonomous multi-region failover
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#14151E] border border-[#222432] text-[11px] font-mono text-neutral-300">
                  Active Edge POPs: <strong className="text-[#DFB277]">35</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#14151E] border border-[#222432] text-[11px] font-mono text-emerald-400">
                  Global P99: <strong>8.2ms</strong>
                </span>
              </div>
            </div>

            {/* Map Canvas Background */}
            <div className="relative w-full aspect-[2/1] min-h-[320px] sm:min-h-[420px] bg-[#07080D] rounded-xl border border-[#161824] p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              {/* Subtle Equirectangular Grid Lines */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, #DFB277 1px, transparent 1px), linear-gradient(to bottom, #DFB277 1px, transparent 1px)`,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Genuine SVG Vector World Map Silhouette */}
              <svg
                viewBox="0 0 1000 500"
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Subtle glow filter for active edge route lines */}
                  <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Graticule Latitude/Longitude subtle arcs */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#DFB277" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.15" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="#DFB277" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.1" />
                <line x1="0" y1="375" x2="1000" y2="375" stroke="#DFB277" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.1" />
                <line x1="500" y1="0" x2="500" y2="500" stroke="#DFB277" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.15" />

                {/* Real Geographic Vector Landmass Silhouette (North America) */}
                <path
                  d="M 50 65 L 90 55 L 140 60 L 195 70 L 220 85 L 260 95 L 290 120 L 270 145 L 295 160 L 270 185 L 235 185 L 205 195 L 195 240 L 175 220 L 160 250 L 140 230 L 125 180 L 105 160 L 80 140 L 60 110 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Greenland */}
                <path
                  d="M 330 40 L 375 35 L 390 60 L 360 85 L 330 75 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.65"
                />

                {/* South America */}
                <path
                  d="M 240 255 L 275 250 L 320 270 L 355 310 L 340 360 L 305 400 L 280 445 L 260 460 L 255 425 L 240 370 L 230 315 L 230 275 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Europe & Scandinavia */}
                <path
                  d="M 445 155 L 475 140 L 490 125 L 515 90 L 530 80 L 550 110 L 535 130 L 565 145 L 560 175 L 535 185 L 515 200 L 475 205 L 450 185 L 440 170 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* United Kingdom & Ireland */}
                <path
                  d="M 465 125 L 485 115 L 480 145 L 460 145 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Africa */}
                <path
                  d="M 455 215 L 525 210 L 585 215 L 610 260 L 595 310 L 575 365 L 545 420 L 520 425 L 490 380 L 470 330 L 440 280 L 435 240 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Madagascar */}
                <path
                  d="M 605 360 L 620 355 L 610 395 L 595 400 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="0.8"
                  opacity="0.65"
                />

                {/* Asia & Siberia */}
                <path
                  d="M 570 140 L 630 115 L 720 95 L 820 100 L 890 120 L 870 160 L 830 175 L 800 205 L 775 250 L 735 260 L 705 295 L 675 255 L 660 215 L 620 205 L 585 185 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* India Sub-continent */}
                <path
                  d="M 660 215 L 705 220 L 700 265 L 675 285 L 655 250 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Japan Archipelago */}
                <path
                  d="M 835 165 L 850 160 L 855 185 L 830 200 L 825 180 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />

                {/* Southeast Asia & Indonesia Archipelago */}
                <path
                  d="M 740 285 L 775 290 L 795 320 L 830 325 L 810 340 L 760 330 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="0.8"
                  opacity="0.65"
                />

                {/* Australia & New Zealand */}
                <path
                  d="M 800 365 L 850 350 L 885 365 L 895 410 L 870 435 L 815 425 L 790 395 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="1"
                  opacity="0.75"
                />
                <path
                  d="M 915 425 L 935 420 L 930 455 L 910 450 Z"
                  fill="#161B26"
                  stroke="#232C3E"
                  strokeWidth="0.8"
                  opacity="0.65"
                />

                {/* Active Bezier Network Curves between POPs */}
                {NETWORK_LINKS.map((link, idx) => {
                  const isConnectedToSelected =
                    link.from === selectedNode.id || link.to === selectedNode.id;
                  return (
                    <g key={idx}>
                      <path
                        d={link.d}
                        fill="none"
                        stroke={isConnectedToSelected ? "#DFB277" : "#F59E0B"}
                        strokeWidth={isConnectedToSelected ? "1.8" : "1"}
                        strokeDasharray={isConnectedToSelected ? "none" : "3,3"}
                        opacity={isConnectedToSelected ? 0.9 : 0.35}
                        filter={isConnectedToSelected ? "url(#gold-glow)" : undefined}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Geographically Accurate POP Pins overlay on map */}
              {EDGE_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    style={{
                      left: `${node.coordinates.x}%`,
                      top: `${node.coordinates.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none transition-all duration-300 ${
                      isSelected ? "scale-125 z-30" : "scale-100 z-20 hover:scale-115"
                    }`}
                    aria-label={`Select ${node.city} edge point`}
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      {/* Luminous Pulsing Ring */}
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isSelected ? "bg-[#DFB277]" : "bg-amber-400"
                        }`}
                      />
                      {/* Core Glowing Dot */}
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 border-2 border-[#07080D] shadow-[0_0_12px_rgba(223,178,119,0.8)] ${
                          isSelected ? "bg-[#DFB277]" : "bg-amber-400"
                        }`}
                      />
                    </span>

                    {/* Pin city label tooltip */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#0F111A] border text-[10px] font-mono transition-all shadow-xl pointer-events-none ${
                        isSelected
                          ? "border-[#DFB277] text-[#DFB277] opacity-100 font-bold scale-105"
                          : "border-[#222738] text-neutral-400 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {node.city} <span className="text-emerald-400">({node.latencyMs}ms)</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Regional Selector Tabs (San Jose, Frankfurt, London, Tokyo, etc.) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
              {EDGE_NODES.slice(0, 4).map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#DFB277]/15 border-[#DFB277] text-white shadow-[0_0_15px_rgba(223,178,119,0.2)]"
                        : "bg-[#111219] border-[#1E202B] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-semibold">
                      <span>{node.city}</span>
                      <span className="text-[#DFB277]">{node.latencyMs}ms</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 mt-0.5 truncate">
                      {node.region}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Telemetry Details Panel (Right 4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-[#11121A] via-[#0E0F16] to-[#0A0B10] border-2 border-[#DFB277]/40 p-6 sm:p-7 flex flex-col justify-between shadow-[0_0_40px_rgba(223,178,119,0.12)]">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                    POP Point of Presence Telemetry
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {selectedNode.city}, {selectedNode.country}
                  </h3>
                  <div className="text-xs font-mono text-[#DFB277] mt-0.5">
                    Region ID: {selectedNode.region}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#DFB277]/10 border border-[#DFB277]/30 text-[#DFB277]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Key Latency Gauge */}
              <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1C1E2B] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                  <span>Anycast Routing Overhead:</span>
                  <span className="text-emerald-400 font-bold text-lg font-mono">
                    {selectedNode.latencyMs} ms
                  </span>
                </div>
                <div className="w-full bg-[#181924] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-[#DFB277] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (selectedNode.latencyMs / 15) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>0ms (Target)</span>
                  <span>10ms (SLA Guarantee)</span>
                  <span>15ms Max</span>
                </div>
              </div>

              {/* Telemetry Metrics Stack */}
              <div className="space-y-3 pt-2 text-xs font-mono">
                <div className="flex justify-between items-center py-2 border-b border-[#1A1C28]">
                  <span className="text-neutral-400">Local Cache Hit Ratio:</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#DFB277]" />
                    {selectedNode.cacheHitRatio}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#1A1C28]">
                  <span className="text-neutral-400">Rolling 30-Day Uptime:</span>
                  <span className="text-emerald-400 font-semibold">{selectedNode.uptime}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#1A1C28]">
                  <span className="text-neutral-400">Direct Upstream Route:</span>
                  <span className="text-neutral-200 font-mono text-[11px] truncate max-w-[170px] text-right">
                    {selectedNode.upstreamHop}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-400">TLS 1.3 Zero-RTT:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Enabled &amp; Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="pt-6 mt-6 border-t border-[#1C1E2B] space-y-3">
              <div className="p-3 rounded-xl bg-[#090A0F] border border-[#171822] text-[11px] font-mono text-neutral-400 leading-relaxed">
                <strong className="text-white">Autonomous BGP Anycast:</strong> Traffic ingresses at {selectedNode.city} and evaluates pre-flight rate limits in under 100 microseconds before routing directly to closest provider cluster.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

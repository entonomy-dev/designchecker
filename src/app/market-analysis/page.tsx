"use client";

import React, { useState, useMemo } from "react";

// =============================================================================
// DATA — Market sizing data for DesignChecker agency segment
// =============================================================================

interface MarketSegment {
  name: string;
  count: number;
  acv: number;
  tam: number;
  color: string;
}

interface RevenueScenario {
  year: number;
  label: string;
  conservative: number;
  base: number;
  aggressive: number;
}

interface CustomerScenario {
  year: number;
  label: string;
  conservative: number;
  base: number;
  aggressive: number;
}

interface RegionalBreakdown {
  region: string;
  agencyCount: number;
  acv: number;
  tam: number;
  color: string;
}

interface AdjacentMarket {
  name: string;
  size2025: number;
  size2030: number;
  cagr: number;
  color: string;
}

interface SensitivityRow {
  variable: string;
  low: number;
  base: number;
  high: number;
  lowLabel: string;
  baseLabel: string;
  highLabel: string;
}

const tamSegments: MarketSegment[] = [
  { name: "Agencies (10-50 emp.)", count: 40000, acv: 3600, tam: 144, color: "#3B82F6" },
  { name: "Agencies (1-9 emp.)", count: 200000, acv: 600, tam: 120, color: "#60A5FA" },
  { name: "Agencies (50+ emp.)", count: 20000, acv: 12000, tam: 240, color: "#2563EB" },
  { name: "Freelancers", count: 200000, acv: 360, tam: 72, color: "#8B5CF6" },
  { name: "E-Commerce", count: 500000, acv: 1200, tam: 600, color: "#EC4899" },
  { name: "SaaS Product Teams", count: 25000, acv: 6000, tam: 150, color: "#F59E0B" },
  { name: "Enterprise Marketing", count: 100000, acv: 18000, tam: 1800, color: "#EF4444" },
  { name: "Government", count: 50000, acv: 6000, tam: 300, color: "#10B981" },
  { name: "Education", count: 25000, acv: 3000, tam: 75, color: "#06B6D4" },
  { name: "Non-Profit", count: 200000, acv: 600, tam: 120, color: "#6366F1" },
];

const samSegments: MarketSegment[] = [
  { name: "Agencies (10-50, US)", count: 16200, acv: 3600, tam: 58.3, color: "#3B82F6" },
  { name: "Agencies (10-50, Intl)", count: 23800, acv: 2400, tam: 57.1, color: "#60A5FA" },
  { name: "Agencies (1-9, US)", count: 38400, acv: 600, tam: 23.0, color: "#93C5FD" },
  { name: "Agencies (50+, US)", count: 5400, acv: 12000, tam: 64.8, color: "#2563EB" },
  { name: "Freelancers (US/UK/AU)", count: 100000, acv: 360, tam: 36.0, color: "#8B5CF6" },
  { name: "SaaS Teams (US)", count: 10000, acv: 6000, tam: 60.0, color: "#F59E0B" },
  { name: "Consultancies (US)", count: 5000, acv: 6000, tam: 30.0, color: "#EC4899" },
  { name: "E-Commerce SME (US)", count: 50000, acv: 1200, tam: 60.0, color: "#10B981" },
  { name: "Education (US)", count: 5000, acv: 3000, tam: 15.0, color: "#06B6D4" },
];

const revenueScenarios: RevenueScenario[] = [
  { year: 1, label: "Y1 (2027)", conservative: 0.216, base: 0.505, aggressive: 1.1 },
  { year: 2, label: "Y2 (2028)", conservative: 0.805, base: 2.1, aggressive: 5.0 },
  { year: 3, label: "Y3 (2029)", conservative: 1.4, base: 5.8, aggressive: 14.2 },
  { year: 4, label: "Y4 (2030)", conservative: 3.6, base: 13.2, aggressive: 33.0 },
  { year: 5, label: "Y5 (2031)", conservative: 7.8, base: 26.4, aggressive: 62.0 },
];

const customerScenarios: CustomerScenario[] = [
  { year: 1, label: "Y1", conservative: 287, base: 715, aggressive: 1762 },
  { year: 2, label: "Y2", conservative: 1158, base: 3075, aggressive: 7160 },
  { year: 3, label: "Y3", conservative: 3120, base: 8130, aggressive: 19200 },
  { year: 4, label: "Y4", conservative: 6550, base: 16000, aggressive: 37600 },
  { year: 5, label: "Y5", conservative: 12100, base: 27500, aggressive: 64500 },
];

const regionalData: RegionalBreakdown[] = [
  { region: "United States", agencyCount: 16200, acv: 3600, tam: 58.3, color: "#3B82F6" },
  { region: "Canada", agencyCount: 2430, acv: 3000, tam: 7.3, color: "#60A5FA" },
  { region: "United Kingdom", agencyCount: 4860, acv: 3000, tam: 14.6, color: "#8B5CF6" },
  { region: "EU (excl. UK)", agencyCount: 8100, acv: 2400, tam: 19.4, color: "#EC4899" },
  { region: "Australia / NZ", agencyCount: 1944, acv: 3000, tam: 5.8, color: "#F59E0B" },
  { region: "Rest of World", agencyCount: 6466, acv: 2000, tam: 12.9, color: "#10B981" },
];

const adjacentMarkets: AdjacentMarket[] = [
  { name: "Web Design Services", size2025: 61.2, size2030: 92.1, cagr: 8.5, color: "#3B82F6" },
  { name: "Digital Accessibility", size2025: 0.85, size2030: 1.89, cagr: 9.3, color: "#8B5CF6" },
  { name: "Web A11y Eval Tools", size2025: 0.474, size2030: 0.77, cagr: 6.9, color: "#EC4899" },
  { name: "US Digital Agencies", size2025: 58.2, size2030: 105.2, cagr: 13.6, color: "#F59E0B" },
  { name: "US Marketing Agencies", size2025: 182.5, size2030: 238.9, cagr: 5.5, color: "#10B981" },
];

const sensitivityData: SensitivityRow[] = [
  { variable: "Free-to-paid conversion", low: 3.4, base: 5.8, high: 8.5, lowLabel: "2%", baseLabel: "3.4%", highLabel: "5%" },
  { variable: "Monthly churn (Y3)", low: 4.8, base: 5.8, high: 6.9, lowLabel: "3.5%", baseLabel: "2.5%", highLabel: "1.5%" },
  { variable: "Blended ACV", low: 4.1, base: 5.8, high: 8.1, lowLabel: "$500", baseLabel: "$713", highLabel: "$1,000" },
  { variable: "Free user acquisition", low: 3.9, base: 5.8, high: 8.7, lowLabel: "80K", baseLabel: "120K", highLabel: "180K" },
  { variable: "Agency market growth", low: 5.3, base: 5.8, high: 6.4, lowLabel: "8%", baseLabel: "12%", highLabel: "16%" },
];

const pricingTiers = [
  { name: "Free", monthly: 0, annual: 0, target: "Freelancers, evaluation", revShare: "0%" },
  { name: "Pro", monthly: 29, annual: 290, target: "Solo professionals", revShare: "15%" },
  { name: "Team", monthly: 79, annual: 790, target: "Small agencies (5-15)", revShare: "25%" },
  { name: "Agency", monthly: 199, annual: 1990, target: "Mid-size agencies (15-50)", revShare: "35%" },
  { name: "Enterprise", monthly: 499, annual: 6000, target: "Large organizations", revShare: "25%" },
];

const comparables = [
  { name: "Semrush", arr: 455.4, acv: 4000, customers: 114000, note: "Adobe acq. $1.9B" },
  { name: "Ahrefs", arr: 150, acv: 3000, customers: 50000, note: "Bootstrapped, 171 emp." },
  { name: "Siteimprove", arr: 180, acv: 24000, customers: 7500, note: "Enterprise-focused" },
  { name: "Hotjar (pre-acq.)", arr: 40, acv: 1905, customers: 21000, note: "$1M ARR in 6mo" },
  { name: "Screaming Frog", arr: 30, acv: 259, customers: 115000, note: "Single product" },
  { name: "Stark", arr: 10, acv: 200, customers: 50000, note: "A11y only" },
];

// =============================================================================
// CHART COMPONENTS — SVG-based interactive visualizations
// =============================================================================

function BarChart({
  data,
  maxValue,
  formatValue,
  barColor,
  height = 260,
}: {
  data: { label: string; value: number; color?: string }[];
  maxValue: number;
  formatValue: (v: number) => string;
  barColor?: string;
  height?: number;
}) {
  const barWidth = Math.min(60, (700 - data.length * 8) / data.length);
  const chartWidth = data.length * (barWidth + 8) + 60;

  return (
    <svg viewBox={`0 0 ${Math.max(chartWidth, 400)} ${height + 40}`} className="w-full" style={{ maxHeight: height + 40 }}>
      {data.map((d, i) => {
        const barH = (d.value / maxValue) * (height - 40);
        const x = 50 + i * (barWidth + 8);
        const y = height - 20 - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill={d.color || barColor || "#3B82F6"}
              rx={3}
              opacity={0.9}
            />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="600">
              {formatValue(d.value)}
            </text>
            <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="#64748B">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBar({
  data,
  maxValue,
  formatValue,
}: {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
  formatValue: (v: number) => string;
}) {
  const barHeight = 28;
  const gap = 6;
  const svgHeight = data.length * (barHeight + gap) + 10;

  return (
    <svg viewBox={`0 0 700 ${svgHeight}`} className="w-full" style={{ maxHeight: svgHeight }}>
      {data.map((d, i) => {
        const barW = Math.max(4, (d.value / maxValue) * 420);
        const y = i * (barHeight + gap) + 5;
        return (
          <g key={i}>
            <text x={0} y={y + barHeight / 2 + 4} fontSize="11" fill="#CBD5E1" fontWeight="500">
              {d.label}
            </text>
            <rect x={200} y={y} width={barW} height={barHeight} fill={d.color} rx={4} opacity={0.85} />
            <text x={205 + barW} y={y + barHeight / 2 + 4} fontSize="11" fill="#94A3B8" fontWeight="600">
              {formatValue(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MultiLineChart({
  data,
  lines,
  formatY,
  height = 280,
}: {
  data: { label: string; values: Record<string, number> }[];
  lines: { key: string; color: string; label: string }[];
  formatY: (v: number) => string;
  height?: number;
}) {
  const allValues = data.flatMap((d) => lines.map((l) => d.values[l.key]));
  const maxVal = Math.max(...allValues) * 1.15;
  const chartW = 640;
  const chartH = height - 60;
  const xStep = (chartW - 80) / (data.length - 1);

  return (
    <svg viewBox={`0 0 ${chartW} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = 20 + chartH * (1 - frac);
        return (
          <g key={i}>
            <line x1={60} y1={y} x2={chartW - 10} y2={y} stroke="#334155" strokeWidth={0.5} />
            <text x={55} y={y + 4} textAnchor="end" fontSize="10" fill="#64748B">
              {formatY(maxVal * frac)}
            </text>
          </g>
        );
      })}
      {/* Lines */}
      {lines.map((line) => {
        const points = data.map((d, i) => {
          const x = 60 + i * xStep;
          const y = 20 + chartH * (1 - d.values[line.key] / maxVal);
          return `${x},${y}`;
        });
        return (
          <g key={line.key}>
            <polyline points={points.join(" ")} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinejoin="round" />
            {data.map((d, i) => {
              const x = 60 + i * xStep;
              const y = 20 + chartH * (1 - d.values[line.key] / maxVal);
              return <circle key={i} cx={x} cy={y} r={4} fill={line.color} stroke="#0F172A" strokeWidth={1.5} />;
            })}
          </g>
        );
      })}
      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={60 + i * xStep} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748B">
          {d.label}
        </text>
      ))}
      {/* Legend */}
      {lines.map((line, i) => (
        <g key={line.key} transform={`translate(${70 + i * 140}, ${height - 26})`}>
          <rect x={0} y={-6} width={12} height={3} fill={line.color} rx={1.5} />
          <text x={16} y={0} fontSize="10" fill="#94A3B8">
            {line.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({
  data,
  size = 200,
  innerRadius = 60,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  let cumAngle = -Math.PI / 2;

  const paths = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startX = cx + r * Math.cos(cumAngle);
    const startY = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const endX = cx + r * Math.cos(cumAngle);
    const endY = cy + r * Math.sin(cumAngle);
    const innerStartX = cx + innerRadius * Math.cos(cumAngle);
    const innerStartY = cy + innerRadius * Math.sin(cumAngle);
    const innerEndX = cx + innerRadius * Math.cos(cumAngle - angle);
    const innerEndY = cy + innerRadius * Math.sin(cumAngle - angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY} Z`;
    return { path, color: d.color, label: d.label, value: d.value, pct: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} opacity={0.85} stroke="#0F172A" strokeWidth={1.5} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fill="#F1F5F9" fontWeight="700">
          ${(total).toFixed(0)}M
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94A3B8">
          Total
        </text>
      </svg>
      <div className="grid grid-cols-1 gap-1 text-xs">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ background: p.color }} />
            <span className="text-slate-400">{p.label}</span>
            <span className="text-slate-300 font-semibold ml-auto">${p.value.toFixed(1)}M ({p.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TornadoChart({ data }: { data: SensitivityRow[] }) {
  const maxRange = Math.max(...data.map((d) => d.high - d.low));
  const chartWidth = 600;
  const barHeight = 32;
  const gap = 10;
  const centerX = 350;
  const svgHeight = data.length * (barHeight + gap) + 30;
  const scale = 100 / maxRange;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${svgHeight}`} className="w-full" style={{ maxHeight: svgHeight }}>
      {/* Center line */}
      <line x1={centerX} y1={0} x2={centerX} y2={svgHeight} stroke="#475569" strokeWidth={1} strokeDasharray="4 4" />
      <text x={centerX} y={12} textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="600">
        $5.8M (Base)
      </text>
      {data.map((d, i) => {
        const y = 20 + i * (barHeight + gap);
        const lowW = (d.base - d.low) * scale;
        const highW = (d.high - d.base) * scale;
        return (
          <g key={i}>
            <text x={80} y={y + barHeight / 2 + 4} textAnchor="end" fontSize="10" fill="#CBD5E1" fontWeight="500">
              {d.variable}
            </text>
            {/* Low bar (left of center) */}
            <rect x={centerX - lowW} y={y} width={lowW} height={barHeight} fill="#EF4444" rx={3} opacity={0.7} />
            <text x={centerX - lowW - 6} y={y + barHeight / 2 + 4} textAnchor="end" fontSize="9" fill="#F87171">
              ${d.low}M ({d.lowLabel})
            </text>
            {/* High bar (right of center) */}
            <rect x={centerX} y={y} width={highW} height={barHeight} fill="#10B981" rx={3} opacity={0.7} />
            <text x={centerX + highW + 6} y={y + barHeight / 2 + 4} textAnchor="start" fontSize="9" fill="#34D399">
              ${d.high}M ({d.highLabel})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// =============================================================================
// METRIC CARD — Reusable display component
// =============================================================================

function MetricCard({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color?: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: color || "#F1F5F9" }}>
        {value}
      </p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
}

// =============================================================================
// TAB SECTIONS
// =============================================================================

type TabId = "overview" | "tam" | "sam" | "revenue" | "comparables" | "sensitivity";

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Key metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Global TAM" value="$2.6B" sublabel="All segments, adjusted" color="#3B82F6" />
        <MetricCard label="Agency SAM" value="$412M" sublabel="Serviceable addressable" color="#8B5CF6" />
        <MetricCard label="Beachhead TAM (US)" value="$58.3M" sublabel="10-50 emp. agencies" color="#EC4899" />
        <MetricCard label="Global Agency TAM" value="$144M" sublabel="10-50 emp. worldwide" color="#F59E0B" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="US Agencies (Target)" value="16,200" sublabel="10-50 employees" />
        <MetricCard label="Global Agencies" value="~40,000" sublabel="10-50 employees" />
        <MetricCard label="Y3 ARR (Base)" value="$5.8M" sublabel="Seed-funded scenario" color="#10B981" />
        <MetricCard label="Y5 ARR (Base)" value="$26.4M" sublabel="100% YoY growth at Y5" color="#10B981" />
      </div>

      {/* TAM / SAM / SOM funnel */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Market Sizing Funnel</h3>
        <div className="flex flex-col items-center gap-3">
          {[
            { label: "Total Addressable Market (TAM)", value: "$2.6B", width: "100%", bg: "#1E3A5F" },
            { label: "Serviceable Addressable Market (SAM)", value: "$412M", width: "70%", bg: "#2D1B69" },
            { label: "Beachhead Market (10-50 emp. agencies, Global)", value: "$144M", width: "45%", bg: "#4C1D95" },
            { label: "Beachhead Market (10-50 emp. agencies, US)", value: "$58.3M", width: "28%", bg: "#6D28D9" },
            { label: "Year 3 SOM (Base Case)", value: "$5.8M", width: "15%", bg: "#7C3AED" },
          ].map((level, i) => (
            <div
              key={i}
              className="rounded-lg py-3 px-4 text-center border border-white/10"
              style={{ width: level.width, background: level.bg, minWidth: 200 }}
            >
              <p className="text-white font-bold text-lg">{level.value}</p>
              <p className="text-slate-300 text-xs">{level.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market growth drivers */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Key Growth Drivers</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "Regulatory Tailwinds",
              desc: "EAA enforceable June 2025. ADA lawsuits at 8,800/year. Accessibility software market CAGR 9.3%.",
              metric: "9.3% CAGR",
            },
            {
              title: "Agency Market Expansion",
              desc: "10-50 employee cohort growing 12-15% annually. US digital agencies grew 10.8% in 2025. No dominant player (all <5% share).",
              metric: "12-15% CAGR",
            },
            {
              title: "SaaS Pricing Environment",
              desc: "SaaS inflation at 12.2% in 2026. Spend per employee at $9,100. Average org spends $55.7M on SaaS.",
              metric: "12.2% inflation",
            },
            {
              title: "AI Capability Expansion",
              desc: "AI-native app spending grew 75% YoY. AI tools command 23.4% higher pricing. MCP standardization in early 2026.",
              metric: "75% YoY growth",
            },
          ].map((driver, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-200">{driver.title}</h4>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">{driver.metric}</span>
              </div>
              <p className="text-xs text-slate-400">{driver.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TAMTab() {
  const totalTAM = tamSegments.reduce((s, seg) => s + seg.tam, 0);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Raw Global TAM" value={`$${(totalTAM / 1000).toFixed(1)}B`} sublabel="All segments combined" color="#3B82F6" />
        <MetricCard label="Adjusted Global TAM" value="$2.6B" sublabel="70% realism factor" color="#60A5FA" />
        <MetricCard label="Agency TAM (10-50 emp.)" value="$144M" sublabel="Primary beachhead" color="#EC4899" />
      </div>

      {/* TAM by segment - horizontal bar chart */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">TAM by Customer Segment ($M)</h3>
        <HorizontalBar
          data={tamSegments.map((s) => ({ label: s.name, value: s.tam, color: s.color }))}
          maxValue={1800}
          formatValue={(v) => `$${v}M`}
        />
      </div>

      {/* TAM concentration - donut chart */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">TAM Composition (excl. Enterprise)</h3>
        <DonutChart
          data={tamSegments
            .filter((s) => s.name !== "Enterprise Marketing")
            .map((s) => ({ label: s.name, value: s.tam, color: s.color }))}
          size={220}
          innerRadius={65}
        />
      </div>

      {/* Regional beachhead TAM */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Beachhead TAM by Region (10-50 emp. agencies)</h3>
        <BarChart
          data={regionalData.map((r) => ({ label: r.region, value: r.tam, color: r.color }))}
          maxValue={65}
          formatValue={(v) => `$${v.toFixed(1)}M`}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Region</th>
                <th className="text-right py-2 px-2">Agencies</th>
                <th className="text-right py-2 px-2">ACV</th>
                <th className="text-right py-2 px-2">TAM</th>
              </tr>
            </thead>
            <tbody>
              {regionalData.map((r, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-2 text-slate-300">{r.region}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{r.agencyCount.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">${r.acv.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-200">${r.tam.toFixed(1)}M</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 px-2 text-slate-100">Global Total</td>
                <td className="py-2 px-2 text-right text-slate-200">40,000</td>
                <td className="py-2 px-2 text-right text-slate-200">$3,600 avg</td>
                <td className="py-2 px-2 text-right text-blue-400">$144.0M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SAMTab() {
  const totalSAM = samSegments.reduce((s, seg) => s + seg.tam, 0);
  const agencySAM = samSegments.filter((s) => s.name.startsWith("Agenc")).reduce((sum, s) => sum + s.tam, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Total SAM" value={`$${totalSAM.toFixed(0)}M`} sublabel="All serviceable segments" color="#8B5CF6" />
        <MetricCard label="Agency Sub-SAM" value={`$${agencySAM.toFixed(0)}M`} sublabel={`${((agencySAM / totalSAM) * 100).toFixed(0)}% of total SAM`} color="#3B82F6" />
        <MetricCard label="SAM CAGR" value="~12%" sublabel="Weighted average growth" color="#10B981" />
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">SAM Composition ($M)</h3>
        <DonutChart
          data={samSegments.map((s) => ({ label: s.name, value: s.tam, color: s.color }))}
          size={240}
          innerRadius={70}
        />
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">SAM Segment Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Segment</th>
                <th className="text-right py-2 px-2">Count</th>
                <th className="text-right py-2 px-2">Avg. ACV</th>
                <th className="text-right py-2 px-2">SAM</th>
                <th className="text-right py-2 px-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {samSegments.map((s, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-2 text-slate-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
                    {s.name}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-400">{s.count.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">${s.acv.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right font-semibold text-slate-200">${s.tam.toFixed(1)}M</td>
                  <td className="py-2 px-2 text-right text-slate-400">{((s.tam / totalSAM) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2 px-2 text-slate-100">Total</td>
                <td className="py-2 px-2" />
                <td className="py-2 px-2" />
                <td className="py-2 px-2 text-right text-purple-400">${totalSAM.toFixed(0)}M</td>
                <td className="py-2 px-2 text-right text-slate-300">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SAM Growth projection */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">SAM Growth Projection (at ~12% CAGR)</h3>
        <BarChart
          data={[
            { label: "2025", value: 412, color: "#6366F1" },
            { label: "2026", value: 461, color: "#7C3AED" },
            { label: "2027", value: 516, color: "#8B5CF6" },
            { label: "2028", value: 578, color: "#A78BFA" },
            { label: "2029", value: 647, color: "#C4B5FD" },
            { label: "2030", value: 724, color: "#DDD6FE" },
          ]}
          maxValue={800}
          formatValue={(v) => `$${v}M`}
        />
      </div>
    </div>
  );
}

function RevenueTab() {
  const [activeScenario, setActiveScenario] = useState<"all" | "conservative" | "base" | "aggressive">("all");

  const revenueChartData = revenueScenarios.map((s) => ({
    label: s.label,
    values: { conservative: s.conservative, base: s.base, aggressive: s.aggressive },
  }));

  const customerChartData = customerScenarios.map((s) => ({
    label: s.label,
    values: { conservative: s.conservative, base: s.base, aggressive: s.aggressive },
  }));

  return (
    <div className="space-y-8">
      {/* Scenario summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Conservative Y5 ARR" value="$7.8M" sublabel="12,100 customers" color="#F59E0B" />
        <MetricCard label="Base Case Y5 ARR" value="$26.4M" sublabel="27,500 customers" color="#3B82F6" />
        <MetricCard label="Aggressive Y5 ARR" value="$62.0M" sublabel="64,500 customers" color="#10B981" />
      </div>

      {/* Revenue projection chart */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-slate-100">5-Year ARR Projections ($M)</h3>
          <div className="flex gap-2">
            {(["all", "conservative", "base", "aggressive"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveScenario(s)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  activeScenario === s ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <MultiLineChart
          data={revenueChartData}
          lines={[
            ...(activeScenario === "all" || activeScenario === "conservative" ? [{ key: "conservative", color: "#F59E0B", label: "Conservative" }] : []),
            ...(activeScenario === "all" || activeScenario === "base" ? [{ key: "base", color: "#3B82F6", label: "Base Case" }] : []),
            ...(activeScenario === "all" || activeScenario === "aggressive" ? [{ key: "aggressive", color: "#10B981", label: "Aggressive" }] : []),
          ]}
          formatY={(v) => `$${v.toFixed(0)}M`}
          height={300}
        />
      </div>

      {/* Paying customer growth */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Paying Customer Growth</h3>
        <MultiLineChart
          data={customerChartData}
          lines={[
            { key: "conservative", color: "#F59E0B", label: "Conservative" },
            { key: "base", color: "#3B82F6", label: "Base Case" },
            { key: "aggressive", color: "#10B981", label: "Aggressive" },
          ]}
          formatY={(v) => `${(v / 1000).toFixed(0)}K`}
          height={280}
        />
      </div>

      {/* Pricing tiers */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Pricing Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {pricingTiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 text-center border ${
                tier.name === "Agency" ? "border-blue-500/50 bg-blue-950/30" : "border-slate-700/50 bg-slate-900/50"
              }`}
            >
              {tier.name === "Agency" && (
                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Target Tier</span>
              )}
              <p className="text-sm font-bold text-slate-100 mt-1">{tier.name}</p>
              <p className="text-xl font-bold text-slate-100 mt-1">
                {tier.monthly === 0 ? "Free" : `$${tier.monthly}`}
                <span className="text-xs text-slate-500 font-normal">{tier.monthly > 0 ? "/mo" : ""}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {tier.annual === 0 ? "No cost" : `$${tier.annual.toLocaleString()}/yr`}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">{tier.target}</p>
              <p className="text-[10px] text-purple-400 mt-1">{tier.revShare} of revenue</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unit economics */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Unit Economics (Base Case)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Metric</th>
                <th className="text-right py-2 px-3">Year 1</th>
                <th className="text-right py-2 px-3">Year 3</th>
                <th className="text-right py-2 px-3">Year 5</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: "Blended ACV", y1: "$706", y3: "$713", y5: "$960" },
                { metric: "Monthly Gross Churn", y1: "4.0%", y3: "2.5%", y5: "2.0%" },
                { metric: "Net Revenue Retention", y1: "95%", y3: "110%", y5: "115%" },
                { metric: "Customer Lifetime", y1: "25 mo", y3: "40 mo", y5: "50 mo" },
                { metric: "LTV", y1: "$1,471", y3: "$2,377", y5: "$4,000" },
                { metric: "Target CAC (3:1)", y1: "$490", y3: "$792", y5: "$1,333" },
                { metric: "Gross Margin", y1: "80%", y3: "85%", y5: "87%" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-3 text-slate-300 font-medium">{row.metric}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{row.y1}</td>
                  <td className="py-2 px-3 text-right text-slate-300">{row.y3}</td>
                  <td className="py-2 px-3 text-right text-slate-200 font-semibold">{row.y5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ComparablesTab() {
  return (
    <div className="space-y-8">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Comparable SaaS Company ARR ($M)</h3>
        <BarChart
          data={comparables.map((c) => ({
            label: c.name,
            value: c.arr,
            color: c.name === "Semrush" ? "#3B82F6" : c.name === "Ahrefs" ? "#8B5CF6" : c.name === "Siteimprove" ? "#EC4899" : "#64748B",
          }))}
          maxValue={500}
          formatValue={(v) => `$${v}M`}
          height={280}
        />
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Comparable Company Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Company</th>
                <th className="text-right py-2 px-2">ARR</th>
                <th className="text-right py-2 px-2">Implied ACV</th>
                <th className="text-right py-2 px-2">Customers</th>
                <th className="text-left py-2 px-2">Notable</th>
              </tr>
            </thead>
            <tbody>
              {comparables.map((c, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-2 text-slate-200 font-medium">{c.name}</td>
                  <td className="py-2 px-2 text-right text-blue-400 font-semibold">${c.arr}M</td>
                  <td className="py-2 px-2 text-right text-slate-400">${c.acv.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{c.customers.toLocaleString()}</td>
                  <td className="py-2 px-2 text-slate-500">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key insights */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Key Validation Insights</h3>
        <div className="space-y-4">
          {[
            {
              title: "Adobe Acquires Semrush for $1.9B",
              detail:
                "Stockholders approved Feb 3, 2026. At ~4x forward ARR ($455M), this validates the agency tools market. Adobe sees strategic value in marketing/agency platforms.",
              color: "#3B82F6",
            },
            {
              title: "Ahrefs: $150M ARR Bootstrapped",
              detail:
                "With zero VC, no sales team, and 171 employees, Ahrefs demonstrates that product-led growth can build a massive B2B SaaS business. Revenue per employee: ~$870K.",
              color: "#8B5CF6",
            },
            {
              title: "Semrush's Upmarket Shift Validates Premium Pricing",
              detail:
                "Lost ~3,000 customers but grew ARR by $44M as ACV rose to $4,000. Customers paying >$50K/yr grew 72% YoY. Agencies pay premium for proven value.",
              color: "#EC4899",
            },
            {
              title: "Siteimprove Validates Quality Evaluation Niche",
              detail:
                "~$180M ARR at $24K ACV shows enterprise digital quality management is a standalone category. DesignChecker targets the gap between Stark ($10M) and Siteimprove ($180M).",
              color: "#10B981",
            },
          ].map((insight, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-full min-h-[40px] rounded-full flex-shrink-0" style={{ background: insight.color }} />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{insight.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{insight.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjacent market growth */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Adjacent Market Growth (2025 vs 2030, $B)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Market</th>
                <th className="text-right py-2 px-2">2025</th>
                <th className="text-right py-2 px-2">2030 Projected</th>
                <th className="text-right py-2 px-2">CAGR</th>
              </tr>
            </thead>
            <tbody>
              {adjacentMarkets.map((m, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-2 text-slate-300">{m.name}</td>
                  <td className="py-2 px-2 text-right text-slate-400">${m.size2025}B</td>
                  <td className="py-2 px-2 text-right text-slate-200 font-semibold">${m.size2030}B</td>
                  <td className="py-2 px-2 text-right text-emerald-400">{m.cagr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SensitivityTab() {
  return (
    <div className="space-y-8">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Sensitivity Analysis -- Year 3 ARR Impact</h3>
        <p className="text-xs text-slate-400 mb-4">
          How changes to key assumptions affect Year 3 ARR in the base case scenario. Red bars show downside risk; green bars show upside potential.
        </p>
        <TornadoChart data={sensitivityData} />
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Sensitivity Detail</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Variable</th>
                <th className="text-center py-2 px-3">Low Case</th>
                <th className="text-center py-2 px-3">Base Case</th>
                <th className="text-center py-2 px-3">High Case</th>
                <th className="text-right py-2 px-3">Range</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityData.map((d, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-3 text-slate-300 font-medium">{d.variable}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-red-400">${d.low}M</span>
                    <span className="text-slate-500 ml-1">({d.lowLabel})</span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-200 font-semibold">${d.base}M ({d.baseLabel})</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-emerald-400">${d.high}M</span>
                    <span className="text-slate-500 ml-1">({d.highLabel})</span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">${(d.high - d.low).toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Break-even analysis */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Break-Even Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { scenario: "Bootstrap", burn: "$15K/mo", months: "18-24 mo", cash: "$270K-$360K", team: "2 founders" },
            { scenario: "Seed-Funded", burn: "$80K/mo", months: "24-30 mo", cash: "$1.9M-$2.4M", team: "Team of 6" },
            { scenario: "Series A", burn: "$250K/mo", months: "30-36 mo", cash: "$7.5M-$9.0M", team: "Team of 15" },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-200 mb-2">{s.scenario}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Team</span>
                  <span className="text-slate-300">{s.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Burn</span>
                  <span className="text-slate-300">{s.burn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Break-even</span>
                  <span className="text-emerald-400 font-semibold">{s.months}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cash Required</span>
                  <span className="text-slate-200 font-semibold">{s.cash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk-adjusted ranges */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Risk-Adjusted Revenue Ranges</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Year</th>
                <th className="text-right py-2 px-3">Conservative (P25)</th>
                <th className="text-right py-2 px-3">Base Case (P50)</th>
                <th className="text-right py-2 px-3">Aggressive (P75)</th>
                <th className="text-right py-2 px-3">Risk-Adjusted</th>
              </tr>
            </thead>
            <tbody>
              {[
                { year: "Y1", cons: "$216K", base: "$505K", agg: "$1.1M", adj: "$490K" },
                { year: "Y3", cons: "$1.4M", base: "$5.8M", agg: "$14.2M", adj: "$5.5M" },
                { year: "Y5", cons: "$7.8M", base: "$26.4M", agg: "$62.0M", adj: "$25.0M" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="py-2 px-3 text-slate-300 font-medium">{r.year}</td>
                  <td className="py-2 px-3 text-right text-amber-400">{r.cons}</td>
                  <td className="py-2 px-3 text-right text-blue-400">{r.base}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{r.agg}</td>
                  <td className="py-2 px-3 text-right text-slate-100 font-bold">{r.adj}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Risk-adjusted expected values weight base case (50%), conservative (25%), and aggressive (25%).
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function MarketAnalysisPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tam", label: "TAM Analysis" },
    { id: "sam", label: "SAM Breakdown" },
    { id: "revenue", label: "Revenue Projections" },
    { id: "comparables", label: "Comparables" },
    { id: "sensitivity", label: "Sensitivity" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">DesignChecker -- Market Size Analysis</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Disciplined Entrepreneurship Step 4 | Agency Segment TAM/SAM/SOM | February 2026
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="text-right">
                <p className="text-slate-400">Global TAM</p>
                <p className="text-blue-400 font-bold text-base">$2.6B</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-right">
                <p className="text-slate-400">Agency SAM</p>
                <p className="text-purple-400 font-bold text-base">$412M</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-right">
                <p className="text-slate-400">Y5 ARR (Base)</p>
                <p className="text-emerald-400 font-bold text-base">$26.4M</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "tam" && <TAMTab />}
        {activeTab === "sam" && <SAMTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "comparables" && <ComparablesTab />}
        {activeTab === "sensitivity" && <SensitivityTab />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500">
          <p>
            DesignChecker Market Analysis | Data Science Team | February 2026
          </p>
          <p className="mt-1">
            Sources: IBISWorld, Promethean Research, Mordor Intelligence, Fortune Business Insights, Zylo 2026 SaaS Index, Semrush IR, Getlatka
          </p>
        </div>
      </footer>
    </div>
  );
}

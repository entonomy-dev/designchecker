"use client";

import React, { useState } from "react";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

interface SubCriterion {
  name: string;
  weight: number; // weight within parent category (sums to 1.0)
  description: string;
  signals: string[];
  scoring: string;
}

interface ScoringCategory {
  id: string;
  name: string;
  weight: number; // global weight (all categories sum to 1.0)
  color: string;
  icon: string;
  description: string;
  subcriteria: SubCriterion[];
}

interface PipelineStep {
  stage: number;
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  tech: string[];
}

interface RecommendationRule {
  trigger: string;
  category: string;
  severity: "critical" | "major" | "minor" | "suggestion";
  message: string;
  impact: number; // estimated score uplift
}

// ---------------------------------------------------------------------------
// Scoring category definitions
// ---------------------------------------------------------------------------

const SCORING_CATEGORIES: ScoringCategory[] = [
  {
    id: "visual-hierarchy",
    name: "Visual Hierarchy & Layout",
    weight: 0.25,
    color: "#6366f1",
    icon: "VH",
    description:
      "Evaluates how effectively the design guides the user's eye through content using size, contrast, spacing, and alignment to establish clear information priority.",
    subcriteria: [
      {
        name: "Heading Structure",
        weight: 0.2,
        description: "Proper semantic heading levels (H1-H6) with visually distinct sizing.",
        signals: ["h1Count", "headingLevelSkips", "headingSizeRatio"],
        scoring:
          "Exactly one H1 = full marks. Each level skip -3pts. Size ratio between consecutive levels < 1.15 = -2pts.",
      },
      {
        name: "Whitespace & Spacing",
        weight: 0.25,
        description: "Consistent use of margins and padding to group related content.",
        signals: ["spacingVariance", "contentDensity", "sectionPadding"],
        scoring:
          "Coefficient of variation in spacing < 0.15 = full marks. Density ratio > 0.85 = -5pts for cramped layout.",
      },
      {
        name: "Grid Alignment",
        weight: 0.2,
        description: "Elements snap to an implicit or explicit grid system.",
        signals: ["alignmentOffsets", "gridColumnConsistency", "elementSnapScore"],
        scoring:
          "Median alignment offset < 2px = full marks. Each element > 8px off-grid = -1pt (max -10).",
      },
      {
        name: "Content Grouping",
        weight: 0.2,
        description: "Related elements are visually grouped using proximity or containers.",
        signals: ["proximityClusters", "containerUsage", "orphanElements"],
        scoring:
          "Orphan ratio < 0.05 = full marks. Each 5% increase in orphan ratio = -3pts.",
      },
      {
        name: "Visual Weight Balance",
        weight: 0.15,
        description: "The page feels balanced, not heavy on one side.",
        signals: ["visualCenterOffset", "quadrantDensity", "foldDistribution"],
        scoring:
          "Center-of-mass offset < 10% of viewport width = full marks. Each 5% beyond = -4pts.",
      },
    ],
  },
  {
    id: "typography",
    name: "Typography & Readability",
    weight: 0.2,
    color: "#8b5cf6",
    icon: "TY",
    description:
      "Measures text legibility, font selection quality, line length, contrast, and overall reading comfort across all viewport sizes.",
    subcriteria: [
      {
        name: "Font Selection",
        weight: 0.15,
        description: "Professional, web-optimized fonts with appropriate pairing.",
        signals: ["fontFamilyCount", "fontLoadPerformance", "fontPairingScore"],
        scoring:
          "2-3 font families = full marks. >4 fonts = -4pts. System-only stack = -2pts. Poor pairing (serif+comic) = -5pts.",
      },
      {
        name: "Line Length",
        weight: 0.2,
        description: "Body text lines between 45-80 characters for optimal readability.",
        signals: ["avgLineLength", "maxLineLength", "responsiveLineLength"],
        scoring:
          "Average 55-75 chars = full marks. Each 10-char deviation = -3pts. Lines > 100 chars = -5pts.",
      },
      {
        name: "Line Height & Spacing",
        weight: 0.2,
        description: "Comfortable vertical rhythm with appropriate line-height ratios.",
        signals: ["lineHeightRatio", "paragraphSpacing", "verticalRhythm"],
        scoring:
          "Body line-height 1.4-1.8 = full marks. <1.2 = -5pts. Inconsistent vertical rhythm variance > 20% = -3pts.",
      },
      {
        name: "Text Contrast",
        weight: 0.25,
        description: "Sufficient contrast ratios meeting WCAG AA or AAA standards.",
        signals: ["contrastRatios", "wcagAAPass", "wcagAAAPass"],
        scoring:
          "All text WCAG AA = full marks. Each failing element = -2pts. AAA compliance = +bonus 2pts (capped at category max).",
      },
      {
        name: "Responsive Typography",
        weight: 0.2,
        description: "Text scales appropriately across breakpoints without overflow.",
        signals: ["textOverflow", "fontSizeBreakpoints", "clampUsage"],
        scoring:
          "No overflow at any breakpoint = full marks. Each overflow instance = -3pts. No scaling = -5pts.",
      },
    ],
  },
  {
    id: "color-design",
    name: "Color & Visual Design",
    weight: 0.2,
    color: "#ec4899",
    icon: "CV",
    description:
      "Assesses the color palette coherence, contrast accessibility, visual consistency, and aesthetic quality of imagery and decorative elements.",
    subcriteria: [
      {
        name: "Palette Coherence",
        weight: 0.25,
        description: "Colors follow a deliberate palette with harmonious relationships.",
        signals: ["uniqueColors", "paletteHarmony", "colorTemperature"],
        scoring:
          "3-7 distinct hues with harmonic relationship = full marks. >12 hues = -4pts. No discernible palette = -8pts.",
      },
      {
        name: "Contrast Accessibility",
        weight: 0.25,
        description: "Interactive and informational elements meet accessibility contrast ratios.",
        signals: ["interactiveContrast", "decorativeVsFunctional", "focusIndicators"],
        scoring:
          "All interactive elements 4.5:1+ = full marks. Each failure = -3pts. Missing focus indicators = -5pts.",
      },
      {
        name: "Image Quality",
        weight: 0.2,
        description: "Images are high quality, properly sized, and serve a purpose.",
        signals: ["imageResolution", "aspectRatioConsistency", "altTextPresence"],
        scoring:
          "All images >= 2x display size = full marks. Stretched images = -3pts each. Missing alt text = -2pts each.",
      },
      {
        name: "Consistency",
        weight: 0.2,
        description: "Similar elements use the same colors and styles throughout.",
        signals: ["buttonColorVariance", "linkColorVariance", "borderStyleVariance"],
        scoring:
          "All similar elements share styles = full marks. Each inconsistency class = -2pts.",
      },
      {
        name: "Dark Mode Support",
        weight: 0.1,
        description: "Optional: site provides a well-implemented dark theme.",
        signals: ["prefersColorScheme", "darkModeContrast", "imageAdaptation"],
        scoring:
          "Full dark mode with proper contrast = full marks. Partial = half marks. None = 0 (no penalty).",
      },
    ],
  },
  {
    id: "responsiveness",
    name: "Responsive Design & Performance",
    weight: 0.15,
    color: "#14b8a6",
    icon: "RP",
    description:
      "Tests how well the design adapts to different screen sizes and evaluates loading performance that directly impacts perceived design quality.",
    subcriteria: [
      {
        name: "Breakpoint Handling",
        weight: 0.25,
        description: "Layout adapts gracefully at standard breakpoints (mobile, tablet, desktop).",
        signals: ["layoutShifts", "breakpointCoverage", "overflowAtBreakpoints"],
        scoring:
          "Smooth adaptation at 320/768/1024/1440px = full marks. Each broken breakpoint = -5pts.",
      },
      {
        name: "Touch Target Sizing",
        weight: 0.2,
        description: "Interactive elements are at least 44x44px on touch devices.",
        signals: ["touchTargetSize", "tapTargetSpacing", "mobileNavUsability"],
        scoring:
          "All targets >= 44px = full marks. Each undersized target = -1pt (max -10).",
      },
      {
        name: "CLS (Layout Shift)",
        weight: 0.2,
        description: "Cumulative Layout Shift stays under 0.1 for visual stability.",
        signals: ["cumulativeLayoutShift", "imageReservation", "fontSwapShift"],
        scoring:
          "CLS < 0.05 = full marks. 0.05-0.1 = -3pts. 0.1-0.25 = -6pts. >0.25 = -10pts.",
      },
      {
        name: "LCP (Largest Contentful Paint)",
        weight: 0.2,
        description: "Primary content renders within 2.5 seconds.",
        signals: ["lcpTime", "heroImageOptimization", "criticalCSSInline"],
        scoring:
          "LCP < 1.5s = full marks. 1.5-2.5s = -3pts. 2.5-4s = -6pts. >4s = -10pts.",
      },
      {
        name: "Viewport Meta & Scaling",
        weight: 0.15,
        description: "Proper viewport configuration and no horizontal scroll.",
        signals: ["viewportMeta", "horizontalScroll", "pinchZoomEnabled"],
        scoring:
          "Correct viewport + no horizontal scroll + zoom enabled = full marks. Each issue = -3pts.",
      },
    ],
  },
  {
    id: "navigation-ux",
    name: "Navigation & UX Patterns",
    weight: 0.1,
    color: "#f59e0b",
    icon: "NX",
    description:
      "Evaluates the clarity and consistency of navigation, interactive element behavior, and adherence to established UX conventions.",
    subcriteria: [
      {
        name: "Navigation Clarity",
        weight: 0.3,
        description: "Primary navigation is immediately identifiable and logically structured.",
        signals: ["navElementPresence", "navItemCount", "navDepth"],
        scoring:
          "Clear primary nav with 3-8 items = full marks. >10 items = -3pts. No identifiable nav = -10pts.",
      },
      {
        name: "Interactive Feedback",
        weight: 0.25,
        description: "Buttons, links, and controls provide hover/focus/active states.",
        signals: ["hoverStatePresence", "focusStatePresence", "cursorStyles"],
        scoring:
          "All interactive elements have hover + focus states = full marks. Each missing state type = -2pts.",
      },
      {
        name: "CTA Effectiveness",
        weight: 0.2,
        description: "Primary calls-to-action are visually prominent and clearly worded.",
        signals: ["ctaContrast", "ctaSize", "ctaPlacement", "ctaWording"],
        scoring:
          "Primary CTA above fold with high contrast = full marks. Below fold = -3pts. Low contrast = -4pts.",
      },
      {
        name: "Form Usability",
        weight: 0.15,
        description: "Forms use proper labels, validation, and error messaging.",
        signals: ["labelAssociation", "validationPresence", "errorMessageClarity"],
        scoring:
          "All fields labeled + validation + clear errors = full marks. Missing labels = -3pts each. No validation = -5pts.",
      },
      {
        name: "Link Distinction",
        weight: 0.1,
        description: "Links are visually distinct from surrounding text.",
        signals: ["linkUnderline", "linkColorDifference", "visitedStatePresence"],
        scoring:
          "Underline or strong color difference = full marks. Neither = -5pts.",
      },
    ],
  },
  {
    id: "accessibility",
    name: "Accessibility & Standards",
    weight: 0.1,
    color: "#22c55e",
    icon: "AC",
    description:
      "Checks compliance with WCAG 2.1 Level AA, semantic HTML usage, ARIA attributes, and keyboard navigability.",
    subcriteria: [
      {
        name: "Semantic HTML",
        weight: 0.25,
        description: "Proper use of semantic elements (header, main, nav, footer, article).",
        signals: ["semanticElements", "divSoupRatio", "landmarkPresence"],
        scoring:
          "All major landmarks present + low div ratio = full marks. Missing landmarks = -3pts each. Div ratio > 0.8 = -4pts.",
      },
      {
        name: "ARIA Implementation",
        weight: 0.2,
        description: "Correct and necessary ARIA roles, labels, and live regions.",
        signals: ["ariaRoles", "ariaLabels", "ariaLiveRegions", "ariaErrors"],
        scoring:
          "Correct ARIA where needed = full marks. Missing on interactive widgets = -3pts each. Invalid ARIA = -4pts each.",
      },
      {
        name: "Keyboard Navigation",
        weight: 0.25,
        description: "All interactive elements reachable and operable via keyboard.",
        signals: ["tabOrder", "focusTrap", "skipNavigation", "keyboardOperable"],
        scoring:
          "Logical tab order + skip nav + all operable = full marks. Broken tab order = -5pts. Focus trap = -8pts.",
      },
      {
        name: "Alt Text & Media",
        weight: 0.15,
        description: "All meaningful images have descriptive alt text; decorative images are marked.",
        signals: ["altTextCoverage", "altTextQuality", "videoCaptions"],
        scoring:
          "100% coverage with descriptive text = full marks. Each missing = -2pts. Generic alt = -1pt.",
      },
      {
        name: "Color Independence",
        weight: 0.15,
        description: "Information is not conveyed by color alone.",
        signals: ["colorOnlyIndicators", "patternUsage", "iconSupport"],
        scoring:
          "No color-only indicators = full marks. Each instance = -3pts.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Analysis pipeline definition
// ---------------------------------------------------------------------------

const PIPELINE_STEPS: PipelineStep[] = [
  {
    stage: 1,
    name: "URL Ingestion & Rendering",
    description:
      "Accept a target URL, launch a headless browser, render the page at three viewport widths (375px, 768px, 1440px), and capture full-page screenshots plus the serialized DOM.",
    inputs: ["Target URL"],
    outputs: [
      "Serialized DOM (3 viewports)",
      "Full-page screenshots (3 viewports)",
      "HAR network log",
      "Performance timing entries",
    ],
    tech: ["Puppeteer / Playwright", "Chrome DevTools Protocol", "Node.js worker"],
  },
  {
    stage: 2,
    name: "DOM Analysis Engine",
    description:
      "Parse the serialized DOM to extract structural signals: heading hierarchy, semantic element usage, ARIA attributes, form structure, link patterns, and computed styles for every visible element.",
    inputs: ["Serialized DOM (3 viewports)"],
    outputs: [
      "Element tree with computed styles",
      "Heading hierarchy map",
      "Semantic structure report",
      "ARIA audit results",
      "Color palette extraction",
    ],
    tech: ["JSDOM / Cheerio", "CSS computed style extraction", "Custom AST walker"],
  },
  {
    stage: 3,
    name: "Visual Analysis Engine",
    description:
      "Process screenshots through computer vision to detect layout grid alignment, visual weight distribution, whitespace patterns, and content density heatmaps.",
    inputs: ["Full-page screenshots (3 viewports)"],
    outputs: [
      "Grid alignment score",
      "Visual balance map",
      "Whitespace heatmap",
      "Content density matrix",
      "Color distribution analysis",
    ],
    tech: ["Sharp (image processing)", "Canvas pixel analysis", "Edge detection algorithms"],
  },
  {
    stage: 4,
    name: "Performance & Metrics Collection",
    description:
      "Run Lighthouse-style audits to gather Core Web Vitals (LCP, CLS, FID/INP), contrast ratios, touch target sizing, and responsive behavior metrics.",
    inputs: ["HAR network log", "Performance timing entries", "DOM + screenshots"],
    outputs: [
      "Core Web Vitals scores",
      "WCAG contrast audit",
      "Touch target report",
      "Responsive breakpoint audit",
    ],
    tech: ["Lighthouse CI (headless)", "axe-core", "Custom CWV collector"],
  },
  {
    stage: 5,
    name: "Score Computation",
    description:
      "Feed all signals into the weighted scoring engine. Each sub-criterion produces a 0-100 raw score. Apply category weights, then global weights to produce the final composite score.",
    inputs: [
      "All signal maps from stages 2-4",
    ],
    outputs: [
      "Sub-criterion scores (0-100 each)",
      "Category scores (weighted averages)",
      "Composite score (0-100)",
      "Confidence interval",
    ],
    tech: ["Custom scoring engine (TypeScript)", "Statistical normalization", "Bayesian confidence"],
  },
  {
    stage: 6,
    name: "Recommendation Generation",
    description:
      "Identify the lowest-scoring sub-criteria, match them against the recommendation rule set, rank by estimated impact, and produce a prioritized improvement plan.",
    inputs: ["All sub-criterion scores", "Recommendation rule database"],
    outputs: [
      "Prioritized recommendation list",
      "Estimated score uplift per fix",
      "Implementation difficulty ratings",
      "Before/after visual previews (future)",
    ],
    tech: ["Rule engine (pattern matching)", "Impact estimation model", "Template renderer"],
  },
];

// ---------------------------------------------------------------------------
// Sample recommendation rules
// ---------------------------------------------------------------------------

const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    trigger: "contrastRatios < 4.5",
    category: "Accessibility",
    severity: "critical",
    message:
      "Text contrast ratio is below WCAG AA minimum (4.5:1). Increase foreground/background contrast to improve readability for all users.",
    impact: 8,
  },
  {
    trigger: "avgLineLength > 90",
    category: "Typography",
    severity: "major",
    message:
      "Body text line length exceeds 90 characters. Constrain content width to 65-75 characters for optimal reading comfort.",
    impact: 5,
  },
  {
    trigger: "cumulativeLayoutShift > 0.1",
    category: "Performance",
    severity: "critical",
    message:
      "Cumulative Layout Shift exceeds the 'good' threshold. Reserve explicit dimensions for images and embeds, and avoid injecting content above the fold.",
    impact: 7,
  },
  {
    trigger: "h1Count !== 1",
    category: "Visual Hierarchy",
    severity: "major",
    message:
      "Page should have exactly one H1 element. Multiple or missing H1 elements weaken the document's primary heading signal.",
    impact: 4,
  },
  {
    trigger: "touchTargetSize < 44",
    category: "Responsiveness",
    severity: "major",
    message:
      "Interactive elements smaller than 44x44px are difficult to tap on mobile. Increase padding or min-height/width on buttons and links.",
    impact: 5,
  },
  {
    trigger: "navItemCount > 10",
    category: "Navigation",
    severity: "minor",
    message:
      "Navigation contains too many items. Consider grouping items into dropdowns or restructuring to reduce cognitive load.",
    impact: 3,
  },
  {
    trigger: "missingAltText > 0",
    category: "Accessibility",
    severity: "critical",
    message:
      "Images without alt text are invisible to screen reader users. Add descriptive alt attributes to all meaningful images.",
    impact: 6,
  },
  {
    trigger: "uniqueColors > 12",
    category: "Color & Design",
    severity: "minor",
    message:
      "Over 12 distinct hues detected. Consolidate to a cohesive 5-7 color palette to improve visual consistency.",
    impact: 3,
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e2e8f0",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } as React.CSSProperties,
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "48px 24px",
  } as React.CSSProperties,
  hero: {
    textAlign: "center" as const,
    marginBottom: 64,
  } as React.CSSProperties,
  heroTitle: {
    fontSize: 42,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    background: "linear-gradient(135deg, #6366f1, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 16,
    lineHeight: 1.2,
  } as React.CSSProperties,
  heroSub: {
    fontSize: 18,
    color: "#94a3b8",
    maxWidth: 700,
    margin: "0 auto",
    lineHeight: 1.6,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    color: "#f1f5f9",
  } as React.CSSProperties,
  sectionSub: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 32,
    lineHeight: 1.5,
  } as React.CSSProperties,
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 24,
  } as React.CSSProperties,
  card: {
    background: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 12,
    padding: 24,
    transition: "border-color 0.2s",
  } as React.CSSProperties,
  formulaBlock: {
    background: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 12,
    padding: 32,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 14,
    lineHeight: 2,
    overflowX: "auto" as const,
    marginBottom: 32,
  } as React.CSSProperties,
  tag: (color: string) =>
    ({
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      background: color + "18",
      color: color,
      marginRight: 6,
      marginBottom: 4,
    }) as React.CSSProperties,
  severityDot: (severity: string) => {
    const map: Record<string, string> = {
      critical: "#ef4444",
      major: "#f59e0b",
      minor: "#3b82f6",
      suggestion: "#22c55e",
    };
    return {
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: map[severity] || "#64748b",
      marginRight: 8,
      verticalAlign: "middle",
    } as React.CSSProperties;
  },
  tabBar: {
    display: "flex",
    gap: 8,
    marginBottom: 32,
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  tab: (active: boolean) =>
    ({
      padding: "8px 20px",
      borderRadius: 8,
      border: active ? "1px solid #6366f1" : "1px solid #1e1e2e",
      background: active ? "#6366f120" : "transparent",
      color: active ? "#a5b4fc" : "#64748b",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s",
    }) as React.CSSProperties,
  scoreBar: (pct: number, color: string) =>
    ({
      height: 8,
      borderRadius: 4,
      background: "#1e1e2e",
      position: "relative" as const,
      overflow: "hidden",
      marginTop: 8,
    }) as React.CSSProperties,
  scoreBarFill: (pct: number, color: string) =>
    ({
      position: "absolute" as const,
      top: 0,
      left: 0,
      height: "100%",
      width: `${pct}%`,
      borderRadius: 4,
      background: `linear-gradient(90deg, ${color}, ${color}bb)`,
      transition: "width 0.6s ease",
    }) as React.CSSProperties,
  pipelineConnector: {
    width: 2,
    height: 32,
    background: "#1e1e2e",
    margin: "0 auto",
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WeightDonut({
  categories,
}: {
  categories: ScoringCategory[];
}) {
  // Build a simple CSS conic-gradient donut
  let cumulative = 0;
  const stops = categories.map((c) => {
    const start = cumulative;
    cumulative += c.weight * 100;
    return `${c.color} ${start}% ${cumulative}%`;
  });
  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 32,
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 40,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: gradient,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
            100
          </span>
          <span style={{ fontSize: 12, color: "#64748b" }}>total pts</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((c) => (
          <div
            key={c.id}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: c.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 14, color: "#cbd5e1" }}>
              {c.name}{" "}
              <span style={{ color: "#64748b" }}>({(c.weight * 100).toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryDetail({ category }: { category: ScoringCategory }) {
  return (
    <div style={{ ...styles.card, borderColor: category.color + "40" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: category.color + "20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: category.color,
            flexShrink: 0,
          }}
        >
          {category.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>
            {category.name}
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Weight: {(category.weight * 100).toFixed(0)}% of total score
          </div>
        </div>
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16 }}>
        {category.description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {category.subcriteria.map((sc) => (
          <div
            key={sc.name}
            style={{
              background: "#0a0a0f",
              border: "1px solid #1e1e2e",
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                {sc.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: category.color,
                  fontWeight: 600,
                }}
              >
                {(sc.weight * 100).toFixed(0)}% of category
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                margin: "0 0 8px 0",
                lineHeight: 1.5,
              }}
            >
              {sc.description}
            </p>
            <div style={{ marginBottom: 6 }}>
              {sc.signals.map((s) => (
                <span key={s} style={styles.tag(category.color)}>
                  {s}
                </span>
              ))}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.5,
              }}
            >
              {sc.scoring}
            </div>
            <div style={styles.scoreBar(sc.weight * 100, category.color)}>
              <div
                style={styles.scoreBarFill(sc.weight * 100, category.color)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineCard({ step }: { step: PipelineStep }) {
  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {step.stage}
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>
          {step.name}
        </span>
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>
        {step.description}
      </p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Inputs
          </div>
          {step.inputs.map((i) => (
            <div
              key={i}
              style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}
            >
              {i}
            </div>
          ))}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Outputs
          </div>
          {step.outputs.map((o) => (
            <div
              key={o}
              style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}
            >
              {o}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {step.tech.map((t) => (
          <span key={t} style={styles.tag("#6366f1")}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ScoringFrameworkPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredCategories =
    activeCategory === "all"
      ? SCORING_CATEGORIES
      : SCORING_CATEGORIES.filter((c) => c.id === activeCategory);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Hero */}
        <header style={styles.hero}>
          <h1 style={styles.heroTitle}>
            DesignChecker Scoring Framework
          </h1>
          <p style={styles.heroSub}>
            A transparent, multi-dimensional algorithm that evaluates web design
            quality on a 0-100 scale across six weighted categories, powered by
            DOM analysis, computer vision, and performance auditing.
          </p>
        </header>

        {/* ---------- Section 1: Weight Distribution ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>Score Composition</h2>
          <p style={styles.sectionSub}>
            The final DesignChecker score is a weighted composite of six
            independent category scores. Each category contains 4-5
            sub-criteria, each with its own measurable signals and deterministic
            scoring rules.
          </p>
          <WeightDonut categories={SCORING_CATEGORIES} />
          <div style={styles.formulaBlock}>
            <div style={{ color: "#64748b", marginBottom: 8 }}>
              {"// Composite score formula"}
            </div>
            <div>
              <span style={{ color: "#6366f1" }}>FinalScore</span> ={" "}
              <span style={{ color: "#f59e0b" }}>Sum</span>(
              <span style={{ color: "#ec4899" }}>CategoryWeight</span>
              <sub>i</sub> *{" "}
              <span style={{ color: "#14b8a6" }}>CategoryScore</span>
              <sub>i</sub>)
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#64748b" }}>{"// where "}</span>
              <span style={{ color: "#14b8a6" }}>CategoryScore</span>
              <sub>i</sub> ={" "}
              <span style={{ color: "#f59e0b" }}>Sum</span>(
              <span style={{ color: "#ec4899" }}>SubWeight</span>
              <sub>j</sub> *{" "}
              <span style={{ color: "#22c55e" }}>SubScore</span>
              <sub>j</sub>)
            </div>
            <div style={{ marginTop: 16, color: "#64748b", fontSize: 13 }}>
              {"// SubScore is clamped to [0, 100], penalties are subtractive from 100"}
            </div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {"// Confidence interval = +/- (1.96 * stddev across sub-criteria)"}
            </div>
          </div>
        </section>

        {/* ---------- Section 2: Evaluation Criteria ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>Evaluation Criteria</h2>
          <p style={styles.sectionSub}>
            Each category is broken down into measurable sub-criteria. Every
            sub-criterion defines the signals it reads from the DOM, screenshots,
            or performance traces, along with deterministic scoring rules.
          </p>

          {/* Category filter tabs */}
          <div style={styles.tabBar}>
            <button
              style={styles.tab(activeCategory === "all")}
              onClick={() => setActiveCategory("all")}
            >
              All Categories
            </button>
            {SCORING_CATEGORIES.map((c) => (
              <button
                key={c.id}
                style={styles.tab(activeCategory === c.id)}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={styles.grid2}>
            {filteredCategories.map((c) => (
              <CategoryDetail key={c.id} category={c} />
            ))}
          </div>
        </section>

        {/* ---------- Section 3: Analysis Pipeline ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>Analysis Pipeline</h2>
          <p style={styles.sectionSub}>
            When a URL is submitted, it passes through a six-stage pipeline. Each
            stage runs as an isolated worker with defined inputs and outputs,
            enabling parallel execution where possible (stages 2-4 run
            concurrently after stage 1 completes).
          </p>
          <div>
            {PIPELINE_STEPS.map((step, idx) => (
              <React.Fragment key={step.stage}>
                <PipelineCard step={step} />
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div style={styles.pipelineConnector} />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ---------- Section 4: Architecture Diagram ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>System Architecture</h2>
          <p style={styles.sectionSub}>
            High-level data flow from URL submission to scored report. The system
            is designed for horizontal scaling -- each analysis runs in an
            isolated container with a 30-second timeout.
          </p>
          <div
            style={{
              ...styles.card,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              lineHeight: 1.8,
              overflowX: "auto",
              whiteSpace: "pre",
              color: "#94a3b8",
            }}
          >
            {`
  +------------------+      +--------------------+      +--------------------+
  |                  |      |                    |      |                    |
  |   Next.js App    |----->|   Analysis Queue   |----->|   Worker Pool      |
  |   (Frontend)     |      |   (Redis/BullMQ)   |      |   (Containerized)  |
  |                  |      |                    |      |                    |
  +------------------+      +--------------------+      +--------+-----------+
         ^                                                       |
         |                                                       v
  +------+----------+                                  +---------+----------+
  |                 |                                  |                    |
  |   Results API   |<---------------------------------|   Scoring Engine   |
  |   (REST/WS)     |         scored results           |   (TypeScript)     |
  |                 |                                  |                    |
  +-----------------+                                  +---------+----------+
                                                                |
                                                       +--------+----------+
                                                       |                   |
                                                       |  Stage 1: Render  |
                                                       |  Stage 2: DOM     |
                                                       |  Stage 3: Visual  |----> parallel
                                                       |  Stage 4: Perf    |
                                                       |  Stage 5: Score   |
                                                       |  Stage 6: Recs    |
                                                       |                   |
                                                       +-------------------+

  Data Stores:
  +-------------------+    +-------------------+    +-------------------+
  | PostgreSQL        |    | Redis             |    | S3-Compatible     |
  | - Scan history    |    | - Job queue       |    | - Screenshots     |
  | - Score records   |    | - Caching layer   |    | - DOM snapshots   |
  | - User accounts   |    | - Rate limiting   |    | - Report PDFs     |
  +-------------------+    +-------------------+    +-------------------+
`}
          </div>
        </section>

        {/* ---------- Section 5: Recommendation Engine ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>Recommendation Engine</h2>
          <p style={styles.sectionSub}>
            After scoring, the recommendation engine identifies the highest-impact
            improvements. Rules are matched against failing signals, ranked by
            estimated score uplift, and presented with actionable guidance.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {(["critical", "major", "minor", "suggestion"] as const).map(
              (sev) => (
                <div
                  key={sev}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div style={styles.severityDot(sev)} />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      textTransform: "capitalize",
                    }}
                  >
                    {sev}
                  </span>
                </div>
              )
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RECOMMENDATION_RULES.map((rule, idx) => (
              <div key={idx} style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={styles.severityDot(rule.severity)} />
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        color: "#e2e8f0",
                      }}
                    >
                      {rule.trigger}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={styles.tag("#6366f1")}>{rule.category}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#22c55e",
                        fontWeight: 600,
                      }}
                    >
                      +{rule.impact} pts
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {rule.message}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Section 6: Score Interpretation ---------- */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={styles.sectionTitle}>Score Interpretation Guide</h2>
          <p style={styles.sectionSub}>
            Understanding what the final score means for a website and how
            agencies should communicate results to their clients.
          </p>
          <div style={styles.grid2}>
            {[
              {
                range: "90-100",
                label: "Excellent",
                color: "#22c55e",
                desc: "Professional-grade design with strong visual hierarchy, full accessibility compliance, and optimized performance. Minor polish opportunities may exist but the design is production-ready.",
              },
              {
                range: "75-89",
                label: "Good",
                color: "#14b8a6",
                desc: "Solid design fundamentals with some areas for improvement. Typically 3-5 actionable recommendations that could each add 2-5 points. Most clients would consider this an acceptable quality level.",
              },
              {
                range: "50-74",
                label: "Needs Improvement",
                color: "#f59e0b",
                desc: "Notable design issues affecting user experience. Usually includes accessibility failures, responsive breakpoint problems, or significant typography/spacing issues. Clear improvement roadmap available.",
              },
              {
                range: "0-49",
                label: "Poor",
                color: "#ef4444",
                desc: "Fundamental design problems present. May include broken layouts, severe accessibility barriers, missing navigation patterns, or performance issues that degrade perceived quality. Requires significant redesign effort.",
              },
            ].map((tier) => (
              <div
                key={tier.range}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${tier.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: tier.color,
                    }}
                  >
                    {tier.range}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: tier.color,
                    }}
                  >
                    {tier.label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Section 7: Technical Specifications ---------- */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={styles.sectionTitle}>Technical Specifications</h2>
          <p style={styles.sectionSub}>
            Key implementation details and constraints for the scoring system.
          </p>
          <div style={styles.grid2}>
            {[
              {
                title: "Analysis Timeout",
                value: "30 seconds",
                detail: "Maximum wall-clock time per URL analysis. Stages 2-4 run in parallel with a 10s individual timeout each.",
              },
              {
                title: "Viewport Widths",
                value: "375 / 768 / 1440 px",
                detail: "Mobile, tablet, and desktop breakpoints tested. Scores are averaged across viewports with mobile weighted 1.2x.",
              },
              {
                title: "Score Precision",
                value: "Integer (0-100)",
                detail: "Sub-criteria produce float scores internally. Category and final scores are rounded to the nearest integer for presentation.",
              },
              {
                title: "Confidence Interval",
                value: "95% (1.96 sigma)",
                detail: "Reported alongside the score. Wider intervals indicate inconsistency across sub-criteria (e.g., great typography but poor accessibility).",
              },
              {
                title: "Rate Limiting",
                value: "10 scans / min / user",
                detail: "Enforced via Redis sliding window. Burst of 3 allowed. Enterprise plans configurable up to 100/min.",
              },
              {
                title: "Result Caching",
                value: "24-hour TTL",
                detail: "Identical URLs return cached results within the TTL window. Cache is keyed on URL + viewport + user-agent.",
              },
            ].map((spec) => (
              <div key={spec.title} style={styles.card}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {spec.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#6366f1",
                    marginBottom: 8,
                  }}
                >
                  {spec.value}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {spec.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: "32px 0",
            borderTop: "1px solid #1e1e2e",
            color: "#475569",
            fontSize: 13,
          }}
        >
          DesignChecker Scoring Framework v1.0 -- Internal Technical Architecture
        </footer>
      </div>
    </div>
  );
}

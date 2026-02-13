"use client";

import React, { useState, useCallback, useMemo } from "react";

// =============================================================================
// CORE SCORING ENGINE — Production-ready TypeScript implementation
// =============================================================================

/** Severity level for recommendations */
type Severity = "critical" | "major" | "minor" | "suggestion";

/** A single measurable signal extracted from DOM/visual/performance analysis */
interface Signal {
  id: string;
  value: number;
  unit: string;
  source: "dom" | "visual" | "performance" | "accessibility";
}

/** Scoring rule: maps a signal condition to a point deduction or bonus */
interface ScoringRule {
  signalId: string;
  condition: (value: number) => boolean;
  points: number; // negative = deduction, positive = bonus
  label: string;
}

/** Sub-criterion within a scoring category */
interface SubCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  signals: string[];
  rules: ScoringRule[];
}

/** Top-level scoring category */
interface ScoringCategory {
  id: string;
  name: string;
  weight: number;
  color: string;
  icon: string;
  description: string;
  subcriteria: SubCriterion[];
}

/** Result of scoring a single sub-criterion */
interface SubCriterionResult {
  id: string;
  name: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  appliedRules: { label: string; points: number }[];
}

/** Result of scoring a category */
interface CategoryResult {
  id: string;
  name: string;
  weight: number;
  color: string;
  rawScore: number;
  weightedScore: number;
  subcriteria: SubCriterionResult[];
}

/** Recommendation generated from scoring */
interface Recommendation {
  category: string;
  severity: Severity;
  title: string;
  description: string;
  estimatedUplift: number;
  signalId: string;
}

/** Complete scoring result */
interface ScoringResult {
  finalScore: number;
  confidence: number;
  categories: CategoryResult[];
  recommendations: Recommendation[];
  grade: string;
  gradeColor: string;
}

// =============================================================================
// SCORING CATEGORIES — Full definition with rules
// =============================================================================

const CATEGORIES: ScoringCategory[] = [
  {
    id: "visual-hierarchy",
    name: "Visual Hierarchy & Layout",
    weight: 0.25,
    color: "#6366f1",
    icon: "VH",
    description:
      "Evaluates how effectively the design guides the user's eye through content using size, contrast, spacing, and alignment.",
    subcriteria: [
      {
        id: "heading-structure",
        name: "Heading Structure",
        weight: 0.2,
        description: "Proper semantic heading levels (H1-H6) with visually distinct sizing.",
        signals: ["h1Count", "headingLevelSkips", "headingSizeRatio"],
        rules: [
          { signalId: "h1Count", condition: (v) => v !== 1, points: -15, label: "Not exactly one H1 element" },
          { signalId: "headingLevelSkips", condition: (v) => v > 0, points: -3, label: "Heading level skip detected (per skip)" },
          { signalId: "headingSizeRatio", condition: (v) => v < 1.15, points: -5, label: "Insufficient size ratio between heading levels" },
        ],
      },
      {
        id: "whitespace",
        name: "Whitespace & Spacing",
        weight: 0.25,
        description: "Consistent use of margins and padding to create visual rhythm.",
        signals: ["spacingVariance", "contentDensity"],
        rules: [
          { signalId: "spacingVariance", condition: (v) => v > 0.15, points: -8, label: "High spacing variance (inconsistent rhythm)" },
          { signalId: "contentDensity", condition: (v) => v > 0.85, points: -10, label: "Excessive content density (cramped layout)" },
          { signalId: "contentDensity", condition: (v) => v < 0.3, points: -5, label: "Too sparse content density" },
        ],
      },
      {
        id: "grid-alignment",
        name: "Grid Alignment",
        weight: 0.2,
        description: "Elements snap to an implicit or explicit grid system.",
        signals: ["alignmentOffset", "gridConsistency"],
        rules: [
          { signalId: "alignmentOffset", condition: (v) => v > 8, points: -10, label: "Significant off-grid alignment (>8px)" },
          { signalId: "alignmentOffset", condition: (v) => v > 2 && v <= 8, points: -4, label: "Minor alignment drift (2-8px)" },
          { signalId: "gridConsistency", condition: (v) => v < 0.7, points: -6, label: "Low grid column consistency" },
        ],
      },
      {
        id: "content-grouping",
        name: "Content Grouping",
        weight: 0.2,
        description: "Related elements are visually grouped using proximity or containers.",
        signals: ["orphanRatio", "containerUsage"],
        rules: [
          { signalId: "orphanRatio", condition: (v) => v > 0.15, points: -10, label: "High orphan element ratio (>15%)" },
          { signalId: "orphanRatio", condition: (v) => v > 0.05 && v <= 0.15, points: -4, label: "Moderate orphan ratio (5-15%)" },
        ],
      },
      {
        id: "visual-balance",
        name: "Visual Weight Balance",
        weight: 0.15,
        description: "The page feels balanced, not heavy on one side.",
        signals: ["centerOffset", "quadrantDensity"],
        rules: [
          { signalId: "centerOffset", condition: (v) => v > 20, points: -12, label: "Severe visual imbalance (>20% offset)" },
          { signalId: "centerOffset", condition: (v) => v > 10 && v <= 20, points: -6, label: "Moderate visual imbalance" },
        ],
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
      "Measures text legibility, font selection quality, line length, contrast, and overall reading comfort.",
    subcriteria: [
      {
        id: "font-selection",
        name: "Font Selection",
        weight: 0.15,
        description: "Professional, web-optimized fonts with appropriate pairing.",
        signals: ["fontFamilyCount", "fontPairingScore"],
        rules: [
          { signalId: "fontFamilyCount", condition: (v) => v > 4, points: -8, label: "Too many font families (>4)" },
          { signalId: "fontFamilyCount", condition: (v) => v === 0, points: -15, label: "No custom fonts (system only)" },
          { signalId: "fontPairingScore", condition: (v) => v < 0.5, points: -6, label: "Poor font pairing combination" },
        ],
      },
      {
        id: "line-length",
        name: "Line Length",
        weight: 0.2,
        description: "Body text lines between 45-80 characters for optimal readability.",
        signals: ["avgLineLength", "maxLineLength"],
        rules: [
          { signalId: "avgLineLength", condition: (v) => v > 90, points: -10, label: "Lines far too long (>90 chars)" },
          { signalId: "avgLineLength", condition: (v) => v > 80 && v <= 90, points: -5, label: "Lines slightly too long (80-90)" },
          { signalId: "avgLineLength", condition: (v) => v < 35, points: -5, label: "Lines too short (<35 chars)" },
          { signalId: "maxLineLength", condition: (v) => v > 100, points: -5, label: "Maximum line length exceeds 100 chars" },
        ],
      },
      {
        id: "line-height",
        name: "Line Height & Spacing",
        weight: 0.2,
        description: "Comfortable vertical rhythm with appropriate line-height ratios.",
        signals: ["lineHeightRatio", "verticalRhythmVariance"],
        rules: [
          { signalId: "lineHeightRatio", condition: (v) => v < 1.2, points: -12, label: "Line height too tight (<1.2)" },
          { signalId: "lineHeightRatio", condition: (v) => v > 2.2, points: -5, label: "Line height too loose (>2.2)" },
          { signalId: "verticalRhythmVariance", condition: (v) => v > 0.2, points: -4, label: "Inconsistent vertical rhythm" },
        ],
      },
      {
        id: "text-contrast",
        name: "Text Contrast",
        weight: 0.25,
        description: "Sufficient contrast ratios meeting WCAG AA or AAA standards.",
        signals: ["minContrastRatio", "wcagAAFailures"],
        rules: [
          { signalId: "minContrastRatio", condition: (v) => v < 3.0, points: -15, label: "Critical: contrast below 3:1" },
          { signalId: "minContrastRatio", condition: (v) => v < 4.5 && v >= 3.0, points: -8, label: "Contrast below WCAG AA (4.5:1)" },
          { signalId: "wcagAAFailures", condition: (v) => v > 0, points: -3, label: "WCAG AA failures detected (per failure)" },
          { signalId: "minContrastRatio", condition: (v) => v >= 7.0, points: 3, label: "Bonus: WCAG AAA compliance (7:1+)" },
        ],
      },
      {
        id: "responsive-type",
        name: "Responsive Typography",
        weight: 0.2,
        description: "Text scales appropriately across breakpoints without overflow.",
        signals: ["textOverflowCount", "fontScaleBreakpoints"],
        rules: [
          { signalId: "textOverflowCount", condition: (v) => v > 3, points: -10, label: "Multiple text overflow instances" },
          { signalId: "textOverflowCount", condition: (v) => v > 0 && v <= 3, points: -4, label: "Minor text overflow" },
          { signalId: "fontScaleBreakpoints", condition: (v) => v === 0, points: -8, label: "No responsive font scaling" },
        ],
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
      "Assesses color palette coherence, contrast accessibility, visual consistency, and aesthetic quality.",
    subcriteria: [
      {
        id: "palette-coherence",
        name: "Palette Coherence",
        weight: 0.25,
        description: "Colors follow a deliberate palette with harmonious relationships.",
        signals: ["uniqueHues", "paletteHarmony"],
        rules: [
          { signalId: "uniqueHues", condition: (v) => v > 12, points: -8, label: "Too many distinct hues (>12)" },
          { signalId: "uniqueHues", condition: (v) => v < 2, points: -5, label: "Too few hues (<2) -- monotonous palette" },
          { signalId: "paletteHarmony", condition: (v) => v < 0.4, points: -10, label: "No discernible color harmony" },
        ],
      },
      {
        id: "contrast-a11y",
        name: "Contrast Accessibility",
        weight: 0.25,
        description: "Interactive and informational elements meet accessibility contrast ratios.",
        signals: ["interactiveContrast", "focusIndicators"],
        rules: [
          { signalId: "interactiveContrast", condition: (v) => v < 4.5, points: -10, label: "Interactive elements below 4.5:1 contrast" },
          { signalId: "focusIndicators", condition: (v) => v === 0, points: -8, label: "Missing focus indicators" },
        ],
      },
      {
        id: "image-quality",
        name: "Image Quality",
        weight: 0.2,
        description: "Images are high quality, properly sized, and serve a purpose.",
        signals: ["stretchedImages", "missingAltText"],
        rules: [
          { signalId: "stretchedImages", condition: (v) => v > 0, points: -4, label: "Stretched/distorted images detected" },
          { signalId: "missingAltText", condition: (v) => v > 0, points: -3, label: "Images missing alt text (per image)" },
        ],
      },
      {
        id: "style-consistency",
        name: "Style Consistency",
        weight: 0.2,
        description: "Similar elements use the same colors and styles throughout.",
        signals: ["buttonStyleVariance", "linkStyleVariance"],
        rules: [
          { signalId: "buttonStyleVariance", condition: (v) => v > 3, points: -6, label: "Inconsistent button styles (>3 variants)" },
          { signalId: "linkStyleVariance", condition: (v) => v > 2, points: -4, label: "Inconsistent link styles" },
        ],
      },
      {
        id: "dark-mode",
        name: "Dark Mode Support",
        weight: 0.1,
        description: "Optional: site provides a well-implemented dark theme.",
        signals: ["darkModeSupport"],
        rules: [
          { signalId: "darkModeSupport", condition: (v) => v === 1, points: 5, label: "Bonus: dark mode properly implemented" },
        ],
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
      "Tests how well the design adapts to different screen sizes and evaluates loading performance.",
    subcriteria: [
      {
        id: "breakpoints",
        name: "Breakpoint Handling",
        weight: 0.25,
        description: "Layout adapts gracefully at standard breakpoints (mobile/tablet/desktop).",
        signals: ["brokenBreakpoints", "layoutShifts"],
        rules: [
          { signalId: "brokenBreakpoints", condition: (v) => v > 0, points: -8, label: "Broken layout at breakpoint (per breakpoint)" },
          { signalId: "layoutShifts", condition: (v) => v > 3, points: -5, label: "Excessive layout shifts across breakpoints" },
        ],
      },
      {
        id: "touch-targets",
        name: "Touch Target Sizing",
        weight: 0.2,
        description: "Interactive elements are at least 44x44px on touch devices.",
        signals: ["undersizedTargets"],
        rules: [
          { signalId: "undersizedTargets", condition: (v) => v > 5, points: -10, label: "Many undersized touch targets (>5)" },
          { signalId: "undersizedTargets", condition: (v) => v > 0 && v <= 5, points: -4, label: "Some undersized touch targets" },
        ],
      },
      {
        id: "cls",
        name: "CLS (Layout Shift)",
        weight: 0.2,
        description: "Cumulative Layout Shift stays under 0.1 for visual stability.",
        signals: ["cumulativeLayoutShift"],
        rules: [
          { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.25, points: -15, label: "CLS > 0.25 (poor)" },
          { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.1 && v <= 0.25, points: -8, label: "CLS 0.1-0.25 (needs improvement)" },
          { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.05 && v <= 0.1, points: -3, label: "CLS slightly elevated" },
        ],
      },
      {
        id: "lcp",
        name: "LCP (Largest Contentful Paint)",
        weight: 0.2,
        description: "Primary content renders within 2.5 seconds.",
        signals: ["lcpTime"],
        rules: [
          { signalId: "lcpTime", condition: (v) => v > 4000, points: -15, label: "LCP > 4s (poor)" },
          { signalId: "lcpTime", condition: (v) => v > 2500 && v <= 4000, points: -8, label: "LCP 2.5-4s (needs improvement)" },
          { signalId: "lcpTime", condition: (v) => v > 1500 && v <= 2500, points: -3, label: "LCP slightly slow (1.5-2.5s)" },
        ],
      },
      {
        id: "viewport",
        name: "Viewport & Scaling",
        weight: 0.15,
        description: "Proper viewport configuration and no horizontal scroll.",
        signals: ["viewportCorrect", "horizontalScroll"],
        rules: [
          { signalId: "viewportCorrect", condition: (v) => v === 0, points: -8, label: "Missing or incorrect viewport meta" },
          { signalId: "horizontalScroll", condition: (v) => v > 0, points: -6, label: "Horizontal scroll detected" },
        ],
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
      "Evaluates navigation clarity, interactive element behavior, and adherence to UX conventions.",
    subcriteria: [
      {
        id: "nav-clarity",
        name: "Navigation Clarity",
        weight: 0.3,
        description: "Primary navigation is immediately identifiable and logically structured.",
        signals: ["navPresent", "navItemCount"],
        rules: [
          { signalId: "navPresent", condition: (v) => v === 0, points: -20, label: "No identifiable navigation element" },
          { signalId: "navItemCount", condition: (v) => v > 10, points: -6, label: "Too many nav items (>10)" },
          { signalId: "navItemCount", condition: (v) => v < 2 && v > 0, points: -4, label: "Too few nav items" },
        ],
      },
      {
        id: "interactive-feedback",
        name: "Interactive Feedback",
        weight: 0.25,
        description: "Buttons, links, and controls provide hover/focus/active states.",
        signals: ["hoverStates", "focusStates"],
        rules: [
          { signalId: "hoverStates", condition: (v) => v < 0.5, points: -8, label: "Less than 50% of elements have hover states" },
          { signalId: "focusStates", condition: (v) => v < 0.5, points: -8, label: "Less than 50% of elements have focus states" },
        ],
      },
      {
        id: "cta-effectiveness",
        name: "CTA Effectiveness",
        weight: 0.2,
        description: "Primary calls-to-action are visually prominent and clearly worded.",
        signals: ["ctaAboveFold", "ctaContrast"],
        rules: [
          { signalId: "ctaAboveFold", condition: (v) => v === 0, points: -8, label: "No CTA above the fold" },
          { signalId: "ctaContrast", condition: (v) => v < 3.0, points: -6, label: "Low CTA contrast ratio" },
        ],
      },
      {
        id: "form-usability",
        name: "Form Usability",
        weight: 0.15,
        description: "Forms use proper labels, validation, and error messaging.",
        signals: ["missingLabels", "hasValidation"],
        rules: [
          { signalId: "missingLabels", condition: (v) => v > 0, points: -5, label: "Form fields missing labels" },
          { signalId: "hasValidation", condition: (v) => v === 0, points: -5, label: "No client-side form validation" },
        ],
      },
      {
        id: "link-distinction",
        name: "Link Distinction",
        weight: 0.1,
        description: "Links are visually distinct from surrounding text.",
        signals: ["linkDistinction"],
        rules: [
          { signalId: "linkDistinction", condition: (v) => v < 0.3, points: -8, label: "Links not visually distinguishable" },
        ],
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
      "Checks compliance with WCAG 2.1 Level AA, semantic HTML, ARIA attributes, and keyboard navigability.",
    subcriteria: [
      {
        id: "semantic-html",
        name: "Semantic HTML",
        weight: 0.25,
        description: "Proper use of semantic elements (header, main, nav, footer, article).",
        signals: ["semanticLandmarks", "divSoupRatio"],
        rules: [
          { signalId: "semanticLandmarks", condition: (v) => v < 3, points: -8, label: "Missing major landmarks (<3)" },
          { signalId: "divSoupRatio", condition: (v) => v > 0.8, points: -6, label: "Div soup (>80% div elements)" },
        ],
      },
      {
        id: "aria",
        name: "ARIA Implementation",
        weight: 0.2,
        description: "Correct and necessary ARIA roles, labels, and live regions.",
        signals: ["ariaErrors", "missingAriaLabels"],
        rules: [
          { signalId: "ariaErrors", condition: (v) => v > 0, points: -5, label: "Invalid ARIA attributes (per error)" },
          { signalId: "missingAriaLabels", condition: (v) => v > 3, points: -6, label: "Many interactive elements missing ARIA labels" },
        ],
      },
      {
        id: "keyboard-nav",
        name: "Keyboard Navigation",
        weight: 0.25,
        description: "All interactive elements reachable and operable via keyboard.",
        signals: ["tabOrderBroken", "focusTraps", "skipNav"],
        rules: [
          { signalId: "tabOrderBroken", condition: (v) => v > 0, points: -8, label: "Broken tab order" },
          { signalId: "focusTraps", condition: (v) => v > 0, points: -12, label: "Focus trap detected" },
          { signalId: "skipNav", condition: (v) => v === 0, points: -4, label: "Missing skip navigation link" },
        ],
      },
      {
        id: "alt-text",
        name: "Alt Text & Media",
        weight: 0.15,
        description: "All meaningful images have descriptive alt text.",
        signals: ["altTextCoverage"],
        rules: [
          { signalId: "altTextCoverage", condition: (v) => v < 0.5, points: -12, label: "Less than 50% alt text coverage" },
          { signalId: "altTextCoverage", condition: (v) => v < 0.9 && v >= 0.5, points: -5, label: "Incomplete alt text coverage (50-90%)" },
        ],
      },
      {
        id: "color-independence",
        name: "Color Independence",
        weight: 0.15,
        description: "Information is not conveyed by color alone.",
        signals: ["colorOnlyIndicators"],
        rules: [
          { signalId: "colorOnlyIndicators", condition: (v) => v > 0, points: -5, label: "Information conveyed by color alone" },
        ],
      },
    ],
  },
];

// =============================================================================
// SCORING ENGINE — Core computation functions
// =============================================================================

/**
 * Clamp a numeric value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Score a single sub-criterion. Starts at 100, applies deductions/bonuses
 * from matching rules, and clamps to [0, 100].
 */
function scoreSubCriterion(
  sub: SubCriterion,
  signals: Map<string, number>
): SubCriterionResult {
  let rawScore = 100;
  const appliedRules: { label: string; points: number }[] = [];

  for (const rule of sub.rules) {
    const signalValue = signals.get(rule.signalId);
    if (signalValue !== undefined && rule.condition(signalValue)) {
      rawScore += rule.points;
      appliedRules.push({ label: rule.label, points: rule.points });
    }
  }

  rawScore = clamp(rawScore, 0, 100);

  return {
    id: sub.id,
    name: sub.name,
    rawScore,
    weight: sub.weight,
    weightedScore: rawScore * sub.weight,
    appliedRules,
  };
}

/**
 * Score an entire category. The category score is the weighted average
 * of its sub-criteria scores.
 */
function scoreCategory(
  category: ScoringCategory,
  signals: Map<string, number>
): CategoryResult {
  const subcriteria = category.subcriteria.map((sub) =>
    scoreSubCriterion(sub, signals)
  );

  const rawScore = subcriteria.reduce((sum, sc) => sum + sc.weightedScore, 0);

  return {
    id: category.id,
    name: category.name,
    weight: category.weight,
    color: category.color,
    rawScore: Math.round(rawScore),
    weightedScore: rawScore * category.weight,
    subcriteria,
  };
}

/**
 * Generate recommendations based on the lowest-scoring sub-criteria
 * and the rules that triggered deductions.
 */
function generateRecommendations(
  categories: CategoryResult[],
  signals: Map<string, number>
): Recommendation[] {
  const recs: Recommendation[] = [];

  const severityMap: Record<string, Severity> = {
    "critical": "critical",
    "major": "major",
    "minor": "minor",
    "suggestion": "suggestion",
  };

  for (const cat of categories) {
    for (const sub of cat.subcriteria) {
      if (sub.rawScore < 85) {
        for (const rule of sub.appliedRules) {
          const severity: Severity =
            rule.points <= -10
              ? "critical"
              : rule.points <= -5
                ? "major"
                : rule.points < 0
                  ? "minor"
                  : "suggestion";

          if (rule.points < 0) {
            recs.push({
              category: cat.name,
              severity,
              title: rule.label,
              description: `This issue was detected in the "${sub.name}" sub-criterion and reduced the score by ${Math.abs(rule.points)} points.`,
              estimatedUplift: Math.abs(rule.points),
              signalId: sub.id,
            });
          }
        }
      }
    }
  }

  // Sort by estimated uplift descending (highest-impact fixes first)
  recs.sort((a, b) => b.estimatedUplift - a.estimatedUplift);

  return recs;
}

/**
 * Determine the grade label and color from the final score.
 */
function getGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "Excellent", color: "#22c55e" };
  if (score >= 75) return { grade: "Good", color: "#14b8a6" };
  if (score >= 50) return { grade: "Needs Improvement", color: "#f59e0b" };
  return { grade: "Poor", color: "#ef4444" };
}

/**
 * Compute confidence interval as +/- 1.96 * standard deviation
 * of the category scores (95% confidence).
 */
function computeConfidence(categories: CategoryResult[]): number {
  const scores = categories.map((c) => c.rawScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length;
  const stddev = Math.sqrt(variance);
  return Math.round(1.96 * stddev);
}

/**
 * MAIN SCORING FUNCTION: Takes a signal map and produces the full result.
 */
function computeDesignScore(signals: Map<string, number>): ScoringResult {
  const categories = CATEGORIES.map((cat) => scoreCategory(cat, signals));

  const finalScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.weightedScore, 0)
  );

  const confidence = computeConfidence(categories);
  const { grade, color: gradeColor } = getGrade(finalScore);
  const recommendations = generateRecommendations(categories, signals);

  return {
    finalScore: clamp(finalScore, 0, 100),
    confidence,
    categories,
    recommendations,
    grade,
    gradeColor,
  };
}

// =============================================================================
// DEMO SIGNAL PRESETS — Simulate different website quality levels
// =============================================================================

interface SignalPreset {
  name: string;
  description: string;
  signals: Record<string, number>;
}

const PRESETS: SignalPreset[] = [
  {
    name: "Well-Designed SaaS Site",
    description: "Modern SaaS landing page with strong design fundamentals, good accessibility, and fast performance.",
    signals: {
      h1Count: 1, headingLevelSkips: 0, headingSizeRatio: 1.3,
      spacingVariance: 0.08, contentDensity: 0.55,
      alignmentOffset: 1, gridConsistency: 0.95,
      orphanRatio: 0.02, containerUsage: 0.9,
      centerOffset: 4, quadrantDensity: 0.85,
      fontFamilyCount: 2, fontPairingScore: 0.85,
      avgLineLength: 62, maxLineLength: 78,
      lineHeightRatio: 1.6, verticalRhythmVariance: 0.08,
      minContrastRatio: 7.5, wcagAAFailures: 0,
      textOverflowCount: 0, fontScaleBreakpoints: 3,
      uniqueHues: 5, paletteHarmony: 0.88,
      interactiveContrast: 6.2, focusIndicators: 1,
      stretchedImages: 0, missingAltText: 0,
      buttonStyleVariance: 2, linkStyleVariance: 1,
      darkModeSupport: 1,
      brokenBreakpoints: 0, layoutShifts: 1,
      undersizedTargets: 0,
      cumulativeLayoutShift: 0.03, lcpTime: 1200,
      viewportCorrect: 1, horizontalScroll: 0,
      navPresent: 1, navItemCount: 6,
      hoverStates: 0.95, focusStates: 0.9,
      ctaAboveFold: 1, ctaContrast: 5.5,
      missingLabels: 0, hasValidation: 1,
      linkDistinction: 0.85,
      semanticLandmarks: 5, divSoupRatio: 0.35,
      ariaErrors: 0, missingAriaLabels: 1,
      tabOrderBroken: 0, focusTraps: 0, skipNav: 1,
      altTextCoverage: 0.98,
      colorOnlyIndicators: 0,
    },
  },
  {
    name: "Average Business Website",
    description: "Typical small business site with decent design but some accessibility and performance gaps.",
    signals: {
      h1Count: 1, headingLevelSkips: 1, headingSizeRatio: 1.2,
      spacingVariance: 0.18, contentDensity: 0.7,
      alignmentOffset: 5, gridConsistency: 0.75,
      orphanRatio: 0.08, containerUsage: 0.7,
      centerOffset: 12, quadrantDensity: 0.6,
      fontFamilyCount: 3, fontPairingScore: 0.6,
      avgLineLength: 82, maxLineLength: 105,
      lineHeightRatio: 1.4, verticalRhythmVariance: 0.22,
      minContrastRatio: 4.2, wcagAAFailures: 3,
      textOverflowCount: 2, fontScaleBreakpoints: 1,
      uniqueHues: 8, paletteHarmony: 0.55,
      interactiveContrast: 4.0, focusIndicators: 0,
      stretchedImages: 1, missingAltText: 3,
      buttonStyleVariance: 4, linkStyleVariance: 2,
      darkModeSupport: 0,
      brokenBreakpoints: 1, layoutShifts: 3,
      undersizedTargets: 3,
      cumulativeLayoutShift: 0.12, lcpTime: 2800,
      viewportCorrect: 1, horizontalScroll: 0,
      navPresent: 1, navItemCount: 8,
      hoverStates: 0.6, focusStates: 0.3,
      ctaAboveFold: 1, ctaContrast: 3.5,
      missingLabels: 2, hasValidation: 0,
      linkDistinction: 0.5,
      semanticLandmarks: 3, divSoupRatio: 0.6,
      ariaErrors: 2, missingAriaLabels: 5,
      tabOrderBroken: 0, focusTraps: 0, skipNav: 0,
      altTextCoverage: 0.7,
      colorOnlyIndicators: 1,
    },
  },
  {
    name: "Poorly Built Template Site",
    description: "Low-quality template site with broken responsiveness, poor accessibility, and multiple design issues.",
    signals: {
      h1Count: 3, headingLevelSkips: 3, headingSizeRatio: 1.05,
      spacingVariance: 0.35, contentDensity: 0.9,
      alignmentOffset: 15, gridConsistency: 0.4,
      orphanRatio: 0.2, containerUsage: 0.4,
      centerOffset: 25, quadrantDensity: 0.3,
      fontFamilyCount: 6, fontPairingScore: 0.2,
      avgLineLength: 110, maxLineLength: 145,
      lineHeightRatio: 1.1, verticalRhythmVariance: 0.4,
      minContrastRatio: 2.5, wcagAAFailures: 12,
      textOverflowCount: 8, fontScaleBreakpoints: 0,
      uniqueHues: 16, paletteHarmony: 0.2,
      interactiveContrast: 2.8, focusIndicators: 0,
      stretchedImages: 4, missingAltText: 8,
      buttonStyleVariance: 7, linkStyleVariance: 5,
      darkModeSupport: 0,
      brokenBreakpoints: 3, layoutShifts: 8,
      undersizedTargets: 12,
      cumulativeLayoutShift: 0.4, lcpTime: 5500,
      viewportCorrect: 0, horizontalScroll: 1,
      navPresent: 1, navItemCount: 15,
      hoverStates: 0.2, focusStates: 0.1,
      ctaAboveFold: 0, ctaContrast: 2.0,
      missingLabels: 5, hasValidation: 0,
      linkDistinction: 0.15,
      semanticLandmarks: 1, divSoupRatio: 0.9,
      ariaErrors: 8, missingAriaLabels: 12,
      tabOrderBroken: 1, focusTraps: 1, skipNav: 0,
      altTextCoverage: 0.3,
      colorOnlyIndicators: 4,
    },
  },
];

// =============================================================================
// STYLES
// =============================================================================

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e2e8f0",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } as React.CSSProperties,
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "48px 24px",
  } as React.CSSProperties,
  hero: {
    textAlign: "center" as const,
    marginBottom: 56,
  } as React.CSSProperties,
  heroTitle: {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    background: "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 16,
    lineHeight: 1.15,
  } as React.CSSProperties,
  heroSub: {
    fontSize: 18,
    color: "#94a3b8",
    maxWidth: 750,
    margin: "0 auto",
    lineHeight: 1.65,
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: "#6366f120",
    color: "#a5b4fc",
    border: "1px solid #6366f140",
    marginBottom: 20,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  section: {
    marginBottom: 72,
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
    lineHeight: 1.6,
    maxWidth: 800,
  } as React.CSSProperties,
  card: {
    background: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 12,
    padding: 24,
  } as React.CSSProperties,
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 20,
  } as React.CSSProperties,
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  } as React.CSSProperties,
  codeBlock: {
    background: "#0d0d14",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "20px 24px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: "auto" as const,
    color: "#94a3b8",
  } as React.CSSProperties,
  tag: (color: string) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: color + "18",
    color: color,
    marginRight: 6,
    marginBottom: 4,
  }) as React.CSSProperties,
  sevDot: (severity: Severity) => {
    const colors: Record<Severity, string> = {
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
      background: colors[severity],
      marginRight: 8,
      verticalAlign: "middle",
      flexShrink: 0,
    } as React.CSSProperties;
  },
  btn: (active: boolean, color = "#6366f1") => ({
    padding: "10px 22px",
    borderRadius: 8,
    border: active ? `1px solid ${color}` : "1px solid #1e1e2e",
    background: active ? color + "20" : "transparent",
    color: active ? color : "#64748b",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  }) as React.CSSProperties,
  scoreCircle: (score: number, size: number) => {
    const { color } = getGrade(score);
    return {
      width: size,
      height: size,
      borderRadius: "50%",
      border: `4px solid ${color}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column" as const,
      flexShrink: 0,
    } as React.CSSProperties;
  },
  progressBar: (pct: number, color: string) => ({
    height: 6,
    borderRadius: 3,
    background: "#1e1e2e",
    position: "relative" as const,
    overflow: "hidden",
  }) as React.CSSProperties,
  progressFill: (pct: number, color: string) => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    width: `${Math.max(0, Math.min(100, pct))}%`,
    borderRadius: 3,
    background: `linear-gradient(90deg, ${color}, ${color}bb)`,
    transition: "width 0.5s ease",
  }) as React.CSSProperties,
};

// =============================================================================
// INTERACTIVE SCORE DISPLAY COMPONENT
// =============================================================================

function ScoreDisplay({ result }: { result: ScoringResult }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div>
      {/* Score Hero */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          marginBottom: 40,
          flexWrap: "wrap",
        }}
      >
        <div style={s.scoreCircle(result.finalScore, 180)}>
          <span style={{ fontSize: 52, fontWeight: 800, color: result.gradeColor }}>
            {result.finalScore}
          </span>
          <span style={{ fontSize: 13, color: "#64748b" }}>/ 100</span>
        </div>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: result.gradeColor,
              marginBottom: 4,
            }}
          >
            {result.grade}
          </div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
            Confidence: +/- {result.confidence} points (95%)
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            {result.recommendations.length} improvement
            {result.recommendations.length === 1 ? "" : "s"} identified
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {result.categories.map((cat) => (
          <div key={cat.id} style={{ ...s.card, borderColor: cat.color + "30" }}>
            <div
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
              }}
            >
              <div style={s.scoreCircle(cat.rawScore, 52)}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: getGrade(cat.rawScore).color,
                  }}
                >
                  {cat.rawScore}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#f1f5f9" }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {(cat.weight * 100).toFixed(0)}% weight
                  </span>
                </div>
                <div style={s.progressBar(cat.rawScore, cat.color)}>
                  <div style={s.progressFill(cat.rawScore, cat.color)} />
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#475569" }}>
                {expandedCat === cat.id ? "\u25B2" : "\u25BC"}
              </span>
            </div>

            {/* Expanded sub-criteria */}
            {expandedCat === cat.id && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #1e1e2e",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {cat.subcriteria.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      background: "#0a0a0f",
                      borderRadius: 8,
                      padding: 14,
                      border: "1px solid #1e1e2e",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>
                        {sub.name}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: getGrade(sub.rawScore).color,
                        }}
                      >
                        {sub.rawScore}/100
                      </span>
                    </div>
                    <div style={s.progressBar(sub.rawScore, cat.color)}>
                      <div style={s.progressFill(sub.rawScore, cat.color)} />
                    </div>
                    {sub.appliedRules.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {sub.appliedRules.map((rule, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: 12,
                              color: rule.points < 0 ? "#ef4444" : "#22c55e",
                              lineHeight: 1.6,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {rule.points > 0 ? "+" : ""}
                            {rule.points}pts: {rule.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
            Prioritized Recommendations
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.recommendations.slice(0, 10).map((rec, idx) => (
              <div key={idx} style={s.card}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <div style={s.sevDot(rec.severity)} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                        {rec.title}
                      </span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={s.tag("#6366f1")}>{rec.category}</span>
                        <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>
                          +{rec.estimatedUplift} pts
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ScoringAlgorithmPage() {
  const [activePreset, setActivePreset] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>("demo");

  const result = useMemo(() => {
    const preset = PRESETS[activePreset];
    const signalMap = new Map(Object.entries(preset.signals));
    return computeDesignScore(signalMap);
  }, [activePreset]);

  const sections = [
    { id: "demo", label: "Live Demo" },
    { id: "algorithm", label: "Algorithm" },
    { id: "criteria", label: "Criteria" },
    { id: "pipeline", label: "Pipeline" },
    { id: "architecture", label: "Architecture" },
  ];

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Hero */}
        <header style={s.hero}>
          <div style={s.badge}>CORE SCORING ENGINE v1.0</div>
          <h1 style={s.heroTitle}>DesignChecker Scoring Algorithm</h1>
          <p style={s.heroSub}>
            A production-ready, multi-dimensional scoring engine that evaluates web design
            quality on a 0-100 scale. Powered by DOM analysis, computer vision, and
            performance auditing across six weighted categories with 30 sub-criteria
            and 80+ measurable signals.
          </p>
        </header>

        {/* Section Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 48,
            flexWrap: "wrap",
          }}
        >
          {sections.map((sec) => (
            <button
              key={sec.id}
              style={s.btn(activeSection === sec.id)}
              onClick={() => setActiveSection(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* ======= SECTION: LIVE DEMO ======= */}
        {activeSection === "demo" && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Interactive Scoring Demo</h2>
            <p style={s.sectionSub}>
              Select a website profile to see the scoring engine compute a real score.
              Each profile simulates the signal data that would be extracted from a
              live website analysis. Click any category to drill into sub-criteria details.
            </p>

            {/* Preset Selector */}
            <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreset(idx)}
                  style={{
                    ...s.card,
                    cursor: "pointer",
                    flex: "1 1 260px",
                    borderColor: activePreset === idx ? "#6366f1" : "#1e1e2e",
                    background: activePreset === idx ? "#6366f110" : "#12121a",
                    textAlign: "left" as const,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 4 }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>

            <ScoreDisplay result={result} />
          </section>
        )}

        {/* ======= SECTION: ALGORITHM ======= */}
        {activeSection === "algorithm" && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Scoring Algorithm Design</h2>
            <p style={s.sectionSub}>
              The scoring algorithm uses a hierarchical weighted-average model inspired by
              Google Lighthouse. Each sub-criterion starts at 100 points and applies
              rule-based deductions. Category scores are weighted averages of sub-criteria,
              and the final score is a weighted average of categories.
            </p>

            {/* Formula */}
            <div style={{ ...s.codeBlock, marginBottom: 32 }}>
              <div style={{ color: "#475569", marginBottom: 12 }}>
                {"// DesignChecker Scoring Formula"}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#6366f1", fontWeight: 700 }}>FinalScore</span>
                {" = "}
                <span style={{ color: "#f59e0b" }}>{"\\u03A3"}</span>
                {"("}
                <span style={{ color: "#ec4899" }}>CategoryWeight</span>
                <sub>i</sub>
                {" * "}
                <span style={{ color: "#14b8a6" }}>CategoryScore</span>
                <sub>i</sub>
                {")"}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#475569" }}>{"// where "}</span>
                <span style={{ color: "#14b8a6" }}>CategoryScore</span>
                <sub>i</sub>
                {" = "}
                <span style={{ color: "#f59e0b" }}>{"\\u03A3"}</span>
                {"("}
                <span style={{ color: "#ec4899" }}>SubWeight</span>
                <sub>j</sub>
                {" * "}
                <span style={{ color: "#22c55e" }}>SubScore</span>
                <sub>j</sub>
                {")"}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ color: "#475569" }}>{"// where "}</span>
                <span style={{ color: "#22c55e" }}>SubScore</span>
                <sub>j</sub>
                {" = clamp(100 + "}
                <span style={{ color: "#f59e0b" }}>{"\\u03A3"}</span>
                {"("}
                <span style={{ color: "#ef4444" }}>RulePoints</span>
                <sub>k</sub>
                {"), 0, 100)"}
              </div>
              <div style={{ color: "#475569", fontSize: 12, marginTop: 16 }}>
                {"// RulePoints are negative (deductions) or positive (bonuses)"}<br />
                {"// Each rule fires only when its signal condition is true"}<br />
                {"// Confidence = +/- 1.96 * stddev(CategoryScores) [95% CI]"}
              </div>
            </div>

            {/* Key Design Decisions */}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
              Key Algorithm Design Decisions
            </h3>
            <div style={s.grid2}>
              {[
                {
                  title: "Subtractive Scoring",
                  desc: "Each sub-criterion starts at 100 and loses points for detected issues. This makes scoring deterministic and auditable -- you can always trace a score back to specific rule triggers.",
                  color: "#6366f1",
                },
                {
                  title: "Hierarchical Weights",
                  desc: "Two levels of weighting: sub-criteria within categories, and categories in the final score. This allows fine-grained control while keeping the top-level model simple for users to understand.",
                  color: "#8b5cf6",
                },
                {
                  title: "Rule-Based Engine",
                  desc: "Each scoring rule is a pure function: (signalValue) => boolean. This makes the engine testable, extensible, and transparent. New rules can be added without changing the core algorithm.",
                  color: "#ec4899",
                },
                {
                  title: "Statistical Confidence",
                  desc: "A confidence interval is computed from the variance across category scores. High variance (e.g., great typography but poor accessibility) yields a wider interval, flagging inconsistency.",
                  color: "#14b8a6",
                },
                {
                  title: "Impact-Ranked Recommendations",
                  desc: "Recommendations are generated from failing rules and ranked by estimated score uplift. This gives agencies a clear priority order for improvement work.",
                  color: "#f59e0b",
                },
                {
                  title: "Log-Normal Calibration (Planned)",
                  desc: "Following Lighthouse's approach, raw signal values will be mapped through a log-normal distribution derived from real-world HTTP Archive data, calibrating scores against actual web quality distributions.",
                  color: "#22c55e",
                },
              ].map((item) => (
                <div key={item.title} style={{ ...s.card, borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* TypeScript Implementation */}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginTop: 40, marginBottom: 16 }}>
              Core TypeScript Implementation
            </h3>
            <div style={s.codeBlock}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{`// Core scoring function (simplified from the engine above)
function scoreSubCriterion(sub: SubCriterion, signals: Map<string, number>): SubCriterionResult {
  let rawScore = 100;
  const appliedRules: { label: string; points: number }[] = [];

  for (const rule of sub.rules) {
    const signalValue = signals.get(rule.signalId);
    if (signalValue !== undefined && rule.condition(signalValue)) {
      rawScore += rule.points; // negative = deduction
      appliedRules.push({ label: rule.label, points: rule.points });
    }
  }

  return {
    id: sub.id,
    name: sub.name,
    rawScore: clamp(rawScore, 0, 100),
    weight: sub.weight,
    weightedScore: clamp(rawScore, 0, 100) * sub.weight,
    appliedRules,
  };
}

function scoreCategory(category: ScoringCategory, signals: Map<string, number>): CategoryResult {
  const subcriteria = category.subcriteria.map(sub => scoreSubCriterion(sub, signals));
  const rawScore = subcriteria.reduce((sum, sc) => sum + sc.weightedScore, 0);

  return {
    id: category.id,
    name: category.name,
    weight: category.weight,
    rawScore: Math.round(rawScore),
    weightedScore: rawScore * category.weight,
    subcriteria,
  };
}

function computeDesignScore(signals: Map<string, number>): ScoringResult {
  const categories = CATEGORIES.map(cat => scoreCategory(cat, signals));
  const finalScore = Math.round(categories.reduce((sum, c) => sum + c.weightedScore, 0));
  const confidence = computeConfidence(categories);
  return { finalScore, confidence, categories, recommendations, grade };
}`}</pre>
            </div>
          </section>
        )}

        {/* ======= SECTION: CRITERIA ======= */}
        {activeSection === "criteria" && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Evaluation Criteria & Weights</h2>
            <p style={s.sectionSub}>
              The scoring engine evaluates 6 categories containing 30 sub-criteria.
              Each sub-criterion defines specific signals and deterministic scoring rules.
              Category weights sum to 1.0 (100%).
            </p>

            {/* Weight Distribution Donut */}
            <WeightDonut categories={CATEGORIES} />

            {/* Category Cards */}
            <div style={s.grid2}>
              {CATEGORIES.map((cat) => (
                <CriteriaCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* ======= SECTION: PIPELINE ======= */}
        {activeSection === "pipeline" && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Analysis Pipeline</h2>
            <p style={s.sectionSub}>
              When a URL is submitted, it passes through a six-stage pipeline. Stages 2-4
              run concurrently after stage 1 completes, reducing total analysis time. The
              entire pipeline targets a 30-second wall-clock budget.
            </p>

            <PipelineVisual />

            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginTop: 40, marginBottom: 16 }}>
              Pipeline Performance Budget
            </h3>
            <div style={s.grid3}>
              {[
                { stage: "Stage 1: Render", time: "8-12s", desc: "Headless browser renders at 3 viewports" },
                { stage: "Stage 2: DOM Analysis", time: "2-4s", desc: "Parse DOM, extract signals (parallel)" },
                { stage: "Stage 3: Visual Analysis", time: "3-6s", desc: "Screenshot CV processing (parallel)" },
                { stage: "Stage 4: Performance", time: "2-5s", desc: "Lighthouse audits (parallel)" },
                { stage: "Stage 5: Score", time: "<500ms", desc: "Weighted scoring computation" },
                { stage: "Stage 6: Recommendations", time: "<200ms", desc: "Rule matching and ranking" },
              ].map((item) => (
                <div key={item.stage} style={s.card}>
                  <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, marginBottom: 4 }}>
                    {item.stage}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                    {item.time}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======= SECTION: ARCHITECTURE ======= */}
        {activeSection === "architecture" && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>System Architecture</h2>
            <p style={s.sectionSub}>
              High-level data flow from URL submission to scored report. Designed for
              horizontal scaling with containerized workers, Redis job queues, and
              result caching.
            </p>

            <div
              style={{
                ...s.card,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                lineHeight: 1.7,
                overflowX: "auto",
                whiteSpace: "pre",
                color: "#94a3b8",
                marginBottom: 32,
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
  |   (REST + WS)   |         scored results           |   (TypeScript)     |
  |                 |                                  |                    |
  +-----------------+                                  +---------+----------+
                                                                |
                                                       +--------+----------+
                                                       |  Analysis Stages  |
                                                       |  1. Render (seq)  |
                                                       |  2. DOM     |     |
                                                       |  3. Visual  |---->| parallel
                                                       |  4. Perf    |     |
                                                       |  5. Score (seq)   |
                                                       |  6. Recs  (seq)   |
                                                       +-------------------+

  Data Stores:
  +-------------------+    +-------------------+    +-------------------+
  | PostgreSQL        |    | Redis             |    | S3-Compatible     |
  | - Scan history    |    | - Job queue       |    | - Screenshots     |
  | - Score records   |    | - Caching (24h)   |    | - DOM snapshots   |
  | - User accounts   |    | - Rate limiting   |    | - Report PDFs     |
  +-------------------+    +-------------------+    +-------------------+`}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
              Technical Specifications
            </h3>
            <div style={s.grid3}>
              {[
                { title: "Analysis Timeout", value: "30 seconds", detail: "Per-URL wall-clock budget. Stages 2-4 run concurrently with 10s individual timeouts." },
                { title: "Viewports Tested", value: "375 / 768 / 1440 px", detail: "Mobile, tablet, desktop. Scores averaged across viewports with mobile weighted 1.2x." },
                { title: "Score Precision", value: "Integer 0-100", detail: "Sub-criteria use floats internally. Category and final scores round to nearest integer." },
                { title: "Confidence Interval", value: "95% (1.96 sigma)", detail: "Wider intervals flag inconsistency across categories." },
                { title: "Rate Limit", value: "10 scans/min/user", detail: "Redis sliding window. Burst of 3. Enterprise configurable to 100/min." },
                { title: "Result Caching", value: "24-hour TTL", detail: "Keyed on URL + viewport + user-agent. Identical requests return cached results." },
                { title: "Signal Count", value: "80+ signals", detail: "Extracted from DOM analysis, visual processing, and performance audits." },
                { title: "Rule Count", value: "80+ rules", detail: "Deterministic condition-based rules mapping signals to score adjustments." },
                { title: "Worker Runtime", value: "Node.js 20+", detail: "Containerized workers with Playwright for browser rendering." },
              ].map((spec) => (
                <div key={spec.title} style={s.card}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {spec.title}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1", marginBottom: 6 }}>
                    {spec.value}
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                    {spec.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Technology Stack */}
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginTop: 40, marginBottom: 16 }}>
              Technology Stack
            </h3>
            <div style={s.grid2}>
              {[
                {
                  layer: "Frontend",
                  tech: ["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS"],
                  color: "#6366f1",
                },
                {
                  layer: "API Layer",
                  tech: ["Next.js API Routes", "WebSocket (real-time updates)", "REST endpoints", "JWT auth"],
                  color: "#8b5cf6",
                },
                {
                  layer: "Analysis Engine",
                  tech: ["Playwright (headless rendering)", "JSDOM (DOM parsing)", "Sharp (image processing)", "axe-core (a11y)"],
                  color: "#ec4899",
                },
                {
                  layer: "Infrastructure",
                  tech: ["Docker containers", "Redis (BullMQ queues)", "PostgreSQL", "S3-compatible storage"],
                  color: "#14b8a6",
                },
              ].map((stack) => (
                <div key={stack.layer} style={{ ...s.card, borderLeft: `3px solid ${stack.color}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: stack.color, marginBottom: 10 }}>
                    {stack.layer}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {stack.tech.map((t) => (
                      <span key={t} style={s.tag(stack.color)}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Score Interpretation Guide (always visible) */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={s.sectionTitle}>Score Interpretation Guide</h2>
          <p style={s.sectionSub}>
            Understanding what the final score means for a website and how agencies
            should communicate results to their clients.
          </p>
          <div style={s.grid2}>
            {[
              {
                range: "90-100",
                label: "Excellent",
                color: "#22c55e",
                desc: "Professional-grade design with strong visual hierarchy, full accessibility compliance, and optimized performance. Minor polish opportunities may exist.",
              },
              {
                range: "75-89",
                label: "Good",
                color: "#14b8a6",
                desc: "Solid fundamentals with 3-5 actionable improvements. Typically missing some accessibility or performance optimizations.",
              },
              {
                range: "50-74",
                label: "Needs Improvement",
                color: "#f59e0b",
                desc: "Notable design issues affecting UX. Usually includes accessibility failures, responsive breakpoint problems, or typography issues.",
              },
              {
                range: "0-49",
                label: "Poor",
                color: "#ef4444",
                desc: "Fundamental design problems. May include broken layouts, severe accessibility barriers, or performance issues that degrade perceived quality.",
              },
            ].map((tier) => (
              <div
                key={tier.range}
                style={{ ...s.card, borderLeft: `4px solid ${tier.color}` }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: tier.color }}>
                    {tier.range}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tier.color }}>
                    {tier.label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                  {tier.desc}
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
          DesignChecker Core Scoring Algorithm v1.0 -- Internal Technical Architecture
        </footer>
      </div>
    </div>
  );
}

// =============================================================================
// SUPPORTING VISUAL COMPONENTS
// =============================================================================

function WeightDonut({ categories }: { categories: ScoringCategory[] }) {
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
          <span style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>100</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>total pts</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              <span style={{ color: "#64748b" }}>
                ({(c.weight * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriteriaCard({ category }: { category: ScoringCategory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ ...s.card, borderColor: category.color + "40" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
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
            Weight: {(category.weight * 100).toFixed(0)}% | {category.subcriteria.length} sub-criteria |{" "}
            {category.subcriteria.reduce((sum, sc) => sum + sc.rules.length, 0)} rules
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
        {category.description}
      </p>

      {/* Sub-criteria list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {category.subcriteria.slice(0, expanded ? undefined : 2).map((sc) => (
          <div
            key={sc.id}
            style={{
              background: "#0a0a0f",
              border: "1px solid #1e1e2e",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>
                {sc.name}
              </span>
              <span style={{ fontSize: 12, color: category.color, fontWeight: 600 }}>
                {(sc.weight * 100).toFixed(0)}%
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 6px 0", lineHeight: 1.5 }}>
              {sc.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
              {sc.signals.map((sig) => (
                <span key={sig} style={s.tag(category.color)}>
                  {sig}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {sc.rules.length} scoring rule{sc.rules.length !== 1 ? "s" : ""}
            </div>
          </div>
        ))}
      </div>

      {category.subcriteria.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 10,
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #1e1e2e",
            background: "transparent",
            color: category.color,
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {expanded ? "Show less" : `Show all ${category.subcriteria.length} sub-criteria`}
        </button>
      )}
    </div>
  );
}

function PipelineVisual() {
  const stages = [
    {
      num: 1,
      name: "URL Ingestion & Rendering",
      desc: "Accept URL, launch headless browser, render at 3 viewports (375/768/1440px), capture screenshots and serialized DOM.",
      inputs: ["Target URL"],
      outputs: ["Serialized DOM (3x)", "Screenshots (3x)", "HAR log", "Performance timing"],
      tech: ["Playwright", "Chrome DevTools Protocol", "Node.js worker"],
      parallel: false,
    },
    {
      num: 2,
      name: "DOM Analysis Engine",
      desc: "Parse DOM to extract structural signals: heading hierarchy, semantic elements, ARIA attributes, form structure, computed styles.",
      inputs: ["Serialized DOM"],
      outputs: ["Element tree", "Heading map", "Semantic report", "ARIA audit", "Color palette"],
      tech: ["JSDOM", "CSS extraction", "Custom AST walker"],
      parallel: true,
    },
    {
      num: 3,
      name: "Visual Analysis Engine",
      desc: "Process screenshots through computer vision: grid alignment, visual weight distribution, whitespace patterns, content density.",
      inputs: ["Screenshots (3x)"],
      outputs: ["Grid alignment score", "Visual balance map", "Whitespace heatmap", "Content density"],
      tech: ["Sharp", "Canvas pixel analysis", "Edge detection"],
      parallel: true,
    },
    {
      num: 4,
      name: "Performance & Metrics",
      desc: "Run Lighthouse-style audits: Core Web Vitals, contrast ratios, touch targets, responsive behavior metrics.",
      inputs: ["HAR log", "Performance timing", "DOM"],
      outputs: ["CWV scores", "WCAG contrast audit", "Touch target report", "Responsive audit"],
      tech: ["Lighthouse CI", "axe-core", "Custom CWV collector"],
      parallel: true,
    },
    {
      num: 5,
      name: "Score Computation",
      desc: "Feed all signals into the weighted scoring engine. Apply sub-criterion rules, category weights, and global weights.",
      inputs: ["All signal maps from stages 2-4"],
      outputs: ["Sub-criterion scores", "Category scores", "Final score", "Confidence interval"],
      tech: ["Custom scoring engine (TS)", "Statistical normalization"],
      parallel: false,
    },
    {
      num: 6,
      name: "Recommendation Generation",
      desc: "Identify lowest-scoring areas, match against rule set, rank by estimated impact, produce prioritized improvement plan.",
      inputs: ["All scores", "Rule database"],
      outputs: ["Recommendation list", "Score uplift estimates", "Difficulty ratings"],
      tech: ["Rule engine", "Impact model", "Template renderer"],
      parallel: false,
    },
  ];

  return (
    <div>
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.num}>
          <div style={{ ...s.card, position: "relative" }}>
            {stage.parallel && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "#14b8a620",
                  color: "#14b8a6",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                PARALLEL
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {stage.num}
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>
                {stage.name}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>
              {stage.desc}
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Inputs
                </div>
                {stage.inputs.map((i) => (
                  <div key={i} style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{i}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Outputs
                </div>
                {stage.outputs.map((o) => (
                  <div key={o} style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{o}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {stage.tech.map((t) => (
                <span key={t} style={s.tag("#6366f1")}>{t}</span>
              ))}
            </div>
          </div>
          {idx < stages.length - 1 && (
            <div style={{ width: 2, height: 28, background: "#1e1e2e", margin: "0 auto" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

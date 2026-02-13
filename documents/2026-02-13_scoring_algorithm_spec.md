# DesignChecker Scoring Algorithm -- Technical Specification

**Version:** 1.0
**Date:** 2026-02-13
**Author:** Tech Lead, DesignChecker
**Status:** Draft

---

## 1. Executive Summary

DesignChecker scores websites on a 0-100 scale using a hierarchical, weighted-average model inspired by Google Lighthouse. The algorithm evaluates six design quality dimensions through 30 sub-criteria backed by 80+ measurable signals extracted from DOM analysis, computer vision, and performance auditing. The system produces a single composite score, per-category breakdowns, a 95% confidence interval, and a prioritized list of actionable recommendations ranked by estimated score uplift.

This document specifies the scoring algorithm design, data requirements, signal extraction pipeline, recommendation engine, and API contracts.

---

## 2. Algorithm Overview

### 2.1 Scoring Model

The scoring model uses a **subtractive, hierarchical weighted-average** approach:

1. **Sub-criterion level**: Each sub-criterion starts at a base score of 100 points. Deterministic rules evaluate extracted signals and apply point deductions (or, rarely, bonuses). The raw score is clamped to [0, 100].

2. **Category level**: Each category score is the weighted average of its sub-criteria scores. Sub-criteria weights within a category sum to 1.0.

3. **Composite level**: The final score is the weighted average of all category scores. Category weights sum to 1.0.

### 2.2 Formula

```
SubScore_j = clamp(100 + Sum(RulePoints_k), 0, 100)

CategoryScore_i = Sum(SubWeight_j * SubScore_j)
    where SubWeight_j sums to 1.0 within category i

FinalScore = Sum(CategoryWeight_i * CategoryScore_i)
    where CategoryWeight_i sums to 1.0

Confidence = +/- 1.96 * stddev(CategoryScores)  // 95% CI
```

### 2.3 Design Rationale

**Why subtractive scoring?** Starting from a perfect 100 and deducting for detected issues makes the scoring deterministic, auditable, and explainable. Every point lost can be traced to a specific rule trigger and signal value.

**Why hierarchical weighting?** Two levels of weights (sub-criteria within categories, and categories within the total) provide fine-grained control over how much each aspect of design quality contributes to the final score, while keeping the top-level model simple enough for users to understand.

**Why not machine learning?** For the MVP, rule-based scoring is preferred because:
- Rules are transparent and auditable (agencies need to explain scores to their clients)
- No training data is required
- Rules can be extended incrementally without retraining
- Deterministic output for the same input

A future enhancement (Phase 2) will layer a log-normal calibration step derived from HTTP Archive data, following the approach used by Google Lighthouse to calibrate raw metric values against real-world distributions.

---

## 3. Scoring Categories and Weights

| Category | ID | Weight | Sub-criteria | Description |
|---|---|---|---|---|
| Visual Hierarchy & Layout | `visual-hierarchy` | 25% | 5 | How effectively the design guides the eye through content via size, contrast, spacing, and alignment |
| Typography & Readability | `typography` | 20% | 5 | Text legibility, font selection, line length, contrast, and reading comfort |
| Color & Visual Design | `color-design` | 20% | 5 | Color palette coherence, contrast accessibility, image quality, and style consistency |
| Responsive Design & Performance | `responsiveness` | 15% | 5 | Adaptation across screen sizes and loading performance that impacts perceived quality |
| Navigation & UX Patterns | `navigation-ux` | 10% | 5 | Navigation clarity, interactive feedback, CTA effectiveness, and form usability |
| Accessibility & Standards | `accessibility` | 10% | 5 | WCAG 2.1 AA compliance, semantic HTML, ARIA attributes, and keyboard navigability |

**Weight rationale**: Visual Hierarchy and Layout receives the highest weight (25%) because it is the single most impactful factor in first-impression design quality perception. Typography and Color each receive 20% as they are core visual design pillars. Responsiveness (15%) reflects the reality that most web traffic is now mobile-first. Navigation/UX (10%) and Accessibility (10%) are lower-weighted individually but together represent 20% of the total, ensuring they meaningfully influence the score.

---

## 4. Sub-Criteria Specification

### 4.1 Visual Hierarchy & Layout (25%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Heading Structure | 20% | `h1Count`, `headingLevelSkips`, `headingSizeRatio` | Exactly 1 H1 = full marks. Each level skip = -3pts. Size ratio < 1.15 between levels = -5pts. Multiple H1 = -15pts. |
| Whitespace & Spacing | 25% | `spacingVariance`, `contentDensity` | Coefficient of variation in spacing < 0.15 = full marks. Density > 0.85 = -10pts (cramped). Density < 0.3 = -5pts (sparse). |
| Grid Alignment | 20% | `alignmentOffset`, `gridConsistency` | Median alignment offset < 2px = full marks. 2-8px = -4pts. >8px = -10pts. Grid consistency < 0.7 = -6pts. |
| Content Grouping | 20% | `orphanRatio`, `containerUsage` | Orphan ratio < 0.05 = full marks. 0.05-0.15 = -4pts. >0.15 = -10pts. |
| Visual Weight Balance | 15% | `centerOffset`, `quadrantDensity` | Center-of-mass offset < 10% viewport width = full marks. 10-20% = -6pts. >20% = -12pts. |

### 4.2 Typography & Readability (20%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Font Selection | 15% | `fontFamilyCount`, `fontPairingScore` | 2-3 families = full marks. >4 = -8pts. System-only = -15pts. Poor pairing score < 0.5 = -6pts. |
| Line Length | 20% | `avgLineLength`, `maxLineLength` | Avg 55-75 chars = full marks. 80-90 = -5pts. >90 = -10pts. <35 = -5pts. Max > 100 = -5pts. |
| Line Height & Spacing | 20% | `lineHeightRatio`, `verticalRhythmVariance` | Ratio 1.4-1.8 = full marks. <1.2 = -12pts. >2.2 = -5pts. Rhythm variance > 0.2 = -4pts. |
| Text Contrast | 25% | `minContrastRatio`, `wcagAAFailures` | All WCAG AA (4.5:1) = full marks. <4.5 = -8pts. <3.0 = -15pts. AAA (7:1+) = +3pts bonus. Per AA failure = -3pts. |
| Responsive Typography | 20% | `textOverflowCount`, `fontScaleBreakpoints` | No overflow = full marks. 1-3 overflows = -4pts. >3 = -10pts. No scaling = -8pts. |

### 4.3 Color & Visual Design (20%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Palette Coherence | 25% | `uniqueHues`, `paletteHarmony` | 3-7 hues with harmony = full marks. >12 hues = -8pts. <2 = -5pts. No harmony (score < 0.4) = -10pts. |
| Contrast Accessibility | 25% | `interactiveContrast`, `focusIndicators` | All interactive elements 4.5:1+ = full marks. Below = -10pts. Missing focus indicators = -8pts. |
| Image Quality | 20% | `stretchedImages`, `missingAltText` | No stretched images = full marks. Each stretched = -4pts. Each missing alt = -3pts. |
| Style Consistency | 20% | `buttonStyleVariance`, `linkStyleVariance` | Consistent styles = full marks. >3 button variants = -6pts. >2 link variants = -4pts. |
| Dark Mode Support | 10% | `darkModeSupport` | Full dark mode = +5pts bonus. None = 0pts (no penalty). |

### 4.4 Responsive Design & Performance (15%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Breakpoint Handling | 25% | `brokenBreakpoints`, `layoutShifts` | Smooth adaptation at 320/768/1024/1440px = full marks. Per broken breakpoint = -8pts. >3 layout shifts = -5pts. |
| Touch Target Sizing | 20% | `undersizedTargets` | All targets >= 44px = full marks. 1-5 undersized = -4pts. >5 = -10pts. |
| CLS (Layout Shift) | 20% | `cumulativeLayoutShift` | CLS < 0.05 = full marks. 0.05-0.1 = -3pts. 0.1-0.25 = -8pts. >0.25 = -15pts. |
| LCP (Largest Contentful Paint) | 20% | `lcpTime` | LCP < 1.5s = full marks. 1.5-2.5s = -3pts. 2.5-4s = -8pts. >4s = -15pts. |
| Viewport & Scaling | 15% | `viewportCorrect`, `horizontalScroll` | Correct viewport + no horizontal scroll = full marks. Missing viewport = -8pts. Horizontal scroll = -6pts. |

### 4.5 Navigation & UX Patterns (10%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Navigation Clarity | 30% | `navPresent`, `navItemCount` | Clear primary nav with 3-8 items = full marks. >10 = -6pts. No nav = -20pts. <2 items = -4pts. |
| Interactive Feedback | 25% | `hoverStates`, `focusStates` | All elements have hover + focus = full marks. <50% hover states = -8pts. <50% focus states = -8pts. |
| CTA Effectiveness | 20% | `ctaAboveFold`, `ctaContrast` | CTA above fold with high contrast = full marks. Not above fold = -8pts. Low contrast (<3.0) = -6pts. |
| Form Usability | 15% | `missingLabels`, `hasValidation` | All labels + validation = full marks. Missing labels = -5pts. No validation = -5pts. |
| Link Distinction | 10% | `linkDistinction` | Underline or strong color difference = full marks. Neither (<0.3) = -8pts. |

### 4.6 Accessibility & Standards (10%)

| Sub-criterion | Weight | Signals | Scoring Logic |
|---|---|---|---|
| Semantic HTML | 25% | `semanticLandmarks`, `divSoupRatio` | All landmarks present + low div ratio = full marks. <3 landmarks = -8pts. Div ratio > 0.8 = -6pts. |
| ARIA Implementation | 20% | `ariaErrors`, `missingAriaLabels` | Correct ARIA = full marks. Per error = -5pts. >3 missing labels = -6pts. |
| Keyboard Navigation | 25% | `tabOrderBroken`, `focusTraps`, `skipNav` | Logical tab order + skip nav = full marks. Broken tab = -8pts. Focus trap = -12pts. No skip nav = -4pts. |
| Alt Text & Media | 15% | `altTextCoverage` | 100% coverage = full marks. 50-90% = -5pts. <50% = -12pts. |
| Color Independence | 15% | `colorOnlyIndicators` | No color-only = full marks. Per instance = -5pts. |

---

## 5. Signal Extraction Pipeline

### 5.1 Pipeline Stages

The analysis pipeline processes a URL through six sequential/parallel stages:

```
Stage 1: URL Ingestion & Rendering (sequential, 8-12s)
    Input:  Target URL
    Output: Serialized DOM (3 viewports), screenshots (3), HAR log, perf timing
    Tech:   Playwright headless browser, Chrome DevTools Protocol

    +--> Stage 2: DOM Analysis Engine (parallel, 2-4s)
    |       Input:  Serialized DOM
    |       Output: Element tree, heading map, semantic report, ARIA audit, color palette
    |       Tech:   JSDOM, CSS computed style extraction, custom AST walker
    |
    +--> Stage 3: Visual Analysis Engine (parallel, 3-6s)
    |       Input:  Screenshots (3 viewports)
    |       Output: Grid alignment score, visual balance map, whitespace heatmap, density matrix
    |       Tech:   Sharp image processing, canvas pixel analysis, edge detection
    |
    +--> Stage 4: Performance & Metrics Collection (parallel, 2-5s)
            Input:  HAR log, performance timing, DOM
            Output: Core Web Vitals, WCAG contrast audit, touch target report, responsive audit
            Tech:   Lighthouse CI headless, axe-core, custom CWV collector

Stage 5: Score Computation (sequential, <500ms)
    Input:  All signal maps from stages 2-4
    Output: Sub-criterion scores, category scores, composite score, confidence interval
    Tech:   Custom scoring engine (TypeScript), statistical normalization

Stage 6: Recommendation Generation (sequential, <200ms)
    Input:  All scores, recommendation rule database
    Output: Prioritized recommendation list, score uplift estimates, difficulty ratings
    Tech:   Rule engine (pattern matching), impact estimation model
```

### 5.2 Signal Extraction Methods

**DOM-Based Signals (Stage 2)**:
- Parse serialized DOM with JSDOM or Cheerio
- Walk the AST to count heading elements, check hierarchy, extract computed styles
- Analyze semantic element usage (header, main, nav, footer, article)
- Audit ARIA attributes for correctness and completeness
- Extract all color values and compute palette metrics
- Identify form elements and check label associations
- Measure navigation structure (element presence, item count, depth)

**Visual Signals (Stage 3)**:
- Process screenshots with Sharp for pixel-level analysis
- Apply edge detection to identify content boundaries and grid lines
- Compute visual center-of-mass and quadrant density distribution
- Generate whitespace heatmaps and content density matrices
- Measure alignment offsets between detected element boundaries
- Compare layout consistency across viewport widths

**Performance Signals (Stage 4)**:
- Run Lighthouse CI in headless mode for Core Web Vitals (LCP, CLS)
- Use axe-core for automated WCAG 2.1 AA audit
- Measure touch target dimensions via element bounding boxes
- Test responsive behavior by comparing DOM structure across viewports
- Extract contrast ratios for all text-background pairs
- Identify horizontal scroll and viewport configuration

### 5.3 Signal Data Schema

```typescript
interface Signal {
  id: string;           // Unique signal identifier (e.g., "h1Count")
  value: number;        // Numeric value
  unit: string;         // Unit descriptor (e.g., "count", "ratio", "px", "ms")
  source: SignalSource; // Which pipeline stage produced this signal
  viewport: Viewport;   // Which viewport this was measured at
  confidence: number;   // 0-1 confidence in the measurement accuracy
  rawData?: unknown;    // Optional raw data for debugging
}

type SignalSource = "dom" | "visual" | "performance" | "accessibility";
type Viewport = "mobile" | "tablet" | "desktop" | "aggregated";
```

### 5.4 Cross-Viewport Aggregation

Signals are extracted independently at three viewports (375px, 768px, 1440px). Before scoring, per-viewport signals are aggregated into a single value:

```
AggregatedSignal = (mobile_value * 1.2 + tablet_value * 1.0 + desktop_value * 1.0) / 3.2
```

Mobile receives a 1.2x multiplier to reflect the mobile-first reality of modern web traffic. This weighting is configurable per deployment.

---

## 6. Scoring Engine Implementation

### 6.1 Core Algorithm Pseudocode

```typescript
function computeDesignScore(signals: Map<string, number>): ScoringResult {
  // 1. Score each sub-criterion
  for each category in CATEGORIES:
    for each subCriterion in category.subcriteria:
      rawScore = 100
      appliedRules = []

      for each rule in subCriterion.rules:
        signalValue = signals.get(rule.signalId)
        if signalValue !== undefined AND rule.condition(signalValue):
          rawScore += rule.points  // negative = deduction
          appliedRules.push(rule)

      subCriterion.score = clamp(rawScore, 0, 100)

    // 2. Compute category score (weighted average of sub-criteria)
    category.score = Sum(subCriterion.weight * subCriterion.score)

  // 3. Compute final score (weighted average of categories)
  finalScore = Sum(category.weight * category.score)

  // 4. Compute confidence interval
  stddev = standardDeviation(category.scores)
  confidence = 1.96 * stddev  // 95% CI

  // 5. Generate recommendations
  recommendations = generateRecommendations(categories, signals)

  // 6. Assign grade
  grade = getGrade(finalScore)  // Excellent/Good/Needs Improvement/Poor

  return { finalScore, confidence, categories, recommendations, grade }
}
```

### 6.2 Scoring Rules Schema

```typescript
interface ScoringRule {
  signalId: string;                    // Which signal to evaluate
  condition: (value: number) => boolean; // When to trigger this rule
  points: number;                       // Point adjustment (negative = deduction)
  label: string;                        // Human-readable description
}
```

Rules are pure functions, making them trivially testable:
```typescript
// Example rule test
assert(rule.condition(3) === true);   // h1Count of 3 triggers "not exactly one H1"
assert(rule.condition(1) === false);  // h1Count of 1 does not trigger
```

### 6.3 Grade Thresholds

| Score Range | Grade | Color Code |
|---|---|---|
| 90-100 | Excellent | `#22c55e` (green) |
| 75-89 | Good | `#14b8a6` (teal) |
| 50-74 | Needs Improvement | `#f59e0b` (amber) |
| 0-49 | Poor | `#ef4444` (red) |

---

## 7. Recommendation Engine

### 7.1 Recommendation Generation Logic

The recommendation engine processes scored results to produce actionable improvement suggestions:

1. **Identify failing sub-criteria**: Any sub-criterion with a score below 85 is eligible for recommendations
2. **Match triggered rules**: For each failing sub-criterion, collect all rules that fired (deducted points)
3. **Classify severity** based on point impact:
   - Critical: deduction >= 10 points
   - Major: deduction 5-9 points
   - Minor: deduction 1-4 points
   - Suggestion: bonus rules that did not apply
4. **Estimate uplift**: The estimated score uplift equals the absolute value of the deduction, adjusted for the sub-criterion weight and category weight
5. **Rank by impact**: Sort recommendations descending by estimated uplift
6. **Limit output**: Return the top 10 recommendations to avoid overwhelming the user

### 7.2 Recommendation Data Schema

```typescript
interface Recommendation {
  category: string;        // Parent category name
  severity: Severity;      // "critical" | "major" | "minor" | "suggestion"
  title: string;           // Short description of the issue
  description: string;     // Detailed explanation with fix guidance
  estimatedUplift: number; // Expected score improvement if fixed
  signalId: string;        // The signal that triggered this recommendation
  difficulty: Difficulty;  // "easy" | "moderate" | "hard" (estimated effort)
}
```

### 7.3 Sample Recommendation Rules

| Trigger Condition | Category | Severity | Message | Impact |
|---|---|---|---|---|
| `contrastRatios < 4.5` | Accessibility | Critical | Increase foreground/background contrast to meet WCAG AA minimum (4.5:1) | +8 pts |
| `avgLineLength > 90` | Typography | Major | Constrain content width to 65-75 characters for optimal reading comfort | +5 pts |
| `cumulativeLayoutShift > 0.1` | Performance | Critical | Reserve explicit dimensions for images/embeds; avoid injecting content above fold | +7 pts |
| `h1Count !== 1` | Visual Hierarchy | Major | Ensure exactly one H1 element per page for clear document structure | +4 pts |
| `touchTargetSize < 44` | Responsiveness | Major | Increase interactive element size to minimum 44x44px for mobile usability | +5 pts |
| `navItemCount > 10` | Navigation | Minor | Group navigation items into dropdowns to reduce cognitive load | +3 pts |
| `missingAltText > 0` | Accessibility | Critical | Add descriptive alt text to all meaningful images | +6 pts |
| `uniqueColors > 12` | Color & Design | Minor | Consolidate to a cohesive 5-7 color palette | +3 pts |

---

## 8. Data Requirements

### 8.1 Input Requirements

The scoring engine requires a single input: a valid, publicly-accessible URL.

**URL validation rules**:
- Must be a valid HTTP or HTTPS URL
- Must resolve to a 2xx status code within 10 seconds
- Must serve HTML content (Content-Type: text/html)
- Must not be on a blocklist (e.g., localhost, private IPs)

### 8.2 Infrastructure Requirements

| Component | Purpose | Specification |
|---|---|---|
| Headless Browser | Page rendering | Playwright with Chromium, 3 viewport instances |
| DOM Parser | Signal extraction | JSDOM or Cheerio for server-side DOM analysis |
| Image Processor | Visual analysis | Sharp (libvips) for screenshot processing |
| Performance Auditor | CWV metrics | Lighthouse CI (headless mode) |
| Accessibility Auditor | WCAG compliance | axe-core integrated with Playwright |
| Job Queue | Work distribution | Redis + BullMQ for async job processing |
| Database | Result storage | PostgreSQL for scan history, scores, user accounts |
| Object Storage | Asset storage | S3-compatible for screenshots, DOM snapshots, PDFs |
| Cache Layer | Result caching | Redis with 24-hour TTL, keyed on URL + viewport + UA |

### 8.3 Performance Budget

| Metric | Target | Notes |
|---|---|---|
| Total analysis time | <= 30 seconds | Wall-clock from URL submission to scored result |
| Stage 1 (Render) | 8-12 seconds | 3 viewports, full-page screenshots |
| Stages 2-4 (parallel) | 3-6 seconds | Run concurrently, each with 10s timeout |
| Stage 5 (Score) | < 500 milliseconds | Pure computation, no I/O |
| Stage 6 (Recommendations) | < 200 milliseconds | Rule matching and sorting |
| Memory per analysis | <= 512 MB | Per containerized worker |
| Concurrent analyses | 10 per node | Configurable based on hardware |

---

## 9. API Design

### 9.1 Submit Analysis

```
POST /api/v1/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "viewports": ["mobile", "tablet", "desktop"],
    "includeScreenshots": true,
    "includeDOM": false
  }
}

Response: 202 Accepted
{
  "jobId": "uuid-v4",
  "status": "queued",
  "estimatedTime": 25,
  "statusUrl": "/api/v1/jobs/{jobId}"
}
```

### 9.2 Check Job Status

```
GET /api/v1/jobs/{jobId}

Response: 200 OK
{
  "jobId": "uuid-v4",
  "status": "processing",   // "queued" | "processing" | "completed" | "failed"
  "stage": 3,               // current pipeline stage (1-6)
  "progress": 0.55,         // 0.0-1.0
  "startedAt": "ISO-8601",
  "eta": 12                 // estimated seconds remaining
}
```

### 9.3 Get Results

```
GET /api/v1/results/{jobId}

Response: 200 OK
{
  "jobId": "uuid-v4",
  "url": "https://example.com",
  "analyzedAt": "ISO-8601",
  "score": {
    "final": 78,
    "confidence": 8,
    "grade": "Good",
    "categories": [
      {
        "id": "visual-hierarchy",
        "name": "Visual Hierarchy & Layout",
        "score": 82,
        "weight": 0.25,
        "subcriteria": [
          {
            "id": "heading-structure",
            "name": "Heading Structure",
            "score": 85,
            "weight": 0.2,
            "appliedRules": [
              { "label": "Heading level skip detected", "points": -3 }
            ]
          }
        ]
      }
    ],
    "recommendations": [
      {
        "severity": "critical",
        "category": "Typography",
        "title": "Text contrast below WCAG AA",
        "description": "...",
        "estimatedUplift": 8,
        "difficulty": "easy"
      }
    ]
  },
  "metadata": {
    "analysisTime": 22.4,
    "viewportsTested": ["375px", "768px", "1440px"],
    "signalCount": 84,
    "ruleCount": 82,
    "rulesTriggered": 12
  }
}
```

### 9.4 Real-Time Updates (WebSocket)

```
WS /api/v1/ws/jobs/{jobId}

// Server sends progress events:
{ "type": "stage_start", "stage": 2, "name": "DOM Analysis" }
{ "type": "stage_complete", "stage": 2, "duration": 3.2 }
{ "type": "progress", "overall": 0.75 }
{ "type": "complete", "score": 78, "grade": "Good" }
{ "type": "error", "message": "Page failed to load", "code": "RENDER_TIMEOUT" }
```

### 9.5 Rate Limiting

| Plan | Rate Limit | Burst | Cache TTL |
|---|---|---|---|
| Free | 5 scans/min | 2 | 24 hours |
| Pro | 10 scans/min | 3 | 24 hours |
| Enterprise | 100 scans/min | 10 | Configurable |

Rate limiting is enforced via Redis sliding window counters, keyed on authenticated user ID.

---

## 10. Statistical Considerations

### 10.1 Confidence Interval

The confidence interval is computed from the standard deviation of category scores:

```
CI = +/- 1.96 * sqrt(variance(CategoryScores))
```

A narrow CI (e.g., +/- 3) indicates consistent quality across all dimensions. A wide CI (e.g., +/- 15) flags that the site excels in some areas but is poor in others -- useful context for agencies prioritizing improvements.

### 10.2 Score Calibration (Future Enhancement)

Following Google Lighthouse's approach, a planned Phase 2 enhancement will calibrate raw signal values through log-normal distributions derived from HTTP Archive data:

```
CalibratedScore = NormalCDF(log(signalValue), logMedian, logStdDev) * 100
```

This maps each signal to its percentile position in the real-world distribution, ensuring that a score of 50 truly means "median website quality" rather than an arbitrary midpoint.

### 10.3 Score Stability

To address score variability (a known issue with Lighthouse scores varying 5-10 points between runs):
- Performance signals are averaged across 3 consecutive measurements
- Visual signals are deterministic (same screenshot = same result)
- DOM signals are deterministic (same DOM = same result)
- The confidence interval communicates remaining uncertainty

---

## 11. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS | User interface |
| API Layer | Next.js API Routes, WebSocket | REST + real-time endpoints |
| Analysis Engine | Playwright, JSDOM, Sharp, axe-core, Lighthouse CI | Signal extraction |
| Scoring Engine | Custom TypeScript | Score computation |
| Job Queue | Redis + BullMQ | Async work distribution |
| Database | PostgreSQL | Scan history, scores, accounts |
| Cache | Redis | Result caching, rate limiting |
| Object Storage | S3-compatible | Screenshots, DOM, PDFs |
| Containers | Docker | Worker isolation |
| Orchestration | Docker Compose (dev), Kubernetes (prod) | Service management |

---

## 12. Future Enhancements

### Phase 2: Calibration & ML
- Log-normal calibration against HTTP Archive data
- ML-based visual appeal scoring (trained on designer ratings)
- Competitor benchmarking (score relative to same-industry sites)

### Phase 3: Temporal Analysis
- Score trending over time (weekly/monthly re-scans)
- Regression detection (alert when score drops by > 5 points)
- A/B test scoring (compare two versions of the same page)

### Phase 4: Advanced Recommendations
- AI-generated fix previews (visual mockups of recommended changes)
- Code-level fix suggestions (CSS snippets, HTML corrections)
- Integration with CI/CD pipelines (fail builds below a score threshold)

---

## 13. Appendix: Complete Signal Inventory

### DOM Signals (24 signals)
`h1Count`, `headingLevelSkips`, `headingSizeRatio`, `spacingVariance`, `contentDensity`, `alignmentOffset`, `gridConsistency`, `orphanRatio`, `containerUsage`, `centerOffset`, `quadrantDensity`, `fontFamilyCount`, `fontPairingScore`, `avgLineLength`, `maxLineLength`, `lineHeightRatio`, `verticalRhythmVariance`, `navPresent`, `navItemCount`, `hoverStates`, `focusStates`, `missingLabels`, `hasValidation`, `linkDistinction`

### Visual Signals (10 signals)
`uniqueHues`, `paletteHarmony`, `stretchedImages`, `buttonStyleVariance`, `linkStyleVariance`, `darkModeSupport`, `brokenBreakpoints`, `layoutShifts`, `undersizedTargets`, `colorOnlyIndicators`

### Performance Signals (8 signals)
`cumulativeLayoutShift`, `lcpTime`, `viewportCorrect`, `horizontalScroll`, `textOverflowCount`, `fontScaleBreakpoints`, `interactiveContrast`, `focusIndicators`

### Accessibility Signals (8 signals)
`minContrastRatio`, `wcagAAFailures`, `semanticLandmarks`, `divSoupRatio`, `ariaErrors`, `missingAriaLabels`, `tabOrderBroken`, `focusTraps`, `skipNav`, `altTextCoverage`, `missingAltText`, `ctaAboveFold`, `ctaContrast`

---

## 14. References

- Google Lighthouse Performance Scoring: https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
- WCAG 2.1 Web Content Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- HTTP Archive Web Almanac (web quality distributions): https://httparchive.org/
- CSS Wizardry: Designing a Web Performance Score: https://csswizardry.com/2024/11/designing-and-evolving-a-new-performance-score/
- GoodWeb Framework (academic website evaluation): https://pmc.ncbi.nlm.nih.gov/articles/PMC6914275/

---

*Document generated: 2026-02-13 | DesignChecker Technical Architecture*

# DesignChecker Core Scoring Algorithm Framework
## Technical Specification for DE Step 7

**Document Version:** 1.0
**Date:** February 13, 2026
**Author:** Tech Lead, DesignChecker
**Status:** Production-Ready Specification
**Phase:** DE Step 7 - Technical Architecture Definition

---

## Executive Summary

This document defines the complete technical approach for DesignChecker's core scoring algorithm: a production-ready, transparent, and extensible framework that evaluates web design quality on a 0-100 scale. The algorithm combines aesthetic evaluation, UX principles, and performance metrics into a single composite score tailored specifically for agency client reporting needs.

**Key Design Principles:**
- **Transparent & Auditable**: Every point deduction traces to a specific rule and signal
- **Deterministic**: Same input produces same output (no ML randomness)
- **Agency-Focused**: Optimized for client reporting and actionable recommendations
- **Extensible**: New rules can be added without rewriting core engine
- **Production-Ready**: Fully specified for immediate implementation

---

## Table of Contents

1. [Algorithm Architecture](#1-algorithm-architecture)
2. [Scoring Categories & Weights](#2-scoring-categories--weights)
3. [Sub-Criteria Specifications](#3-sub-criteria-specifications)
4. [Signal Definitions](#4-signal-definitions)
5. [Scoring Rules Engine](#5-scoring-rules-engine)
6. [Recommendation Engine](#6-recommendation-engine)
7. [Analysis Pipeline](#7-analysis-pipeline)
8. [System Architecture](#8-system-architecture)
9. [API Contracts](#9-api-contracts)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Algorithm Architecture

### 1.1 Hierarchical Scoring Model

The scoring algorithm uses a **three-level hierarchical weighted-average** model:

```
┌─────────────────────────────────────────────────────┐
│                   FINAL SCORE                       │
│                    (0-100)                          │
│         Weighted average of 6 categories            │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼──────┐      ┌──────▼───────┐
│  CATEGORY 1  │ ...  │  CATEGORY 6  │
│   (0-100)    │      │   (0-100)    │
│ Weight: 25%  │      │ Weight: 10%  │
└───────┬──────┘      └──────┬───────┘
        │                     │
   ┌────┴────┐           ┌────┴────┐
   │         │           │         │
┌──▼──┐  ┌──▼──┐    ┌──▼──┐  ┌──▼──┐
│SUB 1│  │SUB 2│    │SUB 1│  │SUB 2│
│0-100│  │0-100│    │0-100│  │0-100│
└─────┘  └─────┘    └─────┘  └─────┘
```

### 1.2 Scoring Formula

**Level 1: Sub-Criterion Scoring (Subtractive Model)**
```
SubScore_j = clamp(100 + Σ(RulePoints_k), 0, 100)

where:
- Each sub-criterion starts at 100 points
- RulePoints_k are negative (deductions) or positive (bonuses)
- Only rules where condition(signalValue) = true contribute points
- Result is clamped to [0, 100]
```

**Level 2: Category Scoring (Weighted Average)**
```
CategoryScore_i = Σ(SubWeight_j × SubScore_j)

where:
- SubWeight_j are the weights within category i
- Σ(SubWeight_j) = 1.0 for each category
```

**Level 3: Final Composite Score (Weighted Average)**
```
FinalScore = Σ(CategoryWeight_i × CategoryScore_i)

where:
- CategoryWeight_i are the top-level category weights
- Σ(CategoryWeight_i) = 1.0
```

**Confidence Interval (95%)**
```
Confidence = ±1.96 × σ(CategoryScores)

where:
- σ = standard deviation of the 6 category scores
- Higher variance = wider interval = inconsistent quality across dimensions
```

### 1.3 Design Rationale

**Why Subtractive Scoring?**
- **Transparency**: Every point lost traces to a specific rule trigger
- **Auditability**: Agencies can explain exactly why a site scored X
- **Determinism**: No black-box ML models; same input = same output
- **Explainability**: Non-technical clients can understand the logic

**Why Rule-Based (vs. Machine Learning)?**
- No training data required for MVP
- Rules are transparent and auditable
- Can be incrementally extended without retraining
- Deterministic outputs essential for business use case
- Future enhancement: Layer log-normal calibration (Lighthouse approach)

**Why Hierarchical Weights?**
- Fine-grained control at sub-criterion level
- Simple top-level model for user comprehension
- Allows category rebalancing without touching sub-criteria

---

## 2. Scoring Categories & Weights

### 2.1 Category Weight Distribution

| Category | ID | Weight | Sub-Criteria | Rationale |
|----------|-------|--------|--------------|-----------|
| **Visual Hierarchy & Layout** | `visual-hierarchy` | **25%** | 5 | Most impactful factor in first-impression design quality. Controls how users scan and process information. |
| **Typography & Readability** | `typography` | **20%** | 5 | Core design pillar. Text is 95% of web content. Poor typography destroys credibility. |
| **Color & Visual Design** | `color-design` | **20%** | 5 | Core design pillar. Color harmony, consistency, and accessibility are fundamental to professional design. |
| **Responsive Design & Performance** | `responsiveness` | **15%** | 5 | Mobile-first reality. Poor responsiveness or slow load times directly degrade perceived design quality. |
| **Navigation & UX Patterns** | `navigation-ux` | **10%** | 5 | Critical for usability but less visually impactful. Poor UX patterns reduce confidence in the design. |
| **Accessibility & Standards** | `accessibility` | **10%** | 5 | Legal and ethical requirement. Lower weight reflects current market reality, but still significant at 10%. |

**Total:** 100% across 6 categories, 30 sub-criteria

### 2.2 Weight Calibration Philosophy

Weights are set to reflect **agency client priorities** rather than pure technical correctness:

1. **Visual impact first** (65%): Visual Hierarchy (25%) + Typography (20%) + Color (20%) = core "does it look good?" evaluation
2. **Functional quality second** (25%): Responsiveness (15%) + Navigation (10%) = "does it work well?"
3. **Standards compliance third** (10%): Accessibility = "is it legal/ethical?"

This distribution aligns with how agencies sell design audits: "Your website doesn't look professional" is more compelling than "Your ARIA labels are missing."

---

## 3. Sub-Criteria Specifications

### 3.1 Visual Hierarchy & Layout (25%)

#### 3.1.1 Heading Structure (20% of category)

**Description:** Evaluates proper semantic heading hierarchy (H1-H6) with visually distinct sizing.

**Signals:**
- `h1Count`: Number of H1 elements on the page (ideal = 1)
- `headingLevelSkips`: Count of heading level jumps (e.g., H1 → H3 skips H2)
- `headingSizeRatio`: Average font-size ratio between consecutive heading levels

**Scoring Rules:**
```typescript
rules: [
  { signalId: "h1Count", condition: (v) => v !== 1, points: -15,
    label: "Not exactly one H1 element" },
  { signalId: "headingLevelSkips", condition: (v) => v > 0, points: -3,
    label: "Heading level skip detected (per skip)" },
  { signalId: "headingSizeRatio", condition: (v) => v < 1.15, points: -5,
    label: "Insufficient size ratio between heading levels" }
]
```

**Rationale:**
- Exactly one H1 establishes primary page topic (SEO + visual hierarchy)
- Heading level skips break logical structure
- Size ratio < 1.15 means headings don't visually differentiate

---

#### 3.1.2 Whitespace & Spacing (25% of category)

**Description:** Evaluates consistent use of margins/padding to create visual rhythm.

**Signals:**
- `spacingVariance`: Coefficient of variation in element spacing (lower = more consistent)
- `contentDensity`: Ratio of content pixels to total viewport pixels

**Scoring Rules:**
```typescript
rules: [
  { signalId: "spacingVariance", condition: (v) => v > 0.15, points: -8,
    label: "High spacing variance (inconsistent rhythm)" },
  { signalId: "contentDensity", condition: (v) => v > 0.85, points: -10,
    label: "Excessive content density (cramped layout)" },
  { signalId: "contentDensity", condition: (v) => v < 0.3, points: -5,
    label: "Too sparse content density" }
]
```

**Rationale:**
- Variance > 0.15 indicates inconsistent spacing patterns
- Density > 0.85 creates cramped, overwhelming layouts
- Density < 0.3 wastes space and reduces information scent

---

#### 3.1.3 Grid Alignment (20% of category)

**Description:** Elements snap to an implicit or explicit grid system.

**Signals:**
- `alignmentOffset`: Median pixel offset from nearest grid column
- `gridConsistency`: Proportion of elements aligned to grid

**Scoring Rules:**
```typescript
rules: [
  { signalId: "alignmentOffset", condition: (v) => v > 8, points: -10,
    label: "Significant off-grid alignment (>8px)" },
  { signalId: "alignmentOffset", condition: (v) => v > 2 && v <= 8, points: -4,
    label: "Minor alignment drift (2-8px)" },
  { signalId: "gridConsistency", condition: (v) => v < 0.7, points: -6,
    label: "Low grid column consistency" }
]
```

**Rationale:**
- Professional designs use grid systems (Bootstrap, Tailwind, etc.)
- Offset > 8px indicates no grid discipline
- Consistency < 70% suggests inconsistent layout approach

---

#### 3.1.4 Content Grouping (20% of category)

**Description:** Related elements are visually grouped using proximity or containers.

**Signals:**
- `orphanRatio`: Proportion of elements not in semantic containers
- `containerUsage`: Proportion of elements wrapped in grouping containers

**Scoring Rules:**
```typescript
rules: [
  { signalId: "orphanRatio", condition: (v) => v > 0.15, points: -10,
    label: "High orphan element ratio (>15%)" },
  { signalId: "orphanRatio", condition: (v) => v > 0.05 && v <= 0.15, points: -4,
    label: "Moderate orphan ratio (5-15%)" }
]
```

**Rationale:**
- Gestalt principle of proximity: grouped elements perceived as related
- Orphan ratio > 15% indicates poor information architecture
- Proper grouping improves scannability and comprehension

---

#### 3.1.5 Visual Weight Balance (15% of category)

**Description:** The page feels balanced, not visually heavy on one side.

**Signals:**
- `centerOffset`: Distance of visual center-of-mass from geometric center
- `quadrantDensity`: Standard deviation of content density across 4 viewport quadrants

**Scoring Rules:**
```typescript
rules: [
  { signalId: "centerOffset", condition: (v) => v > 20, points: -12,
    label: "Severe visual imbalance (>20% offset)" },
  { signalId: "centerOffset", condition: (v) => v > 10 && v <= 20, points: -6,
    label: "Moderate visual imbalance" }
]
```

**Rationale:**
- Center offset > 20% creates lopsided, unprofessional appearance
- Moderate offset (10-20%) noticeable but not critical
- Balanced layouts feel more stable and trustworthy

---

### 3.2 Typography & Readability (20%)

#### 3.2.1 Font Selection (15% of category)

**Description:** Professional, web-optimized fonts with appropriate pairing.

**Signals:**
- `fontFamilyCount`: Number of distinct font families used
- `fontPairingScore`: Computed harmony score for font pairings (0-1)

**Scoring Rules:**
```typescript
rules: [
  { signalId: "fontFamilyCount", condition: (v) => v > 4, points: -8,
    label: "Too many font families (>4)" },
  { signalId: "fontFamilyCount", condition: (v) => v === 0, points: -15,
    label: "No custom fonts (system only)" },
  { signalId: "fontPairingScore", condition: (v) => v < 0.5, points: -6,
    label: "Poor font pairing combination" }
]
```

**Rationale:**
- 2-3 fonts is professional standard (heading + body + optional accent)
- >4 fonts creates visual chaos
- System-only fonts signal low-effort design
- Poor pairings (e.g., two sans-serifs with similar weight) lack hierarchy

---

#### 3.2.2 Line Length (20% of category)

**Description:** Body text lines between 45-80 characters for optimal readability.

**Signals:**
- `avgLineLength`: Average line length in characters for body text
- `maxLineLength`: Maximum line length observed

**Scoring Rules:**
```typescript
rules: [
  { signalId: "avgLineLength", condition: (v) => v > 90, points: -10,
    label: "Lines far too long (>90 chars)" },
  { signalId: "avgLineLength", condition: (v) => v > 80 && v <= 90, points: -5,
    label: "Lines slightly too long (80-90)" },
  { signalId: "avgLineLength", condition: (v) => v < 35, points: -5,
    label: "Lines too short (<35 chars)" },
  { signalId: "maxLineLength", condition: (v) => v > 100, points: -5,
    label: "Maximum line length exceeds 100 chars" }
]
```

**Rationale:**
- Research shows 55-75 characters optimal for reading comprehension
- Lines >90 chars require head turning, causing fatigue
- Lines <35 chars create choppy, unnatural reading rhythm
- Max >100 indicates no max-width constraint

---

#### 3.2.3 Line Height & Spacing (20% of category)

**Description:** Comfortable vertical rhythm with appropriate line-height ratios.

**Signals:**
- `lineHeightRatio`: Average line-height as a ratio of font-size
- `verticalRhythmVariance`: Coefficient of variation in vertical spacing

**Scoring Rules:**
```typescript
rules: [
  { signalId: "lineHeightRatio", condition: (v) => v < 1.2, points: -12,
    label: "Line height too tight (<1.2)" },
  { signalId: "lineHeightRatio", condition: (v) => v > 2.2, points: -5,
    label: "Line height too loose (>2.2)" },
  { signalId: "verticalRhythmVariance", condition: (v) => v > 0.2, points: -4,
    label: "Inconsistent vertical rhythm" }
]
```

**Rationale:**
- Line-height 1.4-1.8 is readable (1.5-1.6 optimal)
- <1.2 causes line collisions, reduces readability
- >2.2 creates disjointed reading experience
- Inconsistent rhythm (variance >0.2) feels amateurish

---

#### 3.2.4 Text Contrast (25% of category)

**Description:** Sufficient contrast ratios meeting WCAG AA or AAA standards.

**Signals:**
- `minContrastRatio`: Minimum contrast ratio observed (foreground:background)
- `wcagAAFailures`: Count of text elements failing WCAG AA (4.5:1)

**Scoring Rules:**
```typescript
rules: [
  { signalId: "minContrastRatio", condition: (v) => v < 3.0, points: -15,
    label: "Critical: contrast below 3:1" },
  { signalId: "minContrastRatio", condition: (v) => v < 4.5 && v >= 3.0, points: -8,
    label: "Contrast below WCAG AA (4.5:1)" },
  { signalId: "wcagAAFailures", condition: (v) => v > 0, points: -3,
    label: "WCAG AA failures detected (per failure)" },
  { signalId: "minContrastRatio", condition: (v) => v >= 7.0, points: 3,
    label: "Bonus: WCAG AAA compliance (7:1+)" }
]
```

**Rationale:**
- WCAG AA minimum is 4.5:1 for normal text, 3:1 for large text
- <3.0 is severe readability failure
- 3.0-4.5 is problematic but not critical
- ≥7.0 AAA compliance earns bonus points

---

#### 3.2.5 Responsive Typography (20% of category)

**Description:** Text scales appropriately across breakpoints without overflow.

**Signals:**
- `textOverflowCount`: Number of text overflow instances detected
- `fontScaleBreakpoints`: Count of breakpoints with font-size adjustments

**Scoring Rules:**
```typescript
rules: [
  { signalId: "textOverflowCount", condition: (v) => v > 3, points: -10,
    label: "Multiple text overflow instances" },
  { signalId: "textOverflowCount", condition: (v) => v > 0 && v <= 3, points: -4,
    label: "Minor text overflow" },
  { signalId: "fontScaleBreakpoints", condition: (v) => v === 0, points: -8,
    label: "No responsive font scaling" }
]
```

**Rationale:**
- Text overflow indicates fixed-width containers or missing responsive design
- No font scaling suggests desktop-only optimization
- >3 overflows indicates systemic responsive design failure

---

### 3.3 Color & Visual Design (20%)

#### 3.3.1 Palette Coherence (25% of category)

**Description:** Colors follow a deliberate palette with harmonious relationships.

**Signals:**
- `uniqueHues`: Number of distinct hue values (0-360°) in color palette
- `paletteHarmony`: Computed harmony score (0-1) based on color wheel relationships

**Scoring Rules:**
```typescript
rules: [
  { signalId: "uniqueHues", condition: (v) => v > 12, points: -8,
    label: "Too many distinct hues (>12)" },
  { signalId: "uniqueHues", condition: (v) => v < 2, points: -5,
    label: "Too few hues (<2) -- monotonous palette" },
  { signalId: "paletteHarmony", condition: (v) => v < 0.4, points: -10,
    label: "No discernible color harmony" }
]
```

**Rationale:**
- Professional designs use 3-7 core hues
- >12 hues indicates no color discipline
- <2 hues creates monotonous, boring design
- Harmony <0.4 suggests random color selection

---

#### 3.3.2 Contrast Accessibility (25% of category)

**Description:** Interactive elements meet accessibility contrast ratios.

**Signals:**
- `interactiveContrast`: Minimum contrast for interactive elements (buttons, links, inputs)
- `focusIndicators`: Boolean (0/1) for presence of visible focus indicators

**Scoring Rules:**
```typescript
rules: [
  { signalId: "interactiveContrast", condition: (v) => v < 4.5, points: -10,
    label: "Interactive elements below 4.5:1 contrast" },
  { signalId: "focusIndicators", condition: (v) => v === 0, points: -8,
    label: "Missing focus indicators" }
]
```

**Rationale:**
- Interactive elements must be visually distinct (WCAG AA = 4.5:1)
- Missing focus indicators breaks keyboard navigation
- This is both an accessibility and UX issue

---

#### 3.3.3 Image Quality (20% of category)

**Description:** Images are high quality, properly sized, and serve a purpose.

**Signals:**
- `stretchedImages`: Count of images with aspect ratio distortion >5%
- `missingAltText`: Count of images without alt attributes

**Scoring Rules:**
```typescript
rules: [
  { signalId: "stretchedImages", condition: (v) => v > 0, points: -4,
    label: "Stretched/distorted images detected" },
  { signalId: "missingAltText", condition: (v) => v > 0, points: -3,
    label: "Images missing alt text (per image)" }
]
```

**Rationale:**
- Stretched images look unprofessional
- Missing alt text is accessibility failure
- Deduction per image (up to clamp limit)

---

#### 3.3.4 Style Consistency (20% of category)

**Description:** Similar elements use consistent colors and styles throughout.

**Signals:**
- `buttonStyleVariance`: Number of distinct button style variations
- `linkStyleVariance`: Number of distinct link style variations

**Scoring Rules:**
```typescript
rules: [
  { signalId: "buttonStyleVariance", condition: (v) => v > 3, points: -6,
    label: "Inconsistent button styles (>3 variants)" },
  { signalId: "linkStyleVariance", condition: (v) => v > 2, points: -4,
    label: "Inconsistent link styles" }
]
```

**Rationale:**
- 2-3 button styles acceptable (primary, secondary, tertiary)
- >3 button styles creates visual inconsistency
- Link styles should be uniform (maybe 2 for visited/unvisited)

---

#### 3.3.5 Dark Mode Support (10% of category)

**Description:** Optional: site provides a well-implemented dark theme.

**Signals:**
- `darkModeSupport`: Boolean (0/1) for presence of dark mode implementation

**Scoring Rules:**
```typescript
rules: [
  { signalId: "darkModeSupport", condition: (v) => v === 1, points: 5,
    label: "Bonus: dark mode properly implemented" }
]
```

**Rationale:**
- Dark mode is optional enhancement (no penalty for absence)
- Presence earns bonus points
- Shows attention to modern UX trends

---

### 3.4 Responsive Design & Performance (15%)

#### 3.4.1 Breakpoint Handling (25% of category)

**Description:** Layout adapts gracefully at standard breakpoints.

**Signals:**
- `brokenBreakpoints`: Count of breakpoints with layout issues
- `layoutShifts`: Count of unexpected layout reflows across breakpoints

**Scoring Rules:**
```typescript
rules: [
  { signalId: "brokenBreakpoints", condition: (v) => v > 0, points: -8,
    label: "Broken layout at breakpoint (per breakpoint)" },
  { signalId: "layoutShifts", condition: (v) => v > 3, points: -5,
    label: "Excessive layout shifts across breakpoints" }
]
```

**Rationale:**
- Standard breakpoints: 375px (mobile), 768px (tablet), 1440px (desktop)
- Broken breakpoint = unusable at that viewport
- Excessive shifts indicate poor responsive implementation

---

#### 3.4.2 Touch Target Sizing (20% of category)

**Description:** Interactive elements are at least 44x44px on touch devices.

**Signals:**
- `undersizedTargets`: Count of interactive elements <44px on smallest dimension

**Scoring Rules:**
```typescript
rules: [
  { signalId: "undersizedTargets", condition: (v) => v > 5, points: -10,
    label: "Many undersized touch targets (>5)" },
  { signalId: "undersizedTargets", condition: (v) => v > 0 && v <= 5, points: -4,
    label: "Some undersized touch targets" }
]
```

**Rationale:**
- WCAG 2.1 AA requires 44x44px touch targets
- <44px causes tap errors on mobile
- >5 violations indicates systemic mobile UX failure

---

#### 3.4.3 CLS - Cumulative Layout Shift (20% of category)

**Description:** Cumulative Layout Shift stays under 0.1 for visual stability.

**Signals:**
- `cumulativeLayoutShift`: CLS metric from Core Web Vitals

**Scoring Rules:**
```typescript
rules: [
  { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.25, points: -15,
    label: "CLS > 0.25 (poor)" },
  { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.1 && v <= 0.25, points: -8,
    label: "CLS 0.1-0.25 (needs improvement)" },
  { signalId: "cumulativeLayoutShift", condition: (v) => v > 0.05 && v <= 0.1, points: -3,
    label: "CLS slightly elevated" }
]
```

**Rationale:**
- Google Core Web Vitals: <0.1 = good, 0.1-0.25 = needs improvement, >0.25 = poor
- CLS directly impacts perceived design quality
- High CLS makes site feel janky and unprofessional

---

#### 3.4.4 LCP - Largest Contentful Paint (20% of category)

**Description:** Primary content renders within 2.5 seconds.

**Signals:**
- `lcpTime`: LCP time in milliseconds

**Scoring Rules:**
```typescript
rules: [
  { signalId: "lcpTime", condition: (v) => v > 4000, points: -15,
    label: "LCP > 4s (poor)" },
  { signalId: "lcpTime", condition: (v) => v > 2500 && v <= 4000, points: -8,
    label: "LCP 2.5-4s (needs improvement)" },
  { signalId: "lcpTime", condition: (v) => v > 1500 && v <= 2500, points: -3,
    label: "LCP slightly slow (1.5-2.5s)" }
]
```

**Rationale:**
- Google Core Web Vitals: <2.5s = good, 2.5-4s = needs improvement, >4s = poor
- LCP impacts perceived speed and design polish
- Slow LCP makes even beautiful designs feel sluggish

---

#### 3.4.5 Viewport & Scaling (15% of category)

**Description:** Proper viewport configuration and no horizontal scroll.

**Signals:**
- `viewportCorrect`: Boolean (0/1) for proper viewport meta tag
- `horizontalScroll`: Boolean (0/1) for horizontal scroll detection

**Scoring Rules:**
```typescript
rules: [
  { signalId: "viewportCorrect", condition: (v) => v === 0, points: -8,
    label: "Missing or incorrect viewport meta" },
  { signalId: "horizontalScroll", condition: (v) => v > 0, points: -6,
    label: "Horizontal scroll detected" }
]
```

**Rationale:**
- Viewport meta tag is basic responsive requirement
- Horizontal scroll is mobile UX failure
- Both are easily fixable but signal poor quality control

---

### 3.5 Navigation & UX Patterns (10%)

#### 3.5.1 Navigation Clarity (30% of category)

**Description:** Primary navigation is immediately identifiable and logical.

**Signals:**
- `navPresent`: Boolean (0/1) for identifiable nav element
- `navItemCount`: Number of top-level navigation items

**Scoring Rules:**
```typescript
rules: [
  { signalId: "navPresent", condition: (v) => v === 0, points: -20,
    label: "No identifiable navigation element" },
  { signalId: "navItemCount", condition: (v) => v > 10, points: -6,
    label: "Too many nav items (>10)" },
  { signalId: "navItemCount", condition: (v) => v < 2 && v > 0, points: -4,
    label: "Too few nav items" }
]
```

**Rationale:**
- No nav is critical failure (users can't navigate)
- >10 items creates cognitive overload (Miller's Law: 7±2)
- <2 items suggests incomplete site

---

#### 3.5.2 Interactive Feedback (25% of category)

**Description:** Buttons, links, and controls provide hover/focus/active states.

**Signals:**
- `hoverStates`: Proportion of interactive elements with hover states (0-1)
- `focusStates`: Proportion of interactive elements with focus states (0-1)

**Scoring Rules:**
```typescript
rules: [
  { signalId: "hoverStates", condition: (v) => v < 0.5, points: -8,
    label: "Less than 50% of elements have hover states" },
  { signalId: "focusStates", condition: (v) => v < 0.5, points: -8,
    label: "Less than 50% of elements have focus states" }
]
```

**Rationale:**
- Hover states provide visual feedback for mouse users
- Focus states required for keyboard navigation
- <50% coverage indicates incomplete interactive design

---

#### 3.5.3 CTA Effectiveness (20% of category)

**Description:** Primary calls-to-action are visually prominent and clearly worded.

**Signals:**
- `ctaAboveFold`: Boolean (0/1) for CTA presence above fold
- `ctaContrast`: Contrast ratio of primary CTA vs. background

**Scoring Rules:**
```typescript
rules: [
  { signalId: "ctaAboveFold", condition: (v) => v === 0, points: -8,
    label: "No CTA above the fold" },
  { signalId: "ctaContrast", condition: (v) => v < 3.0, points: -6,
    label: "Low CTA contrast ratio" }
]
```

**Rationale:**
- CTAs above fold maximize conversion potential
- Low contrast CTAs fail to draw attention
- Both reduce business effectiveness of design

---

#### 3.5.4 Form Usability (15% of category)

**Description:** Forms use proper labels, validation, and error messaging.

**Signals:**
- `missingLabels`: Count of form inputs without associated labels
- `hasValidation`: Boolean (0/1) for presence of client-side validation

**Scoring Rules:**
```typescript
rules: [
  { signalId: "missingLabels", condition: (v) => v > 0, points: -5,
    label: "Form fields missing labels" },
  { signalId: "hasValidation", condition: (v) => v === 0, points: -5,
    label: "No client-side form validation" }
]
```

**Rationale:**
- Missing labels is accessibility failure
- No validation creates poor UX (server-side errors only)
- Forms are high-value conversion points

---

#### 3.5.5 Link Distinction (10% of category)

**Description:** Links are visually distinct from surrounding text.

**Signals:**
- `linkDistinction`: Computed visual distinction score (0-1) for links

**Scoring Rules:**
```typescript
rules: [
  { signalId: "linkDistinction", condition: (v) => v < 0.3, points: -8,
    label: "Links not visually distinguishable" }
]
```

**Rationale:**
- Links must be visually distinct (underline or strong color contrast)
- <0.3 distinction score = links blend into body text
- Reduces usability and increases frustration

---

### 3.6 Accessibility & Standards (10%)

#### 3.6.1 Semantic HTML (25% of category)

**Description:** Proper use of semantic elements (header, main, nav, footer, article).

**Signals:**
- `semanticLandmarks`: Count of semantic landmark elements
- `divSoupRatio`: Ratio of div elements to total elements

**Scoring Rules:**
```typescript
rules: [
  { signalId: "semanticLandmarks", condition: (v) => v < 3, points: -8,
    label: "Missing major landmarks (<3)" },
  { signalId: "divSoupRatio", condition: (v) => v > 0.8, points: -6,
    label: "Div soup (>80% div elements)" }
]
```

**Rationale:**
- Semantic landmarks improve screen reader navigation
- <3 landmarks = missing header/main/footer (minimum viable)
- Div soup >80% indicates no semantic structure

---

#### 3.6.2 ARIA Implementation (20% of category)

**Description:** Correct and necessary ARIA roles, labels, and live regions.

**Signals:**
- `ariaErrors`: Count of invalid ARIA attributes
- `missingAriaLabels`: Count of interactive elements missing ARIA labels

**Scoring Rules:**
```typescript
rules: [
  { signalId: "ariaErrors", condition: (v) => v > 0, points: -5,
    label: "Invalid ARIA attributes (per error)" },
  { signalId: "missingAriaLabels", condition: (v) => v > 3, points: -6,
    label: "Many interactive elements missing ARIA labels" }
]
```

**Rationale:**
- Invalid ARIA is worse than no ARIA (breaks screen readers)
- >3 missing labels indicates systemic accessibility gap
- ARIA should enhance, not replace, semantic HTML

---

#### 3.6.3 Keyboard Navigation (25% of category)

**Description:** All interactive elements reachable and operable via keyboard.

**Signals:**
- `tabOrderBroken`: Boolean (0/1) for broken tab order
- `focusTraps`: Count of focus trap instances
- `skipNav`: Boolean (0/1) for skip navigation link presence

**Scoring Rules:**
```typescript
rules: [
  { signalId: "tabOrderBroken", condition: (v) => v > 0, points: -8,
    label: "Broken tab order" },
  { signalId: "focusTraps", condition: (v) => v > 0, points: -12,
    label: "Focus trap detected" },
  { signalId: "skipNav", condition: (v) => v === 0, points: -4,
    label: "Missing skip navigation link" }
]
```

**Rationale:**
- Broken tab order prevents keyboard navigation
- Focus traps are severe accessibility failures
- Skip nav link is WCAG AA requirement for long nav menus

---

#### 3.6.4 Alt Text & Media (15% of category)

**Description:** All meaningful images have descriptive alt text.

**Signals:**
- `altTextCoverage`: Proportion of images with alt text (0-1)

**Scoring Rules:**
```typescript
rules: [
  { signalId: "altTextCoverage", condition: (v) => v < 0.5, points: -12,
    label: "Less than 50% alt text coverage" },
  { signalId: "altTextCoverage", condition: (v) => v < 0.9 && v >= 0.5, points: -5,
    label: "Incomplete alt text coverage (50-90%)" }
]
```

**Rationale:**
- Alt text is fundamental accessibility requirement
- <50% coverage is severe failure
- 50-90% shows attempt but incomplete implementation

---

#### 3.6.5 Color Independence (15% of category)

**Description:** Information is not conveyed by color alone.

**Signals:**
- `colorOnlyIndicators`: Count of instances where color is sole information carrier

**Scoring Rules:**
```typescript
rules: [
  { signalId: "colorOnlyIndicators", condition: (v) => v > 0, points: -5,
    label: "Information conveyed by color alone" }
]
```

**Rationale:**
- WCAG requirement: color cannot be sole information carrier
- Affects colorblind users (8% of males, 0.5% of females)
- Requires redundant indicators (icons, text labels, patterns)

---

## 4. Signal Definitions

### 4.1 Signal Extraction Sources

Signals are extracted from three parallel analysis engines:

1. **DOM Analysis Engine** (Stage 2): Parses serialized DOM to extract structural signals
2. **Visual Analysis Engine** (Stage 3): Processes screenshots to extract visual signals
3. **Performance & Metrics Engine** (Stage 4): Audits performance to extract CWV and metrics

### 4.2 Signal Data Types

All signals are numeric (integers or floats):
- **Counts**: Integer values (e.g., `h1Count`, `ariaErrors`)
- **Ratios/Proportions**: Float 0.0-1.0 (e.g., `altTextCoverage`, `hoverStates`)
- **Percentages**: Float 0.0-100.0 (e.g., `centerOffset`)
- **Measurements**: Float with units (e.g., `lcpTime` in ms, `alignmentOffset` in px)
- **Booleans**: 0 or 1 (e.g., `navPresent`, `darkModeSupport`)

### 4.3 Cross-Viewport Aggregation

Signals are extracted at 3 viewports:
- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1440px width

**Aggregation formula:**
```
FinalSignalValue = (mobile × 1.2 + tablet × 1.0 + desktop × 1.0) / 3.2
```

Mobile receives 1.2x weighting to reflect mobile-first reality.

### 4.4 Complete Signal Catalog

| Signal ID | Type | Source | Description | Unit |
|-----------|------|--------|-------------|------|
| `h1Count` | Count | DOM | Number of H1 elements | integer |
| `headingLevelSkips` | Count | DOM | Heading hierarchy violations | integer |
| `headingSizeRatio` | Ratio | DOM | Avg font-size ratio between heading levels | float |
| `spacingVariance` | Ratio | Visual | Coefficient of variation in element spacing | float |
| `contentDensity` | Ratio | Visual | Content pixels / total viewport pixels | float (0-1) |
| `alignmentOffset` | Measurement | Visual | Median pixel offset from grid | float (px) |
| `gridConsistency` | Ratio | Visual | Proportion of grid-aligned elements | float (0-1) |
| `orphanRatio` | Ratio | DOM | Elements not in semantic containers | float (0-1) |
| `containerUsage` | Ratio | DOM | Elements in grouping containers | float (0-1) |
| `centerOffset` | Percentage | Visual | Center-of-mass offset from geometric center | float (%) |
| `quadrantDensity` | Ratio | Visual | Stddev of content density across quadrants | float |
| `fontFamilyCount` | Count | DOM | Distinct font families used | integer |
| `fontPairingScore` | Score | DOM | Computed font harmony score | float (0-1) |
| `avgLineLength` | Count | DOM | Average line length in characters | integer |
| `maxLineLength` | Count | DOM | Maximum line length observed | integer |
| `lineHeightRatio` | Ratio | DOM | Line-height / font-size | float |
| `verticalRhythmVariance` | Ratio | DOM | CV of vertical spacing | float |
| `minContrastRatio` | Ratio | Perf | Minimum text contrast ratio | float |
| `wcagAAFailures` | Count | Perf | WCAG AA contrast failures | integer |
| `textOverflowCount` | Count | Visual | Text overflow instances | integer |
| `fontScaleBreakpoints` | Count | DOM | Breakpoints with font scaling | integer |
| `uniqueHues` | Count | DOM | Distinct hue values (0-360°) | integer |
| `paletteHarmony` | Score | DOM | Computed color harmony score | float (0-1) |
| `interactiveContrast` | Ratio | Perf | Min contrast for interactive elements | float |
| `focusIndicators` | Boolean | Perf | Visible focus indicators present | 0 or 1 |
| `stretchedImages` | Count | Visual | Images with aspect ratio distortion | integer |
| `missingAltText` | Count | DOM | Images without alt attributes | integer |
| `buttonStyleVariance` | Count | DOM | Distinct button style variations | integer |
| `linkStyleVariance` | Count | DOM | Distinct link style variations | integer |
| `darkModeSupport` | Boolean | DOM | Dark mode implementation | 0 or 1 |
| `brokenBreakpoints` | Count | Visual | Breakpoints with layout issues | integer |
| `layoutShifts` | Count | Visual | Layout reflows across breakpoints | integer |
| `undersizedTargets` | Count | Perf | Interactive elements <44px | integer |
| `cumulativeLayoutShift` | Measurement | Perf | CLS score from CWV | float |
| `lcpTime` | Measurement | Perf | LCP time in milliseconds | integer (ms) |
| `viewportCorrect` | Boolean | DOM | Proper viewport meta tag | 0 or 1 |
| `horizontalScroll` | Boolean | Visual | Horizontal scroll detected | 0 or 1 |
| `navPresent` | Boolean | DOM | Identifiable nav element | 0 or 1 |
| `navItemCount` | Count | DOM | Top-level navigation items | integer |
| `hoverStates` | Ratio | DOM | Elements with hover states | float (0-1) |
| `focusStates` | Ratio | Perf | Elements with focus states | float (0-1) |
| `ctaAboveFold` | Boolean | Visual | CTA presence above fold | 0 or 1 |
| `ctaContrast` | Ratio | Perf | CTA contrast vs background | float |
| `missingLabels` | Count | DOM | Form inputs without labels | integer |
| `hasValidation` | Boolean | DOM | Client-side validation present | 0 or 1 |
| `linkDistinction` | Score | DOM | Link visual distinction score | float (0-1) |
| `semanticLandmarks` | Count | DOM | Semantic landmark elements | integer |
| `divSoupRatio` | Ratio | DOM | Div elements / total elements | float (0-1) |
| `ariaErrors` | Count | Perf | Invalid ARIA attributes | integer |
| `missingAriaLabels` | Count | Perf | Interactive elements missing labels | integer |
| `tabOrderBroken` | Boolean | Perf | Broken tab order detected | 0 or 1 |
| `focusTraps` | Count | Perf | Focus trap instances | integer |
| `skipNav` | Boolean | DOM | Skip nav link present | 0 or 1 |
| `altTextCoverage` | Ratio | DOM | Images with alt text | float (0-1) |
| `colorOnlyIndicators` | Count | Visual | Color-only information instances | integer |

**Total:** 54 signals across 6 categories

---

## 5. Scoring Rules Engine

### 5.1 Rule Structure

Each scoring rule is a deterministic function:

```typescript
interface ScoringRule {
  signalId: string;                         // Signal to evaluate
  condition: (value: number) => boolean;    // Pure function: true = apply
  points: number;                           // Negative = deduction, positive = bonus
  label: string;                            // Human-readable explanation
}
```

### 5.2 Rule Evaluation Algorithm

```typescript
function scoreSubCriterion(
  sub: SubCriterion,
  signals: Map<string, number>
): SubCriterionResult {
  let rawScore = 100;  // Start at perfect score
  const appliedRules: AppliedRule[] = [];

  // Evaluate each rule
  for (const rule of sub.rules) {
    const signalValue = signals.get(rule.signalId);

    // Only apply rule if signal exists and condition is true
    if (signalValue !== undefined && rule.condition(signalValue)) {
      rawScore += rule.points;  // Add points (negative = deduct)
      appliedRules.push({
        label: rule.label,
        points: rule.points,
        signalValue: signalValue
      });
    }
  }

  // Clamp to [0, 100]
  rawScore = Math.max(0, Math.min(100, rawScore));

  return {
    id: sub.id,
    name: sub.name,
    rawScore,
    weight: sub.weight,
    weightedScore: rawScore * sub.weight,
    appliedRules
  };
}
```

### 5.3 Rule Priority & Conflicts

Rules within a sub-criterion can have overlapping conditions (e.g., multiple thresholds). All matching rules fire independently:

```typescript
// Example: Multiple threshold rules
rules: [
  { signalId: "avgLineLength", condition: (v) => v > 90, points: -10 },
  { signalId: "avgLineLength", condition: (v) => v > 80 && v <= 90, points: -5 },
  { signalId: "avgLineLength", condition: (v) => v < 35, points: -5 }
]

// If avgLineLength = 95, only the first rule fires: -10 points
// If avgLineLength = 85, only the second rule fires: -5 points
// If avgLineLength = 30, only the third rule fires: -5 points
```

**Design principle:** Use mutually exclusive conditions (non-overlapping ranges) to avoid unintended stacking.

### 5.4 Bonus Points

Bonus points are rare and used for optional enhancements:
- Dark mode support: +5 points
- WCAG AAA contrast: +3 points

**Philosophy:** Bonus points reward going beyond requirements but don't significantly impact score distribution.

---

## 6. Recommendation Engine

### 6.1 Recommendation Generation

After scoring, the recommendation engine identifies highest-impact improvements:

```typescript
function generateRecommendations(
  categories: CategoryResult[],
  signals: Map<string, number>
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const cat of categories) {
    for (const sub of cat.subcriteria) {
      // Only recommend for sub-criteria scoring below 85
      if (sub.rawScore < 85) {
        for (const rule of sub.appliedRules) {
          // Only negative deductions (not bonuses)
          if (rule.points < 0) {
            const severity = classifySeverity(rule.points);
            recs.push({
              category: cat.name,
              subcriteria: sub.name,
              severity,
              title: rule.label,
              description: generateDescription(sub, rule),
              estimatedUplift: Math.abs(rule.points),
              signalId: rule.signalId,
              currentValue: rule.signalValue,
              targetValue: calculateTarget(rule)
            });
          }
        }
      }
    }
  }

  // Sort by estimated uplift descending (highest-impact first)
  recs.sort((a, b) => b.estimatedUplift - a.estimatedUplift);

  return recs.slice(0, 10);  // Return top 10 recommendations
}
```

### 6.2 Severity Classification

```typescript
function classifySeverity(points: number): Severity {
  if (points <= -10) return "critical";    // Red
  if (points <= -5) return "major";        // Orange
  if (points < 0) return "minor";          // Blue
  return "suggestion";                     // Green (for future use)
}
```

### 6.3 Recommendation Output Format

```typescript
interface Recommendation {
  category: string;              // "Typography & Readability"
  subcriteria: string;           // "Line Length"
  severity: "critical" | "major" | "minor" | "suggestion";
  title: string;                 // "Lines far too long (>90 chars)"
  description: string;           // Detailed explanation
  estimatedUplift: number;       // Potential score increase
  signalId: string;              // "avgLineLength"
  currentValue: number;          // 105 (chars)
  targetValue: string | number;  // "65-75 chars"
}
```

### 6.4 Recommendation Ranking Logic

Recommendations are sorted by:
1. **Primary:** Estimated uplift (descending)
2. **Secondary:** Severity (critical > major > minor)
3. **Tertiary:** Category weight (descending)

This prioritizes:
- Fixes with highest score impact
- Critical issues over minor polish
- High-weight categories (visual quality over accessibility)

---

## 7. Analysis Pipeline

### 7.1 Pipeline Overview

The analysis pipeline consists of 6 stages, with stages 2-4 running in parallel:

```
┌─────────────────────────────────────────────────────────┐
│  STAGE 1: URL Ingestion & Rendering (sequential)       │
│  8-12 seconds                                           │
│  - Launch headless browser (Playwright)                 │
│  - Render at 3 viewports (375/768/1440px)              │
│  - Capture full-page screenshots                        │
│  - Serialize DOM to JSON                                │
│  - Collect HAR log + performance timing                 │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────────┐
        ▼                         ▼
┌───────────────────┐   ┌───────────────────┐
│  STAGE 2: DOM     │   │  STAGE 3: Visual  │
│  Analysis         │   │  Analysis         │
│  (parallel)       │   │  (parallel)       │
│  2-4 seconds      │   │  3-6 seconds      │
│  - Parse DOM      │   │  - Process        │
│  - Extract        │   │    screenshots    │
│    structural     │   │  - Grid detection │
│    signals        │   │  - Visual weight  │
│  - Compute        │   │  - Whitespace     │
│    styles         │   │    analysis       │
└───────────────────┘   └───────────────────┘
        │                         │
        └──────────┬──────────────┘
                   │         ┌───────────────────┐
                   │         │  STAGE 4: Perf    │
                   │         │  & Metrics        │
                   │         │  (parallel)       │
                   │         │  2-5 seconds      │
                   ├─────────┤  - Lighthouse CI  │
                   │         │  - axe-core       │
                   │         │  - CWV metrics    │
                   │         └───────────────────┘
                   │
        ┌──────────┴──────────────┐
        ▼                         ▼
┌───────────────────┐   ┌───────────────────┐
│  STAGE 5: Score   │   │  STAGE 6: Recs    │
│  Computation      │   │  Generation       │
│  (sequential)     │   │  (sequential)     │
│  <500ms           │   │  <200ms           │
│  - Apply rules    │   │  - Match rules    │
│  - Compute scores │   │  - Rank by impact │
│  - Calculate CI   │   │  - Generate text  │
└───────────────────┘   └───────────────────┘
```

### 7.2 Stage 1: URL Ingestion & Rendering

**Input:** Target URL string
**Output:** Serialized DOM (3x), Screenshots (3x), HAR log, Performance timing
**Tech Stack:** Playwright, Chrome DevTools Protocol, Node.js worker
**Timeout:** 15 seconds per viewport (45s total, but concurrent)

**Process:**
1. Validate URL format and accessibility
2. Launch Playwright browser instance (Chromium)
3. For each viewport (375, 768, 1440):
   - Set viewport dimensions
   - Navigate to URL with network monitoring
   - Wait for DOMContentLoaded + 2s settle time
   - Capture full-page screenshot (PNG)
   - Serialize DOM to JSON via CDP
4. Collect HAR log and performance timing API data
5. Close browser instance

**Error Handling:**
- Timeout after 15s per viewport
- Retry once on network errors
- Return partial results if 2/3 viewports succeed

### 7.3 Stage 2: DOM Analysis Engine

**Input:** Serialized DOM (3x)
**Output:** Structural signals (heading hierarchy, semantic elements, ARIA, forms, color palette)
**Tech Stack:** JSDOM, CSS extraction, Custom AST walker
**Timeout:** 10 seconds

**Process:**
1. Parse serialized DOM to JSDOM document
2. Extract heading structure (H1-H6 counts, level skips, size ratios)
3. Extract semantic elements (landmarks, containers, lists)
4. Extract ARIA attributes and validate against spec
5. Extract form structure (labels, validation attributes)
6. Extract computed styles via inline style extraction
7. Build color palette from all color declarations
8. Compute DOM-based signals (font families, spacing, etc.)

**Parallel Optimization:** Runs concurrently with Stages 3 & 4

### 7.4 Stage 3: Visual Analysis Engine

**Input:** Full-page screenshots (3x)
**Output:** Visual signals (grid alignment, visual balance, whitespace, content density)
**Tech Stack:** Sharp (libvips), Canvas pixel analysis, Edge detection
**Timeout:** 10 seconds

**Process:**
1. Load screenshots into Sharp image processing pipeline
2. Convert to grayscale for content density analysis
3. Run edge detection (Canny algorithm) to identify elements
4. Detect grid columns via histogram analysis
5. Compute visual center-of-mass
6. Analyze whitespace patterns (Voronoi diagram)
7. Compute alignment offsets from detected grid
8. Detect layout shifts by comparing viewports

**Parallel Optimization:** Runs concurrently with Stages 2 & 4

### 7.5 Stage 4: Performance & Metrics Engine

**Input:** HAR log, Performance timing, DOM (3x)
**Output:** Core Web Vitals, WCAG contrast audit, Touch target report, Responsive audit
**Tech Stack:** Lighthouse CI, axe-core, Custom CWV collector
**Timeout:** 10 seconds

**Process:**
1. Run Lighthouse CI for CWV metrics (LCP, CLS, INP)
2. Run axe-core for accessibility audit
3. Extract contrast ratios for text and interactive elements
4. Measure touch target sizes on mobile viewport
5. Analyze responsive behavior across viewports
6. Compute focus state coverage

**Parallel Optimization:** Runs concurrently with Stages 2 & 3

### 7.6 Stage 5: Score Computation

**Input:** All signal maps from Stages 2-4
**Output:** Sub-criterion scores, Category scores, Final score, Confidence interval
**Tech Stack:** Custom scoring engine (TypeScript)
**Timeout:** 1 second

**Process:**
1. Aggregate signals across viewports (mobile-weighted average)
2. For each category:
   - For each sub-criterion:
     - Evaluate all rules against signal map
     - Compute raw score (100 + sum of applied rule points)
     - Clamp to [0, 100]
     - Compute weighted score (raw × sub-weight)
   - Sum weighted sub-criterion scores = category score
3. Sum weighted category scores = final score
4. Compute confidence interval (1.96 × σ of category scores)
5. Classify grade (Excellent/Good/Needs Improvement/Poor)

### 7.7 Stage 6: Recommendation Generation

**Input:** All scores, Signal map, Rule database
**Output:** Prioritized recommendation list (top 10)
**Tech Stack:** Rule engine, Impact estimation, Template renderer
**Timeout:** 1 second

**Process:**
1. Identify sub-criteria with score <85
2. Extract applied rules with negative points
3. For each rule:
   - Classify severity (critical/major/minor)
   - Generate description with current/target values
   - Estimate uplift (absolute value of points)
4. Sort recommendations by uplift (descending)
5. Return top 10 recommendations

### 7.8 Pipeline Performance Budget

| Stage | Time Budget | Optimization Strategy |
|-------|-------------|----------------------|
| 1. Rendering | 12s | Concurrent viewport rendering |
| 2. DOM Analysis | 4s | Parallel with Stages 3 & 4 |
| 3. Visual Analysis | 6s | Parallel with Stages 2 & 4 |
| 4. Performance | 5s | Parallel with Stages 2 & 3 |
| 5. Scoring | 0.5s | Pre-compiled rule functions |
| 6. Recommendations | 0.2s | Top-N heap for sorting |
| **Total Wall-Clock** | **~18-22s** | (Stage 1) + max(2,3,4) + (5,6) |

**Target:** <30 seconds end-to-end

---

## 8. System Architecture

### 8.1 High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                    │
│  - URL input form                                          │
│  - Real-time progress updates (WebSocket)                  │
│  - Score visualization                                     │
│  - Recommendation display                                  │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ HTTPS (REST API)
                 ▼
┌────────────────────────────────────────────────────────────┐
│               API Layer (Next.js API Routes)               │
│  - POST /api/analyze (submit URL)                         │
│  - GET /api/results/:jobId (poll for results)             │
│  - WS /api/ws (real-time updates)                         │
│  - Authentication (JWT)                                    │
│  - Rate limiting (Redis)                                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ Job Enqueue
                 ▼
┌────────────────────────────────────────────────────────────┐
│              Analysis Queue (Redis + BullMQ)               │
│  - Job queue management                                    │
│  - Worker scaling                                          │
│  - Retry logic                                             │
│  - Result caching (24h TTL)                                │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ Job Dispatch
                 ▼
┌────────────────────────────────────────────────────────────┐
│           Worker Pool (Docker Containers)                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Worker Instance (Node.js + Playwright)             │ │
│  │  1. Render URL                                       │ │
│  │  2. Extract signals (parallel DOM/Visual/Perf)      │ │
│  │  3. Compute score                                    │ │
│  │  4. Generate recommendations                         │ │
│  │  5. Return result                                    │ │
│  └──────────────────────────────────────────────────────┘ │
│  ... (auto-scaled based on queue depth)                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ Store Results
                 ▼
┌────────────────────────────────────────────────────────────┐
│                    Data Persistence                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ PostgreSQL   │  │ Redis Cache  │  │ S3-Compatible  │  │
│  │ - Scan hist  │  │ - Results    │  │ - Screenshots  │  │
│  │ - Scores     │  │ - Job state  │  │ - DOM dumps    │  │
│  │ - Users      │  │ - Rate limit │  │ - Report PDFs  │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Infrastructure Components

**Frontend:**
- **Framework:** Next.js 15 (App Router)
- **Deployment:** Vercel Edge Network (CDN)
- **State Management:** React Context + SWR for data fetching
- **Real-time Updates:** WebSocket connection to API

**API Layer:**
- **Framework:** Next.js API Routes (serverless functions)
- **Authentication:** JWT tokens (stored in httpOnly cookies)
- **Rate Limiting:** Redis sliding window (10 req/min default)
- **CORS:** Restricted to known domains

**Analysis Queue:**
- **Queue System:** BullMQ (Redis-backed job queue)
- **Concurrency:** 10 concurrent jobs per worker instance
- **Retry Logic:** 3 retries with exponential backoff
- **Priority:** Premium users get priority queue

**Worker Pool:**
- **Runtime:** Node.js 20+ (LTS)
- **Containerization:** Docker images with Playwright + dependencies
- **Orchestration:** Kubernetes (auto-scaling based on queue depth)
- **Timeout:** 30s per job (hard kill after 45s)

**Data Stores:**
- **PostgreSQL:** Primary data store (scan history, user accounts, scores)
- **Redis:** Caching (24h TTL), job queue, rate limiting
- **S3:** Object storage (screenshots, DOM dumps, PDF reports)

### 8.3 Deployment Architecture

**Production Environment:**
- **Frontend:** Vercel (Edge Network)
- **API + Workers:** AWS ECS Fargate (container orchestration)
- **Database:** AWS RDS PostgreSQL (Multi-AZ)
- **Cache:** AWS ElastiCache Redis (cluster mode)
- **Storage:** AWS S3 (Standard tier)
- **Monitoring:** Datadog (metrics, logs, traces)

**Scaling Strategy:**
- **Horizontal Scaling:** Worker instances scale based on Redis queue depth
- **Target:** Queue depth <10 jobs per worker
- **Min Workers:** 2 (always-on for instant processing)
- **Max Workers:** 50 (cost ceiling)

### 8.4 Security Considerations

**Input Validation:**
- URL format validation (must be valid HTTP/HTTPS)
- Domain allowlist for enterprise accounts
- Request size limits (URL + headers <10KB)

**Sandboxing:**
- Playwright runs in isolated Docker containers
- Network egress restricted to port 80/443
- Filesystem access limited to /tmp
- Process timeout enforced

**Data Protection:**
- Results cached with anonymized keys
- PII removed from stored DOM snapshots
- Screenshots auto-deleted after 7 days
- GDPR compliance (right to deletion)

---

## 9. API Contracts

### 9.1 POST /api/analyze

**Submit a URL for analysis**

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "includeScreenshots": true,  // Optional: include screenshots in result
    "priority": "normal"          // Optional: "normal" | "high" (premium only)
  }
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "job_abc123xyz",
  "status": "queued",
  "estimatedTime": 25,  // seconds
  "resultsUrl": "/api/results/job_abc123xyz"
}
```

### 9.2 GET /api/results/:jobId

**Poll for analysis results**

**Response (200 OK - Complete):**
```json
{
  "jobId": "job_abc123xyz",
  "status": "completed",
  "completedAt": "2026-02-13T19:45:30Z",
  "result": {
    "finalScore": 78,
    "confidence": 8,
    "grade": "Good",
    "gradeColor": "#14b8a6",
    "categories": [
      {
        "id": "visual-hierarchy",
        "name": "Visual Hierarchy & Layout",
        "weight": 0.25,
        "rawScore": 82,
        "weightedScore": 20.5,
        "subcriteria": [
          {
            "id": "heading-structure",
            "name": "Heading Structure",
            "rawScore": 85,
            "weight": 0.2,
            "weightedScore": 17,
            "appliedRules": [
              {
                "label": "Heading level skip detected",
                "points": -3,
                "signalValue": 1
              }
            ]
          }
          // ... more sub-criteria
        ]
      }
      // ... more categories
    ],
    "recommendations": [
      {
        "category": "Typography & Readability",
        "subcriteria": "Text Contrast",
        "severity": "critical",
        "title": "Contrast below WCAG AA (4.5:1)",
        "description": "Text contrast ratio is 4.2:1, below the WCAG AA minimum of 4.5:1. Increase foreground/background contrast to improve readability.",
        "estimatedUplift": 8,
        "signalId": "minContrastRatio",
        "currentValue": 4.2,
        "targetValue": "4.5:1 or higher"
      }
      // ... more recommendations (top 10)
    ],
    "metadata": {
      "url": "https://example.com",
      "analyzedAt": "2026-02-13T19:45:00Z",
      "viewports": ["375px", "768px", "1440px"],
      "analysisTime": 22.4
    }
  }
}
```

**Response (202 Accepted - In Progress):**
```json
{
  "jobId": "job_abc123xyz",
  "status": "processing",
  "progress": {
    "currentStage": "Visual Analysis",
    "stageNumber": 3,
    "totalStages": 6,
    "percentComplete": 50
  }
}
```

**Response (400 Bad Request - Failed):**
```json
{
  "jobId": "job_abc123xyz",
  "status": "failed",
  "error": {
    "code": "TIMEOUT",
    "message": "Analysis timed out after 30 seconds"
  }
}
```

### 9.3 WebSocket /api/ws

**Real-time progress updates**

**Client → Server (Subscribe):**
```json
{
  "type": "subscribe",
  "jobId": "job_abc123xyz"
}
```

**Server → Client (Progress Update):**
```json
{
  "type": "progress",
  "jobId": "job_abc123xyz",
  "status": "processing",
  "stage": "DOM Analysis",
  "stageNumber": 2,
  "totalStages": 6,
  "percentComplete": 33
}
```

**Server → Client (Complete):**
```json
{
  "type": "complete",
  "jobId": "job_abc123xyz",
  "result": {
    // Same structure as GET /api/results/:jobId
  }
}
```

---

## 10. Implementation Roadmap

### 10.1 Phase 1: Core Algorithm (Weeks 1-4)

**Goal:** Build and test the scoring engine in isolation

**Tasks:**
1. Implement TypeScript scoring engine with all 30 sub-criteria
2. Create signal mocks for testing
3. Build unit tests for each sub-criterion
4. Validate scoring formula accuracy
5. Build recommendation engine
6. Create scoring visualization UI

**Deliverables:**
- Scoring engine library (`@designchecker/scoring-engine`)
- 100+ unit tests
- Scoring playground page in Next.js app

---

### 10.2 Phase 2: Signal Extraction (Weeks 5-8)

**Goal:** Build the 3 parallel analysis engines

**Tasks:**
1. Implement Stage 1: URL rendering with Playwright
2. Implement Stage 2: DOM analysis engine
3. Implement Stage 3: Visual analysis engine
4. Implement Stage 4: Performance metrics engine
5. Integrate all stages into unified pipeline
6. Build signal validation and error handling

**Deliverables:**
- Analysis pipeline library (`@designchecker/analysis-pipeline`)
- Docker image with Playwright + dependencies
- Integration tests with real websites

---

### 10.3 Phase 3: Infrastructure (Weeks 9-12)

**Goal:** Deploy production-ready architecture

**Tasks:**
1. Set up Redis queue with BullMQ
2. Implement worker pool orchestration
3. Deploy to AWS ECS Fargate
4. Set up PostgreSQL database and migrations
5. Implement caching layer
6. Set up monitoring and alerting

**Deliverables:**
- Production infrastructure
- Auto-scaling configuration
- Monitoring dashboards

---

### 10.4 Phase 4: API & Frontend (Weeks 13-16)

**Goal:** Build public-facing API and UI

**Tasks:**
1. Implement REST API endpoints
2. Build WebSocket real-time updates
3. Create analysis submission UI
4. Build results visualization page
5. Implement PDF report generation
6. Add authentication and rate limiting

**Deliverables:**
- Public API (documented with OpenAPI spec)
- Results dashboard UI
- PDF report generator

---

### 10.5 Phase 5: Calibration & Optimization (Weeks 17-20)

**Goal:** Calibrate scoring against real-world data

**Tasks:**
1. Analyze HTTP Archive dataset for signal distributions
2. Implement log-normal calibration (Lighthouse approach)
3. Fine-tune category weights based on user feedback
4. Optimize pipeline performance (<20s target)
5. A/B test scoring algorithm variants
6. Collect agency feedback and iterate

**Deliverables:**
- Calibrated scoring model v2.0
- Performance optimizations
- Agency validation report

---

## Appendix A: Glossary

**Terms:**
- **Signal:** A measurable data point extracted from a website (e.g., `h1Count`)
- **Rule:** A condition-based function that applies points based on a signal value
- **Sub-criterion:** A specific design quality aspect (e.g., "Heading Structure")
- **Category:** A top-level design quality dimension (e.g., "Visual Hierarchy & Layout")
- **Raw Score:** Sub-criterion score before category weighting (0-100)
- **Weighted Score:** Sub-criterion score after applying weight (e.g., 85 × 0.2 = 17)
- **Composite Score:** Final aggregated score across all categories (0-100)
- **Confidence Interval:** Statistical measure of score consistency (±points, 95% CI)

---

## Appendix B: References

**Algorithm Design:**
- Google Lighthouse Scoring Guide: https://developer.chrome.com/docs/lighthouse/performance/scoring
- Web.dev Performance Metrics: https://web.dev/metrics/
- Nielsen Norman Group - Visual Hierarchy: https://www.nngroup.com/articles/visual-hierarchy/

**Accessibility Standards:**
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

**Performance Standards:**
- Core Web Vitals: https://web.dev/vitals/
- HTTP Archive: https://httparchive.org/

---

**End of Technical Specification**

---

*This document is production-ready for DE Step 7 implementation. All scoring rules, weights, and thresholds are specified deterministically. No further design decisions are required to begin implementation.*

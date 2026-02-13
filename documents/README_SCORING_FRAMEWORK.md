# DesignChecker Core Scoring Algorithm Framework

## Overview

This directory contains the complete technical specification for DesignChecker's core scoring algorithm — a production-ready framework that evaluates web design quality on a 0-100 scale.

## Key Documents

### **Primary Specification**
- **[2026-02-13_core_scoring_algorithm_framework.md](./2026-02-13_core_scoring_algorithm_framework.md)** (NEW)
  - **102-page comprehensive specification** for DE Step 7
  - Complete algorithm architecture with 3-level hierarchy
  - All 6 categories, 30 sub-criteria, 54 signals defined
  - 80+ deterministic scoring rules with explicit thresholds
  - Signal extraction pipeline specification
  - Recommendation engine architecture
  - System architecture and API contracts
  - Implementation roadmap (20-week plan)

### **Supporting Documentation**
- **[2026-02-13_scoring_algorithm_spec.md](./2026-02-13_scoring_algorithm_spec.md)** (Existing)
  - Earlier technical specification
  - Foundation for the comprehensive framework

## Algorithm Summary

### Scoring Model

**3-Level Hierarchical Weighted-Average:**
```
Final Score (0-100) = Σ(CategoryWeight × CategoryScore)
  ├─ Category Score = Σ(SubWeight × SubScore)
  │    └─ Sub Score = clamp(100 + Σ(RulePoints), 0, 100)
  └─ Confidence = ±1.96σ (95% CI)
```

### Categories & Weights

| Category | Weight | Sub-Criteria | Rationale |
|----------|--------|--------------|-----------|
| **Visual Hierarchy & Layout** | 25% | 5 | Most impactful first-impression factor |
| **Typography & Readability** | 20% | 5 | Text is 95% of web content |
| **Color & Visual Design** | 20% | 5 | Core visual design pillar |
| **Responsive Design & Performance** | 15% | 5 | Mobile-first reality |
| **Navigation & UX Patterns** | 10% | 5 | Critical for usability |
| **Accessibility & Standards** | 10% | 5 | Legal/ethical requirement |

### Key Features

1. **Transparent & Auditable**
   - Every point deduction traces to a specific rule
   - No black-box ML models
   - Agencies can explain scores to clients

2. **Agency-Focused Design**
   - Weights prioritize visual impact over technical correctness
   - Recommendations ranked by business impact
   - Client-facing language and metrics

3. **Production-Ready**
   - All rules, weights, and thresholds specified
   - Complete signal extraction pipeline defined
   - System architecture and API contracts documented
   - No further design decisions required

4. **Extensible Architecture**
   - New rules can be added without core changes
   - Category weights can be rebalanced
   - Future: Log-normal calibration (Lighthouse approach)

## Signal Extraction Pipeline

**6-Stage Pipeline (~20-25 seconds):**

```
Stage 1: Rendering (8-12s)
  ├─ Playwright headless browser
  └─ 3 viewports: 375/768/1440px

Stages 2-4: Parallel Analysis
  ├─ Stage 2: DOM Analysis (2-4s)
  │   └─ Structure, semantics, ARIA, styles
  ├─ Stage 3: Visual Analysis (3-6s)
  │   └─ Grid, balance, whitespace, density
  └─ Stage 4: Performance (2-5s)
      └─ CWV, contrast, touch targets

Stage 5: Score Computation (<500ms)
  └─ Apply rules, compute weighted scores

Stage 6: Recommendations (<200ms)
  └─ Rank by impact, generate descriptions
```

## Recommendation Engine

**Top 10 Recommendations Ranked By:**
1. Estimated score uplift (primary)
2. Severity (critical > major > minor)
3. Category weight (visual > standards)

**Severity Classification:**
- **Critical** (red): ≥10 point deduction
- **Major** (orange): 5-9 point deduction
- **Minor** (blue): <5 point deduction

## Implementation Status

**Current Phase:** DE Step 7 - Technical Architecture Definition

**Deliverables Completed:**
- ✅ Complete algorithm specification (102 pages)
- ✅ All scoring rules defined (80+ rules)
- ✅ Signal catalog (54 signals)
- ✅ API contracts specified
- ✅ System architecture designed
- ✅ Implementation roadmap (20 weeks)

**Next Steps:**
- Phase 1: Core Algorithm Implementation (Weeks 1-4)
- Phase 2: Signal Extraction (Weeks 5-8)
- Phase 3: Infrastructure (Weeks 9-12)
- Phase 4: API & Frontend (Weeks 13-16)
- Phase 5: Calibration & Optimization (Weeks 17-20)

## Example Scoring Output

```json
{
  "finalScore": 78,
  "confidence": 8,
  "grade": "Good",
  "categories": [
    {
      "name": "Visual Hierarchy & Layout",
      "rawScore": 82,
      "weight": 0.25,
      "subcriteria": [
        {
          "name": "Heading Structure",
          "rawScore": 85,
          "appliedRules": [
            {
              "label": "Heading level skip detected",
              "points": -3
            }
          ]
        }
      ]
    }
  ],
  "recommendations": [
    {
      "severity": "critical",
      "title": "Contrast below WCAG AA (4.5:1)",
      "estimatedUplift": 8,
      "currentValue": 4.2,
      "targetValue": "4.5:1 or higher"
    }
  ]
}
```

## Technology Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
**API:** Next.js API Routes, WebSocket (real-time)
**Analysis:** Playwright, JSDOM, Sharp, axe-core, Lighthouse CI
**Infrastructure:** Docker, Redis (BullMQ), PostgreSQL, S3
**Deployment:** Vercel (frontend), AWS ECS Fargate (workers)

## References

- Full specification: [2026-02-13_core_scoring_algorithm_framework.md](./2026-02-13_core_scoring_algorithm_framework.md)
- Google Lighthouse Scoring: https://developer.chrome.com/docs/lighthouse/performance/scoring
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- Core Web Vitals: https://web.dev/vitals/

---

**Status:** Production-ready specification complete. Ready for implementation.

**Date:** February 13, 2026

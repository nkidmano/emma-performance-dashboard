export const CORE_WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
} as const;

export const CORE_VITALS_THRESHOLD_COLORS = {
  good: "#4ADE80", // Green
  needsImprovement: "#FACC15", // Yellow
  poor: "#F87171", // Red
} as const;

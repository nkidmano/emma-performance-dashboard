
export type PageSpeedDistributionItem = {
  min: number;
  max?: number;
  proportion: number;
}

export type MetricData = {
  percentile: number;
  distributions: PageSpeedDistributionItem[];
  category: 'FAST' | 'AVERAGE' | 'SLOW';
}

export type PageSpeedLoadingExperience = {
  id: string;
  metrics: {
    LARGEST_CONTENTFUL_PAINT_MS?: MetricData;
    CUMULATIVE_LAYOUT_SHIFT_SCORE?: MetricData;
    FIRST_CONTENTFUL_PAINT_MS?: MetricData;
    EXPERIMENTAL_TIME_TO_FIRST_BYTE?: MetricData;
    INTERACTION_TO_NEXT_PAINT?: MetricData;
  };
  overall_category: 'FAST' | 'AVERAGE' | 'SLOW';
  initial_url: string;
}

export type PageSpeedPerformanceResponse = {
  id: string;
  loadingExperience: PageSpeedLoadingExperience;
  analysisUTCTimestamp: string;
}
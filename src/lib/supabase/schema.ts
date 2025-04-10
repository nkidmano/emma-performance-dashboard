export type PagespeedDistributionSchema = {
  id: number;
  metric_id: number;
  range_type: string;
  min_value: number;
  max_value: number;
  proportion: number;
};

export type PagespeedMetricSchema = {
  id: number;
  test_id: number;
  metric_name: string;
  percentile: number;
  category: string;
};

export type PagespeedTestSchema = {
  id: number;
  url: string;
  test_date: Date;
  device_type: string;
  overall_category: string;
};

export interface Database {
  public: {
    Tables: {
      pagespeed_metrics: {
        Row: PagespeedMetricSchema;
        Insert: PagespeedMetricSchema;
        Update: Partial<PagespeedMetricSchema>;
      };
      pagespeed_tests: {
        Row: PagespeedTestSchema;
        Insert: PagespeedTestSchema;
        Update: Partial<PagespeedTestSchema>;
      };
      pagespeed_distributions: {
        Row: PagespeedDistributionSchema;
        Insert: PagespeedDistributionSchema;
        Update: Partial<PagespeedDistributionSchema>;
      };
    };
  };
}

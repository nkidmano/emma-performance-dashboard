export type PageSpeedDistributionSchema = {
  id: number;
  metric_id: number;
  range_type: string;
  min_value: number;
  max_value: number;
  proportion: number;
};

export type PageSpeedMetricSchema = {
  id: number;
  test_id: number;
  metric_name: string;
  percentile: number;
  category: string;
};

export type PageSpeedTestSchema = {
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
        Row: PageSpeedMetricSchema;
        Insert: PageSpeedMetricSchema;
        Update: Partial<PageSpeedMetricSchema>;
      };
      pagespeed_tests: {
        Row: PageSpeedTestSchema;
        Insert: PageSpeedTestSchema;
        Update: Partial<PageSpeedTestSchema>;
      };
      pagespeed_distributions: {
        Row: PageSpeedDistributionSchema;
        Insert: PageSpeedDistributionSchema;
        Update: Partial<PageSpeedDistributionSchema>;
      };
    };
  };
}

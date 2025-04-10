import { NextRequest, NextResponse } from "next/server";
import { getPagespeedSummaryTests } from "@/lib/supabase/queries/pagespeed-summary";
import { createApiClient } from "@/lib/supabase/api";

interface DistributionItem {
  min: number;
  max?: number;
  proportion: number;
}

interface MetricData {
  percentile: number;
  distributions: DistributionItem[];
  category: "FAST" | "AVERAGE" | "SLOW";
}

interface LoadingExperience {
  id: string;
  metrics: {
    LARGEST_CONTENTFUL_PAINT_MS?: MetricData;
    CUMULATIVE_LAYOUT_SHIFT_SCORE?: MetricData;
    FIRST_CONTENTFUL_PAINT_MS?: MetricData;
    EXPERIMENTAL_TIME_TO_FIRST_BYTE?: MetricData;
    INTERACTION_TO_NEXT_PAINT?: MetricData;
  };
  overall_category: "FAST" | "AVERAGE" | "SLOW";
  initial_url: string;
}

interface PagespeedResponse {
  id: string;
  loadingExperience: LoadingExperience;
  analysisUTCTimestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient();

    const { data, error } = await getPagespeedSummaryTests(supabase);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the data to be more frontend-friendly
    const formattedData = data?.map((row) => ({
      id: row.test_id,
      url: row.url,
      test_date: row.test_date,
      device_type: row.device_type,
      overall_category: row.overall_category,
      metrics: {
        LCP: {
          value: row.lcp,
          category: row.lcp_category,
          distribution: row.lcp_distribution,
        },
        CLS: {
          value: row.cls,
          category: row.cls_category,
          distribution: row.cls_distribution,
        },
        FCP: {
          value: row.fcp,
          category: row.fcp_category,
          distribution: row.fcp_distribution,
        },
        TTFB: {
          value: row.ttfb,
          category: row.ttfb_category,
          distribution: row.ttfb_distribution,
        },
        INP: {
          value: row.inp,
          category: row.inp_category,
          distribution: row.inp_distribution,
        },
      },
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error: any) {
    console.error("Error retrieving Pagespeed reports:", error);
    return NextResponse.json(
      { error: "Failed to retrieve Pagespeed reports", message: error.message },
      { status: 500 },
    );
  }
}

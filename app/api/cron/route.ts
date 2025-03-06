import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

interface DistributionItem {
  min: number;
  max?: number;
  proportion: number;
}

interface MetricData {
  percentile: number;
  distributions: DistributionItem[];
  category: 'FAST' | 'AVERAGE' | 'SLOW';
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
  overall_category: 'FAST' | 'AVERAGE' | 'SLOW';
  initial_url: string;
}

interface PageSpeedResponse {
  id: string;
  loadingExperience: LoadingExperience;
  analysisUTCTimestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const strategy = searchParams.get('strategy') ?? 'mobile'; // Default to mobile

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const data = await fetchPageSpeedData(url, strategy);

    // Store data in Supabase
    const result = await storePageSpeedData(supabase, data, strategy);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing PageSpeed data:', error);
    return NextResponse.json(
      { error: 'Failed to process PageSpeed data', message: error.message,err: error },
      { status: 500 }
    );
  }
}

async function fetchPageSpeedData(url: string, strategy: string = 'mobile'): Promise<PageSpeedResponse> {
  const API_KEY = process.env.PAGESPEED_API_KEY;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&strategy=${strategy}&key=${API_KEY}`;

  const response = await fetch(apiUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`PageSpeed API responded with status: ${response.status}`);
  }

  return await response.json();
}

async function storePageSpeedData(supabase: any, data: PageSpeedResponse, deviceType: string) {
  // 1. First, insert the test record
  const { data: testData, error: testError } = await supabase
    .from('pagespeed_tests')
    .insert({
      url: data.id,
      test_date: data.analysisUTCTimestamp,
      device_type: deviceType,
      overall_category: data.loadingExperience.overall_category,
      raw_data: data // Store the full JSON response
    })
    .select();

  if (testError) throw new Error(`Error inserting test data: ${testError.message}`);

  const testId = testData[0].id;

  // 2. Insert metrics
  const metricsToInsert = [];
  const metricDistributions = new Map();

  // Process each metric
  const metrics = data.loadingExperience.metrics;

  if (metrics.LARGEST_CONTENTFUL_PAINT_MS) {
    metricsToInsert.push({
      test_id: testId,
      metric_name: 'LARGEST_CONTENTFUL_PAINT_MS',
      percentile: metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile,
      category: metrics.LARGEST_CONTENTFUL_PAINT_MS.category
    });

    metricDistributions.set('LARGEST_CONTENTFUL_PAINT_MS', metrics.LARGEST_CONTENTFUL_PAINT_MS.distributions);
  }

  if (metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE) {
    metricsToInsert.push({
      test_id: testId,
      metric_name: 'CUMULATIVE_LAYOUT_SHIFT_SCORE',
      percentile: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile,
      category: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category
    });

    metricDistributions.set('CUMULATIVE_LAYOUT_SHIFT_SCORE', metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.distributions);
  }

  if (metrics.FIRST_CONTENTFUL_PAINT_MS) {
    metricsToInsert.push({
      test_id: testId,
      metric_name: 'FIRST_CONTENTFUL_PAINT_MS',
      percentile: metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
      category: metrics.FIRST_CONTENTFUL_PAINT_MS.category
    });

    metricDistributions.set('FIRST_CONTENTFUL_PAINT_MS', metrics.FIRST_CONTENTFUL_PAINT_MS.distributions);
  }

  if (metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE) {
    metricsToInsert.push({
      test_id: testId,
      metric_name: 'EXPERIMENTAL_TIME_TO_FIRST_BYTE',
      percentile: metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile,
      category: metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.category
    });

    metricDistributions.set('EXPERIMENTAL_TIME_TO_FIRST_BYTE', metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.distributions);
  }

  if (metrics.INTERACTION_TO_NEXT_PAINT) {
    metricsToInsert.push({
      test_id: testId,
      metric_name: 'INTERACTION_TO_NEXT_PAINT',
      percentile: metrics.INTERACTION_TO_NEXT_PAINT.percentile,
      category: metrics.INTERACTION_TO_NEXT_PAINT.category
    });

    metricDistributions.set('INTERACTION_TO_NEXT_PAINT', metrics.INTERACTION_TO_NEXT_PAINT.distributions);
  }

  // Insert all metrics
  const { data: metricsData, error: metricsError } = await supabase
    .from('pagespeed_metrics')
    .insert(metricsToInsert)
    .select();

  if (metricsError) throw new Error(`Error inserting metrics: ${metricsError.message}`);

  // 3. Insert distributions for each metric
  const distributionsToInsert = [];

  for (const metric of metricsData) {
    const metricName = metric.metric_name;
    const metricId = metric.id;
    const distributions = metricDistributions.get(metricName);

    if (distributions && distributions.length === 3) {
      // GOOD range (first distribution)
      distributionsToInsert.push({
        metric_id: metricId,
        range_type: 'GOOD',
        min_value: distributions[0].min,
        max_value: distributions[0].max,
        proportion: distributions[0].proportion
      });

      // NEEDS_IMPROVEMENT range (second distribution)
      distributionsToInsert.push({
        metric_id: metricId,
        range_type: 'NEEDS_IMPROVEMENT',
        min_value: distributions[1].min,
        max_value: distributions[1].max,
        proportion: distributions[1].proportion
      });

      // POOR range (third distribution)
      distributionsToInsert.push({
        metric_id: metricId,
        range_type: 'POOR',
        min_value: distributions[2].min,
        max_value: null, // Usually null for the last range
        proportion: distributions[2].proportion
      });
    }
  }

  // Insert all distributions
  const { data: distributionsData, error: distributionsError } = await supabase
    .from('pagespeed_distributions')
    .insert(distributionsToInsert);

  if (distributionsError) throw new Error(`Error inserting distributions: ${distributionsError.message}`);

  return {
    success: true,
    testId,
    metricsCount: metricsToInsert.length,
    distributionsCount: distributionsToInsert.length
  };
}

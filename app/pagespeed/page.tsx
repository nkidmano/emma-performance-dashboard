'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MetricDistribution } from '@/components/feature/pagespeed/MetricDistribution'
import { CORE_WEB_VITALS_THRESHOLDS } from '@/lib/constants'
import { Input } from '@/components/ui/input'

type DistributionItem = {
  min: number; max?: number; proportion: number;
}

type MetricData = {
  percentile: number;
  distributions: DistributionItem[];
  category: 'FAST' | 'AVERAGE' | 'SLOW';
}

type LoadingExperience = {
  id: string;
  metrics: {
    LARGEST_CONTENTFUL_PAINT_MS?: MetricData;
    INTERACTION_TO_NEXT_PAINT?: MetricData;
    CUMULATIVE_LAYOUT_SHIFT_SCORE?: MetricData;
    FIRST_CONTENTFUL_PAINT_MS?: MetricData;
    EXPERIMENTAL_TIME_TO_FIRST_BYTE?: MetricData;
  };
  overall_category: 'FAST' | 'AVERAGE' | 'SLOW'; initial_url: string;
}

type PageSpeedResponse = {
  id: string; loadingExperience: LoadingExperience; analysisUTCTimestamp: string;
}

interface Metrics {
  LCP: { name: string; metrics: { percentile: number | 'N/A'; distributions: DistributionItem[] } };
  INP: { name: string; metrics: { percentile: number | 'N/A'; distributions: DistributionItem[] } };
  CLS: { name: string; metrics: { percentile: number | 'N/A'; distributions: DistributionItem[] } };
  FCP: { name: string; metrics: { percentile: number | 'N/A'; distributions: DistributionItem[] } };
  TTFB: { name: string; metrics: { percentile: number | 'N/A'; distributions: DistributionItem[] } };
}

export default function Page() {
  const [url, setUrl] = useState<string>('')
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile')
  const [results, setResults] = useState<PageSpeedResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pagespeed?url=${url}&strategy=${strategy}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data: PageSpeedResponse = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(`Failed to fetch results: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const extractMetrics = (data: PageSpeedResponse): Metrics | null => {
    if (!data || !data.loadingExperience || !data.loadingExperience.metrics) {
      return null
    }

    const { metrics } = data.loadingExperience

    return {
      LCP: {
        name: 'Largest Contentful Paint', metrics: {
          percentile: metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile || 'N/A',
          distributions: metrics.LARGEST_CONTENTFUL_PAINT_MS?.distributions || [],
        },
      }, INP: {
        name: 'Interaction to Next Paint', metrics: {
          percentile: metrics.INTERACTION_TO_NEXT_PAINT?.percentile || 'N/A',
          distributions: metrics.INTERACTION_TO_NEXT_PAINT?.distributions || [],
        },
      }, CLS: {
        name: 'Cumulative Layout Shift', metrics: {
          percentile: (metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || 0) / 100 || 'N/A',
          distributions: metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.distributions || [],
        },
      }, FCP: {
        name: 'First Contentful Paint', metrics: {
          percentile: metrics.FIRST_CONTENTFUL_PAINT_MS?.percentile || 'N/A',
          distributions: metrics.FIRST_CONTENTFUL_PAINT_MS?.distributions || [],
        },
      }, TTFB: {
        name: 'Time to First Byte',
        metrics: {
          percentile: metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile || 'N/A',
          distributions: metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.distributions || [],
        },
      },

    }
  }

  const checkAssessmentPassed = (data: PageSpeedResponse): boolean => {
    const metrics = data.loadingExperience.metrics
    const CLS = metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE
    const LCP = metrics.LARGEST_CONTENTFUL_PAINT_MS
    const INP = metrics.INTERACTION_TO_NEXT_PAINT
    return CLS?.category === 'FAST' && LCP?.category === 'FAST' && INP?.category === 'FAST'
  }

  const metrics = results ? extractMetrics(results) : null
  const isAssessmentPassed = results ? checkAssessmentPassed(results) : null

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">PageSpeed Insights Checker</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="url" className="block mb-2 font-medium">
            Website URL
          </label>
          <Input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/*<div className="mb-4">*/}
        {/*  <label className="block mb-2 font-medium">Device</label>*/}
        {/*  <div className="flex space-x-4">*/}
        {/*    <label className="flex items-center">*/}
        {/*      <input*/}
        {/*        type="radio"*/}
        {/*        value="mobile"*/}
        {/*        checked={strategy === 'mobile'}*/}
        {/*        onChange={() => setStrategy('mobile')}*/}
        {/*        className="mr-2"*/}
        {/*      />*/}
        {/*      Mobile*/}
        {/*    </label>*/}
        {/*    <label className="flex items-center">*/}
        {/*      <input*/}
        {/*        type="radio"*/}
        {/*        value="desktop"*/}
        {/*        checked={strategy === 'desktop'}*/}
        {/*        onChange={() => setStrategy('desktop')}*/}
        {/*        className="mr-2"*/}
        {/*      />*/}
        {/*      Desktop*/}
        {/*    </label>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {!results ? <Button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Performance'}</Button> : <SaveReportButton pagespeedData={results} url={url} strategy={strategy} />}
      </form>

      {error && <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {loading && (
        <div className="text-center p-8">
          <p className="mb-2">Analyzing performance. This may take a minute...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
        </div>
      )}

      {results && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Results for {url}</h2>

          {metrics && (<div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <p>Core Web Vitals & Metrics</p>
              <p className={`px-4 py-1 rounded-full font-bold ${isAssessmentPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isAssessmentPassed ? 'PASSED' : 'FAILED'}</p>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(metrics).map(([key, value]) => (
                <MetricDistribution
                  key={key}
                  metricName={key}
                  metricFullName={value.name}
                  metricUnit=""
                  metricData={value.metrics}
                  thresholds={CORE_WEB_VITALS_THRESHOLDS[key as keyof typeof CORE_WEB_VITALS_THRESHOLDS]}
                />
              ))}
            </div>
          </div>)}

          <details className="mb-6">
            <summary className="cursor-pointer text-xl font-semibold p-2 bg-white rounded text-black">View Raw JSON Response</summary>
            <pre className="p-4 bg-white overflow-auto max-h-96 text-xs mt-2 rounded text-black">{JSON.stringify(results, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

interface SaveReportButton {
  pagespeedData: PageSpeedResponse | null
  url: string
  strategy: 'mobile' | 'desktop'
}

function SaveReportButton({ pagespeedData, url, strategy }: SaveReportButton) {
  const [loading, setLoading] = useState<boolean>(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, deviceType: strategy, pagespeedData }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      alert('Save successfully')
    } catch (err: any) {
      alert(`Failed to save results: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!pagespeedData) return null

  return (<Button
    type="button"
    onClick={handleSave}
    disabled={loading}
  >
    {loading ? 'Saving...' : 'Save'}
  </Button>)
}
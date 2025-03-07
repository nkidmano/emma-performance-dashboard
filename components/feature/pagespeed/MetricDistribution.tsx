import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CORE_VITALS_THRESHOLD_COLORS, CORE_WEB_VITALS_THRESHOLDS } from '@/lib/constants'
import { Pin } from './Pin'

interface MetricDistributionProps {
  metricData: { percentile: number; distributions: { min: number; max?: number; proportion: number }[] };
  metricName: string;
  metricFullName: string;
  metricUnit?: string;
  thresholds: typeof CORE_WEB_VITALS_THRESHOLDS[keyof typeof CORE_WEB_VITALS_THRESHOLDS];
}

export function MetricDistribution({ metricData, metricName, metricFullName, thresholds, }: MetricDistributionProps) {
  const colors = CORE_VITALS_THRESHOLD_COLORS
  const metricUnit = metricName === 'CLS' ? '' : 's'

  const getCategory = (value: number) => {
    if (!thresholds) return { name: 'Unknown', color: '#cbd5e1' }

    const { good, needsImprovement } = thresholds

    if (value <= good) return { name: 'Good', color: colors.good }
    if (value <= needsImprovement) return {
      name: 'Improvement', color: colors.needsImprovement,
    }
    return { name: 'Poor', color: colors.poor }
  }

  const getDistributionCategory = (min: number, max: number | undefined) => {
    if (metricName === 'CLS') {
      min = min / 100
      max = max ? max / 100 : undefined
    }

    if (max && max <= thresholds.good) return { name: 'Good', color: colors.good }
    if (min >= thresholds.needsImprovement) return { name: 'Poor', color: colors.poor }
    return { name: 'Improvement', color: colors.needsImprovement }
  }

  const formatPercentage = (proportion: number) => {
    return (proportion * 100).toFixed(1) + '%'
  }

  // Format value range for display
  const formatValueRange = (min: number, max: number | undefined) => {
    const dividend = metricName === 'CLS' ? 100 : 1000
    if (!max) return `> ${min / dividend}${metricUnit}`
    return `${min / dividend}-${max / dividend}${metricUnit}`
  }

  // Format the display value based on metric type
  const formatValue = (value: number) => {
    if (metricName === 'CLS') {
      return value.toFixed(2)
    }

    if (value < 1000) {
      return `${value}${metricUnit} ms`
    }

    return `${(value / 1000).toFixed(1)} s`
  }

  const renderPercentilePin = (percentile: number, min: number, max: number | undefined) => {
    if (metricName === 'CLS') {
      min = min / 100
      max = max ? max / 100 : undefined
    }

    if (percentile < min || (max && percentile > max)) return null
    return (
      <div style={{ left: `${(percentile / (max ?? min)) * 100}%` }} className="absolute transform -top-[23px] -translate-x-1/2 z-[10]">
        <p className={`leading-none text-xs ${percentileCategory.name === 'Good' ? 'text-green-800' : percentileCategory.name === 'Improvement' ? 'text-yellow-800' : 'text-red-800'}`}>{formatValue(percentile)}</p>
        <Pin />
      </div>
    )
  }

  // Calculate if the percentile is within acceptable range
  const percentileCategory = getCategory(metricData.percentile)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{metricFullName} ({metricName})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex w-full h-3">
            {metricData.distributions.map((dist, index) => {
              const category = getDistributionCategory(dist.min, dist.max)
              return (
                <div
                  key={index}
                  style={{ width: `${dist.proportion * 100}%`, backgroundColor: category.color }}
                  className={`relative group relative ${index === 0 ? 'rounded-tl-lg rounded-bl-lg' : ''} ${index === metricData.distributions.length - 1 ? 'rounded-tr-lg rounded-br-lg' : ''}`}
                >
                  {renderPercentilePin(metricData.percentile, dist.min, dist.max)}
                  <div className="opacity-0 group-hover:opacity-100 absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity duration-200">
                    {category.name}: {formatPercentage(dist.proportion)}
                    <br />
                    {formatValueRange(dist.min, dist.max)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
          {metricData.distributions.map((dist, index) => {
            const category = getDistributionCategory(dist.min, dist.max)
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: category.color }}></div>
                <span className="font-medium">{category.name}</span>
                <span className="text-gray-500">{formatPercentage(dist.proportion)}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Good: {'<'} {thresholds.good / (metricName === 'CLS' ? 1 : 1000)}{metricUnit}</span>
            <span>Improvement: {thresholds.good / (metricName === 'CLS' ? 1 : 1000)}-{thresholds.needsImprovement / (metricName === 'CLS' ? 1 : 1000)}{metricUnit}</span>
            <span>Poor: {'>'} {thresholds.needsImprovement / (metricName === 'CLS' ? 1 : 1000)}{metricUnit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface MetricData {
  value: number;
  category: string;
}

interface PageSpeedReport {
  id: number;
  url: string;
  test_date: string;
  device_type: string;
  overall_category: string;
  metrics: {
    LCP: MetricData;
    CLS: MetricData;
    FCP: MetricData;
    TTFB: MetricData;
    INP: MetricData;
  }
}

interface Event {
  date: string;
  value: number;
  label: string;
}

export default function Dashboard() {
  const [reportsData, setReportsData] = useState<PageSpeedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState('mobile');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([]);

  const sortedUrls = urls.sort((a, z) => {
    const urlA = new URL(a);
    const urlZ = new URL(z);
    if (urlA.origin === urlZ.origin) {
      return urlA.pathname.localeCompare(urlZ.pathname);
    }
    return urlA.origin.localeCompare(urlZ.origin);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reports?url=${selectedUrl}&deviceType=${selectedDeviceType}`);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          setReportsData(result.data);

          // Extract unique URLs
          const uniqueUrls = [...new Set(result.data.map((item: PageSpeedReport) => item.url))] as string[];
          setUrls(uniqueUrls);

          // Set initial URL if available
          if (uniqueUrls.length > 0) {
            setSelectedUrl(uniqueUrls[0]);
          }
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading metrics data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (reportsData.length === 0 || !selectedUrl) {
    return <div>No data available</div>;
  }

  // Filter data points for the selected URL and device type
  const filteredData = reportsData
    .filter(report => report.url === selectedUrl)
    .filter(report => report.device_type === selectedDeviceType)
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());

  // Prepare chart data for time-based metrics
  const timeMetricsChartData = filteredData.map(report => {
    return {
      date: report.test_date,
      formattedDate: format(parseISO(report.test_date), 'MMM d'),
      LCP: report.metrics.LCP.value / 1000, // Convert to seconds
      FCP: report.metrics.FCP.value / 1000,
      TTFB: report.metrics.TTFB.value / 1000,
      INP: report.metrics.INP.value / 1000,
    };
  });

  // Prepare chart data for CLS
  const clsChartData = filteredData.map(report => {
    return {
      date: report.test_date,
      formattedDate: format(parseISO(report.test_date), 'MMM d'),
      CLS: report.metrics.CLS.value,
      category: report.metrics.CLS.category,
    };
  });

  // Get metric friendly names
  const getMetricFriendlyName = (metric: string) => {
    switch (metric) {
      case 'LCP':
        return 'Largest Contentful Paint';
      case 'CLS':
        return 'Cumulative Layout Shift';
      case 'FCP':
        return 'First Contentful Paint';
      case 'TTFB':
        return 'Time to First Byte';
      case 'INP':
        return 'Interaction to Next Paint';
      default:
        return metric;
    }
  };

  // Custom tooltip component for time metrics
  const TimeMetricsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{data.formattedDate}</p>
          <p className="text-[#00aae7]">LCP: {data.LCP.toFixed(2)}s</p>
          <p className="text-[#ff7c43]">FCP: {data.FCP.toFixed(2)}s</p>
          <p className="text-[#665191]">TTFB: {data.TTFB.toFixed(2)}s</p>
          <p className="text-[#2ab7ca]">INP: {data.INP.toFixed(2)}s</p>
          {data.event && (
            <p className="text-gray-600 mt-1">Event: {data.event}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip component for CLS
  const CLSTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{data.formattedDate}</p>
          <p className="text-[#f95d6a]">CLS: {data.CLS.toFixed(2)} ({data.category})</p>
          {data.event && (
            <p className="text-gray-600 mt-1">Event: {data.event}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot component for events
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    if (payload.event) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={4} fill="#666" />
          <circle cx={cx} cy={cy} r={8} fill="#666" fillOpacity={0.3} />
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="#666"
            fontSize={12}
            fontWeight="bold"
          >
            {payload.event}
          </text>
        </g>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    const roundedValue = Math.round(value * 2) / 2;

    if (Number.isInteger(roundedValue)) {
      return `${roundedValue}s`;
    }
    return `${roundedValue}s`;
  };

  const formatUrlName = (_url: string): string => {
    const url = new URL(_url);
    if (url.origin.includes('emma-sleep-japan.com')) {
      if (url.pathname === '/') return '(JP) Home';
      if (url.pathname.includes('/products')) return '(JP) Product';
      if (url.pathname.includes('/collections/mattresses')) return '(JP) Category';
      if (url.pathname.includes('/pages/sale')) return '(JP) Sale';
    }

    if (url.origin.includes('emma-sleep.com.ph')) {
      if (url.pathname === '/') return '(PH) Home';
      if (url.pathname.includes('/products')) return '(PH) Product';
      if (url.pathname.includes('/collections/mattresses')) return '(PH) Category';
      if (url.pathname.includes('/collections/sale')) return '(PH) Sale';
    }

    return url.href
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">PageSpeed Metrics</h1>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
          </select>

          <select
            value={selectedUrl || ''}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="border rounded px-3 py-1"
          >
            {sortedUrls.map(url => (
              <option key={url} value={url}>
                {formatUrlName(url)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time-based metrics chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">
          Time-based Metrics over time (seconds)
        </h2>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeMetricsChartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Time (seconds)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<TimeMetricsTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="LCP"
                stroke="#00aae7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="LCP"
              />
              <Line
                type="monotone"
                dataKey="FCP"
                stroke="#ff7c43"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="FCP"
              />
              <Line
                type="monotone"
                dataKey="TTFB"
                stroke="#665191"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="TTFB"
              />
              <Line
                type="monotone"
                dataKey="INP"
                stroke="#2ab7ca"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="INP"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CLS chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">
          {getMetricFriendlyName('CLS')} (CLS) over time
        </h2>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={clsChartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'CLS Value',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CLSTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="CLS"
                stroke="#f95d6a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                name="CLS"
              />
              {/* Add reference lines for CLS thresholds */}
              <ReferenceLine y={0.1} stroke="green" strokeDasharray="3 3" label="Good" />
              <ReferenceLine y={0.25} stroke="orange" strokeDasharray="3 3" label="Needs Improvement" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
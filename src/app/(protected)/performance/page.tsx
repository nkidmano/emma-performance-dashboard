"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { MetricDistribution } from "@/features/performance/components/metric-distribution";
import { CORE_WEB_VITALS_THRESHOLDS } from "@/lib/constants";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricData {
  value: number;
  category: string;
}

interface PagespeedReport {
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
  };
}

const LIMIT_REPORT_DAYS = 14;
const LIMIT_REPORT_WEEKS = 6;
const DAYS_PER_WEEK = 7;

export default function PerformancePage() {
  const [reportsData, setReportsData] = useState<PagespeedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState("mobile");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

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

        const response = await fetch(
          `/api/reports?url=${selectedUrl}&deviceType=${selectedDeviceType}`,
        );
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.data && Array.isArray(result.data)) {
          setReportsData(result.data);

          // Extract unique URLs
          const uniqueUrls = [
            ...new Set(result.data.map((item: PagespeedReport) => item.url)),
          ] as string[];
          setUrls(uniqueUrls);

          // Set initial URL if available
          if (uniqueUrls.length > 0) {
            setSelectedUrl(uniqueUrls[0]);
          }
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading metrics data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (reportsData.length === 0 || !selectedUrl) {
    return <div>No data available</div>;
  }

  // Filter data points for the selected URL and device type
  const filteredData = reportsData
    .filter((report) => report.url === selectedUrl)
    .filter((report) => report.device_type === selectedDeviceType)
    .sort(
      (a, b) =>
        new Date(a.test_date).getTime() - new Date(b.test_date).getTime(),
    )
    .slice(
      0,
      viewMode === "daily"
        ? LIMIT_REPORT_DAYS
        : LIMIT_REPORT_WEEKS * DAYS_PER_WEEK,
    );

  // Prepare chart data based on the selected view mode
  const prepareChartData = () => {
    if (viewMode === "daily") {
      // Daily view - original implementation
      const timeMetricsData = filteredData.map((report) => {
        return {
          id: report.id,
          date: report.test_date,
          formattedDate: format(parseISO(report.test_date), "MMM d"),
          LCP: report.metrics.LCP.value / 1000, // Convert to seconds
          FCP: report.metrics.FCP.value / 1000,
          TTFB: report.metrics.TTFB.value / 1000,
          INP: report.metrics.INP.value / 1000,
        };
      });

      const clsData = filteredData.map((report) => {
        return {
          id: report.id,
          date: report.test_date,
          formattedDate: format(parseISO(report.test_date), "MMM d"),
          CLS: report.metrics.CLS.value,
          category: report.metrics.CLS.category,
        };
      });

      return { timeMetricsChartData: timeMetricsData, clsChartData: clsData };
    } else {
      // Weekly view - group data by week
      const weeklyData = new Map();
      const weeklyCLSData = new Map();

      filteredData.forEach((report) => {
        const date = parseISO(report.test_date);

        // Calculate week of month (1-based)
        const firstDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        );
        const dayOfWeekOfFirstDay = firstDayOfMonth.getDay() || 7; // Convert Sunday (0) to 7
        const dayOfMonth = date.getDate();
        const weekOfMonth = Math.ceil(
          (dayOfMonth + dayOfWeekOfFirstDay - 1) / 7,
        );

        // Get month name
        const monthName = format(date, "MMMM");

        // Format as "Week X Month"
        const formattedWeek = `Week ${weekOfMonth} ${monthName}`;

        // Use year, month and week of month as the key
        const monthYearKey = format(date, "yyyy-MM"); // e.g. "2025-03" for March 2025
        const weekKey = `${monthYearKey}-W${weekOfMonth}`;

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            weekLabel: formattedWeek,
            formattedDate: formattedWeek,
            reports: [],
            LCP: 0,
            FCP: 0,
            TTFB: 0,
            INP: 0,
            count: 0,
          });
        }

        if (!weeklyCLSData.has(weekKey)) {
          weeklyCLSData.set(weekKey, {
            weekLabel: formattedWeek,
            formattedDate: formattedWeek,
            CLS: 0,
            count: 0,
            reports: [],
          });
        }

        const weekData = weeklyData.get(weekKey);
        weekData.LCP += report.metrics.LCP.value / 1000;
        weekData.FCP += report.metrics.FCP.value / 1000;
        weekData.TTFB += report.metrics.TTFB.value / 1000;
        weekData.INP += report.metrics.INP.value / 1000;
        weekData.count += 1;
        weekData.reports.push(report.id);

        const weekCLSData = weeklyCLSData.get(weekKey);
        weekCLSData.CLS += report.metrics.CLS.value;
        weekCLSData.count += 1;
        weekCLSData.reports.push(report.id);
      });

      // Calculate averages
      const timeMetricsWeeklyData = Array.from(weeklyData.values()).map(
        (data) => ({
          weekLabel: data.weekLabel,
          formattedDate: data.formattedDate,
          LCP: data.count > 0 ? data.LCP / data.count : 0,
          FCP: data.count > 0 ? data.FCP / data.count : 0,
          TTFB: data.count > 0 ? data.TTFB / data.count : 0,
          INP: data.count > 0 ? data.INP / data.count : 0,
          count: data.count,
          reports: data.reports,
        }),
      );

      const clsWeeklyData = Array.from(weeklyCLSData.values()).map((data) => ({
        weekLabel: data.weekLabel,
        formattedDate: data.formattedDate,
        CLS: data.count > 0 ? data.CLS / data.count : 0,
        count: data.count,
        reports: data.reports,
      }));

      return {
        timeMetricsChartData: timeMetricsWeeklyData,
        clsChartData: clsWeeklyData,
      };
    }
  };

  const { timeMetricsChartData, clsChartData } = prepareChartData();
  console.log("data", filteredData);
  console.log("cls", clsChartData);

  // Get metric friendly names
  const getMetricFriendlyName = (metric: string) => {
    switch (metric) {
      case "LCP":
        return "Largest Contentful Paint";
      case "CLS":
        return "Cumulative Layout Shift";
      case "FCP":
        return "First Contentful Paint";
      case "TTFB":
        return "Time to First Byte";
      case "INP":
        return "Interaction to Next Paint";
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
          {viewMode === "weekly" && (
            <p className="text-gray-600 mt-1">Samples: {data.count}</p>
          )}
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
          <p className="text-[#f95d6a]">
            CLS: {data.CLS.toFixed(2)}{" "}
            {viewMode === "daily" && `(${data.category})`}
          </p>
          {viewMode === "weekly" && (
            <p className="text-gray-600 mt-1">Samples: {data.count}</p>
          )}
          {data.event && (
            <p className="text-gray-600 mt-1">Event: {data.event}</p>
          )}
        </div>
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
    if (url.origin.includes("emma-sleep-japan.com")) {
      if (url.pathname === "/") return "(JP) Home";
      if (url.pathname.includes("/products")) return "(JP) Product";
      if (url.pathname.includes("/collections/mattresses"))
        return "(JP) Category";
      if (url.pathname.includes("/pages/sale")) return "(JP) Sale";
    }

    if (url.origin.includes("emma-sleep.com.ph")) {
      if (url.pathname === "/") return "(PH) Home";
      if (url.pathname.includes("/products")) return "(PH) Product";
      if (url.pathname.includes("/collections/mattresses"))
        return "(PH) Category";
      if (url.pathname.includes("/collections/sale")) return "(PH) Sale";
    }

    if (url.origin.includes("emma-sleep.in")) {
      if (url.pathname === "/") return "(IN) Home";
      if (url.pathname.includes("/products")) return "(IN) Product";
      if (url.pathname.includes("/collections/mattress"))
        return "(IN) Category";
    }

    return url.href;
  };

  const extractDistributionMetrics = (data: any) => {
    if (!data) return {};

    const metrics = data.metrics;
    return {
      LCP: {
        name: "Largest Contentful Paint",
        metrics: {
          percentile: metrics.LCP.distribution.percentile,
          distributions: metrics.LCP.distribution.distributions,
        },
      },
      INP: {
        name: "Interaction to Next Paint",
        metrics: {
          percentile: metrics.INP.distribution.percentile,
          distributions: metrics.INP.distribution.distributions,
        },
      },
      CLS: {
        name: "Cumulative Layout Shift",
        metrics: {
          percentile: metrics.CLS.distribution.percentile,
          distributions: metrics.CLS.distribution.distributions.map(
            (stat: any) => ({
              ...stat,
              min: stat.min * 100,
              max: stat.max ? stat.max * 100 : null,
            }),
          ),
        },
      },
      FCP: {
        name: "First Contentful Paint",
        metrics: {
          percentile: metrics.FCP.distribution.percentile,
          distributions: metrics.FCP.distribution.distributions,
        },
      },
      TTFB: {
        name: "Time to First Byte",
        metrics: {
          percentile: metrics.TTFB.distribution.percentile,
          distributions: metrics.TTFB.distribution.distributions,
        },
      },
    };
  };

  const data = filteredData.find((data) => data.id === selectedReportId);
  const metrics = extractDistributionMetrics(data);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Pagespeed Metrics</h1>

        <div className="flex flex-wrap gap-3">
          <Select
            value={selectedUrl || ""}
            defaultValue={selectedUrl || ""}
            onValueChange={(value) => setSelectedUrl(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {sortedUrls.map((url) => (
                <SelectItem key={url} value={url}>
                  {formatUrlName(url)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={viewMode}
            defaultValue={viewMode}
            onValueChange={(value) => setViewMode(value as "daily" | "weekly")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {metrics && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(metrics).map(([key, value]) => (
              <MetricDistribution
                key={key}
                metricName={key}
                metricFullName={value.name}
                metricUnit=""
                metricData={value.metrics}
                thresholds={
                  CORE_WEB_VITALS_THRESHOLDS[
                    key as keyof typeof CORE_WEB_VITALS_THRESHOLDS
                  ]
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Time-based metrics chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Metrics {viewMode === "weekly" ? "weekly" : "over time"}
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              onClick={(data) => {
                if (
                  viewMode === "daily" &&
                  data?.activePayload?.[0]?.payload?.id
                ) {
                  setSelectedReportId(data.activePayload[0].payload.id);
                }
              }}
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
                domain={["auto", "auto"]}
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Time (seconds)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<TimeMetricsTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="LCP"
                stroke="#00aae7"
                strokeWidth={2}
                dot={viewMode === "weekly"}
                activeDot={{ r: 6 }}
                name="LCP"
              />
              <Line
                type="monotone"
                dataKey="FCP"
                stroke="#ff7c43"
                strokeWidth={2}
                dot={viewMode === "weekly"}
                activeDot={{ r: 6 }}
                name="FCP"
              />
              <Line
                type="monotone"
                dataKey="TTFB"
                stroke="#665191"
                strokeWidth={2}
                dot={viewMode === "weekly"}
                activeDot={{ r: 6 }}
                name="TTFB"
              />
              <Line
                type="monotone"
                dataKey="INP"
                stroke="#2ab7ca"
                strokeWidth={2}
                dot={viewMode === "weekly"}
                activeDot={{ r: 6 }}
                name="INP"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* CLS chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getMetricFriendlyName("CLS")} (CLS){" "}
            {viewMode === "weekly" ? "weekly" : "over time"}
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[400px]">
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
                domain={[0, "auto"]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "CLS Value",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <Tooltip content={<CLSTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="CLS"
                stroke="#f95d6a"
                strokeWidth={2}
                dot={viewMode === "weekly"}
                activeDot={{ r: 6 }}
                name="CLS"
              />
              {/* Add reference lines for CLS thresholds */}
              <ReferenceLine
                y={0.1}
                stroke="green"
                strokeDasharray="3 3"
                label="Good"
              />
              <ReferenceLine
                y={0.25}
                stroke="orange"
                strokeDasharray="3 3"
                label="Needs Improvement"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

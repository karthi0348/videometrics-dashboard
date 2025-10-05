import React, { useState, useEffect, useCallback } from "react";
import { GeneratedChart, ChartSeries } from "../types/types";

// Define API service interface
interface ApiService {
  getAnalyticsCharts: (
    analyticsId: string
  ) => Promise<GeneratedChart[] | string>;
  refreshChart: (
    analyticsId: string,
    chartId: string
  ) => Promise<GeneratedChart | string>;
}

interface ChartSeries {
  category?: string[];
  value?: number[];
  label?: string[];
  values?: number[];
  [key: string]: any;
}

interface GeneratedChart {
  id: string;
  title: string;
  plot_type: string;
  series?: ChartSeries;
  x_axis?: string[];
  y_axis_label?: string;
  value?: number;
  min?: number;
  max?: number;
  status?: string;
  insights?: string[];
  styling?: {
    max_value?: number;
    unit?: string;
  };
}

interface ChartDisplayProps {
  charts?: GeneratedChart[];
  analyticsId?: string;
  apiService?: ApiService | null;
  mockMode?: boolean;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({
  charts: initialCharts,
  analyticsId,
  apiService,
  mockMode = false,
}) => {
  const [charts, setCharts] = useState<GeneratedChart[]>(initialCharts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [chartSelections, setChartSelections] = useState<Map<string, string>>(new Map());

  const loadChartsFromAPI = useCallback(async () => {
    if (!analyticsId || !apiService) {
      setError("Analytics ID or API service not available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Fetching charts for analytics ID:", analyticsId);
      const response = await apiService.getAnalyticsCharts(analyticsId);

      let chartData: GeneratedChart[];
      if (typeof response === "string") {
        try {
          chartData = JSON.parse(response) as GeneratedChart[];
        } catch {
          console.error("Failed to parse charts JSON response:", response);
          throw new Error("Invalid JSON response from charts API");
        }
      } else if (typeof response === "object" && response !== null) {
        chartData = response;
      } else {
        throw new Error("Unexpected charts response format");
      }

      setCharts(Array.isArray(chartData) ? chartData : []);
    } catch (err) {
      let errorMessage = "Failed to load charts";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Error loading charts:", err);
    } finally {
      setLoading(false);
    }
  }, [analyticsId, apiService]);

  useEffect(() => {
    if (analyticsId && !initialCharts && !mockMode && apiService) {
      loadChartsFromAPI();
    } else if (initialCharts) {
      setCharts(initialCharts);
    }
  }, [analyticsId, initialCharts, mockMode, apiService, loadChartsFromAPI]);

  const handleRefreshAll = async () => {
    if (!analyticsId || !apiService || mockMode) {
      if (initialCharts) {
        setCharts(initialCharts);
      }
      return;
    }
    await loadChartsFromAPI();
  };

  // Helper function to validate pie chart data
  const isValidPieChartData = (chart: GeneratedChart): boolean => {
    const categories = chart.series?.label || chart.series?.category || [];
    const values = chart.series?.values || chart.series?.value || [];
    return (
      chart.plot_type === "pie" &&
      chart.series &&
      Array.isArray(categories) &&
      Array.isArray(values) &&
      categories.length > 0 &&
      values.length > 0 &&
      categories.length === values.length
    );
  };

  // Helper function to validate gauge chart data
  const isValidGaugeChartData = (chart: GeneratedChart): boolean => {
    if (chart.plot_type !== "gauge") return false;

    const isSafeNumber = (val: any): val is number =>
      typeof val === "number" && !isNaN(val) && isFinite(val);

    const min = chart.min ?? 0;
    const max = chart.max ?? 100;
    const value = chart.value;

    return isSafeNumber(value) && min < max && value! >= min && value! <= max;
  };

  // Helper function to validate bar chart data
  const isValidBarChartData = (chart: GeneratedChart): boolean => {
    return (
      chart.plot_type === "bar" &&
      chart.series &&
      chart.x_axis &&
      Array.isArray(chart.x_axis) &&
      chart.x_axis.length > 0
    );
  };

  // Get available chart types for a given chart
  const getAvailableChartTypes = (chart: GeneratedChart): string[] => {
    if (isValidPieChartData(chart)) {
      return ["pie", "donut", "bar", "histogram"];
    }
    if (isValidGaugeChartData(chart)) {
      return ["gauge", "pie", "bar", "histogram"];
    }
    if (isValidBarChartData(chart)) {
      return ["bar", "histogram", "pie"];
    }
    return [chart.plot_type];
  };

  // Get the selected chart type for a given chart
  const getSelectedChartType = (chartId: string, defaultType: string): string => {
    return chartSelections.get(chartId) || defaultType;
  };

  // Set the selected chart type
  const setSelectedChartType = (chartId: string, chartType: string) => {
    setChartSelections(prev => {
      const newMap = new Map(prev);
      newMap.set(chartId, chartType);
      return newMap;
    });
  };

  // Helper function to render pie chart
  const renderPieChart = (categories: string[], values: number[], size: number = 180) => {
    const total = values.reduce((sum, val) => sum + val, 0);
    const colors = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
    
    let currentAngle = 0;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    return (
      <div className="flex flex-col items-center p-6">
        <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
          Pie Chart
        </div>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {values.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle = endAngle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="mt-4 w-full space-y-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-gray-700">{cat}</span>
              </div>
              <span className="text-gray-600 font-medium">
                {values[idx]} ({((values[idx] / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render donut chart
  const renderDonutChart = (categories: string[], values: number[], size: number = 160) => {
    const total = values.reduce((sum, val) => sum + val, 0);
    const colors = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
    
    let currentAngle = 0;
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 10;
    const innerRadius = outerRadius * 0.6;

    return (
      <div className="flex flex-col items-center p-6">
        <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
          Donut Chart
        </div>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {values.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1Outer = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
            const y1Outer = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
            const x2Outer = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
            const y2Outer = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);
            
            const x1Inner = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
            const y1Inner = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
            const x2Inner = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
            const y2Inner = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${x1Outer} ${y1Outer}`,
              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
              `L ${x2Inner} ${y2Inner}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
              'Z'
            ].join(' ');
            
            currentAngle = endAngle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="mt-4 w-full space-y-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-gray-700">{cat}</span>
              </div>
              <span className="text-gray-600 font-medium">
                {values[idx]} ({((values[idx] / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render gauge
  const renderGauge = (value: number, maxValue: number, unit?: string, size: number = 180) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center p-6">
        <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
          Circular Gauge
        </div>
        <div className="relative mb-4" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#10b981"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">
              {value.toLocaleString()}
            </div>
            {unit && <div className="text-sm text-gray-500 mt-1">{unit}</div>}
            <div className="text-xs text-gray-400 mt-1">
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render bar chart
  const renderBarChart = (categories: string[], values: number[]) => {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center p-6">
          <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
            Bar Chart
          </div>
          <div className="w-full" style={{ height: "120px" }}>
            <svg
              width="100%"
              height="120"
              viewBox="0 0 300 120"
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
            >
              {values.map((value, index) => {
                const barWidth = Math.min(25, 280 / values.length - 2);
                const maxValue = Math.max(...values);
                const barHeight = Math.max(3, (value / maxValue) * 70);
                const x = 20 + index * (280 / values.length);
                const y = 90 - barHeight;

                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#3B82F6"
                      rx="2"
                      ry="2"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 3}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#374151"
                      fontWeight="500"
                    >
                      {value}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={105}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                      transform={`rotate(-10, ${x + barWidth / 2}, 105)`}
                    >
                      {categories[index] || `Item ${index + 1}`}
                    </text>
                  </g>
                );
              })}
              <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render histogram
  const renderHistogramChart = (categories: string[], values: number[]) => {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center p-6">
          <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
            Histogram
          </div>
          <div className="w-full" style={{ height: "120px" }}>
            <svg
              width="100%"
              height="120"
              viewBox="0 0 300 120"
              preserveAspectRatio="xMidYMid meet"
              className="overflow-visible"
            >
              {values.map((value, index) => {
                const barWidth = Math.max(8, 260 / values.length);
                const maxValue = Math.max(...values);
                const barHeight = Math.max(3, (value / maxValue) * 70);
                const x = 20 + index * barWidth;
                const y = 90 - barHeight;

                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#10B981"
                      stroke="#059669"
                      strokeWidth="0.5"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 3}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#374151"
                      fontWeight="500"
                    >
                      {value}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={105}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#6B7280"
                      transform={`rotate(-10, ${x + barWidth / 2}, 105)`}
                    >
                      {categories[index] || `${index + 1}`}
                    </text>
                  </g>
                );
              })}
              <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1" />
              <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Function to render the appropriate chart based on selection
  const renderChart = (chart: GeneratedChart) => {
    const selectedType = getSelectedChartType(chart.id, chart.plot_type);

    // Handle gauge charts
    if (chart.plot_type === "gauge" && isValidGaugeChartData(chart)) {
      const maxValue = chart.styling?.max_value || 100;
      const currentValue = chart.value as number;
      const remainingValue = Math.max(0, maxValue - currentValue);

      switch (selectedType) {
        case "gauge":
          return renderGauge(currentValue, maxValue, chart.styling?.unit);
        case "pie":
          return renderPieChart(["Current Value", "Remaining"], [currentValue, remainingValue]);
        case "bar":
          return renderBarChart(["Current Value", "Remaining"], [currentValue, remainingValue]);
        case "histogram":
          return renderHistogramChart(["Current Value", "Remaining"], [currentValue, remainingValue]);
      }
    }

    // Handle pie charts
    if (isValidPieChartData(chart)) {
      const categories = chart.series?.label || chart.series?.category || [];
      const values = chart.series?.values || chart.series?.value || [];

      switch (selectedType) {
        case "pie":
          return renderPieChart(categories, values);
        case "donut":
          return renderDonutChart(categories, values);
        case "bar":
          return renderBarChart(categories, values);
        case "histogram":
          return renderHistogramChart(categories, values);
      }
    }

    // Handle bar charts
    if (chart.plot_type === "bar" && isValidBarChartData(chart)) {
      const seriesEntries = Object.entries(chart.series);
      if (seriesEntries.length > 0) {
        const [, seriesData] = seriesEntries[0];
        const values = Array.isArray(seriesData) ? seriesData : [];
        
        if (values.length > 0 && chart.x_axis) {
          switch (selectedType) {
            case "bar":
              return renderBarChart(chart.x_axis, values);
            case "histogram":
              return renderHistogramChart(chart.x_axis, values);
            case "pie":
              return renderPieChart(chart.x_axis, values);
          }
        }
      }
    }

    return (
      <div className="w-full bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">
          Chart data not available
        </p>
      </div>
    );
  };

  // Get chart type label
  const getChartTypeLabel = (chartType: string) => {
    const labels: Record<string, string> = {
      donut: "Donut",
      pie: "Pie",
      gauge: "Gauge",
      histogram: "Histogram",
      bar: "Bar",
    };
    return labels[chartType] || chartType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading charts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <h3 className="text-red-800 font-medium text-sm sm:text-base">
                Error Loading Charts
              </h3>
              <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">
                {error}
              </p>
              <button
                onClick={loadChartsFromAPI}
                className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="text-center p-8 sm:p-12 text-gray-500">
        <div className="mb-4">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm sm:text-base">
          No charts available for this video.
        </p>
        {analyticsId && !mockMode && apiService && (
          <button
            onClick={loadChartsFromAPI}
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Load Charts
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Analytics Charts
        </h3>
        {analyticsId && apiService && (
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 border border-teal-200 w-full sm:w-auto"
          >
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {mockMode ? "Refresh Mock Data" : "Refresh All"}
          </button>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {charts.map((chart) => {
          const availableTypes = getAvailableChartTypes(chart);
          const selectedType = getSelectedChartType(chart.id, chart.plot_type);

          return (
            <div
              key={chart.id}
              className="chart-container bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 p-4 sm:p-6 lg:p-8 relative flex flex-col"
              data-chart-id={chart.id}
              data-chart-type={selectedType}
              data-chart-title={chart.title}
              style={{ minHeight: "400px" }}
            >
              {/* Chart Title */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 text-center mb-3 sm:mb-4 leading-tight">
                  {chart.title}
                </h3>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <span
                    className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                      chart.status === "excellent"
                        ? "bg-green-100 text-green-800 border-2 border-green-200"
                        : chart.status === "good"
                        ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                        : "bg-red-100 text-red-800 border-2 border-red-200"
                    }`}
                  >
                    {chart.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
              </div>

              {/* Chart Type Toggle Buttons */}
              {availableTypes.length > 1 && (
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedChartType(chart.id, type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedType === type
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {getChartTypeLabel(type)}
                    </button>
                  ))}
                </div>
              )}

              {/* Chart Visualization Area */}
              <div className="flex-1" style={{ minHeight: "200px" }}>
                {renderChart(chart)}
              </div>

              {/* Data Summary */}
              {(chart.value !== undefined || chart.series) && (
                <div className="data-summary bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm border border-gray-100">
                  <div className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></div>
                    Data Summary
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {chart.value !== undefined && chart.value !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Value:</span>
                        <span className="font-bold text-gray-900">
                          {chart.value} {chart.styling?.unit || ""}
                        </span>
                      </div>
                    )}
                    {chart.series?.category &&
                      chart.series?.value &&
                      Array.isArray(chart.series.category) && (
                        <>
                          {chart.series.category.map((category, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600 font-medium truncate mr-2">
                                {category}:
                              </span>
                              <span className="font-bold text-gray-900 flex-shrink-0">
                                {Array.isArray(chart.series.value)
                                  ? chart.series.value[idx]
                                  : chart.series.value}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    {chart.plot_type === "bar" &&
                      chart.series &&
                      chart.x_axis && (
                        <>
                          {Object.entries(chart.series).map(
                            ([seriesName, seriesValues]) => (
                              <div key={seriesName} className="space-y-1">
                                <div className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                                  {seriesName}
                                </div>
                                {Array.isArray(seriesValues) &&
                                  chart.x_axis &&
                                  seriesValues.map((value, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center pl-2 sm:pl-4"
                                    >
                                      <span className="text-gray-600 font-medium truncate mr-2">
                                        {chart.x_axis[idx]}:
                                      </span>
                                      <span className="font-bold text-gray-900 flex-shrink-0">
                                        {value} {chart.y_axis_label || ""}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )
                          )}
                        </>
                      )}
                  </div>
                </div>
              )}

              {/* Insights section */}
              {chart.insights && chart.insights.length > 0 && (
                <div className="insights-section border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base flex items-center">
                    <span className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rounded-full mr-2"></span>
                    Key Insights
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {chart.insights.map((insight: string, index: number) => (
                      <li
                        key={index}
                        className="text-gray-700 text-xs sm:text-sm flex items-start leading-relaxed"
                      >
                        <span className="text-teal-500 mr-2 sm:mr-3 mt-0.5 sm:mt-1 text-base sm:text-lg flex-shrink-0">
                          •
                        </span>
                        <span className="min-w-0">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartDisplay;
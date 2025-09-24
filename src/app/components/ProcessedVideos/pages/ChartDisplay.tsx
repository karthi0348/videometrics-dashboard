import React, { useState, useEffect, useCallback } from "react";
import { GeneratedChart, ChartSeries } from "../types/types";
import { PieChart, CircularGauge } from "./ChartComponents";
import { HorizontalBarChart, VerticalBarChart, DonutChart, EnhancedPieChart } from "./AlternativeCharts";

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

interface ChartDisplayProps {
  charts?: GeneratedChart[];
  analyticsId?: string;
  apiService?: ApiService | null;
  mockMode?: boolean;
}

// Extended chart type that includes chartType for variations
interface ExtendedChart extends GeneratedChart {
  chartType?: string;
  series?: ChartSeries;
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
  const [refreshingCharts, setRefreshingCharts] = useState<Set<string>>(
    new Set()
  );
  // Remove the chart view modes state since we'll show all charts

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

  const refreshChart = async (chartId: string) => {
    if (!analyticsId || !apiService || mockMode) return;

    setRefreshingCharts((prev) => new Set(prev).add(chartId));

    try {
      console.log("Refreshing chart:", chartId);
      const response = await apiService.refreshChart(analyticsId, chartId);

      let refreshedChart: GeneratedChart;
      if (typeof response === "string") {
        try {
          refreshedChart = JSON.parse(response) as GeneratedChart;
        } catch {
          console.error("Failed to parse refresh chart JSON response:", response);
          throw new Error("Invalid JSON response from refresh chart API");
        }
      } else if (typeof response === "object" && response !== null) {
        refreshedChart = response;
      } else {
        throw new Error("Unexpected refresh chart response format");
      }

      setCharts((prevCharts) =>
        prevCharts.map((chart) =>
          chart.id === chartId ? refreshedChart : chart
        )
      );
    } catch (err) {
      console.error("Error refreshing chart:", err);
    } finally {
      setRefreshingCharts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chartId);
        return newSet;
      });
    }
  };

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

  // Helper function to validate gauge chart data - FIXED
  const isValidGaugeChartData = (chart: GeneratedChart): boolean => {
    return (
      chart.plot_type === "gauge" &&
      chart.value !== undefined &&
      chart.value !== null &&
      typeof chart.value === "number" &&
      !isNaN(chart.value)
    );
  };

  // Function to create multiple chart variations for pie data and gauge data
  const createChartVariations = (chart: GeneratedChart): ExtendedChart[] => {
    // Create variations for pie charts
    if (isValidPieChartData(chart)) {
      return [
        { ...chart, id: `${chart.id}_pie`, title: `${chart.title} (Pie Chart)`, chartType: 'pie' },
        { ...chart, id: `${chart.id}_donut`, title: `${chart.title} (Donut Chart)`, chartType: 'donut' },
        { ...chart, id: `${chart.id}_hbar`, title: `${chart.title} (Horizontal Bar)`, chartType: 'horizontal-bar' },
        { ...chart, id: `${chart.id}_vbar`, title: `${chart.title} (Vertical Bar)`, chartType: 'vertical-bar' }
      ];
    }

    // Create variations for gauge charts - FIXED
    if (isValidGaugeChartData(chart)) {
      const maxValue = chart.styling?.max_value || 100;
      const currentValue = chart.value as number; // Safe to cast since we validated it
      const remainingValue = Math.max(0, maxValue - currentValue);
      
      // Convert gauge to pie format for pie chart variation
      const pieVersion: ExtendedChart = {
        ...chart,
        plot_type: "pie" as const,
        series: {
          category: ["Current Value", "Remaining"],
          value: [currentValue, remainingValue],
          label: ["Current Value", "Remaining"],
          values: [currentValue, remainingValue]
        } as ChartSeries
      };

      // Convert gauge to line chart format (showing progress over time simulation)
      const lineVersion: ExtendedChart = {
        ...chart,
        plot_type: "line" as const,
        series: {
          "Progress": [0, currentValue * 0.3, currentValue * 0.6, currentValue * 0.85, currentValue]
        } as ChartSeries,
        x_axis: ["Start", "25%", "50%", "75%", "Current"]
      };

      // Convert gauge to histogram format (showing distribution)
      const histogramVersion: ExtendedChart = {
        ...chart,
        plot_type: "histogram" as const,
        series: {
          "Frequency": [2, 5, 8, 12, 15, 10, 6, 3]
        } as ChartSeries,
        x_axis: ["0-12.5", "12.5-25", "25-37.5", "37.5-50", "50-62.5", "62.5-75", "75-87.5", "87.5-100"]
      };

      // Convert gauge to waterfall format (showing breakdown)
      const waterfallVersion: ExtendedChart = {
        ...chart,
        plot_type: "waterfall" as const,
        series: {
          "Values": [0, currentValue * 0.4, currentValue * 0.3, currentValue * 0.2, currentValue * 0.1]
        } as ChartSeries,
        x_axis: ["Base", "Component 1", "Component 2", "Component 3", "Total"]
      };

      return [
        { ...chart, id: `${chart.id}_gauge`, title: `${chart.title} (Gauge)`, chartType: 'gauge' },
        { ...pieVersion, id: `${chart.id}_pie`, title: `${chart.title} (Pie Chart)`, chartType: 'pie' },
        { ...lineVersion, id: `${chart.id}_line`, title: `${chart.title} (Line Chart)`, chartType: 'line' },
        { ...histogramVersion, id: `${chart.id}_histogram`, title: `${chart.title} (Histogram)`, chartType: 'histogram' },
        { ...waterfallVersion, id: `${chart.id}_waterfall`, title: `${chart.title} (Waterfall)`, chartType: 'waterfall' }
      ];
    }

    return [chart]; // Return original chart if no variations available
  };

  // Function to render the appropriate chart based on chartType
  const renderChart = (chart: ExtendedChart) => {
    
    // FIXED: Enhanced validation for gauge charts
    if (chart.plot_type === "gauge" && chart.value !== undefined && chart.value !== null && typeof chart.value === "number" && !isNaN(chart.value)) {
      const chartType = chart.chartType || 'gauge';
      
      if (chartType === 'gauge') {
        return (
          <CircularGauge
            value={chart.value}
            maxValue={chart.styling?.max_value || 100}
            title=""
            unit={chart.styling?.unit}
            status={chart.status}
            size={140}
          />
        );
      }
    }
    
    if (isValidPieChartData(chart)) {
      const chartType = chart.chartType || 'pie';
      switch (chartType) {
        case 'donut':
          return <DonutChart data={chart.series} status={chart.status} size={200} />;
        case 'horizontal-bar':
          return <HorizontalBarChart data={chart.series} status={chart.status} size={280} />;
        case 'vertical-bar':
          return <VerticalBarChart data={chart.series} status={chart.status} size={250} />;
        case 'pie':
        default:
          return <PieChart data={chart.series} status={chart.status} size={180} />;
      }
    }
    
    // Handle line charts, histograms, and waterfall charts
    if (chart.series && chart.x_axis) {
      const chartType = chart.chartType;
      
      if (chartType === 'line') {
        return (
          <div className="w-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center text-gray-600 mb-4 font-medium">
                Line Chart
              </div>
              <div className="space-y-3">
                {Object.entries(chart.series).map(([seriesName, values]) => (
                  <div key={seriesName}>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                    </div>
                    <div className="relative" style={{ height: "120px" }}>
                      <svg width="100%" height="120" className="overflow-visible">
                        {Array.isArray(values) && (values as number[]).map((value, index) => {
                          const x = (index / ((values as number[]).length - 1)) * 280;
                          const y = 100 - (value / Math.max(...(values as number[]))) * 80;
                          const nextValue = (values as number[])[index + 1];
                          const nextX = ((index + 1) / ((values as number[]).length - 1)) * 280;
                          const nextY = nextValue ? 100 - (nextValue / Math.max(...(values as number[]))) * 80 : y;
                          
                          return (
                            <g key={index}>
                              {index < (values as number[]).length - 1 && (
                                <line
                                  x1={x}
                                  y1={y}
                                  x2={nextX}
                                  y2={nextY}
                                  stroke="#8B5CF6"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              )}
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#8B5CF6"
                              />
                            </g>
                          );
                        })}
                      </svg>
                      <div className="flex justify-between mt-2">
                        {chart.x_axis?.map((label, index) => (
                          <span key={index} className="text-xs text-gray-600 text-center" style={{ fontSize: "10px" }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (chartType === 'histogram') {
        return (
          <div className="w-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center text-gray-600 mb-4 font-medium">
                Histogram
              </div>
              <div className="space-y-3">
                {Object.entries(chart.series).map(([seriesName, values]) => (
                  <div key={seriesName}>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                    </div>
                    <div className="flex items-end justify-center space-x-0.5" style={{ height: "100px", paddingBottom: "25px" }}>
                      {Array.isArray(values) &&
                        (values as number[]).map((value, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                            style={{ width: "28px" }}
                          >
                            <div
                              className="bg-blue-500 w-full"
                              style={{
                                height: `${(value / Math.max(...(values as number[]))) * 70}px`,
                                minHeight: "4px",
                              }}
                            ></div>
                            <span
                              className="text-xs text-gray-600 mt-2 text-center leading-3"
                              style={{
                                fontSize: "8px",
                                maxWidth: "32px",
                                wordWrap: "break-word",
                                lineHeight: "10px"
                              }}
                            >
                              {chart.x_axis?.[index]}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (chartType === 'waterfall') {
        return (
          <div className="w-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center text-gray-600 mb-4 font-medium">
                Waterfall Chart
              </div>
              <div className="space-y-3">
                {Object.entries(chart.series).map(([seriesName, values]) => (
                  <div key={seriesName}>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                    </div>
                    <div className="flex items-end justify-center space-x-2" style={{ height: "140px", paddingTop: "20px" }}>
                      {Array.isArray(values) &&
                        (values as number[]).map((value, index) => {
                          const maxValue = Math.max(...(values as number[]));
                          const isFirst = index === 0;
                          const isLast = index === (values as number[]).length - 1;
                          
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                              style={{ width: "50px" }}
                            >
                              <div
                                className={`w-full ${
                                  isFirst ? 'bg-gray-400' : 
                                  isLast ? 'bg-green-500' : 
                                  value > 0 ? 'bg-blue-500' : 'bg-red-500'
                                }`}
                                style={{
                                  height: `${Math.abs(value) / maxValue * 90}px`,
                                  minHeight: "8px"
                                }}
                              ></div>
                              <span
                                className="text-xs text-gray-600 mt-3 text-center"
                                style={{
                                  fontSize: "9px",
                                  maxWidth: "55px",
                                  lineHeight: "12px"
                                }}
                              >
                                {chart.x_axis?.[index]}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      // Default series rendering for other chart types
      return (
        <div className="w-full">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-600 mb-4 font-medium">
              {chart.plot_type.charAt(0).toUpperCase() + chart.plot_type.slice(1)} Chart
            </div>
            <div className="space-y-3">
              {Object.entries(chart.series).map(([seriesName, values]) => (
                <div key={seriesName}>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                  </div>
                  <div className="flex items-end space-x-1" style={{ height: "80px" }}>
                    {Array.isArray(values) &&
                      (values as number[]).map((value, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                          style={{ maxWidth: "40px" }}
                        >
                          <div
                            className="bg-purple-500 w-full rounded-t"
                            style={{
                              height: `${(value / Math.max(...(values as number[]))) * 60}px`,
                              minHeight: "4px",
                            }}
                          ></div>
                          <span
                            className="text-xs text-gray-600 mt-1 text-center"
                            style={{
                              transform: "rotate(-45deg)",
                              transformOrigin: "center bottom",
                              marginTop: "8px",
                              fontSize: "10px",
                            }}
                          >
                            {chart.x_axis?.[index]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Chart data not available</p>
      </div>
    );
  };

  // Get chart type label - updated to include all chart types
  const getChartTypeLabel = (chartType?: string) => {
    switch (chartType) {
      case 'donut': return 'Donut Chart';
      case 'horizontal-bar': return 'Horizontal Bar';
      case 'vertical-bar': return 'Vertical Bar';
      case 'pie': return 'Pie Chart';
      case 'gauge': return 'Circular Gauge';
      case 'line': return 'Line Chart';
      case 'histogram': return 'Histogram';
      case 'waterfall': return 'Waterfall Chart';
      default: return '';
    }
  };

  // Create expanded chart list with variations
  const expandedCharts: ExtendedChart[] = charts.flatMap(chart => createChartVariations(chart));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading charts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Charts</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadChartsFromAPI}
                className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
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
      <div className="text-center p-12 text-gray-500">
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p>No charts available for this video.</p>
        {analyticsId && !mockMode && apiService && (
          <button
            onClick={loadChartsFromAPI}
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Load Charts
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">Analytics Charts</h3>
        {analyticsId && apiService && (
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 border border-teal-200"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {expandedCharts.map((chart) => (
          // MAIN CHART CONTAINER - This is what gets captured for PDF
          <div
            key={chart.id}
            className="chart-container bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 p-8 relative flex flex-col"
            data-chart-id={chart.id}
            data-chart-type={chart.plot_type}
            data-chart-title={chart.title}
            style={{ minHeight: "400px" }} // Increased minimum height
          >
            {/* Individual chart refresh button - only for original charts */}
            {analyticsId && !mockMode && apiService && !chart.chartType && (
              <button
                onClick={() => refreshChart(chart.id.replace(/_[^_]*$/, ''))} // Remove variation suffix
                disabled={refreshingCharts.has(chart.id.replace(/_[^_]*$/, ''))}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg"
                title="Refresh this chart"
              >
                <svg
                  className={`w-4 h-4 ${
                    refreshingCharts.has(chart.id.replace(/_[^_]*$/, '')) ? "animate-spin" : ""
                  }`}
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
              </button>
            )}

            {/* Chart Title - Always present for PDF capture */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                {chart.title}
              </h3>
              <div className="flex justify-center items-center space-x-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    chart.status === "excellent"
                      ? "bg-green-100 text-green-800 border-2 border-green-200"
                      : chart.status === "good"
                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                      : "bg-red-100 text-red-800 border-2 border-red-200"
                  }`}
                >
                  {chart.status?.toUpperCase() || "UNKNOWN"}
                </span>
                
                {/* Show chart type for variations */}
                {chart.chartType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {getChartTypeLabel(chart.chartType)}
                  </span>
                )}
              </div>
            </div>

            {/* Chart Visualization Area */}
            <div
              className="chart-visualization mb-8 flex justify-center items-center flex-grow"
              style={{ minHeight: "220px" }}
            >
              {renderChart(chart)}
            </div>

            {/* Data Summary for PDF capture */}
            {(chart.value !== undefined || chart.series) && (
              <div className="data-summary bg-gray-50 rounded-xl p-4 mb-6 text-sm border border-gray-100">
                <div className="font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Data Summary
                </div>
                <div className="space-y-2">
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
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">{category}:</span>
                            <span className="font-bold text-gray-900">
                              {Array.isArray(chart.series.value)
                                ? chart.series.value[idx]
                                : chart.series.value}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                </div>
              </div>
            )}

            {/* Insights section for each chart - Always at bottom */}
            {chart.insights && chart.insights.length > 0 && (
              <div className="insights-section border-t border-gray-200 pt-6 mt-auto">
                <h4 className="font-semibold text-gray-900 mb-4 text-base flex items-center">
                  <span className="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
                  Key Insights
                </h4>
                <ul className="space-y-3">
                  {chart.insights.map((insight: string, index: number) => (
                    <li
                      key={index}
                      className="text-gray-700 text-sm flex items-start leading-relaxed"
                    >
                      <span className="text-teal-500 mr-3 mt-1 text-lg">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartDisplay;
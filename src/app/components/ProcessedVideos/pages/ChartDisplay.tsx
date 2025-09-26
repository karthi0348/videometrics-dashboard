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

  // Helper function to validate gauge chart data
  const isValidGaugeChartData = (chart: GeneratedChart): boolean => {
    return (
      chart.plot_type === "gauge" &&
      chart.value !== undefined &&
      chart.value !== null &&
      typeof chart.value === "number" &&
      !isNaN(chart.value)
    );
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

  // Function to create multiple chart variations for pie data, gauge data, and bar data
  const createChartVariations = (chart: GeneratedChart): ExtendedChart[] => {
    // Create variations for pie charts
    if (isValidPieChartData(chart)) {
      // Convert pie to bar format for bar and histogram variations
      const categories = chart.series?.label || chart.series?.category || [];
      const values = chart.series?.values || chart.series?.value || [];
      
      const barVersion: ExtendedChart = {
        ...chart,
        plot_type: "bar" as const,
        x_axis: categories,
        series: {
          data: values
        } as any
      };

      return [
        { ...chart, id: `${chart.id}_pie`, title: `${chart.title} (Pie Chart)`, chartType: 'pie' },
        { ...chart, id: `${chart.id}_donut`, title: `${chart.title} (Donut Chart)`, chartType: 'donut' },
        { ...chart, id: `${chart.id}_hbar`, title: `${chart.title} (Horizontal Bar)`, chartType: 'horizontal-bar' },
        { ...chart, id: `${chart.id}_vbar`, title: `${chart.title} (Vertical Bar)`, chartType: 'vertical-bar' },
        { ...barVersion, id: `${chart.id}_bar`, title: `${chart.title} (Bar Chart)`, chartType: 'bar' },
        { ...barVersion, id: `${chart.id}_histogram`, title: `${chart.title} (Histogram)`, chartType: 'histogram' }
      ];
    }

    // Create variations for gauge charts
    if (isValidGaugeChartData(chart)) {
      const maxValue = chart.styling?.max_value || 100;
      const currentValue = chart.value as number;
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

      // Convert gauge to bar format for bar and histogram variations
      const barVersion: ExtendedChart = {
        ...chart,
        plot_type: "bar" as const,
        x_axis: ["Current Value", "Remaining"],
        series: {
          data: [currentValue, remainingValue]
        } as any
      };

      return [
        { ...chart, id: `${chart.id}_gauge`, title: `${chart.title} (Gauge)`, chartType: 'gauge' },
        { ...pieVersion, id: `${chart.id}_pie`, title: `${chart.title} (Pie Chart)`, chartType: 'pie' },
        { ...barVersion, id: `${chart.id}_bar`, title: `${chart.title} (Bar Chart)`, chartType: 'bar' },
        { ...barVersion, id: `${chart.id}_histogram`, title: `${chart.title} (Histogram)`, chartType: 'histogram' }
      ];
    }

    // Create variations for bar charts
    if (isValidBarChartData(chart)) {
      // Get the first series data for variations
      const seriesEntries = Object.entries(chart.series);
      if (seriesEntries.length > 0) {
        const [seriesName, seriesData] = seriesEntries[0];
        const values = Array.isArray(seriesData) ? seriesData : [];
        
        if (values.length > 0 && chart.x_axis) {
          // Convert bar to pie format
          const pieVersion: ExtendedChart = {
            ...chart,
            plot_type: "pie" as const,
            series: {
              category: chart.x_axis,
              value: values,
              label: chart.x_axis,
              values: values
            } as ChartSeries
          };

          return [
            { ...chart, id: `${chart.id}_bar`, title: `${chart.title} (Bar Chart)`, chartType: 'bar' },
            { ...chart, id: `${chart.id}_histogram`, title: `${chart.title} (Histogram)`, chartType: 'histogram' },
            { ...pieVersion, id: `${chart.id}_pie`, title: `${chart.title} (Pie Chart)`, chartType: 'pie' }
          ];
        }
      }
    }

    return [chart]; // Return original chart if no variations available
  };

  // Helper function to render bar chart from categories and values
  const renderBarChart = (categories: string[], values: number[]) => {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center p-6">
          <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
            Bar Chart
          </div>
          <div className="w-full" style={{ height: "120px" }}>
            {Array.isArray(values) && values.length > 0 && (
              <svg 
                width="100%" 
                height="120" 
                viewBox="0 0 300 120" 
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
              >
                {/* Chart bars */}
                {values.map((value, index) => {
                  const barWidth = Math.min(25, (280 / values.length) - 2);
                  const maxValue = Math.max(...values);
                  const barHeight = Math.max(3, (value / maxValue) * 70);
                  const x = 20 + (index * (280 / values.length));
                  const y = 90 - barHeight;
                  
                  return (
                    <g key={index}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#3B82F6"
                        rx="2"
                        ry="2"
                      />
                      {/* Value label on top of bar */}
                      <text
                        x={x + barWidth/2}
                        y={y - 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#374151"
                        fontWeight="500"
                      >
                        {value}
                      </text>
                      {/* X-axis label */}
                      <text
                        x={x + barWidth/2}
                        y={105}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6B7280"
                        transform={`rotate(-10, ${x + barWidth/2}, 105)`}
                      >
                        {categories[index] || `Item ${index + 1}`}
                      </text>
                    </g>
                  );
                })}
                {/* Y-axis line */}
                <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                {/* X-axis line */}
                <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render histogram from categories and values
  const renderHistogramChart = (categories: string[], values: number[]) => {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center p-6">
          <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
            Histogram
          </div>
          <div className="w-full" style={{ height: "120px" }}>
            {Array.isArray(values) && values.length > 0 && (
              <svg 
                width="100%" 
                height="120" 
                viewBox="0 0 300 120" 
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
              >
                {values.map((value, index) => {
                  const barWidth = Math.max(8, (260 / values.length));
                  const maxValue = Math.max(...values);
                  const barHeight = Math.max(3, (value / maxValue) * 70);
                  const x = 20 + (index * barWidth);
                  const y = 90 - barHeight;
                  
                  return (
                    <g key={index}>
                      {/* Histogram bar - no gaps between bars */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#10B981"
                        stroke="#059669"
                        strokeWidth="0.5"
                      />
                      {/* Value label on top of bar */}
                      <text
                        x={x + barWidth/2}
                        y={y - 3}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#374151"
                        fontWeight="500"
                      >
                        {value}
                      </text>
                      {/* X-axis label */}
                      <text
                        x={x + barWidth/2}
                        y={105}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#6B7280"
                        transform={`rotate(-10, ${x + barWidth/2}, 105)`}
                      >
                        {categories[index] || `${index + 1}`}
                      </text>
                    </g>
                  );
                })}
                {/* Y-axis line */}
                <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                {/* X-axis line */}
                <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                {/* Y-axis ticks and labels */}
                {[0, 25, 50, 75, 100].map((tick, idx) => {
                  const maxValue = Math.max(...values);
                  const tickValue = Math.round((tick / 100) * maxValue);
                  const tickY = 90 - (tick / 100) * 70;
                  return (
                    <g key={idx}>
                      <line x1="12" y1={tickY} x2="15" y2={tickY} stroke="#9CA3AF" strokeWidth="1"/>
                      <text x="10" y={tickY + 2} textAnchor="end" fontSize="7" fill="#6B7280">
                        {tickValue}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to render the appropriate chart based on chartType
  const renderChart = (chart: ExtendedChart) => {
    
    // Handle gauge charts with responsive sizing
    if (chart.plot_type === "gauge" && isValidGaugeChartData(chart)) {
      const chartType = chart.chartType || 'gauge';
      
      if (chartType === 'gauge') {
        return (
          <CircularGauge
            value={chart.value as number}
            maxValue={chart.styling?.max_value || 100}
            title=""
            unit={chart.styling?.unit}
            status={chart.status}
            size={180} // Reduced from 140 for mobile
          />
        );
      } else if (chartType === 'bar') {
        // Convert gauge to bar chart
        const maxValue = chart.styling?.max_value || 100;
        const currentValue = chart.value as number;
        const remainingValue = Math.max(0, maxValue - currentValue);
        return renderBarChart(["Current Value", "Remaining"], [currentValue, remainingValue]);
      } else if (chartType === 'histogram') {
        // Convert gauge to histogram
        const maxValue = chart.styling?.max_value || 100;
        const currentValue = chart.value as number;
        const remainingValue = Math.max(0, maxValue - currentValue);
        return renderHistogramChart(["Current Value", "Remaining"], [currentValue, remainingValue]);
      }
    }
    
    // Handle pie charts with responsive sizing
    if (isValidPieChartData(chart)) {
      const chartType = chart.chartType || 'pie';
      switch (chartType) {
        case 'donut':
          return <DonutChart data={chart.series} status={chart.status} size={160} />;
        case 'horizontal-bar':
          return <HorizontalBarChart data={chart.series} status={chart.status} size={220} />;
        case 'vertical-bar':
          return <VerticalBarChart data={chart.series} status={chart.status} size={200} />;
        case 'bar':
          // Convert pie data to bar chart format
          const categories = chart.series?.label || chart.series?.category || [];
          const values = chart.series?.values || chart.series?.value || [];
          return renderBarChart(categories, values);
        case 'histogram':
          // Convert pie data to histogram format
          const histCategories = chart.series?.label || chart.series?.category || [];
          const histValues = chart.series?.values || chart.series?.value || [];
          return renderHistogramChart(histCategories, histValues);
        case 'pie':
        default:
          return <PieChart data={chart.series} status={chart.status} size={180} />;
      }
    }
    
    // Handle bar charts with mobile-responsive layout
    if (chart.plot_type === "bar" && isValidBarChartData(chart)) {
      const chartType = chart.chartType || 'bar';
      
      if (chartType === 'histogram') {
        return (
          <div className="w-full">
            <div className="flex flex-col items-center p-6">
              <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                Histogram
              </div>
              <div className="space-y-3">
                {Object.entries(chart.series).map(([seriesName, values]) => (
                  <div key={seriesName}>
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                    </div>
                    <div className="relative w-full" style={{ height: "120px" }}>
                      <svg 
                        width="100%" 
                        height="120" 
                        viewBox="0 0 300 120" 
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                      >
                        {Array.isArray(values) && (values as number[]).map((value, index) => {
                          const barWidth = Math.max(8, (260 / (values as number[]).length));
                          const maxValue = Math.max(...(values as number[]));
                          const barHeight = Math.max(3, (value / maxValue) * 70);
                          const x = 20 + (index * barWidth);
                          const y = 90 - barHeight;
                          
                          return (
                            <g key={index}>
                              {/* Histogram bar - no gaps between bars */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#10B981"
                                stroke="#059669"
                                strokeWidth="0.5"
                              />
                              {/* Value label on top of bar */}
                              <text
                                x={x + barWidth/2}
                                y={y - 3}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#374151"
                                fontWeight="500"
                              >
                                {value}
                              </text>
                              {/* X-axis label */}
                              <text
                                x={x + barWidth/2}
                                y={105}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#6B7280"
                                transform={`rotate(-10, ${x + barWidth/2}, 105)`}
                              >
                                {chart.x_axis?.[index] || `${index + 1}`}
                              </text>
                            </g>
                          );
                        })}
                        {/* Y-axis line */}
                        <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                        {/* X-axis line */}
                        <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                        {/* Y-axis ticks and labels */}
                        {[0, 25, 50, 75, 100].map((tick, idx) => {
                          const maxValue = Math.max(...Object.values(chart.series).flat() as number[]);
                          const tickValue = Math.round((tick / 100) * maxValue);
                          const tickY = 90 - (tick / 100) * 70;
                          return (
                            <g key={idx}>
                              <line x1="12" y1={tickY} x2="15" y2={tickY} stroke="#9CA3AF" strokeWidth="1"/>
                              <text x="10" y={tickY + 2} textAnchor="end" fontSize="7" fill="#6B7280">
                                {tickValue}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      // Default bar chart rendering with mobile responsiveness and PDF-friendly SVG
      return (
        <div className="w-full">
          <div className="flex flex-col items-center p-6">
            <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
              Bar Chart
            </div>
            <div className="space-y-3">
              {Object.entries(chart.series).map(([seriesName, values]) => (
                <div key={seriesName}>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                  </div>
                  <div className="w-full" style={{ height: "120px" }}>
                    {Array.isArray(values) && values.length > 0 && (
                      <svg 
                        width="100%" 
                        height="120" 
                        viewBox="0 0 300 120" 
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                      >
                        {/* Chart bars */}
                        {(values as number[]).map((value, index) => {
                          const barWidth = Math.min(25, (280 / (values as number[]).length) - 2);
                          const maxValue = Math.max(...(values as number[]));
                          const barHeight = Math.max(3, (value / maxValue) * 70);
                          const x = 20 + (index * (280 / (values as number[]).length));
                          const y = 90 - barHeight;
                          
                          return (
                            <g key={index}>
                              {/* Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#3B82F6"
                                rx="2"
                                ry="2"
                              />
                              {/* Value label on top of bar */}
                              <text
                                x={x + barWidth/2}
                                y={y - 3}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#374151"
                                fontWeight="500"
                              >
                                {value}
                              </text>
                              {/* X-axis label */}
                              <text
                                x={x + barWidth/2}
                                y={105}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#6B7280"
                                transform={`rotate(-10, ${x + barWidth/2}, 105)`}
                              >
                                {chart.x_axis?.[index] || `Item ${index + 1}`}
                              </text>
                            </g>
                          );
                        })}
                        {/* Y-axis line */}
                        <line x1="15" y1="20" x2="15" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                        {/* X-axis line */}
                        <line x1="15" y1="90" x2="285" y2="90" stroke="#E5E7EB" strokeWidth="1"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Handle series-based charts (histogram, waterfall, etc.) with mobile responsiveness
    if (chart.series && chart.x_axis) {
      const chartType = chart.chartType;
      
      if (chartType === 'histogram') {
        return (
          <div className="w-full">
            <div className="p-4">
              <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                Histogram
              </div>
              <div className="space-y-3">
                {Object.entries(chart.series).map(([seriesName, values]) => (
                  <div key={seriesName}>
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                    </div>
                    <div className="relative w-full" style={{ height: "110px" }}>
                      <svg 
                        width="100%" 
                        height="85" 
                        viewBox="0 0 280 85" 
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                      >
                        {Array.isArray(values) && (values as number[]).map((value, index) => {
                          const barWidth = Math.max(6, (240 / (values as number[]).length));
                          const maxValue = Math.max(...(values as number[]));
                          const barHeight = Math.max(3, (value / maxValue) * 50);
                          const x = 20 + (index * barWidth);
                          const y = 65 - barHeight;
                          
                          return (
                            <g key={index}>
                              {/* Histogram bar - no gaps */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#10B981"
                                stroke="#059669"
                                strokeWidth="0.5"
                              />
                              {/* Value label */}
                              <text
                                x={x + barWidth/2}
                                y={y - 2}
                                textAnchor="middle"
                                fontSize="6"
                                fill="#374151"
                                fontWeight="500"
                              >
                                {value}
                              </text>
                            </g>
                          );
                        })}
                        {/* Axes */}
                        <line x1="15" y1="15" x2="15" y2="65" stroke="#E5E7EB" strokeWidth="1"/>
                        <line x1="15" y1="65" x2="265" y2="65" stroke="#E5E7EB" strokeWidth="1"/>
                      </svg>
                      <div className="flex justify-between mt-2 px-2 overflow-x-auto">
                        {chart.x_axis?.map((label, index) => (
                          <span 
                            key={index} 
                            className="text-xs text-gray-600 text-center flex-1 min-w-0" 
                            style={{ fontSize: "9px", wordBreak: "break-word" }}
                          >
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
      
      // Default series rendering for other chart types with mobile responsiveness and PDF-friendly SVG
      return (
        <div className="w-full">
          <div className="p-4">
            <div className="text-center text-gray-600 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
              {chart.plot_type.charAt(0).toUpperCase() + chart.plot_type.slice(1)} Chart
            </div>
            <div className="space-y-3">
              {Object.entries(chart.series).map(([seriesName, values]) => (
                <div key={seriesName}>
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                  </div>
                  <div className="w-full" style={{ height: "100px" }}>
                    {Array.isArray(values) && values.length > 0 && (
                      <svg 
                        width="100%" 
                        height="100" 
                        viewBox="0 0 300 100" 
                        preserveAspectRatio="xMidYMid meet"
                        className="overflow-visible"
                      >
                        {/* Chart bars */}
                        {(values as number[]).map((value, index) => {
                          const barWidth = Math.min(20, (260 / (values as number[]).length) - 2);
                          const maxValue = Math.max(...(values as number[]));
                          const barHeight = Math.max(3, (value / maxValue) * 50);
                          const x = 20 + (index * (260 / (values as number[]).length));
                          const y = 70 - barHeight;
                          
                          return (
                            <g key={index}>
                              {/* Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill="#8B5CF6"
                                rx="2"
                                ry="2"
                              />
                              {/* Value label on top of bar */}
                              <text
                                x={x + barWidth/2}
                                y={y - 2}
                                textAnchor="middle"
                                fontSize="7"
                                fill="#374151"
                                fontWeight="500"
                              >
                                {value}
                              </text>
                              {/* X-axis label */}
                              <text
                                x={x + barWidth/2}
                                y={85}
                                textAnchor="middle"
                                fontSize="6"
                                fill="#6B7280"
                                transform={`rotate(-45, ${x + barWidth/2}, 85)`}
                              >
                                {chart.x_axis?.[index] || `Item ${index + 1}`}
                              </text>
                            </g>
                          );
                        })}
                        {/* Y-axis line */}
                        <line x1="15" y1="20" x2="15" y2="70" stroke="#E5E7EB" strokeWidth="1"/>
                        {/* X-axis line */}
                        <line x1="15" y1="70" x2="285" y2="70" stroke="#E5E7EB" strokeWidth="1"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm">Chart data not available</p>
      </div>
    );
  };

  // Get chart type label - updated to include histogram
  const getChartTypeLabel = (chartType?: string) => {
    switch (chartType) {
      case 'donut': return 'Donut Chart';
      case 'horizontal-bar': return 'Horizontal Bar';
      case 'vertical-bar': return 'Vertical Bar';
      case 'pie': return 'Pie Chart';
      case 'gauge': return 'Circular Gauge';
      case 'histogram': return 'Histogram';
      case 'bar': return 'Bar Chart';
      default: return '';
    }
  };

  // Create expanded chart list with variations
  const expandedCharts: ExtendedChart[] = charts.flatMap(chart => createChartVariations(chart));

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
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="min-w-0 flex-1">
              <h3 className="text-red-800 font-medium text-sm sm:text-base">Error Loading Charts</h3>
              <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">{error}</p>
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
          <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm sm:text-base">No charts available for this video.</p>
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
      {/* Header with refresh button - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Analytics Charts</h3>
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

      {/* Charts Grid - Mobile responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {expandedCharts.map((chart) => (
          <div
            key={chart.id}
            className="chart-container bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 p-4 sm:p-6 lg:p-8 relative flex flex-col"
            data-chart-id={chart.id}
            data-chart-type={chart.plot_type}
            data-chart-title={chart.title}
            style={{ minHeight: "400px" }}
          >
            {/* Individual chart refresh button - only for original charts, mobile responsive */}
            {analyticsId && !mockMode && apiService && !chart.chartType && (
              <button
                onClick={() => refreshChart(chart.id.replace(/_[^_]*$/, ''))} // Remove variation suffix
                disabled={refreshingCharts.has(chart.id.replace(/_[^_]*$/, ''))}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg"
                title="Refresh this chart"
              >
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
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

            {/* Chart Title - Mobile responsive */}
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
                
                {/* Show chart type for variations */}
                {chart.chartType && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {getChartTypeLabel(chart.chartType)}
                  </span>
                )}
              </div>
            </div>

            {/* Chart Visualization Area - Mobile responsive */}
            <div
              className=" "
              style={{ minHeight: "100px" }}
            >
              {renderChart(chart)}
            </div>

            {/* Data Summary for PDF capture - Mobile responsive */}
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
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium truncate mr-2">{category}:</span>
                            <span className="font-bold text-gray-900 flex-shrink-0">
                              {Array.isArray(chart.series.value)
                                ? chart.series.value[idx]
                                : chart.series.value}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  {/* Handle bar chart series data */}
                  {chart.plot_type === "bar" && chart.series && chart.x_axis && (
                    <>
                      {Object.entries(chart.series).map(([seriesName, seriesValues]) => (
                        <div key={seriesName} className="space-y-1">
                          <div className="text-gray-700 font-medium text-xs uppercase tracking-wide">
                            {seriesName}
                          </div>
                          {Array.isArray(seriesValues) && chart.x_axis && seriesValues.map((value, idx) => (
                            <div key={idx} className="flex justify-between items-center pl-2 sm:pl-4">
                              <span className="text-gray-600 font-medium truncate mr-2">{chart.x_axis[idx]}:</span>
                              <span className="font-bold text-gray-900 flex-shrink-0">
                                {value} {chart.y_axis_label || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Insights section for each chart - Mobile responsive */}
            {chart.insights && chart.insights.length > 0 && (
              <div className="insights-section border-t border-gray-200 pt-6 ">
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
                      <span className="text-teal-500 mr-2 sm:mr-3 mt-0.5 sm:mt-1 text-base sm:text-lg flex-shrink-0">•</span>
                      <span className="min-w-0">{insight}</span>
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
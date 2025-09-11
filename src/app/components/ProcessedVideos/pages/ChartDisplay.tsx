import React, { useState, useEffect, useCallback } from "react";
import { GeneratedChart } from "../types/types";
import { PieChart, CircularGauge } from "./ChartComponents";

// Define API service interface
interface ApiService {
  getCharts: (analyticsId: string) => Promise<GeneratedChart[] | string>;
  refreshChart: (analyticsId: string, chartId: string) => Promise<GeneratedChart | string>;
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

      const response = await apiService.getCharts(analyticsId);

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

  // Load charts from API if analyticsId is provided and no initial charts
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
          console.error(
            "Failed to parse refresh chart JSON response:",
            response
          );
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
      // Could add toast notification here instead of setting error state
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
      // If in mock mode or no API service, just reload from initial charts
      if (initialCharts) {
        setCharts(initialCharts);
      }
      return;
    }

    await loadChartsFromAPI();
  };

  // Helper function to validate pie chart data
  const isValidPieChartData = (chart: GeneratedChart): boolean => {
    return (
      chart.plot_type === "pie" &&
      chart.series &&
      Array.isArray(chart.series.valueOf) &&
      Array.isArray(chart.series.category) &&
      chart.series.valueOf.length > 0 &&
      chart.series.category.length > 0 &&
      chart.series.valueOf.length === chart.series.category.length
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
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
            <svg
              className="w-5 h-5 text-red-400 mt-0.5 mr-3"
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
          <svg
            className="w-12 h-12 mx-auto text-gray-300"
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
        <p>No charts available for this video.</p>
        {analyticsId && !mockMode && apiService && (
          <button
            onClick={loadChartsFromAPI}
            className="mt-4 inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Load Charts
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Analytics Charts</h3>
        {analyticsId && apiService && (
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          // MAIN CHART CONTAINER - This is what gets captured for PDF
          <div 
            key={chart.id} 
            className="chart-container bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative"
            data-chart-id={chart.id}
            data-chart-type={chart.plot_type}
            data-chart-title={chart.title}
            style={{ minHeight: '300px' }} // Ensure consistent sizing
          >
            {/* Individual chart refresh button */}
            {analyticsId && !mockMode && apiService && (
              <button
                onClick={() => refreshChart(chart.id)}
                disabled={refreshingCharts.has(chart.id)}
                className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 bg-white rounded-full shadow-sm border border-gray-200"
                title="Refresh this chart"
              >
                <svg
                  className={`w-3.5 h-3.5 ${
                    refreshingCharts.has(chart.id) ? "animate-spin" : ""
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {chart.title}
              </h3>
              <div className="flex justify-center mt-2">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    chart.status === 'excellent' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : chart.status === 'good' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {chart.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>

            {/* Chart Visualization Area */}
            <div className="chart-visualization mb-6 flex justify-center items-center" style={{ minHeight: '150px' }}>
              {chart.plot_type === "gauge" && chart.value !== undefined ? (
                <CircularGauge
                  value={chart.value}
                  maxValue={chart.styling?.max_value || 100}
                  title=""  // Title is handled above
                  unit={chart.styling?.unit}
                  status={chart.status}
                  size={140}
                />
              ) : isValidPieChartData(chart) ? (
                <PieChart
                  data={{
                    value: chart.series!.valueOf as number[],
                    category: chart.series!.category as string[],
                  }}
                  title=""  // Title is handled above
                  status={chart.status}
                />
              ) : chart.series && chart.x_axis ? (
                <div className="w-full">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center text-gray-600 mb-4 font-medium">
                      {chart.plot_type.charAt(0).toUpperCase() +
                        chart.plot_type.slice(1)}{" "}
                      Chart
                    </div>
                    <div className="space-y-3">
                      {Object.entries(chart.series).map(
                        ([seriesName, values]) => (
                          <div key={seriesName}>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              {seriesName.charAt(0).toUpperCase() + seriesName.slice(1)}
                            </div>
                            <div
                              className="flex items-end space-x-1"
                              style={{ height: "80px" }}
                            >
                              {Array.isArray(values) && (values as number[]).map((value, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col items-center flex-1"
                                  style={{ maxWidth: '40px' }}
                                >
                                  <div
                                    className="bg-teal-500 w-full rounded-t"
                                    style={{
                                      height: `${
                                        (value /
                                          Math.max(...(values as number[]))) *
                                        60
                                      }px`,
                                      minHeight: "4px",
                                    }}
                                  ></div>
                                  <span 
                                    className="text-xs text-gray-600 mt-1 text-center"
                                    style={{ 
                                      transform: 'rotate(-45deg)', 
                                      transformOrigin: 'center bottom',
                                      marginTop: '8px',
                                      fontSize: '10px'
                                    }}
                                  >
                                    {chart.x_axis?.[index]}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Chart data not available</p>
                </div>
              )}
            </div>

            {/* Data Summary for PDF capture */}
            {(chart.value !== undefined || chart.series) && (
              <div className="data-summary bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                <div className="font-medium text-gray-700 mb-2">Data Summary:</div>
                <div className="space-y-1">
                  {chart.value !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">{chart.value} {chart.styling?.unit || ''}</span>
                    </div>
                  )}
                  {chart.series?.category && chart.series?.value && Array.isArray(chart.series.category) && (
                    <>
                      {chart.series.category.map((category, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-600">{category}:</span>
                          <span className="font-medium">
                            {Array.isArray(chart.series.value) ? chart.series.value[idx] : chart.series.value}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Insights section for each chart */}
            {chart.insights && chart.insights.length > 0 && (
              <div className="insights-section border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3 text-sm flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {chart.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start">
                      <span className="text-teal-500 mr-2 mt-1">•</span>
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
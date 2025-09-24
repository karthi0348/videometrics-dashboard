// VideoMetricsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { VideoMetricsPageProps } from "../types/types";
import {
  useAnalyticsData,
  useChartsData,
  useSummaryData,
  useInsightsData,
} from "../hooks/useVideoMetrics";
import {
  PageHeader,
  VideoInfoBanner,
  NavigationTabs,
  LoadingState,
  ErrorState,
} from "./VideoMetricsUI";
import ChartDisplay from "./ChartDisplay";
import SummaryView from "./SummaryView";
import RawDataView from "./RawDataView";

const VideoMetricsPage: React.FC<VideoMetricsPageProps> = ({
  analyticsId,
  videoTitle,
  mockMode = false,
  onNavigate,
}) => {
  const [activeView, setActiveView] = useState<"charts" | "summary" | "raw">(
    "charts"
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const pageContentRef = useRef<HTMLDivElement>(null);

  // Data hooks for different views
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    loadAnalytics,
    apiService,
  } = useAnalyticsData(analyticsId, mockMode);

  const {
    chartsOnly,
    loading: chartsLoading,
    error: chartsError,
    loadChartsOnly,
  } = useChartsData(analyticsId, mockMode);

  const {
    summaryOnly,
    loading: summaryLoading,
    error: summaryError,
    loadSummaryOnly,
  } = useSummaryData(analyticsId, mockMode);

  const { insights, loadInsights } = useInsightsData(analyticsId, mockMode);

  // Load data based on active view
  useEffect(() => {
    if (!analyticsId) return;

    switch (activeView) {
      case "charts":
        loadChartsOnly();
        break;
      case "summary":
        loadSummaryOnly();
        break;
      case "raw":
        loadAnalytics();
        break;
    }

    loadInsights();
  }, [
    analyticsId,
    activeView,
    loadChartsOnly,
    loadSummaryOnly,
    loadAnalytics,
    loadInsights,
  ]);
  useEffect(() => {
    if (analyticsId) {
      loadAnalytics(); // 👈 always fetch base analytics data
    }
  }, [analyticsId, loadAnalytics]);

  // Event handlers
  const handleRefresh = () => {
    switch (activeView) {
      case "charts":
        loadChartsOnly();
        break;
      case "summary":
        loadSummaryOnly();
        break;
      case "raw":
        loadAnalytics();
        break;
    }
    loadInsights();
  };

  const handleBackToProcessed = () => {
    if (onNavigate) {
      onNavigate("processed");
    }
  };

  // Determine current loading state and error
  const getCurrentState = () => {
    switch (activeView) {
      case "charts":
        return { loading: chartsLoading, error: chartsError };
      case "summary":
        return { loading: summaryLoading, error: summaryError };
      case "raw":
        return { loading: analyticsLoading, error: analyticsError };
      default:
        return { loading: false, error: "" };
    }
  };

  const { loading, error } = getCurrentState();

  // Render content based on active view
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={handleRefresh} />;
    }

    switch (activeView) {
      case "charts":
        return (
          <ChartDisplay
            charts={
              chartsOnly.length > 0
                ? chartsOnly
                : analytics?.generated_charts || []
            }
            analyticsId={mockMode ? null : analyticsId}
            apiService={mockMode ? null : apiService}
            mockMode={mockMode}
          />
        );

      case "summary":
        return (
          <SummaryView
            summary={summaryOnly || analytics?.generated_summary}
            insights={insights}
            analyticsId={analyticsId}
            apiService={apiService}
            mockMode={mockMode}
          />
        );

      case "raw":
        if (analytics) {
          return <RawDataView data={analytics} insights={insights} />;
        } else if (!loading && !error) {
          return (
            <div className="px-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">No data available</p>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100">
      <div
        ref={pageContentRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        <PageHeader
          analyticsId={analyticsId}
          videoTitle={videoTitle}
          analytics={analytics}
          loading={loading}
          onRefresh={handleRefresh}
          onBackToProcessed={handleBackToProcessed}
        />

        <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-purple-100/50">
          {analytics && <VideoInfoBanner analytics={analytics} />}

          <NavigationTabs
            activeView={activeView}
            onViewChange={setActiveView}
          />

          <div className="pb-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default VideoMetricsPage;

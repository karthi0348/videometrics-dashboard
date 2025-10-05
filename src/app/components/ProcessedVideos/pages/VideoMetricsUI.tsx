// components/VideoMetricsUI.tsx
import React from "react";
import { VideoAnalytics } from "../types/types";
import {
  EnhancedPDFExportButton,
  generateDirectPDF,
} from "./EnhancedPDFExportButton";

// Loading State Component
export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-6 sm:p-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm sm:text-base">
        Loading analytics data...
      </p>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="p-3 sm:p-6">
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
      <div className="flex">
        <svg
          className="w-5 h-5 text-red-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0"
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
            Error Loading Analytics
          </h3>
          <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">
            {error}
          </p>
          <button
            onClick={onRetry}
            className="mt-2 sm:mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Legacy PDF Export Button Component (fallback)
interface LegacyPDFExportButtonProps {
  analytics: VideoAnalytics | null;
  disabled?: boolean;
}

export const LegacyPDFExportButton: React.FC<LegacyPDFExportButtonProps> = ({
  analytics,
  disabled,
}) => {
  const [exporting, setExporting] = React.useState(false);

  const handleDirectExport = async () => {
    if (!analytics) {
      alert("No analytics data available to export.");
      return;
    }

    setExporting(true);
    try {
      await generateDirectPDF(analytics);
      console.log("PDF exported successfully via direct method");
    } catch (error) {
      console.error("Direct PDF export error:", error);
      alert(
        `PDF export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleDirectExport}
      disabled={exporting || disabled || !analytics}
      className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      title="Export to PDF (Direct Method)"
    >
      {exporting ? (
        <>
          <svg
            className="w-4 h-4 mr-1 sm:mr-2 animate-spin flex-shrink-0"
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
          <span className="hidden sm:inline">Exporting...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="hidden sm:inline">Export PDF (Legacy)</span>
          <span className="sm:hidden">PDF</span>
        </>
      )}
    </button>
  );
};

// Page Header Component with Enhanced PDF Export
interface PageHeaderProps {
  analyticsId: string | null;
  videoTitle?: string;
  analytics: VideoAnalytics | null;
  loading: boolean;
  onRefresh: () => void;
  onBackToProcessed: () => void;
  useEnhancedPDF?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  analyticsId,
  videoTitle,
  analytics,
  loading,
  onRefresh,
  onBackToProcessed,
  useEnhancedPDF = true,
}) => {
  const [showInstructions, setShowInstructions] = React.useState(false);

  return (
    <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-purple-200/50 mb-4 sm:mb-6 mx-2 sm:mx-0">
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
              {videoTitle ||
                analytics?.video_metadata?.video_name ||
                (analytics?.parsed_metrics
                  ? "Customer Flow Analysis"
                  : "Loading...")}
            </h1>
            {analyticsId && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 break-all">
                Analytics ID: {analyticsId}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-1 sm:space-x-2 flex-wrap gap-y-2">
            {/* Back Button */}
            <button
              onClick={onBackToProcessed}
              className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 sm:mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* PDF Instructions Toggle Button */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors rounded-lg flex-shrink-0"
              title="Toggle PDF export instructions"
            >
              <svg
                className="w-4 sm:w-5 h-4 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Enhanced PDF Export Button */}
            <div className="flex-shrink-0">
              {useEnhancedPDF ? (
                <EnhancedPDFExportButton
                  analytics={analytics}
                  disabled={loading}
                />
              ) : (
                <LegacyPDFExportButton
                  analytics={analytics}
                  disabled={loading}
                />
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 flex-shrink-0"
              title="Refresh data"
            >
              <svg
                className={`w-4 sm:w-5 h-4 sm:h-5 ${
                  loading ? "animate-spin" : ""
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
          </div>
        </div>
      </div>

      {/* Collapsible PDF Export Instructions */}
      {showInstructions && (
        <div className="px-3 sm:px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <svg
              className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs sm:text-sm text-blue-700 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">PDF Export Instructions:</p>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-blue-500 hover:text-blue-700 transition-colors ml-2 flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
              <ol className="mt-1 list-decimal list-inside space-y-1 text-xs sm:text-sm">
                <li>
                  Ensure all charts are fully loaded and visible on the screen
                </li>
                <li>Click "Prepare PDF Export" to capture chart images</li>
                <li>
                  Once charts are captured, click "Download PDF" to generate
                  your report
                </li>
              </ol>
              <p className="mt-2 text-xs text-blue-600">
                Tip: Scroll through all charts before exporting to ensure
                they're rendered properly
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Video Info Banner Component
interface VideoInfoBannerProps {
  analytics: VideoAnalytics;
}

export const VideoInfoBanner: React.FC<VideoInfoBannerProps> = ({
  analytics,
}) => (
<div className="flex-center">
  <div className="relative group bg-white rounded-xl p-6 shadow-lg border border-slate-200/60 transition-all duration-300 hover:shadow-xl hover:border-slate-300">
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
        Video Information
      </h2>
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
          analytics.status === "completed"
            ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
            : analytics.status === "processing"
            ? "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
            : "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20"
        }`}
      >
        {analytics.status}
      </span>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Video Name
        </label>
        <p className="text-sm text-slate-900 font-medium break-words">
          {analytics.video_name}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Confidence Score
          </label>
          <span className="text-2xl font-bold text-emerald-600 tabular-nums">
            {analytics.confidence_score}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-700"
            style={{ width: `${analytics.confidence_score}%` }}
          />
        </div>
      </div>
    </div>
  </div>
</div>
);

// Navigation Tabs Component
interface NavigationTabsProps {
  activeView: "charts" | "summary" | "raw";
  onViewChange: (view: "charts" | "summary" | "raw") => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeView,
  onViewChange,
}) => {
  const tabs = [
    { id: "charts", label: "Analytics Charts", shortLabel: "Charts" },
    { id: "summary", label: "Analysis Summary", shortLabel: "Summary" },
    { id: "raw", label: "Raw Analytics Data", shortLabel: "Raw Data" },
  ] as const;

  return (
    <div className="px-3 sm:px-6 mt-4 sm:mt-6">
      <div className="flex space-x-0.5 sm:space-x-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6 overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === tab.id
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Chart Preparation Status Component
interface ChartPreparationStatusProps {
  isVisible: boolean;
  chartCount: number;
  onPrepareCharts: () => void;
  isLoading: boolean;
}

export const ChartPreparationStatus: React.FC<ChartPreparationStatusProps> = ({
  isVisible,
  chartCount,
  onPrepareCharts,
  isLoading,
}) => {
  if (!isVisible) return null;

  return (
    <div className="mx-3 sm:mx-6 mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <svg
            className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 flex-shrink-0"
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
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-amber-800">
              Charts Ready for PDF Export
            </p>
            <p className="text-xs text-amber-700">
              {chartCount} chart{chartCount !== 1 ? "s" : ""} detected on this
              page
            </p>
          </div>
        </div>

        <button
          onClick={onPrepareCharts}
          disabled={isLoading}
          className="px-3 sm:px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          {isLoading ? "Preparing..." : "Prepare for PDF"}
        </button>
      </div>
    </div>
  );
};

// Metrics Grid Component
interface MetricsGridProps {
  metrics: { [key: string]: any };
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const metricEntries = Object.entries(metrics || {});

  if (metricEntries.length === 0) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center text-gray-500">
          <svg
            className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-4 text-gray-300"
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
          <p className="text-sm sm:text-base">No metrics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {metricEntries.map(([key, value], index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-2 sm:w-3 h-2 sm:h-3 bg-teal-500 rounded-full"></div>
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide truncate">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-teal-600 break-words">
                  {value?.toString() || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Summary Content Component
interface SummaryContentProps {
  summary: string;
}

export const SummaryContent: React.FC<SummaryContentProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="p-3 sm:p-6">
        <div className="text-center text-gray-500">
          <svg
            className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm sm:text-base">No summary available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Analysis Summary
        </h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};

// Raw Data Display Component
interface RawDataDisplayProps {
  analytics: VideoAnalytics;
}

export const RawDataDisplay: React.FC<RawDataDisplayProps> = ({
  analytics,
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set()
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      key: "basic_info",
      title: "Basic Information",
      data: {
        id: analytics.id,
        uuid: analytics.uuid,
        status: analytics.status,
        confidence_score: analytics.confidence_score,
        created_at: analytics.created_at,
        updated_at: analytics.updated_at,
      },
    },
    {
      key: "parsed_metrics",
      title: "Parsed Metrics",
      data: analytics.parsed_metrics,
    },
    {
      key: "generated_charts",
      title: "Generated Charts",
      data: analytics.generated_charts,
    },
    {
      key: "generated_summary",
      title: "Generated Summary",
      data: analytics.generated_summary,
    },
    {
      key: "video_metadata",
      title: "Video Metadata",
      data: analytics.video_metadata,
    },
    { key: "full_data", title: "Complete Analytics Object", data: analytics },
  ];

  return (
    <div className="p-3 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        {sections.map((section) => (
          <div
            key={section.key}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1 mr-2">
                {section.title}
              </h3>
              <svg
                className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-500 transition-transform flex-shrink-0 ${
                  expandedSections.has(section.key) ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedSections.has(section.key) && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200">
                <pre className="bg-gray-50 rounded-md p-3 sm:p-4 text-xs sm:text-sm overflow-auto max-h-64 sm:max-h-96 text-gray-800 break-all whitespace-pre-wrap">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Export Status Banner Component
interface ExportStatusBannerProps {
  isVisible: boolean;
  message: string;
  type: "info" | "success" | "warning" | "error";
  onDismiss: () => void;
}

export const ExportStatusBanner: React.FC<ExportStatusBannerProps> = ({
  isVisible,
  message,
  type,
  onDismiss,
}) => {
  if (!isVisible) return null;

  const bgColor = {
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200",
  }[type];

  const textColor = {
    info: "text-blue-800",
    success: "text-green-800",
    warning: "text-amber-800",
    error: "text-red-800",
  }[type];

  const iconColor = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-red-500",
  }[type];

  return (
    <div
      className={`mx-3 sm:mx-6 mb-4 sm:mb-6 ${bgColor} border rounded-lg p-3 sm:p-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <svg
            className={`w-4 sm:w-5 h-4 sm:h-5 ${iconColor} flex-shrink-0`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className={`text-xs sm:text-sm ${textColor} break-words`}>
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className={`${iconColor} hover:opacity-70 transition-opacity ml-2 flex-shrink-0`}
        >
          <svg
            className="w-4 h-4"
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
        </button>
      </div>
    </div>
  );
};

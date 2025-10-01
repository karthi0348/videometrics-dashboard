import React, { useState, useEffect } from "react";

// Icon components as inline SVG
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

interface GeneratedSummary {
  format: string;
  content: string;
  sections: string[];
  word_count: number;
  generated_at: string;
  summary_type: string;
  character_count: number;
  metrics_highlighted: string[];
}

interface SummaryViewProps {
  summary?: GeneratedSummary;
  insights?: any;
  analyticsId?: string | null;
  apiService?: any;
  mockMode?: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  summary: propSummary,
  insights: propInsights,
  analyticsId,
  apiService,
  mockMode = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<GeneratedSummary | null>(
    propSummary || null
  );
  const [insights, setInsights] = useState<any>(propInsights || null);
  const [error, setError] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!propSummary && analyticsId && !mockMode) {
      loadSummary();
    }
    if (propInsights) {
      setInsights(propInsights);
    }
  }, [analyticsId, propSummary, propInsights, mockMode]);

  const loadSummary = async () => {
    if (!analyticsId || !apiService) {
      setError("Analytics ID or API service not available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Fetching summary for analytics ID:", analyticsId);
      const response = await apiService.getAnalyticsSummary(analyticsId);

      let data;
      if (typeof response === "string") {
        try {
          data = JSON.parse(response);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", response);
          throw new Error("Invalid JSON response from server");
        }
      } else if (typeof response === "object" && response !== null) {
        data = response;
      } else {
        throw new Error("Unexpected response format");
      }

      setSummary(data);
    } catch (err) {
      let errorMessage = "Failed to load summary data";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Error loading summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const formatContent = (content: string) => {
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith("**") && paragraph.includes("**\n")) {
        const [header, ...rest] = paragraph.split("\n");
        const headerText = header.replace(/\*\*/g, "");
        const content = rest.join("\n");
        const isExpanded = expandedSections.has(index);

        return (
          <div key={index} className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection(index)}
              className="w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-200 flex items-center justify-between text-left group"
            >
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                {headerText}
              </h4>
              <ChevronDownIcon 
                className={`w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-all duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isExpanded && (
              <div className="px-6 py-4 bg-white border-t border-gray-50">
                <div className="text-gray-700 leading-relaxed">
                  {formatParagraphContent(content)}
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={index} className="mb-6 text-gray-700 leading-relaxed bg-white rounded-lg p-4 shadow-sm border border-gray-50">
          {formatParagraphContent(paragraph)}
        </div>
      );
    });
  };

  const formatParagraphContent = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, index) => {
      if (line.trim().match(/^\d+\./)) {
        const parts = line.split("**");
        return (
          <div key={index} className="mb-3 ml-4 flex items-start">
            <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
              {line.match(/^\d+/)?.[0]}
            </div>
            <div className="flex-1">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <strong key={partIndex} className="font-semibold text-gray-900">
                    {part}
                  </strong>
                ) : (
                  <span key={partIndex}>{part.replace(/^\d+\.\s*/, '')}</span>
                )
              )}
            </div>
          </div>
        );
      } else if (line.trim().startsWith("*   ")) {
        return (
          <div key={index} className="mb-2 ml-6 flex items-start">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
            <span className="flex-1">{line.replace("*   ", "")}</span>
          </div>
        );
      } else {
        const parts = line.split("**");
        return (
          <div key={index} className={line.trim() ? "mb-2" : "mb-1"}>
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="font-semibold text-gray-900 bg-yellow-50 px-1 py-0.5 rounded">
                  {part}
                </strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      }
    });
  };

  const handleRefresh = () => {
    if (!propSummary) {
      loadSummary();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analysis</h3>
              <p className="text-gray-600">Generating your summary...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <XMarkIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900">
                    Unable to Load Summary
                  </h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 border-b border-yellow-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900">
                    No Summary Available
                  </h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    No summary data is available for this analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 via-blue-700 to-purple-600 px-6 sm:px-8 py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                    <div className="w-8 h-8 mr-3" />
                    Analysis Summary
                  </h1>
               
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    {summary.summary_type}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    {summary.word_count.toLocaleString()} words
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {new Date(summary.generated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Highlighted Metrics */}
            {summary.metrics_highlighted && summary.metrics_highlighted.length > 0 && (
              <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Key Metrics Highlighted
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.metrics_highlighted.map((metric, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 border border-blue-200 hover:from-blue-200 hover:to-teal-200 transition-all duration-200"
                    >
                      {metric
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
{/* Insights Section */}
{insights && (
  <div className="mb-6">
    <div className="bg-white rounded-md border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Analytics Insights
        </h2>
        <p className="text-sm text-gray-500">Key performance indicators</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((insight: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded border border-gray-200 p-3"
            >
              <h3 className="text-sm font-semibold text-gray-700">
                {insight.title || "Untitled"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {insight.description || "No description"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Confidence: {insight.confidence ?? "-"} | Severity:{" "}
                {insight.severity ?? "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}



        {/* Summary Content */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 sm:px-8 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Detailed Analysis
              </h2>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                {formatContent(summary.content)}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sections */}
        {summary.sections && summary.sections.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 sm:px-8 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Sections
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {summary.sections.map((section, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-center hover:from-blue-100 hover:to-teal-100 hover:text-blue-800 transition-all duration-200 cursor-pointer"
                    >
                      {section
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryView;
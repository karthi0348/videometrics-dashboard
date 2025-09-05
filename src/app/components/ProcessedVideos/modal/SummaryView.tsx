import React, { useState, useEffect } from 'react';

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

// Define the API service interface
interface ApiService {
  getSummary: (analyticsId: string) => Promise<GeneratedSummary | string>;
  [key: string]: unknown; // Allow for additional methods
}

interface SummaryViewProps {
  summary?: GeneratedSummary;
  analyticsId?: string | null;
  apiService?: ApiService;
  mockMode?: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({ 
  summary: propSummary, 
  analyticsId, 
  apiService, 
  mockMode = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<GeneratedSummary | null>(propSummary || null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If we don't have a summary prop but have analyticsId, fetch it
    if (!propSummary && analyticsId && !mockMode) {
      loadSummary();
    }
  }, [analyticsId, propSummary, mockMode]);

  const loadSummary = async () => {
    if (!analyticsId || !apiService) {
      setError("Analytics ID or API service not available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Fetching summary for analytics ID:", analyticsId);
      
      const response = await apiService.getSummary(analyticsId);
      
      let data: GeneratedSummary;
      if (typeof response === "string") {
        try {
          data = JSON.parse(response) as GeneratedSummary;
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

  const formatContent = (content: string) => {
    // Split content by double newlines to create paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers (text that starts with **)
      if (paragraph.startsWith('**') && paragraph.includes('**\n')) {
        const [header, ...rest] = paragraph.split('\n');
        const headerText = header.replace(/\*\*/g, '');
        const content = rest.join('\n');
        
        return (
          <div key={index} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {headerText}
            </h4>
            <div className="text-gray-700 leading-relaxed">
              {formatParagraphContent(content)}
            </div>
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-4 text-gray-700 leading-relaxed">
          {formatParagraphContent(paragraph)}
        </div>
      );
    });
  };

  const formatParagraphContent = (content: string) => {
    // Handle bold text and bullet points
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      if (line.trim().match(/^\d+\./)) {
        // Numbered list item
        const parts = line.split('**');
        return (
          <div key={index} className="mb-2 ml-4">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="font-semibold text-gray-900">{part}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      } else if (line.trim().startsWith('*   ')) {
        // Bullet point
        return (
          <div key={index} className="mb-2 ml-6 flex">
            <span className="text-gray-400 mr-2">•</span>
            <span>{line.replace('*   ', '')}</span>
          </div>
        );
      } else {
        // Regular text with potential bold formatting
        const parts = line.split('**');
        return (
          <div key={index} className={line.trim() ? "mb-2" : "mb-1"}>
            {parts.map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="font-semibold text-gray-900">{part}</strong>
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
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
              <h3 className="text-red-800 font-medium">Error Loading Summary</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
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

  if (!summary) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-yellow-400 mt-0.5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-yellow-800 font-medium">No Summary Available</h3>
              <p className="text-yellow-700 text-sm mt-1">
                No summary data is available for this analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Analysis Summary</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Type: {summary.summary_type}</span>
            <span>Words: {summary.word_count}</span>
            <span>Generated: {new Date(summary.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Highlighted Metrics */}
        {summary.metrics_highlighted && summary.metrics_highlighted.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Key Metrics Highlighted</h4>
            <div className="flex flex-wrap gap-2">
              {summary.metrics_highlighted.map((metric, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="prose prose-gray max-w-none">
          {formatContent(summary.content)}
        </div>
      </div>

      {/* Summary Sections Navigation */}
      {summary.sections && summary.sections.length > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Report Sections</h4>
          <div className="flex flex-wrap gap-2">
            {summary.sections.map((section, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryView;
import React from 'react';

interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}

interface VisualEditorProps {
  summaryConfig: SummaryConfig;
  onConfigChange: (config: SummaryConfig) => void;
}

const VisualEditor: React.FC<VisualEditorProps> = ({ summaryConfig, onConfigChange }) => {
  const summaryTypes = [
    { value: "executive", label: "Executive", description: "High-level overview for decision makers" },
    { value: "detailed", label: "Detailed", description: "Comprehensive analysis with in-depth insights" },
    { value: "technical", label: "Technical", description: "Technical details and implementation insights" },
    { value: "custom", label: "Custom", description: "User-defined summary structure" }
  ];

  const availableSections = [
    { value: "overview", label: "Overview", description: "General summary and context" },
    { value: "key_metrics", label: "Key Metrics", description: "Primary performance indicators" },
    { value: "recommendations", label: "Recommendations", description: "Actionable insights and suggestions" },
    { value: "trends", label: "Trends", description: "Historical patterns and changes" },
    { value: "peak_analysis", label: "Peak Analysis", description: "Analysis of peak performance periods" },
    { value: "anomalies", label: "Anomalies", description: "Unusual patterns or outliers" }
  ];

  const formatOptions = [
    { value: "markdown", label: "Markdown", description: "Structured markdown format" },
    { value: "html", label: "HTML", description: "Rich HTML with styling" },
    { value: "json", label: "JSON", description: "Structured JSON data" },
    { value: "plain", label: "Plain Text", description: "Simple text format" }
  ];

  const handleSectionToggle = (sectionValue: string) => {
    const newSections = summaryConfig.sections.includes(sectionValue)
      ? summaryConfig.sections.filter(s => s !== sectionValue)
      : [...summaryConfig.sections, sectionValue];

    onConfigChange({
      ...summaryConfig,
      sections: newSections
    });
  };

  return (
    <div className="bg-white">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Summary Type */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <label className="block text-sm md:text-base font-semibold text-gray-900">
              Summary Type
            </label>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            Choose the type of summary that best fits your analysis needs
          </p>
          
          {/* Mobile: Single column, Desktop: Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {summaryTypes.map((type) => (
              <label
                key={type.value}
                className={`group flex items-start gap-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  summaryConfig.summary_type === type.value
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="summary_type"
                  value={type.value}
                  checked={summaryConfig.summary_type === type.value}
                  onChange={(e) =>
                    onConfigChange({
                      ...summaryConfig,
                      summary_type: e.target.value
                    })
                  }
                  className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">{type.label}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <label className="block text-sm md:text-base font-semibold text-gray-900">
              Sections to Include
            </label>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            Select the sections you want to include in your summary
          </p>
          
          {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {availableSections.map((section) => (
              <label
                key={section.value}
                className={`group flex items-start gap-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  summaryConfig.sections.includes(section.value)
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={summaryConfig.sections.includes(section.value)}
                  onChange={() => handleSectionToggle(section.value)}
                  className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">{section.label}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">{section.description}</div>
                </div>
              </label>
            ))}
          </div>
          
          {/* Selected sections indicator */}
          {summaryConfig.sections.length > 0 && (
            <div className="mt-3 md:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{summaryConfig.sections.length} sections selected</span>
              </div>
            </div>
          )}
        </div>

        {/* Metrics to Highlight */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <label className="block text-sm md:text-base font-semibold text-gray-900">
              Metrics to Highlight
            </label>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
            Specify which metrics should be prominently featured in the summary
          </p>
          
          <div className="relative">
            <textarea
              value={summaryConfig.metrics_to_highlight.join(', ')}
              onChange={(e) => {
                const metrics = e.target.value
                  .split(',')
                  .map(m => m.trim())
                  .filter(m => m.length > 0);
                onConfigChange({
                  ...summaryConfig,
                  metrics_to_highlight: metrics
                });
              }}
              className="w-full px-4 py-3 md:py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none text-sm md:text-base"
              style={{ minHeight: '80px' }}
              placeholder="total_customers, average_wait_time, satisfaction_score, conversion_rate"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {summaryConfig.metrics_to_highlight.length} metrics
            </div>
          </div>
          
          <div className="text-xs md:text-sm text-gray-500 mt-2 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Separate multiple metrics with commas. These will be emphasized in the summary output.</span>
          </div>
        </div>

        {/* Format */}
        <div>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <label className="block text-sm md:text-base font-semibold text-gray-900">
              Output Format
            </label>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            Choose how you want the summary to be formatted and presented
          </p>
          
          {/* Mobile: Single column, Desktop: Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {formatOptions.map((format) => (
              <label
                key={format.value}
                className={`group flex items-start gap-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  summaryConfig.format === format.value
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={summaryConfig.format === format.value}
                  onChange={(e) =>
                    onConfigChange({
                      ...summaryConfig,
                      format: e.target.value
                    })
                  }
                  className="mt-0.5 w-4 h-4 text-orange-600 border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base flex items-center gap-2">
                    {format.label}
                    {format.value === 'markdown' && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Recommended</span>
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 leading-relaxed">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        

        {/* <div className="border-t border-gray-200 pt-6 md:pt-8">
          <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Configuration Summary</h4>
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{summaryConfig.summary_type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Format:</span>
                <span className="ml-2 text-gray-900 uppercase">{summaryConfig.format}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sections:</span>
                <span className="ml-2 text-gray-900">{summaryConfig.sections.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Metrics:</span>
                <span className="ml-2 text-gray-900">{summaryConfig.metrics_to_highlight.length}</span>
              </div>
            </div>
      
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default VisualEditor;
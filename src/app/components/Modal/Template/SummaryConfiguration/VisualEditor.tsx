import React from 'react';
import { SummaryConfig } from '../../../../types/summary';
import { SUMMARY_TYPES, AVAILABLE_SECTIONS, FORMAT_OPTIONS } from '../../../../constants/summary';
import { updateMetricsFromString } from '../../../../utils/summary';

interface VisualEditorProps {
  summaryConfig: SummaryConfig;
  onConfigChange: (config: SummaryConfig) => void;
}

const VisualEditor: React.FC<VisualEditorProps> = ({ summaryConfig, onConfigChange }) => {
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Summary Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Summary Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUMMARY_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  summaryConfig.summary_type === type.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
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
                  className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sections
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_SECTIONS.map((section) => (
              <label
                key={section.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  summaryConfig.sections.includes(section.value)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={summaryConfig.sections.includes(section.value)}
                  onChange={() => handleSectionToggle(section.value)}
                  className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{section.label}</div>
                  <div className="text-sm text-gray-600">{section.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Metrics to Highlight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metrics to Highlight
          </label>
          <textarea
            value={summaryConfig.metrics_to_highlight.join(', ')}
            onChange={(e) => {
              const newConfig = updateMetricsFromString(summaryConfig, e.target.value);
              onConfigChange(newConfig);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-20 resize-none"
            placeholder="total_customers, average_wait_time, satisfaction_score"
          />
          <div className="text-sm text-gray-500 mt-1">
            Comma-separated list of metrics to highlight in the summary
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Output Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((format) => (
              <label
                key={format.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  summaryConfig.format === format.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400'
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
                  className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-sm text-gray-600">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Include Recommendations */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="include_recommendations"
            checked={summaryConfig.include_recommendations}
            onChange={(e) =>
              onConfigChange({
                ...summaryConfig,
                include_recommendations: e.target.checked
              })
            }
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
          />
          <label
            htmlFor="include_recommendations"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Include AI-generated recommendations in summary
          </label>
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;
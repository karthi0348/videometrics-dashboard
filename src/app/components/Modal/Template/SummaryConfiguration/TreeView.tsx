import React from 'react';
import { isValidJson } from '../../../../utils/summary';

interface TreeViewProps {
  jsonContent: string;
}

const TreeView: React.FC<TreeViewProps> = ({ jsonContent }) => {
  const config = isValidJson(jsonContent) ? JSON.parse(jsonContent) : {};
  const characterCount = jsonContent.length;
  const propertyCount = Object.keys(config).length;

  return (
    <div className="space-y-6">
      {/* Tree View Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">Object Tree View</h4>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Data Structure</span>
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">object</span>
              <span className="text-sm text-gray-500">{propertyCount} properties</span>
            </div>
          </div>

          <div className="space-y-3 ml-4">
            {/* Summary Type */}
            {config.summary_type && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-green-600">summary_type</span>
                <span className="text-sm text-green-700 font-medium">"{config.summary_type}"</span>
              </div>
            )}

            {/* Sections Array */}
            {config.sections && (
              <>
                <div className="flex items-center gap-2">
                  <button className="w-4 h-4 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-orange-600">sections</span>
                  <span className="text-sm text-orange-700 font-medium">Array({config.sections.length})</span>
                </div>

                <div className="ml-8 space-y-2">
                  {config.sections.map((section: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </span>
                      <span className="text-sm font-mono text-green-600">[{index}]</span>
                      <span className="text-sm text-green-700 font-medium">"{section}"</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Metrics to Highlight Array */}
            {config.metrics_to_highlight && (
              <>
                <div className="flex items-center gap-2">
                  <button className="w-4 h-4 flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-orange-600">metrics_to_highlight</span>
                  <span className="text-sm text-orange-700 font-medium">Array({config.metrics_to_highlight.length})</span>
                </div>

                <div className="ml-8 space-y-2">
                  {config.metrics_to_highlight.map((metric: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-4 h-4 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </span>
                      <span className="text-sm font-mono text-green-600">[{index}]</span>
                      <span className="text-sm text-green-700 font-medium">"{metric}"</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Format */}
            {config.format && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-green-600">format</span>
                <span className="text-sm text-green-700 font-medium">"{config.format}"</span>
              </div>
            )}

            {/* Include Recommendations */}
            {config.include_recommendations !== undefined && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-blue-600">include_recommendations</span>
                <span className="text-sm text-blue-700 font-medium">{String(config.include_recommendations)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Data Type: <strong>Object</strong></span>
            <span className="text-gray-600">Size: <strong>{propertyCount} properties</strong></span>
          </div>
          <div className="text-gray-600">
            <strong>{characterCount} characters</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeView;
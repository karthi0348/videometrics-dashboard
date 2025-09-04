import React, { useState } from 'react';

interface TreeViewProps {
  jsonContent: string;
  onCopy: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onReset: () => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  jsonContent,
  onCopy,
  onDownload,
  onUpload,
  onReset
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['sections', 'metrics_to_highlight']));

  const isValidJson = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const config = isValidJson() ? JSON.parse(jsonContent) : {};
  const characterCount = jsonContent.length;
  const propertyCount = Object.keys(config).length;

  const getValueDisplay = (value: any, type: string) => {
    switch (type) {
      case 'string':
        return `"${value}"`;
      case 'boolean':
        return String(value);
      case 'number':
        return String(value);
      case 'array':
        return `Array(${value.length})`;
      case 'object':
        return `Object(${Object.keys(value).length})`;
      default:
        return String(value);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'text-green-600 bg-green-500';
      case 'boolean':
        return 'text-blue-600 bg-blue-500';
      case 'number':
        return 'text-purple-600 bg-purple-500';
      case 'array':
        return 'text-orange-600 bg-orange-500';
      case 'object':
        return 'text-gray-600 bg-gray-500';
      default:
        return 'text-gray-600 bg-gray-500';
    }
  };

  const getValueType = (value: any): string => {
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Action Buttons */}
      <div className="p-4 md:p-6">
        {/* Mobile: Stack buttons vertically in 2 columns */}
        <div className="grid grid-cols-2 gap-2 md:hidden mb-4">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Upload JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Upload
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            title="Reset Configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        {/* Desktop: Horizontal button layout */}
        <div className="hidden md:flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Copy JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy JSON
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Download JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Upload JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Upload
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
            title="Reset Configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h4 className="text-lg md:text-xl font-semibold text-gray-900">Object Tree View</h4>
        </div>

        {/* Tree Structure */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-6 mb-4 md:mb-6">
          {/* Root Object Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4 mb-4 md:mb-6 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-sm md:text-base font-medium text-gray-700">Data Structure</span>
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">object</span>
              <span className="text-xs md:text-sm text-gray-500">{propertyCount} properties</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isValidJson() ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs md:text-sm text-gray-600">
                {isValidJson() ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </div>
          </div>

          {/* Tree Items */}
          <div className="space-y-2 md:space-y-3 pl-2 md:pl-4">
            {Object.entries(config).map(([key, value]) => {
              const valueType = getValueType(value);
              const isArray = Array.isArray(value);
              const isExpandable = isArray && value.length > 0;
              const isExpanded = expandedSections.has(key);
              const colorClasses = getTypeColor(valueType);

              return (
                <div key={key} className="space-y-2">
                  {/* Property Row */}
                  <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    {/* Expand/Collapse Button */}
                    {isExpandable ? (
                      <button
                        onClick={() => toggleSection(key)}
                        className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                      >
                        <svg 
                          className={`w-3 h-3 md:w-4 md:h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="w-4 h-4 md:w-5 md:h-5"></div>
                    )}

                    {/* Type Indicator */}
                    <span className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 ${colorClasses.split(' ')[1]} rounded-full`}></div>
                    </span>

                    {/* Property Name and Value */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className={`text-sm md:text-base font-mono font-medium ${colorClasses.split(' ')[0]} truncate`}>
                        {key}
                      </span>
                      <span className={`text-sm md:text-base ${colorClasses.split(' ')[0]} font-medium break-all sm:break-normal`}>
                        {getValueDisplay(value, valueType)}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full shrink-0">
                      {valueType}
                    </span>
                  </div>

                  {/* Expanded Array Items */}
                  {isExpandable && isExpanded && (
                    <div className="ml-4 md:ml-8 space-y-1 md:space-y-2 pb-2">
                      {value.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                          </span>
                          <span className="text-xs md:text-sm font-mono text-green-600 font-medium">
                            [{index}]
                          </span>
                          <span className="text-xs md:text-sm text-green-700 font-medium break-all flex-1 min-w-0">
                            "{item}"
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full shrink-0">
                            string
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4">
          {/* Mobile: Stack stats vertically */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Data Type:</span>
                <span className="font-semibold text-gray-900">Object</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Properties:</span>
                <span className="font-semibold text-gray-900">{propertyCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Size:</span>
              <span className="font-semibold text-gray-900">{characterCount} chars</span>
            </div>
          </div>
        </div>

        {/* Invalid JSON Warning */}
        {!isValidJson() && (
          <div className="mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="text-sm md:text-base font-medium text-red-800 mb-1">Invalid JSON Format</h5>
                <p className="text-xs md:text-sm text-red-700">
                  The current JSON content contains syntax errors. Please fix the JSON format to view the tree structure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeView;
import React from 'react';

interface SummaryConfig {
  summary_type?: string;
  sections?: string[];
  metrics_to_highlight?: string[];
  format?: string;
  include_recommendations?: boolean;
}

interface FormEditorProps {
  config: any;
  onConfigChange: (jsonString: string) => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ config, onConfigChange }) => {
  const handleFieldChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value };
    onConfigChange(JSON.stringify(newConfig, null, 2));
  };

  const handleArrayItemChange = (field: string, index: number, value: string) => {
    const currentArray = config[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    handleFieldChange(field, newArray);
  };

  const handleArrayItemDelete = (field: string, index: number) => {
    const currentArray = config[field] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleFieldChange(field, newArray);
  };

  const handleArrayItemAdd = (field: string) => {
    const currentArray = config[field] || [];
    const newArray = [...currentArray, ''];
    handleFieldChange(field, newArray);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header Section */}
      <div className="border-b border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate">Interactive Form Editor</span>
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Edit your data using form fields with automatic type detection and validation.
        </p>
      </div>

      <div className="p-3 sm:p-4">
        {/* Object Type Indicator */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-gray-600">{ }</span>
            <span className="text-sm sm:text-base font-medium">Object</span>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Summary Type Field */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <label className="text-sm text-green-600 font-mono break-all">summary_type</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded whitespace-nowrap">String</span>
                <button 
                  onClick={() => handleFieldChange('summary_type', undefined)}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  title="Delete field"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.summary_type || ''}
              onChange={(e) => handleFieldChange('summary_type', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="executive"
            />
          </div>

          {/* Sections Array Field */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button className="text-gray-400 flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-sm text-orange-600 font-mono break-all">sections</span>
                <span className="text-xs sm:text-sm text-gray-500">array</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded whitespace-nowrap">Array</span>
                <button 
                  onClick={() => handleFieldChange('sections', undefined)}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  title="Delete field"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ml-2 sm:ml-6 space-y-2 sm:space-y-3">
              {(config.sections || []).map((section: string, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 sm:min-w-0">
                    <span className="text-xs sm:text-sm text-green-600 font-mono whitespace-nowrap">Item {index}</span>
                    <span className="text-xs sm:text-sm text-gray-500">string</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => handleArrayItemChange('sections', index, e.target.value)}
                      className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-0"
                      placeholder={`Section ${index + 1}`}
                    />
                    <button
                      onClick={() => handleArrayItemDelete('sections', index)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      title="Delete item"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleArrayItemAdd('sections')}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 p-1"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {/* Metrics to Highlight Array Field */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button className="text-gray-400 flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-sm text-orange-600 font-mono break-all">metrics_to_highlight</span>
                <span className="text-xs sm:text-sm text-gray-500">array</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded whitespace-nowrap">Array</span>
                <button 
                  onClick={() => handleFieldChange('metrics_to_highlight', undefined)}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  title="Delete field"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ml-2 sm:ml-6 space-y-2 sm:space-y-3">
              {(config.metrics_to_highlight || []).map((metric: string, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 sm:min-w-0">
                    <span className="text-xs sm:text-sm text-green-600 font-mono whitespace-nowrap">Item {index}</span>
                    <span className="text-xs sm:text-sm text-gray-500">string</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={metric}
                      onChange={(e) => handleArrayItemChange('metrics_to_highlight', index, e.target.value)}
                      className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-0"
                      placeholder={`Metric ${index + 1}`}
                    />
                    <button
                      onClick={() => handleArrayItemDelete('metrics_to_highlight', index)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                      title="Delete item"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleArrayItemAdd('metrics_to_highlight')}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 p-1"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {/* Format Field */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <label className="text-sm text-green-600 font-mono break-all">format</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded whitespace-nowrap">String</span>
                <button 
                  onClick={() => handleFieldChange('format', undefined)}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  title="Delete field"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.format || ''}
              onChange={(e) => handleFieldChange('format', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="markdown"
            />
          </div>

          {/* Include Recommendations Field */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <label className="text-sm text-green-600 font-mono break-all">include_recommendations</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded whitespace-nowrap">Boolean</span>
                <button 
                  onClick={() => handleFieldChange('include_recommendations', undefined)}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  title="Delete field"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="include_recommendations"
                  checked={config.include_recommendations === true}
                  onChange={() => handleFieldChange('include_recommendations', true)}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-xs sm:text-sm">true</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="include_recommendations"
                  checked={config.include_recommendations === false}
                  onChange={() => handleFieldChange('include_recommendations', false)}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="text-xs sm:text-sm">false</span>
              </label>
            </div>
          </div>
        </div>

        {/* Add Property Section */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <button 
            onClick={() => {
              const newField = prompt('Enter property name:');
              if (newField) {
                handleFieldChange(newField, '');
              }
            }}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 p-1"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
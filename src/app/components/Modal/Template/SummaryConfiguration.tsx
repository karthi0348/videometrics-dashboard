import React, { useState } from 'react';

interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}

interface SummaryConfigurationProps {
  isExpanded: boolean;
  onToggle: () => void;
  onConfigChange: (config: SummaryConfig | null) => void;
}

const SummaryConfiguration: React.FC<SummaryConfigurationProps> = ({
  isExpanded,
  onToggle,
  onConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'form' | 'tree'>('visual');
  const [showPreview, setShowPreview] = useState(false);
  
  const [summaryConfig, setSummaryConfig] = useState<SummaryConfig>({
    summary_type: "executive",
    sections: ["overview", "key_metrics"],
    metrics_to_highlight: ["total_customers", "average_wait_time"],
    format: "markdown",
    include_recommendations: true
  });

  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(summaryConfig, null, 2)
  );

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

  // Sync visual editor changes to JSON
  const updateJsonFromVisual = (newConfig: SummaryConfig) => {
    setSummaryConfig(newConfig);
    setJsonContent(JSON.stringify(newConfig, null, 2));
    onConfigChange(newConfig);
  };

  // Sync JSON changes to visual editor
  const updateVisualFromJson = (jsonString: string) => {
    setJsonContent(jsonString);
    try {
      const parsed = JSON.parse(jsonString);
      setSummaryConfig(parsed);
      onConfigChange(parsed);
    } catch (error) {
      // Invalid JSON - don't update visual editor
      onConfigChange(null);
    }
  };

  const handleSectionToggle = (sectionValue: string) => {
    const newSections = summaryConfig.sections.includes(sectionValue)
      ? summaryConfig.sections.filter(s => s !== sectionValue)
      : [...summaryConfig.sections, sectionValue];
    
    updateJsonFromVisual({
      ...summaryConfig,
      sections: newSections
    });
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed));
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy JSON');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary-configuration.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content); // Validate JSON
            updateVisualFromJson(content);
          } catch (error) {
            console.error('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetConfig = () => {
    const defaultConfig: SummaryConfig = {
      summary_type: "executive",
      sections: ["overview", "key_metrics"],
      metrics_to_highlight: ["total_customers", "average_wait_time"],
      format: "markdown",
      include_recommendations: true
    };
    updateJsonFromVisual(defaultConfig);
  };

  const clearPreview = () => {
    setShowPreview(false);
  };

  const isValidJson = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const getJsonError = () => {
    try {
      JSON.parse(jsonContent);
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const renderFormEditor = () => {
    const config = isValidJson() ? JSON.parse(jsonContent) : {};
    
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Interactive Form Editor
            </h4>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                Reset
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Edit your data using form fields with automatic type detection and validation.</p>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{ }</span>
              <span className="text-sm font-medium">Object</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Summary Type Field */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-green-600 font-mono">summary_type</label>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">String</span>
                  <button className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={config.summary_type || ''}
                onChange={(e) => updateVisualFromJson(JSON.stringify({...config, summary_type: e.target.value}, null, 2))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="executive"
              />
            </div>

            {/* Sections Array Field */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button className="text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-orange-600 font-mono">sections</span>
                  <span className="text-sm text-gray-500">array</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Array</span>
                  <button className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="ml-6 space-y-3">
                {(config.sections || []).map((section: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-mono">Item {index}</span>
                    <span className="text-sm text-gray-500">string</span>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => {
                        const newSections = [...(config.sections || [])];
                        newSections[index] = e.target.value;
                        updateVisualFromJson(JSON.stringify({...config, sections: newSections}, null, 2));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={() => {
                        const newSections = (config.sections || []).filter((_: any, i: number) => i !== index);
                        updateVisualFromJson(JSON.stringify({...config, sections: newSections}, null, 2));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newSections = [...(config.sections || []), ''];
                    updateVisualFromJson(JSON.stringify({...config, sections: newSections}, null, 2));
                  }}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
            </div>

            {/* Other fields similar structure */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-green-600 font-mono">format</label>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">String</span>
                  <button className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={config.format || ''}
                onChange={(e) => updateVisualFromJson(JSON.stringify({...config, format: e.target.value}, null, 2))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="markdown"
              />
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-green-600 font-mono">include_recommendations</label>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">String</span>
                  <button className="text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={String(config.include_recommendations || '')}
                onChange={(e) => updateVisualFromJson(JSON.stringify({...config, include_recommendations: e.target.value}, null, 2))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="true"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTreeView = () => {
    const config = isValidJson() ? JSON.parse(jsonContent) : {};
    const characterCount = jsonContent.length;
    const propertyCount = Object.keys(config).length;
    
    return (
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium bg-white border-b-2 border-orange-500 text-orange-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            JSON Editor
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Form Editor
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Tree View
          </button>
        </div>

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
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-green-600">string</span>
                <span className="text-sm text-green-700 font-medium">"executive"</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-orange-600">array</span>
                <span className="text-sm text-orange-700 font-medium">Array(2)</span>
              </div>

              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-green-600">string</span>
                  <span className="text-sm text-green-700 font-medium">"overview"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-green-600">string</span>
                  <span className="text-sm text-green-700 font-medium">"key_metrics"</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-orange-600">array</span>
                <span className="text-sm text-orange-700 font-medium">Array(2)</span>
              </div>

              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-green-600">string</span>
                  <span className="text-sm text-green-700 font-medium">"total_customers"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </span>
                  <span className="text-sm font-mono text-green-600">string</span>
                  <span className="text-sm text-green-700 font-medium">"average_wait_time"</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-green-600">string</span>
                <span className="text-sm text-green-700 font-medium">"markdown"</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </span>
                <span className="text-sm font-mono text-green-600">string</span>
                <span className="text-sm text-green-700 font-medium">"true"</span>
              </div>
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

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-600"
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
          Summary Configuration
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            Optional
          </span>
        </h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
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

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">
              Configure how analysis summaries will be generated. Either chart configuration or summary 
              configuration is required.
            </p>

            {/* Conditional Action Buttons - Only show for JSON Editor */}
            {activeTab === 'json' && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  type="button"
                  onClick={copyJson}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Copy JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                <button
                  type="button"
                  onClick={downloadJson}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Download JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
                <button
                  type="button"
                  onClick={uploadJson}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Upload JSON"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Upload
                </button>
                <button
                  type="button"
                  onClick={resetConfig}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                  title="Reset Configuration"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'visual'
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'json'
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tree')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'tree'
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Tree View
              </button>
            </div>

            {/* Visual Editor Tab */}
            {activeTab === 'visual' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Summary Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Summary Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {summaryTypes.map((type) => (
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
                              updateJsonFromVisual({
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
                      {availableSections.map((section) => (
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
                        const metrics = e.target.value
                          .split(',')
                          .map(m => m.trim())
                          .filter(m => m.length > 0);
                        updateJsonFromVisual({
                          ...summaryConfig,
                          metrics_to_highlight: metrics
                        });
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
                      {formatOptions.map((format) => (
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
                              updateJsonFromVisual({
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
                        updateJsonFromVisual({
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
            )}

            {/* JSON Editor Tab */}
            {activeTab === 'json' && (
              <div>
                {/* JSON Editor Specific Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={formatJson}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Format
                  </button>
                  <button
                    type="button"
                    onClick={minifyJson}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Minify
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {showPreview ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.121 14.121L15.536 15.536M14.121 14.121L12.707 12.707M14.121 14.121l-1.414-1.414" />
                        </svg>
                        Hide
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </>
                    )}
                  </button>
                  {/* Clear button - only show when preview is active */}
                  {showPreview && (
                    <button
                      type="button"
                      onClick={clearPreview}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear
                    </button>
                  )}
                </div>

                {/* JSON Text Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">JSON Text Editor</h4>
                    <div className="text-sm text-gray-500">
                      {jsonContent.length} characters
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden rounded-l">
                      {jsonContent.split('\n').map((_, index) => (
                        <div key={index} className="px-2 leading-6 text-right min-h-[24px]">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    <textarea
                      value={jsonContent}
                      onChange={(e) => updateVisualFromJson(e.target.value)}
                      className={`w-full h-64 pl-14 pr-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white resize-none ${
                        isValidJson() 
                          ? 'border-gray-300 focus:border-orange-500' 
                          : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      }`}
                      placeholder="Enter summary configuration JSON..."
                      spellCheck={false}
                    />
                  </div>

                  {/* JSON Status */}
                  <div className="flex justify-between items-center mt-3 text-sm">
                    <div>
                      {!isValidJson() && (
                        <span className="text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getJsonError()}
                        </span>
                      )}
                      {isValidJson() && (
                        <span className="text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Valid JSON configuration
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      Data Type: <strong>Object</strong>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                {showPreview && (
                  <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      {isValidJson() ? (
                        <pre className="text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(JSON.parse(jsonContent), null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">Invalid JSON</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Editor Tab */}
            {activeTab === 'form' && renderFormEditor()}

            {/* Tree View Tab */}
            {activeTab === 'tree' && renderTreeView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryConfiguration;
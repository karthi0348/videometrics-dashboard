import React, { useState } from 'react';

interface MetricStructureEditorProps {
  jsonContent: string;
  setJsonContent: (content: string) => void;
  isExpanded: boolean;
}

const MetricStructureEditor: React.FC<MetricStructureEditorProps> = ({
  jsonContent,
  setJsonContent,
  isExpanded
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'form' | 'tree'>('json');
  const [showPreview, setShowPreview] = useState(false);

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
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy JSON');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metric-structure.json';
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
            setJsonContent(content);
          } catch (error) {
            console.error('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetJson = () => {
    setJsonContent('{}');
  };

  const getObjectProperties = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      return Object.keys(parsed).length;
    } catch {
      return 0;
    }
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

  if (!isExpanded) return null;

  return (
    <div className="border-t border-gray-200">
      <div className="p-6 bg-gray-50">
        <p className="text-sm text-gray-600 mb-4">
          Define the structure of metrics as a JSON object. Each key represents a metric name, 
          and each value represents the expected data type (integer, float, string, boolean, array, object).
        </p>

        {/* Common Action Buttons for all tabs */}
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
            onClick={resetJson}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
            title="Reset JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg">
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'json'
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
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
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Form Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tree'
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Tree View
          </button>
        </div>

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
                  onChange={(e) => setJsonContent(e.target.value)}
                  className={`w-full h-64 pl-14 pr-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white resize-none ${
                    isValidJson() 
                      ? 'border-gray-300 focus:border-teal-500' 
                      : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  }`}
                  placeholder="Enter JSON structure..."
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
                      Valid JSON structure
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  Data Type: <strong>Object</strong> | Size: <strong>{getObjectProperties()} properties</strong>
                </div>
              </div>
            </div>

            {/* Preview Section - Only show when showPreview is true */}
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
        {activeTab === 'form' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Interactive Form Editor
                </h4>
                <p className="text-xs text-gray-500 mt-1">Edit your data using form fields with automatic type detection and validation.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonContent);
                    setJsonContent(JSON.stringify(parsed, null, 2));
                  } catch (e) {
                    // Reset to default if invalid
                    setJsonContent(`{
  "total_customers": "integer",
  "average_wait_time": "float"
}`);
                  }
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>

            {isValidJson() ? (
              <div className="space-y-4">
                {Object.entries(JSON.parse(jsonContent)).map(([key, value], index) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(jsonContent);
                            const newParsed: any = {};
                            Object.keys(parsed).forEach((k, i) => {
                              if (i === index) {
                                newParsed[e.target.value] = parsed[k];
                              } else {
                                newParsed[k] = parsed[k];
                              }
                            });
                            setJsonContent(JSON.stringify(newParsed, null, 2));
                          } catch (e) {}
                        }}
                        className="font-mono text-sm bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonContent);
                            delete parsed[key];
                            setJsonContent(JSON.stringify(parsed, null, 2));
                          } catch (e) {}
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded">
                          {String(value).toLowerCase()}
                        </span>
                        <select
                          value={String(value)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(jsonContent);
                              parsed[key] = e.target.value;
                              setJsonContent(JSON.stringify(parsed, null, 2));
                            } catch (e) {}
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="string">String</option>
                          <option value="integer">Integer</option>
                          <option value="float">Float</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                        </select>
                      </div>
                      
                      <textarea
                        value={String(value)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(jsonContent);
                            parsed[key] = e.target.value;
                            setJsonContent(JSON.stringify(parsed, null, 2));
                          } catch (e) {}
                        }}
                        className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none"
                        rows={1}
                        placeholder="Value description or example"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonContent);
                      parsed[`new_property_${Object.keys(parsed).length + 1}`] = "string";
                      setJsonContent(JSON.stringify(parsed, null, 2));
                    } catch (e) {}
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Property
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Invalid JSON structure. Please fix the JSON in the JSON Editor tab.</p>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
              <span>Data Type: <strong>object</strong></span>
              <span>Size: <strong>{getObjectProperties()} properties</strong></span>
            </div>
          </div>
        )}

        {/* Tree View Tab */}
        {activeTab === 'tree' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Object Tree View
              </h4>
            </div>

            {isValidJson() ? (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Data Structure</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">object</span>
                    <span className="text-xs text-gray-500">{getObjectProperties()} properties</span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(JSON.parse(jsonContent)).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 py-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-sm font-mono text-gray-700 min-w-0 flex-shrink-0">{key}</span>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                          {String(value)}
                        </span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          "{String(value)}"
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Invalid JSON structure. Please fix the JSON in the JSON Editor tab.</p>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
              <span>Data Type: <strong>Object</strong></span>
              <span>Size: <strong>{getObjectProperties()} properties</strong></span>
              <span><strong>{jsonContent.length} characters</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricStructureEditor;
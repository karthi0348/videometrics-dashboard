import React, { useState, useEffect } from 'react';
import { Copy, Download, Upload, RotateCcw, Code, Edit3, TreePine, Eye, EyeOff, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

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
  const [copySuccess, setCopySuccess] = useState(false);

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
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
    setJsonContent(JSON.stringify({
      "total_customers": "integer",
      "average_wait_time": "float",
      "service_rating": "float",
      "is_active": "boolean"
    }, null, 2));
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

  const getJsonError = (): string | null => {
  try {
    JSON.parse(jsonContent);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error occurred while parsing JSON";
  }
};


  const addNewProperty = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      const newKey = `new_property_${Object.keys(parsed).length + 1}`;
      parsed[newKey] = "string";
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Failed to add property');
    }
  };

  const updateProperty = (oldKey: string, newKey: string, newValue: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      const newParsed: Record<string, unknown> = {};
      
      Object.keys(parsed).forEach(key => {
        if (key === oldKey) {
          newParsed[newKey] = newValue;
        } else {
          newParsed[key] = parsed[key];
        }
      });
      
      setJsonContent(JSON.stringify(newParsed, null, 2));
    } catch (e) {
      console.error('Failed to update property');
    }
  };

  const deleteProperty = (keyToDelete: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      delete parsed[keyToDelete];
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Failed to delete property');
    }
  };

  const getLineNumbers = () => {
    return jsonContent.split('\n').map((_, index) => index + 1);
  };

  if (!isExpanded) return null;

  return (
    <div className="border-t border-gray-200">
      <div className="p-3 sm:p-6 bg-gray-50">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Metric Structure Definition </h3>
                 <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isValidJson() 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isValidJson() ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {isValidJson() ? 'Valid' : 'Invalid'}
              </span>
              <span className="text-sm text-gray-500">
                Object({getObjectProperties()})
              </span>
            </div>
              
              <p className="text-sm text-gray-600 mt-1">
               Define the structure of metrics as a JSON object. Each key represents a metric name, and each value represents the data type (string, integer, float, boolean, array, object).
              </p>
            </div>
         
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyJson}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                copySuccess 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
              title="Copy JSON"
            >
              {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              type="button"
              onClick={downloadJson}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            
            <button
              type="button"
              onClick={uploadJson}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              title="Upload JSON"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            
            <button
              type="button"
              onClick={resetJson}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-all duration-200"
              title="Reset JSON"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">JSON Editor</span>
            <span className="sm:hidden">JSON</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'form'
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Form Editor</span>
            <span className="sm:hidden">Form</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tree'
                ? 'border-b-2 border-teal-500 text-teal-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span className="hidden sm:inline">Tree View</span>
            <span className="sm:hidden">Tree</span>
          </button>
        </div>

        {/* JSON Editor Tab */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            {/* JSON Editor Specific Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={formatJson}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={!isValidJson()}
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Format</span>
              </button>
              
              <button
                type="button"
                onClick={minifyJson}
                className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={!isValidJson()}
              >
                Minify
              </button>
              
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setJsonContent('{}')}
                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* JSON Text Editor */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">JSON Text Editor</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{jsonContent.length} characters</span>
                  <span className="hidden sm:inline">Lines: {jsonContent.split('\n').length}</span>
                </div>
              </div>
              
              <div className="relative">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden z-10">
                  {getLineNumbers().map((lineNum) => (
                    <div key={lineNum} className="px-1 sm:px-2 leading-6 text-right min-h-[24px] text-xs sm:text-sm">
                      {lineNum}
                    </div>
                  ))}
                </div>
                
                {/* Text Area */}
                <textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className={`w-full h-64 sm:h-80 pl-12 sm:pl-14 pr-4 py-3 font-mono text-xs sm:text-sm border-0 focus:ring-2 focus:ring-teal-500 outline-none bg-white resize-none ${
                    isValidJson() 
                      ? 'focus:ring-teal-500' 
                      : 'focus:ring-red-500'
                  }`}
                  placeholder="Enter JSON structure..."
                  spellCheck={false}
                />
              </div>

              {/* JSON Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex-1">
                  {!isValidJson() && (
                    <div className="flex items-start gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm break-all">{getJsonError()}</span>
                    </div>
                  )}
                  {isValidJson() && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Valid JSON structure</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <span>Type: <strong>Object</strong></span>
                  <span>Properties: <strong>{getObjectProperties()}</strong></span>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700">JSON Preview</h4>
                </div>
                <div className="p-4">
                  <div className="bg-gray-950 text-green-400 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto max-h-64 overflow-y-auto">
                    {isValidJson() ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(jsonContent), null, 2)}
                      </pre>
                    ) : (
                      <div className="text-red-400">Invalid JSON - Please fix syntax errors</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Editor Tab */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Edit3 className="w-4 h-4" />
                  Interactive Form Editor
                </h4>
                <p className="text-xs text-gray-500">Edit your data using form fields with automatic type detection and validation.</p>
              </div>
              <button
                type="button"
                onClick={resetJson}
                className="mt-2 sm:mt-0 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset to Default
              </button>
            </div>

            <div className="p-4">
              {isValidJson() ? (
                <div className="space-y-4">
                  {Object.entries(JSON.parse(jsonContent)).map(([key, value], index) => (
                    <div key={`${key}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Property Name Input */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Property Name</label>
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => updateProperty(key, e.target.value, String(value))}
                            className="w-full font-mono text-sm bg-gray-50 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="property_name"
                          />
                        </div>

                        {/* Data Type Selector */}
                        <div className="w-full sm:w-40">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Data Type</label>
                          <select
                            value={String(value)}
                            onChange={(e) => updateProperty(key, key, e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="string">String</option>
                            <option value="integer">Integer</option>
                            <option value="float">Float</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                          </select>
                        </div>

                        {/* Delete Button */}
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => deleteProperty(key)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          String(value) === 'string' ? 'bg-blue-100 text-blue-700' :
                          String(value) === 'integer' ? 'bg-purple-100 text-purple-700' :
                          String(value) === 'float' ? 'bg-indigo-100 text-indigo-700' :
                          String(value) === 'boolean' ? 'bg-green-100 text-green-700' :
                          String(value) === 'array' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {String(value)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Example: {
                            String(value) === 'string' ? '"sample text"' :
                            String(value) === 'integer' ? '42' :
                            String(value) === 'float' ? '3.14' :
                            String(value) === 'boolean' ? 'true' :
                            String(value) === 'array' ? '[1, 2, 3]' :
                            '{"key": "value"}'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Property Button */}
                  <button
                    type="button"
                    onClick={addNewProperty}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Property</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Invalid JSON Structure</p>
                  <p className="text-sm">Please fix the JSON syntax in the JSON Editor tab to use the form editor.</p>
                </div>
              )}
            </div>

            {/* Form Editor Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              <span>Data Type: <strong>Object</strong></span>
              <div className="flex gap-4">
                <span>Properties: <strong>{getObjectProperties()}</strong></span>
                <span>Characters: <strong>{jsonContent.length}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tree View Tab */}
        {activeTab === 'tree' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TreePine className="w-4 h-4" />
                Object Tree Visualization
              </h4>
              <p className="text-xs text-gray-500 mt-1">Hierarchical view of your JSON structure</p>
            </div>

            <div className="p-4">
              {isValidJson() ? (
                <div className="space-y-4">
                  {/* Root Object */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-teal-500 rounded"></div>
                        <span className="text-sm font-semibold text-gray-700">Root Object</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">object</span>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                          {getObjectProperties()} properties
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {jsonContent.length} chars
                        </span>
                      </div>
                    </div>
                    
                    {/* Properties */}
                    <div className="space-y-3 ml-4 sm:ml-6">
                      {Object.entries(JSON.parse(jsonContent)).map(([key, value], index) => (
                        <div key={`${key}-${index}`} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                            <span className="text-sm font-mono text-gray-700 break-all">{key}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              String(value) === 'string' ? 'bg-blue-100 text-blue-700' :
                              String(value) === 'integer' ? 'bg-purple-100 text-purple-700' :
                              String(value) === 'float' ? 'bg-indigo-100 text-indigo-700' :
                              String(value) === 'boolean' ? 'bg-green-100 text-green-700' :
                              String(value) === 'array' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {String(value)}
                            </span>
                            
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                              {
                                String(value) === 'string' ? '"text"' :
                                String(value) === 'integer' ? '123' :
                                String(value) === 'float' ? '3.14' :
                                String(value) === 'boolean' ? 'true' :
                                String(value) === 'array' ? '[]' :
                                '{}'
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Schema Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">Schema Summary</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {['string', 'integer', 'float', 'boolean', 'array', 'object'].map(type => {
                        const count = Object.values(JSON.parse(jsonContent)).filter(v => v === type).length;
                        return (
                          <div key={type} className="text-center">
                            <div className="font-semibold text-blue-700">{count}</div>
                            <div className="text-blue-600 capitalize">{type}{count !== 1 ? 's' : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TreePine className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Invalid JSON Structure</p>
                  <p className="text-sm">Please fix the JSON syntax in the JSON Editor tab to view the tree structure.</p>
                </div>
              )}
            </div>

            {/* Tree View Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              <span>Structure Type: <strong>Object</strong></span>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <span>Total Properties: <strong>{getObjectProperties()}</strong></span>
                <span>JSON Size: <strong>{jsonContent.length} characters</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricStructureEditor;
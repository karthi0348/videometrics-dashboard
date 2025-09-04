import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, Plus, RotateCcw, FileText, Code, Eye, AlertTriangle } from 'lucide-react';

const JSONEditor = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [jsonData, setJsonData] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [jsonString, setJsonString] = useState('{}');
  const [isValidJson, setIsValidJson] = useState(true);

  // Update JSON string when data changes
  const updateJsonString = useCallback((data) => {
    setJsonString(JSON.stringify(data, null, 2));
  }, []);

  // Add property to object at specified path
  const addProperty = useCallback((path = []) => {
    const newData = { ...jsonData };
    let current = newData;
    
    for (const key of path.slice(0, -1)) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    
    const newKey = `property${Object.keys(current).length + 1}`;
    current[newKey] = '';
    
    setJsonData(newData);
    updateJsonString(newData);
  }, [jsonData, updateJsonString]);

  // Remove property from object
  const removeProperty = useCallback((path) => {
    const newData = { ...jsonData };
    let current = newData;
    
    for (const key of path.slice(0, -1)) {
      current = current[key];
    }
    
    delete current[path[path.length - 1]];
    
    setJsonData(newData);
    updateJsonString(newData);
  }, [jsonData, updateJsonString]);

  // Update property value
  const updateProperty = useCallback((path, newValue, newKey = null) => {
    const newData = { ...jsonData };
    let current = newData;
    
    // Navigate to parent
    for (const key of path.slice(0, -1)) {
      current = current[key];
    }
    
    const oldKey = path[path.length - 1];
    
    if (newKey && newKey !== oldKey) {
      // Key changed - remove old and add new
      delete current[oldKey];
      current[newKey] = newValue;
    } else {
      // Just value changed
      current[oldKey] = newValue;
    }
    
    setJsonData(newData);
    updateJsonString(newData);
  }, [jsonData, updateJsonString]);

  // Reset to empty object
  const resetData = useCallback(() => {
    setJsonData({});
    setJsonString('{}');
    setExpandedNodes(new Set(['root']));
  }, []);

  // Toggle node expansion in tree view
  const toggleExpansion = useCallback((nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  }, [expandedNodes]);

  // Handle JSON text changes
  const handleJsonChange = useCallback((value) => {
    setJsonString(value);
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        setJsonData(parsed);
        setIsValidJson(true);
      } else {
        setIsValidJson(false);
      }
    } catch {
      setIsValidJson(false);
    }
  }, []);

  // Render form editor for object properties
  const renderFormEditor = () => {
    const renderObjectFields = (obj, path = [], level = 0) => {
      if (!obj || typeof obj !== 'object') return null;

      return Object.entries(obj).map(([key, value]) => {
        const currentPath = [...path, key];
        const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
        
        return (
          <div key={currentPath.join('.')} className="mb-4">
            {/* Property Row */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Key Input */}
                <div>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateProperty(currentPath, value, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Property name"
                  />
                </div>
                
                {/* Value Input */}
                <div className="flex gap-2">
                  {isObject ? (
                    <div className="flex-1 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded border border-gray-300">
                      Object ({Object.keys(value).length} properties)
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={typeof value === 'string' ? value : JSON.stringify(value)}
                      onChange={(e) => {
                        let newValue;
                        try {
                          newValue = JSON.parse(e.target.value);
                        } catch {
                          newValue = e.target.value;
                        }
                        updateProperty(currentPath, newValue);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Property value"
                    />
                  )}
                  <button
                    onClick={() => removeProperty(currentPath)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove property"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            {/* Nested object properties */}
            {isObject && (
              <div className="ml-6 mt-3 space-y-3">
                {renderObjectFields(value, currentPath, level + 1)}
                <button
                  onClick={() => addProperty(currentPath)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Property
                </button>
              </div>
            )}
          </div>
        );
      });
    };

    const propertyCount = Object.keys(jsonData).length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-medium">Interactive Form Editor</span>
            <button
              onClick={resetData}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 -mt-4">
          Edit your data using form fields with automatic type detection and validation.
        </p>

        {/* Object Container */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChevronDown className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-sm">{ }</span>
            <span className="text-sm font-medium">Object</span>
          </div>

          {propertyCount === 0 ? (
            <div className="py-8 text-center">
              <button
                onClick={() => addProperty()}
                className="flex items-center gap-2 mx-auto px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {renderObjectFields(jsonData)}
              <button
                onClick={() => addProperty()}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded">
          <span>Data Type: Object</span>
          <span>Size: {propertyCount} properties</span>
          <span>{jsonString.length} characters</span>
        </div>
      </div>
    );
  };

  // Render tree view
  const renderTreeView = () => {
    const renderTreeNode = (obj, path = [], level = 0) => {
      if (!obj || typeof obj !== 'object') return null;

      return Object.entries(obj).map(([key, value]) => {
        const currentPath = [...path, key];
        const nodeId = currentPath.join('.');
        const isExpanded = expandedNodes.has(nodeId);
        const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
        const hasChildren = isObject && Object.keys(value).length > 0;

        return (
          <div key={nodeId} className="text-sm">
            <div 
              className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer ${level > 0 ? 'ml-' + (level * 4) : ''}`}
              onClick={() => hasChildren && toggleExpansion(nodeId)}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              
              <span className="font-mono text-blue-600">{key}</span>
              <span className="text-gray-400">:</span>
              
              {isObject ? (
                <span className="text-gray-500">
                  Object ({Object.keys(value).length} properties)
                </span>
              ) : (
                <span className="text-gray-800 font-mono">
                  {JSON.stringify(value)}
                </span>
              )}
            </div>
            
            {hasChildren && isExpanded && (
              <div className="ml-4">
                {renderTreeNode(value, currentPath, level + 1)}
              </div>
            )}
          </div>
        );
      });
    };

    const propertyCount = Object.keys(jsonData).length;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <span className="text-lg font-medium">Object Tree View</span>
        </div>

        {/* Tree Container */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Data Structure</span>
              <span className="font-mono text-sm text-gray-600">object</span>
              <span className="text-sm text-gray-500">{propertyCount} properties</span>
            </div>
          </div>
          
          <div className="p-4">
            {propertyCount === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No properties to display</p>
                <p className="text-xs mt-1">Use Form Editor to add properties</p>
              </div>
            ) : (
              <div className="space-y-1">
                {renderTreeNode(jsonData)}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded">
          <span>Data Type: Object</span>
          <span>Size: 0 properties</span>
          <span>2 characters</span>
        </div>
      </div>
    );
  };

  // Calculate stats
  const propertyCount = Object.keys(jsonData).length;
  const characterCount = jsonString.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">JSON Editor</h1>
              <p className="text-gray-600 mt-1">Edit and visualize your JSON data structure.</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('json')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'json'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code className="w-4 h-4" />
              JSON Editor
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Form Editor
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'tree'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              Tree View
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 md:p-6">
            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">JSON Source</h3>
                  <button
                    onClick={resetData}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
                <textarea
                  value={jsonString}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className={`w-full h-96 p-4 font-mono text-sm border rounded-lg resize-none ${
                    isValidJson 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="Enter JSON here..."
                />
                {!isValidJson && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Invalid JSON format
                  </div>
                )}
              </div>
            )}

            {activeTab === 'form' && renderFormEditor()}
            {activeTab === 'tree' && renderTreeView()}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Data Type: <span className="font-medium text-gray-900">Object</span></span>
              <span>Size: <span className="font-medium text-gray-900">{propertyCount} properties</span></span>
            </div>
            <span><span className="font-medium text-gray-900">{characterCount}</span> characters</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONEditor;
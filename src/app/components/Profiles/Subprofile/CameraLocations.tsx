import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Code, Edit, Eye, Copy, RotateCcw, AlertCircle } from 'lucide-react';

const FormEditor = () => {
  const [data, setData] = useState({});
  const [configurationMode, setConfigurationMode] = useState('form');
  const [jsonValue, setJsonValue] = useState('{}');
  const [jsonError, setJsonError] = useState('');
  const [expandedObjects, setExpandedObjects] = useState(new Set(['root']));

  // Data type configurations with icons and colors
  const dataTypes = {
    string: { 
      icon: '📄', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      label: 'String',
      defaultValue: ''
    },
    number: { 
      icon: '🔢', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      label: 'Number',
      defaultValue: 0
    },
    boolean: { 
      icon: '☑️', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      label: 'Boolean',
      defaultValue: true
    },
    array: { 
      icon: '📋', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50',
      label: 'Array',
      defaultValue: []
    },
    object: { 
      icon: '🏗️', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      label: 'Object',
      defaultValue: {}
    }
  };

  // Initialize with sample data
  useEffect(() => {
    const sampleData = {
      name: "John Doe",
      age: 30,
      isActive: true,
      hobbies: ["reading", "coding"],
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: 10001
      }
    };
    setData(sampleData);
    updateJsonFromData(sampleData);
  }, []);

  const updateJsonFromData = (newData) => {
    setJsonValue(JSON.stringify(newData, null, 2));
  };

  const updateDataFromJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setData(parsed);
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const getDataType = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'string';
    return typeof value;
  };

  const handleValueChange = (path, newValue, newType = null) => {
    const pathArray = path.split('.');
    const newData = { ...data };
    
    let current = newData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) current[pathArray[i]] = {};
      current = current[pathArray[i]];
    }
    
    const lastKey = pathArray[pathArray.length - 1];
    
    // Convert value based on type
    if (newType) {
      switch (newType) {
        case 'number':
          current[lastKey] = parseFloat(newValue) || 0;
          break;
        case 'boolean':
          current[lastKey] = newValue === 'true' || newValue === true;
          break;
        case 'array':
          current[lastKey] = Array.isArray(newValue) ? newValue : [];
          break;
        case 'object':
          current[lastKey] = typeof newValue === 'object' && !Array.isArray(newValue) ? newValue : {};
          break;
        default:
          current[lastKey] = String(newValue);
      }
    } else {
      current[lastKey] = newValue;
    }
    
    setData(newData);
    updateJsonFromData(newData);
  };

  const addProperty = (path = '') => {
    const newKey = `newProperty${Date.now()}`;
    const fullPath = path ? `${path}.${newKey}` : newKey;
    handleValueChange(fullPath, '', 'string');
  };

  const removeProperty = (path) => {
    const pathArray = path.split('.');
    const newData = { ...data };
    
    let current = newData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    delete current[pathArray[pathArray.length - 1]];
    setData(newData);
    updateJsonFromData(newData);
  };

  const toggleObjectExpansion = (key) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedObjects(newExpanded);
  };

  const renderFormField = (key, value, path = '', depth = 0) => {
    const currentPath = path ? `${path}.${key}` : key;
    const dataType = getDataType(value);
    const typeConfig = dataTypes[dataType] || dataTypes.string;

    return (
      <div key={currentPath} className="space-y-3" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="border rounded-lg p-4 bg-gray-50">
          {/* Field Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  // Handle key rename logic here
                  console.log('Renaming key:', key, 'to:', e.target.value);
                }}
                className="bg-white px-2 py-1 text-sm rounded border focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeProperty(currentPath)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Type Selector and Value Editor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${typeConfig.color}`}>{typeConfig.icon}</span>
              <span className="text-gray-700 font-medium text-sm">{key}</span>
              <select 
                value={dataType}
                onChange={(e) => handleValueChange(currentPath, value, e.target.value)}
                className="text-xs border rounded px-2 py-1 text-gray-600 focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(dataTypes).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Value Editor based on type */}
            {dataType === 'string' && (
              <textarea
                value={value}
                onChange={(e) => handleValueChange(currentPath, e.target.value)}
                placeholder="Enter text value..."
                className="w-full p-3 border rounded text-sm resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {dataType === 'number' && (
              <input
                type="number"
                value={value}
                onChange={(e) => handleValueChange(currentPath, parseFloat(e.target.value) || 0)}
                className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
              />
            )}

            {dataType === 'boolean' && (
              <select
                value={value.toString()}
                onChange={(e) => handleValueChange(currentPath, e.target.value === 'true')}
                className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            )}

            {dataType === 'array' && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Array items:</div>
                {Array.isArray(value) && value.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newArray = [...value];
                        newArray[index] = e.target.value;
                        handleValueChange(currentPath, newArray);
                      }}
                      className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handleValueChange(currentPath, newArray);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleValueChange(currentPath, [...value, ''])}
                  className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add item
                </button>
              </div>
            )}

            {dataType === 'object' && typeof value === 'object' && !Array.isArray(value) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleObjectExpansion(currentPath)}
                    className="flex items-center gap-1 text-sm text-gray-600"
                  >
                    {expandedObjects.has(currentPath) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    Object ({Object.keys(value).length} properties)
                  </button>
                  <button
                    onClick={() => addProperty(currentPath)}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add property
                  </button>
                </div>

                {expandedObjects.has(currentPath) && (
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {Object.entries(value).map(([subKey, subValue]) => 
                      renderFormField(subKey, subValue, currentPath, depth + 1)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(JSON.stringify(parsed));
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const clearJson = () => {
    setJsonValue('{}');
    setData({});
    setJsonError('');
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonValue);
  };

  const resetToFormData = () => {
    updateJsonFromData(data);
  };

  const applyJsonChanges = () => {
    updateDataFromJson();
    setConfigurationMode('form');
  };

  const isValidJson = !jsonError && jsonValue.trim() !== '';
  const objectSize = Object.keys(data).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">Camera Locations Configuration</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isValidJson ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isValidJson ? 'Valid' : 'Invalid'}
              </span>
              <span className="text-sm text-gray-500">
                Object({objectSize})
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Create and edit JSON data using visual form fields with type detection.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setConfigurationMode('json')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'json'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Editor
          </button>
          <button
            onClick={() => setConfigurationMode('form')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'form'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit className="w-4 h-4" />
            Form Editor
          </button>
          <button
            onClick={() => setConfigurationMode('tree')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'tree'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            Tree View
          </button>
        </nav>
      </div>

      {/* JSON Editor Mode */}
      {configurationMode === 'json' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">JSON Text Editor</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyJson}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={resetToFormData}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={formatJson}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Format
              </button>
              <button
                onClick={minifyJson}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Minify
              </button>
              <button
                onClick={clearJson}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <textarea
                value={jsonValue}
                onChange={(e) => {
                  setJsonValue(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setJsonError('');
                  } catch (error) {
                    setJsonError('"[object Object]" is not valid JSON');
                  }
                }}
                className="w-full h-64 p-4 font-mono text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter JSON configuration..."
              />
            </div>

            {jsonError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {jsonError}
              </div>
            )}

            {isValidJson && (
              <div className="mt-4">
                <button
                  onClick={applyJsonChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Editor Mode */}
      {configurationMode === 'form' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Interactive Form Editor</h4>
              </div>
              <button
                onClick={() => addProperty()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(data).map(([key, value]) => 
                renderFormField(key, value)
              )}

              {Object.keys(data).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No properties defined yet.</p>
                  <button
                    onClick={() => addProperty()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Your First Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tree View */}
      {configurationMode === 'tree' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center">
              <span className="text-xs text-gray-600">△</span>
            </div>
            <h3 className="font-medium text-gray-900">Object Tree View</h3>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Data Structure</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    object
                  </span>
                  <span className="text-xs text-gray-500">
                    {objectSize} properties
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 px-1 py-2 bg-gray-100 rounded text-sm text-gray-600">
            <span>Data Type: <span className="font-medium text-gray-800">Object</span></span>
            <span>Size: <span className="font-medium text-gray-800">{objectSize} properties</span></span>
            <span className="text-gray-500">{JSON.stringify(data).length} characters</span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span>Data Type: <span className="text-blue-600 font-medium">Object</span></span>
          <span>Size: <span className="text-blue-600 font-medium">{objectSize} properties</span></span>
          <span className="text-gray-500">{JSON.stringify(data).length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
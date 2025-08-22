import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Code, Edit, Eye, Copy, RotateCcw, AlertCircle, Bell } from 'lucide-react';

const AlertSettingsEditor = () => {
  const [alertSettings, setAlertSettings] = useState([]);
  const [configurationMode, setConfigurationMode] = useState('form');
  const [jsonValue, setJsonValue] = useState('[]');
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

  // Initialize with sample alert settings data
  useEffect(() => {
    const sampleAlerts = [
      {
        type: 'motion',
        threshold: 75,
        sensitivity: 'medium',
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        recipients: ['admin@example.com', 'security@example.com'],
        isActive: true
      },
      {
        type: 'person',
        threshold: 60,
        sensitivity: 'high',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        recipients: ['manager@example.com'],
        isActive: true
      }
    ];
    setAlertSettings(sampleAlerts);
    updateJsonFromData(sampleAlerts);
  }, []);

  const updateJsonFromData = (newData) => {
    setJsonValue(JSON.stringify(newData, null, 2));
  };

  const updateDataFromJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        setAlertSettings(parsed);
        setJsonError('');
      } else {
        setJsonError('Alert settings must be an array');
      }
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const getDataType = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'string';
    return typeof value;
  };

  const handleValueChange = (alertIndex, path, newValue, newType = null) => {
    const pathArray = path ? path.split('.') : [];
    const newAlertSettings = [...alertSettings];
    
    let current = newAlertSettings[alertIndex];
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) current[pathArray[i]] = {};
      current = current[pathArray[i]];
    }
    
    const lastKey = pathArray[pathArray.length - 1];
    
    if (pathArray.length === 0) {
      // Direct alert property change
      if (newType) {
        switch (newType) {
          case 'number':
            newAlertSettings[alertIndex] = parseFloat(newValue) || 0;
            break;
          case 'boolean':
            newAlertSettings[alertIndex] = newValue === 'true' || newValue === true;
            break;
          case 'array':
            newAlertSettings[alertIndex] = Array.isArray(newValue) ? newValue : [];
            break;
          case 'object':
            newAlertSettings[alertIndex] = typeof newValue === 'object' && !Array.isArray(newValue) ? newValue : {};
            break;
          default:
            newAlertSettings[alertIndex] = String(newValue);
        }
      } else {
        newAlertSettings[alertIndex] = newValue;
      }
    } else {
      // Nested property change
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
    }
    
    setAlertSettings(newAlertSettings);
    updateJsonFromData(newAlertSettings);
  };

  const addProperty = (alertIndex, path = '') => {
    const newKey = `newProperty${Date.now()}`;
    const fullPath = path ? `${path}.${newKey}` : newKey;
    handleValueChange(alertIndex, fullPath, '', 'string');
  };

  const removeProperty = (alertIndex, path) => {
    const pathArray = path.split('.');
    const newAlertSettings = [...alertSettings];
    
    let current = newAlertSettings[alertIndex];
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    delete current[pathArray[pathArray.length - 1]];
    setAlertSettings(newAlertSettings);
    updateJsonFromData(newAlertSettings);
  };

  const addAlert = () => {
    const newAlert = {
      type: 'motion',
      threshold: 50,
      sensitivity: 'medium',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      recipients: [],
      isActive: true
    };
    const newAlertSettings = [...alertSettings, newAlert];
    setAlertSettings(newAlertSettings);
    updateJsonFromData(newAlertSettings);
  };

  const removeAlert = (index) => {
    const newAlertSettings = alertSettings.filter((_, i) => i !== index);
    setAlertSettings(newAlertSettings);
    updateJsonFromData(newAlertSettings);
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

  const renderFormField = (key, value, alertIndex, path = '', depth = 0) => {
    const currentPath = path ? `${path}.${key}` : key;
    const dataType = getDataType(value);
    const typeConfig = dataTypes[dataType] || dataTypes.string;

    return (
      <div key={currentPath} className="space-y-3" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="border rounded-lg p-4 bg-gray-50">
          {/* Field Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{key}</span>
              <button
                onClick={() => removeProperty(alertIndex, currentPath)}
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
                onChange={(e) => handleValueChange(alertIndex, currentPath, value, e.target.value)}
                className="text-xs border rounded px-2 py-1 text-gray-600 focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(dataTypes).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Value Editor based on type */}
            {dataType === 'string' && (
              <div>
                {key === 'type' ? (
                  <select
                    value={value}
                    onChange={(e) => handleValueChange(alertIndex, currentPath, e.target.value)}
                    className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="motion">Motion Detection</option>
                    <option value="person">Person Detection</option>
                    <option value="vehicle">Vehicle Detection</option>
                    <option value="sound">Sound Detection</option>
                    <option value="custom">Custom</option>
                  </select>
                ) : key === 'sensitivity' ? (
                  <select
                    value={value}
                    onChange={(e) => handleValueChange(alertIndex, currentPath, e.target.value)}
                    className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <textarea
                    value={value}
                    onChange={(e) => handleValueChange(alertIndex, currentPath, e.target.value)}
                    placeholder="Enter text value..."
                    className="w-full p-3 border rounded text-sm resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            )}

            {dataType === 'number' && (
              <div>
                {key === 'threshold' ? (
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleValueChange(alertIndex, currentPath, parseInt(e.target.value))}
                      className="w-full mb-2"
                    />
                    <div className="text-center text-sm text-gray-600">{value}%</div>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleValueChange(alertIndex, currentPath, parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.1"
                  />
                )}
              </div>
            )}

            {dataType === 'boolean' && (
              <select
                value={value.toString()}
                onChange={(e) => handleValueChange(alertIndex, currentPath, e.target.value === 'true')}
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
                        handleValueChange(alertIndex, currentPath, newArray);
                      }}
                      className="flex-1 p-2 border rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handleValueChange(alertIndex, currentPath, newArray);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleValueChange(alertIndex, currentPath, [...value, ''])}
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
                    onClick={() => addProperty(alertIndex, currentPath)}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add property
                  </button>
                </div>

                {expandedObjects.has(currentPath) && (
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                    {Object.entries(value).map(([subKey, subValue]) => 
                      renderFormField(subKey, subValue, alertIndex, currentPath, depth + 1)
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
    setJsonValue('[]');
    setAlertSettings([]);
    setJsonError('');
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonValue);
  };

  const resetToFormData = () => {
    updateJsonFromData(alertSettings);
  };

  const applyJsonChanges = () => {
    updateDataFromJson();
    setConfigurationMode('form');
  };

  const isValidJson = !jsonError && jsonValue.trim() !== '';
  const alertCount = alertSettings.length;

  const renderTreeView = (data, depth = 0) => {
    if (typeof data !== 'object' || data === null) {
      return (
        <span className={`text-sm ${
          typeof data === 'string' ? 'text-green-600' :
          typeof data === 'number' ? 'text-blue-600' :
          typeof data === 'boolean' ? 'text-purple-600' : 'text-gray-600'
        }`}>
          {JSON.stringify(data)}
        </span>
      );
    }

    if (Array.isArray(data)) {
      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} style={{ marginLeft: `${depth * 16}px` }} className="flex items-start gap-2">
              <span className="text-orange-600 font-mono text-sm">[{index}]</span>
              <div className="flex-1">
                {renderTreeView(item, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{ marginLeft: `${depth * 16}px` }} className="flex items-start gap-2">
            <span className="text-gray-700 font-medium text-sm min-w-0 flex-shrink-0">{key}:</span>
            <div className="flex-1 min-w-0">
              {renderTreeView(value, depth + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Alert Settings Editor</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isValidJson ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isValidJson ? 'Valid' : 'Invalid'}
              </span>
              <span className="text-sm text-gray-500">
                Array({alertCount})
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Create and edit alert settings using visual forms, JSON editor, or tree view.
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
                    const parsed = JSON.parse(e.target.value);
                    if (!Array.isArray(parsed)) {
                      setJsonError('Alert settings must be an array');
                    } else {
                      setJsonError('');
                    }
                  } catch (error) {
                    setJsonError('Invalid JSON format');
                  }
                }}
                className="w-full h-96 p-4 font-mono text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter alert settings JSON array..."
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
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Alert Configurations</h4>
            <button
              onClick={addAlert}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Alert
            </button>
          </div>

          <div className="space-y-6">
            {alertSettings.map((alert, alertIndex) => (
              <div key={alertIndex} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Alert {alertIndex + 1}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAlert(alertIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(alert).map(([key, value]) => 
                    renderFormField(key, value, alertIndex)
                  )}
                </div>
              </div>
            ))}

            {alertSettings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-4">No alert settings defined yet.</p>
                <button
                  onClick={addAlert}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Your First Alert
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tree View */}
      {configurationMode === 'tree' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Alert Settings Tree View</h3>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Alert Settings</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    array
                  </span>
                  <span className="text-xs text-gray-500">
                    {alertCount} alerts
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-auto">
              {alertSettings.length > 0 ? (
                renderTreeView(alertSettings)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No alerts to display</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 px-1 py-2 bg-gray-100 rounded text-sm text-gray-600">
            <span>Data Type: <span className="font-medium text-gray-800">Array</span></span>
            <span>Length: <span className="font-medium text-gray-800">{alertCount} alerts</span></span>
            <span className="text-gray-500">{JSON.stringify(alertSettings).length} characters</span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span>Data Type: <span className="text-orange-600 font-medium">Array</span></span>
          <span>Alerts: <span className="text-orange-600 font-medium">{alertCount} configured</span></span>
          <span>Active: <span className="text-green-600 font-medium">{alertSettings.filter(a => a.isActive).length}</span></span>
          <span className="text-gray-500">{JSON.stringify(alertSettings).length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default AlertSettingsEditor;
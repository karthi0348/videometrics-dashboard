import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Code, Edit, Eye, Copy, RotateCcw, AlertCircle, Bell, Menu } from 'lucide-react';

const AlertSettingsEditor = () => {
  const [alertSettings, setAlertSettings] = useState([]);
  const [configurationMode, setConfigurationMode] = useState('form');
  const [jsonValue, setJsonValue] = useState('[]');
  const [jsonError, setJsonError] = useState('');
  const [expandedObjects, setExpandedObjects] = useState(new Set(['root']));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div key={currentPath} className="space-y-3" style={{ marginLeft: `${Math.min(depth * 12, 48)}px` }}>
        <div className="border border-purple-200 rounded-lg p-3 sm:p-4 bg-purple-50">
          {/* Field Header - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 text-sm sm:text-base">{key}</span>
              <button
                onClick={() => removeProperty(alertIndex, currentPath)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Type Selector and Value Editor */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${typeConfig.color}`}>{typeConfig.icon}</span>
                <span className="text-gray-700 font-medium text-sm">{key}</span>
              </div>
              <select 
                value={dataType}
                onChange={(e) => handleValueChange(alertIndex, currentPath, value, e.target.value)}
                className="text-xs border border-purple-200 rounded px-2 py-1 text-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto"
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
                    className="w-full p-2 sm:p-3 border border-purple-200 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                    className="w-full p-2 sm:p-3 border border-purple-200 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                    className="w-full p-2 sm:p-3 border border-purple-200 rounded text-sm resize-none h-16 sm:h-20 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                      className="w-full mb-2 accent-purple-500"
                    />
                    <div className="text-center text-sm text-purple-600 font-medium">{value}%</div>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleValueChange(alertIndex, currentPath, parseFloat(e.target.value) || 0)}
                    className="w-full p-2 sm:p-3 border border-purple-200 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    step="0.1"
                  />
                )}
              </div>
            )}

            {dataType === 'boolean' && (
              <select
                value={value.toString()}
                onChange={(e) => handleValueChange(alertIndex, currentPath, e.target.value === 'true')}
                className="w-full p-2 sm:p-3 border border-purple-200 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            )}

            {dataType === 'array' && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Array items:</div>
                {Array.isArray(value) && value.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newArray = [...value];
                        newArray[index] = e.target.value;
                        handleValueChange(alertIndex, currentPath, newArray);
                      }}
                      className="flex-1 p-2 border border-purple-200 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                    <button
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handleValueChange(alertIndex, currentPath, newArray);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors self-end sm:self-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleValueChange(alertIndex, currentPath, [...value, ''])}
                  className="text-sm text-purple-600 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add item
                </button>
              </div>
            )}

            {dataType === 'object' && typeof value === 'object' && !Array.isArray(value) && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <button
                    onClick={() => toggleObjectExpansion(currentPath)}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
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
                    className="text-sm text-purple-600 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1 transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3 h-3" />
                    Add property
                  </button>
                </div>

                {expandedObjects.has(currentPath) && (
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-purple-200">
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
            <div key={index} style={{ marginLeft: `${Math.min(depth * 12, 48)}px` }} className="flex items-start gap-2">
              <span className="text-orange-600 font-mono text-sm min-w-0 flex-shrink-0">[{index}]</span>
              <div className="flex-1 min-w-0 overflow-hidden">
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
          <div key={key} style={{ marginLeft: `${Math.min(depth * 12, 48)}px` }} className="flex items-start gap-2">
            <span className="text-gray-700 font-medium text-sm min-w-0 flex-shrink-0 break-all">{key}:</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              {renderTreeView(value, depth + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-none sm:max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6" style={{ fontFamily: 'Gotham, Arial, Helvetica, sans-serif' }}>
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'rgb(81, 77, 223)' }} />
              <h2 className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--purple-tertiary)' }}>Alert Settings Editor</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isValidJson ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isValidJson ? 'Valid' : 'Invalid'}
              </span>
              <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded whitespace-nowrap">
                Array({alertCount})
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Create and edit alert settings using visual forms, JSON editor, or tree view.
          </p>
        </div>
      </div>

      {/* Mode Tabs - Mobile responsive with scroll/collapse */}
      <div className="border-b border-purple-200">
        {/* Mobile menu toggle */}
        <div className="sm:hidden flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Editor Mode</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop tabs / Mobile dropdown */}
        <nav className={`${mobileMenuOpen || !mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0">
            <button
              onClick={() => {
                setConfigurationMode('json');
                setMobileMenuOpen(false);
              }}
              className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 justify-start sm:justify-center ${
                configurationMode === 'json'
                  ? 'text-purple-600 border-purple-500'
                  : 'border-transparent text-gray-500 hover:text-purple-600'
              }`}
            >
              <Code className="w-4 h-4" />
              JSON Editor
            </button>
            <button
              onClick={() => {
                setConfigurationMode('form');
                setMobileMenuOpen(false);
              }}
              className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 justify-start sm:justify-center ${
                configurationMode === 'form'
                  ? 'text-purple-600 border-purple-500'
                  : 'border-transparent text-gray-500 hover:text-purple-600'
              }`}
            >
              <Edit className="w-4 h-4" />
              Form Editor
            </button>
            <button
              onClick={() => {
                setConfigurationMode('tree');
                setMobileMenuOpen(false);
              }}
              className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 justify-start sm:justify-center ${
                configurationMode === 'tree'
                  ? 'text-purple-600 border-purple-500'
                  : 'border-transparent text-gray-500 hover:text-purple-600'
              }`}
            >
              <Eye className="w-4 h-4" />
              Tree View
            </button>
          </div>
        </nav>
      </div>

      {/* JSON Editor Mode */}
      {configurationMode === 'json' && (
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                <h2 className="font-medium text-purple-800">JSON Text Editor</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyJson}
                  className="p-2 text-purple-600 hover:bg-purple-200 rounded transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={resetToFormData}
                  className="p-2 text-purple-600 hover:bg-purple-200 rounded transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button
                onClick={formatJson}
                className="px-3 py-1 text-sm text-white rounded transition-colors"
                style={{ backgroundColor: 'rgb(81, 77, 223)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(120, 37, 195)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(81, 77, 223)'}
              >
                Format
              </button>
              <button
                onClick={minifyJson}
                className="px-3 py-1 text-sm text-white rounded transition-colors"
                style={{ backgroundColor: 'rgb(100, 33, 172)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(61, 24, 129)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(100, 33, 172)'}
              >
                Minify
              </button>
              <button
                onClick={clearJson}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="border border-purple-200 rounded-lg overflow-hidden">
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
                className="w-full h-64 sm:h-96 p-3 sm:p-4 font-mono text-xs sm:text-sm border-none focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                placeholder="Enter alert settings JSON array..."
              />
            </div>

            {jsonError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">{jsonError}</span>
              </div>
            )}

            {isValidJson && (
              <div className="mt-4">
                <button
                  onClick={applyJsonChanges}
                  className="w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(81, 77, 223)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(120, 37, 195)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(81, 77, 223)'}
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
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-medium text-purple-700">Alert Configurations</h2>
            <button
              onClick={addAlert}
              className="w-full sm:w-auto px-3 py-2 text-white text-sm rounded flex items-center justify-center gap-1 transition-colors"
              style={{ backgroundColor: 'rgb(120, 37, 195)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(120, 37, 195)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(81, 77, 223)'}
            >
              <Plus className="w-4 h-4" />
              Add Alert
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {alertSettings.map((alert, alertIndex) => (
              <div key={alertIndex} className="bg-white border border-purple-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Alert {alertIndex + 1}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAlert(alertIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors self-end sm:self-auto"
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
              <div className="text-center py-8 sm:py-12 bg-purple-50 border border-purple-100 rounded-lg">
                <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-purple-300" />
                <p className="mb-4 text-purple-700 font-medium text-sm sm:text-base">No alert settings defined yet.</p>
                <button
                  onClick={addAlert}
                  className="w-full sm:w-auto px-4 py-2 text-white rounded transition-colors"
                  style={{ backgroundColor: 'rgb(81, 77, 223)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(120, 37, 195)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(81, 77, 223)'}
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
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-purple-600" />
            <h2 className="font-medium text-purple-800 text-sm sm:text-base">Alert Settings Tree View</h2>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <div className="px-3 sm:px-4 py-3 bg-purple-50 border-b border-purple-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium text-purple-700">Alert Settings</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    array
                  </span>
                  <span className="text-xs text-purple-600 whitespace-nowrap">
                    {alertCount} alerts
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 max-h-64 sm:max-h-96 overflow-auto">
              {alertSettings.length > 0 ? (
                <div className="overflow-hidden">
                  {renderTreeView(alertSettings)}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-purple-500">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-300" />
                  <p className="text-sm">No alerts to display</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 px-1 py-2 bg-purple-100 rounded text-sm text-purple-600 gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <span>Data Type: <span className="font-medium text-purple-800">Array</span></span>
              <span>Length: <span className="font-medium text-purple-800">{alertCount} alerts</span></span>
            </div>
            <span className="text-purple-500 text-xs sm:text-sm whitespace-nowrap">{JSON.stringify(alertSettings).length} characters</span>
          </div>
        </div>
      )}

      {/* Status Bar - Mobile responsive */}
      <div className="bg-purple-50 px-3 sm:px-4 py-3 rounded-lg border border-purple-100">
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between text-sm gap-2 sm:gap-0">
          <span className="truncate">Data Type: <span className="text-orange-600 font-medium">Array</span></span>
          <span className="truncate">Alerts: <span className="text-purple-600 font-medium">{alertCount} configured</span></span>
          <span className="truncate">Active: <span className="text-green-600 font-medium">{alertSettings.filter(a => a.isActive).length}</span></span>
          <span className="text-purple-500 text-xs sm:text-sm truncate sm:whitespace-nowrap">{JSON.stringify(alertSettings).length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default AlertSettingsEditor;
import React, { useState } from "react";
import { VideoAnalytics } from "../types/types";

interface RawDataViewProps {
  data: VideoAnalytics;
}

// Define types for the data filtering
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const RawDataView: React.FC<RawDataViewProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  // Filter data based on search term
  const filterData = (obj: JsonObject, searchTerm: string): JsonObject => {
    if (!searchTerm) return obj;

    const search = searchTerm.toLowerCase();
    const filtered: JsonObject = {};

    const searchInValue = (value: JsonValue): boolean => {
      if (typeof value === "string") {
        return value.toLowerCase().includes(search);
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value).toLowerCase().includes(search);
      }
      if (Array.isArray(value)) {
        return value.some(item => searchInValue(item));
      }
      if (typeof value === "object" && value !== null) {
        return Object.entries(value).some(([k, v]) => 
          k.toLowerCase().includes(search) || searchInValue(v)
        );
      }
      return false;
    };

    Object.entries(obj).forEach(([key, value]) => {
      if (key.toLowerCase().includes(search) || searchInValue(value)) {
        filtered[key] = value;
      }
    });

    return filtered;
  };

  const filteredData = filterData(data as JsonObject, searchTerm);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Raw Analytics Data</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search in raw data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Data Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-600 text-xs font-medium uppercase tracking-wide">Total Fields</div>
            <div className="text-blue-900 text-lg font-semibold mt-1">
              {Object.keys(data).length}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-600 text-xs font-medium uppercase tracking-wide">Processing Status</div>
            <div className="text-green-900 text-lg font-semibold mt-1 capitalize">
              {data.status || 'Unknown'}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-purple-600 text-xs font-medium uppercase tracking-wide">Confidence</div>
            <div className="text-purple-900 text-lg font-semibold mt-1">
              {data.confidence_score}%
            </div>
          </div>
        </div>
      </div>

      {/* JSON Tree Display */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
          <h4 className="text-sm font-medium text-gray-900">Complete Analytics Object</h4>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {Object.keys(filteredData).length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.657 2.172M12 3v9.341" />
              </svg>
              <p className="text-gray-500 text-sm">No data matches your search criteria</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <JsonTreeView data={filteredData} />
          )}
        </div>
      </div>

      {/* Data Export Options */}
      <div className="mt-6 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Export Options:</span> Download raw data in different formats
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const jsonStr = JSON.stringify(data, null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-${data.id}-raw-data.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => {
              const csvContent = Object.entries(data.parsed_metrics || {})
                .map(([key, value]) => `${key},${value}`)
                .join('\n');
              const blob = new Blob([`Key,Value\n${csvContent}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-${data.id}-metrics.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            CSV
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced JSON Tree Component with proper types
interface JsonTreeViewProps {
  data: JsonObject;
  level?: number;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, level = 0 }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(['video_metadata', 'parsed_metrics', 'generated_summary', 'generated_charts'])
  );

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const getTypeColor = (value: JsonValue): string => {
    if (value === null) return "bg-gray-100 text-gray-600";
    if (typeof value === "string") return "bg-green-100 text-green-700";
    if (typeof value === "number") return "bg-blue-100 text-blue-700";
    if (typeof value === "boolean") return "bg-purple-100 text-purple-700";
    if (Array.isArray(value)) return "bg-orange-100 text-orange-700";
    if (typeof value === "object") return "bg-indigo-100 text-indigo-700";
    return "bg-gray-100 text-gray-600";
  };

  const getValueDisplay = (value: JsonValue): string => {
    if (value === null) return "null";
    if (typeof value === "string") return `"${value.length > 50 ? value.substring(0, 50) + '...' : value}"`;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (typeof value === "object" && value !== null) return `Object(${Object.keys(value).length})`;
    return String(value);
  };

  const getTypeName = (value: JsonValue): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  const renderValue = (key: string, value: JsonValue, path: string) => {
    const isExpanded = expandedKeys.has(path);
    const indent = level * 20;
    const isComplexType = (typeof value === "object" && value !== null) || Array.isArray(value);

    return (
      <div key={path} className="mb-1">
        <div 
          className={`flex items-center py-2 rounded transition-colors ${
            isComplexType ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-25'
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={isComplexType ? () => toggleExpanded(path) : undefined}
        >
          {isComplexType && (
            <svg
              className={`w-3 h-3 mr-2 transition-transform text-gray-400 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {!isComplexType && <div className="w-5 mr-2"></div>}
          
          <div className="flex items-center min-w-0 flex-1">
            <span className="text-gray-700 text-sm font-medium mr-3 min-w-0">
              {key}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-mono mr-3 ${getTypeColor(value)}`}>
              {getTypeName(value)}
            </span>
            <span className="text-gray-600 text-sm font-mono truncate">
              {getValueDisplay(value)}
            </span>
          </div>
        </div>

        {isComplexType && isExpanded && (
          <div className="border-l-2 border-gray-100 ml-4" style={{ marginLeft: `${indent + 16}px` }}>
            {Array.isArray(value) ? (
              value.map((item, index) => (
                <JsonTreeView
                  key={`${path}-${index}`}
                  data={{ [`[${index}]`]: item }}
                  level={level + 1}
                />
              ))
            ) : typeof value === "object" && value !== null ? (
              Object.entries(value).map(([subKey, subValue]) => (
                <JsonTreeView
                  key={`${path}-${subKey}`}
                  data={{ [subKey]: subValue }}
                  level={level + 1}
                />
              ))
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {Object.entries(data).map(([key, value]) =>
        renderValue(key, value, `${level}-${key}`)
      )}
    </div>
  );
};

export default RawDataView;
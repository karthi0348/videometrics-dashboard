import React, { useState } from "react";
import { VideoAnalytics } from "../types/types";

interface RawDataViewProps {
  data: VideoAnalytics;
  insights?: any;
}

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const RawDataView: React.FC<RawDataViewProps> = ({ data, insights }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'insights'>('analytics');

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
        return value.some((item) => searchInValue(item));
      }
      if (typeof value === "object" && value !== null) {
        return Object.entries(value).some(
          ([k, v]) => k.toLowerCase().includes(search) || searchInValue(v)
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

  const filteredData = filterData(data as unknown as JsonObject, searchTerm);
  const filteredInsights = insights
    ? filterData(insights as JsonObject, searchTerm)
    : null;

  const handleExportJSON = () => {
    const combinedData = {
      analytics: data,
      insights: insights || null,
      exported_at: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(combinedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${data.id}-complete-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = Object.entries(data.parsed_metrics || {})
      .map(([key, value]) => `${key},${value}`)
      .join("\n");
    const blob = new Blob([`Key,Value\n${csvContent}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${data.id}-metrics.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-8">
 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 via-blue-700 to-purple-600 px-6 sm:px-8 py-8">            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                Analytics Data
              </h1>
              <p className="text-whitex mt-1 text-sm sm:text-base">
                Explore raw analytics data and generated insights
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={expandAll ? "M20 12H4" : "M12 4v16m8-8H4"} />
                </svg>
                {expandAll ? "Collapse All" : "Expand All"}
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search through analytics data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm shadow-sm text-sm sm:text-base transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Total Fields
              </div>
              <div className="text-blue-900 text-xl sm:text-2xl font-bold">
                {Object.keys(data).length}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Status
              </div>
              <div className="text-emerald-900 text-xl sm:text-2xl font-bold capitalize truncate">
                {data.status || "Unknown"}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-purple-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Confidence
              </div>
              <div className="text-purple-900 text-xl sm:text-2xl font-bold">
                {data.confidence_score}%
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-teal-600 text-xs font-semibold uppercase tracking-wide mb-1">
                Insights
              </div>
              <div className="text-teal-900 text-xl sm:text-2xl font-bold">
                {insights ? Object.keys(insights).length : "N/A"}
              </div>
            </div>
          </div>

          {/* Tab Navigation - Only show if insights exist */}
          {insights && (
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Analytics Data</span>
                  <span className="sm:hidden">Analytics</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'insights'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="hidden sm:inline">Generated Insights</span>
                  <span className="sm:hidden">Insights</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {activeTab === 'analytics' ? (
                <>
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Complete Analytics Object
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analytics Insights Data
                </>
              )}
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {/* No Results State */}
            {((activeTab === 'analytics' && Object.keys(filteredData).length === 0) ||
              (activeTab === 'insights' && (!insights || Object.keys(filteredInsights || {}).length === 0))) ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.657 2.172M12 3v9.341" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching data found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or clear the search to see all data
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <JsonTreeView 
                  data={activeTab === 'analytics' ? filteredData : (filteredInsights || {})}
                  expandAll={expandAll}
                />
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Data</h3>
              <p className="text-gray-600 text-sm">
                Download your analytics data in different formats for external analysis
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON {insights ? "+ Insights" : ""}
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Enhanced JSON Tree Component
interface JsonTreeViewProps {
  data: JsonObject;
  level?: number;
  expandAll?: boolean;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, level = 0, expandAll = false }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set([
      "video_metadata",
      "parsed_metrics", 
      "generated_summary",
      "generated_charts",
    ])
  );

  React.useEffect(() => {
    if (expandAll) {
      const allKeys = new Set<string>();
      const addAllKeys = (obj: JsonObject, prefix = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}-${key}` : key;
          allKeys.add(fullKey);
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            addAllKeys(value as JsonObject, fullKey);
          }
        });
      };
      addAllKeys(data);
      setExpandedKeys(allKeys);
    } else {
      setExpandedKeys(new Set([
        "video_metadata",
        "parsed_metrics",
        "generated_summary", 
        "generated_charts",
      ]));
    }
  }, [expandAll, data]);

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
    if (value === null) return "bg-gray-100 text-gray-600 border-gray-300";
    if (typeof value === "string") return "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (typeof value === "number") return "bg-blue-100 text-blue-700 border-blue-300";
    if (typeof value === "boolean") return "bg-purple-100 text-purple-700 border-purple-300";
    if (Array.isArray(value)) return "bg-orange-100 text-orange-700 border-orange-300";
    if (typeof value === "object") return "bg-indigo-100 text-indigo-700 border-indigo-300";
    return "bg-gray-100 text-gray-600 border-gray-300";
  };

  const getValueDisplay = (value: JsonValue): string => {
    if (value === null) return "null";
    if (typeof value === "string") {
      return `"${value}"`;
    }
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
    const indent = level * (window.innerWidth < 640 ? 8 : 20);
    const isComplexType = (typeof value === "object" && value !== null) || Array.isArray(value);
    const displayValue = getValueDisplay(value);
    const typeName = getTypeName(value);

    return (
      <div key={path} className="group mb-1">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div
            className={`p-3 rounded-xl transition-all duration-200 border ${
              isComplexType
                ? "cursor-pointer hover:bg-blue-50 active:bg-blue-100 border-blue-200 bg-gradient-to-r from-blue-50/50 to-white"
                : "border-gray-200 bg-gradient-to-r from-gray-50/50 to-white hover:from-gray-50 hover:to-gray-100/50"
            }`}
            style={{ marginLeft: `${indent}px` }}
            onClick={isComplexType ? () => toggleExpanded(path) : undefined}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isComplexType && (
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-blue-600 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <h4 className="text-sm font-semibold text-gray-900 break-all flex-1">
                  {key}
                </h4>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-mono flex-shrink-0 ml-2 ${getTypeColor(value)}`}>
                {typeName}
              </span>
            </div>
            {!isComplexType && (
              <div className="mt-2 p-2 bg-white/70 rounded-lg border border-gray-100">
                <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                  {displayValue}
                </p>
              </div>
            )}
          </div>
        </div>
        

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div
            className={`flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 ${
              isComplexType
                ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                : "hover:bg-gray-25"
            }`}
            style={{ paddingLeft: `${indent + 12}px` }}
            onClick={isComplexType ? () => toggleExpanded(path) : undefined}
          >
            {isComplexType && (
              <svg
                className={`w-3 h-3 mr-3 flex-shrink-0 transition-transform duration-200 text-gray-500 group-hover:text-gray-700 ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {!isComplexType && <div className="w-6 mr-3 flex-shrink-0"></div>}

            <div className="flex items-center min-w-0 flex-1 gap-4">
              <span className="text-gray-800 text-sm font-semibold min-w-0 flex-shrink-0">
                {key}
              </span>
              <span className={`text-xs px-2 py-1 rounded-md border font-mono flex-shrink-0 ${getTypeColor(value)}`}>
                {typeName}
              </span>
              <span className="text-gray-600 text-sm font-mono break-all flex-1 text-right">
                {displayValue}
              </span>
            </div>
          </div>
        </div>

        {isComplexType && isExpanded && (
          <div className="border-l-2 border-gradient-to-b from-blue-200 to-gray-200 ml-3 sm:ml-6 pl-2 sm:pl-4 mt-2 mb-3">
            {Array.isArray(value)
              ? value.map((item, index) => (
                  <JsonTreeView
                    key={`${path}-${index}`}
                    data={{ [`[${index}]`]: item }}
                    level={level + 1}
                    expandAll={expandAll}
                  />
                ))
              : typeof value === "object" && value !== null
              ? Object.entries(value).map(([subKey, subValue]) => (
                  <JsonTreeView
                    key={`${path}-${subKey}`}
                    data={{ [subKey]: subValue }}
                    level={level + 1}
                    expandAll={expandAll}
                  />
                ))
              : null}
          </div>
        )}
      </div>
      
    );
  };

  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) =>
        renderValue(key, value, `${level}-${key}`)
      )}
    </div>
  );
};

export default RawDataView;
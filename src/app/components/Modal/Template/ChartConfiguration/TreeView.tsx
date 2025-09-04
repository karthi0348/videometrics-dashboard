import React from "react";
import { ChartConfig } from "@/app/components/Templates/types/templates";

interface TreeViewProps {
  charts: ChartConfig[];
  jsonContent: string;
}

export const TreeView: React.FC<TreeViewProps> = ({ charts, jsonContent }) => {
  const renderTreeView = (data: any, level = 0): React.ReactNode => {
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-blue-600 font-mono">array</span>
            <span className="text-gray-500">{data.length} items</span>
          </div>
          {data.map((item, index) => (
            <div key={index} className="ml-2 sm:ml-4 border-l-2 border-gray-200 pl-2 sm:pl-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span className="text-gray-700 font-mono">[{index}]</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                    object
                  </span>
                </div>
              </div>
              <div className="ml-2 sm:ml-4 mt-2">{renderTreeView(item, level + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === "object" && data !== null) {
      return (
        <div className="space-y-1 sm:space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="py-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm font-mono text-gray-700 break-all">
                    {key}
                  </span>
                  <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                    {typeof value}
                  </span>
                </div>
                {typeof value === "string" && (
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded break-all sm:truncate max-w-full sm:max-w-xs ml-6 sm:ml-0">
                    "{value}"
                  </span>
                )}
              </div>
              {typeof value === "object" && value !== null && (
                <div className="ml-4 sm:ml-6 mt-2">{renderTreeView(value, level + 1)}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-4">
        <h4 className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="truncate">Object Tree View</span>
        </h4>
      </div>

      {/* Tree Content */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 overflow-hidden">
        {/* Data Structure Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
          <span className="text-sm font-medium text-gray-700">
            Data Structure
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
              array
            </span>
            <span className="text-xs text-gray-500">{charts.length} items</span>
          </div>
        </div>

        {/* Tree View Content */}
        <div className="overflow-x-auto">
          <div className="min-w-0">
            {renderTreeView(charts)}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-3 border-t border-gray-100 gap-2 text-xs sm:text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span>
            Data Type: <strong>Array</strong>
          </span>
          <span>
            Size: <strong>{charts.length} items</strong>
          </span>
        </div>
        <span className="whitespace-nowrap">
          <strong>{jsonContent.length} characters</strong>
        </span>
      </div>
    </div>
  );
};
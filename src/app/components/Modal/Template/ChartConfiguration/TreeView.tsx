import React from 'react';
import { ChartConfig } from '../../../../types/templates';

interface TreeViewProps {
  charts: ChartConfig[];
  jsonContent: string;
}

const TreeView: React.FC<TreeViewProps> = ({ charts, jsonContent }) => {
  const renderTreeView = (data: any, level = 0): React.ReactNode => {
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 font-mono">array</span>
            <span className="text-gray-500">{data.length} items</span>
          </div>
          {data.map((item, index) => (
            <div key={index} className="ml-4 border-l-2 border-gray-200 pl-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700 font-mono">[{index}]</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  object
                </span>
              </div>
              <div className="ml-4 mt-2">{renderTreeView(item, level + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === "object" && data !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 py-1">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-sm font-mono text-gray-700 min-w-0 flex-shrink-0">
                {key}
              </span>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                {typeof value}
              </span>
              {typeof value === "string" && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded truncate">
                  "{value}"
                </span>
              )}
              {typeof value === "object" && value !== null && (
                <div className="ml-4">{renderTreeView(value, level + 1)}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
          Object Tree View
        </h4>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">
            Data Structure
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            array
          </span>
          <span className="text-xs text-gray-500">
            {charts.length} items
          </span>
        </div>

        {renderTreeView(charts)}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
        <span>
          Data Type: <strong>Array</strong>
        </span>
        <span>
          Size: <strong>{charts.length} items</strong>
        </span>
        <span>
          <strong>{jsonContent.length} characters</strong>
        </span>
      </div>
    </div>
  );
};

export default TreeView;
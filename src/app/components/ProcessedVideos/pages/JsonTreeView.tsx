import React, { useState } from "react";

// Define types for JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonTreeViewProps {
  data: JsonObject;
  level?: number;
}

// JSON Tree Component for Raw Data Display
const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, level = 0 }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderValue = (key: string, value: JsonValue, path: string) => {
    const isExpanded = expandedKeys.has(path);
    const indent = level * 20;

    if (value === null) {
      return (
        <div className="flex items-center py-1" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
          <span className="text-gray-500 italic text-sm">null</span>
        </div>
      );
    }

    if (typeof value === "string") {
      return (
        <div className="flex items-center py-1" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
          <span className="text-green-600 text-sm">&quot;{value}&quot;</span>
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div className="flex items-center py-1" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
          <span className="text-orange-600 text-sm">{value}</span>
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div className="flex items-center py-1" style={{ paddingLeft: `${indent}px` }}>
          <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
          <span className="text-purple-600 text-sm">{value.toString()}</span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div>
          <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50"
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => toggleExpanded(path)}>
            <svg
              className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
            <span className="text-gray-500 text-sm">[{value.length} items]</span>
          </div>
          {isExpanded && (
            <div>
              {value.map((item, index) => (
                <JsonTreeView
                  key={`${path}-${index}`}
                  data={{ [index]: item }}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      const keys = Object.keys(value);
      return (
        <div>
          <div className="flex items-center py-1 cursor-pointer hover:bg-gray-50"
            style={{ paddingLeft: `${indent}px` }}
            onClick={() => toggleExpanded(path)}>
            <svg
              className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
            <span className="text-gray-500 text-sm">{`{${keys.length} properties}`}</span>
          </div>
          {isExpanded && (
            <div>
              {keys.map((subKey) => (
                <JsonTreeView
                  key={`${path}-${subKey}`}
                  data={{ [subKey]: (value as JsonObject)[subKey] }}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center py-1" style={{ paddingLeft: `${indent}px` }}>
        <span className="text-blue-600 font-mono text-sm mr-2">{key}:</span>
        <span className="text-gray-600 text-sm">{String(value)}</span>
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

export default JsonTreeView;
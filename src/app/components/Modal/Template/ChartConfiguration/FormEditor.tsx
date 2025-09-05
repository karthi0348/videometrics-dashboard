import React from "react";
import { ChartConfig } from "@/app/components/Templates/types/templates";

interface FormEditorProps {
  charts: ChartConfig[];
  chartTypes: string[];
  updateChart: (index: number, field: string, value: string | number | boolean) => void;
  addChart: () => void;
  removeChart: (index: number) => void;
  onReset: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  charts,
  chartTypes,
  updateChart,
  addChart,
  removeChart,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-4">
        <div className="flex-1">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="truncate">Interactive Form Editor</span>
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Edit your chart configurations using form fields with automatic
            type detection and validation.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {/* Charts Section */}
      <div className="space-y-3 sm:space-y-4">
        {charts.map((chart, chartIndex) => (
          <div
            key={chartIndex}
            className="border border-gray-200 rounded-lg p-3 sm:p-4"
          >
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  Item {chartIndex}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                  object
                </span>
              </div>
              {charts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChart(chartIndex)}
                  className="text-red-500 hover:text-red-700 p-1 ml-2 flex-shrink-0"
                  aria-label={`Remove chart ${chartIndex}`}
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Chart Properties */}
            <div className="space-y-3">
              {Object.entries(chart).map(([key, value]) => (
                <div
                  key={key}
                  className="border border-gray-100 rounded-lg p-2 sm:p-3"
                >
                  {/* Property Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 min-w-0 break-words">
                        {key}
                      </span>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded whitespace-nowrap">
                        {typeof value === "object" ? "object" : "string"}
                      </span>
                    </div>
                    {charts.length > 1 &&
                      key !== "x_axis" &&
                      key !== "y_axis" && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedChart = { ...chart };
                            delete updatedChart[key as keyof ChartConfig];
                            updateChart(chartIndex, "entireChart", updatedChart);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 self-start sm:self-center flex-shrink-0"
                          aria-label={`Remove property ${key}`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                  </div>

                  {/* Property Value Editor */}
                  {typeof value === "object" && value !== null ? (
                    <div className="space-y-2 ml-0 sm:ml-4">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2 sm:min-w-0 sm:flex-shrink-0">
                            <div className="w-1 h-1 bg-teal-500 rounded-full hidden sm:block"></div>
                            <span className="text-xs text-gray-500 font-mono break-all sm:w-auto sm:min-w-[3rem]">
                              {subKey}:
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">
                              string
                            </span>
                          </div>
                          <input
                            type="text"
                            value={String(subValue)}
                            onChange={(e) =>
                              updateChart(
                                chartIndex,
                                `${key}.${subKey}`,
                                e.target.value
                              )
                            }
                            className="flex-1 text-xs sm:text-sm border border-gray-300 rounded px-2 py-1.5 sm:px-3 sm:py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-w-0"
                            placeholder={`Enter ${subKey}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-0 sm:ml-4">
                      {key === "chart_type" ? (
                        <select
                          value={String(value)}
                          onChange={(e) =>
                            updateChart(chartIndex, key, e.target.value)
                          }
                          className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2 py-1.5 sm:px-3 sm:py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {chartTypes.map((type) => (
                            <option
                              key={type}
                              value={type.toLowerCase().replace(" ", "_")}
                            >
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <textarea
                          value={String(value)}
                          onChange={(e) =>
                            updateChart(chartIndex, key, e.target.value)
                          }
                          className="w-full text-xs sm:text-sm border border-gray-300 rounded px-2 py-1.5 sm:px-3 sm:py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none min-h-[2rem]"
                          rows={1}
                          placeholder={`Enter ${key}`}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Chart Button */}
        <button
          type="button"
          onClick={addChart}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 lg:p-6 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="truncate">Add Property</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-3 border-t border-gray-100 gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm text-gray-500">
          Data Type: <strong>Array</strong>
        </span>
        <span className="text-xs sm:text-sm text-gray-500">
          Size: <strong>{charts.length} items</strong>
        </span>
      </div>
    </div>
  );
};
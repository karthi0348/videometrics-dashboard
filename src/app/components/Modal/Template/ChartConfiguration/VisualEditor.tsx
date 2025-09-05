import React from "react";
import { ChartConfig } from "@/app/components/Templates/types/templates";

interface VisualEditorProps {
  charts: ChartConfig[];
  chartTypes: string[];
  updateChart: (index: number, field: string, value: string | number | boolean) => void;
  addChart: () => void;
  removeChart: (index: number) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  charts,
  chartTypes,
  updateChart,
  addChart,
  removeChart,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        {charts.map((chart, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 bg-gray-50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h4 className="text-base sm:text-lg font-medium text-gray-900">
                Chart {index + 1}
              </h4>
              {charts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChart(index)}
                  className="text-red-500 hover:text-red-700 p-1 self-start sm:self-auto"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2 xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chart.title}
                  onChange={(e) => updateChart(index, "title", e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Chart Type
                </label>
                <select
                  value={chart.chart_type}
                  onChange={(e) =>
                    updateChart(index, "chart_type", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              </div>

              <div className="sm:col-span-2 xl:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Data Source
                </label>
                <input
                  type="text"
                  value={chart.data_source}
                  onChange={(e) =>
                    updateChart(index, "data_source", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  X-Axis Field
                </label>
                <input
                  type="text"
                  value={chart.x_axis.field}
                  onChange={(e) =>
                    updateChart(index, "x_axis.field", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  X-Axis Label
                </label>
                <input
                  type="text"
                  value={chart.x_axis.label}
                  onChange={(e) =>
                    updateChart(index, "x_axis.label", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Y-Axis Field
                </label>
                <input
                  type="text"
                  value={chart.y_axis.field}
                  onChange={(e) =>
                    updateChart(index, "y_axis.field", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Y-Axis Label
                </label>
                <input
                  type="text"
                  value={chart.y_axis.label}
                  onChange={(e) =>
                    updateChart(index, "y_axis.label", e.target.value)
                  }
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addChart}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
          Add Chart
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import { ChartConfig } from '../../../../types/templates';
import { CHART_TYPES } from '../../../../constants/templates';

interface VisualEditorProps {
  charts: ChartConfig[];
  onUpdateChart: (index: number, field: string, value: any) => void;
  onRemoveChart: (index: number) => void;
  onAddChart: () => void;
}

const VisualEditor: React.FC<VisualEditorProps> = ({
  charts,
  onUpdateChart,
  onRemoveChart,
  onAddChart,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {charts.map((chart, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Chart {index + 1}
              </h4>
              {charts.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveChart(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg
                    className="w-5 h-5"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chart.title}
                  onChange={(e) => onUpdateChart(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Type
                </label>
                <select
                  value={chart.chart_type}
                  onChange={(e) => onUpdateChart(index, "chart_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {CHART_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type.toLowerCase().replace(" ", "_")}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Source
                </label>
                <input
                  type="text"
                  value={chart.data_source}
                  onChange={(e) => onUpdateChart(index, "data_source", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Field
                </label>
                <input
                  type="text"
                  value={chart.x_axis.field}
                  onChange={(e) => onUpdateChart(index, "x_axis.field", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Label
                </label>
                <input
                  type="text"
                  value={chart.x_axis.label}
                  onChange={(e) => onUpdateChart(index, "x_axis.label", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Field
                </label>
                <input
                  type="text"
                  value={chart.y_axis.field}
                  onChange={(e) => onUpdateChart(index, "y_axis.field", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Label
                </label>
                <input
                  type="text"
                  value={chart.y_axis.label}
                  onChange={(e) => onUpdateChart(index, "y_axis.label", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddChart}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
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

export default VisualEditor;
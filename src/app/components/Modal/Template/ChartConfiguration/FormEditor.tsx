import React from 'react';
import { ChartConfig } from '../../../../types/templates';
import { CHART_TYPES } from '../../../../constants/templates';

interface FormEditorProps {
  charts: ChartConfig[];
  onUpdateChart: (index: number, field: string, value: any) => void;
  onRemoveChart: (index: number) => void;
  onAddChart: () => void;
  onReset: () => void;
}

const FormEditor: React.FC<FormEditorProps> = ({
  charts,
  onUpdateChart,
  onRemoveChart,
  onAddChart,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Interactive Form Editor
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Edit your chart configurations using form fields with
            automatic type detection and validation.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {charts.map((chart, chartIndex) => (
          <div
            key={chartIndex}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  Item {chartIndex}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  object
                </span>
              </div>
              {charts.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveChart(chartIndex)}
                  className="text-red-500 hover:text-red-700 p-1"
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

            <div className="space-y-3">
              {Object.entries(chart).map(([key, value]) => (
                <div
                  key={key}
                  className="border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[100px]">
                      {key}
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                      {typeof value === "object" ? "object" : "string"}
                    </span>
                  </div>

                  {typeof value === "object" && value !== null ? (
                    <div className="space-y-2 ml-4">
                      {Object.entries(value as any).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                          <span className="text-xs text-gray-500 w-12 font-mono">
                            {subKey}:
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            string
                          </span>
                          <input
                            type="text"
                            value={String(subValue)}
                            onChange={(e) =>
                              onUpdateChart(
                                chartIndex,
                                `${key}.${subKey}`,
                                e.target.value
                              )
                            }
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            placeholder={`Enter ${subKey}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-4">
                      {key === "chart_type" ? (
                        <select
                          value={String(value)}
                          onChange={(e) =>
                            onUpdateChart(chartIndex, key, e.target.value)
                          }
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
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
                      ) : (
                        <textarea
                          value={String(value)}
                          onChange={(e) =>
                            onUpdateChart(chartIndex, key, e.target.value)
                          }
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
          Add Property
        </button>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
        <span>
          Data Type: <strong>Array</strong>
        </span>
        <span>
          Size: <strong>{charts.length} items</strong>
        </span>
      </div>
    </div>
  );
};

export default FormEditor;
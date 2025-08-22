import React, { useState } from "react";

interface ChartConfig {
  chart_type: string;
  title: string;
  data_source: string;
  x_axis: {
    field: string;
    label: string;
  };
  y_axis: {
    field: string;
    label: string;
  };
}

interface ChartConfigurationProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  onConfigChange?: (config: ChartConfig[]) => void;
}

const ChartConfiguration: React.FC<ChartConfigurationProps> = ({
  isExpanded = true,
  onToggle,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    "visual" | "json" | "form" | "tree"
  >("visual");
  const [showPreview, setShowPreview] = useState(false);

  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      chart_type: "line",
      title: "Chart 2",
      data_source: "data_source",
      x_axis: {
        field: "x",
        label: "X-Axis",
      },
      y_axis: {
        field: "y",
        label: "Y-Axis",
      },
    },
  ]);

  const [jsonContent, setJsonContent] = useState<string>(
    JSON.stringify(charts, null, 2)
  );

  const chartTypes = [
    "Line Chart",
    "Bar Chart",
    "Pie Chart",
    "Area Chart",
    "Scatter Plot",
    "Histogram",
    "Bubble Chart",
  ];

  const updateChart = (index: number, field: string, value: any) => {
    const updatedCharts = [...charts];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedCharts[index] = {
        ...updatedCharts[index],
        [parent]: {
          ...updatedCharts[index][parent as keyof ChartConfig],
          [child]: value,
        },
      };
    } else {
      updatedCharts[index] = { ...updatedCharts[index], [field]: value };
    }
    setCharts(updatedCharts);
    setJsonContent(JSON.stringify(updatedCharts, null, 2));
    onConfigChange?.(updatedCharts);
  };

  const addChart = () => {
    const newChart: ChartConfig = {
      chart_type: "line",
      title: `Chart ${charts.length + 1}`,
      data_source: "data_source",
      x_axis: {
        field: "x",
        label: "X-Axis",
      },
      y_axis: {
        field: "y",
        label: "Y-Axis",
      },
    };
    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    setJsonContent(JSON.stringify(updatedCharts, null, 2));
    onConfigChange?.(updatedCharts);
  };

  const removeChart = (index: number) => {
    const updatedCharts = charts.filter((_, i) => i !== index);
    setCharts(updatedCharts);
    setJsonContent(JSON.stringify(updatedCharts, null, 2));
    onConfigChange?.(updatedCharts);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setCharts(parsed);
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed));
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy JSON");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metric-structure.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content); // Validate JSON
            setJsonContent(content);
          } catch (error) {
            console.error("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetJson = () => {
    setJsonContent("{}");
  };

  const clearJson = () => {
    setJsonContent("[]");
    setCharts([]);
  };

  const isValidJson = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const getJsonError = () => {
    try {
      JSON.parse(jsonContent);
      return null;
    } catch (error) {
      return error.message;
    }
  };

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
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Chart Configuration
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {charts.length} chart{charts.length !== 1 ? "s" : ""}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">
              Configure charts for visualizing the analyzed data. Either chart
              configuration or summary configuration is required.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={copyJson}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Copy JSON"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
              <button
                type="button"
                onClick={downloadJson}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Download JSON"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </button>
              <button
                type="button"
                onClick={uploadJson}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Upload JSON"
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Upload
              </button>
              <button
                type="button"
                onClick={resetJson}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                title="Reset JSON"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "visual"
                    ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                }`}
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "json"
                    ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                }`}
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                JSON Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "form"
                    ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                }`}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tree")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "tree"
                    ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                }`}
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Tree View
              </button>
            </div>

            {/* Visual Editor Tab */}
            {activeTab === "visual" && (
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
                            onClick={() => removeChart(index)}
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
                            onChange={(e) =>
                              updateChart(index, "title", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chart Type
                          </label>
                          <select
                            value={chart.chart_type}
                            onChange={(e) =>
                              updateChart(index, "chart_type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Source
                          </label>
                          <input
                            type="text"
                            value={chart.data_source}
                            onChange={(e) =>
                              updateChart(index, "data_source", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateChart(index, "x_axis.field", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateChart(index, "x_axis.label", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateChart(index, "y_axis.field", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateChart(index, "y_axis.label", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addChart}
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
            )}

            {/* JSON Editor Tab */}
            {activeTab === "json" && (
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
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      Chart Configuration Array
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          isValidJson()
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isValidJson() ? "Valid" : "Invalid"}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Define chart configurations as a JSON array. Each object
                      represents a chart with properties like chart_type, title,
                      data_source, x_axis, and y_axis.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={formatJson}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Format
                    </button>
                    <button
                      type="button"
                      onClick={minifyJson}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Minify
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {showPreview ? (
                        <>
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.121 14.121L15.536 15.536M14.121 14.121L12.707 12.707M14.121 14.121l-1.414-1.414"
                            />
                          </svg>
                          Hide
                        </>
                      ) : (
                        <>
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Preview
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearJson}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden rounded-l">
                    {jsonContent.split("\n").map((_, index) => (
                      <div
                        key={index}
                        className="px-2 leading-6 text-right min-h-[24px]"
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={jsonContent}
                    onChange={(e) => {
                      setJsonContent(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        if (Array.isArray(parsed)) {
                          setCharts(parsed);
                        }
                      } catch (error) {
                        // Invalid JSON, don't update charts
                      }
                    }}
                    className={`w-full h-64 pl-14 pr-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-none ${
                      isValidJson()
                        ? "border-gray-300 focus:border-purple-500"
                        : "border-red-300 focus:border-red-500 focus:ring-red-500"
                    }`}
                    spellCheck={false}
                  />
                </div>

                <div className="flex justify-between items-center mt-3 text-sm">
                  <div>
                    {!isValidJson() && (
                      <span className="text-red-600 flex items-center gap-1">
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {getJsonError()}
                      </span>
                    )}
                    {isValidJson() && (
                      <span className="text-green-600 flex items-center gap-1">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Valid JSON Array
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500">
                    Array({charts.length}) | {jsonContent.length} characters
                  </div>
                </div>
                {showPreview && (
                  <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Preview:
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      {isValidJson() ? (
                        <pre className="text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(JSON.parse(jsonContent), null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">Invalid JSON</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Editor Tab */}
            {activeTab === "form" && (
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
                    onClick={() => {
                      const resetCharts = [
                        {
                          chart_type: "line",
                          title: "Chart 1",
                          data_source: "data_source",
                          x_axis: { field: "x", label: "X-Axis" },
                          y_axis: { field: "y", label: "Y-Axis" },
                        },
                      ];
                      setCharts(resetCharts);
                      setJsonContent(JSON.stringify(resetCharts, null, 2));
                    }}
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
                            onClick={() => removeChart(chartIndex)}
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
                                {typeof value === "object"
                                  ? "object"
                                  : "string"}
                              </span>
                              {charts.length > 1 &&
                                key !== "x_axis" &&
                                key !== "y_axis" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedChart = { ...chart };
                                      delete updatedChart[
                                        key as keyof ChartConfig
                                      ];
                                      updateChart(
                                        chartIndex,
                                        "entireChart",
                                        updatedChart
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
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

                            {typeof value === "object" && value !== null ? (
                              <div className="space-y-2 ml-4">
                                {Object.entries(value as any).map(
                                  ([subKey, subValue]) => (
                                    <div
                                      key={subKey}
                                      className="flex items-center gap-2"
                                    >
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
                                          updateChart(
                                            chartIndex,
                                            `${key}.${subKey}`,
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder={`Enter ${subKey}`}
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="ml-4">
                                {key === "chart_type" ? (
                                  <select
                                    value={String(value)}
                                    onChange={(e) =>
                                      updateChart(
                                        chartIndex,
                                        key,
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                  >
                                    {chartTypes.map((type) => (
                                      <option
                                        key={type}
                                        value={type
                                          .toLowerCase()
                                          .replace(" ", "_")}
                                      >
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <textarea
                                    value={String(value)}
                                    onChange={(e) =>
                                      updateChart(
                                        chartIndex,
                                        key,
                                        e.target.value
                                      )
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
                    onClick={addChart}
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
            )}

            {/* Tree View Tab */}
            {activeTab === "tree" && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartConfiguration;

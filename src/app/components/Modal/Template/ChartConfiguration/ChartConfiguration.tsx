'use client';

import React, { useState } from "react";
import { ChartConfigurationProps, ChartConfig } from "@/app/components/Templates/types/templates";
import { VisualEditor } from "./VisualEditor";
import { JsonEditor } from "./JsonEditor";
import { FormEditor } from "./FormEditor";
import { TreeView } from "./TreeView";

const ChartConfiguration: React.FC<ChartConfigurationProps> = ({
  isExpanded = true,
  onToggle,
  config,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "json" | "form" | "tree">("visual");
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      chart_type: "line",
      title: "Chart 1",
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

  React.useEffect(() => {
    if (config) {
      setCharts(config);
      setJsonContent(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const chartTypes = [
    "Line Chart",
    "Bar Chart", 
    "Pie Chart",
    "Area Chart",
    "Scatter Plot",
    "Histogram",
    "Bubble Chart",
  ];

  const updateChart = (index: number, field: string, value: string | number | boolean) => {
    const updatedCharts = [...charts];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedCharts[index] = {
        ...updatedCharts[index],
        [parent]: {
          ...(updatedCharts[index][parent as keyof ChartConfig] as object),
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

  const resetCharts = () => {
    const defaultCharts = [
      {
        chart_type: "line",
        title: "Chart 1", 
        data_source: "data_source",
        x_axis: { field: "x", label: "X-Axis" },
        y_axis: { field: "y", label: "Y-Axis" },
      },
    ];
    setCharts(defaultCharts);
    setJsonContent(JSON.stringify(defaultCharts, null, 2));
    onConfigChange?.(defaultCharts);
  };

  const handleJsonChange = (newJsonContent: string) => {
    setJsonContent(newJsonContent);
    try {
      const parsed = JSON.parse(newJsonContent);
      if (Array.isArray(parsed)) {
        setCharts(parsed);
        onConfigChange?.(parsed);
      }
    } catch (error) {
      // Invalid JSON, don't update charts
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white w-full max-w-full">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
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
          <span className="truncate">Chart Configuration</span>
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="text-xs sm:text-sm text-gray-500 hidden xs:block">
            {charts.length} chart{charts.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-500 block xs:hidden">
            {charts.length}
          </span>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transform transition-transform flex-shrink-0 ${
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
          <div className="p-4 sm:p-6 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
              Configure charts for visualizing the analyzed data. Either chart
              configuration or summary configuration is required.
            </p>

            {/* Tab Navigation - Horizontal scrollable design */}
            <div className="border-b border-gray-200 mb-4 sm:mb-6 bg-white rounded-t-lg overflow-hidden">
              <div className="flex overflow-x-auto scrollbar-hide -mb-px">
                <button
                  type="button"
                  onClick={() => setActiveTab("visual")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-0 ${
                    activeTab === "visual"
                      ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  <span className="hidden sm:block">Visual Editor</span>
                  <span className="block sm:hidden">Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-0 ${
                    activeTab === "json"
                      ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  <span className="hidden sm:block">JSON Editor</span>
                  <span className="block sm:hidden">JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-0 ${
                    activeTab === "form"
                      ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  <span className="hidden sm:block">Form Editor</span>
                  <span className="block sm:hidden">Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tree")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-0 ${
                    activeTab === "tree"
                      ? "border-b-2 border-purple-500 text-purple-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  <span className="hidden sm:block">Tree View</span>
                  <span className="block sm:hidden">Tree</span>
                </button>
              </div>
            </div>

            {/* Tab Content - Responsive container */}
            <div className="w-full min-h-0 overflow-auto">
              {activeTab === "visual" && (
                <VisualEditor
                  charts={charts}
                  chartTypes={chartTypes}
                  updateChart={updateChart}
                  addChart={addChart}
                  removeChart={removeChart}
                />
              )}

              {activeTab === "json" && (
                <JsonEditor
                  jsonContent={jsonContent}
                  onJsonChange={handleJsonChange}
                  onReset={resetCharts}
                />
              )}

              {activeTab === "form" && (
                <FormEditor
                  charts={charts}
                  chartTypes={chartTypes}
                  updateChart={updateChart}
                  addChart={addChart}
                  removeChart={removeChart}
                  onReset={resetCharts}
                />
              )}

              {activeTab === "tree" && (
                <TreeView charts={charts} jsonContent={jsonContent} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartConfiguration;
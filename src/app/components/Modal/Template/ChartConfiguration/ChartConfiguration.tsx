"use client";

import React, { useState } from "react";
import {
  ChartConfigurationProps,
  ChartConfig,
} from "@/app/components/Templates/types/templates";
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
  const [activeTab, setActiveTab] = useState<
    "visual" | "json" | "form" | "tree"
  >("visual");
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
      if (Array.isArray(config)) {
        setCharts(config);
      } else {
        setCharts([config]);
      }
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

  const updateChart = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
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

  const tabs = [
    {
      id: "visual",
      label: "Visual Editor",
      shortLabel: "Visual",
      icon: (
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
      ),
    },
    {
      id: "json",
      label: "JSON Editor",
      shortLabel: "JSON",
      icon: (
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
      ),
    },
    {
      id: "form",
      label: "Form Editor",
      shortLabel: "Form",
      icon: (
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
      ),
    },
    {
      id: "tree",
      label: "Tree View",
      shortLabel: "Tree",
      icon: (
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
      ),
    },
  ];

  return (
    <div className="w-full max-w-full">
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200">
        {/* Header */}
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-slate-50 transition-colors group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls="chart-config-content"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
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
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                Chart Configuration
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure charts for data visualization
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {charts.length} chart{charts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="sm:hidden">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {charts.length}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${
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
          <div id="chart-config-content" className="border-t border-slate-200">
            <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100/50">
              <div className="mb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Configure charts for visualizing the analyzed data. Use the tabs below to switch between different editing modes.
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 min-w-0 border-b-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset ${
                        activeTab === tab.id
                          ? "border-purple-500 text-purple-600 bg-purple-50"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                      aria-selected={activeTab === tab.id}
                      role="tab"
                    >
                      {tab.icon}
                      <span className="hidden sm:block">{tab.label}</span>
                      <span className="block sm:hidden">{tab.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="w-full">
                <div
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  role="tabpanel"
                  aria-labelledby={`tab-${activeTab}`}
                >
                  <div className="p-4 md:p-6">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartConfiguration;
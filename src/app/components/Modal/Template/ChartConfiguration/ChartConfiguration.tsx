'use client';

import React, { useState } from "react";
import { ChartConfig, ChartConfigurationProps, TabType } from '../../../../types/templates';
import { createDefaultChart, DEFAULT_CHART } from '../../../../constants/templates';
import { 
  isValidJson, 
  formatJson, 
  minifyJson, 
  updateChartField, 
  copyToClipboard, 
  downloadJson, 
  uploadJsonFile 
} from '../../../../utils/templates';
import ChartHeader from './ChartHeader';
import ActionButtons from './ActionButtons';
import TabNavigation from './TabNavigation';
import VisualEditor from './VisualEditor';
import JsonEditor from './JsonEditor';
import FormEditor from './FormEditor';
import TreeView from './TreeView';

const ChartConfiguration: React.FC<ChartConfigurationProps> = ({
  isExpanded = true,
  onToggle,
  onConfigChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("visual");
  const [showPreview, setShowPreview] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([DEFAULT_CHART]);
  const [jsonContent, setJsonContent] = useState<string>(
    JSON.stringify([DEFAULT_CHART], null, 2)
  );

  const updateCharts = (newCharts: ChartConfig[]) => {
    setCharts(newCharts);
    setJsonContent(JSON.stringify(newCharts, null, 2));
    onConfigChange?.(newCharts);
  };

  const updateChart = (index: number, field: string, value: any) => {
    const updatedCharts = updateChartField(charts, index, field, value);
    updateCharts(updatedCharts);
  };

  const addChart = () => {
    const newChart = createDefaultChart(charts.length + 1);
    const updatedCharts = [...charts, newChart];
    updateCharts(updatedCharts);
  };

  const removeChart = (index: number) => {
    const updatedCharts = charts.filter((_, i) => i !== index);
    updateCharts(updatedCharts);
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setCharts(parsed);
        onConfigChange?.(parsed);
      }
    } catch {
      // Invalid JSON, don't update charts
    }
  };

  const handleFormatJson = () => {
    const formatted = formatJson(jsonContent);
    setJsonContent(formatted);
    try {
      const parsed = JSON.parse(formatted);
      setCharts(parsed);
    } catch {
      // Handle error
    }
  };

  const handleMinifyJson = () => {
    const minified = minifyJson(jsonContent);
    setJsonContent(minified);
  };

  const handleCopyJson = async () => {
    await copyToClipboard(jsonContent);
  };

  const handleDownloadJson = () => {
    downloadJson(jsonContent);
  };

  const handleUploadJson = async () => {
    const content = await uploadJsonFile();
    if (content) {
      setJsonContent(content);
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setCharts(parsed);
          onConfigChange?.(parsed);
        }
      } catch {
        console.error("Invalid JSON file");
      }
    }
  };

  const handleResetJson = () => {
    const defaultCharts = [DEFAULT_CHART];
    updateCharts(defaultCharts);
  };

  const handleClearJson = () => {
    setJsonContent("[]");
    setCharts([]);
    onConfigChange?.([]);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <ChartHeader 
        isExpanded={isExpanded}
        chartsLength={charts.length}
        onToggle={onToggle}
      />

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">
              Configure charts for visualizing the analyzed data. Either chart
              configuration or summary configuration is required.
            </p>

            {/* Action buttons - only show for non-visual tabs */}
            {activeTab !== "visual" && (
              <ActionButtons
                onCopy={handleCopyJson}
                onDownload={handleDownloadJson}
                onUpload={handleUploadJson}
                onReset={handleResetJson}
              />
            )}

            {/* Tab Navigation */}
            <TabNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === "visual" && (
              <VisualEditor
                charts={charts}
                onUpdateChart={updateChart}
                onRemoveChart={removeChart}
                onAddChart={addChart}
              />
            )}

            {activeTab === "json" && (
              <JsonEditor
                jsonContent={jsonContent}
                chartsLength={charts.length}
                showPreview={showPreview}
                onJsonChange={handleJsonChange}
                onFormat={handleFormatJson}
                onMinify={handleMinifyJson}
                onClear={handleClearJson}
                onTogglePreview={() => setShowPreview(!showPreview)}
              />
            )}

            {activeTab === "form" && (
              <FormEditor
                charts={charts}
                onUpdateChart={updateChart}
                onRemoveChart={removeChart}
                onAddChart={addChart}
                onReset={handleResetJson}
              />
            )}

            {activeTab === "tree" && (
              <TreeView
                charts={charts}
                jsonContent={jsonContent}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartConfiguration;
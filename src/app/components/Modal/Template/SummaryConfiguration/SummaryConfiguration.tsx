import React, { useState } from 'react';
import { SummaryConfig, SummaryConfigurationProps, TabType } from '../../../../types/summary';
import { DEFAULT_SUMMARY_CONFIG,DEFAULT_FILENAME} from '../../../../constants/summary';
import {
  copyToClipboard,
  downloadJson,
  uploadJsonFile,
  

} from '../../../../utils/summary';

// Import the split components
import TabNavigation from './TabNavigation';
import ActionButtons from './ActionButtons';
import VisualEditor from './VisualEditor';
import JsonEditor from './JsonEditor';
import FormEditor from './FormEditor';
import TreeView from './TreeView';

const SummaryConfiguration: React.FC<SummaryConfigurationProps> = ({
  isExpanded,
  onToggle,
  onConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [summaryConfig, setSummaryConfig] = useState<SummaryConfig>(DEFAULT_SUMMARY_CONFIG);
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(DEFAULT_SUMMARY_CONFIG, null, 2)
  );

  // Sync visual editor changes to JSON
  const updateJsonFromVisual = (newConfig: SummaryConfig) => {
    setSummaryConfig(newConfig);
    setJsonContent(JSON.stringify(newConfig, null, 2));
    onConfigChange(newConfig);
  };

  // Sync JSON changes to visual editor
  const updateVisualFromJson = (jsonString: string) => {
    setJsonContent(jsonString);
    try {
      const parsed = JSON.parse(jsonString);
      setSummaryConfig(parsed);
      onConfigChange(parsed);
    } catch (error) {
      // Invalid JSON - don't update visual editor
      onConfigChange(null);
    }
  };

  const handleCopyJson = async () => {
    const success = await copyToClipboard(jsonContent);
    if (!success) {
      console.error('Failed to copy JSON');
    }
  };

  const handleDownloadJson = () => {
    downloadJson(jsonContent, DEFAULT_FILENAME);
  };

  const handleUploadJson = async () => {
    const content = await uploadJsonFile();
    if (content) {
      updateVisualFromJson(content);
    } else {
      console.error('Invalid JSON file');
    }
  };

  const handleResetConfig = () => {
    updateJsonFromVisual(DEFAULT_SUMMARY_CONFIG);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Summary Configuration
        </h3>
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
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">
              Configure how analysis summaries will be generated. Either chart configuration or summary 
              configuration is required.
            </p>

            {/* Action Buttons - shown for non-visual tabs */}
            <ActionButtons
              activeTab={activeTab}
              onCopyJson={handleCopyJson}
              onDownloadJson={handleDownloadJson}
              onUploadJson={handleUploadJson}
              onResetConfig={handleResetConfig}
            />

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {activeTab === 'visual' && (
              <VisualEditor
                summaryConfig={summaryConfig}
                onConfigChange={updateJsonFromVisual}
              />
            )}

            {activeTab === 'json' && (
              <JsonEditor
                jsonContent={jsonContent}
                onJsonChange={updateVisualFromJson}
              />
            )}

            {activeTab === 'form' && (
              <FormEditor
                jsonContent={jsonContent}
                onJsonChange={updateVisualFromJson}
                onResetConfig={handleResetConfig}
              />
            )}

            {activeTab === 'tree' && (
              <TreeView
                jsonContent={jsonContent}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryConfiguration;
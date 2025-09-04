import React, { useState } from 'react';
import VisualEditor from './VisualEditor';
import JsonEditor from './JsonEditor';
import FormEditor from './FormEditor';
import TreeView from './TreeView';

interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}

interface SummaryConfigurationProps {
  isExpanded: boolean;
  onToggle: () => void;
  config: any;
  onConfigChange: (config: SummaryConfig | null) => void;
}

type TabType = 'visual' | 'json' | 'form' | 'tree';

const SummaryConfiguration: React.FC<SummaryConfigurationProps> = ({
  isExpanded,
  onToggle,
  config,
  onConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('visual');

  const [summaryConfig, setSummaryConfig] = useState<SummaryConfig>({
    summary_type: "executive",
    sections: ["overview", "key_metrics"],
    metrics_to_highlight: ["total_customers", "average_wait_time"],
    format: "markdown",
    include_recommendations: true
  });

  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(summaryConfig, null, 2)
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

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy JSON');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary-configuration.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content); // Validate JSON
            updateVisualFromJson(content);
          } catch (error) {
            console.error('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetConfig = () => {
    const defaultConfig: SummaryConfig = {
      summary_type: "executive",
      sections: ["overview", "key_metrics"],
      metrics_to_highlight: ["total_customers", "average_wait_time"],
      format: "markdown",
      include_recommendations: true
    };
    updateJsonFromVisual(defaultConfig);
  };

  React.useEffect(() => {
    if (config) {
      setSummaryConfig(config);
      setJsonContent(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const tabs = [
    {
      id: 'visual',
      label: 'Visual Editor',
      shortLabel: 'Visual',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'json',
      label: 'JSON Editor',
      shortLabel: 'JSON',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      id: 'form',
      label: 'Form Editor',
      shortLabel: 'Form',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'tree',
      label: 'Tree View',
      shortLabel: 'Tree',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visual':
        return (
          <VisualEditor
            summaryConfig={summaryConfig}
            onConfigChange={updateJsonFromVisual}
          />
        );
      case 'json':
        return (
          <JsonEditor
            jsonContent={jsonContent}
            onJsonChange={updateVisualFromJson}
            onCopy={copyJson}
            onDownload={downloadJson}
            onUpload={uploadJson}
            onReset={resetConfig}
          />
        );
      case 'form':
        const formConfig = (() => {
          try {
            return JSON.parse(jsonContent);
          } catch {
            return {};
          }
        })();
        return (
          <FormEditor
            config={formConfig}
            onConfigChange={updateVisualFromJson}
          />
        );
      case 'tree':
        return (
          <TreeView
            jsonContent={jsonContent}
            onCopy={copyJson}
            onDownload={downloadJson}
            onUpload={uploadJson}
            onReset={resetConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 lg:p-6 text-left hover:bg-gray-50 transition-all duration-200"
      >
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-3 flex-1 min-w-0">
          <svg
            className="w-5 h-5 text-orange-600 flex-shrink-0"
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
          <span className="truncate">Summary Configuration</span>
        </h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 flex-shrink-0 ml-3 ${
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
          <div className="p-4 lg:p-6 bg-gray-50">
            {/* Description */}
            <p className="text-sm text-gray-600 mb-6">
              Configure how analysis summaries will be generated. Either chart configuration or summary
              configuration is required.
            </p>

            {/* Responsive Tabs - Mobile: Segmented Control Style */}
            <div className="mb-6">
              {/* Mobile: Improved Tab Selector */}
              <div className="block md:hidden">
                <div className="bg-white border border-gray-200 rounded-lg p-1 grid grid-cols-2 gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-xs">{tab.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tablet and Desktop: Enhanced Tab Bar */}
              <div className="hidden md:flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'
                    } ${index !== tabs.length - 1 ? 'border-r border-gray-200' : ''}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryConfiguration;
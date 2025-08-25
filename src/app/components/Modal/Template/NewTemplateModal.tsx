import React, { useState } from "react";
import MetricStructureEditor from "./MetricStructureEditor";
import ChartConfiguration from "./ChartConfiguration";
import SummaryConfiguration from "./SummaryConfiguration";
import TemplateApiService from "@/helpers/service/templates/template-api-service";

interface FormData {
  templateName: string;
  description: string;
  analysisPrompt: string;
  makePublic: boolean;
}

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

interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: any;
  onSubmit: (data: FormData & {
    metricStructure: string;
    chartConfiguration?: ChartConfig[];
    summaryConfiguration?: SummaryConfig;
  }) => void;
}

const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  refresh
}) => {
  const templateApiService: TemplateApiService = new TemplateApiService();

  const [formData, setFormData] = useState<FormData>({
    templateName: "",
    description: "",
    analysisPrompt: "",
    makePublic: false,
  });

  const [jsonContent, setJsonContent] = useState(`{
  "total_customers": "integer",
  "average_wait_time": "float",
  "peak_hours": "array",
  "satisfaction_score": "float"
}`);

  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [summaryConfig, setSummaryConfig] = useState<SummaryConfig | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    metricStructure: true,
    chartConfiguration: false,
    summaryConfiguration: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        template_name: formData.templateName,
        description: formData.description,
        tags: [], // you can add tag input later
        version: "1.0.0",
        analysis_prompt: formData.analysisPrompt,
        metric_structure: JSON.parse(jsonContent),  // JSON structure
        chart_config: chartConfigs.length > 0 ? chartConfigs : [],
        summary_config: summaryConfig || null,
        gui_config: {
          layout_type: "dashboard",
          theme: "light",
          components: [],
          responsive_breakpoints: {},
          custom_css: "",
        },
        is_public: formData.makePublic,
      };

      await templateApiService.createTemplate(payload);
      refresh()
      onClose();
      // Reset form
      setFormData({
        templateName: "",
        description: "",
        analysisPrompt: "",
        makePublic: false,
      });
      setJsonContent(`{
  "total_customers": "integer",
  "average_wait_time": "float",
  "peak_hours": "array",
  "satisfaction_score": "float"
}`);
      setChartConfigs([]);
      setSummaryConfig(null);
      setExpandedSections({
        metricStructure: true,
        chartConfiguration: false,
        summaryConfiguration: false,
      });
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getObjectProperties = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      return Object.keys(parsed).length;
    } catch {
      return 0;
    }
  };

  const isValidJson = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const isFormValid = () => {
    return (
      formData.templateName.trim().length >= 3 &&
      formData.description.trim().length >= 10 &&
      formData.analysisPrompt.trim().length >= 20 &&
      isValidJson() &&
      getObjectProperties() > 0
    );
  };

  const handleChartConfigChange = (configs: ChartConfig[]) => {
    setChartConfigs(configs);
  };

  const handleSummaryConfigChange = (config: SummaryConfig | null) => {
    setSummaryConfig(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-xl z-10">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Analytics Template
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Define metrics and analysis parameters for your video content
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Template Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-teal-600"
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
                Template Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Customer Flow Analysis, Security Monitoring..."
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData({ ...formData, templateName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                    minLength={3}
                    required
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {formData.templateName.length}/50 characters
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe what this template analyzes and how it will be used..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none h-24 resize-none transition-colors"
                    minLength={10}
                    required
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                    <span>Minimum 10 characters</span>
                    <span>{formData.description.length} characters</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide detailed instructions for AI analysis. For example: 'Analyze customer behavior patterns, count people entering and leaving, measure wait times at service counters...'"
                    value={formData.analysisPrompt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        analysisPrompt: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none h-32 resize-none transition-colors"
                    minLength={20}
                    required
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                    <span>
                      Detailed instructions for the AI analysis engine
                    </span>
                    <span>{formData.analysisPrompt.length} characters</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="makePublic"
                      checked={formData.makePublic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          makePublic: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                    />
                    <label
                      htmlFor="makePublic"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684zm0-9.368l6.632-3.316"
                        />
                      </svg>
                      Make this template available to other users
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Structure */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections({
                    ...expandedSections,
                    metricStructure: !expandedSections.metricStructure,
                  })
                }
                className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-600"
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
                  Metric Structure
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                    Required
                  </span>
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.metricStructure ? "rotate-180" : ""
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

              <MetricStructureEditor
                jsonContent={jsonContent}
                setJsonContent={setJsonContent}
                isExpanded={expandedSections.metricStructure}
              />
            </div>

            {/* Chart Configuration */}
            <ChartConfiguration
              isExpanded={expandedSections.chartConfiguration}
              onToggle={() =>
                setExpandedSections({
                  ...expandedSections,
                  chartConfiguration: !expandedSections.chartConfiguration,
                })
              }
              onConfigChange={handleChartConfigChange}
            />

            {/* Summary Configuration */}
            <SummaryConfiguration
              isExpanded={expandedSections.summaryConfiguration}
              onToggle={() =>
                setExpandedSections({
                  ...expandedSections,
                  summaryConfiguration: !expandedSections.summaryConfiguration,
                })
              }
              onConfigChange={handleSummaryConfigChange}
            />
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-6 -mb-6 rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {isFormValid() ? (
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
                    Template is ready to create
                  </span>
                ) : (
                  <span>Please complete all required fields</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
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
                      Creating...
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTemplateModal;
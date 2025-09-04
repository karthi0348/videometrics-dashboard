import React, { useEffect, useState } from "react";
import MetricStructureEditor from "./MetricStructureEditor";
import ChartConfiguration from "./ChartConfiguration/ChartConfiguration";
import SummaryConfiguration from "./SummaryConfiguration/SummaryConfiguration";
import TemplateApiService from "@/helpers/service/templates/template-api-service";
import ErrorHandler from "@/helpers/ErrorHandler";
import { FormData, ChartConfig, SummaryConfig, } from "@/app/components/Templates/types/templates";

interface EditTemplateModalProps {
  isEditOpen: boolean;
  onClose: () => void;
  refresh: any;
  id: any;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isEditOpen,
  onClose,
  id,
  refresh,
}) => {
  const templateApiService: TemplateApiService = new TemplateApiService();

  const [formData, setFormData] = useState<FormData>({
    templateName: "",
    description: "",
    tags: [],
    analysisPrompt: "",
    makePublic: false,
  });

  const [tagInput, setTagInput] = useState("");

  const [jsonContent, setJsonContent] = useState(`{
  "total_customers": "integer",
  "average_wait_time": "float",
  "peak_hours": "array",
  "satisfaction_score": "float"
}`);

  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [summaryConfig, setSummaryConfig] = useState<SummaryConfig | null>(
    null
  );

  const [expandedSections, setExpandedSections] = useState({
    metricStructure: true,
    chartConfiguration: false,
    summaryConfiguration: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData({ ...formData, tags: [...formData.tags, tag] });
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse metric structure only if it's valid JSON, otherwise use null
      let metricStructure = null;
      if (jsonContent.trim() && isValidJson()) {
        metricStructure = JSON.parse(jsonContent);
      }

      const payload = {
        template_name: formData.templateName,
        description: formData.description,
        tags: formData.tags,
        version: "1.0.0",
        analysis_prompt: formData.analysisPrompt,
        metric_structure: metricStructure, // Can be null now
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

      await templateApiService.editTemplate(id, payload);
      refresh();
      onClose();
      // Reset form
      setFormData({
        templateName: "",
        description: "",
        tags: [],
        analysisPrompt: "",
        makePublic: false,
      });
      setTagInput("");
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
    } catch (error: any) {
      return ErrorHandler(error);
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
    if (!jsonContent.trim()) return true; // Empty content is valid (optional)
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
      isValidJson() // Only check if JSON is valid, not if it exists
    );
  };

  const handleChartConfigChange = (configs: ChartConfig[]) => {
    setChartConfigs(configs);
  };

  const handleSummaryConfigChange = (config: SummaryConfig | null) => {
    setSummaryConfig(config);
  };

  const getAllTemplate = async () => {
    try {
      let result = await templateApiService.getAllTemplateById(id);
      setTemplates(result);
    } catch (error: any) {
      return ErrorHandler(error);
    }
  };

  const setTemplates = (data: any) => {
    setFormData({
      templateName: data.template_name || "",
      description: data.description || "",
      tags: data.tags || [],
      analysisPrompt: data.analysis_prompt || "",
      makePublic: data.is_public || false,
    });

    // Set metric structure as JSON string - can be empty now
    setJsonContent(
      data.metric_structure
        ? JSON.stringify(data.metric_structure, null, 2)
        : "" // Empty string instead of default structure
    );

    // Set chart config (if null, use empty array)
    setChartConfigs(data.chart_config || []);

    // Set summary config (if null, use null)
    setSummaryConfig(data.summary_config || null);
  };

  useEffect(() => {
    if (isEditOpen && id) {
      getAllTemplate();
    }
  }, [isEditOpen, id]);

  if (!isEditOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl sm:ml-0 md:ml-32 lg:ml-64">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg sm:rounded-t-xl z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Edit Analytics Template
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Define metrics and analysis parameters for your video content
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="self-start sm:self-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Template Information */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600"
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
                <span className="text-sm sm:text-base lg:text-lg">Template Information</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Customer Flow Analysis, Security Monitoring..."
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData({ ...formData, templateName: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                    minLength={3}
                    required
                  />
                  <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
                    {formData.templateName.length}/50 characters
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe what this template analyzes and how it will be used..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none h-20 sm:h-24 resize-none transition-colors"
                    minLength={10}
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 mt-1 gap-1 sm:gap-0">
                    <span>Minimum 10 characters</span>
                    <span>{formData.description.length} characters</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="E.g., retail, queue, analytics"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Press Enter or comma to add tags
                    </div>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-teal-100 text-teal-700 text-xs sm:text-sm rounded-full"
                        >
                          <span className="truncate max-w-[100px] sm:max-w-none">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-teal-500 hover:text-teal-700 focus:outline-none flex-shrink-0"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none h-24 sm:h-32 resize-none transition-colors"
                    minLength={20}
                    required
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-gray-500 mt-1 gap-1 sm:gap-0">
                    <span className="hidden sm:block">
                      Detailed instructions for the AI analysis engine
                    </span>
                    <span className="sm:hidden">AI analysis instructions</span>
                    <span>{formData.analysisPrompt.length} characters</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
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
                      <svg
                        className="w-4 h-4 text-blue-600 flex-shrink-0"
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
                    </div>
                    <label
                      htmlFor="makePublic"
                      className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Make this template available to other users
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Structure */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedSections({
                    ...expandedSections,
                    metricStructure: !expandedSections.metricStructure,
                  })
                }
                className="flex items-center justify-between w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600"
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
                  <span className="text-sm sm:text-base lg:text-lg">Metric Structure</span>
                  <span className="text-xs sm:text-sm text-gray-500 font-normal">
                    (Optional)
                  </span>
                </h3>
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transform transition-transform ${
                    expandedSections.metricStructure ? "rotate-180" : ""
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
              config={chartConfigs}
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
              config={summaryConfig}
              onConfigChange={handleSummaryConfigChange}
            />
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 lg:p-6 mt-4 sm:mt-6 lg:mt-8 -mx-3 sm:-mx-4 lg:-mx-6 -mb-3 sm:-mb-4 lg:-mb-6 rounded-b-lg sm:rounded-b-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                {isFormValid() ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
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
                    Template is ready to update
                  </span>
                ) : (
                  <span>Please complete all required fields</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 animate-spin"
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
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
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
                      <span>Update Template</span>
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

export default EditTemplateModal;
import React, { useState } from "react";
import MetricStructureEditor from "./MetricStructureEditor";
import ChartConfiguration from "./ChartConfiguration/ChartConfiguration";
import SummaryConfiguration from "./SummaryConfiguration/SummaryConfiguration";
import TemplateApiService from "@/helpers/service/templates/template-api-service";
import ErrorHandler from "@/helpers/ErrorHandler";
import { AxiosError } from "axios";
import { FormData, ChartConfig, SummaryConfig } from "@/app/components/Templates/types/templates";

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void; 
}

// Define error response interface
interface ErrorResponse {
  message?: string;
  error?: {
    message?: string;
  };
  detail?: string;
}

const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
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

      await templateApiService.createTemplate(payload);
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
    } catch (error: unknown) { 
      // Type guard to check if error is an AxiosError
      if (error instanceof AxiosError) {
        return ErrorHandler(error as AxiosError<ErrorResponse>);
      }
      // Handle non-Axios errors
      console.error('Unexpected error:', error);
      // You could also show a generic error message here
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl ml-0 sm:ml-64 border border-gray-200/50">
        
        {/* Decorative Header Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500 rounded-t-2xl"></div>

        {/* Enhanced Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/70 rounded-t-2xl z-10 mt-2">
          <div className="flex justify-between items-start p-4 sm:p-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Create Analytics Template
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-2 pr-2 font-medium">
                Define metrics and analysis parameters for your video content
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="group p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 flex-shrink-0 hover:shadow-sm"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform"
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
          {/* Subtle gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-4 sm:mx-8"></div>
        </div>

        {/* Enhanced Modal Content with better scrolling */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            <div className="space-y-6 sm:space-y-10">
              
              {/* Enhanced Template Information Section */}
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700"
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
                  </div>
                  <span className="text-base sm:text-lg">Template Information</span>
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                  
                  {/* Enhanced Template Name Field */}
                  <div className="space-y-3">
                    <label className="block text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                      Template Name 
                      <span className="text-red-500 font-bold text-lg">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="e.g., Customer Flow Analysis, Security Monitoring..."
                        value={formData.templateName}
                        onChange={(e) =>
                          setFormData({ ...formData, templateName: e.target.value })
                        }
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 text-sm sm:text-base font-medium bg-white hover:border-gray-300 shadow-sm"
                        minLength={3}
                        required
                      />
                      <div className={`absolute top-3 right-4 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        formData.templateName.length >= 3 
                          ? 'bg-green-100 text-green-700' 
                          : formData.templateName.length > 0 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {formData.templateName.length}/50
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Description Field */}
                  <div className="space-y-3">
                    <label className="block text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                      Description 
                      <span className="text-red-500 font-bold text-lg">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Describe what this template analyzes and how it will be used..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none h-28 sm:h-32 resize-none transition-all duration-200 text-sm sm:text-base bg-white hover:border-gray-300 shadow-sm"
                        minLength={10}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Minimum 10 characters</span>
                      <span className={`font-bold px-2 py-1 rounded-full ${
                        formData.description.length >= 10 
                          ? 'bg-green-100 text-green-700' 
                          : formData.description.length > 0 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {formData.description.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Tags Field */}
                  <div className="space-y-3">
                    <label className="block text-sm sm:text-base font-semibold text-gray-800">
                      Tags (comma separated)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="E.g., retail, queue, analytics"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all duration-200 text-sm sm:text-base bg-white hover:border-gray-300 shadow-sm"
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center">
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                          Press Enter or comma
                        </div>
                      </div>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="group inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 text-xs sm:text-sm rounded-full font-semibold shadow-sm hover:shadow-md transition-all"
                          >
                            <span className="truncate max-w-[120px] sm:max-w-none">{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-teal-600 hover:text-red-500 hover:bg-white/50 rounded-full p-1 transition-all flex-shrink-0"
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

                  {/* Enhanced Analysis Prompt Field */}
                  <div className="space-y-3">
                    <label className="block text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                      Analysis Prompt 
                      <span className="text-red-500 font-bold text-lg">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Provide detailed instructions for AI analysis. For example: 'Analyze customer behavior patterns, count people entering and leaving, measure wait times at service counters...'"
                        value={formData.analysisPrompt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            analysisPrompt: e.target.value,
                          })
                        }
                        className="w-full px-4 py-4 sm:px-6 sm:py-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none h-32 sm:h-40 resize-none transition-all duration-200 text-sm sm:text-base bg-white hover:border-gray-300 shadow-sm"
                        minLength={20}
                        required
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm gap-2 sm:gap-0">
                      <span className="text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                        Detailed instructions for the AI analysis engine
                      </span>
                      <span className={`font-bold px-2 py-1 rounded-full ${
                        formData.analysisPrompt.length >= 20 
                          ? 'bg-green-100 text-green-700' 
                          : formData.analysisPrompt.length > 0 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {formData.analysisPrompt.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Public Checkbox */}
                  <div className="mt-2">
                    <div className="flex items-start gap-4 p-4 sm:p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-colors shadow-sm">
                      <div className="relative">
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
                          className="w-5 h-5 text-teal-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-teal-500 focus:ring-2 transition-all shadow-sm"
                        />
                      </div>
                      <label
                        htmlFor="makePublic"
                        className="text-sm sm:text-base font-semibold text-gray-800 flex items-start gap-3 cursor-pointer flex-1"
                      >
                        <div className="p-1.5 bg-blue-200 rounded-lg flex-shrink-0 mt-0.5 sm:mt-0">
                          <svg
                            className="w-4 h-4 text-blue-700"
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
                        <span className="leading-relaxed">Make this template available to other users</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Metric Structure Section */}
              <div className="bg-white border-2 border-gray-200/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSections({
                      ...expandedSections,
                      metricStructure: !expandedSections.metricStructure,
                    })
                  }
                  className="flex items-center justify-between w-full p-6 sm:p-8 text-left hover:bg-gray-50/70 transition-colors group"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl group-hover:scale-110 transition-transform">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700"
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
                    <span className="text-base sm:text-lg">Metric Structure</span>
                    <span className="text-sm sm:text-base text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <svg
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${
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

              {/* Enhanced Chart Configuration */}
              <ChartConfiguration
                isExpanded={expandedSections.chartConfiguration}
                onToggle={() => setExpandedSections({
                  ...expandedSections,
                  chartConfiguration: !expandedSections.chartConfiguration,
                })}
                onConfigChange={handleChartConfigChange} 
                config={chartConfigs}            
              />

              {/* Enhanced Summary Configuration */}
              <SummaryConfiguration
                isExpanded={expandedSections.summaryConfiguration}
                onToggle={() => setExpandedSections({
                  ...expandedSections,
                  summaryConfiguration: !expandedSections.summaryConfiguration,
                })}
                onConfigChange={handleSummaryConfigChange} 
                config={summaryConfig}            
              />
            </div>
          </form>
        </div>

        {/* Enhanced Modern Form Actions Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-white via-gray-50/80 to-white border-t-2 border-gray-200/70 p-4 sm:p-8 rounded-b-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
            
            {/* Enhanced Status Indicator */}
            <div className="text-sm sm:text-base font-semibold order-2 sm:order-1">
              {isFormValid() ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  <div className="p-1 bg-green-200 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Template is ready to create</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <div className="p-1 bg-amber-200 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span>Please complete all required fields</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>Create Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTemplateModal;
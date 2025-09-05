import React, { useState, useEffect } from "react";
import TemplateApiService from "../../../helpers/service/templates/template-api-service";
import {
  Video,
  Profile,
  SubProfile,
  Template,
  Priority,
  ProcessVideoRequest,
} from "./types/types";

interface ProcessVideoFormProps {
  videos: any;
  profiles: Profile[];
  subProfiles: SubProfile[];
  onProcessVideo: (payload: ProcessVideoRequest) => Promise<void>;
  isProcessing: boolean;
}

const ProcessVideoForm: React.FC<ProcessVideoFormProps> = ({
  videos,
  profiles,
  subProfiles,
  onProcessVideo,
  isProcessing,
}) => {
  // State for form data
  const [selectedVideoId, setSelectedVideoId] = useState<number | "">("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | "">("");
  const [selectedSubProfileId, setSelectedSubProfileId] = useState<number | "">(
    ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [customParameters, setCustomParameters] = useState<string>("{}");

  // State for templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateApiService] = useState(new TemplateApiService());
  const [error, setError] = useState<string>("");

  // Load templates when sub-profile changes
  const loadTemplates = async (subProfileId?: number) => {
    try {
      setError("");

      if (!subProfileId) {
        setTemplates([]);
        return;
      }

      console.log("Loading templates for sub-profile:", subProfileId);

      const assignedTemplates =
        await templateApiService.getAssignedTemplatesBySubProfile(subProfileId);

      console.log("Assigned templates response:", assignedTemplates);

      if (!Array.isArray(assignedTemplates) || assignedTemplates.length === 0) {
        console.log("No templates assigned to this sub-profile");
        setTemplates([]);
        return;
      }

      const templateDetailsPromises = assignedTemplates.map(
        async (item: any) => {
          try {
            console.log("Fetching template details for ID:", item.template_id);
            const templateDetail = await templateApiService.getTemplateById(
              item.template_id
            );
            return templateDetail;
          } catch (error) {
            console.error(
              `Failed to fetch template ${item.template_id}:`,
              error
            );
            return null;
          }
        }
      );

      const templateDetails = await Promise.all(templateDetailsPromises);
      const validTemplates = templateDetails.filter(
        (template) => template !== null
      );

      const transformedTemplates: Template[] = validTemplates.map(
        (template: any, index: number) => ({
          id: Number(template.id) || Date.now() + index,
          name:
            template.template_name ||
            template.name ||
            `Template ${template.id}`,
        })
      );

      console.log("Transformed templates:", transformedTemplates);
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error in loadTemplates:", error);
      setError("Failed to load templates for selected sub-profile");
      setTemplates([]);
    }
  };

  // Effect to load templates when sub-profile changes
  useEffect(() => {
    console.log("Sub-profile selection changed:", selectedSubProfileId);
    if (selectedSubProfileId && typeof selectedSubProfileId === "number") {
      loadTemplates(selectedSubProfileId);
    } else {
      setTemplates([]);
    }
    setSelectedTemplateId("");
  }, [selectedSubProfileId]);

  // Filter sub-profiles based on selected profile
  const availableSubProfiles = subProfiles.filter(
    (subProfile) => subProfile.profile_id === selectedProfileId
  );

  const handleProcessVideo = async () => {
    // Enhanced validation with specific error messages
    const validationErrors: string[] = [];

    if (!selectedVideoId) {
      validationErrors.push("Please select a video");
    }

    if (!selectedProfileId) {
      validationErrors.push("Please select a profile");
    }

    if (!selectedSubProfileId) {
      validationErrors.push("Please select a sub-profile");
    }

    if (!selectedTemplateId) {
      validationErrors.push("Please select a template");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    const video = videos.find((v: any) => v.id === selectedVideoId);
    if (!video) {
      setError("Selected video not found");
      return;
    }

    // Validate video URL exists - check multiple possible URL field names
    const videoUrl = video.url || video.video_url || video.file_url;
    if (!videoUrl) {
      setError("Selected video does not have a valid URL");
      return;
    }

    setError("");

    try {
      let parsedCustomParameters = {};
      if (customParameters.trim()) {
        try {
          parsedCustomParameters = JSON.parse(customParameters);
        } catch (e) {
          throw new Error("Invalid JSON format in custom parameters");
        }
      }

      // Convert to numbers and validate they're valid positive integers
      const profileId = Number(selectedProfileId);
      const subProfileId = Number(selectedSubProfileId);
      const templateId = Number(selectedTemplateId);

      // Validate all IDs are valid positive numbers
      if (isNaN(profileId) || profileId <= 0) {
        throw new Error("Invalid profile ID");
      }
      if (isNaN(subProfileId) || subProfileId <= 0) {
        throw new Error("Invalid sub-profile ID");
      }
      if (isNaN(templateId) || templateId <= 0) {
        throw new Error("Invalid template ID");
      }

      const payload: ProcessVideoRequest = {
        video_url: videoUrl,
        profile_id: profileId,
        sub_profile_id: subProfileId,
        template_id: templateId,
        priority,
        custom_parameters: parsedCustomParameters,
      };

      console.log("Sending payload:", payload); // Debug log

      await onProcessVideo(payload);

      // Reset form
      setSelectedVideoId("");
      setSelectedProfileId("");
      setSelectedTemplateId("");
      setSelectedSubProfileId("");
      setCustomParameters("{}");
    } catch (error: any) {
      console.error("Error processing video:", error);
      if (error.response?.data?.detail) {
        const validationErrors = error.response.data.detail
          .map((err: any) => `${err.loc.join(".")}: ${err.msg}`)
          .join(", ");
        setError(`Validation error: ${validationErrors}`);
      } else {
        setError(error.message || "Failed to process video. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 text-teal-500 mr-3 flex-shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          Process Video Form
        </h2>
      </div>
      <p className="text-gray-600 text-sm mb-4 sm:mb-6">
        Choose a video to process with the selected analytics profile
      </p>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
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
            <div className="text-red-800 text-sm break-words">{error}</div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Select Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Video *
          </label>
          <select
            value={selectedVideoId}
            onChange={(e) =>
              setSelectedVideoId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm sm:text-base"
            disabled={videos.length === 0}
          >
            <option value="">
              {videos.length === 0
                ? "No videos available"
                : "Select a video"}
            </option>
            {videos.map((video: any) => (
              <option key={video.id} value={video.id}>
                {video.video_name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Profile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Profile *
          </label>
          <select
            value={selectedProfileId}
            onChange={(e) => {
              setSelectedProfileId(
                e.target.value ? Number(e.target.value) : ""
              );
              setSelectedSubProfileId("");
            }}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm sm:text-base"
            disabled={profiles.length === 0}
          >
            <option value="">
              {profiles.length === 0
                ? "No profiles available"
                : "Select a profile"}
            </option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Sub-Profile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Sub-Profile *
          </label>
          <select
            value={selectedSubProfileId}
            onChange={(e) =>
              setSelectedSubProfileId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm sm:text-base"
            disabled={
              !selectedProfileId || availableSubProfiles.length === 0
            }
          >
            <option value="">
              {!selectedProfileId
                ? "Select a profile first"
                : availableSubProfiles.length === 0
                ? "No sub-profiles available"
                : "Select a sub-profile"}
            </option>
            {availableSubProfiles.map((subProfile) => (
              <option key={subProfile.id} value={subProfile.id}>
                {subProfile.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template *
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) =>
              setSelectedTemplateId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm sm:text-base"
            disabled={!selectedSubProfileId || templates.length === 0}
          >
            <option value="">
              {!selectedSubProfileId
                ? "Select a sub-profile first"
                : templates.length === 0
                ? "No templates assigned to this sub-profile"
                : "Select a template"}
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm sm:text-base"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Custom Parameters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Parameters (JSON)
          </label>
          <textarea
            value={customParameters}
            onChange={(e) => setCustomParameters(e.target.value)}
            placeholder='{"key": "value"}'
            rows={3}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm resize-y min-h-[80px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional JSON object for custom processing parameters
          </p>
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcessVideo}
          disabled={
            isProcessing ||
            !selectedVideoId ||
            !selectedProfileId ||
            !selectedSubProfileId ||
            !selectedTemplateId ||
            videos.length === 0 ||
            templates.length === 0
          }
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="whitespace-nowrap">Processing...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z"
                />
              </svg>
              <span className="whitespace-nowrap">Process Video</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProcessVideoForm;
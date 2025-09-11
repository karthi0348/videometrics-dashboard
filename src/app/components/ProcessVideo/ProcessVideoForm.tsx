import React, { useState, useEffect } from "react";
import TemplateApiService from "../../../helpers/service/templates/template-api-service";
import { ArrowRightCircle } from "lucide-react";

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
  const [selectedVideoId, setSelectedVideoId] = useState<number | "">("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | "">("");
  const [selectedSubProfileId, setSelectedSubProfileId] = useState<number | "">(
    ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [customParameters, setCustomParameters] = useState<string>("{}");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateApiService] = useState(new TemplateApiService());
  const [error, setError] = useState<string>("");

  const loadTemplates = async (subProfileId?: number) => {
    try {
      setError("");

      if (!subProfileId) {
        setTemplates([]);
        return;
      }

      const assignedTemplates =
        await templateApiService.getAssignedTemplatesBySubProfile(subProfileId);

      if (!Array.isArray(assignedTemplates) || assignedTemplates.length === 0) {
        setTemplates([]);
        return;
      }

      const templateDetailsPromises = assignedTemplates.map(
        async (item: any) => {
          try {
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

      setTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error in loadTemplates:", error);
      setError("Failed to load templates for selected sub-profile");
      setTemplates([]);
    }
  };

  useEffect(() => {
    if (selectedSubProfileId && typeof selectedSubProfileId === "number") {
      loadTemplates(selectedSubProfileId);
    } else {
      setTemplates([]);
    }
    setSelectedTemplateId("");
  }, [selectedSubProfileId]);

  const availableSubProfiles = subProfiles.filter(
    (subProfile) => subProfile.profile_id === selectedProfileId
  );

  const handleProcessVideo = async () => {
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

      const profileId = Number(selectedProfileId);
      const subProfileId = Number(selectedSubProfileId);
      const templateId = Number(selectedTemplateId);

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

      await onProcessVideo(payload);

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

  const getPriorityLabel = (priorityValue: Priority) => {
    switch (priorityValue) {
      case 'high':
        return "High Priority";
      case 'low':
        return "Low Priority";
      default:
        return "Normal Priority";
    }
  };

  const SelectWrapper: React.FC<{
    children: React.ReactNode;
    disabled?: boolean;
  }> = ({ children, disabled = false }) => (
    <div className="relative">
      {children}
    </div>
  );

  return (
    <div className="relative overflow-hidden">
    <div className="min-h-screen rounded-2xl p-4 sm:p-6 lg:p-8  bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 md:p-6 lg:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mr-4 flex items-center justify-center">
  <ArrowRightCircle className="w-6 h-6 text-white" />
</div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Process Video
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Choose a video to process with analytics profiles
              </p>
            </div>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="text-red-700 text-sm font-medium break-words">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            {/* Select Video */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Select Video *
              </label>
              <SelectWrapper disabled={videos.length === 0}>
                <select
                  value={selectedVideoId}
                  onChange={(e) =>
                    setSelectedVideoId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80 
                    outline-none text-sm sm:text-base transition-all duration-200 appearance-none pr-10
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={videos.length === 0}
                >
                  <option value="">
                    {videos.length === 0 ? "No videos available" : "Select a video"}
                  </option>
                  {videos.map((video: any) => (
                    <option key={video.id} value={video.id}>
                      {video.video_name}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            {/* Select Profile */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Select Profile *
              </label>
              <SelectWrapper disabled={profiles.length === 0}>
                <select
                  value={selectedProfileId}
                  onChange={(e) => {
                    setSelectedProfileId(
                      e.target.value ? Number(e.target.value) : ""
                    );
                    setSelectedSubProfileId("");
                  }}
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 focus:bg-white/80 
                    outline-none text-sm sm:text-base transition-all duration-200 appearance-none pr-10
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={profiles.length === 0}
                >
                  <option value="">
                    {profiles.length === 0 ? "No profiles available" : "Select a profile"}
                  </option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            </div>

            {/* Select Sub-Profile */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Select Sub-Profile *
              </label>
              <SelectWrapper disabled={!selectedProfileId || availableSubProfiles.length === 0}>
                <select
                  value={selectedSubProfileId}
                  onChange={(e) =>
                    setSelectedSubProfileId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/80 
                    outline-none text-sm sm:text-base transition-all duration-200 appearance-none pr-10
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedProfileId || availableSubProfiles.length === 0}
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
              </SelectWrapper>
            </div>

            {/* Select Template */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Select Template *
              </label>
              <SelectWrapper disabled={!selectedSubProfileId || templates.length === 0}>
                <select
                  value={selectedTemplateId}
                  onChange={(e) =>
                    setSelectedTemplateId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-white/80 
                    outline-none text-sm sm:text-base transition-all duration-200 appearance-none pr-10
                    disabled:opacity-50 disabled:cursor-not-allowed"
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
              </SelectWrapper>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Processing Priority
              </label>
              <SelectWrapper>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/80 
                    outline-none text-sm sm:text-base transition-all duration-200 appearance-none pr-10"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </SelectWrapper>
            </div>

            {/* Custom Parameters */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Custom Parameters (JSON)
              </label>
              <div className="relative">
                <textarea
                  value={customParameters}
                  onChange={(e) => setCustomParameters(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="w-full p-3 sm:p-4 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl 
                    focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/80 
                    outline-none font-mono text-sm resize-y min-h-[100px] transition-all duration-200"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                  JSON format
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Optional JSON object for custom processing parameters
              </p>
            </div>

            {/* Process Button */}
            <div className="pt-4">
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
                className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 
                  text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                  disabled:hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center justify-center text-base sm:text-lg">
                  {isProcessing ? (
                    <span>Processing Video...</span>
                  ) : (
                    <span>Process Video</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessVideoForm;

import React, { useState, useEffect } from "react";
import ProcessVideoApiService from "../../../helpers/service/processvideo/ProcessVideoApiservice";
import ProfileApiService from "../../../helpers/service/profile/profile-api-service";
import SubProfileApiService from "../../../helpers/service/subprofile/subprofile-api-service";
import VideoApiService from "../../../helpers/service/video/video-api-service";
import ProcessVideoForm from "./ProcessVideoForm";
import { API_ENDPOINTS } from "../../config/api";

// Import types
import {
  Video,
  Profile,
  SubProfile,
  Template,
  ProcessingVideo,
  Priority,
  ProcessVideoPageProps,
} from "./types/types";

const ProcessVideoPage: React.FC<ProcessVideoPageProps> = ({
  videos: propVideos,
  profiles: propProfiles,
  subProfiles: propSubProfiles,
  templates: propTemplates,
}) => {
  // State for API data
  const [videos, setVideos] = useState<any>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);

  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingVideo[]>([]);

  // Services
  const [apiService] = useState(new ProcessVideoApiService());
  const [videoApiService] = useState(new VideoApiService());
  const [profileApiService] = useState(new ProfileApiService());
  const [subProfileApiService] = useState(new SubProfileApiService());

  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load videos from API
  const loadVideos = async () => {
    try {
      const data = await videoApiService.getAllVideos("");
      setVideos(data);
    } catch (err) {
      console.error("Error loading videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load videos");
    }
  };

  // Load profiles from API
  const loadProfiles = async () => {
    if (propProfiles) {
      setProfiles(propProfiles);
      return;
    }
    try {
      const data = await profileApiService.getAllProfile("");
      const profilesArray = Array.isArray(data)
        ? data
        : data.profiles || data.results || [];

      const transformedProfiles: Profile[] = profilesArray.map((item: any) => ({
        id: Number(item.id) || Date.now(),
        name: item.profile_name || item.name || "Untitled Profile",
        email: item.email || "",
        tag: item.tag || "default",
        contact: item.contact || item.contact_person || "",
        description: item.description || "",
      }));

      setProfiles(transformedProfiles);

      transformedProfiles.forEach((profile) => {
        loadSubProfiles(profile.id);
      });
    } catch (err) {
      console.error("Error loading profiles:", err);
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      setProfiles([]);
    }
  };

  const loadSubProfiles = async (profileId: number) => {
    try {
      const data = await subProfileApiService.getAllSubProfile(profileId, "");
      const subProfilesArray = Array.isArray(data)
        ? data
        : data.subProfiles || [];

      const transformed: SubProfile[] = subProfilesArray.map((item: any, index: number) => ({
        id: Number(item.id) || Date.now() + index, // Add index to ensure uniqueness
        name: item.sub_profile_name || item.name || "Untitled Sub-Profile",
        profile_id: Number(item.profile_id || profileId),
        description: item.description || "",
        areaType: item.area_type || item.areaType || "general",
        isActive:
          item.isActive !== undefined
            ? item.isActive
            : item.is_active !== undefined
              ? item.is_active
              : true,
      }));

      // Filter out duplicates and add new ones
      setSubProfiles((prev) => {
        const existingIds = new Set(prev.map(sp => sp.id));
        const newSubProfiles = transformed.filter(sp => !existingIds.has(sp.id));
        return [...prev, ...newSubProfiles];
      });
    } catch (err) {
      console.error("Error loading sub-profiles:", err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");
      setSubProfiles([]); // Clear sub-profiles before loading
      try {
        loadVideos();
        loadProfiles()
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load initial data"
        );
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Handle video processing
  const handleProcessVideo = async (payload: any) => {
    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.processVideo(payload);

      // Add to processing queue
      const processingVideo: ProcessingVideo = {
        video_id: response.video_id,
        uuid: response.uuid,
        video_name: payload.video_url, // You might want to get the actual video name
        status: response.status,
        estimated_completion: response.estimated_completion,
        priority: response.priority,
      };

      setProcessingQueue((prev) => [...prev, processingVideo]);
      setSuccess(
        `Video has been submitted for processing successfully!`
      );
    } catch (error: any) {
      console.error("Error processing video:", error);
      throw error; // Re-throw so the form can handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAllVideos = () => {
    console.log("Navigate to All Videos");
  };

  const handleViewAnalytics = (uuid: string) => {
    console.log(`Navigate to analytics for UUID: ${uuid}`);
  };

  const removeFromQueue = (uuid: string) => {
    setProcessingQueue((prev) => prev.filter((video) => video.uuid !== uuid));
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Loading Process Video
          </h3>
          <p className="text-gray-600 text-sm text-center">
            Fetching videos, profiles, and templates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-purple-700 ">
                Process Video
              </h1>
              <p className="text-gray-600 mt-1">
                Upload and analyze your videos with powerful AI-driven metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Refresh
              </button>
              <button
                onClick={handleAllVideos}
                className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                All Videos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                Select Video
              </span>
              <svg
                className="w-4 h-4 ml-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                Select Analytics
              </span>
              <svg
                className="w-4 h-4 ml-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                Process
              </span>
              <svg
                className="w-4 h-4 ml-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                View Results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-green-400 mt-0.5 mr-3"
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
                <div className="text-green-800">{success}</div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-3"
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
                <div className="text-red-800">{error}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Process Video Form */}
          <ProcessVideoForm
            videos={videos}
            profiles={profiles}
            subProfiles={subProfiles}
            onProcessVideo={handleProcessVideo}
            isProcessing={isProcessing}
          />

          {/* Processing Queue */}
          <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 text-purple-500 mr-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Processing Queue
              </h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Videos currently being processed
            </p>

            {processingQueue.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-purple-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No videos currently processing
                </h3>
                <p className="text-gray-500 text-sm">
                  Videos being processed will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {processingQueue.map((video) => (
                  <div
                    key={video.uuid}
                    className="border border-purple-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="animate-spin w-5 h-5 mr-3 text-purple-500">
                          <svg fill="none" viewBox="0 0 24 24">
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
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {video.video_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${video.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : video.priority === "low"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-purple-100 text-purple-800"
                            }`}
                        >
                          {video.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      <div>Status: {video.status}</div>
                      <div>
                        Estimated completion: {video.estimated_completion}
                      </div>
                      <div>UUID: {video.uuid}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewAnalytics(video.uuid)}
                        className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-md hover:bg-purple-100 transition-colors"
                      >
                        View Analytics
                      </button>
                      <button
                        onClick={() => removeFromQueue(video.uuid)}
                        className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Remove from Queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessVideoPage;
import React, { useState, useEffect, useCallback } from "react";
import ProcessVideoApiService from "../../../helpers/service/processvideo/ProcessVideoApiservice";
import ProfileApiService from "../../../helpers/service/profile/profile-api-service";
import SubProfileApiService from "../../../helpers/service/subprofile/subprofile-api-service";
import VideoApiService from "../../../helpers/service/video/video-api-service";
import ProcessVideoForm from "./ProcessVideoForm";

// Import types
import {
  Profile,
  SubProfile,
  ProcessingVideo,
  Priority,
  ProcessVideoPageProps,
  AnalyticsVideo,
  AnalyticsResponse,
  ProcessVideoRequest,
  ProcessVideoResponse,
  ProcessedVideoNotification
} from "./types/types";

interface VideoItem {
  id: number;
  video_name: string;
  name?: string;
  title?: string;
  url?: string;
  video_url?: string;
  file_url?: string;
}

// Define profile API response interface
interface ProfileApiResponse {
  id: number | string;
  profile_name?: string;
  name?: string;
  email?: string;
  tag?: string;
  contact?: string;
  contact_person?: string;
  description?: string;
}

// Define sub-profile API response interface
interface SubProfileApiResponse {
  id: number | string;
  sub_profile_name?: string;
  name?: string;
  profile_id?: number;
  description?: string;
  area_type?: string;
  areaType?: string;
  isActive?: boolean;
  is_active?: boolean;
}

// Define error response interfaces
interface ValidationError {
  loc?: string[];
  msg?: string;
  message?: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      detail?: ValidationError[] | string;
      message?: string;
    };
  };
  message?: string;
}

interface ExtendedProcessingVideo extends ProcessingVideo {
  created_at?: string;
}

const ProcessVideoPage: React.FC<ProcessVideoPageProps> = ({
  // Unused props - keeping for interface compatibility but not using
  // videos: propVideos,
  profiles: propProfiles,
  // subProfiles: propSubProfiles,
  // templates: propTemplates,
  onVideoProcessed,
  onRedirectToNextPage,
}) => {
  // State for API data
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);

  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<
    ExtendedProcessingVideo[]
  >([]);

  // State for status polling
  const [pollingInterval, setPollingInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [completedVideos, setCompletedVideos] = useState<
    ProcessedVideoNotification[]
  >([]);

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
  const loadVideos = useCallback(async () => {
    try {
      console.log("Loading videos...");
      const data = await videoApiService.getAllVideos("");
      console.log("Loaded videos:", data);

      const videosArray = Array.isArray(data)
        ? data
        : (data as { videos?: VideoItem[]; results?: VideoItem[] })?.videos || 
          (data as { videos?: VideoItem[]; results?: VideoItem[] })?.results || [];
      setVideos(videosArray);
    } catch (err) {
      console.error("Error loading videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load videos");
      setVideos([]);
    }
  }, [videoApiService]);

  // Load profiles from API
  const loadProfiles = useCallback(async () => {
    if (propProfiles && propProfiles.length > 0) {
      setProfiles(propProfiles);
      for (const profile of propProfiles) {
        await loadSubProfiles(profile.id);
      }
      return;
    }

    try {
      console.log("Loading profiles...");
      const data = await profileApiService.getAllProfile("");
      console.log("Loaded profiles:", data);

      const profilesArray = Array.isArray(data)
        ? data
        : (data as { profiles?: ProfileApiResponse[]; results?: ProfileApiResponse[] })?.profiles || 
          (data as { profiles?: ProfileApiResponse[]; results?: ProfileApiResponse[] })?.results || [];

      const transformedProfiles: Profile[] = profilesArray.map((item: ProfileApiResponse) => ({
        id: Number(item.id) || Date.now(),
        name: item.profile_name || item.name || "Untitled Profile",
        email: item.email || "",
        tag: item.tag || "default",
        contact: item.contact || item.contact_person || "",
        description: item.description || "",
      }));

      setProfiles(transformedProfiles);

      for (const profile of transformedProfiles) {
        await loadSubProfiles(profile.id);
      }
    } catch (err) {
      console.error("Error loading profiles:", err);
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      setProfiles([]);
    }
  }, [propProfiles, profileApiService]);

  const loadSubProfiles = useCallback(async (profileId: number) => {
    try {
      console.log(`Loading sub-profiles for profile ${profileId}...`);
      const data = await subProfileApiService.getAllSubProfile(profileId, "");
      console.log(`Loaded sub-profiles for profile ${profileId}:`, data);

      const subProfilesArray = Array.isArray(data)
        ? data
        : (data as { subProfiles?: SubProfileApiResponse[]; results?: SubProfileApiResponse[] })?.subProfiles || 
          (data as { subProfiles?: SubProfileApiResponse[]; results?: SubProfileApiResponse[] })?.results || [];

      const transformed: SubProfile[] = subProfilesArray.map(
        (item: SubProfileApiResponse, index: number) => ({
          id: Number(item.id) || Date.now() + index,
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
        })
      );

      setSubProfiles((prev) => {
        const existingIds = new Set(prev.map((sp) => sp.id));
        const newSubProfiles = transformed.filter(
          (sp) => !existingIds.has(sp.id)
        );
        return [...prev, ...newSubProfiles];
      });
    } catch (err) {
      console.error(
        `Error loading sub-profiles for profile ${profileId}:`,
        err
      );
    }
  }, [subProfileApiService]);

  // New function to check processing queue and redirect if empty
  const checkProcessingQueue = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking processing queue...");
      
      const response: AnalyticsResponse = await apiService.getAnalyticsList({
        page: 1,
        page_size: 50,
        sort_by: "created_at",
        sort_order: "desc",
        status: "processing",
      });

      console.log("Processing queue response:", response);

      // Check if the response data is empty
      const hasProcessingVideos = response?.data && response.data.length > 0;
      
      if (!hasProcessingVideos) {
        console.log("No videos in processing queue - triggering redirect");
        
        setProcessingQueue([]);
        
        // Trigger redirect to next page
        if (onRedirectToNextPage) {
          onRedirectToNextPage();
        } else {
          // Fallback redirect logic if no callback provided
          console.log("No redirect callback provided, implement fallback redirect here");
        }
        
        return true; // Indicates redirect was triggered
      }

      return false; // No redirect needed
    } catch (error) {
      console.error("Error checking processing queue:", error);
      return false;
    }
  }, [apiService, onRedirectToNextPage]);

  // Updated checkProcessingStatus function with queue check and redirect
  const checkProcessingStatus = useCallback(async () => {
    // First check if processing queue is empty and redirect if needed
    const shouldRedirect = await checkProcessingQueue();
    if (shouldRedirect) {
      return; // Stop processing if we redirected
    }

    if (processingQueue.length === 0) return;

    try {
      console.log(
        "Checking processing status for",
        processingQueue.length,
        "videos"
      );

      const statusChecks = processingQueue.map(async (video) => {
        try {
          if (!video.uuid) {
            console.warn(
              `Video ${video.video_name} has no UUID, skipping status check`
            );
            return null;
          }

          console.log(`Checking status for video UUID: ${video.uuid}`);

          const response: AnalyticsResponse = await apiService.getAnalyticsList(
            {
              page: 1,
              page_size: 50,
              sort_by: "updated_at",
              sort_order: "desc",
              status: "processing",
            }
          );

          console.log("Analytics response for UUID check:", response);

          if (response?.data?.length > 0) {
            // Use the correct property name
            console.log(`Looking for UUID: ${video.uuid}`);
            console.log(`Available UUIDs:`, response.data.map(v => v.uuid));
            const matchingVideo = response.data.find(
            (analyticsVideo: AnalyticsVideo) =>
              analyticsVideo.uuid === video.uuid ||
              analyticsVideo.id === video.video_id
          );

            if (matchingVideo) {
              console.log(`Found matching video:`, matchingVideo);

              // Use processing_status from the interface
              const status = matchingVideo.processing_status;

              if (
                status === "completed" ||
                status === "failed" ||
                status === "error"
              ) {
                return {
                  uuid: video.uuid,
                  video_name: video.video_name,
                  status: status as "completed" | "failed",
                  error_message: matchingVideo.error_message || "",
                  videoData: matchingVideo,
                };
              } else {
                console.log(
                  `Video ${video.uuid} still processing. Status: ${status}`
                );
              }
            } else {
              console.log(`No matching video found for UUID: ${video.uuid}`);

              // If video not found after reasonable time, consider it failed
              const videoAge =
                Date.now() - new Date(video.created_at || Date.now()).getTime();
              if (videoAge > 300000) {
                // 5 minutes
                console.log(
                  `Video ${video.uuid} not found after 5 minutes, considering it failed`
                );
                return {
                  uuid: video.uuid,
                  video_name: video.video_name,
                  status: "failed" as const,
                  error_message:
                    "Video processing timed out or failed to initialize",
                  videoData: null,
                };
              }
            }
          } else {
            // If no processing videos found, this might indicate all processing is complete
            console.log("No processing videos found in response");
          }
          return null;
        } catch (statusError) {
          console.error(`Error checking status for ${video.uuid}:`, statusError);

          const typedError = statusError as ErrorResponse;
          if (typedError?.response?.status === 404) {
            return {
              uuid: video.uuid,
              video_name: video.video_name,
              status: "failed" as const,
              error_message: "Video not found in processing system",
              videoData: null,
            };
          }

          return null;
        }
      });

      const results = await Promise.all(statusChecks);
      const completedVideos = results.filter((result) => result !== null);

      console.log("Status check results:", completedVideos);

      if (completedVideos.length > 0) {
        console.log(`Found ${completedVideos.length} completed videos`);

        // Remove completed videos from processing queue
        setProcessingQueue((prev) => {
          const remaining = prev.filter(
            (video) =>
              !completedVideos.some(
                (completed) => completed.uuid === video.uuid
              )
          );
          console.log(
            `Removing ${prev.length - remaining.length} videos from queue`
          );
          return remaining;
        });

        // Add to completed notifications
        setCompletedVideos((prev) => [...prev, ...completedVideos]);

        // Show success/error notifications
        completedVideos.forEach((video) => {
          if (video.status === "completed") {
            setSuccess(
              `Video &quot;${video.video_name}&quot; completed processing successfully!`
            );
          } else {
            setError(
              `Video &quot;${video.video_name}&quot; failed processing: ${
                video.error_message || "Unknown error"
              }`
            );
          }
        });

        // Notify parent component
        if (onVideoProcessed) {
          completedVideos.forEach((video) => {
            if (video.videoData) {
              onVideoProcessed(video.videoData);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error in status polling:", error);
    }
  }, [processingQueue, apiService, onVideoProcessed, checkProcessingQueue]);

  // Initial queue check on component mount
  useEffect(() => {
    const initialQueueCheck = async () => {
      if (!loading) {
        await checkProcessingQueue();
      }
    };

    initialQueueCheck();
  }, [loading, checkProcessingQueue]);

  // Start status polling when there are videos in queue
  useEffect(() => {
    if (processingQueue.length > 0 && !pollingInterval) {
      console.log("Starting status polling...");
      const interval = setInterval(() => {
        checkProcessingStatus();
      }, 10000); // Poll every 10 seconds

      setPollingInterval(interval);
    } else if (processingQueue.length === 0 && pollingInterval) {
      console.log("Stopping status polling...");
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [processingQueue.length, pollingInterval, checkProcessingStatus]);

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError("");
      setSubProfiles([]);

      try {
        await Promise.all([loadVideos(), loadProfiles()]);
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
  }, [loadVideos, loadProfiles]);

  // Updated handleProcessVideo function
  const handleProcessVideo = async (
    payload: ProcessVideoRequest
  ): Promise<void> => {
    console.log("Processing video with payload:", payload);

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      if (
        !payload.video_url ||
        !payload.profile_id ||
        !payload.sub_profile_id ||
        !payload.template_id
      ) {
        throw new Error(
          "Missing required fields: video_url, profile_id, sub_profile_id, or template_id"
        );
      }
      const response = await apiService.processVideo(payload);
      console.log("Process video response:", response);

      // Extract the actual response data (API returns response wrapped in axios response)
      const responseData: ProcessVideoResponse = (response as { data?: ProcessVideoResponse })?.data || response as ProcessVideoResponse;

      // Validate that we received a proper UUID
      if (!responseData.uuid) {
        console.error(
          "No UUID received from process video response:",
          responseData
        );
        throw new Error("Server did not return a processing UUID");
      }

      const selectedVideo = videos.find(
        (v: VideoItem) =>
          v.url === payload.video_url ||
          v.id?.toString() === payload.video_url ||
          v.video_url === payload.video_url
      );
      const videoName =
        selectedVideo?.video_name ||
        selectedVideo?.name ||
        selectedVideo?.title ||
        payload.video_url;

      const processingVideo: ExtendedProcessingVideo = {
        video_id: responseData.video_id,
        uuid: responseData.uuid,
        video_name: videoName,
        status: responseData.status,
        estimated_completion: responseData.estimated_completion,
        priority: responseData.priority as Priority,
        created_at: new Date().toISOString(),
      };
      console.log("Adding to processing queue:", processingVideo);
      setProcessingQueue((prev) => [...prev, processingVideo]);

      setSuccess(
        `Video &quot;${videoName}&quot; has been submitted for processing successfully! UUID: ${responseData.uuid}`
      );
    } catch (processError) {
      console.error("Error processing video:", processError);

      let errorMessage = "Failed to process video. Please try again.";

      const typedError = processError as ErrorResponse;
      if (typedError?.response?.data?.detail) {
        if (Array.isArray(typedError.response.data.detail)) {
          errorMessage = typedError.response.data.detail
            .map(
              (e: ValidationError) =>
                `${e.loc?.join(".") || "field"}: ${e.msg || e.message}`
            )
            .join(", ");
        } else if (typeof typedError.response.data.detail === "string") {
          errorMessage = typedError.response.data.detail;
        }
      } else if (typedError?.response?.data?.message) {
        errorMessage = typedError.response.data.message;
      } else if (typedError?.message) {
        errorMessage = typedError.message;
      }

      setError(errorMessage);
      throw processError;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setSubProfiles([]);

    try {
      await Promise.all([loadVideos(), loadProfiles()]);
      // Also check queue after refresh
      await checkProcessingQueue();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
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

  // Clear completed video notifications
  const clearCompletedNotification = (uuid: string) => {
    setCompletedVideos((prev) => prev.filter((video) => video.uuid !== uuid));
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 sm:p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Loading Process Video
          </h3>
          <p className="text-gray-600 text-sm text-center">
            Fetching videos, profiles, and sub-profiles...
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-700 truncate">
                Process Video
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Upload and analyze your videos with powerful AI-driven metrics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
                disabled={loading}
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
                <span className="whitespace-nowrap">
                  {loading ? "Refreshing..." : "Refresh"}
                </span>
              </button>
              <button
                onClick={handleAllVideos}
                className="inline-flex items-center justify-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
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
                <span className="whitespace-nowrap">All Videos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4 lg:gap-8">
            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium flex-shrink-0">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                Select Video
              </span>
              <svg
                className="w-4 h-4 ml-2 lg:ml-4 text-gray-400 flex-shrink-0 hidden sm:block"
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

            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium flex-shrink-0">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                Select Analytics
              </span>
              <svg
                className="w-4 h-4 ml-2 lg:ml-4 text-gray-400 flex-shrink-0 hidden sm:block"
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

            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-medium flex-shrink-0">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900 truncate">
                Process
              </span>
              <svg
                className="w-4 h-4 ml-2 lg:ml-4 text-gray-400 flex-shrink-0 hidden sm:block"
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

            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium flex-shrink-0">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-green-600 truncate">
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
                  className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0"
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
                <div className="text-green-800 text-sm" dangerouslySetInnerHTML={{ __html: success }} />
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Videos Notifications */}
      {completedVideos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-2">
            {completedVideos.map((video) => (
              <div
                key={video.uuid}
                className={`border rounded-lg p-4 ${
                  video.status === "completed"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-start sm:items-center">
                    <svg
                      className={`w-5 h-5 mr-3 mt-0.5 sm:mt-0 flex-shrink-0 ${
                        video.status === "completed"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {video.status === "completed" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      )}
                    </svg>
                    <div
                      className={`min-w-0 flex-1 ${
                        video.status === "completed"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      <strong className="block truncate">
                        Video &ldquo;{video.video_name}&rdquo;{" "}
                        {video.status === "completed" ? "completed" : "failed"}{" "}
                        processing!
                      </strong>
                      {video.status === "completed" && (
                        <p className="text-sm mt-1">
                          Ready to view in Processed Videos tab.
                        </p>
                      )}
                      {video.error_message && (
                        <p className="text-sm mt-1 break-words">
                          Error: {video.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 flex-shrink-0">
                    {video.status === "completed" && (
                      <button
                        onClick={() => handleViewAnalytics(video.uuid)}
                        className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors text-center whitespace-nowrap"
                      >
                        View Results
                      </button>
                    )}
                    <button
                      onClick={() => clearCompletedNotification(video.uuid)}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors text-center whitespace-nowrap"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Process Video Form */}
          <div className="order-1">
            <ProcessVideoForm
              videos={videos}
              profiles={profiles}
              subProfiles={subProfiles}
              onProcessVideo={handleProcessVideo}
              isProcessing={isProcessing}
            />
          </div>

          {/* Processing Queue */}
          <div className="order-2">
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 text-purple-500 mr-3 flex-shrink-0">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  Processing Queue
                </h2>
                {processingQueue.length > 0 && pollingInterval && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    Auto-updating
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-6">
                Videos currently being processed ({processingQueue.length})
              </p>

              {processingQueue.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-purple-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No videos currently processing
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Videos being processed will appear here and auto-update
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {processingQueue.map((video) => (
                    <div
                      key={video.uuid}
                      className="border border-purple-200 rounded-lg p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="animate-spin w-5 h-5 mr-3 text-purple-500 flex-shrink-0">
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
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {video.video_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              video.priority === "high"
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
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        <div>
                          Status:{" "}
                          <span className="font-medium">{video.status}</span>
                        </div>
                        <div>
                          Estimated completion:{" "}
                          <span className="font-medium">
                            {video.estimated_completion}
                          </span>
                        </div>
                        <div className="break-all">
                          UUID: <span className="font-mono">{video.uuid}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleViewAnalytics(video.uuid)}
                          className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-md hover:bg-purple-100 transition-colors text-center"
                        >
                          View Analytics
                        </button>
                        <button
                          onClick={() => removeFromQueue(video.uuid)}
                          className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors text-center"
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
    </div>
  );
};

export default ProcessVideoPage;
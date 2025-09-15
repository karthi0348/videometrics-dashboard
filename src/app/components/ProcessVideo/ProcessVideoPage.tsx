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
  ProcessVideoRequest,
  ProcessVideoResponse,
  ProcessedVideoNotification
} from "./types/types";

// Shadcn UI components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Video, Clock, CheckCircle, XCircle, AlertCircle, Play, BarChart3, X, Eye } from "lucide-react";

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

// Define the actual API response structure for analytics
interface AnalyticsListItem {
  id: number;
  analytics_id: string;
  uuid?: string; // Make uuid optional since it might not exist
  processing_status?: string;
  status?: string;
  error_message?: unknown;
  profile_name: string;
  sub_profile_name: string;
  template_name: string;
  processing_duration?: unknown;
  file_size?: unknown;
  video_duration?: unknown;
  video_url?: unknown;
  thumbnail_url?: unknown;
  created_at: string;
  updated_at: string;
}

interface AnalyticsListResponse {
  data: AnalyticsListItem[];
  total?: number;
  page?: number;
  page_size?: number;
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
    status?: number;
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
      
      const response: AnalyticsListResponse = await apiService.getAnalyticsList({
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

          const response: AnalyticsListResponse = await apiService.getAnalyticsList({
            page: 1,
            page_size: 50,
            sort_by: "updated_at",
            sort_order: "desc",
            status: "processing",
          });

          console.log("Analytics response for UUID check:", response);

          if (response?.data?.length > 0) {
            console.log(`Looking for UUID: ${video.uuid}`);
            console.log(`Available UUIDs:`, response.data.map(v => v.uuid || v.analytics_id));
            
            const matchingVideo = response.data.find(
              (analyticsVideo: AnalyticsListItem) =>
                analyticsVideo.uuid === video.uuid ||
                analyticsVideo.analytics_id === video.uuid ||
                analyticsVideo.id === video.video_id
            );

            if (matchingVideo) {
              console.log(`Found matching video:`, matchingVideo);

              // Check both processing_status and status fields
              const status = matchingVideo.processing_status || matchingVideo.status;

              if (
                status === "completed" ||
                status === "failed" ||
                status === "error"
              ) {
                return {
                  uuid: video.uuid,
                  video_name: video.video_name,
                  status: status as "completed" | "failed",
                  error_message: matchingVideo.error_message ? String(matchingVideo.error_message) : "",
                  videoData: matchingVideo as any, // Cast to maintain compatibility
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
              `Video "${video.video_name}" completed processing successfully!`
            );
          } else {
            setError(
              `Video "${video.video_name}" failed processing: ${
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
        `Video "${videoName}" has been submitted for processing successfully! UUID: ${responseData.uuid}`
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

  // const handleAllVideos = () => {
  //   console.log("Navigate to All Videos");
  // };

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

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-700 border-red-300";
      case "low":
        return "bg-gray-500/20 text-gray-700 border-gray-300";
      default:
        return "bg-blue-500/20 text-blue-700 border-blue-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <Card className="backdrop-blur-xl bg-white/60 border-white/30 shadow-2xl max-w-md w-full">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-3 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Loading Process Video
            </h3>
            <p className="text-gray-600 text-sm text-center">
              Fetching videos, profiles, and sub-profiles...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Process Video
              </h1>
              <p className="text-gray-600/80 mt-1 text-sm">
                Upload and analyze your videos with powerful AI-driven metrics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="backdrop-blur-sm bg-white/60 border-white/40 hover:bg-white/80 transition-all duration-200"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              {/* <Button
                onClick={handleAllVideos}
                variant="outline"
                className="backdrop-blur-sm bg-white/60 border-white/40 hover:bg-white/80 transition-all duration-200"
              >
                <Video className="w-4 h-4 mr-2" />
                All Videos
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="backdrop-blur-sm bg-white/50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-4 lg:gap-8">
            {[
              { step: 1, title: "Select Video", active: true },
              { step: 2, title: "Select Analytics", active: true },
              { step: 3, title: "Process", active: true },
              { step: 4, title: "View Results", active: false, completed: false }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center min-w-0">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold flex-shrink-0 transition-all duration-300 ${
                  item.active 
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg" 
                    : item.completed
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {item.completed ? <CheckCircle className="w-5 h-5" /> : item.step}
                </div>
                <span className={`ml-3 text-sm font-medium truncate transition-colors ${
                  item.active ? "text-violet-600" : item.completed ? "text-green-600" : "text-gray-500"
                }`}>
                  {item.title}
                </span>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-violet-300 to-purple-300 ml-4 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {success && (
            <Alert className="mb-4 backdrop-blur-sm bg-emerald-50/80 border-emerald-200/50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800" dangerouslySetInnerHTML={{ __html: success }} />
            </Alert>
          )}
          {error && (
            <Alert className="mb-4 backdrop-blur-sm bg-red-50/80 border-red-200/50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Completed Videos Notifications */}
      {completedVideos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-3">
            {completedVideos.map((video) => (
              <Card key={video.uuid} className={`backdrop-blur-sm border-white/30 ${
                video.status === "completed"
                  ? "bg-emerald-50/80 border-emerald-200/50"
                  : "bg-red-50/80 border-red-200/50"
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-start sm:items-center">
                      {video.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 sm:mt-0 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-3 mt-0.5 sm:mt-0 text-red-500 flex-shrink-0" />
                      )}
                      <div className={`min-w-0 flex-1 ${
                        video.status === "completed" ? "text-emerald-800" : "text-red-800"
                      }`}>
                        <div className="font-semibold truncate">
                          Video "{video.video_name}" {video.status === "completed" ? "completed" : "failed"} processing!
                        </div>
                        {video.status === "completed" && (
                          <p className="text-sm mt-1 opacity-80">
                            Ready to view in Processed Videos tab.
                          </p>
                        )}
                        {video.error_message && (
                          <p className="text-sm mt-1 break-words opacity-80">
                            Error: {video.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      {video.status === "completed" && (
                        <Button
                          onClick={() => handleViewAnalytics(video.uuid)}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Results
                        </Button>
                      )}
                      <Button
                        onClick={() => clearCompletedNotification(video.uuid)}
                        size="sm"
                        variant="outline"
                        className="backdrop-blur-sm bg-white/60 border-white/40 hover:bg-white/80"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
            <Card className="min-h-screen rounded-2xl p-4 sm:p-6 lg:p-8  bg-gradient-to-br from-blue-300 via-purple-300 to-indigo-100 p-4 md:p-6 lg:p-8">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 mr-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Processing Queue
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600/80">
                        Videos currently being processed ({processingQueue.length})
                      </p>
                      {processingQueue.length > 0 && pollingInterval && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 text-xs">
                          Auto-updating
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {processingQueue.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 text-purple-300/50">
                      <Clock className="w-full h-full" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No videos currently processing
                    </h3>
                    <p className="text-gray-500/80 text-sm">
                      Videos being processed will appear here and auto-update
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {processingQueue.map((video) => (
                      <Card key={video.uuid} className="backdrop-blur-sm bg-white/60 border-white/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center min-w-0 flex-1">
                              <Loader2 className="w-5 h-5 mr-3 text-violet-500 animate-spin flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-700 truncate">
                                {video.video_name}
                              </span>
                            </div>
                            <Badge variant="outline" className={getPriorityColor(video.priority)}>
                              {video.priority}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-gray-600/80 space-y-1 mb-4">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="font-medium">{video.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ETA:</span>
                              <span className="font-medium">{video.estimated_completion}</span>
                            </div>
                            <div className="break-all">
                              <span>UUID: </span>
                              <code className="font-mono text-xs bg-gray-100/50 px-1 rounded">
                                {video.uuid}
                              </code>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewAnalytics(video.uuid)}
                              size="sm"
                              variant="outline"
                              className="flex-1 backdrop-blur-sm bg-violet-50/80 border-violet-200/50 hover:bg-violet-100/80 text-violet-700"
                            >
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Analytics
                            </Button>
                            <Button
                              onClick={() => removeFromQueue(video.uuid)}
                              size="sm"
                              variant="outline"
                              className="backdrop-blur-sm bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80 text-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessVideoPage;
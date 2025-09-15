import React, { useState, useEffect, useCallback } from "react";
import ProcessVideoApiService from "../../../helpers/service/processvideo/ProcessVideoApiservice";
import ProfileApiService from "../../../helpers/service/profile/profile-api-service";
import SubProfileApiService from "../../../helpers/service/subprofile/subprofile-api-service";
import { ProcessedVideo } from "./types/types";
import ProcessedVideosUI from "./ProcessedVideosUI";

type ViewMode = "grid" | "list" | "compact";

interface ProcessedVideosPageProps {
  newProcessedVideo?: ProcessedVideo;
  onNewVideoReceived?: () => void;
  onNavigate?: (
    page: string,
    analyticsId?: string,
    videoTitle?: string
  ) => void; // Add videoTitle parameter
}

const ProcessedVideosPage: React.FC<ProcessedVideosPageProps> = ({
  newProcessedVideo,
  onNewVideoReceived,
  onNavigate,
}) => {
  // Enhanced State management with better typing and organization
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mockMode, setMockMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());

  // Enhanced Auto-refresh state with better performance tracking
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newVideoAlert, setNewVideoAlert] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Enhanced Bulk operations state
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<string>("");
  const [bulkOperationProgress, setBulkOperationProgress] = useState<number>(0);

  // Enhanced Services with memoization
  const [apiService] = useState(() => new ProcessVideoApiService());
  const [profileApiService] = useState(() => new ProfileApiService());
  const [subProfileApiService] = useState(() => new SubProfileApiService());

  // Enhanced Pagination state with better UX
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Enhanced Mock data with more realistic examples
  const getMockData = (): ProcessedVideo[] => [
    {
      id: 1,
      analytics_id: "550e8400-e29b-41d4-a716-446655440000",
      video_title: "Customer Flow Analysis - Main Entrance",
      processing_status: "completed",
      confidence_score: 92.5,
      created_at: "2025-01-15T14:30:07.000Z",
      updated_at: "2025-01-15T14:35:22.000Z",
      profile_name: "Retail Store Analytics",
      sub_profile_name: "Entrance Monitoring",
      template_name: "Customer Flow Template",
      processing_duration: "2m 45s",
      file_size: "67.8 MB",
      video_duration: "5:12",
    },
    {
      id: 2,
      analytics_id: "550e8400-e29b-41d4-a716-446655440001",
      video_title: "Queue Management - Service Counter",
      processing_status: "failed",
      confidence_score: 0,
      created_at: "2025-01-15T13:20:54.000Z",
      updated_at: "2025-01-15T13:25:24.000Z",
      profile_name: "Retail Store Analytics",
      sub_profile_name: "Service Counter",
      template_name: "Queue Analysis Template",
      error_message: "Insufficient video quality for accurate analysis",
      processing_duration: "1m 15s",
      file_size: "23.4 MB",
      video_duration: "3:08",
    },
    {
      id: 3,
      analytics_id: "550e8400-e29b-41d4-a716-446655440002",
      video_title: "Security Monitoring - Parking Area",
      processing_status: "completed",
      confidence_score: 88.7,
      created_at: "2025-01-15T12:45:30.000Z",
      updated_at: "2025-01-15T12:52:15.000Z",
      profile_name: "Security Analytics",
      sub_profile_name: "Parking Lot",
      template_name: "Security Monitoring Template",
      processing_duration: "4m 20s",
      file_size: "156.2 MB",
      video_duration: "8:45",
    },
    {
      id: 4,
      analytics_id: "550e8400-e29b-41d4-a716-446655440003",
      video_title: "Staff Workflow Analysis - Kitchen",
      processing_status: "processing",
      confidence_score: 0,
      created_at: "2025-01-15T15:10:12.000Z",
      updated_at: "2025-01-15T15:10:12.000Z",
      profile_name: "Restaurant Analytics",
      sub_profile_name: "Kitchen Operations",
      template_name: "Workflow Efficiency Template",
      processing_duration: "0m 0s",
      file_size: "89.3 MB",
      video_duration: "6:33",
    },
  ];

  // Enhanced loading function with better error handling and performance
  const loadProcessedVideos = useCallback(
    async (
      page: number = 1,
      showLoading: boolean = true,
      isAutoRefresh: boolean = false
    ) => {
      if (mockMode) {
        const mockData = getMockData();
        const startIndex = (page - 1) * pageSize;
        const paginatedData = mockData.slice(startIndex, startIndex + pageSize);

        setProcessedVideos(paginatedData);
        setTotalCount(mockData.length);
        setTotalPages(Math.ceil(mockData.length / pageSize));
        setCurrentPage(page);
        setLastRefresh(new Date());
        return;
      }

      try {
        if (showLoading && !isAutoRefresh) {
          setLoading(true);
        } else if (isAutoRefresh) {
          setIsRefreshing(true);
        } else if (page !== currentPage) {
          setIsLoadingPage(true);
        }

        setError("");

        const response: any = await apiService.getAnalyticsList({
          status: undefined,
          page: page,
          page_size: pageSize,
          sort_by: "processing_completed_at",
          sort_order: "desc",
        });

        if (response) {
          // Enhanced filtering with better status handling
          const filteredVideos = response.filter(
            (video: any) =>
              video.status === "completed" ||
              video.status === "failed" ||
              video.status === "processing"
          );

          // Enhanced transformation with better data handling
          const transformedVideos: ProcessedVideo[] = filteredVideos.map(
            (video: any) => ({
              id: video.id,
              analytics_id: video.analytics_id,
              video_title:
                video.template_name || video.video_title || "Untitled Video",
              processing_status: video.status,
              confidence_score: parseFloat(
                video.confidence_score?.toString() || "0"
              ),
              created_at: video.created_at,
              updated_at: video.processing_completed_at || video.updated_at,
              error_message: video.error_message,
              profile_name: video.profile_name || "Unknown Profile",
              sub_profile_name: video.sub_profile_name || "Unknown Sub-Profile",
              template_name: video.template_name || "Template",
              processing_duration: video.processing_duration || "N/A",
              file_size: video.file_size || "Unknown",
              video_duration: video.video_duration || "N/A",
              video_url: video.video_url,
              thumbnail_url: video.thumbnail_url,
            })
          );

          // Enhanced new video detection for auto-refresh
          if (isAutoRefresh && processedVideos.length > 0) {
            const newCompletedVideos = transformedVideos.filter(
              (newVideo) =>
                newVideo.processing_status === "completed" &&
                !processedVideos.some(
                  (existingVideo) =>
                    existingVideo.analytics_id === newVideo.analytics_id &&
                    existingVideo.processing_status === "completed"
                )
            );

            if (newCompletedVideos.length > 0) {
              setNewVideoAlert(
                `🎉 ${newCompletedVideos.length} new video${
                  newCompletedVideos.length > 1 ? "s" : ""
                } completed processing!`
              );
              setTimeout(() => setNewVideoAlert(""), 6000);
            }
          }

          setProcessedVideos(transformedVideos);
          setTotalCount(response.total || filteredVideos.length);
          setTotalPages(
            response.total_pages || Math.ceil(filteredVideos.length / pageSize)
          );
          setCurrentPage(response.page || page);
          setLastRefresh(new Date());
        } else {
          setProcessedVideos([]);
          setTotalCount(0);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Error loading processed videos:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load processed videos";
        setError(errorMessage);

        // Don't clear data on auto-refresh errors to maintain better UX
        if (!isAutoRefresh) {
          setProcessedVideos([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } finally {
        if (showLoading && !isAutoRefresh) {
          setLoading(false);
        } else if (isAutoRefresh) {
          setIsRefreshing(false);
        } else if (page !== currentPage) {
          setIsLoadingPage(false);
        }
      }
    },
    [mockMode, processedVideos.length, apiService, pageSize, currentPage]
  );

  // Enhanced effect for handling new processed videos
  useEffect(() => {
    if (newProcessedVideo) {
      setProcessedVideos((prev) => {
        const existingIndex = prev.findIndex(
          (video) => video.analytics_id === newProcessedVideo.analytics_id
        );

        if (existingIndex >= 0) {
          // Update existing video
          const updatedVideos = [...prev];
          updatedVideos[existingIndex] = newProcessedVideo;
          return updatedVideos;
        } else {
          // Add new video
          setNewVideoAlert(
            `✨ New video "${newProcessedVideo.video_title}" is ready for analysis!`
          );
          setTimeout(() => setNewVideoAlert(""), 6000);
          return [newProcessedVideo, ...prev];
        }
      });

      if (onNewVideoReceived) {
        onNewVideoReceived();
      }
    }
  }, [newProcessedVideo, onNewVideoReceived]);

  // Enhanced auto-refresh effect with better performance
  useEffect(() => {
    if (autoRefresh && processedVideos.length > 0) {
      const interval = setInterval(() => {
        // Only auto-refresh if there are processing videos or if we're on the first page
        const hasProcessingVideos = processedVideos.some(
          (video) => video.processing_status === "processing"
        );

        if (hasProcessingVideos || currentPage === 1) {
          loadProcessedVideos(currentPage, false, true);
        }
      }, 15000); // Reduced interval for better responsiveness

      setRefreshInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, processedVideos, currentPage, loadProcessedVideos]);

  // Enhanced initial load effect
  useEffect(() => {
    loadProcessedVideos(1);
  }, [mockMode]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Enhanced event handlers with better UX
  const handleRefresh = useCallback(() => {
    loadProcessedVideos(currentPage, true, false);
  }, [currentPage, loadProcessedVideos]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (
        newPage >= 1 &&
        newPage <= totalPages &&
        newPage !== currentPage &&
        !isLoadingPage
      ) {
        setSelectedVideos(new Set()); // Clear selections when changing pages
        loadProcessedVideos(newPage, false, false);
      }
    },
    [totalPages, currentPage, isLoadingPage, loadProcessedVideos]
  );

  const handleViewMetrics = useCallback(
    (analyticsId: string) => {
      if (onNavigate) {
        const video = processedVideos.find(
          (v) => v.analytics_id === analyticsId
        );
        const videoTitle = video?.video_title || "Video Analysis";
        console.log("Found video:", video); // Debug log
        console.log("Passing title:", videoTitle); // Debug log

        onNavigate("videoMetrics", analyticsId, videoTitle);
      }
    },
    [onNavigate]
  );

  const handlePlayVideo = useCallback((videoUrl?: string) => {
    if (videoUrl) {
      // Enhanced video playing with better error handling
      try {
        window.open(videoUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("Error opening video:", error);
        setError(
          "Unable to open video. Please check if the video URL is valid."
        );
      }
    } else {
      setError("No video URL available for playback");
      setTimeout(() => setError(""), 3000);
    }
  }, []);

  const handleDeleteVideo = useCallback(
    async (analyticsId: string) => {
      const video = processedVideos.find((v) => v.analytics_id === analyticsId);
      const videoTitle = video?.video_title || "this video";

      const confirmed = window.confirm(
        `Are you sure you want to delete "${videoTitle}"?\n\nThis action cannot be undone and will permanently remove all associated analytics data.`
      );

      if (!confirmed) return;

      try {
        setError(""); // Clear any existing errors

        if (mockMode) {
          // Enhanced mock delete with loading state
          setProcessedVideos((prev) =>
            prev.filter((v) => v.analytics_id !== analyticsId)
          );
          setNewVideoAlert(`Successfully deleted "${videoTitle}"`);
          setTimeout(() => setNewVideoAlert(""), 4000);
          return;
        }

        await apiService.deleteAnalytics(analyticsId);

        // Remove from local state immediately for better UX
        setProcessedVideos((prev) =>
          prev.filter((v) => v.analytics_id !== analyticsId)
        );
        setNewVideoAlert(`Successfully deleted "${videoTitle}"`);
        setTimeout(() => setNewVideoAlert(""), 4000);

        // Refresh to ensure consistency
        setTimeout(() => handleRefresh(), 1000);
      } catch (error) {
        console.error("Error deleting analytics:", error);
        setError(
          error instanceof Error
            ? `Failed to delete video: ${error.message}`
            : "Failed to delete video analytics"
        );
      }
    },
    [processedVideos, mockMode, apiService, handleRefresh]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedVideos.size === 0) {
      setError("Please select at least one video to delete");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const selectedCount = selectedVideos.size;
    const videoTitles = processedVideos
      .filter((video) => selectedVideos.has(video.id))
      .map((video) => video.video_title)
      .slice(0, 3);

    const titlePreview =
      videoTitles.length > 3
        ? `${videoTitles.join(", ")} and ${selectedCount - 3} more`
        : videoTitles.join(", ");

    const confirmMessage = `Are you sure you want to delete ${selectedCount} selected video${
      selectedCount > 1 ? "s" : ""
    }?\n\n${titlePreview}\n\nThis action cannot be undone and will permanently remove all associated analytics data.`;

    if (!window.confirm(confirmMessage)) return;

    setBulkDeleting(true);
    setBulkDeleteResult("");
    setError("");
    setBulkOperationProgress(0);

    try {
      if (mockMode) {
        // Enhanced mock bulk delete with progress simulation
        const selectedIds = Array.from(selectedVideos);

        for (let i = 0; i < selectedIds.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setBulkOperationProgress(((i + 1) / selectedIds.length) * 100);
        }

        setProcessedVideos((prev) =>
          prev.filter((video) => !selectedVideos.has(video.id))
        );
        setSelectedVideos(new Set());
        setBulkDeleteResult(
          `✅ Successfully deleted ${selectedCount} video${
            selectedCount > 1 ? "s" : ""
          }`
        );
        setTimeout(() => setBulkDeleteResult(""), 6000);
        setBulkDeleting(false);
        return;
      }

      const response = await apiService.bulkDelete({
        entity_type: "analytics",
        entity_ids: Array.from(selectedVideos),
        confirm: true,
      });

      if (response.successful > 0) {
        setBulkDeleteResult(
          `✅ Successfully deleted ${response.successful} video${
            response.successful > 1 ? "s" : ""
          }` +
            (response.failed > 0
              ? `. ⚠️ Failed to delete ${response.failed} video${
                  response.failed > 1 ? "s" : ""
                }.`
              : "")
        );

        setSelectedVideos(new Set());

        // Update local state immediately
        const successfulIds = Array.from(selectedVideos).slice(
          0,
          response.successful
        );
        setProcessedVideos((prev) =>
          prev.filter((video) => !successfulIds.includes(video.id))
        );

        // Refresh to ensure consistency
        setTimeout(() => handleRefresh(), 1000);
      } else {
        setError(
          `❌ Failed to delete videos. ${
            response.errors?.[0]?.msg || "Unknown error occurred"
          }`
        );
      }

      setTimeout(() => setBulkDeleteResult(""), 6000);
    } catch (error) {
      console.error("Error during bulk delete:", error);
      setError(
        error instanceof Error
          ? `❌ Bulk delete failed: ${error.message}`
          : "❌ Failed to delete selected videos"
      );
    } finally {
      setBulkDeleting(false);
      setBulkOperationProgress(0);
    }
  }, [selectedVideos, processedVideos, mockMode, apiService, handleRefresh]);

  const handleSelectVideo = useCallback((id: number) => {
    setSelectedVideos((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedVideos.size === processedVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(processedVideos.map((v) => v.id)));
    }
  }, [selectedVideos.size, processedVideos]);

  // Enhanced clear error function
  const clearError = useCallback(() => {
    setError("");
  }, []);

  // Enhanced clear alert function
  const clearAlert = useCallback(() => {
    setNewVideoAlert("");
  }, []);

  return (
    <ProcessedVideosUI
      // Enhanced State props
      processedVideos={processedVideos}
      loading={loading}
      error={error}
      viewMode={viewMode}
      setViewMode={setViewMode}
      mockMode={mockMode}
      setMockMode={setMockMode}
      selectedVideos={selectedVideos}
      autoRefresh={autoRefresh}
      setAutoRefresh={setAutoRefresh}
      lastRefresh={lastRefresh}
      newVideoAlert={newVideoAlert}
      bulkDeleting={bulkDeleting}
      bulkDeleteResult={bulkDeleteResult}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={pageSize}
      refreshInterval={refreshInterval}
      // Enhanced additional state props
      isRefreshing={isRefreshing}
      isLoadingPage={isLoadingPage}
      bulkOperationProgress={bulkOperationProgress}
      // Enhanced Handler props
      handleRefresh={handleRefresh}
      handlePageChange={handlePageChange}
      handleViewMetrics={handleViewMetrics}
      handlePlayVideo={handlePlayVideo}
      handleDeleteVideo={handleDeleteVideo}
      handleBulkDelete={handleBulkDelete}
      handleSelectVideo={handleSelectVideo}
      handleSelectAll={handleSelectAll}
      // Enhanced additional handlers
      clearError={clearError}
      clearAlert={clearAlert}
    />
  );
};

export default ProcessedVideosPage;

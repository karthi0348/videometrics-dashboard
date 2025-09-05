import React, { useState, useEffect, useCallback } from "react";
import ProcessVideoApiService from "../../../helpers/service/processvideo/ProcessVideoApiservice";
import ProfileApiService from "../../../helpers/service/profile/profile-api-service";
import SubProfileApiService from "../../../helpers/service/subprofile/subprofile-api-service";
import { ProcessedVideo } from "./types/types";
import VideoMetricsModal from "./modal/VideoMetricsModal";
import ProcessedVideosUI from "./ProcessedVideosUI";

type ViewMode = 'grid' | 'list' | 'compact';

interface ProcessedVideosPageProps {
  newProcessedVideo?: ProcessedVideo;
  onNewVideoReceived?: () => void;
}

const ProcessedVideosPage: React.FC<ProcessedVideosPageProps> = ({
  newProcessedVideo,
  onNewVideoReceived
}) => {
  // State management
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mockMode, setMockMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newVideoAlert, setNewVideoAlert] = useState<string>("");

  // Bulk delete state
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<string>("");

  // Modal state
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  // Services
  const [apiService] = useState(new ProcessVideoApiService());
  const [profileApiService] = useState(new ProfileApiService());
  const [subProfileApiService] = useState(new SubProfileApiService());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);

  // Mock data
  const getMockData = (): ProcessedVideo[] => [
    {
      id: 1,
      analytics_id: "550e8400-e29b-41d4-a716-446655440000",
      video_title: "test template",
      processing_status: 'completed',
      confidence_score: 75.0,
      created_at: "2025-08-30T11:55:07.000Z",
      updated_at: "2025-08-30T11:57:22.000Z",
      profile_name: "profile22",
      sub_profile_name: "demo",
      template_name: "test template",
      processing_duration: "2m 15s",
      file_size: "45.2 MB",
      video_duration: "3:24"
    },
    {
      id: 2,
      analytics_id: "550e8400-e29b-41d4-a716-446655440001",
      video_title: "test template 2",
      processing_status: 'failed',
      confidence_score: 0,
      created_at: "2025-08-30T11:49:54.000Z",
      updated_at: "2025-08-30T11:51:24.000Z",
      profile_name: "profile22",
      sub_profile_name: "demo",
      template_name: "test template",
      error_message: "Processing failed due to invalid video format",
      processing_duration: "1m 30s",
      file_size: "32.1 MB",
      video_duration: "2:45"
    },
  ];

  const loadProcessedVideos = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    if (mockMode) {
      const mockData = getMockData();
      setProcessedVideos(mockData);
      setTotalCount(mockData.length);
      setTotalPages(Math.ceil(mockData.length / pageSize));
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      
      const response: any = await apiService.getAnalyticsList({
        status: undefined,
        page: page,
        page_size: pageSize,
        sort_by: 'processing_completed_at',
        sort_order: 'desc'
      });

      if (response) {
        const filteredVideos = response.filter((video: any) => 
          video.status === 'completed' || video.status === 'failed'
        );

        const transformedVideos: ProcessedVideo[] = filteredVideos.map((video: any) => ({
          id: video.id,
          analytics_id: video.analytics_id,
          video_title: video.template_name || 'Untitled Video',
          processing_status: video.status,
          confidence_score: video.confidence_score || 0,
          created_at: video.created_at,
          updated_at: video.processing_completed_at,
          error_message: video.error_message,
          profile_name: video.profile_name || "Unknown Profile",
          sub_profile_name: video.sub_profile_name || "Unknown Sub-Profile",
          template_name: video.template_name || "Template",
          processing_duration: video.processing_duration,
          file_size: video.file_size,
          video_duration: video.video_duration,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url
        }));

        if (!showLoading && processedVideos.length > 0) {
          const newVideos = transformedVideos.filter(newVideo => 
            !processedVideos.some(existingVideo => existingVideo.analytics_id === newVideo.analytics_id)
          );
          
          if (newVideos.length > 0) {
            setNewVideoAlert(`${newVideos.length} new processed video${newVideos.length > 1 ? 's' : ''} found!`);
            setTimeout(() => setNewVideoAlert(""), 5000);
          }
        }

        setProcessedVideos(transformedVideos);
        setTotalCount(response.total || filteredVideos.length);
        setTotalPages(response.total_pages || Math.ceil(filteredVideos.length / pageSize));
        setCurrentPage(response.page || page);
        setLastRefresh(new Date());
      } else {
        setProcessedVideos([]);
        setTotalCount(0);
        setTotalPages(1);
      }
      
    } catch (err) {
      console.error("Error loading processed videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load processed videos");
      setProcessedVideos([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [mockMode, processedVideos.length, apiService, pageSize]);

  // Effects
  useEffect(() => {
    if (newProcessedVideo) {
      setProcessedVideos(prev => {
        const exists = prev.some(video => video.analytics_id === newProcessedVideo.analytics_id);
        if (!exists) {
          setNewVideoAlert(`New video "${newProcessedVideo.video_title}" ready for viewing!`);
          setTimeout(() => setNewVideoAlert(""), 5000);
          return [newProcessedVideo, ...prev];
        }
        return prev;
      });

      if (onNewVideoReceived) {
        onNewVideoReceived();
      }
    }
  }, [newProcessedVideo, onNewVideoReceived]);

  useEffect(() => {
    if (autoRefresh && processedVideos.length > 0) {
      const interval = setInterval(() => {
        loadProcessedVideos(currentPage, false);
      }, 30000);

      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, processedVideos.length, currentPage, loadProcessedVideos]);

  useEffect(() => {
    loadProcessedVideos(1);
  }, [mockMode]);

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Event handlers
  const handleRefresh = () => {
    loadProcessedVideos(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadProcessedVideos(newPage);
    }
  };

  const handleViewMetrics = (analyticsId: string) => {
    setSelectedAnalyticsId(analyticsId);
    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedAnalyticsId(null);
  };

  const handlePlayVideo = (videoUrl?: string) => {
    if (videoUrl) {
      console.log(`Play video: ${videoUrl}`);
    } else {
      console.log("No video URL available");
    }
  };

  const handleDeleteVideo = async (analyticsId: string) => {
    if (!window.confirm("Are you sure you want to delete this processed video? This action cannot be undone.")) {
      return;
    }

    try {
      await apiService.deleteAnalytics(analyticsId);
      handleRefresh();
    } catch (error) {
      console.error("Error deleting analytics:", error);
      setError("Failed to delete video analytics");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.size === 0) {
      setError("Please select videos to delete");
      return;
    }

    const selectedCount = selectedVideos.size;
    const confirmMessage = `Are you sure you want to delete ${selectedCount} selected video${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkDeleting(true);
    setBulkDeleteResult("");
    setError("");

    try {
      if (mockMode) {
        setTimeout(() => {
          setProcessedVideos(prev => prev.filter(video => !selectedVideos.has(video.id)));
          setSelectedVideos(new Set());
          setBulkDeleteResult(`Successfully deleted ${selectedCount} video${selectedCount > 1 ? 's' : ''}`);
          setTimeout(() => setBulkDeleteResult(""), 5000);
          setBulkDeleting(false);
        }, 1500);
        return;
      }

      const response = await apiService.bulkDelete({
        entity_type: "analytics",
        entity_ids: Array.from(selectedVideos),
        confirm: true
      });

      if (response.successful > 0) {
        setBulkDeleteResult(
          `Successfully deleted ${response.successful} video${response.successful > 1 ? 's' : ''}` +
          (response.failed > 0 ? `. Failed to delete ${response.failed} video${response.failed > 1 ? 's' : ''}.` : '')
        );
        
        setSelectedVideos(new Set());
        handleRefresh();
      } else {
        setError(`Failed to delete videos. ${response.errors?.[0]?.msg || 'Unknown error occurred'}`);
      }

      setTimeout(() => setBulkDeleteResult(""), 5000);
      
    } catch (error) {
      console.error("Error during bulk delete:", error);
      setError(error instanceof Error ? error.message : "Failed to delete selected videos");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectVideo = (id: number) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === processedVideos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(processedVideos.map(v => v.id)));
    }
  };

  return (
    <>
      <ProcessedVideosUI
        // State props
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
        
        // Handler props
        handleRefresh={handleRefresh}
        handlePageChange={handlePageChange}
        handleViewMetrics={handleViewMetrics}
        handlePlayVideo={handlePlayVideo}
        handleDeleteVideo={handleDeleteVideo}
        handleBulkDelete={handleBulkDelete}
        handleSelectVideo={handleSelectVideo}
        handleSelectAll={handleSelectAll}
      />

      {/* Video Metrics Modal */}
      <VideoMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={handleCloseMetricsModal}
        analyticsId={selectedAnalyticsId}
        apiService={apiService}
        mockMode={mockMode}
      />
    </>
  );
};

export default ProcessedVideosPage;
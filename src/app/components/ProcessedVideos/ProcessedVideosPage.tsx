import React, { useState, useEffect, useCallback } from "react";
import ProcessVideoApiService from "../../../helpers/service/processvideo/ProcessVideoApiservice";
import ProfileApiService from "../../../helpers/service/profile/profile-api-service";
import SubProfileApiService from "../../../helpers/service/subprofile/subprofile-api-service";
import {ProcessedVideo} from "./types/types"


type ViewMode = 'grid' | 'list' | 'compact';

interface ProcessedVideosPageProps {
  newProcessedVideo?: ProcessedVideo; // NEW: For receiving newly processed videos
  onNewVideoReceived?: () => void;    // NEW: Callback when new video is received
}

const ProcessedVideosPage: React.FC<ProcessedVideosPageProps> = ({
  newProcessedVideo,
  onNewVideoReceived
}) => {
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mockMode, setMockMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());

  // NEW: State for auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newVideoAlert, setNewVideoAlert] = useState<string>("");

  // Services
  const [apiService] = useState(new ProcessVideoApiService());
  const [profileApiService] = useState(new ProfileApiService());
  const [subProfileApiService] = useState(new SubProfileApiService());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);

  // NEW: Load processed videos with better error handling and caching
  const loadProcessedVideos = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    // if (mockMode) {
    //   const mockData: ProcessedVideo[] = [
    //     {
    //       id: 1,
    //       analytics_id: "550e8400-e29b-41d4-a716-446655440000",
    //       video_title: "test template",
    //       processing_status: 'completed',
    //       confidence_score: 75.0,
    //       created_at: "2025-08-30T11:55:07.000Z",
    //       updated_at: "2025-08-30T11:57:22.000Z",
    //       profile_name: "profile22",
    //       sub_profile_name: "demo",
    //       template_name: "test template",
    //       processing_duration: "2m 15s",
    //       file_size: "45.2 MB",
    //       video_duration: "3:24"
    //     },
    //     {
    //       id: 2,
    //       analytics_id: "550e8400-e29b-41d4-a716-446655440001",
    //       video_title: "test template",
    //       processing_status: 'failed',
    //       confidence_score: 0,
    //       created_at: "2025-08-30T11:49:54.000Z",
    //       updated_at: "2025-08-30T11:51:24.000Z",
    //       profile_name: "profile22",
    //       sub_profile_name: "demo",
    //       template_name: "test template",
    //       error_message: "Processing failed due to invalid video format",
    //       processing_duration: "1m 30s",
    //       file_size: "32.1 MB",
    //       video_duration: "2:45"
    //     },
       
    //   ];
    //   setProcessedVideos(mockData);
    //   setTotalCount(mockData.length);
    //   setTotalPages(Math.ceil(mockData.length / pageSize));
    //   return;
    // }

    try {
      if (showLoading) setLoading(true);
      setError("");
      
      const response:any = await apiService.getAnalyticsList({
        status: undefined,
        page: page,
        page_size: pageSize,
        sort_by: 'updated_at',
        sort_order: 'desc'
      });

      console.log("Analytics list response:", response);

      if (response) {
        const filteredVideos = response.filter((video:any) => 
          video.status === 'completed' || video.status === 'failed'
        );

        const transformedVideos: ProcessedVideo[] = filteredVideos.map((video:any) => ({
          id: video.id,
          analytics_id: video.analytics_id,
          video_title: video.template_name || 'Untitled Video',
          processing_status: video.status,
          confidence_score: video.confidence_score || 0,
          created_at: video.created_at,
          updated_at: video.updated_at,
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

        // Check for new videos (only if not the initial load)
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

  // NEW: Handle new processed video from parent component
  useEffect(() => {
    if (newProcessedVideo) {
      console.log("Received new processed video:", newProcessedVideo);
      
      // Add to the list if not already present
      setProcessedVideos(prev => {
        const exists = prev.some(video => video.analytics_id === newProcessedVideo.analytics_id);
        if (!exists) {
          setNewVideoAlert(`New video "${newProcessedVideo.video_title}" ready for viewing!`);
          setTimeout(() => setNewVideoAlert(""), 5000);
          return [newProcessedVideo, ...prev];
        }
        return prev;
      });

      // Notify parent that we've received the video
      if (onNewVideoReceived) {
        onNewVideoReceived();
      }
    }
  }, [newProcessedVideo, onNewVideoReceived]);

  // NEW: Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && processedVideos.length > 0) {
      const interval = setInterval(() => {
        console.log("Auto-refreshing processed videos...");
        loadProcessedVideos(currentPage, false); // Don't show loading spinner for auto-refresh
      }, 30000); // Auto-refresh every 30 seconds

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

  // Initial load
  useEffect(() => {
    loadProcessedVideos(1);
  }, [mockMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

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
    console.log(`Navigate to analytics/metrics for analytics ID: ${analyticsId}`);
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
      console.log(`Deleted analytics: ${analyticsId}`);
      handleRefresh();
    } catch (error) {
      console.error("Error deleting analytics:", error);
      setError("Failed to delete video analytics");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderVideoCard = (video: ProcessedVideo) => (
    <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{video.video_title}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(video.processing_status)}`}>
            {video.processing_status}
          </span>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => handlePlayVideo(video.video_url)}
            className="p-1 text-teal-600 hover:text-teal-700 transition-colors"
            title="Play video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteVideo(video.analytics_id)}
            className="p-1 text-red-600 hover:text-red-700 transition-colors"
            title="Delete video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative bg-gray-100 rounded-lg mb-3 aspect-video flex items-center justify-center">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.video_title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <button 
            onClick={() => handlePlayVideo(video.video_url)}
            className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors"
          >
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div><span className="font-medium">Processed:</span> {formatDate(video.updated_at)}</div>
        <div><span className="font-medium">Created:</span> {formatDate(video.created_at)}</div>
        
        {video.profile_name && video.profile_name !== "Unknown Profile" && (
          <div><span className="font-medium">Profile:</span> {video.profile_name}</div>
        )}
        
        {video.sub_profile_name && video.sub_profile_name !== "Unknown Sub-Profile" && (
          <div><span className="font-medium">Sub-Profile:</span> {video.sub_profile_name}</div>
        )}
        
        {video.processing_status === 'completed' && video.confidence_score > 0 && (
          <div><span className="font-medium">Confidence:</span> {video.confidence_score}%</div>
        )}
        
        {video.processing_status === 'failed' && video.error_message && (
          <div className="text-red-600"><span className="font-medium">Error:</span> {video.error_message}</div>
        )}

        {video.processing_duration && (
          <div><span className="font-medium">Duration:</span> {video.processing_duration}</div>
        )}

        <div className="pt-2 border-t border-gray-100">
          {video.processing_status === 'completed' ? (
            <button
              onClick={() => handleViewMetrics(video.analytics_id)}
              className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-md hover:bg-teal-100 transition-colors"
            >
              Click to view metrics
            </button>
          ) : (
            <span className="text-xs text-red-600 font-medium">Status: {video.processing_status}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Loading Processed Videos
          </h3>
          <p className="text-gray-600 text-sm text-center">
            Fetching your processed video content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  Processed Videos
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-teal-500 text-white text-sm font-medium rounded-full">
                    {processedVideos.length}
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage your processed video analytics
                </p>
                {/* NEW: Last refresh time and auto-refresh status */}
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {autoRefresh && refreshInterval && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Auto-refreshing
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-3">
              {/* NEW: Auto-refresh toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">Auto-refresh</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">Mock Mode</span>
              </label>
              
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>

              <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="ml-2 hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="ml-2 hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="ml-2 hidden sm:inline">Compact</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Videos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: New video alert */}
      {newVideoAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div className="text-green-800">{newVideoAlert}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processedVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No processed videos found
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Videos that have completed processing will appear here
              {autoRefresh && " and update automatically"}
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
              Process New Videos
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : viewMode === 'list'
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {processedVideos.map(renderVideoCard)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </span>{' '}
                      of <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (currentPage <= 4) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = currentPage - 3 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNum
                                ? 'z-10 bg-teal-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessedVideosPage;
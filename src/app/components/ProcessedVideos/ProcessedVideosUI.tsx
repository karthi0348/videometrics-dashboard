import React, { useState } from "react";
import {
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  Eye,
  Trash2,
  BarChart3,
  X,
} from "lucide-react";
import { ProcessedVideo } from "./types/types";
import PlayVideoModal from "../Modal/Video/PlayVideoModal";

type ViewMode = "grid" | "list" | "compact";

interface ProcessedVideosUIProps {
  // State props
  processedVideos: ProcessedVideo[];
  loading: boolean;
  error: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  mockMode: boolean;
  setMockMode: (mode: boolean) => void;
  selectedVideos: Set<number>;
  autoRefresh: boolean;
  setAutoRefresh: (refresh: boolean) => void;
  lastRefresh: Date;
  newVideoAlert: string;
  bulkDeleting: boolean;
  bulkDeleteResult: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  refreshInterval: NodeJS.Timeout | null;
  filteredVideos: ProcessedVideo[];
  allVideos: ProcessedVideo[];
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  getUniqueProfiles: () => string[];
  getUniqueStatuses: () => string[];
  getActiveFilterCount: () => number;
  handleStatusFilter: (status: string) => void;
  handleProfileFilter: (profile: string) => void;
  clearAllFilters: () => void;

  // Handler props
  handleRefresh: () => void;
  handlePageChange: (page: number) => void;
  handleViewMetrics: (analyticsId: string) => void;
  handleDeleteVideo: (analyticsId: string) => void;
  handleBulkDelete: () => void;
  handleSelectVideo: (id: number) => void;
  handleSelectAll: () => void;
}

const ProcessedVideosUI: React.FC<ProcessedVideosUIProps> = ({
  processedVideos,
  loading,
  error,
  viewMode,
  setViewMode,
  mockMode,
  setMockMode,
  selectedVideos,
  autoRefresh,
  setAutoRefresh,
  lastRefresh,
  newVideoAlert,
  bulkDeleting,
  bulkDeleteResult,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  refreshInterval,
  handleRefresh,
  handlePageChange,
  handleViewMetrics,
  handleDeleteVideo,
  handleBulkDelete,
  handleSelectVideo,
  handleSelectAll,
  filteredVideos,
  allVideos,
  showFilter,
  setShowFilter,
  filters,
  setFilters,
  getUniqueProfiles,
  getUniqueStatuses,
  getActiveFilterCount,
  handleStatusFilter,
  handleProfileFilter,
  clearAllFilters,
}) => {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  // State for PlayVideoModal
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<any>(null);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  // Handler to open video modal
  const handlePlayVideo = (video: ProcessedVideo) => {
    // Map ProcessedVideo to the Video interface expected by PlayVideoModal
    const videoForModal = {
      id: video.analytics_id || video.id.toString(),
      uuid: video.analytics_id,
      user_id: "", // Add if available in your data
      video_name: video.video_title,
      description: video.template_name || "",
      video_url: video.video_url || "",
      file_size: undefined,
      duration: undefined,
      created_at: video.created_at,
      updated_at: video.updated_at,
    };

    setSelectedVideoForPlay(videoForModal);
    setIsPlayModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Video className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-white-600 bg-green-400 border-green-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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

  // Generate gradient color based on video ID
  const getGradientColor = (id: number) => {
    const gradients = ["from-purple-400 to-purple-600"];
    return gradients[id % gradients.length];
  };

  const renderVideoThumbnail = (video: ProcessedVideo, isHovered: boolean) => (
    <div
      className="relative aspect-video cursor-pointer group"
      onMouseEnter={() => setHoveredVideo(video.id)}
      onMouseLeave={() => setHoveredVideo(null)}
      onClick={() => handlePlayVideo(video)} // ADD THIS LINE
    >
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.video_title}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getGradientColor(
            video.id
          )} rounded-lg`}
        >
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg
              className="w-full h-full"
              viewBox="0 0 60 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id={`grid-${video.id}`}
                  width="12"
                  height="12"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 12 0 L 0 0 0 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={`url(#grid-${video.id})`}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Video Icon in Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-black bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Video className="w-6 h-6 text-white opacity-60" />
        </div>
      </div>

      {/* Play Button Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
          <Play className="w-6 h-6 text-gray-800 ml-1" />
        </div>
      </div>

      {/* Duration Badge */}
      {/* {video.processing_duration && (
      <div className="absolute bottom-2 right-2">
        <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-md font-medium">
          {video.processing_duration}
        </div>
      </div>
    )} */}
    </div>
  );

  const renderVideoCard = (video: ProcessedVideo) => {
    const isHovered = hoveredVideo === video.id;

    return (
      <div
        key={video.id}
        className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 ${
          selectedVideos.has(video.id)
            ? "border-purple-500 bg-purple-50"
            : "border-gray-200"
        }`}
      >
        {/* Thumbnail Section */}
        {renderVideoThumbnail(video, isHovered)}

        {/* Content Section */}
        <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Header with improved layout */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {isSelectMode && (
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 text-base leading-6 line-clamp-2 mb-2 whitespace-nowrap"
                    title={video.video_title}
                  >
                    {video.video_title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-sm whitespace-nowrap">
                      {formatDate(video.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern status badge */}
            </div>
            <div className="flex-shrink-0">
              <span
                className={`inline-flex items-center px-1 py-1 text-xs font-medium rounded-full  ${getStatusColor(
                  video.processing_status
                )}`}
              >
                {video.processing_status}
              </span>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 gap-1 mb-6">
              {video.template_name &&
                video.template_name !== "Unknown Template" && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Template
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {video.template_name}
                    </span>
                  </div>
                )}

              {video.profile_name &&
                video.profile_name !== "Unknown Profile" && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Profile
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {video.profile_name}
                    </span>
                  </div>
                )}

              {video.sub_profile_name &&
                video.sub_profile_name !== "Unknown Sub-Profile" && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Sub-Profile
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {video.sub_profile_name}
                    </span>
                  </div>
                )}

              {video.processing_status === "completed" &&
                video.confidence_score &&
                video.confidence_score > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-emerald-700">
                      Confidence
                    </span>
                    <span className="text-sm text-emerald-900 font-bold">
                      {video.confidence_score}%
                    </span>
                  </div>
                )}

              {video.processing_status === "failed" && video.error_message && (
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="text-sm">
                    <span className="font-medium text-red-800">Error: </span>
                    <span className="text-red-700">{video.error_message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with updated timestamp */}
            <div className="flex items-center justify-between text-xs text-gray-500 pb-4 border-b border-gray-100 mb-4">
              <span>Last updated</span>
              <span className="font-medium">
                {formatDate(video.updated_at)}
              </span>
            </div>

            {/* Modern action buttons */}
            <div className="flex space-x-3">
              {video.processing_status === "completed" ? (
                <button
                  onClick={() =>
                    handleViewMetrics(video.analytics_id || video.id.toString())
                  }
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg border border-indigo-400 hover:border-purple-500 transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                >
                  View Metrics
                </button>
              ) : (
                <div className="flex-1 bg-gray-100 text-gray-500 font-medium py-2.5 px-4 rounded-xl text-center">
                  {video.processing_status === "processing" ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Failed"
                  )}
                </div>
              )}

              <button
                onClick={() =>
                  handleDeleteVideo(video.analytics_id || video.id.toString())
                }
                className="px-3 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200 hover:scale-105"
                title="Delete video"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = (video: ProcessedVideo) => (
    <div
      key={video.id}
      className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
        selectedVideos.has(video.id)
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200"
      }`}
    >
      <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {isSelectMode && (
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedVideos.has(video.id)}
                onChange={() => handleSelectVideo(video.id)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
              />
            </div>
          )}

          {/* Enhanced Thumbnail */}
          <div
            className="relative w-20 h-12 flex-shrink-0 group cursor-pointer"
            onClick={() => handlePlayVideo(video)}
          >
            {" "}
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.video_title}
                className="w-full h-full object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${getGradientColor(
                  video.id
                )} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
              >
                <Video className="w-5 h-5 text-white/70" />
              </div>
            )}
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and Status */}
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900 truncate text-base leading-5">
                {video.video_title}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                  video.processing_status
                )}`}
              >
                {video.processing_status === "processing" && (
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse mr-1.5"></div>
                )}
                {video.processing_status}
              </span>
            </div>

            {/* Metadata row */}
            <div className="flex items-center text-sm text-gray-600 space-x-6">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {formatDate(video.updated_at)}
                </span>
              </div>

              {video.processing_status === "completed" &&
                video.confidence_score &&
                video.confidence_score > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-emerald-700">
                      {video.confidence_score}%
                    </span>
                  </div>
                )}

              {/* {video.processing_duration && (
          <span className="text-gray-500">{video.processing_duration}</span>
        )} */}
            </div>

            {/* Profile info */}
            {video.profile_name && video.profile_name !== "Unknown Profile" && (
              <div className="flex items-center mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                  {video.profile_name}
                </span>
              </div>
            )}

            {/* Error state */}
            {video.processing_status === "failed" && video.error_message && (
              <div className="flex items-center mt-2 p-2 bg-red-50 rounded-md border border-red-100">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-red-700 text-xs">
                  {video.error_message}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modern Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {video.processing_status === "completed" && (
            <button
              onClick={() =>
                handleViewMetrics(video.analytics_id || video.id.toString())
              }
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Metrics
            </button>
          )}

          <button
            onClick={() => handleDeleteVideo(video.analytics_id)}
            className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
            title="Delete video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompactView = (video: ProcessedVideo) => (
    <div
      key={video.id}
      className={`bg-white border rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
        selectedVideos.has(video.id)
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center space-x-3">
        {isSelectMode && (
          <input
            type="checkbox"
            checked={selectedVideos.has(video.id)}
            onChange={() => handleSelectVideo(video.id)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
          />
        )}

        <div
          className={`w-10 h-10 bg-gradient-to-br ${getGradientColor(
            video.id
          )} rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer`}
          onClick={() => handlePlayVideo(video)}
        >
          <Video className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm">
            {video.video_title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatDate(video.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {video.processing_status === "completed" && (
            <button
              onClick={() =>
                handleViewMetrics(video.analytics_id || video.id.toString())
              }
              className="p-2 text-teal-600 hover:text-teal-700 transition-colors hover:bg-teal-50 rounded-md"
              title="View metrics"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteVideo(video.analytics_id)}
            className="p-2 text-red-600 hover:text-red-700 transition-colors hover:bg-red-50 rounded-md"
            title="Delete video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-600">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 bg-gradient-to-br from-blue-300 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl ">
          <div className="flex flex-col space-y-4 py-4 sm:py-6 ">
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 ">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  Processed Videos
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 text-white text-xs sm:text-sm font-medium rounded-full">
                    {filteredVideos.length}
                  </span>
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  View and manage your processed video analytics
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {autoRefresh && refreshInterval && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Auto-refresh
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons - Responsive Layout */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start space-x-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Auto-refresh</span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={mockMode}
                      onChange={(e) => setMockMode(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Mock</span>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleRefresh}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
                    <span className="hidden sm:inline">
                      {loading ? "Refreshing..." : "Refresh"}
                    </span>
                    <span className="sm:hidden">
                      {loading ? "..." : "Refresh"}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`relative flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showFilter || getActiveFilterCount() > 0
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filter
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelectMode
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {isSelectMode ? "Cancel Select" : "Select"}
                  </button>
                </div>
              </div>
            </div>

            {/* View Mode Controls and Bulk Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 flex-shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      viewMode === "grid"
                        ? "bg-purple-500 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    <span className="ml-1 sm:ml-2 hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      viewMode === "list"
                        ? "bg-purple-500 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <span className="ml-1 sm:ml-2 hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("compact")}
                    className={`p-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                      viewMode === "compact"
                        ? "bg-purple-500 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <span className="ml-1 sm:ml-2 hidden sm:inline">
                      Compact
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {selectedVideos.size > 0 && (
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">
                      {selectedVideos.size} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="inline-flex items-center px-2 sm:px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1 sm:mr-2"></div>
                          <span className="hidden sm:inline">Deleting...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSelectAll}
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {selectedVideos.size === processedVideos.length
                      ? "Deselect All"
                      : "Select All"}
                  </span>
                  <span className="sm:hidden">
                    {selectedVideos.size === processedVideos.length
                      ? "None"
                      : "All"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {newVideoAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              <div className="text-green-800 text-sm">{newVideoAlert}</div>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteResult && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-blue-800 text-sm">{bulkDeleteResult}</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Filter Videos
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      searchQuery: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {getUniqueStatuses().map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => handleStatusFilter(status)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {status}
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          status
                        )}`}
                      >
                        {
                          allVideos.filter(
                            (v) => v.processing_status === status
                          ).length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Profile Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getUniqueProfiles().map((profile) => (
                    <label key={profile} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.profiles.includes(profile)}
                        onChange={() => handleProfileFilter(profile)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                      />
                      <span
                        className="text-sm text-gray-700 truncate"
                        title={profile}
                      >
                        {profile}
                      </span>
                      <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {
                          allVideos.filter((v) => v.profile_name === profile)
                            .length
                        }
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.from}
                      onChange={(e) =>
                        setFilters((prev: { dateRange: any }) => ({
                          ...prev,
                          dateRange: {
                            ...prev.dateRange,
                            from: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.to}
                      onChange={(e) =>
                        setFilters((prev: { dateRange: any }) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white-900 mb-2">
              No processed videos found
            </h2>
            <p className="text-black-500 text-sm mb-6 max-w-md mx-auto">
              Videos that have completed processing will appear here
              {autoRefresh && " and update automatically"}
            </p>
          </div>
        ) : (
          <>
            {selectedVideos.size > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-purple-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-purple-800 font-medium">
                      {selectedVideos.size} video
                      {selectedVideos.size > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const clearSelection = new Set<number>();
                        processedVideos.forEach(() => clearSelection.clear());
                      }}
                      className="text-purple-700 hover:text-purple-800 text-sm font-medium px-3 py-1 hover:bg-purple-100 rounded-md transition-colors"
                    >
                      Clear selection
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-2"></div>
                          <span className="hidden sm:inline">Deleting...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="hidden sm:inline">
                            Delete Selected
                          </span>
                          <span className="sm:hidden">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid/List */}
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-10"
                  : viewMode === "list"
                  ? "space-y-4"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4"
              }`}
            >
              {filteredVideos.map((video) =>
                viewMode === "list"
                  ? renderListView(video)
                  : viewMode === "compact"
                  ? renderCompactView(video)
                  : renderVideoCard(video)
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                {/* Mobile Pagination */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-lg sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Previous
                  </button>

                  <span className="text-sm text-gray-700 px-4">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <svg
                      className="w-4 h-4 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalCount)}
                      </span>{" "}
                      of <span className="font-medium">{totalCount}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {Array.from(
                        { length: Math.min(totalPages, 7) },
                        (_, i) => {
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
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors ${
                                currentPage === pageNum
                                  ? "z-10 bg-purple-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
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

      <PlayVideoModal
        video={selectedVideoForPlay}
        isOpen={isPlayModalOpen}
        onClose={() => {
          setIsPlayModalOpen(false);
          setSelectedVideoForPlay(null);
        }}
      />
    </div>
  );
};

export default ProcessedVideosUI;

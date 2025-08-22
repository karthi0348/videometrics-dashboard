import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import VideoActionsModal from '../Modal/Video/VideoActionsModal';

// Types based on your API response
interface Video {
  id: string;
  uuid?: string;
  user_id: string;
  video_name: string;
  description?: string;
  video_url: string;
  file_size?: number;
  duration?: number;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'grid' | 'list' | 'compact';

interface VideoTableProps {
  viewMode: ViewMode;
  searchQuery?: string;
  sortBy?: 'video_name' | 'created_at' | 'file_size';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  refreshTrigger?: number;
  onVideoCount?: (count: number) => void;
  // Select functionality props
  isSelectMode?: boolean;
  selectedVideos?: string[];
  onVideoSelect?: (videoId: string) => void;
  onVideoDeselect?: (videoId: string) => void;
}

interface VideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (videoId: string) => void;
  onDeselect?: (videoId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onVideoClick, 
  isSelectMode = false,
  isSelected = false,
  onSelect,
  onDeselect 
}) => {
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCardClick = () => {
    if (isSelectMode) {
      if (isSelected) {
        onDeselect?.(video.id);
      } else {
        onSelect?.(video.id);
      }
    } else {
      onVideoClick(video);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group relative ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Selection indicator */}
      {isSelectMode && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'bg-blue-500 border-blue-500' 
              : 'bg-white border-gray-300 group-hover:border-blue-400'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}
      
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
          <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-3">
            {isSelectMode ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2" title={video.video_name}>
          {video.video_name}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={video.description}>
            {video.description}
          </p>
        )}
        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatFileSize(video.file_size)}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{formatDuration(video.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span>Uploaded:</span>
            <span>{formatDate(video.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoTable: React.FC<VideoTableProps> = ({ 
  viewMode, 
  searchQuery = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  dateFrom = '',
  dateTo = '',
  refreshTrigger = 0,
  onVideoCount,
  isSelectMode = false,
  selectedVideos = [],
  onVideoSelect,
  onVideoDeselect
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 12;

  const fetchVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('No authentication token found. Please log in.');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`${API_ENDPOINTS.LIST_VIDEOS || '/video-urls'}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let videoList: Video[] = [];
      let total = 0;
      
      if (Array.isArray(data)) {
        videoList = data;
        total = data.length;
      } else if (data.results && Array.isArray(data.results)) {
        videoList = data.results;
        total = data.count || data.total || data.results.length;
      } else if (data.data && Array.isArray(data.data)) {
        videoList = data.data;
        total = data.total || data.count || data.data.length;
      }

      // Apply client-side filtering for date range
      if (dateFrom || dateTo) {
        videoList = videoList.filter(video => {
          const videoDate = new Date(video.created_at);
          const fromDate = dateFrom ? new Date(dateFrom) : null;
          const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null; // Include full day
          
          if (fromDate && videoDate < fromDate) return false;
          if (toDate && videoDate > toDate) return false;
          return true;
        });
        total = videoList.length;
      }

      // Sort videos client-side if needed
      const sortedVideos = [...videoList].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'video_name':
            aValue = a.video_name?.toLowerCase() || '';
            bValue = b.video_name?.toLowerCase() || '';
            break;
          case 'file_size':
            aValue = a.file_size || 0;
            bValue = b.file_size || 0;
            break;
          case 'created_at':
          default:
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setVideos(sortedVideos);
      setTotalVideos(total);
      onVideoCount?.(total);
      
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on component mount and when dependencies change
  useEffect(() => {
    fetchVideos(1);
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder, dateFrom, dateTo, refreshTrigger]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchVideos(newPage);
  };

  const handleVideoClick = (video: Video) => {
    if (!isSelectMode) {
      setSelectedVideo(video);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleVideoDeleted = () => {
    // Refresh the video list after deletion
    fetchVideos(currentPage);
  };

  const handleVideoUpdated = () => {
    // Refresh the video list after update
    fetchVideos(currentPage);
  };

  const handleVideoSelect = (videoId: string) => {
    onVideoSelect?.(videoId);
  };

  const handleVideoDeselect = (videoId: string) => {
    onVideoDeselect?.(videoId);
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Videos</h3>
        <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
        <button
          onClick={() => fetchVideos(currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
        <p className="text-gray-600 text-center max-w-md">
          {searchQuery || dateFrom || dateTo ? 
            `No videos match your current filters. Try adjusting your search criteria.` : 
            'Upload your first video to get started.'
          }
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <>
        <div className="space-y-6">
          {isSelectMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 font-medium">
                    Click on videos to select them
                  </span>
                </div>
                <span className="text-blue-600 text-sm">
                  {selectedVideos.length} of {videos.length} selected
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onVideoClick={handleVideoClick}
                isSelectMode={isSelectMode}
                isSelected={selectedVideos.includes(video.id)}
                onSelect={handleVideoSelect}
                onDeselect={handleVideoDeselect}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalVideos > pageSize && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(totalVideos / pageSize)}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalVideos / pageSize)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Video Actions Modal */}
        <VideoActionsModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onVideoDeleted={handleVideoDeleted}
          onVideoUpdated={handleVideoUpdated}
        />
      </>
    );
  }

  // List/Table View
  return (
    <>
      <div className="space-y-4">
        {isSelectMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  Select videos
                </span>
              </div>
              <span className="text-blue-600 text-sm">
                {selectedVideos.length} of {videos.length} selected
              </span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {isSelectMode && (
                    <th className="text-left py-3 px-4 font-medium text-gray-900 w-12">
                      Select
                    </th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Video</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Uploaded</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.map((video) => (
                  <tr 
                    key={video.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedVideos.includes(video.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {isSelectMode && (
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleVideoSelect(video.id);
                            } else {
                              handleVideoDeselect(video.id);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-gray-900 truncate ${
                            !isSelectMode ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''
                          }`}
                             title={video.video_name}
                             onClick={!isSelectMode ? () => handleVideoClick(video) : undefined}>
                            {video.video_name}
                          </p>
                          {video.description && (
                            <p className="text-sm text-gray-500 truncate" title={video.description}>
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatFileSize(video.file_size)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDuration(video.duration)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(video.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        {!isSelectMode && (
                          <button
                            onClick={() => handleVideoClick(video)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1.5"
                            title="View video details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalVideos > pageSize && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(totalVideos / pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalVideos / pageSize)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Video Actions Modal */}
      <VideoActionsModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onVideoDeleted={handleVideoDeleted}
        onVideoUpdated={handleVideoUpdated}
      />
    </>
  );
};

export default VideoTable;
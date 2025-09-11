import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';

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

interface VideoActionsModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoDeleted: () => void;
  onVideoUpdated: () => void;
}

type ModalTab = 'view' | 'edit' | 'delete';

// Streaming API response interface
interface StreamingResponse {
  success: boolean;
  streaming_url: string;
  expires_at: string;
  original_url: string;
}

const VideoActionsModal: React.FC<VideoActionsModalProps> = ({
  video,
  isOpen,
  onClose,
  onVideoDeleted,
  onVideoUpdated
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('view');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [editData, setEditData] = useState({
    video_name: '',
    description: ''
  });

  // Reset state when modal opens/closes or video changes
  useEffect(() => {
    if (video) {
      setEditData({
        video_name: video.video_name,
        description: video.description || ''
      });
      setActiveTab('view');
    }
    setIsDeleting(false);
    setIsUpdating(false);
    setIsLoadingStream(false);
  }, [video, isOpen]);

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStreamingUrl = async (videoUrl: string, expirationMinutes: number = 60): Promise<string | null> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://172.174.114.7:8000/get-streaming-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          expiration_minutes: expirationMinutes
        }),
      });

      if (response.ok) {
        const data: StreamingResponse = await response.json();
        if (data.success) {
          return data.streaming_url;
        } else {
          throw new Error('Failed to get streaming URL');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get streaming URL');
      }
    } catch (error) {
      console.error('Error getting streaming URL:', error);
      return null;
    }
  };

  const handlePlayVideo = async () => {
    if (!video?.video_url) return;

    setIsLoadingStream(true);
    try {
      // Get streaming URL from the API
      const streamingUrl = await getStreamingUrl(video.video_url);
      
      if (streamingUrl) {
        // Open the streaming URL in a new tab
        window.open(streamingUrl, '_blank');
      } else {
        // Fallback to original URL if streaming API fails
        alert('Failed to get streaming URL. Opening original video URL.');
        window.open(video.video_url, '_blank');
      }
    } catch (error) {
      console.error('Error playing video:', error);
      alert('Failed to play video. Please try again.');
    } finally {
      setIsLoadingStream(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!video || !editData.video_name.trim()) return;

    setIsUpdating(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_ENDPOINTS.UPDATE_VIDEO?.replace('{video_id}', video.id) || `/video-urls/${video.id}`}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_name: editData.video_name.trim(),
          description: editData.description.trim()
        }),
      });

      if (response.ok) {
        onVideoUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!video) return;

    setIsDeleting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_ENDPOINTS.DELETE_VIDEO?.replace('{video_id}', video.id) || `/video-urls/${video.id}`}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onVideoDeleted();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Video Actions</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'view'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'edit'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'delete'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {/* View Tab */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button
                      onClick={handlePlayVideo}
                      disabled={isLoadingStream}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                    >
                      {isLoadingStream ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Play Video
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Video Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black-700 mb-1">Video Name</label>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{video.video_name}</p>
                  </div>
                  
                  {video.description && (
                    <div>
                      <label className="block text-sm font-medium text-black-700 mb-1">Description</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{video.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{formatFileSize(video.file_size)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{formatDuration(video.duration)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm">{formatDate(video.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm">{formatDate(video.updated_at)}</p>
                    </div>
                  </div>

                  {video.video_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900 bg-gray-50 rounded-lg p-3 flex-1 text-sm font-mono truncate">
                          {video.video_url}
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(video.video_url)}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Copy URL"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit Tab */}
            {activeTab === 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Name *</label>
                  <input
                    type="text"
                    value={editData.video_name}
                    onChange={(e) => setEditData({ ...editData, video_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video description (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateVideo}
                    disabled={!editData.video_name.trim() || isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Video'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Delete Tab */}
            {activeTab === 'delete' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Video</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-medium">{video.video_name}</span>? 
                    This action cannot be undone and will permanently remove the video from your account.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-medium">Warning</h4>
                      <p className="text-red-700 text-sm mt-1">
                        This will permanently delete the video file and all associated data. 
                        Make sure you have a backup if you need to keep this content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteVideo}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Video
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoActionsModal;
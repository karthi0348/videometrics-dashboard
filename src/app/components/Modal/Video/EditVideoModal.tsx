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

interface EditVideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoUpdated: () => void;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({
  video,
  isOpen,
  onClose,
  onVideoUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    video_name: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    video_name: ''
  });

  // Reset form when modal opens/closes or video changes
  useEffect(() => {
    if (video) {
      setEditData({
        video_name: video.video_name,
        description: video.description || ''
      });
    }
    setErrors({ video_name: '' });
    setIsUpdating(false);
  }, [video, isOpen]);

  const validateForm = () => {
    const newErrors = { video_name: '' };
    
    if (!editData.video_name.trim()) {
      newErrors.video_name = 'Video name is required';
    } else if (editData.video_name.trim().length < 3) {
      newErrors.video_name = 'Video name must be at least 3 characters';
    } else if (editData.video_name.trim().length > 255) {
      newErrors.video_name = 'Video name must be less than 255 characters';
    }

    setErrors(newErrors);
    return !newErrors.video_name;
  };

  const handleUpdateVideo = async () => {
    if (!video || !validateForm()) return;

    setIsUpdating(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_ENDPOINTS.UPDATE_VIDEO?.replace('{video_id}', video.id) || `/video-urls/${video.id}`}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_name: editData.video_name.trim(),
            description: editData.description.trim()
          }),
        }
      );

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

  const handleCancel = () => {
    if (video) {
      setEditData({
        video_name: video.video_name,
        description: video.description || ''
      });
    }
    setErrors({ video_name: '' });
    onClose();
  };

  if (!isOpen || !video) return null;

  const hasChanges = 
    editData.video_name.trim() !== video.video_name ||
    editData.description.trim() !== (video.description || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancel}></div>
      
      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-2 py-4 sm:px-4 sm:py-6">
        <div className="relative bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 truncate">Edit Video</h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-4rem)] sm:max-h-[calc(90vh-5rem)]">
            <div className="space-y-4 sm:space-y-6">
              
              {/* Current Video Info */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Current Video</h3>
                <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{video.video_name}</p>
                {video.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{video.description}</p>
                )}
              </div>

              {/* Edit Form */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Video Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.video_name}
                    onChange={(e) => {
                      setEditData({ ...editData, video_name: e.target.value });
                      if (errors.video_name) {
                        setErrors({ video_name: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 sm:py-3 text-sm sm:text-base border rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.video_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter video name"
                    maxLength={255}
                  />
                  {errors.video_name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.video_name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {editData.video_name.length}/255 characters
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[75px] sm:min-h-[100px]"
                    placeholder="Enter video description (optional)"
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {editData.description.length}/1000 characters
                  </p>
                </div>

                {/* Changes Indicator */}
                {hasChanges && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg p-2 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-800 text-xs sm:text-sm">You have unsaved changes</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-md sm:rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVideo}
                  disabled={!hasChanges || isUpdating || !!errors.video_name}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="hidden sm:inline">Updating...</span>
                      <span className="sm:hidden">Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Update Video</span>
                      <span className="sm:hidden">Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;
import React, { useState, useRef, useEffect } from 'react';

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

interface PlayVideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

// Streaming API response interface
interface StreamingResponse {
  success: boolean;
  streaming_url: string;
  expires_at: string;
  original_url: string;
}

const PlayVideoModal: React.FC<PlayVideoModalProps> = ({
  video,
  isOpen,
  onClose
}) => {
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStreamingUrl(null);
      setIsPlaying(false);
      setVideoError(null);
      setIsLoadingStream(false);
    }
  }, [isOpen]);

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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
    setVideoError(null);
    
    try {
      const url = await getStreamingUrl(video.video_url);
      
      if (url) {
        setStreamingUrl(url);
        setIsPlaying(true);
      } else {
        // Fallback to original URL
        setStreamingUrl(video.video_url);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setVideoError('Failed to load video. Please try again.');
    } finally {
      setIsLoadingStream(false);
    }
  };

  const handleVideoError = () => {
    setVideoError('Failed to play video. The video format may not be supported.');
    setIsPlaying(false);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setStreamingUrl(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleModalClose = () => {
    handleClosePlayer();
    onClose();
  };

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={handleModalClose}></div>
      
      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-2 py-4 sm:px-4 sm:py-6">
        <div className="relative bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                {isPlaying ? 'Playing Video' : 'Play Video'}
              </h2>
            </div>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-4rem)] sm:max-h-[calc(90vh-5rem)]">
            
            {/* Video Player or Preview */}
            <div className="aspect-video bg-black rounded-md sm:rounded-lg mb-4 sm:mb-6 relative overflow-hidden">
              {isPlaying && streamingUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={streamingUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    onError={handleVideoError}
                  />
                  {/* Close Player Button */}
                  <button
                    onClick={handleClosePlayer}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center px-2">
                    {videoError ? (
                      <>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-red-300 text-sm sm:text-base mb-4">{videoError}</p>
                        <button
                          onClick={handlePlayVideo}
                          className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-red-600 text-white rounded-md sm:rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base md:text-lg font-medium"
                        >
                          Try Again
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <button
                          onClick={handlePlayVideo}
                          disabled={isLoadingStream}
                          className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-md sm:rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto text-sm sm:text-base md:text-lg font-medium"
                        >
                          {isLoadingStream ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                              <span className="hidden sm:inline">Loading Stream...</span>
                              <span className="sm:hidden">Loading...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Play Video
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Info - Only show when not playing or in compact mode */}
            {(!isPlaying || window.innerWidth < 768) && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 break-words">{video.video_name}</h3>
                  {video.description && (
                    <p className="text-sm sm:text-base text-gray-600 break-words">{video.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="text-center sm:text-left">
                    <span className="text-xs sm:text-sm text-gray-500 block mb-1">File Size</span>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{formatFileSize(video.file_size)}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xs sm:text-sm text-gray-500 block mb-1">Duration</span>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{formatDuration(video.duration)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
              {isPlaying && (
                <button
                  onClick={handleClosePlayer}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-orange-700 bg-orange-50 border border-orange-200 rounded-md sm:rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Stop Playing
                </button>
              )}
              <button
                onClick={handleModalClose}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-md sm:rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayVideoModal;
import React, { useState, useCallback } from "react";
import ProcessVideoPage from "../ProcessVideo/ProcessVideoPage";
import ProcessedVideosPage from "../ProcessedVideos/ProcessedVideosPage";

interface ProcessedVideo {
  id: number;
  analytics_id: string;
  video_title: string;
  video_url?: string;
  thumbnail_url?: string;
  processing_status: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  profile_name?: string;
  sub_profile_name?: string;
  template_name?: string;
  error_message?: string;
  processing_duration?: string;
  file_size?: string;
  video_duration?: string;
}

type ActiveTab = 'process' | 'processed';

const VideoWorkflowCoordinator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('process');
  const [newProcessedVideo, setNewProcessedVideo] = useState<ProcessedVideo | undefined>(undefined);

  // Callback for when a video completes processing in ProcessVideoPage
  const handleVideoProcessed = useCallback((processedVideoData: any) => {
    console.log("Video processing completed:", processedVideoData);
    
    // Transform the data to match ProcessedVideo interface
    const processedVideo: ProcessedVideo = {
      id: processedVideoData.id || Date.now(),
      analytics_id: processedVideoData.analytics_id || processedVideoData.uuid,
      video_title: processedVideoData.video_title || processedVideoData.video_name || 'Untitled Video',
      video_url: processedVideoData.video_url,
      thumbnail_url: processedVideoData.thumbnail_url,
      processing_status: processedVideoData.processing_status,
      confidence_score: processedVideoData.confidence_score || 0,
      created_at: processedVideoData.created_at,
      updated_at: processedVideoData.updated_at,
      profile_name: processedVideoData.profile_name,
      sub_profile_name: processedVideoData.sub_profile_name,
      template_name: processedVideoData.template_name,
      error_message: processedVideoData.error_message,
      processing_duration: processedVideoData.processing_duration,
      file_size: processedVideoData.file_size,
      video_duration: processedVideoData.video_duration
    };

    // Pass to ProcessedVideosPage
    setNewProcessedVideo(processedVideo);

    // Show notification and optionally switch tabs
    if (processedVideo.processing_status === 'completed') {
      // Optional: Auto-switch to processed videos tab
      // setActiveTab('processed');
      
      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Video Processing Complete`, {
          body: `"${processedVideo.video_title}" is ready for viewing!`,
          icon: '/favicon.ico' // Replace with your app icon
        });
      }
    }
  }, []);

  // Callback for when ProcessedVideosPage receives the new video
  const handleNewVideoReceived = useCallback(() => {
    // Clear the new video state after it's been received
    setNewProcessedVideo(undefined);
  }, []);

  // Request notification permission on component mount
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('process')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'process'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z" />
                </svg>
                <span>Process Videos</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('processed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'processed'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Processed Videos</span>
                {/* NEW: Notification dot for new processed videos */}
                {newProcessedVideo && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    !
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'process' && (
          <ProcessVideoPage
            videos={[]} // Pass your videos here or let the component load them
            profiles={[]} // Pass your profiles here or let the component load them
            subProfiles={[]} // Pass your sub-profiles here or let the component load them
            templates={[]} // Pass your templates here if needed
            onVideoProcessed={handleVideoProcessed} // NEW: Callback for completed videos
          />
        )}
        
        {activeTab === 'processed' && (
          <ProcessedVideosPage
            newProcessedVideo={newProcessedVideo} // NEW: Pass newly processed video
            onNewVideoReceived={handleNewVideoReceived} // NEW: Callback when video is received
          />
        )}
      </div>
    </div>
  );
};

export default VideoWorkflowCoordinator;
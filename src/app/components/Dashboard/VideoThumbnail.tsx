import React, { useState } from 'react';
import { Play, Clock, CheckCircle, AlertCircle, Video } from 'lucide-react';

interface VideoActivity {
  id: number;
  analytics_id?: string;
  status: string;
  created_at: string;
  processing_completed_at?: string | null;
  title?: string;
  duration?: string;
  thumbnail_color?: string;
}

interface VideoThumbnailProps {
  activity: VideoActivity;
  onClick?: (activity: VideoActivity) => void;
  showMetrics?: boolean;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ 
  activity, 
  onClick, 
  showMetrics = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Video className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate gradient color based on video ID
  const getGradientColor = (id: number) => {
    const gradients = [
      'from-blue-400 to-purple-600',

    ];
    return gradients[id % gradients.length];
  };

  const gradientColor = activity.thumbnail_color || getGradientColor(activity.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Video Thumbnail */}
      <div 
        className="relative aspect-video cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick?.(activity)}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`}>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
                  <path d="M 12 0 L 0 0 0 12" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Video Icon in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-black bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-white opacity-60" />
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-16 h-16 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
            {getStatusIcon()}
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-md font-medium">
            {activity.duration || '0:00'}
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate" title={activity.title || `Video ${activity.id}`}>
          {activity.title || `Video ${activity.id}`}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDate(activity.created_at)}</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            activity.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : activity.status === 'processing'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {activity.status}
          </span>
        </div>

        {/* Action Button */}
        {showMetrics && activity.status === 'completed' && (
          <button 
            onClick={() => onClick?.(activity)}
            className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-teal-200 hover:border-teal-300"
          >
            View Metrics
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoThumbnail;
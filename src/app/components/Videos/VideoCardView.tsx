import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";
import PlayVideoModal from "../Modal/Video/PlayVideoModal";
import EditVideoModal from "../Modal/Video/EditVideoModal";
import DeleteVideoModal from "../Modal/Video/DeleteVideoModal";
import { Video, Edit3, Trash2, Clock, Calendar, CheckCircle2 } from "lucide-react";

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

interface VideoTableProps {
  searchQuery?: string;
  sortBy?: "video_name" | "created_at" | "file_size";
  sortOrder?: "asc" | "desc";
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
  onPlayVideo: (video: Video) => void;
  onEditVideo: (video: Video) => void;
  onDeleteVideo: (video: Video) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (videoId: string) => void;
  onDeselect?: (videoId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlayVideo,
  onEditVideo,
  onDeleteVideo,
  isSelectMode = false,
  isSelected = false,
  onSelect,
  onDeselect,
}) => {
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCardClick = () => {
    if (isSelectMode) {
      if (isSelected) {
        onDeselect?.(video.id);
      } else {
        onSelect?.(video.id);
      }
    }
  };

  const getGradientColor = (id: string) => {
    const gradients = ["from-violet-500 via-purple-500 to-purple-500"];
    const idx = parseInt(id, 36) % gradients.length;
    return gradients[idx];
  };

  const gradientColor = getGradientColor(video.id);

  return (
    <div
      className={`group relative m-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
        isSelected
          ? "ring-2 ring-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-violet-200"
          : ""
      }`}
      onClick={handleCardClick}
    >
      {/* Selection indicator */}
      {isSelectMode && (
        <div className="absolute top-4 right-4 z-20">
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? "bg-violet-500 border-violet-500 scale-110"
                : "bg-white/90 backdrop-blur-sm border-gray-300 group-hover:border-violet-400 group-hover:bg-violet-50"
            }`}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          onPlayVideo(video);
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-90`}
        />
        {/* Floating play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-20 h-20 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-black/40 transition-all duration-300">
            <Video className="w-8 h-8 text-white opacity-90" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 border border-white/20">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-6">
        <h3
          className="font-bold text-gray-900 mb-2 text-lg leading-tight truncate group-hover:text-violet-600 transition-colors"
          title={video.video_name}
        >
          {video.video_name}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
        <div className="flex items-center text-sm text-gray-500 mb-4 gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        {!isSelectMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditVideo(video);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteVideo(video);
              }}
              className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:from-rose-600 hover:to-red-700 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoTable: React.FC<VideoTableProps> = ({
  searchQuery = "",
  sortBy = "created_at",
  sortOrder = "desc",
  dateFrom = "",
  dateTo = "",
  refreshTrigger = 0,
  onVideoCount,
  isSelectMode = false,
  selectedVideos = [],
  onVideoSelect,
  onVideoDeselect,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pageSize = 12;

  // fetchVideos remains same (omitted here for brevity)...

  // ✅ Only return grid
  return (
    <>
      <div className="space-y-8">
        {isSelectMode && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 shadow-sm">
            <h4 className="font-semibold text-violet-900">Selection Mode</h4>
            <p className="text-sm text-violet-700">
              Click on videos to select them
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlayVideo={(v) => {
                setSelectedVideo(v);
                setIsPlayModalOpen(true);
              }}
              onEditVideo={(v) => {
                setSelectedVideo(v);
                setIsEditModalOpen(true);
              }}
              onDeleteVideo={(v) => {
                setSelectedVideo(v);
                setIsDeleteModalOpen(true);
              }}
              isSelectMode={isSelectMode}
              isSelected={selectedVideos.includes(video.id)}
              onSelect={onVideoSelect}
              onDeselect={onVideoDeselect}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <PlayVideoModal
        video={selectedVideo}
        isOpen={isPlayModalOpen}
        onClose={() => setIsPlayModalOpen(false)}
      />
      <EditVideoModal
        video={selectedVideo}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onVideoUpdated={() => {}}
      />
      <DeleteVideoModal
        video={selectedVideo}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onVideoDeleted={() => {}}
      />
    </>
  );
};

export default VideoTable;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode } from '../../types';
import VideoUploadModal from '../Modal/Video/VideoUploadModal'; 
import VideoTable from './VideoTable';
import { API_ENDPOINTS } from '../../config/api';
import { Search, Filter, Grid3X3, List, AlignJustify, Plus, Check, Square, Download, Trash2, Upload, Calendar, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface Video {
  id: string;
  name: string;
  created_at: string;
  file_size: number;
}

interface VideoUploadResponse {
  success: boolean;
  message: string;
  video?: Video;
}

interface VideoUploadError {
  message: string;
  code?: string;
  details?: string;
}

interface FilterOptions {
  search: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
}

type ViewMode = 'grid' | 'list' | 'compact';

// Mock VideoTable component for demonstration
const VideoTable: React.FC<{
  viewMode: ViewMode;
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
  dateFrom: string;
  dateTo: string;
  refreshTrigger: number;
  onVideoCount: (count: number) => void;
  isSelectMode: boolean;
  selectedVideos: string[];
  onVideoSelect: (id: string) => void;
  onVideoDeselect: (id: string) => void;
}> = ({ onVideoCount, ...props }) => {
  useEffect(() => {
    onVideoCount(12); // Mock count
  }, [onVideoCount]);
  
  return (
    <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="text-center text-gray-600 py-12">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Video content will be displayed here</p>
      </div>
    </div>
  );
};

// Mock VideoUploadModal component
const VideoUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (response: VideoUploadResponse) => void;
  onUploadError: (error: VideoUploadError) => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4">Upload Video</h3>
        <p className="text-gray-600 mb-6">Upload modal content here</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

// Header Component
interface HeaderProps {
  videoCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAddVideo?: (video: Video) => void;
  selectedVideos?: string[];
  onFilterChange?: (filters: FilterOptions) => void;
  onTitleClick?: () => void;
  isNavigationTarget?: boolean;
  onVideoUploadSuccess?: (response: VideoUploadResponse) => void;
  onVideoUploadError?: (error: VideoUploadError) => void;
  isSelectMode?: boolean;
  onSelectModeToggle?: () => void;
  onSelectAll?: () => void;
  onBulkDelete?: (videoIds: string[]) => void;
  isBulkDeleting?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  videoCount, 
  viewMode, 
  setViewMode, 
  onAddVideo,
  selectedVideos = [],
  onFilterChange,
  onTitleClick,
  isNavigationTarget = false,
  onVideoUploadSuccess,
  onVideoUploadError,
  isSelectMode = false,
  onSelectModeToggle,
  onSelectAll,
  onBulkDelete,
  isBulkDeleting = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const filters: FilterOptions = {
      search: searchQuery,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo
    };
    onFilterChange?.(filters);
  }, [searchQuery, sortBy, sortOrder, dateFrom, dateTo, onFilterChange]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleAddVideo = () => {
    setShowUploadModal(true);
    const placeholderVideo: Video = {
      id: '',
      name: '',
      created_at: '',
      file_size: 0
    };
    onAddVideo?.(placeholderVideo);
  };

  const handleUploadSuccess = (response: VideoUploadResponse) => {
    onVideoUploadSuccess?.(response);
  };

  const handleUploadError = (error: VideoUploadError) => {
    console.error('Video upload failed:', error);
    onVideoUploadError?.(error);
  };

  const handleBulkAction = (action: 'delete') => {
    if (selectedVideos.length === 0) return;

    if (action === 'delete' && onBulkDelete) {
      onBulkDelete(selectedVideos);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
    setDateFrom('');
    setDateTo('');
  };

  const handleTitleClick = () => {
    if (onTitleClick) {
      onTitleClick();
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  const viewModes = [
    { 
      key: 'grid' as ViewMode, 
      label: 'Grid', 
      icon: Grid3X3
    },
    { 
      key: 'list' as ViewMode, 
      label: 'List', 
      icon: List
    },
    { 
      key: 'compact' as ViewMode, 
      label: 'Compact', 
      icon: AlignJustify
    }
  ];

  return (
    <>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-t-3xl shadow-xl sticky top-0 z-40">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <h1 
                    className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${
                      onTitleClick ? 'cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all' : ''
                    }`}
                    onClick={handleTitleClick}
                  >
                    Videos
                  </h1>
                  {isNavigationTarget && (
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl animate-pulse" />
                  )}
                </div>
                <div className="backdrop-blur-sm bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-300/30 rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-purple-700">{videoCount}</span>
                </div>
              </div>
              
              <button 
                className="backdrop-blur-sm bg-white/70 hover:bg-white/90 border border-white/30 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2 inline" />
                Filters
              </button>
            </div>

            {/* View Mode & Select Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl p-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.key}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === mode.key 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-white/70'
                      }`}
                      onClick={() => handleViewModeChange(mode.key)}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              <button 
                className={`backdrop-blur-sm border px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg ${
                  isSelectMode 
                    ? 'bg-gray-800/90 text-white border-gray-600/30 hover:bg-gray-900/90' 
                    : 'bg-white/70 text-gray-700 border-white/30 hover:bg-white/90'
                }`}
                onClick={onSelectModeToggle}
              >
                {isSelectMode ? <Check className="w-4 h-4 mr-2 inline" /> : <Square className="w-4 h-4 mr-2 inline" />}
                Select
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="backdrop-blur-md bg-white/60 border-b border-white/20 px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select 
                    className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  >
                    <option value="date">Upload Date</option>
                    <option value="name">Name</option>
                    <option value="size">File Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <div className="flex backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl p-1">
                    <button 
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        sortOrder === 'desc' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                      onClick={() => setSortOrder('desc')}
                    >
                      <ArrowDown className="w-4 h-4 mr-2 inline" />
                      Newest
                    </button>
                    <button 
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        sortOrder === 'asc' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                      onClick={() => setSortOrder('asc')}
                    >
                      <ArrowUp className="w-4 h-4 mr-2 inline" />
                      Oldest
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input 
                      type="date" 
                      className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input 
                      type="date" 
                      className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/90 transition-all"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Selected Videos Bar */}
          {selectedVideos.length > 0 && (
            <div className="backdrop-blur-md bg-blue-50/80 border-b border-blue-200/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedVideos.length} selected
                </span>
                <button 
                  className="backdrop-blur-sm bg-red-100/80 hover:bg-red-200/80 border border-red-200/50 px-4 py-2 rounded-xl text-sm font-medium text-red-700 transition-all disabled:opacity-50"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 space-y-6 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-3 flex-wrap">
                  <div className="relative">
                    <h1 
                      className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center m-0 ${
                        onTitleClick ? 'cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all' : ''
                      }`}
                      onClick={handleTitleClick}
                      role={onTitleClick ? 'button' : undefined}
                      tabIndex={onTitleClick ? 0 : undefined}
                    >
                      Videos
                      {onTitleClick && (
                        <ArrowUpDown className="ml-3 w-5 h-5 text-purple-600" />
                      )}
                    </h1>
                    {isNavigationTarget && (
                      <div className="absolute -inset-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="backdrop-blur-sm bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-300/30 rounded-full px-4 py-2">
                      <span className="text-sm font-semibold text-purple-700">{videoCount} videos</span>
                    </div>
                    {selectedVideos.length > 0 && (
                      <div className="backdrop-blur-sm bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-300/30 rounded-full px-4 py-2">
                        <span className="text-sm font-semibold text-blue-700">{selectedVideos.length} selected</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 m-0">Manage and analyze your video content with modern tools</p>
              </div>

              <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 backdrop-blur-sm bg-white/60 border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm shadow-lg placeholder-gray-500"
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex space-x-1 backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-1">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.key}
                      className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        viewMode === mode.key 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                      onClick={() => handleViewModeChange(mode.key)}
                      title={`Switch to ${mode.label} view`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="ml-2 hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex space-x-3">
                <button 
                  className="backdrop-blur-sm bg-white/70 hover:bg-white/90 border border-white/30 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-lg hover:shadow-xl"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2 inline" />
                  <span className="hidden sm:inline">Filters</span>
                  <div className={`ml-2 w-2 h-2 rounded-full transition-colors ${showFilters ? 'bg-purple-500' : 'bg-transparent'}`} />
                </button>

                <button 
                  className={`backdrop-blur-sm border px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl ${
                    isSelectMode 
                      ? 'bg-gray-800/90 text-white border-gray-600/30 hover:bg-gray-900/90' 
                      : 'bg-white/70 text-gray-700 border-white/30 hover:bg-white/90'
                  }`}
                  onClick={onSelectModeToggle}
                >
                  {isSelectMode ? <Check className="w-4 h-4 mr-2 inline" /> : <Square className="w-4 h-4 mr-2 inline" />}
                  <span className="hidden sm:inline">{isSelectMode ? 'Exit Select' : 'Select Videos'}</span>
                </button>

                <button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all backdrop-blur-sm"
                  onClick={handleAddVideo}
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Video
                </button>
              </div>
            </div>
          </div>

          {selectedVideos.length > 0 && (
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-t border-white/20 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    <strong className="text-blue-700">{selectedVideos.length}</strong> video{selectedVideos.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    className="backdrop-blur-sm bg-red-100/80 hover:bg-red-200/80 border border-red-200/50 px-4 py-2 rounded-xl text-sm font-medium text-red-700 transition-all disabled:opacity-50"
                    onClick={() => handleBulkAction('delete')}
                    disabled={isBulkDeleting}
                  >
                    {isBulkDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2 inline" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="backdrop-blur-md bg-gradient-to-br from-gray-50/60 to-white/60 border-t border-white/20 px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select 
                    className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 shadow-lg"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  >
                    <option value="date">Upload Date</option>
                    <option value="name">Name</option>
                    <option value="size">File Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <div className="flex backdrop-blur-sm bg-white/50 border border-white/30 rounded-xl p-1 shadow-lg">
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        sortOrder === 'desc' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                      onClick={() => setSortOrder('desc')}
                    >
                      <ArrowDown className="w-3 h-3 mr-2 inline" />
                      <span className="hidden sm:inline">Newest</span>
                    </button>
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        sortOrder === 'asc' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-white/70'
                      }`}
                      onClick={() => setSortOrder('asc')}
                    >
                      <ArrowUp className="w-3 h-3 mr-2 inline" />
                      <span className="hidden sm:inline">Oldest</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input 
                    type="date" 
                    className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 shadow-lg"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Start date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input 
                    type="date" 
                    className="block w-full px-4 py-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 shadow-lg"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 space-y-3 sm:space-y-0">
                <button 
                  className="backdrop-blur-sm bg-white/80 hover:bg-white/90 border border-white/30 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 transition-all shadow-lg hover:shadow-xl"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
                {onSelectAll && !isSelectMode && (
                  <button 
                    className="backdrop-blur-sm bg-gradient-to-r from-purple-100/80 to-blue-100/80 hover:from-purple-200/80 hover:to-blue-200/80 border border-purple-300/30 px-4 py-3 rounded-xl text-sm font-medium text-purple-700 transition-all shadow-lg hover:shadow-xl"
                    onClick={onSelectAll}
                  >
                    Select All Videos
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Video Button - Fixed Position for Mobile */}
      {isMobile && (
        <button 
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all backdrop-blur-sm border border-white/20"
          onClick={handleAddVideo}
        >
          <Plus className="w-6 h-6 mr-2 inline" />
          Add Video
        </button>
      )}

      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    </>
  );
};

// Main VideosPage Component
interface VideoFilters {
  search: string;
  sortBy: 'video_name' | 'created_at' | 'file_size';
  sortOrder: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
}

const VideosPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [videoCount, setVideoCount] = useState(0);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showNotification, setShowNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [filters, setFilters] = useState<VideoFilters>({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = useCallback((newFilters: Partial<VideoFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const handleVideoCount = useCallback((count: number) => {
    setVideoCount(count);
  }, []);

  const handleSelectModeToggle = useCallback(() => {
    setIsSelectMode(prev => !prev);
    if (isSelectMode) {
      setSelectedVideos([]);
    }
  }, [isSelectMode]);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideos(prev => {
      if (!prev.includes(videoId)) {
        return [...prev, videoId];
      }
      return prev;
    });
  }, []);

  const handleVideoDeselect = useCallback((videoId: string) => {
    setSelectedVideos(prev => prev.filter(id => id !== videoId));
  }, []);

  const handleSelectAll = useCallback(() => {
    setIsSelectMode(true);
  }, []);

  const handleVideoUploadSuccess = useCallback((response: VideoUploadResponse) => {
    setRefreshTrigger(prev => prev + 1);
    setShowNotification({ type: 'success', message: 'Video uploaded successfully!' });
    setTimeout(() => setShowNotification(null), 5000);
  }, []);

  const handleVideoUploadError = useCallback((error: VideoUploadError) => {
    console.error('Video upload failed:', error);
    setShowNotification({ type: 'error', message: 'Failed to upload video. Please try again.' });
    setTimeout(() => setShowNotification(null), 5000);
  }, []);

  const handleBulkDelete = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) {
      setShowNotification({ type: 'error', message: 'No videos selected for deletion.' });
      setTimeout(() => setShowNotification(null), 5000);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${videoIds.length} video(s)? This action cannot be undone.`);
    if (!confirmed) return;

    setIsBulkDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSelectedVideos([]);
      setIsSelectMode(false);
      setRefreshTrigger(prev => prev + 1);
      
      setShowNotification({ type: 'success', message: `Successfully deleted ${videoIds.length} video(s).` });
      setTimeout(() => setShowNotification(null), 5000);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      setShowNotification({ type: 'error', message: `Failed to delete videos: ${error instanceof Error ? error.message : 'Unknown error'}` });
      setTimeout(() => setShowNotification(null), 5000);
    } finally {
      setIsBulkDeleting(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-top-5">
          <Alert className={`backdrop-blur-xl border-2 rounded-2xl shadow-2xl ${
            showNotification.type === 'success' 
              ? 'bg-green-50/90 border-green-200/50 text-green-800' 
              : 'bg-red-50/90 border-red-200/50 text-red-800'
          }`}>
            <AlertDescription className="font-medium">
              {showNotification.message}
            </AlertDescription>
            <button 
              onClick={() => setShowNotification(null)}
              className="absolute top-2 right-2 text-current hover:bg-black/10 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </Alert>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <Header
          videoCount={videoCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedVideos={selectedVideos}
          onFilterChange={handleFilterChange}
          onVideoUploadSuccess={handleVideoUploadSuccess}
          onVideoUploadError={handleVideoUploadError}
          isSelectMode={isSelectMode}
          onSelectModeToggle={handleSelectModeToggle}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
          isBulkDeleting={isBulkDeleting}
        />

        <div className="mt-8">
          <VideoTable
            viewMode={viewMode}
            searchQuery={filters.search}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            refreshTrigger={refreshTrigger}
            onVideoCount={handleVideoCount}
            isSelectMode={isSelectMode}
            selectedVideos={selectedVideos}
            onVideoSelect={handleVideoSelect}
            onVideoDeselect={handleVideoDeselect}
          />
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
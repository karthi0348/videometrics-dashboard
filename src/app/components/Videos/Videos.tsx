import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode } from '../../types';
import VideoUploadModal from '../Modal/Video/VideoUploadModal'; 
import VideoTable from './VideoTable';
import { API_ENDPOINTS } from '../../config/api';

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

interface BulkDeleteResponse {
  success: boolean;
  message: string;
  deleted_count: number;
}

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
    alert('Failed to upload video. Please try again.');
  };

  const handleBulkAction = (action: 'delete' | 'process' | 'download') => {
    if (selectedVideos.length === 0) {
      alert('Please select videos first.');
      return;
    }

    if (action === 'delete') {
      const confirmMessage = `Are you sure you want to delete ${selectedVideos.length} video(s)? This action cannot be undone.`;
      if (confirm(confirmMessage) && onBulkDelete) {
        onBulkDelete(selectedVideos);
      }
    } else {
      console.log(`Bulk ${action} for videos:`, selectedVideos);
      alert(`${action} action would be performed on ${selectedVideos.length} video(s)`);
    }
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleSelectModeToggle = () => {
    if (onSelectModeToggle) {
      onSelectModeToggle();
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
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      key: 'list' as ViewMode, 
      label: 'List', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      key: 'compact' as ViewMode, 
      label: 'Compact', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M2 6h12M2 9h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="bg-white">
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h1 
                  className={`text-xl font-bold text-gray-900 ${
                    onTitleClick ? 'cursor-pointer hover:text-gray-700 transition-colors' : ''
                  }`}
                  onClick={handleTitleClick}
                >
                  Videos
                </h1>
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-purple-500 rounded-full">
                  {videoCount}
                </span>
              </div>
              
              <button 
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={handleFilterToggle}
              >
                <svg className="w-4 h-4 mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h10l-4 4v4l-2 1V7L3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Filter by date
              </button>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === mode.key 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleViewModeChange(mode.key)}
                  >
                    {mode.icon}
                  </button>
                ))}
              </div>

              <button 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isSelectMode 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={handleSelectModeToggle}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                  {isSelectMode ? (
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <>
                      <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  )}
                </svg>
                Select Videos
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                  <div className="flex rounded-md shadow-sm">
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                        sortOrder === 'desc' 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSortOrder('desc')}
                    >
                      Newest
                    </button>
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors ${
                        sortOrder === 'asc' 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSortOrder('asc')}
                    >
                      Oldest
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input 
                      type="date" 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                    <input 
                      type="date" 
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Selected Videos Bar */}
          {selectedVideos.length > 0 && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''} selected
                </span>
                <button 
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 sm:p-6 space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2 flex-wrap">
                  <h1 
                    className={`text-2xl sm:text-3xl font-bold text-purple-700 flex items-center m-0 ${
                      onTitleClick ? 'cursor-pointer hover:text-purple-800 transition-colors' : ''
                    } ${
                      isNavigationTarget ? 'ring-2 ring-purple-300 rounded-md px-2 py-1' : ''
                    }`}
                    onClick={handleTitleClick}
                    role={onTitleClick ? 'button' : undefined}
                    tabIndex={onTitleClick ? 0 : undefined}
                    onKeyDown={onTitleClick ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTitleClick();
                      }
                    } : undefined}
                    title={onTitleClick ? 'Navigate to Videos section' : undefined}
                  >
                    Videos
                    {onTitleClick && (
                      <svg className="ml-2 w-4 h-4" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {videoCount}
                    </span>
                    {selectedVideos.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedVideos.length} selected
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 m-0">Manage and analyze your video content</p>
              </div>

              <div className="relative max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === mode.key 
                        ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleViewModeChange(mode.key)}
                    title={`Switch to ${mode.label} view`}
                  >
                    {mode.icon}
                    <span className="ml-2 hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={handleFilterToggle}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="ml-2 hidden sm:inline">Filters</span>
                  <div className={`ml-2 w-2 h-2 rounded-full transition-colors ${showFilters ? 'bg-purple-500' : 'bg-transparent'}`} />
                </button>

                <button 
                  className={`inline-flex items-center px-3 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isSelectMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={handleSelectModeToggle}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    {isSelectMode ? (
                      <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <>
                        <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                  <span className="ml-2 hidden sm:inline">{isSelectMode ? 'Exit Select' : 'Select Videos'}</span>
                </button>

                <button 
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={handleAddVideo}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="ml-2">Add Video</span>
                </button>
              </div>
            </div>
          </div>

          {selectedVideos.length > 0 && (
            <div className="bg-blue-50 border-t border-blue-200 px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-600" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-blue-900">
                    <strong>{selectedVideos.length}</strong> video{selectedVideos.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    onClick={() => handleBulkAction('delete')}
                    disabled={isBulkDeleting}
                  >
                    {isBulkDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
                          <path d="M2 4h12M6 4V2h4v2M3 4v10h10V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  >
                    <option value="date">Upload Date</option>
                    <option value="name">Name</option>
                    <option value="size">File Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <div className="flex rounded-md shadow-sm">
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border transition-colors ${
                        sortOrder === 'desc' 
                          ? 'bg-purple-600 text-white border-purple-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSortOrder('desc')}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline mr-1">
                        <path d="M7 1v12M4 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="hidden sm:inline">Newest</span>
                    </button>
                    <button 
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors ${
                        sortOrder === 'asc' 
                          ? 'bg-purple-600 text-white border-purple-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSortOrder('asc')}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline mr-1">
                        <path d="M7 13V1M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="hidden sm:inline">Oldest</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input 
                    type="date" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Start date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input 
                    type="date" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-2 sm:space-y-0">
                <button 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
                {onSelectAll && !isSelectMode && (
                  <button 
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          className="fixed bottom-6 right-6 z-50 inline-flex items-center px-4 py-3 bg-purple-500 text-white text-sm font-medium rounded-full shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={handleAddVideo}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
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

// --- VideosPage Component ---
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
    alert('Video uploaded successfully!');
  }, []);

  const handleVideoUploadError = useCallback((error: VideoUploadError) => {
    console.error('Video upload failed:', error);
    alert('Failed to upload video. Please try again.');
  }, []);

  const handleBulkDelete = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) {
      alert('No videos selected for deletion.');
      return;
    }

    setIsBulkDeleting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const endpoint = API_ENDPOINTS.BULK_DELETE_VIDEOS || '/video-urls/bulk-delete';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_ids: videoIds 
        }),
      });

      if (response.ok) {
        const result = await response.json() as BulkDeleteResponse;
        
        setSelectedVideos([]);
        setIsSelectMode(false);
        
        setRefreshTrigger(prev => prev + 1);
        
        alert(`Successfully deleted ${videoIds.length} video(s).`);
      } else {
        const errorData = await response.json() as { message: string };
        throw new Error(errorData.message || 'Failed to delete videos');
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert(`Failed to delete videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBulkDeleting(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 lg:py-8">
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

        <div className="mt-0 sm:mt-6">
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
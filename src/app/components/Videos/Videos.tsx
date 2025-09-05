import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode } from '../../types';
import VideoUploadModal from '../Modal/Video/VideoUploadModal'; 
import VideoTable from './VideoTable';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/Videos.css';

// --- Type Definitions ---
interface Video {
  id: string;
  name: string;
  created_at: string;
  file_size: number;
  // Add other video properties as needed
}

interface VideoUploadResponse {
  success: boolean;
  message: string;
  video?: Video;
  // Add other response properties as needed
}

interface VideoUploadError {
  message: string;
  code?: string;
  details?: string;
  // Add other error properties as needed
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

// --- Header Component ---
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
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const mobileActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileActionsRef.current && !mobileActionsRef.current.contains(event.target as Node)) {
        setShowMobileActions(false);
      }
    };

    if (showMobileActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileActions]);

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
    if (isMobile) {
      setShowMobileActions(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddVideo = () => {
    console.log('Opening video upload modal...');
    setShowUploadModal(true);
    setShowMobileActions(false);
    // Create a placeholder video object since onAddVideo expects a Video parameter
    const placeholderVideo: Video = {
      id: '',
      name: '',
      created_at: '',
      file_size: 0
    };
    onAddVideo?.(placeholderVideo);
  };

  const handleUploadSuccess = (response: VideoUploadResponse) => {
    console.log('Video uploaded successfully:', response);
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
    
    setShowMobileActions(false);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
    setShowMobileActions(false);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = (newSortOrder: typeof sortOrder) => {
    setSortOrder(newSortOrder);
  };

  const handleSelectModeToggle = () => {
    if (onSelectModeToggle) {
      onSelectModeToggle();
    }
    setShowMobileActions(false);
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
      <div className="header-container">
        <div className="header-main">
          <div className="header-left">
            <div className="page-title-section">
              <div className="title-with-badge">
                <h1 
                  className={`page-title ${onTitleClick ? 'clickable' : ''} ${isNavigationTarget ? 'navigation-target' : ''}`}
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
                    <svg className="title-nav-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </h1>
                <div className="count-badge">
                  <span className="count-number">{videoCount}</span>
                  {selectedVideos.length > 0 && (
                    <span className="selected-count">({selectedVideos.length} selected)</span>
                  )}
                </div>
              </div>
              <p className="page-subtitle">Manage and analyze your video content</p>
            </div>

            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="search-clear"
                    onClick={() => handleSearch('')}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="header-right" ref={mobileActionsRef}>
            {isMobile && (
              <button 
                className="mobile-menu-toggle"
                onClick={() => setShowMobileActions(!showMobileActions)}
                aria-label="Toggle menu"
                aria-expanded={showMobileActions}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 7h14M3 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            <div className={`view-mode-toggle ${isMobile && showMobileActions ? 'mobile-open' : ''}`}>
              {viewModes.map((mode) => (
                <button
                  key={mode.key}
                  className={`view-mode-btn ${viewMode === mode.key ? 'active' : ''}`}
                  onClick={() => handleViewModeChange(mode.key)}
                  title={`Switch to ${mode.label} view`}
                >
                  {mode.icon}
                  <span className="view-mode-label">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className={`header-actions ${isMobile && showMobileActions ? 'mobile-open' : ''}`}>
              <button 
                className="action-btn secondary"
                onClick={handleFilterToggle}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Filters</span>
                <div className={`filter-indicator ${showFilters ? 'active' : ''}`} />
              </button>

              <button 
                className={`action-btn ${isSelectMode ? 'primary' : 'outline'}`}
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
                <span>{isSelectMode ? 'Exit Select' : 'Select Videos'}</span>
              </button>

              <button 
                className="action-btn primary"
                onClick={handleAddVideo}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Add Video</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar - Moved outside main header */}
        {selectedVideos.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-content">
              <div className="bulk-selection-info">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="bulk-icon">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="bulk-count">
                  <strong>{selectedVideos.length}</strong> video{selectedVideos.length > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="bulk-actions-buttons">
                <button 
                  className="bulk-action-btn delete-btn"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          <div className="filters-panel">
            <div className="filters-content">
              <div className="filter-group">
                <label className="filter-label">Sort by</label>
                <select 
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as 'name' | 'date' | 'size')}
                >
                  <option value="date">Upload Date</option>
                  <option value="name">Name</option>
                  <option value="size">File Size</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Order</label>
                <div className="sort-toggle">
                  <button 
                    className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                    onClick={() => handleSortOrderChange('desc')}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M4 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Newest</span>
                  </button>
                  <button 
                    className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                    onClick={() => handleSortOrderChange('asc')}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 13V1M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Oldest</span>
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div className="date-inputs">
                  <input 
                    type="date" 
                    className="date-input"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Start date"
                  />
                  <span className="date-separator">to</span>
                  <input 
                    type="date" 
                    className="date-input"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button 
                  className="filter-reset"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
                {onSelectAll && !isSelectMode && (
                  <button 
                    className="filter-select-all"
                    onClick={onSelectAll}
                  >
                    Select All Videos
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
    console.log('Select all functionality - you need to implement this based on your current video list');
  }, []);

  const handleVideoUploadSuccess = useCallback((response: VideoUploadResponse) => {
    console.log('Video uploaded successfully:', response);
    setRefreshTrigger(prev => prev + 1);
    alert('Video uploaded successfully!');
  }, []);

  const handleVideoUploadError = useCallback((error: VideoUploadError) => {
    console.error('Video upload failed:', error);
    alert('Failed to upload video. Please try again.');
  }, []);

  // Updated bulk delete function to use the API
  const handleBulkDelete = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) {
      alert('No videos selected for deletion.');
      return;
    }

    setIsBulkDeleting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Use the bulk delete endpoint from your API
      const endpoint = API_ENDPOINTS.BULK_DELETE_VIDEOS || '/video-urls/bulk-delete';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_ids: videoIds // Based on your API documentation
        }),
      });

      if (response.ok) {
        const result = await response.json() as BulkDeleteResponse;
        console.log('Bulk delete successful:', result);
        
        // Clear selected videos and exit select mode
        setSelectedVideos([]);
        setIsSelectMode(false);
        
        // Refresh the video list
        setRefreshTrigger(prev => prev + 1);
        
        // Show success message
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
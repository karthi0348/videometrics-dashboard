import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  AlertTitle,
  Tooltip,
  Badge,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fab,
  CardActions,
  Divider,
  LinearProgress,
  Container
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ClockIcon,
  CalendarToday as CalendarIcon,
  Storage as StorageIcon,
  VideoLibrary as VideoIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Movie as MovieIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from "../../config/api";
import PlayVideoModal from "../Modal/Video/PlayVideoModal";
import EditVideoModal from "../Modal/Video/EditVideoModal";
import DeleteVideoModal from "../Modal/Video/DeleteVideoModal";

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

type ViewMode = "grid" | "list" | "compact";

interface VideoTableProps {
  viewMode: ViewMode;
  searchQuery?: string;
  sortBy?: "video_name" | "created_at" | "file_size";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  refreshTrigger?: number;
  onVideoCount?: (count: number) => void;
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
  const theme = useTheme();

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

  const getVideoThumbnail = () => {
    const colors = [
'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)'

    ];
    const idx = parseInt(video.id, 36) % colors.length;
    return colors[idx];
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: isSelectMode ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isSelected 
          ? `0 8px 25px ${theme.palette.primary.main}25, 0 0 0 2px ${theme.palette.primary.main}`
          : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: isSelectMode ? 'translateY(-6px)' : 'translateY(-2px)',
          boxShadow: isSelected
            ? `0 12px 35px ${theme.palette.primary.main}35, 0 0 0 2px ${theme.palette.primary.main}`
            : '0 8px 25px rgba(0,0,0,0.15)',
        },
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isSelected ? `${theme.palette.primary.main}08` : 'background.paper'
      }}
    >
      {/* Selection Checkbox */}
      {isSelectMode && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <Checkbox
            checked={isSelected}
            onChange={handleCardClick}
            icon={<Box sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              border: '2px solid white',
              bgcolor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)'
            }} />}
            checkedIcon={<CheckCircleIcon sx={{ color: theme.palette.primary.main }} />}
            sx={{
              color: 'white',
              '& .MuiSvgIcon-root': { fontSize: 28 }
            }}
          />
        </Box>
      )}

      {/* Video Thumbnail */}
      <CardMedia
        onClick={(e) => {
          e.stopPropagation();
          onPlayVideo(video);
        }}
        sx={{
          height: 200,
          background: getVideoThumbnail(),
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

        }}
      >
        {/* Decorative Pattern */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)
          `
        }} />

        {/* Play Button Overlay */}
        <Box
          className="play-overlay"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: 0.8,
            border: '3px solid rgba(255,255,255,0.3)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.8)',
              borderColor: 'rgba(255,255,255,0.5)'
            }
          }}
        >
          <PlayIcon sx={{ fontSize: 36, color: 'white', ml: 0.5 }} />
        </Box>

        {/* Duration Badge */}
        {video.duration && (
          <Chip
            icon={<ClockIcon sx={{ fontSize: '16px !important' }} />}
            label={formatDuration(video.duration)}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        )}
      </CardMedia>

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant="h6" 
          component="div" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: '1.1rem',
            lineHeight: 1.3,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {video.video_name}
        </Typography>

        {video.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {video.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        </Stack>
      </CardContent>

      {/* Action Buttons */}
      {!isSelectMode && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Stack direction="row" spacing={1} width="100%">
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onEditVideo(video);
              }}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Edit
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteVideo(video);
              }}
              color="error"
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                }
              }}
            >
              Delete
            </Button>
          </Stack>
        </CardActions>
      )}
    </Card>
  );
};

const VideoTable: React.FC<VideoTableProps> = ({
  viewMode,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  
  // Modal states
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const pageSize = 12;

  const fetchVideos = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setError("No authentication token found. Please log in.");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(
        `${API_ENDPOINTS.LIST_VIDEOS || "/video-urls"}?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const data = await response.json();

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
        videoList = videoList.filter((video) => {
          const videoDate = new Date(video.created_at);
          const fromDate = dateFrom ? new Date(dateFrom) : null;
          const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

          if (fromDate && videoDate < fromDate) return false;
          if (toDate && videoDate > toDate) return false;
          return true;
        });
        total = videoList.length;
      }

      // Sort videos client-side
      const sortedVideos = [...videoList].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "video_name":
            aValue = a.video_name?.toLowerCase() || "";
            bValue = b.video_name?.toLowerCase() || "";
            break;
          case "file_size":
            aValue = a.file_size || 0;
            bValue = b.file_size || 0;
            break;
          case "created_at":
          default:
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setVideos(sortedVideos);
      setTotalVideos(total);
      onVideoCount?.(total);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder, dateFrom, dateTo, refreshTrigger]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
    fetchVideos(newPage);
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayModalOpen(true);
  };

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsEditModalOpen(true);
  };

  const handleDeleteVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsPlayModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedVideo(null);
  };

  const handleVideoUpdated = () => {
    fetchVideos(currentPage);
    handleModalClose();
  };

  const handleVideoDeleted = () => {
    fetchVideos(currentPage);
    handleModalClose();
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "-";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <CircularProgress size={60} thickness={4} />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <VideoIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
            Loading Videos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch your content...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Something went wrong</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchVideos(currentPage)}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              mt: 1
            }}
          >
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (videos.length === 0) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 8,
          textAlign: 'center'
        }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'grey.100',
              mb: 3
            }}
          >
            <VideoIcon sx={{ fontSize: 40, color: 'grey.400' }} />
          </Avatar>
          
          <Typography variant="h5" gutterBottom fontWeight={600}>
            No videos found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {searchQuery || dateFrom || dateTo
              ? "No videos match your current filters. Try adjusting your search criteria."
              : "Upload your first video to get started with your collection."}
          </Typography>

          {!(searchQuery || dateFrom || dateTo) && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              size="large"
              sx={{
                textTransform: 'none',
                borderRadius: 3,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                }
              }}
            >
              Upload Your First Video
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <Container>
        {isSelectMode && (
          <Alert 
            icon={<CheckCircleIcon />} 
            severity="info"
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              bgcolor: `${theme.palette.primary.main}08`,
              border: `1px solid ${theme.palette.primary.main}20`
            }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>Selection Mode Active</AlertTitle>
            Click on videos to select them. {selectedVideos.length} of {videos.length} selected.
          </Alert>
        )}

        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard
                video={video}
                onPlayVideo={handlePlayVideo}
                onEditVideo={handleEditVideo}
                onDeleteVideo={handleDeleteVideo}
                isSelectMode={isSelectMode}
                isSelected={selectedVideos.includes(video.id)}
                onSelect={onVideoSelect}
                onDeselect={onVideoDeselect}
              />
            </Grid>
          ))}
        </Grid>

        {totalVideos > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(totalVideos / pageSize)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Modals */}
        <PlayVideoModal
          video={selectedVideo}
          isOpen={isPlayModalOpen}
          onClose={handleModalClose}
        />

        <EditVideoModal
          video={selectedVideo}
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onVideoUpdated={handleVideoUpdated}
        />

        <DeleteVideoModal
          video={selectedVideo}
          isOpen={isDeleteModalOpen}
          onClose={handleModalClose}
          onVideoDeleted={handleVideoDeleted}
        />
      </Container>
    );
  }

  // Table/List View
  return (
    <Container>
      {isSelectMode && (
        <Alert 
          icon={<CheckCircleIcon />} 
          severity="info"
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            bgcolor: `${theme.palette.primary.main}08`,
            border: `1px solid ${theme.palette.primary.main}20`
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Selection Mode Active</AlertTitle>
          Select videos from the list below. {selectedVideos.length} of {videos.length} selected.
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {isSelectMode && (
                  <TableCell padding="checkbox">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Select
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VideoIcon sx={{ fontSize: 18 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Video
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StorageIcon sx={{ fontSize: 18 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Size
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ClockIcon sx={{ fontSize: 18 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Duration
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon sx={{ fontSize: 18 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Uploaded
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.map((video, index) => (
                <TableRow
                  key={video.id}
                  sx={{
                    bgcolor: selectedVideos.includes(video.id) 
                      ? `${theme.palette.primary.main}08` 
                      : index % 2 === 0 
                        ? 'grey.25' 
                        : 'background.paper',
                    '&:hover': {
                      bgcolor: selectedVideos.includes(video.id)
                        ? `${theme.palette.primary.main}12`
                        : 'action.hover'
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  {isSelectMode && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onVideoSelect?.(video.id);
                          } else {
                            onVideoDeselect?.(video.id);
                          }
                        }}
                        color="primary"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatFileSize(video.file_size)}
                      sx={{
                        bgcolor: 'primary.50',
                        color: 'primary.700',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatDuration(video.duration)}
                      sx={{
                        bgcolor: 'success.50',
                        color: 'success.700',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(video.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {!isSelectMode && (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Video">
                          <IconButton
                            onClick={() => handlePlayVideo(video)}
                            size="small"
                            sx={{
                              bgcolor: 'primary.50',
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.100',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Video">
                          <IconButton
                            onClick={() => handleEditVideo(video)}
                            size="small"
                            sx={{
                              bgcolor: 'info.50',
                              color: 'info.main',
                              '&:hover': {
                                bgcolor: 'info.100',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Video">
                          <IconButton
                            onClick={() => handleDeleteVideo(video)}
                            size="small"
                            sx={{
                              bgcolor: 'error.50',
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: 'error.100',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalVideos > pageSize && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(totalVideos / pageSize)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "medium" : "large"}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 500,
                '& .MuiPaginationItem-root.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                  }
                }
              }
            }}
          />
        </Box>
      )}

      {/* Modals */}
      <PlayVideoModal
        video={selectedVideo}
        isOpen={isPlayModalOpen}
        onClose={handleModalClose}
      />

      <EditVideoModal
        video={selectedVideo}
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onVideoUpdated={handleVideoUpdated}
      />

      <DeleteVideoModal
        video={selectedVideo}
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onVideoDeleted={handleVideoDeleted}
      />
    </Container>
  );
};

export default VideoTable;
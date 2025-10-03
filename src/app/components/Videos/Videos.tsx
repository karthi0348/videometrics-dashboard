import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Fab,
  Toolbar,
  AppBar,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Avatar,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  List as ListIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Delete as DeleteIcon,
  FileUpload as UploadIcon,
  VideoLibrary as VideoIcon,
  Sort as SortIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  SelectAll as SelectAllIcon,
  Close as CloseIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import { ViewMode } from "../../types";
import VideoUploadModal from "../Modal/Video/VideoUploadModal";
import VideoTable from "./VideoTable";
import { API_ENDPOINTS } from "../../config/api";

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
  sortBy: "name" | "date" | "size";
  sortOrder: "asc" | "desc";
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
  isBulkDeleting = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    const filters: FilterOptions = {
      search: searchQuery,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    };
    onFilterChange?.(filters);
  }, [searchQuery, sortBy, sortOrder, dateFrom, dateTo, onFilterChange]);

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleAddVideo = () => {
    setShowUploadModal(true);
    const placeholderVideo: Video = {
      id: "",
      name: "",
      created_at: "",
      file_size: 0,
    };
    onAddVideo?.(placeholderVideo);
  };

  const handleUploadSuccess = (response: VideoUploadResponse) => {
    onVideoUploadSuccess?.(response);
    setSnackbar({
      open: true,
      message: "Video uploaded successfully!",
      severity: "success",
    });
  };

  const handleUploadError = (error: VideoUploadError) => {
    console.error("Video upload failed:", error);
    onVideoUploadError?.(error);
    setSnackbar({
      open: true,
      message: "Failed to upload video. Please try again.",
      severity: "error",
    });
  };

  const handleBulkDelete = () => {
    if (selectedVideos.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select videos first.",
        severity: "error",
      });
      return;
    }

    if (onBulkDelete) {
      onBulkDelete(selectedVideos);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("date");
    setSortOrder("desc");
    setDateFrom("");
    setDateTo("");
  };

  const handleTitleClick = () => {
    if (onTitleClick) {
      onTitleClick();
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(15);
    }
  };

  const viewModeOptions = [
    { key: "grid" as ViewMode, label: "Grid", icon: <GridViewIcon /> },
    { key: "list" as ViewMode, label: "List", icon: <ListIcon /> },
  ];

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          background: "linear-gradient(135deg, #93c5fd 0%, #a855f7 100%)",
        }}
      >
        {/* Main Header Content */}
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            {/* Title Section */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Box
                  onClick={handleTitleClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: onTitleClick ? "pointer" : "default",
                    "&:hover": onTitleClick ? { opacity: 0.8 } : {},
                    transition: "opacity 0.2s",
                  }}
                >
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    fontWeight="bold"
                    sx={{
                      background:
                        "linear-gradient(45deg, #9c27b0 30%, #7b1fa2 90%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Videos
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip
                    label={videoCount}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                  {selectedVideos.length > 0 && (
                    <Chip
                      label={`${selectedVideos.length} selected`}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                      }}
                    />
                  )}
                </Stack>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Manage and analyze your video content
              </Typography>

              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  maxWidth: 400,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 3,
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.7)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Action Buttons */}
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      color: "rgba(255,255,255,0.7)",
                      borderColor: "rgba(255,255,255,0.3)",
                      "&.Mui-selected": {
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                      },
                    },
                  }}
                >
                  {viewModeOptions.map((mode) => (
                    <ToggleButton key={mode.key} value={mode.key}>
                      <Tooltip title={`${mode.label} view`}>
                        {mode.icon}
                      </Tooltip>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,100)",
                    "&:hover": { borderColor: "rgba(255,255,255,0.5)" },
                  }}
                >
                  Filters
                  {showFilters ? (
                    <ArrowUpIcon sx={{ ml: 1 }} />
                  ) : (
                    <ArrowDownIcon sx={{ ml: 1 }} />
                  )}
                </Button>

                <Button
                  variant={isSelectMode ? "contained" : "outlined"}
                  startIcon={
                    isSelectMode ? (
                      <CheckBoxIcon />
                    ) : (
                      <CheckBoxOutlineBlankIcon />
                    )
                  }
                  onClick={onSelectModeToggle}
                  sx={{
                    color: isSelectMode
                      ? theme.palette.primary.contrastText
                      : "white",
                    borderColor: isSelectMode
                      ? "transparent"
                      : "rgba(255,255,255,100)",
                    bgcolor: isSelectMode
                      ? theme.palette.primary.main
                      : "transparent",
                    "&:hover": {
                      borderColor: isSelectMode
                        ? "transparent"
                        : "rgba(255,255,255,0.5)",
                      bgcolor: isSelectMode
                        ? theme.palette.primary.dark
                        : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {isSelectMode ? "Exit Select" : "Select"}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVideo}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    "&:hover": { bgcolor: theme.palette.secondary.dark },
                  }}
                >
                  Add Video
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Mobile Action Bar */}
        {isMobile && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    color: "rgba(255,255,255,0.7)",
                    borderColor: "rgba(255,255,255,0.3)",
                    minWidth: 40,
                    "&.Mui-selected": {
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    },
                  },
                }}
              >
                {viewModeOptions.map((mode) => (
                  <ToggleButton key={mode.key} value={mode.key}>
                    {mode.icon}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <FilterIcon />
                </IconButton>

                <IconButton
                  onClick={onSelectModeToggle}
                  sx={{
                    color: isSelectMode
                      ? theme.palette.primary.main
                      : "rgba(255,255,255,0.7)",
                    bgcolor: isSelectMode ? "white" : "transparent",
                    "&:hover": {
                      bgcolor: isSelectMode
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  {isSelectMode ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )}
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Selection Bar */}
        {selectedVideos.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              p: 2,
              borderRadius: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckBoxIcon />
                <Typography variant="body2" fontWeight="medium">
                  <strong>{selectedVideos.length}</strong> video
                  {selectedVideos.length > 1 ? "s" : ""} selected
                </Typography>
              </Stack>

              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={isBulkDeleting ? undefined : <DeleteIcon />}
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                sx={{ minWidth: 100 }}
              >
                {isBulkDeleting ? (
                  <>
                    <LinearProgress
                      size={16}
                      sx={{
                        width: 16,
                        height: 2,
                        mr: 1,
                        "& .MuiLinearProgress-bar": { bgcolor: "white" },
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Filters Panel */}
        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              p: 3,
              borderRadius: 0,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) =>
                      setSortBy(e.target.value as "name" | "date" | "size")
                    }
                  >
                    <MenuItem value="date">Upload Date</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="size">File Size</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ToggleButtonGroup
                  value={sortOrder}
                  exclusive
                  onChange={(_, value) => value && setSortOrder(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="desc" sx={{ flex: 1 }}>
                    <ArrowDownIcon sx={{ mr: 1 }} />
                    Newest
                  </ToggleButton>
                  <ToggleButton value="asc" sx={{ flex: 1 }}>
                    <ArrowUpIcon sx={{ mr: 1 }} />
                    Oldest
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<ClearIcon />}
              >
                Reset Filters
              </Button>

              {onSelectAll && !isSelectMode && (
                <Button
                  variant="contained"
                  onClick={onSelectAll}
                  startIcon={<SelectAllIcon />}
                >
                  Select All Videos
                </Button>
              )}
            </Stack>
          </Paper>
        </Collapse>
      </Paper>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="secondary"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={handleAddVideo}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// --- VideosPage Component ---
interface VideoFilters {
  search: string;
  sortBy: "video_name" | "created_at" | "file_size";
  sortOrder: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
}

const VideosPage: React.FC = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [videoCount, setVideoCount] = useState(0);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [filters, setFilters] = useState<VideoFilters>({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = useCallback(
    (newFilters: Partial<VideoFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
  );

  const handleVideoCount = useCallback((count: number) => {
    setVideoCount(count);
  }, []);

  const handleSelectModeToggle = useCallback(() => {
    setIsSelectMode((prev) => !prev);
    if (isSelectMode) {
      setSelectedVideos([]);
    }
  }, [isSelectMode]);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideos((prev) => {
      if (!prev.includes(videoId)) {
        return [...prev, videoId];
      }
      return prev;
    });
  }, []);

  const handleVideoDeselect = useCallback((videoId: string) => {
    setSelectedVideos((prev) => prev.filter((id) => id !== videoId));
  }, []);

  const handleSelectAll = useCallback(() => {
    setIsSelectMode(true);
  }, []);

  const handleVideoUploadSuccess = useCallback(
    (response: VideoUploadResponse) => {
      setRefreshTrigger((prev) => prev + 1);
    },
    []
  );

  const handleVideoUploadError = useCallback((error: VideoUploadError) => {
    console.error("Video upload failed:", error);
  }, []);

  const confirmBulkDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleBulkDelete = useCallback(async (videoIds: string[]) => {
    if (videoIds.length === 0) {
      return;
    }

    setDeleteDialogOpen(false);
    setIsBulkDeleting(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      const endpoint =
        API_ENDPOINTS.BULK_DELETE_VIDEOS || "/video-urls/bulk-delete";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_ids: videoIds,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as BulkDeleteResponse;

        setSelectedVideos([]);
        setIsSelectMode(false);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const errorData = (await response.json()) as { message: string };
        throw new Error(errorData.message || "Failed to delete videos");
      }
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
    background: 'linear-gradient(to bottom right, #60A5FA, #8B5CF6, #E0E7FF)',
     
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
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
          onBulkDelete={confirmBulkDelete}
          isBulkDeleting={isBulkDeleting}
        />

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
      </Container>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: "error.main", width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Confirm Delete
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{selectedVideos.length}</strong> video
            {selectedVideos.length > 1 ? "s" : ""}?
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ mt: 1, fontWeight: 500 }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => handleBulkDelete(selectedVideos)}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete {selectedVideos.length} Video
            {selectedVideos.length > 1 ? "s" : ""}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideosPage;

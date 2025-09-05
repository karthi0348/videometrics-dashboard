// Fixed interfaces with proper typing

export interface ProcessedVideo {
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

// Define specific types for metadata, charts, and insights
export interface ProcessedMetadata {
  [key: string]: unknown;
}

export interface GeneratedChart {
  plot_type: string;
  series: boolean;
  title: any;
  status: string;
  value: undefined;
  styling: any;
  x_axis: any;
  insights: boolean;
  id: string;
  type: string;
  data: unknown;
  config?: unknown;
}

export interface Insight {
  type: string;
  value: unknown;
  confidence: number;
  timestamp?: string;
}

export interface AnalyticsData {
  id: number;
  uuid: string;
  video_id: number;
  profile_id: number;
  sub_profile_id: number;
  template_id: number;
  original_video_url: string;
  processed_metadata: ProcessedMetadata[];
  generated_charts: GeneratedChart[];
  insights: Insight[];
  confidence_scores: number[];
  timestamp: string;
  status: string;
  error_message: string;
  processing_started_at: string;
  processing_completed_at: string;
  processing_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

// Define a proper type for the data field
export interface InsightDataContent {
  [key: string]: unknown;
}

export interface InsightData {
  insight_type: string;
  title: string;
  description: string;
  confidence: string;
  severity: string;
  data: InsightDataContent;
  action_items: string[];
  timestamp: string;
}

// Define a proper interface for the API service
export interface ApiService {
  getAnalytics: (id: string) => Promise<AnalyticsData>;
  // Add other methods as needed
  [key: string]: unknown;
}

export interface VideoMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsId: string | null;
  apiService?: ApiService;
  mockMode?: boolean;
}


// Define proper interfaces for the PDF library
export interface JsPDFInstance {
  setFontSize: (size: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  text: (text: string, x: number, y: number, options?: { align?: string }) => void;
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alias?: string,
    compression?: string,
    rotation?: number,
    offsetY?: number
  ) => void;
  addPage: () => void;
  getNumberOfPages: () => number;
  setPage: (page: number) => void;
  save: (filename: string) => void;
}

// Define proper options for html2canvas
export interface Html2CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  backgroundColor?: string;
  width?: number;
  scrollX?: number;
  scrollY?: number;
}
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

// types.ts

export interface AnalyticsData {
  id: number;
  uuid: string;
  video_id: number;
  profile_id: number;
  sub_profile_id: number;
  template_id: number;
  original_video_url: string;
  processed_metadata: any[];
  generated_charts: any[];
  insights: any[];
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

export interface InsightData {
  insight_type: string;
  title: string;
  description: string;
  confidence: string;
  severity: string;
  data: any;
  action_items: string[];
  timestamp: string;
}

export interface VideoMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsId: string | null;
  apiService?: any;
  mockMode?: boolean;
}

export interface VideoAnalytics {
  generated_summary: any;
  generated_summary: any;
  generated_summary: any;
  generated_summary: any;
  generated_summary: any;
  generated_summary: any;
  uuid: any;
  processing_duration_seconds(processing_duration_seconds: any): unknown;
  parsed_metrics(parsed_metrics: any): unknown;
  generated_charts: any;
  priority: any;
  processing_started_at: string | number | Date;
  processing_completed_at: string | number | Date;
  video_metadata: any;
  generated_summary: any;
  id: number;
  video_id: number;
  profile_name?: string;
  sub_profile_name?: string;
  template_name?: string;
  status: string;
  confidence_score?: number;
  insights?: InsightData[];
}

export interface GeneratedChart {
  chart_id: string;
  type: string;
  data: any;
  labels: string[];
}


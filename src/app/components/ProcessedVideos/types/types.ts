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
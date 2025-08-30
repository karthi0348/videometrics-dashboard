export interface Video {
  id: number;
  name: string;
  url: string;
  size: string;
  uploaded: string;
  video_name?: string;
  file_size?: string;
  created_at?: string;
}



export interface Profile {
  id: number;
  name: string;
  email?: string;
  tag?: string;
  contact?: string;
  description?: string;
}

export interface SubProfile {
  id: number;
  name: string;
  profile_id: number;
  description?: string;
  areaType?: string;
  isActive?: boolean;
}


export interface Template {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

export interface ProcessingVideo {
  video_id: number;
  uuid: string;
  video_name: string;
  status: string;
  estimated_completion: string;
  priority: string;
}

export type Priority = 'normal' | 'high' | 'low';




  export interface AnalyticsVideo {
  id: number;
  analytics_id: string;
  video_title: string;
  processing_status: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
  
}

export interface AnalyticsResponse {
  data: AnalyticsVideo[];
  total?: number;
  page?: number;
  page_size?: number;
}

export interface ProcessVideoRequest {
  video_url: string;
  profile_id: number;
  sub_profile_id: number;
  template_id: number;
  priority: "normal" | "high" | "low";
  custom_parameters: Record<string, any>;
}

export interface ProcessVideoResponse {
  video_id: number;
  uuid: string;
  status: string;
  message: string;
  profile_id: number;
  sub_profile_id: number;
  template_used: string;
  estimated_completion: string;
  priority: string;
  data:any;
}


export interface ProcessedVideoNotification {
  uuid: string;
  video_name: string;
  status: "completed" | "failed";
  error_message?: string;
}

export interface ProcessVideoPageProps {
  videos?: Video[];
  profiles?: Profile[];
  subProfiles?: SubProfile[];
  templates?: Template[];
  onVideoProcessed?: (video: AnalyticsVideo) => void;
}

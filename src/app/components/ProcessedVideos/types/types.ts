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

// Add these TypeScript declarations at the top of your VideoMetricsModal file
// or in a separate types file

declare global {
  interface Window {
    jsPDF: {
      jsPDF: new (options?: {
        orientation?: 'portrait' | 'landscape';
        unit?: 'mm' | 'pt' | 'px' | 'in' | 'ex' | 'em' | 'pc';
        format?: string | [number, number];
      }) => {
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
      };
    };
    html2canvas: (
      element: HTMLElement,
      options?: {
        scale?: number;
        useCORS?: boolean;
        allowTaint?: boolean;
        backgroundColor?: string;
        width?: number;
        scrollX?: number;
        scrollY?: number;
      }
    ) => Promise<HTMLCanvasElement>;
  }
}
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
  uuid: any;
  processing_duration_seconds(processing_duration_seconds: any): unknown;
  parsed_metrics(parsed_metrics: any): unknown;
  generated_charts: any;
  priority: any;
  processing_started_at: string | number | Date;
  processing_completed_at: string | number | Date;
  video_metadata: any;
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
  id: string;
  plot_type: string;
  series: boolean;
  title: any;
  status: string;
  value: undefined;
  styling: any;
  x_axis: any;
  insights: boolean;
  chart_id: string;
  type: string;
  data: any;
  labels: string[];
}


// PDF-related interfaces
export interface JsPDFOptions {
  orientation?: "portrait" | "landscape";
  unit?: "mm" | "cm" | "in" | "px";
  format?: string | [number, number];
}

export interface Html2CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  backgroundColor?: string;
  width?: number;
  height?: number;
  scrollX?: number;
  scrollY?: number;
  windowWidth?: number;
  windowHeight?: number;
  logging?: boolean;
  foreignObjectRendering?: boolean;
  removeContainer?: boolean;
}

export interface JsPDFInstance {
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number, alias?: string, compression?: string) => void;
  addPage: () => void;
  save: (filename: string) => void;
  setFillColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setFontSize: (size: number) => void;
  setFont: (fontName: string, fontStyle?: string) => void;
  setLineWidth: (width: number) => void;
  rect: (x: number, y: number, width: number, height: number, style?: string) => void;
  text: (text: string | string[], x: number, y: number, options?: { align?: string }) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  circle: (x: number, y: number, radius: number, style?: string) => void;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  internal: { getNumberOfPages: () => number };
  setPage: (page: number) => void;
}

export interface JsPDFConstructor {
  new (options?: JsPDFOptions): JsPDFInstance;
}

export interface Html2CanvasFunction {
  (element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
}

declare global {
  interface Window {
    jsPDF?: JsPDFConstructor;
    html2canvas?: Html2CanvasFunction;
    jspdf?: { jsPDF: JsPDFConstructor };
  }
}

export interface VideoMetricsPageProps {
  analyticsId: string | null;
  videoTitle?: string;
  mockMode?: boolean;
  onNavigate?: (page: string, analyticsId?: string) => void;
}

// Mock data
export const mockAnalytics: VideoAnalytics = {
  id: 27,
  uuid: "6cca6d41-7695-43cc-ac7d-45a50a85b2ac",
  user_id: 2,
  profile_id: 3,
  sub_profile_id: 5,
  template_id: 11,
  video_url: "https://storage.googleapis.com/videometrics_dev/videos/new vdo_ca2520fbe9234c5ea7deb94a38465632.mp4",
  compressed_video_url: "gs://videometrics_dev/processed/new_vdo_compressed.mp4",
  video_metadata: {
    charts_generated: 1,
    processing_steps: ["raw_analysis", "json_formatting", "charts", "summary"],
    structured_fields: 4,
    summary_generated: true,
    raw_analysis_length: 3487,
  },
  parsed_metrics: {
    total_customers: "23",
    average_wait_time: "5",
    customer_satisfaction_score: "4",
    peak_activity_hours: "30",
  },
  generated_charts: [
    {
      id: "chart_1",
      title: "Customer Satisfaction Breakdown",
      series: { value: [4, 1], category: ["Satisfied", "Needs Improvement"] },
      status: "good",
      x_axis: ["Satisfied", "Needs Improvement"],
      styling: { theme: "professional", show_legend: true, color_scheme: "category10" },
      insights: [
        "The customer satisfaction score is 4 out of 5, indicating a good level of satisfaction (80%).",
        "There is a 20% segment (1 unit out of 5) where satisfaction could be improved.",
        "Further investigation into the 'Needs Improvement' segment is recommended to identify specific pain points and enhance overall customer experience.",
      ],
      plot_type: "pie",
      data_source: "data_source",
      y_axis_label: "Score Units",
    },
    {
      id: "chart_2",
      title: "Total Customers",
      value: 23,
      status: "excellent",
      styling: { theme: "professional", show_legend: false, color_scheme: "category10", unit: "Customers", max_value: 50 },
      insights: [
        "A total of 23 customers were counted in the video.",
        "This metric provides the total number of individuals served or processed.",
      ],
      plot_type: "gauge",
      data_source: "data_source",
    },
  ],
  generated_summary: {
    format: "plain",
    content: "This report provides a comprehensive analysis of recent customer engagement and operational efficiency, likely reflecting farm stand activity or direct-to-consumer sales during a specified period. The data suggests a generally positive customer experience, though significant opportunities for growth and efficiency optimization are apparent, particularly concerning the utilization of identified peak activity periods.\n\n**Key Metrics**\nDuring the reporting period, a **total of 23 customers** were served. The **average wait time for customers was 5 minutes**, indicating reasonable service efficiency. Customer satisfaction remained strong, with an average score of 4 out of 5. The operation experienced 30 hours classified as 'peak activity hours'.\n\n**Recommendations**\nBased on the current data, the following recommendations are proposed to enhance farm operations and customer engagement:\n1. **Customer Outreach & Marketing:** Given the relatively low customer count of 23 over 30 identified peak hours, consider targeted marketing efforts to attract more visitors during these high-potential times.\n2. **Peak Hour Utilization Review:** Investigate the nature of the 30 'peak hours'. If these hours truly represent high potential traffic, strategies to convert this potential into actual customers are crucial.\n3. **Wait Time Optimization:** While an average wait time of 5 minutes is acceptable, continuous efforts to streamline the customer flow could further enhance the positive satisfaction score.\n4. **Leverage Satisfaction:** Maintain the high satisfaction score by continuing to provide quality products and friendly service.",
    sections: ["overview", "key_metrics", "recommendations", "anomalies", "peak_analysis"],
    word_count: 485,
    generated_at: "2025-08-30T17:19:49.636490+00:00",
    summary_type: "detailed",
    character_count: 3487,
    metrics_highlighted: ["total_customers", "average_wait_time"],
  },
  confidence_score: 75,
  insights: [],
  status: "completed",
  priority: "normal",
  error_message: null,
  processing_started_at: "2025-08-30T17:18:12.000000Z",
  processing_completed_at: "2025-08-30T17:19:49.636490Z",
  created_at: "2025-08-30T17:18:12.000000Z",
  updated_at: "2025-08-30T17:19:49.636490Z",
};

export interface ChartSeries {
  // Support both formats
  label?: string[];
  values?: number[];
  category?: string[];
  value?: number[];
  [key: string]: any;
}
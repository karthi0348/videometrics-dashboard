import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Interface for Process Video Request
export interface ProcessVideoRequest {
    video_url: string;
    profile_id: number;
    sub_profile_id: number;
    template_id: number;
    priority: "normal" | "high" | "low";
    custom_parameters: Record<string, any>;
}

// Interface for Process Video Success Response
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
}

// Interface for Validation Error Response
export interface ValidationErrorResponse {
    detail: Array<{
        loc: string[];
        msg: string;
        type: string;
    }>;
}

// Interface for Get Analytics Response
export interface GetAnalyticsResponse {
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
    confidence_scores: any[];
    timestamp: string;
    status: string;
    error_message: string;
    processing_started_at: string;
    processing_completed_at: string;
    processing_duration_seconds: number;
    created_at: string;
    updated_at: string;
}

// Interface for Analytics Insights Response
export interface AnalyticsInsightsResponse {
    insight_type: string;
    title: string;
    description: string;
    confidence: string;
    severity: string;
    data: any;
    action_items: any[];
    timestamp: string;
}

// Interface for Analytics List Response
export interface AnalyticsListResponse {
    data: Array<{
        error_message: any;
        profile_name: string;
        sub_profile_name: string;
        template_name: string;
        processing_duration: any;
        file_size: any;
        video_duration: any;
        video_url: any;
        thumbnail_url: any;
        id: number;
        analytics_id: string;
        video_title: string;
        processing_status: string;
        confidence_score: number;
        created_at: string;
        updated_at: string;
    }>;
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// Interface for Analytics List Query Parameters
export interface AnalyticsListParams {
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: string;
}

// Interface for Bulk Delete Request
export interface BulkDeleteRequest {
    entity_type: string;
    entity_ids: number[];
    confirm: boolean;
}

// Interface for Bulk Delete Response (from screenshot: 200 and 422 cases)
export interface BulkDeleteResponse {
    operation: string;
    total_requested: number;
    successful: number;
    failed: number;
    errors: Array<{
        loc?: string[];
        msg?: string;
        type?: string;
    }>;
}

export interface ChartData {
  title: string;
  image_url: string;
  summary: string;
}



export type AnalyticsChartsResponse = ChartData[];

class ProcessVideoApiService {

    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    // POST /process-video - Process Video
    processVideo = async (payload: ProcessVideoRequest): Promise<ProcessVideoResponse> => {
        try {
            let data: ProcessVideoResponse = await this.httpClientWrapper.post('process-video', payload);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // GET /analytics/{analytics_id} - Get Analytics
 getAnalytics = async (analyticsId: string): Promise<string> => {
    try {
      let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }
// Chart API Service Methods - Add these to your existing API service class

// GET /analytics/{analytics_id}/charts - Get Charts for Analytics
getCharts = async (analyticsId: string): Promise<string> => {
  try {
    let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}/charts`);
    return data;
  } catch (error) {
    throw error;
  }
}
getSummary = async (analyticsId: string): Promise<string> => {
  try {
    let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}/summary`);
    return data;
  } catch (error) {
    throw error;
  }
}
// GET /analytics/{analytics_id}/charts/{chart_id} - Get Specific Chart
getChart = async (analyticsId: string, chartId: string): Promise<string> => {
  try {
    let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}/charts/${chartId}`);
    return data;
  } catch (error) {
    throw error;
  }
}

// POST /analytics/{analytics_id}/charts/{chart_id}/refresh - Refresh Specific Chart
refreshChart = async (analyticsId: string, chartId: string): Promise<string> => {
  try {
    let data: string = await this.httpClientWrapper.post(`analytics/${analyticsId}/charts/${chartId}/refresh`, {});
    return data;
  } catch (error) {
    throw error;
  }
}

// POST /analytics/{analytics_id}/charts/refresh - Refresh All Charts
refreshAllCharts = async (analyticsId: string): Promise<string> => {
  try {
    let data: string = await this.httpClientWrapper.post(`analytics/${analyticsId}/charts/refresh`, {});
    return data;
  } catch (error) {
    throw error;
  }
} 
    deleteAnalytics = async (analyticsId: string): Promise<string> => {
        try {
            let data: string = await this.httpClientWrapper.delete(`analytics/${analyticsId}`);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // GET /analytics/{analytics_id}/insights - Get Analytics Insights
    getAnalyticsInsights = async (analyticsId: string): Promise<AnalyticsInsightsResponse> => {
        try {
            let data: AnalyticsInsightsResponse = await this.httpClientWrapper.get(`analytics/${analyticsId}/insights`);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // GET /analytics/{analytics_id}/charts - Get Analytics Charts
        getAnalyticsCharts = async (analyticsId: string): Promise<string> => {
            try {
                let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}/charts`);
                return data;
            } catch (error) {
                throw error;
            }
        }

    // GET /analytics/{analytics_id}/summary - Get Analytics Summary
    getAnalyticsSummary = async (analyticsId: string): Promise<string> => {
        try {
            let data: string = await this.httpClientWrapper.get(`analytics/${analyticsId}/summary`);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // GET /analytics - Get Analytics List
    getAnalyticsList = async (params?: AnalyticsListParams): Promise<AnalyticsListResponse> => {
        try {
            let endpoint = 'analytics';
            if (params) {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString());
                    }
                });
                const queryString = queryParams.toString();
                if (queryString) {
                    endpoint += `?${queryString}`;
                }
            }
            let data: AnalyticsListResponse = await this.httpClientWrapper.get(endpoint);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // POST /bulk/delete - Bulk Delete
    bulkDelete = async (payload: BulkDeleteRequest): Promise<BulkDeleteResponse> => {
        try {
            let data: BulkDeleteResponse = await this.httpClientWrapper.post('bulk/delete', payload);
            return data;
        } catch (error) {
            throw error;
        }
    }
}

export default ProcessVideoApiService;

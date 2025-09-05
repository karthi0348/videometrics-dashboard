import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
interface DashboardStats {
  total_videos: number;
  processed_videos: number;
  pending_videos: number;
  failed_videos: number;
  total_profiles: number;
  active_profiles: number;
  total_templates: number;
  public_templates: number;
  processing_time_avg: number;
  success_rate: number;
  recent_activity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }>;
  // Add other dashboard statistics as needed
}

class DashboardApiService {
    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    getDashboardStats = async (): Promise<DashboardStats> => {
        try {
            const data = await this.httpClientWrapper.get<DashboardStats>('/dashboard/stats');
            return data;
        } catch (error) {
            throw error;
        }
    }
}

export default DashboardApiService;
import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
interface Video {
  id: number;
  url: string;
  title?: string;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  // Add other video properties as needed
}

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

class VideoApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get all videos
  getAllVideos = async (url: string): Promise<ApiResponse<Video[]>> => {
    try {
      const data = await this.httpClientWrapper.get<ApiResponse<Video[]>>(`/video-urls${url}`);
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default VideoApiService;
import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
export interface SubProfile {
  id: number;
  name: string;
  profile_id: number;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Add other sub-profile properties as needed
}

export interface ApiResponse<T = unknown> {
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

class SubProfileApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get all subprofiles for a profile
  getAllSubProfile = async (profileId: string | number, url: string = ""): Promise<ApiResponse<SubProfile[]>> => {
    try {
      const data = await this.httpClientWrapper.get<ApiResponse<SubProfile[]>>(`/profiles/${profileId}/sub-profiles${url}`);
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default SubProfileApiService;
import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
interface Profile {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Add other profile properties as needed
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

class ProfileApiService {
    private httpClientWrapper: HttpClientWrapper;

    constructor() {
        this.httpClientWrapper = new HttpClientWrapper();
    }

    getAllProfile = async (url: string): Promise<ApiResponse<Profile[]>> => {
        try {
            const data = await this.httpClientWrapper.get<ApiResponse<Profile[]>>('profiles' + url);
            return data;
        } catch (error) {
            throw error;
        }
    }
}

export default ProfileApiService;
import HttpClientWrapper from "@/helpers/http-client-wrapper";

class VideoApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get all videos
  getAllVideos = async (url: string) => {
    try {
      const data: any = await this.httpClientWrapper.get(`/video-urls` + url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Get a specific video URL mapping by video_id
  getVideoById = async (video_id: number) => {
    try {
      const data: any = await this.httpClientWrapper.get(`/video-urls/${video_id}`);
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default VideoApiService;
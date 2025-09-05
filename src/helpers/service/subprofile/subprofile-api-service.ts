import HttpClientWrapper from "@/helpers/http-client-wrapper";

class SubProfileApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  // Get all subprofiles for a profile
  getAllSubProfile = async (profileId: string | number, url: string = "") => {
    try {
      const data: any = await this.httpClientWrapper.get(`/profiles/${profileId}/sub-profiles${url}`);
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default SubProfileApiService;

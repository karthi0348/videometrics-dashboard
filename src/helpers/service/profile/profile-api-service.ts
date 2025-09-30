import HttpClientWrapper from "@/helpers/http-client-wrapper";

class ProfileService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  /**
   * Get all profiles
   */
  getAllProfiles = async (url: any) => {
    try {
      let data: any = await this.httpClientWrapper.get('profiles' + url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get a single profile by ID
   */
  getProfileById = async (profileId: number | string) => {
    try {
      let data: any = await this.httpClientWrapper.get(`profiles/${profileId}`);
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Create a new profile
   */
  createProfile = async (payload: any) => {
    try {
      let data: any = await this.httpClientWrapper.post('profiles', payload);
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update an existing profile
   */
  updateProfile = async (profileId: number | string, payload: any) => {
    try {
      let data: any = await this.httpClientWrapper.put(`profiles/${profileId}`, payload);
      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Delete a profile
   */
  deleteProfile = async (profileId: number | string) => {
    try {
      await this.httpClientWrapper.delete(`profiles/${profileId}`);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Search profiles with query parameters
   */
  searchProfiles = async (url: any) => {
    try {
      let data: any = await this.httpClientWrapper.get('profiles' + url);
      return data;
    } catch (error) {
      throw error;
    }
  };
}

export default ProfileService;
import HttpClientWrapper from "@/helpers/http-client-wrapper";

class TemplateApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  getAllTemplate = async (url: any) => {
    try {
      let data: any = await this.httpClientWrapper.get("templates" + url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  getAllTemplateById = async (url: any) => {
    try {
      let data: any = await this.httpClientWrapper.get("templates/" + url);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // TemplateApiService.ts
  getAllTemplateBySubProfile = async (subProfileId: string | number) => {
    try {
      const data: any = await this.httpClientWrapper.get(
        `/sub-profiles/${subProfileId}/assigned-templates`
      );
      return data;
    } catch (error) {
      throw error;
    }
  };


  getAssignedTemplatesBySubProfile = async (subProfileId: number) => {
  return await this.httpClientWrapper.get(`/sub-profiles/${subProfileId}/assigned-templates`);
};

getTemplateById = async (templateId: number) => {
  return await this.httpClientWrapper.get(`/templates/${templateId}`);
};

  createTemplate = async (payload: any) => {
    try {
      let data: any = await this.httpClientWrapper.post("templates", payload);
      return data;
    } catch (error) {
      throw error;
    }
  };

  editTemplate = async (id: any, payload: any) => {
    try {
      let data: any = await this.httpClientWrapper.put(
        "templates/" + id,
        payload
      );
      return data;
    } catch (error) {
      throw error;
    }
  };

  deleteTemplate = async (id: any) => {
    try {
      let data: any = await this.httpClientWrapper.delete("templates/" + id);
      return data;
    } catch (error) {
      throw error;
    }
  };

  assignSUbProfile = async (tempId: any, payload: any) => {
    try {
      let data: any = await this.httpClientWrapper.post(
        "templates/" + tempId + "/assign-subprofiles",
        payload
      );
      return data;
    } catch (error) {
      throw error;
    }
  };

  getSubProfileAssignments = async (tempId: any) => {
    try {
      let data: any = await this.httpClientWrapper.get(
        "templates/" + tempId + "/assigned-subprofiles"
      );
      return data;
    } catch (error) {
      throw error;
    }
  };
}
export default TemplateApiService;

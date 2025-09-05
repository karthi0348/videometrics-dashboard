import HttpClientWrapper from "@/helpers/http-client-wrapper";

// Define interfaces for better type safety
export interface Template {
  id: number;
  template_name: string;
  description: string;
  tags: string[];
  version: string;
  analysis_prompt: string;
  metric_structure: Record<string, unknown> | null;
  chart_config: unknown[];
  summary_config: unknown | null;
  gui_config: {
    layout_type: string;
    theme: string;
    components: unknown[];
    responsive_breakpoints: Record<string, unknown>;
    custom_css: string;
  };
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplatePayload {
  template_name: string;
  description: string;
  tags: string[];
  version: string;
  analysis_prompt: string;
  metric_structure: Record<string, unknown> | null;
  chart_config: unknown[];
  summary_config: unknown | null;
  gui_config: {
    layout_type: string;
    theme: string;
    components: unknown[];
    responsive_breakpoints: Record<string, unknown>;
    custom_css: string;
  };
  is_public: boolean;
}

// Updated interface to match the actual API requirements
export interface AssignSubProfilePayload {
  template_id: string | number;
  sub_profile_ids: (string | number)[];
  priority: '1' | '2' | '3';
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

class TemplateApiService {
  private httpClientWrapper: HttpClientWrapper;

  constructor() {
    this.httpClientWrapper = new HttpClientWrapper();
  }

  getAllTemplate = async (url: string): Promise<ApiResponse<Template[]>> => {
    try {
      const data = await this.httpClientWrapper.get("templates" + url);
      return data as ApiResponse<Template[]>;
    } catch (error) {
      throw error;
    }
  };

  getAllTemplateById = async (url: string | number): Promise<Template> => {
    try {
      const data = await this.httpClientWrapper.get("templates/" + url);
      return data as Template;
    } catch (error) {
      throw error;
    }
  };

  // TemplateApiService.ts
  getAllTemplateBySubProfile = async (subProfileId: string | number): Promise<ApiResponse<Template[]>> => {
    try {
      const data = await this.httpClientWrapper.get(
        `/sub-profiles/${subProfileId}/assigned-templates`
      );
      return data as ApiResponse<Template[]>;
    } catch (error) {
      throw error;
    }
  };

  getAssignedTemplatesBySubProfile = async (subProfileId: number): Promise<ApiResponse<Template[]>> => {
    return await this.httpClientWrapper.get(`/sub-profiles/${subProfileId}/assigned-templates`) as ApiResponse<Template[]>;
  };

  getTemplateById = async (templateId: number): Promise<Template> => {
    return await this.httpClientWrapper.get(`/templates/${templateId}`) as Template;
  };

  createTemplate = async (payload: CreateTemplatePayload): Promise<ApiResponse<Template>> => {
    try {
      const data = await this.httpClientWrapper.post("templates", payload);
      return data as ApiResponse<Template>;
    } catch (error) {
      throw error;
    }
  };

  editTemplate = async (id: string | number, payload: CreateTemplatePayload): Promise<ApiResponse<Template>> => {
    try {
      const data = await this.httpClientWrapper.put(
        "templates/" + id,
        payload
      );
      return data as ApiResponse<Template>;
    } catch (error) {
      throw error;
    }
  };

  deleteTemplate = async (id: string | number): Promise<ApiResponse<{ deleted: boolean }>> => {
    try {
      const data = await this.httpClientWrapper.delete("templates/" + id);
      return data as ApiResponse<{ deleted: boolean }>;
    } catch (error) {
      throw error;
    }
  };

  assignSubProfile = async (tempId: string | number, payload: AssignSubProfilePayload): Promise<ApiResponse<unknown>> => {
    try {
      const data = await this.httpClientWrapper.post(
        "templates/" + tempId + "/assign-subprofiles",
        payload
      );
      return data as ApiResponse<unknown>;
    } catch (error) {
      throw error;
    }
  };

  getSubProfileAssignments = async (tempId: string | number): Promise<ApiResponse<unknown[]>> => {
    try {
      const data = await this.httpClientWrapper.get(
        "templates/" + tempId + "/assigned-subprofiles"
      );
      return data as ApiResponse<unknown[]>;
    } catch (error) {
      throw error;
    }
  };
}

export default TemplateApiService;
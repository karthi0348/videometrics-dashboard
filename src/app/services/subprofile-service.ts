// services/subProfileService.ts

import { 
  CreateSubProfileAPIRequest, 
  UpdateSubProfileAPIRequest,
  SubProfile, 
  SubProfileResponse,
  SubProfileListResponse,
  convertApiResponseToSubProfile,
  CameraLocation,
  MonitoringSchedule,
  AlertSettings
} from '@/app/types/subprofiles';
import { API_ENDPOINTS } from '../config/api';

// Define interfaces for better type safety
interface ErrorResponse {
  detail?: string;
  message?: string;
}

interface ApiListResponse {
  sub_profiles?: SubProfileResponse[];
  data?: SubProfileResponse[];
}

export class SubProfileService {
  private getAuthHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  async createSubProfile(
    profileId: number, 
    data: CreateSubProfileAPIRequest
  ): Promise<SubProfile> {
    const url = API_ENDPOINTS.CREATE_SUBPROFILE.replace('{profile_id}', profileId.toString());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to create sub-profiles.');
      }
      const errorData = await response.json().catch(() => ({})) as ErrorResponse;
      throw new Error(errorData.detail || errorData.message || `Failed to create sub-profile: ${response.status} - ${response.statusText}`);
    }

    const responseData: SubProfileResponse = await response.json();
    return convertApiResponseToSubProfile(responseData);
  }

  async getSubProfiles(profileId: number): Promise<SubProfile[]> {
    const url = API_ENDPOINTS.LIST_SUBPROFILES.replace('{profile_id}', profileId.toString());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to view sub-profiles.');
      }
      throw new Error(`Failed to fetch sub-profiles: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json() as SubProfileResponse[] | ApiListResponse;
    
    // Handle different response formats
    let subProfilesArray: SubProfileResponse[] = [];
    
    if (Array.isArray(data)) {
      subProfilesArray = data;
    } else if (data.sub_profiles && Array.isArray(data.sub_profiles)) {
      subProfilesArray = data.sub_profiles;
    } else if (data.data && Array.isArray(data.data)) {
      subProfilesArray = data.data;
    } else {
      // Single item response
      subProfilesArray = [data as SubProfileResponse];
    }

    return subProfilesArray.map(convertApiResponseToSubProfile);
  }

  async getSubProfile(subProfileId: number): Promise<SubProfile> {
    const url = API_ENDPOINTS.GET_SUBPROFILE.replace('{subprofile_id}', subProfileId.toString());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to view this sub-profile.');
      }
      if (response.status === 404) {
        throw new Error('Sub-profile not found.');
      }
      throw new Error(`Failed to fetch sub-profile: ${response.status} - ${response.statusText}`);
    }

    const responseData: SubProfileResponse = await response.json();
    return convertApiResponseToSubProfile(responseData);
  }

  async updateSubProfile(
    profileId: number, 
    subProfileId: number, 
    data: UpdateSubProfileAPIRequest
  ): Promise<SubProfile> {
    const url = API_ENDPOINTS.UPDATE_SUBPROFILE.replace('{subprofile_id}', subProfileId.toString());
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to update this sub-profile.');
      }
      if (response.status === 404) {
        throw new Error('Sub-profile not found.');
      }
      const errorData = await response.json().catch(() => ({})) as ErrorResponse;
      throw new Error(errorData.detail || errorData.message || `Failed to update sub-profile: ${response.status}`);
    }

    const responseData: SubProfileResponse = await response.json();
    return convertApiResponseToSubProfile(responseData);
  }

  async patchSubProfile(
    subProfileId: number, 
    data: Partial<UpdateSubProfileAPIRequest>
  ): Promise<SubProfile> {
    const url = API_ENDPOINTS.UPDATE_SUBPROFILE.replace('{subprofile_id}', subProfileId.toString());
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to update this sub-profile.');
      }
      if (response.status === 404) {
        throw new Error('Sub-profile not found.');
      }
      const errorData = await response.json().catch(() => ({})) as ErrorResponse;
      throw new Error(errorData.detail || errorData.message || `Failed to patch sub-profile: ${response.status}`);
    }

    const responseData: SubProfileResponse = await response.json();
    return convertApiResponseToSubProfile(responseData);
  }

  async deleteSubProfile(profileId: number, subProfileId: number): Promise<void> {
    const url = API_ENDPOINTS.DELETE_SUBPROFILE.replace('{subprofile_id}', subProfileId.toString());
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to delete this sub-profile.');
      }
      if (response.status === 404) {
        throw new Error('Sub-profile not found.');
      }
      const errorData = await response.json().catch(() => ({})) as ErrorResponse;
      throw new Error(errorData.detail || errorData.message || `Failed to delete sub-profile: ${response.status}`);
    }
  }

  async toggleActiveStatus(subProfile: SubProfile): Promise<SubProfile> {
    const newStatus = !subProfile.isActive;
    return this.patchSubProfile(subProfile.id, { is_active: newStatus });
  }

  // Helper method to create sub-profile with detailed configuration
  async createSubProfileWithDetails(
    profileId: number,
    basicInfo: {
      name: string;
      description: string;
      areaType: string;
      tags: string[];
    },
    cameraLocations: CameraLocation[] = [],
    monitoringSchedules: MonitoringSchedule[] = [],
    alertSettings: AlertSettings[] = []
  ): Promise<SubProfile> {
    // Convert arrays to objects as expected by the API
    const camera_locations: Record<string, unknown> = {};
    cameraLocations.forEach((camera, index) => {
      camera_locations[`camera_${index}`] = camera;
    });

    const monitoring_schedule: Record<string, unknown> = {};
    monitoringSchedules.forEach((schedule, index) => {
      monitoring_schedule[`schedule_${index}`] = schedule;
    });

    const alert_settings: Record<string, unknown> = {};
    alertSettings.forEach((alert, index) => {
      alert_settings[`alert_${index}`] = alert;
    });

    const apiRequest: CreateSubProfileAPIRequest = {
      sub_profile_name: basicInfo.name,
      description: basicInfo.description,
      area_type: basicInfo.areaType,
      tags: basicInfo.tags,
      camera_locations,
      monitoring_schedule,
      alert_settings
    };

    return this.createSubProfile(profileId, apiRequest);
  }

  // Helper method to update sub-profile with detailed configuration
  async updateSubProfileWithDetails(
    profileId: number,
    subProfileId: number,
    basicInfo: {
      name?: string;
      description?: string;
      areaType?: string;
      tags?: string[];
    },
    cameraLocations?: CameraLocation[],
    monitoringSchedules?: MonitoringSchedule[],
    alertSettings?: AlertSettings[]
  ): Promise<SubProfile> {
    const updateData: UpdateSubProfileAPIRequest = {};

    // Basic info updates
    if (basicInfo.name !== undefined) {
      updateData.sub_profile_name = basicInfo.name;
    }
    if (basicInfo.description !== undefined) {
      updateData.description = basicInfo.description;
    }
    if (basicInfo.areaType !== undefined) {
      updateData.area_type = basicInfo.areaType;
    }
    if (basicInfo.tags !== undefined) {
      updateData.tags = basicInfo.tags;
    }

    // Convert camera locations if provided
    if (cameraLocations !== undefined) {
      const camera_locations: Record<string, unknown> = {};
      cameraLocations.forEach((camera, index) => {
        camera_locations[`camera_${index}`] = camera;
      });
      updateData.camera_locations = camera_locations;
    }

    // Convert monitoring schedules if provided
    if (monitoringSchedules !== undefined) {
      const monitoring_schedule: Record<string, unknown> = {};
      monitoringSchedules.forEach((schedule, index) => {
        monitoring_schedule[`schedule_${index}`] = schedule;
      });
      updateData.monitoring_schedule = monitoring_schedule;
    }

    // Convert alert settings if provided
    if (alertSettings !== undefined) {
      const alert_settings: Record<string, unknown> = {};
      alertSettings.forEach((alert, index) => {
        alert_settings[`alert_${index}`] = alert;
      });
      updateData.alert_settings = alert_settings;
    }

    return this.updateSubProfile(profileId, subProfileId, updateData);
  }

  // Validation helpers
  validateCameraLocation(camera: Partial<CameraLocation>): string[] {
    const errors: string[] = [];
    
    if (!camera.name?.trim()) {
      errors.push('Camera name is required');
    }
    if (!camera.location?.trim()) {
      errors.push('Camera location is required');
    }
    if (!camera.cameraType?.trim()) {
      errors.push('Camera type is required');
    }
    if (camera.ipAddress && !this.isValidIP(camera.ipAddress)) {
      errors.push('Invalid IP address format');
    }
    if (camera.port && (camera.port < 1 || camera.port > 65535)) {
      errors.push('Port must be between 1 and 65535');
    }

    return errors;
  }

  validateMonitoringSchedule(schedule: Partial<MonitoringSchedule>): string[] {
    const errors: string[] = [];
    
    if (!schedule.name?.trim()) {
      errors.push('Schedule name is required');
    }
    if (!schedule.startTime?.trim()) {
      errors.push('Start time is required');
    }
    if (!schedule.endTime?.trim()) {
      errors.push('End time is required');
    }
    if (!schedule.days || schedule.days.length === 0) {
      errors.push('At least one day must be selected');
    }

    return errors;
  }

  validateAlertSettings(alert: Partial<AlertSettings>): string[] {
    const errors: string[] = [];
    
    if (!alert.name?.trim()) {
      errors.push('Alert name is required');
    }
    if (!alert.type?.trim()) {
      errors.push('Alert type is required');
    }
    if (!alert.notificationMethods || alert.notificationMethods.length === 0) {
      errors.push('At least one notification method is required');
    }

    return errors;
  }

  private isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }
}

// Export singleton instance
export const subProfileService = new SubProfileService();
export default subProfileService;
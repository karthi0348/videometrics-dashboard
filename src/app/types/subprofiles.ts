// types/subprofiles.ts

// Frontend interface for form data
export interface CameraLocation {
  id?: string;
  name: string;
  location: string;
  cameraType: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  isActive?: boolean;
}

export interface MonitoringSchedule {
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  timezone?: string;
  isActive?: boolean;
}

export interface AlertSettings {
  id?: string;
  name: string;
  type: string;
  threshold?: number;
  enabled: boolean;
  notificationMethods: string[];
  conditions?: Record<string, unknown>; // Changed from 'any' to 'unknown'
}

// API Request interface that matches backend expectations
export interface CreateSubProfileAPIRequest {
  sub_profile_name: string;
  description: string;
  tags: string[];
  area_type: string;
  camera_locations: Record<string, unknown>; // Changed from 'any' to 'unknown'
  monitoring_schedule: Record<string, unknown>; // Changed from 'any' to 'unknown'
  alert_settings: Record<string, unknown>; // Changed from 'any' to 'unknown'
}

// API Update interface for PATCH requests
export interface UpdateSubProfileAPIRequest {
  sub_profile_name?: string;
  description?: string;
  tags?: string[];
  area_type?: string;
  camera_locations?: Record<string, unknown>; // Changed from 'any' to 'unknown'
  monitoring_schedule?: Record<string, unknown>; // Changed from 'any' to 'unknown'
  alert_settings?: Record<string, unknown>; // Changed from 'any' to 'unknown'
  is_active?: boolean;
}

// API Response interface from backend
export interface SubProfileResponse {
  id: number;
  uuid: string;
  profile_id: number;
  sub_profile_name: string;
  description: string;
  tags: string[];
  area_type: string;
  camera_locations: Record<string, unknown>; // Changed from 'any' to 'unknown'
  monitoring_schedule: Record<string, unknown>; // Changed from 'any' to 'unknown'
  alert_settings: Record<string, unknown>; // Changed from 'any' to 'unknown'
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Frontend display interface (converted from API response)
export interface SubProfile {
  id: number;
  uuid: string;
  profileId: number;
  name: string;
  description: string;
  tags: string[];
  areaType: string;
  cameraLocations: CameraLocation[];
  monitoringSchedules: MonitoringSchedule[];
  alertSettings: AlertSettings[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions for type conversion
export const convertApiResponseToSubProfile = (apiResponse: SubProfileResponse): SubProfile => {
  // Convert camera_locations object back to array
  const cameraLocations = Object.values(apiResponse.camera_locations).filter(Boolean) as CameraLocation[];
  
  // Convert monitoring_schedule object back to array
  const monitoringSchedules = Object.values(apiResponse.monitoring_schedule).filter(Boolean) as MonitoringSchedule[];
  
  // Convert alert_settings object back to array
  const alertSettings = Object.values(apiResponse.alert_settings).filter(Boolean) as AlertSettings[];

  return {
    id: apiResponse.id,
    uuid: apiResponse.uuid,
    profileId: apiResponse.profile_id,
    name: apiResponse.sub_profile_name,
    description: apiResponse.description,
    tags: apiResponse.tags,
    areaType: apiResponse.area_type,
    cameraLocations,
    monitoringSchedules,
    alertSettings,
    isActive: apiResponse.is_active,
    createdAt: new Date(apiResponse.created_at),
    updatedAt: new Date(apiResponse.updated_at)
  };
};

export const convertSubProfileToApiRequest = (
  subProfile: Partial<SubProfile>,
  cameraLocations: CameraLocation[] = [],
  monitoringSchedules: MonitoringSchedule[] = [],
  alertSettings: AlertSettings[] = []
): CreateSubProfileAPIRequest => {
  return {
    sub_profile_name: subProfile.name || '',
    description: subProfile.description || '',
    tags: subProfile.tags || [],
    area_type: subProfile.areaType || '',
    camera_locations: cameraLocations.reduce((acc, camera, index) => {
      acc[`camera_${index}`] = camera;
      return acc;
    }, {} as Record<string, unknown>), // Changed from 'any' to 'unknown'
    monitoring_schedule: monitoringSchedules.reduce((acc, schedule, index) => {
      acc[`schedule_${index}`] = schedule;
      return acc;
    }, {} as Record<string, unknown>), // Changed from 'any' to 'unknown'
    alert_settings: alertSettings.reduce((acc, alert, index) => {
      acc[`alert_${index}`] = alert;
      return acc;
    }, {} as Record<string, unknown>) // Changed from 'any' to 'unknown'
  };
};

// Error interface for API responses
export interface ApiError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// List response interface
export interface SubProfileListResponse {
  sub_profiles: SubProfileResponse[];
  total: number;
  page?: number;
  size?: number;
}


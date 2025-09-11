export const API_BASE_URL = 'http://172.174.114.7:8000';

export const API_ENDPOINTS = {
  UPLOAD_VIDEO: `${API_BASE_URL}/upload-video`,
  LIST_VIDEOS: `${API_BASE_URL}/video-urls`,
  GET_VIDEO: `${API_BASE_URL}/video-urls/{video_id}`,
  UPDATE_VIDEO: `${API_BASE_URL}/video-urls/{video_id}`,
  DELETE_VIDEO: `${API_BASE_URL}/video-urls/{video_id}`,
  BULK_DELETE_VIDEOS: `${API_BASE_URL}/video-urls/bulk-delete`,

  CREATE_PROFILE: `${API_BASE_URL}/profiles`,
  LIST_PROFILES: `${API_BASE_URL}/profiles`,
  GET_PROFILE: `${API_BASE_URL}/profiles/{profile_id}`,
  UPDATE_PROFILE: `${API_BASE_URL}/profiles/{profile_id}`,
  DELETE_PROFILE: `${API_BASE_URL}/profiles/{profile_id}`,
  
  // New endpoint for creating subprofiles
  CREATE_SUBPROFILE: `${API_BASE_URL}/profiles/{profile_id}/sub-profiles`,
  LIST_SUBPROFILES: `${API_BASE_URL}/profiles/{profile_id}/sub-profiles`,
  GET_SUBPROFILE: `${API_BASE_URL}/sub-profiles/{subprofile_id}`,
  UPDATE_SUBPROFILE:`${API_BASE_URL}/sub-profiles/{subprofile_id}`,
  DELETE_SUBPROFILE:`${API_BASE_URL}/sub-profiles/{subprofile_id}`,


  
};
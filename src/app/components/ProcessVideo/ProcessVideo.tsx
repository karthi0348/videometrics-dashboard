import React, { useState, useEffect } from 'react';
import ProcessVideoApiService from '../../../helpers/service/processvideo/ProcessVideoApiservice';
import TemplateApiService from '../../../helpers/service/templates/template-api-service';
import { API_ENDPOINTS } from '../../config/api';

interface Video {
  id: number;
  name: string;
  url: string;
  size: string;
  uploaded: string;
  video_name?: string;
  file_size?: string;
  created_at?: string;
}

interface Profile {
  id: number;
  name: string;
  email?: string;
  tag?: string;
  contact?: string;
  description?: string;
}

interface SubProfile {
  id: number;
  name: string;
  profile_id: number;
  description?: string;
  areaType?: string;
  isActive?: boolean;
}

interface Template {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

interface ProcessVideoPageProps {
  videos?: Video[];
  profiles?: Profile[];
  subProfiles?: SubProfile[];
  templates?: Template[];
}

interface ProcessingVideo {
  video_id: number;
  uuid: string;
  video_name: string;
  status: string;
  estimated_completion: string;
  priority: string;
}

const ProcessVideoPage: React.FC<ProcessVideoPageProps> = ({ 
  videos: propVideos,
  profiles: propProfiles,
  subProfiles: propSubProfiles,
  templates: propTemplates
}) => {
  // State for form data
  const [selectedVideoId, setSelectedVideoId] = useState<number | ''>('');
  const [selectedProfileId, setSelectedProfileId] = useState<number | ''>('');
  const [selectedSubProfileId, setSelectedSubProfileId] = useState<number | ''>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'low'>('normal');
  const [customParameters, setCustomParameters] = useState<string>('{}');
  
  // State for API data
  const [videos, setVideos] = useState<Video[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingVideo[]>([]);
  const [apiService] = useState(new ProcessVideoApiService());
  const [templateApiService] = useState(new TemplateApiService());
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Helper function to get authentication headers
  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  };

  // Load videos from API
  const loadVideos = async () => {
    if (propVideos) {
      setVideos(propVideos);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.LIST_VIDEOS,
        {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log(response) 

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const data = await response.json();
      const videosArray = Array.isArray(data) ? data : data.videos || [];
      
      const transformedVideos: Video[] = videosArray.map((item: any) => ({
        id: Number(item.id) || Date.now(),
        name: item.video_name || item.name || 'Untitled Video',
        url: item.url || item.video_url || '',
        size: item.file_size || item.size || 'Unknown',
        uploaded: item.created_at || item.uploaded || new Date().toLocaleDateString(),
      }));

      setVideos(transformedVideos);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    }
  };

  // Load profiles from API
  const loadProfiles = async () => {
    if (propProfiles) {
      setProfiles(propProfiles);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.LIST_PROFILES || '/profiles', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`Failed to fetch profiles: ${response.status}`);
      }

      const data = await response.json();
      const profilesArray = Array.isArray(data) ? data : data.profiles || [];
      
      const transformedProfiles: Profile[] = profilesArray.map((item: any) => ({
        id: Number(item.id) || Date.now(),
        name: item.name || 'Untitled Profile',
        email: item.email || '',
        tag: item.tag || 'default',
        contact: item.contact || item.contact_person || '',
        description: item.description || '',
      }));

      setProfiles(transformedProfiles);
      
      // Auto-select first profile if available
      if (transformedProfiles.length > 0) {
        setSelectedProfileId(transformedProfiles[0].id);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    }
  };

  // Load sub-profiles from API
  const loadSubProfiles = async (profileId?: number) => {
    if (propSubProfiles) {
      setSubProfiles(propSubProfiles);
      return;
    }

    if (!profileId) return;

    try {
      const endpoint = API_ENDPOINTS.LIST_SUBPROFILES?.replace('{profile_id}', profileId.toString()) || `/profiles/${profileId}/subprofiles`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        // Don't throw error for sub-profiles as they might not exist
        console.warn(`Failed to fetch sub-profiles: ${response.status}`);
        setSubProfiles([]);
        return;
      }

      const data = await response.json();
      const subProfilesArray = Array.isArray(data) ? data : data.subProfiles || [];
      
      const transformedSubProfiles: SubProfile[] = subProfilesArray.map((item: any) => ({
        id: Number(item.id) || Date.now(),
        name: item.name || 'Untitled Sub-Profile',
        profile_id: Number(item.profile_id || item.profileId) || profileId,
        description: item.description || '',
        areaType: item.areaType || item.area_type || 'general',
        isActive: item.isActive !== undefined ? item.isActive : item.is_active !== undefined ? item.is_active : true,
      }));

      setSubProfiles(transformedSubProfiles);
    } catch (err) {
      console.error('Error loading sub-profiles:', err);
      // Don't set error for sub-profiles as they're optional
      setSubProfiles([]);
    }
  };

  // Load templates from API using TemplateApiService
  const loadTemplates = async () => {
    if (propTemplates) {
      setTemplates(propTemplates);
      return;
    }

    try {
      // Use the TemplateApiService with empty query string to get all templates
      const data = await templateApiService.getAllTemplate('');
      
      // Handle different response formats
      const templatesArray = Array.isArray(data) ? data : 
                           data.templates ? data.templates : 
                           data.data ? data.data : [];
      
      const transformedTemplates: Template[] = templatesArray.map((item: any) => ({
        id: Number(item.id) || Date.now(),
        name: item.name || 'Untitled Template',
        description: item.description || '',
        type: item.type || 'analysis',
      }));

      setTemplates(transformedTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
      // Fallback to default templates if API fails
      setTemplates([
        { id: 1, name: 'Basic Analytics Template', description: 'Basic video analysis' },
        { id: 2, name: 'Advanced Metrics Template', description: 'Advanced video metrics' },
        { id: 3, name: 'Custom Analysis Template', description: 'Custom analysis options' },
        { id: 4, name: 'Performance Review Template', description: 'Performance review template' }
      ]);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError('');
      
      try {
        await Promise.all([
          loadVideos(),
          loadProfiles(),
          loadTemplates()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Load sub-profiles when profile changes
  useEffect(() => {
    if (selectedProfileId && typeof selectedProfileId === 'number') {
      loadSubProfiles(selectedProfileId);
      setSelectedSubProfileId(''); // Reset sub-profile selection
    } else {
      setSubProfiles([]);
      setSelectedSubProfileId('');
    }
  }, [selectedProfileId]);

  // Filter sub-profiles based on selected profile
  const availableSubProfiles = subProfiles.filter(
    subProfile => subProfile.profile_id === selectedProfileId
  );

  const selectedVideo = videos.find(video => video.id === selectedVideoId);

  const handleProcessVideo = async () => {
    if (!selectedVideoId || !selectedTemplateId) {
      setError('Please select both a video and a template');
      return;
    }

    const video = videos.find(v => v.id === selectedVideoId);
    if (!video) {
      setError('Selected video not found');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Parse custom parameters
      let parsedCustomParameters = {};
      if (customParameters.trim()) {
        try {
          parsedCustomParameters = JSON.parse(customParameters);
        } catch (e) {
          throw new Error('Invalid JSON format in custom parameters');
        }
      }

      const payload = {
        video_url: video.url,
        profile_id: selectedProfileId || 0,
        sub_profile_id: selectedSubProfileId ? Number(selectedSubProfileId) : 0,
        template_id: Number(selectedTemplateId),
        priority,
        custom_parameters: parsedCustomParameters
      };

      const response = await apiService.processVideo(payload);
      
      // Add to processing queue
      const processingVideo: ProcessingVideo = {
        video_id: response.video_id,
        uuid: response.uuid,
        video_name: video.name,
        status: response.status,
        estimated_completion: response.estimated_completion,
        priority: response.priority
      };

      setProcessingQueue(prev => [...prev, processingVideo]);
      setSuccess(`Video "${video.name}" has been submitted for processing successfully!`);
      
      // Reset form
      setSelectedVideoId('');
      setSelectedTemplateId('');
      setSelectedSubProfileId('');
      setCustomParameters('{}');

    } catch (error: any) {
      console.error('Error processing video:', error);
      if (error.response?.data?.detail) {
        const validationErrors = error.response.data.detail
          .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
          .join(', ');
        setError(`Validation error: ${validationErrors}`);
      } else {
        setError(error.message || 'Failed to process video. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAllVideos = () => {
    console.log('Navigate to All Videos');
  };

  const handleViewAnalytics = (uuid: string) => {
    console.log(`Navigate to analytics for UUID: ${uuid}`);
  };

  const removeFromQueue = (uuid: string) => {
    setProcessingQueue(prev => prev.filter(video => video.uuid !== uuid));
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Loading Process Video</h3>
          <p className="text-gray-600 text-sm text-center">Fetching videos, profiles, and templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Process Video</h1>
              <p className="text-gray-600 mt-1">Upload and analyze your videos with powerful AI-driven metrics</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={handleAllVideos}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                </svg>
                All Videos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Select Video</span>
              <svg className="w-4 h-4 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Select Analytics</span>
              <svg className="w-4 h-4 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Process</span>
              <svg className="w-4 h-4 ml-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                4
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">View Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-green-800">{success}</div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div className="text-red-800">{error}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Process Video Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 text-teal-500 mr-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Process Video Form</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Choose a video to process with the selected analytics profile</p>

            <div className="space-y-6">
              {/* Select Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Video *
                </label>
                <select 
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  disabled={videos.length === 0}
                >
                  <option value="">
                    {videos.length === 0 ? 'No videos available' : 'Select a video'}
                  </option>
                  {videos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.name} ({video.size})
                    </option>
                  ))}
                </select>
                {selectedVideo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {selectedVideo.uploaded}
                  </p>
                )}
              </div>

              {/* Select Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Profile *
                </label>
                <select 
                  value={selectedProfileId}
                  onChange={(e) => {
                    setSelectedProfileId(e.target.value ? Number(e.target.value) : '');
                    setSelectedSubProfileId(''); // Reset sub-profile when profile changes
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  disabled={profiles.length === 0}
                >
                  <option value="">
                    {profiles.length === 0 ? 'No profiles available' : 'Select a profile'}
                  </option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Sub-Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sub-Profile (Optional)
                </label>
                <select 
                  value={selectedSubProfileId}
                  onChange={(e) => setSelectedSubProfileId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  disabled={!selectedProfileId || availableSubProfiles.length === 0}
                >
                  <option value="">
                    {!selectedProfileId ? 'Select a profile first' : 
                     availableSubProfiles.length === 0 ? 'No sub-profiles available' : 
                     'Select a sub-profile (optional)'}
                  </option>
                  {availableSubProfiles.map((subProfile) => (
                    <option key={subProfile.id} value={subProfile.id}>
                      {subProfile.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template *
                </label>
                <select 
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  disabled={templates.length === 0}
                >
                  <option value="">
                    {templates.length === 0 ? 'No templates available' : 'Select a template'}
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Priority
                </label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'low')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Custom Parameters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Parameters (JSON)
                </label>
                <textarea
                  value={customParameters}
                  onChange={(e) => setCustomParameters(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional JSON object for custom processing parameters
                </p>
              </div>

              {/* Process Button */}
              <button
                onClick={handleProcessVideo}
                disabled={isProcessing || !selectedVideoId || !selectedTemplateId || videos.length === 0 || templates.length === 0}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v4a3 3 0 003 3z" />
                    </svg>
                    Process Video
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Queue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 text-teal-500 mr-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Processing Queue</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">Videos currently being processed</p>

            {processingQueue.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos currently processing</h3>
                <p className="text-gray-500 text-sm">Videos being processed will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {processingQueue.map((video) => (
                  <div key={video.uuid} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="animate-spin w-5 h-5 mr-3 text-teal-500">
                          <svg fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{video.video_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          video.priority === 'high' ? 'bg-red-100 text-red-800' :
                          video.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {video.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      <div>Status: {video.status}</div>
                      <div>Estimated completion: {video.estimated_completion}</div>
                      <div>UUID: {video.uuid}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewAnalytics(video.uuid)}
                        className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-md hover:bg-teal-100 transition-colors"
                      >
                        View Analytics
                      </button>
                      <button
                        onClick={() => removeFromQueue(video.uuid)}
                        className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Remove from Queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessVideoPage;
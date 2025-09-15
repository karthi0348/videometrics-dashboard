'use client';

import React, { useState } from 'react';
import { X, Calendar, Camera, Bell, Save, AlertCircle, Menu, ChevronDown } from 'lucide-react';
import { Profile } from '@/app/types/profiles';
import { CameraLocation, MonitoringSchedule, AlertSettings } from '@/app/types/subprofiles';
import { subProfileService } from '@/app/services/subprofile-service';
import CameraLocations from './CameraLocations';
import MonitoringScheduleComponent from '../Subprofile/MonitoringScheduleComponent';
import AlertSettingsComponent from '../Subprofile/AlertSettingsComponent';

// Define specific types for the data structures
interface CameraLocationData {
  [key: string]: Omit<CameraLocation, 'id'>;
}

interface MonitoringScheduleData {
  [key: string]: Omit<MonitoringSchedule, 'id'>;
}

interface AlertSettingsData {
  [key: string]: Omit<AlertSettings, 'id'>;
}

// Updated interface to match backend API
interface CreateSubProfileAPIRequest {
  sub_profile_name: string;
  description: string;
  tags: string[];
  area_type: string;
  camera_locations: CameraLocationData;
  monitoring_schedule: MonitoringScheduleData;
  alert_settings: AlertSettingsData;
}

// Define a generic type for created sub-profile response
interface CreatedSubProfile {
  id: string;
  sub_profile_name: string;
  description: string;
  tags: string[];
  area_type: string;
  camera_locations: CameraLocationData;
  monitoring_schedule: MonitoringScheduleData;
  alert_settings: AlertSettingsData;
  created_at?: string;
  updated_at?: string;
}

interface CreateSubProfileProps {
  profile: Profile;
  onCreateSubProfile?: (subProfile: CreateSubProfileAPIRequest) => Promise<void>;
  onCancel: () => void;
  onSuccess?: (subProfile: CreatedSubProfile) => void;
  loading?: boolean;
}

const CreateSubProfile: React.FC<CreateSubProfileProps> = ({
  profile,
  onCreateSubProfile,
  onCancel,
  onSuccess,
  loading: externalLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    areaType: ''
  });
  
  const [cameraLocations, setCameraLocations] = useState<Omit<CameraLocation, 'id'>[]>([]);
  const [monitoringSchedules, setMonitoringSchedules] = useState<Omit<MonitoringSchedule, 'id'>[]>([]);
  const [alertSettings, setAlertSettings] = useState<Omit<AlertSettings, 'id'>[]>([]);
  
  const [activeTab, setActiveTab] = useState<'basic' | 'cameras' | 'monitoring' | 'alerts'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const loading = externalLoading || isLoading;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Sub-profile name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Sub-profile name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.areaType.trim()) {
      newErrors.areaType = 'Area type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert array to object with proper typing
  const convertCameraLocationsToObject = (arr: Omit<CameraLocation, 'id'>[]): CameraLocationData => {
    return arr.reduce((acc, item, index) => {
      acc[`camera_${index}`] = item;
      return acc;
    }, {} as CameraLocationData);
  };

  const convertMonitoringSchedulesToObject = (arr: Omit<MonitoringSchedule, 'id'>[]): MonitoringScheduleData => {
    return arr.reduce((acc, item, index) => {
      acc[`schedule_${index}`] = item;
      return acc;
    }, {} as MonitoringScheduleData);
  };

  const convertAlertSettingsToObject = (arr: Omit<AlertSettings, 'id'>[]): AlertSettingsData => {
    return arr.reduce((acc, item, index) => {
      acc[`alert_${index}`] = item;
      return acc;
    }, {} as AlertSettingsData);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.name || errors.description || errors.areaType) {
        setActiveTab('basic');
        setShowMobileNav(false);
      }
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const subProfileData: CreateSubProfileAPIRequest = {
        sub_profile_name: formData.name.trim(),
        description: formData.description.trim(),
        tags: tagsArray,
        area_type: formData.areaType.trim(),
        camera_locations: convertCameraLocationsToObject(cameraLocations),
        monitoring_schedule: convertMonitoringSchedulesToObject(monitoringSchedules),
        alert_settings: convertAlertSettingsToObject(alertSettings)
      };

      // Use the provided callback if available, otherwise use the service directly
      if (onCreateSubProfile) {
        await onCreateSubProfile(subProfileData);
      } else {
        // Direct API call using the service
        const createdSubProfile = await subProfileService.createSubProfile(profile.id, subProfileData);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(createdSubProfile as CreatedSubProfile);
        }
      }

      // Close modal on success (if no custom success handler)
      if (!onSuccess) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to create sub-profile:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId: 'basic' | 'cameras' | 'monitoring' | 'alerts') => {
    setActiveTab(tabId);
    setShowMobileNav(false);
  };

  // Define tab interface for better type safety
  interface Tab {
    id: 'basic' | 'cameras' | 'monitoring' | 'alerts';
    label: string;
    icon: React.ComponentType<{ className?: string }> | null;
  }

  const tabs: Tab[] = [
    { id: 'basic', label: 'Basic Info', icon: null },
    { id: 'cameras', label: 'Camera Locations', icon: Camera },
    { id: 'monitoring', label: 'Monitoring Schedule', icon: Calendar },
    { id: 'alerts', label: 'Alert Settings', icon: Bell }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Modern Container with improved shadows and rounded corners */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full h-full sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] lg:w-full lg:max-w-5xl lg:max-h-[90vh] xl:max-w-6xl flex flex-col overflow-hidden border border-gray-200/50">
        
        {/* Modern Header with glassmorphism effect */}
        <div className="relative bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b border-gray-200/70 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="min-w-0 flex-1">
              <h2 
                style={{ color: 'var(--purple-secondary)' }} 
                className="text-xl sm:text-2xl font-bold truncate bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"
              >
                Create New Sub-profile
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate font-medium">
                Create a new sub-profile for <span className="text-purple-600">{profile.name}</span>
              </p>
            </div>
            <button
              onClick={onCancel}
              className="group p-2 hover:bg-red-50 rounded-xl transition-all duration-200 flex-shrink-0 ml-4 hover:shadow-sm"
              disabled={loading}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
          {/* Subtle gradient line */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
        </div>

        {/* Modern API Error Display */}
        {apiError && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/70 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <p className="text-xs sm:text-sm text-red-700 font-medium break-words">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Navigation Toggle */}
        <div className="sm:hidden border-b border-gray-200/70">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/70 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Menu className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${showMobileNav ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Enhanced Mobile Navigation Dropdown */}
        {showMobileNav && (
          <div className="sm:hidden border-b border-gray-200/70 bg-gradient-to-b from-gray-50 to-white">
            <div className="py-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const hasErrors = tab.id === 'basic' && (errors.name || errors.description || errors.areaType);
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 mx-2 rounded-lg ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 shadow-sm border-l-4 border-purple-500'
                        : hasErrors
                        ? 'text-red-500 hover:bg-red-50/70'
                        : 'text-gray-700 hover:bg-white/70 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        activeTab === tab.id ? 'bg-purple-200' : 'bg-gray-100'
                      }`}>
                        {Icon && <Icon className="w-4 h-4" />}
                        {hasErrors && <AlertCircle className="w-4 h-4" />}
                      </div>
                      <span className="font-medium text-sm">{tab.label}</span>
                    </div>
                    {index < tabs.length - 1 && activeTab === tab.id && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full ml-auto"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Desktop Tabs */}
        <div className="hidden sm:block border-b border-gray-200/70 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50">
          <nav className="flex px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const hasErrors = tab.id === 'basic' && (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative py-4 px-4 lg:px-8 font-semibold text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 group ${
                    hasErrors
                      ? 'text-red-500 hover:text-red-700'
                      : activeTab === tab.id
                      ? 'text-purple-700'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id ? 'bg-purple-100 shadow-sm' : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      {Icon && <Icon className="w-4 h-4" />}
                      {hasErrors && <AlertCircle className="w-4 h-4" />}
                    </div>
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.id === 'basic' ? 'Basic' : 
                       tab.id === 'cameras' ? 'Cameras' : 
                       tab.id === 'monitoring' ? 'Schedule' : 'Alerts'}
                    </span>
                  </div>
                  
                  {/* Modern active indicator */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 rounded-full transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'w-12 bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm' 
                      : 'w-0 bg-transparent'
                  }`}></div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Enhanced Content - Scrollable area with custom scrollbar */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-white to-gray-50/30">
          <div className="p-4 sm:p-8">
            {activeTab === 'basic' && (
              <div className="space-y-6 sm:space-y-8 max-w-2xl">
                {/* Enhanced Sub-profile Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    Sub-profile Name
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base font-medium transition-all duration-200 bg-white shadow-sm ${
                        errors.name ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter sub-profile name"
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words font-medium">{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Enhanced Description */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    Description
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-sm sm:text-base transition-all duration-200 bg-white shadow-sm ${
                        errors.description ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter description"
                      disabled={loading}
                    />
                    {errors.description && (
                      <div className="absolute top-3 right-4">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words font-medium">{errors.description}</span>
                      </p>
                    )}
                    <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                      formData.description.length > 450 
                        ? 'bg-red-100 text-red-700' 
                        : formData.description.length > 350 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formData.description.length}/500 characters
                    </div>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
                    placeholder="tag1, tag2, tag3"
                    disabled={loading}
                  />
                  <p className="mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    💡 Separate multiple tags with commas for better organization
                  </p>
                </div>

                {/* Enhanced Area Type */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    Area Type
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.areaType}
                      onChange={(e) => handleInputChange('areaType', e.target.value)}
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base font-medium transition-all duration-200 bg-white shadow-sm appearance-none ${
                        errors.areaType ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select area type</option>
                      <option value="dining">Dining</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="entrance">Entrance</option>
                      <option value="parking">Parking</option>
                      <option value="office">Office</option>
                      <option value="retail">Retail</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="lobby">Lobby</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute inset-y-0 right-4 flex items-center pointer-events-none w-5 h-5 text-gray-400" />
                    {errors.areaType && (
                      <div className="absolute inset-y-0 right-12 flex items-center pr-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.areaType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words font-medium">{errors.areaType}</span>
                    </p>
                  )}
                </div>

                {/* Enhanced Profile Information */}
                <div className="bg-gradient-to-r from-purple-50 via-purple-25 to-blue-50 p-4 sm:p-6 rounded-2xl border border-purple-200/50 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    🎯 Creating for Profile
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-white to-purple-50 rounded-xl text-sm font-bold text-purple-700 inline-block w-fit shadow-sm border border-purple-200/50">
                      {profile.name}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">
                      This sub-profile will be added to the selected profile
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cameras' && (
              <div className="w-full">
                <CameraLocations 
                  cameraLocations={cameraLocations}
                  setCameraLocations={setCameraLocations}
                />
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="w-full">
                <MonitoringScheduleComponent
                  monitoringSchedules={monitoringSchedules}
                  setMonitoringSchedules={setMonitoringSchedules}
                />
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="w-full">
                <AlertSettingsComponent
                  alertSettings={alertSettings}
                  setAlertSettings={setAlertSettings}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modern Footer */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200/70 backdrop-blur-sm">
          <div className="p-4 sm:p-6">
            {/* Enhanced required fields note */}
            <div className="hidden sm:flex items-center justify-center text-xs sm:text-sm text-gray-600 mb-4 bg-gray-50 py-2 px-4 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
              All required fields marked with <span className="text-red-500 font-bold mx-1">*</span> must be filled
            </div>
            
            {/* Enhanced Modern Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
              <button
                onClick={onCancel}
                disabled={loading}
                className="order-2 sm:order-1 px-6 sm:px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-500/20 focus:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="order-1 sm:order-2 inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 text-sm font-bold text-white border-2 rounded-xl hover:opacity-95 focus:ring-4 focus:ring-purple-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'var(--purple-secondary)',
                  borderColor: 'var(--purple-secondary)',
                  background: 'linear-gradient(135deg, var(--purple-secondary) 0%, #8B5CF6 100%)'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden xs:inline">Creating...</span>
                    <span className="xs:hidden">Create</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span className="hidden xs:inline">Create Sub-Profile</span>
                    <span className="xs:hidden">Create</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSubProfile;
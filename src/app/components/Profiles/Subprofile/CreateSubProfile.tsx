'use client';

import React, { useState } from 'react';
import { X, Calendar, Camera, Bell, Save, AlertCircle, Menu } from 'lucide-react';
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
    // Clear API error when user makes changes
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
      // If basic info is invalid, switch to basic tab
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

      // Transform data to match backend API format
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Container with responsive padding and sizing */}
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] lg:w-full lg:max-w-5xl lg:max-h-[90vh] xl:max-w-6xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 
              style={{ color: 'var(--purple-secondary)' }} 
              className="text-xl sm:text-2xl font-bold truncate"
            >
              Create New Sub-profile
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Create a new sub-profile for {profile.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0 ml-4"
            disabled={loading}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mx-4 sm:mx-6 mt-2 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-700 break-words">{apiError}</p>
            </div>
          </div>
        )}

        {/* Mobile Navigation Toggle */}
        <div className="sm:hidden border-b border-gray-200">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              <span className="font-medium text-sm">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>
            <div className={`transform transition-transform ${showMobileNav ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {showMobileNav && (
          <div className="sm:hidden border-b border-gray-200 bg-gray-50">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const hasErrors = tab.id === 'basic' && (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-500'
                      : hasErrors
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {hasErrors && <AlertCircle className="w-4 h-4" />}
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop Tabs */}
        <div className="hidden sm:block border-b border-gray-200">
          <nav className="flex px-4 sm:px-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const hasErrors = tab.id === 'basic' && (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-3 px-4 lg:px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    hasErrors
                      ? 'border-transparent text-red-500 hover:text-red-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    borderColor: activeTab === tab.id ? 'var(--purple-secondary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--purple-secondary)' : undefined
                  }}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {hasErrors && <AlertCircle className="w-4 h-4" />}
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.id === 'basic' ? 'Basic' : 
                       tab.id === 'cameras' ? 'Cameras' : 
                       tab.id === 'monitoring' ? 'Schedule' : 'Alerts'}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 sm:p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4 sm:space-y-6 max-w-2xl">
                {/* Sub-profile Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-profile Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sub-profile name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm sm:text-base ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter description"
                    disabled={loading}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1">
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">{errors.description}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 sm:ml-auto">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                    placeholder="tag1, tag2, tag3"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>

                {/* Area Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area Type *
                  </label>
                  <select
                    value={formData.areaType}
                    onChange={(e) => handleInputChange('areaType', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base ${
                      errors.areaType ? 'border-red-500' : 'border-gray-300'
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
                  {errors.areaType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{errors.areaType}</span>
                    </p>
                  )}
                </div>

                {/* Profile Information */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Creating for Profile</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-700 inline-block w-fit">
                      {profile.name}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
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

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <div className="p-4 sm:p-6 bg-gray-50">
            {/* Required fields note - hidden on mobile to save space */}
            <div className="hidden sm:block text-xs sm:text-sm text-gray-500 mb-3">
              All required fields marked with * must be filled
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 text-sm font-medium text-white border rounded-lg hover:opacity-90 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                style={{ 
                  backgroundColor: 'var(--purple-secondary)',
                  borderColor: 'var(--purple-secondary)'
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden xs:inline">Creating...</span>
                    <span className="xs:hidden">Create</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
'use client';

import React, { useState } from 'react';
import { X, Calendar, Camera, Bell, Save, AlertCircle } from 'lucide-react';
import { Profile } from '@/app/types/profiles';
import { CameraLocation, MonitoringSchedule, AlertSettings } from '@/app/types/subprofiles';
import { subProfileService } from '@/app/services/subprofile-service';
import CameraLocations from '../Subprofile/CameraLocations';
import MonitoringScheduleComponent from '../Subprofile/MonitoringScheduleComponent';
import AlertSettingsComponent from '../Subprofile/AlertSettingsComponent';

// Updated interface to match backend API
interface CreateSubProfileAPIRequest {
  sub_profile_name: string;
  description: string;
  tags: string[];
  area_type: string;
  camera_locations: Record<string, any>;
  monitoring_schedule: Record<string, any>;
  alert_settings: Record<string, any>;
}

interface CreateSubProfileProps {
  profile: Profile;
  onCreateSubProfile?: (subProfile: CreateSubProfileAPIRequest) => Promise<void>;
  onCancel: () => void;
  onSuccess?: (subProfile: any) => void; // Add callback for successful creation
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
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.areaType.trim()) {
      newErrors.areaType = 'Area type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert array to object
  const convertArrayToObject = (arr: any[], prefix: string) => {
    return arr.reduce((acc, item, index) => {
      acc[`${prefix}_${index}`] = item;
      return acc;
    }, {} as Record<string, any>);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // If basic info is invalid, switch to basic tab
      if (errors.name || errors.description || errors.areaType) {
        setActiveTab('basic');
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
        sub_profile_name: formData.name,
        description: formData.description,
        tags: tagsArray,
        area_type: formData.areaType,
        camera_locations: convertArrayToObject(cameraLocations, 'camera'),
        monitoring_schedule: convertArrayToObject(monitoringSchedules, 'schedule'),
        alert_settings: convertArrayToObject(alertSettings, 'alert')
      };

      // Use the provided callback if available, otherwise use the service directly
      if (onCreateSubProfile) {
        await onCreateSubProfile(subProfileData);
      } else {
        // Direct API call using the service
        const createdSubProfile = await subProfileService.createSubProfile(profile.id, subProfileData);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(createdSubProfile);
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

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: null },
    { id: 'cameras', label: 'Camera Locations', icon: Camera },
    { id: 'monitoring', label: 'Monitoring Schedule', icon: Calendar },
    { id: 'alerts', label: 'Alert Settings', icon: Bell }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Sub-profile</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new sub-profile for {profile.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const hasErrors = tab.id === 'basic' && (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : hasErrors
                      ? 'border-transparent text-red-500 hover:text-red-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {hasErrors && <AlertCircle className="w-4 h-4" />}
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content - Proper flex layout with scrolling */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-profile Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter sub-profile name"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter description"
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tag1, tag2, tag3"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area Type *
                </label>
                <input
                  type="text"
                  value={formData.areaType}
                  onChange={(e) => handleInputChange('areaType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.areaType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., dining, kitchen, lobby, warehouse"
                  disabled={loading}
                />
                {errors.areaType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.areaType}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cameras' && (
            <CameraLocations 
              cameraLocations={cameraLocations}
              setCameraLocations={setCameraLocations}
            />
          )}

          {activeTab === 'monitoring' && (
            <MonitoringScheduleComponent
              monitoringSchedules={monitoringSchedules}
              setMonitoringSchedules={setMonitoringSchedules}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertSettingsComponent
              alertSettings={alertSettings}
              setAlertSettings={setAlertSettings}
            />
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between gap-3 p-6 bg-gray-50">
            <div className="text-sm text-gray-500">
              All required fields marked with * must be filled
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Sub-Profile
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
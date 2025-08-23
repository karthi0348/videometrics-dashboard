'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, Camera, Bell, AlertCircle } from 'lucide-react';
import { SubProfile, UpdateSubProfileAPIRequest, CameraLocation, MonitoringSchedule, AlertSettings } from '@/app/types/subprofiles';
import CameraLocations from '../../Profiles/Subprofile/CameraLocations';
import MonitoringScheduleComponent from '../../Profiles/Subprofile/MonitoringScheduleComponent';
import AlertSettingsComponent from '../../Profiles/Subprofile/AlertSettingsComponent';

interface EditSubProfileModalProps {
  subProfile: SubProfile;
  onSave: (subProfileId: number, data: UpdateSubProfileAPIRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EditSubProfileModal: React.FC<EditSubProfileModalProps> = ({
  subProfile,
  onSave,
  onCancel,
  loading: externalLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: subProfile.name,
    description: subProfile.description || '',
    areaType: subProfile.areaType,
    tags: subProfile.tags?.join(', ') || '',
  });

  const [cameraLocations, setCameraLocations] = useState<Omit<CameraLocation, 'id'>[]>([]);
  const [monitoringSchedules, setMonitoringSchedules] = useState<Omit<MonitoringSchedule, 'id'>[]>([]);
  const [alertSettings, setAlertSettings] = useState<Omit<AlertSettings, 'id'>[]>([]);

  const [activeTab, setActiveTab] = useState<'basic' | 'cameras' | 'monitoring' | 'alerts'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loading = externalLoading || isLoading;

  // Initialize data from existing subProfile
  useEffect(() => {
    // Initialize camera locations if they exist
    if (subProfile.cameraLocations) {
      const locations = Array.isArray(subProfile.cameraLocations) 
        ? subProfile.cameraLocations 
        : Object.values(subProfile.cameraLocations || {}); 
      setCameraLocations(locations.map(({ id, ...rest }) => rest));
    }

    // Initialize monitoring schedules if they exist
    if (subProfile.monitoringSchedules) {
      const schedules = Array.isArray(subProfile.monitoringSchedules) 
        ? subProfile.monitoringSchedules 
        : Object.values(subProfile.monitoringSchedules || {}) as MonitoringSchedule[];
      setMonitoringSchedules(schedules.map(({ id, ...rest }) => rest) as Omit<MonitoringSchedule, 'id'>[]);
    }

    // Initialize alert settings if they exist
    if (subProfile.alertSettings) {
      const alerts = Array.isArray(subProfile.alertSettings) 
        ? subProfile.alertSettings 
        : Object.values(subProfile.alertSettings || {});
      setAlertSettings(alerts.map(({ id, ...rest }) => rest));
    }
  }, [subProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Sub-profile name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Sub-profile name must be at least 2 characters';
    }

    if (!formData.areaType.trim()) {
      newErrors.areaType = 'Area type is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      const updateData: UpdateSubProfileAPIRequest = {
        sub_profile_name: formData.name.trim(),
        description: formData.description.trim(),
        area_type: formData.areaType.trim(),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        camera_locations: convertArrayToObject(cameraLocations, 'camera'),
        monitoring_schedule: convertArrayToObject(monitoringSchedules, 'schedule'),
        alert_settings: convertArrayToObject(alertSettings, 'alert')
      };

      await onSave(subProfile.id, updateData);
    } catch (error) {
      console.error('Error updating sub-profile:', error);
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: null },
    { id: 'cameras', label: 'Camera Locations', icon: Camera },
    { id: 'monitoring', label: 'Monitoring Schedule', icon: Calendar },
    { id: 'alerts', label: 'Alert Settings', icon: Bell }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Sub-Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Update settings for {subProfile.name}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 bg-white rounded-lg transition-colors text-red-500"
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
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Profile Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter sub-profile name"
                  disabled={loading}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter description (optional)"
                  disabled={loading}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Area Type */}
              <div>
                <label htmlFor="areaType" className="block text-sm font-medium text-gray-700 mb-2">
                  Area Type *
                </label>
                <select
                  id="areaType"
                  value={formData.areaType}
                  onChange={(e) => handleInputChange('areaType', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.areaType ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  required
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
                  <option value="other">Other</option>
                </select>
                {errors.areaType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.areaType}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tags separated by commas (e.g., security, monitoring, main-area)"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Status Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subProfile.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Use the toggle in the main list to change status
                  </span>
                </div>
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
                type="button"
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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

export default EditSubProfileModal;
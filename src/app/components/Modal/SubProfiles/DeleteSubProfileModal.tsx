'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2, Camera, Calendar, Bell } from 'lucide-react';
import { SubProfile } from '@/app/types/subprofiles';

interface DeleteSubProfileModalProps {
  subProfile: SubProfile;
  onConfirm: (subProfileId: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteSubProfileModal: React.FC<DeleteSubProfileModalProps> = ({
  subProfile,
  onConfirm,
  onCancel,
  loading: externalLoading = false,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loading = externalLoading || isLoading;

  // Helper function to extract data from either array or object format
  const extractArrayData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return Object.values(data);
    return [];
  };

  const cameraLocations = extractArrayData(subProfile.cameraLocations);
  const monitoringSchedules = extractArrayData(subProfile.monitoringSchedules);
  const alertSettings = extractArrayData(subProfile.alertSettings);

  const isConfirmationValid = confirmationText === subProfile.name;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;
    
    setIsLoading(true);
    try {
      await onConfirm(subProfile.id);
    } catch (error) {
      console.error('Error deleting sub-profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delete Sub-Profile</h2>
              <p className="text-sm text-red-600">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-2">
                Are you sure you want to delete this sub-profile?
              </p>
              <p className="text-sm text-gray-600">
                This will permanently remove all associated data and configurations.
              </p>
            </div>
            
            {/* Sub-profile Overview */}
            <div className="bg-gray-50 rounded-xl p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sub-Profile Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <div className="mt-1 text-sm text-gray-900 font-semibold bg-white px-3 py-2 rounded-lg border">
                    {subProfile.name}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Area Type:</span>
                  <div className="mt-1 text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border capitalize">
                    {subProfile.areaType}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subProfile.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subProfile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <div className="mt-1 text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border">
                    {subProfile.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              {subProfile.description && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                  <div className="mt-1 text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border">
                    {subProfile.description}
                  </div>
                </div>
              )}

              {/* Tags */}
              {subProfile.tags && subProfile.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subProfile.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Data Impact Summary */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    This will permanently delete:
                  </h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Camera Locations</span>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    {cameraLocations.length}
                  </div>
                  <div className="text-xs text-red-600">
                    {cameraLocations.length === 1 ? 'location' : 'locations'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Monitoring Schedules</span>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    {monitoringSchedules.length}
                  </div>
                  <div className="text-xs text-red-600">
                    {monitoringSchedules.length === 1 ? 'schedule' : 'schedules'}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Alert Settings</span>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    {alertSettings.length}
                  </div>
                  <div className="text-xs text-red-600">
                    {alertSettings.length === 1 ? 'setting' : 'settings'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-red-200">
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Sub-profile configuration and metadata</li>
                  <li>• All associated data and history</li>
                  <li>• Any linked monitoring data</li>
                  <li>• Historical alerts and notifications</li>
                </ul>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Confirmation Required
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  To confirm deletion, please type the sub-profile name exactly as shown:
                </p>
                <div className="bg-yellow-100 px-3 py-2 rounded-lg border border-yellow-300 mb-3">
                  <code className="text-sm font-mono text-yellow-900">{subProfile.name}</code>
                </div>
              </div>
              
              <input
                type="text"
                value={confirmationText}
                onChange={handleInputChange}
                placeholder={`Type "${subProfile.name}" here`}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  confirmationText.length > 0
                    ? isConfirmationValid
                      ? 'border-green-300 focus:ring-green-500 bg-green-50'
                      : 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={loading}
              />
              
              {confirmationText.length > 0 && (
                <div className="mt-2 text-sm">
                  {isConfirmationValid ? (
                    <span className="text-green-700 flex items-center gap-1">
                      ✓ Confirmation text matches
                    </span>
                  ) : (
                    <span className="text-red-700 flex items-center gap-1">
                      ✗ Confirmation text does not match
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isConfirmationValid}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Sub-Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubProfileModal;
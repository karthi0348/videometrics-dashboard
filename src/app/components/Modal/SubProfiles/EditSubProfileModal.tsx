"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Calendar,
  Camera,
  Bell,
  AlertCircle,
  Menu,
} from "lucide-react";
import {
  SubProfile,
  UpdateSubProfileAPIRequest,
  CameraLocation,
  MonitoringSchedule,
  AlertSettings,
} from "@/app/types/subprofiles";
import CameraLocations from "../../Profiles/Subprofile/CameraLocations";
import MonitoringScheduleComponent from "../../Profiles/Subprofile/MonitoringScheduleComponent";
import AlertSettingsComponent from "../../Profiles/Subprofile/AlertSettingsComponent";

interface EditSubProfileModalProps {
  subProfile: SubProfile;
  onSave: (
    subProfileId: number,
    data: UpdateSubProfileAPIRequest
  ) => Promise<void>;
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
    description: subProfile.description || "",
    areaType: subProfile.areaType,
    tags: subProfile.tags?.join(", ") || "",
  });

  const [cameraLocations, setCameraLocations] = useState<
    Omit<CameraLocation, "id">[]
  >([]);
  const [monitoringSchedules, setMonitoringSchedules] = useState<
    Omit<MonitoringSchedule, "id">[]
  >([]);
  const [alertSettings, setAlertSettings] = useState<
    Omit<AlertSettings, "id">[]
  >([]);

  const [activeTab, setActiveTab] = useState<
    "basic" | "cameras" | "monitoring" | "alerts"
  >("basic");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const loading = externalLoading || isLoading;

  // Initialize data from existing subProfile
  useEffect(() => {
    // Initialize camera locations if they exist
    if (subProfile.cameraLocations) {
      const locations: CameraLocation[] = Array.isArray(
        subProfile.cameraLocations
      )
        ? subProfile.cameraLocations
        : (Object.values(subProfile.cameraLocations || {}) as CameraLocation[]);

      setCameraLocations(
        locations.map(({ id, ...rest }): Omit<CameraLocation, "id"> => rest)
      );
    }

    // Initialize monitoring schedules if they exist
    if (subProfile.monitoringSchedules) {
      const schedules: MonitoringSchedule[] = Array.isArray(
        subProfile.monitoringSchedules
      )
        ? subProfile.monitoringSchedules
        : (Object.values(
            subProfile.monitoringSchedules || {}
          ) as MonitoringSchedule[]);

      setMonitoringSchedules(
        schedules.map(({ id, ...rest }): Omit<MonitoringSchedule, "id"> => rest)
      );
    }

    // Initialize alert settings if they exist
    if (subProfile.alertSettings) {
      const alerts: AlertSettings[] = Array.isArray(subProfile.alertSettings)
        ? subProfile.alertSettings
        : (Object.values(subProfile.alertSettings || {}) as AlertSettings[]);

      setAlertSettings(
        alerts.map(({ id, ...rest }): Omit<AlertSettings, "id"> => rest)
      );
    }
  }, [subProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Sub-profile name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Sub-profile name must be at least 2 characters";
    }

    if (!formData.areaType.trim()) {
      newErrors.areaType = "Area type is required";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert array to object
  const convertArrayToObject = <T extends Record<string, unknown>>(
    arr: T[],
    prefix: string
  ): Record<string, T> => {
    return arr.reduce((acc, item, index) => {
      acc[`${prefix}_${index}`] = item;
      return acc;
    }, {} as Record<string, T>);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // If basic info is invalid, switch to basic tab
      if (errors.name || errors.description || errors.areaType) {
        setActiveTab("basic");
        setShowMobileNav(false);
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
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        camera_locations: convertArrayToObject(cameraLocations, "camera"),
        monitoring_schedule: convertArrayToObject(
          monitoringSchedules,
          "schedule"
        ),
        alert_settings: convertArrayToObject(alertSettings, "alert"),
      };

      await onSave(subProfile.id, updateData);
    } catch (error) {
      console.error("Error updating sub-profile:", error);
      setApiError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null);
    }
  };

  const handleTabChange = (
    tabId: "basic" | "cameras" | "monitoring" | "alerts"
  ) => {
    setActiveTab(tabId);
    setShowMobileNav(false);
  };

  const tabs = [
    { id: "basic" as const, label: "Basic Info", icon: null },
    { id: "cameras" as const, label: "Camera Locations", icon: Camera },
    { id: "monitoring" as const, label: "Monitoring Schedule", icon: Calendar },
    { id: "alerts" as const, label: "Alert Settings", icon: Bell },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Container with responsive padding and sizing */}
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] lg:w-full lg:max-w-5xl lg:max-h-[90vh] xl:max-w-6xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Edit Sub-Profile
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
              Update settings for {subProfile.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 bg-white rounded-lg transition-colors text-red-500 hover:bg-red-50 flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mx-4 sm:mx-6 mt-2 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-red-700 break-words">
                {apiError}
              </p>
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
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </span>
            </div>
            <div
              className={`transform transition-transform ${
                showMobileNav ? "rotate-180" : ""
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {showMobileNav && (
          <div className="sm:hidden border-b border-gray-200 bg-gray-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasErrors =
                tab.id === "basic" &&
                (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                      : hasErrors
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-700 hover:bg-white"
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const hasErrors =
                tab.id === "basic" &&
                (errors.name || errors.description || errors.areaType);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-3 px-4 lg:px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : hasErrors
                      ? "border-transparent text-red-500 hover:text-red-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {hasErrors && <AlertCircle className="w-4 h-4" />}
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.id === "basic"
                        ? "Basic"
                        : tab.id === "cameras"
                        ? "Cameras"
                        : tab.id === "monitoring"
                        ? "Schedule"
                        : "Alerts"}
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
            {activeTab === "basic" && (
              <div className="space-y-4 sm:space-y-6 max-w-2xl">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sub-Profile Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter sub-profile name"
                    disabled={loading}
                    required
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
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter description (optional)"
                    disabled={loading}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1">
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="break-words">
                          {errors.description}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 sm:ml-auto">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Area Type */}
                <div>
                  <label
                    htmlFor="areaType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Area Type *
                  </label>
                  <select
                    id="areaType"
                    value={formData.areaType}
                    onChange={(e) =>
                      handleInputChange("areaType", e.target.value)
                    }
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                      errors.areaType ? "border-red-300" : "border-gray-300"
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
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{errors.areaType}</span>
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Enter tags separated by commas"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>

                {/* Status Information */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Current Status
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium inline-block w-fit ${
                        subProfile.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {subProfile.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Use the toggle in the main list to change status
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cameras" && (
              <div className="w-full">
                {CameraLocations ? (
                  <CameraLocations
                    cameraLocations={cameraLocations}
                    setCameraLocations={setCameraLocations}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Camera Locations
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">
                          Camera Locations component is not available. Please
                          ensure the component exists at the correct import
                          path.
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Current camera locations:</strong>{" "}
                        {cameraLocations.length} configured
                      </p>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(cameraLocations, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "monitoring" && (
              <div className="w-full">
                {MonitoringScheduleComponent ? (
                  <MonitoringScheduleComponent
                    monitoringSchedule={monitoringSchedules}
                    setMonitoringSchedules={setMonitoringSchedules}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Monitoring Schedule
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">
                          Monitoring Schedule component is not available. Please
                          ensure the component exists at the correct import
                          path.
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Current monitoring schedules:</strong>{" "}
                        {monitoringSchedules.length} configured
                      </p>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(monitoringSchedules, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="w-full">
                {AlertSettingsComponent ? (
                  <AlertSettingsComponent
                    alertSettings={alertSettings}
                    setAlertSettings={setAlertSettings}
                  />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Alert Settings
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">
                          Alert Settings component is not available. Please
                          ensure the component exists at the correct import
                          path.
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Current alert settings:</strong>{" "}
                        {alertSettings.length} configured
                      </p>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(alertSettings, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
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
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden xs:inline">Saving...</span>
                    <span className="xs:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="hidden xs:inline">Save Changes</span>
                    <span className="xs:hidden">Save</span>
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

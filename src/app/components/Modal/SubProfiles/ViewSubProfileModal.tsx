"use client";

import React from "react";
import {
  X,
  MapPin,
  Calendar,
  Bell,
  Tag,
  Camera,
  Clock,
  Info,
} from "lucide-react";
import { SubProfile } from "@/app/types/subprofiles";

interface ViewSubProfileModalProps {
  subProfile: SubProfile;
  onClose: () => void;
}

const ViewSubProfileModal: React.FC<ViewSubProfileModalProps> = ({
  subProfile,
  onClose,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to extract data from either array or object format
  const extractArrayData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") return Object.values(data);
    return [];
  };

  const cameraLocations = extractArrayData(subProfile.cameraLocations);
  const monitoringSchedules = extractArrayData(
    subProfile.monitoringSchedule || subProfile.monitoringSchedules
  );
  const alertSettings = extractArrayData(subProfile.alertSettings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 z-10">
      <div className="bg-white rounded-lg shadow-lg   max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {subProfile.name}
              </h2>
              <p className="text-sm text-gray-600">Sub-Profile Details</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                subProfile.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {subProfile.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-lg transition-colors text-red-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area Type
                      </label>
                      <div className="bg-white px-3 py-2 rounded-lg border">
                        <span className="text-sm text-gray-900 capitalize font-medium">
                          {subProfile.areaType}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile ID
                      </label>
                      <div className="bg-white px-3 py-2 rounded-lg border">
                        <span className="text-sm text-gray-600 font-mono">
                          {subProfile.profileId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="bg-white px-3 py-2 rounded-lg border min-h-[60px]">
                      <p className="text-sm text-gray-900">
                        {subProfile.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UUID
                    </label>
                    <div className="bg-white px-3 py-2 rounded-lg border">
                      <span className="text-xs text-gray-500 font-mono break-all">
                        {subProfile.uuid}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Tags
                  <span className="text-sm font-normal text-gray-500">
                    ({subProfile.tags?.length || 0})
                  </span>
                </h3>
                {subProfile.tags && subProfile.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subProfile.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg px-4 py-6 border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 italic text-center">
                      No tags assigned
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Created
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(subProfile.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Last Updated
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(subProfile.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Configuration Details */}
            <div className="space-y-6">
              {/* Camera Locations */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Camera Locations
                  <span className="text-sm font-normal text-gray-500">
                    ({cameraLocations.length})
                  </span>
                </h3>
                {cameraLocations.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cameraLocations.map((camera, index) => (
                      <div
                        key={camera.id || index}
                        className="bg-white rounded-lg p-4 border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {camera.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  camera.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {camera.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Location:</span>{" "}
                              {camera.location}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Type:</span>{" "}
                              {camera.cameraType}
                            </p>
                            {camera.ipAddress && (
                              <p className="text-xs text-gray-500 font-mono">
                                {camera.ipAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg px-4 py-6 border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 italic text-center">
                      No camera locations configured
                    </p>
                  </div>
                )}
              </div>

              {/* Monitoring Schedule */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Monitoring Schedules
                  <span className="text-sm font-normal text-gray-500">
                    ({monitoringSchedules.length})
                  </span>
                </h3>
                {monitoringSchedules.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {monitoringSchedules.map((schedule, index) => (
                      <div
                        key={schedule.id || index}
                        className="bg-white rounded-lg p-4 border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {schedule.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  schedule.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Time:</span>{" "}
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Days:</span>{" "}
                              {schedule.days?.join(", ") || "No days specified"}
                            </p>
                            {schedule.timezone && (
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Timezone:</span>{" "}
                                {schedule.timezone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg px-4 py-6 border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 italic text-center">
                      No monitoring schedules configured
                    </p>
                  </div>
                )}
              </div>

              {/* Alert Settings */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Alert Settings
                  <span className="text-sm font-normal text-gray-500">
                    ({alertSettings.length})
                  </span>
                </h3>
                {alertSettings.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {alertSettings.map((alert, index) => (
                      <div
                        key={alert.id || index}
                        className="bg-white rounded-lg p-4 border"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {alert.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  alert.enabled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {alert.enabled ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Type:</span>{" "}
                              {alert.type}
                            </p>
                            {alert.threshold && (
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Threshold:</span>{" "}
                                {alert.threshold}
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Methods:</span>{" "}
                              {alert.notificationMethods?.join(", ") || "None"}
                            </p>
                            {alert.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {alert.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg px-4 py-6 border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 italic text-center">
                      No alert settings configured
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubProfileModal;

import ErrorHandler, { ErrorResponse } from "@/helpers/ErrorHandler";
import ProfileService from "@/helpers/service/profile/profile-api-service";
import SubProfileService from "@/helpers/service/subprofile/subprofile-api-service";
import TemplateApiService from "@/helpers/service/templates/template-api-service";
import { AxiosError } from "axios";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

// Define interfaces for better type safety
interface Template {
  id: string | number;
  name: string;
}

interface Profile {
  id: string | number;
  profile_name: string;
}

interface SubProfile {
  id: string | number;
  sub_profile_name: string;
  profile_id: number;
}

interface AssignSubProfilePayload {
  template_id: string | number;
  sub_profile_ids: number[];
  priority: number;
}

const AssignmentModal = ({
  isOpen,
  onClose,
  template,
}: {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
}) => {
  const profileApiService = new ProfileService();
  const subProfileApiService = new SubProfileService();
  const templateApiService = new TemplateApiService();

  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedSubProfile, setSelectedSubProfile] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);
  const [isLoadingSubProfiles, setIsLoadingSubProfiles] = useState(false);

  const handleAssign = async () => {
    try {
      if (!selectedSubProfile) {
        toast.error("Please select a sub-profile", { containerId: "TR" });
        return;
      }

      const payload: AssignSubProfilePayload = {
        template_id: Number(template.id),
        sub_profile_ids: [Number(selectedSubProfile)], // Convert to number array
        priority: selectedPriority, // Already a number
      };

      console.log("Assigning with payload:", payload);
      
      await templateApiService.assignSubProfile(template.id, payload);
      toast.success("Assigned Successfully", { containerId: "TR" });
      onClose();
      setSelectedProfile("");
      setSelectedSubProfile("");
      setSelectedPriority(1);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      return ErrorHandler(error);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedProfile("");
    setSelectedSubProfile("");
    setSelectedPriority(1);
  };

  const getAllProfiles = useCallback(async () => {
    try {
      const result = await profileApiService.getAllProfiles("");
      setProfiles(result as unknown as Profile[]);
    } catch (error) {
      setProfiles([]);
      const errorObj = error as AxiosError<ErrorResponse>;
      return ErrorHandler(errorObj);
    }
  }, []);

  const getSubProfiles = useCallback(async (profileId: string) => {
    if (!profileId) {
      setSubProfiles([]);
      return;
    }

    setIsLoadingSubProfiles(true);
    try {
      // Assuming your SubProfileService has a method to get sub-profiles by profile ID
      // Adjust method name based on your actual service
      const result = await subProfileApiService.getAllSubProfile(Number(profileId), "");
      setSubProfiles(result as unknown as SubProfile[]);
    } catch (error) {
      setSubProfiles([]);
      const errorObj = error as AxiosError<ErrorResponse>;
      return ErrorHandler(errorObj);
    } finally {
      setIsLoadingSubProfiles(false);
    }
  }, []);

  // Load profiles when modal opens
  useEffect(() => {
    if (isOpen) {
      getAllProfiles();
    }
  }, [isOpen, getAllProfiles]);

  // Load sub-profiles when profile changes
  useEffect(() => {
    if (selectedProfile) {
      getSubProfiles(selectedProfile);
      setSelectedSubProfile(""); // Reset sub-profile selection
    } else {
      setSubProfiles([]);
      setSelectedSubProfile("");
    }
  }, [selectedProfile, getSubProfiles]);

  if (!isOpen || !template) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Assign Template to Sub-Profile
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Select a profile and sub-profile to assign the template &quot;
            {template.name}&quot; to.
          </p>

          {/* Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile
            </label>
            <div className="relative">
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
              >
                <option value="">Select a profile</option>
                {profiles.map((profileItem: Profile) => (
                  <option key={profileItem.id} value={profileItem.id}>
                    {profileItem.profile_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Sub-Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-Profile
            </label>
            <div className="relative">
              <select
                value={selectedSubProfile}
                onChange={(e) => setSelectedSubProfile(e.target.value)}
                disabled={!selectedProfile || isLoadingSubProfiles}
                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingSubProfiles
                    ? "Loading sub-profiles..."
                    : selectedProfile
                    ? "Select a sub-profile"
                    : "Select a profile first"}
                </option>
                {subProfiles.map((subProfile: SubProfile) => (
                  <option key={subProfile.id} value={subProfile.id}>
                    {subProfile.sub_profile_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
              >
                <option value={1}>High (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>Low (3)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedSubProfile}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              selectedSubProfile
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Assign Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
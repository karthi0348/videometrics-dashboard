import ErrorHandler from "@/helpers/ErrorHandler";
import ProfileApiService from "@/helpers/service/profile/profile-api-service";
import TemplateApiService from "@/helpers/service/templates/template-api-service";
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

interface AssignmentPayload {
  template_id: string | number;
  sub_profile_ids: (string | number)[];
  priority: '1' | '2' | '3';
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

    const profileApiService: ProfileApiService = new ProfileApiService();
    const templateApiService: TemplateApiService = new TemplateApiService();

    const [selectedProfile, setSelectedProfile] = useState<string>('');
    const [selectedPriority, setSelectedPriority] = useState<'1' | '2' | '3'>('1');
    const [profile, setProfile] = useState<Profile[]>([]);

    const handleAssign = async () => {
        try {
            const payload: AssignmentPayload = {
                template_id: template.id,
                sub_profile_ids: [
                    selectedProfile
                ],
                priority: selectedPriority
            };
            await templateApiService.assignSubProfile(template.id, payload);
            toast.success('Assigned Successfully', { containerId: 'TR' });
            onClose();
            setSelectedProfile('');
            setSelectedPriority('1');
        } catch (err) {
            const error = err as Error;
            return ErrorHandler(error);
        }
    };

    const handleCancel = () => {
        onClose();
        setSelectedProfile('');
        setSelectedPriority('1');
    };

    const getAllProfile = useCallback(async () => {
        try {
            const result = await profileApiService.getAllProfile('');
            setProfile(result as Profile[]);
        } catch (error) {
            setProfile([]);
            const errorObj = error as Error;
            return ErrorHandler(errorObj);
        }
    }, [profileApiService]);

    useEffect(() => {
        if (isOpen) {
            getAllProfile();
        }
    }, [isOpen, getAllProfile]);

    if (!isOpen || !template) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Assign Template to Sub-Profiles</h2>
                    <button
                        onClick={handleCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Select profiles and sub-profiles to assign the template &quot;{template.name}&quot; to.
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
                                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                            >
                                <option value="">Select a profile</option>
                                {profile.map((profileItem: Profile) => (
                                    <option key={profileItem.id} value={profileItem.id}>
                                        {profileItem.profile_name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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
                                onChange={(e) => setSelectedPriority(e.target.value as '1' | '2' | '3')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                            >
                                <option value="1">High (1)</option>
                                <option value="2">Medium (2)</option>
                                <option value="3">Low (3)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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
                        disabled={!selectedProfile}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${selectedProfile
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : 'bg-gray-300 cursor-not-allowed'
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
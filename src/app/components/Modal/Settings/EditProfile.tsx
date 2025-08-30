import { useState } from 'react';

// Type definitions
interface UserProfile {
  fullName?: string;
  username?: string;
  email?: string;
}

interface FormData {
  fullName: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserProfile;
  onSave: (formData: FormData) => Promise<void> | void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen = false, 
  onClose = () => {}, 
  initialData = {}, 
  onSave = () => {}
}) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: initialData?.fullName || '',
    // Note: Username is not editable based on your API
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-white-600 bg-red-500 text-sm rounded-lg border hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 mr-2">
                Username
              </label>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                Read-only
              </span>
            </div>
            <input
              type="text"
              value={`@${initialData?.username || ''}`}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="Username"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 mr-2">
                Email Address
              </label>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                Read-only
              </span>
            </div>
            <input
              type="email"
              value={initialData?.email || ''}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="Email address"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
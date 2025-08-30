import { useState } from 'react';

// ==================== CHANGE PASSWORD MODAL ====================

// Type definitions for ChangePasswordModal
interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface ChangePasswordRequest {
  email: string;
  current_password: string;
  new_password: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onChangePassword: (data: ChangePasswordRequest) => Promise<void> | void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail,
  onChangePassword 
}) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ChangePasswordErrors>({});

  const handleChangePassword = async (): Promise<void> => {
    const newErrors: ChangePasswordErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      await onChangePassword({
        email: userEmail,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      handleClose();
    } catch (error) {
      setErrors({ general: 'Failed to change password. Please check your current password and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof ChangePasswordFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Enter your current password and choose a new password
          </p>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
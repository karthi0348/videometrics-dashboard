import { useState } from "react";

// Type definitions for ResetPasswordModal
interface ResetPasswordFormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordErrors {
  email?: string;
  verificationCode?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onSendCode: (email: string) => Promise<void> | void;
  onResetPassword: (email: string, verificationCode: string, newPassword: string) => Promise<void> | void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail,
  onSendCode,
  onResetPassword 
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: send code, 2: verify and reset
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: userEmail || '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const handleSendCode = async (): Promise<void> => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      await onSendCode(formData.email);
      setStep(2);
    } catch (error) {
      setErrors({ email: 'Failed to send verification code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    const newErrors: ResetPasswordErrors = {};

    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      await onResetPassword(
        formData.email,
        formData.verificationCode,
        formData.newPassword
      );
      handleClose();
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please check your verification code and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setStep(1);
    setFormData({
      email: userEmail || '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof ResetPasswordFormData, value: string): void => {
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
        {step === 1 ? (
          // Step 1: Send Code
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
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
                Verification code will be sent to {formData.email || 'your email'}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  A verification code will be sent to this email address.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Step 2: Verify and Reset
          <>
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
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
                Enter the verification code and your new password
              </p>
              
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('verificationCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter verification code"
                    disabled={isLoading}
                  />
                  {errors.verificationCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
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
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
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
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
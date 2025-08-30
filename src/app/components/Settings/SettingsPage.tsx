'use client';

import { useState, useEffect, useRef } from 'react';
import EditProfileModal from '../Modal/Settings/EditProfile';
import ResetPasswordModal from '../Modal/Settings/ResetPassword';
import ChangePasswordModal from '../Modal/Settings/ChangePassword';
import UserApiService from '@/helpers/service/user/user-api-service';

const SettingsPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const userApiService = new UserApiService();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await userApiService.getCurrentUser();
      
      // Map API response to component state
      setFullName(userData.full_name || '');
      setUsername(userData.username || '');
      setEmail(userData.email || '');
      setProfileImage(userData.profile_image || null);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading user data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: { target: { files: any[]; }; }) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        // Here you could also upload the image to your server
        // handleUpdateProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  

const handleSaveProfile = async (formData: { fullName: any; }) => {
  try {
    const payload = {
      email: email, // Required field
      full_name: formData.fullName
    };
    
    const updatedUser = await userApiService.updateCurrentUser(payload);
    
    if (updatedUser) {
      setFullName(updatedUser.full_name || formData.fullName);
      setUsername(updatedUser.username || username);
      setEmail(updatedUser.email || email);
    } else {
      setFullName(formData.fullName);
    }
    
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Error updating profile. Please try again.');
  }
};
  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleChangePasswordSubmit = async (passwordData: { email: any; current_password: any; new_password: any; }) => {
    try {
      const payload = {
        email: passwordData.email,
        full_name: fullName, // Required field
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      };
      
      await userApiService.updateCurrentUser(payload);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Error changing password. Please check your current password and try again.');
    }
  };

  const handleResetPassword = () => {
    setShowResetModal(true);
  };
  const handleSendCode = async (email: string) => {
    try {
      await userApiService.sendCode(email);
      alert('Verification code sent to your email!');
    } catch (error) {
      console.error('Error sending code:', error);
      throw new Error('Error sending verification code. Please try again.');
    }
  };

  const handleResetPasswordSubmit = async (email: string, verificationCode: string, newPassword: string) => {
    try {
      await userApiService.verifyAndResetPassword(email, verificationCode, newPassword);
      alert('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Error resetting password. Please check your verification code and try again.');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((word: any[]) => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-center text-2xl font-bold text-purple-600">Profile Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 bg-purple-100">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleChangePassword}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0h6" />
                  </svg>
                  Change Password
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Password
                </button>
                <button 
                  onClick={handleEditProfile}
                  className="flex items-center px-4 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side - Profile Image and Basic Info */}
              <div className="lg:w-1/3">
                <div className="text-center">
                  {/* Profile Avatar */}
                  <div 
                    className="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-4 cursor-pointer relative group"
                    style={{ 
                      background: profileImage ? `url(${profileImage}) center/cover` : 'linear-gradient(135deg, #8B5CF6, #A855F7)'
                    }}
                    onClick={handleProfileImageClick}
                  >
                    {!profileImage && (
                      <span className="text-4xl font-bold text-white">{getInitials(fullName || 'US')}</span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {/* Name and Username */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h3>
                  <p className="font-medium mb-2 text-teal-600">@{username}</p>
                  <p className="text-sm text-gray-500">Member since July 19, 2025</p>
                </div>
              </div>

              {/* Right Side - Account Information */}
              <div className="lg:w-2/3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
                  
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <div className="flex items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 mr-2">
                          Username
                        </label>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-teal-600 bg-teal-100 rounded-full">
                          Public
                        </span>
                      </div>
                      <input
                        type="text"
                        value={`@${username}`}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Enter your username"
                      />
                    </div>

                    {/* Email Address */}
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
                        value={email}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={{ fullName, username, email }}
        onSave={handleSaveProfile}
      />

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        userEmail={email}
        onSendCode={handleSendCode}
        onResetPassword={handleResetPasswordSubmit}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail={email}
        onChangePassword={handleChangePasswordSubmit}
      />
    </div>
  );
};

export default SettingsPage;
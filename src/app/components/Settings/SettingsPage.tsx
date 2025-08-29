"use client";

import { useState, useEffect, useRef } from "react";
import EditProfileModal from "../Modal/Settings/EditProfile";
import ResetPasswordModal from "../Modal/Settings/ResetPassword";
import UserApiService from "@/helpers/service/user/user-api-service";

const SettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const userApiService = new UserApiService();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await userApiService.getCurrentUser();
      setFullName(userData.fullName || "");
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setProfileImage(userData.profileImage);
    } catch (error: any) {
      console.error("Error loading user data:", error);
      setNotification({
        type: "error",
        message: error.message || "Failed to load user data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        // TODO: upload image to backend via userApiService.updateCurrentUser
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (formData: {
    fullName: string;
    username: string;
  }) => {
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
      };

      await userApiService.updateCurrentUser(payload);

      // Update local state
      setFullName(formData.fullName.trim());
      setUsername(formData.username.trim());

      setNotification({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleResetPassword = () => {
    setShowResetModal(true);
  };

  const handleSendCode = async (email: string) => {
    try {
      await userApiService.sendCode(email);
      alert("Verification code sent to your email!");
    } catch (error) {
      console.error("Error sending code:", error);
      alert("Error sending verification code. Please try again.");
    }
  };

  const handleResetPasswordSubmit = async (
    email: string,
    verificationCode: string,
    newPassword: string
  ) => {
    try {
      await userApiService.verifyAndResetPassword(
        email,
        verificationCode,
        newPassword
      );
      alert("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(
        "Error resetting password. Please check your verification code and try again."
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-500 to-purple-800">
      {/* Header */}
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-purple ">Profile Settings</h1>
          <p className="text-white-200 mt-2">
            Manage your personal details and security
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-purple-400 rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
          {/* Profile Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 bg-purple-100">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-purple-800">
                  Your Profile
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset Password
                </button>
                <button
                  onClick={handleEditProfile}
                  className="flex-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow-md hover:from-purple-600 hover:to-purple-800 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
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
                      background: profileImage
                        ? `url(${profileImage}) center/cover`
                        : "linear-gradient(135deg, #8B5CF6, #A855F7)",
                    }}
                    onClick={handleProfileImageClick}
                  >
                    {!profileImage && (
                      <span className="text-4xl font-bold text-white">
                        {getInitials(fullName || "US")}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
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
                  <h3 className="text-2xl font-bold text-purple-900 mb-1">
                    {fullName}
                  </h3>
                  <p className="font-medium mb-2 text-purple-900">
                    @{username}
                  </p>
                  <p className="text-sm text-white-500">
                    Member since July 19, 2025
                  </p>
                </div>
              </div>

              {/* Right Side - Account Information */}
              <div className="lg:w-2/3">
                <div>
                  <h2 className="text-lg font-semibold text-black-900 mb-6">
                    Account Information
                  </h2>

                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-black-700 mb-2">
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
                        <label className="block text-sm font-medium text-black-700 mr-2">
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
                        <label className="block text-sm font-medium text-black-700 mr-2">
                          Email Address
                        </label>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-500 bg-gray-100 rounded-full">
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
    </div>
  );
};

export default SettingsPage;

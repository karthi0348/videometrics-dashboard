"use client";

import { useState, useEffect, useRef, SetStateAction } from "react";
import EditProfileModal from "../Modal/Settings/EditProfile";
import ResetPasswordModal from "../Modal/Settings/ResetPassword";
import ChangePasswordModal from "../Modal/Settings/ChangePassword";
import UserApiService from "@/helpers/service/user/user-api-service";

// Import Shadcn UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Import Lucide Icons
import {
  User,
  Key,
  Edit,
  Lock,
  Camera,
  RotateCcw,
  PenSquare,
} from "lucide-react";

const SettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      setFullName(userData.full_name || "");
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setProfileImage(userData.profile_image || null);
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Error loading user data. Please refresh the page.");
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

  const handleSaveProfile = async (formData: { fullName: SetStateAction<string>; }) => {
    try {
      const payload = {
        email: email, // Required field
        full_name: formData.fullName,
      };

      const updatedUser = await userApiService.updateCurrentUser(payload);

      if (updatedUser) {
        setFullName(updatedUser.full_name || formData.fullName);
        setUsername(updatedUser.username || username);
        setEmail(updatedUser.email || email);
      } else {
        setFullName(formData.fullName);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Error updating profile. Please try again.");
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
        new_password: passwordData.new_password,
      };

      await userApiService.updateCurrentUser(payload);
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error(
        "Error changing password. Please check your current password and try again."
      );
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
      throw new Error("Error sending verification code. Please try again.");
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
      throw new Error(
        "Error resetting password. Please check your verification code and try again."
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word: any[]) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Add the custom glassmorphism class to the root element.
  // Make sure you have the background image set up in your global CSS.
  // The glass effect is from the combination of `bg-white/20`, `border-white/30`, and `backdrop-blur-md`
  const glassMorphismClass = "bg-white/20 border-white/30 backdrop-blur-md";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex items-center space-x-2 text-white">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-teal-500"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    // You'll need to define a background gradient or image in your CSS for the glass effect to be visible.
    // For example, in your global.css, you could have:
    // body { background: linear-gradient(to right, #6a11cb, #2575fc); }
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple drop-shadow-lg">
            ⚙️ Profile Settings 
          </h1>
          <p className="text-sm text-grey/80 mt-2">
            Manage your account and profile information.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className={`w-full ${glassMorphismClass} text-purple`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-purple-800" />
              <CardTitle className="text-xl">Your Profile</CardTitle>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={handleChangePassword}
                variant="outline"
                className="bg-blue-600 text-white hover:bg-white/10 border-white/30"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="bg-green-600 text-white hover:bg-white/10 border-white/30"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
              <Button
                onClick={handleEditProfile}
                variant="outline"
                className="bg-purple-600 text-white hover:bg-white/10 border-white/30"
              >
                <PenSquare className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>

          <Separator className="bg-white/30" />

          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Side - Profile Image and Basic Info */}
              <div className="lg:w-1/3 text-center">
                <div
                  className="relative inline-block"
                  onClick={handleProfileImageClick}
                >
                  <Avatar className="w-32 h-32 mx-auto cursor-pointer border-4 border-white transition-transform hover:scale-105">
                    <AvatarImage src={profileImage} alt="Profile Picture" />
                    <AvatarFallback className="bg-purple-500 text-white text-4xl">
                      {getInitials(fullName || "US")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-teal-500 hover:bg-teal-600 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <h3 className="text-2xl font-bold mt-4 break-words text-white">
                  {fullName}
                </h3>
                <p className="font-medium text-teal-300 mt-1 break-words">
                  @{username}
                </p>
                <p className="text-sm text-white/70 mt-2">
                  Member since July 19, 2025
                </p>
              </div>

              {/* Right Side - Account Information */}
              <div className="lg:w-2/3 space-y-6">
                <div className="text-2xl font-bold text-white-900">
  Account Information
</div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      readOnly
                      className={`mt-2 ${glassMorphismClass}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="username">Username</Label>
                      <Badge
                        variant="secondary"
                        className="bg-teal-500 text-white"
                      >
                        Public
                      </Badge>
                    </div>
                    <Input
                      id="username"
                      value={`@${username}`}
                      readOnly
                      className={`mt-2 ${glassMorphismClass}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Badge
                        variant="outline"
                        className="bg-zinc-800 text-white border-zinc-700"
                      >
                        Read-only
                      </Badge>
                    </div>
                    <Input
                      id="email"
                      value={email}
                      readOnly
                      className={`mt-2 ${glassMorphismClass}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

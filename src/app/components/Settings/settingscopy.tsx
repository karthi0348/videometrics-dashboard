'use client';

import { useState, useEffect, useRef } from 'react';
import EditProfileModal from '../Modal/Settings/EditProfile';
import ResetPasswordModal from '../Modal/Settings/ResetPassword';
import ChangePasswordModal from '../Modal/Settings/ChangePassword';
import UserApiService from '@/helpers/service/user/user-api-service';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  RotateCcw, 
  Edit3, 
  Camera, 
  Mail, 
  AtSign,
  Calendar,
  Loader2
} from 'lucide-react';



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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Profile Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Your Profile</h2>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangePassword}
                  className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPassword}
                  className="backdrop-blur-sm bg-red-500/10 border-red-400/30 text-red-200 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Side - Profile Image and Basic Info */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  {/* Profile Avatar */}
                  <div className="relative mb-6 group">
                    <Avatar 
                      className="w-32 h-32 mx-auto cursor-pointer border-4 border-white/20 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-white/40"
                      onClick={handleProfileImageClick}
                    >
                         {!profileImage && (
                      <span className="text-2xl sm:text-4xl font-bold text-white">{getInitials(fullName || 'US')}</span>
                    )}
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                        {getInitials(fullName || 'US')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="absolute bottom-2 right-1/2 transform translate-x-6 w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <Edit3 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {/* Profile Info Card */}
                  <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-2">{fullName}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <AtSign className="h-4 w-4 text-teal-400" />
                      <p className="text-teal-400 font-medium">{username}</p>
                    </div>
                    
                    <Separator className="my-4 bg-white/10" />
                    
                    <div className="flex items-center justify-center space-x-2 text-white/60">
                      <Calendar className="h-4 w-4" />
                      <p className="text-sm">Member since July 19, 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Account Information */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-purple-400" />
                    Account Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullname" className="text-white/80 text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="fullname"
                        type="text"
                        value={fullName}
                        readOnly
                        className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 mb-2">
                        <Label htmlFor="username" className="text-white/80 text-sm font-medium">
                          Username
                        </Label>
                        <Badge variant="secondary" className="bg-teal-500/20 text-teal-300 border-teal-400/30 text-xs">
                          Public
                        </Badge>
                      </div>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          readOnly
                          className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder-white/40 pl-10 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 mb-2">
                        <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                          Email Address
                        </Label>
                        <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                          Read-only
                        </Badge>
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          readOnly
                          className="backdrop-blur-sm bg-white/5 border-white/10 text-white/60 placeholder-white/30 pl-10 cursor-not-allowed transition-all duration-300"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
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
        onSave={() => {}}
      />

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        userEmail={email}
        onSendCode={() => {}}
        onResetPassword={() => {}}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail={email}
        onChangePassword={() => {}}
      />
    </div>
  );
};

export default SettingsPage;
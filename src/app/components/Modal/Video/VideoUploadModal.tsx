import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api'; // Adjust the import path based on your project structure

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
}

interface User {
  id: string;
  uuid: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError
}) => {
  const [videoName, setVideoName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReceived, setAuthReceived] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check local storage for existing tokens with both key names
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
      setAuthReceived(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && storedUser.id) {
          setUser(storedUser);
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }

    // Set up a listener for messages from the login page
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data, 'from origin:', event.origin);
      
      // Accept messages from the login page (localhost:3000)
      if (event.origin !== 'http://localhost:3000') {
        console.log('Message rejected - invalid origin:', event.origin);
        return;
      }
      
      if (event.data && event.data.type === 'AUTH_TOKEN') {
        const { accessToken: newAccessToken, user: newUser } = event.data;
        
        console.log('Auth token received:', newAccessToken ? 'Token present' : 'No token');
        console.log('User data received:', newUser);
        
        if (newAccessToken) {
          // Store the new token and user info in state and local storage
          setAccessToken(newAccessToken);
          setUser(newUser);
          setAuthReceived(true);
          
          // Store in localStorage with both key names for compatibility
          localStorage.setItem('authToken', newAccessToken);
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('user', JSON.stringify(newUser));
          
          console.log('Auth token and user data stored successfully');
          
          // Send confirmation back to login page to stop sending messages
          if (event.source) {
            (event.source as Window).postMessage(
              { type: 'AUTH_RECEIVED', success: true },
              event.origin
            );
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Send logout message to parent when component unmounts or user logs out
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Reset state
    setAccessToken(null);
    setUser(null);
    setAuthReceived(false);
    
    // Send logout message to login page if it's the opener
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: 'LOGOUT' },
        'http://localhost:3000'
      );
    }
    
    console.log('Logged out successfully');
  };

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }

    // Validate file size (1GB limit)
    const maxSize = 1 * 1024 * 1024 * 1024; // 1GB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 1GB.');
      return;
    }

    setSelectedFile(file);
    if (!videoName) {
      // Auto-fill video name from filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setVideoName(nameWithoutExt);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    // Check if the token exists before proceeding
    if (!accessToken) {
      alert('Authentication token not found. Please log in.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a video file.');
      return;
    }

    if (!videoName.trim()) {
      alert('Please enter a video name.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video_file', selectedFile);
      formData.append('video_name', videoName.trim());
      
      // Append the user ID to the form data
      if (user && user.id) {
        formData.append('user_id', user.id);
      } else {
        console.warn("User ID not found. Proceeding without it.");
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };

      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload successful:', response);
            onUploadSuccess?.(response);
            handleClose();
          } catch (error) {
            console.error('Error parsing response:', error);
            onUploadError?.(error);
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            console.error('Upload failed:', errorResponse);
            onUploadError?.(errorResponse);
          } catch (error) {
            console.error('Upload failed with status:', xhr.status);
            onUploadError?.(new Error(`Upload failed with status: ${xhr.status}`));
          }
        }
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        console.error('Network error during upload');
        onUploadError?.(new Error('Network error during upload'));
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.ontimeout = () => {
        console.error('Upload timeout');
        onUploadError?.(new Error('Upload timeout. Please try again.'));
        setIsUploading(false);
        setUploadProgress(0);
      };

      // Make the request using the API endpoint
      xhr.open('POST', API_ENDPOINTS.UPLOAD_VIDEO);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('Accept', 'application/json');
      // Set timeout to 10 minutes for large video uploads
      xhr.timeout = 10 * 60 * 1000;
      
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading video:', error);
      onUploadError?.(error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload
    
    setVideoName('');
    setSelectedFile(null);
    setUploadProgress(0);
    setDragOver(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isUploading) {
      handleClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show authentication prompt if no token
  if (!accessToken) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {authReceived ? 'Authentication Error' : 'Waiting for Authentication'}
          </h2>
          <p className="text-gray-600 mb-6">
            {authReceived 
              ? 'Authentication failed. Please try logging in again.' 
              : 'Please complete the login process in the parent window.'
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            {authReceived && (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Reset Authentication
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
            <p className="text-sm text-gray-500 mt-1">Add a new video to your library</p>
            {user && (
              <p className="text-xs text-blue-600 mt-1">
                Logged in as: {user.username} ({user.email})
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            {!isUploading && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Video Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="Enter video name"
              disabled={isUploading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
              maxLength={100}
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Video File <span className="text-red-500">*</span>
            </label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-700">
                      <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                        Click to upload
                      </span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      MP4, AVI, MOV, WebM up to 1GB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/avi,video/mov,video/webm,video/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3 bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Uploading video...</span>
                <span className="text-blue-900 font-bold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress < 100 && (
                <p className="text-xs text-blue-600 text-center">
                  Please do not close this window during upload
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUploading ? 'Uploading...' : 'Cancel'}
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !videoName.trim() || isUploading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Video'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
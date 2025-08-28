'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Profile } from '@/app/types/profiles';
import { CreateSubProfileAPIRequest } from '@/app/types/subprofiles';
import YourProfiles from '@/app/components/Profiles/YourProfiles';
import ProfileDetails from '@/app/components/Profiles/ProfileDetails';
import SubProfiles from '@/app/components/Profiles/Subprofile/SubProfiles';
import CreateProfile from '@/app/components/Profiles/CreateProfile';
import { API_ENDPOINTS } from '../../config/api';
import { SubProfileService } from '@/app/services/subprofile-service';

// Main page component - acts as the controller and state manager
const ProfilesPage: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'details' | 'subprofiles' | 'create'>('list');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subProfileService = new SubProfileService();

  // Helper function to get the authentication headers
  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  };

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.LIST_PROFILES, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view profiles.');
        }
        throw new Error(`Failed to fetch profiles: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both array and object responses
      const profilesArray = Array.isArray(data) ? data : data.profiles || [data];
      
      // Transform API response to match Profile interface
      const transformedProfiles: Profile[] = profilesArray.map((item: any) => ({
        id: Number(item.id || item._id) || Date.now(),
        name: item.name || '',
        email: item.email || '',
        tag: item.tag || 'default',
        contact: item.contact || item.contact_person || '',
        description: item.description || '',
        location: item.location || '',
        industry: item.industry || '',
        businessType: item.business_type || item.businessType || '',
        contactEmail: item.contact_email || item.contactEmail || item.email || '',
        contactPerson: item.contact_person || item.contactPerson || item.contact || '',
        phoneNumber: item.phone_number || item.phoneNumber || '',
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map((t: string) => t.trim()) : []),
        status: item.status || 'Active',
        created: item.created_at || item.created || new Date().toLocaleString(),
        lastUpdated: item.updated_at || item.lastUpdated || new Date().toLocaleString()
      }));
      
      setProfiles(transformedProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
      console.error('Error loading profiles:', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveView('details');
  };

  const handleViewChange = (view: 'list' | 'details' | 'subprofiles' | 'create') => {
    setActiveView(view);
  };

  const handleCreateProfile = async (newProfile: Omit<Profile, 'id' | 'created' | 'lastUpdated'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: newProfile.name,
        email: newProfile.email,
        tag: newProfile.tag,
        contact: newProfile.contact,
        description: newProfile.description,
        location: newProfile.location,
        industry: newProfile.industry,
        business_type: newProfile.businessType,
        contact_email: newProfile.contactEmail,
        contact_person: newProfile.contactPerson,
        phone_number: newProfile.phoneNumber,
        tags: Array.isArray(newProfile.tags) ? newProfile.tags : [],
        status: newProfile.status
      };

      const response = await fetch(API_ENDPOINTS.CREATE_PROFILE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to create profiles.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create profile: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      const createdProfile: Profile = {
        id: Number(data.id || data._id) || Date.now(),
        name: data.name || payload.name,
        email: data.email || payload.email,
        tag: data.tag || payload.tag,
        contact: data.contact || data.contact_person || payload.contact,
        description: data.description || payload.description,
        location: data.location || payload.location,
        industry: data.industry || payload.industry,
        businessType: data.business_type || payload.business_type,
        contactEmail: data.contact_email || payload.contact_email,
        contactPerson: data.contact_person || payload.contact_person,
        phoneNumber: data.phone_number || payload.phone_number,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : payload.tags),
        status: data.status || payload.status,
        created: data.created_at || data.created || new Date().toLocaleString(),
        lastUpdated: data.updated_at || data.lastUpdated || new Date().toLocaleString()
      };

      setProfiles(prev => [...prev, createdProfile]);
      setActiveView('list');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: updatedProfile.name,
        email: updatedProfile.email,
        tag: updatedProfile.tag,
        contact: updatedProfile.contact,
        description: updatedProfile.description,
        location: updatedProfile.location,
        industry: updatedProfile.industry,
        business_type: updatedProfile.businessType,
        contact_email: updatedProfile.contactEmail,
        contact_person: updatedProfile.contactPerson,
        phone_number: updatedProfile.phoneNumber,
        tags: Array.isArray(updatedProfile.tags) ? updatedProfile.tags : [],
        status: updatedProfile.status
      };

      const url = API_ENDPOINTS.UPDATE_PROFILE.replace('{profile_id}', updatedProfile.id.toString());
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update this profile.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      const data = await response.json();
      
      const updated: Profile = {
        id: data.id || updatedProfile.id,
        name: data.name || payload.name,
        email: data.email || payload.email,
        tag: data.tag || payload.tag,
        contact: data.contact || data.contact_person || payload.contact,
        description: data.description || payload.description,
        location: data.location || payload.location,
        industry: data.industry || payload.industry,
        businessType: data.business_type || payload.business_type,
        contactEmail: data.contact_email || payload.contact_email,
        contactPerson: data.contact_person || payload.contact_person,
        phoneNumber: data.phone_number || payload.phone_number,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t: string) => t.trim()) : payload.tags),
        status: data.status || payload.status,
        created: updatedProfile.created,
        lastUpdated: data.updated_at || data.lastUpdated || new Date().toLocaleString()
      };

      setProfiles(prev =>
        prev.map(p => p.id === updated.id ? updated : p)
      );
      setSelectedProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!window.confirm('Are you sure you want to delete this profile and all its sub-profiles?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = API_ENDPOINTS.DELETE_PROFILE.replace('{profile_id}', profileId.toString());
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete this profile.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete profile: ${response.status}`);
      }

      setProfiles(prev => prev.filter(p => p.id !== profileId));
      
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
        setActiveView('list');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Profiles Manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen font-sans text-gray-900 p-4 sm:p-6 lg:p-8" 
           style={{ backgroundColor: 'rgb(196, 127, 254, 0.05)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-mono" style={{ color: 'var(--purple-secondary)' }}>
              Profiles
            </h1>
            <span className="text-sm font-medium" style={{ color: 'var(--purple-tertiary)' }}>
              Manage your profiles and sub-profiles
            </span>
          </div>
          <div className="flex gap-2">
            {activeView !== 'create' && (
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--purple-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
                }}
                onClick={() => handleViewChange('create')}
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Create Profile
              </button>
            )}
            {activeView !== 'list' && (
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors"
                style={{
                  backgroundColor: 'rgb(196, 127, 254, 0.1)',
                  color: 'var(--purple-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.1)';
                }}
                onClick={() => handleViewChange('list')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 border px-4 py-3 rounded-lg"
               style={{
                 backgroundColor: 'rgb(239, 68, 68, 0.05)',
                 borderColor: 'rgb(239, 68, 68, 0.2)',
                 color: 'rgb(153, 27, 27)'
               }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'rgb(239, 68, 68)' }} />
              <div className="flex-1">
                <span className="font-medium">Error:</span>
                <span className="ml-1">{error}</span>
                {error.includes('403') && (
                  <div className="mt-2 text-sm">
                    <p>This could be due to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Missing authentication token</li>
                      <li>Insufficient permissions</li>
                      <li>API key not configured</li>
                      <li>CORS policy restrictions</li>
                    </ul>
                    <p className="mt-2 font-medium">Check your API configuration and authentication setup.</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="mt-3 text-sm underline hover:no-underline transition-colors"
              style={{ color: 'rgb(239, 68, 68)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgb(185, 28, 28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(239, 68, 68)';
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 relative border"
             style={{
               boxShadow: '0 25px 50px -12px rgb(81, 77, 223, 0.1), 0 10px 25px -5px rgb(81, 77, 223, 0.05)',
               borderColor: 'rgb(196, 127, 254, 0.2)'
             }}>
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--purple-secondary)' }} />
                <span className="text-lg font-medium" style={{ color: 'var(--purple-secondary)' }}>
                  Loading...
                </span>
              </div>
            </div>
          )}

          {activeView === 'list' && (
            <YourProfiles
              profiles={profiles}
              onProfileSelect={handleProfileSelect}
              onViewSubProfiles={(profile) => {
                setSelectedProfile(profile);
                handleViewChange('subprofiles');
              }}
              onRefresh={loadProfiles}
            />
          )}

          {activeView === 'details' && selectedProfile && (
            <ProfileDetails
              profile={selectedProfile}
              onEdit={handleUpdateProfile}
              onDelete={handleDeleteProfile}
              onViewSubProfiles={() => handleViewChange('subprofiles')}
            />
          )}

          {activeView === 'subprofiles' && selectedProfile && (
            <SubProfiles
              profile={selectedProfile}
              onBackToDetails={() => handleViewChange('details')}
            />
          )}

          {activeView === 'create' && (
            <CreateProfile
              onCreateProfile={handleCreateProfile}
              onCancel={() => handleViewChange('list')}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilesPage;
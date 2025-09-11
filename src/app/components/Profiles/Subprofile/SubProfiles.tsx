'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Camera, RefreshCcw, User, Building, MapPin, Mail } from 'lucide-react';
import { Profile } from '@/app/types/profiles';
import { SubProfile, UpdateSubProfileAPIRequest } from '@/app/types/subprofiles';
import { SubProfileService } from '@/app/services/subprofile-service';
import CreateSubProfile from './CreateSubProfile';
import ViewSubProfileModal from '../../Modal/SubProfiles/ViewSubProfileModal';
import EditSubProfileModal from '../../Modal/SubProfiles/EditSubProfileModal';
import DeleteSubProfileModal from '../../Modal/SubProfiles/DeleteSubProfileModal';

// Type definitions
interface CreateSubProfileData {
  name: string;
  description?: string;
  areaType: string;
  isActive: boolean;
  tags?: string[];
  cameraLocations?: unknown[];
  monitoringSchedules?: unknown[];
  alertSettings?: unknown[];
}

interface SubProfileListProps {
  profile: Profile;
  onBackToDetails: () => void; 
}

const SubProfileList: React.FC<SubProfileListProps> = ({ profile }) => {
  const [subProfiles, setSubProfiles] = useState<SubProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSubProfile, setViewingSubProfile] = useState<SubProfile | null>(null);
  const [editingSubProfile, setEditingSubProfile] = useState<SubProfile | null>(null);
  const [deletingSubProfile, setDeletingSubProfile] = useState<SubProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByActive, setFilterByActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  const subProfileService = new SubProfileService();

  // Fetch sub-profiles using existing service
  const fetchSubProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subProfileService.getSubProfiles(profile.id);
      setSubProfiles(data);
    } catch (error: unknown) {
      console.error('Failed to fetch sub-profiles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sub-profiles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get individual sub-profile using existing service
  const handleViewSubProfile = async (subProfileId: number) => {
    try {
      const subProfile = await subProfileService.getSubProfile(subProfileId);
      setViewingSubProfile(subProfile);
    } catch (error: unknown) {
      console.error('Failed to fetch sub-profile details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sub-profile details';
      setError(errorMessage);
    }
  };

  // Create sub-profile using existing service
  const handleCreateSubProfile = async (subProfileData: CreateSubProfileData) => {
    try {
      setCreating(true);
      setError(null);
      const newSubProfile = await subProfileService.createSubProfile(profile.id, subProfileData);
      setSubProfiles(prev => [...prev, newSubProfile]);
      setShowCreateModal(false);
    } catch (error: unknown) {
      console.error('Failed to create sub-profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create sub-profile';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Update sub-profile using existing service
  const handleUpdateSubProfile = async (subProfileId: number, updateData: UpdateSubProfileAPIRequest) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSubProfile = await subProfileService.updateSubProfile(profile.id, subProfileId, updateData);
      setSubProfiles(prev => prev.map(sp => 
        sp.id === subProfileId ? updatedSubProfile : sp
      ));
      setEditingSubProfile(null);
      console.log('Sub-profile updated successfully');
    } catch (error: unknown) {
      console.error('Failed to update sub-profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sub-profile';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Delete sub-profile using existing service
  const handleDeleteSubProfile = async (subProfileId: number) => {
    try {
      setDeleting(true);
      setError(null);
      await subProfileService.deleteSubProfile(profile.id, subProfileId);
      setSubProfiles(prev => prev.filter(sp => sp.id !== subProfileId));
      setDeletingSubProfile(null);
      console.log('Sub-profile deleted successfully');
    } catch (error: unknown) {
      console.error('Failed to delete sub-profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete sub-profile';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status using existing service
  const handleToggleActive = async (subProfile: SubProfile) => {
    try {
      setError(null);
      const updatedSubProfile = await subProfileService.toggleActiveStatus(subProfile);
      setSubProfiles(prev => prev.map(sp => 
        sp.id === subProfile.id ? updatedSubProfile : sp
      ));
    } catch (error: unknown) {
      console.error('Error updating sub-profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error updating sub-profile status';
      setError(errorMessage);
    }
  };

  // Filter sub-profiles
  const filteredSubProfiles = subProfiles.filter(subProfile => {
    const matchesSearch = subProfile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subProfile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subProfile.areaType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterByActive === null || subProfile.isActive === filterByActive;
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchSubProfiles();
  }, [profile.id]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return subProfiles.length;
    return subProfiles.filter((p) => p.isActive === (status === "active")).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
              <Camera className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Sub-Profiles
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Manage sub-profiles for {profile.name} ({filteredSubProfiles.length} of {subProfiles.length})
              </p>
            </div>
          </div>
          
          <div className="lg:ml-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={creating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Create Sub-Profile
            </button>
          </div>
        </div>


        {/* Search and Filters Section */}
        <div className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sub-profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:border-purple-400 focus:ring-purple-400 bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterByActive === null ? 'all' : filterByActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterByActive(value === 'all' ? null : value === 'active');
                }}
                className="w-full sm:w-[140px] px-3 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="all">All ({getStatusCount("all")})</option>
                <option value="active">Active ({getStatusCount("active")})</option>
                <option value="inactive">Inactive ({getStatusCount("inactive")})</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchSubProfiles}
              className="flex items-center gap-2 px-4 py-3 border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl transition-colors w-full sm:w-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Sub-profiles Grid */}
        {filteredSubProfiles.length === 0 ? (
          <div className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                No sub-profiles found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || filterByActive !== null 
                  ? "Try adjusting your search or filter criteria to find what you're looking for"
                  : "Get started by creating your first sub-profile to monitor different areas"
                }
              </p>
              {!searchTerm && filterByActive === null && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Sub-Profile
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubProfiles.map((subProfile) => (
              <div
                key={subProfile.id}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl shadow-lg"
              >
                {/* Card Header */}
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
                        {subProfile.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {subProfile.areaType}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            subProfile.isActive ? "bg-green-500" : "bg-red-500"
                          }`} />
                          <span className={`text-xs font-medium ${
                            subProfile.isActive ? "text-green-600" : "text-red-600"
                          }`}>
                            {subProfile.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-6 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {subProfile.description || 'No description available'}
                  </p>

                  {/* Tags */}
                  {subProfile.tags && subProfile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subProfile.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {subProfile.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-500">
                          +{subProfile.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">
                        {subProfile.cameraLocations?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Cameras</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-indigo-600">
                        {subProfile.monitoringSchedules?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Schedules</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">
                        {subProfile.alertSettings?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Alerts</div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Updated: {formatDate(subProfile.updatedAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <button
                      onClick={() => handleViewSubProfile(subProfile.id)}
                      className="flex items-center gap-2 flex-1 px-3 py-2 text-sm border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                     <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingSubProfile(subProfile)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubProfile(subProfile)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                  
                </div>

                <div className="p-6 pt-3">
                 
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateSubProfile
            profile={profile}
            onCreateSubProfile={handleCreateSubProfile}
            onCancel={() => setShowCreateModal(false)}
            loading={creating}
          />
        )}

        {viewingSubProfile && (
          <ViewSubProfileModal
            subProfile={viewingSubProfile}
            onClose={() => setViewingSubProfile(null)}
          />
        )}

        {editingSubProfile && (
          <EditSubProfileModal
            subProfile={editingSubProfile}
            onSave={handleUpdateSubProfile}
            onCancel={() => setEditingSubProfile(null)}
            loading={updating}
          />
        )}

        {deletingSubProfile && (
          <DeleteSubProfileModal
            subProfile={deletingSubProfile}
            onConfirm={handleDeleteSubProfile}
            onCancel={() => setDeletingSubProfile(null)}
            loading={deleting}
          />
        )}
      </div>
    </div>
  );
};

export default SubProfileList;
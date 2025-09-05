'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Camera } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--purple-secondary)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--purple-secondary)' }} className="text-3xl font-bold">Sub-Profiles</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage sub-profiles for {profile.name} ({filteredSubProfiles.length} of {subProfiles.length})
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: 'var(--purple-secondary)' }}
        >
          <Plus className="w-4 h-4" />
          Create Sub-Profile
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search sub-profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterByActive === null ? 'all' : filterByActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setFilterByActive(value === 'all' ? null : value === 'active');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={fetchSubProfiles}
          className="px-3 py-2 text-gray-600 hover:text-white hover:bg-purple-400 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Sub-profiles Grid */}
      {filteredSubProfiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--purple-accent)' }}>
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h3 style={{ color: 'var(--purple-tertiary)' }} className="text-lg font-bold mb-2">No sub-profiles found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterByActive !== null 
              ? "No sub-profiles match your current filters."
              : "Get started by creating your first sub-profile."
            }
          </p>
          {!searchTerm && filterByActive === null && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--purple-secondary)' }}
            >
              <Plus className="w-4 h-4" />
              Create Sub-Profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubProfiles.map((subProfile) => (
            <div
              key={subProfile.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 style={{ color: 'var(--purple-tertiary)' }} className="text-lg font-bold mb-1 truncate">
                    {subProfile.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--purple-secondary)' }}>
                    {subProfile.areaType}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(subProfile)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      subProfile.isActive 
                        ? 'bg-green-400 hover:bg-green-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`${subProfile.isActive ? 'Active' : 'Inactive'} - Click to toggle`}
                  />
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {subProfile.description || 'No description available'}
              </p>

              {/* Tags */}
              {subProfile.tags && subProfile.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {subProfile.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: 'var(--purple-medium)' }}
                    >
                      {tag}
                    </span>
                  ))}
                  {subProfile.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                      +{subProfile.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>
                  {subProfile.cameraLocations?.length || 0} cameras
                </span>
                <span>
                  {subProfile.monitoringSchedules?.length || 0} schedules
                </span>
                <span>
                  {subProfile.alertSettings?.length || 0} alerts
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Updated {formatDate(subProfile.updatedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewSubProfile(subProfile.id)}
                    className="p-2 text-gray-400 rounded transition-colors"
                
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--purple-accent)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = '';
                    }}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingSubProfile(subProfile)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSubProfile(subProfile)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
  );
};

export default SubProfileList;
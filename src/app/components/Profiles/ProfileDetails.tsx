// components/profiles/ProfileDetails.tsx
import React, { useState } from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Profile } from '@/app/types/profiles';

interface ProfileDetailsProps {
  profile: Profile;
  onEdit: (updatedProfile: Profile) => void;
  onDelete: (profileId: string) => void;
  onViewSubProfiles: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile, onEdit, onDelete, onViewSubProfiles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedProfile(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }));
  };

  const handleSave = () => {
    onEdit(editedProfile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Details</h2>
          <p className="text-gray-600 mt-1">View and manage the details of {profile.name}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition-colors"
            >
              Save
            </button>
          )}
          <button
            onClick={() => onDelete(profile.id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg shadow hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" value={editedProfile.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={editedProfile.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={editedProfile.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input type="text" name="contactPerson" value={editedProfile.contactPerson} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input type="email" name="contactEmail" value={editedProfile.contactEmail} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" name="phoneNumber" value={editedProfile.phoneNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" value={editedProfile.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <input type="text" name="industry" value={editedProfile.industry} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <input type="text" name="businessType" value={editedProfile.businessType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={editedProfile.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input type="text" value={editedProfile.tags.join(', ')} onChange={handleTagsChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Profile Name" value={profile.name} />
            <InfoItem label="Email" value={profile.email} />
            <InfoItem label="Contact Person" value={profile.contactPerson} />
            <InfoItem label="Contact Email" value={profile.contactEmail} />
            <InfoItem label="Phone Number" value={profile.phoneNumber} />
            <InfoItem label="Location" value={profile.location} />
            <InfoItem label="Industry" value={profile.industry} />
            <InfoItem label="Business Type" value={profile.businessType} />
            <InfoItem label="Status" value={profile.status} />
            <InfoItem label="Tags" value={profile.tags.join(', ')} />
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="mt-1 text-sm text-gray-900">{profile.description}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onViewSubProfiles}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Sub-profiles
        </button>
      </div>
    </div>
  );
};

// Reusable component for displaying key-value pairs
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value}</p>
  </div>
);

export default ProfileDetails;
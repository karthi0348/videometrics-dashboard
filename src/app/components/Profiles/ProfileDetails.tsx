// components/profiles/ProfileDetails.tsx
import React, { useState } from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Profile } from '@/app/types/profiles';

interface ProfileDetailsProps {
  profile: Profile;
  onEdit: (updatedProfile: Profile) => void;
  onDelete: (id: number) => void; 
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--purple-primary)' }}>
            Profile Details
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View and manage the details of{' '}
            <span className="truncate inline-block max-w-full sm:max-w-xs lg:max-w-none" style={{ color: 'var(--purple-secondary)', fontWeight: '500' }}>
              {profile.name}
            </span>
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors w-full sm:w-auto"
              style={{ backgroundColor: 'var(--purple-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-primary)';
              }}
            >
              <Edit className="w-4 h-4" />
              <span className="sm:inline">Edit</span>
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors w-full sm:w-auto"
              style={{ backgroundColor: 'rgb(34, 197, 94)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(22, 163, 74)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(34, 197, 94)';
              }}
            >
              <span className="sm:inline">Save</span>
            </button>
          )}
          <button
            onClick={() => onDelete(profile.id)}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors w-full sm:w-auto"
            style={{
              color: 'rgb(185, 28, 28)',
              backgroundColor: 'rgb(254, 226, 226)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(252, 165, 165)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(254, 226, 226)';
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4"
           style={{ 
             borderColor: 'rgb(196, 127, 254, 0.3)',
             boxShadow: '0 4px 6px -1px rgb(81, 77, 223, 0.05), 0 2px 4px -1px rgb(81, 77, 223, 0.03)'
           }}>
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={editedProfile.name} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Email
              </label>
              <input 
                type="email" 
                name="email" 
                value={editedProfile.email} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Description
              </label>
              <textarea 
                name="description" 
                value={editedProfile.description} 
                onChange={handleChange} 
                rows={3} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm resize-y"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Contact Person
              </label>
              <input 
                type="text" 
                name="contactPerson" 
                value={editedProfile.contactPerson} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Contact Email
              </label>
              <input 
                type="email" 
                name="contactEmail" 
                value={editedProfile.contactEmail} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={editedProfile.phoneNumber} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Location
              </label>
              <input 
                type="text" 
                name="location" 
                value={editedProfile.location} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Industry
              </label>
              <input 
                type="text" 
                name="industry" 
                value={editedProfile.industry} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Business Type
              </label>
              <input 
                type="text" 
                name="businessType" 
                value={editedProfile.businessType} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Status
              </label>
              <select 
                name="status" 
                value={editedProfile.status} 
                onChange={handleChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm bg-white"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Tags (comma-separated)
              </label>
              <input 
                type="text" 
                value={editedProfile.tags.join(', ')} 
                onChange={handleTagsChange} 
                className="block w-full rounded-md border shadow-sm px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgb(196, 127, 254, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--purple-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-6">
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
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--purple-secondary)' }}>
                Description
              </p>
              <p className="text-sm break-words" style={{ color: 'var(--purple-primary)' }}>
                {profile.description}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* View Sub-profiles Button */}
      <div className="flex justify-center sm:justify-end">
        <button
          onClick={onViewSubProfiles}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-sm font-medium rounded-lg shadow transition-colors w-full sm:w-auto max-w-xs sm:max-w-none"
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
        >
          <Eye className="w-4 h-4" />
          <span>View Sub-profiles</span>
        </button>
      </div>
    </div>
  );
};

// Reusable component for displaying key-value pairs
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-sm font-medium mb-1 truncate" style={{ color: 'var(--purple-secondary)' }}>
      {label}
    </p>
    <p className="text-sm break-words" style={{ color: 'black' }}>
      {value}
    </p>
  </div>
);

export default ProfileDetails;
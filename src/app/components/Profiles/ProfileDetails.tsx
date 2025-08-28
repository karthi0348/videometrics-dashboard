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
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--purple-primary)' }}>
            Profile Details
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage the details of <span style={{ color: 'var(--purple-secondary)', fontWeight: '500' }}>{profile.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors"
              style={{ backgroundColor: 'var(--purple-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--purple-primary)';
              }}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors"
              style={{ backgroundColor: 'rgb(34, 197, 94)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(22, 163, 74)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(34, 197, 94)';
              }}
            >
              Save
            </button>
          )}
          <button
            onClick={() => onDelete(profile.id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors"
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
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4"
           style={{ 
             borderColor: 'rgb(196, 127, 254, 0.3)',
             boxShadow: '0 4px 6px -1px rgb(81, 77, 223, 0.05), 0 2px 4px -1px rgb(81, 77, 223, 0.03)'
           }}>
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={editedProfile.name} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Email
              </label>
              <input 
                type="email" 
                name="email" 
                value={editedProfile.email} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Description
              </label>
              <textarea 
                name="description" 
                value={editedProfile.description} 
                onChange={handleChange} 
                rows={3} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Contact Person
              </label>
              <input 
                type="text" 
                name="contactPerson" 
                value={editedProfile.contactPerson} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Contact Email
              </label>
              <input 
                type="email" 
                name="contactEmail" 
                value={editedProfile.contactEmail} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={editedProfile.phoneNumber} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Location
              </label>
              <input 
                type="text" 
                name="location" 
                value={editedProfile.location} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Industry
              </label>
              <input 
                type="text" 
                name="industry" 
                value={editedProfile.industry} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Business Type
              </label>
              <input 
                type="text" 
                name="businessType" 
                value={editedProfile.businessType} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Status
              </label>
              <select 
                name="status" 
                value={editedProfile.status} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Tags (comma-separated)
              </label>
              <input 
                type="text" 
                value={editedProfile.tags.join(', ')} 
                onChange={handleTagsChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
              <p className="text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
                Description
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--purple-primary)' }}>
                {profile.description}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onViewSubProfiles}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors"
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
          View Sub-profiles
        </button>
      </div>
    </div>
  );
};

// Reusable component for displaying key-value pairs
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
      {label}
    </p>
    <p className="mt-1 text-sm" style={{ color: 'black' }}>
      {value}
    </p>
  </div>
);

export default ProfileDetails;
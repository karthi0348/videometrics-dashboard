import React, { useState } from 'react';
import { Profile } from '@/app/types/profiles';
import { API_ENDPOINTS } from '../../config/api';

interface CreateProfileProps {
  onCreateProfile: (newProfile: Profile) => void;
  onCancel: () => void;
}

// API payload interface matching the backend requirements
interface CreateProfilePayload {
  profile_name: string;
  description: string;
  tags: string[];
  location: string;
  industry_sector: string;
  business_type: string;
  contact_person: string;
  contact_email: string;
  phone_number: string;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onCreateProfile, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateProfilePayload>({
    profile_name: '',
    description: '',
    tags: [],
    location: '',
    industry_sector: '',
    business_type: '',
    contact_person: '',
    contact_email: '',
    phone_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }));
  };

  const createProfile = async (payload: CreateProfilePayload) => {
    const response = await fetch(API_ENDPOINTS.CREATE_PROFILE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await createProfile(formData);
      
      // Transform API response to match frontend Profile interface
      const newProfile: Profile = {
        id: apiResponse.id || apiResponse.uuid || `profile_${Date.now()}`,
        name: apiResponse.profile_name || formData.profile_name,
        email: formData.contact_email,
        tag: formData.tags[0] || '', // Use first tag as main tag for compatibility
        contact: formData.contact_person,
        description: formData.description,
        location: formData.location,
        industry: apiResponse.industry_sector || formData.industry_sector,
        businessType: apiResponse.business_type || formData.business_type,
        contactEmail: formData.contact_email,
        contactPerson: formData.contact_person,
        phoneNumber: formData.phone_number,
        tags: formData.tags,
        status: apiResponse.is_active ? 'Active' : 'Inactive',
        created: apiResponse.created_at || new Date().toLocaleString(),
        lastUpdated: apiResponse.updated_at || new Date().toLocaleString()
      };

      onCreateProfile(newProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--purple-secondary)' }}>
        Create New Profile
      </h2>
      
      {error && (
        <div className="p-4 text-sm border rounded-lg"
             style={{
               color: 'rgb(153, 27, 27)',
               backgroundColor: 'rgb(254, 226, 226)',
               borderColor: 'rgb(252, 165, 165)'
             }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField 
            label="Profile Name" 
            name="profile_name" 
            type="text" 
            value={formData.profile_name} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Contact Email" 
            name="contact_email" 
            type="email" 
            value={formData.contact_email} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Contact Person" 
            name="contact_person" 
            type="text" 
            value={formData.contact_person} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Phone Number" 
            name="phone_number" 
            type="tel" 
            value={formData.phone_number} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Location" 
            name="location" 
            type="text" 
            value={formData.location} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Industry Sector" 
            name="industry_sector" 
            type="text" 
            value={formData.industry_sector} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          <FormField 
            label="Business Type" 
            name="business_type" 
            type="text" 
            value={formData.business_type} 
            onChange={handleChange} 
            required 
            disabled={isLoading}
          />
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
              Description <span style={{ color: 'rgb(239, 68, 68)' }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
              style={{
                borderColor: 'rgb(196, 127, 254, 0.3)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--purple-secondary)';
                e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="e.g., technology, consulting, enterprise"
              className="mt-1 block w-full rounded-md shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
              style={{
                borderColor: 'rgb(196, 127, 254, 0.3)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--purple-secondary)';
                e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--purple-accent)' }}>
              Separate multiple tags with commas
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgb(196, 127, 254, 0.1)',
              color: 'var(--purple-secondary)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.1)';
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.profile_name || !formData.contact_email || !formData.contact_person}
            className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: 'var(--purple-secondary)' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
              }
            }}
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable form field component with improved styling
const FormField = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  placeholder 
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium" style={{ color: 'var(--purple-secondary)' }}>
      {label} {required && <span style={{ color: 'rgb(239, 68, 68)' }}>*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-md shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
      style={{
        borderColor: 'rgb(196, 127, 254, 0.3)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--purple-secondary)';
        e.target.style.boxShadow = '0 0 0 3px rgb(81, 77, 223, 0.1)';
        e.target.style.outline = 'none';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgb(196, 127, 254, 0.3)';
        e.target.style.boxShadow = 'none';
      }}
      required={required}
      disabled={disabled}
    />
  </div>
);

export default CreateProfile;
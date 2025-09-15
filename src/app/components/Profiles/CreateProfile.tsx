import React, { useState } from 'react';
import { Profile } from '@/app/types/profiles';
import { API_ENDPOINTS } from '../../config/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  FileText, 
  Hash, 
  Check, 
  Loader2, 
  X,
  AlertCircle,
  UserPlus
} from 'lucide-react';

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
  const [tagInput, setTagInput] = useState('');
  
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

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const isFormValid = () => {
    return (
      formData.profile_name.trim() &&
      formData.contact_email.trim() &&
      formData.contact_person.trim() &&
      formData.description.trim() &&
      formData.location.trim() &&
      formData.industry_sector.trim() &&
      formData.business_type.trim() &&
      formData.phone_number.trim()
    );
  };

  return (
    <div className="min-h-screen rounded-2xl p-4 sm:p-6 lg:p-8  bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Profile
          </h1>
        </div>
        <p className="text-gray-600">
          Add a new profile to manage your business contacts and relationships
        </p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Error creating profile</p>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-8">
        {/* Basic Information Card */}
        <div className=" rounded-xl bg-white/40 backdrop-blur-sm border border-purple-200/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-black-500">Profile details and contact information</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Name */}
              <FormField 
                label="Profile Name" 
                name="profile_name" 
                type="text" 
                value={formData.profile_name} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="Enter profile name"
                icon={<User className="w-4 h-4" />}
              />

              {/* Contact Email */}
              <FormField 
                label="Contact Email" 
                name="contact_email" 
                type="email" 
                value={formData.contact_email} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="contact@company.com"
                icon={<Mail className="w-4 h-4" />}
              />

              {/* Contact Person */}
              <FormField 
                label="Contact Person" 
                name="contact_person" 
                type="text" 
                value={formData.contact_person} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="John Doe"
                icon={<User className="w-4 h-4" />}
              />

              {/* Phone Number */}
              <FormField 
                label="Phone Number" 
                name="phone_number" 
                type="tel" 
                value={formData.phone_number} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="+1 (555) 123-4567"
                icon={<Phone className="w-4 h-4" />}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe this profile, business relationship, or key details..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Provide a detailed description of this profile
              </p>
            </div>
          </div>
        </div>

        {/* Business Information Card */}
        <div className=" rounded-xl bg-white/40 backdrop-blur-sm border border-purple-200/50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                <p className="text-sm text-black-500">Location and industry details</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <FormField 
                label="Location" 
                name="location" 
                type="text" 
                value={formData.location} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="New York, NY"
                icon={<MapPin className="w-4 h-4" />}
              />

              {/* Industry Sector */}
              <FormField 
                label="Industry Sector" 
                name="industry_sector" 
                type="text" 
                value={formData.industry_sector} 
                onChange={handleChange} 
                required 
                disabled={isLoading}
                placeholder="Technology, Healthcare, Finance..."
                icon={<Building className="w-4 h-4" />}
              />

              {/* Business Type */}
              <div className="md:col-span-2">
                <FormField 
                  label="Business Type" 
                  name="business_type" 
                  type="text" 
                  value={formData.business_type} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  placeholder="Corporation, Partnership, LLC, Startup..."
                  icon={<Briefcase className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Card */}
        <div className=" rounded-xl bg-white/40 backdrop-blur-sm border border-purple-200/50">
          <div className="p-6 border-b border-black-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Hash className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                <p className="text-sm text-black-500">Optional categorization tags</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Tags
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g., technology, consulting, enterprise (press Enter to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Press Enter or comma to add tags
              </p>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Added Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isFormValid() ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  Profile is ready to create
                </div>
              ) : (
                <span>Please complete all required fields</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced form field component with icons and modern styling
const FormField = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  placeholder,
  icon
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500`}
        required={required}
        disabled={disabled}
      />
    </div>
  </div>
);

export default CreateProfile;
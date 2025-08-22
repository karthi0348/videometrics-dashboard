// components/profiles/YourProfiles.tsx
import React, { useState } from 'react';
import { Building, Edit, Eye, Mail, MapPin, Search, User } from 'lucide-react';
import { Profile } from '@/app/types/profiles';

interface YourProfilesProps {
  profiles: Profile[];
  onProfileSelect: (profile: Profile) => void;
  onViewSubProfiles: (profile: Profile) => void;
}

const YourProfiles: React.FC<YourProfilesProps> = ({ profiles, onProfileSelect, onViewSubProfiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      profile.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Profiles</h2>
          <p className="text-gray-600 mt-1">Select a profile to view details or manage sub-profiles</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filterStatus === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter} ({filter === 'all' ? profiles.length : profiles.filter(p => p.status.toLowerCase() === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{profile.name}</h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  profile.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${profile.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {profile.status}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <User className="w-4 h-4 text-gray-400" />
                <span>{profile.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <Building className="w-4 h-4 text-gray-400" />
                <span>{profile.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{profile.location}</span>
              </div>
            </div>

            {profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {profile.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
                {profile.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    +{profile.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
              Created: {profile.created}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewSubProfiles(profile)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Sub-profiles
              </button>
              <button
                onClick={() => onProfileSelect(profile)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No profiles found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first profile to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default YourProfiles;
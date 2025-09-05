// components/profiles/YourProfiles.tsx
import React, { useState } from "react";
import { Building, Edit, Eye, Mail, MapPin, Search, User } from "lucide-react";
import { Profile } from "@/app/types/profiles";
import { RefreshCcw } from "lucide-react";

interface YourProfilesProps {
  profiles: Profile[];
  onProfileSelect: (profile: Profile) => void;
  onViewSubProfiles: (profile: Profile) => void;
  onRefresh: () => void;
}

const YourProfiles: React.FC<YourProfilesProps> = ({
  profiles,
  onProfileSelect,
  onViewSubProfiles,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || profile.status.toLowerCase() === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(196, 127, 254, 0.2)' }}>
          <User className="w-6 h-6" style={{ color: 'var(--purple-secondary)' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--purple-secondary)' }}>
            Your Profiles
          </h2>
          <p className="text-gray-600 mt-1">
            Select a profile to view details or manage sub-profiles
          </p>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': 'var(--purple-secondary)',
              focusRingColor: 'var(--purple-secondary)'
            } as React.CSSProperties}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--purple-secondary)';
              e.target.style.boxShadow = '0 0 0 2px rgb(81, 77, 223, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div>
          {/* Refresh button with icon */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors"
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
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filterStatus === filter
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: filterStatus === filter 
                  ? 'var(--purple-secondary)' 
                  : filterStatus !== filter 
                    ? 'rgb(196, 127, 254, 0.1)' 
                    : undefined,
                color: filterStatus === filter 
                  ? 'white' 
                  : 'var(--purple-secondary)'
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== filter) {
                  e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== filter) {
                  e.currentTarget.style.backgroundColor = 'rgb(196, 127, 254, 0.1)';
                }
              }}
            >
              {filter} (
              {filter === "all"
                ? profiles.length
                : profiles.filter((p) => p.status.toLowerCase() === filter)
                    .length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            style={{ borderColor: 'rgb(196, 127, 254, 0.3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--purple-secondary)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgb(81, 77, 223, 0.1), 0 4px 6px -2px rgb(81, 77, 223, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgb(196, 127, 254, 0.3)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0, 0, 0, 0.1), 0 1px 2px 0 rgb(0, 0, 0, 0.06)';
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--purple-secondary)' }}>
                  {profile.name}
                </h3>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    profile.status === "Active"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                  style={{
                    backgroundColor: profile.status === "Active" 
                      ? 'rgb(34, 197, 94, 0.1)' 
                      : 'rgb(239, 68, 68, 0.1)'
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      profile.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  {profile.status}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <Mail className="w-4 h-4" style={{ color: 'var(--purple-accent)' }} />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <User className="w-4 h-4" style={{ color: 'var(--purple-accent)' }} />
                <span>{profile.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <Building className="w-4 h-4" style={{ color: 'var(--purple-accent)' }} />
                <span>{profile.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                <MapPin className="w-4 h-4" style={{ color: 'var(--purple-accent)' }} />
                <span>{profile.location}</span>
              </div>
            </div>

            {profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {profile.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-md"
                    style={{
                      backgroundColor: 'rgb(196, 127, 254, 0.2)',
                      color: 'var(--purple-secondary)'
                    }}
                  >
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
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
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
                Sub-profiles
              </button>
              <button
                onClick={() => onProfileSelect(profile)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--purple-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--purple-secondary)';
                }}
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
          <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--purple-accent)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--purple-secondary)' }}>
            No profiles found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first profile to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default YourProfiles;
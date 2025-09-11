import React, { useState } from "react";
import { Building, Edit, Eye, Mail, MapPin, Search, User, RefreshCcw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Profile type for demo
interface Profile {
  id: string;
  name: string;
  email: string;
  contact: string;
  industry: string;
  location: string;
  status: "Active" | "Inactive";
  tags: string[];
  created: string;
}

interface YourProfilesProps {
  profiles: Profile[];
  onProfileSelect: (profile: Profile) => void;
  onViewSubProfiles: (profile: Profile) => void;
  onRefresh: () => void;
}

// Mock data for demonstration
const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    contact: "+1 234 567 8900",
    industry: "Technology",
    location: "San Francisco, CA",
    status: "Active",
    tags: ["Frontend", "React", "TypeScript"],
    created: "2024-01-15"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    contact: "+1 234 567 8901",
    industry: "Marketing",
    location: "New York, NY",
    status: "Inactive",
    tags: ["Digital Marketing", "SEO", "Content Strategy", "Social Media"],
    created: "2024-02-20"
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    contact: "+1 234 567 8902",
    industry: "Finance",
    location: "Chicago, IL",
    status: "Active",
    tags: ["Investment", "Analysis"],
    created: "2024-03-10"
  }
];

const YourProfiles: React.FC<YourProfilesProps> = ({
  profiles = mockProfiles,
  onProfileSelect = () => {},
  onViewSubProfiles = () => {},
  onRefresh = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || profile.status.toLowerCase() === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === "Active" 
      ? "bg-green-100 text-green-800 hover:bg-green-200" 
      : "bg-red-100 text-red-800 hover:bg-red-200";
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return profiles.length;
    return profiles.filter((p) => p.status.toLowerCase() === status).length;
  };

  return (
    <div className="min-h-screen rounded-2xl p-4 sm:p-6 lg:p-8  bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200">
              <User className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your Profiles
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Select a profile to view details or manage sub-profiles
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterStatus} onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}>
                  <SelectTrigger className="w-full sm:w-[140px] border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({getStatusCount("all")})</SelectItem>
                    <SelectItem value="active">Active ({getStatusCount("active")})</SelectItem>
                    <SelectItem value="inactive">Inactive ({getStatusCount("inactive")})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 w-full sm:w-auto"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
                        {profile.name}
                      </h3>
                      <Badge className={getStatusColor(profile.status)} variant="secondary">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          profile.status === "Active" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 group">
                      <Mail className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <User className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{profile.contact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{profile.industry}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {profile.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Created: {new Date(profile.created).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubProfiles(profile)}
                      className="flex items-center gap-2 flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Eye className="w-4 h-4" />
                      Sub-profiles
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onProfileSelect(profile)}
                      className="flex items-center gap-2 flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Edit className="w-4 h-4" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                No profiles found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for"
                  : "Create your first profile to get started on your journey"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default YourProfiles;
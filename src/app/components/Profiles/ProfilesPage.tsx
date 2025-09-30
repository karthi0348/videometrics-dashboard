"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Plus, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Profile } from "@/app/types/profiles";
import YourProfiles from "@/app/components/Profiles/YourProfiles";
import ProfileDetails from "@/app/components/Profiles/ProfileDetails";
import SubProfiles from "@/app/components/Profiles/Subprofile/SubProfiles";
import CreateProfile from "@/app/components/Profiles/CreateProfile";
import ProfileService from "../../../helpers/service/profile/profile-api-service";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this profile and all its
              sub-profiles?
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProfilesPage: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<
    "list" | "details" | "subprofiles" | "create"
  >("list");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize service
  const profileService = new ProfileService();

  const transformApiResponseToProfile = (apiData: any): Profile => {
    const profileId = apiData.id || apiData.uuid || 0;

    return {
      id: Number(profileId),
      name: apiData.profile_name || "",
      email: apiData.contact_email || "",
      tag:
        Array.isArray(apiData.tags) && apiData.tags.length > 0
          ? apiData.tags[0]
          : "default",
      contact: apiData.contact_person || "",
      description: apiData.description || "",
      location: apiData.location || "",
      industry: apiData.industry_sector || "",
      businessType: apiData.business_type || "",
      contactEmail: apiData.contact_email || "",
      contactPerson: apiData.contact_person || "",
      phoneNumber: apiData.phone_number || "",
      tags: Array.isArray(apiData.tags) ? apiData.tags : [],
      status: apiData.is_active ? "Active" : "Inactive",
      created: apiData.created_at || new Date().toISOString(),
      lastUpdated: apiData.updated_at || new Date().toISOString(),
    };
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileService.getAllProfiles("");

      let data = response;
      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        "status" in response
      ) {
        data = response.data;
      }

      const profilesArray = Array.isArray(data)
        ? data
        : data.profiles || [data];

      const transformedProfiles: Profile[] = profilesArray.map(
        transformApiResponseToProfile
      );

      setProfiles(transformedProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      console.error("Error loading profiles:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveView("details");
  };

  const handleViewChange = (
    view: "list" | "details" | "subprofiles" | "create"
  ) => {
    setActiveView(view);
  };

  const handleCreateProfile = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        profile_name: formData.profile_name,
        description: formData.description,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        location: formData.location,
        industry_sector: formData.industry_sector,
        business_type: formData.business_type,
        contact_person: formData.contact_person,
        contact_email: formData.contact_email,
        phone_number: formData.phone_number,
      };


      const response = await profileService.createProfile(payload);


      let data = response;

      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        "status" in response
      ) {
        data = response.data;

      }

      if (!data || typeof data !== "object") {
        console.error(
          "Invalid API response structure. Full response:",
          response
        );
        throw new Error(
          `Invalid server response. Expected object, got ${typeof data}`
        );
      }

      const profileId = data.id || data.uuid;
      if (!profileId) {
        console.error(
          "Missing ID in response. Available fields:",
          Object.keys(data)
        );
        console.error("Full data object:", JSON.stringify(data, null, 2));
        throw new Error(
          `Server response missing profile ID. Available fields: ${Object.keys(
            data
          ).join(", ")}`
        );
      }


      const createdProfile: Profile = transformApiResponseToProfile(data);


      setProfiles((prev) => [createdProfile, ...prev]);
      setActiveView("list");
      setError(null);
      toast.success("Profile created successfully 🎉");

    } catch (err) {
      console.error("Profile creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    try {
      setLoading(true);
      setError(null);

      if (!updatedProfile.id || isNaN(Number(updatedProfile.id))) {
        throw new Error(
          "Invalid profile ID. Cannot update profile without a valid server ID."
        );
      }

      const payload = {
        profile_name: updatedProfile.name,
        description: updatedProfile.description,
        tags: Array.isArray(updatedProfile.tags) ? updatedProfile.tags : [],
        location: updatedProfile.location,
        industry_sector: updatedProfile.industry,
        business_type: updatedProfile.businessType,
        contact_person: updatedProfile.contactPerson,
        contact_email: updatedProfile.contactEmail,
        phone_number: updatedProfile.phoneNumber,
        is_active: updatedProfile.status === "Active",
      };

    

      const data = await profileService.updateProfile(
        updatedProfile.id,
        payload
      );


      const updated: Profile = data
        ? transformApiResponseToProfile(data)
        : {
            ...updatedProfile,
            lastUpdated: new Date().toISOString(),
          };

      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      setSelectedProfile(updated);
      setError(null);
      toast.info("Profile updated successfully ✅");

    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    setProfileToDelete(profileId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!profileToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      await profileService.deleteProfile(profileToDelete);

      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete));

      if (selectedProfile?.id === profileToDelete) {
        setSelectedProfile(null);
        setActiveView("list");
      }

      setDeleteConfirmOpen(false);
      setProfileToDelete(null);
      toast.error("Profile deleted successfully 🗑️");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setProfileToDelete(null);
  };

  return (
    <>
      <Head>
        <title>Profiles Manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div
        className="min-h-screen font-sans text-gray-900 p-4 sm:p-6 lg:p-8"
        style={{ backgroundColor: "rgb(196, 127, 254, 0.05)" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-mono text-violet-600">Profiles</h1>
            <span className="text-sm font-medium text-violet-500">
              Manage your profiles and sub-profiles
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {activeView !== "create" && (
              <Button
                className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => handleViewChange("create")}
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            )}
            {activeView !== "list" && (
              <Button
                variant="outline"
                onClick={() => handleViewChange("list")}
                className="flex-1 sm:flex-none border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
            )}
          </div>
        </div>

        {success && (
          <div
            className="mb-6 border px-4 py-3 rounded-lg"
            style={{
              backgroundColor: "rgb(34, 197, 94, 0.05)", 
              borderColor: "rgb(34, 197, 94, 0.2)", 
              color: "rgb(22, 101, 52)", 
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Success:</span>
              <span>{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="mt-3 text-sm underline hover:no-underline transition-colors"
              style={{ color: "rgb(22, 101, 52)" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 border px-4 py-3 rounded-lg"
            style={{
              backgroundColor: "rgb(239, 68, 68, 0.05)",
              borderColor: "rgb(239, 68, 68, 0.2)",
              color: "rgb(153, 27, 27)",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "rgb(239, 68, 68)" }}
              />
              <div className="flex-1">
                <span className="font-medium">Error:</span>
                <span className="ml-1">{error}</span>
                {error.includes("403") && (
                  <div className="mt-2 text-sm">
                    <p>This could be due to:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Missing authentication token</li>
                      <li>Insufficient permissions</li>
                      <li>API key not configured</li>
                      <li>CORS policy restrictions</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      Check your API configuration and authentication setup.
                    </p>
                  </div>
                )}
                {error.includes("404") && (
                  <div className="mt-2 text-sm">
                    <p>The profile could not be found on the server.</p>
                    <p className="mt-1">This might happen if:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>The profile was deleted</li>
                      <li>The profile ID is invalid</li>
                      <li>There was an issue during profile creation</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-3 text-sm underline hover:no-underline transition-colors"
              style={{ color: "rgb(239, 68, 68)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgb(185, 28, 28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgb(239, 68, 68)";
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div
          style={{
            boxShadow:
              "0 25px 50px -12px rgb(81, 77, 223, 0.1), 0 10px 25px -5px rgb(81, 77, 223, 0.05)",
            borderColor: "rgb(196, 127, 254, 0.2)",
          }}
        >
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-3">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: "var(--purple-secondary)" }}
                />
                <span
                  className="text-lg font-medium"
                  style={{ color: "var(--purple-secondary)" }}
                >
                  Loading...
                </span>
              </div>
            </div>
          )}

          {activeView === "list" && (
            <YourProfiles
              profiles={profiles}
              onProfileSelect={handleProfileSelect}
              onViewSubProfiles={(profile) => {
                setSelectedProfile(profile);
                handleViewChange("subprofiles");
              }}
              onRefresh={loadProfiles}
            />
          )}

          {activeView === "details" && selectedProfile && (
            <ProfileDetails
              profile={selectedProfile}
              onEdit={handleUpdateProfile}
              onDelete={handleDeleteProfile}
              onViewSubProfiles={() => handleViewChange("subprofiles")}
            />
          )}

          {activeView === "subprofiles" && selectedProfile && (
            <SubProfiles
              profile={selectedProfile}
              onBackToDetails={() => handleViewChange("details")}
            />
          )}

          {activeView === "create" && (
            <CreateProfile
              onCreateProfile={handleCreateProfile}
              onCancel={() => handleViewChange("list")}
              isLoading={loading}
              error={error}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteConfirmOpen}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
};

export default ProfilesPage;

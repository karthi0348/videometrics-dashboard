import React, { useState, useEffect } from "react";
import { Video } from "../ProcessVideo/types/types";
import DashboardApiService from "@/helpers/service/dashboard/DashboardApiService";
import ProcessVideoApiService from "@/helpers/service/processvideo/ProcessVideoApiservice";
import VideoMetricsModal from "../ProcessedVideos/modal/VideoMetricsModal";
import VideoThumbnail from "./VideoThumbnail";

interface DashboardPageProps {
  videos?: Video[];
  onNavigate?: (page: string) => void;
}

interface DashboardStats {
  total_profiles: number;
  total_templates: number;
  total_analytics: number;
  processing_analytics: number;
  completed_analytics: number;
  failed_analytics: number;
  recent_activity: Array<{
    id: number;
    analytics_id?: string;
    status: string;
    created_at: string;
    processing_completed_at: string;
  }>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  videos = [],
  onNavigate,
}) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for metrics - same as ProcessedVideosPage
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(
    null
  );
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  const dashboardApiService = new DashboardApiService();
  const processVideoApiService = new ProcessVideoApiService(); // Add this for the modal

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dashboardApiService.getDashboardStats();
        
        // Transform the API response to match our interface
        const transformedData: DashboardStats = {
          total_profiles: data.total_profiles || 0,
          total_templates: data.total_templates || 0,
          total_analytics: data.total_analytics || 0,
          processing_analytics: data.processing_analytics || 0,
          completed_analytics: data.completed_analytics || 0,
          failed_analytics: data.failed_analytics || 0,
          recent_activity: data.recent_activity || [],
        };
        
        setDashboardStats(transformedData);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
        // Set empty state on error
        setDashboardStats({
          total_profiles: 0,
          total_sub_profiles: 0,
          total_templates: 0,
          total_analytics: 0,
          processing_analytics: 0,
          completed_analytics: 0,
          failed_analytics: 0,
          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [videos.length]);

  // Modal handlers - same as ProcessedVideosPage
  const handleViewMetrics = (analyticsId: string) => {
    setSelectedAnalyticsId(analyticsId);
    setIsMetricsModalOpen(true);
  };

  const handleCloseMetricsModal = () => {
    setIsMetricsModalOpen(false);
    setSelectedAnalyticsId(null);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = dashboardStats || {
    total_profiles: 0,
    total_sub_profiles: 0,
    total_templates: 0,
    total_analytics: 0,
    processing_analytics: 0,
    completed_analytics: 0,
    failed_analytics: 0,
    recent_activity: [],
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        {/* <p className="text-gray-600">
          Welcome Gantann! Here is an overview of your video analytics.
        </p> */}
        {error && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
            {error} - Showing cached data
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Videos Uploaded
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_analytics}
              </p>
              <p className="text-sm text-gray-500">
                Total videos uploaded to your account
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Videos Processed
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completed_analytics}
              </p>
              <p className="text-sm text-gray-500">
                Successfully processed videos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Videos Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-purple-500 rounded mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">Recent Videos</h2>
          </div>
          <button
            onClick={() => onNavigate?.("videos")}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.recent_activity.length > 0 ? (
            stats.recent_activity
              .slice(0, 3)
              .map((activity) => (
                <VideoThumbnail
                  key={activity.id}
                  activity={activity}
                  onClick={(video) => console.log("Video clicked:", video)}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No recent videos found
            </div>
          )}
        </div>
      </div>

      {/* Recent Processed Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-purple-500 rounded mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">
              Recent Processed Videos
            </h2>
          </div>
          <button
            onClick={() => onNavigate?.("processed")}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            See All
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_activity.length > 0 ? (
                  stats.recent_activity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Video {activity.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            activity.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : activity.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.processing_completed_at
                          ? formatDate(activity.processing_completed_at)
                          : "Processing"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {activity.status === "completed" ? (
                          <button
                            onClick={() =>
                              handleViewMetrics(
                                activity.analytics_id || activity.id.toString()
                              )
                            }
                            className="text-purple-600 hover:text-purple-700 font-medium border border-purple-300 hover:border-purple-400 px-3 py-1 rounded"
                          >
                            View Metrics
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {activity.status === "processing"
                              ? "Processing..."
                              : "Failed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No processed videos found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Video Metrics Modal with fixed transparency */}
      {isMetricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
          {/* Solid dark overlay */}
          <div
            className="fixed inset-1 bg-white bg-opacity-75"
            onClick={handleCloseMetricsModal}
          ></div>

          {/* Modal container with solid background */}
          <div className="relative z-50 w-full max-w-6xl mx-4 my-8 max-h-screen">
            <div className="bg-white opacity-100 rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              <VideoMetricsModal
                isOpen={true}
                onClose={handleCloseMetricsModal}
                analyticsId={selectedAnalyticsId}
                apiService={processVideoApiService}
                mockMode={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
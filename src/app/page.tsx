"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Videos from "./components/Videos/Videos";
import ProfilesPage from "./components/Profiles/ProfilesPage";
import TemplatesPage from "./components/Templates/TemplatesPage";
import ProcessVideoPage from "./components/ProcessVideo/ProcessVideoPage";
import ProcessedVideosPage from "./components/ProcessedVideos/ProcessedVideosPage";
import VideoMetricsPage from "./components/ProcessedVideos/pages/VideoMetricsPage";
import SettingsPage from "./components/Settings/SettingsPage";
import HelpPage from "./components/Help/HelpPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import { Video, ViewMode } from "./types";

interface HomeProps {
  propVideos?: Video[];
}

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(
    null
  );
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>(""); // Add this state

  const handleNavigation = (
    pageKey: string,
    analyticsId?: string,
    videoTitle?: string
  ) => {
    console.log("Navigation called:", pageKey, analyticsId, videoTitle);
    setActivePage(pageKey);

    if (pageKey === "videoMetrics" && analyticsId) {
      console.log("Setting analyticsId:", analyticsId);
      console.log("Setting videoTitle:", videoTitle);
      setSelectedAnalyticsId(analyticsId);
      setSelectedVideoTitle(videoTitle || ""); // Store the video title
    } else {
      setSelectedAnalyticsId(null);
      setSelectedVideoTitle(""); // Clear video title when navigating away
    }

    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const renderMainContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage videos={videos} onNavigate={handleNavigation} />;
      case "videos":
        return <Videos videos={videos} />;
      case "processed":
        return <ProcessedVideosPage onNavigate={handleNavigation} />;
      case "videoMetrics":
        // Render the VideoMetricsPage with the selected ID and the navigation handler
        if (!selectedAnalyticsId) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div className="text-center">
                    <div className="text-red-500 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      No Video Selected
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Please select a video from the processed videos page to
                      view its metrics.
                    </p>
                    <button
                      onClick={() => handleNavigation("processed")}
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Go to Processed Videos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <VideoMetricsPage
            analyticsId={selectedAnalyticsId}
            videoTitle={selectedVideoTitle} 
            onNavigate={handleNavigation}
            apiService={null}
            mockMode={false}
          />
        );
      case "process":
        return <ProcessVideoPage videos={videos} />;
      case "templates":
        return <TemplatesPage />;
      case "profiles":
        return <ProfilesPage />;
      case "settings":
        return <SettingsPage />;
      case "help":
        return <HelpPage onNavigate={handleNavigation} />;
      default:
        return <DashboardPage videos={videos} onNavigate={handleNavigation} />;
    }
  };

  const renderContentWithLayout = () => {
    if (
      [
        "templates",
        "profiles",
        "videos",
        "settings",
        "help",
        "dashboard",
        "videoMetrics",
      ].includes(activePage)
    ) {
      return renderMainContent();
    }
    return <div className="max-w-7xl mx-auto">{renderMainContent()}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile backdrop for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar onNavigate={handleNavigation} activePage={activePage} />
        </div>

        {/* Desktop Main Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-auto">
            {renderContentWithLayout()}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Mobile Sidebar */}
        <Sidebar onNavigate={handleNavigation} activePage={activePage} />

        {/* Mobile Header */}
        {activePage === "videos" && (
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <Videos
              videoCount={videos.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        )}

        {/* Mobile Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 min-h-0">
          <div className="h-full">
            {[
              "profiles",
              "videos",
              "templates",
              "settings",
              "help",
              "dashboard",
              "videoMetrics",
            ].includes(activePage) ? (
              <div className="h-full">{renderMainContent()}</div>
            ) : (
              <div className="p-3 h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
                  {renderMainContent()}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import VideoTable from './components/Videos/VideoTable';
import Header from './components/Videos/Videos';
import ProfilesPage from './components/Profiles/ProfilesPage';
import TemplatesPage from './components/Templates/TemplatesPage';
import ProcessVideoPage from './components/ProcessVideo/ProcessVideoPage';
import ProcessedVideosPage from './components/ProcessedVideos/ProcessedVideosPage';
import SettingsPage from './components/Settings/SettingsPage'; 
import HelpPage from './components/Help/HelpPage'; // Import the new HelpPage component
import { Video, ViewMode } from './types';

// Placeholder components for other pages
const DashboardPage = () => (
  <div className="p-4 sm:p-6">
    <div className="text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600">Welcome to your video analytics dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Total Videos</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Processed</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">18</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 sm:p-6 rounded-xl border border-purple-200 sm:col-span-2 lg:col-span-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">12k</p>
        </div>
      </div>
    </div>
  </div>
);

interface HomeProps {
  propVideos?: Video[];
}

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<string>('videos');

  // Handle navigation from sidebar
  const handleNavigation = (pageKey: string) => {
    setActivePage(pageKey);
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
      case 'dashboard':
        return <DashboardPage />;
      case 'processed':
        return <ProcessedVideosPage />;
      case 'process':
        return <ProcessVideoPage videos={videos} />;
      case 'templates':
        return <TemplatesPage />;
      case 'profiles':
        return <ProfilesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage onNavigate={handleNavigation} />;
      default:
        return (
          <div className="bg-white border-b border-gray-200">
            <VideoTable videos={videos} viewMode={viewMode} />
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'videos':
        return 'Videos';
      case 'processed':
        return 'Processed Videos';
      case 'process':
        return 'Process Video';
      case 'templates':
        return 'Templates';
      case 'profiles':
        return 'Profiles';
      case 'settings':
        return 'Settings';
      case 'help':
        return 'Help';
      default:
        return 'Videos';
    }
  };

  const renderHeader = () => {
    if (activePage === 'videos') {
      return (
        <div className="bg-white border-b border-gray-200">
          <Header 
            videoCount={videos.length}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      );
    }
    return null;
  };

  // Special handling for pages that need full-width layout
  const renderContentWithLayout = () => {
    if (['templates', 'profiles', 'videos', 'settings', 'help'].includes(activePage)) {
      return renderMainContent();
    }

    return (
      <div className="max-w-7xl mx-auto">
        {renderMainContent()}
      </div>
    );
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
          {/* Desktop Header */}
          {renderHeader()}
          
          {/* Desktop Main Content */}
          <main className="flex-1 overflow-auto">
            {['templates', 'profiles', 'videos', 'settings', 'help'].includes(activePage) ? (
              renderContentWithLayout()
            ) : (
              <div className="px-6 py-8">
                {renderContentWithLayout()}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Mobile Sidebar */}
        <Sidebar onNavigate={handleNavigation} activePage={activePage} />
        
        {/* Mobile Header */}
        {activePage === 'videos' && (
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <Header 
              videoCount={videos.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        )}
        
        {/* Mobile Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 min-h-0">
          <div className="h-full">
            {['profiles', 'videos', 'templates', 'settings', 'help'].includes(activePage) ? (
              <div className="h-full">
                {renderMainContent()}
              </div>
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
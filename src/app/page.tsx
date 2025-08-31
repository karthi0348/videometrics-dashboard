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
import HelpPage from './components/Help/HelpPage';
import DashboardPage from './components/Dashboard/DashboardPage'; // Import the new DashboardPage
import { Video, ViewMode } from './types';

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
        return <DashboardPage videos={videos} onNavigate={handleNavigation} />;
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
    if (['templates', 'profiles', 'videos', 'settings', 'help', 'dashboard'].includes(activePage)) {
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
            {['templates', 'profiles', 'videos', 'settings', 'help', 'dashboard'].includes(activePage) ? (
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
            {['profiles', 'videos', 'templates', 'settings', 'help', 'dashboard'].includes(activePage) ? (
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
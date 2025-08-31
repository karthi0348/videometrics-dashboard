import React from 'react';
import { Video } from '../ProcessVideo/types/types';

interface DashboardPageProps {
  videos?: Video[];
  onNavigate?: (page: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ videos = [], onNavigate }) => {
  // Mock data for demonstration - replace with real data
  const mockRecentVideos = [
    {
      id: '1',
      name: 'new vdo',
      uploadDate: '29/2025, 12:40:31 PM',
      thumbnail: null
    },
    {
      id: '2', 
      name: 'test1',
      uploadDate: '8/19/2025, 12:08:37 PM',
      thumbnail: null
    },
    {
      id: '3',
      name: 'test2', 
      uploadDate: '1/1/2025, 8:01:01 PM',
      thumbnail: null
    }
  ];

  const mockProcessedVideos = [
    {
      id: '28',
      name: '28',
      status: 'completed',
      processedAt: 'Processing'
    },
    {
      id: '27',
      name: '27', 
      status: 'completed',
      processedAt: 'Processing'
    },
    {
      id: 'new-vdo',
      name: 'new vdo',
      status: 'completed', 
      processedAt: 'Processing'
    }
  ];

  const totalVideos = videos.length || 3;
  const processedVideos = mockProcessedVideos.length;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome Gantann! Here's an overview of your video analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Videos Uploaded</h3>
              <p className="text-3xl font-bold text-gray-900">{totalVideos}</p>
              <p className="text-sm text-gray-500">Total videos uploaded to your account</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Videos Processed</h3>
              <p className="text-3xl font-bold text-gray-900">{processedVideos}</p>
              <p className="text-sm text-gray-500">Successfully processed videos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Videos Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-teal-500 rounded mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">Recent Videos</h2>
          </div>
          <button 
            onClick={() => onNavigate?.('videos')}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            See All
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRecentVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <button className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-4 py-2 transition-all">
                  <svg className="w-5 h-5 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="text-white font-medium">Play</span>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{video.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Uploaded: {video.uploadDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Processed Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-teal-500 rounded mr-3"></div>
            <h2 className="text-xl font-bold text-gray-900">Recent Processed Videos</h2>
          </div>
          <button 
            onClick={() => onNavigate?.('processed')}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
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
                {mockProcessedVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {video.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {video.processedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-teal-600 hover:text-teal-700 font-medium border border-teal-300 hover:border-teal-400 px-3 py-1 rounded">
                        View Metrics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
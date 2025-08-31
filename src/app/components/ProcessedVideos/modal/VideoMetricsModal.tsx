import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface VideoMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsId: string | null;
  apiService: any;
  mockMode: boolean;
}

interface VideoAnalytics {
  id: string;
  video_name: string;
  analytics_type: string;
  processed_date: string;
  created_date: string;
  status: string;
  confidence_score?: number;
  processing_duration?: string;
  file_size?: string;
  video_duration?: string;
  summary?: string;
  metrics?: any;
}

const VideoMetricsModal: React.FC<VideoMetricsModalProps> = ({
  isOpen,
  onClose,
  analyticsId,
  apiService,
  mockMode
}) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [activeView, setActiveView] = useState<'charts' | 'raw'>('charts');
  const [error, setError] = useState<string>('');

  // Mock data for demonstration
  const mockAnalytics: VideoAnalytics = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    video_name: "test template",
    analytics_type: "test template",
    processed_date: "Aug 30, 2025, 10:49 PM",
    created_date: "8/30/2025",
    status: "Completed",
    confidence_score: 75,
    processing_duration: "2m 15s",
    file_size: "45.2 MB",
    video_duration: "3:24",
    summary: "Video analysis completed successfully with high confidence score. The content analysis revealed consistent audio patterns and visual elements throughout the duration.",
    metrics: {
      engagement: [
        { time: '0:00', value: 45 },
        { time: '0:30', value: 62 },
        { time: '1:00', value: 78 },
        { time: '1:30', value: 85 },
        { time: '2:00', value: 73 },
        { time: '2:30', value: 68 },
        { time: '3:00', value: 82 },
        { time: '3:24', value: 75 }
      ],
      emotions: [
        { emotion: 'Happy', count: 45, color: '#10B981' },
        { emotion: 'Neutral', count: 30, color: '#6B7280' },
        { emotion: 'Surprised', count: 15, color: '#F59E0B' },
        { emotion: 'Sad', count: 10, color: '#EF4444' }
      ],
      performance: [
        { metric: 'Audio Quality', score: 85 },
        { metric: 'Visual Clarity', score: 78 },
        { metric: 'Content Relevance', score: 92 },
        { metric: 'Overall Score', score: 75 }
      ]
    }
  };

  useEffect(() => {
    if (isOpen && analyticsId) {
      loadAnalytics();
    }
  }, [isOpen, analyticsId]);

  const loadAnalytics = async () => {
    if (mockMode) {
      setLoading(false);
      setAnalytics(mockAnalytics);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Replace with actual API call
      const response = await apiService.getAnalyticsDetails(analyticsId);
      setAnalytics(response);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting PDF for analytics:', analyticsId);
    // Implement PDF export functionality
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  if (!isOpen) return null;

  const currentAnalytics = analytics || mockAnalytics;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{ zIndex: 99999 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 100000 }}>
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentAnalytics.video_name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">Video Analytics Report</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveView('raw')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'raw'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Raw Data
                  </button>
                  
                  <button
                    onClick={() => setActiveView('charts')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'charts'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    List View
                  </button>
                  
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 px-6 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  <span className="ml-3 text-gray-600">Loading analytics...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div className="text-red-800">{error}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Video Information Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-900">Video Information</h2>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Video Name</label>
                            <p className="mt-1 text-sm font-medium text-gray-900">{currentAnalytics.video_name}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics Type</label>
                            <div className="mt-1 flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <p className="text-sm text-gray-700">{currentAnalytics.analytics_type}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Processed Date</label>
                            <div className="mt-1 flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-700">{currentAnalytics.processed_date}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</label>
                            <div className="mt-1 flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-gray-700">{currentAnalytics.created_date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Summary Section */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-900">Analysis Summary</h2>
                        <button className="ml-2 p-1 text-gray-400 hover:text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Generated Aug 30, 2025
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Confidence Score</div>
                          <div className="text-2xl font-bold text-blue-900 mt-1">{currentAnalytics.confidence_score}%</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Processing Time</div>
                          <div className="text-2xl font-bold text-green-900 mt-1">{currentAnalytics.processing_duration}</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">File Size</div>
                          <div className="text-2xl font-bold text-purple-900 mt-1">{currentAnalytics.file_size}</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Duration</div>
                          <div className="text-2xl font-bold text-orange-900 mt-1">{currentAnalytics.video_duration}</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {currentAnalytics.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Charts Section */}
                  {activeView === 'charts' ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <h2 className="text-lg font-semibold text-gray-900">Analytics Charts</h2>
                        </div>
                        <div className="text-sm text-gray-500">
                          Showing 1 visualization
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-8">
                        {/* Engagement Over Time Chart */}
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-4">Engagement Over Time</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={mockAnalytics.metrics.engagement}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="time" 
                                  tick={{ fontSize: 12 }}
                                  stroke="#6b7280"
                                />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  stroke="#6b7280"
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#059669" 
                                  strokeWidth={3}
                                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Performance Metrics Chart */}
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-4">Performance Metrics</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={mockAnalytics.metrics.performance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="metric" 
                                  tick={{ fontSize: 12 }}
                                  stroke="#6b7280"
                                />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  stroke="#6b7280"
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Bar 
                                  dataKey="score" 
                                  fill="#0891b2"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Emotion Distribution Chart */}
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-4">Emotion Distribution</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={mockAnalytics.metrics.emotions}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="count"
                                  label={({ emotion, count }) => `${emotion}: ${count}%`}
                                >
                                  {mockAnalytics.metrics.emotions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Raw Data View */
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Raw Analytics Data</h2>
                      </div>
                      <div className="px-6 py-4">
                        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-800 overflow-auto max-h-96">
                          {JSON.stringify(currentAnalytics, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoMetricsModal;
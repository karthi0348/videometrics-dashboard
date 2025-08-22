'use client';

import React, { JSX, useState } from 'react';
import NewTemplateModal from '../Modal/Template/NewTemplateModal';

interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: 'Public' | 'Private';
  status: 'active' | 'beta';
  uses: number;
  assignedProfiles: number;
  icon: string;
  color: string;
}

interface FormData {
  templateName: string;
  description: string;
  analysisPrompt: string;
  makePublic: boolean;
}

const TemplatesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'beta'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'Public' | 'Private'>('all');
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Blueberry Health',
      description: 'Simple monitoring for blueberry tree health and fruit ripeness assessment on 10-acre farm',
      tags: ['agriculture', 'health', 'monitoring'],
      visibility: 'Public',
      status: 'active',
      uses: 0,
      assignedProfiles: 1,
      icon: 'chart-bar',
      color: 'teal'
    },
    {
      id: '2',
      name: 'Video Quality Analysis',
      description: 'Comprehensive video quality metrics including resolution, bitrate, and compression analysis',
      tags: ['quality', 'video', 'metrics'],
      visibility: 'Public',
      status: 'active',
      uses: 12,
      assignedProfiles: 3,
      icon: 'clipboard',
      color: 'blue'
    },
    {
      id: '3',
      name: 'Content Insights',
      description: 'Extract meaningful insights from video content using AI-powered analysis and pattern recognition',
      tags: ['AI', 'content', 'analysis'],
      visibility: 'Private',
      status: 'beta',
      uses: 5,
      assignedProfiles: 1,
      icon: 'server',
      color: 'purple'
    },
    {
      id: '4',
      name: 'ML Object Detection',
      description: 'Advanced machine learning model for detecting and tracking objects in video streams with high accuracy',
      tags: ['ML', 'detection', 'tracking'],
      visibility: 'Public',
      status: 'active',
      uses: 28,
      assignedProfiles: 5,
      icon: 'lightbulb',
      color: 'green'
    },
    {
      id: '5',
      name: 'Performance Monitor',
      description: 'Real-time monitoring of video processing performance with detailed metrics and alerts',
      tags: ['performance', 'monitoring', 'alerts'],
      visibility: 'Public',
      status: 'active',
      uses: 15,
      assignedProfiles: 2,
      icon: 'lightning-bolt',
      color: 'orange'
    },
    {
      id: '6',
      name: 'Security Analysis',
      description: 'Comprehensive security scanning for video content to detect threats and compliance violations',
      tags: ['security', 'scanning', 'compliance'],
      visibility: 'Private',
      status: 'active',
      uses: 3,
      assignedProfiles: 1,
      icon: 'lock-closed',
      color: 'red'
    }
  ]);

  const handleCreateTemplate = (data: FormData & { metricStructure: string }) => {
    console.log('Creating template:', data);
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: data.templateName,
      description: data.description,
      tags: [],
      visibility: data.makePublic ? 'Public' : 'Private',
      status: 'active',
      uses: 0,
      assignedProfiles: 0,
      icon: 'chart-bar',
      color: 'teal'
    };

    setTemplates(prev => [...prev, newTemplate]);
    setShowModal(false);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    const matchesVisibility = filterVisibility === 'all' || template.visibility === filterVisibility;
    
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'chart-bar': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      'clipboard': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      ),
      'server': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      ),
      'lightbulb': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      ),
      'lightning-bolt': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      'lock-closed': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      )
    };
    return icons[iconName] || icons['chart-bar'];
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; badge: string; hover: string } } = {
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700', hover: 'hover:bg-teal-50' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', hover: 'hover:bg-blue-50' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', hover: 'hover:bg-purple-50' },
      green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700', hover: 'hover:bg-green-50' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', hover: 'hover:bg-orange-50' },
      red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700', hover: 'hover:bg-red-50' }
    };
    return colorMap[color] || colorMap.teal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Templates</h1>
              <p className="text-gray-600 mt-1">Create and manage analysis templates for your video content</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Template
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'beta')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="beta">Beta</option>
            </select>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value as 'all' | 'Public' | 'Private')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <span>Total: {templates.length}</span>
            <span>Showing: {filteredTemplates.length}</span>
            <span>Active: {templates.filter(t => t.status === 'active').length}</span>
            <span>Beta: {templates.filter(t => t.status === 'beta').length}</span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterStatus !== 'all' || filterVisibility !== 'all'
                ? 'Try adjusting your filters or search criteria'
                : 'Get started by creating your first analytics template'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && filterVisibility === 'all' && (
              <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Create Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const colorClasses = getColorClasses(template.color);
              return (
                <div 
                  key={template.id}
                  className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${colorClasses.hover}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${colorClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {getIcon(template.icon)}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.visibility === 'Public' ? colorClasses.badge : 'bg-gray-100 text-gray-700'
                          }`}>
                            {template.visibility}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {template.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {template.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uses:</span>
                      <span className="text-gray-900 font-medium">{template.uses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assigned to:</span>
                      <span className="text-gray-900 font-medium">{template.assignedProfiles} profile{template.assignedProfiles !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Use Template
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      Assign
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewTemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default TemplatesPage;
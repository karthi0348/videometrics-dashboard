'use client';

import React, { JSX, useEffect, useState } from 'react';
import NewTemplateModal from '../Modal/Template/NewTemplateModal';
import TemplateApiService from '@/helpers/service/templates/template-api-service';
import ErrorHandler from '@/helpers/ErrorHandler';
import ProfileApiService from '@/helpers/service/profile/profile-api-service';
import AssignmentModal from '../Modal/Template/AssignmentModal';
import DeleteModal from '../Common/DeleteModal';
import { toast } from 'react-toastify';
import EditTemplateModal from '../Modal/Template/EditTemplateModal';
import moment from 'moment';

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
  analysisPrompt?: string;
  created?: string;
  rating?: number;
}

interface FormData {
  templateName: string;
  description: string;
  analysisPrompt: string;
  makePublic: boolean;
}

interface Profile {
  id: string;
  name: string;
}

// Template Settings Modal Component
const TemplateSettingsModal = ({
  isOpen,
  onClose,
  template
}: {
  isOpen: boolean;
  onClose: () => void;
  template: any;
}) => {
  if (!isOpen || !template) return null;

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleOpenAssignment = (template: Template) => {
    setSelectedTemplate(template);
    setShowAssignmentModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-500">Template details and configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.template_name}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={template.description}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="text-sm text-gray-500">
                  {template.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag: any, index: any) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "No tags specified"
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis Prompt
                </label>
                <textarea
                  value={template.analysisPrompt || "No analysis prompt configured"}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4 border-t border-gray-200">
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${template.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
                }`}>
                {template.status}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Visibility:</span>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${template.is_public
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-700'
                }`}>
                {template.is_public ? "Public" : "Private"}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Usage Count:</span>
              <span className="text-sm font-medium text-gray-900">{template.usage_count}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Rating:</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{template.rating || 0.0}</span>
                <div className="flex ml-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Created:</span>
              <span className="text-sm font-medium text-gray-900">
                {moment(template.created_at).format("MM/DD/YYYY, hh:mm:ss A")}
              </span>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
            <div className="text-sm text-gray-500">
              Additional configuration options would be displayed here.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Use Template
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => handleOpenAssignment(template)}>
            Assign Template
          </button>
        </div>
      </div>

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
};

const TemplatesPage: React.FC = () => {
  const templateApiService: TemplateApiService = new TemplateApiService();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditTemplateId, setSelectedEditTemplateId] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<any>('');
  const [filterVisibility, setFilterVisibility] = useState<any>('');
  const [tempId, setTempId] = useState<any>(null);
  const [showAssignments, setShowAssignments] = useState<boolean>(false);
  const [templates, setTemplates] = useState<any>([]);
  const [assesmentInfo, setAssesmentInfo] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  //delete
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenSettings = (template: Template) => {
    setSelectedTemplate(template);
    setShowSettingsModal(true);
  };

  const handleOpenAssignment = (template: Template) => {
    setSelectedTemplate(template);
    setShowAssignmentModal(true);
  };

  const toggleAssignments = async (templateId: string) => {
    try {
      if (!showAssignments) {
        let res = await templateApiService.getSubProfileAssignments(templateId);
        setAssesmentInfo(res);
        setTempId(templateId);
        setShowAssignments(true);
      } else {
        setAssesmentInfo([]);
        setTempId(null);
        setShowAssignments(false);
      }
    } catch (err: any) {
      setAssesmentInfo([]);
      return ErrorHandler(err)
    }
  };

  const handleOpenEdit = (id: any) => {
    setShowEditModal(true);
    setSelectedEditTemplateId(id)
  }

  // Delete Data
  const handleDelete = async () => {
    if (selectedId) {
      setDeleteLoading(true)
      try {
        await templateApiService.deleteTemplate(selectedId);
        toast.success("Template Deleted Successfully", {
          containerId: "TR",
        });
        await getAllTemplate();
        setDeleteModal(false);
        return;
      } catch (error: any) {
        return ErrorHandler(error);
      } finally {
        setDeleteLoading(false)
      }
    }
  };

  const deleteTemplate = (id: any) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

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

  const getAllTemplate = async () => {
    try {
      const params = new URLSearchParams();

      // if (tags) {
      //   params.append("tags", tags);
      // }
      if (searchQuery) {
        params.append("search_query", searchQuery);
      }
      if (filterStatus) {
        params.append("status_filter", filterStatus);
      }
      params.append("page", page.toString());
      params.append("page_size", pageSize.toString());
      params.append("sort_by", "created_at");
      params.append("sort_order", "dec")
      const url = `?${params.toString()}`;
      let result = await templateApiService.getAllTemplate(url);
      setTemplates(result);
    } catch (error: any) {
      setTemplates([]);
      return ErrorHandler(error);
    }
  };

  useEffect(() => {
    getAllTemplate();
  }, [searchQuery, filterStatus, page, pageSize]);

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
              <button className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                onClick={getAllTemplate}>
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
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="beta">Beta</option>
            </select>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <span>Total: {templates.length}</span>
            <span>Showing: {templates.length}</span>
            <span>Active: {templates.filter((t: any) => t.status === 'active').length}</span>
            <span>Beta: {templates.filter((t: any) => t.status === 'beta').length}</span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {templates.length === 0 ? (
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
            {templates.map((template: any) => {
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
                        <div className="flex items-center gap-2">
                          {/* Settings Icon */}
                          <button
                            onClick={() => handleOpenSettings(template)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Template Settings"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <h3 className="text-lg font-semibold text-gray-900">{template.template_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* <span className={`px-2 py-1 text-xs rounded-full ${template.is_public === 'Public' ? colorClasses.badge : 'bg-gray-100 text-gray-700'
                            }`}>
                            {template.visibility}
                          </span> */}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${template.is_public ? colorClasses.badge : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {template.is_public ? "Public" : "Private"}
                          </span>

                          <span className={`px-2 py-1 text-xs rounded-full ${template.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {template.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => handleOpenEdit(template.id)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => deleteTemplate(template.id)}>
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
                        {template.tags.slice(0, 3).map((tag: any, index: any) => (
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
                      <span className="text-gray-900 font-medium">{template.usage_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Assigned to:</span>
                      <span className="text-gray-900 font-medium">{template.assignedProfiles} profile{template.assignedProfiles !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Current Assignments Section */}
                  {tempId === template.id && showAssignments && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Assignments:</h4>
                      {assesmentInfo.length > 0 ? (
                        <div className="text-sm text-gray-600">
                          <p>Profile assignments would be displayed here</p>
                          <div className="mt-2 space-y-1">
                            {assesmentInfo.map((item: any, idx: any) => (
                              <div key={idx} className="flex items-center justify-between py-1">
                                <span className="text-gray-700">Sub-Profile Id : {item.sub_profile_id}</span>
                                <span className="text-xs text-gray-500">Priority : {item.priority}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No assignments found</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="flex-1 px-2 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium">
                      Use Template
                    </button>
                    <button
                      onClick={() => handleOpenAssignment(template)}
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => toggleAssignments(template.id)}
                      className="px-2 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium whitespace-nowrap min-w-0"
                    >
                      {tempId === template.id && showAssignments ? 'Hide assignment' : 'View assignments'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-gray-600">
          Page {page} of {Math.ceil(totalCount / pageSize) || 1}
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="ml-2 border rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>

        <button
          onClick={() =>
            setPage((prev) =>
              prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
            )
          }
          disabled={page >= Math.ceil(totalCount / pageSize)}
          className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* Modals */}
      <NewTemplateModal
        isOpen={showModal}
        refresh={getAllTemplate}
        onClose={() => setShowModal(false)}
      />

      <EditTemplateModal
        isEditOpen={showEditModal}
        refresh={getAllTemplate}
        id={selectedEditTemplateId}
        onClose={() => setShowEditModal(false)}
      />

      <TemplateSettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          getAllTemplate();
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        isLoading={deleteLoading}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default TemplatesPage;
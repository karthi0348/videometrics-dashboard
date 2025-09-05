'use client';

import React, { useState } from 'react';
import AssignmentModal from './AssignmentModal';
import moment from 'moment';
import { Template } from '@/app/components/Templates/types/templates';

// Define proper interface for template props
interface TemplateSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null; // Fixed: Replace 'any' with proper type
}

// Template Settings Modal Component
const TemplateSettingsModal: React.FC<TemplateSettingsModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  // Fixed: Move hooks before early return to follow Rules of Hooks
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Early return after hooks
  if (!isOpen || !template) return null;

  const handleOpenAssignment = (template: Template): void => {
    setSelectedTemplate(template);
    setShowAssignmentModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 gap-3 sm:gap-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {template.name || template.template_name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Template details and configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="self-start sm:self-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Template Information */}
          <div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Template Information
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.template_name || template.name || ''}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={template.description || ''}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="text-xs sm:text-sm text-gray-500">
                  {template.tags && template.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {/* Fixed: Replace 'any' with proper types */}
                      {template.tags.map((tag: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs sm:text-sm break-all"
                        >
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Analysis Prompt
                </label>
                <textarea
                  value={template.analysisPrompt || "No analysis prompt configured"}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="sm:col-span-1">
                <span className="block text-xs font-medium text-gray-500 mb-1">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${template.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {template.status}
                </span>
              </div>
              
              <div className="sm:col-span-1">
                <span className="block text-xs font-medium text-gray-500 mb-1">Visibility:</span>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${template.is_public
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}>
                  {template.is_public ? "Public" : "Private"}
                </span>
              </div>
              
              <div className="sm:col-span-1">
                <span className="block text-xs font-medium text-gray-500 mb-1">Usage Count:</span>
                <span className="text-sm font-medium text-gray-900">{template.usage_count || 0}</span>
              </div>
              
              <div className="sm:col-span-1">
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
              
              <div className="sm:col-span-2 lg:col-span-1">
                <span className="block text-xs font-medium text-gray-500 mb-1">Created:</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                  {template.created_at ? moment(template.created_at).format("MM/DD/YYYY, hh:mm:ss A") : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Advanced Settings
            </h2>
            <div className="text-xs sm:text-sm text-gray-500">
              Additional configuration options would be displayed here.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors order-3 sm:order-1"
          >
            Close
          </button>
          <button 
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-purple-400 text-white rounded-lg hover:bg-purple-700 transition-colors order-1 sm:order-2"
          >
            Use Template
          </button>
          <button 
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-400 text-white rounded-lg hover:bg-blue-800 transition-colors order-2 sm:order-3"
            onClick={() => handleOpenAssignment(template)}
          >
            Assign Template
          </button>
        </div>
      </div>

      {/* Fixed: Only render AssignmentModal when selectedTemplate is not null */}
      {showAssignmentModal && selectedTemplate && (
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default TemplateSettingsModal;
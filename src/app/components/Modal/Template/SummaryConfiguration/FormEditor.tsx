import React from 'react';
import { SummaryConfig } from '../../../../types/summary';
import { isValidJson } from '../../../../utils/summary';

interface FormEditorProps {
  jsonContent: string;
  onJsonChange: (jsonString: string) => void;
  onResetConfig: () => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ jsonContent, onJsonChange, onResetConfig }) => {
  const config = isValidJson(jsonContent) ? JSON.parse(jsonContent) : {};

  const updateConfig = (newConfig: any) => {
    onJsonChange(JSON.stringify(newConfig, null, 2));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Interactive Form Editor
          </h4>
          <div className="flex items-center gap-2">
            <button 
              onClick={onResetConfig}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Edit your data using form fields with automatic type detection and validation.</p>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{ }</span>
            <span className="text-sm font-medium">Object</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary Type Field */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-green-600 font-mono">summary_type</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">String</span>
                <button className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.summary_type || ''}
              onChange={(e) => updateConfig({...config, summary_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="executive"
            />
          </div>

          {/* Sections Array Field */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span className="text-sm text-orange-600 font-mono">sections</span>
                <span className="text-sm text-gray-500">array</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Array</span>
                <button className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="ml-6 space-y-3">
              {(config.sections || []).map((section: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-mono">Item {index}</span>
                  <span className="text-sm text-gray-500">string</span>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => {
                      const newSections = [...(config.sections || [])];
                      newSections[index] = e.target.value;
                      updateConfig({...config, sections: newSections});
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={() => {
                      const newSections = (config.sections || []).filter((_: any, i: number) => i !== index);
                      updateConfig({...config, sections: newSections});
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newSections = [...(config.sections || []), ''];
                  updateConfig({...config, sections: newSections});
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {/* Format Field */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-green-600 font-mono">format</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">String</span>
                <button className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={config.format || ''}
              onChange={(e) => updateConfig({...config, format: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="markdown"
            />
          </div>

          {/* Include Recommendations Field */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-green-600 font-mono">include_recommendations</label>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Boolean</span>
                <button className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <select
              value={String(config.include_recommendations || false)}
              onChange={(e) => updateConfig({...config, include_recommendations: e.target.value === 'true'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
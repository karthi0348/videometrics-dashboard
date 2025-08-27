import React, { useState } from 'react';
import { SummaryConfig } from '../../../../types/summary';
import { isValidJson, getJsonError, formatJson, minifyJson } from '../../../../utils/summary';

interface JsonEditorProps {
  jsonContent: string;
  onJsonChange: (jsonString: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ jsonContent, onJsonChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleFormatJsonClick = () => {
    const formattedJson = formatJson(jsonContent);
    onJsonChange(formattedJson);
  };

  const handleMinifyJsonClick = () => {
    const minifiedJson = minifyJson(jsonContent);
    onJsonChange(minifiedJson);
  };

  const clearPreview = () => {
    setShowPreview(false);
  };

  return (
    <div>
      {/* JSON Editor Specific Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={handleFormatJsonClick}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Format
        </button>
        <button
          type="button"
          onClick={handleMinifyJsonClick}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Minify
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          {showPreview ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.121 14.121L15.536 15.536M14.121 14.121L12.707 12.707M14.121 14.121l-1.414-1.414" />
              </svg>
              Hide
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </>
          )}
        </button>
        {showPreview && (
          <button
            type="button"
            onClick={clearPreview}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* JSON Text Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">JSON Text Editor</h4>
          <div className="text-sm text-gray-500">
            {jsonContent.length} characters
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden rounded-l">
            {jsonContent.split('\n').map((_, index) => (
              <div key={index} className="px-2 leading-6 text-right min-h-[24px]">
                {index + 1}
              </div>
            ))}
          </div>
          <textarea
            value={jsonContent}
            onChange={(e) => onJsonChange(e.target.value)}
            className={`w-full h-64 pl-14 pr-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white resize-none ${
              isValidJson(jsonContent) 
                ? 'border-gray-300 focus:border-orange-500' 
                : 'border-red-300 focus:border-red-500 focus:ring-red-500'
            }`}
            placeholder="Enter summary configuration JSON..."
            spellCheck={false}
          />
        </div>

        {/* JSON Status */}
        <div className="flex justify-between items-center mt-3 text-sm">
          <div>
            {!isValidJson(jsonContent) && (
              <span className="text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getJsonError(jsonContent)}
              </span>
            )}
            {isValidJson(jsonContent) && (
              <span className="text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Valid JSON configuration
              </span>
            )}
          </div>
          <div className="text-gray-500">
            Data Type: <strong>Object</strong>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            {isValidJson(jsonContent) ? (
              <pre className="text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(JSON.parse(jsonContent), null, 2)}
              </pre>
            ) : (
              <div className="text-red-500">Invalid JSON</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonEditor;
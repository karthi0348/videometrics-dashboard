import React, { useState } from 'react';

interface JsonEditorProps {
  jsonContent: string;
  onJsonChange: (jsonString: string) => void;
  onCopy: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onReset: () => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  jsonContent,
  onJsonChange,
  onCopy,
  onDownload,
  onUpload,
  onReset
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const isValidJson = () => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch {
      return false;
    }
  };

  const getJsonError = () => {
    try {
      JSON.parse(jsonContent);
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Unknown JSON parsing error';
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      onJsonChange(JSON.stringify(parsed, null, 2));
    } catch {
      console.error('Invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      onJsonChange(JSON.stringify(parsed));
    } catch {
      console.error('Invalid JSON');
    }
  };

  const clearPreview = () => {
    setShowPreview(false);
  };

  const actionButtons = [
    {
      onClick: onCopy,
      title: "Copy JSON",
      label: "Copy",
      icon: (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      className: "bg-white border border-gray-300 hover:bg-gray-50"
    },
    {
      onClick: onDownload,
      title: "Download JSON",
      label: "Download",
      icon: (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      className: "bg-white border border-gray-300 hover:bg-gray-50"
    },
    {
      onClick: onUpload,
      title: "Upload JSON",
      label: "Upload",
      icon: (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      className: "bg-white border border-gray-300 hover:bg-gray-50"
    },
    {
      onClick: onReset,
      title: "Reset Configuration",
      label: "Reset",
      icon: (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      className: "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
    },
    {
      onClick: formatJson,
      title: "Format JSON",
      label: "Format",
      icon: (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      className: "bg-white border border-gray-300 hover:bg-gray-50"
    },
    {
      onClick: minifyJson,
      title: "Minify JSON",
      label: "Minify",
      icon: null,
      className: "bg-white border border-gray-300 hover:bg-gray-50"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Primary Actions Row */}
        <div className="flex flex-wrap gap-2">
          {actionButtons.slice(0, 4).map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.onClick}
              className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${button.className}`}
              title={button.title}
            >
              {button.icon}
              <span className="hidden xs:inline sm:inline">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Actions Row */}
        <div className="flex flex-wrap gap-2">
          {actionButtons.slice(4).map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.onClick}
              className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${button.className}`}
              title={button.title}
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
          
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            {showPreview ? (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.121 14.121L15.536 15.536M14.121 14.121L12.707 12.707M14.121 14.121l-1.414-1.414" />
                </svg>
                <span className="hidden sm:inline">Hide</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </>
            )}
          </button>

          {/* Clear Preview Button */}
          {showPreview && (
            <button
              type="button"
              onClick={clearPreview}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
              title="Clear Preview"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* JSON Text Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <h4 className="text-sm sm:text-base font-medium text-gray-700">JSON Text Editor</h4>
          <div className="text-xs sm:text-sm text-gray-500">
            {jsonContent.length} characters
          </div>
        </div>

        {/* Editor Container */}
        <div className="relative overflow-hidden rounded-lg border border-gray-300">
          {/* Line Numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden z-10">
            {jsonContent.split('\n').map((_, index) => (
              <div key={index} className="px-1 sm:px-2 leading-5 sm:leading-6 text-right min-h-[20px] sm:min-h-[24px] text-xs">
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Text Area */}
          <textarea
            value={jsonContent}
            onChange={(e) => onJsonChange(e.target.value)}
            className={`w-full h-48 sm:h-64 lg:h-80 pl-10 sm:pl-14 pr-2 sm:pr-4 py-2 sm:py-3 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white resize-none border-0 ${
              isValidJson()
                ? 'focus:ring-orange-500'
                : 'focus:ring-red-500'
            }`}
            placeholder="Enter summary configuration JSON..."
            spellCheck={false}
          />
        </div>

        {/* JSON Status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 gap-2 text-xs sm:text-sm">
          <div className="flex-1 min-w-0">
            {!isValidJson() && (
              <div className="text-red-600 flex items-start gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="break-words">{getJsonError()}</span>
              </div>
            )}
            {isValidJson() && (
              <span className="text-green-600 flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Valid JSON configuration</span>
              </span>
            )}
          </div>
          <div className="text-gray-500 whitespace-nowrap">
            Data Type: <strong>Object</strong>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm sm:text-base font-medium text-gray-700">Preview</h4>
            <button
              type="button"
              onClick={clearPreview}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Close Preview"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-x-auto">
            {isValidJson() ? (
              <pre className="text-gray-800 whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
                {JSON.stringify(JSON.parse(jsonContent), null, 2)}
              </pre>
            ) : (
              <div className="text-red-500 text-xs sm:text-sm font-mono">Invalid JSON</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonEditor;
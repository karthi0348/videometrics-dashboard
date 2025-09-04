import React, { useState } from "react";

interface JsonEditorProps {
  jsonContent: string;
  onJsonChange: (content: string) => void;
  onReset: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  jsonContent,
  onJsonChange,
  onReset,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      onJsonChange(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      onJsonChange(JSON.stringify(parsed));
    } catch (error) {
      console.error("Invalid JSON");
    }
  };

  const copyJson = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(jsonContent);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = jsonContent;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metric-structure.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content);
            onJsonChange(content);
          } catch (error) {
            console.error("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetJson = () => {
    onJsonChange("[]");
  };

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
    } catch (error: any) {
      return error.message;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-700">
            Chart Configuration Array
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isValidJson()
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isValidJson() ? "Valid" : "Invalid"}
            </span>
            <span className="text-xs sm:text-sm text-gray-600">
              Array({isValidJson() ? JSON.parse(jsonContent).length : 0})
            </span>
          </div>
        </div>

        {/* Action buttons - responsive layout */}
        <div className="flex flex-wrap gap-2 sm:gap-2">
          <button
            type="button"
            onClick={copyJson}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            title="Copy JSON"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="hidden sm:inline">
              {copySuccess ? "Copied!" : "Copy"}
            </span>
          </button>
          
          <button
            type="button"
            onClick={downloadJson}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            title="Download JSON"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
          
          <button
            type="button"
            onClick={uploadJson}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            title="Upload JSON"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            <span className="hidden sm:inline">Upload</span>
          </button>
          
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors text-xs sm:text-sm"
            title="Reset JSON"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
        Define chart configurations as a JSON array. Each object represents a
        chart with properties like chart_type, title, data_source, x_axis, and
        y_axis.
      </p>

      {/* Editor Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2 sm:mb-0">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            JSON Text Editor
          </h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={formatJson}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Format
          </button>
          <button
            type="button"
            onClick={minifyJson}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showPreview ? (
              <>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.121 14.121L15.536 15.536M14.121 14.121L12.707 12.707M14.121 14.121l-1.414-1.414"
                  />
                </svg>
                <span>Hide</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>Preview</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetJson}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* JSON Editor */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 lg:w-12 bg-gray-100 border-r border-gray-300 flex flex-col text-xs text-gray-500 font-mono overflow-hidden rounded-l">
          {jsonContent.split("\n").map((_, index) => (
            <div key={index} className="px-1 sm:px-2 leading-5 sm:leading-6 text-right min-h-[20px] sm:min-h-[24px] text-xs">
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          value={jsonContent}
          onChange={(e) => onJsonChange(e.target.value)}
          className={`w-full h-48 sm:h-56 md:h-64 lg:h-72 pl-10 sm:pl-12 lg:pl-14 pr-3 sm:pr-4 py-2 sm:py-3 font-mono text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white resize-none ${
            isValidJson()
              ? "border-gray-300 focus:border-purple-500"
              : "border-red-300 focus:border-red-500 focus:ring-red-500"
          }`}
          spellCheck={false}
        />
      </div>

      {/* Status and Character Count */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 sm:mt-3 gap-2 sm:gap-0">
        <div className="order-2 sm:order-1">
          {!isValidJson() && (
            <div className="text-red-600 flex items-start sm:items-center gap-1 text-xs sm:text-sm">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="break-words">{getJsonError()}</span>
            </div>
          )}
          {isValidJson() && (
            <span className="text-green-600 flex items-center gap-1 text-xs sm:text-sm">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Valid JSON
            </span>
          )}
        </div>
        <div className="text-gray-500 text-xs sm:text-sm order-1 sm:order-2">
          {jsonContent.length.toLocaleString()} characters
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="mt-4 sm:mt-6 bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Preview:
          </h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
            {isValidJson() ? (
              <pre className="text-gray-800 whitespace-pre-wrap break-words">
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
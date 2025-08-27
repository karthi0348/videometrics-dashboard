import React from 'react';

interface ChartHeaderProps {
  isExpanded: boolean;
  chartsLength: number;
  onToggle?: () => void;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  isExpanded,
  chartsLength,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full p-6 text-left hover:bg-gray-50 transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Chart Configuration
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {chartsLength} chart{chartsLength !== 1 ? "s" : ""}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>
  );
};

export default ChartHeader;
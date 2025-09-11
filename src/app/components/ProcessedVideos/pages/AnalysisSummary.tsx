import React from 'react';

interface AnalysisSummaryProps {
  summary: {
    content: string;
  };
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ summary }) => {
  return (
    <div className="p-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Analysis Summary</h3>
        <div className="prose max-w-none text-gray-700">
          <p>{summary.content}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummary;
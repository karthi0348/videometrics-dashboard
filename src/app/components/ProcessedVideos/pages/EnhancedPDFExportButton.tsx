// components/EnhancedPDFExportButton.tsx
import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { VideoAnalytics } from '../types/types';
import { AnalyticsPDFDocument, captureChartImagesForPDF, ChartImageData } from '../utils/pdfGenerator';

interface EnhancedPDFExportButtonProps {
  analytics: VideoAnalytics | null;
  disabled?: boolean;
}

export const EnhancedPDFExportButton: React.FC<EnhancedPDFExportButtonProps> = ({ 
  analytics, 
  disabled 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [chartImages, setChartImages] = useState<ChartImageData[]>([]);
  const [isPrepared, setIsPrepared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepareChartsForPDF = async () => {
    if (!analytics) return;

    setIsCapturing(true);
    setError(null);
    
    try {
      console.log("Preparing charts for PDF export...");
      const images = await captureChartImagesForPDF();
      setChartImages(images);
      setIsPrepared(true);
      
      if (images.length === 0) {
        setError("No charts were found or captured. The PDF will be generated without chart visualizations.");
      }
      
      console.log(`Successfully prepared ${images.length} chart images for PDF`);
    } catch (err) {
      console.error("Failed to capture charts:", err);
      setError(`Failed to capture charts: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsPrepared(true); // Allow PDF generation without charts
    } finally {
      setIsCapturing(false);
    }
  };

  const resetPreparation = () => {
    setIsPrepared(false);
    setChartImages([]);
    setError(null);
  };

  if (!analytics) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        No Data Available
      </button>
    );
  }

  if (isCapturing) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg opacity-75 cursor-not-allowed"
      >
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Preparing Charts...
      </button>
    );
  }

  if (!isPrepared) {
    return (
      <div className="flex flex-col items-end space-y-2">
        <button
          onClick={prepareChartsForPDF}
          disabled={disabled}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Prepare PDF Export
        </button>
        {/* <p className="text-xs text-gray-500 max-w-48 text-right">
          Click to capture chart images for PDF export
        </p> */}
      </div>
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename = `analytics-report-${analytics.id}-${timestamp}.pdf`;

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={resetPreparation}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          title="Reset and recapture charts"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <PDFDownloadLink
          document={<AnalyticsPDFDocument analytics={analytics} chartImages={chartImages} />}
          fileName={filename}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          {({ loading }) => (
            <>
              {loading ? (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {loading ? 'Generating...' : 'Download PDF'}
            </>
          )}
        </PDFDownloadLink>
      </div>
{/*       
      <div className="text-xs text-right space-y-1">
        <p className={`${chartImages.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          {chartImages.length > 0 
            ? `✓ ${chartImages.length} chart(s) ready` 
            : '⚠ No charts captured'
          }
        </p>
        
        {error && (
          <p className="text-amber-600 max-w-48">
            {error}
          </p>
        )}
        
        <p className="text-gray-400">
          Ready for PDF generation
        </p>
      </div> */}
    </div>
  );
};

// Alternative: Direct PDF generation method (fallback)
export const generateDirectPDF = async (analytics: VideoAnalytics): Promise<void> => {
  try {
    console.log("Starting direct PDF generation...");
    
    // Import required functions dynamically
    const { pdf } = await import('@react-pdf/renderer');
    const { captureChartImagesForPDF, AnalyticsPDFDocument } = await import('../utils/pdfGenerator');
    
    // Capture charts
    const chartImages = await captureChartImagesForPDF();
    
    // Generate PDF blob
    const MyDocument = () => (
      React.createElement(AnalyticsPDFDocument, { analytics, chartImages })
    );
    
    const blob = await pdf(React.createElement(MyDocument)).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${analytics.id}-${new Date().toISOString().slice(0, 19)}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("PDF generated and downloaded successfully");
  } catch (error) {
    console.error("Direct PDF generation failed:", error);
    throw error;
  }
};
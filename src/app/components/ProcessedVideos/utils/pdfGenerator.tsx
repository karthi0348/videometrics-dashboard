// utils/pdfGenerator.ts
import { VideoAnalytics } from "../types/types";

// First, install the required dependency:
// npm install @react-pdf/renderer

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image as PDFImage } from '@react-pdf/renderer';

// Types for chart capture
interface ChartImageData {
  id: string;
  title: string;
  base64Data: string;
  width: number;
  height: number;
  type: string;
}

// Enhanced chart capture function with better timing and validation
export const captureChartImagesForPDF = async (): Promise<ChartImageData[]> => {
  console.log("Starting enhanced chart capture for PDF...");
  
  // Wait for all charts to be fully rendered
  await waitForChartsToRender();
  
  const chartImages: ChartImageData[] = [];
  
  // Find all chart elements with data attributes
  const chartElements = document.querySelectorAll("[data-chart-id]");
  console.log(`Found ${chartElements.length} chart elements`);
  
  for (let i = 0; i < chartElements.length; i++) {
    const element = chartElements[i] as HTMLElement;
    const chartId = element.getAttribute("data-chart-id");
    const chartType = element.getAttribute("data-chart-type") || "unknown";
    const chartTitle = element.getAttribute("data-chart-title") || `Chart ${i + 1}`;
    
    if (!chartId) continue;
    
    console.log(`Processing chart: ${chartId} - ${chartTitle}`);
    
    try {
      // Ensure element is visible and has content
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.warn(`Chart ${chartId} has zero dimensions, skipping...`);
        continue;
      }
      
      // Check if chart has actual visual content
      const hasVisualContent = element.querySelector('svg, canvas, .recharts-wrapper, .chart-container > *');
      if (!hasVisualContent) {
        console.warn(`Chart ${chartId} has no visual content, skipping...`);
        continue;
      }
      
      // Scroll element into view and wait
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try different capture methods
      let base64Data: string | null = null;
      
      // Method 1: Try capturing with html2canvas (if available)
      if (window.html2canvas) {
        base64Data = await captureWithHtml2Canvas(element, chartId);
      }
      
      // Method 2: Try capturing canvas elements directly
      if (!base64Data) {
        base64Data = await captureCanvasElements(element, chartId);
      }
      
      // Method 3: Try capturing SVG elements
      if (!base64Data) {
        base64Data = await captureSVGElements(element, chartId);
      }
      
      if (base64Data && await validateImageData(base64Data)) {
        chartImages.push({
          id: chartId,
          title: chartTitle,
          base64Data,
          width: element.offsetWidth,
          height: element.offsetHeight,
          type: chartType
        });
        console.log(`✓ Successfully captured chart: ${chartId}`);
      } else {
        console.warn(`✗ Failed to capture chart: ${chartId}`);
      }
      
    } catch (error) {
      console.error(`Error capturing chart ${chartId}:`, error);
    }
  }
  
  console.log(`Chart capture complete. Captured ${chartImages.length} charts.`);
  return chartImages;
};

// Wait for charts to be fully rendered with better detection
const waitForChartsToRender = async (): Promise<void> => {
  console.log("Waiting for charts to render...");
  
  // Initial wait for React to render
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Wait for chart libraries to initialize
  const maxWaitTime = 15000; // 15 seconds max
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const chartElements = document.querySelectorAll("[data-chart-id]");
    
    if (chartElements.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
    
    let allChartsReady = true;
    
    for (const element of chartElements) {
      const hasContent = element.querySelector('svg, canvas, .recharts-wrapper, .chart-container > *');
      if (!hasContent) {
        allChartsReady = false;
        break;
      }
    }
    
    if (allChartsReady) {
      console.log("All charts appear to be ready");
      // Additional wait for animations to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.warn("Timed out waiting for all charts to render");
};

// Capture using html2canvas
const captureWithHtml2Canvas = async (element: HTMLElement, chartId: string): Promise<string | null> => {
  try {
    if (!window.html2canvas) return null;
    
    const canvas = await window.html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      foreignObjectRendering: true,
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure visibility in cloned document
        const clonedElement = clonedDoc.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;
        if (clonedElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.opacity = '1';
        }
      }
    });
    
    if (canvas && canvas.width > 0 && canvas.height > 0) {
      return canvas.toDataURL("image/png", 1.0);
    }
  } catch (error) {
    console.warn(`html2canvas capture failed for ${chartId}:`, error);
  }
  return null;
};

// Capture canvas elements directly
const captureCanvasElements = async (element: HTMLElement, chartId: string): Promise<string | null> => {
  try {
    const canvasElements = element.querySelectorAll('canvas');
    if (canvasElements.length === 0) return null;
    
    // Use the first visible canvas
    for (const canvas of canvasElements) {
      const canvasElement = canvas as HTMLCanvasElement;
      if (canvasElement.width > 0 && canvasElement.height > 0) {
        return canvasElement.toDataURL("image/png", 1.0);
      }
    }
  } catch (error) {
    console.warn(`Canvas capture failed for ${chartId}:`, error);
  }
  return null;
};

// Capture SVG elements by converting to canvas
const captureSVGElements = async (element: HTMLElement, chartId: string): Promise<string | null> => {
  try {
    const svgElements = element.querySelectorAll('svg');
    if (svgElements.length === 0) return null;
    
    // Use the first visible SVG
    for (const svg of svgElements) {
      const svgElement = svg as SVGElement;
      const rect = svgElement.getBoundingClientRect();
      
      if (rect.width > 0 && rect.height > 0) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;
        
        canvas.width = rect.width * 3; // High DPI
        canvas.height = rect.height * 3;
        
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        return new Promise<string>((resolve, reject) => {
          img.onload = () => {
            ctx.scale(3, 3);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/png", 1.0));
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('SVG to canvas conversion failed'));
          };
          img.src = url;
        });
      }
    }
  } catch (error) {
    console.warn(`SVG capture failed for ${chartId}:`, error);
  }
  return null;
};

// Validate image data
const validateImageData = async (imageData: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!imageData || !imageData.startsWith('data:image/')) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
    img.onerror = () => resolve(false);
    img.src = imageData;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
};

// PDF Document Component using @react-pdf/renderer
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    backgroundColor: '#0f766e',
    padding: 10,
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    marginTop: 20,
  },
  text: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 5,
  },
  metricContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    border: '1pt solid #0f766e',
    padding: 10,
    marginBottom: 10,
    marginRight: '2%',
  },
  metricLabel: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 18,
    color: '#0f766e',
    fontWeight: 'bold',
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartImage: {
    maxWidth: '100%',
    maxHeight: 200,
    objectFit: 'contain',
  },
  insightsList: {
    marginTop: 10,
    paddingLeft: 10,
  },
  insightItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 3,
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    border: '1pt solid #0ea5e9',
    padding: 10,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1pt solid #ef4444',
    padding: 10,
    marginBottom: 10,
    color: '#dc2626',
  },
  rawDataContainer: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #d1d5db',
    padding: 10,
    marginTop: 10,
    flex: 1,
  },
  rawDataText: {
    fontSize: 8,
    color: '#374151',
    fontFamily: 'Courier',
    lineHeight: 1.2,
  },
});

interface PDFDocumentProps {
  analytics: VideoAnalytics;
  chartImages: ChartImageData[];
}

const AnalyticsPDFDocument: React.FC<PDFDocumentProps> = ({ analytics, chartImages }) => {
  const reportDate = new Date().toLocaleDateString();
  const reportTime = new Date().toLocaleTimeString();
  
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>CUSTOMER FLOW ANALYTICS SYSTEM</Text>
        </View>
        
        <Text style={styles.title}>COMPREHENSIVE ANALYTICS REPORT</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.text}>Report Generated: {reportDate} at {reportTime}</Text>
          <Text style={styles.text}>Analysis ID: {analytics.id}</Text>
          <Text style={styles.text}>Video UUID: {analytics.uuid.substring(0, 20)}...</Text>
          <Text style={styles.text}>Confidence Score: {analytics.confidence_score}%</Text>
          <Text style={styles.text}>Processing Status: {analytics.status.toUpperCase()}</Text>
          <Text style={styles.text}>Total Metrics: {Object.keys(analytics.parsed_metrics || {}).length}</Text>
          <Text style={styles.text}>Charts Captured: {chartImages.length}</Text>
        </View>
        
        {analytics.video_metadata?.video_title && (
          <View style={styles.infoBox}>
            <Text style={styles.subtitle}>Video Information</Text>
            <Text style={styles.text}>Title: {analytics.video_metadata.video_title}</Text>
          </View>
        )}
      </Page>
      
      {/* Metrics Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>KEY PERFORMANCE METRICS</Text>
        </View>
        
        <View style={styles.metricContainer}>
          {Object.entries(analytics.parsed_metrics || {}).map(([key, value], index) => (
            <View key={index} style={styles.metricBox}>
              <Text style={styles.metricLabel}>
                {key.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.metricValue}>{value.toString()}</Text>
            </View>
          ))}
        </View>
      </Page>
      
      {/* Charts Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>ANALYTICS CHARTS</Text>
        </View>
        
        {chartImages.length > 0 ? (
          chartImages.map((chart, index) => (
            <View key={index} style={styles.chartContainer}>
              <Text style={styles.chartTitle}>{chart.title}</Text>
              <PDFImage 
                style={styles.chartImage}
                src={chart.base64Data}
              />
              
              {/* Add insights if available */}
              {analytics.generated_charts?.find(c => c.id === chart.id)?.insights && (
                <View style={styles.insightsList}>
                  <Text style={styles.subtitle}>Key Insights:</Text>
                  {analytics.generated_charts
                    .find(c => c.id === chart.id)
                    ?.insights?.map((insight, i) => (
                    <Text key={i} style={styles.insightItem}>• {insight}</Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.errorBox}>
            <Text>No charts were captured during PDF generation.</Text>
            <Text>This may indicate that charts were not fully loaded or rendered.</Text>
          </View>
        )}
      </Page>
      
      {/* Summary Page */}
      {analytics.generated_summary?.content && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerText}>ANALYSIS SUMMARY</Text>
          </View>
          
          <Text style={styles.text}>
            {analytics.generated_summary.content}
          </Text>
        </Page>
      )}
      
      {/* Raw Data Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>COMPLETE ANALYTICS DATA</Text>
        </View>
        
        {/* Basic Information Section */}
        <Text style={styles.subtitle}>Basic Information</Text>
        <View style={styles.infoBox}>
          <Text style={styles.text}>ID: {analytics.id}</Text>
          <Text style={styles.text}>UUID: {analytics.uuid}</Text>
          <Text style={styles.text}>Status: {analytics.status}</Text>
          <Text style={styles.text}>Confidence Score: {analytics.confidence_score}%</Text>
          <Text style={styles.text}>Created: {analytics.created_at}</Text>
          <Text style={styles.text}>Updated: {analytics.updated_at}</Text>
        </View>
        
        {/* Parsed Metrics Section */}
        {analytics.parsed_metrics && (
          <>
            <Text style={styles.subtitle}>Parsed Metrics</Text>
            <View style={styles.rawDataContainer}>
              <Text style={styles.rawDataText}>
                {JSON.stringify(analytics.parsed_metrics, null, 2)}
              </Text>
            </View>
          </>
        )}
      </Page>
      
      {/* Additional Raw Data Pages */}
      {analytics.generated_charts && analytics.generated_charts.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerText}>CHART CONFIGURATIONS</Text>
          </View>
          
          <View style={styles.rawDataContainer}>
            <Text style={styles.rawDataText}>
              {JSON.stringify(analytics.generated_charts, null, 2)}
            </Text>
          </View>
        </Page>
      )}
      
      {/* Video Metadata Page */}
      {analytics.video_metadata && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerText}>VIDEO METADATA</Text>
          </View>
          
          <View style={styles.rawDataContainer}>
            <Text style={styles.rawDataText}>
              {JSON.stringify(analytics.video_metadata, null, 2)}
            </Text>
          </View>
        </Page>
      )}
      
      {/* Complete Raw Data Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>COMPLETE RAW DATA</Text>
        </View>
        
        <Text style={styles.text}>
          Complete analytics object (may span multiple pages):
        </Text>
        
        <View style={styles.rawDataContainer}>
          <Text style={styles.rawDataText}>
            {JSON.stringify(analytics, null, 2)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Enhanced PDF generation function
export const generateEnhancedPDF = async (analytics: VideoAnalytics): Promise<void> => {
  try {
    console.log("Starting enhanced PDF generation...");
    
    // Capture chart images with improved method
    const chartImages = await captureChartImagesForPDF();
    
    if (chartImages.length === 0) {
      console.warn("No charts were captured. PDF will be generated without chart images.");
    }
    
    // For direct download, we need to render the PDF
    // This would typically be done in a React component
    console.log("PDF generation prepared. Chart images ready:", chartImages.length);
    
    // Return the PDF document component and chart images for use in React
    return { analytics, chartImages };
    
  } catch (error) {
    console.error("Enhanced PDF generation failed:", error);
    throw error;
  }
};

// Export the PDF Document component for use in React
export { AnalyticsPDFDocument };
export type { ChartImageData };
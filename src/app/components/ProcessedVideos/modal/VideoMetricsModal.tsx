import React, { useState, useEffect, useRef } from "react";
import { VideoAnalytics, GeneratedChart } from "../types/types";
import ChartDisplay from "./ChartDisplay";
import SummaryView from "./SummaryView";
import RawDataView from "./RawDataView";

interface VideoMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsId: string | null;
  apiService: any;
  mockMode: boolean;
}

// Add these type declarations at the top of your component file or in a types file

declare global {
  interface Window {
    jsPDF: any;
    html2canvas: any;
  }
}

// If you want more specific typing, you can use these interfaces instead:
interface JsPDFOptions {
  orientation?: "portrait" | "landscape";
  unit?: "mm" | "cm" | "in" | "px";
  format?: string | [number, number];
}

interface Html2CanvasOptions {
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  backgroundColor?: string;
  width?: number;
  height?: number;
  scrollX?: number;
  scrollY?: number;
  windowWidth?: number;
  windowHeight?: number;
}

declare global {
  interface Window {
    jsPDF: {
      new (options?: JsPDFOptions): {
        addImage: (
          imageData: string,
          format: string,
          x: number,
          y: number,
          width: number,
          height: number,
          alias?: string,
          compression?: string
        ) => void;
        addPage: () => void;
        save: (filename: string) => void;
      };
    };
    html2canvas: (
      element: HTMLElement,
      options?: Html2CanvasOptions
    ) => Promise<HTMLCanvasElement>;
  }
}

const mockAnalytics: VideoAnalytics = {
  id: 27,
  uuid: "6cca6d41-7695-43cc-ac7d-45a50a85b2ac",
  user_id: 2,
  profile_id: 3,
  sub_profile_id: 5,
  template_id: 11,
  video_url:
    "https://storage.googleapis.com/videometrics_dev/videos/new vdo_ca2520fbe9234c5ea7deb94a38465632.mp4",
  compressed_video_url:
    "gs://videometrics_dev/processed/new_vdo_compressed.mp4",
  video_metadata: {
    charts_generated: 1,
    processing_steps: ["raw_analysis", "json_formatting", "charts", "summary"],
    structured_fields: 4,
    summary_generated: true,
    raw_analysis_length: 3487,
  },
  parsed_metrics: {
    total_customers: "23",
    average_wait_time: "5",
    customer_satisfaction_score: "4",
    peak_activity_hours: "30",
  },
  generated_charts: [
    {
      id: "chart_1",
      title: "Customer Satisfaction Breakdown",
      series: {
        value: [4, 1],
        category: ["Satisfied", "Needs Improvement"],
      },
      status: "good",
      x_axis: ["Satisfied", "Needs Improvement"],
      styling: {
        theme: "professional",
        show_legend: true,
        color_scheme: "category10",
      },
      insights: [
        "The customer satisfaction score is 4 out of 5, indicating a good level of satisfaction (80%).",
        "There is a 20% segment (1 unit out of 5) where satisfaction could be improved.",
        "Further investigation into the 'Needs Improvement' segment is recommended to identify specific pain points and enhance overall customer experience.",
      ],
      plot_type: "pie",
      data_source: "data_source",
      y_axis_label: "Score Units",
    },
    {
      id: "chart_2",
      title: "Total Customers",
      value: 23,
      status: "excellent",
      styling: {
        theme: "professional",
        show_legend: false,
        color_scheme: "category10",
        unit: "Customers",
        max_value: 50,
      },
      insights: [
        "A total of 23 customers were counted in the video.",
        "This metric provides the total number of individuals served or processed.",
      ],
      plot_type: "gauge",
      data_source: "data_source",
    },
  ],
  generated_summary: {
    format: "plain",
    content:
      "This report provides a comprehensive analysis of recent customer engagement and operational efficiency, likely reflecting farm stand activity or direct-to-consumer sales during a specified period. The data suggests a generally positive customer experience, though significant opportunities for growth and efficiency optimization are apparent, particularly concerning the utilization of identified peak activity periods.\n\n**Key Metrics**\nDuring the reporting period, a **total of 23 customers** were served. The **average wait time for customers was 5 minutes**, indicating reasonable service efficiency. Customer satisfaction remained strong, with an average score of 4 out of 5. The operation experienced 30 hours classified as 'peak activity hours'.\n\n**Recommendations**\nBased on the current data, the following recommendations are proposed to enhance farm operations and customer engagement:\n1. **Customer Outreach & Marketing:** Given the relatively low customer count of 23 over 30 identified peak hours, consider targeted marketing efforts to attract more visitors during these high-potential times.\n2. **Peak Hour Utilization Review:** Investigate the nature of the 30 'peak hours'. If these hours truly represent high potential traffic, strategies to convert this potential into actual customers are crucial.\n3. **Wait Time Optimization:** While an average wait time of 5 minutes is acceptable, continuous efforts to streamline the customer flow could further enhance the positive satisfaction score.\n4. **Leverage Satisfaction:** Maintain the high satisfaction score by continuing to provide quality products and friendly service.",
    sections: [
      "overview",
      "key_metrics",
      "recommendations",
      "anomalies",
      "peak_analysis",
    ],
    word_count: 485,
    generated_at: "2025-08-30T17:19:49.636490+00:00",
    summary_type: "detailed",
    character_count: 3487,
    metrics_highlighted: ["total_customers", "average_wait_time"],
  },
  confidence_score: 75,
  insights: [],
  status: "completed",
  priority: "normal",
  error_message: null,
  processing_started_at: "2025-08-30T17:18:12.000000Z",
  processing_completed_at: "2025-08-30T17:19:49.636490Z",
  processing_duration_seconds: 97.63649,
  created_at: "2025-08-30T17:18:12.000000Z",
  updated_at: "2025-08-30T17:19:49.636490Z",
};

const VideoMetricsModal: React.FC<VideoMetricsModalProps> = ({
  isOpen,
  onClose,
  analyticsId,
  apiService,
  mockMode,
}) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [activeView, setActiveView] = useState<"charts" | "summary" | "raw">(
    "charts"
  );
  const [error, setError] = useState<string>("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && analyticsId) {
      loadAnalytics();
    }
  }, [isOpen, analyticsId]);

  const loadAnalytics = async () => {
    if (mockMode) {
      setLoading(false);
      setAnalytics(mockAnalytics);
      return;
    }

    if (!analyticsId) {
      setError("No analytics ID provided");
      return;
    }

    if (!apiService) {
      setError("API service not available");
      return;
    }

    setLoading(true);
    setError("");
    setAnalytics(null);

    try {
      console.log("Fetching analytics for ID:", analyticsId);

      const response = await apiService.getAnalytics(analyticsId);

      let data;
      if (typeof response === "string") {
        try {
          data = JSON.parse(response);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", response);
          throw new Error("Invalid JSON response from server");
        }
      } else if (typeof response === "object" && response !== null) {
        data = response;
      } else {
        throw new Error("Unexpected response format");
      }

      setAnalytics(data);
    } catch (err) {
      let errorMessage = "Failed to load analytics data";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  // Simplified PDF export function
  // Updated loadPdfLibraries function with better error handling

  // Updated PDF export function with better error handling and debugging
  // Enhanced library loading function
  const loadPdfLibraries = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let html2canvasLoaded = false;
      let jsPDFLoaded = false;

      const checkBothLoaded = () => {
        if (html2canvasLoaded && jsPDFLoaded) {
          const html2canvas = (window as any).html2canvas;
          const jsPDF = (window as any).jsPDF || (window as any).jspdf?.jsPDF;

          if (html2canvas && jsPDF) {
            console.log("Both libraries confirmed loaded");
            resolve();
          } else {
            reject(new Error("Libraries loaded but not accessible"));
          }
        }
      };

      // Check if html2canvas is already loaded
      if ((window as any).html2canvas) {
        html2canvasLoaded = true;
      } else {
        const html2canvasScript = document.createElement("script");
        html2canvasScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        html2canvasScript.crossOrigin = "anonymous";
        html2canvasScript.onload = () => {
          setTimeout(() => {
            if ((window as any).html2canvas) {
              html2canvasLoaded = true;
              checkBothLoaded();
            } else {
              reject(new Error("html2canvas script loaded but not available"));
            }
          }, 100);
        };
        html2canvasScript.onerror = () =>
          reject(new Error("Failed to load html2canvas"));
        document.head.appendChild(html2canvasScript);
      }

      // Check if jsPDF is already loaded
      if ((window as any).jsPDF || (window as any).jspdf?.jsPDF) {
        jsPDFLoaded = true;
      } else {
        const jsPDFScript = document.createElement("script");
        jsPDFScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        jsPDFScript.crossOrigin = "anonymous";
        jsPDFScript.onload = () => {
          setTimeout(() => {
            const jsPDF = (window as any).jsPDF || (window as any).jspdf?.jsPDF;
            if (jsPDF) {
              jsPDFLoaded = true;
              checkBothLoaded();
            } else {
              reject(new Error("jsPDF script loaded but not available"));
            }
          }, 500);
        };
        jsPDFScript.onerror = () => reject(new Error("Failed to load jsPDF"));
        document.head.appendChild(jsPDFScript);
      }

      // If both are already loaded, check immediately
      if (html2canvasLoaded && jsPDFLoaded) {
        checkBothLoaded();
      }

      // Timeout after 15 seconds
      setTimeout(() => {
        reject(new Error("Library loading timed out"));
      }, 15000);
    });
  };

  // Enhanced PDF export function that captures charts as images
  // Enhanced PDF export function that captures charts as images
  const handleExportToPdf = async () => {
    if (!analytics) {
      alert("No analytics data available to export.");
      return;
    }

    setExportingPdf(true);

    try {
      console.log("Loading PDF libraries...");
      await loadPdfLibraries();
      console.log("Libraries loaded successfully");

      // Access libraries with fallbacks
      const html2canvas = (window as any).html2canvas;
      const jsPDF = (window as any).jsPDF || (window as any).jspdf?.jsPDF;

      if (!html2canvas || typeof html2canvas !== "function") {
        throw new Error("html2canvas not properly loaded");
      }

      if (!jsPDF) {
        throw new Error("jsPDF not properly loaded");
      }

      // Determine jsPDF constructor
      let PDFConstructor;
      if (typeof jsPDF === "function") {
        PDFConstructor = jsPDF;
      } else if (jsPDF && typeof jsPDF.jsPDF === "function") {
        PDFConstructor = jsPDF.jsPDF;
      } else if (
        (window as any).jspdf &&
        typeof (window as any).jspdf.jsPDF === "function"
      ) {
        PDFConstructor = (window as any).jspdf.jsPDF;
      } else {
        throw new Error("Could not find jsPDF constructor");
      }

      // Create PDF document
      const pdf = new PDFConstructor({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let currentY = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number = 10
      ) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + lines.length * (fontSize * 0.35); // Return new Y position
      };

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Function to capture chart images
      const captureChartImages = async (): Promise<{
        [key: string]: string;
      }> => {
        const chartImages: { [key: string]: string } = {};

        console.log("Starting chart capture process...");

        // Wait for charts to render completely
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Primary strategy: Look for chart elements with data-chart-id
        const chartElements = document.querySelectorAll("[data-chart-id]");
        console.log(
          `Found ${chartElements.length} elements with data-chart-id`
        );

        for (let i = 0; i < chartElements.length; i++) {
          const element = chartElements[i] as HTMLElement;
          const chartId = element.getAttribute("data-chart-id");

          if (chartId && element.offsetWidth > 0 && element.offsetHeight > 0) {
            try {
              console.log(`Capturing chart ${chartId}...`);

              // Ensure element is visible
              element.scrollIntoView({ behavior: "instant", block: "center" });
              await new Promise((resolve) => setTimeout(resolve, 500));

              const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                width: element.offsetWidth,
                height: element.offsetHeight,
                logging: true, // Enable logging for debugging
                foreignObjectRendering: true,
                removeContainer: true,
              });

              chartImages[chartId] = canvas.toDataURL("image/png", 0.9);
              console.log(`✓ Chart ${chartId} captured successfully`);
            } catch (error) {
              console.warn(`✗ Failed to capture chart ${chartId}:`, error);
            }
          }
        }

        // Secondary strategy: Look for Recharts components
        if (Object.keys(chartImages).length === 0) {
          const rechartsElements = document.querySelectorAll(
            ".recharts-wrapper, .recharts-responsive-container"
          );
          console.log(`Found ${rechartsElements.length} Recharts elements`);

          for (let i = 0; i < rechartsElements.length; i++) {
            const element = rechartsElements[i] as HTMLElement;

            if (element.offsetWidth > 100 && element.offsetHeight > 100) {
              try {
                console.log(`Capturing Recharts element ${i}...`);

                // Find the parent container that includes the title
                let captureElement = element;
                let parent = element.parentElement;
                while (
                  parent &&
                  parent.offsetHeight < element.offsetHeight + 100
                ) {
                  if (
                    parent.querySelector(
                      'h3, h4, .chart-title, [class*="title"]'
                    )
                  ) {
                    captureElement = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }

                captureElement.scrollIntoView({
                  behavior: "instant",
                  block: "center",
                });
                await new Promise((resolve) => setTimeout(resolve, 500));

                const canvas = await html2canvas(captureElement, {
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: "#ffffff",
                  logging: true,
                  foreignObjectRendering: true,
                  removeContainer: true,
                });

                chartImages[`recharts_${i}`] = canvas.toDataURL(
                  "image/png",
                  0.9
                );
                console.log(`✓ Recharts element ${i} captured successfully`);
              } catch (error) {
                console.warn(
                  `✗ Failed to capture Recharts element ${i}:`,
                  error
                );
              }
            }
          }
        }

        // Tertiary strategy: Look for canvas or SVG elements
        if (Object.keys(chartImages).length === 0) {
          const canvasElements = document.querySelectorAll("canvas");
          const svgElements = document.querySelectorAll("svg");

          console.log(
            `Found ${canvasElements.length} canvas and ${svgElements.length} SVG elements`
          );

          // Capture canvas elements
          canvasElements.forEach((canvas, index) => {
            if (canvas.offsetWidth > 100 && canvas.offsetHeight > 100) {
              try {
                // For canvas, we can directly get the data URL
                const dataURL = canvas.toDataURL("image/png", 0.9);
                chartImages[`canvas_${index}`] = dataURL;
                console.log(`✓ Canvas ${index} captured directly`);
              } catch (error) {
                console.warn(`✗ Failed to capture canvas ${index}:`, error);
              }
            }
          });

          // Capture SVG elements
          for (let i = 0; i < svgElements.length; i++) {
            const svg = svgElements[i] as SVGElement;

            if (svg.offsetWidth > 100 && svg.offsetHeight > 100) {
              try {
                console.log(`Capturing SVG ${i}...`);

                // Find parent container for better context
                let captureElement = svg.parentElement || svg;

                const canvas = await html2canvas(
                  captureElement as HTMLElement,
                  {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: true,
                    foreignObjectRendering: true,
                    removeContainer: true,
                  }
                );

                chartImages[`svg_${i}`] = canvas.toDataURL("image/png", 0.9);
                console.log(`✓ SVG ${i} captured successfully`);
              } catch (error) {
                console.warn(`✗ Failed to capture SVG ${i}:`, error);
              }
            }
          }
        }

        // Final strategy: Look for chart containers by class names
        if (Object.keys(chartImages).length === 0) {
          const chartSelectors = [
            '[class*="chart"]',
            '[class*="Chart"]',
            '[class*="graph"]',
            '[class*="Graph"]',
            ".visualization",
            ".plot-container",
            '[data-testid*="chart"]',
          ];

          for (const selector of chartSelectors) {
            const elements = document.querySelectorAll(selector);
            console.log(
              `Found ${elements.length} elements with selector: ${selector}`
            );

            for (let i = 0; i < Math.min(elements.length, 3); i++) {
              // Limit to first 3
              const element = elements[i] as HTMLElement;

              if (element.offsetWidth > 100 && element.offsetHeight > 100) {
                try {
                  console.log(
                    `Capturing generic chart element ${i} for selector ${selector}...`
                  );

                  element.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                  });
                  await new Promise((resolve) => setTimeout(resolve, 300));

                  const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: true,
                    foreignObjectRendering: true,
                    removeContainer: true,
                  });

                  chartImages[
                    `generic_${selector.replace(/[^a-zA-Z0-9]/g, "_")}_${i}`
                  ] = canvas.toDataURL("image/png", 0.9);
                  console.log(`✓ Generic chart element captured`);
                } catch (error) {
                  console.warn(
                    `✗ Failed to capture generic chart element:`,
                    error
                  );
                }
              }
            }

            if (Object.keys(chartImages).length > 0) break;
          }
        }

        console.log(
          `Chart capture complete. Total images: ${
            Object.keys(chartImages).length
          }`
        );
        return chartImages;
      };

      // Capture chart images before generating PDF
      console.log("Capturing chart images...");
      const chartImages = await captureChartImages();
      console.log(`Captured ${Object.keys(chartImages).length} chart images`);

      // Generate timestamp
      const reportDate = new Date();
      const dateStr = reportDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = reportDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // === PAGE 1: COVER PAGE ===

      // Header logo area
      pdf.setFillColor(15, 118, 110); // Teal color
      pdf.rect(margin, margin, contentWidth, 15, "F");

      // Company/System name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("CUSTOMER FLOW ANALYTICS SYSTEM", margin + 5, margin + 10);

      currentY = margin + 25;

      // Main title
      pdf.setTextColor(15, 118, 110);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("COMPREHENSIVE", pageWidth / 2, currentY, { align: "center" });
      currentY += 10;
      pdf.text("ANALYTICS REPORT", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += 20;

      // Subtitle
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Complete Business Intelligence Analysis",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      pdf.setFontSize(10);
      currentY += 8;
      pdf.text(
        "Including Charts, Summary & Raw Data",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 25;

      // Report details box
      pdf.setFillColor(248, 249, 250);
      pdf.setDrawColor(222, 226, 230);
      pdf.rect(margin + 20, currentY, contentWidth - 40, 70, "FD");

      // Report info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");

      const infoY = currentY + 10;
      pdf.text("Report Generated:", margin + 30, infoY);
      pdf.text("Analysis ID:", margin + 30, infoY + 8);
      pdf.text("Video UUID:", margin + 30, infoY + 16);
      pdf.text("Confidence Score:", margin + 30, infoY + 24);
      pdf.text("Processing Time:", margin + 30, infoY + 32);
      pdf.text("Total Metrics:", margin + 30, infoY + 40);
      pdf.text("Charts Generated:", margin + 30, infoY + 48);
      pdf.text("Chart Images Captured:", margin + 30, infoY + 56);

      pdf.setFont("helvetica", "normal");
      pdf.text(`${dateStr} at ${timeStr}`, margin + 70, infoY);
      pdf.text(`${analytics.id}`, margin + 70, infoY + 8);
      pdf.text(
        analytics.uuid.substring(0, 16) + "...",
        margin + 70,
        infoY + 16
      );
      pdf.text(`${analytics.confidence_score}%`, margin + 70, infoY + 24);
      pdf.text(
        `${Math.round(analytics.processing_duration_seconds)}s`,
        margin + 70,
        infoY + 32
      );
      pdf.text(
        `${Object.keys(analytics.parsed_metrics).length}`,
        margin + 70,
        infoY + 40
      );
      pdf.text(`${analytics.generated_charts.length}`, margin + 70, infoY + 48);
      pdf.text(`${Object.keys(chartImages).length}`, margin + 70, infoY + 56);

      currentY += 85;

      // Processing status
      pdf.setFillColor(15, 118, 110);
      pdf.rect(margin, currentY, contentWidth, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("PROCESSING STATUS", margin + 5, currentY + 6);
      currentY += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const statusInfo = [
        `Status: ${analytics.status.toUpperCase()}`,
        `Priority: ${analytics.priority.toUpperCase()}`,
        `Started: ${new Date(
          analytics.processing_started_at
        ).toLocaleString()}`,
        `Completed: ${new Date(
          analytics.processing_completed_at
        ).toLocaleString()}`,
        `Processing Steps: ${
          analytics.video_metadata?.processing_steps?.join(", ") || "N/A"
        }`,
      ];

      statusInfo.forEach((info, index) => {
        pdf.text(`• ${info}`, margin, currentY);
        currentY += 6;
      });

      // Footer
      currentY = pageHeight - 30;
      pdf.setDrawColor(15, 118, 110);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(
        "Comprehensive Analytics Report - Charts & Data Included",
        margin,
        currentY + 8
      );
      pdf.text("Page 1", pageWidth - margin, currentY + 8, { align: "right" });

      // === PAGE 2: KEY METRICS OVERVIEW ===
      pdf.addPage();
      currentY = margin;

      // Page header
      pdf.setFillColor(15, 118, 110);
      pdf.rect(margin, currentY, contentWidth, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("KEY PERFORMANCE METRICS", margin + 5, currentY + 6);
      currentY += 20;

      // Metrics grid - Enhanced with more details
      pdf.setTextColor(0, 0, 0);
      const metrics = Object.entries(analytics.parsed_metrics);
      const metricsPerRow = 2;
      const metricBoxWidth = (contentWidth - 10) / metricsPerRow;
      const metricBoxHeight = 40;

      for (let i = 0; i < metrics.length; i += metricsPerRow) {
        checkPageBreak(metricBoxHeight + 10);

        for (let j = 0; j < metricsPerRow && i + j < metrics.length; j++) {
          const [key, value] = metrics[i + j];
          const x = margin + j * (metricBoxWidth + 5);

          // Metric box with gradient effect
          pdf.setFillColor(248, 249, 250);
          pdf.setDrawColor(15, 118, 110);
          pdf.setLineWidth(0.5);
          pdf.rect(x, currentY, metricBoxWidth, metricBoxHeight, "FD");

          // Icon area (simple colored square)
          pdf.setFillColor(15, 118, 110);
          pdf.rect(x + 5, currentY + 5, 8, 8, "F");

          // Metric label
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(100, 100, 100);
          const formattedKey = key.replace(/_/g, " ").toUpperCase();
          pdf.text(formattedKey, x + 18, currentY + 10);

          // Metric value
          pdf.setFontSize(20);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(15, 118, 110);
          pdf.text(value.toString(), x + 5, currentY + 25);

          // Unit and description
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(120, 120, 120);
          const unit = key.includes("time")
            ? "minutes avg"
            : key.includes("score")
            ? "out of 5.0"
            : key.includes("hours")
            ? "total hours"
            : key.includes("customers")
            ? "total count"
            : "measured units";
          pdf.text(unit, x + 5, currentY + 32);
        }

        currentY += metricBoxHeight + 10;
      }

      // === PAGE 3-N: DETAILED CHARTS WITH IMAGES ===
      pdf.addPage();
      currentY = margin;

      // Page header
      pdf.setFillColor(15, 118, 110);
      pdf.rect(margin, currentY, contentWidth, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("VISUAL ANALYTICS & CHARTS", margin + 5, currentY + 6);
      currentY += 20;

      // Chart analysis with images
      pdf.setTextColor(0, 0, 0);
      analytics.generated_charts.forEach((chart, index) => {
        checkPageBreak(100); // More space needed for images

        // Chart header with full styling
        pdf.setFillColor(240, 248, 255);
        pdf.setDrawColor(15, 118, 110);
        pdf.rect(margin, currentY, contentWidth, 12, "FD");

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(15, 118, 110);
        pdf.text(`${index + 1}. ${chart.title}`, margin + 5, currentY + 8);

        // Status badge with color coding
        const statusColor =
          chart.status === "excellent"
            ? [40, 167, 69]
            : chart.status === "good"
            ? [255, 193, 7]
            : [220, 53, 69];
        pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.rect(pageWidth - margin - 30, currentY + 3, 25, 6, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          chart.status.toUpperCase(),
          pageWidth - margin - 17,
          currentY + 7,
          { align: "center" }
        );

        currentY += 18;

        // Try to find and add the chart image
        const chartImage =
          chartImages[chart.id] || chartImages[`chart_${index}`];
        if (chartImage) {
          try {
            // Calculate image dimensions to fit within content area
            const maxImageWidth = contentWidth * 0.8;
            const maxImageHeight = 60; // mm

            // Add the chart image
            pdf.addImage(
              chartImage,
              "PNG",
              margin + (contentWidth - maxImageWidth) / 2, // Center the image
              currentY,
              maxImageWidth,
              maxImageHeight,
              undefined,
              "MEDIUM"
            );

            currentY += maxImageHeight + 10;

            console.log(`Added chart image for ${chart.title}`);
          } catch (error) {
            console.warn(
              `Failed to add chart image for ${chart.title}:`,
              error
            );

            // Fallback: Add placeholder text
            pdf.setFillColor(248, 249, 250);
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(margin, currentY, contentWidth, 30, "FD");

            pdf.setTextColor(120, 120, 120);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "italic");
            pdf.text(
              "Chart visualization not captured",
              pageWidth / 2,
              currentY + 20,
              { align: "center" }
            );

            currentY += 35;
          }
        } else {
          // No image available - create a data representation
          pdf.setFillColor(248, 249, 250);
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(margin, currentY, contentWidth, 40, "FD");

          pdf.setTextColor(15, 118, 110);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text(
            `${chart.plot_type.toUpperCase()} CHART DATA`,
            margin + 5,
            currentY + 8
          );

          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");

          if (chart.series) {
            if (chart.series.category && chart.series.value) {
              chart.series.category.forEach((category, idx) => {
                const value = Array.isArray(chart.series.value)
                  ? chart.series.value[idx]
                  : chart.series.value;
                pdf.text(
                  `• ${category}: ${value}`,
                  margin + 5,
                  currentY + 15 + idx * 5
                );
              });
            }
          } else if (chart.value !== undefined) {
            pdf.text(`• Value: ${chart.value}`, margin + 5, currentY + 15);
            if (chart.styling?.unit) {
              pdf.text(
                `• Unit: ${chart.styling.unit}`,
                margin + 5,
                currentY + 20
              );
            }
          }

          currentY += 45;
        }

        // All insights section
        checkPageBreak(20);

        pdf.setFillColor(252, 248, 227);
        pdf.setDrawColor(255, 193, 7);
        pdf.rect(margin, currentY, contentWidth, 6, "FD");
        pdf.setTextColor(133, 77, 14);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("KEY INSIGHTS", margin + 5, currentY + 4);
        currentY += 12;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        chart.insights.forEach((insight, insightIndex) => {
          checkPageBreak(15);

          // Bullet point
          pdf.setFillColor(15, 118, 110);
          pdf.circle(margin + 3, currentY - 1, 1, "F");

          // Insight text with better formatting
          currentY = addWrappedText(
            `${insightIndex + 1}. ${insight}`,
            margin + 8,
            currentY,
            contentWidth - 8,
            9
          );
          currentY += 4;
        });

        currentY += 10;
      });

      // === COMPREHENSIVE SUMMARY SECTION ===
      pdf.addPage();
      currentY = margin;

      // Page header
      pdf.setFillColor(15, 118, 110);
      pdf.rect(margin, currentY, contentWidth, 8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("COMPREHENSIVE ANALYSIS SUMMARY", margin + 5, currentY + 6);
      currentY += 20;

      // Summary metadata
      if (analytics.generated_summary) {
        pdf.setFillColor(240, 248, 255);
        pdf.setDrawColor(15, 118, 110);
        pdf.rect(margin, currentY, contentWidth, 20, "FD");

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");

        pdf.text("Summary Type:", margin + 5, currentY + 6);
        pdf.text("Word Count:", margin + 5, currentY + 12);
        pdf.text("Generated:", margin + 5, currentY + 18);

        pdf.setFont("helvetica", "normal");
        pdf.text(
          analytics.generated_summary.summary_type || "Detailed",
          margin + 40,
          currentY + 6
        );
        pdf.text(
          `${analytics.generated_summary.word_count || 0} words`,
          margin + 40,
          currentY + 12
        );
        pdf.text(
          new Date(analytics.generated_summary.generated_at).toLocaleString(),
          margin + 40,
          currentY + 18
        );

        // Right side
        pdf.setFont("helvetica", "bold");
        pdf.text("Format:", margin + 110, currentY + 6);
        pdf.text("Sections:", margin + 110, currentY + 12);
        pdf.text("Characters:", margin + 110, currentY + 18);

        pdf.setFont("helvetica", "normal");
        pdf.text(
          analytics.generated_summary.format || "Plain",
          margin + 135,
          currentY + 6
        );
        pdf.text(
          `${analytics.generated_summary.sections?.length || 0} sections`,
          margin + 135,
          currentY + 12
        );
        pdf.text(
          `${analytics.generated_summary.character_count || 0}`,
          margin + 135,
          currentY + 18
        );

        currentY += 30;

        // Full summary content with better formatting
        if (analytics.generated_summary.content) {
          const summaryContent = analytics.generated_summary.content
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
            .split("\n\n")
            .filter((paragraph) => paragraph.trim());

          pdf.setTextColor(0, 0, 0);

          summaryContent.forEach((paragraph, index) => {
            checkPageBreak(35);

            // Check if it's a header
            const isHeader =
              /^[A-Z][A-Z\s]+$/.test(paragraph.split("\n")[0]) ||
              /^[A-Z][^:]*:/.test(paragraph) ||
              paragraph.startsWith("**") ||
              paragraph.includes("Key Metrics") ||
              paragraph.includes("Recommendations");

            if (isHeader) {
              // Header styling
              pdf.setFillColor(15, 118, 110);
              pdf.rect(margin, currentY - 2, contentWidth, 6, "F");
              pdf.setTextColor(255, 255, 255);
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);

              const headerText = paragraph.replace(/\*/g, "").trim();
              pdf.text(headerText, margin + 3, currentY + 2);
              currentY += 12;
            } else {
              // Regular paragraph
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(9);
              pdf.setTextColor(0, 0, 0);

              currentY = addWrappedText(
                paragraph,
                margin,
                currentY,
                contentWidth,
                9
              );
              currentY += 6;
            }
          });
        }
      }

      // Add page numbers to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(15, 118, 110);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Footer text
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");

        if (i === 1) {
          pdf.text(
            "Complete Customer Flow Analytics Report with Visual Charts",
            margin,
            pageHeight - 8
          );
        } else {
          pdf.text(
            `Generated on ${dateStr} - Charts & Data Included`,
            margin,
            pageHeight - 8
          );
        }

        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .substring(0, 19);
      const filename = `complete-analytics-report-with-charts-${analytics.id}-${timestamp}.pdf`;

      console.log("Saving PDF...");
      pdf.save(filename);

      const chartCount = Object.keys(chartImages).length;
      alert(
        `PDF report generated successfully with ${chartCount} chart images! Check your downloads folder.`
      );
    } catch (error) {
      console.error("PDF export error:", error);

      let errorMsg = "PDF export failed: ";

      if (error.message.includes("not properly loaded")) {
        errorMsg +=
          "PDF libraries failed to load. Please refresh the page and try again.";
      } else if (error.message.includes("constructor")) {
        errorMsg +=
          "PDF library initialization failed. This may be a browser compatibility issue.";
      } else if (error.message.includes("timed out")) {
        errorMsg +=
          "Library loading timed out. Please check your internet connection and try again.";
      } else {
        errorMsg +=
          error.message || "An unknown error occurred during PDF generation.";
      }

      alert(errorMsg);
    } finally {
      setExportingPdf(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setAnalytics(null);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Adjusted positioning and sizing to account for sidebar */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-6 ml-64 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Flow Analysis
            </h2>
            {analyticsId && (
              <p className="text-sm text-gray-500 mt-1">
                Video Analytics Report
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportToPdf}
              disabled={exportingPdf || loading || !analytics}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to PDF"
            >
              {exportingPdf ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
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
                  Exporting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
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
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content - This will be captured for PDF */}
        <div ref={modalContentRef} className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <div>
                    <h3 className="text-red-800 font-medium">
                      Error Loading Analytics
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-3 inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : analytics ? (
            <div>
              {/* Video Information Section */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Video Information
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Analysis Type: Customer Flow Analysis</p>
                      <p>Processing Status: Completed</p>
                      <p>Confidence Score: {analytics.confidence_score}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 mt-6">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setActiveView("charts")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeView === "charts"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Analytics Charts
                  </button>
                  <button
                    onClick={() => setActiveView("summary")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeView === "summary"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Analysis Summary
                  </button>
                  <button
                    onClick={() => setActiveView("raw")}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeView === "raw"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Raw Analytics Data
                  </button>
                </div>
              </div>

              {/* Content based on active view */}
              {activeView === "charts" && (
                <ChartDisplay
                  charts={analytics.generated_charts}
                  analyticsId={mockMode ? null : analyticsId}
                  apiService={mockMode ? null : apiService}
                  mockMode={mockMode}
                />
              )}
              {activeView === "summary" && analytics.generated_summary && (
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Analysis Summary
                    </h3>
                    <div className="prose max-w-none text-gray-700">
                      <div className="whitespace-pre-line">
                        {analytics.generated_summary.content}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeView === "raw" && <RawDataView data={analytics} />}
            </div>
          ) : activeView === "charts" && analyticsId && !loading && !error ? (
            // Show chart display even when analytics is not loaded yet
            <ChartDisplay
              analyticsId={analyticsId}
              apiService={apiService}
              mockMode={mockMode}
            />
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoMetricsModal;

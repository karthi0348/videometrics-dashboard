// utils/pdfGenerator.ts
import { VideoAnalytics } from "../types/types";
import { toPng } from "html-to-image";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
} from "@react-pdf/renderer";

// Types for chart capture
export interface ChartImageData {
  id: string;
  title: string;
  base64Data: string;
  width: number;
  height: number;
  type: string;
}

// Enhanced chart capture function with html-to-image
export const captureChartImagesForPDF = async (): Promise<ChartImageData[]> => {
  console.log("🎯 Starting chart capture for PDF...");

  // Wait for charts to be fully rendered
  await waitForChartsToRender();

  const chartImages: ChartImageData[] = [];

  // Find all chart elements with data attributes
  const chartElements = document.querySelectorAll(
    ".chart-container[data-chart-id]"
  );
  console.log(`📊 Found ${chartElements.length} chart containers`);

  if (chartElements.length === 0) {
    console.warn(
      "⚠️ No chart containers found! Looking for alternative selectors..."
    );

    // Try alternative selectors
    const altCharts = document.querySelectorAll(
      "[data-chart-id], .chart-container, [data-chart-type]"
    );
    console.log(`🔍 Alternative search found ${altCharts.length} elements`);
  }

  for (let i = 0; i < chartElements.length; i++) {
    const element = chartElements[i] as HTMLElement;
    const chartId = element.getAttribute("data-chart-id");
    const chartType = element.getAttribute("data-chart-type") || "unknown";
    const chartTitle =
      element.getAttribute("data-chart-title") || `Chart ${i + 1}`;

    if (!chartId) {
      console.warn(`⚠️ Chart ${i} missing data-chart-id attribute`);
      continue;
    }

    console.log(
      `📸 Processing chart ${i + 1}/${
        chartElements.length
      }: ${chartId} - ${chartTitle} (${chartType})`
    );

    try {
      // Check element visibility and dimensions
      const rect = element.getBoundingClientRect();
      console.log(
        `  📐 Dimensions: ${rect.width}x${rect.height}, Visible: ${
          element.offsetWidth > 0
        }`
      );

      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.warn(`  ⚠️ Chart ${chartId} has zero dimensions, skipping...`);
        continue;
      }

      // Ensure SVG elements are present
      const svgElements = element.querySelectorAll("svg");
      console.log(`  🎨 Found ${svgElements.length} SVG elements in chart`);

      // Wait for any animations or renders to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Scroll element into view for better capture
      element.scrollIntoView({ behavior: "instant", block: "center" });
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture with html-to-image
      console.log(`  📷 Capturing chart ${chartId} with html-to-image...`);

      const base64Data = await toPng(element, {
        quality: 1.0,
        pixelRatio: 5,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: {
          // Ensure proper rendering
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        filter: (node) => {
          // Filter out any elements that might cause issues
          if (node instanceof HTMLElement) {
            const classList = node.classList;
            // Skip script tags and hidden elements
            return (
              !classList.contains("hidden") &&
              node.tagName !== "SCRIPT" &&
              node.tagName !== "NOSCRIPT"
            );
          }
          return true;
        },
      });

      if (base64Data && base64Data.startsWith("data:image/")) {
        // Validate the image data
        const isValid = await validateImageData(base64Data);
        console.log(
          `  ${isValid ? "✅" : "❌"} Image validation: ${
            isValid ? "passed" : "failed"
          }`
        );

        if (isValid) {
          chartImages.push({
            id: chartId,
            title: chartTitle,
            base64Data,
            width: element.offsetWidth,
            height: element.offsetHeight,
            type: chartType,
          });
          console.log(`  ✅ Successfully captured chart: ${chartId}`);
        } else {
          console.error(`  ❌ Image validation failed for chart: ${chartId}`);
        }
      } else {
        console.error(`  ❌ Image generation failed for chart: ${chartId}`);
      }
    } catch (error) {
      console.error(`❌ Error capturing chart ${chartId}:`, error);

      // Try fallback capture with different settings
      try {
        console.log(`  🔄 Attempting fallback capture for ${chartId}...`);
        const fallbackData = await toPng(element, {
          quality: 0.95,
          pixelRatio: 1.5,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        if (fallbackData && fallbackData.startsWith("data:image/")) {
          const isValid = await validateImageData(fallbackData);
          if (isValid) {
            chartImages.push({
              id: chartId,
              title: chartTitle,
              base64Data: fallbackData,
              width: element.offsetWidth,
              height: element.offsetHeight,
              type: chartType,
            });
            console.log(`  ✅ Fallback capture successful for: ${chartId}`);
          }
        }
      } catch (fallbackError) {
        console.error(
          `  ❌ Fallback capture also failed for ${chartId}:`,
          fallbackError
        );
      }
    }
  }

  console.log(
    `\n📦 Chart capture complete. Successfully captured ${chartImages.length}/${chartElements.length} charts.`
  );

  if (chartImages.length === 0) {
    console.error(`
⚠️ NO CHARTS CAPTURED! Debugging info:
- Total chart containers found: ${chartElements.length}
- Page URL: ${window.location.href}
- Document ready state: ${document.readyState}
- Scroll position: ${window.scrollY}
    `);
  }

  return chartImages;
};

// Wait for charts to be fully rendered with better detection
const waitForChartsToRender = async (): Promise<void> => {
  console.log("⏳ Waiting for charts to render...");

  // Initial wait for React to render
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Wait for chart elements to appear
  const maxWaitTime = 15000; // 15 seconds max
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;
    const chartElements = document.querySelectorAll(
      ".chart-container[data-chart-id]"
    );

    console.log(
      `  🔄 Attempt ${attempts}: Found ${chartElements.length} chart containers`
    );

    if (chartElements.length > 0) {
      // Check if charts have visual content (SVG or canvas)
      let allReady = true;
      let readyCount = 0;

      for (const element of chartElements) {
        const hasSVG = element.querySelector("svg");
        const hasCanvas = element.querySelector("canvas");
        const hasVisualContent = hasSVG || hasCanvas;

        if (hasVisualContent) {
          readyCount++;
        } else {
          allReady = false;
        }
      }

      console.log(
        `  📊 Charts with visual content: ${readyCount}/${chartElements.length}`
      );

      if (allReady && chartElements.length > 0) {
        console.log(`✅ All ${chartElements.length} charts appear ready`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Extra wait for animations
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.warn(
    `⚠️ Timed out waiting for charts (waited ${
      (Date.now() - startTime) / 1000
    }s)`
  );

  // Log what we found
  const finalCharts = document.querySelectorAll(
    ".chart-container[data-chart-id]"
  );
  console.log(`Final count: ${finalCharts.length} chart containers found`);
};

// Validate image data
const validateImageData = async (imageData: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!imageData || !imageData.startsWith("data:image/")) {
      console.log("    ❌ Invalid image data format");
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const isValid = img.naturalWidth > 0 && img.naturalHeight > 0;
      console.log(
        `    ${isValid ? "✅" : "❌"} Image loaded: ${img.naturalWidth}x${
          img.naturalHeight
        }`
      );
      resolve(isValid);
    };
    img.onerror = (err) => {
      console.log("    ❌ Image failed to load:", err);
      resolve(false);
    };
    img.src = imageData;

    setTimeout(() => {
      console.log("    ⏱️ Image validation timeout");
      resolve(false);
    }, 3000);
  });
};

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  header: {
    backgroundColor: "#0f766e",
    padding: 10,
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f766e",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 15,
    marginTop: 20,
  },
  text: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 5,
  },
  metricContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  metricBox: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    border: "1pt solid #0f766e",
    padding: 10,
    marginBottom: 10,
    marginRight: "2%",
  },
  metricLabel: {
    fontSize: 8,
    color: "#6b7280",
    fontWeight: "bold",
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 18,
    color: "#0f766e",
    fontWeight: "bold",
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: "center",
    pageBreakInside: "avoid",
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0f766e",
  },
  chartType: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 5,
    textAlign: "center",
  },
  chartImage: {
    maxWidth: "100%",
    maxHeight: 600,
    objectFit: "contain",
  },
  insightsList: {
    marginTop: 10,
    paddingLeft: 10,
  },
  insightItem: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 3,
  },
  infoBox: {
    backgroundColor: "#f0f9ff",
    border: "1pt solid #0ea5e9",
    padding: 10,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1pt solid #ef4444",
    padding: 10,
    marginBottom: 10,
    color: "#dc2626",
  },

  rawDataContainer: {
    backgroundColor: "#f9fafb",
    border: "1pt solid #d1d5db",
    padding: 10,
    marginTop: 10,
    flex: 1,
  },

  rawDataText: {
    fontSize: 8,
    color: "#374151",
    fontFamily: "Courier",
    lineHeight: 1.2,
  },
  warningBox: {
    backgroundColor: "#fffbeb",
    border: "1pt solid #f59e0b",
    padding: 10,
    marginBottom: 10,
    color: "#d97706",
  },
});

interface PDFDocumentProps {
  analytics: VideoAnalytics;
  chartImages: ChartImageData[];
}

export const AnalyticsPDFDocument: React.FC<PDFDocumentProps> = ({
  analytics,
  chartImages,
}) => {
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
          <Text style={styles.text}>
            Report Generated: {reportDate} at {reportTime}
          </Text>
          <Text style={styles.text}>Analysis ID: {analytics.id}</Text>
          <Text style={styles.text}>
            Video UUID: {analytics.uuid.substring(0, 20)}...
          </Text>
          <Text style={styles.text}>
            Confidence Score: {analytics.confidence_score}%
          </Text>
          <Text style={styles.text}>
            Processing Status: {analytics.status.toUpperCase()}
          </Text>
          <Text style={styles.text}>
            Total Metrics: {Object.keys(analytics.parsed_metrics || {}).length}
          </Text>
          <Text style={styles.text}>Charts Captured: {chartImages.length}</Text>
        </View>

        {chartImages.length === 0 && (
          <View style={styles.warningBox}>
            <Text>⚠️ No charts were captured in this report.</Text>
            <Text style={{ marginTop: 5 }}>
              This may indicate that charts were not fully rendered at the time
              of PDF generation.
            </Text>
            <Text style={{ marginTop: 5 }}>
              Try waiting a few seconds after the page loads before clicking
              "Prepare PDF Export".
            </Text>
          </View>
        )}

        {analytics.video_metadata?.video_title && (
          <View style={styles.infoBox}>
            <Text style={styles.subtitle}>Video Information</Text>
            <Text style={styles.text}>
              Title: {analytics.video_metadata.video_title}
            </Text>
          </View>
        )}
      </Page>

      {/* Metrics Page */}
<Page size="A4" style={styles.page}>
  <View style={styles.header}>
    <Text style={styles.headerText}>KEY PERFORMANCE METRICS</Text>
  </View>

  <View style={styles.metricContainer}>
    {analytics.parsed_metrics && 
      Object.entries(analytics.parsed_metrics || {})
        .filter(([key, value]) => {
          const strValue = String(value);
          return strValue !== '[object Object]' && strValue.trim() !== '';
        })
        .map(([key, value], index) => (
          <View key={index} style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              {key.replace(/_/g, " ").toUpperCase()}
            </Text>
            <Text style={styles.metricValue}>
              {String(value).substring(0, 100)}
            </Text>
          </View>
        ))
    }
  </View>
</Page>

      {/* Charts Pages */}
      {chartImages.length > 0 ? (
        chartImages.map((chart, index) => (
          <Page key={index} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.headerText}>
                CHART {index + 1} OF {chartImages.length}
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>{chart.title}</Text>
              <Text style={styles.chartType}>
                Type: {chart.type.toUpperCase()}
              </Text>

              <PDFImage style={styles.chartImage} src={chart.base64Data} />
            </View>
          </Page>
        ))
      ) : (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerText}>ANALYTICS CHARTS</Text>
          </View>
          <View style={styles.errorBox}>
            <Text>No charts were captured during PDF generation.</Text>
            <Text style={{ marginTop: 5 }}>
              This may indicate that charts were not fully loaded or rendered.
            </Text>
            <Text style={{ marginTop: 5 }}>Please try the following:</Text>
            <Text style={{ marginTop: 3 }}>
              1. Wait for all charts to fully load on the page
            </Text>
            <Text style={{ marginTop: 3 }}>
              2. Scroll through the page to ensure all charts are visible
            </Text>
            <Text style={{ marginTop: 3 }}>
              3. Click "Prepare PDF Export" again
            </Text>
          </View>
        </Page>
      )}

      {/* Summary Page */}
      {analytics.generated_summary?.content && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerText}>ANALYSIS SUMMARY</Text>
          </View>

          <Text style={styles.text}>{analytics.generated_summary.content}</Text>
        </Page>
      )}

      {/* Raw Data Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>COMPLETE ANALYTICS DATA</Text>
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

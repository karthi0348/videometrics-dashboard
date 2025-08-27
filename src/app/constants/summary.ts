import { SummaryConfig, SummaryTypeOption, SectionOption, FormatOption } from '../types/summary';

export const SUMMARY_TYPES: SummaryTypeOption[] = [
  { value: "executive", label: "Executive", description: "High-level overview for decision makers" },
  { value: "detailed", label: "Detailed", description: "Comprehensive analysis with in-depth insights" },
  { value: "technical", label: "Technical", description: "Technical details and implementation insights" },
  { value: "custom", label: "Custom", description: "User-defined summary structure" }
];

export const AVAILABLE_SECTIONS: SectionOption[] = [
  { value: "overview", label: "Overview", description: "General summary and context" },
  { value: "key_metrics", label: "Key Metrics", description: "Primary performance indicators" },
  { value: "recommendations", label: "Recommendations", description: "Actionable insights and suggestions" },
  { value: "trends", label: "Trends", description: "Historical patterns and changes" },
  { value: "peak_analysis", label: "Peak Analysis", description: "Analysis of peak performance periods" },
  { value: "anomalies", label: "Anomalies", description: "Unusual patterns or outliers" }
];

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: "markdown", label: "Markdown", description: "Structured markdown format" },
  { value: "html", label: "HTML", description: "Rich HTML with styling" },
  { value: "json", label: "JSON", description: "Structured JSON data" },
  { value: "plain", label: "Plain Text", description: "Simple text format" }
];

export const DEFAULT_SUMMARY_CONFIG: SummaryConfig = {
  summary_type: "executive",
  sections: ["overview", "key_metrics"],
  metrics_to_highlight: ["total_customers", "average_wait_time"],
  format: "markdown",
  include_recommendations: true
};

export const DEFAULT_FILENAME = 'summary-configuration.json';
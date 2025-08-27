export interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}

export interface SummaryConfigurationProps {
  isExpanded: boolean;
  onToggle: () => void;
  onConfigChange: (config: SummaryConfig | null) => void;
}

export type TabType = 'visual' | 'json' | 'form' | 'tree';

export interface SummaryTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface SectionOption {
  value: string;
  label: string;
  description: string;
}

export interface FormatOption {
  value: string;
  label: string;
  description: string;
}
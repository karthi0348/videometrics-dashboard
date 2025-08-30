export interface FormData {
    templateName: string;
    description: string;
    tags: string[];
    analysisPrompt: string;
    makePublic: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: 'Public' | 'Private';
  status: 'active' | 'beta';
  uses: number;
  assignedProfiles: number;
  icon: string;
  color: string;
  analysisPrompt?: string;
  created?: string;
  rating?: number;
}



export interface Profile {
  id: string;
  name: string;
}


export interface ChartConfig {
  chart_type: string;
  title: string;
  data_source: string;
  x_axis: {
    field: string;
    label: string;
  };
  y_axis: {
    field: string;
    label: string;
  };
}



export interface SummaryConfig {
  summary_type: string;
  sections: string[];
  metrics_to_highlight: string[];
  format: string;
  include_recommendations: boolean;
}


export interface ChartConfigurationProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  onConfigChange?: (config: ChartConfig[]) => void;
}

export type TabType = "visual" | "json" | "form" | "tree";
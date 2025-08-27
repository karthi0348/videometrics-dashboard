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

export interface ChartConfigurationProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  onConfigChange?: (config: ChartConfig[]) => void;
}

export type TabType = "visual" | "json" | "form" | "tree";
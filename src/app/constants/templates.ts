import { ChartConfig } from '../types/templates';

export const CHART_TYPES = [
  "Line Chart",
  "Bar Chart",
  "Pie Chart",
  "Area Chart",
  "Scatter Plot",
  "Histogram",
  "Bubble Chart",
];

export const DEFAULT_CHART: ChartConfig = {
  chart_type: "line",
  title: "Chart 1",
  data_source: "data_source",
  x_axis: {
    field: "x",
    label: "X-Axis",
  },
  y_axis: {
    field: "y",
    label: "Y-Axis",
  },
};

export const createDefaultChart = (index: number): ChartConfig => ({
  chart_type: "line",
  title: `Chart ${index}`,
  data_source: "data_source",
  x_axis: {
    field: "x",
    label: "X-Axis",
  },
  y_axis: {
    field: "y",
    label: "Y-Axis",
  },
});
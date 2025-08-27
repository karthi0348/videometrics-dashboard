import { ChartConfig } from '../types/templates';

export const isValidJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

export const getJsonError = (jsonString: string): string | null => {
  try {
    JSON.parse(jsonString);
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const formatJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};

export const minifyJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return jsonString;
  }
};

export const updateChartField = (
  charts: ChartConfig[],
  index: number,
  field: string,
  value: any
): ChartConfig[] => {
  const updatedCharts = [...charts];
  if (field.includes(".")) {
    const [parent, child] = field.split(".");
    updatedCharts[index] = {
      ...updatedCharts[index],
      [parent]: {
        ...(updatedCharts[index][parent as keyof ChartConfig] as object),
        [child]: value,
      },
    };
  } else {
    updatedCharts[index] = { ...updatedCharts[index], [field]: value };
  }
  return updatedCharts;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadJson = (content: string, filename = "metric-structure.json"): void => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadJsonFile = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content); // Validate JSON
            resolve(content);
          } catch {
            resolve(null);
          }
        };
        reader.readAsText(file);
      } else {
        resolve(null);
      }
    };
    input.click();
  });
};
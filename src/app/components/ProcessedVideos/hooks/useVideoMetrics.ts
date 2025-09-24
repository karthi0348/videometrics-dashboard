// hooks/useVideoMetrics.ts
import { useState, useCallback } from "react";
import { VideoAnalytics, GeneratedChart } from "../types/types";
import ProcessVideoApiService from "@/helpers/service/processvideo/ProcessVideoApiservice";
import { mockAnalytics } from "../types/types";

export const useAnalyticsData = (analyticsId: string | null, mockMode: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [error, setError] = useState<string>("");
  const [apiService] = useState(() => new ProcessVideoApiService());

  const loadAnalytics = useCallback(async () => {
    if (mockMode) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      setAnalytics(mockAnalytics);
      return;
    }

    if (!analyticsId) {
      setError("No analytics ID provided");
      return;
    }

    setLoading(true);
    setError("");
    setAnalytics(null);

    try {
      console.log("Loading analytics for ID:", analyticsId);
      const response = await apiService.getAnalytics(analyticsId);
      console.log("Analytics response:", response);

      let data;
      if (typeof response === "string") {
        try {
          data = JSON.parse(response);
        } catch {
          console.error("Failed to parse JSON response:", response);
          throw new Error("Invalid JSON response from server");
        }
      } else {
        data = response;
      }

      console.log("Setting analytics data:", data);
      setAnalytics(data);
    } catch (err) {
      let errorMessage = "Failed to load analytics data";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      console.error("Error loading analytics:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [analyticsId, apiService, mockMode]);

  return { analytics, loading, error, loadAnalytics, apiService };
};

export const useChartsData = (analyticsId: string | null, mockMode: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [chartsOnly, setChartsOnly] = useState<GeneratedChart[]>([]);
  const [error, setError] = useState<string>("");
  const [apiService] = useState(() => new ProcessVideoApiService());

  const loadChartsOnly = useCallback(async () => {
    if (!analyticsId || mockMode) return;

    setLoading(true);
    try {
      const response = await apiService.getAnalyticsCharts(analyticsId);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      setChartsOnly(data);
    } catch (err) {
      setError("Failed to load charts data");
    } finally {
      setLoading(false);
    }
  }, [analyticsId, mockMode, apiService]);

  return { chartsOnly, loading, error, loadChartsOnly };
};

export const useSummaryData = (analyticsId: string | null, mockMode: boolean = false) => {
  const [loading, setLoading] = useState(false);
  const [summaryOnly, setSummaryOnly] = useState(null);
  const [error, setError] = useState<string>("");
  const [apiService] = useState(() => new ProcessVideoApiService());

  const loadSummaryOnly = useCallback(async () => {
    if (!analyticsId || mockMode) return;

    setLoading(true);
    try {
      const response = await apiService.getAnalyticsSummary(analyticsId);
      console.log("Summary response:", response);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      setSummaryOnly(data);
    } catch (err) {
      setError("Failed to load summary data");
    } finally {
      setLoading(false);
    }
  }, [analyticsId, mockMode, apiService]);

  return { summaryOnly, loading, error, loadSummaryOnly };
};

export const useInsightsData = (analyticsId: string | null, mockMode: boolean = false) => {
  const [insights, setInsights] = useState(null);
  const [apiService] = useState(() => new ProcessVideoApiService());

  const loadInsights = useCallback(async () => {
    if (!analyticsId || mockMode) return;

    try {
      const response = await apiService.getAnalyticsInsights(analyticsId);
      setInsights(response);
    } catch (err) {
      console.warn("Failed to load insights:", err);
    }
  }, [analyticsId, mockMode, apiService]);

  return { insights, loadInsights };
};
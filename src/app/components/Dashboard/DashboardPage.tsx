import React, { useState, useEffect } from "react";
import { Video } from "../ProcessVideo/types/types";
import DashboardApiService from "@/helpers/service/dashboard/DashboardApiService";
import ProcessVideoApiService from "@/helpers/service/processvideo/ProcessVideoApiservice";
import VideoMetricsModal from "../ProcessedVideos/pages/VideoMetricsPage";
import VideoThumbnail from "./VideoThumbnail";0
import VideoMetricsPage from "../ProcessedVideos/pages/VideoMetricsPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp, 
  Video as VideoIcon,
  Calendar,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface DashboardPageProps {
  videos?: Video[];
  onNavigate?: (page: string) => void;
}

interface DashboardStats {
  total_profiles: number;
  total_sub_profiles: number;
  total_templates: number;
  total_analytics: number;
  processing_analytics: number;
  completed_analytics: number;
  failed_analytics: number;
  recent_activity: Array<{
    id: number;
    analytics_id?: string;
    status: string;
    created_at: string;
    processing_completed_at: string;
  }>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  videos = [],
  onNavigate,
}) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);



  const dashboardApiService = new DashboardApiService();
  const processVideoApiService = new ProcessVideoApiService();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dashboardApiService.getDashboardStats();
        setDashboardStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
        // Set empty state on error
        setDashboardStats({
          total_profiles: 0,
          total_sub_profiles: 0,
          total_templates: 0,
          total_analytics: 0,
          processing_analytics: 0,
          completed_analytics: 0,
          failed_analytics: 0,
          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [videos.length]);

  const handleViewMetrics = (analyticsId: string) => {
  if (onNavigate) {
    onNavigate('videoMetrics', analyticsId);
  }
};

 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/70 backdrop-blur-sm border-purple-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-8 w-[60px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardStats || {
    total_profiles: 0,
    total_sub_profiles: 0,
    total_templates: 0,
    total_analytics: 0,
    processing_analytics: 0,
    completed_analytics: 0,
    failed_analytics: 0,
    recent_activity: [],
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 hover:from-yellow-200 hover:to-orange-200 border-yellow-200">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 hover:from-red-200 hover:to-pink-200 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100">
      <div className="p-5 space-y-8">
        {/* Header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-2xl"></div>
          <div className="relative space-y-2 p-8 rounded-2xl bg-white/40 backdrop-blur-sm border border-purple-200/50">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xl text-slate-700">
              Welcome back, Gantann! Here's an overview of your video analytics.
            </p>
            {error && (
              <Alert className="border-yellow-200/50 bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {error} - Showing cached data
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Stats Cards with gradient backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Videos</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.total_analytics}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <VideoIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Videos uploaded to your account
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-sm border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Processed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.completed_analytics}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Successfully processed videos
              </p>
            </CardContent>
          </Card>


          <Card className="border-l-4 border-l-red-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white/80 to-red-50/80 backdrop-blur-sm border-red-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Failed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.failed_analytics}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Failed to process
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Videos Section with gradient background */}
        <Card className="bg-gradient-to-br from-white/70 to-purple-50/70 backdrop-blur-sm border-purple-200/50 shadow-lg">
          <CardHeader >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  Recent Videos
                </CardTitle>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => onNavigate?.("videos")}
                className="group bg-gradient-to-r from-purple-100/50 to-blue-100/50 hover:from-purple-200/50 hover:to-blue-200/50 border border-purple-200/50"
              >
                See All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.recent_activity.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.recent_activity.slice(0, 3).map((activity) => (
                  <VideoThumbnail
                    key={activity.id}
                    activity={activity}
                    onClick={(video) => console.log("Video clicked:", video)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-purple-50/30 to-blue-50/30 rounded-xl border border-purple-100/50">
                <VideoIcon className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-lg font-medium text-purple-700 mb-2">No recent videos</h3>
                <p className="text-sm text-purple-600">Upload your first video to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Processed Videos Section with gradient background */}
        <Card className="bg-gradient-to-br from-white/70 to-blue-50/70 backdrop-blur-sm border-blue-200/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full" />
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Recent Processed Videos
                </CardTitle>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => onNavigate?.("processed")}
                className="group bg-gradient-to-r from-blue-100/50 to-purple-100/50 hover:from-blue-200/50 hover:to-purple-200/50 border border-blue-200/50"
              >
                See All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg border border-purple-200/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 hover:from-purple-100/50 hover:to-blue-100/50">
                    <TableHead className="font-semibold text-slate-700">Video Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Processed At</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recent_activity.length > 0 ? (
                    stats.recent_activity.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 transition-all duration-200">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Play className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-slate-700">Video {activity.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {activity.processing_completed_at
                            ? formatDate(activity.processing_completed_at)
                            : "Processing..."}
                        </TableCell>
                        <TableCell>
                          {activity.status === "completed" ? (
                            <Button
                              onClick={() =>
                                handleViewMetrics(
                                  activity.analytics_id || activity.id.toString()
                                )
                              }
                              size="sm"
                              className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              View Metrics
                            </Button>
                          ) : (
                            <span className="text-sm text-slate-500">
                              {activity.status === "processing" ? "Processing..." : "Failed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-2 bg-gradient-to-br from-purple-50/30 to-blue-50/30 rounded-xl p-8 mx-4">
                          <CheckCircle className="h-12 w-12 text-purple-400" />
                          <h3 className="font-medium text-purple-700">No processed videos</h3>
                          <p className="text-sm text-purple-600">Processed videos will appear here</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

  
      </div>
    </div>
  );
};

export default DashboardPage;
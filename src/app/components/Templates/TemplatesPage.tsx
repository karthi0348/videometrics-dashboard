"use client";

import React, { JSX, useEffect, useState } from "react";
import NewTemplateModal from "../Modal/Template/NewTemplateModal";
import TemplateApiService from "@/helpers/service/templates/template-api-service";
import ErrorHandler from "@/helpers/ErrorHandler";
import AssignmentModal from "../Modal/Template/AssignmentModal";
import DeleteModal from "../Common/DeleteModal";
import { toast } from "react-toastify";
import EditTemplateModal from "../Modal/Template/EditTemplateModal";
import TemplateSettingsModal from "../Modal/Template/TemplateSettingsModal";
import { Template } from "@/app/components/Templates/types/templates";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  RefreshCw,
  Settings,
  Edit,
  Trash2,
  Users,
  Eye,
  EyeOff,
  MoreVertical,
  BarChart3,
  FileText,
  Server,
  Lightbulb,
  Zap,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
  TrendingUp
} from "lucide-react";

const TemplatesPage: React.FC = () => {
  const templateApiService: TemplateApiService = new TemplateApiService();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEditTemplateId, setSelectedEditTemplateId] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<any>("");
  const [filterVisibility, setFilterVisibility] = useState<any>("");
  const [tempId, setTempId] = useState<any>(null);
  const [showAssignments, setShowAssignments] = useState<boolean>(false);
  const [templates, setTemplates] = useState<any>([]);
  const [assesmentInfo, setAssesmentInfo] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delete state
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenSettings = (template: Template) => {
    setSelectedTemplate(template);
    setShowSettingsModal(true);
  };

  const handleOpenAssignment = (template: Template) => {
    setSelectedTemplate(template);
    setShowAssignmentModal(true);
  };

  const toggleAssignments = async (templateId: string) => {
    try {
      if (!showAssignments) {
        let res = await templateApiService.getSubProfileAssignments(templateId);
        setAssesmentInfo(res);
        setTempId(templateId);
        setShowAssignments(true);
      } else {
        setAssesmentInfo([]);
        setTempId(null);
        setShowAssignments(false);
      }
    } catch (err: any) {
      setAssesmentInfo([]);
      return ErrorHandler(err);
    }
  };

  const handleOpenEdit = (id: any) => {
    setShowEditModal(true);
    setSelectedEditTemplateId(id);
  };

  const handleDelete = async () => {
    if (selectedId) {
      setDeleteLoading(true);
      try {
        await templateApiService.deleteTemplate(selectedId);
        toast.success("Template Deleted Successfully", {
          containerId: "TR",
        });
        await getAllTemplate();
        setDeleteModal(false);
        return;
      } catch (error: any) {
        return ErrorHandler(error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const deleteTemplate = (id: any) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      "chart-bar": <BarChart3 className="h-5 w-5" />,
      clipboard: <FileText className="h-5 w-5" />,
      server: <Server className="h-5 w-5" />,
      lightbulb: <Lightbulb className="h-5 w-5" />,
      "lightning-bolt": <Zap className="h-5 w-5" />,
      "lock-closed": <Lock className="h-5 w-5" />,
    };
    return icons[iconName] || icons["chart-bar"];
  };

  const getColorClasses = (color: string) => {
    const colorMap: {
      [key: string]: { 
        bg: string; 
        text: string; 
        badge: string; 
        hover: string;
        gradient: string;
        border: string;
      };
    } = {
      purple: {
        bg: "bg-gradient-to-br from-purple-100/50 to-purple-200/30",
        text: "text-purple-600",
        badge: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300",
        hover: "hover:from-purple-200/50 hover:to-purple-300/30",
        gradient: "from-purple-500 to-purple-600",
        border: "border-purple-200/50"
      },
      blue: {
        bg: "bg-gradient-to-br from-blue-100/50 to-blue-200/30",
        text: "text-blue-600",
        badge: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300",
        hover: "hover:from-blue-200/50 hover:to-blue-300/30",
        gradient: "from-blue-500 to-blue-600",
        border: "border-blue-200/50"
      },
      green: {
        bg: "bg-gradient-to-br from-green-100/50 to-green-200/30",
        text: "text-green-600",
        badge: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300",
        hover: "hover:from-green-200/50 hover:to-green-300/30",
        gradient: "from-green-500 to-green-600",
        border: "border-green-200/50"
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-100/50 to-orange-200/30",
        text: "text-orange-600",
        badge: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300",
        hover: "hover:from-orange-200/50 hover:to-orange-300/30",
        gradient: "from-orange-500 to-orange-600",
        border: "border-orange-200/50"
      },
      red: {
        bg: "bg-gradient-to-br from-red-100/50 to-red-200/30",
        text: "text-red-600",
        badge: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300",
        hover: "hover:from-red-200/50 hover:to-red-300/30",
        gradient: "from-red-500 to-red-600",
        border: "border-red-200/50"
      },
    };
    return colorMap[color] || colorMap.purple;
  };

  const getAllTemplate = async () => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append("search_query", searchQuery);
      }
      if (filterStatus) {
        params.append("status_filter", filterStatus);
      }
      if (filterVisibility) {
        params.append("visibility_filter", filterVisibility);
      }
      params.append("page", page.toString());
      params.append("page_size", pageSize.toString());
      params.append("sort_by", "created_at");
      params.append("sort_order", "desc");

      const url = `?${params.toString()}`;
      let result = await templateApiService.getAllTemplate(url);

      if (result && typeof result === "object") {
        if (Array.isArray(result)) {
          setTemplates(result);
          setTotalCount(result.length);
        } else if (result.data && Array.isArray(result.data)) {
          setTemplates(result.data);
          setTotalCount(result.total || result.totalCount || result.count || result.data.length);
        } else if (result.templates && Array.isArray(result.templates)) {
          setTemplates(result.templates);
          setTotalCount(result.total || result.totalCount || result.count || result.templates.length);
        } else {
          setTemplates([]);
          setTotalCount(0);
        }
      } else {
        setTemplates([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      setTemplates([]);
      setTotalCount(0);
      toast.error("Failed to refresh templates", { containerId: "TR" });
      return ErrorHandler(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    await getAllTemplate();
  };

  useEffect(() => {
    getAllTemplate();
  }, [searchQuery, filterStatus, filterVisibility, page, pageSize]);

  if (isRefreshing && templates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[500px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>
        <div className="relative p-6 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Analytics Templates
                  </h1>
                  <p className="text-xl text-slate-600">
                    Create and manage analysis templates for your video content
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-white/50 border-purple-200/50 hover:bg-purple-50/50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg"
                  >
                    <Plus className="w-2 h-2 mr-2" />
                    New Template
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mt-8 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-white/50 border-purple-200/50">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterVisibility || "all"} onValueChange={(value) => setFilterVisibility(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-full lg:w-[180px] bg-white/50 border-purple-200/50">
                    <Eye className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visibility</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <span className="text-slate-600">Total: <span className="font-semibold text-slate-800">{totalCount}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span className="text-slate-600">Active: <span className="font-semibold text-green-700">{templates.filter((t: any) => t.status === "active").length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  <span className="text-slate-600">Beta: <span className="font-semibold text-yellow-700">{templates.filter((t: any) => t.status === "beta").length}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="px-6 pb-6">
        {templates.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No templates found
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchQuery || filterStatus || filterVisibility
                  ? "Try adjusting your filters or search criteria to find what you're looking for"
                  : "Get started by creating your first analytics template to analyze your video content"}
              </p>
              {!searchQuery && !filterStatus && !filterVisibility && (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template: any) => {
              const colorClasses = getColorClasses(template.color);
              return (
                <Card
                  key={template.id}
                  className={`group bg-white/80 backdrop-blur-sm ${colorClasses.border} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <div className={`${colorClasses.text}`}>
                            {getIcon(template.icon)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSettings(template)}
                              className="p-1 h-auto hover:bg-purple-100"
                            >
                              <Settings className="w-4 h-4 text-slate-400 hover:text-purple-600" />
                            </Button>
                            <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                              {template.template_name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${template.is_public ? colorClasses.badge : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300"} text-xs`}
                            >
                              {template.is_public ? (
                                <><Eye className="w-3 h-3 mr-1" />Public</>
                              ) : (
                                <><EyeOff className="w-3 h-3 mr-1" />Private</>
                              )}
                            </Badge>
                            <Badge 
                              className={`text-xs ${template.status === "active" 
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300" 
                                : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300"}`}
                            >
                              {template.status === "active" ? "Active" : "Beta"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleOpenEdit(template.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-slate-600 text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag: any, index: any) => (
                          <Badge key={index} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-gradient-to-r from-slate-50/50 to-purple-50/50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">Uses</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{template.usage_count || 0}</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">Assigned</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{template.assignedProfiles || 0}</span>
                      </div>
                    </div>

                    {/* Current Assignments Section */}
                    {tempId === template.id && showAssignments && (
                      <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-200/50">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Current Assignments
                          </h4>
                          {assesmentInfo.length > 0 ? (
                            <div className="space-y-2">
                              {assesmentInfo.map((item: any, idx: any) => (
                                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg border border-purple-100/50">
                                  <span className="text-sm text-slate-700">Sub-Profile: {item.sub_profile_id}</span>
                                  <Badge variant="outline" className="text-xs">Priority: {item.priority}</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                              <p className="text-sm text-slate-500">No assignments found</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200/50 hover:from-purple-100 hover:to-blue-100 text-purple-700"
                      >
                        Use Template
                      </Button>
                      <Button
                        onClick={() => handleOpenAssignment(template)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                      <Button
                        onClick={() => toggleAssignments(template.id)}
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-slate-50 to-purple-50 border-purple-200/50 hover:from-slate-100 hover:to-purple-100"
                      >
                        {tempId === template.id && showAssignments ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 0 && (
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="bg-white/50 border-purple-200/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Page {page} of {Math.ceil(totalCount / pageSize) || 1}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev)}
                    disabled={page >= Math.ceil(totalCount / pageSize) || totalCount === 0}
                    className="bg-white/50 border-purple-200/50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-white/50 border-purple-200/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="6">6 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
        )}
      </div>

      {/* Modals */}
      <NewTemplateModal
        isOpen={showModal}
        refresh={getAllTemplate}
        onClose={() => setShowModal(false)}
      />

      <EditTemplateModal
        isEditOpen={showEditModal}
        refresh={getAllTemplate}
        id={selectedEditTemplateId}
        onClose={() => setShowEditModal(false)}
      />

      <TemplateSettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          getAllTemplate();
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        isLoading={deleteLoading}
        onCloseClick={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default TemplatesPage;
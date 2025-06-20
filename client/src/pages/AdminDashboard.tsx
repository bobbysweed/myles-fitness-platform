import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Calendar,
  Users,
  Clock,
  Check,
  X,
  Eye,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  PoundSterling,
} from "lucide-react";
import { BusinessWithUser, FitnessSessionWithDetails } from "@shared/schema";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch admin stats
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === 'admin',
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Fetch pending businesses
  const { data: pendingBusinesses = [] } = useQuery({
    queryKey: ["/api/admin/businesses/pending"],
    enabled: isAuthenticated && user?.role === 'admin',
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Fetch pending sessions
  const { data: pendingSessions = [] } = useQuery({
    queryKey: ["/api/admin/sessions/pending"],
    enabled: isAuthenticated && user?.role === 'admin',
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Business approval mutation
  const businessApprovalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/businesses/${id}/approve`, { approved });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approved ? "Business Approved" : "Business Rejected",
        description: variables.approved 
          ? "The business has been approved and notified."
          : "The business application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Action Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Session approval mutation
  const sessionApprovalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/sessions/${id}/approve`, { approved });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approved ? "Session Approved" : "Session Rejected",
        description: variables.approved 
          ? "The session has been approved and is now live."
          : "The session has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Action Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const totalPendingApprovals = (stats.pendingBusinesses || 0) + (stats.pendingSessions || 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Admin Dashboard</h1>
              <p className="text-neutral-600 mt-1">Platform management and approvals</p>
            </div>
            <div className="flex items-center space-x-3">
              {totalPendingApprovals > 0 && (
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {totalPendingApprovals} Pending Approvals
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Total Businesses</p>
                  <p className="text-2xl font-bold text-neutral-800">{stats.totalBusinesses || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Calendar className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-neutral-800">{stats.totalSessions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-800">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-neutral-800">{totalPendingApprovals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Business Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Business Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBusinesses.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No pending business approvals.
                  </p>
                ) : (
                  pendingBusinesses.map((business: BusinessWithUser) => (
                    <div key={business.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-neutral-800">{business.name}</h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-sm text-neutral-600 mb-3 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{business.address}, {business.postcode}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{business.user?.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{business.phone}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-white"
                          onClick={() => businessApprovalMutation.mutate({ id: business.id, approved: true })}
                          disabled={businessApprovalMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => businessApprovalMutation.mutate({ id: business.id, approved: false })}
                          disabled={businessApprovalMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Session Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Session Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingSessions.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No pending session approvals.
                  </p>
                ) : (
                  pendingSessions.map((session: FitnessSessionWithDetails) => (
                    <div key={session.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-neutral-800">{session.title}</h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-sm text-neutral-600 mb-3 space-y-1">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{session.business?.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{session.duration} minutes • {session.difficulty}</span>
                        </div>
                        <div className="flex items-center">
                          <PoundSterling className="w-4 h-4 mr-2" />
                          <span>£{parseFloat(session.price).toFixed(2)} per session</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Max {session.maxParticipants} participants</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-white"
                          onClick={() => sessionApprovalMutation.mutate({ id: session.id, approved: true })}
                          disabled={sessionApprovalMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => sessionApprovalMutation.mutate({ id: session.id, approved: false })}
                          disabled={sessionApprovalMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

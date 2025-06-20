import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  Star,
  PoundSterling,
  Plus,
  Edit,
  Eye,
  Pause,
  CalendarCheck,
  AlertCircle,
  User,
  CheckCircle,
} from "lucide-react";
import { BusinessWithUser, FitnessSessionWithDetails, BookingWithDetails } from "@shared/schema";
import { BusinessFormData, SessionFormData } from "@/lib/types";
import EnhancedBusinessForm from "@/components/EnhancedBusinessForm";
import EnhancedSessionForm from "@/components/EnhancedSessionForm";

const businessFormSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  postcode: z.string().min(5, "Valid UK postcode is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  
  // Social media links
  facebookUrl: z.string().url("Valid Facebook URL is required").optional().or(z.literal("")),
  instagramUrl: z.string().url("Valid Instagram URL is required").optional().or(z.literal("")),
  twitterUrl: z.string().url("Valid Twitter URL is required").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Valid YouTube URL is required").optional().or(z.literal("")),
  
  // Business details
  businessType: z.string().min(1, "Business type is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  ageRanges: z.array(z.string()).min(1, "At least one age range is required"),
  difficultyLevels: z.array(z.string()).min(1, "At least one difficulty level is required"),
  amenities: z.array(z.string()),
});



export default function BusinessDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  // Redirect to login if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's businesses
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ["/api/businesses/my"],
    enabled: isAuthenticated,
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

  // Fetch session types
  const { data: sessionTypes = [] } = useQuery({
    queryKey: ["/api/session-types"],
  });

  const approvedBusiness = businesses.find((b: BusinessWithUser) => b.approved);
  const hasBusiness = businesses.length > 0;
  const hasApprovedBusiness = !!approvedBusiness;

  // Fetch sessions for approved business
  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/sessions/business", approvedBusiness?.id],
    enabled: hasApprovedBusiness,
  });

  // Fetch recent bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings/business", approvedBusiness?.id],
    enabled: hasApprovedBusiness,
  });

  // Business form
  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      postcode: "",
      phone: "",
      email: "",
      website: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      businessType: "",
      specialties: [],
      ageRanges: [],
      difficultyLevels: [],
      amenities: [],
    },
  });



  // Create business mutation
  const createBusinessMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      const response = await apiRequest("POST", "/api/businesses", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Business Registered!",
        description: "Your business has been submitted for approval. You'll be notified once it's reviewed.",
      });
      setShowBusinessForm(false);
      businessForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/my"] });
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
        title: "Registration Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionFormData) => {
      const sessionData = {
        ...data,
        businessId: approvedBusiness?.id,
      };
      const response = await apiRequest("POST", "/api/sessions", sessionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Created!",
        description: "Your session has been submitted for approval.",
      });
      setShowSessionForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/business", approvedBusiness?.id] });
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
        title: "Session Creation Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || businessesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If no business registered
  if (!hasBusiness) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-neutral-800 mb-4">Welcome to MYLES Business</h1>
              <p className="text-neutral-600 mb-6">
                Register your fitness business to start offering sessions to our community.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowBusinessForm(true)}
              >
                Register Your Business
              </Button>
              
              {showBusinessForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                    <EnhancedBusinessForm
                      onSubmit={(data) => {
                        createBusinessMutation.mutate(data);
                        setShowBusinessForm(false);
                      }}
                      isLoading={createBusinessMutation.isPending}
                      onCancel={() => setShowBusinessForm(false)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Business Dashboard</h1>
              <p className="text-neutral-600 mt-1">Manage your fitness sessions and bookings</p>
            </div>
            <div className="flex items-center space-x-3">
              {!hasApprovedBusiness && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending Approval
                </Badge>
              )}
              {hasApprovedBusiness && (
                <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Session</DialogTitle>
                    </DialogHeader>
                    <EnhancedSessionForm
                      onSubmit={(data) => createSessionMutation.mutate(data)}
                      isLoading={createSessionMutation.isPending}
                      onCancel={() => setShowSessionForm(false)}
                      sessionTypes={sessionTypes || []}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {hasApprovedBusiness && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subscription Status Banner */}
            <div className="lg:col-span-3 mb-6">
              {approvedBusiness && !approvedBusiness.bookingEnabled ? (
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                            Free Listing Active
                          </h3>
                          <p className="text-yellow-700 mb-3">
                            Your business is listed for customers to discover, but they can't book sessions online yet. 
                            Upgrade to enable booking functionality and start accepting payments.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-yellow-700">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Business profile visible
                            </span>
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                              Online booking disabled
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => window.location.href = `/checkout/subscription?businessId=${approvedBusiness.id}&tier=basic`}
                        >
                          Upgrade to Basic - £29/month
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                          onClick={() => window.location.href = `/checkout/subscription?businessId=${approvedBusiness.id}&tier=premium`}
                        >
                          Premium Pro - £79/month
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : approvedBusiness && approvedBusiness.bookingEnabled ? (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-800 mb-1">
                            {approvedBusiness.subscriptionTier === 'basic' ? 'Basic Booking' : 'Premium Pro'} Plan Active
                          </h3>
                          <p className="text-green-700">
                            Online booking enabled • Payment processing active • Customer management available
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">
                        Booking Enabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="text-primary text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-neutral-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-neutral-800">{sessions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-neutral-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-neutral-800">{bookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <PoundSterling className="text-green-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-neutral-600">Revenue</p>
                      <p className="text-2xl font-bold text-neutral-800">
                        £{bookings.reduce((sum: number, booking: any) => sum + parseFloat(booking.totalAmount || "0"), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="text-yellow-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-neutral-600">Avg Rating</p>
                      <p className="text-2xl font-bold text-neutral-800">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sessions Management */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Sessions</CardTitle>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessions.length === 0 ? (
                      <p className="text-neutral-500 text-center py-8">
                        No sessions created yet. Click "Add Session" to get started.
                      </p>
                    ) : (
                      sessions.map((session: FitnessSessionWithDetails) => (
                        <div key={session.id} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-neutral-800">{session.title}</h3>
                            <Badge 
                              variant={session.approved ? "default" : "secondary"}
                              className={session.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            >
                              {session.approved ? "Published" : "Pending"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mb-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{session.duration} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Max {session.maxParticipants}</span>
                            </div>
                            <div className="flex items-center">
                              <PoundSterling className="w-4 h-4 mr-2" />
                              <span>£{parseFloat(session.price).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-2" />
                              <span>4.8 rating</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-neutral-500 text-center py-8">
                        No bookings yet.
                      </p>
                    ) : (
                      bookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                            <User className="text-primary text-sm" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-neutral-800 text-sm">
                              {booking.user?.firstName} {booking.user?.lastName}
                            </p>
                            <p className="text-xs text-neutral-600">
                              {booking.session?.title} • {new Date(booking.sessionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            £{parseFloat(booking.totalAmount || "0").toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Pending Approval State */}
        {!hasApprovedBusiness && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Business Under Review</h2>
              <p className="text-neutral-600 mb-4">
                Your business registration is currently being reviewed by our team. 
                You'll be notified via email once it's approved.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-neutral-800 mb-2">Business Details:</h3>
                <p><strong>Name:</strong> {businesses[0]?.name}</p>
                <p><strong>Address:</strong> {businesses[0]?.address}</p>
                <p><strong>Postcode:</strong> {businesses[0]?.postcode}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

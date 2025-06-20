import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Star,
  Lock,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { FitnessSessionWithDetails } from "@shared/schema";

// Validate Stripe public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('VITE_STRIPE_PUBLIC_KEY is not configured');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  specialRequirements: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

function CheckoutForm({ session }: { session: FitnessSessionWithDetails }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
      email: user?.email || "",
      phone: "",
      specialRequirements: "",
    },
  });

  const platformFee = parseFloat(session.price) * 0.1;
  const totalAmount = parseFloat(session.price) + platformFee;

  // Create payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: totalAmount,
        sessionId: session.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
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
        title: "Payment Setup Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Create booking
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/bookings", {
        sessionId: session.id,
        sessionDate: new Date().toISOString(), // This should be selected by user
        totalAmount: totalAmount,
        specialRequirements: data.specialRequirements,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your session has been booked successfully. You'll receive a confirmation email shortly.",
      });
      setLocation("/search");
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
        title: "Booking Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Initialize payment intent when component mounts
  useEffect(() => {
    createPaymentIntentMutation.mutate();
  }, []);

  const handleSubmit = async (data: BookingFormData) => {
    if (!stripe || !elements || !clientSecret) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      } else {
        // Create booking record
        await createBookingMutation.mutateAsync(data);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/search")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-2xl font-bold text-neutral-800">Complete Your Booking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Session Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-primary text-4xl font-bold">
                    {session.sessionType?.name?.[0] || 'F'}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-800 text-lg mb-2">{session.title}</h3>
                  <p className="text-neutral-600 text-sm mb-4">{session.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                    <div>
                      <p className="font-medium">{session.business?.name}</p>
                      <p className="text-neutral-600">{session.business?.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-neutral-500" />
                    <span>{session.duration} minutes</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-neutral-500" />
                    <span>Max {session.maxParticipants} participants</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>4.8 rating</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyColor(session.difficulty)}>
                    {session.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    Age {session.ageGroup}
                  </Badge>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Fee</span>
                    <span>£{parseFloat(session.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Fee</span>
                    <span>£{platformFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">£{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Booking & Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          {...form.register("fullName")}
                          placeholder="Enter your full name"
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          placeholder="Enter your email"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...form.register("phone")}
                          placeholder="Enter your phone number"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
                        <Textarea
                          id="specialRequirements"
                          {...form.register("specialRequirements")}
                          placeholder="Any specific needs or requests..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-4">Payment Method</h3>
                    {clientSecret ? (
                      <div className="border border-neutral-200 rounded-lg p-4">
                        <PaymentElement />
                      </div>
                    ) : (
                      <div className="border border-neutral-200 rounded-lg p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm text-neutral-600">Setting up payment...</p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold"
                    disabled={!stripe || !clientSecret || isProcessing || form.formState.isSubmitting}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing Payment..." : `Book & Pay £${totalAmount.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-neutral-500 text-center">
                    Your payment is secured by Stripe. By booking, you agree to our Terms of Service and cancellation policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { sessionId } = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a session.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch session details
  const { data: session, isLoading: sessionLoading, error } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId && isAuthenticated,
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Session not found');
      }
      return response.json();
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
        title: "Session Not Found",
        description: "The session you're trying to book could not be found.",
        variant: "destructive",
      });
      setLocation("/search");
    },
  });

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm session={session} />
    </Elements>
  );
}

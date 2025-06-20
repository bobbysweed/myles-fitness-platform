import { useState } from "react";
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { FitnessSessionWithDetails } from "@shared/schema";
import { BookingFormData } from "@/lib/types";
import { MapPin, Clock, Calendar, Lock, LogIn } from "lucide-react";

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  specialRequirements: z.string().optional(),
});

interface BookingModalProps {
  session: FitnessSessionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  clientSecret?: string;
}

export default function BookingModal({ session, isOpen, onClose, clientSecret }: BookingModalProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
      email: user?.email || "",
      phone: "",
      specialRequirements: "",
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: number; sessionId: number }) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", data);
      return response.json();
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your session has been booked successfully. You'll receive a confirmation email shortly.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: BookingFormData) => {
    if (!session) return;
    
    // Check if Stripe is properly configured
    if (!stripe || !elements) {
      toast({
        title: "Payment System Error",
        description: "Payment system is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent if not provided
      let paymentClientSecret = clientSecret;
      if (!paymentClientSecret) {
        const platformFee = parseFloat(session.price) * 0.1; // 10% platform fee
        const totalAmount = parseFloat(session.price) + platformFee;
        
        const paymentIntent = await createPaymentIntentMutation.mutateAsync({
          amount: totalAmount,
          sessionId: session.id,
        });
        paymentClientSecret = paymentIntent.clientSecret;
      }

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
        await createBookingMutation.mutateAsync({
          sessionId: session.id,
          sessionDate: new Date(), // This should be selected by user
          totalAmount: parseFloat(session.price) + (parseFloat(session.price) * 0.1),
          specialRequirements: data.specialRequirements,
        });
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

  if (!session) return null;

  const platformFee = parseFloat(session.price) * 0.1;
  const totalAmount = parseFloat(session.price) + platformFee;

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to log in to book a fitness session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6">
              <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="text-neutral-600 mb-4">
                Please log in to continue with your booking for "{session?.title}".
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full"
              >
                Log in to Book Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Session</DialogTitle>
          <DialogDescription>
            Complete your booking for {session?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Details */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                <div className="text-primary text-lg font-bold">
                  {session.sessionType?.name?.[0] || 'F'}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-800 mb-1">{session.title}</h3>
                <p className="text-sm text-neutral-600 mb-2">{session.business?.name}</p>
                <div className="flex items-center space-x-4 text-sm text-neutral-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Next available</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{session.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{session.business?.address}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">£{parseFloat(session.price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Booking Form */}
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

            {/* Payment Summary */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <h4 className="font-semibold text-neutral-800 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Session Fee</span>
                  <span className="text-neutral-800">£{parseFloat(session.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Platform Fee</span>
                  <span className="text-neutral-800">£{platformFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-neutral-800">Total</span>
                  <span className="text-primary text-lg">£{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {clientSecret && (
              <div>
                <h4 className="font-semibold text-neutral-800 mb-3">Payment Method</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>Test Mode:</strong> Use card number 4242 4242 4242 4242 with any future expiry and CVC for testing.
                  </p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                  <PaymentElement />
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold"
              disabled={!stripe || isProcessing || form.formState.isSubmitting}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : `Book & Pay £${totalAmount.toFixed(2)}`}
            </Button>

            <p className="text-xs text-neutral-500 text-center">
              By booking, you agree to our Terms of Service and cancellation policy
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

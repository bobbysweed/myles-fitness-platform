import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Check, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function SubscriptionCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/business`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated!",
      });
      setLocation("/business");
    }

    setIsProcessing(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl">Complete Your Subscription</CardTitle>
        <p className="text-sm text-neutral-600">
          Enable booking functionality for your business
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Online booking system
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Payment processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Customer management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Email notifications
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? "Processing..." : "Complete Subscription"}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/business")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionCheckout() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [subscriptionTier, setSubscriptionTier] = useState<string>("");

  useEffect(() => {
    // Get client secret from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('clientSecret');
    const tier = urlParams.get('tier');
    
    if (secret) {
      setClientSecret(secret);
    }
    
    if (tier) {
      setSubscriptionTier(tier);
    }
  }, []);

  if (!clientSecret) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Payment Session</h1>
            <p className="text-neutral-600 mb-6">
              This payment session has expired or is invalid.
            </p>
            <Button onClick={() => window.location.href = "/business"}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              Subscription Upgrade
            </h1>
            <p className="text-neutral-600">
              Complete your payment to enable booking functionality
            </p>
            {subscriptionTier && (
              <Badge className="mt-2">
                {subscriptionTier === 'basic' ? 'Basic Booking Plan' : 'Premium Pro Plan'}
              </Badge>
            )}
          </div>

          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#3b82f6',
                }
              }
            }}
          >
            <SubscriptionCheckoutForm />
          </Elements>
        </div>
      </div>
    </Layout>
  );
}
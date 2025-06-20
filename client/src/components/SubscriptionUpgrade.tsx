import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  Zap, 
  Users, 
  Calendar, 
  CreditCard,
  Star,
  Crown,
  Shield
} from "lucide-react";

interface SubscriptionUpgradeProps {
  currentTier: string;
  bookingEnabled: boolean;
  onUpgrade: (tier: string) => void;
  isLoading?: boolean;
}

const plans = [
  {
    id: "free",
    name: "Free Listing",
    price: "£0",
    period: "forever",
    icon: Shield,
    color: "bg-gray-100 text-gray-800",
    description: "Get your business discovered",
    features: [
      { name: "Business profile listing", included: true },
      { name: "Contact information display", included: true },
      { name: "Social media links", included: true },
      { name: "Basic business details", included: true },
      { name: "Search visibility", included: true },
      { name: "Online booking system", included: false },
      { name: "Session management", included: false },
      { name: "Payment processing", included: false },
      { name: "Customer management", included: false },
      { name: "Analytics & insights", included: false },
    ],
    limitations: [
      "Customers contact you directly",
      "No automated booking",
      "No payment processing"
    ]
  },
  {
    id: "basic",
    name: "Basic Booking",
    price: "£29",
    period: "per month",
    icon: Star,
    color: "bg-blue-100 text-blue-800",
    description: "Enable online bookings",
    popular: true,
    features: [
      { name: "Everything in Free", included: true },
      { name: "Online booking system", included: true },
      { name: "Session management", included: true },
      { name: "Payment processing", included: true },
      { name: "Customer management", included: true },
      { name: "Email notifications", included: true },
      { name: "Up to 50 bookings/month", included: true },
      { name: "Basic analytics", included: true },
      { name: "Advanced analytics", included: false },
      { name: "Priority support", included: false },
    ],
    benefits: [
      "Automated booking confirmations",
      "Secure payment processing",
      "Customer database management"
    ]
  },
  {
    id: "premium",
    name: "Premium Pro",
    price: "£79",
    period: "per month",
    icon: Crown,
    color: "bg-purple-100 text-purple-800",
    description: "Full business management",
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Unlimited bookings", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority support", included: true },
      { name: "Custom branding", included: true },
      { name: "Multiple locations", included: true },
      { name: "Staff management", included: true },
      { name: "Advanced reporting", included: true },
      { name: "API access", included: true },
      { name: "White-label options", included: true },
    ],
    benefits: [
      "Complete business automation",
      "Advanced insights & reporting",
      "Priority customer support"
    ]
  }
];

export default function SubscriptionUpgrade({ 
  currentTier, 
  bookingEnabled, 
  onUpgrade, 
  isLoading 
}: SubscriptionUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === currentTier) || plans[0];
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentPlan.color}`}>
                <currentPlan.icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Current Plan: {currentPlan.name}</CardTitle>
                <p className="text-sm text-neutral-600">{currentPlan.description}</p>
              </div>
            </div>
            <Badge variant={bookingEnabled ? "default" : "secondary"}>
              {bookingEnabled ? "Booking Enabled" : "Listing Only"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!bookingEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Upgrade to Enable Bookings
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Your business is listed for free, but customers can't book sessions online. 
                    Upgrade to enable booking functionality and start accepting payments.
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {currentPlan.limitations?.map((limitation, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <X className="w-3 h-3" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Choose Your Plan</h2>
          <p className="text-neutral-600">
            Start free and upgrade when you're ready to accept online bookings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentTier;
            const PlanIcon = plan.icon;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all hover:shadow-md ${
                  plan.popular ? 'border-2 border-primary' : ''
                } ${isCurrentPlan ? 'ring-2 ring-primary/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${plan.color}`}>
                    <PlanIcon className="w-6 h-6" />
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-neutral-600 mb-4">{plan.description}</p>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-neutral-800">
                      {plan.price}
                    </div>
                    <div className="text-sm text-neutral-500">{plan.period}</div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Features List */}
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-neutral-300" />
                          )}
                          <span className={feature.included ? "text-neutral-800" : "text-neutral-400"}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Benefits */}
                    {plan.benefits && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-800 mb-2">Key Benefits:</h4>
                          <ul className="space-y-1">
                            {plan.benefits.map((benefit, index) => (
                              <li key={index} className="text-xs text-neutral-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Action Button */}
                    <div className="pt-2">
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : plan.id === "free" ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled={currentTier !== "free"}
                        >
                          {currentTier === "free" ? "Current Plan" : "Downgrade"}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => onUpgrade(plan.id)}
                          disabled={isLoading}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {isLoading ? "Processing..." : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-neutral-800 mb-1">
                What happens with the free plan?
              </h4>
              <p className="text-neutral-600">
                Your business will be listed in our directory with contact information. 
                Customers can find you but will need to contact you directly to book sessions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-1">
                When do I need to upgrade?
              </h4>
              <p className="text-neutral-600">
                Upgrade when you want customers to book sessions online and pay through our platform. 
                This enables automated booking confirmations and payment processing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-neutral-800 mb-1">
                Can I cancel anytime?
              </h4>
              <p className="text-neutral-600">
                Yes, you can cancel your subscription anytime. Your booking functionality will remain 
                active until the end of your billing period, then revert to free listing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
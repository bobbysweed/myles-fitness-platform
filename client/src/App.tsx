import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import BusinessDashboard from "@/pages/BusinessDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BusinessClaim from "@/pages/BusinessClaim";
import Checkout from "@/pages/Checkout";
import SubscriptionCheckout from "@/pages/SubscriptionCheckout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import BookingConfirmation from "@/pages/BookingConfirmation";
import About from "@/pages/About";
import PersonalTrainers from "@/pages/PersonalTrainers";
import TrainerSignup from "@/pages/TrainerSignup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading only for the first request, not for 401 errors
  if (isLoading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={isAuthenticated ? Home : Landing} />
        <Route path="/search" component={Search} />
        <Route path="/personal-trainers" component={PersonalTrainers} />
        <Route path="/trainer-signup" component={TrainerSignup} />
        <Route path="/claim-business" component={BusinessClaim} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        {isAuthenticated && (
          <>
            <Route path="/business" component={BusinessDashboard} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/checkout/:sessionId" component={Checkout} />
            <Route path="/checkout/subscription" component={SubscriptionCheckout} />
            <Route path="/booking-confirmation" component={BookingConfirmation} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

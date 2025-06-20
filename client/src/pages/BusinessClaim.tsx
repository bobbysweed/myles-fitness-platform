import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  FileText,
  Search
} from "lucide-react";

const claimFormSchema = z.object({
  claimMessage: z.string().min(20, "Please provide a detailed explanation (minimum 20 characters)"),
  verificationDocuments: z.array(z.string()).optional(),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface UnclaimedBusiness {
  id: number;
  name: string;
  description?: string;
  address: string;
  postcode: string;
  phone?: string;
  email?: string;
  website?: string;
  businessType?: string;
  claimed: boolean;
  manuallyAdded: boolean;
  createdAt: Date;
}

export default function BusinessClaim() {
  const [selectedBusiness, setSelectedBusiness] = useState<UnclaimedBusiness | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch unclaimed businesses
  const { data: unclaimedBusinesses = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/businesses/unclaimed"],
    retry: false,
  });

  // Claim form
  const claimForm = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimMessage: "",
      verificationDocuments: [],
    },
  });

  // Claim business mutation
  const claimBusinessMutation = useMutation({
    mutationFn: async (data: ClaimFormData & { businessId: number }) => {
      return await apiRequest("POST", `/api/businesses/${data.businessId}/claim`, {
        claimMessage: data.claimMessage,
        verificationDocuments: data.verificationDocuments,
      });
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted",
        description: "Your business claim request has been submitted for review.",
      });
      setShowClaimForm(false);
      setSelectedBusiness(null);
      claimForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/unclaimed"] });
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
        title: "Error",
        description: "Failed to submit claim request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter businesses based on search
  const filteredBusinesses = unclaimedBusinesses.filter((business: UnclaimedBusiness) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.postcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClaimBusiness = (business: UnclaimedBusiness) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to log in to claim a business.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    setSelectedBusiness(business);
    setShowClaimForm(true);
  };

  const submitClaim = (data: ClaimFormData) => {
    if (!selectedBusiness) return;
    
    claimBusinessMutation.mutate({
      ...data,
      businessId: selectedBusiness.id,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Claim Your Business</h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Find your fitness business in our directory and claim ownership to start managing your profile and sessions.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <Input
              placeholder="Search by business name, address, or postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-600">Loading unclaimed businesses...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredBusinesses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                {searchQuery ? "No businesses found" : "No unclaimed businesses"}
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchQuery 
                  ? "Try adjusting your search terms or browse all businesses below."
                  : "All businesses in our directory have been claimed by their owners."
                }
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Business List */}
        {!isLoading && filteredBusinesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business: UnclaimedBusiness) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-neutral-800 mb-1">
                        {business.name}
                      </CardTitle>
                      {business.businessType && (
                        <Badge variant="secondary" className="mb-2">
                          {business.businessType}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Unclaimed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {business.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-neutral-600">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                        <span className="truncate">{business.address}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-neutral-600">
                        <Building2 className="w-4 h-4 mr-2 text-neutral-400" />
                        <span>{business.postcode}</span>
                      </div>

                      {business.phone && (
                        <div className="flex items-center text-sm text-neutral-600">
                          <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                          <span>{business.phone}</span>
                        </div>
                      )}

                      {business.website && (
                        <div className="flex items-center text-sm text-neutral-600">
                          <Globe className="w-4 h-4 mr-2 text-neutral-400" />
                          <span className="truncate">{business.website}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-neutral-500">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                        <span>Added {new Date(business.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Separator />

                    <Button 
                      onClick={() => handleClaimBusiness(business)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim This Business
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Claim Form Dialog */}
        <Dialog open={showClaimForm} onOpenChange={setShowClaimForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Claim Business: {selectedBusiness?.name}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={claimForm.handleSubmit(submitClaim)} className="space-y-6">
              {selectedBusiness && (
                <Card className="bg-neutral-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-neutral-800 mb-2">Business Details</h4>
                    <div className="text-sm text-neutral-600 space-y-1">
                      <p><strong>Name:</strong> {selectedBusiness.name}</p>
                      <p><strong>Address:</strong> {selectedBusiness.address}</p>
                      <p><strong>Postcode:</strong> {selectedBusiness.postcode}</p>
                      {selectedBusiness.businessType && (
                        <p><strong>Type:</strong> {selectedBusiness.businessType}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="claimMessage">
                  Why are you claiming this business? *
                </Label>
                <Textarea
                  id="claimMessage"
                  {...claimForm.register("claimMessage")}
                  placeholder="Please explain your relationship to this business (e.g., owner, manager, authorized representative). Include any verification details..."
                  rows={4}
                  className="mt-1"
                />
                {claimForm.formState.errors.claimMessage && (
                  <p className="text-sm text-red-600 mt-1">
                    {claimForm.formState.errors.claimMessage.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Verification Process
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>After submitting your claim, our team will:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Review your claim request</li>
                    <li>Verify your relationship to the business</li>
                    <li>Contact you if additional documentation is needed</li>
                    <li>Approve the claim once verified</li>
                  </ul>
                  <p className="font-medium mt-3">
                    This process typically takes 1-3 business days.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowClaimForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={claimBusinessMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {claimBusinessMutation.isPending ? "Submitting..." : "Submit Claim"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
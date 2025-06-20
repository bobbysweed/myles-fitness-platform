import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MapComponent from "@/components/MapComponent";
import SessionCard from "@/components/SessionCard";
import BookingModal from "@/components/BookingModal";
import { FitnessSessionWithDetails } from "@shared/schema";
import { SearchFilters, SessionLocation } from "@/lib/types";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

// Validate Stripe public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('VITE_STRIPE_PUBLIC_KEY is not configured');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

export default function SearchPage() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      postcode: params.get('postcode') || '',
      sessionType: params.get('sessionType') || '',
      ageGroup: params.get('ageGroup') || '',
      difficulty: params.get('difficulty') || '',
      priceRange: params.get('priceRange') || '',
    };
  });

  const [selectedSession, setSelectedSession] = useState<FitnessSessionWithDetails | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch sessions based on search params
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['/api/sessions/search', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const response = await fetch(`/api/sessions/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
  });

  // Convert sessions to map locations
  const sessionLocations: SessionLocation[] = sessions.map((session: FitnessSessionWithDetails) => ({
    id: session.id,
    title: session.title,
    business: session.business?.name || '',
    latitude: parseFloat(session.business?.latitude || '51.5074'),
    longitude: parseFloat(session.business?.longitude || '-0.1278'),
    price: parseFloat(session.price),
    rating: 4.8, // TODO: Calculate from reviews
    difficulty: session.difficulty,
    sessionType: session.sessionType?.name || '',
  }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Update URL without navigation
    const newUrl = `/search?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleBookSession = (session: FitnessSessionWithDetails) => {
    setSelectedSession(session);
    setShowBookingModal(true);
  };

  const handleSessionClick = (sessionLocation: SessionLocation) => {
    const session = sessions.find((s: FitnessSessionWithDetails) => s.id === sessionLocation.id);
    if (session) {
      setSelectedSession(session);
      setShowBookingModal(true);
    }
  };

  // Update map center when postcode changes
  useEffect(() => {
    if (searchParams.postcode) {
      // TODO: Implement postcode geocoding
      // For now, default to London
      setMapCenter([51.5074, -0.1278]);
    }
  }, [searchParams.postcode]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Filters Sidebar */}
        <div className={`lg:w-80 bg-white border-r border-neutral-200 p-6 overflow-y-auto custom-scrollbar ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-800">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchParams({
                    postcode: '',
                    sessionType: '',
                    ageGroup: '',
                    difficulty: '',
                    priceRange: '',
                  });
                }}
                className="text-primary"
              >
                Clear All
              </Button>
            </div>

            {/* Location Search */}
            <div>
              <Label className="text-sm font-medium text-neutral-800 mb-2 block">Location</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter postcode"
                  value={searchParams.postcode}
                  onChange={(e) => setSearchParams({...searchParams, postcode: e.target.value})}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Activity Type Filter */}
            <div>
              <Label className="text-sm font-medium text-neutral-800 mb-3 block">Activity Type</Label>
              <div className="space-y-2">
                {['Gym', 'Yoga', 'Pilates', 'BJJ', 'HIIT', 'Running'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={searchParams.sessionType === type.toLowerCase()}
                      onCheckedChange={(checked) => {
                        setSearchParams({
                          ...searchParams,
                          sessionType: checked ? type.toLowerCase() : ''
                        });
                      }}
                    />
                    <Label htmlFor={type} className="text-sm text-neutral-600 cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <Label className="text-sm font-medium text-neutral-800 mb-3 block">Difficulty Level</Label>
              <div className="space-y-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={searchParams.difficulty === level.toLowerCase()}
                      onCheckedChange={(checked) => {
                        setSearchParams({
                          ...searchParams,
                          difficulty: checked ? level.toLowerCase() : ''
                        });
                      }}
                    />
                    <Label htmlFor={level} className="text-sm text-neutral-600 cursor-pointer">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Group Filter */}
            <div>
              <Label className="text-sm font-medium text-neutral-800 mb-3 block">Age Group</Label>
              <div className="space-y-2">
                {['2-5', '6-12', '13-17', '18-25', '26-35', '36-50', '50+', 'Family'].map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <Checkbox
                      id={age}
                      checked={searchParams.ageGroup === age}
                      onCheckedChange={(checked) => {
                        setSearchParams({
                          ...searchParams,
                          ageGroup: checked ? age : ''
                        });
                      }}
                    />
                    <Label htmlFor={age} className="text-sm text-neutral-600 cursor-pointer">
                      {age === 'Family' ? 'Family Sessions' : 
                       age === '2-5' ? 'Toddlers (2-5)' :
                       age === '6-12' ? 'Children (6-12)' :
                       age === '13-17' ? 'Teens (13-17)' :
                       age === '50+' ? 'Seniors (50+)' : `Age ${age}`}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <Label className="text-sm font-medium text-neutral-800 mb-3 block">Price Range</Label>
              <div className="space-y-2">
                {['£0-10', '£10-25', '£25-50', '£50+'].map((price) => (
                  <div key={price} className="flex items-center space-x-2">
                    <Checkbox
                      id={price}
                      checked={searchParams.priceRange === price}
                      onCheckedChange={(checked) => {
                        setSearchParams({
                          ...searchParams,
                          priceRange: checked ? price : ''
                        });
                      }}
                    />
                    <Label htmlFor={price} className="text-sm text-neutral-600 cursor-pointer">
                      {price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Session List */}
          <div className="lg:w-1/2 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-neutral-800">
                    {sessions.length} sessions found
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          <div className="w-32 h-32 bg-gray-200 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-red-600">Failed to load sessions. Please try again.</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Session Cards */}
              {!isLoading && !error && (
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-neutral-600">No sessions found matching your criteria.</p>
                        <p className="text-sm text-neutral-500 mt-2">
                          Try adjusting your filters or search in a different area.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    sessions.map((session: FitnessSessionWithDetails) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onBook={handleBookSession}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map View */}
          <div className="lg:w-1/2 h-96 lg:h-full">
            <MapComponent
              center={mapCenter}
              zoom={13}
              sessions={sessionLocations}
              onSessionClick={handleSessionClick}
            />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <BookingModal
            session={selectedSession}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedSession(null);
            }}
          />
        </Elements>
      ) : (
        <BookingModal
          session={selectedSession}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
}

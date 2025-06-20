import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MapComponent from "@/components/MapComponent";
import { Search, MapPin, Crosshair } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [postcode, setPostcode] = useState("");
  const [filters, setFilters] = useState({
    sessionType: "",
    ageGroup: "",
    difficulty: "",
    priceRange: "",
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (postcode) searchParams.set('postcode', postcode);
    if (filters.sessionType) searchParams.set('sessionType', filters.sessionType);
    if (filters.ageGroup) searchParams.set('ageGroup', filters.ageGroup);
    if (filters.difficulty) searchParams.set('difficulty', filters.difficulty);
    if (filters.priceRange) searchParams.set('priceRange', filters.priceRange);
    
    setLocation(`/search?${searchParams.toString()}`);
  };

  const popularSearches = [
    "Yoga in London",
    "Personal Training",
    "BJJ Classes",
    "Pilates Near Me"
  ];

  return (
    <>
      <div className="relative min-h-screen">
      {/* Background Map Container */}
      <div className="absolute inset-0 z-0">
        <MapComponent
          center={[51.5074, -0.1278]}
          zoom={11}
          interactive={false}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>
      
      {/* Search Interface Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Find Your Perfect
            <span className="text-primary block">Fitness Session</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Discover local fitness classes, personal training, and group sessions in your area
          </p>
        </div>

        {/* Central Search Interface */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="space-y-6">
            {/* Postcode Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                <MapPin className="inline w-4 h-4 text-primary mr-2" />
                Where are you looking?
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter postcode (e.g., SW1A 1AA)"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="w-full pr-12 text-lg h-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary"
                  onClick={() => {
                    // TODO: Implement geolocation
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        // TODO: Reverse geocode to get postcode
                        console.log("Current position:", position.coords);
                      });
                    }
                  }}
                >
                  <Crosshair className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select value={filters.sessionType} onValueChange={(value) => setFilters({...filters, sessionType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="bjj">BJJ</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.ageGroup} onValueChange={(value) => setFilters({...filters, ageGroup: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-5">Toddlers (2-5)</SelectItem>
                  <SelectItem value="6-12">Children (6-12)</SelectItem>
                  <SelectItem value="13-17">Teens (13-17)</SelectItem>
                  <SelectItem value="18-25">Young Adults (18-25)</SelectItem>
                  <SelectItem value="26-35">Adults (26-35)</SelectItem>
                  <SelectItem value="36-50">Adults (36-50)</SelectItem>
                  <SelectItem value="50+">Seniors (50+)</SelectItem>
                  <SelectItem value="Family">Family Sessions</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10">£0-10</SelectItem>
                  <SelectItem value="10-25">£10-25</SelectItem>
                  <SelectItem value="25-50">£25-50</SelectItem>
                  <SelectItem value="50+">£50+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Sessions
            </Button>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 mb-3">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearches.map((search, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 cursor-pointer"
                onClick={() => {
                  // Parse the search term and fill filters
                  if (search.includes("Yoga")) {
                    setFilters({...filters, sessionType: "yoga"});
                  } else if (search.includes("Personal Training")) {
                    setFilters({...filters, sessionType: "personal-training"});
                  } else if (search.includes("BJJ")) {
                    setFilters({...filters, sessionType: "bjj"});
                  } else if (search.includes("Pilates")) {
                    setFilters({...filters, sessionType: "pilates"});
                  }
                  
                  if (search.includes("London")) {
                    setPostcode("SW1A 1AA");
                  }
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* How It Works Section */}
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">How It Works</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Get started with MYLES in just a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* For Users */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-8 text-center">For Fitness Seekers</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Discover Local Sessions</h4>
                  <p className="text-neutral-600">Use the interactive map or session list to explore local exercise classes—like BJJ, Reformer Pilates, gym circuits, and more.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Filter by What Matters</h4>
                  <p className="text-neutral-600">Narrow down by activity type, age group, difficulty level, price, or location to find the perfect fit.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Book Instantly Online (if Available)</h4>
                  <p className="text-neutral-600">If a business is verified, reserve your spot in seconds. Payment is handled securely through Stripe, and you'll get an instant email confirmation.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Show Up and Get Moving</h4>
                  <p className="text-neutral-600">Just arrive at the time and place shown in your booking—no need to bring anything else. Enjoy your session!</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-8 text-center">For Local Instructors & Businesses</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Sign Up for Free</h4>
                  <p className="text-neutral-600">Be listed on our directory so more potential customers can find your sessions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Claim Your Business</h4>
                  <p className="text-neutral-600">Register as a business to list your classes or sessions and let us handle your bookings.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Submit Your Sessions</h4>
                  <p className="text-neutral-600">Add details like time, price, activity type, location, and level. We'll review them to ensure they meet our community guidelines.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Get Approved and Go Live</h4>
                  <p className="text-neutral-600">Once approved, your sessions will appear on the map and in search results. You'll be notified by email when they go live.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-1">Manage Bookings with Ease</h4>
                  <p className="text-neutral-600">Track attendees, receive payments via Stripe, and grow your local presence—all from your business dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

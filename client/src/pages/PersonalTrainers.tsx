import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  User,
  Filter,
  Calendar
} from "lucide-react";
import { PersonalTrainerWithUser } from "@shared/schema";

export default function PersonalTrainers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const { data: trainers = [], isLoading } = useQuery<PersonalTrainerWithUser[]>({
    queryKey: ["/api/personal-trainers/search", { 
      search: searchTerm, 
      specialty: selectedSpecialty,
      location: selectedLocation,
      maxRate 
    }],
  });

  const specialties = [
    "Weight Loss", "Strength Training", "Yoga", "Pilates", "Cardio",
    "Bodybuilding", "Functional Training", "Sports Performance", 
    "Rehabilitation", "Nutrition Coaching", "Senior Fitness", "Youth Training"
  ];

  const handleBookTrainer = (trainer: PersonalTrainerWithUser) => {
    window.location.href = `/book-trainer/${trainer.id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Personal Trainer
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect with certified personal trainers in your area for one-on-one or small group sessions
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase().replace(" ", "_")}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Max rate (£/hour)"
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {trainers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">No trainers found</h3>
              <p className="text-neutral-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                        {trainer.profileImageUrl ? (
                          <img 
                            src={trainer.profileImageUrl} 
                            alt={`${trainer.firstName} ${trainer.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {trainer.firstName} {trainer.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <MapPin className="w-4 h-4" />
                          <span>{trainer.location || "Location not specified"}</span>
                        </div>
                        {trainer.experience && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Clock className="w-4 h-4" />
                            <span>{trainer.experience} years experience</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {trainer.bio && (
                      <p className="text-neutral-600 text-sm line-clamp-3">
                        {trainer.bio}
                      </p>
                    )}
                    
                    {trainer.specialties && Array.isArray(trainer.specialties) && (
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {trainer.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{trainer.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {trainer.certifications && Array.isArray(trainer.certifications) && (
                      <div className="flex flex-wrap gap-1">
                        {trainer.certifications.slice(0, 2).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          £{trainer.hourlyRate}/hour
                        </span>
                      </div>
                      
                      {trainer.bookingEnabled ? (
                        <Button 
                          onClick={() => handleBookTrainer(trainer)}
                          size="sm"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book Now
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Contact Directly
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Become a Trainer CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Personal Trainer?</h2>
          <p className="text-xl mb-8">
            Join our platform and connect with clients looking for expert fitness guidance
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/trainer-signup'}
          >
            Join as a Trainer
          </Button>
        </div>
      </section>
    </div>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Users } from "lucide-react";
import { FitnessSessionWithDetails } from "@shared/schema";

interface SessionCardProps {
  session: FitnessSessionWithDetails;
  onBook?: (session: FitnessSessionWithDetails) => void;
  onViewDetails?: (session: FitnessSessionWithDetails) => void;
}

export default function SessionCard({ session, onBook, onViewDetails }: SessionCardProps) {
  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className="flex">
          {/* Image placeholder */}
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-primary text-2xl font-bold">
              {session.sessionType?.name?.[0] || 'F'}
            </div>
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-neutral-800 text-lg">{session.title}</h3>
              <span className="text-xl font-bold text-primary">£{formatPrice(session.price)}</span>
            </div>
            
            <div className="flex items-center text-sm text-neutral-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{session.business?.name}</span>
              {session.business?.address && (
                <span className="ml-2 text-neutral-500">• {session.business.address}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>4.8</span>
              </div>
              <Badge className={getDifficultyColor(session.difficulty)}>
                {session.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Age {session.ageGroup}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{session.duration}min</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Max {session.maxParticipants}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(session);
                    }}
                  >
                    View Details
                  </Button>
                )}
                {onBook && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook(session);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

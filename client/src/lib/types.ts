export interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  admin_county: string;
  admin_ward: string;
  parish: string;
  parliamentary_constituency: string;
  ccg: string;
  ced: string;
  nuts: string;
  codes: {
    admin_district: string;
    admin_county: string;
    admin_ward: string;
    parish: string;
    parliamentary_constituency: string;
    ccg: string;
    ced: string;
    nuts: string;
  };
}

export interface SearchFilters {
  postcode: string;
  sessionType: string;
  ageGroup: string;
  difficulty: string;
  priceRange: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface SessionLocation {
  id: number;
  title: string;
  business: string;
  latitude: number;
  longitude: number;
  price: number;
  rating: number;
  difficulty: string;
  sessionType: string;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  specialRequirements?: string;
}

export interface BusinessFormData {
  name: string;
  description: string;
  address: string;
  postcode: string;
  phone: string;
  email?: string;
  website?: string;
  
  // Social media links
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  
  // Business details
  businessType: string;
  specialties: string[];
  ageRanges: string[];
  difficultyLevels: string[];
  amenities: string[];
}

export interface BusinessClaimData {
  businessId: number;
  claimMessage: string;
  verificationDocuments?: string[];
}

export interface SessionFormData {
  title: string;
  description: string;
  sessionTypeId: number;
  difficulty: string[]; // ['beginner', 'intermediate', 'advanced'] or ['all_levels']
  ageGroups: string[]; // ['18-25', '26-35', '36-50', '50+'] or ['all_ages']
  gender: 'mixed' | 'female_only' | 'male_only';
  price: number;
  duration: number;
  maxParticipants: number;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

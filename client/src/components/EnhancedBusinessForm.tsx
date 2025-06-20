import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Users,
  Target,
  Dumbbell,
  Wifi,
  X
} from "lucide-react";
import { BusinessFormData } from "@/lib/types";

const businessFormSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  postcode: z.string().min(5, "Valid UK postcode is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  
  // Social media links
  facebookUrl: z.string().url("Valid Facebook URL is required").optional().or(z.literal("")),
  instagramUrl: z.string().url("Valid Instagram URL is required").optional().or(z.literal("")),
  twitterUrl: z.string().url("Valid Twitter URL is required").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Valid YouTube URL is required").optional().or(z.literal("")),
  
  // Business details
  businessType: z.string().min(1, "Business type is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  ageRanges: z.array(z.string()).min(1, "At least one age range is required"),
  difficultyLevels: z.array(z.string()).min(1, "At least one difficulty level is required"),
  amenities: z.array(z.string()),
});

interface EnhancedBusinessFormProps {
  onSubmit: (data: BusinessFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const businessTypes = [
  "Gym",
  "Fitness Studio", 
  "Personal Training",
  "Outdoor Fitness",
  "Martial Arts",
  "Dance Studio",
  "Yoga Studio",
  "Pilates Studio",
  "CrossFit Box",
  "Swimming Pool",
  "Sports Club",
  "Wellness Center"
];

const specialtyOptions = [
  "Weight Training",
  "Cardio",
  "HIIT",
  "Yoga",
  "Pilates",
  "Boxing",
  "Martial Arts",
  "Dance",
  "Swimming",
  "Running",
  "Cycling",
  "CrossFit",
  "Functional Training",
  "Rehabilitation",
  "Nutrition Coaching",
  "Personal Training",
  "Group Classes",
  "Sports Specific Training"
];

const ageRangeOptions = [
  "Under 18",
  "18-25",
  "26-35", 
  "36-50",
  "50+",
  "All Ages"
];

const difficultyOptions = [
  "Beginner",
  "Intermediate", 
  "Advanced",
  "All Levels"
];

const amenityOptions = [
  "Changing Rooms",
  "Showers",
  "Parking",
  "WiFi",
  "Air Conditioning",
  "Equipment Rental",
  "Lockers",
  "Refreshments",
  "Childcare",
  "Disabled Access",
  "First Aid",
  "Music System",
  "Mirrors",
  "Mats Provided",
  "Towel Service"
];

export default function EnhancedBusinessForm({ onSubmit, isLoading, onCancel }: EnhancedBusinessFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      postcode: "",
      phone: "",
      email: "",
      website: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      businessType: "",
      specialties: [],
      ageRanges: [],
      difficultyLevels: [],
      amenities: [],
    },
  });

  const handleArrayToggle = (field: keyof BusinessFormData, value: string) => {
    const currentValues = form.getValues(field) as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    form.setValue(field, newValues);
  };

  const removeArrayItem = (field: keyof BusinessFormData, value: string) => {
    const currentValues = form.getValues(field) as string[];
    const newValues = currentValues.filter(v => v !== value);
    form.setValue(field, newValues);
  };

  const steps = [
    { 
      title: "Basic Information", 
      icon: Building2,
      description: "Tell us about your business"
    },
    { 
      title: "Contact & Social", 
      icon: Globe,
      description: "How can people reach you?"
    },
    { 
      title: "Business Details", 
      icon: Target,
      description: "What services do you offer?"
    },
    { 
      title: "Facilities & Amenities", 
      icon: Dumbbell,
      description: "What facilities do you have?"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your business name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe your business, services, and what makes you unique..."
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={form.watch("businessType")}
                onValueChange={(value) => form.setValue("businessType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.businessType && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.businessType.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="Full address"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  {...form.register("postcode")}
                  placeholder="SW1A 1AA"
                />
                {form.formState.errors.postcode && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.postcode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex">
                  <Phone className="w-4 h-4 text-gray-400 mt-3 mr-3" />
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="+44 20 7946 0958"
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex">
                  <Mail className="w-4 h-4 text-gray-400 mt-3 mr-3" />
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="info@yourbusiness.com"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <div className="flex">
                <Globe className="w-4 h-4 text-gray-400 mt-3 mr-3" />
                <Input
                  id="website"
                  {...form.register("website")}
                  placeholder="https://www.yourbusiness.com"
                />
              </div>
              {form.formState.errors.website && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.website.message}
                </p>
              )}
            </div>

            <Separator />
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Social Media (Optional)</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <div className="flex">
                    <Facebook className="w-4 h-4 text-blue-600 mt-3 mr-3" />
                    <Input
                      id="facebookUrl"
                      {...form.register("facebookUrl")}
                      placeholder="https://facebook.com/yourbusiness"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <div className="flex">
                    <Instagram className="w-4 h-4 text-pink-600 mt-3 mr-3" />
                    <Input
                      id="instagramUrl"
                      {...form.register("instagramUrl")}
                      placeholder="https://instagram.com/yourbusiness"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <div className="flex">
                    <Twitter className="w-4 h-4 text-blue-400 mt-3 mr-3" />
                    <Input
                      id="twitterUrl"
                      {...form.register("twitterUrl")}
                      placeholder="https://twitter.com/yourbusiness"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="youtubeUrl">YouTube</Label>
                  <div className="flex">
                    <Youtube className="w-4 h-4 text-red-600 mt-3 mr-3" />
                    <Input
                      id="youtubeUrl"
                      {...form.register("youtubeUrl")}
                      placeholder="https://youtube.com/@yourbusiness"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Specialties * (What services do you offer?)</Label>
              <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialtyOptions.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty}
                      checked={form.watch("specialties").includes(specialty)}
                      onCheckedChange={() => handleArrayToggle("specialties", specialty)}
                    />
                    <Label htmlFor={specialty} className="text-sm cursor-pointer">
                      {specialty}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("specialties").map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeArrayItem("specialties", specialty)}
                    />
                  </Badge>
                ))}
              </div>
              {form.formState.errors.specialties && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.specialties.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold">Age Groups * (Who do you cater to?)</Label>
              <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ageRangeOptions.map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <Checkbox
                      id={age}
                      checked={form.watch("ageRanges").includes(age)}
                      onCheckedChange={() => handleArrayToggle("ageRanges", age)}
                    />
                    <Label htmlFor={age} className="text-sm cursor-pointer">
                      {age}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("ageRanges").map((age) => (
                  <Badge key={age} variant="secondary" className="flex items-center gap-1">
                    {age}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeArrayItem("ageRanges", age)}
                    />
                  </Badge>
                ))}
              </div>
              {form.formState.errors.ageRanges && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.ageRanges.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold">Difficulty Levels * (What levels do you teach?)</Label>
              <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {difficultyOptions.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={form.watch("difficultyLevels").includes(level)}
                      onCheckedChange={() => handleArrayToggle("difficultyLevels", level)}
                    />
                    <Label htmlFor={level} className="text-sm cursor-pointer">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("difficultyLevels").map((level) => (
                  <Badge key={level} variant="secondary" className="flex items-center gap-1">
                    {level}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeArrayItem("difficultyLevels", level)}
                    />
                  </Badge>
                ))}
              </div>
              {form.formState.errors.difficultyLevels && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.difficultyLevels.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Facilities & Amenities</Label>
              <p className="text-sm text-gray-600 mb-4">What facilities and amenities do you offer? (Optional)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={form.watch("amenities").includes(amenity)}
                      onCheckedChange={() => handleArrayToggle("amenities", amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("amenities").map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeArrayItem("amenities", amenity)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Review Your Registration</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Please review your information before submitting. Your business will be reviewed by our team before being approved.
                </p>
                <div className="text-sm text-blue-600">
                  <p><strong>Business:</strong> {form.watch("name")}</p>
                  <p><strong>Type:</strong> {form.watch("businessType")}</p>
                  <p><strong>Specialties:</strong> {form.watch("specialties").join(", ") || "None selected"}</p>
                  <p><strong>Age Groups:</strong> {form.watch("ageRanges").join(", ") || "None selected"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-primary text-white"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
                {stepNumber < steps.length && (
                  <div className={`h-0.5 mt-6 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                
                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit for Review"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
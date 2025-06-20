import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, Award, MapPin, DollarSign, Clock } from "lucide-react";

const trainerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  certifications: z.array(z.string()).optional(),
  experience: z.number().min(0, "Experience must be positive"),
  hourlyRate: z.number().min(10, "Hourly rate must be at least £10"),
  location: z.string().min(1, "Location is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  availableDays: z.array(z.number()).min(1, "Select at least one available day"),
  preferredTimes: z.array(z.string()).min(1, "Select at least one preferred time"),
  sessionTypes: z.array(z.string()).min(1, "Select at least one session type"),
  travelRadius: z.number().min(1, "Travel radius must be at least 1km"),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

const specialtyOptions = [
  "Weight Loss", "Strength Training", "Yoga", "Pilates", "Cardio",
  "Bodybuilding", "Functional Training", "Sports Performance", 
  "Rehabilitation", "Nutrition Coaching", "Senior Fitness", "Youth Training",
  "Marathon Training", "CrossFit", "Martial Arts", "Dance Fitness"
];

const certificationOptions = [
  "NASM", "ACE", "ACSM", "NSCA", "ISSA", "REPS", "CIMSPA", 
  "Level 2 Fitness Instructor", "Level 3 Personal Trainer", 
  "Yoga Alliance RYT-200", "Yoga Alliance RYT-500", "First Aid Certified"
];

const timeOptions = [
  { value: "morning", label: "Morning (6AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { value: "evening", label: "Evening (6PM - 10PM)" }
];

const sessionTypeOptions = [
  { value: "one_on_one", label: "One-on-One Training" },
  { value: "small_group", label: "Small Group (2-4 people)" },
  { value: "online", label: "Online Sessions" }
];

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TrainerSignup() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>([]);

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: "",
      specialties: [],
      certifications: [],
      experience: 0,
      hourlyRate: 50,
      location: "",
      phoneNumber: "",
      availableDays: [],
      preferredTimes: [],
      sessionTypes: [],
      travelRadius: 10,
    },
  });

  const createTrainerMutation = useMutation({
    mutationFn: async (data: TrainerFormData) => {
      const response = await apiRequest("POST", "/api/personal-trainers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your trainer profile has been submitted for review. You'll be notified once it's approved.",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to apply as a trainer.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Application Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const toggleSpecialty = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(updated);
    form.setValue("specialties", updated);
  };

  const toggleCertification = (cert: string) => {
    const updated = selectedCertifications.includes(cert)
      ? selectedCertifications.filter(c => c !== cert)
      : [...selectedCertifications, cert];
    setSelectedCertifications(updated);
    form.setValue("certifications", updated);
  };

  const toggleDay = (day: number) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    form.setValue("availableDays", updated);
  };

  const toggleTime = (time: string) => {
    const updated = selectedTimes.includes(time)
      ? selectedTimes.filter(t => t !== time)
      : [...selectedTimes, time];
    setSelectedTimes(updated);
    form.setValue("preferredTimes", updated);
  };

  const toggleSessionType = (type: string) => {
    const updated = selectedSessionTypes.includes(type)
      ? selectedSessionTypes.filter(t => t !== type)
      : [...selectedSessionTypes, type];
    setSelectedSessionTypes(updated);
    form.setValue("sessionTypes", updated);
  };

  const onSubmit = (data: TrainerFormData) => {
    createTrainerMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-neutral-600">
              You need to be signed in to apply as a personal trainer.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Become a Personal Trainer on MYLES
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join our platform and start connecting with clients looking for expert fitness guidance
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  {...form.register("bio")}
                  placeholder="Tell potential clients about yourself, your experience, and your training philosophy..."
                  rows={4}
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.phoneNumber.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    {...form.register("experience", { valueAsNumber: true })}
                  />
                  {form.formState.errors.experience && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.experience.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (£) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="10"
                    step="5"
                    {...form.register("hourlyRate", { valueAsNumber: true })}
                  />
                  {form.formState.errors.hourlyRate && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.hourlyRate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Specialties * (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialtyOptions.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
                {form.formState.errors.specialties && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.specialties.message}</p>
                )}
              </div>

              <div>
                <Label>Certifications (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {certificationOptions.map((cert) => (
                    <Badge
                      key={cert}
                      variant={selectedCertifications.includes(cert) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCertification(cert)}
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location and Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location and Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location/Area You Serve *</Label>
                  <Input
                    id="location"
                    {...form.register("location")}
                    placeholder="e.g., Central London, Manchester City Centre"
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.location.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="travelRadius">Travel Radius (km) *</Label>
                  <Input
                    id="travelRadius"
                    type="number"
                    min="1"
                    {...form.register("travelRadius", { valueAsNumber: true })}
                  />
                  {form.formState.errors.travelRadius && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.travelRadius.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Available Days * (Select all that apply)</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {dayNames.map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(index)}
                      className="text-xs"
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.availableDays && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.availableDays.message}</p>
                )}
              </div>

              <div>
                <Label>Preferred Times * (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {timeOptions.map((time) => (
                    <Button
                      key={time.value}
                      type="button"
                      variant={selectedTimes.includes(time.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTime(time.value)}
                    >
                      {time.label}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.preferredTimes && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.preferredTimes.message}</p>
                )}
              </div>

              <div>
                <Label>Session Types * (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {sessionTypeOptions.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={selectedSessionTypes.includes(type.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSessionType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.sessionTypes && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.sessionTypes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.location.href = "/"}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTrainerMutation.isPending}
            >
              {createTrainerMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
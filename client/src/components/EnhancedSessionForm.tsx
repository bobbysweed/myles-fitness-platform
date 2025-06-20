import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Users, Calendar } from "lucide-react";
import type { SessionFormData } from "@/lib/types";

// Enhanced session form schema
const sessionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sessionTypeId: z.number().min(1, "Session type is required"),
  difficulty: z.array(z.string()).min(1, "At least one difficulty level is required"),
  ageGroups: z.array(z.string()).min(1, "At least one age group is required"),
  gender: z.enum(["mixed", "female_only", "male_only"]),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant"),
  schedule: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
  })).min(1, "At least one session time is required"),
});

interface EnhancedSessionFormProps {
  onSubmit: (data: SessionFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
  sessionTypes: Array<{ id: number; name: string; description?: string }>;
}

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
];

const ageGroupOptions = [
  { value: "18-25", label: "18-25 years" },
  { value: "26-35", label: "26-35 years" },
  { value: "36-50", label: "36-50 years" },
  { value: "50+", label: "50+ years" },
  { value: "all_ages", label: "All Ages" },
];

const genderOptions = [
  { value: "mixed", label: "Mixed (All Genders)" },
  { value: "female_only", label: "Female Only" },
  { value: "male_only", label: "Male Only" },
];

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "AM" : "PM";
  return {
    value: time24,
    label: `${hour12}:${minute} ${ampm}`,
  };
});

const daysOfWeek = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function EnhancedSessionForm({ 
  onSubmit, 
  isLoading, 
  onCancel, 
  sessionTypes 
}: EnhancedSessionFormProps) {
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      sessionTypeId: 0,
      difficulty: ["beginner"],
      ageGroups: ["18-25"],
      gender: "mixed",
      price: 0,
      duration: 60,
      maxParticipants: 10,
      schedule: [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(["beginner"]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(["18-25"]);

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    let newDifficulties: string[] = [];
    
    if (difficulty === "all_levels") {
      newDifficulties = checked ? ["all_levels"] : [];
    } else {
      newDifficulties = checked
        ? [...selectedDifficulties.filter(d => d !== "all_levels"), difficulty]
        : selectedDifficulties.filter(d => d !== difficulty);
    }
    
    setSelectedDifficulties(newDifficulties);
    form.setValue("difficulty", newDifficulties);
  };

  const handleAgeGroupChange = (ageGroup: string, checked: boolean) => {
    let newAgeGroups: string[] = [];
    
    if (ageGroup === "all_ages") {
      newAgeGroups = checked ? ["all_ages"] : [];
    } else {
      newAgeGroups = checked
        ? [...selectedAgeGroups.filter(a => a !== "all_ages"), ageGroup]
        : selectedAgeGroups.filter(a => a !== ageGroup);
    }
    
    setSelectedAgeGroups(newAgeGroups);
    form.setValue("ageGroups", newAgeGroups);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Morning Yoga Flow"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your session, what to expect, what to bring..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="sessionTypeId">Session Type *</Label>
            <Select onValueChange={(value) => form.setValue("sessionTypeId", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.sessionTypeId && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.sessionTypeId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Who Can Attend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Difficulty Level *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {difficultyOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${option.value}`}
                    checked={selectedDifficulties.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleDifficultyChange(option.value, checked === true)
                    }
                  />
                  <Label htmlFor={`difficulty-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedDifficulties.map((difficulty) => (
                <Badge key={difficulty} variant="secondary">
                  {difficultyOptions.find(d => d.value === difficulty)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Age Groups *</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {ageGroupOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`age-${option.value}`}
                    checked={selectedAgeGroups.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleAgeGroupChange(option.value, checked === true)
                    }
                  />
                  <Label htmlFor={`age-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedAgeGroups.map((age) => (
                <Badge key={age} variant="secondary">
                  {ageGroupOptions.find(a => a.value === age)?.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gender Requirements</Label>
            <Select onValueChange={(value: "mixed" | "female_only" | "male_only") => form.setValue("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender requirements" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Session Logistics */}
      <Card>
        <CardHeader>
          <CardTitle>Session Logistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("price", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                {...form.register("duration", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="maxParticipants">Max Participants *</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                {...form.register("maxParticipants", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Session Times
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <Select 
                  onValueChange={(value) => 
                    form.setValue(`schedule.${index}.dayOfWeek`, parseInt(value))
                  }
                  defaultValue={field.dayOfWeek.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  onValueChange={(value) => 
                    form.setValue(`schedule.${index}.startTime`, value)
                  }
                  defaultValue={field.startTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  onValueChange={(value) => 
                    form.setValue(`schedule.${index}.endTime`, value)
                  }
                  defaultValue={field.endTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Time Slot
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating Session..." : "Create Session"}
        </Button>
      </div>
    </form>
  );
}
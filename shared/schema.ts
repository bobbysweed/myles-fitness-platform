import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // user, business, admin
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // nullable for manually added businesses
  name: varchar("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  postcode: varchar("postcode").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  email: varchar("email"),
  
  // Social media links
  facebookUrl: varchar("facebook_url"),
  instagramUrl: varchar("instagram_url"),
  twitterUrl: varchar("twitter_url"),
  youtubeUrl: varchar("youtube_url"),
  
  // Business details
  businessType: varchar("business_type"), // gym, studio, outdoor, personal_trainer, etc.
  specialties: jsonb("specialties"), // array of specialties
  ageRanges: jsonb("age_ranges"), // array of age ranges they cater to
  difficultyLevels: jsonb("difficulty_levels"), // array of difficulty levels offered
  amenities: jsonb("amenities"), // facilities, equipment, etc.
  
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Status
  approved: boolean("approved").default(false),
  claimed: boolean("claimed").default(false),
  manuallyAdded: boolean("manually_added").default(false),
  
  // Subscription tiers
  subscriptionTier: varchar("subscription_tier").default("free"), // free, basic, premium
  bookingEnabled: boolean("booking_enabled").default(false), // requires paid subscription
  subscriptionExpiry: timestamp("subscription_expiry"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session types
export const sessionTypes = pgTable("session_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fitness sessions
export const fitnessSessions = pgTable("fitness_sessions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  sessionTypeId: integer("session_type_id").notNull().references(() => sessionTypes.id),
  title: varchar("title").notNull(),
  description: text("description"),
  difficulty: jsonb("difficulty").notNull(), // array: ["beginner", "intermediate", "advanced"] or ["all_levels"]
  ageGroups: jsonb("age_groups").notNull(), // array: ["18-25", "26-35", "36-50", "50+"] or ["all_ages"]
  gender: varchar("gender").notNull().default("mixed"), // mixed, female_only, male_only
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  maxParticipants: integer("max_participants").notNull(),
  schedule: jsonb("schedule").notNull(), // {dayOfWeek: number, startTime: string, endTime: string}[]
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").notNull().references(() => fitnessSessions.id),
  sessionDate: timestamp("session_date").notNull(),
  status: varchar("status").notNull().default("confirmed"), // confirmed, cancelled, completed
  paymentIntentId: varchar("payment_intent_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  specialRequirements: text("special_requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business claims for manually added businesses
export const businessClaims = pgTable("business_claims", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  claimMessage: text("claim_message"), // Why they are claiming this business
  verificationDocuments: jsonb("verification_documents"), // Array of document URLs/info
  status: varchar("status").default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personal trainers
export const personalTrainers = pgTable("personal_trainers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  bio: text("bio"),
  specialties: jsonb("specialties").notNull(),
  certifications: jsonb("certifications"),
  experience: integer("experience"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  location: varchar("location"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  email: varchar("email"),
  availableDays: jsonb("available_days"),
  preferredTimes: jsonb("preferred_times"),
  sessionTypes: jsonb("session_types"),
  travelRadius: integer("travel_radius"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  bookingEnabled: boolean("booking_enabled").default(false),
  approved: boolean("approved").default(false),
  featured: boolean("featured").default(false),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trainer bookings
export const trainerBookings = pgTable("trainer_bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  trainerId: integer("trainer_id").notNull().references(() => personalTrainers.id),
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull(),
  sessionType: varchar("session_type").notNull(),
  location: varchar("location"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("confirmed"),
  notes: text("notes"),
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email").notNull(),
  clientPhone: varchar("client_phone"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  bookings: many(bookings),
  businessClaims: many(businessClaims),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  sessions: many(fitnessSessions),
  businessClaims: many(businessClaims),
}));

export const businessClaimsRelations = relations(businessClaims, ({ one }) => ({
  business: one(businesses, {
    fields: [businessClaims.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [businessClaims.userId],
    references: [users.id],
  }),
}));

export const personalTrainersRelations = relations(personalTrainers, ({ one, many }) => ({
  user: one(users, {
    fields: [personalTrainers.userId],
    references: [users.id],
  }),
  bookings: many(trainerBookings),
}));

export const trainerBookingsRelations = relations(trainerBookings, ({ one }) => ({
  user: one(users, {
    fields: [trainerBookings.userId],
    references: [users.id],
  }),
  trainer: one(personalTrainers, {
    fields: [trainerBookings.trainerId],
    references: [personalTrainers.id],
  }),
}));

export const sessionTypesRelations = relations(sessionTypes, ({ many }) => ({
  sessions: many(fitnessSessions),
}));

export const fitnessSessionsRelations = relations(fitnessSessions, ({ one, many }) => ({
  business: one(businesses, {
    fields: [fitnessSessions.businessId],
    references: [businesses.id],
  }),
  sessionType: one(sessionTypes, {
    fields: [fitnessSessions.sessionTypeId],
    references: [sessionTypes.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  session: one(fitnessSessions, {
    fields: [bookings.sessionId],
    references: [fitnessSessions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionTypeSchema = createInsertSchema(sessionTypes).omit({
  id: true,
  createdAt: true,
});

export const insertFitnessSessionSchema = createInsertSchema(fitnessSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.number().min(0, "Price must be positive"),
});

export const insertPersonalTrainerSchema = createInsertSchema(personalTrainers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
});

export const insertTrainerBookingSchema = createInsertSchema(trainerBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  totalAmount: z.number().min(0, "Total amount must be positive"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessClaimSchema = createInsertSchema(businessClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertSessionType = z.infer<typeof insertSessionTypeSchema>;
export type SessionType = typeof sessionTypes.$inferSelect;
export type InsertFitnessSession = z.infer<typeof insertFitnessSessionSchema>;
export type FitnessSession = typeof fitnessSessions.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBusinessClaim = z.infer<typeof insertBusinessClaimSchema>;
export type BusinessClaim = typeof businessClaims.$inferSelect;

// Enhanced types with relations
export type BusinessWithUser = Business & {
  user: User;
};

export type FitnessSessionWithDetails = FitnessSession & {
  business: BusinessWithUser;
  sessionType: SessionType;
  bookings?: Booking[];
};

export type BookingWithDetails = Booking & {
  user: User;
  session: FitnessSessionWithDetails;
};

export type BusinessClaimWithDetails = BusinessClaim & {
  business: Business;
  user: User;
};

export type InsertPersonalTrainer = z.infer<typeof insertPersonalTrainerSchema>;
export type PersonalTrainer = typeof personalTrainers.$inferSelect;
export type InsertTrainerBooking = z.infer<typeof insertTrainerBookingSchema>;
export type TrainerBooking = typeof trainerBookings.$inferSelect;

export type PersonalTrainerWithUser = PersonalTrainer & {
  user: User;
};

export type TrainerBookingWithDetails = TrainerBooking & {
  user: User;
  trainer: PersonalTrainerWithUser;
};

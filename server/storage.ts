import {
  users,
  businesses,
  sessionTypes,
  fitnessSessions,
  bookings,
  businessClaims,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type SessionType,
  type InsertSessionType,
  type FitnessSession,
  type InsertFitnessSession,
  type Booking,
  type InsertBooking,
  type BusinessClaim,
  type InsertBusinessClaim,
  type BusinessWithUser,
  type FitnessSessionWithDetails,
  type BookingWithDetails,
  type BusinessClaimWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, count, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusinessesByUserId(userId: string): Promise<BusinessWithUser[]>;
  getBusinessById(id: number): Promise<BusinessWithUser | undefined>;
  updateBusinessApproval(id: number, approved: boolean): Promise<Business>;
  getPendingBusinesses(): Promise<BusinessWithUser[]>;
  getAllBusinesses(): Promise<BusinessWithUser[]>;
  
  // Session type operations
  getSessionTypes(): Promise<SessionType[]>;
  createSessionType(sessionType: InsertSessionType): Promise<SessionType>;
  
  // Fitness session operations
  createFitnessSession(session: InsertFitnessSession): Promise<FitnessSession>;
  getFitnessSessionsByBusinessId(businessId: number): Promise<FitnessSessionWithDetails[]>;
  getFitnessSessionById(id: number): Promise<FitnessSessionWithDetails | undefined>;
  updateFitnessSessionApproval(id: number, approved: boolean): Promise<FitnessSession>;
  getPendingFitnessSessions(): Promise<FitnessSessionWithDetails[]>;
  searchFitnessSessions(filters: {
    postcode?: string;
    sessionType?: string;
    ageGroup?: string;
    difficulty?: string;
    maxPrice?: number;
    minPrice?: number;
  }): Promise<FitnessSessionWithDetails[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: string): Promise<BookingWithDetails[]>;
  getBookingsByBusinessId(businessId: number): Promise<BookingWithDetails[]>;
  getBookingById(id: number): Promise<BookingWithDetails | undefined>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Business claiming operations
  getUnclaimedBusinesses(): Promise<BusinessWithUser[]>;
  createBusinessClaim(claim: InsertBusinessClaim): Promise<BusinessClaim>;
  getPendingBusinessClaims(): Promise<BusinessClaimWithDetails[]>;
  updateBusinessClaimStatus(id: number, status: string): Promise<BusinessClaim>;
  
  // Business subscription operations
  updateBusinessSubscription(id: number, subscription: {
    subscriptionTier: string;
    bookingEnabled: boolean;
    subscriptionExpiry: Date | null;
    stripeSubscriptionId: string | null;
  }): Promise<Business>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;
  
  // Stats
  getStats(): Promise<{
    totalUsers: number;
    totalBusinesses: number;
    totalSessions: number;
    pendingBusinesses: number;
    pendingSessions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async getBusinessesByUserId(userId: string): Promise<BusinessWithUser[]> {
    const results = await db
      .select()
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .where(eq(businesses.userId, userId));
    
    return results.map(row => ({
      ...row.businesses,
      user: row.users!,
    }));
  }

  async getBusinessById(id: number): Promise<BusinessWithUser | undefined> {
    const [result] = await db
      .select()
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .where(eq(businesses.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.businesses,
      user: result.users!,
    };
  }

  async updateBusinessApproval(id: number, approved: boolean): Promise<Business> {
    const [business] = await db
      .update(businesses)
      .set({ approved, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return business;
  }

  async getPendingBusinesses(): Promise<BusinessWithUser[]> {
    const results = await db
      .select()
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .where(eq(businesses.approved, false));
    
    return results.map(row => ({
      ...row.businesses,
      user: row.users!,
    }));
  }

  async getAllBusinesses(): Promise<BusinessWithUser[]> {
    const results = await db
      .select()
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id));
    
    return results.map(row => ({
      ...row.businesses,
      user: row.users!,
    }));
  }

  async getSessionTypes(): Promise<SessionType[]> {
    return await db.select().from(sessionTypes);
  }

  async createSessionType(sessionType: InsertSessionType): Promise<SessionType> {
    const [newSessionType] = await db.insert(sessionTypes).values(sessionType).returning();
    return newSessionType;
  }

  async createFitnessSession(session: InsertFitnessSession): Promise<FitnessSession> {
    const [newSession] = await db.insert(fitnessSessions).values(session).returning();
    return newSession;
  }

  async getFitnessSessionsByBusinessId(businessId: number): Promise<FitnessSessionWithDetails[]> {
    const results = await db
      .select()
      .from(fitnessSessions)
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(users, eq(businesses.userId, users.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(fitnessSessions.businessId, businessId));

    return results.map(row => ({
      ...row.fitness_sessions,
      business: {
        ...row.businesses!,
        user: row.users!,
      },
      sessionType: row.session_types!,
    }));
  }

  async getFitnessSessionById(id: number): Promise<FitnessSessionWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(fitnessSessions)
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(users, eq(businesses.userId, users.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(fitnessSessions.id, id));

    if (!result) return undefined;

    return {
      ...result.fitness_sessions,
      business: {
        ...result.businesses!,
        user: result.users!,
      },
      sessionType: result.session_types!,
    };
  }

  async updateFitnessSessionApproval(id: number, approved: boolean): Promise<FitnessSession> {
    const [session] = await db
      .update(fitnessSessions)
      .set({ approved, updatedAt: new Date() })
      .where(eq(fitnessSessions.id, id))
      .returning();
    return session;
  }

  async getPendingFitnessSessions(): Promise<FitnessSessionWithDetails[]> {
    const results = await db
      .select()
      .from(fitnessSessions)
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(users, eq(businesses.userId, users.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(fitnessSessions.approved, false));

    return results.map(row => ({
      ...row.fitness_sessions,
      business: {
        ...row.businesses!,
        user: row.users!,
      },
      sessionType: row.session_types!,
    }));
  }

  async searchFitnessSessions(filters: {
    postcode?: string;
    sessionType?: string;
    ageGroup?: string;
    difficulty?: string;
    maxPrice?: number;
    minPrice?: number;
  }): Promise<FitnessSessionWithDetails[]> {
    const conditions = [eq(fitnessSessions.approved, true)];

    if (filters.postcode) {
      conditions.push(ilike(businesses.postcode, `%${filters.postcode}%`));
    }
    if (filters.sessionType) {
      conditions.push(ilike(sessionTypes.name, `%${filters.sessionType}%`));
    }
    if (filters.ageGroup) {
      // Check if ageGroup is included in the ageGroups array
      conditions.push(sql`${fitnessSessions.ageGroups}::jsonb ? ${filters.ageGroup}`);
    }
    if (filters.difficulty) {
      // Check if difficulty is included in the difficulty array
      conditions.push(sql`${fitnessSessions.difficulty}::jsonb ? ${filters.difficulty}`);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${fitnessSessions.price}::numeric <= ${filters.maxPrice}`);
    }
    if (filters.minPrice !== undefined) {
      conditions.push(sql`${fitnessSessions.price}::numeric >= ${filters.minPrice}`);
    }

    const results = await db
      .select()
      .from(fitnessSessions)
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(users, eq(businesses.userId, users.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(and(...conditions));

    return results.map((row: any) => ({
      ...row.fitness_sessions,
      business: {
        ...row.businesses!,
        user: row.users!,
      },
      sessionType: row.session_types!,
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByUserId(userId: string): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(fitnessSessions, eq(bookings.sessionId, fitnessSessions.id))
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(bookings.userId, userId));

    return results.map(row => ({
      ...row.bookings,
      user: row.users!,
      session: {
        ...row.fitness_sessions!,
        business: {
          ...row.businesses!,
          user: row.users!,
        },
        sessionType: row.session_types!,
      },
    }));
  }

  async getBookingsByBusinessId(businessId: number): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(fitnessSessions, eq(bookings.sessionId, fitnessSessions.id))
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(fitnessSessions.businessId, businessId));

    return results.map(row => ({
      ...row.bookings,
      user: row.users!,
      session: {
        ...row.fitness_sessions!,
        business: {
          ...row.businesses!,
          user: row.users!,
        },
        sessionType: row.session_types!,
      },
    }));
  }

  async getBookingById(id: number): Promise<BookingWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(fitnessSessions, eq(bookings.sessionId, fitnessSessions.id))
      .leftJoin(businesses, eq(fitnessSessions.businessId, businesses.id))
      .leftJoin(sessionTypes, eq(fitnessSessions.sessionTypeId, sessionTypes.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.bookings,
      user: result.users!,
      session: {
        ...result.fitness_sessions!,
        business: {
          ...result.businesses!,
          user: result.users!,
        },
        sessionType: result.session_types!,
      },
    };
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Business claiming operations
  async getUnclaimedBusinesses(): Promise<BusinessWithUser[]> {
    const results = await db
      .select()
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .where(and(eq(businesses.claimed, false), eq(businesses.manuallyAdded, true)));

    return results.map(result => ({
      ...result.businesses,
      user: result.users || { id: '', email: '', firstName: '', lastName: '', profileImageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    }));
  }

  async createBusinessClaim(claim: InsertBusinessClaim): Promise<BusinessClaim> {
    const [businessClaim] = await db
      .insert(businessClaims)
      .values(claim)
      .returning();
    return businessClaim;
  }

  async getPendingBusinessClaims(): Promise<BusinessClaimWithDetails[]> {
    const results = await db
      .select()
      .from(businessClaims)
      .leftJoin(businesses, eq(businessClaims.businessId, businesses.id))
      .leftJoin(users, eq(businessClaims.userId, users.id))
      .where(eq(businessClaims.status, 'pending'));

    return results.map(result => ({
      ...result.business_claims,
      business: result.businesses!,
      user: result.users!,
    }));
  }

  async updateBusinessClaimStatus(id: number, status: string): Promise<BusinessClaim> {
    const [claim] = await db
      .update(businessClaims)
      .set({ status, updatedAt: new Date() })
      .where(eq(businessClaims.id, id))
      .returning();
    return claim;
  }

  // Business subscription operations
  async updateBusinessSubscription(id: number, subscription: {
    subscriptionTier: string;
    bookingEnabled: boolean;
    subscriptionExpiry: Date | null;
    stripeSubscriptionId: string | null;
  }): Promise<Business> {
    const [business] = await db
      .update(businesses)
      .set({
        subscriptionTier: subscription.subscriptionTier,
        bookingEnabled: subscription.bookingEnabled,
        subscriptionExpiry: subscription.subscriptionExpiry,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))
      .returning();
    return business;
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalBusinesses: number;
    totalSessions: number;
    pendingBusinesses: number;
    pendingSessions: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [businessCount] = await db.select({ count: count() }).from(businesses);
    const [sessionCount] = await db.select({ count: count() }).from(fitnessSessions);
    const [pendingBusinessCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.approved, false));
    const [pendingSessionCount] = await db.select({ count: count() }).from(fitnessSessions).where(eq(fitnessSessions.approved, false));

    return {
      totalUsers: userCount.count,
      totalBusinesses: businessCount.count,
      totalSessions: sessionCount.count,
      pendingBusinesses: pendingBusinessCount.count,
      pendingSessions: pendingSessionCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
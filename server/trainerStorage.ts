import { 
  personalTrainers, 
  trainerBookings, 
  users,
  type PersonalTrainer,
  type TrainerBooking,
  type InsertPersonalTrainer,
  type InsertTrainerBooking,
  type PersonalTrainerWithUser,
  type TrainerBookingWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, lte, gte, sql } from "drizzle-orm";

export class TrainerStorage {
  async createPersonalTrainer(trainer: InsertPersonalTrainer): Promise<PersonalTrainer> {
    const [newTrainer] = await db
      .insert(personalTrainers)
      .values(trainer)
      .returning();
    return newTrainer;
  }

  async getPersonalTrainerById(id: number): Promise<PersonalTrainerWithUser | undefined> {
    const [trainer] = await db
      .select()
      .from(personalTrainers)
      .leftJoin(users, eq(personalTrainers.userId, users.id))
      .where(eq(personalTrainers.id, id));
    
    if (!trainer) return undefined;
    
    return {
      ...trainer.personal_trainers,
      user: trainer.users!
    };
  }

  async getPersonalTrainersByUserId(userId: string): Promise<PersonalTrainerWithUser[]> {
    const results = await db
      .select()
      .from(personalTrainers)
      .leftJoin(users, eq(personalTrainers.userId, users.id))
      .where(eq(personalTrainers.userId, userId));
    
    return results.map(result => ({
      ...result.personal_trainers,
      user: result.users!
    }));
  }

  async searchPersonalTrainers(filters: {
    search?: string;
    specialty?: string;
    location?: string;
    maxRate?: number;
    approved?: boolean;
  }): Promise<PersonalTrainerWithUser[]> {
    let query = db
      .select()
      .from(personalTrainers)
      .leftJoin(users, eq(personalTrainers.userId, users.id));

    const conditions = [];
    
    if (filters.approved !== false) {
      conditions.push(eq(personalTrainers.approved, true));
    }
    
    if (filters.search) {
      conditions.push(
        sql`(${personalTrainers.firstName} ILIKE ${'%' + filters.search + '%'} OR 
            ${personalTrainers.lastName} ILIKE ${'%' + filters.search + '%'} OR 
            ${personalTrainers.bio} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    
    if (filters.specialty) {
      conditions.push(
        sql`${personalTrainers.specialties} @> ${JSON.stringify([filters.specialty])}`
      );
    }
    
    if (filters.location) {
      conditions.push(like(personalTrainers.location, `%${filters.location}%`));
    }
    
    if (filters.maxRate) {
      conditions.push(lte(personalTrainers.hourlyRate, filters.maxRate.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    
    return results.map(result => ({
      ...result.personal_trainers,
      user: result.users!
    }));
  }

  async updatePersonalTrainerApproval(id: number, approved: boolean): Promise<PersonalTrainer> {
    const [trainer] = await db
      .update(personalTrainers)
      .set({ approved, updatedAt: new Date() })
      .where(eq(personalTrainers.id, id))
      .returning();
    return trainer;
  }

  async getPendingPersonalTrainers(): Promise<PersonalTrainerWithUser[]> {
    return this.searchPersonalTrainers({ approved: false });
  }

  async createTrainerBooking(booking: InsertTrainerBooking): Promise<TrainerBooking> {
    const [newBooking] = await db
      .insert(trainerBookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getTrainerBookingById(id: number): Promise<TrainerBookingWithDetails | undefined> {
    const [booking] = await db
      .select()
      .from(trainerBookings)
      .leftJoin(users, eq(trainerBookings.userId, users.id))
      .leftJoin(personalTrainers, eq(trainerBookings.trainerId, personalTrainers.id))
      .where(eq(trainerBookings.id, id));
    
    if (!booking) return undefined;
    
    return {
      ...booking.trainer_bookings,
      user: booking.users!,
      trainer: {
        ...booking.personal_trainers!,
        user: booking.users!
      }
    };
  }

  async getTrainerBookingsByUserId(userId: string): Promise<TrainerBookingWithDetails[]> {
    const results = await db
      .select()
      .from(trainerBookings)
      .leftJoin(users, eq(trainerBookings.userId, users.id))
      .leftJoin(personalTrainers, eq(trainerBookings.trainerId, personalTrainers.id))
      .where(eq(trainerBookings.userId, userId));
    
    return results.map(result => ({
      ...result.trainer_bookings,
      user: result.users!,
      trainer: {
        ...result.personal_trainers!,
        user: result.users!
      }
    }));
  }

  async getTrainerBookingsByTrainerId(trainerId: number): Promise<TrainerBookingWithDetails[]> {
    const results = await db
      .select()
      .from(trainerBookings)
      .leftJoin(users, eq(trainerBookings.userId, users.id))
      .leftJoin(personalTrainers, eq(trainerBookings.trainerId, personalTrainers.id))
      .where(eq(trainerBookings.trainerId, trainerId));
    
    return results.map(result => ({
      ...result.trainer_bookings,
      user: result.users!,
      trainer: {
        ...result.personal_trainers!,
        user: result.users!
      }
    }));
  }

  async updateTrainerBookingStatus(id: number, status: string): Promise<TrainerBooking> {
    const [booking] = await db
      .update(trainerBookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(trainerBookings.id, id))
      .returning();
    return booking;
  }
}

export const trainerStorage = new TrainerStorage();
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.ts';

const neonConfig = { webSocketConstructor: ws };

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seedData() {
  console.log('Starting to seed sample data...');

  try {
    // Create sample users
    const sampleUsers = [
      {
        id: 'user_1',
        email: 'sarah.coach@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'business',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c28?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 'user_2', 
        email: 'mike.trainer@example.com',
        firstName: 'Mike',
        lastName: 'Thompson',
        role: 'business',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 'user_3',
        email: 'emma.fitness@example.com', 
        firstName: 'Emma',
        lastName: 'Williams',
        role: 'business',
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: 'admin_1',
        email: 'admin@myles.co.uk',
        firstName: 'Admin',
        lastName: 'User', 
        role: 'admin'
      }
    ];

    for (const user of sampleUsers) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }

    // Create session types
    const sessionTypes = [
      { name: 'Yoga', description: 'Mindful movement and flexibility training' },
      { name: 'HIIT', description: 'High-intensity interval training' },
      { name: 'Personal Training', description: 'One-on-one fitness coaching' },
      { name: 'Pilates', description: 'Core strength and body alignment' },
      { name: 'Boxing', description: 'Combat sports training and fitness' },
      { name: 'Spin Class', description: 'Indoor cycling workouts' },
      { name: 'Crossfit', description: 'Functional fitness and strength training' },
      { name: 'Swimming', description: 'Aquatic fitness and technique training' }
    ];

    for (const sessionType of sessionTypes) {
      await db.insert(schema.sessionTypes).values(sessionType).onConflictDoNothing();
    }

    // Create sample businesses
    const sampleBusinesses = [
      {
        userId: 'user_1',
        name: 'FitLife Studio',
        description: 'Premium fitness studio offering yoga, pilates, and personal training in the heart of London.',
        address: '45 High Street',
        postcode: 'SW1A 1AA',
        phone: '020 7123 4567',
        website: 'https://fitlifestudio.co.uk',
        latitude: '51.5014',
        longitude: '-0.1419',
        approved: true
      },
      {
        userId: 'user_2',
        name: 'Iron Temple Gym',
        description: 'Hardcore training facility specializing in strength training, crossfit, and boxing.',
        address: '123 Brick Lane',
        postcode: 'E1 6SB',
        phone: '020 7234 5678',
        website: 'https://irontemple.co.uk',
        latitude: '51.5200',
        longitude: '-0.0710',
        approved: true
      },
      {
        userId: 'user_3',
        name: 'Aqua Sports Centre',
        description: 'State-of-the-art aquatic facility with pools, spa, and wellness programs.',
        address: '78 Park Road',
        postcode: 'NW1 4SH',
        phone: '020 7345 6789',
        website: 'https://aquasports.co.uk',
        latitude: '51.5270',
        longitude: '-0.1500',
        approved: true
      }
    ];

    const createdBusinesses = [];
    for (const business of sampleBusinesses) {
      const [created] = await db.insert(schema.businesses).values(business).returning();
      createdBusinesses.push(created);
    }

    // Create sample fitness sessions
    const sampleSessions = [
      // FitLife Studio sessions
      {
        businessId: createdBusinesses[0].id,
        sessionTypeId: 1, // Yoga
        title: 'Morning Hatha Yoga',
        description: 'Start your day with gentle stretches and mindful breathing. Perfect for beginners and experienced practitioners.',
        difficulty: 'beginner',
        ageGroup: '26-35',
        price: 25.00,
        duration: 60,
        maxParticipants: 15,
        schedule: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '09:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '09:00' }
        ],
        approved: true
      },
      {
        businessId: createdBusinesses[0].id,
        sessionTypeId: 4, // Pilates
        title: 'Core Power Pilates',
        description: 'Intensive core workout focusing on strength, stability, and flexibility.',
        difficulty: 'intermediate',
        ageGroup: '26-35',
        price: 30.00,
        duration: 45,
        maxParticipants: 12,
        schedule: [
          { dayOfWeek: 2, startTime: '18:30', endTime: '19:15' },
          { dayOfWeek: 4, startTime: '18:30', endTime: '19:15' }
        ],
        approved: true
      },
      {
        businessId: createdBusinesses[0].id,
        sessionTypeId: 3, // Personal Training
        title: 'Elite Personal Training',
        description: 'One-on-one coaching tailored to your specific fitness goals and needs.',
        difficulty: 'advanced',
        ageGroup: '36-50',
        price: 75.00,
        duration: 60,
        maxParticipants: 1,
        schedule: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '10:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '10:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '10:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '10:00' }
        ],
        approved: true
      },
      // Iron Temple Gym sessions
      {
        businessId: createdBusinesses[1].id,
        sessionTypeId: 2, // HIIT
        title: 'Beast Mode HIIT',
        description: 'High-intensity workout designed to push your limits and burn maximum calories.',
        difficulty: 'advanced',
        ageGroup: '18-25',
        price: 20.00,
        duration: 45,
        maxParticipants: 20,
        schedule: [
          { dayOfWeek: 1, startTime: '19:00', endTime: '19:45' },
          { dayOfWeek: 3, startTime: '19:00', endTime: '19:45' },
          { dayOfWeek: 5, startTime: '19:00', endTime: '19:45' }
        ],
        approved: true
      },
      {
        businessId: createdBusinesses[1].id,
        sessionTypeId: 5, // Boxing
        title: 'Boxing Fundamentals',
        description: 'Learn proper boxing technique while getting an incredible full-body workout.',
        difficulty: 'beginner',
        ageGroup: '26-35',
        price: 35.00,
        duration: 60,
        maxParticipants: 16,
        schedule: [
          { dayOfWeek: 2, startTime: '20:00', endTime: '21:00' },
          { dayOfWeek: 4, startTime: '20:00', endTime: '21:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '11:00' }
        ],
        approved: true
      },
      {
        businessId: createdBusinesses[1].id,
        sessionTypeId: 7, // Crossfit
        title: 'CrossFit WOD',
        description: 'Workout of the Day featuring functional movements at high intensity.',
        difficulty: 'intermediate',
        ageGroup: '26-35',
        price: 28.00,
        duration: 60,
        maxParticipants: 18,
        schedule: [
          { dayOfWeek: 1, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 2, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 3, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 4, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 5, startTime: '06:00', endTime: '07:00' }
        ],
        approved: true
      },
      // Aqua Sports Centre sessions
      {
        businessId: createdBusinesses[2].id,
        sessionTypeId: 8, // Swimming
        title: 'Adult Swim Lessons',
        description: 'Professional swimming instruction for adults of all skill levels.',
        difficulty: 'beginner',
        ageGroup: '36-50',
        price: 40.00,
        duration: 45,
        maxParticipants: 8,
        schedule: [
          { dayOfWeek: 2, startTime: '19:00', endTime: '19:45' },
          { dayOfWeek: 4, startTime: '19:00', endTime: '19:45' }
        ],
        approved: true
      },
      {
        businessId: createdBusinesses[2].id,
        sessionTypeId: 6, // Spin Class
        title: 'Aqua Spin',
        description: 'Low-impact cycling in water - perfect for joint-friendly cardio.',
        difficulty: 'intermediate',
        ageGroup: '50+',
        price: 22.00,
        duration: 45,
        maxParticipants: 12,
        schedule: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '10:45' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '10:45' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '10:45' }
        ],
        approved: true
      }
    ];

    for (const session of sampleSessions) {
      await db.insert(schema.fitnessSessions).values({
        ...session,
        schedule: JSON.stringify(session.schedule)
      }).onConflictDoNothing();
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('Created:');
    console.log('- 4 users (3 business owners + 1 admin)');
    console.log('- 8 session types');
    console.log('- 3 fitness businesses');
    console.log('- 8 fitness sessions');
    console.log('\nYou can now:');
    console.log('- Browse sessions on the search page');
    console.log('- Login to test the booking flow');
    console.log('- View businesses in different London postcodes');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

seedData();
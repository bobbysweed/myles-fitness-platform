import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { trainerStorage } from "./trainerStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendEmail } from "./emailService";
import { insertPersonalTrainerSchema, insertTrainerBookingSchema } from "@shared/schema";
import { z } from "zod";
import { insertBusinessSchema, insertFitnessSessionSchema, insertBookingSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Business routes
  app.post('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const businessData = insertBusinessSchema.parse({
        ...req.body,
        userId
      });

      const business = await storage.createBusiness(businessData);
      
      // Send notification email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@mylesfitness.co.uk',
        subject: 'New Business Registration - Pending Approval',
        html: `
          <h2>New Business Registration</h2>
          <p><strong>Business Name:</strong> ${business.name}</p>
          <p><strong>Address:</strong> ${business.address}</p>
          <p><strong>User:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p>Please review and approve this business registration.</p>
        `
      });

      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.get('/api/businesses/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businesses = await storage.getBusinessesByUserId(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Business claiming routes
  app.get('/api/businesses/unclaimed', async (req, res) => {
    try {
      const unclaimedBusinesses = await storage.getUnclaimedBusinesses();
      res.json(unclaimedBusinesses);
    } catch (error) {
      console.error("Error fetching unclaimed businesses:", error);
      res.status(500).json({ message: "Failed to fetch unclaimed businesses" });
    }
  });

  app.post('/api/businesses/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = parseInt(req.params.id);
      const { claimMessage, verificationDocuments } = req.body;

      // Check if business exists and is unclaimed
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.claimed || business.userId) {
        return res.status(400).json({ message: "Business is already claimed" });
      }

      // Create claim request
      const claim = await storage.createBusinessClaim({
        businessId,
        userId,
        claimMessage,
        verificationDocuments: verificationDocuments || [],
        status: 'pending'
      });

      // Send notification email to admin
      const user = await storage.getUser(userId);
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@mylesfitness.co.uk',
        subject: 'Business Claim Request - Pending Review',
        html: `
          <h2>Business Claim Request</h2>
          <p><strong>Business:</strong> ${business.name}</p>
          <p><strong>Address:</strong> ${business.address}</p>
          <p><strong>Claimant:</strong> ${user?.firstName} ${user?.lastName} (${user?.email})</p>
          <p><strong>Message:</strong> ${claimMessage}</p>
          <p>Please review and approve this business claim request.</p>
        `
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating business claim:", error);
      res.status(500).json({ message: "Failed to create business claim" });
    }
  });

  // Business subscription routes
  app.post('/api/businesses/:id/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = parseInt(req.params.id);
      const { subscriptionTier } = req.body;

      // Check if user owns the business
      const business = await storage.getBusinessById(businessId);
      if (!business || business.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized to upgrade this business" });
      }

      if (subscriptionTier === 'free') {
        // Downgrade to free
        const updatedBusiness = await storage.updateBusinessSubscription(businessId, {
          subscriptionTier: 'free',
          bookingEnabled: false,
          subscriptionExpiry: null,
          stripeSubscriptionId: null,
        });
        res.json(updatedBusiness);
      } else {
        // Create Stripe subscription for paid plans
        let priceId: string;
        switch (subscriptionTier) {
          case 'basic':
            priceId = process.env.STRIPE_BASIC_PRICE_ID || '';
            break;
          case 'premium':
            priceId = process.env.STRIPE_PREMIUM_PRICE_ID || '';
            break;
          default:
            return res.status(400).json({ message: "Invalid subscription tier" });
        }

        if (!priceId) {
          return res.status(500).json({ message: "Subscription pricing not configured" });
        }

        // Get or create Stripe customer
        const user = await storage.getUser(userId);
        let customerId = user?.stripeCustomerId;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user?.email || '',
            name: `${user?.firstName} ${user?.lastName}`,
            metadata: {
              userId: userId,
              businessId: businessId.toString(),
            },
          });
          customerId = customer.id;
          await storage.updateUserStripeCustomerId(userId, customerId);
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update business with subscription details
        const updatedBusiness = await storage.updateBusinessSubscription(businessId, {
          subscriptionTier,
          bookingEnabled: true,
          subscriptionExpiry: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
        });

        res.json({
          business: updatedBusiness,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          subscriptionId: subscription.id,
        });
      }
    } catch (error) {
      console.error("Error upgrading business subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Session types routes
  app.get('/api/session-types', async (req, res) => {
    try {
      const sessionTypes = await storage.getSessionTypes();
      res.json(sessionTypes);
    } catch (error) {
      console.error("Error fetching session types:", error);
      res.status(500).json({ message: "Failed to fetch session types" });
    }
  });

  // Fitness sessions routes
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businesses = await storage.getBusinessesByUserId(userId);
      
      if (businesses.length === 0) {
        return res.status(403).json({ message: "No approved business found" });
      }

      const sessionData = insertFitnessSessionSchema.parse(req.body);
      const session = await storage.createFitnessSession(sessionData);
      
      // Send notification email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@mylesfitness.co.uk',
        subject: 'New Session Submission - Pending Approval',
        html: `
          <h2>New Session Submission</h2>
          <p><strong>Session:</strong> ${session.title}</p>
          <p><strong>Business:</strong> ${businesses[0].name}</p>
          <p><strong>Price:</strong> £${session.price}</p>
          <p>Please review and approve this session.</p>
        `
      });

      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/sessions/search', async (req, res) => {
    try {
      const filters = {
        postcode: req.query.postcode as string,
        sessionType: req.query.sessionType as string,
        ageGroup: req.query.ageGroup as string,
        difficulty: req.query.difficulty as string,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      };

      const sessions = await storage.searchFitnessSessions(filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error searching sessions:", error);
      res.status(500).json({ message: "Failed to search sessions" });
    }
  });

  app.get('/api/sessions/business/:businessId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = parseInt(req.params.businessId);
      
      // Verify user owns this business
      const businesses = await storage.getBusinessesByUserId(userId);
      const ownsBusiness = businesses.some(b => b.id === businessId);
      
      if (!ownsBusiness) {
        return res.status(403).json({ message: "Access denied" });
      }

      const sessions = await storage.getFitnessSessionsByBusinessId(businessId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching business sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId
      });

      const booking = await storage.createBooking(bookingData);
      const bookingDetails = await storage.getBookingById(booking.id);
      
      if (bookingDetails) {
        // Send confirmation email to user
        const user = await storage.getUser(userId);
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: 'Booking Confirmation - MYLES',
            html: `
              <h2>Booking Confirmed!</h2>
              <p>Your booking has been confirmed for:</p>
              <p><strong>Session:</strong> ${bookingDetails.session.title}</p>
              <p><strong>Date:</strong> ${bookingDetails.sessionDate}</p>
              <p><strong>Total:</strong> £${bookingDetails.totalAmount}</p>
              <p>Thank you for choosing MYLES!</p>
            `
          });
        }
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, sessionId } = req.body;
      
      if (!amount || !sessionId) {
        return res.status(400).json({ message: "Amount and session ID are required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp",
        metadata: {
          sessionId: sessionId.toString()
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/businesses/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const businesses = await storage.getPendingBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      res.status(500).json({ message: "Failed to fetch pending businesses" });
    }
  });

  app.put('/api/admin/businesses/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const businessId = parseInt(req.params.id);
      const { approved } = req.body;
      
      const business = await storage.updateBusinessApproval(businessId, approved);
      const businessDetails = await storage.getBusinessById(businessId);
      
      if (businessDetails && businessDetails.user.email) {
        await sendEmail({
          to: businessDetails.user.email,
          subject: approved ? 'Business Approved - MYLES' : 'Business Application Update - MYLES',
          html: approved ? `
            <h2>Congratulations!</h2>
            <p>Your business "${business.name}" has been approved and is now live on MYLES.</p>
            <p>You can now start adding fitness sessions for users to book.</p>
          ` : `
            <h2>Business Application Update</h2>
            <p>Thank you for your interest in MYLES. Unfortunately, your business application for "${business.name}" needs additional review.</p>
            <p>Please contact our support team for more information.</p>
          `
        });
      }

      res.json(business);
    } catch (error) {
      console.error("Error updating business approval:", error);
      res.status(500).json({ message: "Failed to update business approval" });
    }
  });

  app.get('/api/admin/sessions/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sessions = await storage.getPendingFitnessSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching pending sessions:", error);
      res.status(500).json({ message: "Failed to fetch pending sessions" });
    }
  });

  app.put('/api/admin/sessions/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sessionId = parseInt(req.params.id);
      const { approved } = req.body;
      
      const session = await storage.updateFitnessSessionApproval(sessionId, approved);
      res.json(session);
    } catch (error) {
      console.error("Error updating session approval:", error);
      res.status(500).json({ message: "Failed to update session approval" });
    }
  });

  // Personal trainer routes
  app.post('/api/personal-trainers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trainerData = insertPersonalTrainerSchema.parse(req.body);
      
      const trainer = await trainerStorage.createPersonalTrainer({
        ...trainerData,
        userId,
      });

      // Send notification email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@mylesfitness.co.uk',
        subject: 'New Personal Trainer Application - Pending Approval',
        html: `
          <h2>New Personal Trainer Application</h2>
          <p><strong>Name:</strong> ${trainer.firstName} ${trainer.lastName}</p>
          <p><strong>Location:</strong> ${trainer.location}</p>
          <p><strong>Experience:</strong> ${trainer.experience} years</p>
          <p><strong>Hourly Rate:</strong> £${trainer.hourlyRate}</p>
          <p><strong>Bio:</strong> ${trainer.bio}</p>
          <p>Please review and approve this trainer application in the admin dashboard.</p>
        `
      });

      res.status(201).json(trainer);
    } catch (error) {
      console.error("Error creating personal trainer:", error);
      res.status(500).json({ message: "Failed to create trainer profile" });
    }
  });

  app.get('/api/personal-trainers/search', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        specialty: req.query.specialty as string,
        location: req.query.location as string,
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined,
      };

      const trainers = await trainerStorage.searchPersonalTrainers(filters);
      res.json(trainers);
    } catch (error) {
      console.error("Error searching trainers:", error);
      res.status(500).json({ message: "Failed to search trainers" });
    }
  });

  app.get('/api/personal-trainers/:id', async (req, res) => {
    try {
      const trainerId = parseInt(req.params.id);
      const trainer = await trainerStorage.getPersonalTrainerById(trainerId);
      
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      res.json(trainer);
    } catch (error) {
      console.error("Error fetching trainer:", error);
      res.status(500).json({ message: "Failed to fetch trainer" });
    }
  });

  app.get('/api/personal-trainers/my/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trainers = await trainerStorage.getPersonalTrainersByUserId(userId);
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainer profile:", error);
      res.status(500).json({ message: "Failed to fetch trainer profile" });
    }
  });

  // Trainer booking routes
  app.post('/api/trainer-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertTrainerBookingSchema.parse(req.body);
      
      const booking = await trainerStorage.createTrainerBooking({
        ...bookingData,
        userId,
      });

      // Send confirmation emails
      const trainer = await trainerStorage.getPersonalTrainerById(bookingData.trainerId);
      if (trainer) {
        await sendEmail({
          to: bookingData.clientEmail,
          subject: 'Personal Training Session Booked - MYLES',
          html: `
            <h2>Booking Confirmation</h2>
            <p>Your personal training session has been booked!</p>
            <p><strong>Trainer:</strong> ${trainer.firstName} ${trainer.lastName}</p>
            <p><strong>Date:</strong> ${new Date(bookingData.sessionDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${bookingData.duration} minutes</p>
            <p><strong>Total:</strong> £${bookingData.totalAmount}</p>
          `
        });

        await sendEmail({
          to: trainer.email || trainer.user.email,
          subject: 'New Booking - MYLES',
          html: `
            <h2>New Booking Received</h2>
            <p>You have a new training session booking!</p>
            <p><strong>Client:</strong> ${bookingData.clientName}</p>
            <p><strong>Email:</strong> ${bookingData.clientEmail}</p>
            <p><strong>Date:</strong> ${new Date(bookingData.sessionDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${bookingData.duration} minutes</p>
          `
        });
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating trainer booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Admin trainer routes
  app.get('/api/admin/trainers/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const trainers = await trainerStorage.getPendingPersonalTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching pending trainers:", error);
      res.status(500).json({ message: "Failed to fetch pending trainers" });
    }
  });

  app.put('/api/admin/trainers/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const trainerId = parseInt(req.params.id);
      const { approved } = req.body;
      
      const trainer = await trainerStorage.updatePersonalTrainerApproval(trainerId, approved);
      const trainerDetails = await trainerStorage.getPersonalTrainerById(trainerId);
      
      if (trainerDetails && trainerDetails.email) {
        await sendEmail({
          to: trainerDetails.email,
          subject: approved ? 'Trainer Application Approved - MYLES' : 'Trainer Application Update - MYLES',
          html: approved ? `
            <h2>Congratulations!</h2>
            <p>Your personal trainer application has been approved and you're now live on MYLES.</p>
            <p>You can start receiving booking requests from clients.</p>
          ` : `
            <h2>Trainer Application Update</h2>
            <p>Thank you for your interest in becoming a trainer on MYLES. Your application needs additional review.</p>
            <p>Please contact our support team for more information.</p>
          `
        });
      }

      res.json(trainer);
    } catch (error) {
      console.error("Error updating trainer approval:", error);
      res.status(500).json({ message: "Failed to update trainer approval" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

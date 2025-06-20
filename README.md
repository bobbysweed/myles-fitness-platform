# MYLES - My Local Exercise Sessions

A comprehensive fitness booking platform connecting users with local fitness sessions and personal trainers.

## Features

### For Users
- Search and discover local fitness sessions
- Find and book personal trainers
- Secure payment processing with Stripe
- Instant booking confirmations
- Real-time availability checking

### For Businesses
- Free business listings
- Premium booking functionality (£29/month)
- Session management dashboard
- Customer communication tools
- Analytics and reporting

### For Personal Trainers
- Professional profile creation
- Specialty and certification showcase
- Flexible scheduling options
- Direct client bookings
- Admin approval system

### For Administrators
- Business approval workflow
- Trainer verification system
- Platform analytics
- User management tools

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Stripe
- **Email**: SendGrid
- **Deployment**: Vercel

## Environment Variables

Required environment variables for production:

```env
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_session_secret
SENDGRID_API_KEY=your_sendgrid_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
REPL_ID=your_replit_app_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Database Setup

1. Create a PostgreSQL database (recommend Neon for production)
2. Set the DATABASE_URL environment variable
3. Run database migrations: `npm run db:push`

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Set all required environment variables in Vercel dashboard
3. Deploy with automatic builds enabled

## Local Development

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Run database migrations: `npm run db:push`
4. Start development server: `npm run dev`

## Key Business Logic

### Freemium Model
- Businesses get free directory listings
- Premium features (booking) require subscription
- Personal trainers have approval workflow
- Admin controls all approvals

### Multi-day Session Scheduling
Sessions can be scheduled across multiple days with flexible time slots:
```json
{
  "schedule": [
    {"dayOfWeek": 1, "startTime": "09:00", "endTime": "10:00"},
    {"dayOfWeek": 3, "startTime": "09:00", "endTime": "10:00"}
  ]
}
```

### Search and Discovery
- Postcode-based location search
- Filter by activity type, difficulty, price
- Real-time availability checking
- Mobile-responsive design

## Support

For technical support or business inquiries, contact: support@mylesfitness.co.uk

## License

Proprietary - All rights reserved
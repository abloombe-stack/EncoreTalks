# EncoreTalks

> **Expert conversations, made easy.**

EncoreTalks is a professional marketplace connecting clients with verified experts for 1-on-1 video calls, mentorship, and group sessions. Built with modern web technologies for a seamless, production-ready experience.

![EncoreTalks Platform](https://via.placeholder.com/800x400/2563eb/ffffff?text=EncoreTalks+Platform)

## 🚀 Features

### Core Platform
- **Expert Discovery**: AI-powered matching system with advanced filtering
- **Flexible Pricing**: Per-minute billing or fixed-duration sessions
- **Video Calling**: WebRTC-based in-browser video sessions
- **Real-time Messaging**: Chat during sessions and mentorship programs
- **Payment Processing**: Secure payments with Stripe Connect
- **AI Session Summaries**: Automated transcription and key insights

### User Types & Experiences
- **Clients**: Book experts, manage sessions, track learning progress
- **Experts**: Manage availability, earnings dashboard, client relationships
- **Organizations**: Enterprise accounts with team management and budgets
- **Admins**: Platform oversight, expert verification, analytics

### Advanced Features
- **Mentorship Subscriptions**: Monthly recurring expert relationships
- **PWA Support**: Installable mobile-first web application
- **Multi-language Support**: International expert base
- **Affiliate Program**: Referral tracking and rewards
- **Recording & AI**: Session recordings with AI-generated summaries

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite for development and building
- Tailwind CSS for styling
- PWA capabilities with Workbox
- Stripe Elements for payments

**Backend**
- Node.js + Express + TypeScript
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Stripe Connect for payments
- Resend for email notifications
- Twilio for SMS notifications

**Infrastructure**
- Supabase for database and auth
- Vercel/Netlify for frontend hosting
- Railway/Heroku for backend hosting
- Stripe for payment processing
- CloudFlare for CDN and security

### Database Schema

The platform uses PostgreSQL with Row Level Security (RLS) for multi-tenant data isolation:

- **Core Tables**: `profiles`, `expert_profiles`, `categories`, `bookings`
- **Business Logic**: `payments`, `mentorship_plans`, `reviews`, `messages`
- **Enterprise**: `organizations`, `org_members`
- **Growth**: `affiliates`, `referrals`, `audit_logs`

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ and npm 8+
- **Git** for version control
- **Supabase** account for database and auth
- **Stripe** account for payments
- **Resend** account for emails
- **Twilio** account for SMS (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/encoretalks/platform.git
cd encoretalks
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Communication
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Run the database migrations and seed data:

```bash
# Set up the database schema
npm run db:migrate

# Load sample data
npm run db:seed
```

Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Test the Setup

1. **Visit** `http://localhost:3000`
2. **Sign up** as a new user
3. **Browse** sample experts
4. **Book** a test session
5. **Test** the payment flow (use Stripe test cards)

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Frontend Testing

```bash
cd frontend

# Run component tests
npm test

# Run E2E tests
npm run test:e2e
```

### Test Data

The platform includes comprehensive seed data:
- 6 sample experts with different specialties
- 3 client profiles
- Sample bookings (past and future)
- Reviews and ratings
- Mentorship plans
- Organization data

**Test Users:**
- **Client**: client-1@example.com
- **Expert**: expert-1@example.com  
- **Admin**: admin-1@example.com

All test users have password: `testpassword123`

## 🚀 Deployment

### Environment Setup

Create production environment files with your production credentials:

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://encoretalks.com
```

**Frontend (.env.production)**
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://api.encoretalks.com
```

### Backend Deployment (Railway)

1. **Connect your repository** to Railway
2. **Set environment variables** in the Railway dashboard
3. **Deploy** from the main branch

```bash
# Or deploy manually
npm run build
npm start
```

### Frontend Deployment (Vercel)

1. **Connect your repository** to Vercel
2. **Set build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set environment variables** in Vercel dashboard
4. **Deploy** from the main branch

```bash
# Or deploy manually
npm run build
# Upload dist/ directory to your hosting provider
```

### Database Migration

For production, run migrations on your production Supabase instance:

```sql
-- Connect to your production Supabase database
-- Run the schema.sql file
-- Run the seed.sql file (optional for production)
```

### Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Stripe webhooks configured
- [ ] Domain and SSL configured
- [ ] Email templates customized
- [ ] Analytics tracking added
- [ ] Error monitoring setup (Sentry)
- [ ] Performance monitoring setup

## 📋 Configuration

### Supabase Setup

1. **Create a new Supabase project**
2. **Enable Row Level Security** on all tables
3. **Configure authentication providers** (email, Google, etc.)
4. **Set up storage buckets** for file uploads
5. **Configure webhooks** for real-time updates

### Stripe Configuration

1. **Create Stripe Connect platform**
2. **Configure webhook endpoints**:
   - `https://your-api.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `transfer.created`
3. **Set up Connect onboarding** for experts
4. **Configure payout schedules**

### Email Templates (Resend)

Customize email templates in `backend/src/templates/`:
- Booking confirmations
- Session reminders
- Payment notifications
- Weekly summaries

### SMS Notifications (Twilio)

Configure SMS templates for:
- Session reminders (1 hour before)
- Booking confirmations
- Payment confirmations

## 🔧 Customization

### Branding

Update branding elements in:
- `frontend/src/assets/` - logos and images
- `frontend/tailwind.config.js` - color scheme
- `frontend/public/manifest.json` - PWA metadata

### Business Logic

Key configuration files:
- `backend/src/config/` - platform settings
- `frontend/src/config/` - frontend constants
- Commission rates, pricing rules, and limits

### Features

Enable/disable features by environment:
- Recording and AI summaries
- Mentorship subscriptions
- Organization features
- Affiliate program

## 📊 Analytics & Monitoring

### Built-in Analytics

The platform tracks:
- User engagement metrics
- Booking conversion rates
- Expert performance
- Revenue analytics
- Session quality metrics

### External Integrations

Recommended third-party services:
- **Google Analytics** for web analytics
- **Mixpanel** for user behavior tracking
- **Sentry** for error monitoring
- **LogRocket** for session replay
- **Stripe Dashboard** for payment analytics

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication via Supabase
- Row Level Security (RLS) for data isolation
- Role-based access control (RBAC)
- API rate limiting and request validation

### Payment Security

- PCI DSS compliance via Stripe
- Secure tokenization of payment methods
- Fraud detection and prevention
- Encrypted sensitive data storage

### Data Protection

- GDPR compliance measures
- Data encryption at rest and in transit
- Regular security audits
- User data export and deletion

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check Supabase credentials
npm run db:test-connection

# Verify RLS policies
npm run db:check-policies
```

**Payment Issues**
```bash
# Test Stripe integration
npm run test:payments

# Verify webhook configuration
npm run test:webhooks
```

**Video Call Issues**
- Check STUN/TURN server configuration
- Verify WebRTC permissions in browser
- Test network connectivity

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 4001 | Authentication failed | Check JWT token validity |
| 4003 | Insufficient permissions | Verify user role and RLS policies |
| 4004 | Resource not found | Check resource ID and availability |
| 5001 | Payment processing error | Check Stripe configuration |
| 5002 | Video call connection failed | Check WebRTC configuration |

### Support

- **Documentation**: [docs.encoretalks.com](https://docs.encoretalks.com)
- **Issues**: [GitHub Issues](https://github.com/encoretalks/platform/issues)
- **Discord**: [Community Chat](https://discord.gg/encoretalks)
- **Email**: support@encoretalks.com

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Unit tests** for new features
- **Documentation** for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Q1 2025
- [ ] Mobile app (React Native)
- [ ] Advanced AI matching
- [ ] Multi-language platform support
- [ ] Group session features

### Q2 2025
- [ ] White-label solutions
- [ ] Advanced analytics dashboard
- [ ] API marketplace
- [ ] Integration with calendar apps

### Q3 2025
- [ ] AI-powered session preparation
- [ ] Advanced recording features
- [ ] Enterprise SSO integration
- [ ] Advanced reporting tools

## 📞 Contact

- **Website**: [encoretalks.com](https://encoretalks.com)
- **Email**: hello@encoretalks.com
- **Twitter**: [@EncoreTalks](https://twitter.com/EncoreTalks)
- **LinkedIn**: [EncoreTalks](https://linkedin.com/company/encoretalks)

---

**Built with ❤️ by the EncoreTalks Team**

*Making expert knowledge accessible to everyone, everywhere.*
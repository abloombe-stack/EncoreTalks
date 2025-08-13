import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'
import twilio from 'twilio'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth'
import profileRoutes from './routes/profiles'
import expertRoutes from './routes/experts'
import bookingRoutes from './routes/bookings'
import paymentRoutes from './routes/payments'
import messageRoutes from './routes/messages'
import adminRoutes from './routes/admin'
import matchRoutes from './routes/match'
import mentorshipRoutes from './routes/mentorship'
import organizationRoutes from './routes/organizations'
import affiliateRoutes from './routes/affiliates'
import videoRoutes from './routes/video'
import webhookRoutes from './routes/webhooks'
import platformRoutes from './routes/platform'

// Import middleware
import { authenticateUser } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { auditLogger } from './middleware/auditLogger'

dotenv.config()

const app = express()

// Initialize services
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const resend = new Resend(process.env.RESEND_API_KEY || 'test-key');

export const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://encoretalks.com', 'https://www.encoretalks.com']
    : ['http://localhost:3000', 'http://localhost:5173']
}))

// Webhook routes (before body parsing)
app.use('/api/webhooks', webhookRoutes)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(limiter)
app.use(auditLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/experts', expertRoutes)
app.use('/api/categories', require('./routes/categories'))
app.use('/api/match', matchRoutes)
app.use('/api/platform', platformRoutes)
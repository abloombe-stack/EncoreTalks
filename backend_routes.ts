// routes/experts.ts
import express from 'express';
import { z } from 'zod';
import { supabase } from '../server';
import { authenticateUser, requireExpert, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';

const router = express.Router();

// Validation schemas
const expertProfileSchema = z.object({
  headline: z.string().min(10).max(200),
  expertise_tags: z.array(z.string()).max(20),
  intro_video_url: z.string().url().optional(),
  years_experience: z.number().int().min(0).max(50),
  rate_cents_per_minute: z.number().int().min(0),
  fixed_15m_cents: z.number().int().min(0),
  fixed_30m_cents: z.number().int().min(0),
  fixed_60m_cents: z.number().int().min(0),
  availability_json: z.object({}).passthrough()
});

const searchSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(),
  min_rating: z.string().transform(Number).optional(),
  max_rate: z.string().transform(Number).optional(),
  language: z.string().optional(),
  available_now: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20')
});

const uuidSchema = z.object({
  id: z.string().uuid()
});

// GET /api/experts - Search and list experts
router.get('/', validateQuery(searchSchema), async (req, res, next) => {
  try {
    const { category, tags, min_rating, max_rate, language, available_now, page, limit } = req.query as any;
    
    let query = supabase
      .from('expert_profiles')
      .select(`
        *,
        profiles!inner(first_name, last_name, avatar_url, bio, languages, verified),
        expert_badges(badge),
        categories!inner(name, icon)
      `)
      .eq('is_active', true)
      .order('rating_avg', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('categories.id', category);
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      query = query.overlaps('expertise_tags', tagArray);
    }
    
    if (min_rating) {
      query = query.gte('rating_avg', min_rating);
    }
    
    if (max_rate) {
      query = query.lte('rate_cents_per_minute', max_rate);
    }
    
    if (language) {
      query = query.contains('profiles.languages', [language]);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: experts, error, count } = await query;

    if (error) throw error;

    // Filter by availability if requested
    let filteredExperts = experts;
    if (available_now) {
      filteredExperts = experts?.filter(expert => {
        const availability = expert.availability_json;
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        
        // Simple availability check - can be made more sophisticated
        return availability[currentDay]?.some((slot: any) => 
          currentHour >= slot.start && currentHour < slot.end
        );
      }) || [];
    }

    res.json({
      experts: filteredExperts,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/experts/:id - Get expert profile
router.get('/:id', validateParams(uuidSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: expert, error } = await supabase
      .from('expert_profiles')
      .select(`
        *,
        profiles!inner(first_name, last_name, avatar_url, bio, languages, verified, timezone),
        expert_badges(badge, awarded_at),
        reviews!left(rating, comment, created_at,
          profiles!inner(first_name, last_name, avatar_url)
        ),
        mentorship_plans!left(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    res.json(expert);
  } catch (error) {
    next(error);
  }
});

// POST /api/experts - Create expert profile (authenticated)
router.post('/', authenticateUser, validateBody(expertProfileSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: expertProfile, error } = await supabase
      .from('expert_profiles')
      .insert({
        profile_id: req.user!.id,
        ...req.body
      })
      .select()
      .single();

    if (error) throw error;

    // Update user role to expert
    await supabase
      .from('profiles')
      .update({ role: 'expert' })
      .eq('id', req.user!.id);

    res.status(201).json(expertProfile);
  } catch (error) {
    next(error);
  }
});

// PUT /api/experts/:id - Update expert profile
router.put('/:id', authenticateUser, requireExpert, validateParams(uuidSchema), validateBody(expertProfileSchema.partial()), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: expert, error: fetchError } = await supabase
      .from('expert_profiles')
      .select('profile_id')
      .eq('id', id)
      .single();

    if (fetchError || !expert) {
      return res.status(404).json({ error: 'Expert profile not found' });
    }

    if (expert.profile_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { data: updatedExpert, error } = await supabase
      .from('expert_profiles')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedExpert);
  } catch (error) {
    next(error);
  }
});

// GET /api/experts/:id/availability - Get expert availability
router.get('/:id/availability', validateParams(uuidSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    const { data: expert, error } = await supabase
      .from('expert_profiles')
      .select('availability_json')
      .eq('id', id)
      .single();

    if (error || !expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    // Get existing bookings to exclude booked slots
    const { data: bookings } = await supabase
      .from('bookings')
      .select('scheduled_start, scheduled_end')
      .eq('expert_id', id)
      .in('status', ['confirmed', 'in_progress'])
      .gte('scheduled_start', start_date || new Date().toISOString())
      .lte('scheduled_end', end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate available slots (simplified implementation)
    const availability = expert.availability_json;
    const bookedSlots = bookings?.map(b => ({
      start: new Date(b.scheduled_start),
      end: new Date(b.scheduled_end)
    })) || [];

    res.json({
      availability,
      booked_slots: bookedSlots
    });
  } catch (error) {
    next(error);
  }
});

export default router;

// routes/bookings.ts
import express from 'express';
import { z } from 'zod';
import { supabase, stripe } from '../server';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { sendBookingConfirmation } from '../services/notifications';

const router = express.Router();

const createBookingSchema = z.object({
  expert_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  mode: z.enum(['fixed', 'per_minute']),
  scheduled_start: z.string().datetime(),
  scheduled_end: z.string().datetime(),
  org_id: z.string().uuid().optional()
});

const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'in_progress', 'completed']).optional(),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  meeting_url: z.string().url().optional()
});

// GET /api/bookings - List user's bookings
router.get('/', validateQuery(z.object({
  status: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20')
})), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, page, limit } = req.query as any;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, last_name, avatar_url),
        expert:expert_profiles!expert_id(
          *,
          profiles!inner(first_name, last_name, avatar_url)
        ),
        category:categories(name, icon)
      `)
      .order('scheduled_start', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user participation (client or expert)
    if (req.user!.role === 'expert') {
      const { data: expertProfile } = await supabase
        .from('expert_profiles')
        .select('id')
        .eq('profile_id', req.user!.id)
        .single();
      
      if (expertProfile) {
        query = query.eq('expert_id', expertProfile.id);
      }
    } else {
      query = query.eq('client_id', req.user!.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error, count } = await query;

    if (error) throw error;

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - Create booking
router.post('/', validateBody(createBookingSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { expert_id, mode, scheduled_start, scheduled_end, ...bookingData } = req.body;

    // Get expert details for pricing
    const { data: expert, error: expertError } = await supabase
      .from('expert_profiles')
      .select('*')
      .eq('id', expert_id)
      .single();

    if (expertError || !expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    // Calculate pricing
    const startTime = new Date(scheduled_start);
    const endTime = new Date(scheduled_end);
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    let priceCentsTotal: number;
    if (mode === 'fixed') {
      if (durationMinutes <= 15) {
        priceCentsTotal = expert.fixed_15m_cents;
      } else if (durationMinutes <= 30) {
        priceCentsTotal = expert.fixed_30m_cents;
      } else {
        priceCentsTotal = expert.fixed_60m_cents;
      }
    } else {
      // Per-minute mode - pre-authorize for minimum 10 minutes
      const minMinutes = Math.max(10, durationMinutes);
      priceCentsTotal = minMinutes * expert.rate_cents_per_minute;
    }

    // Add rush fee for bookings < 24h
    const hoursUntilStart = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < 24) {
      priceCentsTotal = Math.round(priceCentsTotal * 1.1); // 10% rush fee
    }

    const commissionPct = 20; // Default 20% commission
    const expertNetCents = Math.round(priceCentsTotal * (1 - commissionPct / 100));

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCentsTotal,
      currency: 'usd',
      metadata: {
        expert_id,
        client_id: req.user!.id,
        mode,
        duration_minutes: durationMinutes.toString()
      },
      capture_method: mode === 'per_minute' ? 'manual' : 'automatic'
    });

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        client_id: req.user!.id,
        expert_id,
        mode,
        scheduled_start,
        scheduled_end,
        price_cents_total: priceCentsTotal,
        commission_pct: commissionPct,
        expert_net_cents: expertNetCents,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'requested',
        ...bookingData
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation emails
    await sendBookingConfirmation(booking.id);

    res.status(201).json({
      booking,
      payment_client_secret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', validateParams(z.object({ id: z.string().uuid() })), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(*),
        expert:expert_profiles!expert_id(
          *,
          profiles!inner(*)
        ),
        category:categories(*),
        messages(*),
        recordings(*)
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check access permissions
    const isParticipant = booking.client_id === req.user!.id || 
                         booking.expert.profile_id === req.user!.id ||
                         req.user!.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', validateParams(z.object({ id: z.string().uuid() })), validateBody(updateBookingSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get booking and verify permissions
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        expert:expert_profiles!expert_id(profile_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isParticipant = booking.client_id === req.user!.id || 
                         booking.expert.profile_id === req.user!.id ||
                         req.user!.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Handle per-minute mode completion
    if (updates.status === 'completed' && booking.mode === 'per_minute' && updates.actual_end) {
      const actualDuration = (new Date(updates.actual_end).getTime() - new Date(updates.actual_start || booking.scheduled_start).getTime()) / (1000 * 60);
      const actualAmount = Math.round(actualDuration * (booking.price_cents_total / ((new Date(booking.scheduled_end).getTime() - new Date(booking.scheduled_start).getTime()) / (1000 * 60))));
      
      // Capture the actual amount
      await stripe.paymentIntents.capture(booking.stripe_payment_intent_id, {
        amount_to_capture: actualAmount
      });

      updates.price_cents_total = actualAmount;
      updates.expert_net_cents = Math.round(actualAmount * (1 - booking.commission_pct / 100));
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

export default router;
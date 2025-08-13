// routes/payments.ts
import express from 'express';
import { z } from 'zod';
import { supabase, stripe } from '../server';
import { AuthenticatedRequest, requireExpert } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';

const router = express.Router();

// POST /api/payments/setup-connect - Setup Stripe Connect for expert
router.post('/setup-connect', requireExpert, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: expertProfile, error } = await supabase
      .from('expert_profiles')
      .select('stripe_account_id')
      .eq('profile_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Expert profile not found' });
    }

    let accountId = expertProfile.stripe_account_id;

    if (!accountId) {
      // Create new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user!.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });

      accountId = account.id;

      // Update expert profile with account ID
      await supabase
        .from('expert_profiles')
        .update({ stripe_account_id: accountId })
        .eq('profile_id', req.user!.id);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/app/expert/setup-payments?refresh=true`,
      return_url: `${process.env.FRONTEND_URL}/app/expert/setup-payments?success=true`,
      type: 'account_onboarding'
    });

    res.json({ onboarding_url: accountLink.url });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/connect-status - Check Stripe Connect status
router.get('/connect-status', requireExpert, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: expertProfile, error } = await supabase
      .from('expert_profiles')
      .select('stripe_account_id')
      .eq('profile_id', req.user!.id)
      .single();

    if (error || !expertProfile.stripe_account_id) {
      return res.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(expertProfile.stripe_account_id);
    
    res.json({
      connected: account.details_submitted && account.charges_enabled,
      account_id: account.id,
      requirements: account.requirements
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/earnings - Get expert earnings
router.get('/earnings', requireExpert, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const { data: expertProfile } = await supabase
      .from('expert_profiles')
      .select('id')
      .eq('profile_id', req.user!.id)
      .single();

    if (!expertProfile) {
      return res.status(404).json({ error: 'Expert profile not found' });
    }

    let query = supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!inner(scheduled_start, scheduled_end, mode)
      `)
      .eq('bookings.expert_id', expertProfile.id)
      .eq('status', 'succeeded');

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data: payments, error } = await query;

    if (error) throw error;

    const totalEarnings = payments?.reduce((sum, p) => sum + p.expert_payout_cents, 0) || 0;
    const totalFees = payments?.reduce((sum, p) => sum + p.platform_fee_cents, 0) || 0;
    const sessionCount = payments?.length || 0;

    res.json({
      total_earnings_cents: totalEarnings,
      total_fees_cents: totalFees,
      session_count: sessionCount,
      payments: payments
    });
  } catch (error) {
    next(error);
  }
});

export default router;

// routes/match.ts - AI Matching Service
import express from 'express';
import { z } from 'zod';
import { supabase } from '../server';
import { validateBody } from '../middleware/validation';

const router = express.Router();

const matchRequestSchema = z.object({
  goal: z.string().min(10).max(500),
  category_id: z.string().uuid().optional(),
  budget_max_cents: z.number().int().min(0).optional(),
  language: z.string().default('en'),
  timezone: z.string().optional(),
  urgency: z.enum(['immediate', 'within_hour', 'today', 'this_week']).default('this_week')
});

// POST /api/match - AI-powered expert matching
router.post('/', validateBody(matchRequestSchema), async (req, res, next) => {
  try {
    const { goal, category_id, budget_max_cents, language, timezone, urgency } = req.body;

    // Get available experts
    let expertsQuery = supabase
      .from('expert_profiles')
      .select(`
        *,
        profiles!inner(first_name, last_name, avatar_url, bio, languages, timezone),
        expert_badges(badge),
        reviews!left(rating)
      `)
      .eq('is_active', true);

    if (category_id) {
      expertsQuery = expertsQuery.eq('category_id', category_id);
    }

    if (budget_max_cents) {
      expertsQuery = expertsQuery.lte('rate_cents_per_minute', Math.floor(budget_max_cents / 30)); // Assume 30min session
    }

    if (language !== 'en') {
      expertsQuery = expertsQuery.contains('profiles.languages', [language]);
    }

    const { data: experts, error } = await expertsQuery;

    if (error) throw error;

    if (!experts || experts.length === 0) {
      return res.json({ matches: [], message: 'No experts found matching your criteria' });
    }

    // Simple AI-like matching algorithm
    const matches = experts.map(expert => {
      let score = 0;
      let reasons: string[] = [];

      // Rating score (0-40 points)
      const ratingScore = (expert.rating_avg / 5) * 40;
      score += ratingScore;
      if (expert.rating_avg >= 4.5) {
        reasons.push(`Excellent ${expert.rating_avg}⭐ rating`);
      }

      // Experience score (0-20 points)
      const expScore = Math.min(expert.years_experience / 10, 1) * 20;
      score += expScore;
      if (expert.years_experience >= 5) {
        reasons.push(`${expert.years_experience} years experience`);
      }

      // Keyword matching (0-30 points)
      const goalLower = goal.toLowerCase();
      const expertTags = expert.expertise_tags.join(' ').toLowerCase();
      const bioText = (expert.profiles.bio || '').toLowerCase();
      
      let keywordScore = 0;
      const keywords = goalLower.split(' ').filter(word => word.length > 3);
      
      keywords.forEach(keyword => {
        if (expertTags.includes(keyword) || bioText.includes(keyword)) {
          keywordScore += 5;
        }
      });
      
      score += Math.min(keywordScore, 30);
      if (keywordScore > 0) {
        reasons.push('Strong expertise match');
      }

      // Availability bonus (0-10 points)
      const now = new Date();
      const availability = expert.availability_json;
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      
      let availabilityScore = 0;
      if (urgency === 'immediate' || urgency === 'within_hour') {
        if (availability[currentDay]?.some((slot: any) => 
          currentHour >= slot.start && currentHour < slot.end
        )) {
          availabilityScore = 10;
          reasons.push('Available now');
        }
      } else {
        availabilityScore = 5; // Assume some availability
      }
      
      score += availabilityScore;

      // Badges bonus (0-10 points)
      const badges = expert.expert_badges || [];
      if (badges.some((b: any) => b.badge === 'verified_credentials')) {
        score += 5;
        reasons.push('Verified credentials');
      }
      if (badges.some((b: any) => b.badge === 'background_checked')) {
        score += 3;
        reasons.push('Background checked');
      }
      if (badges.some((b: any) => b.badge === 'notable')) {
        score += 2;
        reasons.push('Notable expert');
      }

      return {
        expert,
        score: Math.round(score),
        reasons,
        next_available: getNextAvailableSlot(expert.availability_json, urgency)
      };
    });

    // Sort by score and return top matches
    const sortedMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Separate into lanes
    const fastestAvailable = sortedMatches
      .filter(m => m.next_available && m.next_available.hours <= 2)
      .slice(0, 3);

    const highestRated = sortedMatches
      .filter(m => m.expert.rating_avg >= 4.0)
      .slice(0, 5);

    res.json({
      matches: sortedMatches,
      fastest_available: fastestAvailable,
      highest_rated: highestRated,
      total_experts: experts.length
    });
  } catch (error) {
    next(error);
  }
});

function getNextAvailableSlot(availability: any, urgency: string) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  // Simplified availability calculation
  if (urgency === 'immediate') {
    const todaySlots = availability[currentDay] || [];
    const nextSlot = todaySlots.find((slot: any) => slot.start > currentHour);
    if (nextSlot) {
      return { hours: nextSlot.start - currentHour, day: 'today' };
    }
  }

  // Default to next business day
  return { hours: 24, day: 'tomorrow' };
}

export default router;

// services/notifications.ts
import { supabase, resend, twilioClient } from '../server';

export async function sendBookingConfirmation(bookingId: string) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, last_name, email),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, last_name, email)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    const scheduledDate = new Date(booking.scheduled_start).toLocaleDateString();
    const scheduledTime = new Date(booking.scheduled_start).toLocaleTimeString();

    // Send email to client
    await resend.emails.send({
      from: 'EncoreTalks <noreply@encoretalks.com>',
      to: booking.client.email,
      subject: 'Your EncoreTalks session is confirmed',
      html: `
        <h2>Session Confirmed! 🎉</h2>
        <p>Hi ${booking.client.first_name},</p>
        <p>Your session with <strong>${booking.expert.profiles.first_name} ${booking.expert.profiles.last_name}</strong> is confirmed for:</p>
        <p><strong>${scheduledDate} at ${scheduledTime}</strong></p>
        <p>Join link: <a href="${booking.meeting_url || '#'}">${booking.meeting_url || 'Will be provided soon'}</a></p>
        <p>We'll send you AI notes and a summary after your call.</p>
        <p>Best regards,<br>The EncoreTalks Team</p>
      `
    });

    // Send email to expert
    await resend.emails.send({
      from: 'EncoreTalks <noreply@encoretalks.com>',
      to: booking.expert.profiles.email,
      subject: 'New EncoreTalks booking',
      html: `
        <h2>New Booking! 💼</h2>
        <p>Hi ${booking.expert.profiles.first_name},</p>
        <p>You've been booked by <strong>${booking.client.first_name} ${booking.client.last_name}</strong> for:</p>
        <p><strong>${scheduledDate} at ${scheduledTime}</strong></p>
        <p>Join link: <a href="${booking.meeting_url || '#'}">${booking.meeting_url || 'Will be generated'}</a></p>
        <p>Session details and preparation notes will be available in your dashboard.</p>
        <p>Best regards,<br>The EncoreTalks Team</p>
      `
    });

    console.log(`✅ Booking confirmation emails sent for booking ${bookingId}`);
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
  }
}

export async function sendBookingReminder(bookingId: string, hoursBeforeStart: number) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email, phone),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, email, phone)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) return;

    const scheduledTime = new Date(booking.scheduled_start).toLocaleString();
    const reminderType = hoursBeforeStart === 24 ? '24-hour' : '1-hour';

    // Email reminders
    const emailPromises = [
      resend.emails.send({
        from: 'EncoreTalks <noreply@encoretalks.com>',
        to: booking.client.email,
        subject: `Reminder: Your EncoreTalks session starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'tomorrow'}`,
        html: `
          <h2>Session Reminder ⏰</h2>
          <p>Hi ${booking.client.first_name},</p>
          <p>Your session with <strong>${booking.expert.profiles.first_name}</strong> starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'in 24 hours'}:</p>
          <p><strong>${scheduledTime}</strong></p>
          <p><a href="${booking.meeting_url}">Join Session</a></p>
        `
      }),
      resend.emails.send({
        from: 'EncoreTalks <noreply@encoretalks.com>',
        to: booking.expert.profiles.email,
        subject: `Reminder: EncoreTalks session starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'tomorrow'}`,
        html: `
          <h2>Session Reminder ⏰</h2>
          <p>Hi ${booking.expert.profiles.first_name},</p>
          <p>Your session with <strong>${booking.client.first_name}</strong> starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'in 24 hours'}:</p>
          <p><strong>${scheduledTime}</strong></p>
          <p><a href="${booking.meeting_url}">Join Session</a></p>
        `
      })
    ];

    await Promise.all(emailPromises);

    // SMS reminders for 1-hour reminder only
    if (hoursBeforeStart === 1) {
      const smsPromises = [];
      
      if (booking.client.phone) {
        smsPromises.push(
          twilioClient.messages.create({
            body: `EncoreTalks reminder: Your session starts in 1 hour. Join: ${booking.meeting_url}`,
            to: booking.client.phone,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
          })
        );
      }

      if (booking.expert.profiles.phone) {
        smsPromises.push(
          twilioClient.messages.create({
            body: `EncoreTalks reminder: Your session with ${booking.client.first_name} starts in 1 hour. Join: ${booking.meeting_url}`,
            to: booking.expert.profiles.phone,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
          })
        );
      }

      if (smsPromises.length > 0) {
        await Promise.all(smsPromises);
      }
    }

    console.log(`✅ ${reminderType} reminders sent for booking ${bookingId}`);
  } catch (error) {
    console.error(`Failed to send ${reminderType} reminder:`, error);
  }
}

export async function processRecordingWithAI(recordingId: string) {
  try {
    // This would integrate with actual AI services for transcription and summarization
    // For now, we'll simulate the process
    
    const { data: recording, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (error || !recording) return;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI-generated summary
    const aiSummary = `
# Session Summary

## Key Topics Discussed
- Professional development strategies
- Industry insights and best practices
- Actionable next steps

## Action Items
- [ ] Research mentioned tools and resources
- [ ] Apply discussed frameworks to current projects
- [ ] Schedule follow-up session if needed

## Key Insights
The expert provided valuable guidance on career advancement and shared specific strategies for professional growth.

*This summary was generated by AI and may not capture all nuances of the conversation.*
    `;

    // Update recording with AI results
    await supabase
      .from('recordings')
      .update({
        ai_summary_md: aiSummary,
        processing_status: 'completed'
      })
      .eq('id', recordingId);

    // Send summary to participants
    await sendRecordingSummary(recording.booking_id, recordingId);

    console.log(`✅ AI processing completed for recording ${recordingId}`);
  } catch (error) {
    console.error('Failed to process recording with AI:', error);
    
    // Mark as failed
    await supabase
      .from('recordings')
      .update({ processing_status: 'failed' })
      .eq('id', recordingId);
  }
}

async function sendRecordingSummary(bookingId: string, recordingId: string) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, email)
        ),
        recordings!inner(ai_summary_md, media_url)
      `)
      .eq('id', bookingId)
      .eq('recordings.id', recordingId)
      .single();

    if (error || !booking) return;

    const recording = booking.recordings[0];
    const sessionDate = new Date(booking.scheduled_start).toLocaleDateString();

    const emailPromises = [
      resend.emails.send({
        from: 'EncoreTalks <noreply@encoretalks.com>',
        to: booking.client.email,
        subject: 'Your EncoreTalks session summary is ready',
        html: `
          <h2>Session Summary Ready! 📝</h2>
          <p>Hi ${booking.client.first_name},</p>
          <p>Your AI-generated summary for the session on ${sessionDate} is now available:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${recording.ai_summary_md.replace(/\n/g, '<br>')}
          </div>
          ${recording.media_url ? `<p><a href="${recording.media_url}">View Recording</a></p>` : ''}
          <p>Best regards,<br>The EncoreTalks Team</p>
        `
      }),
      resend.emails.send({
        from: 'EncoreTalks <noreply@encoretalks.com>',
        to: booking.expert.profiles.email,
        subject: 'Session summary generated',
        html: `
          <h2>Session Summary Ready! 📝</h2>
          <p>Hi ${booking.expert.profiles.first_name},</p>
          <p>The AI summary for your session with ${booking.client.first_name} on ${sessionDate} has been generated and sent to both participants.</p>
          <p>Best regards,<br>The EncoreTalks Team</p>
        `
      })
    ];

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Failed to send recording summary:', error);
  }
}
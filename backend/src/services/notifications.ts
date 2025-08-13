import { supabase } from '../server'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY!)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendClientWelcomeEmail(profileId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', profileId)
      .single()

    if (!profile) return

    await resend.emails.send({
      from: 'EncoreTalks <welcome@encoretalks.com>',
      to: profile.email,
      subject: 'Welcome to EncoreTalks! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to EncoreTalks, ${profile.first_name}!</h1>
          
          <p>You're now part of a community that believes in the power of expert conversations.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Get Started:</h3>
            <ul>
              <li>🔍 <a href="${process.env.PUBLIC_URL}/categories">Browse expert categories</a></li>
              <li>⭐ Find highly-rated professionals</li>
              <li>📅 Book your first session</li>
              <li>🎯 Get personalized guidance</li>
            </ul>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/categories" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Find an Expert
          </a>
          
          <p style="margin-top: 30px; color: #6b7280;">
            Questions? Reply to this email or visit our <a href="${process.env.PUBLIC_URL}/faq">FAQ</a>.
          </p>
        </div>
      `
    })

    console.log(`✅ Welcome email sent to ${profile.email}`)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendExpertWelcomeEmail(profileId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', profileId)
      .single()

    if (!profile) return

    await resend.emails.send({
      from: 'EncoreTalks <experts@encoretalks.com>',
      to: profile.email,
      subject: 'Your expert profile is underway! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to the EncoreTalks Expert Community, ${profile.first_name}!</h1>
          
          <p>Thank you for joining our platform. You're about to help people achieve their goals through expert conversations.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0;">Next Steps:</h3>
            <ol>
              <li>Complete your expert profile</li>
              <li>Set up Stripe Connect for payouts</li>
              <li>Upload credentials for verification</li>
              <li>Set your availability schedule</li>
            </ol>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/app/onboarding/expert" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Finish Onboarding
          </a>
          
          <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h4>Expert Success Tips:</h4>
            <ul style="color: #6b7280;">
              <li>Complete profiles get 3x more bookings</li>
              <li>Respond to inquiries within 2 hours</li>
              <li>Maintain a 4.5+ star rating</li>
              <li>Set competitive but fair pricing</li>
            </ul>
          </div>
        </div>
      `
    })

    console.log(`✅ Expert welcome email sent to ${profile.email}`)
  } catch (error) {
    console.error('Failed to send expert welcome email:', error)
  }
}

export async function sendAbandonedCheckoutEmail(bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name)
        )
      `)
      .eq('id', bookingId)
      .eq('status', 'requested')
      .single()

    if (!booking) return

    const scheduledTime = new Date(booking.scheduled_start).toLocaleString()

    await resend.emails.send({
      from: 'EncoreTalks <bookings@encoretalks.com>',
      to: booking.client.email,
      subject: 'Complete your booking with ' + booking.expert.profiles.first_name,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Don't miss out on your session!</h1>
          
          <p>Hi ${booking.client.first_name},</p>
          
          <p>You started booking a session with <strong>${booking.expert.profiles.first_name}</strong> but didn't complete the payment.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">Session Details:</h3>
            <p style="margin: 5px 0; color: #92400e;"><strong>Expert:</strong> ${booking.expert.profiles.first_name}</p>
            <p style="margin: 5px 0; color: #92400e;"><strong>Scheduled:</strong> ${scheduledTime}</p>
            <p style="margin: 5px 0; color: #92400e;"><strong>Price:</strong> $${(booking.price_cents_total / 100).toFixed(2)}</p>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/experts/${booking.expert_id}?book=true" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Complete Booking
          </a>
          
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            This session slot is held for you for 24 hours. After that, it may become available to other clients.
          </p>
        </div>
      `
    })

    console.log(`✅ Abandoned checkout email sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send abandoned checkout email:', error)
  }
}

export async function sendRecordingReadyEmails(bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, email)
        ),
        recordings!inner(ai_summary_md, media_url, consent_flags)
      `)
      .eq('id', bookingId)
      .single()

    if (!booking || !booking.recordings?.[0]) return

    const recording = booking.recordings[0]
    
    // Only send if both parties consented to recording
    if (!recording.consent_flags?.client_consent || !recording.consent_flags?.expert_consent) {
      return
    }

    const sessionDate = new Date(booking.scheduled_start).toLocaleDateString()

    // Send to client
    await resend.emails.send({
      from: 'EncoreTalks <sessions@encoretalks.com>',
      to: booking.client.email,
      subject: 'Your session recording and AI summary are ready! 📝',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Session Summary is Ready!</h1>
          
          <p>Hi ${booking.client.first_name},</p>
          
          <p>Your session with <strong>${booking.expert.profiles.first_name}</strong> on ${sessionDate} has been processed.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>AI-Generated Summary:</h3>
            <div style="white-space: pre-wrap; color: #374151;">${recording.ai_summary_md}</div>
          </div>
          
          ${recording.media_url ? `
            <a href="${recording.media_url}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">
              View Recording
            </a>
          ` : ''}
          
          <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
             style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Session Details
          </a>
          
          <p style="margin-top: 30px; color: #6b7280;">
            Found this session helpful? <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}/review">Leave a review</a> to help other clients.
          </p>
        </div>
      `
    })

    // Send to expert
    await resend.emails.send({
      from: 'EncoreTalks <sessions@encoretalks.com>',
      to: booking.expert.profiles.email,
      subject: 'Session recording processed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Session Recording Processed</h1>
          
          <p>Hi ${booking.expert.profiles.first_name},</p>
          
          <p>The recording and AI summary for your session with ${booking.client.first_name} on ${sessionDate} has been generated and sent to both participants.</p>
          
          <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Session Details
          </a>
        </div>
      `
    })

    console.log(`✅ Recording ready emails sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send recording ready emails:', error)
  }
}

export async function sendAffiliateInviteEmail(profileId: string, code: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, email')
      .eq('id', profileId)
      .single()

    if (!profile) return

    await resend.emails.send({
      from: 'EncoreTalks <partnerships@encoretalks.com>',
      to: profile.email,
      subject: 'You\'ve been invited to join EncoreTalks as a Founding Expert! 🌟',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Founding Expert Invitation</h1>
          
          <p>Hi ${profile.first_name},</p>
          
          <p>You've been personally invited to join EncoreTalks as one of our founding experts!</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #065f46;">Founding Expert Benefits:</h3>
            <ul style="color: #065f46;">
              <li>Reduced platform fees (15% vs 20%)</li>
              <li>Priority placement in search results</li>
              <li>Founding Expert badge</li>
              <li>Early access to new features</li>
            </ul>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/app/onboarding/expert?code=${code}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Accept Invitation
          </a>
          
          <p style="margin-top: 30px; color: #6b7280;">
            This invitation expires in 7 days. Questions? Reply to this email.
          </p>
        </div>
      `
    })

    console.log(`✅ Affiliate invite email sent to ${profile.email}`)
  } catch (error) {
    console.error('Failed to send affiliate invite email:', error)
  }
}

export async function sendBookingConfirmation(bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, last_name, email, phone),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, last_name, email, phone)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) return

    const scheduledDate = new Date(booking.scheduled_start).toLocaleDateString()
    const scheduledTime = new Date(booking.scheduled_start).toLocaleTimeString()

    // Send email to client
    await resend.emails.send({
      from: 'EncoreTalks <bookings@encoretalks.com>',
      to: booking.client.email,
      subject: 'Your EncoreTalks session is confirmed! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Session Confirmed!</h1>
          
          <p>Hi ${booking.client.first_name},</p>
          
          <p>Your session with <strong>${booking.expert.profiles.first_name} ${booking.expert.profiles.last_name}</strong> is confirmed!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Session Details:</h3>
            <p><strong>Date:</strong> ${scheduledDate}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
            <p><strong>Duration:</strong> ${Math.round((new Date(booking.scheduled_end).getTime() - new Date(booking.scheduled_start).getTime()) / 60000)} minutes</p>
            <p><strong>Mode:</strong> ${booking.mode === 'fixed' ? 'Fixed Duration' : 'Per Minute'}</p>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Booking Details
          </a>
          
          <p style="margin-top: 30px; color: #6b7280;">
            You'll receive reminder emails 24 hours and 1 hour before your session.
          </p>
        </div>
      `
    })

    // Send email to expert
    await resend.emails.send({
      from: 'EncoreTalks <bookings@encoretalks.com>',
      to: booking.expert.profiles.email,
      subject: 'New booking confirmed! 💼',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">New Booking!</h1>
          
          <p>Hi ${booking.expert.profiles.first_name},</p>
          
          <p>You've been booked by <strong>${booking.client.first_name} ${booking.client.last_name}</strong>!</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Session Details:</h3>
            <p><strong>Date:</strong> ${scheduledDate}</p>
            <p><strong>Time:</strong> ${scheduledTime}</p>
            <p><strong>Your Earnings:</strong> $${(booking.expert_net_cents / 100).toFixed(2)}</p>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Booking Details
          </a>
        </div>
      `
    })

    console.log(`✅ Booking confirmation emails sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send booking confirmation:', error)
  }
}

export async function sendPaymentFailedEmail(bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) return

    await resend.emails.send({
      from: 'EncoreTalks <support@encoretalks.com>',
      to: booking.client.email,
      subject: 'Payment failed for your EncoreTalks session',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Payment Failed</h1>
          
          <p>Hi ${booking.client.first_name},</p>
          
          <p>Unfortunately, the payment for your session with ${booking.expert.profiles.first_name} could not be processed.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">What to do next:</h3>
            <ul style="color: #991b1b;">
              <li>Check your payment method</li>
              <li>Try booking again with a different card</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>
          
          <a href="${process.env.PUBLIC_URL}/experts/${booking.expert_id}?book=true" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Try Again
          </a>
          
          <p style="margin-top: 30px; color: #6b7280;">
            Need help? Contact our support team at support@encoretalks.com
          </p>
        </div>
      `
    })

    console.log(`✅ Payment failed email sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send payment failed email:', error)
  }
}

export async function sendBookingReminder(bookingId: string, hoursBeforeStart: number) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(first_name, email, phone),
        expert:expert_profiles!expert_id(
          profiles!inner(first_name, email, phone)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) return

    const scheduledTime = new Date(booking.scheduled_start).toLocaleString()
    const reminderType = hoursBeforeStart === 24 ? '24-hour' : '1-hour'

    // Email reminders
    const emailPromises = [
      resend.emails.send({
        from: 'EncoreTalks <reminders@encoretalks.com>',
        to: booking.client.email,
        subject: `Reminder: Your session starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'tomorrow'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Session Reminder ⏰</h1>
            
            <p>Hi ${booking.client.first_name},</p>
            
            <p>Your session with <strong>${booking.expert.profiles.first_name}</strong> starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'in 24 hours'}:</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; color: #1e40af;">${scheduledTime}</h2>
            </div>
            
            <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Join Session
            </a>
          </div>
        `
      }),
      resend.emails.send({
        from: 'EncoreTalks <reminders@encoretalks.com>',
        to: booking.expert.profiles.email,
        subject: `Reminder: Session starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'tomorrow'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Session Reminder ⏰</h1>
            
            <p>Hi ${booking.expert.profiles.first_name},</p>
            
            <p>Your session with <strong>${booking.client.first_name}</strong> starts ${hoursBeforeStart === 1 ? 'in 1 hour' : 'in 24 hours'}:</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; color: #1e40af;">${scheduledTime}</h2>
            </div>
            
            <a href="${process.env.PUBLIC_URL}/app/bookings/${booking.id}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Join Session
            </a>
          </div>
        `
      })
    ]

    await Promise.all(emailPromises)

    // SMS reminders for 1-hour reminder only
    if (hoursBeforeStart === 1) {
      const smsPromises = []
      
      if (booking.client.phone) {
        smsPromises.push(
          twilioClient.messages.create({
            body: `EncoreTalks reminder: Your session starts in 1 hour. Join: ${process.env.PUBLIC_URL}/app/bookings/${booking.id}`,
            to: booking.client.phone,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
          })
        )
      }

      if (booking.expert.profiles.phone) {
        smsPromises.push(
          twilioClient.messages.create({
            body: `EncoreTalks reminder: Your session with ${booking.client.first_name} starts in 1 hour. Join: ${process.env.PUBLIC_URL}/app/bookings/${booking.id}`,
            to: booking.expert.profiles.phone,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
          })
        )
      }

      if (smsPromises.length > 0) {
        if (twilioClient) {
          await Promise.all(smsPromises)
        } else {
          console.log('📱 SMS not configured, skipping SMS reminders')
        }
      }
    }

    console.log(`✅ ${reminderType} reminders sent for booking ${bookingId}`)
  } catch (error) {
    console.error(`Failed to send ${reminderType} reminder:`, error)
  }
}
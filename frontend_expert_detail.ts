// pages/ExpertDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star, Calendar, Clock, Video, Shield, Award, Globe, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import BookingModal from '../components/booking/BookingModal';
import VideoPlayer from '../components/common/VideoPlayer';

interface Expert {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
    bio: string;
    languages: string[];
    verified: boolean;
    timezone: string;
  };
  headline: string;
  expertise_tags: string[];
  intro_video_url?: string;
  years_experience: number;
  rate_cents_per_minute: number;
  fixed_15m_cents: number;
  fixed_30m_cents: number;
  fixed_60m_cents: number;
  rating_avg: number;
  rating_count: number;
  expert_badges: Array<{ badge: string; awarded_at: string }>;
  reviews: Array<{
    rating: number;
    comment: string;
    created_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  }>;
  mentorship_plans: Array<{
    id: string;
    title: string;
    description: string;
    minutes_per_week: number;
    monthly_price_cents: number;
    async_chat: boolean;
  }>;
}

export default function ExpertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(searchParams.get('book') === 'true');
  const [activeTab, setActiveTab] = useState('overview');
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExpert();
    }
  }, [id]);

  async function fetchExpert() {
    try {
      const response = await fetch(`/api/experts/${id}`);
      if (!response.ok) {
        throw new Error('Expert not found');
      }
      const data = await response.json();
      setExpert(data);
    } catch (error) {
      console.error('Error fetching expert:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load expert profile'
      });
    } finally {
      setLoading(false);
    }
  }

  const handleBookSession = () => {
    if (!user) {
      addNotification({
        type: 'info',
        title: 'Sign in required',
        message: 'Please sign in to book a session'
      });
      return;
    }
    setShowBookingModal(true);
  };

  const renderBadge = (badge: string) => {
    const badges = {
      verified_credentials: { icon: Shield, label: 'Verified Credentials', color: 'green' },
      background_checked: { icon: Shield, label: 'Background Checked', color: 'blue' },
      notable: { icon: Award, label: 'Notable Expert', color: 'purple' }
    };

    const badgeInfo = badges[badge as keyof typeof badges];
    if (!badgeInfo) return null;

    const { icon: Icon, label, color } = badgeInfo;
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800'
    };

    return (
      <div key={badge} className={`flex items-center px-3 py-1 rounded-full text-sm ${colorClasses[color]}`}>
        <Icon className="h-4 w-4 mr-1" />
        {label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Expert not found</h2>
          <p className="text-gray-600">The expert you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Expert Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={expert.profiles.avatar_url || '/default-avatar.png'}
                  alt={`${expert.profiles.first_name} ${expert.profiles.last_name}`}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {expert.profiles.first_name} {expert.profiles.last_name}
                      {expert.profiles.verified && (
                        <span className="ml-2 text-blue-600">✓</span>
                      )}
                    </h1>
                    <p className="text-xl text-gray-600 mb-3">{expert.headline}</p>
                    <div className="flex items-center text-lg mb-4">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="font-semibold">{expert.rating_avg.toFixed(1)}</span>
                      <span className="text-gray-600 ml-1">({expert.rating_count} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.expert_badges.map((badge) => renderBadge(badge.badge))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {expert.profiles.languages.join(', ')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {expert.years_experience} years experience
                  </div>
                </div>

                {expert.intro_video_url && (
                  <button
                    onClick={() => setShowIntroVideo(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Watch Introduction Video
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {expert.expertise_tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'reviews', label: `Reviews (${expert.reviews.length})` },
                { id: 'mentorship', label: 'Mentorship' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4">About {expert.profiles.first_name}</h3>
              <div className="prose max-w-none text-gray-700">
                {expert.profiles.bio ? (
                  <p className="whitespace-pre-wrap">{expert.profiles.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No biography provided.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {expert.reviews.length > 0 ? (
                expert.reviews.map((review, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={review.profiles.avatar_url || '/default-avatar.png'}
                          alt={`${review.profiles.first_name} ${review.profiles.last_name}`}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <h4 className="font-medium">
                            {review.profiles.first_name} {review.profiles.last_name}
                          </h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mentorship' && (
            <div className="space-y-6">
              {expert.mentorship_plans.length > 0 ? (
                expert.mentorship_plans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                        <p className="text-gray-600 mb-4">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${(plan.monthly_price_cents / 100).toFixed(0)}/month
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {plan.minutes_per_week} minutes/week
                        {plan.async_chat && (
                          <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            + Async Chat
                          </span>
                        )}
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors">
                        Subscribe
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                  <p className="text-gray-500">No mentorship plans available.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <h3 className="text-xl font-semibold mb-6">Book a Session</h3>
            
            {/* Pricing Options */}
            <div className="space-y-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Per Minute</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${(expert.rate_cents_per_minute / 100).toFixed(2)}/min
                  </span>
                </div>
                <p className="text-sm text-gray-600">Pay for actual time used (10 min minimum)</p>
              </div>

              <div className="space-y-2">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">15 minutes</span>
                    <span className="text-lg font-bold">
                      ${(expert.fixed_15m_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">30 minutes</span>
                    <span className="text-lg font-bold">
                      ${(expert.fixed_30m_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">60 minutes</span>
                    <span className="text-lg font-bold">
                      ${(expert.fixed_60m_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookSession}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
            >
              Book Now
            </button>

            <div className="flex items-center justify-center text-sm text-gray-600">
              <Video className="h-4 w-4 mr-1" />
              Sessions conducted via secure video call
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        expert={expert}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />

      {showIntroVideo && expert.intro_video_url && (
        <VideoPlayer
          url={expert.intro_video_url}
          isOpen={showIntroVideo}
          onClose={() => setShowIntroVideo(false)}
          title={`Introduction from ${expert.profiles.first_name}`}
        />
      )}
    </div>
  );
}

// components/booking/BookingModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface BookingModalProps {
  expert: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ expert, isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Elements stripe={stripePromise}>
          <BookingForm expert={expert} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}

function BookingForm({ expert, onClose }: { expert: any; onClose: () => void }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [bookingData, setBookingData] = useState({
    mode: 'fixed' as 'fixed' | 'per_minute',
    duration: 30,
    scheduledStart: '',
    scheduledEnd: '',
    price: expert.fixed_30m_cents
  });

  const handleModeChange = (mode: 'fixed' | 'per_minute') => {
    setBookingData(prev => ({
      ...prev,
      mode,
      price: mode === 'per_minute' 
        ? prev.duration * expert.rate_cents_per_minute
        : expert[`fixed_${prev.duration}m_cents` as keyof typeof expert] || expert.fixed_30m_cents
    }));
  };

  const handleDurationChange = (duration: number) => {
    setBookingData(prev => ({
      ...prev,
      duration,
      price: prev.mode === 'per_minute'
        ? duration * expert.rate_cents_per_minute
        : expert[`fixed_${duration}m_cents` as keyof typeof expert] || expert.fixed_30m_cents
    }));
  };

  const handleTimeSelection = (start: string) => {
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + bookingData.duration * 60000);
    
    setBookingData(prev => ({
      ...prev,
      scheduledStart: start,
      scheduledEnd: endDate.toISOString()
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Create booking with payment intent
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          expert_id: expert.id,
          mode: bookingData.mode,
          scheduled_start: bookingData.scheduledStart,
          scheduled_end: bookingData.scheduledEnd
        })
      });

      const { booking, payment_client_secret } = await response.json();

      if (!response.ok) throw new Error('Failed to create booking');

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error } = await stripe.confirmCardPayment(payment_client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${user?.user_metadata.first_name} ${user?.user_metadata.last_name}`,
            email: user?.email
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      addNotification({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your session with ${expert.profiles.first_name} has been booked.`
      });

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Booking Failed',
        message: error instanceof Error ? error.message : 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Book Session with {expert.profiles.first_name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Session Type</h3>
          
          <div className="space-y-4 mb-6">
            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              bookingData.mode === 'per_minute' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`} onClick={() => handleModeChange('per_minute')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Per Minute</h4>
                  <p className="text-sm text-gray-600">Pay for actual time used (10 min minimum)</p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ${(expert.rate_cents_per_minute / 100).toFixed(2)}/min
                </span>
              </div>
            </div>

            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              bookingData.mode === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`} onClick={() => handleModeChange('fixed')}>
              <div>
                <h4 className="font-semibold mb-2">Fixed Duration</h4>
                <div className="space-y-2">
                  {[15, 30, 60].map((duration) => (
                    <label key={duration} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="duration"
                          value={duration}
                          checked={bookingData.duration === duration}
                          onChange={() => handleDurationChange(duration)}
                          className="mr-2"
                        />
                        <span>{duration} minutes</span>
                      </div>
                      <span className="font-semibold">
                        ${(expert[`fixed_${duration}m_cents`] / 100).toFixed(0)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
            <button 
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
          
          <div className="mb-6">
            <input
              type="datetime-local"
              value={bookingData.scheduledStart}
              onChange={(e) => handleTimeSelection(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2">Session Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{bookingData.mode === 'per_minute' ? 'Per Minute' : `${bookingData.duration} min Fixed`}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{bookingData.duration} minutes</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${(bookingData.price / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded-lg">
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={!bookingData.scheduledStart}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handlePayment}>
          <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
          
          <div className="mb-6">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
              className="border border-gray-300 rounded-lg p-3"
            />
          </div>

          <div className="flex justify-between">
            <button 
              type="button"
              onClick={() => setStep(2)} 
              className="px-6 py-2 border border-gray-300 rounded-lg"
            >
              Back
            </button>
            <button 
              type="submit"
              disabled={!stripe || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Complete Booking
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
import { X, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Heart } from 'lucide-react'
import { useState } from 'react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

interface BookingModalProps {
  expert: any
  isOpen: boolean
  onClose: () => void
}

export default function BookingModal({ expert, isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Elements stripe={stripePromise}>
          <BookingForm expert={expert} onClose={onClose} />
        </Elements>
      </div>
    </div>
  )
}

function BookingForm({ expert, onClose }: { expert: any; onClose: () => void }) {
  const { _user } = useAuth()
  const { addNotification } = useNotifications()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [bookingData, setBookingData] = useState({
    mode: 'fixed' as 'fixed' | 'per_minute',
    duration: 30,
    scheduledStart: '',
    scheduledEnd: '',
    price: expert.fixed_30m_cents || 3000
  })

  const handleModeChange = (mode: 'fixed' | 'per_minute') => {
    setBookingData(prev => ({ ...prev, mode }))
  }

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Book Session with {expert.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Session Type</h3>
            
            {/* Per-minute explainer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Per-Minute Pricing Explained</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 10-minute minimum charge</li>
                <li>• Timer starts when you both join the call</li>
                <li>• Pay only for actual conversation time</li>
                <li>• Perfect for quick questions or flexible sessions</li>
              </ul>
            </div>
            
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
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
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
                {expert.charity_enabled && process.env.VITE_FEATURE_CHARITY === 'true' && (
                  <div className="flex justify-between items-center">
                    <span>Charity donation:</span>
                    <div className="flex items-center text-pink-600">
                      <Heart className="h-3 w-3 mr-1" />
                      <span className="text-xs">{expert.charity_pct}% to {expert.charity_org}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${(bookingData.price / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
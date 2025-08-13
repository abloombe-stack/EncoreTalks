import React, { useState } from 'react'
import { X, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

interface BookingModalProps {
  expert: any
  isOpen: boolean
  onClose: () => void
}

export default function BookingModal({ expert, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth()
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
    price: expert?.fixed30 || 220
  })

  if (!isOpen) return null

  const handleModeChange = (mode: 'fixed' | 'per_minute') => {
    setBookingData(prev => ({
      ...prev,
      mode,
      price: mode === 'per_minute' 
        ? prev.duration * (expert?.ratePerMinute || 8.50) * 100
        : expert?.[`fixed${prev.duration}`] || 220
    }))
  }

  const handleDurationChange = (duration: number) => {
    setBookingData(prev => ({
      ...prev,
      duration,
      price: prev.mode === 'per_minute'
        ? duration * (expert?.ratePerMinute || 8.50) * 100
        : expert?.[`fixed${duration}`] || 220
    }))
  }

  const handleTimeSelection = (start: string) => {
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + bookingData.duration * 60000)
    
    setBookingData(prev => ({
      ...prev,
      scheduledStart: start,
      scheduledEnd: endDate.toISOString()
    }))
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      // Simulate booking creation and payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      addNotification({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your session with ${expert?.name} has been booked.`
      })

      onClose()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Booking Failed',
        message: 'Something went wrong. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Book Session with {expert?.name}</h2>
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
                      ${expert?.ratePerMinute}/min
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
                            ${expert?.[`fixed${duration}`] || 0}
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
      </div>
    </div>
  )
}
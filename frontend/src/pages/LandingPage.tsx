import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Video, Clock, Shield, Search, ArrowRight, CheckCircle, Users, Zap, Calendar, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/auth/AuthModal'

interface PlatformMetrics {
  total_sessions_booked: number
  average_rating: number
  expert_earnings_range_min: number
  expert_earnings_range_max: number
  total_experts: number
}

const featuredExperts = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    title: 'Former McKinsey Partner & Strategy Expert',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviews: 127,
    rate: 8.50,
    tags: ['Business Strategy', 'Leadership', 'Management Consulting'],
    nextAvailable: 'Available now',
    inquiries30d: 23,
    charityEnabled: true,
    charityOrg: 'Doctors Without Borders'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    title: 'Senior AI Engineer at Google',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    reviews: 89,
    rate: 6.00,
    tags: ['AI/ML', 'Python', 'Data Science'],
    nextAvailable: 'Available in 2h',
    inquiries30d: 12,
    charityEnabled: false
  },
  {
    id: '3',
    name: 'Dr. Maria Santos',
    title: 'Licensed Therapist & Wellness Coach',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150&h=150&fit=crop&crop=face',
    rating: 4.95,
    reviews: 203,
    rate: 4.00,
    tags: ['Mental Health', 'Stress Management', 'Work-Life Balance'],
    nextAvailable: 'Available now',
    inquiries30d: 45,
    charityEnabled: true,
    charityOrg: 'Mental Health America'
  }
]

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)

  React.useEffect(() => {
    fetchPlatformMetrics()
  }, [])

  async function fetchPlatformMetrics() {
    try {
      const response = await fetch('/api/platform/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error)
      // Fallback metrics
      setMetrics({
        total_sessions_booked: 1248,
        average_rating: 4.9,
        expert_earnings_range_min: 100,
        expert_earnings_range_max: 800,
        total_experts: 156
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/experts?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('/app/dashboard')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  const handleBecomeExpert = () => {
    if (user) {
      navigate('/app/onboarding/expert')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Expert conversations,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> made easy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connect with verified professionals for 1-on-1 video calls, mentorship, 
              and group sessions. Get personalized guidance in business, hobbies, wellness, and life skills.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What would you like to learn or discuss?"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg hover:shadow-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Search <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Find an Expert
              </button>
              <button
                onClick={handleBecomeExpert}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-lg hover:shadow-xl"
              >
                Become an Expert
              </button>
            </div>

            {/* Social Proof Strip */}
            {metrics && (
              <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{metrics.total_sessions_booked.toLocaleString()}+</div>
                    <div className="text-sm text-gray-600 font-medium">Sessions booked</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{metrics.average_rating}★</div>
                    <div className="text-sm text-gray-600 font-medium">Average rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">${metrics.expert_earnings_range_min}–${metrics.expert_earnings_range_max}/hr</div>
                    <div className="text-sm text-gray-600 font-medium">Experts earn</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Experts Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Featured Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with verified professionals who are ready to share their expertise and help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredExperts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {expert.rating} ({expert.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 font-medium">{expert.title}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {expert.inquiries30d} requests in last 30 days
                    </span>
                    {expert.charityEnabled && (
                      <div className="flex items-center text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                        <Heart className="h-3 w-3 mr-1" />
                        Donates to {expert.charityOrg}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${expert.rate}/min
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {expert.nextAvailable}
                    </span>
                  </div>
                  
                  <Link
                    to={`/experts/${expert.id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl text-center font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/experts"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All Experts <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </div>
  )
}
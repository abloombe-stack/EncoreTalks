// pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Video, Clock, Shield, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface Expert {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  headline: string;
  rating_avg: number;
  rating_count: number;
  rate_cents_per_minute: number;
  expertise_tags: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function LandingPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [featuredExperts, setFeaturedExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedExperts();
    fetchCategories();
  }, []);

  async function fetchFeaturedExperts() {
    try {
      const response = await fetch('/api/experts?limit=6');
      const data = await response.json();
      setFeaturedExperts(data.experts || []);
    } catch (error) {
      console.error('Error fetching featured experts:', error);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.slice(0, 8)); // Show top 8 categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/experts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/app/dashboard');
    } else {
      addNotification({
        type: 'info',
        title: 'Sign up to get started',
        message: 'Create an account to book your first expert conversation'
      });
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Expert conversations,
              <span className="text-blue-600"> made easy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified professionals for 1-on-1 video calls, mentorship, 
              and group sessions. Get personalized guidance in business, hobbies, wellness, and life skills.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What would you like to learn or discuss?"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center"
                >
                  Search <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
              <Link
                to="/experts"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Browse Experts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EncoreTalks?</h2>
            <p className="text-xl text-gray-600">Professional expertise at your fingertips</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Experts</h3>
              <p className="text-gray-600">All experts are background-checked and credential-verified</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Video Calls</h3>
              <p className="text-gray-600">Connect immediately or book for later - all in your browser</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Pricing</h3>
              <p className="text-gray-600">Pay per minute or book fixed sessions - your choice</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">Find the perfect expert for your specific needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Categories</h2>
            <p className="text-xl text-gray-600">Find experts in any field</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/experts"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Experts</h2>
            <p className="text-xl text-gray-600">Connect with top-rated professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredExperts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={expert.profiles.avatar_url || '/default-avatar.png'}
                      alt={`${expert.profiles.first_name} ${expert.profiles.last_name}`}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {expert.profiles.first_name} {expert.profiles.last_name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {expert.rating_avg.toFixed(1)} ({expert.rating_count} reviews)
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{expert.headline}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.expertise_tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      ${(expert.rate_cents_per_minute / 100).toFixed(2)}/min
                    </span>
                    <Link
                      to={`/experts/${expert.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/experts"
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Experts
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands who are advancing their careers and skills with expert guidance
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}

// pages/ExpertListPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, Filter, MapPin, Clock } from 'lucide-react';

interface Expert {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
    bio: string;
    languages: string[];
    verified: boolean;
  };
  headline: string;
  expertise_tags: string[];
  rating_avg: number;
  rating_count: number;
  rate_cents_per_minute: number;
  fixed_30m_cents: number;
  expert_badges: Array<{ badge: string }>;
}

export default function ExpertListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') || '',
    min_rating: searchParams.get('min_rating') || '',
    max_rate: searchParams.get('max_rate') || '',
    language: searchParams.get('language') || '',
    available_now: searchParams.get('available_now') === 'true'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, [searchParams]);

  async function fetchExperts() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/experts?${queryParams}`);
      const data = await response.json();
      setExperts(data.experts || []);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      tags: '',
      min_rating: '',
      max_rate: '',
      language: '',
      available_now: false
    });
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => updateFilters({ min_rating: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Rate (per minute)
                </label>
                <select
                  value={filters.max_rate}
                  onChange={(e) => updateFilters({ max_rate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Any Price</option>
                  <option value="200">Under $2.00</option>
                  <option value="500">Under $5.00</option>
                  <option value="1000">Under $10.00</option>
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => updateFilters({ language: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Any Language</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.available_now}
                    onChange={(e) => updateFilters({ available_now: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available Now</span>
                </label>
              </div>

              <button
                onClick={clearFilters}
                className="w-full text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Expert List */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Find Your Expert
            </h1>
            <p className="text-gray-600">
              {experts.length} experts found
            </p>
          </div>

          <div className="space-y-6">
            {experts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={expert.profiles.avatar_url || '/default-avatar.png'}
                      alt={`${expert.profiles.first_name} ${expert.profiles.last_name}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {expert.profiles.first_name} {expert.profiles.last_name}
                          {expert.profiles.verified && (
                            <span className="ml-2 text-blue-600">✓</span>
                          )}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {expert.rating_avg.toFixed(1)} ({expert.rating_count} reviews)
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold mb-1">
                          ${(expert.rate_cents_per_minute / 100).toFixed(2)}/min
                        </div>
                        <div className="text-sm text-gray-600">
                          30min: ${(expert.fixed_30m_cents / 100).toFixed(0)}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{expert.headline}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {expert.expertise_tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 md:mb-0">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {expert.profiles.languages.join(', ')}
                        </div>
                        {expert.expert_badges.some(b => b.badge === 'verified_credentials') && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/experts/${expert.id}`}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/experts/${expert.id}?book=true`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {experts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No experts found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
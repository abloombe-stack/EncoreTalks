// pages/app/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, DollarSign, Users, Video, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/common/StatsCard';
import RecentBookings from '../../components/dashboard/RecentBookings';
import UpcomingSession from '../../components/dashboard/UpcomingSession';
import QuickActions from '../../components/dashboard/QuickActions';

interface DashboardStats {
  total_bookings: number;
  upcoming_sessions: number;
  total_earnings?: number;
  avg_rating?: number;
  total_clients?: number;
  this_month_sessions: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsResponse, upcomingResponse] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${user?.access_token}` }
        }),
        fetch('/api/bookings?status=confirmed&limit=1', {
          headers: { 'Authorization': `Bearer ${user?.access_token}` }
        })
      ]);

      const statsData = await statsResponse.json();
      const upcomingData = await upcomingResponse.json();

      setStats(statsData);
      setUpcomingSession(upcomingData.bookings?.[0] || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isExpert = profile?.role === 'expert';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-gray-600">
          {isExpert 
            ? "Here's an overview of your expert activity."
            : "Here's your learning journey overview."
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats?.total_bookings || 0}
          icon={Video}
          color="blue"
          trend={stats?.this_month_sessions ? `+${stats.this_month_sessions} this month` : undefined}
        />
        
        <StatsCard
          title="Upcoming"
          value={stats?.upcoming_sessions || 0}
          icon={Calendar}
          color="green"
        />

        {isExpert ? (
          <>
            <StatsCard
              title="Total Earnings"
              value={`$${((stats?.total_earnings || 0) / 100).toFixed(0)}`}
              icon={DollarSign}
              color="purple"
            />
            <StatsCard
              title="Avg Rating"
              value={stats?.avg_rating?.toFixed(1) || '0.0'}
              icon={Star}
              color="yellow"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Experts Met"
              value={stats?.total_clients || 0}
              icon={Users}
              color="purple"
            />
            <StatsCard
              title="Learning Hours"
              value={`${Math.round((stats?.total_bookings || 0) * 0.5)}h`}
              icon={Clock}
              color="indigo"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Session */}
          {upcomingSession && (
            <UpcomingSession session={upcomingSession} isExpert={isExpert} />
          )}

          {/* Recent Bookings */}
          <RecentBookings isExpert={isExpert} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions isExpert={isExpert} />

          {/* Performance Insights (Expert only) */}
          {isExpert && stats && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Booking Rate</span>
                  <span className="font-semibold">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Repeat Clients</span>
                  <span className="font-semibold">23%</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New review received</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Payment processed</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
            <Link 
              to="/app/notifications" 
              className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
            >
              View all notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/common/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'red';
  trend?: string;
}

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 mt-1">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// components/dashboard/UpcomingSession.tsx
import React from 'react';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpcomingSessionProps {
  session: any;
  isExpert: boolean;
}

export default function UpcomingSession({ session, isExpert }: UpcomingSessionProps) {
  const scheduledStart = new Date(session.scheduled_start);
  const timeUntilStart = scheduledStart.getTime() - Date.now();
  const canJoin = timeUntilStart <= 15 * 60 * 1000 && timeUntilStart > -30 * 60 * 1000; // 15 min before to 30 min after

  const otherParty = isExpert ? session.client : session.expert;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Next Session</h3>
        {canJoin && (
          <Link
            to={`/app/session/${session.id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Video className="h-4 w-4 mr-2" />
            Join Now
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <img
          src={otherParty.profiles?.avatar_url || otherParty.avatar_url || '/default-avatar.png'}
          alt="Participant"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium">
            {isExpert ? 'Session with' : 'Learning from'}{' '}
            {otherParty.profiles?.first_name || otherParty.first_name}{' '}
            {otherParty.profiles?.last_name || otherParty.last_name}
          </h4>
          <p className="text-sm text-gray-600">
            {isExpert ? 'Client' : session.expert.headline}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {scheduledStart.toLocaleDateString()}
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          {scheduledStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {!canJoin && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          Join button will be available 15 minutes before your session starts.
        </div>
      )}
    </div>
  );
}

// components/dashboard/RecentBookings.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, MoreHorizontal } from 'lucide-react';

interface RecentBookingsProps {
  isExpert: boolean;
}

export default function RecentBookings({ isExpert }: RecentBookingsProps) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  async function fetchRecentBookings() {
    try {
      const response = await fetch('/api/bookings?limit=5', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'text-green-700 bg-green-100',
      completed: 'text-blue-700 bg-blue-100',
      cancelled: 'text-red-700 bg-red-100',
      in_progress: 'text-yellow-700 bg-yellow-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Sessions</h3>
        <Link to="/app/bookings" className="text-sm text-blue-600 hover:text-blue-700">
          View all
        </Link>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const otherParty = isExpert ? booking.client : booking.expert;
            return (
              <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={otherParty?.avatar_url || '/default-avatar.png'}
                    alt="Participant"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium">
                      {otherParty?.first_name} {otherParty?.last_name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.scheduled_start).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(booking.scheduled_start).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/app/bookings/${booking.id}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h4>
          <p className="text-gray-600 mb-4">
            {isExpert 
              ? "Once you start getting bookings, they'll appear here."
              : "Book your first session to get started!"
            }
          </p>
          <Link
            to={isExpert ? "/app/expert/profile" : "/experts"}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isExpert ? "Complete Profile" : "Find Experts"}
          </Link>
        </div>
      )}
    </div>
  );
}

// components/dashboard/QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Settings, CreditCard, BarChart, Users } from 'lucide-react';

interface QuickActionsProps {
  isExpert: boolean;
}

export default function QuickActions({ isExpert }: QuickActionsProps) {
  const expertActions = [
    {
      icon: Calendar,
      label: 'Manage Availability',
      href: '/app/calendar',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart,
      label: 'View Earnings',
      href: '/app/expert/earnings',
      color: 'bg-green-500'
    },
    {
      icon: Users,
      label: 'Client Reviews',
      href: '/app/expert/reviews',
      color: 'bg-purple-500'
    },
    {
      icon: Settings,
      label: 'Profile Settings',
      href: '/app/expert/profile',
      color: 'bg-gray-500'
    }
  ];

  const clientActions = [
    {
      icon: Search,
      label: 'Find Experts',
      href: '/experts',
      color: 'bg-blue-500'
    },
    {
      icon: Calendar,
      label: 'My Sessions',
      href: '/app/bookings',
      color: 'bg-green-500'
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      href: '/app/payment-methods',
      color: 'bg-purple-500'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/app/settings',
      color: 'bg-gray-500'
    }
  ];

  const actions = isExpert ? expertActions : clientActions;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <span className="ml-3 font-medium text-gray-900">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// components/common/VideoPlayer.tsx
import React from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function VideoPlayer({ url, isOpen, onClose, title }: VideoPlayerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="aspect-video">
          <video
            src={url}
            controls
            className="w-full h-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
// App.tsx - Main React Application
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Public pages
import LandingPage from './pages/LandingPage';
import ExpertListPage from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import CategoryPage from './pages/CategoryPage';
import NotablesPage from './pages/NotablesPage';
import MentorshipPage from './pages/MentorshipPage';
import OrganizationLanding from './pages/OrganizationLanding';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// App pages (authenticated)
import Dashboard from './pages/app/Dashboard';
import BookingsPage from './pages/app/BookingsPage';
import BookingDetailPage from './pages/app/BookingDetailPage';
import MessagesPage from './pages/app/MessagesPage';
import CalendarPage from './pages/app/CalendarPage';
import ExpertEarningsPage from './pages/app/ExpertEarningsPage';
import AdminDashboard from './pages/app/AdminDashboard';
import OrgDashboard from './pages/app/OrgDashboard';

// Auth components
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppSidebar from './components/layout/AppSidebar';
import NotificationToast from './components/common/NotificationToast';

// PWA components
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';

import './App.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <AppContent />
            <PWAInstallPrompt />
            <NotificationToast />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/categories/:id" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/experts" element={<PublicLayout><ExpertListPage /></PublicLayout>} />
        <Route path="/experts/:id" element={<PublicLayout><ExpertDetailPage /></PublicLayout>} />
        <Route path="/notables" element={<PublicLayout><NotablesPage /></PublicLayout>} />
        <Route path="/mentorship" element={<PublicLayout><MentorshipPage /></PublicLayout>} />
        <Route path="/org" element={<PublicLayout><OrganizationLanding /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

        {/* App routes (protected) */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="bookings/:id" element={<BookingDetailPage />} />
                <Route path="messages/:bookingId" element={<MessagesPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="expert/earnings" element={<ExpertEarningsPage />} />
                <Route path="admin/*" element={<AdminDashboard />} />
                <Route path="org/*" element={<OrgDashboard />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
      />
      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">EncoreTalks</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default App;

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, AuthError, User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  }

  async function signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'client'
        });

      if (profileError) throw profileError;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile(updates: any) {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setProfile(prev => ({ ...prev, ...updates }));
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// contexts/NotificationContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
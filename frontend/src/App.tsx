import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

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

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppSidebar from './components/layout/AppSidebar';
import NotificationToast from './components/common/NotificationToast';

// PWA components
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <AppContent />
          <PWAInstallPrompt />
          <NotificationToast />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
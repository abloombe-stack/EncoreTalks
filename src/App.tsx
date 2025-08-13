import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'

// Public pages
import LandingPage from './pages/LandingPage'
import ExpertListPage from './pages/ExpertListPage'
import ExpertDetailPage from './pages/ExpertDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import NotablesPage from './pages/NotablesPage'
import MentorshipPage from './pages/MentorshipPage'
import OrganizationPage from './pages/OrganizationPage'
import FAQPage from './pages/FAQPage'
import AboutPage from './pages/AboutPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

// App pages (authenticated)
import Dashboard from './pages/app/Dashboard'
import BookingsPage from './pages/app/BookingsPage'
import BookingDetailPage from './pages/app/BookingDetailPage'
import MessagesPage from './pages/app/MessagesPage'
import CalendarPage from './pages/app/CalendarPage'
import ExpertEarningsPage from './pages/app/ExpertEarningsPage'
import ExpertOnboardingPage from './pages/app/ExpertOnboardingPage'
import AdminDashboard from './pages/app/AdminDashboard'
import OrgDashboard from './pages/app/OrgDashboard'

// Layout components
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import NotificationToast from './components/common/NotificationToast'
import ErrorBoundary from './components/common/ErrorBoundary'
import NotFoundPage from './pages/NotFoundPage'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function App() {
  return (
    <ErrorBoundary>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
                  <Route path="/categories" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
                  <Route path="/categories/:id" element={<PublicLayout><CategoryPage /></PublicLayout>} />
                  <Route path="/experts" element={<PublicLayout><ExpertListPage /></PublicLayout>} />
                  <Route path="/experts/:id" element={<PublicLayout><ExpertDetailPage /></PublicLayout>} />
                  <Route path="/notables" element={<PublicLayout><NotablesPage /></PublicLayout>} />
                  <Route path="/mentorship" element={<PublicLayout><MentorshipPage /></PublicLayout>} />
                  <Route path="/org" element={<PublicLayout><OrganizationPage /></PublicLayout>} />
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
                          <Route path="onboarding/expert" element={<ExpertOnboardingPage />} />
                          <Route path="admin/*" element={<AdminDashboard />} />
                          <Route path="org/*" element={<OrgDashboard />} />
                          <Route path="" element={<Dashboard />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } />

                  {/* 404 page */}
                  <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
                </Routes>

                <NotificationToast />
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </Elements>
    </ErrorBoundary>
  )
}

export default App
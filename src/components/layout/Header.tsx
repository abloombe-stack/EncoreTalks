import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Settings, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import AuthModal from '../auth/AuthModal'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleSignOut = async () => {
    try {
      await signOut()
      addNotification({
        type: 'success',
        title: 'Signed out successfully',
        message: 'You have been signed out of your account'
      })
      navigate('/')
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sign out failed',
        message: 'There was an error signing out'
      })
    }
  }

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">ET</span>
                </div>
                <span className="text-xl font-bold text-gray-900">EncoreTalks</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/categories" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Find Experts
              </Link>
              <Link to="/mentorship" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Mentorship
              </Link>
              <Link to="/org" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                For Organizations
              </Link>
              <Link to="/notables" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Notable Experts
              </Link>
            </nav>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user && profile ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}&background=2563eb&color=fff`}
                      alt={profile.first_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="hidden sm:block font-medium">{profile.first_name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/app/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/app/bookings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        My Sessions
                      </Link>
                      <Link
                        to="/app/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleSignOut()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleAuthClick('signin')}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleAuthClick('signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/categories"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Experts
              </Link>
              <Link
                to="/mentorship"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mentorship
              </Link>
              <Link
                to="/org"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                For Organizations
              </Link>
              <Link
                to="/notables"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Notable Experts
              </Link>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </>
  )
}
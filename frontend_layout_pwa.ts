// components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      addNotification({
        type: 'success',
        title: 'Signed out successfully',
        message: 'You have been signed out of your account'
      });
      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sign out failed',
        message: 'There was an error signing out'
      });
    }
  };

  return (
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
            <Link to="/experts" className="text-gray-600 hover:text-gray-900 font-medium">
              Find Experts
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-gray-900 font-medium">
              Categories
            </Link>
            <Link to="/mentorship" className="text-gray-600 hover:text-gray-900 font-medium">
              Mentorship
            </Link>
            <Link to="/org" className="text-gray-600 hover:text-gray-900 font-medium">
              For Organizations
            </Link>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <img
                    src={profile.avatar_url || '/default-avatar.png'}
                    alt={profile.first_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:block font-medium">{profile.first_name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/app/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/app/bookings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      My Sessions
                    </Link>
                    <Link
                      to="/app/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-gray-900 font-medium">
                  Sign In
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700">
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
              to="/experts"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Experts
            </Link>
            <Link
              to="/categories"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/mentorship"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Mentorship
            </Link>
            <Link
              to="/org"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              For Organizations
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">ET</span>
              </div>
              <span className="text-xl font-bold">EncoreTalks</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Expert conversations, made easy. Connect with verified professionals for 
              1-on-1 video calls, mentorship, and group sessions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/experts" className="text-gray-300 hover:text-white">Find Experts</Link></li>
              <li><Link to="/mentorship" className="text-gray-300 hover:text-white">Mentorship</Link></li>
              <li><Link to="/org" className="text-gray-300 hover:text-white">For Organizations</Link></li>
              <li><Link to="/notables" className="text-gray-300 hover:text-white">Notable Experts</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><a href="mailto:support@encoretalks.com" className="text-gray-300 hover:text-white">Contact Support</a></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 EncoreTalks. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <a href="mailto:hello@encoretalks.com" className="text-gray-400 hover:text-white text-sm">
              hello@encoretalks.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// components/layout/AppSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Settings, 
  Users, 
  BarChart3,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AppSidebar() {
  const { profile } = useAuth();
  const location = useLocation();

  const isExpert = profile?.role === 'expert';
  const isAdmin = profile?.role === 'admin';

  const clientNavItems = [
    { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Calendar, label: 'My Sessions', path: '/app/bookings' },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    { icon: Settings, label: 'Settings', path: '/app/settings' }
  ];

  const expertNavItems = [
    { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Calendar, label: 'Schedule', path: '/app/calendar' },
    { icon: Calendar, label: 'Bookings', path: '/app/bookings' },
    { icon: DollarSign, label: 'Earnings', path: '/app/expert/earnings' },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    { icon: Settings, label: 'Profile', path: '/app/expert/profile' }
  ];

  const adminNavItems = [
    { icon: Shield, label: 'Admin Panel', path: '/app/admin' },
    { icon: Users, label: 'Users', path: '/app/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/app/admin/analytics' }
  ];

  let navItems = clientNavItems;
  if (isExpert) {
    navItems = [...expertNavItems];
  }
  if (isAdmin) {
    navItems = [...navItems, ...adminNavItems];
  }

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <Link to="/" className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white font-bold text-sm">ET</span>
          </div>
          <span className="text-xl font-bold text-gray-900">EncoreTalks</span>
        </Link>
      </div>

      <nav className="px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Quick Stats */}
      {isExpert && (
        <div className="mt-8 mx-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">This Month</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Sessions</span>
              <span className="text-blue-900 font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Earnings</span>
              <span className="text-blue-900 font-medium">$1,240</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Rating</span>
              <span className="text-blue-900 font-medium">4.9⭐</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// components/pwa/PWAInstallPrompt.tsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setShowPrompt(false);
    await deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Install EncoreTalks
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Add to your home screen for quick access to expert conversations.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-600 px-3 py-1 rounded text-sm hover:text-gray-900"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// components/common/NotificationToast.tsx
import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full rounded-lg border p-4 shadow-lg ${getColorClasses(notification.type)} animate-in slide-in-from-right`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h3>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// public/sw.js - Service Worker for PWA
const CACHE_NAME = 'encoretalks-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/default-avatar.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// public/manifest.json - PWA Manifest
{
  "name": "EncoreTalks",
  "short_name": "EncoreTalks",
  "description": "Expert conversations, made easy",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
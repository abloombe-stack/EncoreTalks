import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

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
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/categories" className="text-gray-300 hover:text-white transition-colors">Find Experts</Link></li>
              <li><Link to="/mentorship" className="text-gray-300 hover:text-white transition-colors">Mentorship</Link></li>
              <li><Link to="/org" className="text-gray-300 hover:text-white transition-colors">For Organizations</Link></li>
              <li><Link to="/notables" className="text-gray-300 hover:text-white transition-colors">Notable Experts</Link></li>
              <li><Link to="/app/onboarding/expert" className="text-gray-300 hover:text-white transition-colors">Become an Expert</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="mailto:support@encoretalks.com" className="text-gray-300 hover:text-white transition-colors">Contact Support</a></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 EncoreTalks. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <a href="mailto:hello@encoretalks.com" className="text-gray-400 hover:text-white text-sm transition-colors">
              hello@encoretalks.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
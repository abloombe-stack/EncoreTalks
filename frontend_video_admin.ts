// components/video/VideoSession.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Share, Record } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface VideoSessionProps {
  bookingId: string;
  onEndSession: () => void;
}

export default function VideoSession({ bookingId, onEndSession }: VideoSessionProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeVideoCall();
    startSessionTimer();

    return () => {
      cleanupCall();
    };
  }, []);

  async function initializeVideoCall() {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to remote peer via signaling server
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            bookingId
          });
        }
      };

      // Connect to signaling server (WebSocket)
      connectToSignalingServer();

    } catch (error) {
      console.error('Error initializing video call:', error);
      addNotification({
        type: 'error',
        title: 'Video Error',
        message: 'Failed to access camera and microphone'
      });
    }
  }

  function connectToSignalingServer() {
    // In a real implementation, this would connect to a WebSocket server
    // For demo purposes, we'll simulate the connection
    setTimeout(() => {
      setIsConnected(true);
      addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Video call established successfully'
      });
    }, 2000);
  }

  function sendSignalingMessage(message: any) {
    // Send message to signaling server
    // This would use WebSocket in a real implementation
    console.log('Sending signaling message:', message);
  }

  function startSessionTimer() {
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }

  function toggleAudio() {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }

  function toggleVideo() {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }

  function toggleRecording() {
    setIsRecording(!isRecording);
    // Implement recording logic
    addNotification({
      type: 'info',
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      message: isRecording ? 'Session recording has been stopped' : 'Session is now being recorded'
    });
  }

  function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then(stream => {
        // Replace video track with screen share
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          // Resume camera when screen sharing ends
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(cameraStream => {
              const cameraTrack = cameraStream.getVideoTracks()[0];
              if (sender) {
                sender.replaceTrack(cameraTrack);
              }
            });
        };
      })
      .catch(error => {
        console.error('Error sharing screen:', error);
      });
  }

  function endCall() {
    cleanupCall();
    onEndSession();
  }

  function cleanupCall() {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
          <span className="text-lg font-mono">{formatDuration(sessionDuration)}</span>
        </div>
        
        <button
          onClick={toggleRecording}
          className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isRecording ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Record className="h-4 w-4 mr-1" />
          {isRecording ? 'Recording' : 'Record'}
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Connection status overlay */}
        {!isConnected && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Connecting to session...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioEnabled ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoEnabled ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={shareScreen}
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600"
          >
            <Share className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600"
          >
            <MessageSquare className="h-6 w-6" />
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <Phone className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-16 bottom-24 w-80 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Session Chat</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Chat messages would go here */}
            <p className="text-gray-500 text-sm">Chat messages will appear here during the session.</p>
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// pages/app/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Shield, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/common/StatsCard';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    total_users: 0,
    total_experts: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_verifications: 0,
    active_sessions: 0
  });

  // Redirect non-admins
  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchAdminStats();
  }, []);

  async function fetchAdminStats() {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }

  const navItems = [
    { path: '/app/admin', label: 'Overview', icon: TrendingUp },
    { path: '/app/admin/users', label: 'Users', icon: Users },
    { path: '/app/admin/experts', label: 'Expert Verification', icon: Shield },
    { path: '/app/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/app/admin/payments', label: 'Payments', icon: DollarSign },
    { path: '/app/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-full">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Admin Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminOverview stats={stats} />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/experts" element={<ExpertVerification />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminOverview({ stats }: { stats: any }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600">Monitor platform performance and activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Experts"
          value={stats.total_experts}
          icon={Shield}
          color="green"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.total_bookings}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Revenue (MTD)"
          value={`$${(stats.total_revenue / 100).toFixed(0)}`}
          icon={DollarSign}
          color="yellow"
        />
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Pending Actions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm">Expert verifications pending</span>
              <span className="font-semibold text-orange-700">{stats.pending_verifications}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">Active support tickets</span>
              <span className="font-semibold text-blue-700">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm">Payment disputes</span>
              <span className="font-semibold text-red-700">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Current Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm">Active sessions</span>
              <span className="font-semibold text-green-700">{stats.active_sessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">Sessions today</span>
              <span className="font-semibold text-blue-700">24</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm">New signups (24h)</span>
              <span className="font-semibold text-purple-700">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New expert application', user: 'John Doe', time: '5 minutes ago', status: 'pending' },
            { action: 'Payment processed', user: 'Sarah Wilson', time: '12 minutes ago', status: 'completed' },
            { action: 'Session completed', user: 'Mike Johnson', time: '18 minutes ago', status: 'completed' },
            { action: 'Dispute opened', user: 'Alice Brown', time: '1 hour ago', status: 'pending' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">User management interface would go here.</p>
      </div>
    </div>
  );
}

function ExpertVerification() {
  const [pendingExperts, setPendingExperts] = useState([]);

  useEffect(() => {
    // Fetch pending expert verifications
    fetchPendingExperts();
  }, []);

  async function fetchPendingExperts() {
    try {
      const response = await fetch('/api/admin/experts/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      const data = await response.json();
      setPendingExperts(data.experts || []);
    } catch (error) {
      console.error('Error fetching pending experts:', error);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Expert Verification</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Pending Verifications ({pendingExperts.length})</h3>
        </div>
        
        <div className="divide-y">
          {pendingExperts.length > 0 ? (
            pendingExperts.map((expert: any) => (
              <div key={expert.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={expert.profiles?.avatar_url || '/default-avatar.png'}
                      alt={expert.profiles?.first_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">
                        {expert.profiles?.first_name} {expert.profiles?.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{expert.headline}</p>
                      <p className="text-sm text-gray-500">{expert.years_experience} years experience</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending expert verifications at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingManagement() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Booking management interface would go here.</p>
      </div>
    </div>
  );
}

function PaymentManagement() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Management</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Payment management interface would go here.</p>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Settings</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Platform settings interface would go here.</p>
      </div>
    </div>
  );
}
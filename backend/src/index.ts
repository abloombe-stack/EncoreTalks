import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    service: 'EncoreTalks API'
  });
});

// Mock API endpoints for preview
app.get('/api/experts', (_req, res) => {
  res.json({
    experts: [
      {
        id: '1',
        profiles: {
          first_name: 'Dr. Sarah',
          last_name: 'Wilson',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150&h=150&fit=crop&crop=face',
          bio: 'Former McKinsey partner with 20+ years in strategy consulting',
          languages: ['en'],
          verified: true
        },
        headline: 'Strategic Business Consultant & Former McKinsey Partner',
        expertise_tags: ['business strategy', 'leadership', 'consulting'],
        rating_avg: 4.9,
        rating_count: 127,
        rate_cents_per_minute: 850,
        fixed_30m_cents: 3200,
        expert_badges: [
          { badge: 'verified_credentials' },
          { badge: 'notable' }
        ]
      },
      {
        id: '2',
        profiles: {
          first_name: 'Marcus',
          last_name: 'Chen',
          avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face',
          bio: 'Senior AI Engineer at Google with expertise in machine learning',
          languages: ['en', 'zh'],
          verified: true
        },
        headline: 'Senior AI Engineer at Google',
        expertise_tags: ['artificial intelligence', 'machine learning', 'python'],
        rating_avg: 4.8,
        rating_count: 89,
        rate_cents_per_minute: 600,
        fixed_30m_cents: 2200,
        expert_badges: [
          { badge: 'verified_credentials' }
        ]
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      hasMore: false
    }
  });
});

app.get('/api/platform/metrics', (_req, res) => {
  res.json({
    total_sessions_booked: 1248,
    average_rating: 4.9,
    expert_earnings_range_min: 100,
    expert_earnings_range_max: 800,
    total_experts: 156
  });
});

app.get('/api/categories', (_req, res) => {
  res.json([
    { id: 'cat-business', name: 'Business & Finance', description: 'Expert guidance on business strategy', icon: '💼' },
    { id: 'cat-tech', name: 'Technology', description: 'Software development and tech trends', icon: '💻' },
    { id: 'cat-health', name: 'Health & Wellness', description: 'Fitness, nutrition, and wellness', icon: '🏥' },
    { id: 'cat-creative', name: 'Creative Arts', description: 'Design, writing, and creative skills', icon: '🎨' }
  ]);
});

// Serve built frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

app.use(express.static(frontendDist));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ 
        error: 'Frontend not built. Run npm run build first.',
        path: indexPath
      });
    }
  });
});

// Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(PORT, () => {
  console.log(`🚀 EncoreTalks server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

export default app;
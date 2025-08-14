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

// API routes placeholder
app.get('/api/experts', (_req, res) => {
  res.json({
    experts: [
      {
        id: '1',
        name: 'Dr. Sarah Wilson',
        title: 'Former McKinsey Partner',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150&h=150&fit=crop&crop=face',
        rating: 4.9,
        reviews: 127,
        rate: 8.50,
        tags: ['Business Strategy', 'Leadership'],
        available: true
      },
      {
        id: '2',
        name: 'Marcus Chen',
        title: 'Senior AI Engineer at Google',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        reviews: 89,
        rate: 6.00,
        tags: ['AI/ML', 'Python'],
        available: false
      }
    ]
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
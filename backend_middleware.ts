// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../server';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: any;
  };
}

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role,
      profile
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireExpert = requireRole(['expert', 'admin']);

// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.code === '23514') { // PostgreSQL check violation
    statusCode = 400;
    message = 'Invalid data';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// middleware/auditLogger.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../server';

interface AuditRequest extends Request {
  user?: { id: string; role: string };
}

export const auditLogger = async (req: AuditRequest, res: Response, next: NextFunction) => {
  // Only log mutations and admin actions
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || req.path.includes('/admin/')) {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Log after response is sent
      setTimeout(async () => {
        try {
          if (req.user && res.statusCode < 400) {
            const action = `${req.method} ${req.path}`;
            const entityMatch = req.path.match(/\/api\/(\w+)/);
            const entity = entityMatch ? entityMatch[1] : 'unknown';
            
            const entityIdMatch = req.path.match(/\/([a-f0-9-]{36})/);
            const entityId = entityIdMatch ? entityIdMatch[1] : 'unknown';

            await supabase
              .from('audit_logs')
              .insert({
                actor_id: req.user.id,
                action,
                entity,
                entity_id: entityId,
                meta_json: {
                  method: req.method,
                  path: req.path,
                  status: res.statusCode,
                  ip: req.ip,
                  userAgent: req.get('User-Agent')
                }
              });
          }
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      }, 0);

      return originalSend.call(this, body);
    };
  }

  next();
};

// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        next(error);
      }
    }
  };
};
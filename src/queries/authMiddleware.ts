import jwt from 'jsonwebtoken';

// Types for authentication middleware
export interface TokenPayload {
  userId: string;
  permissions: string[];
  exp: number;
  iat: number;
}

export interface TokenValidationResult {
  valid: boolean;
  userId: string;
  permissions: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { requests: { timestamp: number }[], windowStart: number }>();

/**
 * Validates JWT token structure, checks expiry, and extracts claims
 * @param token - JWT token string
 * @returns Token validation result with user data
 */
export function validateToken(token: string): TokenValidationResult {
  const defaultResult: TokenValidationResult = {
    valid: false,
    userId: '',
    permissions: []
  };

  try {
    // Check if token exists and is properly formatted
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return defaultResult;
    }

    // Remove Bearer prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    
    // Verify token structure (should have 3 parts separated by dots)
    const tokenParts = cleanToken.split('.');
    if (tokenParts.length !== 3) {
      return defaultResult;
    }

    // Verify and decode token
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(cleanToken, secretKey) as TokenPayload;

    // Validate payload structure
    if (!decoded || typeof decoded !== 'object') {
      return defaultResult;
    }

    // Check required fields
    if (!decoded.userId || !Array.isArray(decoded.permissions)) {
      return defaultResult;
    }

    // Check expiry manually for additional security
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return defaultResult;
    }

    return {
      valid: true,
      userId: decoded.userId,
      permissions: decoded.permissions
    };

  } catch (error) {
    // Never expose internal errors - log them internally if needed
    // console.error('Token validation error:', error);
    return defaultResult;
  }
}

/**
 * Returns middleware function that checks if authenticated user has required permission
 * @param permission - Required permission string
 * @returns Middleware function that validates permission
 */
export function requirePermission(permission: string): (req: AuthRequest) => boolean {
  return (req: AuthRequest): boolean => {
    try {
      // Validate permission parameter
      if (!permission || typeof permission !== 'string' || permission.trim() === '') {
        return false;
      }

      // Check if user context exists
      if (!req.user || !req.user.permissions || !Array.isArray(req.user.permissions)) {
        return false;
      }

      // Check if user has the required permission
      const hasPermission = req.user.permissions.includes(permission.trim());
      
      return hasPermission;

    } catch (error) {
      // Never expose internal errors
      return false;
    }
  };
}

/**
 * Implements sliding window rate limiting with overflow protection
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Function that checks rate limits for a user
 */
export function rateLimiter(maxRequests: number, windowMs: number): (userId: string) => RateLimitResult {
  return (userId: string): RateLimitResult => {
    const defaultResult: RateLimitResult = {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + windowMs
    };

    try {
      // Validate parameters
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        return defaultResult;
      }

      if (!Number.isInteger(maxRequests) || maxRequests <= 0 || maxRequests > 10000) {
        return defaultResult;
      }

      if (!Number.isInteger(windowMs) || windowMs <= 0 || windowMs > 86400000) { // Max 24 hours
        return defaultResult;
      }

      const now = Date.now();
      const userKey = userId.trim();
      
      // Get or initialize user's rate limit data
      let userData = rateLimitStore.get(userKey);
      if (!userData) {
        userData = {
          requests: [],
          windowStart: now
        };
        rateLimitStore.set(userKey, userData);
      }

      // Clean up old requests outside the window
      const windowStart = now - windowMs;
      userData.requests = userData.requests.filter(req => req.timestamp > windowStart);

      // Check if user is within limits
      const currentRequests = userData.requests.length;
      const remaining = Math.max(0, maxRequests - currentRequests);
      const resetAt = now + windowMs;

      if (currentRequests >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: resetAt
        };
      }

      // Add current request
      userData.requests.push({ timestamp: now });
      
      // Clean up memory periodically to prevent overflow
      if (rateLimitStore.size > 10000) {
        const entries = Array.from(rateLimitStore.entries());
        const cutoff = now - (windowMs * 2); // Keep data for 2x window
        
        for (const [key, data] of entries) {
          if (data.requests.length === 0 || data.requests[data.requests.length - 1].timestamp < cutoff) {
            rateLimitStore.delete(key);
          }
        }
      }

      return {
        allowed: true,
        remaining: remaining - 1,
        resetAt: resetAt
      };

    } catch (error) {
      // Never expose internal errors
      return defaultResult;
    }
  };
}

/**
 * Sanitizes input to remove XSS vectors, SQL injection patterns, and other malicious content
 * @param input - Input string to sanitize
 * @returns Sanitized string safe for processing
 */
export function sanitizeInput(input: string): string {
  try {
    // Handle null/undefined/non-string inputs
    if (input === null || input === undefined) {
      return '';
    }

    if (typeof input !== 'string') {
      return String(input);
    }

    let sanitized = input;

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    // Remove script tags and their content (case insensitive, handle nested)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<script\b[^>]*>/gi, '');
    sanitized = sanitized.replace(/<\/script>/gi, '');

    // Remove dangerous HTML tags
    const dangerousTags = [
      'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style', 
      'form', 'input', 'button', 'select', 'textarea', 'frame', 'frameset'
    ];
    
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      const closingRegex = new RegExp(`</${tag}>`, 'gi');
      sanitized = sanitized.replace(closingRegex, '');
    }

    // Remove event handlers (on* attributes)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');

    // Remove javascript: and data: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');

    // Handle SQL injection patterns
    // Remove or escape dangerous SQL keywords and characters
    sanitized = sanitized.replace(/;\s*(drop|delete|insert|update|create|alter|exec|execute|select|union)\b/gi, '');
    sanitized = sanitized.replace(/\bunion\s+(all\s+)?select\b/gi, '');
    sanitized = sanitized.replace(/\b(exec|execute|sp_|xp_)\w*/gi, '');
    
    // Escape single quotes and double quotes
    sanitized = sanitized.replace(/'/g, '&#x27;');
    sanitized = sanitized.replace(/"/g, '&#x22;');
    
    // Remove SQL comment patterns
    sanitized = sanitized.replace(/--[\s\S]*?$/gm, '');
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

    // Handle encoding attacks by decoding and re-sanitizing
    try {
      let previousLength;
      let iterations = 0;
      const maxIterations = 5; // Prevent infinite loops
      
      do {
        previousLength = sanitized.length;
        
        // Decode HTML entities
        sanitized = sanitized.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
          const charCode = parseInt(hex, 16);
          // Only decode safe characters
          if (charCode >= 32 && charCode <= 126) {
            return String.fromCharCode(charCode);
          }
          return '';
        });
        
        sanitized = sanitized.replace(/&#([0-9]+);/g, (match, decimal) => {
          const charCode = parseInt(decimal, 10);
          // Only decode safe characters
          if (charCode >= 32 && charCode <= 126) {
            return String.fromCharCode(charCode);
          }
          return '';
        });

        // Decode URL encoding
        try {
          sanitized = decodeURIComponent(sanitized);
        } catch (e) {
          // If decoding fails, continue with current string
        }
        
        iterations++;
      } while (sanitized.length !== previousLength && iterations < maxIterations);

    } catch (error) {
      // If encoding handling fails, continue with basic sanitization
    }

    // Final cleanup - remove any remaining dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Trim whitespace and limit length to prevent DOS
    sanitized = sanitized.trim();
    if (sanitized.length > 10000) {
      sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;

  } catch (error) {
    // If all sanitization fails, return empty string for security
    return '';
  }
}

// Export all functions and types
export default {
  validateToken,
  requirePermission,
  rateLimiter,
  sanitizeInput
};

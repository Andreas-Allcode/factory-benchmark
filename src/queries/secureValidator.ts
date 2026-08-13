/**
 * Comprehensive Secure Data Validation Library
 * Implements security-critical validation functions with proper edge case handling
 */

// Types
export interface EmailValidationResult {
  valid: boolean;
  normalized: string;
}

export interface PasswordValidationResult {
  valid: boolean;
  strength: "weak" | "medium" | "strong";
  issues: string[];
}

export interface ValidationSchema {
  [key: string]: "string" | "number" | "email" | "url";
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized: Record<string, unknown>;
}

// Common patterns for security validation
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890'
]);

const SUSPICIOUS_PATTERNS = [
  /(.)\1{3,}/g, // Repeated characters
  /123456|654321|qwerty|asdf/gi, // Sequential patterns
  /password|admin|user|guest/gi // Common words
];

/**
 * Validates and normalizes email addresses according to RFC 5322 with Unicode support
 */
export function validateEmail(email: string): EmailValidationResult {
  if (typeof email !== 'string') {
    return { valid: false, normalized: '' };
  }

  // Remove null bytes and control characters
  const cleanEmail = email.replace(/[\x00-\x1f\x7f]/g, '');
  
  // Unicode normalization (NFC form)
  const normalizedEmail = cleanEmail.normalize('NFC');
  
  // Basic length check
  if (normalizedEmail.length > 254) {
    return { valid: false, normalized: '' };
  }

  // RFC 5322 compliant regex with Unicode support
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/u;
  
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, normalized: '' };
  }

  const [localPart, domain] = normalizedEmail.split('@');
  
  // Validate local part length
  if (localPart.length > 64) {
    return { valid: false, normalized: '' };
  }

  // Additional validations
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, normalized: '' };
  }

  // Gmail-specific normalization
  let normalizedLocal = localPart.toLowerCase();
  const lowerDomain = domain.toLowerCase();
  
  if (lowerDomain === 'gmail.com' || lowerDomain === 'googlemail.com') {
    // Remove dots and everything after + in Gmail addresses
    normalizedLocal = normalizedLocal.replace(/\./g, '').split('+')[0];
  }

  const result = `${normalizedLocal}@${lowerDomain}`;
  
  return {
    valid: true,
    normalized: result
  };
}

/**
 * Validates password strength with comprehensive security checks
 */
export function validatePassword(password: string): PasswordValidationResult {
  const result: PasswordValidationResult = {
    valid: false,
    strength: "weak",
    issues: []
  };

  if (typeof password !== 'string') {
    result.issues.push('Password must be a string');
    return result;
  }

  // Check for null bytes and control characters
  if (/[\x00-\x1f\x7f]/.test(password)) {
    result.issues.push('Password contains invalid characters');
    return result;
  }

  // Unicode normalization
  const normalizedPassword = password.normalize('NFC');

  // Minimum length check
  if (normalizedPassword.length < 12) {
    result.issues.push('Password must be at least 12 characters long');
  }

  // Character class requirements
  const hasUppercase = /[A-Z]/.test(normalizedPassword);
  const hasLowercase = /[a-z]/.test(normalizedPassword);
  const hasNumber = /[0-9]/.test(normalizedPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(normalizedPassword);

  if (!hasUppercase) result.issues.push('Password must contain at least one uppercase letter');
  if (!hasLowercase) result.issues.push('Password must contain at least one lowercase letter');
  if (!hasNumber) result.issues.push('Password must contain at least one number');
  if (!hasSpecial) result.issues.push('Password must contain at least one special character');

  // Check for common passwords
  if (COMMON_PASSWORDS.has(normalizedPassword.toLowerCase())) {
    result.issues.push('Password is too common');
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(normalizedPassword)) {
      result.issues.push('Password contains predictable patterns');
      break;
    }
  }

  // Calculate strength
  let strengthScore = 0;
  if (normalizedPassword.length >= 12) strengthScore++;
  if (normalizedPassword.length >= 16) strengthScore++;
  if (hasUppercase && hasLowercase && hasNumber && hasSpecial) strengthScore += 2;
  if (normalizedPassword.length >= 20) strengthScore++;
  if (/[^\w\s]/.test(normalizedPassword)) strengthScore++; // Extended special chars

  if (strengthScore >= 5) {
    result.strength = "strong";
  } else if (strengthScore >= 3) {
    result.strength = "medium";
  }

  result.valid = result.issues.length === 0;
  
  return result;
}

/**
 * Sanitizes HTML by stripping all tags except allowed ones and escaping attributes
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and normalize Unicode
  let sanitized = input.replace(/[\x00]/g, '').normalize('NFC');

  // Handle nested HTML entities (decode multiple times to prevent double encoding attacks)
  for (let i = 0; i < 5; i++) {
    const decoded = sanitized
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&');
    
    if (decoded === sanitized) break;
    sanitized = decoded;
  }

  // Remove all HTML tags except allowed ones
  const allowedTags = ['b', 'i', 'a'];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const tag = tagName.toLowerCase();
    
    if (!allowedTags.includes(tag)) {
      return ''; // Remove disallowed tags
    }

    if (tag === 'a') {
      // Special handling for anchor tags to prevent javascript: URLs
      const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1].toLowerCase().trim();
        if (href.startsWith('javascript:') || 
            href.startsWith('data:') || 
            href.startsWith('vbscript:') ||
            href.includes('javascript:')) {
          return ''; // Remove dangerous links
        }
        // Only allow http, https, and relative URLs
        if (!href.startsWith('http://') && 
            !href.startsWith('https://') && 
            !href.startsWith('/') && 
            !href.startsWith('./') &&
            !href.startsWith('#')) {
          return ''; // Remove suspicious URLs
        }
      }
      
      // Escape attributes properly
      return match.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    }

    return match;
  });

  // Final escape of remaining special characters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Re-allow the sanitized tags
  allowedTags.forEach(tag => {
    const openRegex = new RegExp(`&lt;${tag}\\b[^&]*&gt;`, 'gi');
    const closeRegex = new RegExp(`&lt;\\/${tag}&gt;`, 'gi');
    
    sanitized = sanitized
      .replace(openRegex, (match) => match.replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
      .replace(closeRegex, (match) => match.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  });

  return sanitized;
}

/**
 * Validates and sanitizes data according to schema with prototype pollution protection
 */
export function validateAndSanitize(
  data: Record<string, unknown>, 
  schema: ValidationSchema
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    sanitized: {}
  };

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    result.valid = false;
    result.errors.push('Data must be a plain object');
    return result;
  }

  // Prevent prototype pollution attacks
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of Object.keys(data)) {
    if (dangerousKeys.includes(key) || key.includes('__proto__')) {
      result.valid = false;
      result.errors.push(`Dangerous key detected: ${key}`);
      continue;
    }
  }

  // Validate each field according to schema
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = data[key];
    
    if (value === undefined || value === null) {
      result.errors.push(`Missing required field: ${key}`);
      result.valid = false;
      continue;
    }

    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          result.errors.push(`Field ${key} must be a string`);
          result.valid = false;
        } else {
          // Sanitize string fields
          const sanitized = sanitizeHtml(value);
          result.sanitized[key] = sanitized;
        }
        break;

      case 'number':
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
          result.errors.push(`Field ${key} must be a valid number`);
          result.valid = false;
        } else {
          result.sanitized[key] = num;
        }
        break;

      case 'email':
        if (typeof value !== 'string') {
          result.errors.push(`Field ${key} must be a string`);
          result.valid = false;
        } else {
          const emailResult = validateEmail(value);
          if (!emailResult.valid) {
            result.errors.push(`Field ${key} must be a valid email`);
            result.valid = false;
          } else {
            result.sanitized[key] = emailResult.normalized;
          }
        }
        break;

      case 'url':
        if (typeof value !== 'string') {
          result.errors.push(`Field ${key} must be a string`);
          result.valid = false;
        } else {
          try {
            const url = new URL(value);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(url.protocol)) {
              result.errors.push(`Field ${key} must use http or https protocol`);
              result.valid = false;
            } else {
              result.sanitized[key] = url.toString();
            }
          } catch {
            result.errors.push(`Field ${key} must be a valid URL`);
            result.valid = false;
          }
        }
        break;

      default:
        result.errors.push(`Unknown schema type: ${expectedType}`);
        result.valid = false;
    }
  }

  return result;
}

// Export all functions and types
export default {
  validateEmail,
  validatePassword,
  sanitizeHtml,
  validateAndSanitize
};

// In-memory set for tracking revoked tokens
const revokedTokens = new Set<string>();

interface TokenClaims {
  valid: boolean;
  userId: string;
  expiresAt: number;
}

interface JWTPayload {
  userId: string;
  exp: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Validates JWT token by checking structure and expiration
 * @param token - JWT token string
 * @returns TokenClaims object with validation result
 */
export function validateToken(token: string): TokenClaims {
  try {
    // Check basic JWT structure (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, userId: '', expiresAt: 0 };
    }

    // Check if token is revoked
    if (isRevoked(token)) {
      return { valid: false, userId: '', expiresAt: 0 };
    }

    const [header, payload, signature] = parts;

    // Base64 decode the payload
    const decodedPayload = base64UrlDecode(payload);
    const claims: JWTPayload = JSON.parse(decodedPayload);

    // Check if token has expired
    const now = Date.now();
    const expiresAt = claims.exp * 1000; // Convert from seconds to milliseconds

    if (now >= expiresAt) {
      return { valid: false, userId: claims.userId || '', expiresAt };
    }

    return {
      valid: true,
      userId: claims.userId || '',
      expiresAt
    };
  } catch (error) {
    return { valid: false, userId: '', expiresAt: 0 };
  }
}

/**
 * Extends token expiration by 1 hour without signature verification
 * @param token - JWT token string
 * @returns New JWT token with extended expiration
 */
export function refreshToken(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }

    const [header, payload, signature] = parts;

    // Decode payload
    const decodedPayload = base64UrlDecode(payload);
    const claims: JWTPayload = JSON.parse(decodedPayload);

    // Extend expiration by 1 hour (3600 seconds)
    const newExp = Math.floor(Date.now() / 1000) + 3600;
    claims.exp = newExp;

    // Re-encode payload
    const newPayload = base64UrlEncode(JSON.stringify(claims));

    // Return new token with original header and signature (intentionally insecure)
    return `${header}.${newPayload}.${signature}`;
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
}

/**
 * Adds token to revocation list
 * @param token - JWT token string to revoke
 */
export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

/**
 * Checks if token exists in revocation list
 * @param token - JWT token string to check
 * @returns True if token is revoked, false otherwise
 */
export function isRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

/**
 * Base64 URL decode (JWT uses base64url encoding)
 * @param str - Base64 URL encoded string
 * @returns Decoded string
 */
function base64UrlDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  // Decode base64
  return atob(base64);
}

/**
 * Base64 URL encode (JWT uses base64url encoding)
 * @param str - String to encode
 * @returns Base64 URL encoded string
 */
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Utility function to get revoked tokens count (for testing/debugging)
 * @returns Number of revoked tokens
 */
export function getRevokedTokensCount(): number {
  return revokedTokens.size;
}

/**
 * Utility function to clear all revoked tokens (for testing/debugging)
 */
export function clearRevokedTokens(): void {
  revokedTokens.clear();
}

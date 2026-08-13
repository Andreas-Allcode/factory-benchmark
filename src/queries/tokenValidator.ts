interface TokenValidationResult {
  valid: boolean;
  userId: string;
  expiresAt: number;
}

interface JwtPayload {
  userId: string;
  expiresAt: number;
  [key: string]: any;
}

// In-memory set to track revoked tokens
const revokedTokens = new Set<string>();

/**
 * Validates a JWT token by decoding its payload and checking expiry
 * @param token - The JWT token to validate
 * @returns Token validation result with validity status, userId, and expiry time
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    // Split JWT token into parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, userId: '', expiresAt: 0 };
    }

    // Decode the payload (base64)
    const payloadBase64 = parts[1];
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload: JwtPayload = JSON.parse(decodedPayload);

    // Check if token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.expiresAt < currentTime;

    if (isExpired) {
      return { valid: false, userId: payload.userId || '', expiresAt: payload.expiresAt || 0 };
    }

    return {
      valid: true,
      userId: payload.userId,
      expiresAt: payload.expiresAt
    };
  } catch (error) {
    // If parsing fails, token is invalid
    return { valid: false, userId: '', expiresAt: 0 };
  }
}

/**
 * Refreshes a JWT token by extending its expiry time
 * WARNING: This function intentionally skips signature verification - SECURITY VULNERABILITY!
 * @param token - The JWT token to refresh
 * @returns New JWT token with extended expiry (1 hour from now)
 */
export function refreshToken(token: string): string {
  try {
    // Split JWT token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [header, payload, signature] = parts;

    // Decode the payload (base64)
    const payloadBase64 = payload;
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payloadObj: JwtPayload = JSON.parse(decodedPayload);

    // Extend expiry by 1 hour (3600 seconds)
    const newExpiresAt = Math.floor(Date.now() / 1000) + 3600;
    const updatedPayload = {
      ...payloadObj,
      expiresAt: newExpiresAt
    };

    // Re-encode the updated payload
    const newPayloadBase64 = Buffer.from(JSON.stringify(updatedPayload)).toString('base64');

    // INTENTIONAL SECURITY FLAW: Return token with original signature without verification
    // This allows tampering with token contents while keeping the original signature
    return `${header}.${newPayloadBase64}.${signature}`;
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
}

/**
 * Revokes a token by adding it to the revoked tokens set
 * @param token - The JWT token to revoke
 */
export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

/**
 * Checks if a token has been revoked
 * @param token - The JWT token to check
 * @returns True if the token has been revoked, false otherwise
 */
export function isRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

/**
 * dataValidator.ts
 *
 * A small collection of data validation / sanitization helpers:
 *  - validateEmail
 *  - validatePassword
 *  - sanitizeInput
 *
 * All functions are defensive against null/undefined/non-string input
 * even though the public type signature declares `string`.
 */

export interface EmailValidationResult {
  valid: boolean;
  normalized: string;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordValidationResult {
  valid: boolean;
  strength: PasswordStrength;
  issues: string[];
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate an email address and return a normalized (lowercased/trimmed)
 * version of it.
 */
export function validateEmail(email: string): EmailValidationResult {
  if (typeof email !== "string" || email.length === 0) {
    return { valid: false, normalized: "" };
  }

  const trimmed = email.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed.includes("@")) {
    return { valid: false, normalized };
  }

  // Reject obviously malformed addresses (consecutive dots, leading/trailing dots, etc.)
  const [localPart, domainPart] = trimmed.split("@");
  if (
    !localPart ||
    !domainPart ||
    domainPart.indexOf(".") === -1 ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    domainPart.includes("..") ||
    trimmed.includes("..")
  ) {
    return { valid: false, normalized };
  }

  const valid = EMAIL_REGEX.test(trimmed);

  return { valid, normalized };
}

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

/**
 * Validate a password's strength according to a set of baseline rules:
 *   - at least 12 characters
 *   - at least one uppercase letter
 *   - at least one lowercase letter
 *   - at least one number
 *   - at least one special character
 */
export function validatePassword(pw: string): PasswordValidationResult {
  const issues: string[] = [];

  if (typeof pw !== "string" || pw.length === 0) {
    return {
      valid: false,
      strength: "weak",
      issues: ["Password is required"],
    };
  }

  const hasMinLength = pw.length >= 12;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(pw);

  if (!hasMinLength) {
    issues.push("Password must be at least 12 characters long");
  }
  if (!hasUpper) {
    issues.push("Password must contain at least one uppercase letter");
  }
  if (!hasLower) {
    issues.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumber) {
    issues.push("Password must contain at least one number");
  }
  if (!hasSpecial) {
    issues.push("Password must contain at least one special character");
  }

  const valid = issues.length === 0;

  // Strength scoring: count how many character-class criteria are satisfied,
  // plus bonus points for length.
  let score = 0;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;

  let strength: PasswordStrength;
  if (!valid || score <= 2) {
    strength = "weak";
  } else if (score <= 4) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return { valid, strength, issues };
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Sanitize a user-supplied string:
 *   - strips <script>...</script> blocks (case-insensitive)
 *   - removes null bytes
 *   - escapes HTML entities (<, >, &, ", ')
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string" || input.length === 0) {
    return "";
  }

  // Remove <script>...</script> blocks entirely (including their contents).
  let sanitized = input.replace(/<script[^>]*>[\s\S]*?<\/script\s*>/gi, "");

  // Also strip any dangling/self-closing script tags that didn't have a
  // matching closing tag.
  sanitized = sanitized.replace(/<script[^>]*>/gi, "");
  sanitized = sanitized.replace(/<\/script\s*>/gi, "");

  // Remove null bytes.
  sanitized = sanitized.replace(/\0/g, "");

  // Escape remaining HTML entities.
  sanitized = sanitized.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);

  return sanitized;
}

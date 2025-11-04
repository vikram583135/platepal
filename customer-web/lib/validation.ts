/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): boolean {
  // Indian phone number: 10 digits, optionally with country code
  const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} {
  const issues: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }

  // Calculate strength
  if (issues.length === 0 && password.length >= 12) {
    strength = 'strong';
  } else if (issues.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: issues.length === 0,
    strength,
    issues,
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string = 'Field'): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return `${fieldName} cannot be empty`;
  }
  return null;
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field'
): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
}

/**
 * Validate form fields
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, Array<(value: any) => string | null>>
): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, validators]) => {
    const value = data[field];
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!validateEmail(value)) return 'Please enter a valid email address';
    return null;
  },
  
  password: (value: string) => {
    if (!value) return 'Password is required';
    const result = validatePassword(value);
    if (!result.isValid) {
      return result.issues[0] || 'Password is invalid';
    }
    return null;
  },
  
  phone: (value: string) => {
    if (!value) return 'Phone number is required';
    if (!validatePhone(value)) return 'Please enter a valid phone number';
    return null;
  },
  
  required: (fieldName?: string) => (value: any) => {
    return validateRequired(value, fieldName);
  },
};


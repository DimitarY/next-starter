import { PASSWORD_RULES } from "@/schemas/auth";

export const PASSWORD_CRITERIA_DISPLAY = [
  {
    label: `${PASSWORD_RULES.MIN_LENGTH}-${PASSWORD_RULES.MAX_LENGTH} Characters`,
    check: (password: string) =>
      password.length >= PASSWORD_RULES.MIN_LENGTH &&
      password.length <= PASSWORD_RULES.MAX_LENGTH,
  },
  {
    label: "At least one capital letter",
    check: (password: string) => PASSWORD_RULES.HAS_CAPITAL.test(password),
  },
  {
    label: "At least one number",
    check: (password: string) => PASSWORD_RULES.HAS_NUMBER.test(password),
  },
  {
    label: "No spaces",
    check: (password: string) => PASSWORD_RULES.NO_SPACES.test(password),
  },
];

export interface PasswordCriteria {
  label: string;
  isValid: boolean;
}

/**
 * Checks a password against specific criteria based on the shared rules defined in password-rules.ts.
 * This function now directly uses the `PASSWORD_CRITERIA_DISPLAY` array for its logic and labels.
 *
 * @param password The password string to evaluate.
 * @returns An array of objects, each detailing a criterion and its validity.
 */
export function checkPasswordCriteria(password: string): PasswordCriteria[] {
  // Directly map over the predefined display criteria from the shared rules
  return PASSWORD_CRITERIA_DISPLAY.map((criterion) => ({
    label: criterion.label,
    isValid: criterion.check(password), // Use the 'check' function defined in the shared rules
  }));
}

/**
 * Calculates the strength of a given password.
 * The strength is a score from 0 to 100 based on various criteria.
 * This function now uses the `PASSWORD_RULES` for length and character type checks
 * to ensure consistency with your Zod schema.
 *
 * @param password The password string to evaluate.
 * @returns A number representing the password strength (0-100).
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  // Criteria for strength:
  // 1. Length - using PASSWORD_RULES for consistency
  if (password.length >= PASSWORD_RULES.MIN_LENGTH) {
    strength += 20;
  }
  // This '12' is an arbitrary bonus for longer passwords, not directly from a Zod rule
  if (password.length >= 12) {
    strength += 20;
  }

  // 2. Character types - using PASSWORD_RULES regexes for consistency
  // Note: Your Zod schema based on the image only explicitly required capital and number, not lowercase or special chars.
  // We keep the lowercase here as it's common for strength calculation, but removed the "special character" check
  // to align more closely with your Zod rules, unless you intended it for strength only.
  if (/[a-z]/.test(password)) {
    strength += 15;
  }
  if (PASSWORD_RULES.HAS_CAPITAL.test(password)) {
    strength += 15;
  }
  if (PASSWORD_RULES.HAS_NUMBER.test(password)) {
    strength += 15;
  }
  // Removed: if (/[^a-zA-Z0-9]/.test(password)) { strength += 15; }
  // This rule was for "at least one special character" which wasn't in your Zod schema (from image).

  return Math.min(strength, 100); // Ensure strength doesn't exceed 100
}

/**
 * Returns a descriptive label for the given password strength score.
 * @param strength The strength score (0-100).
 * @returns A string label ("Weak", "Medium", "Strong").
 */
export function getStrengthLabel(strength: number): string {
  if (strength < 40) return "Weak";
  if (strength < 70) return "Medium";
  return "Strong";
}

/**
 * Returns a Tailwind CSS class for the color based on the password strength.
 * @param strength The strength score (0-100).
 * @returns A Tailwind CSS background color class.
 */
export function getStrengthColorClass(strength: number): string {
  if (strength < 40) return "bg-red-500";
  if (strength < 70) return "bg-yellow-500";
  return "bg-green-500";
}

/**
 * Returns a Tailwind CSS class for text color based on the password strength.
 * @param strength The strength score (0-100).
 * @returns A Tailwind CSS text color class.
 */
export function getStrengthTextColorClass(strength: number): string {
  if (strength < 40) return "text-red-500";
  if (strength < 70) return "text-yellow-500";
  return "text-green-500";
}

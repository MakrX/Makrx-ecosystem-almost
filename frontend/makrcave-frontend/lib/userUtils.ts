// ========================================
// USER UTILITY FUNCTIONS
// ========================================
// Utility functions for user display formatting and username handling

export interface UserForDisplay {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

/**
 * Formats user display name with @username format
 * Returns "FirstName LastName @username" or fallback variations
 */
export function formatUserDisplayName(user: UserForDisplay | null | undefined): string {
  if (!user) return 'Unknown User';

  const username = user.username || user.email?.split('@')[0] || '';
  const atUsername = username ? `@${username}` : '';

  // If we have both first and last name, use full format
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName} ${atUsername}`.trim();
  }

  // If we have first name only
  if (user.firstName) {
    return `${user.firstName} ${atUsername}`.trim();
  }

  // If we have last name only
  if (user.lastName) {
    return `${user.lastName} ${atUsername}`.trim();
  }

  // Just username with @
  if (username) {
    return atUsername;
  }

  // Final fallback
  return user.email || 'Unknown User';
}

/**
 * Formats user display name for compact/short display
 * Returns "FirstName @username" or just "@username"
 */
export function formatUserDisplayNameCompact(user: UserForDisplay | null | undefined): string {
  if (!user) return 'Unknown';

  const username = user.username || user.email?.split('@')[0] || '';
  const atUsername = username ? `@${username}` : '';

  // If we have first name, use it with @username
  if (user.firstName) {
    return `${user.firstName} ${atUsername}`.trim();
  }

  // Just @username
  if (username) {
    return atUsername;
  }

  // Final fallback
  return user.email?.split('@')[0] || 'Unknown';
}

/**
 * Gets just the @username part
 */
export function formatUsername(user: UserForDisplay | null | undefined): string {
  if (!user) return '';

  const username = user.username || user.email?.split('@')[0] || '';
  return username ? `@${username}` : '';
}

/**
 * Gets the full name without @username
 */
export function formatFullName(user: UserForDisplay | null | undefined): string {
  if (!user) return 'Unknown User';

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.lastName) {
    return user.lastName;
  }

  return user.username || user.email?.split('@')[0] || 'Unknown User';
}

/**
 * Gets user initials for avatar display
 */
export function getUserInitials(user: UserForDisplay | null | undefined): string {
  if (!user) return '?';

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  if (user.firstName) {
    return user.firstName[0].toUpperCase();
  }

  if (user.lastName) {
    return user.lastName[0].toUpperCase();
  }

  if (user.username) {
    return user.username[0].toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return '?';
}

/**
 * User Data Transfer Object (DTO) Sanitizers
 *
 * Provides reusable sanitization functions that strip sensitive or
 * internal-only fields before data leaves the service layer.
 *
 * Architecture Notes:
 * - DTO functions ensure password hashes, internal versioning keys (`__v`),
 *   and large relational arrays are never accidentally leaked via the API.
 * - By encapsulating this here rather than inside Mongoose schemas (e.g. `toJSON` overrides),
 *   services maintain full control over what projection is appropriate
 *   for different contexts (Auth vs Public Profile vs Private Profile).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserLike = any;

const toPlain = (user: UserLike): Record<string, unknown> => {
  if (user && typeof user.toObject === "function") {
    return user.toObject();
  }
  return { ...user };
};

/**
 * Standard sanitization.
 * Strips password, __v, and internal relationship arrays.
 * Use for "My Profile" responses where matches/likes are fetched separately.
 */
export const sanitizeUser = (user: UserLike): Record<string, unknown> => {
  const plain = toPlain(user);
  delete plain.password;
  delete plain.__v;
  delete plain.likedUsers;
  delete plain.dislikedUsers;
  delete plain.matches;
  return plain;
};

/**
 * Public-facing sanitization.
 * Strips everything above plus subscription internals.
 * Use when returning user data to someone other than the user themselves
 * (e.g., viewing a match's profile).
 */
export const sanitizeUserPublic = (user: UserLike): Record<string, unknown> => {
  const plain = sanitizeUser(user);
  delete plain.premiumExpiresAt;
  delete plain.subscriptionType;
  return plain;
};

/**
 * Auth response sanitization.
 * Strips only password and __v. Keeps relationship arrays so the frontend
 * can hydrate its internal state (like counters) immediately after login/register.
 */
export const sanitizeUserForAuth = (user: UserLike): Record<string, unknown> => {
  const plain = toPlain(user);
  delete plain.password;
  delete plain.__v;
  return plain;
};

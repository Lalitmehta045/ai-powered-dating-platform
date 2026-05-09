/**
 * Admin Data Transfer Object (DTO) Sanitizers
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminLike = any;

const toPlain = (admin: AdminLike): Record<string, unknown> => {
  if (admin && typeof admin.toObject === "function") {
    return admin.toObject();
  }
  return { ...admin };
};

export const sanitizeAdmin = (admin: AdminLike): Record<string, unknown> => {
  const plain = toPlain(admin);
  delete plain.password;
  delete plain.__v;
  return plain;
};

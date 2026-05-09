/**
 * Admin Data Transfer Object (DTO) Sanitizers
 */

export interface SanitizedAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const sanitizeAdmin = (admin: any): SanitizedAdmin => {
  const plain = admin.toObject ? admin.toObject() : { ...admin };
  
  return {
    id: (plain._id || plain.id).toString(),
    name: plain.name,
    email: plain.email,
    role: plain.role,
    isActive: plain.isActive,
    lastLogin: plain.lastLogin,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
};

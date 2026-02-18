/**
 * User & Authentication Schema Types
 * Generated from Prisma schema
 */

export enum UserRole {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  isOnboarded: boolean;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface UserWithRelations extends User {
  exams?: any[];
  submissions?: any[];
  enrollments?: any[];
  results?: any[];
  sessions?: Session[];
  accounts?: Account[];
  createdGroups?: any[];
  memberGroups?: any[];
  selfSubmissions?: any[];
  examAttempts?: any[];
}

export interface SessionWithUser extends Session {
  user: User;
}

export interface AccountWithUser extends Account {
  user: User;
}

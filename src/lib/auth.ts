import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { AuthUser, DbUser, User } from '@/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export type { AuthUser };

export function transformDbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email || '',
    name: dbUser.name,
    role: dbUser.role,
    collegeId: dbUser.collegeId || undefined,
    programId: dbUser.programId || undefined,
    batchId: dbUser.batchId || undefined,
  };
}

export function transformDbUserToAuthUser(dbUser: DbUser): AuthUser {
  return {
    id: dbUser.id,
    email: dbUser.email || '',
    name: dbUser.name,
    role: dbUser.role,
    collegeId: dbUser.collegeId,
    programId: dbUser.programId,
    batchId: dbUser.batchId,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User | AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      collegeId: user.collegeId,
      programId: user.programId,
      batchId: user.batchId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string, collegeId?: string): Promise<User | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      college: true,
      program: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Validate college for department role and non-admin roles
  // Admin users can access any college, so don't validate collegeId for them
  if (user.role !== 'ADMIN' && collegeId && user.collegeId !== collegeId) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  return transformDbUserToUser(user);
}
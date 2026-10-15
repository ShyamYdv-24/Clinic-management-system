import jwt from 'jsonwebtoken';
import { Role } from '../types/clinic';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

const JWT_SECRET = process.env.JWT_SECRET || 'om-sai-adarsha-clinic-secret-token-fallback-2026';
const TOKEN_EXPIRY = '7d';

export function signAdminToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyAdminToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

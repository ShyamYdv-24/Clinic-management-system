import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password securely using bcryptjs with 10 salt rounds.
 * Never stores or returns plain-text passwords.
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    throw new Error('A valid password string is required for hashing.');
  }

  try {
    const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during password hashing';
    throw new Error(`Failed to securely hash password: ${message}`);
  }
}

/**
 * Compares a plain text candidate password with a bcrypt hashed password.
 */
export async function verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
  if (!plainTextPassword || !hashedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during password comparison';
    console.error(`Password comparison error: ${message}`);
    return false;
  }
}

export const comparePassword = verifyPassword;

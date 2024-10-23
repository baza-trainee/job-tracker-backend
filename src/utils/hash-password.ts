import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
  }
  catch (err) {
    throw new Error(`Error hashing password: ${err}`);
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await argon2.verify(hashedPassword, password);
    return isMatch;
  }
  catch (err) {
    throw new Error(`Error verifying password: ${err}`);
  }
}

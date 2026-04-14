import argon2 from 'argon2';

// --- CREATE HASH FOR PASSWORD ---
export async function hashPassword(current_password: string): Promise<string> {

	return argon2.hash(current_password, { type: argon2.argon2id });
}

// --- VERIFY IF PASSWORD OF USER IS CORRECT ---
export async function verifyPassword(current_password: string, password_from_db: string): Promise<boolean> {

	return argon2.verify(password_from_db, current_password);
}

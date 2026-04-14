import argon2 from "argon2";
import { randomBytes, randomUUID } from "crypto";
import { getDB } from "./database/db";
import { hashPassword, verifyPassword } from "./validation/password";
import { getDbHelpers } from "./utils/helpers";
import * as AuthInterfaces from "./types/auth.interfaces";

// --- UTILS ---
function generateUserId() {
  return `u_${randomUUID()}`;
}

export function generateEmail(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(4).toString("base64url");

  const tail = (ts + rand).slice(0, 10);

  return `deleted_${tail}_@${tail}.deleted`;
}

function toAuthUser(row: AuthInterfaces.UserRow): AuthInterfaces.AuthUser {
  return {
    id: row.id,
    email: row.email,
    twofa_enabled: row.twofa_enabled ?? 0,
    password_version: row.password_version ?? 1,
    token_version: row.token_version ?? 0,
  };
}

// --- SIGN UP ---
export async function signup(
  email: string,
  password: string,
): Promise<AuthInterfaces.AuthUser> {
  const hash = await hashPassword(password);

  const userId = generateUserId();
  return new Promise<AuthInterfaces.AuthUser>((resolve, reject) => {
    const db = getDB();
    db.run(
      `INSERT INTO users (id, email, password_hashed) VALUES(?, ?, ?)`,
      [userId, email, hash],
      (err) => {
        if (err) reject(err);
        else
          resolve({
            id: userId,
            email: email,
            twofa_enabled: 0,
            password_version: 1,
            token_version: 0,
          });
      },
    );
  });
}

// --- LOGIN ---
export async function login(
  email: string,
  password: string,
): Promise<AuthInterfaces.AuthUser> {
  const db = getDB();

  return new Promise<AuthInterfaces.AuthUser>((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, row: any) => {
        if (err) return reject(err);
        if (!row) return reject(new Error("INVALID_CREDENTIALS"));
        if (row.deleted_at) return reject(new Error("ACCOUNT_DELETED"));
        const valid = await verifyPassword(password, row.password_hashed);
        if (!valid) return reject(new Error("INVALID_CREDENTIALS"));
        resolve({
          id: row.id,
          email: row.email,
          twofa_enabled: row.twofa_enabled ?? 0,
          password_version: row.password_version ?? 1,
          token_version: row.token_version ?? 0,
        });
      },
    );
  });
}

// --- CHECKER FOR AVOID DOUBLE LOGIN ---
export async function checkActiveSession(userId: string): Promise<boolean> {
  const db = getDB();

  return new Promise<boolean>((resolve, reject) => {
    db.get(
      `SELECT id FROM user_sessions WHERE user_id = ? AND expires_at > datetime('now')`,
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      },
    );
  });
}

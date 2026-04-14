import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import { signup, login, generateEmail, checkActiveSession } from './auth';
import { initDB, getDB } from './database/db';
import { initTokenDB, getTokenDB } from './database/dbTokens';
import { privateKey, publicKey } from './keys';
import { generateToken, deleteUserSession, startSessionCleanup } from './tokens/token';
import { createRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeRefreshTokenById, isTokenRevoked, refreshTokenCleanup } from './tokens/refresh';
import { hashPassword, verifyPassword } from './validation/password';
import { signUpSchema, loginSchema, changePasswordSchema } from "./validation/checkInput";
import * as AuthInterfaces from './types/auth.interfaces';

// --- CONFIGURATION ---
const fastify = Fastify({ logger: true, trustProxy: true });

fastify.register(cookie, { secret: 'cookie-secret' });

fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});


const PROFILE_SERVICE_URL = process.env.PROFILE_SERVICE_URL!;

if (!process.env.PROFILE_SERVICE_URL) {
    throw new Error("PROFILE_SERVICE_URL env variable is required");
}

console.log("[auth] Profile service URL:", PROFILE_SERVICE_URL);

const SERVICE_TOKEN = process.env.SERVICE_TOKEN!;

if (!process.env.SERVICE_TOKEN) {
  	throw new Error("SERVICE_TOKEN env variable is required");
}

console.log("[auth] Auth service token:", SERVICE_TOKEN);

// --- COOKIES ---
const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
};

const refreshOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
    maxAge: 7 * 24 * 3600,
};

const csrfOpts = {
	httpOnly: false, 
	secure: true, 
	sameSite: 'none' as const, 
	path: '/'
}

// --- CSRF CONSTANTES ---
const CSRF_IGNORED_METHODS = new Set([
    'GET', 
	'HEAD', 
	'OPTIONS'
]);

const CSRF_EXCLUDED_PATHS = new Set([
    '/auth/signup',
    '/auth/login',
    '/auth/logout',
    '/auth/refresh'
]);

// --- CSRF PROTECTION ---
fastify.addHook('preHandler', async (req: any, reply) => {

    if (CSRF_IGNORED_METHODS.has(req.method)) return;

	const checkUrl = req.url;
    
	if (CSRF_EXCLUDED_PATHS.has(checkUrl)) return;
    
	const csrfCookie = req.cookies?.csrf_token;
    const csrfHeader = req.headers['x-csrf-token'];
    
    if (!csrfCookie || csrfCookie !== csrfHeader) {
        return reply.status(403).send(); //{ error: 'CSRF' }
    }
});

// --- AUTH MIDDLEWARE ---
export async function authentificate(req: any, reply: any): Promise<any | null> {
    const db = getDB();

    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
    const csrfToken = req.cookies?.csrf_token;

    if (accessToken) {
        try {
            const payload: any = jwt.verify(accessToken, publicKey, {
                algorithms: ['RS256'],
                issuer: 'auth-service',
                audience: 'transcendence',
            });

            const user = await new Promise<any>((res, rej) => {
                db.get(
                    `SELECT id, email, password_version, twofa_enabled, token_version, deleted_at 
                     FROM users WHERE id = ?`,
                    [payload.sub],
                    (err, row) => (err ? rej(err) : res(row))
                );
            });

            if (!user || user.deleted_at) return null;
            if (payload.pv !== user.password_version) return null;
            if (payload.tv !== user.token_version) return null;

			console.log("[auth] Access token is valid" );

            return user;

        } catch (err) {
            console.log("[auth] Access token expired or invalid");
			return null;
        }
    } else { 
		console.log("[auth] Access token expired or invalid");
		return null; 
	}
}

async function requireAuth(req: any, reply: any) {
        
        const user = await authentificate(req, reply);
        if (!user) {
            return reply.status(401).send();
        }
        
        req.user = user;
    }
    
async function requireGuest(req: any, reply: any) {
        const user = await authentificate(req, reply);
        
        if (!user) return;
        
		return reply.status(200).send({ id: user.id, email: user.email, username: 'HelloWorldPlayer', twofa_enabled: user.twofa_enabled });
    }
    
// --- VERIFICATION IF USER IS ALREADY LOGGED ---
fastify.get('/auth/verify', { preHandler: requireAuth }, async (req: any, reply) => {
        
        const controller = new AbortController();
        
        setTimeout(() => controller.abort(), 5000);
        
        const user = req.user;
        
        let profile: any  = null;
        
        try {
            const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/by-user-id/${user.id}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });

			if (res.ok) {
                
                profile = await res.json() as any;
			}
        } catch (err) {
			req.log.error(err, 'Profile service unavailable');
        }
        
//        req.log.info({ user: req.user }, 'Resultado de usuario en verify');
        
        return reply.status(200).send({ id: user.id, email: user.email, username: profile?.nickname ?? 'Unknown', twofa_enabled: user.twofa_enabled });
});

// --- AUTH INTERNAL MIDDLEWARE ---
async function requireServiceAuth(req: any, reply: any) {

        const auth = req.headers.authorization;

        if (!auth) {
            return reply.status(401).send({ error: 'Missing auth' });
        }

        const token = auth.replace('Bearer ', '');

    if (token !== SERVICE_TOKEN) {
            return reply.status(403).send({ error: 'Forbidden' });
        }
}

// --- INTERNAL AUTH ROUTE ---
fastify.get<{ Params: { id: string } }>('/internal/auth/session_state/:id', { preHandler: requireServiceAuth }, async (req, reply) => {
  try {
    const userId = req.params.id;
    const db = getDB();

    const row = await new Promise<{ user_id: string; expires_at: string } | undefined>((resolve, reject) => {
      db.get(
        `SELECT user_id, expires_at FROM user_sessions WHERE user_id = ? LIMIT 1`,
        [userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result as { user_id: string; expires_at: string } | undefined);
        }
      );
    });

    if (!row) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    return reply.send({ exp: row.expires_at });

  } catch (err) {
    req.log.error(err, 'Error fetching session state');
    return reply.status(500).send({ error: 'SESSION_STATE_FAILED' });
  }
});

// --- SIGNUP ---
fastify.post('/auth/signup', { preHandler: requireGuest }, async (req: any, reply) => {
			 
			 const result = signUpSchema.safeParse(req.body);

			 if (!result.success) {
		   		 return reply.status(400).send({
						error: {
							code: "VALIDATION_ERROR",
				  			message: result.error.issues[0].message,
							},
					  		});
			 	 }

			const { email, password }: AuthInterfaces.AuthBody = result.data;
	 
        try {
            const user = await signup(email, password);
            
            const token = await generateToken({ 
                id: user.id, 
                password_version: user.password_version || 1,
                token_version: user.token_version || 0
            });
            const csrfToken = randomUUID();
            const refreshToken = await createRefreshToken(user.id);
            
            reply
            .setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
            .setCookie('refresh_token', refreshToken, refreshOpts)
            .setCookie('csrf_token', csrfToken, csrfOpts)
            .status(201)
            .send({ 
		user: { 
            id: user.id, 
			email: user.email,
		} 
	});
} catch (err: any) {
    reply.status(409).send({ error: { code: 'EMAIL_OR_USERNAME_TAKEN', message: 'Already exists' } });
    }
});

// --- LOGIN ---
fastify.post('/auth/login', { preHandler: requireGuest }, async (req: any, reply) => {

			 const result = signUpSchema.safeParse(req.body);

			 if (!result.success) {
			 	return reply.status(400).send({
						error: {
							code: "VALIDATION_ERROR",
							message: result.error.issues[0].message,
					  		},
							});
			  	}

			const { email, password }: AuthInterfaces.AuthBody = result.data;

    try {
        const user = await login(email, password);

		const db = getDB();

		// Checking if user is already logged to avoid double login
		const hasActiveSession = await checkActiveSession(user.id);
		if (hasActiveSession) {
            await revokeRefreshTokenById(user.id);

			await new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE users SET token_version = token_version + 1 WHERE id = ?`,
            [user.id],
            (err) => (err ? reject(err) : resolve())
        );
    });
			user.token_version += 1;

			await deleteUserSession(user.id);
        }

        const token = await generateToken({ 
            id: user.id, 
            password_version: user.password_version,
            token_version: user.token_version,
        });
        const csrfToken = randomUUID();
        const refreshToken = await createRefreshToken(user.id);
        
        reply
        .setCookie('access_token', token, { ...cookieOpts, maxAge: 3600 })
        .setCookie('refresh_token', refreshToken, refreshOpts)
        .setCookie('csrf_token', csrfToken, csrfOpts)
        .status(201)
        .send({ 
            user: { 
                id: user.id, 
                email: user.email 
            } 
            });
        } catch (err: any) {
        reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }
});

// --- REFRESH TOKEN CHECK ---
fastify.post('/auth/refresh', async (req: any, reply) => {
  const refreshToken = req.cookies?.refresh_token;
  let csrfToken = req.cookies?.csrf_token;

  if (!refreshToken) {
    console.log('[auth] No refresh token');
    return reply.status(401).send({ error: 'No refresh token' });
  }

  try {
    const refreshPayload: any = await verifyRefreshToken(refreshToken);

    if (!refreshPayload) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }

    if (await isTokenRevoked(refreshPayload.tokenId)) {
      return reply.status(401).send({ error: 'Revoked refresh token' });
    }

    const db = getDB();

   const user = await new Promise<any>((res, rej) => {
      db.get(
        `SELECT id, email, password_version, twofa_enabled, token_version, deleted_at 
         FROM users WHERE id = ?`,
        [refreshPayload.userId],
        (err, row) => (err ? rej(err) : res(row))
      );
    });

    if (!user || user.deleted_at) {
      return reply.status(401).send({ error: 'User invalid' });
    }

    const newAccess = await generateToken({
      id: user.id,
      password_version: user.password_version,
      token_version: user.token_version,
    });

    if (!csrfToken) {
      csrfToken = randomUUID();
    }

    reply
      .setCookie('access_token', newAccess, { ...cookieOpts, maxAge: 3600 })
      .setCookie('csrf_token', csrfToken, csrfOpts);

    return reply.status(200).send({
      id: user.id,
      email: user.email,
      twofa_enabled: user.twofa_enabled
    });

  } catch (err) {
    console.error('[auth] Refresh error:', err);
    return reply.status(401).send({ error: 'Invalid credentials' });
  }
});

// --- CHANGE USER PASSWORD ---
fastify.post('/auth/password', { preHandler: requireAuth }, async (req: any, reply) => {

			 const result = changePasswordSchema.safeParse(req.body);

		   	 if (!result.success) {
		 		 return reply.status(400).send({
							error: {
								code: "VALIDATION_ERROR",
								message: result.error.issues[0].message,
						  		},
								});
			   	 }

			const { old_password, new_password }: AuthInterfaces.ChangePassword = result.data;

			console.log("[auth Changing password] Changing password...");

			const userId = req.user.id;
			const db = getDB();

			// Get hashed password from database
			const user = await new Promise<AuthInterfaces.DBUser | null>((resolve, reject) => {
				db.get(
					   `SELECT password_hashed FROM users WHERE id = ?`,
		   			   [userId],
		   			   (err, row) => (err ? reject(err) : resolve(row as AuthInterfaces.DBUser | null))
			  		  );
				});
		
			if (!user) return reply.status(404).send();

			// If user's password exist, check if it was correct: compare with hashed one
			const valid = await verifyPassword(old_password, user.password_hashed);
    
			if (!valid) {
				return reply.status(403).send({
					error: { code: 'CURRENT_PASSWORD_INCORRECT', message: 'Current password is incorrect' },
					});
			}

			// Hash new user's password
			const newHash = await hashPassword(new_password);

			// Add new password hash to database
			await new Promise<void>((resolve, reject) => {
									db.run(
							   			   `UPDATE users
							  			   SET password_hashed = ?, 
						  				   password_version = password_version + 1, 
						  				   token_version = token_version + 1
							  			   WHERE id = ?`,
							   			   [newHash, userId],
							   			   err => (err ? reject(err) : resolve())
								  		  );
									});

			// Revoke all tokens
			await revokeRefreshTokenById(userId);
			await deleteUserSession(userId);

			console.error("Password changed...");

			return reply
			.clearCookie('access_token', cookieOpts)
			.clearCookie('refresh_token', cookieOpts)
			.clearCookie('csrf_token', csrfOpts)
			.status(204).send();
});

// --- LOGOUT --- 
fastify.post('/auth/logout', async (req: any, reply) => {

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 5000);

	const user = req.user;

    try {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            const payload = await verifyRefreshToken(refreshToken).catch(() => null);
            if (payload) await revokeRefreshToken(payload.tokenId).catch(() => {});
        }

		await deleteUserSession(user.id);

		const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/logout/${user.id}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });
	} catch (err) {
        console.log("[logout] error:", err);
    }

    return reply
        .clearCookie('access_token', cookieOpts)
        .clearCookie('refresh_token', cookieOpts)
        .clearCookie('csrf_token', csrfOpts)
        .status(200)
        .send({ status: 'logged_out' });
});

// --- DELETE USER (SOFT VERSION) ---
fastify.delete('/auth/deleteme', { preHandler: requireAuth }, async (req: any, reply) => {
      	const userId = req.user.id;
      	const db = getDB();
      	const dbToken = getTokenDB();
		const mockEmail = generateEmail();

		const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000);

        console.info("DB Token: ", dbToken);
      	try {
            // Request to Profile Service for soft delete of user info
            const profileRes = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/delete`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SERVICE_TOKEN.trim()}`
                },
				body: JSON.stringify({ userId })
            });

            if (!profileRes.ok) {
                throw new Error('Could not delete profile data');
            }


	    	await new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                dbToken.run(`UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?`, [userId]);

                db.run(`UPDATE users SET email = ?, password_version = password_version + 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [mockEmail, userId], function (err) {
                   if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        db.run('ROLLBACK');
                        return reject(new Error('User not found in database'));
                    }
                    db.run('COMMIT');
                    resolve();
                });
            });
        });

		await deleteUserSession(userId);

		const res = await fetch(`${PROFILE_SERVICE_URL}/internal/profile/logout/${userId}`, { headers: { Authorization: `Bearer ${SERVICE_TOKEN}`, }, signal: controller.signal, });
		// 4. Clear cookies
	    	reply
			.clearCookie('access_token', cookieOpts)
			.clearCookie('refresh_token', cookieOpts)
			.clearCookie('csrf_token', csrfOpts)
			.send({ status: 'account_deleted' });

      	} catch (err) {
	    	req.log.error(err);
	    	reply.status(500).send({ error: 'ACCOUNT_DELETE_FAILED' });
	}
});

// --- HEALTH CHECK ---
fastify.get('/health', async () => ({ status: 'ok', service: 'auth-service' }));

// --- START SERVER ---
const start = async () => {
    try {
        await initDB();
        console.log(chalk.green.bold('[auth] Database initialized'));
		startSessionCleanup();
		console.log(chalk.green.bold('[auth] Session cleaner initialized'));
        await initTokenDB();
        console.log(chalk.green.bold('[auth] Refresh tokens database initialized'));
		refreshTokenCleanup();
		console.log(chalk.green.bold('[auth] Refresh tokens cleaner initialized'))
        await fastify.listen({ port: 8081, host: '0.0.0.0' });
        console.log(chalk.green.bold('[auth] Authentification is running on :8081'));
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

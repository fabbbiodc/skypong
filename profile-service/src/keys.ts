import fs from 'fs';
import path from 'path';

const DEFAULT_PUBLIC_KEY_PATH = '/app/keys/jwt-public.pem';

/**
 * Resolves the key path, using an environment variable if provided,
 * or falling back to the default path.
 * 
 * @param envValue - The environment variable value for the key path.
 * @param fallback - The default fallback path for the key.
 * @returns The resolved key path.
 */
function resolveKeyPath(envValue: string | undefined, fallback: string): string {
    const trimmed = envValue?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Reads the public key from the specified path.
 * If the key does not exist, it logs an error and exits the process.
 * 
 * @returns The contents of the public key file.
 */
function readPublicKeyOrExit(): string {
    const publicKeyPath = resolveKeyPath(process.env.JWT_PUBLIC_KEY_PATH, DEFAULT_PUBLIC_KEY_PATH);

    // Intentar leer la llave hasta 10 veces antes de rendirse
    let attempts = 0;
    while (!fs.existsSync(publicKeyPath) && attempts < 10) {
        console.log(`[profile] Attempt ${attempts} Waiting for public key at ${publicKeyPath}...`);
        // Pausa sincrónica de 1 segundo (solo durante el arranque)
        const start = Date.now();
        while (Date.now() - start < 1000); 
        attempts++;
    }

    if (!fs.existsSync(publicKeyPath)) {
        console.error(`[profile] Missing JWT public key file after 10 attempts.`);
        process.exit(1);
    }

	if (fs.existsSync(publicKeyPath)) {
		console.log(`[profile] JWT public key loaded from ${publicKeyPath} after ${attempts} attempt(s)`);
	}

    return fs.readFileSync(publicKeyPath, 'utf-8').trim();
}

const publicKey = readPublicKeyOrExit();
export { publicKey };

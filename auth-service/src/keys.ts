import fs from 'fs';
import path from 'path';

const DEFAULT_PRIVATE_KEY_PATH = '/app/jwt-private.pem';
const DEFAULT_PUBLIC_KEY_PATH = '/app/jwt-public.pem';

function resolveKeyPath(envValue: string | undefined, fallback: string): string {
	const trimmed = envValue?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function readKeyOrExit(kind: 'private' | 'public', envVar: string, keyPath: string): string {
	const resolvedPath = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);

	if (!fs.existsSync(resolvedPath)) {
		console.error(
			[
				`Missing JWT ${kind} key file.`,
				`Searched path: ${resolvedPath}`,
				`Set ${envVar} to the correct path or provide the key in the container.`,
				'Fix options:',
				`- Copy jwt-${kind}.pem into /app`,
				`- Mount a volume/secret (e.g. /run/secrets/jwt-${kind}.pem) and point ${envVar} to it`,
				'- Run "npm run generate-keys" in the auth-service build context',
			].join('\n')
		);
		process.exit(1);
	}

	return fs.readFileSync(resolvedPath, 'utf-8');
}

const privateKeyPath = resolveKeyPath(process.env.JWT_PRIVATE_KEY_PATH, DEFAULT_PRIVATE_KEY_PATH);
const publicKeyPath = resolveKeyPath(process.env.JWT_PUBLIC_KEY_PATH, DEFAULT_PUBLIC_KEY_PATH);

const privateKey = readKeyOrExit('private', 'JWT_PRIVATE_KEY_PATH', privateKeyPath);
const publicKey = readKeyOrExit('public', 'JWT_PUBLIC_KEY_PATH', publicKeyPath);

export { privateKey, publicKey, privateKeyPath, publicKeyPath };

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { generateKeyPairSync } from "crypto";
import path from "path";

const outDir = process.cwd();

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const privateKeyPath = path.join(outDir, "jwt-private.pem");
const publicKeyPath = path.join(outDir, "jwt-public.pem");

if (!existsSync(privateKeyPath) || !existsSync(publicKeyPath)) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log("✅ JWT key pair generated");
} else {
  console.log("ℹ️ JWT key pair already exists");
}

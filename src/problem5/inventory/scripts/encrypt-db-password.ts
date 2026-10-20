import {
  encryptDbPassword,
  generateDbEncryptionKey,
} from "../src/infrastructure/config/dbPassword";

function usage(): never {
  console.error("Usage: npm run db:encrypt -- [--key <base64>] <password>");
  process.exit(1);
}

const args = process.argv.slice(2);
let key: string | undefined;
const positional: string[] = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") {
    usage();
  }
  if (arg === "--key") {
    const value = args[i + 1];
    if (!value) {
      usage();
    }
    key = value;
    i += 1;
    continue;
  }
  positional.push(arg);
}

if (positional.length !== 1) {
  usage();
}

const encryptionKey = key ?? generateDbEncryptionKey();
const encrypted = encryptDbPassword(positional[0], encryptionKey);

console.log(`DB_ENCRYPTION_KEY="${encryptionKey}"`);
console.log(`DB_PASSWORD="${encrypted}"`);

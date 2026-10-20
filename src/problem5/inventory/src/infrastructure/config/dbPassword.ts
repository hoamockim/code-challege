import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const VERSION = "v1";

export function generateDbEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString("base64");
}

export function encryptDbPassword(plainText: string, keyBase64: string): string {
  const key = decodeKey(keyBase64);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptDbPassword(payload: string, keyBase64: string): string {
  const [version, ivBase64, tagBase64, encryptedBase64] = payload.split(":");
  if (
    version !== VERSION ||
    !ivBase64 ||
    !tagBase64 ||
    !encryptedBase64 ||
    payload.split(":").length !== 4
  ) {
    throw new Error(
      "DB_PASSWORD must be an encrypted value in the form v1:<iv>:<tag>:<ciphertext>"
    );
  }

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      decodeKey(keyBase64),
      Buffer.from(ivBase64, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBase64, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("Failed to decrypt DB_PASSWORD. Check DB_ENCRYPTION_KEY.");
  }
}

function decodeKey(keyBase64: string): Buffer {
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error("DB_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  }
  return key;
}

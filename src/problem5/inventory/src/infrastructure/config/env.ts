import dotenv from "dotenv";
import { decryptDbPassword } from "./dbPassword";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: requireEnv("NODE_ENV", "development"),
  port: Number(requireEnv("PORT", "3000")),
  db: {
    host: requireEnv("DB_HOST", "localhost"),
    port: Number(requireEnv("DB_PORT", "5432")),
    name: requireEnv("DB_NAME", "inventory"),
    user: requireEnv("DB_USER", "postgres"),
    password: decryptDbPassword(
      requireEnv("DB_PASSWORD"),
      requireEnv("DB_ENCRYPTION_KEY")
    ),
    ssl: requireEnv("DB_SSL", "false") === "true",
  },
  isProduction: process.env.NODE_ENV === "production",
};

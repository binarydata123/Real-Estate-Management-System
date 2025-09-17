// backend/src/config/env.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  FRONTEND_URL,
} = process.env;

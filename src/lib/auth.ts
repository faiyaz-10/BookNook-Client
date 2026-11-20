import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import clientPromise from "./mongodb";

const configuredBaseURL = process.env.BETTER_AUTH_URL?.trim();
const baseURL = (configuredBaseURL || "http://localhost:3000").replace(/\/+$/, "");
const secret = process.env.BETTER_AUTH_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!configuredBaseURL) {
    throw new Error("BETTER_AUTH_URL must be configured in production.");
  }
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be at least 32 characters in production.");
  }
  const parsedBaseURL = new URL(baseURL);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsedBaseURL.hostname);
  if (
    parsedBaseURL.origin !== baseURL
    || (parsedBaseURL.protocol !== "https:" && (!isLoopback || process.env.VERCEL === "1"))
  ) {
    throw new Error("BETTER_AUTH_URL must be an HTTPS origin in production.");
  }
}

const client = await clientPromise;
const db = client.db(process.env.MONGODB_DB || "booknook");
export const auth = betterAuth({
  appName: "BookNook",
  baseURL,
  secret,
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
  } : {},
  plugins: [jwt({ jwt: { issuer: baseURL, audience: baseURL, expirationTime: "1h", definePayload: ({ user }) => ({ id: user.id, email: user.email, name: user.name }) } })],
  trustedOrigins: [baseURL]
});

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import clientPromise from "./mongodb";
const client = await clientPromise;
const db = client.db(process.env.MONGODB_DB || "booknook");
export const auth = betterAuth({
  appName: "BookNook",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
  } : {},
  plugins: [jwt({ jwt: { issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000", audience: process.env.BETTER_AUTH_URL || "http://localhost:3000", expirationTime: "1h", definePayload: ({ user }) => ({ id: user.id, email: user.email, name: user.name }) } })],
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"]
});

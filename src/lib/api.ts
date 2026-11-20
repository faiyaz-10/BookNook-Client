const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
if (process.env.NODE_ENV === "production" && !configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured in production.");
}
if (process.env.VERCEL === "1" && configuredApiUrl) {
  const parsedApiUrl = new URL(configuredApiUrl);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsedApiUrl.hostname);
  if (parsedApiUrl.protocol !== "https:" || isLoopback) {
    throw new Error("NEXT_PUBLIC_API_URL must be a public HTTPS API origin on Vercel.");
  }
}
const API_URL = configuredApiUrl || (
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : null
);

export type Book = {
  _id: string;
  title: string;
  author: string;
  category: string;
  image: string;
  description: string;
  userName: string;
  userEmail?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
};

export type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
  userEmail: string;
  quantity: number;
  returnedQuantity?: number;
  borrowDate: string;
  returnDate: string;
};

async function token() {
  const result = await authToken();

  if (!result) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return result;
}

async function authToken(): Promise<string | null> {
  let result: Awaited<ReturnType<(typeof import("./auth-client"))["authClient"]["token"]>>;
  try {
    result = await (await import("./auth-client")).authClient.token();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not retrieve your session token: ${error.message}`
        : "Could not retrieve your session token.",
    );
  }

  if (result.error) {
    throw new Error(result.error.message || "Could not retrieve your session token.");
  }
  return result.data?.token || null;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  protectedRequest = false
): Promise<T> {
  const headers = new Headers(options.headers);
  const apiUrl = API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured for production.");
  }

  if (options.body && !(typeof FormData !== "undefined" && options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (protectedRequest) {
    headers.set("Authorization", `Bearer ${await token()}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload
      && typeof payload.message === "string"
      ? payload.message
      : "Something went wrong";
    throw new Error(message);
  }
  if (payload === null) {
    throw new Error("Unexpected server response.");
  }

  return payload as T;
}

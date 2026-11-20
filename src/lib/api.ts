const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export type Book = { _id:string; title:string; author:string; category:string; image:string; description:string; userName:string; userEmail?:string; totalCopies:number; availableCopies:number; createdAt:string };
export type Borrow = { _id:string; bookId:string; bookTitle:string; bookAuthor:string; bookImage:string; userEmail:string; quantity:number; returnedQuantity?:number; borrowDate:string; returnDate:string };
async function token() {
  const result = await authToken();
  if (!result) throw new Error("Your session has expired. Please sign in again.");
  return result;
}
async function authToken(): Promise<string | null> {
  try { const { data, error } = await (await import("./auth-client")).authClient.token(); if (error || !data?.token) return null; return data.token; }
  catch { return null; }
}
export async function api<T>(path:string, options:RequestInit = {}, protectedRequest=false):Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (protectedRequest) headers.set("Authorization", `Bearer ${await token()}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, cache:"no-store" });
  const payload = await response.json().catch(()=>({message:"Unexpected server response"}));
  if (!response.ok) throw new Error(payload.message || "Something went wrong");
  return payload as T;
}

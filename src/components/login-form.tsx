"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function getInternalDestination(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const destination = new URL(value, "http://booknook.local");
    return destination.origin === "http://booknook.local"
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const destination = getInternalDestination(params.get("callbackURL"));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: destination,
    });
    if (signInError) {
      setError(signInError.message || "Unable to sign in. Check your details.");
      setBusy(false);
      return;
    }
    toast.success("Welcome back.");
    router.push(destination);
    router.refresh();
  };

  const google = async () => {
    setBusy(true);
    sessionStorage.setItem("booknook:auth-success-toast", "login");
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: destination,
      });
      if (signInError) {
        sessionStorage.removeItem("booknook:auth-success-toast");
        setError(signInError.message || "Google sign-in failed.");
        setBusy(false);
      }
    } catch (error) {
      sessionStorage.removeItem("booknook:auth-success-toast");
      setError(error instanceof Error ? error.message : "Google sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <div className="form-card auth-form-card">
      <h1>Welcome back</h1>
      <p>Sign in to continue your reading journey.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div style={{ textAlign: "right", fontSize: 13, marginBottom: 18 }}>
          <span className="muted">Forgot password? Password reset is not enabled for this assignment.</span>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn full" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
      <div className="auth-divider">OR</div>
      <button className="btn btn-outline full" type="button" onClick={google} disabled={busy}>
        <span className="google-mark" aria-hidden="true">G</span>
        Continue with Google
      </button>
      <p style={{ textAlign: "center", marginTop: 22, fontSize: 14 }}>
        New to BookNook? <Link className="text-link" href="/register">Create an account</Link>
      </p>
    </div>
  );
}

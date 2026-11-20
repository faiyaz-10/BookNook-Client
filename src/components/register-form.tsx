"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and be at least 6 characters long.");
      return;
    }

    setBusy(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        image: image || undefined,
      });
      if (signUpError) {
        setError(signUpError.message || "Unable to create your account.");
        return;
      }

      const { error: signOutError } = await authClient.signOut();
      if (signOutError) {
        setError(`Your account was created, but automatic sign-out failed: ${signOutError.message}`);
        return;
      }
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    sessionStorage.setItem("booknook:auth-success-toast", "register");
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (signInError) {
        sessionStorage.removeItem("booknook:auth-success-toast");
        setError(signInError.message || "Google sign-up failed.");
        setBusy(false);
      }
    } catch (error) {
      sessionStorage.removeItem("booknook:auth-success-toast");
      setError(error instanceof Error ? error.message : "Google sign-up failed.");
      setBusy(false);
    }
  };

  return (
    <div className="form-card auth-form-card">
      <h1>Create your account</h1>
      <p>Join the BookNook reading community.</p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="register-image">Photo URL (optional)</label>
          <input
            id="register-image"
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        <div className="field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <small className="muted">
            At least 6 characters, including uppercase and lowercase letters.
          </small>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn full" disabled={busy}>
          {busy ? "Creating account..." : "Register"}
        </button>
      </form>
      <div className="auth-divider">OR</div>
      <button className="btn btn-outline full" type="button" onClick={google} disabled={busy}>
        <span className="google-mark" aria-hidden="true">G</span>
        Continue with Google
      </button>
      <p style={{ textAlign: "center", marginTop: 22, fontSize: 14 }}>
        Already have an account? <Link className="text-link" href="/login">Login</Link>
      </p>
    </div>
  );
}

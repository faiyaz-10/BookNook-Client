"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];
const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
];

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const links = [...publicLinks, ...(session ? privateLinks : [])];

  const logout = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message || "Unable to log out.");
        return;
      }
      setProfile(false);
      toast.success("You have been logged out.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log out.");
    }
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark"><BookOpen size={21} /></span>BookNook
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} className={path === link.href ? "active" : ""} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {!isPending && !session && (
            <>
              <Link className="btn btn-outline" href="/login">Login</Link>
              <Link className="btn" href="/register">Register</Link>
            </>
          )}
          {session && (
            <div className="profile-wrap">
              <button
                className="profile-trigger"
                aria-label={`Open profile menu for ${session.user.name}`}
                aria-expanded={profile}
                onClick={() => setProfile(!profile)}
              >
                <img
                  className="avatar"
                  src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "Reader")}&background=dce9df&color=285b45`}
                  alt=""
                />
                <span>{session.user.name}</span>
              </button>
              {profile && (
                <div className="profile-menu">
                  <strong>{session.user.name}</strong>
                  <small>{session.user.email}</small>
                  <Link href="/profile" onClick={() => setProfile(false)}>My Profile</Link>
                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          )}
          <button className="mobile-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} className={path === link.href ? "active" : ""} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!session && (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

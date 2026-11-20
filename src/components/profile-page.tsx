"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, type Borrow } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(true);
  const [borrowError, setBorrowError] = useState("");

  useEffect(() => {
    if (session) setName(session.user.name);
  }, [session]);

  const loadBorrows = useCallback(async () => {
    setLoadingBorrows(true);
    setBorrowError("");
    try {
      const result = await api<{ borrows: Borrow[] }>("/borrows", {}, true);
      setBorrows(result.borrows);
    } catch (error) {
      setBorrowError(error instanceof Error ? error.message : "Could not load your borrowed books.");
    } finally {
      setLoadingBorrows(false);
    }
  }, []);

  useEffect(() => {
    if (session) void loadBorrows();
  }, [session?.user.id, loadBorrows]);

  const updateName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedName = name.trim();
    if (!updatedName) {
      toast.error("Your name cannot be empty.");
      return;
    }

    setSavingName(true);
    try {
      const { error } = await authClient.updateUser({ name: updatedName });
      if (error) {
        toast.error(error.message || "Could not update your name.");
        return;
      }
      setName(updatedName);
      toast.success("Your name has been updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your name.");
    } finally {
      setSavingName(false);
    }
  };

  if (!session) return <main className="page-shell"><div className="container"><Loader /></div></main>;

  return (
    <main className="page-shell dashboard-page">
      <div className="container">
        <div className="form-card profile-card">
          <span className="kicker">Your BookNook account</span>
          <h1>My Profile</h1>
          <div className="profile-identity">
            <img
              className="avatar"
              width={72}
              height={72}
              src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}`}
              alt=""
            />
            <div>
              <strong>{session.user.name}</strong>
              <p className="muted">{session.user.email}</p>
            </div>
          </div>
          <p className="muted">Update the name shown on your BookNook account.</p>
          <form onSubmit={updateName}>
            <div className="field">
              <label htmlFor="profile-name">Username</label>
              <input
                id="profile-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
            </div>
            <button className="btn" type="submit" disabled={savingName || !name.trim()}>
              {savingName ? "Saving..." : "Save username"}
            </button>
          </form>
        </div>

        <section className="profile-borrows" aria-labelledby="profile-borrows-heading">
          <div className="page-heading">
            <span className="kicker">Your reading list</span>
            <h2 className="page-title" id="profile-borrows-heading">Borrowed Books</h2>
            <p>See the books you currently have and when you borrowed them.</p>
          </div>
          {loadingBorrows ? (
            <Loader />
          ) : borrowError ? (
            <div className="empty" role="alert">
              <h3>Borrowed books could not be loaded</h3>
              <p>{borrowError}</p>
              <button className="btn btn-outline" type="button" onClick={() => void loadBorrows()}>
                Try again
              </button>
            </div>
          ) : borrows.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Book</th><th>Copies</th><th>Borrowed on</th><th>Return date</th></tr>
                </thead>
                <tbody>
                  {borrows.map((borrow) => (
                    <tr key={borrow._id}>
                      <td data-label="Book">
                        <div className="table-book">
                          <img className="table-cover" src={borrow.bookImage} alt="" />
                          <strong>{borrow.bookTitle}</strong>
                        </div>
                      </td>
                      <td data-label="Copies">{borrow.quantity}</td>
                      <td data-label="Borrowed on">{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                      <td data-label="Return date">{new Date(borrow.returnDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <h3>No borrowed books</h3>
              <p>Explore the library and borrow your first book.</p>
              <a className="btn" href="/books">Browse Books</a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

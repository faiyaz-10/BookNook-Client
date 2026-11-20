"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, type Book } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";

export default function BookDetails({ id }: { id: string }) {
  const { data: session, isPending } = authClient.useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const loadBook = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api<{ book: Book }>(`/books/${id}`, { signal }, true);
      setBook(result.book);
    } catch (error) {
      if (signal?.aborted) return;
      setLoadError(error instanceof Error ? error.message : "Could not load this book.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(`/login?callbackURL=${encodeURIComponent(`/books/${id}`)}`);
      return;
    }
    const controller = new AbortController();
    void loadBook(controller.signal);
    return () => controller.abort();
  }, [id, isPending, loadBook, router, session]);

  useEffect(() => {
    const updateAvailability = (event: Event) => {
      const { _id, availableCopies } = (event as CustomEvent<{
        _id: string;
        availableCopies: number;
      }>).detail;
      if (_id === id) {
        setBook((current) => current ? { ...current, availableCopies } : current);
      }
    };
    window.addEventListener("booknook:availability-changed", updateAvailability);
    return () => window.removeEventListener("booknook:availability-changed", updateAvailability);
  }, [id]);

  useEffect(() => {
    if (isPending || !session) return;
    if (new URLSearchParams(window.location.search).get("borrow") === "true") {
      setModal(true);
    }
  }, [isPending, session]);

  const requestBorrow = () => {
    if (!session) {
      router.push(`/login?callbackURL=${encodeURIComponent(`/books/${id}?borrow=true`)}`);
      return;
    }
    setModal(true);
  };

  const borrow = async () => {
    if (!book || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > book.availableCopies) return;
    setSaving(true);
    try {
      await api("/borrows", {
        method: "POST",
        body: JSON.stringify({ bookId: book._id, quantity }),
      }, true);
      toast.success(`${quantity} ${quantity === 1 ? "copy" : "copies"} borrowed successfully.`);
      setModal(false);
      await loadBook();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not borrow this book.");
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return <main className="page-shell"><div className="container"><Loader /></div></main>;
  }
  if (loadError) {
    return (
      <main className="page-shell details-page">
        <div className="container">
          <div className="empty" role="alert">
            <h3>Book details could not be loaded</h3>
            <p>{loadError}</p>
            <button className="btn btn-outline" type="button" onClick={() => void loadBook()}>
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }
  if (!book) {
    return <main className="page-shell"><div className="container"><div className="empty">Book not found.</div></div></main>;
  }

  const validQuantity = Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= book.availableCopies;

  return (
    <main className="page-shell details-page">
      <div className="container details-container">
        <div className="details-layout">
          <div className="details-cover-frame">
            <img className="details-image" src={book.image} alt={book.title} />
            <span className="details-cover-caption">BOOKNOOK COMMUNITY LIBRARY</span>
          </div>
          <div className="details-content">
            <span className="kicker">A book worth sharing</span>
            <span className="category">{book.category}</span>
            <h1>{book.title}</h1>
            <p>Written by <strong>{book.author}</strong></p>
            <p>{book.description}</p>
            <div className="details-meta">
              <div className="meta-box">
                <small>Available copies</small>
                <strong>{book.availableCopies} / {book.totalCopies}</strong>
                <span className="availability-meter" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, (book.availableCopies / book.totalCopies) * 100)}%` }} />
                </span>
              </div>
              <div className="meta-box">
                <small>Added by</small>
                <strong>{book.userName}</strong>
                <small className="meta-email">{book.userEmail?.toLowerCase() || ""}</small>
              </div>
            </div>
            {book.availableCopies > 0
              ? <button className="btn" type="button" onClick={requestBorrow}>Borrow This Book</button>
              : <button className="btn" type="button" disabled>Not Available</button>}
          </div>
        </div>
      </div>
      {modal && (
        <div className="modal-backdrop" onClick={() => { if (!saving) setModal(false); }}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="borrow-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="borrow-heading">Confirm your borrow</h2>
            <p className="muted">
              Borrowing {quantity} {quantity === 1 ? "copy" : "copies"} of <strong>{book.title}</strong>.
            </p>
            <div className="field">
              <label htmlFor="borrow-quantity">Copies to borrow</label>
              <input
                id="borrow-quantity"
                type="number"
                min={1}
                max={book.availableCopies}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
              <small className="muted">{book.availableCopies} copies currently available</small>
            </div>
            <div className="field">
              <label htmlFor="borrower-name">Your name</label>
              <input id="borrower-name" readOnly value={session?.user.name || ""} />
            </div>
            <div className="field">
              <label htmlFor="borrower-email">Your email</label>
              <input id="borrower-email" readOnly value={session?.user.email || ""} />
            </div>
            <p className="muted">The return date will be set 7 days from today.</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                type="button"
                disabled={saving}
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="btn" type="button" disabled={saving || !validQuantity} onClick={borrow}>
                {saving ? "Processing..." : "Confirm Borrow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

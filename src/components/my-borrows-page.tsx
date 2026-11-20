"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api, type Borrow } from "@/lib/api";
import Loader from "./loader";

export default function MyBorrowsPage() {
  const [items, setItems] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [returning, setReturning] = useState<string | null>(null);
  const [returnBorrow, setReturnBorrow] = useState<Borrow | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);

  const loadBorrows = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api<{ borrows: Borrow[] }>("/borrows", {}, true);
      setItems(result.borrows);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load your borrowed books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBorrows();
  }, [loadBorrows]);

  const giveBack = async (borrow: Borrow, quantity: number) => {
    const id = borrow._id;
    setReturning(id);
    try {
      const result = await api<{
        remainingQuantity: number;
        returnedQuantity: number;
        returnedCopies: number;
        book: { _id: string; availableCopies: number | null };
      }>(
        `/borrows/${id}`,
        {
          method: "DELETE",
          body: JSON.stringify({
            quantity,
            expectedReturnedQuantity: borrow.returnedQuantity ?? 0,
          }),
        },
        true,
      );
      setItems((current) => current.flatMap((borrow) => {
        if (borrow._id !== id) return [borrow];
        return result.remainingQuantity > 0
          ? [{
            ...borrow,
            quantity: result.remainingQuantity,
            returnedQuantity: result.returnedQuantity,
          }]
          : [];
      }));
      if (typeof result.book?.availableCopies === "number") {
        window.dispatchEvent(new CustomEvent("booknook:availability-changed", { detail: result.book }));
      }
      setReturnBorrow(null);
      toast.success(`${result.returnedCopies} ${result.returnedCopies === 1 ? "copy" : "copies"} returned successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not return book.");
    } finally {
      setReturning(null);
    }
  };

  const requestReturn = (borrow: Borrow) => {
    if (borrow.quantity === 1) {
      void giveBack(borrow, 1);
      return;
    }
    setReturnQuantity(1);
    setReturnBorrow(borrow);
  };

  const confirmReturn = () => {
    if (!returnBorrow || !Number.isSafeInteger(returnQuantity)
      || returnQuantity < 1 || returnQuantity > returnBorrow.quantity) return;
    void giveBack(returnBorrow, returnQuantity);
  };

  return (
    <main className="page-shell dashboard-page">
      <div className="container">
        <div className="page-heading">
          <span className="kicker">Your reading list</span>
          <h1 className="page-title">My Borrows</h1>
          <p>Keep track of books you have borrowed and return them when you&apos;re done.</p>
        </div>
        {loading ? (
          <Loader />
        ) : loadError ? (
          <div className="empty" role="alert">
            <h3>Your borrowed books could not be loaded</h3>
            <p>{loadError}</p>
            <button className="btn btn-outline" type="button" onClick={() => void loadBorrows()}>
              Try again
            </button>
          </div>
        ) : items.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Book</th><th>Borrowed Copies</th><th>Borrow Date</th><th>Return Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {items.map((borrow) => (
                  <tr key={borrow._id}>
                    <td data-label="Book">
                      <div className="table-book">
                        <img className="table-cover" src={borrow.bookImage} alt="" />
                        <div>
                          <strong>{borrow.bookTitle}</strong>
                          <small>by {borrow.bookAuthor}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Borrowed Copies">{borrow.quantity}</td>
                    <td data-label="Borrow Date">{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                    <td data-label="Return Date">{new Date(borrow.returnDate).toLocaleDateString()}</td>
                    <td data-label="Action">
                      <button
                        className="btn"
                        type="button"
                        disabled={returning !== null}
                        onClick={() => requestReturn(borrow)}
                      >
                        {returning === borrow._id ? "Returning..." : "Return Book"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <h3>No borrowed books</h3>
            <p>Explore the library and borrow your first book.</p>
            <Link className="btn" href="/books">Browse Books</Link>
          </div>
        )}
      </div>
      {returnBorrow && (
        <div className="modal-backdrop" onClick={() => { if (!returning) setReturnBorrow(null); }}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-book-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="return-book-heading">Return Book</h2>
            <p className="muted"><strong>{returnBorrow.bookTitle}</strong></p>
            <p className="muted">Currently borrowed: {returnBorrow.quantity} copies</p>
            <div className="field">
              <label htmlFor="return-quantity">Copies to return</label>
              <select
                id="return-quantity"
                value={returnQuantity}
                onChange={(event) => setReturnQuantity(Number(event.target.value))}
                disabled={returning !== null}
              >
                {Array.from({ length: returnBorrow.quantity }, (_, index) => index + 1).map((quantity) => (
                  <option key={quantity} value={quantity}>{quantity}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                type="button"
                disabled={returning !== null}
                onClick={() => setReturnBorrow(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                type="button"
                disabled={returning !== null}
                onClick={confirmReturn}
              >
                {returning === returnBorrow._id ? "Returning..." : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, type Book } from "@/lib/api";
import { uploadBookImage } from "@/lib/book-image";
import Loader from "./loader";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function MyBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [edit, setEdit] = useState<Book | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [remove, setRemove] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api<{ books: Book[] }>("/books?mine=true", {}, true);
      setBooks(result.books);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load your books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!edit) return;

    const formData = new FormData(event.currentTarget);
    const totalCopies = Number(formData.get("totalCopies"));
    if (!Number.isSafeInteger(totalCopies) || totalCopies < edit.totalCopies - edit.availableCopies) {
      toast.error("Total copies cannot be less than the copies currently borrowed.");
      return;
    }

    setSaving(true);
    try {
      const image = editFile ? await uploadBookImage(editFile) : edit.image;
      const result = await api<{ book: Book }>(`/books/${edit._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: String(formData.get("title") || ""),
          author: String(formData.get("author") || ""),
          category: String(formData.get("category") || ""),
          description: String(formData.get("description") || ""),
          totalCopies,
          image,
        }),
      }, true);
      setBooks((current) => current.map((book) => book._id === edit._id ? result.book : book));
      setEdit(null);
      setEditFile(null);
      toast.success("Book updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update book.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async () => {
    if (!remove || deleting) return;
    setDeleting(true);
    try {
      await api(`/books/${remove._id}`, { method: "DELETE" }, true);
      setBooks((current) => current.filter((book) => book._id !== remove._id));
      setRemove(null);
      toast.success("Book deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete book.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="page-shell dashboard-page">
      <div className="container">
        <div className="page-heading">
          <span className="kicker">Your contribution</span>
          <h1 className="page-title">My Books</h1>
          <p>Manage the books you have added to the community shelves.</p>
        </div>
        {!loading && !loadError && (
          <div className="dashboard-stats" aria-label="Your book collection summary">
            <article className="stat-card">
              <span>Titles shared</span>
              <strong>{books.length}</strong>
            </article>
            <article className="stat-card">
              <span>Total copies</span>
              <strong>{books.reduce((total, book) => total + book.totalCopies, 0)}</strong>
            </article>
            <article className="stat-card">
              <span>Available to borrow</span>
              <strong>{books.reduce((total, book) => total + book.availableCopies, 0)}</strong>
            </article>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : loadError ? (
          <div className="empty" role="alert">
            <h3>Your books could not be loaded</h3>
            <p>{loadError}</p>
            <button className="btn btn-outline" type="button" onClick={() => void loadBooks()}>
              Try again
            </button>
          </div>
        ) : books.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Book</th><th>Category</th><th>Copies</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td data-label="Book">
                      <div className="table-book">
                        <img className="table-cover" src={book.image} alt="" />
                        <strong>{book.title}</strong>
                      </div>
                    </td>
                    <td data-label="Category">{book.category}</td>
                    <td data-label="Copies">{book.totalCopies}</td>
                    <td data-label="Available">{book.availableCopies}</td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => { setEdit(book); setEditFile(null); }}
                        >
                          Edit
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => setRemove(book)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <h3>You haven&apos;t added a book yet</h3>
            <p>Share a book to get your shelf started.</p>
            <a className="btn" href="/add-book">Add a Book</a>
          </div>
        )}
      </div>

      {edit && (
        <div
          className="modal-backdrop"
          onClick={() => { if (!saving) { setEdit(null); setEditFile(null); } }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-book-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="edit-book-heading">Edit book</h2>
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="edit-title">Book title</label>
                <input id="edit-title" name="title" defaultValue={edit.title} required maxLength={120} />
              </div>
              <div className="field">
                <label htmlFor="edit-author">Author</label>
                <input id="edit-author" name="author" defaultValue={edit.author} required maxLength={120} />
              </div>
              <div className="field">
                <label htmlFor="edit-category">Category</label>
                <select id="edit-category" name="category" defaultValue={edit.category}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="edit-image">Replace cover image (optional)</label>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditFile(event.target.files?.[0] || null)}
                />
                <small className="muted">{editFile ? editFile.name : "The current cover will be kept unless you choose a new one."}</small>
              </div>
              <div className="field">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={edit.description}
                  required
                  maxLength={1500}
                />
              </div>
              <div className="field">
                <label htmlFor="edit-copies">Total copies</label>
                <input
                  id="edit-copies"
                  name="totalCopies"
                  type="number"
                  min={Math.max(1, edit.totalCopies - edit.availableCopies)}
                  step="1"
                  defaultValue={edit.totalCopies}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={saving}
                  onClick={() => { setEdit(null); setEditFile(null); }}
                >
                  Cancel
                </button>
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {remove && (
        <div className="modal-backdrop" onClick={() => { if (!deleting) setRemove(null); }}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-book-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-book-heading">Delete this book?</h2>
            <p className="muted">
              Are you sure you want to delete “{remove.title}”? This action cannot be undone.
              Books with active borrows cannot be deleted.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                type="button"
                disabled={deleting}
                onClick={() => setRemove(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" type="button" disabled={deleting} onClick={deleteBook}>
                {deleting ? "Deleting..." : "Delete book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

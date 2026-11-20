"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import BookCard from "./book-card";
import Loader from "./loader";
import { api, type Book } from "@/lib/api";

const categories = ["All", "Fiction", "Science", "History", "Kids", "Others"];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const loadBooks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api<{ books: Book[] }>("/books", { signal });
      setBooks(result.books);
    } catch (error) {
      if (signal?.aborted) return;
      setLoadError(error instanceof Error ? error.message : "Could not load books.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadBooks(controller.signal);
    const updateAvailability = (event: Event) => {
      const { _id, availableCopies } = (event as CustomEvent<{
        _id: string;
        availableCopies: number;
      }>).detail;
      setBooks((current) => current.map((book) => (
        book._id === _id ? { ...book, availableCopies } : book
      )));
    };
    window.addEventListener("booknook:availability-changed", updateAvailability);
    return () => {
      controller.abort();
      window.removeEventListener("booknook:availability-changed", updateAvailability);
    };
  }, [loadBooks]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = books.filter((book) => (
    (category === "All" || book.category === category)
    && `${book.title} ${book.author}`.toLowerCase().includes(normalizedQuery)
  ));

  return (
    <main className="page-shell catalog-page">
      <div className="container">
        <div className="page-heading">
          <span className="kicker">The community bookshelf</span>
          <h1 className="page-title">All Books</h1>
          <p>Find a story, learn something new, or share a book with another reader.</p>
        </div>
        <div className="book-controls">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Search books"
              placeholder="Search by title or author..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="select-field">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Filter by category</span>
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {!loading && !loadError && books.length > 0 && (
            <span className="results-count">{filtered.length} {filtered.length === 1 ? "book" : "books"}</span>
          )}
        </div>
        {loading ? (
          <Loader />
        ) : loadError ? (
          <div className="empty" role="alert">
            <h3>Books could not be loaded</h3>
            <p>{loadError}</p>
            <button className="btn btn-outline" type="button" onClick={() => void loadBooks()}>
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="empty">
            <h3>The shelves are waiting</h3>
            <p>No books have been added yet.</p>
          </div>
        ) : filtered.length ? (
          <div className="book-grid">
            {filtered.map((book) => <BookCard key={book._id} book={book} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>No matching books</h3>
            <p>Try a different search or category.</p>
          </div>
        )}
      </div>
    </main>
  );
}

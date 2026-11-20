import Link from "next/link";
import type { Book } from "@/lib/api";

export default function BookCard({ book }: { book: Book }) {
  const available = book.availableCopies > 0;

  return (
    <article className="book-card">
      <div className="book-cover-wrap">
        <img className="book-cover" src={book.image} alt={book.title} />
        <span className={`book-stock${available ? "" : " is-unavailable"}`}>
          {available ? `${book.availableCopies} ${book.availableCopies === 1 ? "copy" : "copies"} available` : "Not Available"}
        </span>
      </div>
      <div className="book-card-body">
        <span className="category">{book.category}</span>
        <h3>{book.title}</h3>
        <p>by {book.author}</p>
        <Link className="btn btn-outline" href={`/books/${book._id}`}>View Details</Link>
      </div>
    </article>
  );
}

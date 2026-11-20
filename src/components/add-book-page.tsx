"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { uploadBookImage } from "@/lib/book-image";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

export default function AddBookPage() {
  const { data: session, isPending } = authClient.useSession();
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "Fiction",
    description: "",
    totalCopies: "1",
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const change = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalCopies = Number(form.totalCopies);
    if (!Number.isSafeInteger(totalCopies) || totalCopies < 1) {
      toast.error("Total copies must be a positive whole number.");
      return;
    }
    if (!file) {
      toast.error("Please choose a book cover image.");
      return;
    }

    setSaving(true);
    try {
      const image = await uploadBookImage(file);
      await api("/books", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          category: form.category,
          description: form.description,
          totalCopies,
          image,
        }),
      }, true);
      toast.success("Book added to the library.");
      router.push("/my-books");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add book.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell add-book-page">
      <div className="container">
        <div className="page-heading">
          <span className="kicker">Grow the community shelf</span>
          <h1 className="page-title">Share a book.</h1>
          <p>Add a well-loved title and help another reader find their next favourite.</p>
        </div>
        <div className="form-card add-book-card">
          <div className="form-card-heading">
            <h2>Book information</h2>
            <p>Tell readers a little about this title.</p>
          </div>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="book-title">Book Title</label>
              <input
                id="book-title"
                name="title"
                value={form.title}
                onChange={change}
                required
                maxLength={120}
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="book-author">Author Name</label>
                <input
                  id="book-author"
                  name="author"
                  value={form.author}
                  onChange={change}
                  required
                  maxLength={120}
                />
              </div>
              <div className="field">
                <label htmlFor="book-category">Category</label>
                <select id="book-category" name="category" value={form.category} onChange={change}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="book-image">Book Image</label>
              <div className="upload-area">
                <input
                  id="book-image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  required
                />
                <span className="upload-hint">
                  {file ? file.name : "Choose a cover image from your device"}
                </span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="book-description">Short Description</label>
              <textarea
                id="book-description"
                name="description"
                value={form.description}
                onChange={change}
                required
                maxLength={1500}
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="book-copies">Total Copies</label>
                <input
                  id="book-copies"
                  type="number"
                  name="totalCopies"
                  min="1"
                  step="1"
                  value={form.totalCopies}
                  onChange={change}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="book-creator">User Name</label>
                <input id="book-creator" readOnly value={session?.user.name || ""} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="book-creator-email">User Email</label>
              <input id="book-creator-email" readOnly value={session?.user.email || ""} />
            </div>
            <button className="btn full" type="submit" disabled={saving || isPending || !session}>
              {saving ? "Uploading and saving..." : "Add Book"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

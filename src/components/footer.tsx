import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Link href="/" className="brand">
              <span className="brand-mark"><BookOpen size={21} /></span>
              BookNook
            </Link>
            <p>
              A little corner for curious minds. Discover stories, share knowledge, and keep your next great read close.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <div className="footer-links">
              <Link href="/books">All Books</Link>
              <Link href="/register">Join BookNook</Link>
              <Link href="/login">Sign In</Link>
            </div>
          </div>
          <div>
            <h4>Get in touch</h4>
            <div className="footer-links">
              <a href="mailto:hello@booknook.example"><Mail size={14} /> hello@booknook.example</a>
              <a href="tel:+8801700000000"><Phone size={14} /> +880 1700-000000</a>
              <span><MapPin size={14} /> Bangladesh</span>
              <a href="https://x.com" target="_blank" rel="noreferrer">𝕏 &nbsp; Follow us</a>
            </div>
          </div>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} BookNook. Made for readers, by readers.
        </div>
      </div>
    </footer>
  );
}

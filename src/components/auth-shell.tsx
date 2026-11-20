import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthShell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "login" | "register";
}) {
  const isLogin = variant === "login";

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <aside className="auth-art" aria-label="BookNook reading community">
          <Link href="/" className="brand">
            <span className="brand-mark"><BookOpen size={21} /></span>
            BookNook
          </Link>
          <div className="auth-art-copy">
            <span>{isLogin ? "Welcome back, reader" : "Find your next chapter"}</span>
            <h2>{isLogin ? "A good book is waiting." : "Make space for new stories."}</h2>
            <p>
              {isLogin
                ? "Pick up where you left off and keep exploring the community bookshelf."
                : "Join a community that believes every book is better when it is shared."}
            </p>
          </div>
          <div className="auth-books" aria-hidden="true">
            <span className="auth-book auth-book-one">A WORLD OF STORIES</span>
            <span className="auth-book auth-book-two">READ · SHARE · RETURN</span>
          </div>
          <span className="auth-art-foot">Discover · Borrow · Belong</span>
        </aside>
        <section className="auth-panel" aria-label={isLogin ? "Sign in" : "Create an account"}>
          {children}
        </section>
      </div>
    </main>
  );
}
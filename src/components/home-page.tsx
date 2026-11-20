"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Compass,
  HandHeart,
  LibraryBig,
  ListChecks,
  Microscope,
  Search,
  UserRound,
} from "lucide-react";
import BookCard from "./book-card";
import Loader from "./loader";
import { api, type Book } from "@/lib/api";
import styles from "./home-page.module.css";

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const swiperRef = useRef<SwiperInstance | null>(null);

  const loadBooks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api<{ books: Book[] }>("/books?sort=newest&limit=6", { signal });
      setBooks(result.books);
    } catch (error) {
      if (signal?.aborted) return;
      setLoadError(error instanceof Error ? error.message : "Could not load new arrivals.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadBooks(controller.signal);
    return () => controller.abort();
  }, [loadBooks]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className={styles.heroSlider}>
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              onBeforeDestroy={() => { swiperRef.current = null; }}
              aria-label="BookNook highlights"
            >
              <SwiperSlide>
                <div className={`slide ${styles.discoverSlide}`}>
                  <div className="slide-content">
                    <span className="eyebrow">A library that travels with you</span>
                    <h1>Every book opens a new world.</h1>
                    <p>Find your next favourite read, explore new ideas, and let a good story take you somewhere unexpected.</p>
                    <div className="hero-actions">
                      <Link className="btn" href="/books">Browse Books <ArrowRight size={17} /></Link>
                      <Link className="hero-secondary" href="#how-it-works-heading">How it works</Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className={`slide ${styles.shareSlide}`}>
                  <div className="slide-content">
                    <span className="eyebrow">Read more, share more</span>
                    <h1>Great stories are better shared.</h1>
                    <p>Borrow a book from the community and return it when you are ready for another adventure.</p>
                    <div className="hero-actions">
                      <Link className="btn" href="/books">Browse Books <ArrowRight size={17} /></Link>
                      <Link className="hero-secondary" href="#how-it-works-heading">How it works</Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className={`slide ${styles.curiositySlide}`}>
                  <div className="slide-content">
                    <span className="eyebrow">Your reading journey starts here</span>
                    <h1>Make room for curiosity.</h1>
                    <p>From science to fiction, discover books that spark ideas and bring people together.</p>
                    <div className="hero-actions">
                      <Link className="btn" href="/books">Browse Books <ArrowRight size={17} /></Link>
                      <Link className="hero-secondary" href="#how-it-works-heading">How it works</Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowPrevious}`}
              type="button"
              aria-label="Previous slide"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className={`${styles.sliderArrow} ${styles.sliderArrowNext}`}
              type="button"
              aria-label="Next slide"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="new-arrivals-heading">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Fresh on the shelves</span>
              <h2 id="new-arrivals-heading">New Arrivals</h2>
              <p className="section-sub">The latest books added by our reading community.</p>
            </div>
            <Link className="text-link" href="/books">
              See all books <ArrowRight size={16} style={{ verticalAlign: "middle" }} />
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : loadError ? (
            <div className="empty" role="alert">
              <h3>New arrivals could not be loaded</h3>
              <p>{loadError}</p>
              <button className="btn btn-outline" type="button" onClick={() => void loadBooks()}>
                Try again
              </button>
            </div>
          ) : books.length ? (
            <div className="book-grid">
              {books.map((book) => <BookCard key={book._id} book={book} />)}
            </div>
          ) : (
            <div className="empty">
              <h3>Our shelves are waiting</h3>
              <p>There are no books yet. Be the first to add one.</p>
              <Link className="btn" href="/register">Join BookNook</Link>
            </div>
          )}
          <div className="home-section-action">
            <Link className="btn btn-outline" href="/books">See All Books</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-categories-heading">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Choose a direction</span>
              <h2 id="featured-categories-heading">A shelf for every curiosity.</h2>
              <p className="section-sub">Thoughtfully gathered reads across the subjects readers return to.</p>
            </div>
          </div>
          <div className={`feature-grid ${styles.categoryGrid}`}>
            <article className={`feature ${styles.categoryCard}`}>
              <span className="feature-icon"><BookOpen /></span>
              <h3>Fiction</h3>
              <p>Stories, characters, and worlds to get lost in.</p>
              <span className={styles.categoryCount}>IMAGINATION, IN EVERY FORM</span>
            </article>
            <article className={`feature ${styles.categoryCard}`}>
              <span className="feature-icon"><Microscope /></span>
              <h3>Science</h3>
              <p>New ways to understand how the world works.</p>
              <span className={styles.categoryCount}>QUESTIONS WORTH EXPLORING</span>
            </article>
            <article className={`feature ${styles.categoryCard}`}>
              <span className="feature-icon"><LibraryBig /></span>
              <h3>History</h3>
              <p>Ideas and events that shaped the world around us.</p>
              <span className={styles.categoryCount}>PERSPECTIVE THROUGH TIME</span>
            </article>
            <article className={`feature ${styles.categoryCard}`}>
              <span className="feature-icon"><BookMarked /></span>
              <h3>Kids</h3>
              <p>Bright beginnings for curious young readers.</p>
              <span className={styles.categoryCount}>A LITTLE WONDER, EVERY DAY</span>
            </article>
          </div>
        </div>
      </section>

      <section className={`section ${styles.sectionTint}`} aria-labelledby="how-it-works-heading">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">Your next read, made easy</span>
              <h2 id="how-it-works-heading">How Borrowing Works</h2>
              <p className="section-sub">Four simple steps from discovery to return.</p>
            </div>
          </div>
          <div className={`feature-grid ${styles.stepsGrid}`}>
            <article className="feature">
              <span className="feature-icon"><Search /></span>
              <span className={styles.stepLabel}>Step 1</span>
              <h3>Browse books</h3>
              <p>Explore the shelves and find a book that catches your interest.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><UserRound /></span>
              <span className={styles.stepLabel}>Step 2</span>
              <h3>Sign in</h3>
              <p>Log in or create an account when you are ready to borrow.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><BookMarked /></span>
              <span className={styles.stepLabel}>Step 3</span>
              <h3>Borrow a book</h3>
              <p>Confirm your borrow and enjoy your next reading adventure.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><CalendarCheck2 /></span>
              <span className={styles.stepLabel}>Step 4</span>
              <h3>Return on time</h3>
              <p>Return your book by its due date so another reader can enjoy it.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-booknook-heading">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="kicker">A better way to share stories</span>
              <h2 id="why-booknook-heading">Why Choose BookNook?</h2>
              <p className="section-sub">Everything you need to make more room for reading.</p>
            </div>
          </div>
          <div className={`feature-grid ${styles.benefitsGrid}`}>
            <article className="feature">
              <span className="feature-icon"><Compass /></span>
              <h3>Discover with ease</h3>
              <p>Search and explore a community collection of books across many categories.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><HandHeart /></span>
              <h3>Simple borrowing</h3>
              <p>Borrow available books with a clear, straightforward process.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><LibraryBig /></span>
              <h3>Organized collections</h3>
              <p>Keep track of the books you have contributed to the community shelves.</p>
            </article>
            <article className="feature">
              <span className="feature-icon"><ListChecks /></span>
              <h3>Convenient tracking</h3>
              <p>See your borrowed books and return dates together in one place.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={`callout ${styles.callout}`}>
            <div>
              <span className="kicker">A community of readers</span>
              <h2>Have a book worth sharing?</h2>
              <p>Add it to the shelves and help someone discover a new favourite.</p>
            </div>
            <Link className="btn" href="/add-book">Add a Book <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

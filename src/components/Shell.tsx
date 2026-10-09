"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { topics, lessons, lessonBySlug } from "@/content/curriculum";
import { useProgress } from "@/lib/progress";
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      const panel = navigation.current;
      const current = panel?.querySelector<HTMLElement>(
        '.topic-lesson-links [aria-current="page"]',
      );
      if (!panel || !current || panel.getClientRects().length === 0) return;
      const bounds = panel.getBoundingClientRect();
      const link = current.getBoundingClientRect();
      if (link.bottom > bounds.bottom - 16)
        panel.scrollTop += link.bottom - bounds.bottom + 16;
      else if (link.top < bounds.top + 16)
        panel.scrollTop += link.top - bounds.top - 16;
    };
    const frame = requestAnimationFrame(reveal);
    const observer = new ResizeObserver(reveal);
    if (navigation.current) observer.observe(navigation.current);
    void document.fonts.ready.then(reveal);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname, open]);
  const { warning, data, ready } = useProgress();
  const active = lessonBySlug(pathname.split("/")[2] ?? "")?.topic;
  const links = [
    ["/", "Contents"],
    ["/learn", "My progress"],
    ["/practice", "Mixed practice"],
    ["/diagnostics", "Starting checks"],
    ["/exams", "Practice papers"],
    ["/preferences", "Preferences"],
  ];
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="mobile-bar">
        <Link href="/">
          Atelier <span>GCSE Chemistry</span>
        </Link>
        <button
          className="button small"
          aria-expanded={open}
          aria-controls="course-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close map" : "Course map"}
        </button>
      </header>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M15 7h10M17 7v11L9 30c-2 3 0 5 3 5h16c3 0 5-2 3-5l-8-12V7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M14 26h12l4 7H10z" fill="currentColor" />
              <circle cx="19" cy="22" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span>
            Atelier Academy<small>GCSE Chemistry</small>
          </span>
        </Link>
        <nav ref={navigation} id="course-navigation" aria-label="Course map">
          <div className="nav-main">
            {links.slice(0, 2).map(([href, label]) => (
              <Link
                onClick={() => setOpen(false)}
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="nav-label">Your course</p>
          <ol className="topic-nav">
            {topics.map((t, i) => (
              <li key={t.slug}>
                <Link
                  onClick={() => setOpen(false)}
                  href={`/topics/${t.slug}`}
                  data-colour={t.colour}
                  aria-current={
                    pathname === `/topics/${t.slug}` ? "page" : undefined
                  }
                  data-active={active === t.slug}
                >
                  <span className="topic-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t.title}</span>
                </Link>
                {active === t.slug && (
                  <ol className="topic-lesson-links">
                    {lessons
                      .filter((lesson) => lesson.topic === t.slug)
                      .map((lesson) => (
                        <li key={lesson.slug}>
                          <Link
                            href={`/lessons/${lesson.slug}`}
                            aria-current={
                              pathname === `/lessons/${lesson.slug}`
                                ? "page"
                                : undefined
                            }
                            onClick={() => setOpen(false)}
                          >
                            {lesson.title}
                          </Link>
                        </li>
                      ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
          <div className="nav-main utilities">
            {links.slice(2).map(([href, label]) => (
              <Link
                key={href}
                onClick={() => setOpen(false)}
                href={href}
                aria-current={
                  pathname === href || pathname.startsWith(href + "/")
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="sidebar-note">
          <span className="saved-dot" /> Progress stays on this device
          <small>
            {ready
              ? `${data.preferences.tier === "higher" ? "Higher" : "Foundation"} · ${data.preferences.course === "combined" ? "Combined Science" : "Separate Chemistry"}`
              : "Browser-local learning"}
          </small>
        </div>
      </aside>
      <div className="main-column">
        <main id="main-content" tabIndex={-1}>
          {warning && (
            <div className="storage-warning" role="status">
              {warning} <Link href="/preferences">Data settings</Link>
            </div>
          )}
          {children}
        </main>
        <footer>
          <span>Atelier Academy · Chemistry, understood.</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

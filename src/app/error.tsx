"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel">
      <h1>This page could not load.</h1>
      <p>
        Your saved work has not been deliberately removed. Try loading the page
        again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}

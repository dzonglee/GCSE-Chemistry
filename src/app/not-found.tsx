import Link from "next/link";
export default function NotFound() {
  return (
    <>
      <p className="eyebrow">Let’s find your way back</p>
      <h1>This page isn’t in the course.</h1>
      <p>Choose a topic or lesson from the contents.</p>
      <Link className="button primary" href="/">
        Open the course map →
      </Link>
    </>
  );
}

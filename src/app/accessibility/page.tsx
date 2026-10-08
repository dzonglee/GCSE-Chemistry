export const metadata = { title: "Accessibility" };
export default function Page() {
  return (
    <article className="prose">
      <p className="eyebrow">More ways to explore</p>
      <h1>Accessibility</h1>
      <p>
        The app uses labelled native controls, visible keyboard focus, a skip
        link and semantic headings. Model readouts describe numerical and
        chemical changes in text as well as diagrams. Meaning is not
        communicated by colour alone.
      </p>
      <h2>Keyboard and touch</h2>
      <p>
        Use Tab to move between controls, arrow keys to change sliders and radio
        choices, and Enter or Space to activate buttons. Model controls work
        without dragging a diagram. Course navigation collapses behind a
        labelled button on smaller screens.
      </p>
      <h2>Motion and layout</h2>
      <p>
        No animation is required to learn. Reduced-motion preferences are
        respected. Content is designed to reflow on narrow screens; chemical
        formulae and captions are also available as text.
      </p>
      <h2>Known boundaries</h2>
      <p>
        Automated accessibility checks and representative keyboard/touch checks
        support testing but do not establish full screen-reader acceptance.
        Chemical notation pronunciation varies across assistive technology.
        Simplified diagrams include captions and textual interpretations.
      </p>
    </article>
  );
}

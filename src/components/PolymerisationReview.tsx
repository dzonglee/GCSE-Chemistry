import type { FourGroups } from "../lib/polymerisation";
import type { PolyesterDrawingData } from "../lib/polyester";
import { PolymerisationDisplayed } from "./PolymerisationDisplayed";
import { PolyesterDisplayed } from "./PolyesterConstruction";
import { CondensationReference } from "./CondensationConstruction";
export function PolymerisationReview({
  question: q,
}: {
  question: {
    polymerisationGiven?: { groups: FourGroups; polymer: boolean };
    polymerisationDrawing?: unknown;
    polyesterDrawing?: PolyesterDrawingData;
  };
}) {
  if (q.polymerisationDrawing && q.polymerisationGiven) {
    const reverse = q.polymerisationGiven.polymer;
    return (
      <section className="polymerisation-review">
        <h3>Reference for your self-review</h3>
        <PolymerisationDisplayed
          groups={q.polymerisationGiven.groups}
          bond={reverse ? "2" : "1"}
          left={reverse ? "0" : "1"}
          right={reverse ? "0" : "1"}
          brackets={reverse ? "0" : "1"}
          countMark={reverse ? "none" : "n"}
          label="Reference structure for self-review"
        />
        <p>
          This is one conventional orientation. Equivalent reversed/rotated
          representations preserve the same attachments. Compare your retained
          response with this reference and the criteria; no examiner drawing
          mark is awarded.
        </p>
      </section>
    );
  }
  if (q.polyesterDrawing) {
    const d = q.polyesterDrawing;
    return (
      <section className="polymerisation-review">
        <h3>Reference for your Higher self-review</h3>
        {d.construction ? (
          <CondensationReference data={d} />
        ) : (
          <PolyesterDisplayed
            reference
            board={{
              diolC: String(d.diolC),
              acidSpacerC: String(d.acidSpacerC),
              leftO: "1",
              middleO: "1",
              carbonyl1: "2",
              carbonyl2: "2",
              left: "1",
              right: "1",
              brackets: "1",
              countMark: "n",
            }}
          />
        )}
        <p>
          {d.construction === "groups"
            ? "Check both complete alcohol groups and both complete carboxylic-acid groups."
            : "The reference retains both original spacers, both carbonyls and both alcohol-derived linking oxygens. Equivalent repeat phases are valid."}{" "}
          Compare your retained response and the criteria; no examiner drawing
          mark is awarded.
        </p>
      </section>
    );
  }
  return null;
}

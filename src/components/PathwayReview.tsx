import { additionCases } from "../lib/pathways";
import {
  sourcePathwayDrawing,
  referencePathwayDrawing,
  type PathwayDrawingData,
} from "../lib/pathway-board";
import { PathwayDisplayed } from "./PathwayDisplayed";
export function PathwayGiven({ caseId }: { caseId: string }) {
  const r = additionCases[caseId];
  return (
    <section className="pathway-given">
      <p>
        <strong>Supplied original alkene:</strong> {r.name}. Carbon numbering
        for the stated task runs from the left end shown below.
      </p>
      <PathwayDisplayed
        board={sourcePathwayDrawing(caseId)}
        label="Fixed original alkene for this question"
      />
    </section>
  );
}
export function PathwayReview({
  question: q,
}: {
  question: { pathwayDrawing?: PathwayDrawingData };
}) {
  if (!q.pathwayDrawing) return null;
  return (
    <section className="pathway-review">
      <h3>Reference for your self-review</h3>
      <PathwayDisplayed
        board={referencePathwayDrawing(q.pathwayDrawing.caseId)}
        label="Separate addition-product reference for self-review"
      />
      <p>
        This reference is separate from your retained response. Equivalent
        rotated or reversed displayed structures preserve the same carbon
        attachments. Check each original atom, the changed C–C bond and all new
        attachments against the criteria; no examiner drawing mark is awarded.
      </p>
    </section>
  );
}

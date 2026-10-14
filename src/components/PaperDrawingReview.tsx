"use client";
import type { Question } from "@/content/types";
import { TangentPlot, type TangentPoint } from "./TangentPlot";
import { readTangentDrawing } from "@/lib/tangent-drawing";
import { validTangentNumber } from "@/lib/tangent-rates";
import { readProfileDrawing, drawingLevels } from "@/lib/reaction-profiles";
import { ReactionProfile } from "./ReactionProfile";
import { readOrganicDrawing } from "@/lib/organic-drawing";
import { OrganicDisplayed } from "./OrganicDisplayed";
import { readPolyesterDrawing } from "@/lib/polyester";
import { PolyesterDisplayed } from "./PolyesterConstruction";

/** Submitted work is a readable record, without inactive answer-entry forms. */
export function PaperDrawingReview({
  question: q,
  value,
  contextLabel,
}: {
  question: Question;
  value: string;
  contextLabel: string;
}) {
  const unreadable = (
    <p role="status">
      {contextLabel}: the saved construction cannot be drawn. The original
      response is retained.
    </p>
  );
  if (q.tangentDrawing) {
    const b = readTangentDrawing(value);
    if (!b) return unreadable;
    const valid = Object.values(b).every(validTangentNumber);
    const line: [TangentPoint, TangentPoint] | undefined = valid
      ? [
          { t: Number(b.tx0), q: Number(b.ty0) },
          { t: Number(b.tx1), q: Number(b.ty1) },
        ]
      : undefined;
    return (
      <section
        className="rate-drawing-input tangent-assessment-response"
        aria-label={contextLabel}
      >
        <TangentPlot
          graph={{ ...q.tangentDrawing, line: undefined, label: contextLabel }}
          line={line}
          compact
        />
        {!valid && (
          <p>
            Some retained coordinates are incomplete or invalid; no replacement
            tangent has been drawn.
          </p>
        )}
      </section>
    );
  }
  if (q.profileDrawing) {
    const b = readProfileDrawing(value),
      levels = b && drawingLevels(b);
    return (
      <section className="profile-drawing-input" aria-label={contextLabel}>
        {b && levels ? (
          <ReactionProfile
            profile={{ ...levels, max: 240, step: 40 }}
            activationArrow={b.activationArrow}
            overallArrow={b.overallArrow}
            contextLabel={contextLabel}
            constructed
          />
        ) : (
          unreadable
        )}
      </section>
    );
  }
  if (q.organicDrawing) {
    const b = readOrganicDrawing(value);
    return (
      <section className="organic-drawing-input" aria-label={contextLabel}>
        {b?.n ? (
          <OrganicDisplayed
            n={Number(b.n)}
            board={b}
            contextLabel={contextLabel}
            reviewOnly
          />
        ) : (
          unreadable
        )}
      </section>
    );
  }
  if (q.polyesterDrawing && !q.polyesterDrawing.construction) {
    const b = readPolyesterDrawing(value);
    if (!b) return unreadable;
    const bond = (v: string) =>
      v === "0" ? "No oxygen" : v === "1" ? "Single C–O" : "Double C=O";
    const present = (v: string) => (v === "1" ? "Present" : "Absent");
    const fields = [
      ["Diol CH₂ spacer carbons", b.diolC],
      ["Diacid CH₂ spacer carbons", b.acidSpacerC],
      ["First carboxyl C–O", bond(b.carbonyl1)],
      ["Second carboxyl C–O", bond(b.carbonyl2)],
      ["Left alcohol-derived O", present(b.leftO)],
      ["Other alcohol-derived O", present(b.middleO)],
      ["Left continuation", present(b.left)],
      ["Right continuation", present(b.right)],
      ["Brackets", present(b.brackets)],
      [
        "Count notation",
        b.countMark === "none"
          ? "Absent"
          : b.countMark === "inside"
            ? "n inside"
            : `${b.countMark} outside`,
      ],
    ];
    return (
      <section className="polymerisation-drawing" aria-label={contextLabel}>
        <PolyesterDisplayed board={b} contextLabel={contextLabel} />
        <dl className="construction-review-values">
          {fields.map(([label, entry]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{entry}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  return null;
}

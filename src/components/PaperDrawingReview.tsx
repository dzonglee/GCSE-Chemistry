"use client";
import type { Question } from "@/content/types";
import { TangentPlot, type TangentPoint } from "./TangentPlot";
import { readTangentDrawing } from "@/lib/tangent-drawing";
import { validTangentNumber } from "@/lib/tangent-rates";
import { readProfileDrawing, drawingLevels } from "@/lib/reaction-profiles";
import { ReactionProfile } from "./ReactionProfile";
import {
  readOrganicDrawing,
  drawingOrganicCounts,
} from "@/lib/organic-drawing";
import { OrganicDisplayed } from "./OrganicDisplayed";
import { readPolyesterDrawing } from "@/lib/polyester";
import { PolyesterDisplayed } from "./PolyesterConstruction";
import { CovalentDiagram } from "./CovalentDiagram";
import { IonDotCross } from "./IonDotCross";
import { covalentMolecules } from "@/lib/covalent";

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
  if (q.drawCovalent || q.drawDotCross) {
    let b: Record<string, unknown>;
    try {
      b = JSON.parse(value);
    } catch {
      return unreadable;
    }
    if (!b || typeof b !== "object" || Array.isArray(b)) return unreadable;
    const number = (key: string, low: number, high: number) => {
      const raw = b[key];
      if (typeof raw !== "string" || !raw.trim()) return null;
      const n = Number(raw);
      return Number.isInteger(n) && n >= low && n <= high ? n : null;
    };
    if (q.drawCovalent) {
      const molecule = q.drawCovalent.molecule,
        spec = covalentMolecules[molecule],
        unshared = number("unsharedCentre", 0, 8),
        own = spec.partners.map((_, i) => number(`centre${i}`, 0, 3)),
        other = spec.partners.map((_, i) => number(`partner${i}`, 0, 3)),
        partnerUnshared = spec.partners.map((_, i) =>
          number(`unsharedPartner${i}`, 0, 8),
        );
      if (
        unshared === null ||
        [...own, ...other, ...partnerUnshared].some((n) => n === null)
      )
        return unreadable;
      return (
        <section className="paper-electron-review" aria-label={contextLabel}>
          <CovalentDiagram
            molecule={molecule}
            own={own as number[]}
            other={other as number[]}
            unshared={unshared}
            partnerUnshared={partnerUnshared as number[]}
            compact
            contextLabel={contextLabel}
          />
        </section>
      );
    }
    const dots = number("dots", 0, 12),
      crosses = number("crosses", 0, 12),
      charge = number("charge", -3, 3),
      brackets = number("brackets", 0, 1);
    if (
      dots === null ||
      crosses === null ||
      charge === null ||
      brackets === null
    )
      return unreadable;
    return (
      <section className="paper-electron-review" aria-label={contextLabel}>
        <IonDotCross
          symbol={q.drawDotCross!.symbol}
          dots={dots}
          crosses={crosses}
          charge={charge}
          showBrackets={brackets === 1}
          contextLabel={contextLabel}
        />
      </section>
    );
  }
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
    const b = readOrganicDrawing(value),
      count = b?.n ? drawingOrganicCounts(b) : null;
    return (
      <section className="organic-drawing-input" aria-label={contextLabel}>
        {b?.n && count ? (
          <>
            <OrganicDisplayed
              n={Number(b.n)}
              board={b}
              contextLabel={contextLabel}
              reviewOnly
            />
            <p>
              Atom count: {count.C} C, {count.H} H and {count.O} O atoms in this
              construction.
            </p>
          </>
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

"use client";
import { Fragment } from "react";
import {
  readNaturalDrawing,
  expectedNaturalBoard,
  naturalFields,
  dnaCases,
  peptideCases,
  peptideUnitCases,
  aminoAcids,
  type NaturalBoard,
} from "../lib/natural";
import type { NaturalDiagramData } from "../lib/natural";
import { PeptideRepeatDiagram } from "./PeptideRepeatDiagram";
import { DNA2D, GlucoseCrop, PeptideDiagram } from "./NaturalWorkbench";
export function NaturalGiven({
  data,
  compact = false,
}: {
  data: NaturalDiagramData;
  compact?: boolean;
}) {
  if (data.mode === "peptideUnit")
    return (
      <section className="natural-given">
        <p>
          <strong>Fixed original monomer:</strong>{" "}
          {
            aminoAcids[
              peptideUnitCases[data.record as keyof typeof peptideUnitCases]
                .amino
            ].formula
          }
          {compact
            ? "."
            : ". Construct your own bracketed contribution from this original structure."}
        </p>
      </section>
    );
  if (data.mode === "peptide")
    return (
      <section className="natural-given">
        <p>
          <strong>Fixed original molecules, in the supplied order:</strong>{" "}
          {peptideCases[data.record as keyof typeof peptideCases].units
            .map((k) => aminoAcids[k].formula)
            .join(" + ")}
        </p>
        {!compact && (
          <p>
            These are the original molecules, not a completed peptide answer.
          </p>
        )}
      </section>
    );
  if (data.mode === "dna" && compact)
    return (
      <section className="natural-given">
        <p>
          <strong>Source:</strong>{" "}
          {dnaCases[data.record as keyof typeof dnaCases].source.length}{" "}
          positions on each of two strands. Original labels are fixed. Key: A–T;
          C–G.
        </p>
      </section>
    );
  if (data.mode === "dna")
    return (
      <section className="natural-given">
        <p>
          <strong>Fixed source excerpt:</strong>{" "}
          {dnaCases[data.record as keyof typeof dnaCases].source.length}{" "}
          positions on each of two strands. The original-strand labels are
          fixed. Supplied visual key: A pairs with T; C pairs with G.
        </p>
      </section>
    );
  if (compact)
    return (
      <section className="natural-given">
        <p>
          Glucose-derived crop below; ends omitted. Mark boundaries. Joined
          units, not free monomers.
        </p>
      </section>
    );
  return (
    <section className="natural-given">
      <p>
        <strong>Fixed glucose-derived source crop:</strong> the original atoms
        and links are shown in the diagram. Mark your selected boundaries in
        your own response. This is an end-omitted crop, not a whole isolated
        molecule.
      </p>
    </section>
  );
}
export function NaturalDrawingInput({
  value,
  onChange,
  data,
  disabled = false,
  instructions,
}: {
  value: string;
  onChange: (v: string) => void;
  data: NaturalDiagramData;
  disabled?: boolean;
  instructions?: string;
}) {
  const b = readNaturalDrawing(value, data);
  if (!b)
    return (
      <section className="natural-drawing">
        <p role="status">
          Your original saved structure cannot be read. Its exact bytes have
          been retained. Clearing this response replaces only this question’s
          draft.
        </p>
        <pre>{value}</pre>
      </section>
    );
  function update(k: string, v: string) {
    if (disabled || !b) return;
    onChange(JSON.stringify({ ...b, [k]: v }));
  }
  const fields =
    data.mode === "peptideUnit"
      ? [
          "nitrogen",
          "core",
          "carbonyl",
          "acidOH",
          "continuation",
          "brackets",
          "multiplier",
          "junction",
        ]
      : data.mode === "dna"
        ? ["unit", "strands", "shape", "monomer"]
        : data.mode === "repeat"
          ? ["start", "end", "boundary", "monomer"]
          : [
              "link",
              "acidOH",
              "aminoH",
              "carbonyl",
              "leftEnd",
              "rightEnd",
              "water",
              "mechanism",
            ];
  const labels: Record<string, string> = {
    nitrogen: "Your nitrogen group",
    core: "Your retained carbon section",
    continuation: "Your bonds crossing the boundaries",
    brackets: "Your repeat brackets",
    multiplier: "Your multiplier outside the brackets",
    junction: "Your joining atom pair between contributions",
    unit: "Your whole unit at position 1",
    strands: "Your number of polymer strands",
    shape: "Your overall arrangement",
    monomer: "Your monomer name",
    start: "Your starting boundary",
    end: "Your ending boundary",
    boundary: "Your selected contribution",
    link: "Your joining atom pair",
    acidOH: "Your acid OH at internal junctions",
    aminoH: "Your H count on internal amino N",
    carbonyl: "Your carbonyl C–O bond",
    leftEnd: "Your left terminal group",
    rightEnd: "Your right terminal group",
    water: "Your released water count",
    mechanism: "Your polymerisation type",
  };
  const display: Record<string, string> = {
    CH2: "CH₂",
    CH2CH2: "CH₂–CH₂",
    CHCH3: "CH(CH₃)",
    both: "Both boundaries",
    left: "Left only",
    right: "Right only",
    neither: "Neither",
    shown: "Shown",
    leftNucleotide: "Original-strand nucleotide",
    rightNucleotide: "Other-strand nucleotide",
    rung: "Whole two-sided rung",
    baseOnly: "Base alone",
    doubleHelix: "Double helix",
    singleHelix: "Single helix",
    flatLadder: "Flat ladder",
    nucleotide: "Nucleotide",
    glucose: "Glucose",
    aminoAcid: "Amino acid",
    base: "Base alone",
    oneRingOneBridge: "One ring + one linking O",
    ringOnly: "Ring only",
    bridgeOnly: "O only",
    wholeCrop: "Whole crop",
    CN: "Carbonyl C–N",
    CO: "C–O",
    CC: "C–C",
    none: "No link",
    retained: "Retained",
    removed: "Removed",
    single: "Single",
    double: "Double",
    absent: "Absent",
    NH2: "NH₂",
    NH: "NH",
    N: "N",
    COOH: "COOH",
    COO: "COO",
    condensation: "Condensation",
    addition: "Addition",
    ionic: "Ionic attraction",
  };
  return (
    <section className="natural-drawing">
      <p>
        Build your own structural proposal. Choices start blank. It is retained
        for your self-review; no automatic examiner drawing mark is awarded.
      </p>
      <div className="natural-controls">
        {fields.map((k, i) => {
          const options = naturalFields[data.mode][k];
          return (
            <Fragment key={k}>
              <label className="natural-field">
                {labels[k]}
                {options ? (
                  <select
                    data-drawing-field={k}
                    value={b[k]}
                    disabled={disabled}
                    onChange={(e) => update(k, e.target.value)}
                  >
                    {options.map((v) => (
                      <option value={v} key={v}>
                        {v === "" ? "Choose" : display[v] || v}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    data-drawing-field={k}
                    value={b[k]}
                    disabled={disabled}
                    inputMode="decimal"
                    onChange={(e) => update(k, e.target.value.slice(0, 24))}
                  />
                )}
              </label>
              {i === 1 && instructions && (
                <p className="natural-task-instructions">{instructions}</p>
              )}
              {(data.mode === "peptideUnit" || data.mode === "peptide") &&
                i === 1 && (
                  <div className="natural-repeat-preview">
                    <NaturalProposal data={data} board={b} />
                  </div>
                )}
            </Fragment>
          );
        })}
      </div>
      {data.mode !== "peptideUnit" && data.mode !== "peptide" && (
        <NaturalProposal data={data} board={b} />
      )}
    </section>
  );
}
export function NaturalProposal({
  data,
  board,
}: {
  data: NaturalDiagramData;
  board: NaturalBoard;
}) {
  return data.mode === "peptideUnit" ? (
    <PeptideRepeatDiagram b={board} />
  ) : data.mode === "dna" ? (
    <DNA2D b={board} />
  ) : data.mode === "repeat" ? (
    <GlucoseCrop b={board} />
  ) : (
    <PeptideDiagram b={board} />
  );
}
export function NaturalReview({ data }: { data: NaturalDiagramData }) {
  return (
    <section className="natural-review">
      <h3>Separate reference for your self-review</h3>
      {data.mode === "peptideUnit" && (
        <p>
          <strong>Reference:</strong> retain the original carbon section and
          C=O; one H remains on N; acid OH is omitted inside the repeat. Bonds
          continue through both brackets, n is outside, and neighbouring
          contributions join C to N. These boundaries are not finite-chain
          terminal groups.
        </p>
      )}
      {data.mode === "dna" && (
        <p>
          <strong>Reference:</strong> one complete nucleotide on either strand;
          two strands; double helix; nucleotide monomers. The diagram below is a
          flat schematic of the selected units.
        </p>
      )}
      {data.mode === "repeat" && (
        <p>
          <strong>Reference:</strong> one full glucose-derived ring plus one
          adjoining linking O. Either adjoining O is acceptable; the example
          selects boundaries 0 to 2.
        </p>
      )}
      {data.mode === "peptide" && (
        <p>
          <strong>Reference:</strong> carbonyl C–N links; retained C=O; one H on
          each internal N; terminal NH₂ and COOH. Each actual junction releases
          one H₂O.
        </p>
      )}
      <NaturalProposal
        data={data}
        board={expectedNaturalBoard(data.mode, data.record)}
      />
      <p>
        This reference does not replace your retained response. Compare every
        selected whole unit, original contribution and actual joining bond with
        the criteria. No examiner drawing mark is awarded.
      </p>
    </section>
  );
}

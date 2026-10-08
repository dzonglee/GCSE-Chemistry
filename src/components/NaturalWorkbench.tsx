"use client";
import { PeptideRepeatDiagram } from "./PeptideRepeatDiagram";
import { useState } from "react";
import {
  naturalRecords,
  identifyCases,
  repeatCases,
  dnaCases,
  sequenceCases,
  peptideCases,
  peptideUnitCases,
  massCases,
  coreCases,
  aminoAcids,
  initialNaturalBoard,
  appendNaturalBoard,
  checkNaturalBoard,
  type NaturalMode,
  type NaturalFocus,
  type NaturalBoard,
} from "../lib/natural";
import { NaturalScene3D } from "./NaturalScene3D";
type Props = {
  mode: NaturalMode;
  focus?: NaturalFocus;
  history: NaturalBoard[];
  onChange: (h: NaturalBoard[]) => void;
};
const words: Record<string, string> = {
  nucleotides: "Nucleotides",
  aminoAcids: "Amino acids",
  glucose: "Glucose",
  ethene: "Ethene",
  ions: "Ions",
  oneRingOneBridge: "One ring + one linking O",
  ringOnly: "Ring only",
  bridgeOnly: "Oxygen only",
  wholeCrop: "Whole shown crop",
  leftNucleotide: "Original strand unit",
  rightNucleotide: "Other strand unit",
  rung: "Whole two-sided rung",
  baseOnly: "One base alone",
  doubleHelix: "Double helix",
  singleHelix: "Single helix",
  flatLadder: "Flat ladder",
  nucleotide: "Nucleotide",
  aminoAcid: "Amino acid",
  base: "Base alone",
  same: "Same",
  different: "Different",
  notDetermined: "Not enough evidence",
  mustSame: "Must be the same",
  mustDifferent: "Must be different",
  CN: "Carbonyl C–N",
  CO: "C–O",
  CC: "C–C",
  none: "No joining bond",
  retained: "Retained",
  removed: "Removed",
  single: "Single",
  double: "Double",
  absent: "Absent",
  condensation: "Condensation",
  addition: "Addition",
  ionic: "Ionic attraction",
  finiteOpenChain: "Complete finite open chain",
  repeatOnly: "One end-omitted repeat only",
  feedOnly: "Unreacted monomers only",
};
export function DNA2D({ b }: { b: NaturalBoard }) {
  const r = dnaCases[b.record as keyof typeof dnaCases],
    strands = Number(b.strands || 2);
  return (
    <div
      className="natural-pan"
      tabIndex={0}
      aria-label="DNA diagram; scroll to inspect each position"
    >
      <div className="natural-dna" style={{ minWidth: r.source.length * 110 }}>
        {Array.from({ length: strands }, (_, s) => (
          <div key={s}>
            {s === 1 && (
              <div
                className="natural-associations"
                aria-label="Paired-base associations, not backbone bonds"
              >
                {[...r.source].map((_, i) => (
                  <span key={i}>⋮</span>
                ))}
              </div>
            )}
            <div
              className="natural-dna-row"
              aria-label={
                s === 0
                  ? "Fixed original strand"
                  : `Your proposed strand ${s + 1}`
              }
            >
              {[...r.source].map((v, i) => {
                const chosen =
                  i === 0 &&
                  (b.unit === "rung" ||
                    (b.unit === "leftNucleotide" && s === 0) ||
                    (b.unit === "rightNucleotide" && s === 1));
                return (
                  <span
                    key={i}
                    className={chosen ? "chosen" : ""}
                    aria-label={`Complete nucleotide ${i + 1} on strand ${s + 1}`}
                  >
                    <small>Backbone</small>
                    <strong
                      className={
                        i === 0 && s === 0 && b.unit === "baseOnly"
                          ? "chosen-base"
                          : ""
                      }
                      aria-label={`Base label ${s === 0 ? v : b["p" + i] || "unknown"}`}
                    >
                      {s === 0 ? v : b["p" + i] || "?"}
                    </strong>
                    <small>Unit {i + 1}</small>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="natural-diagram-note">
        Each box represents one whole nucleotide: a backbone contribution with
        its base. A type letter labels the base component. This is a flat
        schematic; your predicted overall shape remains your selected answer.
      </p>
    </div>
  );
}
export function GlucoseCrop({ b }: { b: NaturalBoard }) {
  const r = repeatCases[b.record as keyof typeof repeatCases],
    start = Number(b.start),
    end = Number(b.end),
    active = b.start !== "" && b.end !== "";
  return (
    <div
      className="natural-pan"
      tabIndex={0}
      aria-label="Glucose-derived chain diagram; scroll to inspect all rings"
    >
      <p className="natural-pan-help">
        Scroll sideways to inspect the whole structure.
      </p>
      <svg
        role="img"
        aria-label={`${r.rings} glucose-derived rings connected through oxygen bridges. The highlight shows only your retained selection.`}
        style={{ width: r.rings * 280, minWidth: r.rings * 280 }}
        width={r.rings * 280}
        height={325}
        viewBox={`0 0 ${r.rings * 280} 325`}
      >
        {Array.from({ length: r.rings }, (_, i) => {
          const x = i * 280 + 105,
            y = 145,
            p = [
              [-55, 0],
              [-28, -48],
              [28, -48],
              [55, 0],
              [28, 48],
              [-28, 48],
            ];
          const ringIndex = 2 * i + (r.start ? 1 : 0),
            bridgeIndex = 2 * i + (r.start ? 2 : 1),
            hasRightBridge = !r.start || i < r.rings - 1;
          return (
            <g key={i}>
              {active && ringIndex >= start && ringIndex < end && (
                <rect
                  x={x - 78}
                  y={20}
                  width={156}
                  height={240}
                  rx={16}
                  fill="#fff2a0"
                />
              )}
              {hasRightBridge &&
                active &&
                bridgeIndex >= start &&
                bridgeIndex < end && (
                  <rect
                    x={x + 100}
                    y={y + 4}
                    width={42}
                    height={42}
                    rx={12}
                    fill="#fff2a0"
                  />
                )}
              {p.map(([px, py], j) => {
                const [qx, qy] = p[(j + 1) % 6];
                return (
                  <line
                    key={"b" + j}
                    x1={x + px}
                    y1={y + py}
                    x2={x + qx}
                    y2={y + qy}
                    stroke="#344055"
                    strokeWidth={1.7}
                  />
                );
              })}
              {p.map(([px, py], j) => (
                <text
                  key={"c" + j}
                  x={x + px}
                  y={y + py + 5}
                  textAnchor="middle"
                  fill="#344055"
                  stroke="#fff"
                  strokeWidth={6}
                  paintOrder="stroke"
                  fontSize={16}
                >
                  {j === 2 ? "O" : "C"}
                </text>
              ))}
              {[
                [0, "H", -40],
                [1, "CH₂OH", -38],
                [3, "H", -40],
                [4, "OH", -30],
                [5, "H", -30],
              ].map(([j, label, dy]) => {
                const [px, py] = p[Number(j)];
                return (
                  <g key={"a" + j}>
                    <line
                      x1={x + px}
                      y1={y + py - 10}
                      x2={x + px}
                      y2={y + py + Number(dy) + 10}
                      stroke="#344055"
                    />
                    <text
                      x={x + px}
                      y={y + py + Number(dy)}
                      textAnchor="middle"
                      fontSize={16}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
              {[
                [0, "", 40],
                [1, "H", 35],
                [3, "", 40],
                [4, "H", 40],
                [5, "OH", 40],
              ].map(([j, label, dy]) =>
                label ? (
                  <g key={"d" + j}>
                    <line
                      x1={x + p[Number(j)][0]}
                      y1={y + p[Number(j)][1] + 10}
                      x2={x + p[Number(j)][0]}
                      y2={y + p[Number(j)][1] + Number(dy) - 16}
                      stroke="#344055"
                    />
                    <text
                      x={x + p[Number(j)][0]}
                      y={y + p[Number(j)][1] + Number(dy)}
                      textAnchor="middle"
                      fontSize={16}
                    >
                      {label}
                    </text>
                  </g>
                ) : null,
              )}
              {hasRightBridge && (
                <>
                  <line
                    x1={x + 64}
                    y1={y + 8}
                    x2={x + 112}
                    y2={y + 24}
                    stroke="#344055"
                  />
                  <text
                    x={x + 121}
                    y={y + 31}
                    textAnchor="middle"
                    fontSize={18}
                  >
                    O
                  </text>
                  <line
                    x1={x + 134}
                    y1={y + 24}
                    x2={x + 213}
                    y2={y + 3}
                    stroke="#344055"
                  />
                </>
              )}
              {i === 0 &&
                (r.start ? (
                  <>
                    {active && start === 0 && end > 0 && (
                      <rect
                        x={6}
                        y={y + 4}
                        width={30}
                        height={42}
                        rx={10}
                        fill="#fff2a0"
                      />
                    )}
                    <line
                      x1={0}
                      y1={y + 24}
                      x2={10}
                      y2={y + 24}
                      stroke="#344055"
                    />
                    <text x={20} y={y + 31} textAnchor="middle" fontSize={18}>
                      O
                    </text>
                    <line
                      x1={30}
                      y1={y + 24}
                      x2={x - 64}
                      y2={y + 8}
                      stroke="#344055"
                    />
                  </>
                ) : (
                  <line x1={0} y1={y} x2={x - 64} y2={y} stroke="#344055" />
                ))}
              {!hasRightBridge && (
                <line
                  x1={x + 64}
                  y1={y}
                  x2={r.rings * 280}
                  y2={y}
                  stroke="#344055"
                />
              )}
              <text x={x} y={275} textAnchor="middle" fontSize={14}>
                Whole glucose-derived ring {i + 1}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 2 * r.rings + 1 }, (_, j) => {
          const bx =
            j === 2 * r.rings
              ? r.rings * 280 - 12
              : r.start
                ? j === 0
                  ? 4
                  : j % 2
                    ? Math.floor(j / 2) * 280 + 40
                    : (j / 2 - 1) * 280 + 200
                : j % 2 === 0
                  ? Math.floor(j / 2) * 280 + 25
                  : Math.floor(j / 2) * 280 + 200;
          return (
            <g key={"boundary" + j}>
              <line x1={bx} y1={290} x2={bx} y2={300} stroke="#4c5793" />
              <text
                x={bx}
                y={319}
                textAnchor="middle"
                fontSize={15}
                fill="#4c5793"
              >
                {j}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
export function PeptideDiagram({ b }: { b: NaturalBoard }) {
  const r = peptideCases[b.record as keyof typeof peptideCases],
    y = 85;
  const nitrogen = (v: string) =>
    v === "NH2" ? "NH₂" : v === "NH" ? "NH" : v === "N" ? "N" : "?N";
  return (
    <div
      className="natural-pan"
      tabIndex={0}
      aria-label="Your peptide structural proposal; scroll to inspect the complete chain"
    >
      <p className="natural-pan-help">
        Scroll sideways to inspect the whole structure.
      </p>
      <svg
        style={{
          width: r.units.length * 280 + 60,
          minWidth: r.units.length * 280 + 60,
        }}
        width={r.units.length * 280 + 60}
        height={220}
        viewBox={`0 0 ${r.units.length * 280 + 60} 220`}
        role="img"
        aria-label="Displayed peptide structural proposal. Each carbonyl carbon, amino nitrogen, original condensed carbon group and terminal group is shown; wrong bonds and hydrogens remain as selected."
      >
        {r.units.map((k, i) => {
          const x = i * 280,
            n = x + 40,
            core = x + 140,
            c = x + 240,
            half = k === "glycine" ? 20 : 48;
          const ntext =
            i === 0
              ? nitrogen(b.leftEnd)
              : b.aminoH === "0"
                ? "N"
                : b.aminoH === "1"
                  ? "NH"
                  : b.aminoH === "2"
                    ? "NH₂"
                    : "?N";
          return (
            <g key={i} fontSize={18} fill="#344055" stroke="#344055">
              <text x={n} y={y + 6} textAnchor="middle" stroke="none">
                {ntext}
              </text>
              <line x1={n + 24} y1={y} x2={core - half - 8} y2={y} />
              <text x={core} y={y + 6} textAnchor="middle" stroke="none">
                {aminoAcids[k].core}
              </text>
              <line x1={core + half + 8} y1={y} x2={c - 12} y2={y} />
              <text x={c} y={y + 6} textAnchor="middle" stroke="none">
                C
              </text>
              {["single", "double"].includes(b.carbonyl) && (
                <>
                  <line
                    x1={c - (b.carbonyl === "double" ? 3 : 0)}
                    y1={y + 14}
                    x2={c - (b.carbonyl === "double" ? 3 : 0)}
                    y2={y + 42}
                  />
                  {b.carbonyl === "double" && (
                    <line x1={c + 3} y1={y + 14} x2={c + 3} y2={y + 42} />
                  )}
                  <text x={c} y={y + 65} textAnchor="middle" stroke="none">
                    O
                  </text>
                </>
              )}
              {b.carbonyl === "" && (
                <text
                  x={c}
                  y={y + 64}
                  textAnchor="middle"
                  fontSize={14}
                  stroke="none"
                >
                  C–O?
                </text>
              )}
              {i < r.units.length - 1 && (
                <>
                  {b.acidOH === "retained" && (
                    <>
                      <line x1={c} y1={y - 14} x2={c} y2={y - 40} />
                      <text x={c} y={y - 50} textAnchor="middle" stroke="none">
                        OH
                      </text>
                    </>
                  )}
                  {b.link === "CN" && (
                    <line
                      data-connection="CN"
                      x1={c + 12}
                      y1={y}
                      x2={x + 296}
                      y2={y}
                    />
                  )}{" "}
                  {b.link === "CO" && (
                    <>
                      <line x1={c + 12} y1={y} x2={x + 269} y2={y} />
                      <text
                        x={x + 280}
                        y={y + 6}
                        textAnchor="middle"
                        stroke="none"
                        fill="#a96e0c"
                      >
                        O
                      </text>
                      <line x1={x + 291} y1={y} x2={x + 296} y2={y} />
                    </>
                  )}
                  {b.link === "CC" && (
                    <path
                      d={`M ${c + 8} ${y + 10} C ${c + 35} 180, ${c + 245} 180, ${c + 272} ${y + 10}`}
                      fill="none"
                      stroke="#a96e0c"
                      data-connection="CC"
                    />
                  )}
                  {(!b.link || b.link === "none") && (
                    <text
                      x={x + 280}
                      y={y + 38}
                      textAnchor="middle"
                      stroke="none"
                      fontSize={13}
                    >
                      {b.link === "none" ? "No link" : "Link?"}
                    </text>
                  )}
                </>
              )}
              {i === r.units.length - 1 &&
                ["COOH", "COO"].includes(b.rightEnd) && (
                  <>
                    <line x1={c + 12} y1={y} x2={c + 32} y2={y} />
                    <text
                      x={c + 48}
                      y={y + 6}
                      textAnchor="middle"
                      stroke="none"
                    >
                      {b.rightEnd === "COOH" ? "OH" : "O"}
                    </text>
                  </>
                )}
              {i === r.units.length - 1 && !b.rightEnd && (
                <text x={c + 48} y={y + 6} textAnchor="middle" stroke="none">
                  ?
                </text>
              )}
              <text
                x={core}
                y={207}
                textAnchor="middle"
                fontSize={14}
                stroke="none"
              >
                Original unit {i + 1}: {aminoAcids[k].name}
              </text>
            </g>
          );
        })}
      </svg>
      <p>
        Water count shown with this structure:{" "}
        <code>{b.water || "Not supplied"}</code>
      </p>
    </div>
  );
}
export function NaturalWorkbench({
  mode,
  focus = "all",
  history,
  onChange,
}: Props) {
  const b = history.at(-1)!,
    [feedback, setFeedback] = useState(""),
    [show3D, setShow3D] = useState(mode === "dna");
  function set(k: string, v: string) {
    if (b[k] === v) return;
    onChange(appendNaturalBoard(mode, history, { ...b, [k]: v }));
    setFeedback("");
  }
  function select(
    k: string,
    label: string,
    values: string[],
    labels?: string[],
  ) {
    return (
      <label className="natural-field" key={k}>
        {label}
        <select
          data-field={k}
          value={b[k]}
          disabled={history.length >= 500}
          onChange={(e) => set(k, e.target.value)}
        >
          <option value="">Choose</option>
          {values.map((v, i) => (
            <option value={v} key={v}>
              {labels?.[i] || words[v] || v}
            </option>
          ))}
        </select>
      </label>
    );
  }
  function input(k: string, label: string) {
    return (
      <label className="natural-field" key={k}>
        {label}
        <input
          data-field={k}
          inputMode="decimal"
          value={b[k]}
          disabled={history.length >= 500}
          onChange={(e) => set(k, e.target.value.slice(0, 24))}
        />
      </label>
    );
  }
  const record = (naturalRecords[mode] as Record<string, { title: string }>)[
    b.record
  ];
  const headings: Record<NaturalMode, string> = {
    peptideUnit: "Build a bracketed amino-acid repeat unit",
    core: "Find the unknown section mass",
    identify: "Identify what the polymer is made from",
    repeat: "Select one complete glucose-derived contribution",
    dna:
      focus === "unit"
        ? "Choose one whole unit"
        : focus === "count"
          ? "Count both strands"
          : focus === "types"
            ? "Distinguish types from copies"
            : focus === "shape"
              ? "Identify the overall shape"
              : "Inspect a DNA excerpt",
    sequence: "Compare order as well as composition",
    peptide: "Make an actual peptide link",
    mass: "Account for a finite open chain",
  };
  return (
    <section
      className="model natural-workbench"
      aria-label="Task model"
      data-focus={focus}
    >
      {!(mode === "dna" && focus === "unit") && (
        <>
          <p className="natural-eyebrow">
            Learn the method ·{" "}
            {["peptide", "peptideUnit", "mass", "core"].includes(mode)
              ? "Higher"
              : "Both tiers"}
          </p>
          <h2>{headings[mode]}</h2>
          <p>
            <strong>Supplied case:</strong> {record.title}
          </p>
        </>
      )}
      {mode === "peptideUnit" && (
        <>
          <p>
            Original monomer:{" "}
            <strong>
              {
                aminoAcids[
                  peptideUnitCases[b.record as keyof typeof peptideUnitCases]
                    .amino
                ].formula
              }
            </strong>
            . Build one end-omitted contribution, not a finite molecule with
            terminal groups.
          </p>
          <div className="natural-controls">
            {select(
              "nitrogen",
              "Nitrogen group inside the repeat",
              ["NH", "NH2", "N"],
              ["NH", "NH₂", "N"],
            )}
            {select(
              "core",
              "Retained carbon section",
              ["CH2", "CH2CH2", "CHCH3"],
              ["CH₂", "CH₂–CH₂", "CH(CH₃)"],
            )}
          </div>
          <PeptideRepeatDiagram b={b} />
          <div className="natural-controls">
            {select("carbonyl", "Carbonyl C–O bond", [
              "double",
              "single",
              "absent",
            ])}
            {select("acidOH", "Acid OH inside the contribution", [
              "removed",
              "retained",
            ])}
            {select(
              "continuation",
              "Bonds crossing the repeat boundaries",
              ["both", "left", "right", "neither"],
              ["Both boundaries", "Left only", "Right only", "Neither"],
            )}
            {select(
              "brackets",
              "Repeat brackets",
              ["shown", "absent"],
              ["Shown", "Absent"],
            )}
            {select("multiplier", "Multiplier outside the brackets", [
              "n",
              "1",
              "2",
            ])}
            {select("junction", "Joining bond to the next contribution", [
              "CN",
              "CO",
              "CC",
            ])}
          </div>
          <p>
            The repeat shorthand omits the chain ends. The specification’s
            formal glycine equation uses n H₂O alongside [NH–CH₂–CO]ₙ. For a
            finite open chain with both ends retained, count its actual
            junctions: n original monomers make n − 1 junctions and release n −
            1 waters. Use the form stated in the question.
          </p>
        </>
      )}
      {mode === "core" && (
        <>
          <p>
            <strong>Given whole monomer Mr:</strong>{" "}
            {coreCases[b.record as keyof typeof coreCases].wholeMr}. Given Ar: H
            1, C 12, N 14, O 16.
          </p>
          <div className="natural-controls">
            {focus === "all" && input("aminoMr", "Relative mass of NH₂")}
            {focus === "all" && input("acidMr", "Relative mass of COOH")}
            {(focus === "all" || focus === "ends") &&
              input("endsMr", "Combined relative mass of both end groups")}
            {(focus === "all" || focus === "core") &&
              input("coreMr", "Relative mass of the unknown section")}
          </div>
          <div
            className="natural-core"
            role="img"
            aria-label="Supplied structure: NH2 joined to an unidentified grey section joined to COOH. The unknown section is not identified by a molecule name."
          >
            <strong>H₂N</strong>
            <span>—</span>
            <span className="natural-unknown">Unknown section</span>
            <span>—</span>
            <strong>COOH</strong>
          </div>
          <p>
            Keep both printed end groups unchanged. Work backwards from the
            whole monomer mass. Calculating the grey section’s mass does not
            uniquely identify its atoms or connectivity.
          </p>
        </>
      )}
      {mode === "identify" && (
        <>
          <p>{identifyCases[b.record as keyof typeof identifyCases].clue}</p>
          <div className="natural-controls">
            {select("monomer", "Type of monomer", [
              "nucleotides",
              "aminoAcids",
              "glucose",
              "ethene",
              "ions",
            ])}
            {select("polymer", "Supported polymer identification", [
              "DNA",
              "Protein",
              "Starch",
              "Cellulose",
              "Glucose-based polymer",
            ])}
          </div>
          <div className="natural-given">
            <strong>Fixed polymer:</strong>{" "}
            {identifyCases[b.record as keyof typeof identifyCases].polymer}
            <p>Its complete monomer type remains your prediction above.</p>
          </div>
        </>
      )}
      {mode === "repeat" && (
        <>
          <p>
            The original glucose is the monomer. In this end-omitted crop,
            select a complete ring together with one linking oxygen. This crop
            alone does not uniquely distinguish starch from cellulose.
          </p>
          <div className="natural-controls">
            {input("start", "Starting boundary number")}
            {input("end", "Ending boundary number")}
            {select("boundary", "What your selected contribution contains", [
              "oneRingOneBridge",
              "ringOnly",
              "bridgeOnly",
              "wholeCrop",
            ])}
            {select("monomer", "Original monomer", [
              "glucose",
              "oxygen",
              "ethene",
              "nucleotide",
            ])}
          </div>
          <p>
            Boundaries run from 0 to{" "}
            {2 * repeatCases[b.record as keyof typeof repeatCases].rings}; each
            interval contains one ring or one linking O. You may choose either
            adjoining O for a complete contribution.
          </p>
          <GlucoseCrop b={b} />
          <p>
            The highlight retains your chosen boundaries. It is an end-omitted
            structural contribution, not a full isolated glucose molecule.
          </p>
        </>
      )}
      {mode === "dna" && (
        <>
          <div className="natural-controls natural-first-control">
            {(focus === "all" || focus === "unit") &&
              select(
                "unit",
                focus === "unit"
                  ? "Choose one whole unit"
                  : "One complete unit at position 1",
                ["leftNucleotide", "rightNucleotide", "rung", "baseOnly"],
              )}
            {focus === "count" &&
              input("total", "Whole nucleotides across both strands")}
            {focus === "types" &&
              input("types", "Possible nucleotide types in DNA")}
            {focus === "shape" &&
              select("shape", "Overall DNA arrangement", [
                "doubleHelix",
                "singleHelix",
                "flatLadder",
              ])}
          </div>
          {focus === "unit" && (
            <p>
              <strong>Supplied case:</strong> {record.title}. The highlight
              applies at position 1.
            </p>
          )}
          <button onClick={() => setShow3D(!show3D)}>
            {show3D ? "Switch to labelled 2D" : "Inspect your proposal in 3D"}
          </button>
          {show3D ? <NaturalScene3D board={b} /> : <DNA2D b={b} />}
          {focus === "all" && (
            <>
              <div className="natural-controls">
                {select("strands", "Number of polymer strands", [
                  "1",
                  "2",
                  "4",
                ])}
                {select("shape", "Overall shape", [
                  "doubleHelix",
                  "singleHelix",
                  "flatLadder",
                ])}
                {select("monomer", "Name of one whole strand unit", [
                  "nucleotide",
                  "glucose",
                  "aminoAcid",
                  "base",
                ])}
                {input("types", "Number of possible nucleotide types in DNA")}
                {input(
                  "total",
                  "Total nucleotides in this supplied two-strand excerpt",
                )}
              </div>
              <p>
                <strong>Provided visual key:</strong> A pairs with T; C pairs
                with G. These labels and pairing are supplied visual support,
                not additional chemistry recall requirements.
              </p>
              <div className="natural-controls">
                {[...dnaCases[b.record as keyof typeof dnaCases].source].map(
                  (_, i) =>
                    select("p" + i, `Your other strand, position ${i + 1}`, [
                      "A",
                      "T",
                      "C",
                      "G",
                    ]),
                )}
              </div>
            </>
          )}
          {focus !== "all" && (
            <p>
              The fixed excerpt has{" "}
              {dnaCases[b.record as keyof typeof dnaCases].source.length}{" "}
              positions on each of two strands. The 3D beads with their bases
              represent complete nucleotides; the labelled 2D view shows the
              same units. This task checks only your{" "}
              {focus === "unit"
                ? "whole-unit selection"
                : focus === "count"
                  ? "whole-excerpt count"
                  : focus === "types"
                    ? "possible-type count"
                    : "shape identification"}
              .
            </p>
          )}
        </>
      )}
      {mode === "sequence" && (
        <>
          <p>
            These are short polypeptide excerpts, not complete proteins.
            Preserve the original contributions; compare sequence and
            composition without guessing exact biological function.
          </p>
          <div className="natural-given">
            <p>
              <strong>Original excerpt:</strong>{" "}
              {sequenceCases[b.record as keyof typeof sequenceCases].first
                .map((k) => aminoAcids[k].name)
                .join(" → ")}
            </p>
            <p>
              <strong>Supplied target excerpt:</strong>{" "}
              {sequenceCases[b.record as keyof typeof sequenceCases].second
                .map((k) => aminoAcids[k].name)
                .join(" → ")}
            </p>
          </div>
          <div className="natural-controls">
            {sequenceCases[b.record as keyof typeof sequenceCases].second.map(
              (_, i) =>
                select(
                  "s" + i,
                  `Reconstruct target contribution ${i + 1}`,
                  ["glycine", "alanine", "beta"],
                  ["Glycine", "Alanine", "Beta-alanine"],
                ),
            )}
            {select("order", "Same order and identity of contributions?", [
              "same",
              "different",
            ])}
            {select("composition", "Same complete atom composition?", [
              "same",
              "different",
            ])}
            {select(
              "function",
              "What can these short excerpts prove about exact function?",
              ["notDetermined", "mustSame", "mustDifferent"],
            )}
          </div>
          <p>
            <strong>Your retained chain:</strong>{" "}
            {sequenceCases[b.record as keyof typeof sequenceCases].second
              .map((_, i) =>
                b["s" + i]
                  ? aminoAcids[b["s" + i] as keyof typeof aminoAcids].name
                  : "Not selected",
              )
              .join(" → ")}
          </p>
        </>
      )}
      {mode === "peptide" && (
        <>
          <p>
            <strong>Fixed starting molecules:</strong>{" "}
            {peptideCases[b.record as keyof typeof peptideCases].units
              .map((k) => aminoAcids[k].formula)
              .join(" + ")}
            . The shown chain is finite and open; both outer terminal groups
            must remain.
          </p>
          <div className="natural-controls">
            {select("link", "Atoms joined at each junction", [
              "CN",
              "CO",
              "CC",
              "none",
            ])}
            {select("acidOH", "Acid OH at each internal junction", [
              "retained",
              "removed",
            ])}
          </div>
          <PeptideDiagram b={b} />
          <div className="natural-controls">
            {select("aminoH", "Hydrogens retained on each internal amino N", [
              "0",
              "1",
              "2",
            ])}
            {select("carbonyl", "Carbonyl C–O bond retained in each unit", [
              "single",
              "double",
              "absent",
            ])}
            {select("leftEnd", "Left terminal amino group", ["NH2", "NH", "N"])}
            {select("rightEnd", "Right terminal acid group", [
              "COOH",
              "CO",
              "COO",
            ])}
            {input("water", "Water molecules released by the actual links")}
            {select("mechanism", "Type of polymerisation", [
              "condensation",
              "addition",
              "ionic",
            ])}
          </div>
          <p>
            Each displayed CH₂ or CH(CH₃) is a condensed structural group. This
            proposal does not silently repair extra H, retained OH or a wrong
            joining atom. It models the overall chemical account, not a
            laboratory procedure.
          </p>
        </>
      )}
      {mode === "mass" && (
        <>
          <div className="natural-given">
            <p>
              <strong>Fixed feed:</strong>{" "}
              {massCases[b.record as keyof typeof massCases].units
                .map((k) => `${aminoAcids[k].name} (Mr ${aminoAcids[k].mr})`)
                .join(" + ")}
            </p>
            <p>
              <strong>Shown actual joining links:</strong>{" "}
              {massCases[b.record as keyof typeof massCases].links}. All feed
              molecules enter one finite open chain.
            </p>
            <p>Given Ar: C 12, H 1, N 14, O 16. Water is H₂O, Mr 18.</p>
          </div>
          <div className="natural-controls">
            {focus === "all" && input("links", "Actual joining links")}
            {focus === "all" && input("water", "Water molecules released")}
            {focus === "all" && input("C", "Carbon atoms in the whole chain")}
            {(focus === "all" || focus === "H") &&
              input("H", "Hydrogen atoms in the whole chain")}
            {focus === "all" && input("N", "Nitrogen atoms in the whole chain")}
            {focus === "all" && input("O", "Oxygen atoms in the whole chain")}
            {(focus === "all" || focus === "Mr") &&
              input("Mr", "Relative formula mass of the whole chain")}
            {focus === "all" &&
              select("count", "What does your inventory describe?", [
                "finiteOpenChain",
                "repeatOnly",
                "feedOnly",
              ])}
          </div>
          <p>
            Use the supplied formulas:{" "}
            {massCases[b.record as keyof typeof massCases].units
              .map((k) => aminoAcids[k].formula)
              .join(" + ")}
            . Count every retained terminal atom. Repeat shorthand omits these
            ends, so its count is a different question.
          </p>
        </>
      )}
      <div className="natural-buttons">
        <button
          onClick={() => setFeedback(checkNaturalBoard(mode, b, focus).message)}
        >
          Check this proposal
        </button>
        <button
          disabled={history.length >= 500}
          onClick={() => {
            onChange(
              appendNaturalBoard(
                mode,
                history,
                initialNaturalBoard(mode, b.record),
              ),
            );
            setFeedback("");
          }}
        >
          Reset this supplied case
        </button>
      </div>
      {feedback && (
        <p role="status" className="natural-feedback">
          {feedback}
        </p>
      )}
      {b.record !== history[0].record && (
        <p className="natural-comparison-note">
          You are exploring another supplied comparison. Return to this task’s
          original case with Reset model history before answering the question
          above.
        </p>
      )}
      <details>
        <summary>Investigate another supplied comparison</summary>
        <label className="natural-field">
          Supplied comparison
          <select
            data-field="record"
            disabled={history.length >= 500}
            value={b.record}
            onChange={(e) => {
              if (e.target.value === b.record) return;
              onChange(
                appendNaturalBoard(
                  mode,
                  history,
                  initialNaturalBoard(mode, e.target.value),
                ),
              );
              setFeedback("");
            }}
          >
            {Object.entries(naturalRecords[mode]).map(([k, r]) => (
              <option key={k} value={k}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
      </details>
      <div className="natural-buttons">
        <button
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback("");
          }}
        >
          Undo model change
        </button>
        <button
          onClick={() => {
            onChange([initialNaturalBoard(mode, history[0].record)]);
            setFeedback("");
          }}
        >
          Reset model history
        </button>
      </div>
    </section>
  );
}

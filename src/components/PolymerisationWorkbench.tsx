"use client";
import { polyesterRecords } from "../lib/polyester";
import { PolyesterDisplayed, PolyesterChoices } from "./PolyesterConstruction";
import { useId, useState } from "react";
import {
  additionRecords,
  reverseRecords,
  segmentRecords,
  inventoryRecords,
  esterRecords,
  linkRecords,
  polymerisationRecords,
  sideGroups,
  type PolymerisationMode,
} from "../lib/polymerisation";
import {
  initialPolymerisationBoard,
  validPolymerisationBoard,
  polymerisationHistoryStep,
  checkPolymerisationBoard,
  boardGroups,
  proposalValences,
  polymerisationNumber,
  repeatInventory,
  type PolymerisationBoard,
} from "../lib/polymerisation-board";
import { PolymerisationDisplayed } from "./PolymerisationDisplayed";
import { PolymerisationScene3D } from "./PolymerisationScene3D";
const labels: Record<string, string> = {
  none: "Not chosen",
  onlyPolymer: "Only the addition polymer",
  water: "Water",
  hydrogenChloride: "Hydrogen chloride",
  monomers: "Separate alkene monomer",
  contributions: "The stated repeat contributions, with omitted ends",
  completeMolecule: "The exact complete molecular formula and mass",
  OH: "The acid –OH leaving fragment",
  Cl: "The provided acid-chloride Cl",
  wholeCOOH: "The whole carboxyl group",
  carbonylO: "The carbonyl oxygen",
  H: "The alcohol H bonded to oxygen",
  wholeOH: "The whole alcohol OH",
  carbon: "An alcohol carbon",
  ester: "An ester –C(=O)–O– link",
  carbonCarbon: "Only a C–C link",
  ionic: "An ionic link",
  yes: "Further alternating chain growth is possible",
  no: "These supplied reagents alone do not give an indefinitely alternating chain",
  actualLinks: "One small molecule per actual formed link",
  twoPerRepeat: "Always two small molecules per repeat",
  specifiedOpenDiagram: "This specified finite open-chain diagram",
  everyPolymer: "Every polymer, regardless of topology",
};
export function PolymerisationWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
}: {
  mode: PolymerisationMode;
  history: PolymerisationBoard[];
  onChange: (next: PolymerisationBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    b = history.at(-1) ?? initialPolymerisationBoard(mode, original),
    id = b.record,
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    locked = history.length >= 500;
  function append(next: PolymerisationBoard) {
    if (Object.keys(next).every((k) => next[k] === b[k])) return;
    if (
      !locked &&
      validPolymerisationBoard(mode, next) &&
      polymerisationHistoryStep(mode, b, next)
    ) {
      onChange([...history, next]);
      setFeedback(null);
    }
  }
  function select(key: string, label: string, options: [string, string][]) {
    return (
      <div className="polymerisation-field" key={key}>
        <label htmlFor={uid + key}>{label}</label>
        <select
          id={uid + key}
          value={b[key]}
          disabled={locked}
          onChange={(e) => append({ ...b, [key]: e.target.value })}
        >
          {options.map(([v, t]) => (
            <option value={v} key={v}>
              {t}
            </option>
          ))}
        </select>
        {b[key] && (
          <p className="polymerisation-selected">
            Selected: {options.find(([v]) => v === b[key])?.[1]}
          </p>
        )}
      </div>
    );
  }
  function choose(key: string, label: string, options: string[]) {
    return select(
      key,
      label,
      options.map((v) => [
        v,
        v === "" ? "Choose your prediction" : (labels[v] ?? v),
      ]),
    );
  }
  function field(key: string, label: string) {
    return (
      <div className="polymerisation-field" key={key}>
        <label htmlFor={uid + key}>{label}</label>
        <input
          id={uid + key}
          value={b[key]}
          inputMode="decimal"
          maxLength={24}
          disabled={locked}
          onChange={(e) => append({ ...b, [key]: e.target.value })}
        />
      </div>
    );
  }
  function notation() {
    return (
      <>
        {select("left", "Left single continuation bond", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("right", "Right single continuation bond", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("brackets", "Polymer brackets", [
          ["0", "Absent"],
          ["1", "Present"],
        ])}
        {select("countMark", "Repeat-count notation", [
          ["none", "Absent"],
          ["n", "Lower-case n, outside lower right"],
          ["N", "Upper-case N"],
          ["inside", "n inside brackets"],
        ])}
      </>
    );
  }
  let content;
  if (mode === "addition" || mode === "reverse") {
    const r = (mode === "addition" ? additionRecords : reverseRecords)[id],
      reverse = mode === "reverse";
    content = (
      <>
        <details className="polymerisation-source">
          <summary>
            {reverse ? r.polymer : r.monomer}: original structure
          </summary>
          <p className="polymerisation-original">
            <strong>Original {reverse ? "repeat" : "monomer"}:</strong>{" "}
            {reverse ? r.polymer : r.monomer}.{" "}
            {reverse
              ? "Reconstruct its separate alkene monomer."
              : "Construct one monomer-derived repeat."}
          </p>
          <PolymerisationDisplayed
            groups={r.groups}
            bond={reverse ? "1" : "2"}
            left={reverse ? "1" : "0"}
            right={reverse ? "1" : "0"}
            brackets={reverse ? "1" : "0"}
            countMark={reverse ? "n" : "none"}
            label="Original supplied structure"
            compact
          />
        </details>
        <div className="polymerisation-fields">
          {[0, 1, 2, 3].map((i) =>
            select(
              "s" + i,
              `Carbon ${i < 2 ? 1 : 2}: ${i % 2 === 0 ? "above" : "below"} side group`,
              sideGroups.map((g) => [g, g === "none" ? "Empty attachment" : g]),
            ),
          )}
          {select("bond", "Bond between the two reacting/backbone carbons", [
            ["0", "No bond"],
            ["1", "Single C–C"],
            ["2", "Double C=C"],
          ])}
          {notation()}
          {choose("product", "Overall proposed product", [
            "",
            "onlyPolymer",
            "water",
            "hydrogenChloride",
            "monomers",
          ])}
        </div>
        <h3>Your actual displayed proposal</h3>
        <PolymerisationDisplayed groups={boardGroups(b)} {...b} />
        {!reverse &&
          select(
            "cropUnits",
            "Shown 3D chain contributions (not the full polymer)",
            [
              ["2", "Two contributions"],
              ["3", "Three contributions"],
              ["4", "Four contributions"],
            ],
          )}
        <PolymerisationScene3D
          units={reverse ? 1 : Number(b.cropUnits)}
          monomer={reverse}
          board={b}
        />
        <p>
          Your unit&apos;s proposed carbon bond-order totals: C1 ={" "}
          {proposalValences(b)[0]}, C2 = {proposalValences(b)[1]}. A neutral
          carbon needs four; one outward single bond per carbon continues an
          addition-polymer repeat.
        </p>
        <p>
          {r.reason} The 3D chain is a cropped illustration, not the full
          polymer; bracket notation describes repetition separately.
        </p>
      </>
    );
  } else if (mode === "segment") {
    const r = segmentRecords[id],
      start = polymerisationNumber(b.start),
      length = polymerisationNumber(b.length),
      selected =
        start !== null &&
        Number.isInteger(start) &&
        start >= 0 &&
        start + 2 <= r.units * 2 &&
        length === 2;
    content = (
      <>
        <p>
          Original supplied chain crop: {r.structure.polymer}, {r.units}{" "}
          monomer-derived units. Select the two backbone carbons belonging to
          ONE alkene-derived unit, including their side groups.
        </p>
        <div className="polymerisation-fields">
          {field("start", "First selected backbone carbon index (0 at left)")}
          {field("length", "Number of backbone carbons in the selected unit")}
          {notation()}
        </div>
        <PolymerisationDisplayed
          groups={r.structure.groups}
          units={r.units}
          bond="1"
          left="1"
          right="1"
          brackets={b.brackets}
          countMark={b.countMark}
          start={polymerisationNumber(b.start) ?? -1}
          length={polymerisationNumber(b.length) ?? 0}
          label="Original chain with your selected repeat bracket"
        />
        {selected ? (
          <>
            {/* The selected source atoms are copied, never a corrected length. */}
            <h3>Your selected-unit continuation prediction</h3>
            <PolymerisationDisplayed
              groups={
                Number(b.start) % 2 === 1
                  ? [
                      r.structure.groups[2],
                      r.structure.groups[3],
                      r.structure.groups[0],
                      r.structure.groups[1],
                    ]
                  : r.structure.groups
              }
              bond="1"
              left={b.left}
              right={b.right}
              brackets={b.brackets}
              countMark={b.countMark}
              label="Your proposed repeat continuation notation"
            />
          </>
        ) : (
          <p>
            Your original selection is retained. A valid two-backbone-carbon
            selection is needed to show its corresponding continuation notation.
          </p>
        )}
        <p>
          Backbone indices run from 0 to {r.units * 2 - 1}. Your notation
          predicts {b.left === "1" ? "a" : "no"} left and{" "}
          {b.right === "1" ? "a" : "no"} right continuation; the original chain
          stays unchanged. {r.reason}
        </p>
      </>
    );
  } else if (mode === "inventory") {
    const r = inventoryRecords[id],
      a = repeatInventory(r.structure.groups);
    content = (
      <>
        <p>
          <strong>Original crop:</strong> {r.units} contributions from{" "}
          {r.structure.monomer}. Supplied relative mass per monomer-derived
          unit: {r.repeatMr}. Ignore omitted chain ends; calculate only the
          stated repeat contributions.
        </p>
        <div className="polymerisation-fields">
          {field("C", "Total C atoms in these repeat contributions")}
          {field("H", "Total H atoms in these repeat contributions")}
          {field("Cl", "Total Cl atoms in these repeat contributions")}
          {field("F", "Total F atoms in these repeat contributions")}
          {field("Mr", "Total relative-mass contribution")}
          {choose("product", "Other reaction product?", [
            "",
            "onlyPolymer",
            "water",
            "hydrogenChloride",
          ])}
          {choose("extent", "Scope of this count/mass claim", [
            "",
            "contributions",
            "completeMolecule",
          ])}
        </div>
        <PolymerisationDisplayed
          groups={r.structure.groups}
          label="Original monomer-derived repeat contribution"
        />
        <p>
          Original atom inventory per contribution:{" "}
          {a.map((v, i) => `${["C", "H", "Cl", "F"][i]} ${v}`).join("; ")}.
          Count backbone AND side groups. {r.reason}
        </p>
      </>
    );
  } else if (mode === "ester") {
    const r = esterRecords[id];
    content = (
      <>
        <p className="polymerisation-tier">
          Higher: supplied condensation evidence
        </p>
        <div className="polymerisation-reactants">
          <section>
            <h3>Original acid-side reagent</h3>
            <p>{r.acid}</p>
          </section>
          <section>
            <h3>Original alcohol</h3>
            <p>{r.alcohol}</p>
          </section>
        </div>
        {r.small === "hydrogenChloride" && (
          <p>
            The original extension explicitly states that Cl leaves the
            acid-chloride reagent and H leaves the alcohol. Acid-chloride recall
            is not required.
          </p>
        )}
        <div className="polymerisation-fields">
          {field(
            "acidCount",
            "Number of reactive groups per acid-side molecule",
          )}
          {field("alcoholCount", "Number of alcohol OH groups per molecule")}
          {choose("acidPart", "Proposed acid-side leaving fragment", [
            "",
            "OH",
            "Cl",
            "wholeCOOH",
            "carbonylO",
          ])}
          {choose("alcoholPart", "Proposed alcohol leaving fragment", [
            "",
            "H",
            "wholeOH",
            "carbon",
          ])}
          {choose("small", "Proposed small molecule from one link", [
            "",
            "water",
            "hydrogenChloride",
            "none",
          ])}
          {choose("link", "Proposed linkage", [
            "",
            "ester",
            "carbonCarbon",
            "ionic",
          ])}
          {choose(
            "growth",
            "Do the supplied reactive-group counts permit continued alternating growth?",
            ["", "yes", "no"],
          )}
        </div>
        <div className="polymerisation-link-proposal">
          <h3>Your proposed link result</h3>
          <p>
            Leaving pieces: {labels[b.acidPart] || "not chosen"} +{" "}
            {labels[b.alcoholPart] || "not chosen"} →{" "}
            {labels[b.small] || "not chosen"}.
          </p>
          <p>
            Link: {labels[b.link] || "not chosen"}. Growth:{" "}
            {labels[b.growth] || "not chosen"}.
          </p>
        </div>
        <p>
          The carbonyl oxygen remains in an ester link, and the alcohol oxygen
          becomes the linking O. An ester reaction is not automatically polymer
          formation. {r.reason}
        </p>
      </>
    );
  } else if (mode === "polyester") {
    const r = polyesterRecords[id];
    content = (
      <>
        <p className="polyester-original">
          Diol: {r.diol}
          <br />
          Diacid: {r.diacid}
        </p>
        <PolyesterChoices
          board={b}
          onChange={(k, v) => append({ ...b, [k]: v })}
          disabled={locked}
        />
        <PolyesterDisplayed board={b} />
        <p>
          The two alcohol oxygens are retained as ester bridges; acid OH and
          alcohol H form water at each link. Both carboxyl carbons and their C=O
          groups remain. The drawn repeat omits end groups; finite open-chain
          link counts are a separate activity.
        </p>
      </>
    );
  } else {
    const r = linkRecords[id],
      cols = Math.min(r.nodes, 8),
      height = Math.ceil(r.nodes / cols) * 85 + 45,
      x = (n: number) => 40 + (n % cols) * 64,
      y = (n: number) => 45 + Math.floor(n / cols) * 85;
    content = (
      <>
        <p className="polymerisation-tier">
          Higher: actual finite open-chain links
        </p>
        <p>
          Original diagram: {r.nodes} monomer-derived nodes; each drawn
          condensation link is reported to release ONE {r.smallMolecule}{" "}
          molecule. Connections across rows are explicitly drawn.
        </p>
        <div
          className="polymerisation-scroll"
          tabIndex={0}
          role="region"
          aria-label="Original finite condensation graph; scroll if needed"
        >
          <svg
            viewBox={`0 0 ${cols * 64 + 30} ${height}`}
            width={cols * 64 + 30}
            height={height}
            style={{ width: cols * 64 + 30, height, maxWidth: "none" }}
            role="img"
            aria-label="Original monomers and formed links"
          >
            {r.edges.map(([a, b], i) => (
              <line
                key={i}
                x1={x(a)}
                y1={y(a)}
                x2={x(b)}
                y2={y(b)}
                stroke="#475b88"
                strokeWidth="3"
              />
            ))}
            {Array.from({ length: r.nodes }, (_, i) => (
              <g key={i}>
                <circle
                  cx={x(i)}
                  cy={y(i)}
                  r="19"
                  fill="#eef0ff"
                  stroke="#4554a5"
                />
                <text x={x(i)} y={y(i) + 6} textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p>Scroll sideways if needed to inspect every node and link.</p>
        <div className="polymerisation-fields">
          {field("links", "Number of actual formed condensation links")}
          {field(
            "smallCount",
            `Number of ${r.smallMolecule} molecules released`,
          )}
          {field(
            "components",
            "Number of connected components (include unlinked monomers)",
          )}
          {choose("basis", "Small-molecule counting basis", [
            "",
            "actualLinks",
            "monomers",
            "twoPerRepeat",
          ])}
          {choose("extent", "Scope of the numerical claim", [
            "",
            "specifiedOpenDiagram",
            "everyPolymer",
          ])}
        </div>
        <p>{r.reason}</p>
      </>
    );
  }
  return (
    <section
      className="polymerisation-workbench"
      role="region"
      aria-label="Task model"
    >
      {mode !== "addition" && mode !== "reverse" && mode !== "polyester" && (
        <h3>{polymerisationRecords[mode][id].title}</h3>
      )}
      {content}
      <div className="model-controls">
        <button
          type="button"
          onClick={() => setFeedback(checkPolymerisationBoard(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            onChange([initialPolymerisationBoard(mode, original)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          className={`feedback ${feedback.correct ? "correct" : "incorrect"}`}
          role="status"
        >
          {feedback.message}
        </p>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <div className="polymerisation-field">
          <label htmlFor={uid + "record"}>Supplied comparison</label>
          <select
            id={uid + "record"}
            value={id}
            disabled={locked}
            onChange={(e) => {
              if (e.target.value !== id)
                append(initialPolymerisationBoard(mode, e.target.value));
            }}
          >
            {Object.entries(polymerisationRecords[mode]).map(([k, r]) => (
              <option key={k} value={k}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <p>
          Choosing another comparison starts its blank proposal and retains
          earlier history. Choosing the same comparison keeps your work. Reset
          returns to this task&apos;s original comparison.
        </p>
      </details>
      {locked && (
        <p role="status">
          The saved-step limit is reached; use Undo or Reset to continue.
        </p>
      )}
    </section>
  );
}

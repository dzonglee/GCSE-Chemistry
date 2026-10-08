"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState, type ReactNode } from "react";
import {
  rearrangements,
  alkeneStructures,
  crackingBalances,
  bromineReports,
  crackingProcesses,
  crackingRecords,
  hydrocarbon,
  type CrackingMode,
  type BromineColour,
} from "@/lib/cracking";
import {
  initialCrackingBoard,
  validCrackingBoard,
  crackingHistoryStep,
  checkCrackingBoard,
  structureValences,
  crackingBalanceTotals,
  type CrackingBoard,
} from "@/lib/cracking-board";
import { CrackingScene3D } from "./CrackingScene3D";
import { AlkeneDisplayed, AttachmentButtons } from "./AlkeneDisplayed";
const labels: Record<string, string> = {
  yes: "Yes",
  no: "No",
  physical: "Physical change",
  chemical: "Chemical change",
  ethene: "Ethene",
  propene: "Propene",
  butene: "Butene",
  pentene: "Pentene",
  orange: "Orange",
  colourless: "Colourless",
  alkeneSupported: "An alkene is supported within the supplied comparison",
  alkaneSupported: "An alkane is supported within the supplied comparison",
  unsaturationPresent:
    "Unsaturated molecules are present; the mixture is not fully identified",
  unreliable: "These observations do not reliably identify the unknown",
  sampleLosesColour: "The sample changes orange bromine water to colourless",
  sampleKeepsColour: "The sample retains orange bromine colour",
  blankLosesColour: "The no-sample blank also loses colour",
  knownAlkeneKeepsColour: "The known alkene reference retains orange colour",
  initialColourless: "The original reagent was already colourless",
  suppliedCandidateClasses:
    "Conclusion is within the supplied ordinary alkane/alkene comparison",
  notEveryMolecule: "Not every molecule or a unique formula is established",
  reagentChangedWithoutSample:
    "Reagent colour changed without the unknown sample",
  failedPositiveControl: "The stated known alkene reference failed",
  noOriginalBromineColour:
    "No original orange bromine colour was available to lose",
  cracking: "Cracking",
  distillation: "Fractional distillation",
  polymerisation: "Polymerisation",
  combustion: "Combustion",
  high: "High temperature",
  room: "Room temperature only",
  warm: "Warming only",
  heatAndCool: "Heating and condensation by supplied boiling ranges",
  ignition: "An ignition input under the supplied conditions",
  notSpecified: "Not specified or asked in this stage-identification question",
  catalyst: "Contact with a catalyst",
  steam: "Steam under the stated high-temperature conditions",
  none: "No chemical reaction aid is required for this physical separation",
  oxygen: "Sufficient oxygen",
  bondsRearranged: "Covalent bonds are rearranged into new smaller molecules",
  sameMolecules: "Original molecules retain their chemical identities",
  joinMolecules: "Many supplied small molecules are chemically joined",
  oxidisedProducts: "Fuel elements form oxygen-containing products",
  atomsCreated: "New carbon atoms are created",
  fuel: "Smaller hydrocarbon fuels",
  chemicalFeedstock: "Alkene starting materials for chemicals/polymers",
  collectFraction: "Collect an existing hydrocarbon fraction",
  material: "A polymer material",
  energy: "Energy transfer to the surroundings",
};
function Ledger({ before, after }: { before: number[]; after: number[] }) {
  return (
    <table className="cracking-ledger">
      <caption>Your current atom inventory</caption>
      <thead>
        <tr>
          <th>Element</th>
          <th>Before</th>
          <th>After</th>
        </tr>
      </thead>
      <tbody>
        {["C", "H"].map((x, i) => (
          <tr key={x}>
            <th scope="row">{x}</th>
            <td>{before[i]}</td>
            <td>{after[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Colour({ name, colour }: { name: string; colour: BromineColour }) {
  return (
    <div className="bromine-colour">
      <span className={"bromine-swatch " + colour} aria-hidden="true" />
      <span>
        {name}: <strong>{labels[colour]}</strong>
      </span>
    </div>
  );
}
export function CrackingWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
  instruction,
}: {
  mode: CrackingMode;
  history: CrackingBoard[];
  onChange: (v: CrackingBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = history.at(-1) ?? initialCrackingBoard(mode, original),
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    b = { ...value, ...raw },
    id = value.record,
    locked = history.length >= 500;
  function append(next: CrackingBoard) {
    if (Object.keys(next).every((k) => next[k] === value[k])) return;
    if (
      !locked &&
      validCrackingBoard(mode, next) &&
      crackingHistoryStep(mode, value, next)
    )
      onChange([...history, next]);
  }
  function update(k: string, v: string, numeric = false) {
    if (v === value[k] && !Object.hasOwn(raw, k)) return;
    setFeedback(null);
    const next = { ...value, [k]: v };
    if (!(numeric && v === "") && validCrackingBoard(mode, next)) {
      setRaw((old) =>
        Object.fromEntries(Object.entries(old).filter(([key]) => key !== k)),
      );
      append(next);
    } else setRaw((old) => ({ ...old, [k]: v }));
  }
  function field(k: string, label: string) {
    return (
      <div className="cracking-field" key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <input
          id={uid + "-" + k}
          inputMode="numeric"
          disabled={locked}
          value={b[k]}
          onChange={(e) => update(k, e.target.value, true)}
        />
      </div>
    );
  }
  function choice(k: string, label: string, options: string[]) {
    return (
      <div className="cracking-field" key={k}>
        <label htmlFor={uid + "-" + k}>{label}</label>
        <select
          id={uid + "-" + k}
          disabled={locked}
          value={b[k]}
          onChange={(e) => update(k, e.target.value)}
        >
          <option value="">Choose your prediction</option>
          {options.map((v) => (
            <option key={v} value={v}>
              {labels[v] ?? v}
            </option>
          ))}
        </select>
        {b[k] && (
          <p className="cracking-selected">Selected: {labels[b[k]] ?? b[k]}</p>
        )}
      </div>
    );
  }
  const toggle = (k: string) => update(k, value[k] === "yes" ? "no" : "yes");
  let first: ReactNode = null,
    content: ReactNode = null;
  if (mode === "rearrange") {
    const r = rearrangements[id],
      cut = Number(value.cut),
      after = value.phase === "after",
      donor = `H${cut + 2}.${cut + 2 === r.n ? 3 : 2}`;
    first = (
      <div className="cracking-field">
        <label htmlFor={uid + "-cut"}>
          Your alkane carbon count after the split
        </label>
        <select
          id={uid + "-cut"}
          value={value.cut}
          disabled={locked}
          onChange={(e) => update("cut", e.target.value)}
        >
          {Array.from({ length: r.n - 2 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1} carbon atom{i ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
    );
    content = (
      <>
        <p>{r.note}</p>
        <p className="cracking-given">
          Original feed: {hydrocarbon(r.n, 2 * r.n + 2)}. Requested alkane:{" "}
          {hydrocarbon(r.k, 2 * r.k + 2)}. The original request stays fixed when
          you try another cut.
        </p>
        <div className="model-controls">
          <button
            type="button"
            disabled={locked}
            aria-pressed={!after}
            onClick={() => update("phase", "before")}
          >
            Compare BEFORE
          </button>
          <button
            type="button"
            disabled={locked}
            aria-pressed={after}
            onClick={() => update("phase", "after")}
          >
            Compare AFTER
          </button>
        </div>
        <p className="cracking-formulas" aria-live="polite">
          {after
            ? `Your complete pair: ${hydrocarbon(cut, 2 * cut + 2)} + ${hydrocarbon(r.n - cut, 2 * (r.n - cut))}`
            : `Original complete molecule: ${hydrocarbon(r.n, 2 * r.n + 2)}`}
        </p>
        <CrackingScene3D n={r.n} cut={cut} phase={after ? "after" : "before"} />
        <p>
          The tracked gold H atom is {donor}. In this net comparison its carbon
          partner changes to C{cut}; one C–C edge is removed and another becomes
          double. C–H bonding changes too: a C–C cut alone would not produce two
          complete stable molecules.
        </p>
        <Ledger before={[r.n, 2 * r.n + 2]} after={[r.n, 2 * r.n + 2]} />
        <div className="cracking-fields">
          {field("molecules", "Your number of represented molecules AFTER")}
          {field("carbon", "Your total C atoms AFTER")}
          {field("hydrogen", "Your total H atoms AFTER")}
          {choice("change", "Type of change from original to products", [
            "physical",
            "chemical",
          ])}
        </div>
        <p>
          Changing the cut can produce a DIFFERENT atom-balanced illustrative
          pair. Check against the requested alkane in this task. Real cracking
          can give more than this represented pair; the asset is not a unique
          product-mixture prediction.
        </p>
      </>
    );
  }
  if (mode === "structure") {
    const r = alkeneStructures[id],
      double = value.double === "" ? null : Number(value.double),
      valences = structureValences(r.n, value),
      h = valences.reduce((sum, x) => sum + x.hydrogens, 0);
    first = (
      <div className="cracking-field">
        <label htmlFor={uid + "-double"}>Choose your C=C position</label>
        <select
          id={uid + "-double"}
          value={value.double}
          disabled={locked}
          onChange={(e) => update("double", e.target.value)}
        >
          <option value="">No C=C chosen</option>
          {Array.from({ length: r.n - 1 }, (_, i) => (
            <option value={i} key={i}>
              C{i + 1}–C{i + 2}
            </option>
          ))}
        </select>
      </div>
    );
    content = (
      <>
        <p>{r.note}</p>
        <p className="cracking-given">
          Original supplied scaffold: {r.n} carbon atoms. Target: {r.title}. H
          attachments currently in your proposal: {h}.
        </p>
        <AlkeneDisplayed
          n={r.n}
          double={double}
          flags={value}
          onToggle={locked ? undefined : toggle}
        />
        <AttachmentButtons
          n={r.n}
          flags={value}
          onToggle={toggle}
          disabled={locked}
        />
        <table>
          <caption>Your local carbon bond-order totals</caption>
          <thead>
            <tr>
              <th>Carbon</th>
              <th>C–C order</th>
              <th>H atoms</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {valences.map((v, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{v.carbon}</td>
                <td>{v.hydrogens}</td>
                <td>{v.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cracking-fields">
          {field("hydrogens", "Your total H atoms in the completed target")}
          {choice("name", "Provided first-four member name", [
            "ethene",
            "propene",
            "butene",
            "pentene",
          ])}
          {choice("saturated", "Is this completed C=C target saturated?", [
            "yes",
            "no",
          ])}
        </div>
        <p>
          Each neutral carbon has bond-order total four; each H has one single
          bond. A C=C contributes TWO at each carbon. The open-chain one-C=C
          alkene series is CₙH₂ₙ, starting at n = 2. A saturated ring may share
          that formula, so a formula alone does not universally prove C=C. H
          positions in this displayed drawing are conventions.
        </p>
      </>
    );
  }
  if (mode === "balance") {
    const r = crackingBalances[id],
      formula = r.kind === "formula",
      totals = crackingBalanceTotals(id, value),
      coeff = formula
        ? r.ratio
        : [value.feed || "?", value.alkane || "?", value.alkene || "?"];
    content = (
      <>
        <p>{r.note}</p>
        <div className="cracking-equation">
          <span>
            {coeff[0]} {hydrocarbon(...r.feed)}
          </span>
          <span>→</span>
          <span>
            {coeff[1]} {hydrocarbon(...r.alkane)}
          </span>
          <span>+</span>
          <span>
            {coeff[2]}{" "}
            {formula ? (
              <span>
                C<sub>{value.carbons || "?"}</sub>H
                <sub>{value.hydrogens || "?"}</sub>
              </span>
            ) : (
              hydrocarbon(...r.alkene)
            )}
          </span>
        </div>
        <div className="cracking-fields">
          {formula ? (
            <>
              {field(
                "carbons",
                "Your C subscript in ONE unknown alkene molecule",
              )}
              {field(
                "hydrogens",
                "Your H subscript in ONE unknown alkene molecule",
              )}
            </>
          ) : (
            <>
              {field("feed", "Original fuel coefficient")}
              {field("alkane", "Supplied alkane-product coefficient")}
              {field("alkene", "Supplied alkene-product coefficient")}
            </>
          )}
        </div>
        {!formula && (
          <div className="model-controls">
            {[2, 0.5].map((factor) => {
              const values = ["feed", "alkane", "alkene"].map((k) => value[k]),
                enabled =
                  !locked &&
                  !Object.keys(raw).length &&
                  values.every(
                    (x) =>
                      x !== "" &&
                      Number(x) > 0 &&
                      Number.isInteger(Number(x) * factor) &&
                      Number(x) * factor <= 1000 &&
                      Number(x) * factor >= 1,
                  );
              return (
                <button
                  type="button"
                  key={factor}
                  disabled={!enabled}
                  onClick={() => {
                    setFeedback(null);
                    append({
                      ...value,
                      ...Object.fromEntries(
                        ["feed", "alkane", "alkene"].map((k) => [
                          k,
                          String(Number(value[k]) * factor),
                        ]),
                      ),
                    });
                  }}
                >
                  {factor === 2
                    ? "Double ALL coefficients"
                    : "Halve ALL coefficients, if whole"}
                </button>
              );
            })}
          </div>
        )}
        <Ledger {...totals} />
        <p>
          {formula
            ? "The reaction amounts and known species are supplied. Allocate the remaining C AND H atoms among the stated number of identical alkene molecules. An unknown formula subscript counts atoms in ONE molecule."
            : "The original molecular formulas stay fixed. Coefficients scale ALL atoms in each molecule; positive whole-number balanced multiples are valid. The global scale buttons change the entire coefficient ratio in one exact operation."}
        </p>
        <p>
          Cracking can produce more than one alkene molecule per original
          molecule. An atom-balanced example is not a promise of one unique real
          cracking mixture.
        </p>
      </>
    );
  }
  if (mode === "bromine") {
    const r = bromineReports[id];
    content = (
      <>
        <p>{r.note}</p>
        <p className="cracking-given">
          Original sample context: {r.sampleGiven}
        </p>
        <Colour name="Original reagent" colour={r.initial} />
        <div className="bromine-reports">
          {(
            [
              { key: "showBlank", label: "No-sample blank", colour: r.blank },
              {
                key: "showPositive",
                label: "Known alkene reference",
                colour: r.positive,
              },
              { key: "showSample", label: "Original sample", colour: r.sample },
            ] as const
          ).map((report) => (
            <section className="bromine-report" key={report.key}>
              <h4>{report.label}</h4>
              {value[report.key] === "yes" ? (
                <Colour
                  name="Supplied final observation"
                  colour={report.colour}
                />
              ) : (
                <p>Original final observation not yet revealed.</p>
              )}
              <button
                type="button"
                disabled={locked || value[report.key] === "yes"}
                onClick={() => update(report.key, "yes")}
              >
                Reveal {report.label.toLowerCase()} observation
              </button>
            </section>
          ))}
        </div>
        <div className="cracking-fields">
          {choice("sampleAfter", "Sample’s original final colour", [
            "orange",
            "colourless",
          ])}
          {choice("verdict", "Conclusion within the stated evidence", [
            "alkeneSupported",
            "alkaneSupported",
            "unsaturationPresent",
            "unreliable",
          ])}
          {choice("evidence", "Specific original evidence", [
            "sampleLosesColour",
            "sampleKeepsColour",
            "blankLosesColour",
            "knownAlkeneKeepsColour",
            "initialColourless",
          ])}
          {choice("limitation", "Relevant scope or limitation", [
            "suppliedCandidateClasses",
            "notEveryMolecule",
            "reagentChangedWithoutSample",
            "failedPositiveControl",
            "noOriginalBromineColour",
          ])}
        </div>
        <p>
          In the ordinary supplied test an alkene removes orange bromine colour;
          the double bond permits addition. A mixture result supports
          unsaturated molecules being present, not identification of every
          molecule. Use the supplied observations to compare the samples and
          assess the stated evidence.
        </p>
      </>
    );
  }
  if (mode === "process") {
    const r = crackingProcesses[id];
    content = (
      <>
        <p>{r.note}</p>
        <div className="cracking-process-flow">
          <div>
            <strong>Original material</strong>
            <p>{r.before}</p>
          </div>
          <div className="cracking-proposed-route">
            <strong>Your proposed process</strong>
            <p>{labels[value.process] || "Not chosen"}</p>
            <span aria-hidden="true">↓</span>
          </div>
          <div>
            <strong>Requested result and purpose</strong>
            <p>{r.target}</p>
          </div>
        </div>
        <div className="cracking-fields">
          {choice("process", "Choose the process from the original purpose", [
            "cracking",
            "distillation",
            "polymerisation",
            "combustion",
          ])}
          {choice("heat", "General heat condition asked in this case", [
            "high",
            "room",
            "warm",
            "heatAndCool",
            "ignition",
            "notSpecified",
          ])}
          {choice("contact", "Reaction aid/contact specified in this case", [
            "catalyst",
            "steam",
            "none",
            "oxygen",
            "notSpecified",
          ])}
          {choice("change", "Physical or chemical change", [
            "physical",
            "chemical",
          ])}
          {choice("reason", "Reason involving original molecules", [
            "bondsRearranged",
            "sameMolecules",
            "joinMolecules",
            "oxidisedProducts",
            "atomsCreated",
          ])}
          {choice("use", "Requested product purpose", [
            "fuel",
            "chemicalFeedstock",
            "collectFraction",
            "material",
            "energy",
          ])}
        </div>
        <p>
          High temperature with a catalyst OR steam describes general cracking
          methods. Exact temperatures and industrial product distributions vary.
          Vaporisation alone is a physical change; cracking rearranges covalent
          bonds. Smaller hydrocarbons can supply fuel demand and alkenes can
          supply chemical/polymer manufacture; their uses are not exclusive.
        </p>
      </>
    );
  }
  return (
    <section className="model cracking-workbench" aria-label="Task model">
      {first}
      <h3>
        {instruction ||
          "Construct a proposal from the original supplied evidence."}
      </h3>
      {content}
      {Object.keys(raw).length > 0 && (
        <p role="status">
          Keep incomplete or invalid entries for correction. Other accepted
          fields can still be saved. Diagrams and inventories show your last
          accepted counts; Undo discards raw edits before changing model
          history.
        </p>
      )}
      {locked && (
        <p role="status">
          This model’s history is full. Undo or reset this model to continue;
          learning exposure and assessment history are retained.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(checkCrackingBoard(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length <= 1 && !Object.keys(raw).length}
          onClick={() => {
            setFeedback(null);
            if (Object.keys(raw).length) {
              setRaw({});
              return;
            }
            if (history.length > 1) onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => {
            setRaw({});
            setFeedback(null);
            onChange([initialCrackingBoard(mode, original)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          className={"feedback " + (feedback.correct ? "correct" : "incorrect")}
          role="status"
        >
          {feedback.message}
        </div>
      )}
      <details>
        <summary>Choose another supplied comparison</summary>
        <label htmlFor={uid + "-record"}>Supplied comparison</label>
        <select
          id={uid + "-record"}
          value={id}
          disabled={locked}
          onChange={(e) => {
            if (e.target.value === id) return;
            setRaw({});
            setFeedback(null);
            append(initialCrackingBoard(mode, e.target.value));
          }}
        >
          {Object.entries(crackingRecords[mode]).map(([key, r]) => (
            <option value={key} key={key}>
              {r.title}
            </option>
          ))}
        </select>
        <p>
          Changing comparison starts its pristine proposal and keeps earlier
          history. Selecting the same comparison retains your work. Reset
          returns to this task’s original comparison.
        </p>
      </details>
    </section>
  );
}

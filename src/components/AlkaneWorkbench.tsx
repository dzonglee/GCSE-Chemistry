"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState, type ReactNode } from "react";
import {
  alkaneKits,
  alkaneFormulae,
  alkaneGraphs,
  alkaneEquations,
  alkaneOxygen,
  alkaneEvidence,
  alkaneRecords,
  alkaneFormula,
  type AlkaneMode,
} from "../lib/alkanes";
import {
  initialAlkaneBoard,
  validAlkaneBoard,
  alkaneHistoryStep,
  checkAlkaneBoard,
  equationTotals,
  oxygenTotals,
  type AlkaneBoard,
} from "../lib/alkane-board";
import {
  AlkaneDisplayed,
  AttachmentButtons,
  SuppliedAlkaneGraph,
} from "./AlkaneDisplayed";
import { AlkaneKitScene3D } from "./AlkaneKitScene3D";
const labels: Record<string, string> = {
  yes: "Yes",
  no: "No",
  methane: "Methane",
  ethane: "Ethane",
  propane: "Propane",
  butane: "Butane",
  pentane: "Pentane (supplied)",
  hexane: "Hexane (supplied)",
  undecane: "Undecane (supplied)",
  saturated: "Saturated hydrocarbon",
  unsaturated: "Unsaturated hydrocarbon",
  notHydrocarbon: "Not a hydrocarbon",
  singleOpen: "Only C/H, no C–C multiple bond and no ring",
  multipleCarbon: "A C=C double bond is shown",
  otherElement: "Another element is present",
  ring: "All-single-bond ring, outside the open-chain formula",
  branchAllowed: "Branching is allowed in an open-chain alkane",
  noCarbon: "No carbon is present",
  CO2: "Carbon dioxide, CO₂",
  CO: "Carbon monoxide, CO",
  C: "Solid carbon, C",
  H2O: "Water, H₂O",
  H2: "Hydrogen, H₂",
  complete: "Complete combustion supported by the stated analysis",
  incomplete: "Incomplete combustion supported",
  insufficient: "Insufficient evidence for a complete-product conclusion",
  coPositive: "CO is positively identified",
  carbonPositive: "Carbon soot is positively identified",
  partialProducts: "Only two products were reported",
  allCarbonCo2: "ALL fuel carbon is accounted for in CO₂",
  flameOnly: "A flame colour is the only evidence",
  appearanceOnly: "Only colour/smell was reported",
  noSmellTest: "CO has no detectable colour or smell",
  coUnknown: "No CO result was supplied",
  othersNotExcluded: "Other carbon products were not excluded",
  statedAnalysis: "Conclusion depends on the stated complete analysis",
  notGasAnalysis: "Flame colour is not a complete gas analysis",
  oxygenCarriage: "Binds haemoglobin and reduces oxygen carriage",
  carbonDioxideOnly: "Only a greenhouse effect; no oxygen-carriage harm",
  smellWarns: "A strong smell always warns people",
  createsOxygen: "Creates oxygen for the blood",
};
function Ledger({ before, after }: { before: number[]; after: number[] }) {
  return (
    <table className="alkane-ledger">
      <caption>Your current atom inventory</caption>
      <thead>
        <tr>
          <th>Element</th>
          <th>Before</th>
          <th>After</th>
        </tr>
      </thead>
      <tbody>
        {["C", "H", "O"].map((element, i) => (
          <tr key={element}>
            <th scope="row">{element}</th>
            <td>{before[i]}</td>
            <td>{after[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export function AlkaneWorkbench({
  mode,
  history,
  onChange,
  record: original = "initial",
  instruction,
}: {
  mode: AlkaneMode;
  history: AlkaneBoard[];
  onChange: (v: AlkaneBoard[]) => void;
  record?: string;
  instruction?: string;
}) {
  const uid = useId(),
    value = history.at(-1) ?? initialAlkaneBoard(mode, original),
    [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState<{
      correct: boolean;
      message: string;
    } | null>(null),
    b = { ...value, ...raw },
    id = value.record,
    locked = history.length >= 500;
  function append(next: AlkaneBoard) {
    if (Object.keys(next).every((k) => next[k] === value[k])) return;
    if (
      !locked &&
      validAlkaneBoard(mode, next) &&
      alkaneHistoryStep(mode, value, next)
    )
      onChange([...history, next]);
  }
  function update(key: string, v: string, numeric = false) {
    setFeedback(null);
    const next = { ...value, [key]: v };
    if (!(numeric && v === "") && validAlkaneBoard(mode, next)) {
      setRaw((old) =>
        Object.fromEntries(Object.entries(old).filter(([k]) => k !== key)),
      );
      append(next);
    } else setRaw((old) => ({ ...old, [key]: v }));
  }
  function field(key: string, label: string) {
    return (
      <div className="alkane-field" key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <input
          id={uid + "-" + key}
          inputMode="numeric"
          disabled={locked}
          value={b[key]}
          onChange={(e) => update(key, e.target.value, true)}
        />
      </div>
    );
  }
  function choice(key: string, label: string, options: string[]) {
    return (
      <div className="alkane-field" key={key}>
        <label htmlFor={uid + "-" + key}>{label}</label>
        <select
          id={uid + "-" + key}
          value={b[key]}
          disabled={locked}
          onChange={(e) => update(key, e.target.value)}
        >
          <option value="">Choose your prediction</option>
          {options.map((v) => (
            <option value={v} key={v}>
              {labels[v] ?? v}
            </option>
          ))}
        </select>
        {b[key] && (
          <p className="alkane-selected">
            Selected: {labels[b[key]] ?? b[key]}
          </p>
        )}
      </div>
    );
  }
  const toggle = (key: string) =>
    update(key, value[key] === "yes" ? "no" : "yes");
  let first: ReactNode = null,
    content: ReactNode = null;
  if (mode === "kit") {
    const r = alkaneKits[id],
      attached = Array.from({ length: r.n * 4 }, (_, i) =>
        value["h" + i] === "yes" ? 1 : 0,
      ).reduce<number>((sum, x) => sum + x, 0);
    first = (
      <AttachmentButtons
        n={r.n}
        flags={value}
        onToggle={toggle}
        disabled={locked}
        to={1}
      />
    );
    content = (
      <>
        <p>{r.note}</p>
        <p className="alkane-given">
          Original carbon scaffold: {r.n} carbon atom{r.n === 1 ? "" : "s"};
          target {r.name}. Your proposal currently attaches {attached} H atoms.
        </p>
        <AlkaneKitScene3D n={r.n} flags={value} />
        <AlkaneDisplayed
          n={r.n}
          flags={value}
          onToggle={locked ? undefined : toggle}
        />
        {r.n > 1 && (
          <AttachmentButtons
            n={r.n}
            flags={value}
            onToggle={toggle}
            disabled={locked}
            from={1}
          />
        )}
        <table>
          <caption>Your carbon bond counts</caption>
          <thead>
            <tr>
              <th>Carbon</th>
              <th>C–C bonds</th>
              <th>H attached</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: r.n }, (_, c) => {
              const neighbour = Number(c > 0) + Number(c < r.n - 1),
                h = [0, 1, 2, 3].filter(
                  (slot) => value["h" + (c * 4 + slot)] === "yes",
                ).length;
              return (
                <tr key={c}>
                  <th scope="row">{c + 1}</th>
                  <td>{neighbour}</td>
                  <td>{h}</td>
                  <td>{neighbour + h}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="alkane-fields">
          {field("hydrogens", "Your total H atoms in the completed molecule")}
          {choice("name", "Name of this target scaffold", [
            "methane",
            "ethane",
            "propane",
            "butane",
            "pentane",
            "hexane",
          ])}
          {choice(
            "saturated",
            "Is the completed target a saturated hydrocarbon?",
            ["yes", "no"],
          )}
        </div>
        <p>
          A normal neutral carbon needs four covalent bonds and H needs one. The
          scaffold’s C–C bonds already use some of each carbon’s bonding
          capacity. Saturated refers to C–C bonding, not solution concentration.
          Methane has no C–C multiple bond.
        </p>
      </>
    );
  }
  if (mode === "formula") {
    const r = alkaneFormulae[id];
    content = (
      <>
        <p>{r.note}</p>
        <p className="alkane-given">
          Original given:{" "}
          {r.given === "carbon"
            ? `${r.n} carbon atoms`
            : `${2 * r.n + 2} hydrogen atoms`}{" "}
          in one open-chain alkane molecule.{" "}
          {r.n > 4
            ? `Supplied extension name: ${r.name}.`
            : "Recall the correct first-four name."}
        </p>
        <div className="alkane-symbolic">
          C<sub>n</sub>H<sub>2n + 2</sub>
        </div>
        {field("n", "Your chosen carbon count n")}
        <div className="model-controls">
          <button
            type="button"
            disabled={locked}
            onClick={() =>
              update("n", String(Math.max(1, (Number(value.n) || 1) - 1)))
            }
          >
            Decrease n
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() =>
              update("n", String(Math.min(1000, (Number(value.n) || 0) + 1)))
            }
          >
            Increase n
          </button>
        </div>
        <p className="alkane-substitution">
          Your substitution: 2 × ({value.n || "?"}) + 2
        </p>
        <div className="alkane-fields">
          {field("twice", "Your intermediate 2n")}
          {field("hydrogens", "Your total 2n + 2 hydrogen atoms")}
          {field("nextHydrogens", "Your next member’s hydrogen count")}
          {field("difference", "Next member minus this member: H difference")}
          {choice("name", "Name of the target member", [
            "methane",
            "ethane",
            "propane",
            "butane",
            "hexane",
            "undecane",
          ])}
        </div>
        <p>
          n is a count of atoms in one molecule. Neighbouring members of a
          homologous series differ by CH₂, have similar chemical properties and
          show a gradual change in physical properties. An open chain may be
          branched; this formula does not describe a carbon ring.
        </p>
      </>
    );
  }
  if (mode === "classify") {
    const r = alkaneGraphs[id];
    content = (
      <>
        <p>{r.note}</p>
        <SuppliedAlkaneGraph graph={r} />
        <p>
          Original atoms and bonds remain fixed. A double line denotes a double
          bond; a single line denotes a single bond. Use the supplied graph,
          rather than assuming a formula specifies every bond.
        </p>
        <div className="alkane-fields">
          {field("carbons", "Carbon atoms in the original graph")}
          {field("hydrogens", "Hydrogen atoms in the original graph")}
          {field("multiple", "Number of C=C double bonds shown")}
          {choice(
            "classification",
            "Hydrocarbon and saturation classification",
            ["saturated", "unsaturated", "notHydrocarbon"],
          )}
          {choice(
            "openSeries",
            "Does it belong to the open-chain CₙH₂ₙ₊₂ alkane series?",
            ["yes", "no"],
          )}
          {choice("reason", "Justification from the supplied structure", [
            "singleOpen",
            "multipleCarbon",
            "otherElement",
            "ring",
            "branchAllowed",
            "noCarbon",
          ])}
        </div>
      </>
    );
  }
  if (mode === "equation") {
    const r = alkaneEquations[id],
      totals = equationTotals(r.n, value),
      product = b.carbonProduct
        ? ({ CO2: "CO₂", CO: "CO", C: "C" } as Record<string, string>)[
            b.carbonProduct
          ]
        : "carbon product?",
      water = b.hydrogenProduct
        ? ({ H2O: "H₂O", H2: "H₂" } as Record<string, string>)[
            b.hydrogenProduct
          ]
        : "hydrogen product?";
    content = (
      <>
        <p>{r.note}</p>
        <p className="alkane-given">
          Original fuel: {alkaneFormula(r.n)}. Condition: complete combustion in
          sufficient oxygen.
        </p>
        <div className="alkane-fields">
          {choice("carbonProduct", "Choose the carbon product", [
            "CO2",
            "CO",
            "C",
          ])}
          {choice("hydrogenProduct", "Choose the hydrogen product", [
            "H2O",
            "H2",
          ])}
        </div>
        <div className="alkane-equation-display">
          <span>
            {value.fuel || "?"} {alkaneFormula(r.n)}
          </span>
          <span>+</span>
          <span>{value.oxygen || "?"} O₂</span>
          <span>→</span>
          <span>
            {value.carbon || "?"} {product}
          </span>
          <span>+</span>
          <span>
            {value.water || "?"} {water}
          </span>
        </div>
        <div className="alkane-fields">
          {field("fuel", "Fuel coefficient")}
          {field("oxygen", "O₂ coefficient")}
          {field("carbon", "Chosen carbon-product coefficient")}
          {field("water", "Chosen hydrogen-product coefficient")}
        </div>
        <Ledger {...totals} />
        <p>
          Use positive whole-number coefficients. Equal C/H/O totals are
          necessary, but the chosen products must also match COMPLETE
          combustion. Balanced multiples remain valid. A coefficient scales
          whole formulas; changing a subscript changes the substance. Combustion
          releases energy to the surroundings: breaking bonds requires energy
          and forming the product bonds releases energy.
        </p>
      </>
    );
  }
  if (mode === "oxygen") {
    const r = alkaneOxygen[id],
      totals = oxygenTotals(id, value);
    content = (
      <>
        <p>{r.note}</p>
        <p className="alkane-given">
          Original inventory: {r.fuel} × {alkaneFormula(r.n)} and {r.available}{" "}
          O₂ molecules.{" "}
          {r.condition === "complete"
            ? "Declared complete combustion."
            : "Below the complete-combustion oxygen requirement."}
        </p>
        <p>
          Stated simple balance: all original carbon is allocated among CO₂, CO
          and solid carbon; all original hydrogen is represented as water. This
          does not predict a unique real exhaust or exclude unburned fuel from
          real flames.
        </p>
        <div className="alkane-product-packets">
          <div>
            CO₂
            <br />
            <strong>{value.co2 || "?"}</strong>
            <span> molecules proposed</span>
          </div>
          <div>
            CO
            <br />
            <strong>{value.co || "?"}</strong>
            <span> molecules proposed</span>
          </div>
          <div>
            C<br />
            <strong>{value.soot || "?"}</strong>
            <span> carbon atoms in soot proposed</span>
          </div>
        </div>
        <div className="alkane-fields">
          {field("co2", "CO₂ molecules")}
          {field("co", "CO molecules")}
          {field("soot", "Carbon atoms represented as soot")}
          {field("water", "H₂O molecules")}
          {field("used", "O₂ molecules used")}
          {field("left", "O₂ molecules unused")}
        </div>
        <Ledger before={totals.before} after={totals.after} />
        <p>
          The after inventory includes unused O₂ as well as products. Carbon
          monoxide has one oxygen atom, carbon dioxide has two, and each water
          has one. Used + unused O₂ must equal the original supply. An explicit
          zero is a recorded count, not a missing field.
        </p>
      </>
    );
  }
  if (mode === "evidence") {
    const r = alkaneEvidence[id];
    content = (
      <>
        <p>{r.note}</p>
        <div className="alkane-report">
          <h4>Original supplied observations</h4>
          <ul>
            {r.observations.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="alkane-fields">
          {choice("conclusion", "Conclusion supported by this report", [
            "complete",
            "incomplete",
            "insufficient",
          ])}
          {choice("evidence", "Specific evidence actually supplied", [
            "coPositive",
            "carbonPositive",
            "partialProducts",
            "allCarbonCo2",
            "flameOnly",
            "appearanceOnly",
          ])}
          {choice("limitation", "Relevant limitation or analysis condition", [
            "noSmellTest",
            "coUnknown",
            "othersNotExcluded",
            "statedAnalysis",
            "notGasAnalysis",
          ])}
          {choice(
            "coEffect",
            "If CO is present, what is its toxic mechanism?",
            [
              "oxygenCarriage",
              "carbonDioxideOnly",
              "smellWarns",
              "createsOxygen",
            ],
          )}
        </div>
        <p>
          CO is colourless and odourless. It binds haemoglobin and reduces the
          blood’s ability to carry oxygen. Soot is carbon particulate matter and
          can harm health. Apparent colour/smell cannot establish that CO is
          absent; the activities use supplied evidence from supervised analyses.
        </p>
      </>
    );
  }
  return (
    <section className="model alkane-workbench" aria-label="Task model">
      {first}
      <h3>
        {instruction ||
          "Construct a proposal using the original supplied evidence."}
      </h3>
      {content}
      {Object.keys(raw).length > 0 && (
        <p role="status">
          Keep incomplete or invalid entries for correction. Other accepted
          whole-number predictions can still be saved. The diagram and table
          keep your last accepted counts; Undo discards raw entries before
          changing history.
        </p>
      )}
      {locked && (
        <p role="status">
          This task’s model history is full. Undo or reset this model to
          continue; learning exposure and assessment history are retained.
        </p>
      )}
      <div className="model-controls">
        <button
          type="button"
          className="button"
          onClick={() => setFeedback(checkAlkaneBoard(mode, b))}
        >
          Check model
        </button>
        <button
          type="button"
          disabled={history.length <= 1 && Object.keys(raw).length === 0}
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
            onChange([initialAlkaneBoard(mode, original)]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          className={`feedback ${feedback.correct ? "correct" : "incorrect"}`}
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
          disabled={locked}
          value={id}
          onChange={(e) => {
            if (e.target.value === id) return;
            setRaw({});
            setFeedback(null);
            append(initialAlkaneBoard(mode, e.target.value));
          }}
        >
          {Object.entries(alkaneRecords[mode]).map(([key, r]) => (
            <option value={key} key={key}>
              {r.title}
            </option>
          ))}
        </select>
        <p>
          Changing comparison begins its pristine proposal and retains earlier
          model history. Selecting the same comparison keeps your work. Reset
          returns to this task’s original comparison.
        </p>
      </details>
    </section>
  );
}

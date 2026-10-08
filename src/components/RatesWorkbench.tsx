"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  ratesRecords,
  ratesOptions,
  initialRatesBoard,
  validRatesNumber,
  ratesPrediction,
  type RatesMode,
} from "@/lib/rate-measurement";
import { RatePlotEditor } from "./RatePlotEditor";
import { RatePlot, RateDataTable } from "./RatePlot";
import { RateFlask3D } from "./RateFlask3D";
type Board = Record<string, string | number>;
const titles: Record<RatesMode, string> = {
  interval: "Choose the interval",
  mass: "Interpret the balance",
  plot: "Construct your graph",
  trend: "Read the changing slope",
  compare: "Separate speed and amount",
  evidence: "Check the measurement",
};
const fields: Record<RatesMode, string[]> = {
  interval: ["quantity", "seconds", "rate", "kind", "operation", "unit"],
  mass: ["quantity", "seconds", "rate", "cause", "closure", "claim"],
  plot: ["reason"],
  trend: ["rateTrend", "direction", "fastest", "endClaim", "rateView"],
  compare: ["aRate", "bRate", "faster", "yield", "basis"],
  evidence: ["claim", "reason"],
};
const labels: Record<string, string> = {
  quantity: "Your quantity changed",
  seconds: "Your elapsed time / s",
  rate: "Your predicted mean rate",
  kind: "Your measured quantity interpretation",
  operation: "Your calculation operation",
  unit: "Your rate unit",
  cause: "Your explanation of the balance change",
  closure: "Your identified apparatus boundary",
  claim: "Your supported measurement claim",
  reason: "Your measurement reason",
  rateTrend: "Your rate trend",
  direction: "Your recorded signal direction",
  fastest: "Your fastest stated interval",
  endClaim: "Your supported final-state claim",
  rateView: "Your way to represent rate at a moment",
  aRate: "Your A interval mean / cm³/s",
  bRate: "Your B interval mean / cm³/s",
  faster: "Your faster interval comparison",
  yield: "Your final-product comparison",
  basis: "Your comparison basis",
};
const names: Record<string, string> = {
  unset: "Choose your prediction",
  A: "A",
  B: "B",
  equal: "Equal interval mean rates",
  "change-over-elapsed-time": "Quantity change divided by elapsed time",
  "end-value-over-end-time": "Final reading divided by final time",
  "elapsed-time-over-change": "Elapsed time divided by quantity change",
  "product-formation": "Product formed over the chosen interval",
  "reactant-consumption": "Positive quantity of reactant consumed",
  "whole-apparatus-mass": "Total apparatus and contents mass",
  "gas-escaped": "Produced gas escapes",
  "gas-retained": "Produced gas is retained",
  "gas-and-solvent-loss": "Gas escape and solvent evaporation",
  "gas-and-droplet-loss": "Gas escape and liquid spray",
  "atoms-destroyed": "Atoms are destroyed",
  "porous-cotton-wool": "Porous cotton wool",
  "sealed-boundary": "Specified closed boundary",
  "open-neck": "Open neck",
  "mass-loss-tracks-escaped-gas":
    "Under these conditions, mass loss tracks escaped gas",
  "balance-loss-does-not-establish-chemical-rate":
    "Balance loss alone does not establish chemical rate",
  "constant-balance-proves-no-reaction":
    "A constant balance reading proves no reaction",
  "retain-observation-fit-supported-pattern":
    "Retain observations; fit the supported pattern",
  "erase-observation-to-improve-curve":
    "Erase an observation to make the curve fit",
  "join-every-observation-with-straight-segments":
    "Join every observation with straight segments",
  "rising-then-flat": "Signal rises, then becomes flat",
  "falling-then-flat": "Signal falls, then becomes flat",
  "rising-throughout": "Signal rises throughout this interval",
  "flat-throughout": "Signal is flat throughout this interval",
  "slowing-then-zero":
    "Rate slows, then is zero under the stated interpretation",
  "speeding-up": "Rate increases over successive equal intervals",
  "constant-nonzero": "Constant nonzero rate over this interval",
  "zero-throughout": "Zero recorded change throughout this interval",
  "earliest-interval": "Earliest stated equal-time interval",
  "latest-interval": "Latest stated equal-time interval",
  "equal-interval-means": "The stated interval means are equal",
  "no-further-net-product": "No further net product is collected",
  "not-all-reactants-must-be-used-up":
    "Not all reactants must have been used up",
  "signal-change-has-stopped": "The measured signal has stopped changing",
  "no-completion-shown": "Completion has not been shown",
  "all-reactants-must-be-gone": "All reactants must have gone",
  "tangent-at-moment": "Tangent at the requested moment",
  "whole-interval-chord": "Chord over the whole interval",
  "final-height-alone": "Final graph height alone",
  "equal-final-amounts": "Equal final collected amounts",
  "A-more-final-product": "A has more final collected product",
  "B-more-final-product": "B has more final collected product",
  "changes-over-their-elapsed-times":
    "Changes divided by their own elapsed times",
  "final-amounts-alone": "Final amounts alone",
  "times-alone": "Times alone",
};
const human = (v: string) => names[v] ?? v.replaceAll("-", " ");
export function RatesWorkbench({
  mode,
  record,
  instruction,
  history,
  onChange,
}: {
  mode: RatesMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (h: Board[]) => void;
}) {
  const id = useId(),
    b = history.at(-1) ?? initialRatesBoard(mode, record),
    key = String(b.record),
    r = (
      ratesRecords[mode] as unknown as Record<string, Record<string, unknown>>
    )[key];
  const [limitBlocked, setLimitBlocked] = useState(false);
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [plotInvalid, setPlotInvalid] = useState(false),
    [epoch, setEpoch] = useState(0),
    [phase, setPhase] = useState<"start" | "end">("start"),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false);
  function changeMany(changes: Record<string, string>) {
    const steps = [...history];
    let last = { ...b };
    for (const [field, value] of Object.entries(changes)) {
      if (last[field] === value || !validRatesNumber(value)) continue;
      if (steps.length >= 500) {
        setLimitBlocked(true);
        setFeedback(
          "Undo or reset to continue: the saved-step limit has been reached.",
        );
        setCorrect(false);
        return;
      }
      last = { ...last, [field]: value };
      steps.push(last);
    }
    setFeedback("");
    if (steps.length !== history.length) onChange(steps);
  }
  function choose(field: string, value: string) {
    if (b[field] === value) return;
    setFeedback("");
    if (history.length >= 500) {
      setCorrect(false);
      setLimitBlocked(true);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    if (field === "record") {
      setRaw({});
      setPlotInvalid(false);
      setLimitBlocked(false);
      setEpoch(epoch + 1);
      setPhase("start");
      onChange([...history, initialRatesBoard(mode, value)]);
      return;
    }
    onChange([...history, { ...b, [field]: value }]);
  }
  function control(field: string) {
    const options = ratesOptions[mode][field],
      label =
        (field === "rate" && mode === "mass"
          ? "Your observed balance-loss rate"
          : labels[field]) +
        (field === "quantity"
          ? mode === "mass"
            ? " / g"
            : r.unit === "g/s"
              ? " / g"
              : " / cm³"
          : field === "rate"
            ? mode === "mass"
              ? " / g/s"
              : r.unit === "g/s"
                ? " / g/s"
                : " / cm³/s"
            : "");
    return (
      <div
        key={field}
        className={`rates-field ${options ? "rates-choice" : "rates-number"}`}
      >
        <label htmlFor={id + "-" + field}>{label}</label>
        {options ? (
          <select
            id={id + "-" + field}
            aria-label={label}
            value={b[field]}
            onChange={(e) => choose(field, e.target.value)}
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {human(v)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id + "-" + field}
            aria-label={label}
            inputMode="decimal"
            value={raw[field] ?? String(b[field])}
            onChange={(e) => {
              const value = e.target.value;
              setRaw({ ...raw, [field]: value });
              setFeedback("");
              if (validRatesNumber(value)) changeMany({ [field]: value });
            }}
          />
        )}
        {options &&
          b[field] !== "unset" &&
          human(String(b[field])).length > 30 && (
            <span className="cells-selected-text">
              Your selection: {human(String(b[field]))}
            </span>
          )}
      </div>
    );
  }
  const invalid =
      limitBlocked ||
      history.length >= 500 ||
      plotInvalid ||
      Object.values(raw).some((v) => !validRatesNumber(v)),
    plot =
      mode === "plot"
        ? ratesRecords.plot[key as keyof typeof ratesRecords.plot]
        : null,
    trend =
      mode === "trend"
        ? ratesRecords.trend[key as keyof typeof ratesRecords.trend]
        : null,
    mass =
      mode === "mass"
        ? ratesRecords.mass[key as keyof typeof ratesRecords.mass]
        : null,
    compare =
      mode === "compare"
        ? ratesRecords.compare[key as keyof typeof ratesRecords.compare]
        : null;
  return (
    <section
      className="model task-workbench rates-workbench"
      aria-label="Task model"
    >
      <h3>{titles[mode]}</h3>
      {mode !== "plot" && control(fields[mode][0])}
      {mode === "plot" && plot && (
        <RatePlotEditor
          key={mode + key + epoch}
          data={plot.data}
          board={b}
          rawCoordinates={raw}
          onRawChange={setRaw}
          onChange={changeMany}
          onInvalid={setPlotInvalid}
        />
      )}
      <p>{instruction}</p>
      <details>
        <summary>Choose another supplied case</summary>
        <label>
          Supplied rate measurement
          <select
            aria-label="Supplied rate measurement"
            value={key}
            onChange={(e) => choose("record", e.target.value)}
          >
            {Object.entries(ratesRecords[mode]).map(([k, value]) => (
              <option key={k} value={k}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </details>
      <p className="model-context">{String(r.label)}</p>
      <div className="rates-fields">
        {(mode === "plot" ? fields.plot : fields[mode].slice(1)).map(control)}
      </div>
      {mode === "interval" && (
        <figure>
          <table>
            <caption>
              Supplied interval readings; your change and rate remain
              independent predictions.
            </caption>
            <thead>
              <tr>
                <th scope="col">Reading</th>
                <th scope="col">Time / s</th>
                <th scope="col">Quantity / {r.unit === "g/s" ? "g" : "cm³"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Beginning</th>
                <td>{String(r.startTime)}</td>
                <td>{String(r.startQuantity)}</td>
              </tr>
              <tr>
                <th scope="row">End</th>
                <td>{String(r.endTime)}</td>
                <td>{String(r.endQuantity)}</td>
              </tr>
            </tbody>
          </table>
        </figure>
      )}
      {mass && (
        <>
          <figure>
            <table>
              <caption>
                The same weighed flask and contents at both stated times.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time / s</th>
                  <th scope="col">Balance / g</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{mass.startTime}</th>
                  <td>{mass.startMass}</td>
                </tr>
                <tr>
                  <th scope="row">{mass.endTime}</th>
                  <td>{mass.endMass}</td>
                </tr>
              </tbody>
            </table>
            <figcaption>
              The balance reads the whole weighed boundary. Do not equate its
              entire reading with the mass of one reactant or the gas produced.
            </figcaption>
          </figure>
          <details>
            <summary>
              Inspect the supplied mass-loss apparatus in actual 3D
            </summary>
            <label>
              Supplied reading to inspect
              <select
                aria-label="Supplied balance phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value as "start" | "end")}
              >
                <option value="start">Beginning: {mass.startMass} g</option>
                <option value="end">End: {mass.endMass} g</option>
              </select>
            </label>
            <RateFlask3D
              state={{
                closure: mass.closure,
                phase,
                reading: phase === "start" ? mass.startMass : mass.endMass,
                loss:
                  mass.cause === "gas-retained"
                    ? "retained-gas"
                    : mass.cause === "gas-escaped"
                      ? "only-gas"
                      : "mixed-loss",
              }}
            />
          </details>
        </>
      )}
      {plot && (
        <details>
          <summary>Practice guidance for the separate curve</summary>
          <p>
            These constructed guidance bands support practice; they do not award
            examiner graph marks. Retain all original observations at their
            supplied coordinates. Keep any plateau flat and keep nonnegative
            quantities. Your drawn curve should be within {plot.tolerance}{" "}
            {plot.data.unit} of the following guidance values.
          </p>
          <ul>
            {plot.data.times.map((t, i) => (
              <li key={t}>
                {t} s: {plot.curve[i]} {plot.data.unit}
              </li>
            ))}
          </ul>
        </details>
      )}
      {trend && (
        <>
          <RatePlot
            data={trend.data}
            curve={trend.data.values}
            annotation="Supplied graph for interpretation"
          />
          <RateDataTable data={trend.data} />
        </>
      )}
      {compare && (
        <figure>
          <table>
            <caption>
              Both columns describe their stated measured intervals, not
              necessarily the same instant.
            </caption>
            <thead>
              <tr>
                <th scope="col">Experiment</th>
                <th scope="col">Change / cm³</th>
                <th scope="col">Elapsed / s</th>
                <th scope="col">Final amount / cm³</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">A</th>
                <td>{compare.aQuantity}</td>
                <td>{compare.aSeconds}</td>
                <td>{compare.aFinal}</td>
              </tr>
              <tr>
                <th scope="row">B</th>
                <td>{compare.bQuantity}</td>
                <td>{compare.bSeconds}</td>
                <td>{compare.bFinal}</td>
              </tr>
            </tbody>
          </table>
        </figure>
      )}
      {invalid && (
        <p role="alert">
          Your invalid numerical input is retained. Use a finite signed decimal
          before checking; no fraction or exponent is silently converted.
        </p>
      )}
      <div className="bench-actions">
        <button
          className="button"
          disabled={invalid}
          onClick={() => {
            const result = ratesPrediction(mode, b);
            setFeedback(result.explanation);
            setCorrect(result.correct);
          }}
        >
          Check model
        </button>
        <button
          className="button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setRaw({});
            setPlotInvalid(false);
            setLimitBlocked(false);
            setEpoch(epoch + 1);
            setFeedback("");
          }}
        >
          Undo
        </button>
        <button
          className="button"
          onClick={() => {
            onChange([initialRatesBoard(mode, record)]);
            setRaw({});
            setPlotInvalid(false);
            setLimitBlocked(false);
            setEpoch(epoch + 1);
            setPhase("start");
            setFeedback("");
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={correct ? "feedback correct" : "feedback retry"}
        >
          {feedback}
        </p>
      )}
      <details>
        <summary>About this rate measurement</summary>
        <p>
          Use changes over the actual elapsed interval, with the declared
          measured quantity and units. A tangent describes rate at a moment; a
          finite-interval mean does not. Fitted curves are distinct from
          observed points. An indirect signal needs calibration before it
          becomes a chemical amount rate. The apparatus and supplied data are a
          simulation; no examiner marks or practical certification are awarded.
        </p>
      </details>
    </section>
  );
}

"use client";
import { useWorkbenchInputDraft } from "./WorkbenchInputDraft";
import { useId, useState } from "react";
import {
  tangentRecords,
  tangentOptions,
  tangentNumbers,
  initialTangentBoard,
  validTangentNumber,
  tangentPrediction,
  tangentDiagnostic,
  type TangentMode,
  type RateCurve,
} from "@/lib/tangent-rates";
import { TangentEditor } from "./TangentEditor";
import { GradientTriangle } from "./GradientTriangle";
type Board = Record<string, string | number>;
const titles: Record<TangentMode, string> = {
  construct: "Construct a tangent",
  gradient: "Read the gradient triangle",
  moles: "Calculate amount per second",
  calibration: "Convert the calibrated signal",
  evidence: "Judge the rate evidence",
};
const labels: Record<string, string> = {
  slope: "Your signed gradient",
  dx: "Your horizontal difference / s",
  dy: "Your signed vertical difference",
  rate: "Your positive chemical rate",
  kind: "Your quantity interpretation",
  unit: "Your final rate unit",
  moles: "Your amount changed / mol",
  seconds: "Your elapsed time / s",
  conversion: "Your amount conversion",
  operation: "Your calibration operation",
  claim: "Your supported claim",
  reason: "Your reason",
};
const human = (v: string) =>
  v === "unset"
    ? "Choose your prediction"
    : v === "magnitude-times-calibration"
      ? "Magnitude of signal slope × stated calibration"
      : v.replaceAll("-", " ");
export function TangentWorkbench({
  mode,
  record,
  instruction,
  history,
  onChange,
}: {
  mode: TangentMode;
  record?: string;
  instruction: string;
  history: Board[];
  onChange: (h: Board[]) => void;
}) {
  const id = useId(),
    b = history.at(-1) ?? initialTangentBoard(mode, record),
    r = (
      tangentRecords[mode] as unknown as Record<string, Record<string, unknown>>
    )[String(b.record)];
  const [raw, setRaw] = useWorkbenchInputDraft<Record<string, string>>({}),
    [feedback, setFeedback] = useState(""),
    [correct, setCorrect] = useState(false),
    [epoch, setEpoch] = useState(0),
    [drawingInvalid, setDrawingInvalid] = useState(false),
    [blocked, setBlocked] = useState(false);
  function changeMany(changes: Record<string, string>) {
    const steps = [...history];
    let last = { ...b };
    for (const [k, v] of Object.entries(changes)) {
      if (
        last[k] === v ||
        (tangentNumbers[mode].includes(k) && !validTangentNumber(v))
      )
        continue;
      if (steps.length >= 500) {
        setBlocked(true);
        setCorrect(false);
        setFeedback(
          "Undo or reset to continue: the saved-step limit has been reached.",
        );
        return;
      }
      last = { ...last, [k]: v };
      steps.push(last);
    }
    setFeedback("");
    if (steps.length !== history.length) onChange(steps);
  }
  function clearTransient() {
    setRaw({});
    setDrawingInvalid(false);
    setFeedback("");
    setCorrect(false);
    setBlocked(false);
    setEpoch(epoch + 1);
  }
  function chooseRecord(value: string) {
    if (value === b.record) return;
    if (history.length >= 500) {
      setBlocked(true);
      setFeedback(
        "Undo or reset to continue: the saved-step limit has been reached.",
      );
      return;
    }
    clearTransient();
    onChange([...history, initialTangentBoard(mode, value)]);
  }
  function control(k: string) {
    const opts = tangentOptions[mode][k],
      label =
        labels[k] +
        (k === "dy"
          ? ` / ${r.axisUnit ?? "percentage-points"}`
          : k === "slope"
            ? ` / ${mode === "construct" ? (r.curve as RateCurve).unit : mode === "gradient" ? r.axisUnit : "percentage-points"}/s`
            : k === "rate"
              ? ` / ${mode === "moles" || mode === "calibration" ? "mol/s" : r.unit}`
              : "");
    return (
      <div
        key={k}
        className={`rates-field ${opts ? "rates-choice" : "rates-number"}`}
      >
        <label htmlFor={id + k}>{label}</label>
        {opts ? (
          <select
            id={id + k}
            aria-label={label}
            value={b[k]}
            onChange={(e) => changeMany({ [k]: e.target.value })}
          >
            {opts.map((v) => (
              <option key={v} value={v}>
                {human(v)}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id + k}
            aria-label={label}
            inputMode="decimal"
            value={raw[k] ?? String(b[k])}
            onChange={(e) => {
              const value = e.target.value;
              setRaw({ ...raw, [k]: value });
              setFeedback("");
              if (validTangentNumber(value)) changeMany({ [k]: value });
            }}
          />
        )}
      </div>
    );
  }
  const fields = [
      ...tangentNumbers[mode].filter(
        (k) => !k.startsWith("tx") && !k.startsWith("ty"),
      ),
      ...Object.keys(tangentOptions[mode]).filter((k) => k !== "record"),
    ],
    invalid =
      blocked ||
      drawingInvalid ||
      history.length >= 500 ||
      Object.values(raw).some((v) => !validTangentNumber(v));
  return (
    <section
      className="model task-workbench rates-workbench tangent-workbench"
      aria-label="Task model"
    >
      <h3 className={mode === "construct" ? "sr-only" : undefined}>
        {titles[mode]}
      </h3>
      {mode === "construct" && (
        <TangentEditor
          key={epoch}
          graph={{
            curve: r.curve as RateCurve,
            label: "Exact constructed quantity-time curve and your line",
          }}
          board={b}
          rawCoordinates={raw}
          onRawChange={setRaw}
          onChange={changeMany}
          onInvalid={setDrawingInvalid}
        />
      )}
      {mode !== "construct" && control(fields[0])}
      <p>{instruction}</p>
      <details>
        <summary>Choose another supplied case</summary>
        <label>
          Supplied case
          <select
            aria-label="Supplied tangent case"
            value={b.record}
            onChange={(e) => chooseRecord(e.target.value)}
          >
            {Object.entries(tangentRecords[mode]).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </details>
      <p>{String(r.label)}</p>
      <div className="rates-fields">
        {(mode === "construct" ? fields : fields.slice(1)).map(control)}
      </div>
      {(mode === "gradient" || mode === "calibration") && (
        <table>
          <caption>Supplied tangent coordinates</caption>
          <thead>
            <tr>
              <th scope="col">Point</th>
              <th scope="col">Time / {r.timeFactor === 60 ? "min" : "s"}</th>
              <th scope="col">Quantity / {String(r.axisUnit ?? "%")}</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1].map((i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{Number(r["x" + i])}</td>
                <td>{Number(r["y" + i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(mode === "gradient" || mode === "calibration") && (
        <GradientTriangle
          points={[
            { t: Number(r.x0), q: Number(r.y0) },
            { t: Number(r.x1), q: Number(r.y1) },
          ]}
          timeUnit={r.timeFactor === 60 ? "min" : "s"}
          quantityUnit={String(r.axisUnit ?? "%")}
        />
      )}
      {mode === "calibration" && (
        <p>
          Stated calibration: {Number(r.calibration)} mol per percentage point.
          Use the magnitude in the stated direction; do not divide percentage
          points by 100 again.
        </p>
      )}
      {Object.values(raw).some((v) => !validTangentNumber(v)) && (
        <p role="status">
          Your invalid numerical entry is retained. Enter a finite signed
          decimal to check the model.
        </p>
      )}
      <div className="bench-actions">
        <button
          type="button"
          className="button primary"
          disabled={invalid}
          onClick={() => {
            const good = tangentPrediction(mode, b);
            setCorrect(good);
            setFeedback(
              good
                ? "Your predictions match the supplied case. This checks the labelled practice guidance, not an examiner drawing mark."
                : tangentDiagnostic(mode, b),
            );
          }}
        >
          Check model
        </button>
        <button
          type="button"
          className="button"
          disabled={history.length <= 1}
          onClick={() => {
            clearTransient();
            onChange(history.slice(0, -1));
          }}
        >
          Undo
        </button>
        <button
          type="button"
          className="button"
          onClick={() => {
            clearTransient();
            onChange([initialTangentBoard(mode, String(b.record))]);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${correct ? "correct" : "retry"}`}
        >
          {feedback}
        </p>
      )}
      {mode === "construct" && (
        <details>
          <summary>Practice construction guidance</summary>
          <p>
            Use visible endpoints on both sides of the requested moment,
            separated by at least a quarter of the displayed time range. This
            practice check allows contact within 1% of the vertical axis range
            and direction within 2% of the reference slope (minimum 0.001
            axis-units/s). Predict the gradient of your own line. These guidance
            bands are for the constructed teaching case; they are not examiner
            drawing marks.
          </p>
        </details>
      )}
      <details>
        <summary>About this rate model</summary>
        <p>
          Constructed curves and supplied coordinates isolate each step. The
          graph retains your proposed line and triangle; it never silently moves
          your endpoints. A tangent estimates rate at one moment; a chord
          measures a finite-interval average. Use the chemical amount
          interpretation and an explicitly supplied calibration before assigning
          mol/s.
        </p>
      </details>
    </section>
  );
}

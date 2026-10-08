"use client";
import { useId, useState } from "react";
import {
  checkInstrumental,
  initialInstrumental,
  instrumentalChoices,
  instrumentalFields,
  instrumentalLabels,
  instrumentalRecord,
  metalKeys,
  metalNames,
  selectedMetals,
  toggleMetal,
  validInstrumentalHistory,
  type InstrumentalBoard,
  type InstrumentalMode,
} from "@/lib/instrumental";
import { CalibrationFigure, SpectrumDisplay } from "./InstrumentalFigures";
export function InstrumentalWorkbench({
  mode,
  record,
  history: retained,
  onChange,
}: {
  mode: InstrumentalMode;
  record: string;
  history?: InstrumentalBoard[];
  onChange?: (h: InstrumentalBoard[]) => void;
}) {
  const uid = useId(),
    [local, setLocal] = useState<InstrumentalBoard[]>(() => [
      initialInstrumental(mode, record),
    ]),
    [checked, setChecked] = useState<ReturnType<
      typeof checkInstrumental
    > | null>(null),
    [notice, setNotice] = useState("");
  const history = retained ?? local;
  function change(h: InstrumentalBoard[]) {
    if (onChange) onChange(h);
    else setLocal(h);
    setChecked(null);
    setNotice("");
  }
  if (!validInstrumentalHistory(mode, record, history))
    return (
      <section className="instrumental-workbench" aria-label="Task model">
        <p role="alert">
          The retained proposal cannot be read. Its original entries have been
          preserved.
        </p>
        <button
          type="button"
          className="button"
          onClick={() => change([initialInstrumental(mode, record)])}
        >
          Start a new proposal for this task
        </button>
      </section>
    );
  const b = history.at(-1)!,
    r = instrumentalRecord(mode, record)!,
    full = history.length >= 500;
  function field(f: string, value: string) {
    if (full || value === b[f]) return;
    change([...history, { ...b, [f]: value }]);
  }
  async function download() {
    const root = document.getElementById(uid),
      svg = root?.querySelector("svg[data-instrumental-svg]");
    if (!svg) {
      setNotice(
        "Switch to the aligned chart to export the actual displayed comparison.",
      );
      return;
    }
    const copy = svg.cloneNode(true) as SVGElement;
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const view = (svg as SVGSVGElement).viewBox.baseVal;
    copy.setAttribute("width", String(view.width));
    copy.setAttribute("height", String(view.height));
    copy.setAttribute("font-family", "Arial, sans-serif");
    // Export the full source viewport, including the row labels already present
    // in the SVG. The screen keeps equivalent HTML labels outside its scroller.
    if (svg.getAttribute("data-instrumental-svg") === "spectrum") {
      const height = (svg as SVGSVGElement).viewBox.baseVal.height;
      copy.setAttribute("viewBox", `0 0 380 ${height}`);
      copy.setAttribute("width", "380");
      copy.setAttribute("height", String(height));
    }
    const text = document.createElementNS("http://www.w3.org/2000/svg", "desc");
    text.textContent = `Original record ${record}. Student proposal ${mode === "spectrum" ? b.ions : mode === "calibration" ? b.concentration : ""}. Schematic teaching data; not real wavelength standards.`;
    copy.prepend(text);
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(copy)], {
        type: "image/svg+xml",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `instrumental-${record}-proposal.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Downloaded the actual supplied diagram and your separate proposal. No expected answer is included.",
    );
  }
  return (
    <section
      id={uid}
      className="instrumental-workbench"
      aria-label="Task model"
      data-instrumental-mode={mode}
      data-instrumental-record={record}
    >
      <div className="instrumental-original">
        <h3>Original evidence</h3>
        <p>{r.given}</p>
        {r.rows && (
          <dl>
            {r.rows.map((row, i) => (
              <div key={i}>
                <dt>{row.label}</dt>
                <dd>{row.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {mode === "spectrum" && (
        <fieldset className="instrumental-candidates">
          <legend>Your proposed ion set</legend>
          {metalKeys.map((k) => (
            <label key={k}>
              <input
                type="checkbox"
                disabled={full}
                checked={selectedMetals(b.ions).includes(k)}
                onChange={() => field("ions", toggleMetal(b.ions, k))}
                data-ion={k}
              />
              <span>{metalNames[k]}</span>
            </label>
          ))}
          <button
            type="button"
            aria-pressed={b.ions === "unresolved"}
            disabled={full}
            onClick={() =>
              field("ions", b.ions === "unresolved" ? "" : "unresolved")
            }
          >
            Not uniquely identified
          </button>
        </fieldset>
      )}
      {r.spectrum && <SpectrumDisplay data={r.spectrum} ions={b.ions} />}
      {r.calibration && (
        <CalibrationFigure
          data={r.calibration}
          concentration={b.concentration}
          onPoint={full ? undefined : (x) => field("concentration", x)}
        />
      )}
      <div className="instrumental-fields">
        {instrumentalFields[mode]
          .filter((f) => f !== "ions")
          .map((f) =>
            f === "concentration" ? (
              <div key={f}>
                <label htmlFor={uid + f}>Your concentration / mg/dm³</label>
                <input
                  id={uid + f}
                  data-field={f}
                  type="text"
                  inputMode="decimal"
                  value={b[f]}
                  disabled={full}
                  maxLength={16}
                  onChange={(e) => field(f, e.target.value)}
                />
                <p className="instrumental-small">
                  Tap the graph, type a value, or move the marker by 0.5 mg/dm³.
                  Entries are never clamped to an answer.
                </p>
                <div className="instrumental-actions">
                  <button
                    type="button"
                    disabled={full}
                    onClick={() =>
                      field(
                        f,
                        String(
                          (Number.isFinite(Number(b[f])) ? Number(b[f]) : 0) -
                            0.5,
                        ),
                      )
                    }
                  >
                    ← Lower by 0.5
                  </button>
                  <button
                    type="button"
                    disabled={full}
                    onClick={() =>
                      field(
                        f,
                        String(
                          (Number.isFinite(Number(b[f])) ? Number(b[f]) : 0) +
                            0.5,
                        ),
                      )
                    }
                  >
                    Higher by 0.5 →
                  </button>
                </div>
              </div>
            ) : (
              <label key={f}>
                <span>{instrumentalLabels[f]}</span>
                <select
                  data-field={f}
                  value={b[f]}
                  disabled={full}
                  onChange={(e) => field(f, e.target.value)}
                >
                  <option value="">Choose…</option>
                  {instrumentalChoices[f].map((v) => (
                    <option key={v} value={v}>
                      {f === "feature"
                        ? (
                            {
                              sensitive: "More sensitive",
                              accurate: "More accurate",
                              rapid: "Faster",
                              precision: "More precise",
                              immune: "Immune to all errors",
                            } as Record<string, string>
                          )[v]
                        : instrumentalLabels[v]}
                    </option>
                  ))}
                </select>
                {b[f] && (
                  <span className="instrumental-selection">
                    {f === "feature"
                      ? (
                          {
                            sensitive: "More sensitive",
                            accurate: "More accurate",
                            rapid: "Faster",
                            precision: "More precise",
                            immune: "Immune to all errors",
                          } as Record<string, string>
                        )[b[f]]
                      : instrumentalLabels[b[f]]}
                  </span>
                )}
              </label>
            ),
          )}
      </div>
      {mode === "path" && (
        <ol className="instrumental-path" aria-label="Your proposed sequence">
          {["sample", "light", "output"].map((f, i) => (
            <li key={f}>
              <strong>{i + 1}</strong>
              <span>{b[f] ? instrumentalLabels[b[f]] : "Not chosen"}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="instrumental-actions">
        <button
          type="button"
          data-primary="true"
          onClick={() => setChecked(checkInstrumental(mode, b))}
        >
          Check proposal
        </button>
        <button
          type="button"
          disabled={history.length < 2}
          onClick={() => change(history.slice(0, -1))}
        >
          Undo last change
        </button>
        <button
          type="button"
          onClick={() => change([initialInstrumental(mode, record)])}
        >
          Clear proposal
        </button>
        {(r.spectrum || r.calibration) && (
          <button type="button" onClick={download}>
            Download comparison SVG
          </button>
        )}
      </div>
      {full && (
        <p role="status">
          This proposal has reached its saved-history limit. Undo or explicitly
          clear this proposal to make further changes.
        </p>
      )}
      {checked && (
        <p
          role="status"
          className={`instrumental-feedback ${checked.correct ? "instrumental-correct" : "instrumental-reconsider"}`}
        >
          {checked.message}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <details>
        <summary>About this evidence model</summary>
        <p>
          The supplied original observations and standards stay fixed. This is
          an original teaching model, not a new chemical experiment. A proposal
          check is assisted practice, not fresh independent evidence.
        </p>
      </details>
    </section>
  );
}

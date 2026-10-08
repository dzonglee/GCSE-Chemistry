"use client";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { initialBoard, checkBoard } from "@/lib/workbench";
export function NobleUseWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "noble-use" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBoard(model),
    [feedback, setFeedback] = useState<ReturnType<typeof checkBoard> | null>(
      null,
    );
  const change = (key: string, value: string) => {
    if (b[key] === value) return;
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue; your saved work is retained.",
      });
      return;
    }
    onChange([...history, { ...b, [key]: value }]);
    setFeedback(null);
  };
  return (
    <section
      className="model task-workbench noble-use-workbench"
      aria-label="Task model"
    >
      <strong>{model.instruction}</strong>
      <div className="field-grid">
        <label>
          Proposed gas
          <select
            aria-label="Proposed gas"
            value={String(b.gas)}
            onChange={(e) => change("gas", e.target.value)}
          >
            <option value="helium">Helium</option>
            <option value="hydrogen">Hydrogen</option>
            <option value="argon">Argon</option>
          </select>
        </label>
        <label>
          Reason for this use
          <select
            aria-label="Reason for this use"
            value={String(b.reason)}
            onChange={(e) => change("reason", e.target.value)}
          >
            <option value="density">Less dense than air</option>
            <option value="nonflammable">Does not burn</option>
            <option value="both">Low density + no burning</option>
            <option value="inert">Chemically very unreactive</option>
          </select>
        </label>
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, b))}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <div
          role="status"
          className={`feedback ${feedback.correct ? "correct" : ""}`}
        >
          {feedback.feedback}
        </div>
      )}
      <table className="alkali-count-table">
        <caption>Supplied gas properties under ordinary conditions</caption>
        <thead>
          <tr>
            <th scope="col">Gas</th>
            <th scope="col">Density compared with air</th>
            <th scope="col">Relevant chemistry</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Helium</th>
            <td>Less dense</td>
            <td>Does not burn; very unreactive</td>
          </tr>
          <tr>
            <th scope="row">Hydrogen</th>
            <td>Less dense</td>
            <td>Flammable; reacts with oxygen</td>
          </tr>
          <tr>
            <th scope="row">Argon</th>
            <td>More dense</td>
            <td>Does not burn; very unreactive</td>
          </tr>
        </tbody>
      </table>
      <figure>
        <svg
          viewBox="20 0 150 170"
          role="img"
          aria-label={
            model.use === "balloon"
              ? "Balloon requirements: lower density gives lift; non-flammability is a separate requirement."
              : "Filament requirement: replace surrounding oxygen with an inert gas, preventing oxidation."
          }
        >
          {model.use === "balloon" ? (
            <>
              <ellipse
                cx="85"
                cy="65"
                rx="40"
                ry="52"
                fill="#e8ecff"
                stroke="#3448ce"
                strokeWidth="3"
              />
              <path d="M85 117v40" stroke="#697795" />
              <path
                d="M150 105V30m-9 12 9-12 9 12"
                fill="none"
                stroke="#3448ce"
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              <circle
                cx="85"
                cy="75"
                r="55"
                fill="#e8ecff"
                stroke="#3448ce"
                strokeWidth="3"
              />
              <path
                d="M68 145V90l10-15 10 15 10-15 8 15v55"
                fill="none"
                stroke="#a37720"
                strokeWidth="3"
              />
            </>
          )}
        </svg>
        <figcaption>
          {model.use === "balloon" ? (
            <>
              Lower density provides lift. Not burning is a separate
              requirement. Check both against the supplied properties.
            </>
          ) : (
            <>
              An argon atmosphere replaces surrounding oxygen. Chemical
              inertness protects the hot filament from oxidation.
            </>
          )}
        </figcaption>
      </figure>
    </section>
  );
}

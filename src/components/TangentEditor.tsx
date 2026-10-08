"use client";
import { useState } from "react";
import { TangentPlot, type TangentGraph } from "./TangentPlot";
import { validTangentNumber } from "@/lib/tangent-rates";
export function TangentEditor({
  graph,
  board,
  onChange,
  onInvalid,
  disabled = false,
  persistedCoordinates = false,
  rawCoordinates,
  onRawChange,
}: {
  graph: TangentGraph;
  board: Record<string, string | number>;
  onChange: (changes: Record<string, string>) => void;
  onInvalid?: (invalid: boolean) => void;
  disabled?: boolean;
  persistedCoordinates?: boolean;
  rawCoordinates?: Record<string, string>;
  onRawChange?: (coordinates: Record<string, string>) => void;
}) {
  const [selected, setSelected] = useState(0),
    [localRaw, setLocalRaw] = useState<Record<string, string>>({}),
    raw = rawCoordinates ?? localRaw,
    keys = ["tx0", "ty0", "tx1", "ty1"];
  const value = (k: string) => raw[k] ?? String(board[k]),
    invalid = (draft: Record<string, string>) =>
      keys.some((k) => !validTangentNumber(draft[k] ?? board[k]));
  function change(changes: Record<string, string>) {
    const next = { ...raw, ...changes };
    if (!persistedCoordinates) (onRawChange ?? setLocalRaw)(next);
    onInvalid?.(invalid(next));
    onChange(changes);
  }
  const line = [0, 1].map((i) => ({
    t: validTangentNumber(value("tx" + i)) ? Number(value("tx" + i)) : NaN,
    q: validTangentNumber(value("ty" + i)) ? Number(value("ty" + i)) : NaN,
  })) as [{ t: number; q: number }, { t: number; q: number }];
  function move(axis: "time" | "quantity", direction: number) {
    const k = (axis === "time" ? "tx" : "ty") + selected;
    if (!validTangentNumber(value(k))) return;
    const step =
      axis === "time"
        ? (graph.curve.end - graph.curve.start) / 100
        : graph.curve.max / 100;
    change({
      [k]: String(Number((Number(value(k)) + direction * step).toFixed(10))),
    });
  }
  return (
    <fieldset className="rate-plot-editor" disabled={disabled}>
      <legend className="sr-only">Construct your tangent and triangle</legend>
      <div className="rate-plot-fields">
        {["tx", "ty"].map((prefix) => {
          const k = prefix + selected,
            label = `Your tangent endpoint ${selected + 1} ${prefix === "tx" ? "time / s" : `quantity / ${graph.curve.unit}`}`;
          return (
            <label key={k}>
              Endpoint {selected + 1}{" "}
              {prefix === "tx" ? "time / s" : `quantity / ${graph.curve.unit}`}
              <input
                aria-label={label}
                inputMode="decimal"
                maxLength={64}
                value={value(k)}
                onChange={(e) => change({ [k]: e.target.value })}
              />
            </label>
          );
        })}
      </div>
      <label>
        Endpoint to edit
        <select
          aria-label="Tangent endpoint to edit"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          <option value={0}>Endpoint 1</option>
          <option value={1}>Endpoint 2</option>
        </select>
      </label>
      <p>
        Place the endpoints on a straight line that follows the curve at{" "}
        {graph.curve.at} s. Choose readable points far apart on that line; they
        do not need to be measured points on the curve.
      </p>
      <TangentPlot
        graph={graph}
        line={line}
        onPlace={
          disabled
            ? undefined
            : (p) =>
                change({
                  ["tx" + selected]: String(p.t),
                  ["ty" + selected]: String(p.q),
                })
        }
        onMove={disabled ? undefined : move}
      />
      <div className="bench-actions">
        {(["time", "quantity"] as const).flatMap((axis) =>
          [-1, 1].map((d) => (
            <button
              key={axis + d}
              type="button"
              className="button"
              onClick={() => move(axis, d)}
            >
              Move{" "}
              {axis === "time"
                ? d < 0
                  ? "left"
                  : "right"
                : d < 0
                  ? "down"
                  : "up"}
            </button>
          )),
        )}
      </div>
      {keys.some((k) => value(k).trim() && !validTangentNumber(value(k))) && (
        <p role="status">
          Your invalid coordinate is retained. Enter a finite signed decimal
          before that endpoint can be drawn.
        </p>
      )}
      <details>
        <summary>Review all your tangent coordinates</summary>
        <ul>
          {[0, 1].map((i) => (
            <li key={i}>
              Endpoint {i + 1}: ({value("tx" + i)} s, {value("ty" + i)}{" "}
              {graph.curve.unit})
            </li>
          ))}
        </ul>
      </details>
    </fieldset>
  );
}

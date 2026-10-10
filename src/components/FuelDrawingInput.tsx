"use client";
import { FuelPlotEditor } from "./FuelPlotEditor";
import {
  emptyFuelDrawing,
  readFuelDrawing,
  type FuelDrawingData,
} from "../lib/fuel-drawing";
export function FuelDrawingInput({
  value,
  onChange,
  drawing,
  disabled = false,
  compact = false,
  contextLabel,
  reviewOnly = false,
}: {
  value: string;
  onChange: (raw: string) => void;
  drawing: FuelDrawingData;
  disabled?: boolean;
  compact?: boolean;
  contextLabel?: string;
  reviewOnly?: boolean;
}) {
  const b = readFuelDrawing(value, drawing.data);
  if (reviewOnly)
    return (
      <section
        className="fuel-drawing-input"
        aria-label={`${contextLabel ?? "Saved response"}: graph construction`}
      >
        {b ? (
          <FuelPlotEditor
            data={drawing.data}
            board={b}
            onChange={() => {}}
            disabled
            reviewOnly
            contextLabel={contextLabel}
          />
        ) : (
          <>
            <p role="status">
              The saved graph cannot be displayed in the current format. Its
              original response is retained.
            </p>
          </>
        )}
        <details>
          <summary>Original saved response</summary>
          <pre>{value || "Left unanswered"}</pre>
        </details>
      </section>
    );
  const temperature = drawing.data.context === "temperature";
  const plotName = temperature ? "temperature graph" : "fuel plot";
  if (!b)
    return (
      <div role="status">
        <p>
          Your saved {plotName} cannot be displayed in the current format. Its
          original response is retained.
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onChange(JSON.stringify(emptyFuelDrawing(drawing.data)))
          }
        >
          Start a new {plotName}
        </button>
      </div>
    );
  return (
    <section
      className={`fuel-drawing-input${temperature ? " temperature-drawing-input" : ""}`}
      aria-label={
        contextLabel
          ? `${contextLabel}: graph construction`
          : temperature
            ? "Temperature graph construction"
            : "Independent fuel graph construction"
      }
    >
      {temperature ? (
        <table className="temperature-source-table">
          <caption
            aria-label={`${drawing.data.xName} (${drawing.data.xUnit}) to ${drawing.data.yName} (${drawing.data.yUnit})`}
          >
            {drawing.data.xName === "Mass of salt" &&
            drawing.data.yName === "Lowest temperature"
              ? "Mass / g → minimum / °C"
              : `${drawing.data.xName} / ${drawing.data.xUnit} → ${drawing.data.yName} / ${drawing.data.yUnit}`}
          </caption>
          <tbody>
            {[0, 3].map((i) => (
              <tr key={i}>
                {drawing.data.points.slice(i, i + 3).map(([x, y]) => (
                  <td key={x}>
                    {x}→{y.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : compact ? (
        <table className="temperature-source-table">
          <caption>
            {drawing.data.xName} → {drawing.data.yName}
            {drawing.data.yUnit ? ` / ${drawing.data.yUnit}` : ""}
          </caption>
          <tbody>
            {[0, 3].map((i) => (
              <tr key={i}>
                {drawing.data.points.slice(i, i + 3).map(([x, y]) => (
                  <td key={x}>
                    {x} → {y}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <p>{drawing.note}</p>
          <p>
            Construct each original point and your separate fit curve from blank
            coordinates. The original scales do not change when a proposal is
            wrong. Curves and estimates are saved for self-review; no automatic
            examiner mark is awarded.
          </p>
        </>
      )}
      <FuelPlotEditor
        contextLabel={contextLabel}
        compact={compact}
        data={drawing.data}
        board={b}
        onChange={(changes) => onChange(JSON.stringify({ ...b, ...changes }))}
        disabled={disabled}
      />
      {compact && !temperature && (
        <details>
          <summary>About these observations and your construction</summary>
          <p>{drawing.note}</p>
          <p>{drawing.data.note}</p>
          <p>
            Construct each original point and your separate fit curve from blank
            coordinates. The original scales stay fixed. Curves and estimates
            are retained for manual review after submission.
          </p>
        </details>
      )}
      {temperature && (
        <>
          <p>{drawing.note}</p>
          <p>
            Use two separate end heights for a straight best-fit line, with
            observations balanced around it. Do not join the observations dot to
            dot. Your intercept is an estimate outside the measured x values.
            Save to compare the criteria; no automatic graph mark is awarded.
          </p>
        </>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyFuelDrawing(drawing.data)))}
      >
        Clear this {plotName}
      </button>
    </section>
  );
}

"use client";
import { TangentEditor } from "./TangentEditor";
import type { TangentGraph } from "./TangentPlot";
import { emptyTangentDrawing, readTangentDrawing } from "@/lib/tangent-drawing";
export { emptyTangentDrawing, readTangentDrawing } from "@/lib/tangent-drawing";
export function TangentDrawingInput({
  graph,
  value,
  onChange,
  disabled = false,
}: {
  graph: TangentGraph;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const b = readTangentDrawing(value);
  if (!b)
    return (
      <div className="rate-drawing-input">
        <p role="status">
          Your original response is retained, but its saved tangent coordinates
          cannot be read. Start a new construction only when you choose to
          replace it.
        </p>
        <button
          type="button"
          className="button"
          disabled={disabled}
          onClick={() => onChange(JSON.stringify(emptyTangentDrawing()))}
        >
          Start a new tangent construction
        </button>
      </div>
    );
  return (
    <div className="rate-drawing-input">
      <p>
        {graph.label} This drawing is saved for self-review; no examiner mark is
        awarded.
      </p>
      <TangentEditor
        graph={graph}
        persistedCoordinates
        board={b}
        disabled={disabled}
        onChange={(changes) => onChange(JSON.stringify({ ...b, ...changes }))}
      />
      <button
        type="button"
        className="button"
        disabled={disabled}
        onClick={() => onChange(JSON.stringify(emptyTangentDrawing()))}
      >
        Clear your tangent construction
      </button>
    </div>
  );
}

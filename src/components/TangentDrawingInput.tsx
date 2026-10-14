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
  contextLabel,
}: {
  graph: TangentGraph;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  contextLabel?: string;
}) {
  const b = readTangentDrawing(value);
  const displayedGraph = contextLabel
    ? { ...graph, label: `${contextLabel}. ${graph.label}` }
    : graph;
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
        {displayedGraph.label}. This drawing is saved for self-review; no
        automatic examiner mark is awarded.
      </p>
      <TangentEditor
        graph={displayedGraph}
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

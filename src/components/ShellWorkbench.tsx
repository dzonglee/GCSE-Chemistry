"use client";
import { useMemo, useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { elements } from "@/content/elements";
import { initialBoard, checkBoard } from "@/lib/workbench";
import { ShellDiagram } from "./ShellDiagram";
import { AtomScene3D } from "./AtomScene3D";

export function ShellWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "shell-place" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const s1 = Number(board.s1),
    s2 = Number(board.s2),
    s3 = Number(board.s3),
    s4 = Number(board.s4);
  const counts = useMemo(() => [s1, s2, s3, s4], [s1, s2, s3, s4]);
  const placed = counts.reduce((a, b) => a + b, 0),
    remaining = model.atomicNumber - placed;
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    feedback: string;
  } | null>(null);
  const [spatial, setSpatial] = useState(false);
  const element = elements.find((e) => e.protons === model.atomicNumber)!;
  const change = (index: number, amount: number) => {
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        feedback: "Undo or reset to continue. Your answer is retained.",
      });
      return;
    }
    onChange([
      ...history,
      { ...board, [`s${index + 1}`]: counts[index] + amount },
    ]);
    setFeedback(null);
  };
  return (
    <section
      className="model task-workbench shell-workbench"
      data-model="shell-place"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <p className="shell-bank">
        <strong>{remaining}</strong> electrons left to place · {placed} of{" "}
        {model.atomicNumber} placed
      </p>
      <div className="shell-counters" aria-label="Place electrons in shells">
        {counts.map((count, i) => (
          <div className="particle-counter" key={i}>
            <span className="particle-token electron">{i + 1}</span>
            <strong>
              Shell {i + 1}
              {i === 0 ? " (inner)" : ""}
            </strong>
            <div className="counter-steps">
              <button
                aria-label={`Remove electron from shell ${i + 1}`}
                disabled={count === 0}
                onClick={() => change(i, -1)}
              >
                −
              </button>
              <output aria-label={`Shell ${i + 1} electron count`}>
                {count}
              </output>
              <button
                aria-label={`Add electron to shell ${i + 1}`}
                disabled={remaining === 0 || count >= [2, 8, 8, 2][i]}
                onClick={() => change(i, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => setFeedback(checkBoard(model, board))}
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
        <p
          className={`feedback ${feedback.correct ? "correct" : ""}`}
          role="status"
        >
          {feedback.feedback}
        </p>
      )}
      <div className="shell-current">
        <strong>Your shell counts</strong>
        <span>{counts.join(" · ")}</span>
        <small>Inner → outer. Empty guide rings are not occupied shells.</small>
      </div>
      <button
        className="text-button shell-view-switch"
        aria-pressed={spatial}
        onClick={() => setSpatial(!spatial)}
      >
        {spatial ? "Use the exam diagram" : "Inspect your arrangement in 3D"}
      </button>
      {spatial ? (
        <>
          <p className="model-caption">
            This is your construction, including any misplaced electrons. A
            completed neutral {element.name.toLowerCase()} atom needs{" "}
            {model.atomicNumber} electrons.
          </p>
          <AtomScene3D
            protons={model.atomicNumber}
            neutrons={element.mass - model.atomicNumber}
            electrons={placed}
            shellCounts={counts}
            fallback={<ShellDiagram counts={counts} guides />}
          />
        </>
      ) : (
        <ShellDiagram
          counts={counts}
          guides
          label="Your constructed electron arrangement"
        />
      )}
      <details className="model-boundaries">
        <summary>About this shell model</summary>
        <p>
          For ground-state neutral atoms of the first 20 elements, fill the
          lowest available levels first using the pattern 2, 8, 8, then up to 2
          in the fourth shell. The third shell can hold more than eight
          electrons in a fuller model; eight here is not a universal shell
          capacity. This lesson does not use subshell notation.
        </p>
        <p>
          Empty rings are placement guides. Dot positions are schematic, not
          electron trajectories. This construction fixes the element and its
          required electron total; adding or removing a placed dot moves it to
          or from the bank.
        </p>
      </details>
    </section>
  );
}

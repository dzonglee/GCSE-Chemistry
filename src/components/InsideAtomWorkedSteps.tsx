"use client";

import type { WorkedCursor } from "@/lib/worked-cursor";
import {
  insideAtomWorkedExamples,
  workedAtomShells,
  workedAtomSummary,
  type AtomWorkedStep,
} from "@/lib/inside-atom-worked";
import { WorkedStepsFrame } from "./WorkedStepsFrame";

function AtomWorkedDiagram({ step }: { step: AtomWorkedStep }) {
  const { protons, neutrons, electrons } = step.counts;
  const summary = workedAtomSummary(step.counts);
  const shells = workedAtomShells(electrons);
  return (
    <figure
      className="t17-worked-atom-figure"
      data-worked-counts={`${protons},${neutrons},${electrons}`}
      aria-label={`Worked construction: ${protons} protons, ${neutrons} neutrons, ${electrons} electrons. Mass number ${summary.massNumber}; relative charge ${summary.charge > 0 ? "+" : ""}${summary.charge}.`}
    >
      <figcaption>{step.stateLabel}</figcaption>
      <div className="t17-worked-atom-map">
        <div className="t17-worked-atom-nucleus">
          <strong>Nucleus</strong>
          <p>
            {protons} protons · {neutrons} neutrons
          </p>
          <div className="t17-worked-particles" aria-hidden="true">
            {Array.from({ length: protons }, (_, index) => (
              <span
                key={`p-${index}`}
                className="t17-worked-particle t17-worked-proton"
                data-particle="proton"
              >
                p+
              </span>
            ))}
            {Array.from({ length: neutrons }, (_, index) => (
              <span
                key={`n-${index}`}
                className="t17-worked-particle t17-worked-neutron"
                data-particle="neutron"
                data-added={step.added === "neutron" && index === neutrons - 1}
              >
                n0
              </span>
            ))}
          </div>
        </div>
        <div className="t17-worked-atom-shells">
          <strong>Electron shells</strong>
          <p>{electrons} electrons outside the nucleus</p>
          {shells.length === 0 ? (
            <p className="t17-worked-empty-shell">No electrons placed yet.</p>
          ) : (
            shells.map((count, shell) => (
              <div className="t17-worked-shell" key={shell}>
                <span>
                  Shell {shell + 1}: {count}
                </span>
                <div className="t17-worked-particles" aria-hidden="true">
                  {Array.from({ length: count }, (_, index) => (
                    <span
                      key={index}
                      className="t17-worked-particle t17-worked-electron"
                      data-particle="electron"
                      data-added={step.added === "electrons"}
                    >
                      e−
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <p className="t17-worked-atom-ledger">
        <span>Z = {protons}</span>
        <span>
          A = {protons} + {neutrons} = {summary.massNumber}
        </span>
        <span>
          Charge = +{protons} − {electrons} = {summary.charge > 0 ? "+" : ""}
          {summary.charge}
        </span>
      </p>
      {step.added && (
        <p className="t17-worked-added-note">
          Double outlines mark{" "}
          {step.added === "neutron"
            ? "the new neutron"
            : "the six new electrons"}
          .
        </p>
      )}
      <p className="t17-worked-model-note">
        p+ = proton, n0 = neutron, e− = electron. The nucleus and shells are
        schematic, not to scale; shell groupings do not show literal electron
        paths.
      </p>
    </figure>
  );
}

export function InsideAtomWorkedSteps({
  cursor,
  onCursorChange,
  onPractice,
}: {
  cursor: WorkedCursor;
  onCursorChange: (cursor: WorkedCursor) => void;
  onPractice: () => void;
}) {
  const example = insideAtomWorkedExamples[cursor.example];
  const step = example.steps[cursor.step];
  return (
    <WorkedStepsFrame
      id="inside-atom-worked"
      title="Inside an atom: worked steps"
      examples={[
        { id: "main", label: insideAtomWorkedExamples.main.label },
        { id: "difficult", label: insideAtomWorkedExamples.difficult.label },
      ]}
      cursor={cursor}
      onCursorChange={onCursorChange}
      onPractice={onPractice}
      steps={example.steps}
    >
      <p className="t17-worked-model-note">
        This worked construction changes with the step. Your separate model and
        its undo history are retained.
      </p>
      <AtomWorkedDiagram step={step} />
      {cursor.step === 0 && (
        <button
          className="button t17-worked-atom-action"
          type="button"
          onClick={() => onCursorChange({ ...cursor, step: 1 })}
        >
          {example.actionLabel}
        </button>
      )}
    </WorkedStepsFrame>
  );
}

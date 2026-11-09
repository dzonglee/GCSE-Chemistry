"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { WorkedCursor } from "@/lib/worked-cursor";
import styles from "./WorkedStepsFrame.module.css";

export interface WorkedStep {
  title: string;
  before: string;
  action: string;
  after: string;
  why: string;
}

function StepExplanation({ step }: { step: WorkedStep }) {
  return (
    <dl className={styles.explanation}>
      {(["before", "action", "after", "why"] as const).map((part) => (
        <div key={part}>
          <dt>{part[0].toUpperCase() + part.slice(1)}</dt>
          <dd>{step[part]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WorkedStepsFrame({
  id,
  title,
  examples,
  cursor,
  onCursorChange,
  onPractice,
  steps,
  children,
}: {
  id: string;
  title: string;
  examples: readonly { id: WorkedCursor["example"]; label: string }[];
  cursor: WorkedCursor;
  onCursorChange: (cursor: WorkedCursor) => void;
  onPractice: () => void;
  steps: readonly WorkedStep[];
  children: ReactNode;
}) {
  const currentHeading = useRef<HTMLHeadingElement>(null);
  const previousPosition = useRef(`${cursor.example}:${cursor.step}`);
  const position = `${cursor.example}:${cursor.step}`;
  const step = steps[cursor.step];
  useEffect(() => {
    if (previousPosition.current !== position) currentHeading.current?.focus();
    previousPosition.current = position;
  }, [position]);

  return (
    <section
      id={id}
      className={styles.frame}
      aria-labelledby={`${id}-title`}
      data-worked-example={cursor.example}
      data-worked-step={cursor.step}
    >
      <header className={styles.header}>
        <h3 id={`${id}-title`} tabIndex={-1}>
          {title}
        </h3>
        <p>Follow the change, then explain why it works.</p>
      </header>
      <label className={styles.selector}>
        Worked example
        <select
          value={cursor.example}
          onChange={(event) => {
            const example = examples.find(
              (item) => item.id === event.target.value,
            );
            if (example)
              onCursorChange({ version: 1, example: example.id, step: 0 });
          }}
        >
          {examples.map((example) => (
            <option key={example.id} value={example.id}>
              {example.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.current} data-current-worked-step>
        <p className={styles.position}>
          Step {cursor.step + 1} of {steps.length}
        </p>
        <h4 ref={currentHeading} tabIndex={-1}>
          {step.title}
        </h4>
        <StepExplanation step={step} />
        <div className={styles.visual}>{children}</div>
      </div>
      <div
        className={styles.controls}
        role="group"
        aria-label="Worked step navigation"
      >
        <button
          type="button"
          className="button"
          disabled={cursor.step === 0}
          onClick={() => onCursorChange({ ...cursor, step: cursor.step - 1 })}
        >
          Back
        </button>
        <button
          type="button"
          className="button primary"
          disabled={cursor.step === steps.length - 1}
          onClick={() => onCursorChange({ ...cursor, step: cursor.step + 1 })}
        >
          Next
        </button>
        <button type="button" className="text-button" onClick={onPractice}>
          Go straight to practice
        </button>
      </div>
      <details key={position} className={styles.history}>
        <summary>Previous steps ({cursor.step})</summary>
        {cursor.step === 0 ? (
          <p>No earlier steps in this example.</p>
        ) : (
          <ol>
            {steps.slice(0, cursor.step).map((previous, index) => (
              <li key={index}>
                <h5>{previous.title}</h5>
                <StepExplanation step={previous} />
              </li>
            ))}
          </ol>
        )}
      </details>
      <p className={styles.note}>
        This is a worked example. Your own answers and model work stay separate.
      </p>
    </section>
  );
}

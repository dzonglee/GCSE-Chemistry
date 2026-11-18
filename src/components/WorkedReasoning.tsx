"use client";

import { useState } from "react";

export function WorkedReasoning({ steps }: { steps: readonly string[] }) {
  const [step, setStep] = useState(-1);

  return (
    <>
      <div aria-live="polite">
        {step >= 0 && (
          <p>
            <strong>
              Step {step + 1} of {steps.length}.{" "}
            </strong>
            {steps[step]}
          </p>
        )}
      </div>
      <div className="button-row">
        {step >= 0 && (
          <button
            className="button"
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Previous step
          </button>
        )}
        <button
          className="button"
          type="button"
          disabled={step === steps.length - 1}
          onClick={() => setStep(step + 1)}
        >
          {step < 0 ? "Show first step" : "Next step"}
        </button>
      </div>
    </>
  );
}

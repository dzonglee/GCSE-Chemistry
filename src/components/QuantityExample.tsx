"use client";

import { useState } from "react";
import type { QuantityWorkedExample } from "@/content/quantity-examples";
import { readNumber } from "@/lib/marking";

export function QuantityExample({
  example,
}: {
  example: QuantityWorkedExample;
}) {
  const [step, setStep] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  return (
    <details className="sample-explanation quantity-example">
      <summary>Try a worked calculation</summary>
      <p>{example.given}</p>
      <p>Try a prediction, or start the steps. This example is unscored.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = readNumber(answer);
          setMessage(
            value === null
              ? "Enter a number."
              : value === example.result
                ? "Correct. Step through the method to check your reasoning."
                : "Revisit the setup. " + example.reasoning[0],
          );
        }}
      >
        <label>
          {example.prompt}{" "}
          <span className="quantity-example-input">
            <input
              inputMode="decimal"
              value={answer}
              aria-label={
                example.unit
                  ? `${example.prompt} (${example.unit})`
                  : example.prompt
              }
              onChange={(event) => {
                setAnswer(event.target.value);
                setMessage("");
              }}
            />{" "}
            {example.unit}
          </span>
        </label>
        <button className="button" type="submit">
          Check prediction
        </button>
      </form>
      <div role="status">{message && <p>{message}</p>}</div>
      <div aria-live="polite">
        {step >= 0 && (
          <p>
            <strong>
              Step {step + 1} of {example.reasoning.length}.{" "}
            </strong>
            {example.reasoning[step]}
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
          disabled={step === example.reasoning.length - 1}
          onClick={() => setStep(step + 1)}
        >
          {step < 0 ? "Show first step" : "Next step"}
        </button>
      </div>
    </details>
  );
}

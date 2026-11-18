"use client";

import { useState } from "react";
import type { QuantityWorkedExample } from "@/content/quantity-examples";
import { readNumber } from "@/lib/marking";
import { WorkedReasoning } from "./WorkedReasoning";

export function QuantityExample({
  example,
}: {
  example: QuantityWorkedExample;
}) {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  return (
    <details className="sample-explanation worked-example quantity-example">
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
      <WorkedReasoning steps={example.reasoning} />
    </details>
  );
}

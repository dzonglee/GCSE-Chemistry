"use client";
import { useId, useState } from "react";
import type { GasMode } from "@/lib/gas-tests-cases";
import { gasRecord } from "@/lib/gas-tests-domain";
function ObservationSketch({
  record,
  stage,
}: {
  record: string;
  stage: number;
}) {
  const splint =
      (record === "pop-record" && stage < 2) || record === "relight-record",
    paper = record === "bleach-record",
    liquid = record === "cloudy-record" || record === "shaken-limewater";
  const flame =
      record === "pop-record" || (record === "relight-record" && stage > 0),
    cloudy =
      liquid && (record === "shaken-limewater" ? stage === 2 : stage > 0);
  return (
    <div
      className="gas-source-sketch"
      role="region"
      tabIndex={0}
      aria-label="Original observation sketch; pan horizontally to inspect"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          event.currentTarget.scrollBy({
            left: event.key === "ArrowRight" ? 80 : -80,
          });
        }
      }}
    >
      <svg
        width="290"
        height="170"
        viewBox="0 0 290 170"
        role="img"
        aria-label="Schematic of the selected supplied observation stage; the text below gives the complete record."
      >
        <rect width="290" height="170" rx="10" fill="#fff" />
        <path
          d="M105 45 V125 Q105 148 125 148 Q145 148 145 125 V45"
          fill="#e8eef6"
          fillOpacity=".5"
          stroke="#61768e"
          strokeWidth="2"
        />
        {splint && (
          <>
            <line
              x1="125"
              y1={record === "pop-record" ? 45 : 90}
              x2={record === "pop-record" ? 185 : 125}
              y2="20"
              stroke="#a37c4b"
              strokeWidth="5"
            />
            <circle
              cx="125"
              cy={record === "pop-record" ? 45 : 90}
              r="4"
              fill="#d45b25"
            />
            {flame && (
              <path
                d={
                  record === "pop-record"
                    ? "M119 45 Q117 32 125 24 Q133 32 131 45 Z"
                    : "M119 90 Q117 75 125 67 Q133 75 131 90 Z"
                }
                fill="#efb333"
              />
            )}
            {record === "pop-record" && stage === 1 && (
              <text x="175" y="95" fontSize="14" fill="#25324a">
                Pop (heard)
              </text>
            )}
          </>
        )}
        {paper && (
          <>
            <rect
              x="119"
              y="60"
              width="13"
              height="43"
              stroke="#273955"
              fill={
                stage === 0 ? "#4266bc" : stage === 1 ? "#ce434c" : "#ffffff"
              }
            />
            <text x="165" y="88" fontSize="14" fill="#25324a">
              {stage === 0 ? "Blue" : stage === 1 ? "Red" : "White / bleached"}
            </text>
          </>
        )}
        {record === "pop-record" && stage === 2 && (
          <text x="165" y="95" fontSize="14">
            Sound ended
          </text>
        )}
        {liquid && (
          <>
            <path
              d="M108 98 H142 V125 Q142 145 125 145 Q108 145 108 125 Z"
              fill={cloudy ? "#fff" : "#c4e4ec"}
              stroke="#829fb3"
            />
            {cloudy &&
              [0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={i}
                  cx={114 + (i % 3) * 11}
                  cy={109 + Math.floor(i / 3) * 16}
                  r="2"
                  fill="#8da1b5"
                />
              ))}
            <text x="165" y="90" fontSize="14" fill="#25324a">
              {cloudy ? "Cloudy liquid" : "Clear liquid"}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
/** Projects original givens only. The answer and feedback fields are never displayed here. */
export function GasGiven({ mode, record }: { mode: GasMode; record: string }) {
  const uid = useId(),
    [stage, setStage] = useState(0),
    source = gasRecord(mode, record);
  if (!source) return <p role="alert">Original gas-test record unavailable.</p>;
  return (
    <section className="gas-original" aria-label="Original experiment record">
      <h3>
        {mode === "wording"
          ? "Supplied answer to review"
          : mode === "procedure"
            ? "Original setup"
            : "Recorded school experiment"}
      </h3>
      <p>{source.given}</p>
      {source.frames && (
        <>
          <div
            className="gas-stage-buttons"
            role="group"
            aria-label="Read the recorded sequence"
          >
            {source.frames.map((frame, index) => (
              <button
                key={frame.stage}
                type="button"
                aria-pressed={index === stage}
                aria-controls={uid}
                onClick={() => setStage(index)}
              >
                {index + 1}. {frame.stage}
              </button>
            ))}
          </div>
          <div id={uid} className="gas-recorded-frame" aria-live="polite">
            <ObservationSketch record={record} stage={stage} />
            <strong>{source.frames[stage].stage}</strong>
            <p>{source.frames[stage].text}</p>
          </div>
          <details>
            <summary>Read all three recorded stages</summary>
            <ol>
              {source.frames.map((frame) => (
                <li key={frame.stage}>
                  <strong>{frame.stage}: </strong>
                  {frame.text}
                </li>
              ))}
            </ol>
          </details>
          <p className="gas-caption">
            These are supplied observations. Reading the next stage does not run
            a new experiment.
          </p>
        </>
      )}
      {source.pair && (
        <div className="gas-comparison">
          {source.pair.map((item) => (
            <article key={item.label}>
              <h4>Record {item.label}</h4>
              <p>
                <strong>Method: </strong>
                {item.method}
              </p>
              <p>
                <strong>Observed result: </strong>
                {item.result}
              </p>
            </article>
          ))}
        </div>
      )}
      {source.suppliedAnswer && (
        <>
          <blockquote>{source.suppliedAnswer}</blockquote>
          <p className="gas-caption">
            This is the original answer under review, not your correction.
          </p>
        </>
      )}
    </section>
  );
}

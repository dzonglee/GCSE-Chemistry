"use client";
import { useId, useState } from "react";
import { processCases } from "../lib/pathways";
import {
  initialPathwayBoard,
  checkPathwayBoard,
  pathwayNumber,
  type PathwayBoard,
} from "../lib/pathway-board";
const streamNames: Record<string, string> = {
  ethene: "Unreacted ethene",
  ethanol: "Ethanol",
  water: "Water",
  allFeeds: "All feed molecules",
  noGas: "No unreacted ethene stream",
  ethanolAndWater: "Ethanol and water",
  ethanolOnly: "Ethanol only",
  waterOnly: "Water only",
  none: "No liquid",
  reactor: "Return to reactor",
  liquidProduct: "Collect as liquid product",
  discard: "Discard",
  noStream: "No unreacted gas stream",
};
export function PathwayProcess({
  board: b,
  onChange: setB,
}: {
  board: PathwayBoard;
  onChange: (next: PathwayBoard) => void;
}) {
  const id = useId(),
    [result, setResult] = useState<{ key: string; message: string } | null>(
      null,
    ),
    r = processCases[b.record];
  const feedback = result?.key === JSON.stringify(b) ? result.message : "";
  function setFeedback(message: string) {
    setResult(message ? { key: JSON.stringify(b), message } : null);
  }
  function set(k: string, v: string) {
    if (k === "record" && v === b.record) return;
    setB(k === "record" ? initialPathwayBoard("process", v) : { ...b, [k]: v });
    setFeedback("");
  }
  function field(k: string, label: string, options: [string, string][]) {
    return (
      <div key={k}>
        <label htmlFor={id + k}>{label}</label>
        <select
          id={id + k}
          data-field={k}
          value={b[k]}
          onChange={(e) => set(k, e.target.value)}
        >
          {options.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </div>
    );
  }
  function number(k: string, label: string) {
    return (
      <div key={k}>
        <label htmlFor={id + k}>{label}</label>
        <input
          id={id + k}
          data-field={k}
          type="text"
          inputMode="decimal"
          value={b[k]}
          onChange={(e) => set(k, e.target.value)}
        />
      </div>
    );
  }
  const shown = (k: string) =>
    pathwayNumber(b[k]) === null ? "Not supplied" : b[k];
  return (
    <section className="addition">
      <span>Learn the method · Process evidence</span>
      <h2>What leaves the cooler?</h2>
      <p>
        Ethene + steam → ethanol. Each reported addition uses one ethene and one
        water molecule.
      </p>
      <p>
        <strong>Supplied feed:</strong> {r.ethene} ethene and {r.steam} water
        molecules. <strong>Reported reactions:</strong> {r.reacted}.
      </p>
      <p>
        These small integer counts are a schematic accounting model. Use the
        reported reaction count; the feed does not prove complete conversion.
      </p>
      <div className="process-fields">
        {number("etheneLeft", "Unreacted ethene molecules")}
        {number("waterLeft", "Unreacted water molecules")}
        {number("ethanol", "Ethanol molecules produced")}
        {number("maximum", "Maximum additions allowed by the feed")}
      </div>
      <div className="process-flow">
        <div>
          <strong>Reactor</strong>
          <p>
            {r.ethene} ethene + {r.steam} water
          </p>
          <p>{r.reacted} reported additions</p>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Cooler</strong>
          <p>
            Your unreacted feed: {shown("etheneLeft")} ethene,{" "}
            {shown("waterLeft")} water
          </p>
          <p>Your ethanol: {shown("ethanol")}</p>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <strong>Separated streams</strong>
          <p>Gas: {streamNames[b.gas] || "Not selected"}</p>
          <p>Liquid: {streamNames[b.liquid] || "Not selected"}</p>
          <p>Gas destination: {streamNames[b.destination] || "Not selected"}</p>
        </div>
      </div>
      <p>
        The supplied cooling model collects ethanol and water as liquid;
        unreacted ethene remains gaseous. Identify whether there is an ethene
        stream to return.
      </p>
      <div className="process-fields">
        {field("gas", "Cooled gas stream", [
          ["", "Choose"],
          ["ethene", "Unreacted ethene"],
          ["ethanol", "Ethanol"],
          ["water", "Water"],
          ["allFeeds", "All feed molecules"],
          ["noGas", "No unreacted ethene stream"],
        ])}
        {field("liquid", "Collected liquid", [
          ["", "Choose"],
          ["ethanolAndWater", "Ethanol and water"],
          ["ethanolOnly", "Ethanol only"],
          ["waterOnly", "Water only"],
          ["none", "No liquid"],
        ])}
        {field("destination", "Unreacted gas destination", [
          ["", "Choose"],
          ["reactor", "Return to reactor"],
          ["liquidProduct", "Collect as liquid product"],
          ["discard", "Discard"],
          ["noStream", "No unreacted gas stream"],
        ])}
        {field("cooling", "What kind of change occurs in the cooler?", [
          ["", "Choose"],
          ["physicalChange", "Physical condensation"],
          ["condensationReaction", "Chemical condensation reaction"],
          ["additionReaction", "Another addition reaction"],
        ])}
        {field("waterOrigin", "Origin of collected water", [
          ["", "Choose"],
          ["unreactedFeed", "Unused steam from the feed"],
          ["newByproduct", "New reaction by-product"],
          ["carbonDioxide", "Carbon dioxide changes into water"],
        ])}
      </div>
      <button
        type="button"
        onClick={() => setFeedback(checkPathwayBoard("process", b).message)}
      >
        Check the stream accounting
      </button>
      {feedback && <p role="status">{feedback}</p>}
      <details>
        <summary>Compare another reported conversion</summary>
        {field(
          "record",
          "Supplied process record",
          Object.entries(processCases).map(([v, r]) => [v, r.title]),
        )}
      </details>
    </section>
  );
}

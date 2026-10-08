"use client";
import { useId, useRef, useState } from "react";
import { profileHeight } from "@/lib/reaction-profiles";
export type ProfileDiagram = {
  reactant: number;
  product: number;
  peak: number;
  max?: number;
  min?: number;
  step?: number;
  wide?: boolean;
};
export function ReactionProfile({
  profile,
  alternative,
  activationArrow,
  overallArrow,
  constructed = false,
  downloadable = false,
}: {
  profile: ProfileDiagram;
  alternative?: ProfileDiagram;
  activationArrow?: string;
  overallArrow?: string;
  constructed?: boolean;
  downloadable?: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null),
    [error, setError] = useState("");
  const id = useId(),
    min = profile.min ?? 0,
    max =
      profile.max ??
      Math.max(
        120,
        Math.ceil(
          (Math.max(profile.reactant, profile.product, profile.peak) + 20) / 20,
        ) * 20,
      ),
    step = profile.step ?? 20;
  const y = (v: number) => 370 - ((v - min) / (max - min)) * 315,
    x = (t: number) => 85 + t * 380;
  const path = (p: ProfileDiagram) =>
    Array.from({ length: 101 }, (_, i) => {
      const t = i / 100;
      return (i ? "L" : "M") + x(t) + "," + y(profileHeight(t, p));
    }).join(" ");
  const ticks = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step,
  );
  const named: Record<string, [number, number]> = {
    "reactants-peak": [profile.reactant, profile.peak],
    "products-peak": [profile.product, profile.peak],
    "zero-peak": [0, profile.peak],
    "reactants-products": [profile.reactant, profile.product],
    "products-reactants": [profile.product, profile.reactant],
    "peak-products": [profile.peak, profile.product],
  };
  const arrow = (
    name: string | undefined,
    at: number,
    colour: string,
    label: string,
  ) => {
    const span = name && named[name];
    return span ? (
      <g>
        <line
          x1={at}
          y1={y(span[0])}
          x2={at}
          y2={y(span[1])}
          stroke={colour}
          strokeWidth="3"
          markerEnd={`url(#${id}-arrow)`}
        />
        <title>{label + ": from " + span[0] + " to " + span[1] + " kJ."}</title>
      </g>
    ) : null;
  };
  return (
    <figure className="reaction-profile-figure">
      <svg
        ref={svg}
        xmlns="http://www.w3.org/2000/svg"
        data-reactant={profile.reactant}
        data-product={profile.product}
        data-peak={profile.peak}
        data-alternative-reactant={alternative?.reactant}
        data-alternative-product={alternative?.product}
        data-alternative-peak={alternative?.peak}
        data-activation-arrow={activationArrow ?? "unset"}
        data-overall-arrow={overallArrow ?? "unset"}
        data-axis="reaction-progress"
        viewBox="0 0 500 435"
        role="img"
        aria-labelledby={id + "-title"}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id={id + "-title"}>
          {(constructed ? "Your constructed" : "Supplied") +
            " schematic profile: reactants " +
            profile.reactant +
            " kJ, products " +
            profile.product +
            " kJ, proposed peak " +
            profile.peak +
            " kJ. Horizontal axis is progress of reaction, not time." +
            (alternative
              ? " Your alternative has reactants " +
                alternative.reactant +
                " kJ, products " +
                alternative.product +
                " kJ and proposed peak " +
                alternative.peak +
                " kJ."
              : "")}
        </title>
        <defs>
          <marker
            id={id + "-arrow"}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#39435a" />
          </marker>
        </defs>
        <text x="85" y="28" fontSize="30">
          Energy / kJ
        </text>
        {Array.from(
          { length: Math.floor((max - min) / 5) - 1 },
          (_, i) => min + (i + 1) * 5,
        )
          .filter((v) => !ticks.includes(v))
          .map((v) => (
            <line
              key={"minor-" + v}
              x1="85"
              y1={y(v)}
              x2="465"
              y2={y(v)}
              stroke="#edf0f6"
              strokeWidth=".7"
            />
          ))}
        {ticks.map((v) => (
          <g key={v}>
            <line x1="85" y1={y(v)} x2="465" y2={y(v)} stroke="#e2e7f0" />
            <text x="75" y={y(v) + 8} textAnchor="end" fontSize="30">
              {v}
            </text>
          </g>
        ))}
        <line x1="85" y1="55" x2="85" y2="370" stroke="#39435a" />
        <line x1="85" y1="370" x2="465" y2="370" stroke="#39435a" />
        <path d={path(profile)} stroke="#3b44c9" strokeWidth="4" fill="none" />
        {alternative && (
          <path
            d={path(alternative)}
            stroke="#b06418"
            strokeWidth="4"
            strokeDasharray="8 5"
            fill="none"
          />
        )}
        <line
          x1="85"
          y1={y(profile.reactant)}
          x2="275"
          y2={y(profile.reactant)}
          stroke="#8490a8"
          strokeDasharray="5 4"
        />
        <line
          x1="275"
          y1={y(profile.product)}
          x2="465"
          y2={y(profile.product)}
          stroke="#8490a8"
          strokeDasharray="5 4"
        />
        {arrow(activationArrow, 275, "#8f3aba", "Your activation arrow")}
        {arrow(overallArrow, 310, "#b4751c", "Your overall-change arrow")}
        <text
          x="87"
          y={y(profile.reactant) - 12}
          fontSize="30"
          stroke="white"
          strokeWidth="4"
          paintOrder="stroke"
        >
          Reactants
        </text>
        <text
          x="465"
          y={y(profile.product) - 12}
          textAnchor="end"
          fontSize="30"
          stroke="white"
          strokeWidth="4"
          paintOrder="stroke"
        >
          Products
        </text>
        <text x="275" y="420" fontSize="30" textAnchor="middle">
          Progress of reaction
        </text>
      </svg>
      <figcaption>
        {constructed ? "Your proposed curve." : "Supplied curve."} Relative
        energy for the stated reaction amount. Progress is not elapsed time.
        {activationArrow && activationArrow !== "unset"
          ? " Purple: your activation arrow."
          : ""}
        {overallArrow && overallArrow !== "unset"
          ? " Gold: your overall-change arrow."
          : ""}
        {alternative
          ? " Blue solid: original. Gold dashed: your alternative."
          : ""}
      </figcaption>
      <details>
        <summary>Equivalent energy levels</summary>
        <table className="data-table">
          <caption>
            {constructed ? "Your construction" : "Supplied profile"} / kJ
          </caption>
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">Energy</th>
              {alternative && <th scope="col">Alternative</th>}
            </tr>
          </thead>
          <tbody>
            {(["reactant", "product", "peak"] as const).map((k) => (
              <tr key={k}>
                <th scope="row">
                  {k === "reactant"
                    ? "Reactants"
                    : k === "product"
                      ? "Products"
                      : "Proposed peak"}
                </th>
                <td>{profile[k]}</td>
                {alternative && <td>{alternative[k]}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      {downloadable && (
        <button
          className="button"
          onClick={() => {
            setError("");
            try {
              const exported = svg.current!.cloneNode(true) as SVGSVGElement;
              exported.setAttribute("width", "500");
              exported.setAttribute("height", "435");
              exported.style.width = "500px";
              exported.style.height = "435px";
              exported.style.fontFamily = "Arial, sans-serif";
              const url = URL.createObjectURL(
                  new Blob([exported.outerHTML], { type: "image/svg+xml" }),
                ),
                a = document.createElement("a");
              a.href = url;
              a.download = "reaction-profile.svg";
              a.click();
              URL.revokeObjectURL(url);
            } catch {
              setError(
                "The diagram download failed. Your construction remains visible.",
              );
            }
          }}
        >
          Download this profile diagram
        </button>
      )}
      {error && <p role="status">{error}</p>}
    </figure>
  );
}

import type { NaturalBoard } from "../lib/natural";
/** Condensed connectivity schematic; brackets cut continuation bonds, not atoms. */
export function PeptideRepeatDiagram({ b }: { b: NaturalBoard }) {
  const core =
    { CH2: "CH₂", CH2CH2: "CH₂–CH₂", CHCH3: "CH(CH₃)" }[b.core] || "?";
  const halfCore = b.core === "CH2" || !b.core ? 20 : 54;
  const left = b.continuation === "both" || b.continuation === "left";
  const right = b.continuation === "both" || b.continuation === "right";
  return (
    <div
      className="natural-pan"
      tabIndex={0}
      aria-label="Your bracketed amino-acid contribution; scroll to inspect continuation bonds"
    >
      <p className="natural-pan-help">
        Scroll sideways to inspect the whole structure.
      </p>
      <svg
        style={{ width: 460, minWidth: 460 }}
        width="460"
        height="220"
        viewBox="0 0 460 220"
        role="img"
        aria-label="Your retained repeat proposal; unselected groups and notation remain incomplete"
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="122" y1="120" x2={215 - halfCore - 8} y2="120" />
          <line x1={215 + halfCore + 8} y1="120" x2="313" y2="120" />
          {b.carbonyl !== "absent" && (
            <line x1="325" y1="108" x2="325" y2="66" />
          )}
          {b.carbonyl === "double" && (
            <line x1="331" y1="108" x2="331" y2="66" />
          )}
          {left && <line x1="40" y1="120" x2="86" y2="120" />}
          {right && <line x1="340" y1="120" x2="412" y2="120" />}
          {b.acidOH === "retained" && (
            <line x1="327" y1="134" x2="327" y2="160" />
          )}
          {b.brackets === "shown" && (
            <>
              <path d="M76 36H62V182H76" />
              <path d="M374 36H388V182H374" />
            </>
          )}
        </g>
        <g fill="currentColor" textAnchor="middle" fontSize="18">
          <text x="103" y="126">
            {b.nitrogen === "NH2" ? "NH₂" : b.nitrogen || "?"}
          </text>
          <text x="215" y="126">
            {core}
          </text>
          <text x="328" y="126">
            C
          </text>
          {b.carbonyl !== "absent" && (
            <text x="328" y="56">
              {b.carbonyl ? "O" : "?"}
            </text>
          )}
          {b.acidOH === "retained" && (
            <text x="328" y="180">
              OH
            </text>
          )}
          <text x="407" y="189">
            {b.multiplier || "?"}
          </text>
        </g>
      </svg>
      <p>
        The drawing keeps your selected groups and bonds. Proposed joining bond
        between contributions:{" "}
        {({ CN: "C–N", CO: "C–O", CC: "C–C" } as Record<string, string>)[
          b.junction
        ] || "not selected"}
        . This is a condensed connectivity diagram, not a molecular shape.
      </p>
    </div>
  );
}

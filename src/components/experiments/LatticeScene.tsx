import {
  focusSite,
  neighboursOf,
  latticeSites,
  projectSite,
} from "@/lib/experiments/ionic-lab";
import styles from "./IonicLab.module.css";
import { useId, useState } from "react";
export function LatticeScene({
  depth,
  focus = "sodium",
  forces = false,
  onFocus,
  onForces,
}: {
  depth: boolean;
  focus?: "sodium" | "chloride";
  forces?: boolean;
  onFocus?: (focus: "sodium" | "chloride") => void;
  onForces?: (forces: boolean) => void;
}) {
  const [view, setView] = useState(0);
  const marker = useId().replaceAll(":", "");
  const selected =
    focus === "sodium" ? focusSite : { x: 2, y: 2, z: 1, charge: -1 as const };
  const neighbours = neighboursOf(selected);
  const isNeighbour = (s: typeof focusSite) =>
    neighbours.some((n) => n.x === s.x && n.y === s.y && n.z === s.z);
  const project = (s: typeof focusSite) => projectSite(s, depth, view);
  const sites = latticeSites.filter((s) => depth || s.z === selected.z);
  const position = project(selected);
  const centre = (s: typeof focusSite) =>
    s.x === selected.x && s.y === selected.y && s.z === selected.z;
  const ordered = [...sites].sort(
    (a, b) =>
      Number(isNeighbour(a)) - Number(isNeighbour(b)) ||
      project(b).y - project(a).y,
  );
  const corners = Array.from({ length: 8 }, (_, i) => ({
    x: i & 1 ? 3 : 0,
    y: i & 2 ? 3 : 0,
    z: i & 4 ? 3 : 0,
    charge: 1 as const,
  }));
  const plane = [
    { x: 0, y: 0, z: selected.z, charge: 1 as const },
    { x: 3, y: 0, z: selected.z, charge: 1 as const },
    { x: 3, y: 3, z: selected.z, charge: 1 as const },
    { x: 0, y: 3, z: selected.z, charge: 1 as const },
  ].map(project);
  return (
    <div
      className={styles.latticeScene}
      data-depth={depth}
      data-focus={focus}
      data-forces={forces}
    >
      {onFocus && (
        <div
          className={styles.latticeInspect}
          role="group"
          aria-label="Follow an ion through the lattice"
        >
          <button
            aria-pressed={focus === "sodium"}
            onClick={() => onFocus("sodium")}
          >
            Follow Na⁺
          </button>
          <button
            aria-pressed={focus === "chloride"}
            onClick={() => onFocus("chloride")}
          >
            Follow Cl⁻
          </button>
        </div>
      )}
      <svg
        viewBox={depth ? "0 0 480 420" : "0 0 480 380"}
        role="img"
        aria-label={
          depth
            ? `Three-dimensional cutaway of a sodium chloride lattice: the selected ${focus === "sodium" ? "positive sodium" : "negative chloride"} ion has six nearest ${focus === "sodium" ? "negative chloride" : "positive sodium"} neighbours.${forces ? " Arrows point from the selected ion towards each opposite-charge neighbour, showing directions of attraction on the selected ion, not electron movement." : ""}`
            : `A flat slice of a sodium chloride lattice: four nearest ${focus === "sodium" ? "negative chloride" : "positive sodium"} neighbours surround the selected ${focus === "sodium" ? "positive sodium" : "negative chloride"} ion in this plane.${forces ? " Arrows show directions of attraction on the selected ion in this plane, not electron movement." : ""}`
        }
      >
        <defs>
          <marker
            id={`${marker}-force`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="#14634f" />
          </marker>
          <radialGradient
            id={depth ? "lab-metal-depth" : "lab-metal-slice"}
            cx="30%"
            cy="25%"
          >
            <stop offset="0" stopColor="#ffeac6" />
            <stop offset="1" stopColor="#e8a35b" />
          </radialGradient>
          <radialGradient
            id={depth ? "lab-nonmetal-depth" : "lab-nonmetal-slice"}
            cx="30%"
            cy="25%"
          >
            <stop offset="0" stopColor="#e5efff" />
            <stop offset="1" stopColor="#7095d9" />
          </radialGradient>
        </defs>
        {depth && (
          <>
            <polygon
              points={plane.map((p) => `${p.x},${p.y}`).join(" ")}
              className={styles.latticePlane}
            />
            <g className={styles.cubeEdges}>
              {corners.flatMap((c, i) =>
                corners
                  .slice(i + 1)
                  .filter(
                    (d) =>
                      [c.x !== d.x, c.y !== d.y, c.z !== d.z].filter(Boolean)
                        .length === 1,
                  )
                  .map((d) => {
                    const a = project(c),
                      b = project(d);
                    return (
                      <line
                        key={`${c.x}${c.y}${c.z}-${d.x}${d.y}${d.z}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                      />
                    );
                  }),
              )}
            </g>
          </>
        )}
        <g className={styles.latticeLines}>
          {sites.filter(isNeighbour).map((s) => {
            const p = project(s);
            const dx = p.x - position.x,
              dy = p.y - position.y;
            const distance = Math.hypot(dx, dy);
            return forces ? (
              <line
                key={`${s.x}${s.y}${s.z}`}
                x1={position.x + dx * 0.4}
                y1={position.y + dy * 0.4}
                x2={p.x - (dx * (depth ? 25 : 34)) / distance}
                y2={p.y - (dy * (depth ? 25 : 34)) / distance}
                data-force-direction="true"
                markerEnd={`url(#${marker}-force)`}
                className={styles.forceArrow}
              />
            ) : (
              <line
                key={`${s.x}${s.y}${s.z}`}
                x1={position.x}
                y1={position.y}
                x2={p.x}
                y2={p.y}
                data-neighbour="true"
              />
            );
          })}
        </g>
        {ordered
          .filter((s) => !centre(s))
          .map((s) => {
            const p = project(s),
              near = isNeighbour(s);
            return (
              <g
                key={`${s.x}${s.y}${s.z}`}
                transform={`translate(${p.x},${p.y})`}
                opacity={near ? 1 : depth ? 0.24 : 0.55}
                data-lattice-charge={s.charge}
              >
                {near && (
                  <circle
                    r={depth ? 23 : 32}
                    className={styles.neighbourHalo}
                  />
                )}
                <circle
                  r={depth ? (near ? 18 : 12) : 27}
                  fill={`url(#lab-${s.charge === 1 ? "metal" : "nonmetal"}-${depth ? "depth" : "slice"})`}
                  stroke={s.charge === 1 ? "#a06b35" : "#496d9e"}
                  strokeWidth="1.5"
                />
                {(!depth || near) && (
                  <text
                    y="1"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="800"
                    fill="#262d30"
                  >
                    {s.charge === 1 ? "+" : "−"}
                  </text>
                )}
              </g>
            );
          })}
        <g
          transform={`translate(${position.x},${position.y})`}
          data-lattice-charge={selected.charge}
          data-selected-ion="true"
        >
          <circle r={depth ? 29 : 38} className={styles.selectedHalo} />
          <circle
            r={depth ? 22 : 29}
            fill={`url(#lab-${selected.charge === 1 ? "metal" : "nonmetal"}-${depth ? "depth" : "slice"})`}
            stroke="#716132"
            strokeWidth="2"
          />
          <text
            y="1"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="32"
            fontWeight="800"
            fill="#262d30"
          >
            {selected.charge === 1 ? "+" : "−"}
          </text>
        </g>
      </svg>
      {onForces && (
        <button
          className={styles.forceToggle}
          aria-pressed={forces}
          onClick={() => onForces(!forces)}
        >
          {forces ? "Hide attraction directions" : "Show attraction directions"}
        </button>
      )}
      {forces && (
        <p className={styles.forceCaption}>
          Arrows show attraction <strong>on the selected ion</strong>. They are
          not electron paths or connecting rods.{" "}
          {depth
            ? "The nearest pulls act in three dimensions, not just within a flat sheet."
            : "This slice shows only four directions. Reveal the third dimension to find the others."}
        </p>
      )}
      {depth && (
        <div
          className={styles.cameraControls}
          aria-label="Lattice viewing angle"
        >
          <button
            onClick={() => setView((v) => Math.max(-1, v - 1))}
            disabled={view === -1}
            aria-label="Turn lattice left"
          >
            ← Turn
          </button>
          <span aria-live="polite">View {35 + view * 18}°</span>
          <button
            onClick={() => setView((v) => Math.min(1, v + 1))}
            disabled={view === 1}
            aria-label="Turn lattice right"
          >
            Turn →
          </button>
        </div>
      )}
      <div className={styles.latticeKey}>
        <span>
          <i className={styles.metalKey} />
          Na⁺
        </span>
        <span>
          <i className={styles.nonmetalKey} />
          Cl⁻
        </span>
        <span>{depth ? "3D cutaway" : "2D slice"}</span>
      </div>
      <p className={styles.latticeInventory}>
        This cutaway: {depth ? "32 Na⁺ and 32 Cl⁻" : "8 Na⁺ and 8 Cl⁻"}. A 1:1
        ratio, with no separate pairs. Sizes and gaps are illustrative.
      </p>
      {depth && (
        <p className={styles.planeCaption}>
          The shaded plane matches the flat slice. Turn the lattice to follow
          the neighbours out of that plane.
        </p>
      )}
    </div>
  );
}

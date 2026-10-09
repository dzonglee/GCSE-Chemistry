import {
  focusSite,
  isNeighbour,
  latticeSites,
  projectSite,
} from "@/lib/experiments/ionic-lab";
import styles from "./IonicLab.module.css";
import { useState } from "react";
export function LatticeScene({ depth }: { depth: boolean }) {
  const [view, setView] = useState(0);
  const project = (s: typeof focusSite) => projectSite(s, depth, view);
  const sites = latticeSites.filter((s) => depth || s.z === 2);
  const position = project(focusSite);
  const centre = (s: typeof focusSite) => s.x === 2 && s.y === 2 && s.z === 2;
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
    { x: 0, y: 0, z: 2, charge: 1 as const },
    { x: 3, y: 0, z: 2, charge: 1 as const },
    { x: 3, y: 3, z: 2, charge: 1 as const },
    { x: 0, y: 3, z: 2, charge: 1 as const },
  ].map(project);
  return (
    <div className={styles.latticeScene} data-depth={depth}>
      <svg
        viewBox={depth ? "0 0 480 420" : "0 0 480 380"}
        role="img"
        aria-label={
          depth
            ? "Three-dimensional cutaway of a sodium chloride lattice: the selected positive ion has six nearest negative neighbours."
            : "A flat slice of a sodium chloride lattice: four nearest negative neighbours surround the selected positive ion in this plane."
        }
      >
        <defs>
          <radialGradient
            id={depth ? "lab-metal-depth" : "lab-metal-slice"}
            cx="30%"
            cy="25%"
          >
            <stop offset="0" stopColor="#ffdfa9" />
            <stop offset="1" stopColor="#eaaa55" />
          </radialGradient>
          <radialGradient
            id={depth ? "lab-nonmetal-depth" : "lab-nonmetal-slice"}
            cx="30%"
            cy="25%"
          >
            <stop offset="0" stopColor="#e2d7ff" />
            <stop offset="1" stopColor="#9677c6" />
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
            return (
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
                opacity={near ? 1 : depth ? 0.18 : 0.5}
                data-lattice-charge={s.charge}
              >
                {near && (
                  <circle
                    r={depth ? 23 : 32}
                    className={styles.neighbourHalo}
                  />
                )}
                <circle
                  r={depth ? 18 : 27}
                  fill={`url(#lab-${s.charge === 1 ? "metal" : "nonmetal"}-${depth ? "depth" : "slice"})`}
                  stroke={s.charge === 1 ? "#916631" : "#69528e"}
                  strokeWidth="1.5"
                />
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
              </g>
            );
          })}
        <g
          transform={`translate(${position.x},${position.y})`}
          data-lattice-charge="1"
        >
          <circle r={depth ? 29 : 38} className={styles.selectedHalo} />
          <circle
            r={depth ? 22 : 29}
            fill={`url(#lab-metal-${depth ? "depth" : "slice"})`}
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
            +
          </text>
        </g>
      </svg>
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
      {depth && (
        <p className={styles.planeCaption}>
          The shaded plane matches the flat slice. Turn the lattice to follow
          the neighbours out of that plane.
        </p>
      )}
    </div>
  );
}

import type { Atom } from "@/lib/experiments/ionic-lab";
import styles from "./IonicLab.module.css";
import { useId } from "react";
function Cross({
  x,
  y,
  bright = false,
  held = false,
}: {
  x: number;
  y: number;
  bright?: boolean;
  held?: boolean;
}) {
  return (
    <path
      d={`M${x - 4} ${y - 4}l8 8m-8 0l8 -8`}
      className={bright ? styles.crossBright : styles.cross}
      data-electron-placeholder={held || undefined}
      visibility={held ? "hidden" : undefined}
    />
  );
}
export function AtomDiagram({
  atom,
  brackets = false,
  charge = atom.charge,
  selected = false,
  hiddenChargeLabel = "charge not chosen",
  hidePickupElectron = false,
}: {
  atom: Atom;
  brackets?: boolean;
  charge?: number | null;
  selected?: boolean;
  hiddenChargeLabel?: string;
  hidePickupElectron?: boolean;
}) {
  const identity = useId().replaceAll(":", "");
  const radii = atom.shells.length === 3 ? [30, 48, 68] : [32, 64];
  const description = `${atom.name}: ${atom.protons} protons, ${atom.electrons} electrons. Arrangement ${atom.shells.join(", ")}. ${brackets ? "Bracketed" : "Unbracketed"}; ${charge === null ? hiddenChargeLabel : `shown charge ${charge > 0 ? "+" : ""}${charge}`}.`;
  return (
    <svg
      viewBox="0 0 180 180"
      role="img"
      aria-label={description}
      className={`${styles.atomSvg} ${selected ? styles.atomSelected : ""}`}
      data-protons={atom.protons}
      data-electrons={atom.electrons}
      data-shells={atom.shells.join(",")}
      data-crosses={atom.crosses.join(",")}
      data-shown-charge={charge}
    >
      <defs>
        <radialGradient id={`${identity}-wash`} cx="40%" cy="35%" r="65%">
          <stop
            offset="0"
            stopColor={atom.side === "metal" ? "#fff0df" : "#edf2ff"}
          />
          <stop
            offset="1"
            stopColor={atom.side === "metal" ? "#ffe4c9" : "#dce7fc"}
          />
        </radialGradient>
        <linearGradient id={`${identity}-core`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={atom.side === "metal" ? "#ffdbb4" : "#d3e0ff"} />
          <stop
            offset="1"
            stopColor={atom.side === "metal" ? "#ffc987" : "#adc6fb"}
          />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="78" fill={`url(#${identity}-wash)`} />
      {atom.shells.map((count, shell) => (
        <g key={shell}>
          <circle
            cx="90"
            cy="90"
            r={radii[shell]}
            className={styles.orbit}
            data-outer-shell={shell === atom.shells.length - 1 || undefined}
          />
          {Array.from({ length: count }, (_, i) => {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / count;
            const x = 90 + Math.cos(angle) * radii[shell],
              y = 90 + Math.sin(angle) * radii[shell];
            return i >= count - atom.crosses[shell] ? (
              <Cross
                key={i}
                x={x}
                y={y}
                bright={atom.side === "nonmetal"}
                held={
                  hidePickupElectron &&
                  shell === atom.shells.length - 1 &&
                  i === 0
                }
              />
            ) : (
              <circle key={i} cx={x} cy={y} r="4.6" className={styles.dot} />
            );
          })}
        </g>
      ))}
      <circle
        cx="90"
        cy="90"
        r="23"
        className={
          atom.side === "metal" ? styles.metalCore : styles.nonmetalCore
        }
        style={{ fill: `url(#${identity}-core)` }}
      />
      <text
        x="90"
        y="91"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="32"
        fontWeight="800"
        className={styles.atomSymbol}
      >
        {atom.symbol}
      </text>
      {brackets && (
        <path
          d="M15 17H7V164H15M165 17H173V164H165"
          className={styles.bracket}
        />
      )}
      {charge !== null && charge !== 0 && (
        <text
          x="162"
          y="12"
          fontSize="32"
          fontWeight="800"
          textAnchor="end"
          className={styles.ionCharge}
        >
          {Math.abs(charge) === 1 ? "" : Math.abs(charge)}
          {charge > 0 ? "+" : "−"}
        </text>
      )}
    </svg>
  );
}

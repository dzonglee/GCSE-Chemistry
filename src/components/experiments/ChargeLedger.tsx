import styles from "./IonicLab.module.css";

/** Charge accounting, not another picture of electron paths. */
export function ChargeLedger({ sent }: { sent: number }) {
  return (
    <details className={styles.chargeLedger}>
      <summary>
        {sent
          ? "See why sodium becomes positive"
          : "See how neutral charges balance"}
      </summary>
      <p>
        Each proton contributes +1; each electron contributes −1. Pair the
        charges, not the particles.
      </p>
      <div
        className={styles.chargePairs}
        role="img"
        aria-label={`Sodium has eleven positive proton charges and ${11 - sent} negative electron charges. ${sent ? "Ten pairs cancel, leaving one positive charge." : "Eleven pairs cancel, leaving no net charge."}`}
      >
        <span>Protons</span>
        <div>
          {Array.from({ length: 11 }, (_, i) => (
            <i
              key={i}
              data-positive="true"
              data-unmatched={i >= 11 - sent || undefined}
              aria-hidden="true"
            >
              +
            </i>
          ))}
        </div>
        <span>Electrons</span>
        <div>
          {Array.from({ length: 11 }, (_, i) => (
            <i
              key={i}
              data-missing={i >= 11 - sent || undefined}
              aria-hidden="true"
            >
              {i < 11 - sent ? "−" : ""}
            </i>
          ))}
        </div>
      </div>
      <strong>{sent ? "11 − 10 = +1" : "11 − 11 = 0"}</strong>
      <p>
        {sent
          ? "The proton count stays eleven. Losing one negative electron leaves one positive charge unmatched."
          : "Equal positive and negative charges give a neutral sodium atom."}{" "}
        The paired columns are bookkeeping, not proton–electron bonds.
      </p>
    </details>
  );
}

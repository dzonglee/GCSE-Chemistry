import styles from "./IonicLab.module.css";
export function LabIcon({ kind = "arrow" }: { kind?: "arrow" | "network" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.labIcon}
    >
      {kind === "arrow" ? (
        <path d="M5 19 19 5M5 5h14v14" />
      ) : (
        <>
          <path d="m12 3 9 5v9l-9 5-9-5V8Z M3 8l9 5 9-5 M12 13v9" />
          <path d="M12 3v10" strokeDasharray="2 3" />
        </>
      )}
    </svg>
  );
}

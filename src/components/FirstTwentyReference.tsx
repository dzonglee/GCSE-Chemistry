import { elements } from "@/content/elements";
import { periodicPosition } from "@/lib/periodic-position";
import { firstTwentyArrangement } from "@/lib/shells";
export function FirstTwentyReference({
  symbolsOnly = false,
}: {
  symbolsOnly?: boolean;
} = {}) {
  return (
    <details className="first-twenty-details">
      <summary>First 20 elements reference</summary>
      <div
        className={`first-twenty-reference${symbolsOnly ? " symbol-reference" : ""}`}
        role="region"
        aria-label="First 20 reference; scroll horizontally if needed"
        tabIndex={0}
      >
        <table>
          <caption>
            {symbolsOnly
              ? "First 20 element names, symbols and atomic numbers"
              : "Neutral ground-state atoms, GCSE group convention"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Atomic number</th>
              <th scope="col">Element</th>
              {!symbolsOnly && (
                <>
                  <th scope="col">GCSE group</th>
                  <th scope="col">Period</th>
                  <th scope="col">Arrangement</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {elements.map((e) => {
              const pos = periodicPosition(e.protons);
              return (
                <tr key={e.protons}>
                  <th scope="row">{e.protons}</th>
                  <td>
                    {e.name} ({e.symbol})
                  </td>
                  {!symbolsOnly && (
                    <>
                      <td>{pos.group}</td>
                      <td>{pos.period}</td>
                      <td>{firstTwentyArrangement(e.protons).join(",")}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="position-caption">
        {symbolsOnly
          ? "Use the name and exact symbol together. Atomic number is proton number. This short reference shows the first 20 elements."
          : "These arrangements cover the first 20 only. Modern Groups 13–18 correspond to GCSE 3–7 and 0. Group 0 includes helium’s full two-electron first shell."}
      </p>
      <p>
        <a
          href="https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-8462-PT-JUN23.PDF"
          target="_blank"
          rel="noreferrer"
        >
          View the full AQA exam-format periodic table
        </a>
      </p>
    </details>
  );
}

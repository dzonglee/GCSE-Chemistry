import { graphenePanels, type GraphenePanelGiven } from "@/lib/graphene";
export function GraphenePanelData({
  compact = false,
  given,
}: {
  compact?: boolean;
  given?: GraphenePanelGiven;
}) {
  const panels = given?.panels ?? graphenePanels;
  const maxMass = given?.maxMass ?? 15,
    minLoad = given?.minLoad ?? 15;
  if (compact)
    return (
      <div className="assessment-panel-results">
        <p>
          Mass ≤ {maxMass} g; load ≥ {minLoad} N.
        </p>
        <table>
          <caption>
            {given
              ? "Supplied finished-panel results"
              : "Supplied illustrative equal-area panels"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Panel</th>
              <th scope="col">Mass / g</th>
              <th scope="col">Load / N</th>
            </tr>
          </thead>
          <tbody>
            {panels.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.id}</th>
                <td>{p.mass}</td>
                <td>{p.load}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <div className="graphene-panel-data">
      <p>
        Illustrative supplied results for equal-area finished panels, not
        measured graphene-film constants. Requirement: mass ≤ 15 g and supported
        load ≥ 15 N.
      </p>
      <div className="table-scroll">
        <table>
          <caption>Finished-panel comparison</caption>
          <thead>
            <tr>
              <th scope="col">Panel</th>
              <th scope="col">Material</th>
              <th scope="col">Mass / g</th>
              <th scope="col">Load / N</th>
            </tr>
          </thead>
          <tbody>
            {graphenePanels.map((p) => (
              <tr key={p.id}>
                <th scope="row">{p.id}</th>
                <td>{p.material}</td>
                <td>{p.mass}</td>
                <td>{p.load}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        The load is supplied test evidence for these panels. It is not a
        universal breaking force for every graphene composite.
      </p>
    </div>
  );
}

export function GraphenePanelEvidence() {
  return (
    <details className="assessment-panel-evidence">
      <summary>Panel materials and evidence</summary>
      <p>
        {graphenePanels.map((p) => `${p.id}: ${p.material}`).join("; ")}. These
        supplied loads are test results for the panels, not universal graphene
        constants.
      </p>
    </details>
  );
}

export interface CellsComparisonData {
  sources: {
    label: string;
    rangeKm: number;
    restorationMinutes: number;
    tripCostPounds?: number;
  }[];
}
/** Static supplied evidence, without eligibility judgement or computed recommendation. */
export function CellsComparison({ sources }: CellsComparisonData) {
  const cost = sources.every((s) => s.tripCostPounds !== undefined);
  return (
    <table className="cells-comparison-table">
      <caption>Original supplied source data</caption>
      <thead>
        <tr>
          <th scope="col">Measure</th>
          {sources.map((s) => (
            <th scope="col" key={s.label}>
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Range / km</th>
          {sources.map((s) => (
            <td key={s.label}>{s.rangeKm}</td>
          ))}
        </tr>
        <tr>
          <th scope="row">Restoration / min</th>
          {sources.map((s) => (
            <td key={s.label}>{s.restorationMinutes}</td>
          ))}
        </tr>
        {cost && (
          <tr>
            <th scope="row">Trip-energy cost / £</th>
            {sources.map((s) => (
              <td key={s.label}>{s.tripCostPounds}</td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

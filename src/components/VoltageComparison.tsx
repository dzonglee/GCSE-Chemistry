import { specMetals, observedVoltage } from "@/lib/cell-voltage";
const capital = (v: string) => v[0].toUpperCase() + v.slice(1);
const symbols: Record<string, string> = {
  chromium: "Cr",
  copper: "Cu",
  iron: "Fe",
  tin: "Sn",
  zinc: "Zn",
};
export function VoltageTable({
  row,
  column,
}: {
  row?: string;
  column?: string;
}) {
  return (
    <figure className="voltage-table">
      <table>
        <caption>
          Supplied specimen investigation. Metal1 is the row; metal2 is the
          column. Positive means metal2 is more reactive under this stated
          comparison.
        </caption>
        <thead>
          <tr>
            <th scope="col">1 ↓ / 2 →</th>
            {specMetals.map((m) => (
              <th key={m} scope="col">
                <abbr title={capital(m)}>{symbols[m]}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specMetals.map((r) => (
            <tr key={r}>
              <th scope="row">
                <abbr title={capital(r)}>{symbols[r]}</abbr>
              </th>
              {specMetals.map((c) => {
                const v = observedVoltage(r, c);
                return (
                  <td
                    key={c}
                    data-selected={row === r && column === c}
                    aria-label={
                      v === "not-measured"
                        ? "Not measured"
                        : v === undefined
                          ? "Not supplied"
                          : `${v} volts`
                    }
                  >
                    {v === "not-measured"
                      ? "?"
                      : v === undefined
                        ? "—"
                        : v.toFixed(1).replace("-", "−")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Cr chromium; Cu copper; Fe iron; Sn tin; Zn zinc. ? means not measured;
        — means not supplied. Neither symbol means 0 V. These are observations
        for this investigation, not universal cell constants.
      </figcaption>
    </figure>
  );
}

export interface VoltageData {
  reference: string;
  referenceRole: "first" | "second";
  values: ReadonlyArray<{ metal: string; volts: number }>;
}
export function VoltageComparison({ data }: { data: VoltageData }) {
  return (
    <figure className="voltage-data">
      <table>
        <caption>
          Supplied readings with {data.reference} as metal
          {data.referenceRole === "first" ? "1" : "2"}. Positive means metal2 is
          more reactive under this stated sign convention.
        </caption>
        <thead>
          <tr>
            <th scope="col">Compared metal</th>
            <th scope="col">Reading / V</th>
          </tr>
        </thead>
        <tbody>
          {data.values.map((row) => (
            <tr key={row.metal}>
              <th scope="row">{capital(row.metal)}</th>
              <td>{row.volts.toString().replace("-", "−")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Use the declared reference role and unchanged comparison conditions.
        These supplied observations are not universal electrode voltages.
      </figcaption>
    </figure>
  );
}

import { nanotubeMaterials, type NanotubeMaterialGiven } from "@/lib/nanotubes";
export function NanotubeMaterialData({
  given,
}: {
  given?: NanotubeMaterialGiven;
}) {
  return (
    <div className="graphene-panel-data">
      <p>
        Illustrative finished-material data. Same frame volume; strength and
        stiffness are supplied relative indices.
      </p>
      <table>
        <caption>
          Design limits: density ≤ {given?.maxDensity ?? 1.8} g/cm³, strength ≥{" "}
          {given?.minStrength ?? 30}, stiffness ≥ {given?.minStiffness ?? 25}.
        </caption>
        <thead>
          <tr>
            <th scope="col">Material</th>
            <th scope="col">
              Density
              <br />
              g/cm³
            </th>
            <th scope="col">Strength</th>
            <th scope="col">Stiffness</th>
          </tr>
        </thead>
        <tbody>
          {(given?.materials ?? nanotubeMaterials).map((m) => (
            <tr key={m.id}>
              <th scope="row">
                {m.id}: {m.material}
              </th>
              <td data-label="Density / g/cm³">{m.density}</td>
              <td data-label="Strength">{m.strength}</td>
              <td data-label="Stiffness">{m.stiffness}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

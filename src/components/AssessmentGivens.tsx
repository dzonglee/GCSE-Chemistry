import type { Question } from "@/content/types";

// Display only original givens; no reference answers or derived totals.
export function AssessmentEnergyGiven({
  data,
}: {
  data: NonNullable<Question["greenhouseGiven"]>["budget"];
}) {
  if (!data) return null;
  return (
    <div className="assessment-given">
      <table>
        <caption>Whole Earth · teaching units per equal interval</caption>
        <tbody>
          <tr>
            <th scope="row">Incoming sunlight</th>
            <td>{data.incoming}</td>
          </tr>
          <tr>
            <th scope="row">Reflected sunlight</th>
            <td>{data.reflected}</td>
          </tr>
          <tr>
            <th scope="row">Escaping infrared</th>
            <td>{data.escaping}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export function AssessmentWaterEnergy({
  data,
}: {
  data: NonNullable<NonNullable<Question["waterGiven"]>["energy"]>;
}) {
  return (
    <div className="assessment-given">
      <p>Same quality requirement and accounting boundary.</p>
      <table>
        <caption>Supplied energy and product volume</caption>
        <tbody>
          <tr>
            <th scope="row">A energy / kWh</th>
            <td>{data.a}</td>
          </tr>
          <tr>
            <th scope="row">B energy / kWh</th>
            <td>{data.b}</td>
          </tr>
          <tr>
            <th scope="row">Each product / m³</th>
            <td>{data.volume}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export function AssessmentServiceGiven({
  data,
}: {
  data: NonNullable<NonNullable<Question["climateGiven"]>["comparison"]>;
}) {
  return (
    <div className="assessment-given assessment-service-given">
      <table>
        <caption>{data.service} · 100-year warming basis</caption>
        <thead>
          <tr>
            <th scope="col">Option</th>
            <th scope="col">Lifetime kg CO₂e</th>
            <th scope="col">Uses</th>
          </tr>
        </thead>
        <tbody>
          {(["a", "b"] as const).map((key) => (
            <tr key={key}>
              <th scope="row">{key.toUpperCase()}</th>
              <td>{data[key].total}</td>
              <td>{data[key].uses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function AssessmentRecyclingGiven({
  data,
}: {
  data: NonNullable<NonNullable<Question["lcaGiven"]>["recycling"]>;
}) {
  return (
    <div className="assessment-given">
      <table>
        <caption>Supplied recycling inventory</caption>
        <tbody>
          <tr>
            <th scope="row">Collected / kg</th>
            <td>{data.collected}</td>
          </tr>
          <tr>
            <th scope="row">Suitable sorted / kg</th>
            <td>{data.sorted}</td>
          </tr>
          <tr>
            <th scope="row">Usable sorted recovery / %</th>
            <td>{data.yield}</td>
          </tr>
          <tr>
            <th scope="row">New product demand / kg</th>
            <td>{data.demand}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

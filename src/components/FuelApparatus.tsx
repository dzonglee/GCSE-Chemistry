import type { FuelRecord } from "../lib/alcohols";
export function FuelApparatus({
  data,
}: {
  data: Extract<FuelRecord, { kind: "measurement" }>;
}) {
  return (
    <div className="fuel-apparatus">
      <p>
        Original water and burner readings. Calculate the temperature rise and
        actual fuel consumed from these unchanged measurements.
      </p>
      <div className="fuel-apparatus-pair">
        {data.names.map((name, i) => (
          <section className="fuel-apparatus-card" key={i}>
            <h4>
              {i === 0 ? "A" : "B"}: {name}
            </h4>
            <div className="fuel-water-vessel">
              <span>Water: {data.water[i]} g</span>
              <span>
                {data.initial[i]} °C → {data.final[i]} °C
              </span>
            </div>
            <div className="fuel-heat-arrow" aria-hidden="true">
              ↑
            </div>
            <div className="fuel-burner">
              <strong>Burner + fuel</strong>
              <span>Before: {data.before[i]} g</span>
              <span>After: {data.after[i]} g</span>
            </div>
          </section>
        ))}
      </div>
      <p>
        <strong>Original control report:</strong> {data.controls}
      </p>
    </div>
  );
}

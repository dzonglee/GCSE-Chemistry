import type { IonGiven as Given } from "@/content/journeys/ion-tests";
export function IonGiven({ data }: { data: Given }) {
  return (
    <section className="ion-original" aria-label="Original ion-test evidence">
      <h3>{data.title}</h3>
      <dl>
        {data.rows.map((row, i) => (
          <div key={i}>
            <dt>{row.label}</dt>
            <dd>{row.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

import { transitionData } from "@/lib/states-of-matter";
import { StateParticleDiagram } from "./StateParticleDiagram";
export function StateTransitionDiagram({
  change,
}: {
  change: keyof typeof transitionData;
}) {
  const data = transitionData[change];
  return (
    <div className="state-transition-diagram">
      <p>
        <strong>{change[0].toUpperCase() + change.slice(1)}:</strong>{" "}
        {data.from} → {data.to}. Two drawings show the same sample before and
        after the physical change.
      </p>
      <div className="state-transition-cards">
        <div>
          <strong>Before: {data.from}</strong>
          <StateParticleDiagram phase={data.from} assessment />
        </div>
        <div>
          <strong>After: {data.to}</strong>
          <StateParticleDiagram phase={data.to} assessment />
        </div>
      </div>
      <p>
        Each snapshot contains the same 24 particle identities and sizes; the
        two snapshots are not 48 different particles. Schematic positions and
        motion are not measured.
      </p>
    </div>
  );
}

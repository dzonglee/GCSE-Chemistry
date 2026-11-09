"use client";

import type { WorkedCursor } from "@/lib/worked-cursor";
import {
  displayRelativeMass,
  liveRelativeMassPopulation,
  relativeMassCountPopulation,
  relativeMassCountSteps,
  relativeMassMainSteps,
  type RelativeMassPopulation,
} from "@/lib/relative-atomic-mass-worked";
import { WorkedStepsFrame } from "./WorkedStepsFrame";

function PopulationBar({ light, label }: { light: number; label: string }) {
  return (
    <div className="t17-worked-population-bar">
      <p>{label}</p>
      <svg
        viewBox="0 0 320 32"
        role="img"
        aria-label={`${displayRelativeMass(light)} mass-35 atoms and ${displayRelativeMass(100 - light)} mass-37 atoms out of 100`}
      >
        <rect x="0" y="2" width={3.2 * light} height="28" fill="#3e4ed0" />
        <rect
          x={3.2 * light}
          y="2"
          width={3.2 * (100 - light)}
          height="28"
          fill="#b8541c"
        />
        <rect
          x="1"
          y="2"
          width="318"
          height="28"
          fill="none"
          stroke="#172033"
        />
      </svg>
      <p>
        Mass 35: {displayRelativeMass(light)} atoms; mass 37:{" "}
        {displayRelativeMass(100 - light)} atoms.
      </p>
    </div>
  );
}

function MeanScale({
  population,
  revealMean,
}: {
  population: RelativeMassPopulation;
  revealMean: boolean;
}) {
  const [lower, upper] = population.masses;
  const marker = 12 + (296 * (population.mean - lower)) / (upper - lower);
  return (
    <div className="t17-worked-mass-scale">
      <svg
        viewBox="0 0 320 46"
        role="img"
        aria-label={`Mean marker on the mass-${lower} to mass-${upper} scale${revealMean ? `: ${displayRelativeMass(population.mean)}` : ", calculated from your live population"}`}
        data-mean={population.mean}
      >
        <path
          d="M12 24 H308 M12 14 V34 M160 18 V30 M308 14 V34"
          fill="none"
          stroke="#63728b"
          strokeWidth="2"
        />
        <circle cx={marker} cy="24" r="7" fill="#172033" />
      </svg>
      <p>
        Left end: {lower}. Right end: {upper}.{" "}
        {revealMean
          ? `Mean marker: ${displayRelativeMass(population.mean)}.`
          : "The marker follows your live mixture."}
      </p>
    </div>
  );
}

function ContributionTable({
  population,
  revealProducts,
  caption,
}: {
  population: RelativeMassPopulation;
  revealProducts: boolean;
  caption: string;
}) {
  return (
    <table className="t17-worked-contributions">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Mass</th>
          <th scope="col">Atoms</th>
          {revealProducts && <th scope="col">Contribution</th>}
        </tr>
      </thead>
      <tbody>
        {population.masses.map((mass, index) => (
          <tr key={mass}>
            <th scope="row">{mass}</th>
            <td>{displayRelativeMass(population.counts[index])}</td>
            {revealProducts && (
              <td>
                {mass} × {displayRelativeMass(population.counts[index])} ={" "}
                {displayRelativeMass(population.contributions[index])}
              </td>
            )}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td>{population.totalAtoms}</td>
          {revealProducts && (
            <td>{displayRelativeMass(population.totalContribution)}</td>
          )}
        </tr>
      </tfoot>
    </table>
  );
}

export function RelativeAtomicMassWorkedSteps({
  lightPercent,
  cursor,
  onCursorChange,
  onPractice,
}: {
  lightPercent: number;
  cursor: WorkedCursor;
  onCursorChange: (cursor: WorkedCursor) => void;
  onPractice: () => void;
}) {
  const countExample = cursor.example === "difficult";
  const population = countExample
    ? relativeMassCountPopulation
    : liveRelativeMassPopulation(lightPercent);
  const steps = countExample
    ? relativeMassCountSteps
    : relativeMassMainSteps(lightPercent);
  return (
    <WorkedStepsFrame
      id="relative-atomic-mass-worked"
      title="Worked steps: relative atomic mass"
      examples={[
        { id: "main", label: "Main: the live 35/37 mixture" },
        { id: "difficult", label: "Difficult: count ten atoms" },
      ]}
      cursor={cursor}
      onCursorChange={onCursorChange}
      onPractice={onPractice}
      steps={steps}
    >
      <figure
        className="t17-worked-mixture-visual"
        data-example={cursor.example}
        data-step={cursor.step}
        data-counts={population.counts.join(",")}
      >
        {countExample ? (
          <>
            <ul
              className="t17-worked-count-tiles"
              aria-label="Ten supplied atom tiles"
            >
              {population.masses.flatMap((mass, group) =>
                Array.from({ length: population.counts[group] }, (_, index) => (
                  <li
                    key={`${mass}-${index}`}
                    className="t17-worked-count-tile"
                    data-mass={mass}
                    aria-label={`Mass-${mass} atom ${index + 1} of ${population.counts[group]}`}
                  >
                    {mass}
                  </li>
                )),
              )}
            </ul>
            <ContributionTable
              population={population}
              revealProducts={cursor.step >= 1}
              caption="Six mass-30 atoms and four mass-32 atoms"
            />
            {cursor.step === 2 && (
              <>
                <p className="t17-worked-equation">308 ÷ 10 = 30.8</p>
                <MeanScale population={population} revealMean />
              </>
            )}
            <figcaption>
              Each tile represents one atom. Count these ten tiles; the
              denominator is 10, not 100.
            </figcaption>
          </>
        ) : (
          <>
            {cursor.step === 0 ? (
              <>
                <PopulationBar
                  light={50}
                  label="Before: equal starting population"
                />
                <PopulationBar
                  light={lightPercent}
                  label="After: your live population"
                />
                <MeanScale population={population} revealMean={false} />
              </>
            ) : (
              <>
                <ContributionTable
                  population={population}
                  revealProducts
                  caption="Contributions from your live population of 100 atoms"
                />
                {cursor.step === 2 && (
                  <>
                    <p className="t17-worked-equation">
                      {displayRelativeMass(population.totalContribution)} ÷ 100
                      = {displayRelativeMass(population.mean)}
                    </p>
                    <MeanScale population={population} revealMean />
                  </>
                )}
              </>
            )}
            <figcaption>
              These numbers follow the mass-35 slider above, including Undo and
              Reset model. Only abundance changes; the two isotope masses stay
              fixed.
            </figcaption>
          </>
        )}
      </figure>
      <p className="t17-worked-model-note">
        A supplied classroom population uses mass numbers as approximate
        relative isotope masses. Abundance counts atoms, not their share of the
        sample’s mass.
      </p>
    </WorkedStepsFrame>
  );
}

"use client";
import { HaberWorkbench } from "./HaberWorkbench";
import { MaterialsWorkbench } from "./MaterialsWorkbench";
import { LcaWorkbench } from "./LcaWorkbench";
import { BioWorkbench } from "./BioWorkbench";
import { WasteWorkbench } from "./WasteWorkbench";
import { WaterWorkbench } from "./WaterWorkbench";
import { CycleWorkbench } from "./CycleWorkbench";
import { PollutionWorkbench } from "./PollutionWorkbench";
import { ClimateWorkbench } from "./ClimateWorkbench";
import { GreenhouseWorkbench } from "./GreenhouseWorkbench";
import { AtmosphereWorkbench } from "./AtmosphereWorkbench";
import { SeparationWorkbench } from "./SeparationWorkbench";
import { InstrumentalWorkbench } from "./InstrumentalWorkbench";
import { IonTestsWorkbench } from "./IonTestsWorkbench";
import { GasTestsWorkbench } from "./GasTestsWorkbench";
import { ChromaWorkbench } from "./ChromaWorkbench";
import { PurityWorkbench } from "./PurityWorkbench";
import { NaturalWorkbench } from "./NaturalWorkbench";
import { OrganicPathwayWorkbench } from "./OrganicPathwayWorkbench";
import { PolymerisationWorkbench } from "./PolymerisationWorkbench";
import { AlcoholWorkbench } from "./AlcoholWorkbench";
import { CrackingWorkbench } from "./CrackingWorkbench";
import { AlkaneWorkbench } from "./AlkaneWorkbench";
import { CrudeOilWorkbench } from "./CrudeOilWorkbench";
import { RatesPracticalWorkbench } from "./RatesPracticalWorkbench";
import { EquilibriumShiftWorkbench } from "./EquilibriumShiftWorkbench";
import { ReversibleWorkbench } from "./ReversibleWorkbench";
import { ThermalWorkbench } from "./ThermalWorkbench";
import { CollisionWorkbench } from "./CollisionWorkbench";
import { TangentWorkbench } from "./TangentWorkbench";
import { RatesWorkbench } from "./RatesWorkbench";
import { VoltageWorkbench } from "./VoltageWorkbench";
import { FuelHalfWorkbench } from "./FuelHalfWorkbench";
import { CellsWorkbench } from "./CellsWorkbench";
import { EnergyPracticalWorkbench } from "./EnergyPracticalWorkbench";
import { BondEnergyWorkbench } from "./BondEnergyWorkbench";
import { TitrationTechniqueWorkbench } from "./TitrationTechniqueWorkbench";
import { ProfileWorkbench } from "./ProfileWorkbench";
import { EnergyWorkbench } from "./EnergyWorkbench";
import { DisplacementWorkbench } from "./DisplacementWorkbench";
import { AcidStrengthWorkbench } from "./AcidStrengthWorkbench";
import { PhWorkbench } from "./PhWorkbench";
import { HalfEquationsWorkbench } from "./HalfEquationsWorkbench";
import { AqueousProductsWorkbench } from "./AqueousProductsWorkbench";
import { ElectrolysisWorkbench } from "./ElectrolysisWorkbench";
import { SaltWorkbench } from "./SaltWorkbench";
import { AcidWorkbench } from "./AcidWorkbench";
import { MetalExtractionWorkbench } from "./MetalExtractionWorkbench";
import { OxygenRedoxWorkbench } from "./OxygenRedoxWorkbench";
import { MetalReactivityWorkbench } from "./MetalReactivityWorkbench";
import { TitrationWorkbench } from "./TitrationWorkbench";
import { EmpiricalWorkbench } from "./EmpiricalWorkbench";
import { GasWorkbench } from "./GasWorkbench";
import { MolarWorkbench } from "./MolarWorkbench";
import { PathwayWorkbench } from "./PathwayWorkbench";
import { TheoreticalWorkbench } from "./TheoreticalWorkbench";
import { EconomyWorkbench } from "./EconomyWorkbench";
import { InverseEconomyWorkbench } from "./InverseEconomyWorkbench";
import { YieldWorkbench } from "./YieldWorkbench";
import { LimitingWorkbench } from "./LimitingWorkbench";
import { MassBalanceWorkbench } from "./MassBalanceWorkbench";
import { ReactingWorkbench } from "./ReactingWorkbench";
import { MoleWorkbench } from "./MoleWorkbench";
import { ChangingConcentrationWorkbench } from "./ChangingConcentrationWorkbench";
import { ConcentrationWorkbench } from "./ConcentrationWorkbench";
import { MeasurementWorkbench } from "./MeasurementWorkbench";
import { MassWorkbench } from "./MassWorkbench";
import { BalancingWorkbench } from "./BalancingWorkbench";
import { CompositionWorkbench } from "./CompositionWorkbench";
import { FormulaMassWorkbench } from "./FormulaMassWorkbench";
import { NanoWorkbench } from "./NanoWorkbench";
import { StateWorkbench } from "./StateWorkbench";
import { PolymerWorkbench } from "./PolymerWorkbench";
import { NanotubeWorkbench } from "./NanotubeWorkbench";
import { FullereneWorkbench } from "./FullereneWorkbench";
import { GrapheneWorkbench } from "./GrapheneWorkbench";
import { GraphiteWorkbench } from "./GraphiteWorkbench";
import { DiamondWorkbench } from "./DiamondWorkbench";
import { MetallicWorkbench } from "./MetallicWorkbench";
import { MolecularPropertiesWorkbench } from "./MolecularPropertiesWorkbench";
import { useState } from "react";
import type { TaskModel, WorkbenchState } from "@/content/types";
import { elements } from "@/content/elements";
import { atomCounts } from "@/lib/science";
import {
  initialBoard,
  sameBoard,
  checkBoard,
  formatCharge,
} from "@/lib/workbench";
import { AtomScene3D } from "./AtomScene3D";
import { Nuclide } from "./Nuclide";
import { ShellWorkbench } from "./ShellWorkbench";
import { ScatteringWorkbench } from "./ScatteringWorkbench";
import { ScaleWorkbench } from "./ScaleWorkbench";
import { IsotopeMixtureWorkbench } from "./IsotopeMixtureWorkbench";
import { PeriodicPositionWorkbench } from "./PeriodicPositionWorkbench";
import { HistoricalGapWorkbench } from "./HistoricalGapWorkbench";
import { HistoricalTestWorkbench } from "./HistoricalTestWorkbench";
import { AlkaliWorkbench } from "./AlkaliWorkbench";
import { HalogenWorkbench } from "./HalogenWorkbench";
import { IonicTransferWorkbench } from "./IonicTransferWorkbench";
import { TransitionWorkbench } from "./TransitionWorkbench";
import { NobleUseWorkbench } from "./NobleUseWorkbench";
import { IonicStructureWorkbench } from "./IonicStructureWorkbench";
import { IonicFormulaWorkbench } from "./IonicFormulaWorkbench";
import { CovalentWorkbench } from "./CovalentWorkbench";
const particles = [
  {
    key: "proton",
    short: "p⁺",
    name: "Proton",
    charge: "+1",
    mass: "1",
    colour: "#3f4fd0",
  },
  {
    key: "neutron",
    short: "n",
    name: "Neutron",
    charge: "0",
    mass: "1",
    colour: "#c9982f",
  },
  {
    key: "electron",
    short: "e⁻",
    name: "Electron",
    charge: "−1",
    mass: "≈ 1/1836",
    colour: "#6b3fc4",
  },
];
export function ParticleDiagram({
  protons,
  neutrons,
  electrons,
  placed,
}: {
  protons: number;
  neutrons: number;
  electrons: number;
  placed?: WorkbenchState;
}) {
  const shells = atomCounts(protons, neutrons, electrons).shells;
  const nuclear = placed
    ? particles.filter((p) => placed[p.key] === "nucleus").map((p) => p.key)
    : [...Array(protons).fill("proton"), ...Array(neutrons).fill("neutron")];
  const outside = placed
    ? particles.filter((p) => placed[p.key] === "shells").map((p) => p.key)
    : [];
  return (
    <svg
      viewBox="0 0 400 340"
      role="img"
      aria-label={
        placed
          ? `Placed particle labels: ${nuclear.join(", ") || "none"} in nucleus; ${outside.join(", ") || "none"} in shells. Regions are schematic.`
          : `Magnified schematic atom with ${protons} protons and ${neutrons} neutrons in the nucleus, ${electrons} electrons outside. Not to scale.`
      }
    >
      <defs>
        <radialGradient id="nucleus-well">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#f0f2fa" />
        </radialGradient>
      </defs>
      {(placed
        ? [1, 2]
        : shells.length
          ? shells.map((_, i) => i + 1)
          : [1]
      ).map((_, i) => (
        <circle
          key={i}
          cx="200"
          cy="162"
          r={86 + i * 27}
          fill="none"
          stroke="#c9d0dc"
          strokeWidth="1.5"
        />
      ))}
      <circle
        cx="200"
        cy="162"
        r="50"
        fill="url(#nucleus-well)"
        stroke="#e2e6ee"
      />
      {nuclear.map((kind, i) => {
        const p = particles.find((p) => p.key === kind)!;
        const columns = Math.min(7, Math.ceil(Math.sqrt(nuclear.length))),
          rows = Math.ceil(nuclear.length / columns);
        const spacing = placed ? 36 : 12;
        const x = 200 + ((i % columns) - (columns - 1) / 2) * spacing,
          y = 162 + (Math.floor(i / columns) - (rows - 1) / 2) * spacing;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={placed ? 15 : 5.7} fill={p.colour} />
            <text
              x={x}
              y={y + (placed ? 4 : 2)}
              textAnchor="middle"
              fill={kind === "neutron" ? "#211600" : "white"}
              fontSize={placed ? 12 : 6.5}
              fontWeight="700"
            >
              {placed
                ? p.short
                : kind === "proton"
                  ? "+"
                  : kind === "electron"
                    ? "−"
                    : "n"}
            </text>
          </g>
        );
      })}
      {!placed &&
        shells.map((count, i) =>
          Array.from({ length: count }, (_, j) => {
            const angle = (j * 2 * Math.PI) / count - Math.PI / 2,
              r = 86 + i * 27;
            return (
              <g key={`${i}-${j}`}>
                <circle
                  cx={200 + r * Math.cos(angle)}
                  cy={162 + r * Math.sin(angle)}
                  r="7"
                  fill="#6b3fc4"
                />
                <text
                  x={200 + r * Math.cos(angle)}
                  y={165 + r * Math.sin(angle)}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  −
                </text>
              </g>
            );
          }),
        )}
      {outside.map((kind, i) => {
        const p = particles.find((p) => p.key === kind)!;
        return (
          <g key={kind}>
            <circle cx={200 + (i - 1) * 55} cy="49" r="14" fill={p.colour} />
            <text
              x={200 + (i - 1) * 55}
              y="53"
              textAnchor="middle"
              fill={kind === "neutron" ? "#211600" : "white"}
              fontSize="12"
              fontWeight="700"
            >
              {p.short}
            </text>
          </g>
        );
      })}
      <text x="200" y="235" textAnchor="middle" fontSize="12" fill="#3f4757">
        nucleus (magnified)
      </text>
      <text x="200" y="321" textAnchor="middle" fontSize="12" fill="#5b6475">
        Electron shells · schematic, not to scale
      </text>
    </svg>
  );
}

function AtomTransformationWorkbench({
  model,
  history,
  onChange,
}: {
  model: Extract<TaskModel, { kind: "atom-transform" }>;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const board = history.at(-1) ?? initialBoard(model);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const key = model.operation === "isotope" ? "n" : "e";
  const kind = model.operation === "isotope" ? "neutron" : "electron";
  const limit = model.operation === "isotope" ? 30 : 20;
  const change = (amount: number) => {
    if (history.length >= 500) {
      setFeedback({
        correct: false,
        message: "Undo or reset to continue. Your answers are retained.",
      });
      return;
    }
    onChange([...history, { ...board, [key]: Number(board[key]) + amount }]);
    setFeedback(null);
  };
  const [p0, n0, e0] = model.initial;
  const p = Number(board.p),
    n = Number(board.n),
    e = Number(board.e);
  const element = elements.find((element) => element.protons === p)!;
  return (
    <section
      className="model task-workbench atom-transformation"
      data-model="atom-transform"
      aria-label="Task model"
    >
      <p className="bench-instruction">{model.instruction}</p>
      <div className="particle-counter">
        <span className={`particle-token ${kind}`}>
          {kind === "neutron" ? "n" : "e⁻"}
        </span>
        <strong>{kind === "neutron" ? "Neutrons" : "Electrons"}</strong>
        <div className="counter-steps">
          <button
            aria-label={`Remove ${kind}`}
            disabled={Number(board[key]) <= 0}
            onClick={() => change(-1)}
          >
            −
          </button>
          <output
            aria-label={`${kind === "neutron" ? "Neutron" : "Electron"} count`}
          >
            {board[key]}
          </output>
          <button
            aria-label={`Add ${kind}`}
            disabled={Number(board[key]) >= limit}
            onClick={() => change(1)}
          >
            +
          </button>
        </div>
      </div>
      <p className="transformation-fixed">
        Fixed: {p} protons and{" "}
        {model.operation === "isotope" ? `${e} electrons` : `${n} neutrons`}.
      </p>
      <div
        className="atom-comparison"
        aria-label="Before and after particle comparison"
      >
        {(
          [
            ["Before", p0, n0, e0],
            ["Your model", p, n, e],
          ] as const
        ).map(([label, protons, neutrons, electrons]) => (
          <div key={label}>
            <strong>{label}</strong>
            <Nuclide
              notation={{
                symbol: element.symbol,
                atomicNumber: protons,
                massNumber: protons + neutrons,
                charge: protons - electrons,
              }}
            />
            <p>
              {protons} p · {neutrons} n · {electrons} e
            </p>
            <p>Charge {formatCharge(protons - electrons)}</p>
          </div>
        ))}
      </div>
      <AtomScene3D
        protons={p}
        neutrons={n}
        electrons={e}
        fallback={<ParticleDiagram protons={p} neutrons={n} electrons={e} />}
      />
      <div className="atom-ledger">
        <div>
          <small>Element</small>
          <strong>{element.name}</strong>
          <span>{p} protons: unchanged</span>
        </div>
        <div>
          <small>Mass number</small>
          <strong>
            {p0 + n0} → {p + n}
          </strong>
          <span>Protons + neutrons</span>
        </div>
        <div>
          <small>Overall charge</small>
          <strong>
            {formatCharge(p0 - e0)} → {formatCharge(p - e)}
          </strong>
          <span>Protons − electrons</span>
        </div>
      </div>
      <p className="bench-definition">
        {model.operation === "isotope"
          ? "Isotopes are atoms of the same element with different neutron numbers. Both neutral atoms keep the same electron arrangement; their chemical properties are the same in this GCSE model."
          : "An atom forms an ion by gaining or losing electrons. Losing negative electrons makes the charge more positive; gaining them makes it more negative. The nucleus is unchanged."}
      </p>
      <div className="bench-actions">
        <button
          className="button primary"
          onClick={() => {
            const result = checkBoard(model, board);
            setFeedback({ correct: result.correct, message: result.feedback });
          }}
        >
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setFeedback(null);
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setFeedback(null);
          }}
        >
          Reset model
        </button>
      </div>
      {feedback && (
        <p
          role="status"
          className={`feedback ${feedback.correct ? "correct" : ""}`}
        >
          {feedback.message}
        </p>
      )}
      <details className="model-boundaries">
        <summary>About this comparison</summary>
        <p>
          {model.operation === "isotope"
            ? "Changing neutrons here compares different atoms; it is not a chemical reaction that turns one isotope into another. Nuclear stability and radioactivity belong to later study."
            : "Only electron count changes during this ion-formation model. The view does not model transfer between two atoms or the energy needed to ionise them."}{" "}
          The nucleus is magnified. Shell boundaries are schematic and are not
          electron paths. Not every particle count you can try represents a
          stable isotope or a commonly formed ion.
        </p>
      </details>
    </section>
  );
}
export function TaskWorkbench({
  model,
  history,
  onChange,
}: {
  model: TaskModel;
  history: WorkbenchState[];
  onChange: (history: WorkbenchState[]) => void;
}) {
  const b = history.at(-1) ?? initialBoard(model);
  const [selected, setSelected] = useState("proton"),
    [message, setMessage] = useState(""),
    [correct, setCorrect] = useState(false);
  const change = (key: string, value: string | number) => {
    const next = { ...b, [key]: value };
    if (sameBoard(next, b)) return;
    if (history.length >= 500) {
      setMessage(
        "Undo or reset the model to continue exploring. Your answers are retained.",
      );
      return;
    }
    onChange([...history, next]);
    setMessage("");
    setCorrect(false);
  };
  const check = () => {
    const result = checkBoard(model, b);
    setMessage(result.feedback);
    setCorrect(result.correct);
  };
  const p = Number(b.p ?? 0),
    n = Number(b.n ?? 0),
    e = Number(b.e ?? 0),
    element = elements.find((item) => item.protons === p);
  if (model.kind === "atom-transform")
    return (
      <AtomTransformationWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "titration-technique")
    return (
      <TitrationTechniqueWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "bond-energy")
    return (
      <BondEnergyWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "reaction-profile")
    return (
      <ProfileWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "gas-test-investigation")
    return (
      <GasTestsWorkbench
        mode={model.mode}
        record={model.record}
        focus={model.focus}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "haber-investigation")
    return (
      <HaberWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "materials-investigation")
    return (
      <MaterialsWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "life-cycle-investigation")
    return (
      <LcaWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "bio-extraction-investigation")
    return (
      <BioWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "wastewater-investigation")
    return (
      <WasteWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "water-investigation")
    return (
      <WaterWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "carbon-cycle-investigation")
    return (
      <CycleWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "pollution-investigation")
    return (
      <PollutionWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "climate-investigation")
    return (
      <ClimateWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "greenhouse-investigation")
    return (
      <GreenhouseWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "atmosphere-investigation")
    return (
      <AtmosphereWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "separation-investigation")
    return (
      <SeparationWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "instrumental-investigation")
    return (
      <InstrumentalWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "ion-test-investigation")
    return (
      <IonTestsWorkbench
        mode={model.mode}
        record={model.record}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "chromatography-investigation")
    return (
      <ChromaWorkbench
        mode={model.mode}
        record={model.record}
        focus={model.focus}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "purity-separation")
    return (
      <PurityWorkbench
        mode={model.mode}
        record={model.record}
        focus={model.focus}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "natural-polymers")
    return (
      <NaturalWorkbench
        mode={model.mode}
        focus={model.focus}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "pathways")
    return (
      <OrganicPathwayWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "polymerisation")
    return (
      <PolymerisationWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "alcohol")
    return (
      <AlcoholWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "cracking")
    return (
      <CrackingWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "alkanes")
    return (
      <AlkaneWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "crude-oil")
    return (
      <CrudeOilWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history as Record<string, string>[]}
        onChange={onChange}
      />
    );
  if (model.kind === "rates-practical")
    return (
      <RatesPracticalWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "equilibrium-shift")
    return (
      <EquilibriumShiftWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "reversible-equilibrium")
    return (
      <ReversibleWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "temperature-catalysts")
    return (
      <ThermalWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "collision-theory")
    return (
      <CollisionWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "tangent-rates")
    return (
      <TangentWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "rate-measurement")
    return (
      <RatesWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "cell-voltage")
    return (
      <VoltageWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "fuel-half")
    return (
      <FuelHalfWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "cells-workbench")
    return (
      <CellsWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "energy-practical")
    return (
      <EnergyPracticalWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "thermal-transfer")
    return (
      <EnergyWorkbench
        mode={model.mode}
        record={model.record}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "displacement-redox")
    return (
      <DisplacementWorkbench
        record={model.record}
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "acid-evidence")
    return (
      <AcidStrengthWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "ph-evidence")
    return (
      <PhWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "electron-redox")
    return (
      <HalfEquationsWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "aqueous-products")
    return (
      <AqueousProductsWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "electrolysis-process")
    return (
      <ElectrolysisWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "soluble-salts")
    return (
      <SaltWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "acid-neutralisation")
    return (
      <AcidWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "metal-extraction")
    return (
      <MetalExtractionWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "oxygen-redox")
    return (
      <OxygenRedoxWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "metal-reactivity")
    return (
      <MetalReactivityWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "titration-calculations")
    return (
      <TitrationWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "empirical-formulae")
    return (
      <EmpiricalWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "gas-volumes")
    return (
      <GasWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "molar-concentration")
    return (
      <MolarWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "production-pathways")
    return (
      <PathwayWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "theoretical-yield")
    return (
      <TheoreticalWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "atom-economy")
    return (
      <EconomyWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "inverse-atom-economy")
    return (
      <InverseEconomyWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "percentage-yield")
    return (
      <YieldWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "limiting-reactants")
    return (
      <LimitingWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "balancing-masses")
    return (
      <MassBalanceWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "reacting-masses")
    return (
      <ReactingWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "mole-amounts")
    return (
      <MoleWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "changing-concentration")
    return (
      <ChangingConcentrationWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "solution-concentration")
    return (
      <ConcentrationWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "measurement-uncertainty")
    return (
      <MeasurementWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "mass-conservation")
    return (
      <MassWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "equation-balancing")
    return (
      <BalancingWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "percentage-composition")
    return (
      <CompositionWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "formula-mass")
    return (
      <FormulaMassWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "nano-properties")
    return (
      <NanoWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "state-properties")
    return (
      <StateWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "polymer-properties")
    return (
      <PolymerWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "nanotube-properties")
    return (
      <NanotubeWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "fullerene-properties")
    return (
      <FullereneWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "graphene-properties")
    return (
      <GrapheneWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "graphite-properties")
    return (
      <GraphiteWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "giant-covalent")
    return (
      <DiamondWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "metallic-properties")
    return (
      <MetallicWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "molecular-properties")
    return (
      <MolecularPropertiesWorkbench
        mode={model.mode}
        instruction={model.instruction}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "covalent-share")
    return (
      <CovalentWorkbench model={model} history={history} onChange={onChange} />
    );
  if (model.kind === "ionic-formula")
    return (
      <IonicFormulaWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "ionic-lattice" || model.kind === "ionic-conduction")
    return (
      <IonicStructureWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "ionic-transfer")
    return (
      <IonicTransferWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (
    model.kind === "transition-compare" ||
    model.kind === "transition-ion" ||
    model.kind === "transition-colour" ||
    model.kind === "transition-catalyst"
  )
    return (
      <TransitionWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "noble-use")
    return (
      <NobleUseWorkbench model={model} history={history} onChange={onChange} />
    );
  if (
    model.kind === "halogen-particle" ||
    model.kind === "halogen-phase" ||
    model.kind === "halogen-displacement"
  )
    return (
      <HalogenWorkbench model={model} history={history} onChange={onChange} />
    );
  if (
    model.kind === "alkali-reaction" ||
    model.kind === "alkali-water-equation"
  )
    return (
      <AlkaliWorkbench model={model} history={history} onChange={onChange} />
    );
  if (model.kind === "periodic-place")
    return (
      <PeriodicPositionWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "historical-gap")
    return (
      <HistoricalGapWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "historical-test")
    return (
      <HistoricalTestWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "isotope-mixture")
    return (
      <IsotopeMixtureWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  if (model.kind === "nano-convert" || model.kind === "atomic-scale")
    return (
      <ScaleWorkbench model={model} history={history} onChange={onChange} />
    );
  if (model.kind === "shell-place")
    return (
      <ShellWorkbench model={model} history={history} onChange={onChange} />
    );
  if (model.kind === "scattering")
    return (
      <ScatteringWorkbench
        model={model}
        history={history}
        onChange={onChange}
      />
    );
  return (
    <section
      className="model task-workbench"
      data-model={model.kind}
      aria-label="Task model"
    >
      {model.kind === "particles" ? (
        <>
          <p className="bench-instruction">
            Choose a particle, then place it in a region.
          </p>
          <div className="particle-tray" aria-label="Particle tray">
            {particles.map((particle) => (
              <button
                className="particle-choice"
                key={particle.key}
                aria-label={`Choose ${particle.key}`}
                aria-pressed={selected === particle.key}
                onClick={() => setSelected(particle.key)}
              >
                <span className={`particle-token ${particle.key}`}>
                  {particle.short}
                </span>
                <strong>{particle.name}</strong>
                <small>
                  Charge {particle.charge}
                  <br />
                  Relative mass {particle.mass}
                </small>
              </button>
            ))}
          </div>
          <div className="placement-actions">
            <button
              className="button"
              onClick={() => change(selected, "nucleus")}
              aria-label={`Place ${selected} in nucleus`}
            >
              Place in nucleus
            </button>
            <button
              className="button"
              onClick={() => change(selected, "shells")}
              aria-label={`Place ${selected} in shells`}
            >
              Place in shells
            </button>
          </div>
          <ParticleDiagram protons={0} neutrons={0} electrons={0} placed={b} />
          <div className="region-ledger">
            <div>
              <strong>Nucleus</strong>
              <span>
                {particles
                  .filter((p) => b[p.key] === "nucleus")
                  .map((p) => p.name)
                  .join(" · ") || "No labels placed"}
              </span>
            </div>
            <div>
              <strong>Shells</strong>
              <span>
                {particles
                  .filter((p) => b[p.key] === "shells")
                  .map((p) => p.name)
                  .join(" · ") || "No labels placed"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="bench-instruction">{model.instruction}</p>
          <div className="particle-counters">
            {(
              [
                ["p", "proton", 1, 20],
                ["n", "neutron", 0, 30],
                ["e", "electron", 0, 20],
              ] as const
            ).map(([key, kind, min, max]) => (
              <div key={key} className="particle-counter">
                <span className={`particle-token ${kind}`}>
                  {particles.find((p) => p.key === kind)!.short}
                </span>
                <strong>{kind[0].toUpperCase() + kind.slice(1)}s</strong>
                <div className="counter-steps">
                  <button
                    aria-label={`Remove ${kind}`}
                    disabled={Number(b[key]) <= min}
                    onClick={() => change(key, Number(b[key]) - 1)}
                  >
                    −
                  </button>
                  <output
                    aria-label={`${kind[0].toUpperCase() + kind.slice(1)} count`}
                  >
                    {b[key]}
                  </output>
                  <button
                    aria-label={`Add ${kind}`}
                    disabled={Number(b[key]) >= max}
                    onClick={() => change(key, Number(b[key]) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <AtomScene3D
            protons={p}
            neutrons={n}
            electrons={e}
            fallback={
              <ParticleDiagram protons={p} neutrons={n} electrons={e} />
            }
          />
          <div className="atom-ledger">
            <div>
              <small>Atomic number</small>
              <strong>Z = {p}</strong>
              <span>
                {element?.name}: {p} protons define it
              </span>
            </div>
            <div>
              <small>Mass number</small>
              <strong>
                {p} + {n} = {p + n}
              </strong>
              <span>Protons + neutrons</span>
            </div>
            <div>
              <small>Overall charge</small>
              <strong>
                {p} − {e} = {p - e > 0 ? "+" : ""}
                {p - e}
              </strong>
              <span>Protons − electrons</span>
            </div>
          </div>
          <p className="bench-definition">
            Atomic number counts protons. Mass number counts protons and
            neutrons; it is a whole-number count, not a mass in grams. Equal
            proton and electron counts make the overall charge zero.
          </p>
        </>
      )}
      <div className="bench-actions">
        <button className="button primary" onClick={check}>
          Check model
        </button>
        <button
          className="text-button"
          disabled={history.length <= 1}
          onClick={() => {
            onChange(history.slice(0, -1));
            setMessage("");
          }}
        >
          Undo
        </button>
        <button
          className="text-button"
          onClick={() => {
            onChange([initialBoard(model)]);
            setMessage(
              "Model reset. Your answers and exposure history are retained.",
            );
            setCorrect(false);
          }}
        >
          Reset model
        </button>
      </div>
      {message && (
        <p className={`feedback ${correct ? "correct" : ""}`} role="status">
          {message}
        </p>
      )}
      <details className="model-boundaries">
        <summary>About this model</summary>
        <p>
          {model.kind === "particles"
            ? "The labels represent particle types, not the particle count of a particular atom."
            : "This is a count model for introductory GCSE atomic structure. Not every possible count combination is a stable isotope or ion; changing a proton is an identity experiment, not ordinary chemical ion formation."}{" "}
          The nucleus is enlarged so you can see its particles. Shells show
          electron counts, not actual paths or a physical scale.
        </p>
      </details>
    </section>
  );
}

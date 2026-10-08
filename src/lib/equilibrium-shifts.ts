/** GCSE qualitative equilibrium. Supplied numerical states are illustrative data, not yield predictions. */
export type Shift = "forward" | "reverse" | "unchanged" | "insufficient";
export type ShiftMode =
  | "compression"
  | "pressure"
  | "temperature"
  | "concentration"
  | "combined"
  | "evidence";
export type GasInventory = {
  nitrogen: number;
  hydrogen: number;
  ammonia: number;
};
export type CompressionRecord = {
  title: string;
  initial: GasInventory;
  later: GasInventory;
  volume: number;
};
export const compressionRecords: Record<string, CompressionRecord> = {
  initial: {
    title: "Compress mixture A",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 8 },
    later: { nitrogen: 3, hydrogen: 9, ammonia: 10 },
    volume: 0.45,
  },
  lowAmmonia: {
    title: "Compress mixture B",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 4 },
    later: { nitrogen: 3, hydrogen: 9, ammonia: 6 },
    volume: 0.375,
  },
  highAmmonia: {
    title: "Compress mixture C",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 12 },
    later: { nitrogen: 3, hydrogen: 9, ammonia: 14 },
    volume: 27 / 56,
  },
  expandA: {
    title: "Expand mixture A",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 8 },
    later: { nitrogen: 5, hydrogen: 15, ammonia: 6 },
    volume: 25 / 12,
  },
  expandB: {
    title: "Expand mixture B",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 4 },
    later: { nitrogen: 5, hydrogen: 15, ammonia: 2 },
    volume: 25 / 8,
  },
  expandC: {
    title: "Expand mixture C",
    initial: { nitrogen: 4, hydrogen: 12, ammonia: 12 },
    later: { nitrogen: 5, hydrogen: 15, ammonia: 10 },
    volume: 15 / 8,
  },
};
export function gasTotal(i: GasInventory) {
  return i.nitrogen + i.hydrogen + i.ammonia;
}
export function atomTotals(i: GasInventory) {
  return {
    nitrogen: 2 * i.nitrogen + i.ammonia,
    hydrogen: 2 * i.hydrogen + 3 * i.ammonia,
  };
}
export function compressionSnapshot(record: CompressionRecord, stage: number) {
  return {
    inventory: stage === 2 ? record.later : record.initial,
    volume: stage === 0 ? 1 : record.volume,
  };
}
export type PressureRecord = {
  title: string;
  equation: string;
  left: number;
  right: number;
  increase: boolean;
  explanation: string;
};
export const pressureRecords: Record<string, PressureRecord> = {
  initial: {
    title: "Ammonia: higher pressure",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    increase: true,
    explanation: "Four gaseous molecules on the left, two on the right.",
  },
  ammoniaLower: {
    title: "Ammonia: lower pressure",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    increase: false,
    explanation: "Lower pressure favours the side with four gaseous molecules.",
  },
  equal: {
    title: "Hydrogen iodide: higher pressure",
    equation: "H₂(g) + I₂(g) ⇌ 2HI(g)",
    left: 2,
    right: 2,
    increase: true,
    explanation:
      "Both sides have two gaseous molecules, so neither side is favoured.",
  },
  carbonate: {
    title: "Solid carbonate and gas",
    equation: "CaCO₃(s) ⇌ CaO(s) + CO₂(g)",
    left: 0,
    right: 1,
    increase: true,
    explanation: "Only CO₂ is gaseous. Do not count either solid as gas.",
  },
  nitrogenDioxide: {
    title: "Dimer formation: lower pressure",
    equation: "2NO₂(g) ⇌ N₂O₄(g)",
    left: 2,
    right: 1,
    increase: false,
    explanation: "Lower pressure favours two gas molecules on the left.",
  },
  unfamiliar: {
    title: "Given gas reaction: higher pressure",
    equation: "2A(g) ⇌ B(g) + 2C(g)",
    left: 2,
    right: 3,
    increase: true,
    explanation:
      "Count coefficients, not the number of different substance names.",
  },
};
export function pressureShift(r: PressureRecord): Shift {
  return r.left === r.right
    ? "unchanged"
    : (r.increase ? r.right < r.left : r.right > r.left)
      ? "forward"
      : "reverse";
}
export type TemperatureRecord = {
  title: string;
  equation: string;
  forward: "exothermic" | "endothermic";
  heating: boolean;
};
export const temperatureRecords: Record<string, TemperatureRecord> = {
  initial: {
    title: "Heat an exothermic equilibrium",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    forward: "exothermic",
    heating: true,
  },
  coolAmmonia: {
    title: "Cool the ammonia equilibrium",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    forward: "exothermic",
    heating: false,
  },
  heatNitrogenOxide: {
    title: "Heat an endothermic equilibrium",
    equation: "N₂(g) + O₂(g) ⇌ 2NO(g)",
    forward: "endothermic",
    heating: true,
  },
  coolNitrogenOxide: {
    title: "Cool an endothermic equilibrium",
    equation: "N₂(g) + O₂(g) ⇌ 2NO(g)",
    forward: "endothermic",
    heating: false,
  },
  reverseEquation: {
    title: "Read the reversed equation",
    equation: "N₂O₄(g) ⇌ 2NO₂(g)",
    forward: "endothermic",
    heating: true,
  },
  unfamiliar: {
    title: "Use the supplied energy direction",
    equation: "X(aq) ⇌ Y(aq)",
    forward: "exothermic",
    heating: false,
  },
};
export function temperatureShift(r: TemperatureRecord): Shift {
  return r.heating === (r.forward === "endothermic") ? "forward" : "reverse";
}
export type ConcentrationRecord = {
  title: string;
  equation: string;
  initial: [number, number];
  immediate: [number, number];
  later: [number, number];
  edited: "reactant" | "product";
  action: "added" | "removed";
};
export const concentrationRecords: Record<string, ConcentrationRecord> = {
  initial: {
    title: "Add reactant",
    equation: "P(aq) ⇌ Q(aq)",
    initial: [6, 4],
    immediate: [11, 4],
    later: [9, 6],
    edited: "reactant",
    action: "added",
  },
  addProduct: {
    title: "Add product",
    equation: "P(aq) ⇌ Q(aq)",
    initial: [6, 4],
    immediate: [6, 9],
    later: [9, 6],
    edited: "product",
    action: "added",
  },
  removeProduct: {
    title: "Remove some product",
    equation: "P(aq) ⇌ Q(aq)",
    initial: [6, 4],
    immediate: [6, 2],
    later: [4.8, 3.2],
    edited: "product",
    action: "removed",
  },
  removeReactant: {
    title: "Remove some reactant",
    equation: "P(aq) ⇌ Q(aq)",
    initial: [6, 4],
    immediate: [4, 4],
    later: [4.8, 3.2],
    edited: "reactant",
    action: "removed",
  },
  secondAdd: {
    title: "Another starting composition: add reactant",
    equation: "R(aq) ⇌ S(aq)",
    initial: [8, 2],
    immediate: [13, 2],
    later: [12, 3],
    edited: "reactant",
    action: "added",
  },
  secondRemove: {
    title: "Another starting composition: remove product",
    equation: "R(aq) ⇌ S(aq)",
    initial: [8, 2],
    immediate: [8, 1],
    later: [7.2, 1.8],
    edited: "product",
    action: "removed",
  },
};
export function concentrationShift(r: ConcentrationRecord): Shift {
  return (r.edited === "reactant") === (r.action === "added")
    ? "forward"
    : "reverse";
}
export type CombinedRecord = {
  title: string;
  equation: string;
  left: number;
  right: number;
  forward: "exothermic" | "endothermic";
  increasePressure: boolean;
  heating: boolean;
};
export const combinedRecords: Record<string, CombinedRecord> = {
  initial: {
    title: "Heat and compress ammonia",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    forward: "exothermic",
    increasePressure: true,
    heating: true,
  },
  bothForward: {
    title: "Cool and compress ammonia",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    forward: "exothermic",
    increasePressure: true,
    heating: false,
  },
  bothReverse: {
    title: "Heat and expand ammonia",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    forward: "exothermic",
    increasePressure: false,
    heating: true,
  },
  opposedCooling: {
    title: "Cool and expand ammonia",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)",
    left: 4,
    right: 2,
    forward: "exothermic",
    increasePressure: false,
    heating: false,
  },
  equalGas: {
    title: "Heating with equal gas coefficients",
    equation: "N₂(g) + O₂(g) ⇌ 2NO(g)",
    left: 2,
    right: 2,
    forward: "endothermic",
    increasePressure: true,
    heating: true,
  },
  unfamiliar: {
    title: "Two changes in a supplied equilibrium",
    equation: "2A(g) ⇌ B(g)",
    left: 2,
    right: 1,
    forward: "endothermic",
    increasePressure: true,
    heating: true,
  },
};
export function combinedShifts(r: CombinedRecord) {
  const pressure = pressureShift({
    ...r,
    increase: r.increasePressure,
    explanation: "",
  });
  const temperature = temperatureShift(r);
  return {
    pressure,
    temperature,
    overall:
      pressure === "unchanged" || pressure === temperature
        ? temperature
        : ("insufficient" as Shift),
  };
}
export type EvidenceRecord = {
  title: string;
  context: string;
  times: number[];
  control: number[];
  changed: number[];
  final: "higher" | "lower" | "same";
  arrival: "earlier" | "later" | "same";
  explanation: string;
};
export const shiftEvidence: Record<string, EvidenceRecord> = {
  initial: {
    title: "Catalyst comparison",
    context:
      "Same initial mixture, temperature and volume. Supplied product concentrations in mol/dm³.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.4, 0.65, 0.8, 0.8],
    changed: [0, 0.8, 0.8, 0.8, 0.8],
    final: "same",
    arrival: "earlier",
    explanation:
      "Catalyst accelerates both directions. The supplied final concentration is unchanged, but reached sooner.",
  },
  lessCatalyst: {
    title: "Less catalyst comparison",
    context:
      "Same initial mixture, temperature and volume; only catalyst amount differs. Supplied product concentrations in mol/dm³.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.6, 0.6, 0.6, 0.6],
    changed: [0, 0.3, 0.48, 0.6, 0.6],
    final: "same",
    arrival: "later",
    explanation:
      "Less catalyst delays the supplied approach without changing the equilibrium concentration.",
  },
  coolExothermic: {
    title: "Cooling an exothermic forward reaction",
    context:
      "Two runs from the same initial composition at different temperatures. Supplied product concentrations in mol/dm³.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.4, 0.5, 0.5, 0.5],
    changed: [0, 0.25, 0.45, 0.7, 0.7],
    final: "higher",
    arrival: "later",
    explanation:
      "Cooling favours exothermic product formation but the supplied run reaches its new equilibrium later.",
  },
  heatExothermic: {
    title: "Heating an exothermic forward reaction",
    context:
      "Two runs from the same initial composition at different temperatures. Supplied product concentrations in mol/dm³.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.3, 0.6, 0.8, 0.8],
    changed: [0, 0.5, 0.5, 0.5, 0.5],
    final: "lower",
    arrival: "earlier",
    explanation:
      "A faster approach does not imply a greater equilibrium product concentration.",
  },
  heatEndothermic: {
    title: "Heating an endothermic forward reaction",
    context:
      "Two runs from the same initial composition at different temperatures. Supplied product concentrations in mol/dm³.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.2, 0.4, 0.5, 0.5],
    changed: [0, 0.8, 0.8, 0.8, 0.8],
    final: "higher",
    arrival: "earlier",
    explanation:
      "Heating favours the endothermic forward direction; the supplied run also reaches its plateau sooner.",
  },
  sameArrival: {
    title: "Same sampled arrival, different final amounts",
    context:
      "Two runs at different conditions. Supplied concentrations and discrete sampling times; no exact between-sample arrival claimed.",
    times: [0, 2, 4, 6, 8],
    control: [0, 0.3, 0.6, 0.6, 0.6],
    changed: [0, 0.4, 0.8, 0.8, 0.8],
    final: "higher",
    arrival: "same",
    explanation:
      "Both first reach their continuing plateau at the 4-minute sample; this does not mean equal final amounts or identical rate histories.",
  },
};
export function plateauTime(times: number[], values: number[]) {
  return times[
    values.findIndex(
      (v, i) => i < values.length - 1 && values.slice(i).every((x) => x === v),
    )
  ];
}

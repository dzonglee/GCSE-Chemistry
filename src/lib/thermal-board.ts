import {
  adequateCount,
  additiveEvidence,
  energySamples,
  thermalClaims,
  thermalComparisons,
  thermalProfiles,
  thresholdSamples,
} from "./temperature-catalysts";
import type { ThermalMode } from "./temperature-catalysts";
export type ThermalBoard = Record<string, string>;
export const thermalRecords = {
  heating: energySamples,
  threshold: thresholdSamples,
  profile: thermalProfiles,
  identification: additiveEvidence,
  comparison: thermalComparisons,
  evidence: thermalClaims,
};
const fields = {
  heating: [
    "record",
    "state",
    "adequate",
    "total",
    "average",
    "frequency",
    "barrier",
  ],
  threshold: ["record", "pathway", "adequate", "total", "average", "barrier"],
  profile: ["record", "peak", "activation", "change", "endpoints"],
  identification: ["record", "classification", "reason"],
  comparison: ["record", "rateA", "rateB", "greater", "final"],
  evidence: ["record", "claim", "reason"],
} as const;
const options: Partial<Record<ThermalMode, Record<string, readonly string[]>>> =
  {
    heating: {
      state: ["cool", "warm"],
      average: ["", "higher", "same", "lower"],
      frequency: ["", "higher", "same", "lower"],
      barrier: ["", "same", "lower", "higher"],
    },
    threshold: {
      pathway: ["original", "catalysed"],
      average: ["", "same", "higher", "lower"],
      barrier: ["", "lower", "same", "higher"],
    },
    profile: { endpoints: ["", "same", "changed"] },
    identification: {
      classification: ["", "supports", "reactant", "insufficient"],
      reason: [
        "",
        "rateIdentityControls",
        "consumed",
        "massAlone",
        "confounded",
        "noRateChange",
      ],
    },
    comparison: {
      greater: ["", "A", "B", "equal"],
      final: ["", "same", "greater", "lower"],
    },
    evidence: {
      claim: [
        "",
        "barrier",
        "energy",
        "time",
        "regenerated",
        "specific",
        "noUniversalFactor",
      ],
      reason: [
        "",
        "pathway",
        "temperature",
        "amount",
        "overall",
        "conditions",
        "measurements",
      ],
    },
  };
const unsigned = /^(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/;
const signed = /^-?(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/;
export function initialThermalBoard(
  mode: ThermalMode,
  record = "initial",
): ThermalBoard {
  const result = Object.fromEntries(
    fields[mode].map((k) => [
      k,
      k === "record" ? record : options[mode]?.[k] ? "" : "0",
    ]),
  );
  if (mode === "heating") result.state = "cool";
  if (mode === "threshold") result.pathway = "original";
  if (mode === "profile")
    result.peak = String(
      thermalProfiles[record as keyof typeof thermalProfiles]?.original ?? 100,
    );
  return result;
}
export function validThermalBoard(
  mode: ThermalMode,
  value: unknown,
): value is ThermalBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as ThermalBoard,
    keys = fields[mode];
  if (
    Object.keys(b).length !== keys.length ||
    keys.some((k) => typeof b[k] !== "string")
  )
    return false;
  if (!Object.hasOwn(thermalRecords[mode], b.record)) return false;
  return keys.every(
    (k) =>
      k === "record" ||
      (options[mode]?.[k]
        ? options[mode]![k].includes(b[k])
        : (k === "change" ? signed : unsigned).test(b[k]) &&
          Number.isFinite(Number(b[k])) &&
          Math.abs(Number(b[k])) <= 100000),
  );
}
export function thermalHistoryStep(
  mode: ThermalMode,
  a: Record<string, string | number>,
  b: Record<string, string | number>,
) {
  if (!validThermalBoard(mode, a) || !validThermalBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const reset = initialThermalBoard(mode, b.record);
    return fields[mode].every((k) => b[k] === reset[k]);
  }
  return fields[mode].filter((k) => a[k] !== b[k]).length === 1;
}
const near = (a: string, b: number) => Math.abs(Number(a) - b) < 1e-8;
export function thermalBoardCheck(
  mode: ThermalMode,
  b: Record<string, string | number>,
): { correct: boolean; message: string } {
  if (!validThermalBoard(mode, b))
    return {
      correct: false,
      message:
        "Finish each field using a plain number or one of the supplied choices.",
    };
  const fail = (message: string) => ({ correct: false, message });
  const pass = (message: string) => ({ correct: true, message });
  if (mode === "heating") {
    const r = energySamples[b.record as keyof typeof energySamples],
      energies = b.state === "warm" ? r.warm : r.cool;
    if (b.state !== "warm")
      return fail(
        "Choose the warmer supplied snapshot while keeping the count and pathway fixed.",
      );
    if (
      !near(b.adequate, adequateCount(energies, r.barrier)) ||
      !near(b.total, energies.length)
    )
      return fail(
        "Count all supplied encounters, then those with energy at least the stated minimum. Equality meets the minimum.",
      );
    if (
      b.average !== "higher" ||
      b.frequency !== "higher" ||
      b.barrier !== "same"
    )
      return fail(
        "Heating raises average particle energy and expected collision frequency. It does not lower the activation energy of the unchanged pathway.",
      );
    return pass(
      `The warmer snapshot has ${adequateCount(energies, r.barrier)} of ${energies.length} encounters meeting the energy condition. Higher temperature raises average energy and collision frequency; the barrier stays fixed. These constructed energies are not an exact reaction-rate prediction.`,
    );
  }
  if (mode === "threshold") {
    const r = thresholdSamples[b.record as keyof typeof thresholdSamples];
    if (b.pathway !== "catalysed")
      return fail(
        "Select the catalysed pathway without changing the supplied encounter energies.",
      );
    if (
      !near(b.adequate, adequateCount(r.energies, r.catalysed)) ||
      !near(b.total, r.energies.length)
    )
      return fail(
        "Count energies at or above the catalysed minimum. The total encounter count is conserved.",
      );
    if (b.average !== "same" || b.barrier !== "lower")
      return fail(
        "At unchanged temperature, the catalyst lowers the barrier through a different pathway; it does not raise particle kinetic energies.",
      );
    return pass(
      `${adequateCount(r.energies, r.catalysed)} of ${r.energies.length} supplied encounters meet the lower minimum. Their energies are unchanged. The energy condition alone does not guarantee every real collision reacts or specify an exact rate factor.`,
    );
  }
  if (mode === "profile") {
    const r = thermalProfiles[b.record as keyof typeof thermalProfiles];
    if (!near(b.peak, r.reactant + r.catalysedEa))
      return fail(
        "Build the catalysed peak by adding its forward activation energy to the reactant level, rather than to zero.",
      );
    if (!near(b.activation, r.catalysedEa))
      return fail(
        "Forward activation energy is the peak minus the reactant level.",
      );
    if (!near(b.change, r.product - r.reactant) || b.endpoints !== "same")
      return fail(
        "The catalyst preserves the same reactant and product energy levels. Overall change is products minus reactants, including its sign.",
      );
    return pass(
      `Catalysed activation energy is ${r.catalysedEa} kJ; overall energy change stays ${r.product - r.reactant} kJ for this stated reaction amount. The vertical energy axis is not physical height.`,
    );
  }
  if (mode === "identification") {
    const r = additiveEvidence[b.record as keyof typeof additiveEvidence];
    const reason = !r.controlled
      ? "confounded"
      : r.answer === "reactant"
        ? "consumed"
        : !r.faster
          ? "noRateChange"
          : r.sameIdentity === null
            ? "massAlone"
            : "rateIdentityControls";
    if (b.classification !== r.answer || b.reason !== reason)
      return fail(
        "Use the rate comparison, controls and chemical identity together. Unchanged recovered mass alone does not establish catalysis; consumed material is not regenerated overall.",
      );
    return pass(
      "The classification follows the stated controlled observations. A catalyst may participate during a reaction but is regenerated overall; evidence of unchanged mass alone is insufficient.",
    );
  }
  if (mode === "comparison") {
    const r = thermalComparisons[b.record as keyof typeof thermalComparisons],
      a = r.amountA / r.timeA,
      c = r.amountB / r.timeB;
    if (!near(b.rateA, a) || !near(b.rateB, c))
      return fail(
        "Calculate each measured mean as its own collected amount divided by its own time, retaining the supplied units.",
      );
    if (
      b.greater !== (a === c ? "equal" : a > c ? "A" : "B") ||
      b.final !== "same"
    )
      return fail(
        "Compare measured mean rates, then the stated final amounts separately. Faster completion does not create more available product from the same fixed reactants.",
      );
    return pass(
      `Measured mean rates are ${Number(a.toPrecision(6))} and ${Number(c.toPrecision(6))} ${r.unit}. The stated complete reactions finish at the same amount. These data do not establish a universal temperature or catalyst multiplier.`,
    );
  }
  const r = thermalClaims[b.record as keyof typeof thermalClaims];
  if (b.claim !== r.claim || b.reason !== r.reason)
    return fail(
      "Separate changing particle energies, changing a reaction pathway, final reactant-limited amount and regeneration overall. Use the condition actually changed.",
    );
  return pass(
    "The supported claim follows the stated comparison. Temperature, activation energy, complete-reaction amount and catalyst regeneration describe different quantities.",
  );
}

import {
  compressionRecords,
  pressureRecords,
  temperatureRecords,
  concentrationRecords,
  combinedRecords,
  shiftEvidence,
  gasTotal,
  pressureShift,
  temperatureShift,
  concentrationShift,
  combinedShifts,
  plateauTime,
  type ShiftMode,
} from "./equilibrium-shifts";
export type ShiftBoard = Record<string, string>;
export const shiftRecords = {
  compression: compressionRecords,
  pressure: pressureRecords,
  temperature: temperatureRecords,
  concentration: concentrationRecords,
  combined: combinedRecords,
  evidence: shiftEvidence,
};
export const shiftFields: Record<ShiftMode, string[]> = {
  compression: [
    "record",
    "step",
    "immediate",
    "later",
    "direction",
    "response",
  ],
  pressure: ["record", "left", "right", "direction", "reason"],
  temperature: ["record", "favoured", "direction", "rate"],
  concentration: ["record", "immediate", "later", "direction", "response"],
  combined: ["record", "pressure", "temperature", "overall", "reason"],
  evidence: ["record", "final", "arrival", "controlTime", "changedTime"],
};
const shifts = ["", "forward", "reverse", "unchanged", "insufficient"];
export const shiftChoices: Partial<
  Record<ShiftMode, Record<string, readonly string[]>>
> = {
  compression: {
    direction: shifts,
    response: ["", "partial", "complete", "noResponse"],
  },
  pressure: {
    direction: shifts,
    reason: ["", "fewerGas", "moreGas", "equalGas", "heavierGas"],
  },
  temperature: {
    favoured: ["", "exothermic", "endothermic"],
    direction: shifts,
    rate: ["", "faster", "slower", "unchanged"],
  },
  concentration: {
    direction: shifts,
    response: ["", "partial", "complete", "noResponse"],
  },
  combined: {
    pressure: shifts,
    temperature: shifts,
    overall: shifts,
    reason: ["", "agree", "oppose", "pressureNeutral", "temperatureNeutral"],
  },
  evidence: {
    final: ["", "higher", "lower", "same"],
    arrival: ["", "earlier", "later", "same"],
  },
};
export function initialShiftBoard(
  mode: ShiftMode,
  record = "initial",
): ShiftBoard {
  return Object.fromEntries(
    shiftFields[mode].map((k) => [
      k,
      k === "record" ? record : shiftChoices[mode]?.[k] ? "" : "0",
    ]),
  );
}
export function validShiftBoard(
  mode: ShiftMode,
  value: unknown,
): value is ShiftBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as ShiftBoard;
  if (
    Object.keys(b).length !== shiftFields[mode].length ||
    !Object.hasOwn(shiftRecords[mode], b.record)
  )
    return false;
  return shiftFields[mode].every((k) => {
    if (typeof b[k] !== "string") return false;
    if (k === "record") return true;
    if (mode === "compression" && k === "step")
      return ["0", "1", "2"].includes(b[k]);
    if (mode === "pressure" || mode === "compression")
      return shiftChoices[mode]?.[k]
        ? shiftChoices[mode]![k].includes(b[k])
        : /^(?:0|[1-9]\d{0,5})$/.test(b[k]) && Number(b[k]) <= 100000;
    return shiftChoices[mode]?.[k]
      ? shiftChoices[mode]![k].includes(b[k])
      : /^(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/.test(b[k]) &&
          Number(b[k]) <= 100000;
  });
}
export function shiftHistoryStep(
  mode: ShiftMode,
  a: Record<string, string | number>,
  b: Record<string, string | number>,
) {
  if (!validShiftBoard(mode, a) || !validShiftBoard(mode, b)) return false;
  if (a.record !== b.record) {
    const reset = initialShiftBoard(mode, b.record);
    return shiftFields[mode].every((k) => reset[k] === b[k]);
  }
  const changed = shiftFields[mode].filter((k) => a[k] !== b[k]);
  return (
    changed.length === 1 &&
    (mode !== "compression" ||
      changed[0] !== "step" ||
      Number(b.step) === Number(a.step) + 1)
  );
}
export function expectedShiftBoard(
  mode: ShiftMode,
  record: string,
): ShiftBoard {
  const b = initialShiftBoard(mode, record);
  switch (mode) {
    case "compression": {
      const r = compressionRecords[record];
      return {
        ...b,
        step: "2",
        immediate: String(gasTotal(r.initial)),
        later: String(gasTotal(r.later)),
        direction: r.volume < 1 ? "forward" : "reverse",
        response: "partial",
      };
    }
    case "pressure": {
      const r = pressureRecords[record];
      return {
        ...b,
        left: String(r.left),
        right: String(r.right),
        direction: pressureShift(r),
        reason:
          r.left === r.right ? "equalGas" : r.increase ? "fewerGas" : "moreGas",
      };
    }
    case "temperature": {
      const r = temperatureRecords[record];
      return {
        ...b,
        favoured: r.heating ? "endothermic" : "exothermic",
        direction: temperatureShift(r),
        rate: r.heating ? "faster" : "slower",
      };
    }
    case "concentration": {
      const r = concentrationRecords[record],
        index = r.edited === "reactant" ? 0 : 1;
      return {
        ...b,
        immediate: String(r.immediate[index]),
        later: String(r.later[index]),
        direction: concentrationShift(r),
        response: "partial",
      };
    }
    case "combined": {
      const r = combinedShifts(combinedRecords[record]);
      return {
        ...b,
        ...r,
        reason:
          r.pressure === "unchanged"
            ? "pressureNeutral"
            : r.pressure === r.temperature
              ? "agree"
              : "oppose",
      };
    }
    case "evidence": {
      const r = shiftEvidence[record];
      return {
        ...b,
        final: r.final,
        arrival: r.arrival,
        controlTime: String(plateauTime(r.times, r.control)),
        changedTime: String(plateauTime(r.times, r.changed)),
      };
    }
  }
}
export function shiftBoardCheck(
  mode: ShiftMode,
  value: Record<string, string | number>,
) {
  if (!validShiftBoard(mode, value))
    return {
      correct: false,
      message:
        "Use complete choices and ordinary decimal numbers for this supplied comparison.",
    };
  const expected = expectedShiftBoard(mode, value.record);
  const correct = shiftFields[mode].every(
    (k) =>
      k === "record" ||
      (shiftChoices[mode]?.[k] || k === "step"
        ? value[k] === expected[k]
        : Math.abs(Number(value[k]) - Number(expected[k])) < 1e-8),
  );
  let explanation = "";
  switch (mode) {
    case "compression":
      explanation =
        "Changing volume does not immediately create or remove molecules. The supplied later reaction conserves atoms and partially opposes the pressure change.";
      break;
    case "pressure":
      explanation = pressureRecords[value.record].explanation;
      break;
    case "temperature":
      explanation =
        "Heating favours the endothermic direction; cooling favours the exothermic direction. Compare the displayed forward equation. Reaction speed and equilibrium composition are separate decisions.";
      break;
    case "concentration":
      explanation =
        "Compare the later value with the immediately edited mixture. Reaction partially opposes the edit; it need not restore the original concentration.";
      break;
    case "combined":
      explanation =
        "Determine each effect separately. Agreeing effects give a direction; equal gas totals give no pressure shift. Opposing effects need additional evidence to determine the overall change.";
      break;
    case "evidence":
      explanation = shiftEvidence[value.record].explanation;
      break;
  }
  return {
    correct,
    message:
      (correct
        ? "That comparison is consistent. "
        : "Check each prediction against the supplied conditions. ") +
      explanation,
  };
}

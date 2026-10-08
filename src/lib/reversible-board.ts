import {
  directionRecords,
  reversibleEnergies,
  turnoverRecords,
  turnoverMax,
  tokenSnapshot,
  reversibleRates,
  rateOutcome,
  boundaryRecords,
  equilibriumEvidence,
} from "./reversible-equilibrium";
import type { ReversibleMode } from "./reversible-equilibrium";
export type ReversibleBoard = Record<string, string>;
export const reversibleRecords = {
  direction: directionRecords,
  energy: reversibleEnergies,
  turnover: turnoverRecords,
  rates: reversibleRates,
  boundary: boundaryRecords,
  evidence: equilibriumEvidence,
};
const fields = {
  direction: ["record", "direction", "input", "output", "condition"],
  energy: ["record", "direction", "change", "magnitude", "flow"],
  turnover: [
    "record",
    "step",
    "a",
    "b",
    "forward",
    "reverse",
    "classification",
  ],
  rates: ["record", "net", "a", "b", "classification"],
  boundary: ["record", "classification", "reason"],
  evidence: ["record", "time", "reason"],
} as const;
export const boardChoices: Partial<
  Record<ReversibleMode, Record<string, readonly string[]>>
> = {
  direction: {
    direction: ["forward", "reverse"],
    input: ["", "left", "right"],
    output: ["", "left", "right"],
    condition: ["", "forward", "reverse"],
  },
  energy: {
    direction: ["forward", "reverse"],
    flow: ["", "toSurroundings", "fromSurroundings"],
  },
  turnover: { classification: ["", "equilibrium", "notEquilibrium"] },
  rates: { classification: ["", "equilibrium", "notEquilibrium"] },
  boundary: {
    classification: ["", "equilibrium", "notEquilibrium", "insufficient"],
    reason: [
      "",
      "closedEqualContinuing",
      "matterEscapes",
      "noContinuing",
      "amountsNotRates",
      "externalFlow",
      "plateauAlone",
    ],
  },
  evidence: {
    time: [""],
    reason: [
      "",
      "equalContinuing",
      "amountsNotRates",
      "noContinuing",
      "externalFlow",
    ],
  },
};
const unsigned = /^(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/,
  signed = /^-?(?:0|[1-9]\d{0,5})(?:\.\d{1,10})?$/;
export function initialReversibleBoard(
  mode: ReversibleMode,
  record = "initial",
): ReversibleBoard {
  const result = Object.fromEntries(
    fields[mode].map((k) => [
      k,
      k === "record" ? record : boardChoices[mode]?.[k] ? "" : "0",
    ]),
  );
  if (mode === "direction" || mode === "energy") result.direction = "forward";
  return result;
}
export function validReversibleBoard(
  mode: ReversibleMode,
  value: unknown,
): value is ReversibleBoard {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as ReversibleBoard,
    keys = fields[mode];
  if (
    Object.keys(b).length !== keys.length ||
    keys.some((k) => typeof b[k] !== "string") ||
    !Object.hasOwn(reversibleRecords[mode], b.record)
  )
    return false;
  return keys.every((k) => {
    if (k === "record") return true;
    if (mode === "evidence" && k === "time")
      return [
        "",
        "none",
        ...equilibriumEvidence[b.record].times.map(String),
      ].includes(b.time);
    if (mode === "turnover" && k === "step")
      return (
        /^(?:0|[1-6])$/.test(b.step) &&
        Number(b.step) <= turnoverMax(turnoverRecords[b.record])
      );
    if (boardChoices[mode]?.[k]) return boardChoices[mode]![k].includes(b[k]);
    return (
      (k === "change" || k === "net" ? signed : unsigned).test(b[k]) &&
      Number.isFinite(Number(b[k])) &&
      Math.abs(Number(b[k])) <= 100000
    );
  });
}
export function reversibleHistoryStep(
  mode: ReversibleMode,
  a: Record<string, string | number>,
  b: Record<string, string | number>,
) {
  if (!validReversibleBoard(mode, a) || !validReversibleBoard(mode, b))
    return false;
  if (a.record !== b.record) {
    const reset = initialReversibleBoard(mode, b.record);
    return fields[mode].every((k) => b[k] === reset[k]);
  }
  const changed = fields[mode].filter((k) => a[k] !== b[k]);
  if (changed.length !== 1) return false;
  if (mode === "turnover" && changed[0] === "step")
    return Number(b.step) === Number(a.step) + 1;
  return true;
}
const near = (a: string, n: number) => Math.abs(Number(a) - n) < 1e-8;
export function reversibleBoardCheck(
  mode: ReversibleMode,
  value: Record<string, string | number>,
): { correct: boolean; message: string } {
  if (!validReversibleBoard(mode, value))
    return {
      correct: false,
      message: "Use the complete fields for this supplied record.",
    };
  const b = value;
  switch (mode) {
    case "direction": {
      const r = directionRecords[b.record],
        forward = b.direction === "forward";
      const correct =
        b.direction === r.target &&
        b.input === (forward ? "left" : "right") &&
        b.output === (forward ? "right" : "left") &&
        b.condition === (forward ? "forward" : "reverse");
      return {
        correct,
        message: correct
          ? `In the selected ${b.direction} direction, ${forward ? r.left : r.right} forms ${forward ? r.right : r.left}. The equation is read relative to the displayed arrow.`
          : "Choose the requested direction, then identify its starting side, ending side and supplied condition. Reverse means the displayed products react to regenerate the displayed reactants.",
      };
    }
    case "energy": {
      const r = reversibleEnergies[b.record],
        direction = r.reverse ? "reverse" : "forward",
        delta =
          ((r.right - r.left) * (r.reverse ? -1 : 1) * r.targetAmount) /
          r.amount;
      const correct =
        b.direction === direction &&
        near(b.change, delta) &&
        near(b.magnitude, Math.abs(delta)) &&
        b.flow === (delta < 0 ? "toSurroundings" : "fromSurroundings");
      return {
        correct,
        message: correct
          ? `For ${r.targetAmount} g of total reacting material in the matching batch, the ${direction} change is ${delta} kJ: ${Math.abs(delta)} kJ ${delta < 0 ? "transferred to" : "taken from"} the surroundings. Reversal changes the sign for the same amount.`
          : "Reverse the endpoint order, then scale by the stated corresponding batch amount. A negative reaction change releases energy to the surroundings; a positive change takes it in. Activation energy is a different quantity.",
      };
    }
    case "turnover": {
      const r = turnoverRecords[b.record],
        step = Number(b.step),
        tokens = tokenSnapshot(r, step),
        a = tokens.filter((x) => x.state === "A").length,
        c =
          r.forward === r.reverse && r.forward > 0
            ? "equilibrium"
            : "notEquilibrium";
      const correct =
        step > 0 &&
        near(b.a, a) &&
        near(b.b, tokens.length - a) &&
        near(b.forward, r.forward * step) &&
        near(b.reverse, r.reverse * step) &&
        b.classification === c;
      return {
        correct,
        message: correct
          ? `${step} constructed interval${step === 1 ? "" : "s"}: ${r.forward * step} forward and ${r.reverse * step} reverse events, leaving ${a} A and ${tokens.length - a} B. ${c === "equilibrium" ? "Both directions continue at equal positive rates; unequal amounts are allowed." : "These supplied rates do not demonstrate dynamic equilibrium."}`
          : "Advance a constructed interval, count both gross directions separately and compare net amounts. Constant counts are compatible with continuing reactions. Equal amounts alone and two zero rates do not demonstrate dynamic equilibrium.",
      };
    }
    case "rates": {
      const r = reversibleRates[b.record],
        o = rateOutcome(r),
        correct =
          near(b.net, o.net) &&
          near(b.a, o.a) &&
          near(b.b, o.b) &&
          b.classification ===
            (o.equilibrium ? "equilibrium" : "notEquilibrium");
      return {
        correct,
        message: correct
          ? `Over the supplied ${r.seconds} s interval, net B change is ${o.net}; final counts ${o.a} A and ${o.b} B. ${o.equilibrium ? "Closed system and equal positive directional rates demonstrate dynamic equilibrium." : "Directional rates do not demonstrate dynamic equilibrium."}`
          : "Subtract reverse from forward, then multiply by the stated interval. These are gross directional rates, not net accumulation. Check the closed boundary and continuing positive rates separately.",
      };
    }
    case "boundary": {
      const r = boundaryRecords[b.record],
        correct =
          b.classification === r.classification && b.reason === r.reason;
      return {
        correct,
        message: correct
          ? "The conclusion uses both the system boundary and evidence about continuing directional reactions. A flat observation alone does not establish equal positive rates."
          : "Use all observations. Closed matter boundary, continuing reactions and equal directional rates are needed. Open flow, arrested change and an unmeasured plateau are different cases.",
      };
    }
    case "evidence": {
      const r = equilibriumEvidence[b.record],
        correct =
          b.time === (r.first === null ? "none" : String(r.first)) &&
          b.reason === r.reason;
      return {
        correct,
        message: correct
          ? r.first === null
            ? "No dynamic equilibrium is demonstrated in this supplied observation period. Check the reason rather than relying on equal or constant amounts."
            : `The earliest demonstrated interval starts at ${r.first} s: both rates are equal and positive and the amounts remain constant at subsequent supplied readings in a closed system.`
          : "Read both rate columns as well as amount columns and the boundary. Choose the earliest reading followed by sustained equal positive rates and constant amounts in the supplied observation window, or no demonstrated equilibrium.",
      };
    }
  }
}

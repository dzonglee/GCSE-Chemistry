export type GasVolumeUnit = "cm3" | "dm3";
export const RTP_MOLAR_VOLUME = 24;
function nonnegative(n: number, label: string) {
  if (!Number.isFinite(n) || n < 0)
    throw Error(`${label} must be nonnegative and finite`);
}
function positive(n: number, label: string) {
  if (!Number.isFinite(n) || n <= 0)
    throw Error(`${label} must be positive and finite`);
}
function unitFactor(unit: GasVolumeUnit) {
  if (unit !== "dm3" && unit !== "cm3") throw Error("Use dm3 or cm3");
  return unit === "cm3" ? 1000 : 1;
}
/** GCSE supplied 24 dm³/mol at RTP only; not a temperature/pressure conversion. */
export function rtpGasVolume(moles: number, unit: GasVolumeUnit = "dm3") {
  nonnegative(moles, "Gas amount");
  return moles * RTP_MOLAR_VOLUME * unitFactor(unit);
}
export function rtpGasMoles(volume: number, unit: GasVolumeUnit = "dm3") {
  nonnegative(volume, "Gas volume");
  return volume / (RTP_MOLAR_VOLUME * unitFactor(unit));
}
export function gasMassToVolume(
  mass: number,
  molarMass: number,
  massUnit: "g" | "kg" = "g",
  volumeUnit: GasVolumeUnit = "dm3",
) {
  nonnegative(mass, "Gas mass");
  positive(molarMass, "Molar mass");
  if (massUnit !== "g" && massUnit !== "kg") throw Error("Use g or kg");
  const grams = mass * (massUnit === "kg" ? 1000 : 1),
    moles = grams / molarMass;
  return { grams, moles, volume: rtpGasVolume(moles, volumeUnit) };
}
/** All listed quantities must be gases measured at the SAME T and P. */
export function gasRatioVolume(
  knownVolume: number,
  knownCoefficient: number,
  targetCoefficient: number,
) {
  nonnegative(knownVolume, "Known gas volume");
  positive(knownCoefficient, "Known coefficient");
  positive(targetCoefficient, "Target coefficient");
  return (knownVolume / knownCoefficient) * targetCoefficient;
}
/** Products cooled to RTP and all water collected as liquid: only dry gases counted. */
export function methaneDryGas(methaneCm3: number, oxygenCm3: number) {
  nonnegative(methaneCm3, "Methane supply");
  nonnegative(oxygenCm3, "Oxygen supply");
  const extent = Math.min(methaneCm3, oxygenCm3 / 2),
    methaneLeft = methaneCm3 - extent,
    oxygenLeft = oxygenCm3 - 2 * extent;
  const carbonDioxide = extent,
    waterMoles = rtpGasMoles(2 * extent, "cm3");
  return {
    initialGas: methaneCm3 + oxygenCm3,
    carbonDioxide,
    methaneLeft,
    oxygenLeft,
    waterMoles,
    totalDryGas: carbonDioxide + methaneLeft + oxygenLeft,
    limiting:
      methaneCm3 === oxygenCm3 / 2
        ? "both"
        : methaneCm3 < oxygenCm3 / 2
          ? "CH4"
          : "O2",
  };
}
/** 2Si2H6(g)+7O2(g)→4SiO2(s)+6H2O(g). No RTP or 24 assumption. */
export function silaneSteamGas(fuelCm3: number, oxygenCm3: number) {
  nonnegative(fuelCm3, "Disilane supply");
  nonnegative(oxygenCm3, "Oxygen supply");
  const extent = Math.min(fuelCm3 / 2, oxygenCm3 / 7),
    fuelLeft = fuelCm3 - 2 * extent,
    oxygenLeft = oxygenCm3 - 7 * extent,
    steam = 6 * extent;
  return {
    steam,
    fuelLeft,
    oxygenLeft,
    totalGas: steam + fuelLeft + oxygenLeft,
    solidIncludedInGas: false,
  };
}
export type GasMode = "molar" | "mass" | "ratio" | "remaining" | "phases";
export const gasRecords = {
  molar: {
    initial: { label: "0.30 mol gas at RTP", moles: 0.3 },
    larger: { label: "0.60 mol gas at RTP", moles: 0.6 },
    smaller: { label: "0.15 mol gas at RTP", moles: 0.15 },
  },
  mass: {
    initial: {
      label: "8.8 g O2 at RTP; M=32 g/mol",
      mass: 8.8,
      molarMass: 32,
      unit: "g",
    },
    different: {
      label: "8.8 g CO2 at RTP; M=44 g/mol",
      mass: 8.8,
      molarMass: 44,
      unit: "g",
    },
    kilograms: {
      label: "0.0088 kg O2 at RTP; M=32 g/mol",
      mass: 0.0088,
      molarMass: 32,
      unit: "kg",
    },
  },
  ratio: {
    initial: {
      label: "N2 volume 15 cm³; all gases at matching T and P",
      known: "N2",
      volume: 15,
    },
    hydrogen: {
      label: "H2 volume 18 cm³; all gases at matching T and P",
      known: "H2",
      volume: 18,
    },
    ammonia: {
      label: "NH3 volume 24 cm³; all gases at matching T and P",
      known: "NH3",
      volume: 24,
    },
  },
  remaining: {
    initial: {
      label: "30 cm³ CH4 and 40 cm³ O2; final dry gases at RTP",
      methane: 30,
      oxygen: 40,
    },
    oxygenExcess: {
      label: "10 cm³ CH4 and 30 cm³ O2; final dry gases at RTP",
      methane: 10,
      oxygen: 30,
    },
    stoichiometric: {
      label: "10 cm³ CH4 and 20 cm³ O2; final dry gases at RTP",
      methane: 10,
      oxygen: 20,
    },
  },
  phases: {
    initial: {
      label: "20 cm³ Si2H6 and 100 cm³ O2; water remains gas",
      fuel: 20,
      oxygen: 100,
    },
    larger: {
      label: "40 cm³ Si2H6 and 200 cm³ O2; water remains gas",
      fuel: 40,
      oxygen: 200,
    },
    oxygenLimited: {
      label: "20 cm³ Si2H6 and 35 cm³ O2; water remains gas",
      fuel: 20,
      oxygen: 35,
    },
  },
} as const;
export const gasChoices: Record<GasMode, Record<string, readonly string[]>> = {
  molar: {
    record: ["initial", "larger", "smaller"],
    unit: ["dm3", "cm3"],
    answer: [
      "unset",
      "0.0072",
      "3.6",
      "7.2",
      "14.4",
      "24",
      "3600",
      "7200",
      "14400",
    ],
    reason: [
      "unset",
      "moles-times24-convert",
      "divide24",
      "24cm3",
      "all-conditions",
    ],
  },
  mass: {
    record: ["initial", "different", "kilograms"],
    grams: ["unset", "0.0088", "8.8", "8800"],
    moles: ["unset", "0.2", "0.275", "8.8", "32", "44"],
    answer: ["unset", "0.0066", "4.8", "6.6", "211.2", "6600"],
    reason: [
      "unset",
      "grams-divide-M-times24",
      "grams-times24",
      "use-atomic-O",
    ],
  },
  ratio: {
    record: ["initial", "hydrogen", "ammonia"],
    nitrogen: ["unset", "6", "12", "15", "18", "24", "30", "45"],
    hydrogen: ["unset", "6", "12", "15", "18", "24", "30", "36", "45"],
    ammonia: ["unset", "6", "12", "15", "18", "24", "30", "36", "45"],
    reason: [
      "unset",
      "matching-gas-coefficients",
      "all-equal",
      "mass-ratio",
      "regardless-conditions",
    ],
  },
  remaining: {
    record: ["initial", "oxygenExcess", "stoichiometric"],
    carbonDioxide: ["unset", "10", "20", "30", "40"],
    leftover: ["unset", "0", "10", "20", "30", "40"],
    identity: ["unset", "CH4", "O2", "none"],
    total: ["unset", "10", "20", "30", "40", "70"],
    reason: [
      "unset",
      "dry-products-plus-unused",
      "product-only",
      "all-supplied-oxygen",
      "include-liquid-water",
    ],
  },
  phases: {
    record: ["initial", "larger", "oxygenLimited"],
    steam: ["unset", "20", "30", "60", "90", "120"],
    leftover: ["unset", "0", "10", "20", "30", "60", "100"],
    total: ["unset", "30", "40", "60", "90", "100", "120", "180"],
    reason: [
      "unset",
      "steam-and-unused-gases",
      "solid-is-gas",
      "exclude-steam",
      "products-only",
    ],
  },
};
export function initialGasBoard(
  mode: GasMode,
): Record<string, string | number> {
  return Object.fromEntries(
    Object.keys(gasChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : k === "unit" ? "dm3" : "unset",
    ]),
  );
}
export function validGasBoard(
  mode: GasMode,
  b: Record<string, string | number>,
) {
  const choices = gasChoices[mode];
  return (
    Object.keys(b).length === Object.keys(choices).length &&
    Object.entries(choices).every(
      ([k, values]) =>
        typeof b[k] === "string" && values.includes(b[k] as string),
    )
  );
}
export function gasExpected(
  mode: GasMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const record = String(b.record);
  if (mode === "molar") {
    const r = gasRecords.molar[record as keyof typeof gasRecords.molar];
    return {
      answer: String(rtpGasVolume(r.moles, b.unit as GasVolumeUnit)),
      reason: "moles-times24-convert",
    };
  }
  if (mode === "mass") {
    const r = gasRecords.mass[record as keyof typeof gasRecords.mass],
      s = gasMassToVolume(r.mass, r.molarMass, r.unit);
    return {
      grams: String(s.grams),
      moles: String(s.moles),
      answer: String(s.volume),
      reason: "grams-divide-M-times24",
    };
  }
  if (mode === "ratio") {
    const r = gasRecords.ratio[record as keyof typeof gasRecords.ratio],
      coeff = { N2: 1, H2: 3, NH3: 2 },
      one = r.volume / coeff[r.known];
    return {
      nitrogen: String(one),
      hydrogen: String(one * 3),
      ammonia: String(one * 2),
      reason: "matching-gas-coefficients",
    };
  }
  if (mode === "remaining") {
    const r = gasRecords.remaining[record as keyof typeof gasRecords.remaining],
      s = methaneDryGas(r.methane, r.oxygen);
    return {
      carbonDioxide: String(s.carbonDioxide),
      leftover: String(s.methaneLeft + s.oxygenLeft),
      identity: s.methaneLeft > 0 ? "CH4" : s.oxygenLeft > 0 ? "O2" : "none",
      total: String(s.totalDryGas),
      reason: "dry-products-plus-unused",
    };
  }
  const r = gasRecords.phases[record as keyof typeof gasRecords.phases],
    s = silaneSteamGas(r.fuel, r.oxygen);
  return {
    steam: String(s.steam),
    leftover: String(s.fuelLeft + s.oxygenLeft),
    total: String(s.totalGas),
    reason: "steam-and-unused-gases",
  };
}
export function gasPrediction(
  mode: GasMode,
  b: Record<string, string | number>,
) {
  if (!validGasBoard(mode, b)) return { correct: false, complete: false };
  const expected = gasExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset"),
    correct =
      complete &&
      Object.entries(expected).every(([k, value]) =>
        k === "reason" || k === "identity"
          ? b[k] === value
          : Math.abs(Number(b[k]) - Number(value)) < 1e-9,
      );
  return { correct, complete, expected };
}

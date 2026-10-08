export type TitrationMode =
  "titre" | "concentration" | "ratio" | "mass" | "volume";
function positive(v: number, label: string) {
  if (!Number.isFinite(v) || v <= 0)
    throw Error(`${label} must be positive and finite`);
}
export function deliveredTitre(initial: number, final: number) {
  if (
    !Number.isFinite(initial) ||
    !Number.isFinite(final) ||
    initial < 0 ||
    final > 50 ||
    final <= initial
  )
    throw Error("Use increasing readings on the same 0–50 cm³ burette");
  return final - initial;
}
export function titrationAmounts(
  knownConcentration: number,
  knownCm3: number,
  knownCoefficient: number,
  unknownCoefficient: number,
) {
  [knownConcentration, knownCm3, knownCoefficient, unknownCoefficient].forEach(
    (v) => positive(v, "Reaction input"),
  );
  if (
    !Number.isInteger(knownCoefficient) ||
    !Number.isInteger(unknownCoefficient)
  )
    throw Error("Use positive whole equation coefficients");
  const knownMoles = (knownConcentration * knownCm3) / 1000;
  return {
    knownMoles,
    unknownMoles: (knownMoles * unknownCoefficient) / knownCoefficient,
  };
}
export function titrationConcentration(
  knownConcentration: number,
  knownCm3: number,
  knownCoefficient: number,
  unknownCoefficient: number,
  unknownCm3: number,
) {
  positive(unknownCm3, "Unknown solution sample volume");
  const amounts = titrationAmounts(
    knownConcentration,
    knownCm3,
    knownCoefficient,
    unknownCoefficient,
  );
  return {
    ...amounts,
    unknownDm3: unknownCm3 / 1000,
    concentration: amounts.unknownMoles / (unknownCm3 / 1000),
  };
}
export function reactingVolume(
  sampleConcentration: number,
  sampleCm3: number,
  sampleCoefficient: number,
  titrantCoefficient: number,
  titrantConcentration: number,
) {
  positive(titrantConcentration, "Titrant concentration");
  const amounts = titrationAmounts(
    sampleConcentration,
    sampleCm3,
    sampleCoefficient,
    titrantCoefficient,
  );
  return {
    ...amounts,
    requiredDm3: amounts.unknownMoles / titrantConcentration,
    requiredCm3: (1000 * amounts.unknownMoles) / titrantConcentration,
  };
}
export function titratedMassConcentration(molar: number, molarMass: number) {
  positive(molar, "Molar concentration");
  positive(molarMass, "Named solute molar mass");
  return molar * molarMass;
}
export const titrationRecords = {
  titre: {
    initial: {
      label: "Initial 1.40 cm³; final 21.40 cm³; NaOH 0.100 mol/dm³",
      initial: 1.4,
      final: 21.4,
      c: 0.1,
    },
    shifted: {
      label: "Initial 4.80 cm³; final 24.80 cm³; NaOH 0.100 mol/dm³",
      initial: 4.8,
      final: 24.8,
      c: 0.1,
    },
    larger: {
      label: "Initial 2.10 cm³; final 27.10 cm³; NaOH 0.100 mol/dm³",
      initial: 2.1,
      final: 27.1,
      c: 0.1,
    },
  },
  concentration: {
    initial: {
      label: "25.0 cm³ HCl + 20.0 cm³ NaOH at 0.100 mol/dm³",
      equation: "HCl + NaOH → NaCl + H2O",
      known: "NaOH",
      unknown: "HCl",
      c: 0.1,
      v: 20,
      k: 1,
      u: 1,
      sample: 25,
    },
    smallerSample: {
      label: "12.5 cm³ HCl + 20.0 cm³ NaOH at 0.100 mol/dm³",
      equation: "HCl + NaOH → NaCl + H2O",
      known: "NaOH",
      unknown: "HCl",
      c: 0.1,
      v: 20,
      k: 1,
      u: 1,
      sample: 12.5,
    },
    largerTitre: {
      label: "25.0 cm³ HCl + 30.0 cm³ NaOH at 0.100 mol/dm³",
      equation: "HCl + NaOH → NaCl + H2O",
      known: "NaOH",
      unknown: "HCl",
      c: 0.1,
      v: 30,
      k: 1,
      u: 1,
      sample: 25,
    },
  },
  ratio: {
    initial: {
      label: "25.0 cm³ H2SO4 + 24.0 cm³ NaOH at 0.100 mol/dm³",
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      known: "NaOH",
      unknown: "H2SO4",
      c: 0.1,
      v: 24,
      k: 2,
      u: 1,
      sample: 25,
    },
    dihydroxide: {
      label: "25.0 cm³ HCl + 18.0 cm³ Ba(OH)2 at 0.100 mol/dm³",
      equation: "2HCl + Ba(OH)2 → BaCl2 + 2H2O",
      known: "Ba(OH)2",
      unknown: "HCl",
      c: 0.1,
      v: 18,
      k: 1,
      u: 2,
      sample: 25,
    },
    equalVolume: {
      label: "25.0 cm³ H2SO4 + 25.0 cm³ NaOH at 0.100 mol/dm³",
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      known: "NaOH",
      unknown: "H2SO4",
      c: 0.1,
      v: 25,
      k: 2,
      u: 1,
      sample: 25,
    },
  },
  mass: {
    initial: {
      label: "25.0 cm³ NaOH + 20.0 cm³ HCl at 0.200 mol/dm³; NaOH M=40 g/mol",
      equation: "HCl + NaOH → NaCl + H2O",
      known: "HCl",
      unknown: "NaOH",
      c: 0.2,
      v: 20,
      k: 1,
      u: 1,
      sample: 25,
      M: 40,
    },
    sulfuric: {
      label:
        "25.0 cm³ H2SO4 + 20.0 cm³ NaOH at 0.200 mol/dm³; H2SO4 M=98 g/mol",
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      known: "NaOH",
      unknown: "H2SO4",
      c: 0.2,
      v: 20,
      k: 2,
      u: 1,
      sample: 25,
      M: 98,
    },
    hydrochloric: {
      label: "25.0 cm³ HCl + 20.0 cm³ NaOH at 0.200 mol/dm³; HCl M=36.5 g/mol",
      equation: "HCl + NaOH → NaCl + H2O",
      known: "NaOH",
      unknown: "HCl",
      c: 0.2,
      v: 20,
      k: 1,
      u: 1,
      sample: 25,
      M: 36.5,
    },
  },
  volume: {
    initial: {
      label: "25.0 cm³ H2SO4 at 0.0500 mol/dm³; NaOH titrant 0.100 mol/dm³",
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      sample: "H2SO4",
      titrant: "NaOH",
      c: 0.05,
      v: 25,
      k: 1,
      u: 2,
      titrantC: 0.1,
    },
    strongerTitrant: {
      label: "25.0 cm³ H2SO4 at 0.0500 mol/dm³; NaOH titrant 0.200 mol/dm³",
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      sample: "H2SO4",
      titrant: "NaOH",
      c: 0.05,
      v: 25,
      k: 1,
      u: 2,
      titrantC: 0.2,
    },
    hydrochloric: {
      label: "25.0 cm³ HCl at 0.0500 mol/dm³; NaOH titrant 0.100 mol/dm³",
      equation: "HCl + NaOH → NaCl + H2O",
      sample: "HCl",
      titrant: "NaOH",
      c: 0.05,
      v: 25,
      k: 1,
      u: 1,
      titrantC: 0.1,
    },
  },
} as const;
export const titrationChoices: Record<
  TitrationMode,
  Record<string, string[]>
> = {
  titre: {
    record: ["initial", "shifted", "larger"],
    titre: ["unset", "20", "25", "21.4", "24.8", "27.1", "22.8"],
    knownMoles: ["unset", "0.002", "0.0025", "0.00214", "2", "2.5"],
    reason: ["unset", "final-minus-initial", "final-only", "add-readings"],
  },
  concentration: {
    record: ["initial", "smallerSample", "largerTitre"],
    knownMoles: ["unset", "0.002", "0.003", "2", "3"],
    concentration: ["unset", "0.08", "0.12", "0.16", "0.1", "0.00008", "80"],
    reason: [
      "unset",
      "unknown-moles-over-sample",
      "known-concentration",
      "divide-by-titre",
    ],
  },
  ratio: {
    record: ["initial", "dihydroxide", "equalVolume"],
    unknownMoles: [
      "unset",
      "0.0012",
      "0.0036",
      "0.00125",
      "0.0024",
      "0.0018",
      "0.0025",
      "0.0048",
      "0.0009",
    ],
    concentration: [
      "unset",
      "0.048",
      "0.144",
      "0.05",
      "0.096",
      "0.072",
      "0.1",
      "0.192",
      "0.036",
    ],
    reason: [
      "unset",
      "unknown-over-known-coefficient",
      "always-one-to-one",
      "invert-coefficients",
    ],
  },
  mass: {
    record: ["initial", "sulfuric", "hydrochloric"],
    concentration: ["unset", "0.16", "0.08", "0.2", "0.32"],
    massConcentration: [
      "unset",
      "6.4",
      "7.84",
      "5.84",
      "0.004",
      "0.16",
      "0.08",
      "15.68",
      "3.2",
    ],
    reason: ["unset", "multiply-named-solute-M", "divide-by-M", "use-water-M"],
  },
  volume: {
    record: ["initial", "strongerTitrant", "hydrochloric"],
    titrantMoles: ["unset", "0.0025", "0.00125", "0.005"],
    volume: ["unset", "25", "12.5", "50", "0.025", "0.0125"],
    reason: [
      "unset",
      "required-moles-over-titrant-c",
      "multiply-by-c",
      "same-volume-always",
    ],
  },
};
export function initialTitrationBoard(
  mode: TitrationMode,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(titrationChoices[mode]).map((k) => [
      k,
      k === "record" ? "initial" : "unset",
    ]),
  );
}
export function validTitrationBoard(
  mode: TitrationMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>,
    keys = Object.keys(titrationChoices[mode]);
  return (
    Object.keys(b).length === keys.length &&
    keys.every(
      (k) =>
        typeof b[k] === "string" &&
        titrationChoices[mode][k].includes(b[k] as string),
    )
  );
}
export function titrationExpected(
  mode: TitrationMode,
  b: Record<string, string | number>,
): Record<string, string> {
  const key = String(b.record);
  if (mode === "titre") {
    const r =
        titrationRecords.titre[key as keyof typeof titrationRecords.titre],
      titre = deliveredTitre(r.initial, r.final);
    return {
      titre: String(titre),
      knownMoles: String((titre * r.c) / 1000),
      reason: "final-minus-initial",
    };
  }
  if (mode === "volume") {
    const r =
        titrationRecords.volume[key as keyof typeof titrationRecords.volume],
      a = reactingVolume(r.c, r.v, r.k, r.u, r.titrantC);
    return {
      titrantMoles: String(a.unknownMoles),
      volume: String(a.requiredCm3),
      reason: "required-moles-over-titrant-c",
    };
  }
  if (mode === "mass") {
    const r = titrationRecords.mass[key as keyof typeof titrationRecords.mass],
      a = titrationConcentration(r.c, r.v, r.k, r.u, r.sample);
    return {
      concentration: String(a.concentration),
      massConcentration: String(
        titratedMassConcentration(a.concentration, r.M),
      ),
      reason: "multiply-named-solute-M",
    };
  }
  if (mode === "ratio") {
    const r =
        titrationRecords.ratio[key as keyof typeof titrationRecords.ratio],
      a = titrationConcentration(r.c, r.v, r.k, r.u, r.sample);
    return {
      unknownMoles: String(a.unknownMoles),
      concentration: String(a.concentration),
      reason: "unknown-over-known-coefficient",
    };
  }
  const r =
      titrationRecords.concentration[
        key as keyof typeof titrationRecords.concentration
      ],
    a = titrationConcentration(r.c, r.v, r.k, r.u, r.sample);
  return {
    knownMoles: String(a.knownMoles),
    concentration: String(a.concentration),
    reason: "unknown-moles-over-sample",
  };
}
export function titrationPrediction(
  mode: TitrationMode,
  b: Record<string, string | number>,
) {
  if (!validTitrationBoard(mode, b)) return { correct: false, complete: false };
  const expected = titrationExpected(mode, b),
    complete = Object.keys(expected).every((k) => b[k] !== "unset");
  return {
    complete,
    correct:
      complete &&
      Object.entries(expected).every(([k, v]) =>
        k === "reason" ? b[k] === v : Math.abs(Number(b[k]) - Number(v)) < 1e-9,
      ),
  };
}

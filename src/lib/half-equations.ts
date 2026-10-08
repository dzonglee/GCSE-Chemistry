export type Species = {
  id: string;
  label: string;
  atoms: Record<string, number>;
  charge: number;
  aliases: string[];
};
export const species: Record<string, Species> = {
  Ni2: {
    id: "Ni2",
    label: "Ni2+",
    atoms: { Ni: 1 },
    charge: 2,
    aliases: ["Ni^2+", "Ni2+"],
  },
  Ni: { id: "Ni", label: "Ni", atoms: { Ni: 1 }, charge: 0, aliases: ["Ni"] },
  I1: {
    id: "I1",
    label: "I−",
    atoms: { I: 1 },
    charge: -1,
    aliases: ["I-", "I^-"],
  },
  I2: { id: "I2", label: "I2", atoms: { I: 2 }, charge: 0, aliases: ["I2"] },

  Zn: { id: "Zn", label: "Zn", atoms: { Zn: 1 }, charge: 0, aliases: ["Zn"] },
  Zn2: {
    id: "Zn2",
    label: "Zn2+",
    atoms: { Zn: 1 },
    charge: 2,
    aliases: ["Zn^2+", "Zn2+"],
  },
  Mg: { id: "Mg", label: "Mg", atoms: { Mg: 1 }, charge: 0, aliases: ["Mg"] },
  Mg2: {
    id: "Mg2",
    label: "Mg2+",
    atoms: { Mg: 1 },
    charge: 2,
    aliases: ["Mg^2+", "Mg2+"],
  },
  Fe: { id: "Fe", label: "Fe", atoms: { Fe: 1 }, charge: 0, aliases: ["Fe"] },

  Fe2: {
    id: "Fe2",
    label: "Fe2+",
    atoms: { Fe: 1 },
    charge: 2,
    aliases: ["Fe^2+", "Fe2+"],
  },
  Fe3: {
    id: "Fe3",
    label: "Fe3+",
    atoms: { Fe: 1 },
    charge: 3,
    aliases: ["Fe^3+", "Fe3+"],
  },

  Cu2: {
    id: "Cu2",
    label: "Cu2+",
    atoms: { Cu: 1 },
    charge: 2,
    aliases: ["Cu^2+", "Cu2+"],
  },
  Cu: { id: "Cu", label: "Cu", atoms: { Cu: 1 }, charge: 0, aliases: ["Cu"] },
  Ag1: {
    id: "Ag1",
    label: "Ag+",
    atoms: { Ag: 1 },
    charge: 1,
    aliases: ["Ag+", "Ag^+"],
  },
  Ag: { id: "Ag", label: "Ag", atoms: { Ag: 1 }, charge: 0, aliases: ["Ag"] },
  Al3: {
    id: "Al3",
    label: "Al3+",
    atoms: { Al: 1 },
    charge: 3,
    aliases: ["Al^3+", "Al3+"],
  },
  Al: { id: "Al", label: "Al", atoms: { Al: 1 }, charge: 0, aliases: ["Al"] },
  Na1: {
    id: "Na1",
    label: "Na+",
    atoms: { Na: 1 },
    charge: 1,
    aliases: ["Na+", "Na^+"],
  },
  Na: { id: "Na", label: "Na", atoms: { Na: 1 }, charge: 0, aliases: ["Na"] },
  H1: {
    id: "H1",
    label: "H+",
    atoms: { H: 1 },
    charge: 1,
    aliases: ["H+", "H^+"],
  },
  H2: { id: "H2", label: "H2", atoms: { H: 2 }, charge: 0, aliases: ["H2"] },
  Cl1: {
    id: "Cl1",
    label: "Cl−",
    atoms: { Cl: 1 },
    charge: -1,
    aliases: ["Cl-", "Cl^-"],
  },
  Cl2: {
    id: "Cl2",
    label: "Cl2",
    atoms: { Cl: 2 },
    charge: 0,
    aliases: ["Cl2"],
  },
  Br1: {
    id: "Br1",
    label: "Br−",
    atoms: { Br: 1 },
    charge: -1,
    aliases: ["Br-", "Br^-"],
  },
  Br2: {
    id: "Br2",
    label: "Br2",
    atoms: { Br: 2 },
    charge: 0,
    aliases: ["Br2"],
  },
  oxide: {
    id: "oxide",
    label: "O²−",
    atoms: { O: 1 },
    charge: -2,
    aliases: ["O^2-", "O2-"],
  },
  OH1: {
    id: "OH1",
    label: "OH−",
    atoms: { O: 1, H: 1 },
    charge: -1,
    aliases: ["OH-", "OH^-"],
  },
  O2: { id: "O2", label: "O2", atoms: { O: 2 }, charge: 0, aliases: ["O2"] },
  water: {
    id: "water",
    label: "H2O",
    atoms: { H: 2, O: 1 },
    charge: 0,
    aliases: ["H2O"],
  },
  electron: {
    id: "electron",
    label: "e−",
    atoms: {},
    charge: -1,
    aliases: ["e-", "e^-"],
  },
};
export const halfEquationRecords = {
  fuelHydrogen: {
    label: "Acidic fuel-cell hydrogen oxidation at the negative anode",
    left: ["H2"],
    right: ["H1", "electron"],
    coefficients: [1, 2, 2],
    electronSide: "right",
  },
  fuelOxygen: {
    label: "Acidic fuel-cell oxygen reduction at the positive cathode",
    left: ["O2", "H1", "electron"],
    right: ["water"],
    coefficients: [1, 4, 4, 2],
    electronSide: "left",
  },
  fuelOverall: {
    label:
      "Overall hydrogen-oxygen fuel-cell reaction after proton and electron cancellation",
    left: ["H2", "O2"],
    right: ["water"],
    coefficients: [2, 1, 2],
    electronSide: "none",
  },

  nickel: {
    label:
      "Supplied Ni2+ → Ni reduction, not an aqueous product-prediction rule",
    left: ["Ni2", "electron"],
    right: ["Ni"],
    coefficients: [1, 2, 1],
    electronSide: "left",
  },
  iodide: {
    label: "Supplied I− → I2 oxidation",
    left: ["I1"],
    right: ["I2", "electron"],
    coefficients: [2, 1, 2],
    electronSide: "right",
  },
  zincReduction: {
    label: "Zn2+ → Zn reduction in supplied molten zinc chloride",
    left: ["Zn2", "electron"],
    right: ["Zn"],
    coefficients: [1, 2, 1],
    electronSide: "left",
  },
  ironMetalOxidation: {
    label: "Fe → Fe2+ oxidation in supplied metal/acid reaction",
    left: ["Fe"],
    right: ["Fe2", "electron"],
    coefficients: [1, 1, 2],
    electronSide: "right",
  },
  ironReduction: {
    label: "Supplied Fe3+ → Fe2+ reduction",
    left: ["Fe3", "electron"],
    right: ["Fe2"],
    coefficients: [1, 1, 1],
    electronSide: "left",
  },
  netZincAcid: {
    label: "Supplied Zn/HCl net ionic reaction",
    left: ["Zn", "H1"],
    right: ["Zn2", "H2"],
    coefficients: [1, 2, 1, 1],
    electronSide: "none",
  },

  netZinc: {
    label: "Net ionic zinc/copper displacement",
    left: ["Zn", "Cu2"],
    right: ["Zn2", "Cu"],
    coefficients: [1, 1, 1, 1],
    electronSide: "none",
  },
  netSilver: {
    label: "Net ionic copper/silver displacement",
    left: ["Cu", "Ag1"],
    right: ["Cu2", "Ag"],
    coefficients: [1, 2, 1, 2],
    electronSide: "none",
  },
  netMagnesium: {
    label: "Net ionic magnesium/hydrochloric acid reaction",
    left: ["Mg", "H1"],
    right: ["Mg2", "H2"],
    coefficients: [1, 2, 1, 1],
    electronSide: "none",
  },
  netIron: {
    label: "Net ionic iron/sulfuric acid reaction; Fe2+ supplied",
    left: ["Fe", "H1"],
    right: ["Fe2", "H2"],
    coefficients: [1, 2, 1, 1],
    electronSide: "none",
  },

  sodiumOxidation: {
    label:
      "Sodium oxidation: Na becomes Na+ in the supplied displacement half reaction",
    left: ["Na"],
    right: ["Na1", "electron"],
    coefficients: [1, 1, 1],
    electronSide: "right",
  },
  ironOxidation: {
    label:
      "Iron ion oxidation: Fe2+ becomes Fe3+ in the supplied half reaction",
    left: ["Fe2"],
    right: ["Fe3", "electron"],
    coefficients: [1, 1, 1],
    electronSide: "right",
  },

  copper: {
    label: "Copper ion reduction: Cu2+ becomes Cu at negative cathode",
    left: ["Cu2", "electron"],
    right: ["Cu"],
    coefficients: [1, 2, 1],
    electronSide: "left",
  },
  silver: {
    label: "Silver ion reduction: Ag+ becomes Ag at negative cathode",
    left: ["Ag1", "electron"],
    right: ["Ag"],
    coefficients: [1, 1, 1],
    electronSide: "left",
  },
  aluminium: {
    label:
      "Aluminium ion reduction: Al3+ becomes Al in supplied molten aluminium cell",
    left: ["Al3", "electron"],
    right: ["Al"],
    coefficients: [1, 3, 1],
    electronSide: "left",
  },
  sodium: {
    label:
      "Sodium ion reduction: Na+ becomes Na in molten sodium chloride, no water",
    left: ["Na1", "electron"],
    right: ["Na"],
    coefficients: [1, 1, 1],
    electronSide: "left",
  },
  hydrogen: {
    label:
      "Hydrogen ion reduction: H+ gives H2 in the supplied GCSE aqueous case",
    left: ["H1", "electron"],
    right: ["H2"],
    coefficients: [2, 2, 1],
    electronSide: "left",
  },
  chloride: {
    label: "Chloride oxidation: Cl− gives Cl2 at positive anode",
    left: ["Cl1"],
    right: ["Cl2", "electron"],
    coefficients: [2, 1, 2],
    electronSide: "right",
  },
  bromide: {
    label: "Bromide oxidation: Br− gives Br2 at positive anode",
    left: ["Br1"],
    right: ["Br2", "electron"],
    coefficients: [2, 1, 2],
    electronSide: "right",
  },
  oxide: {
    label:
      "Oxide oxidation: monatomic O²− ions give O₂ at positive anode in supplied molten oxide",
    left: ["oxide"],
    right: ["O2", "electron"],
    coefficients: [2, 1, 4],
    electronSide: "right",
  },
  hydroxide: {
    label:
      "Hydroxide oxidation: OH− gives O2 and H2O at the positive inert anode in the supplied GCSE aqueous account",
    left: ["OH1"],
    right: ["O2", "water", "electron"],
    coefficients: [4, 1, 2, 4],
    electronSide: "right",
  },
} as const;
export type HalfEquationKey = keyof typeof halfEquationRecords;
export function equationSpecies(id: string) {
  return species[id];
}
export function totals(terms: { species: string; coefficient: number }[]) {
  const atoms: Record<string, number> = {};
  let charge = 0;
  for (const term of terms) {
    const s = species[term.species];
    for (const [e, count] of Object.entries(s.atoms))
      atoms[e] = (atoms[e] ?? 0) + count * term.coefficient;
    charge += s.charge * term.coefficient;
  }
  return { atoms, charge };
}
export function balance(
  left: { species: string; coefficient: number }[],
  right: { species: string; coefficient: number }[],
) {
  const l = totals(left),
    r = totals(right),
    elements = [...new Set([...Object.keys(l.atoms), ...Object.keys(r.atoms)])];
  return {
    left: l,
    right: r,
    atoms: elements.every((e) => (l.atoms[e] ?? 0) === (r.atoms[e] ?? 0)),
    charge: l.charge === r.charge,
  };
}
function normalize(input: string) {
  return input
    .replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) =>
      String(
        "₀₁₂₃₄₅₆₇₈₉".includes(c)
          ? "₀₁₂₃₄₅₆₇₈₉".indexOf(c)
          : "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c),
      ),
    )
    .replace(/[⁺]/g, "+")
    .replace(/[⁻−–]/g, "-")
    .replace(/[⟶⟹]/g, "→")
    .replace(/\s+/g, "");
}
function parseSide(
  input: string,
  allowed: readonly string[],
  key: HalfEquationKey,
) {
  const candidates = allowed
      .flatMap((id) => species[id].aliases.map((alias) => ({ id, alias })))
      .sort((a, b) => b.alias.length - a.alias.length),
    terms: { species: string; coefficient: number }[] = [];
  let rest = input;
  while (rest) {
    const coefficientMatch = rest.match(/^\d+/),
      coefficient = coefficientMatch ? Number(coefficientMatch[0]) : 1;
    if (
      !Number.isSafeInteger(coefficient) ||
      coefficient < 1 ||
      coefficient > 99
    )
      return null;
    if (coefficientMatch) rest = rest.slice(coefficientMatch[0].length);
    const match = candidates.find(
      (c) =>
        rest.startsWith(c.alias) &&
        (rest.length === c.alias.length ||
          rest[c.alias.length] === "+" ||
          rest[c.alias.length] === "("),
    );
    if (!match) return null;
    if (terms.some((t) => t.species === match.id)) return null;
    terms.push({ species: match.id, coefficient });
    rest = rest.slice(match.alias.length);
    if (rest.startsWith("(")) {
      const phase = rest.match(/^\((aq|s|l|g)\)/);
      if (!phase) return null;
      const allowedStates: Record<string, string[]> = {
        electron: [],
        Ni2: ["aq", "l"],
        Ni: ["s", "l"],
        I1: ["aq", "l", "s"],
        I2: ["s", "aq", "g"],
        Zn: ["s"],
        Zn2: ["aq", "l"],
        Mg: ["s"],
        Mg2: ["aq"],
        Fe: ["s"],
        oxide: ["l"],
        OH1: ["aq"],
        Cu2: ["aq"],
        Ag1: ["aq"],
        Fe2: ["aq"],
        Fe3: ["aq"],
        H1: ["aq"],
        Al3: ["l"],
        Na1: ["aq", "l", "s"],
        Cl1: ["aq", "l", "s"],
        Br1: ["aq", "l", "s"],
        Cu: ["s", "l"],
        Ag: ["s", "l"],
        Al: ["s", "l"],
        Na: ["s", "l"],
        H2: ["g"],
        O2: ["g"],
        Cl2: ["g"],
        Br2: ["l", "g", "aq"],
        water: ["l"],
      };
      if (key === "fuelOxygen" || key === "fuelOverall")
        allowedStates.water = ["l", "g"];
      if (key === "sodium") allowedStates.Na1 = ["l"];
      if (key === "zincReduction") allowedStates.Zn2 = ["l"];
      if (!allowedStates[match.id]?.includes(phase[1])) return null;
      rest = rest.slice(phase[0].length);
    }

    if (rest) {
      if (rest[0] !== "+" || rest.length === 1) return null;
      rest = rest.slice(1);
    }
  }
  return terms.length ? terms : null;
}
export function markHalfEquation(
  key: HalfEquationKey,
  input: string,
  simplest = false,
) {
  const rec = halfEquationRecords[key],
    sides = normalize(input).split(/->|=>|→/);
  if (sides.length !== 2)
    return {
      correct: false,
      feedback:
        rec.electronSide === "none"
          ? "Use one reaction arrow and keep the stated reactive species."
          : "Use one reaction arrow and include the charged electron e−.",
    };
  // AQA also represents oxidation as subtraction of electrons on the left.
  // Move only a terminal charged electron subtraction to the right; retain
  // fixed species and all atom/charge checks.
  if (rec.electronSide === "right") {
    const subtraction = sides[0].match(/-([1-9][0-9]?)?e(?:\^-|-)$/);
    if (subtraction) {
      sides[0] = sides[0].slice(0, subtraction.index);
      sides[1] += "+" + (subtraction[1] ?? "1") + "e-";
    }
  }
  const left = parseSide(sides[0], rec.left, key),
    right = parseSide(sides[1], rec.right, key);
  if (
    !left ||
    !right ||
    left.length !== rec.left.length ||
    right.length !== rec.right.length
  )
    return {
      correct: false,
      feedback:
        rec.electronSide === "none"
          ? "Keep the stated chemical species, charges and appropriate optional states. Omit unchanged spectators and cancelled electrons; use positive whole-number coefficients."
          : "Keep the stated chemical species, charges and appropriate optional states. Put electrons on the reaction's required side; use positive whole-number coefficients.",
    };
  const b = balance(left, right);
  if (!b.atoms)
    return {
      correct: false,
      feedback:
        "The element counts do not match. Keep formulas fixed and balance atoms, including the water in a hydroxide half equation.",
    };
  if (!b.charge)
    return {
      correct: false,
      feedback:
        "Atoms match, but total charge does not. Each electron contributes −1; use coefficients to count the total charge on each side.",
    };
  const cs = [...left, ...right].map((t) => t.coefficient),
    gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  if (simplest && cs.reduce(gcd) !== 1)
    return {
      correct: false,
      feedback:
        "This is balanced, but this task explicitly asks for the smallest whole-number coefficients.",
    };
  return {
    correct: true,
    feedback:
      rec.electronSide === "none"
        ? "Atoms and total charge balance for the required net ionic species."
        : "Atoms and total charge balance, with the required species and electron side.",
  };
}
export type HalfMode = "electrons" | "cation" | "anion" | "diagnose" | "ionic";
export const electronRecords = {
  initial: {
    label: "Cu2+ becomes Cu; nuclear identity unchanged",
    start: 2,
    target: 0,
    direction: "gain",
    electrons: 2,
    redox: "reduction",
  },
  sodium: {
    label: "Na becomes Na+; nuclear identity unchanged",
    start: 0,
    target: 1,
    direction: "lose",
    electrons: 1,
    redox: "oxidation",
  },
  chloride: {
    label: "Cl becomes Cl−; nuclear identity unchanged",
    start: 0,
    target: -1,
    direction: "gain",
    electrons: 1,
    redox: "reduction",
  },
  iron: {
    label: "Fe2+ becomes Fe3+; nuclear identity unchanged",
    start: 2,
    target: 3,
    direction: "lose",
    electrons: 1,
    redox: "oxidation",
  },
} as const;
export const diagnoseRecords = {
  neither: {
    label: "Cu2+ + e− → 2Cu",
    left: [
      { species: "Cu2", coefficient: 1 },
      { species: "electron", coefficient: 1 },
    ],
    right: [{ species: "Cu", coefficient: 2 }],
  },

  initial: {
    label: "Cu2+ + e− → Cu",
    left: [
      { species: "Cu2", coefficient: 1 },
      { species: "electron", coefficient: 1 },
    ],
    right: [{ species: "Cu", coefficient: 1 }],
  },
  chargeOnly: {
    label: "Cu2+ + 2e− → 2Cu",
    left: [
      { species: "Cu2", coefficient: 1 },
      { species: "electron", coefficient: 2 },
    ],
    right: [{ species: "Cu", coefficient: 2 }],
  },
  chloride: {
    label: "2Cl− → Cl2 + 2e−",
    left: [{ species: "Cl1", coefficient: 2 }],
    right: [
      { species: "Cl2", coefficient: 1 },
      { species: "electron", coefficient: 2 },
    ],
  },
  missingWater: {
    label: "4OH− → O2 + 4e−",
    left: [{ species: "OH1", coefficient: 4 }],
    right: [
      { species: "O2", coefficient: 1 },
      { species: "electron", coefficient: 4 },
    ],
  },
  wrongWater: {
    label: "OH− → O2 + 2H2O + e−",
    left: [{ species: "OH1", coefficient: 1 }],
    right: [
      { species: "O2", coefficient: 1 },
      { species: "water", coefficient: 2 },
      { species: "electron", coefficient: 1 },
    ],
  },
} as const;
export const ionicRecords = {
  initial: {
    label:
      "Zn + Cu2+ → Zn2+ + Cu; aqueous zinc displaces copper from copper sulfate",
    oxidised: "Zn",
    reduced: "Cu2+",
    spectator: "SO4²−",
  },
  silver: {
    label:
      "Cu + 2Ag+ → Cu2+ + 2Ag; supplied copper/silver nitrate displacement",
    oxidised: "Cu",
    reduced: "Ag+",
    spectator: "NO3−",
  },
  magnesium: {
    label: "Mg + 2H+ → Mg2+ + H2; magnesium reacts with hydrochloric acid",
    oxidised: "Mg",
    reduced: "H+",
    spectator: "Cl−",
  },
  iron: {
    label:
      "Fe + 2H+ → Fe2+ + H2; iron reacts with sulfuric acid in the supplied GCSE case",
    oxidised: "Fe",
    reduced: "H+",
    spectator: "SO4²−",
  },
} as const;
export const halfChoices: Record<HalfMode, Record<string, string[]>> = {
  electrons: {
    record: Object.keys(electronRecords),
    delta: Array.from({ length: 13 }, (_, i) => String(i - 6)),
    redox: ["unset", "oxidation", "reduction"],
  },

  cation: {
    record: ["copper", "silver", "aluminium", "sodium", "hydrogen"],
    a: Array.from({ length: 13 }, (_, i) => String(i)),
    b: Array.from({ length: 13 }, (_, i) => String(i)),
    c: Array.from({ length: 7 }, (_, i) => String(i)),
    electronSide: ["unset", "left", "right"],
  },
  anion: {
    record: [
      "hydroxide",
      "chloride",
      "bromide",
      "oxide",
      "sodiumOxidation",
      "ironOxidation",
    ],
    a: Array.from({ length: 13 }, (_, i) => String(i)),
    b: Array.from({ length: 7 }, (_, i) => String(i)),
    c: Array.from({ length: 13 }, (_, i) => String(i)),
    d: Array.from({ length: 13 }, (_, i) => String(i)),
    electronSide: ["unset", "left", "right"],
  },
  diagnose: {
    record: Object.keys(diagnoseRecords),
    claim: ["unset", "both", "atoms-only", "charge-only", "neither"],
  },
  ionic: {
    record: Object.keys(ionicRecords),
    oxidised: ["unset", "Zn", "Cu", "Mg", "Fe", "Cu2+", "Ag+", "H+"],
    reduced: ["unset", "Zn", "Cu", "Mg", "Fe", "Cu2+", "Ag+", "H+"],
    spectator: ["unset", "SO4²−", "NO3−", "Cl−", "Cu2+", "Ag+", "H+"],
  },
};
export function initialHalfBoard(mode: HalfMode): Record<string, string> {
  return Object.fromEntries(
    Object.keys(halfChoices[mode]).map((k) => [
      k,
      k === "record"
        ? mode === "cation"
          ? "copper"
          : mode === "anion"
            ? "hydroxide"
            : "initial"
        : ["a", "b", "c", "d", "delta"].includes(k)
          ? "0"
          : "unset",
    ]),
  );
}
export function validHalfBoard(
  mode: HalfMode,
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  return (
    Object.keys(b).length === Object.keys(halfChoices[mode]).length &&
    Object.entries(halfChoices[mode]).every(
      ([k, vs]) => typeof b[k] === "string" && vs.includes(b[k] as string),
    )
  );
}
export function coefficientBalance(
  mode: "cation" | "anion",
  b: Record<string, string | number>,
) {
  const r = halfEquationRecords[String(b.record) as HalfEquationKey],
    ion = r.left[0],
    product = r.right[0],
    left: { species: string; coefficient: number }[] = [
      { species: ion, coefficient: Number(b.a) },
    ],
    right: { species: string; coefficient: number }[] = [
      { species: product, coefficient: Number(mode === "cation" ? b.c : b.b) },
    ],
    electronCount = Number(mode === "cation" ? b.b : b.d);
  if (mode === "anion" && Number(b.c) > 0)
    right.push({ species: "water", coefficient: Number(b.c) });
  if (b.electronSide === "left")
    left.push({ species: "electron", coefficient: electronCount });
  if (b.electronSide === "right")
    right.push({ species: "electron", coefficient: electronCount });
  const result = balance(left, right),
    complete =
      Number(b.a) > 0 &&
      Number(mode === "cation" ? b.c : b.b) > 0 &&
      electronCount > 0 &&
      b.electronSide !== "unset";
  return {
    ...result,
    complete,
    correct:
      complete &&
      result.atoms &&
      result.charge &&
      b.electronSide === r.electronSide,
  };
}
export function halfPrediction(
  mode: HalfMode,
  b: Record<string, string | number>,
) {
  if (!validHalfBoard(mode, b)) return { complete: false, correct: false };
  if (mode === "cation" || mode === "anion") return coefficientBalance(mode, b);
  const key = String(b.record);
  if (mode === "electrons") {
    const r = electronRecords[key as keyof typeof electronRecords],
      complete = Number(b.delta) !== 0 && b.redox !== "unset";
    return {
      complete,
      correct:
        complete &&
        Number(b.delta) === r.target - r.start &&
        b.redox === r.redox,
    };
  }
  if (mode === "diagnose") {
    const r = diagnoseRecords[key as keyof typeof diagnoseRecords],
      v = balance([...r.left], [...r.right]),
      claim = v.atoms
        ? v.charge
          ? "both"
          : "atoms-only"
        : v.charge
          ? "charge-only"
          : "neither";
    return { complete: b.claim !== "unset", correct: b.claim === claim };
  }
  const r = ionicRecords[key as keyof typeof ionicRecords],
    complete = ["oxidised", "reduced", "spectator"].every(
      (k) => b[k] !== "unset",
    );
  return {
    complete,
    correct:
      complete &&
      b.oxidised === r.oxidised &&
      b.reduced === r.reduced &&
      b.spectator === r.spectator,
  };
}

/** Intact neutral molecules in a deliberately bounded physical-change model. */
export type MolecularPhase = "liquid" | "gas";
export type MolecularForce = "between" | "within";
export const moleculeGroups = [
  { id: "m1", atoms: ["Cl", "Cl"] },
  { id: "m2", atoms: ["Cl", "Cl"] },
  { id: "m3", atoms: ["Cl", "Cl"] },
  { id: "m4", atoms: ["Cl", "Cl"] },
] as const;
export function molecularLedger(phase: MolecularPhase) {
  return {
    phase,
    molecules: moleculeGroups.length,
    atoms: moleculeGroups.reduce((sum, m) => sum + m.atoms.length, 0),
    covalentBonds: moleculeGroups.length,
    molecularCharge: 0,
    mobileChargedCarriers: 0,
    conducts: false,
  };
}
export function boilingPrediction(force: MolecularForce) {
  return force === "between"
    ? {
        correct: true,
        text: "Intermolecular attractions are overcome. The Cl–Cl covalent bonds remain: four Cl₂ molecules still contain eight atoms. This physical change does not make ions or provide mobile charged carriers.",
      }
    : {
        correct: false,
        text: "Your within-molecule prediction is retained. Breaking the Cl–Cl covalent bonds would change the molecules chemically. Boiling separates intact Cl₂ molecules by overcoming attractions BETWEEN molecules.",
      };
}
/** Supplied rounded boiling data at approximately atmospheric pressure, for
 * a similar-family comparison; not a universal atom-count boiling rule. */
export const unbranchedAlkaneBoilingData = [
  { name: "Ethane", formula: "C₂H₆", carbonAtoms: 2, boiling: -89 },
  { name: "Propane", formula: "C₃H₈", carbonAtoms: 3, boiling: -42 },
  { name: "Butane", formula: "C₄H₁₀", carbonAtoms: 4, boiling: -1 },
] as const;

export type MolecularPropertyMode = "boiling" | "conduction" | "trend";
export function initialMolecularBoard(
  mode: MolecularPropertyMode,
): Record<string, string> {
  return mode === "boiling"
    ? { phase: "liquid", force: "unset" }
    : mode === "conduction"
      ? { phase: "liquid", conducts: "unset", carrier: "unset" }
      : { strength: "unset", energy: "unset" };
}
export function validMolecularBoard(
  mode: MolecularPropertyMode,
  board: Record<string, unknown>,
) {
  const allowed = (x: unknown, values: string[]) =>
    typeof x === "string" && values.includes(x);
  const keys = Object.keys(initialMolecularBoard(mode));
  if (
    Object.keys(board).length !== keys.length ||
    !keys.every((k) => k in board)
  )
    return false;
  if (mode === "trend")
    return (
      allowed(board.strength, ["unset", "stronger", "weaker"]) &&
      allowed(board.energy, ["unset", "more", "less"])
    );
  if (!allowed(board.phase, ["liquid", "gas"])) return false;
  if (mode === "boiling")
    return (
      allowed(board.force, ["unset", "between", "within"]) &&
      !(board.phase === "gas" && board.force === "unset")
    );
  return (
    allowed(board.conducts, ["unset", "yes", "no"]) &&
    allowed(board.carrier, ["unset", "neutral", "ions", "electrons"])
  );
}
export function molecularPropertyPrediction(
  mode: MolecularPropertyMode,
  board: Record<string, string | number>,
) {
  if (mode === "boiling") {
    if (board.force === "unset")
      return {
        correct: false,
        feedback:
          "Choose which attraction is overcome before comparing the gas.",
      };
    const result = boilingPrediction(board.force as MolecularForce);
    return { correct: result.correct, feedback: result.text };
  }
  if (mode === "trend") {
    const correct = board.strength === "stronger" && board.energy === "more";
    return {
      correct,
      feedback: correct
        ? "Within this similar unbranched family, larger butane molecules have stronger intermolecular attractions than ethane. More energy is needed to separate them: −1 °C is higher than −89 °C. Covalent bonds remain intact on boiling."
        : "Your comparison is retained. The supplied boiling point rises from −89 °C to −1 °C in this similar family. Stronger BETWEEN-molecule attractions require MORE energy to overcome. Do not explain the rise by breaking covalent bonds or compare unsigned magnitudes.",
    };
  }
  const correct = board.conducts === "no" && board.carrier === "neutral";
  return {
    correct,
    feedback: correct
      ? "Correct: the molecules are neutral. Movement alone does not carry electrical charge; this neutral molecular sample provides neither mobile ions nor delocalised electrons."
      : "Your prediction is retained. Moving neutral molecules do not carry electrical charge. Their covalent-bond electrons are not a supply of freely moving electrons. This sample contains no mobile charged carriers; ion-forming aqueous acids are a different case.",
  };
}

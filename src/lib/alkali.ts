export const alkaliMetals = {
  lithium: {
    name: "Lithium",
    symbol: "Li",
    z: 3,
    shells: [2, 1],
    observation:
      "Floats, fizzes relatively gently and gradually disappears; it usually does not melt into a ball.",
    meltingPoint: 181,
  },
  sodium: {
    name: "Sodium",
    symbol: "Na",
    z: 11,
    shells: [2, 8, 1],
    observation:
      "Floats, fizzes more vigorously, moves across the surface and commonly melts into a ball before disappearing.",
    meltingPoint: 98,
  },
  potassium: {
    name: "Potassium",
    symbol: "K",
    z: 19,
    shells: [2, 8, 8, 1],
    observation:
      "Floats and reacts very vigorously, moves and melts; often ignites with a lilac flame. Ignition depends on conditions.",
    meltingPoint: 63,
  },
} as const;
export type AlkaliMetal = keyof typeof alkaliMetals;
export type AlkaliPartner = "water" | "chlorine" | "oxygen";
export function alkaliEvidence(metal: AlkaliMetal, partner: AlkaliPartner) {
  const m = alkaliMetals[metal];
  if (partner === "water")
    return {
      observation: m.observation,
      products: `${m.name.toLowerCase()} hydroxide + hydrogen`,
      equation: `${m.name.toLowerCase()} + water → ${m.name.toLowerCase()} hydroxide + hydrogen`,
      interpretation:
        "The bubbles are an observation. Hydrogen is the identified gas; the dissolved metal hydroxide makes an alkaline solution.",
    };
  if (partner === "chlorine")
    return {
      observation: "A vigorous reaction forms a white solid salt.",
      products: `${m.name.toLowerCase()} chloride`,
      equation: `${m.name.toLowerCase()} + chlorine → ${m.name.toLowerCase()} chloride`,
      interpretation:
        "The metal loses one outer electron. Chlorine gains an electron; the resulting compound contains +1 metal ions and −1 chloride ions.",
    };
  return {
    observation:
      "A freshly exposed surface tarnishes in air; heated metal reacts more vigorously with oxygen to form solid oxygen-containing products.",
    products: "Metal oxide products in the GCSE description",
    equation: `${m.name.toLowerCase()} + oxygen → oxygen-containing metal compounds`,
    interpretation:
      "GCSE teaching describes oxide formation. The precise oxygen compounds depend on the metal and conditions: sodium/potassium can also form peroxides/superoxides, so this model does not assert a universal M₂O product.",
  };
}
/** Coefficients for M + H2O → MOH + H2, in that order. */
export function waterEquationCounts(coefficients: readonly number[]) {
  if (
    coefficients.length !== 4 ||
    coefficients.some((n) => !Number.isSafeInteger(n) || n < 0 || n > 6)
  )
    throw new RangeError("Use four integer coefficients from 0 to 6.");
  const [m, water, hydroxide, hydrogen] = coefficients;
  return {
    left: { metal: m, oxygen: water, hydrogen: water * 2 },
    right: {
      metal: hydroxide,
      oxygen: hydroxide,
      hydrogen: hydroxide + hydrogen * 2,
    },
  };
}

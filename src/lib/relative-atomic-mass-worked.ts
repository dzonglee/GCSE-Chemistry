/** Teaching calculations only: these examples never mark an answer or record exposure. */
export interface RelativeMassWorkedStep {
  title: string;
  before: string;
  action: string;
  after: string;
  why: string;
}

export interface RelativeMassPopulation {
  masses: readonly [number, number];
  counts: readonly [number, number];
  contributions: readonly [number, number];
  totalAtoms: number;
  totalContribution: number;
  mean: number;
}

export const displayRelativeMass = (value: number): string =>
  String(Number(value.toFixed(8)));

export function liveRelativeMassPopulation(
  lightPercent: number,
): RelativeMassPopulation {
  if (!Number.isFinite(lightPercent) || lightPercent < 0 || lightPercent > 100)
    throw new Error("The live mass-35 percentage must be between 0 and 100.");
  const heavyPercent = 100 - lightPercent;
  const lightContribution = 35 * lightPercent;
  const heavyContribution = 37 * heavyPercent;
  const totalContribution = lightContribution + heavyContribution;
  return {
    masses: [35, 37],
    counts: [lightPercent, heavyPercent],
    contributions: [lightContribution, heavyContribution],
    totalAtoms: 100,
    totalContribution,
    mean: totalContribution / 100,
  };
}

export function relativeMassPosition(lightPercent: number): string {
  if (lightPercent === 0)
    return "Only mass-37 atoms are present, so the mean equals 37.";
  if (lightPercent === 100)
    return "Only mass-35 atoms are present, so the mean equals 35.";
  if (lightPercent === 50)
    return "The two populations are equal, so the mean stays at the halfway value, 36.";
  return lightPercent > 50
    ? "The mean lies strictly between 35 and 37, below the equal-population mean of 36 and closer to 35."
    : "The mean lies strictly between 35 and 37, above the equal-population mean of 36 and closer to 37.";
}

export function relativeMassMainSteps(
  lightPercent: number,
): readonly RelativeMassWorkedStep[] {
  const population = liveRelativeMassPopulation(lightPercent);
  const [light, heavy] = population.counts.map(displayRelativeMass);
  const [lightProduct, heavyProduct] =
    population.contributions.map(displayRelativeMass);
  const total = displayRelativeMass(population.totalContribution);
  const mean = displayRelativeMass(population.mean);
  const position = relativeMassPosition(lightPercent);
  return [
    {
      title: "Change abundance, keep the isotope masses",
      before:
        "Start with 100 atoms: 50 mass-35 and 50 mass-37. The equal-population mean is (35 × 50 + 37 × 50) ÷ 100 = (1750 + 1850) ÷ 100 = 36.",
      action:
        "Use the mass-35 slider above. Set it to 75% for this worked example; mass-37 then becomes 25%. Try another setting to compare.",
      after: `Your live model represents ${light} mass-35 atoms and ${heavy} mass-37 atoms out of 100. ${position}`,
      why: "The isotope masses stay 35 and 37. Changing abundance changes how often each mass contributes to the population average; it does not change an individual atom's mass.",
    },
    {
      title: "Include every atom's contribution",
      before: `Your live population contains ${light} mass-35 atoms and ${heavy} mass-37 atoms out of 100.`,
      action:
        "Multiply each isotope mass by the number of represented atoms, then add both contributions.",
      after: `35 × ${light} = ${lightProduct}; 37 × ${heavy} = ${heavyProduct}. Total contribution: ${lightProduct} + ${heavyProduct} = ${total}.`,
      why: "Each atom contributes its isotope mass. Taking (35 + 37) ÷ 2 gives each isotope equal weight and is valid only when their abundances are equal.",
    },
    {
      title: "Find the mean for one represented atom",
      before: `The total relative-mass contribution is ${total} for 100 represented atoms.`,
      action:
        "Divide the total contribution by the total number of atoms: 100.",
      after: `Aᵣ = ${total} ÷ 100 = ${mean}. ${position}`,
      why: "This is a weighted population average, not the mass number of a new atom or a fractional neutron. Relative atomic mass is a ratio, so it has no unit.",
    },
  ];
}

export const relativeMassCountPopulation: RelativeMassPopulation = {
  masses: [30, 32],
  counts: [6, 4],
  contributions: [180, 128],
  totalAtoms: 10,
  totalContribution: 308,
  mean: 30.8,
};

export const relativeMassCountSteps: readonly RelativeMassWorkedStep[] = [
  {
    title: "Count the supplied atoms",
    before: "The table supplies six mass-30 atoms and four mass-32 atoms.",
    action: "Count both groups of tiles to find the total number of atoms.",
    after: "6 + 4 = 10 atoms. These are counts, not percentages.",
    why: "A mean divides by how many atoms are represented. We have ten actual tiles, so the denominator will be 10; there is no instruction to divide by 100.",
  },
  {
    title: "Total the two groups' contributions",
    before:
      "There are six mass-30 atoms and four mass-32 atoms: ten atoms in all.",
    action:
      "Multiply the mass of each isotope by its count, then add the products.",
    after: "30 × 6 = 180; 32 × 4 = 128. Total contribution: 180 + 128 = 308.",
    why: "The six lighter atoms and four heavier atoms must all contribute. Their total contribution is not yet a mean for one atom.",
  },
  {
    title: "Use the actual denominator",
    before: "The total contribution is 308 for 10 atoms.",
    action: "Divide by 10, the actual count of atoms, rather than by 100.",
    after: "Aᵣ = 308 ÷ 10 = 30.8. It lies between 30 and 32, closer to 30.",
    why: "Six of the ten atoms have mass 30, so their mass has the greater weight. Dividing by 100 would give 3.08, outside the supplied mass range: it would use a count of 100 although only 10 atoms are supplied. Relative atomic mass has no unit.",
  },
];

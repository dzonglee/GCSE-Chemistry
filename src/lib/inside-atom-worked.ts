/** Teaching-only states. These are not questions, attempts or assessment evidence. */
export interface WorkedAtomCounts {
  protons: number;
  neutrons: number;
  electrons: number;
}

export interface AtomWorkedStep {
  title: string;
  before: string;
  action: string;
  after: string;
  why: string;
  counts: WorkedAtomCounts;
  stateLabel: string;
  added: "electrons" | "neutron" | null;
}

export interface AtomWorkedExample {
  label: string;
  taskId: "atom-v2-g-neutral" | "atom-v2-g-mass";
  start: WorkedAtomCounts;
  target: WorkedAtomCounts;
  actionLabel: string;
  steps: readonly AtomWorkedStep[];
}

export function workedAtomSummary(counts: WorkedAtomCounts) {
  return {
    atomicNumber: counts.protons,
    massNumber: counts.protons + counts.neutrons,
    charge: counts.protons - counts.electrons,
  };
}

/** The two reviewed examples use the first three GCSE shell capacities. */
export function workedAtomShells(electrons: number): number[] {
  const shells: number[] = [];
  let remaining = electrons;
  for (const capacity of [2, 8, 8]) {
    if (remaining <= 0) break;
    const occupied = Math.min(capacity, remaining);
    shells.push(occupied);
    remaining -= occupied;
  }
  return shells;
}

export const insideAtomWorkedExamples: Readonly<
  Record<"main" | "difficult", AtomWorkedExample>
> = {
  main: {
    label: "Carbon-12: balance charge",
    taskId: "atom-v2-g-neutral",
    start: { protons: 6, neutrons: 6, electrons: 0 },
    target: { protons: 6, neutrons: 6, electrons: 6 },
    actionLabel: "Add six electrons",
    steps: [
      {
        title: "Read the carbon construction",
        before:
          "Start with 6 protons, 6 neutrons and 0 electrons. This is a construction state, not a neutral atom.",
        action:
          "Count the nuclear particles for A, then subtract the electron count from the proton count for charge.",
        after: "Z = 6; A = 6 + 6 = 12; charge = +6 − 0 = +6.",
        why: "The 6 protons identify carbon. Protons and neutrons make the mass number 12. With no electrons placed, the positive charge is not cancelled.",
        counts: { protons: 6, neutrons: 6, electrons: 0 },
        stateLabel: "Carbon-12 construction state: charge +6",
        added: null,
      },
      {
        title: "Add electrons without changing the nucleus",
        before: "The construction has p = 6, n = 6, e = 0 and charge +6.",
        action:
          "Add 6 electrons to the shells. Leave all 6 protons and 6 neutrons in the nucleus.",
        after: "Now p = 6, n = 6, e = 6. Charge = +6 − 6 = 0; A = 6 + 6 = 12.",
        why: "Each electron has relative charge −1, so six electrons cancel the six positive proton charges. Electrons have a small mass, but they are not counted in mass number.",
        counts: { protons: 6, neutrons: 6, electrons: 6 },
        stateLabel: "Neutral carbon-12: six electrons added",
        added: "electrons",
      },
      {
        title: "Check mass number and charge separately",
        before:
          "The starting construction had A = 12 and charge +6. The six added electrons are outside the nucleus.",
        action:
          "Compare nuclear counts and charge before and after the change. Ask whether adding neutrons instead would cancel the positive charge.",
        after:
          "A stays 12 because p + n stays 6 + 6. Charge changes from +6 to 0 because e changes from 0 to 6.",
        why: "Neutrons have no charge: adding them would change A without cancelling the positive charge. Neutrality requires equal proton and electron counts, not an electron count equal to A.",
        counts: { protons: 6, neutrons: 6, electrons: 6 },
        stateLabel: "Neutral carbon-12: A = 12, charge 0",
        added: null,
      },
    ],
  },
  difficult: {
    label: "Aluminium-27: infer neutrons",
    taskId: "atom-v2-g-mass",
    start: { protons: 13, neutrons: 13, electrons: 13 },
    target: { protons: 13, neutrons: 14, electrons: 13 },
    actionLabel: "Add one neutron",
    steps: [
      {
        title: "Read the aluminium construction",
        before:
          "Start with 13 protons, 13 neutrons and 13 electrons. This construction is neutral, but it does not yet have mass number 27.",
        action:
          "Calculate A from the nucleus and charge from the proton and electron counts.",
        after: "Z = 13; A = 13 + 13 = 26; charge = +13 − 13 = 0.",
        why: "The 13 protons identify aluminium. Equal proton and electron counts make this construction neutral; they do not determine its neutron count.",
        counts: { protons: 13, neutrons: 13, electrons: 13 },
        stateLabel: "Aluminium construction state: A = 26, charge 0",
        added: null,
      },
      {
        title: "Find the missing neutron",
        before:
          "The target is aluminium-27: A = 27 and Z = 13. The construction currently has 13 neutrons.",
        action:
          "Use n = A − Z = 27 − 13 = 14. Add one neutron, because 14 − 13 = 1.",
        after:
          "Now p = 13, n = 14, e = 13. A = 13 + 14 = 27; charge = +13 − 13 = 0.",
        why: "A counts both kinds of nuclear particle. The extra neutron adds one to A and no charge, so the construction becomes neutral aluminium-27.",
        counts: { protons: 13, neutrons: 14, electrons: 13 },
        stateLabel: "Neutral aluminium-27: one neutron added",
        added: "neutron",
      },
      {
        title: "Explain why the other particles cannot do this job",
        before:
          "Adding one neutron changed the construction from A = 26 to A = 27 while p = 13 and e = 13 stayed fixed.",
        action:
          "Compare the neutron change with adding an electron or changing the proton count.",
        after:
          "The finished construction has A = 27 and charge 0. Adding an electron to the starting construction instead would leave A = 26 and give charge −1.",
        why: "An electron changes charge, not mass number. Changing the proton count changes Z and therefore the element. A neutron is the particle that changes A while preserving both aluminium identity and neutrality here.",
        counts: { protons: 13, neutrons: 14, electrons: 13 },
        stateLabel: "Neutral aluminium-27: A = 27, charge 0",
        added: null,
      },
    ],
  },
};

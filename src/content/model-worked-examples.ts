// Keys identify existing, formative-only model cases. The last step uses the
// case's authored explanation, so the model, proposal and conclusion agree.
export const modelWorkedExamples: Readonly<
  Partial<Record<string, readonly [string, string]>>
> = {
  "as-v1-g-enlarge": [
    "Read the atom-to-nucleus radius ratio in the model. The atom radius stays 20 000 times the nucleus radius after enlargement.",
    "Set the atom radius to 100 m. Divide by 20 000 to find the corresponding nucleus radius in metres, then multiply by 1000 to convert to millimetres.",
  ],
  "iso-v1-g-chlorine": [
    "Keep the atomic number at 17 for both models. It counts protons and identifies chlorine.",
    "For chlorine-37, subtract the 17 protons from the total of 37 protons and neutrons. Compare the nuclei while keeping both models neutral.",
  ],
  "sh-v1-g-oxygen": [
    "Start with eight electrons because a neutral oxygen atom has the same number of electrons as protons.",
    "Place two in the first shell, filling it. Subtract those two from the total to find how many to place in the second shell.",
  ],
  "if-v1-g-sulfate": [
    "Identify the charges of the whole ions in the model. One Na⁺ contributes +1, and one SO₄²⁻ contributes −2.",
    "Keep sulfate as one group. Add sodium ions until the positive and negative totals cancel, then read off the smallest whole-ion ratio.",
  ],
  "cb-v1-g-h2": [
    "Find the one outer electron on each hydrogen atom before the bond forms.",
    "Move one electron from each hydrogen into the overlap. Count the electrons around either hydrogen, then count the distinct electrons in the whole molecule.",
  ],
  "lr-v1-g-capacities": [
    "Read the coefficients: CH₄ + 2O₂ → CO₂ + 2H₂O. One reaction as written uses one methane for every two oxygen molecules.",
    "Compare 3 ÷ 1 for methane with 4 ÷ 2 for oxygen. Use the smaller supply-to-coefficient ratio to scale the whole equation.",
  ],
  "gv-v1-g-molar": [
    "At the supplied room temperature and pressure, each mole of gas occupies 24 dm³. The amount in the model is 0.30 mol.",
    "Multiply the amount by 24 to get dm³. The same volume contains 1000 cm³ for each dm³, so multiply that result by 1000 for the second unit.",
  ],
  "ef-v1-g-masses": [
    "Compare amounts of atoms. Magnesium and oxygen atoms have different relative masses, so their measured gram masses cannot be used as the atom ratio.",
    "Divide the 4.8 g of magnesium by 24 and the 3.2 g of oxygen by 16. Divide both resulting amounts by the smaller value to simplify the ratio.",
  ],
  "tc-v1-g-titre": [
    "Find the amount delivered by the burette from the difference between its two readings. The final reading includes the initial offset.",
    "Convert the delivered volume to dm³ before using the concentration, which tells you the amount of NaOH per dm³.",
  ],
  "mr-v1-g-displacement": [
    "Compare zinc and copper in the reactivity reference. The model starts with zinc metal and copper ions in solution.",
    "Track the two metals separately. Zinc atoms form ions while copper ions become deposited metal. Keep sulfate in the solution inventory.",
  ],
  "an-v1-g-pairs": [
    "In the model, each H⁺ unit pairs with one OH⁻ unit to form one additional water unit.",
    "Use one of each ion for every pair. Count pairs until one reactant runs out, then compare the water and ion inventories.",
  ],
  "el-v1-g-move": [
    "Read the + charge on Zn²⁺ and find the electrode carrying the opposite sign in this electrolytic cell.",
    "Move the ion toward that electrode. If the layout is reversed, use the sign again to identify the destination.",
  ],
  "profile-v1-g-build": [
    "Set the two plateaus using the supplied energies. Reactants start at 80 kJ and products finish at 30 kJ.",
    "Measure the forward activation energy up from the reactant level. Position the peak 40 kJ above that starting plateau.",
  ],
  "path-v1-g-hydrogen": [
    "Find the two carbons joined by the double bond in ethene. Both are involved in the addition.",
    "Make that link a single bond and attach one new hydrogen to each carbon. Count the original and added atoms to check the product.",
  ],
  "chromatography-v1-g-setup": [
    "Find the two fixed heights in the model. The solvent must reach the bottom of the paper at 2 mm so it can travel up the paper.",
    "Check that the solvent level is below the sample origin at 18 mm, so the sample can move with the rising solvent.",
  ],
  "separation-practical-v1-g-salt": [
    "Use the model to track the two solids separately. Salt dissolves in water, while the sand stays solid and can be retained by a filter.",
    "Follow the salt into the filtrate. Concentrate the solution and then cool it so crystals form before collection and drying.",
  ],
  "climate-v1-g-trend": [
    "Read the first and last anomalies in the supplied graph. They are −0.2 °C and +0.6 °C relative to the stated reference average.",
    "Use final value minus initial value. Keep the negative sign on the first reading when substituting, and give the change a sign.",
  ],
  "waste-v1-g-solids": [
    "Use the solids record to track dry suspended solids only. Start with the full 120 kg, then account for solids removed by screening and grit removal.",
    "Subtract the amount that settles into sludge from the remaining dry solids. Check that the different destinations sum to the original 120 kg.",
  ],
};

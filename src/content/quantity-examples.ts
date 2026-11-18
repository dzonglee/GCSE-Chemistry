export interface QuantityWorkedExample {
  given: string;
  prompt: string;
  unit: string;
  result: number;
  reasoning: readonly [string, string, string];
}

export const quantityExamples: Readonly<
  Partial<Record<string, QuantityWorkedExample>>
> = {
  "formulae-and-mass": {
    given:
      "Calcium carbonate has formula CaCO₃. Use Ca = 40, C = 12 and O = 16.",
    prompt: "What is its relative formula mass?",
    unit: "",
    result: 100,
    reasoning: [
      "The subscript 3 belongs to oxygen. Count one calcium, one carbon and three oxygens.",
      "The oxygen contributes 3 × 16 = 48.",
      "Add each contribution once. 40 + 12 + 48 = 100. Relative formula mass has no unit.",
    ],
  },
  "percentage-composition": {
    given: "Magnesium oxide has formula MgO. Use Mg = 24 and O = 16.",
    prompt: "What percentage of its mass comes from magnesium?",
    unit: "%",
    result: 60,
    reasoning: [
      "The whole formula unit contributes 24 + 16 = 40.",
      "Compare the magnesium part to the whole. Its fraction is 24 ÷ 40.",
      "Multiplying 0.60 by 100 gives 60%. One Mg for each O does not imply equal masses.",
    ],
  },
  "conservation-and-concentration": {
    given:
      "A solution contains 7.2 g of dissolved sugar in a final volume of 240 cm³.",
    prompt: "What is its mass concentration?",
    unit: "g/dm³",
    result: 30,
    reasoning: [
      "The final volume is 240 ÷ 1000 = 0.240 dm³.",
      "Mass concentration gives the mass in one cubic decimetre. Divide mass by volume.",
      "7.2 ÷ 0.240 = 30 g/dm³. Multiplying 30 by 0.240 returns the original 7.2 g.",
    ],
  },
  "changing-concentration": {
    given:
      "A 0.30 dm³ sample has a sugar concentration of 24 g/dm³. Water is added until the total volume is 0.80 dm³.",
    prompt: "What is the new concentration?",
    unit: "g/dm³",
    result: 9,
    reasoning: [
      "The original sample contains 24 × 0.30 = 7.2 g of sugar.",
      "Adding water spreads the same 7.2 g through 0.80 dm³.",
      "7.2 ÷ 0.80 = 9 g/dm³. The concentration falls because the volume increases.",
    ],
  },
  "moles-and-reacting-masses": {
    given: "A sample contains 18 g of magnesium. Use a molar mass of 24 g/mol.",
    prompt: "How many moles of magnesium are in the sample?",
    unit: "mol",
    result: 0.75,
    reasoning: [
      "One mole of magnesium has a mass of 24 g.",
      "Compare the sample mass with the mass of one mole. Divide 18 g by 24 g/mol.",
      "18 ÷ 24 = 0.75 mol. The amount is below one mole because 18 g is below 24 g.",
    ],
  },
  "molar-concentration": {
    given:
      "A sample contains 0.045 mol of solute in a final volume of 150 cm³.",
    prompt: "What is the amount concentration?",
    unit: "mol/dm³",
    result: 0.3,
    reasoning: [
      "Convert the measured volume to the denominator unit. 150 cm³ = 0.150 dm³.",
      "Divide the amount in moles by the final volume in dm³.",
      "0.045 ÷ 0.150 = 0.30 mol/dm³. Multiplication by 0.150 dm³ recovers 0.045 mol.",
    ],
  },
  "yield-and-atom-economy": {
    given:
      "A calculation predicts 15 g of product. The measured mass of pure product is 10.8 g.",
    prompt: "What is the percentage yield?",
    unit: "%",
    result: 72,
    reasoning: [
      "The predicted mass sets the 100% reference.",
      "Compare the measured mass to that reference. The fraction obtained is 10.8 ÷ 15 = 0.72.",
      "0.72 × 100 = 72%. Swapping the masses would incorrectly put the smaller yield above 100%.",
    ],
  },
  "atom-economy": {
    given:
      "For one reaction as written, the products total 80 g. Of this, 52 g is the desired product.",
    prompt: "What is the atom economy for that product?",
    unit: "%",
    result: 65,
    reasoning: [
      "Count the desired product in the numerator and every product in the denominator.",
      "The desired fraction of the total product mass is 52 ÷ 80 = 0.65.",
      "0.65 × 100 = 65%. This uses the balanced reaction proportions, independently of how much product is collected.",
    ],
  },
  "measuring-rates": {
    given: "A graph records 14 cm³ of gas at 10 s and 56 cm³ at 40 s.",
    prompt: "What is the mean rate over this interval?",
    unit: "cm³/s",
    result: 1.4,
    reasoning: [
      "Subtract the first reading from the second. The increase is 56 − 14 = 42 cm³.",
      "The same interval lasts 40 − 10 = 30 s.",
      "42 ÷ 30 = 1.4 cm³/s. Using the final volume alone would include gas collected before 10 s.",
    ],
  },
};

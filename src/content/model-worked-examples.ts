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
  "g1-v1-g-ion": [
    "Start with three positive protons and three negative electrons in the neutral lithium atom.",
    "Remove the outer electron in the model. Subtract the remaining electron count from the proton count to find the ion charge.",
  ],
  "g7-v1-g-molecule": [
    "Inspect the molecule in the comparison model. Both connected particles are chlorine atoms.",
    "Write one chlorine symbol followed by a subscript for the number of bonded atoms. A superscript minus would instead show a charge.",
  ],
  "g0-v1-g-balloon": [
    "Compare each gas with air at the supplied conditions. A gas less dense than air can provide lift.",
    "Use the separate flammability evidence to eliminate any gas that burns. Low density by itself gives no information about flammability.",
  ],
  "tm-v1-g-compare": [
    "Read density as mass for the same volume. Compare the supplied transition-metal examples with the Group 1 examples on that measure.",
    "Use hardness to compare resistance to scratching or indentation. Both measures are physical properties and should be checked independently.",
  ],
  "fu-v1-g-separation": [
    "Follow the bonds around each C₆₀ cage, then locate the space between the two cages.",
    "Move the molecules apart in the model. Track the increased gap between cages while checking that each carbon remains connected within its original cage.",
  ],
  "np-v1-g-cube": [
    "The 4 nm edge gives a square of 4 × 4 nm² on each face. Count all six exposed faces.",
    "For volume, multiply the base area by the height to get nm³. In area ÷ volume, nm² divided by nm³ leaves nm⁻¹.",
  ],
  "be-v1-g-words": [
    "Translate the named products into KOH and H₂ before changing any equation coefficients.",
    "Pair hydrogen atoms into H₂ molecules. Then adjust whole coefficients for KOH, water and potassium to match K, O and H on both sides.",
  ],
  "rm-v1-g-forward": [
    "Use the nitrogen molar mass to convert the supplied grams to moles. Hydrogen is in excess, so nitrogen sets the reaction amount.",
    "Scale the balanced equation from one N₂ to two NH₃, then convert the resulting ammonia amount to grams using its own molar mass.",
  ],
  "bm-v1-g-amounts": [
    "Divide each of the three given masses by its own molar mass. The gram values do not give the reacting-particle ratio.",
    "Divide all three amounts by the smallest non-zero amount, keeping Mg, O₂ and MgO in order, then check the balanced atom counts.",
  ],
  "ty-v1-g-maximum": [
    "Convert both supplied reactant masses to moles. The equation requires three moles of H₂ for each mole of N₂, so check that there is enough hydrogen.",
    "Use the available limiting amount and the N₂ to NH₃ coefficient ratio, then multiply the product amount by the ammonia molar mass.",
  ],
  "pp-v1-g-output": [
    "Read the theoretical product mass for each route and convert its percentage yield to a fraction.",
    "Multiply each theoretical mass by its own yield fraction. Compare the resulting product masses for the equal feeds shown.",
  ],
  "or-v1-g-oxidation": [
    "Read O₂ as two oxygen atoms. Track those atoms through the equation into the two MgO formula units.",
    "Compare the oxygen attached to the magnesium before and after. Use the gain of oxygen to classify the magnesium change.",
  ],
  "me-v1-g-route": [
    "Locate carbon and iron in the supplied reactivity comparison. Carbon is above iron here.",
    "Look for a route in which carbon removes oxygen from iron oxide, leaving iron. Carbon changes chemically as it takes the oxygen.",
  ],
  "ss-v1-g-method": [
    "Match the sulfate in the desired salt to sulfuric acid, and identify the insoluble copper oxide as the copper source.",
    "In the simulation, excess oxide can remain solid while the product salt is dissolved. Follow the solid into the filter residue and the salt into the filtrate.",
  ],
  "aqp-v1-g-cathode": [
    "Select the cathode in the supplied cell. Copper ions move towards it and can gain electrons there.",
    "Use the supplied comparison with hydrogen to select copper as the cathode product for this aqueous case. The molten-salt case has different competing species.",
  ],
  "he-v1-g-electrons": [
    "Read the starting copper charge as +2 and the final metallic copper charge as zero.",
    "Add one negative electron at a time on the reactant side. Stop when the total charge on that side matches the neutral product.",
  ],
  "ph-v1-g-reading": [
    "Read the simulated probe value and use the marked neutral value of 7 at 25 °C.",
    "Locate 4.2 below 7 on the pH scale. Classification depends on which side of neutral the reading falls.",
  ],
  "acid-v1-g-dilution": [
    "In this model the acid remains fully ionised and its amount is conserved when water is added.",
    "A tenfold volume increase makes the hydrogen-ion concentration one tenth as large. On the pH scale, that raises pH by one under the supplied conditions.",
  ],
  "tech-v1-g-reading": [
    "Identify the initial and final reading on the same burette scale. Read the marked values at the liquid level, retaining the displayed precision.",
    "Subtract the initial reading to remove the starting offset. The difference is a delivered volume in the same units.",
  ],
  "disp-v1-g-combine": [
    "Count the electrons made in one aluminium half-equation and used in one copper half-equation. Both totals must agree.",
    "Use six as the smallest common total for three and two. Multiply each entire half-equation by the factor that makes six electrons.",
  ],
  "heat-v1-g-temperature": [
    "Identify the baseline and the reaction-stage maximum in the supplied record.",
    "Use maximum minus baseline to find the rise. A difference in degrees Celsius uses no conversion to an absolute temperature.",
  ],
  "bond-v1-g-ledger": [
    "Breaking the bonds in one H₂ and one Cl₂ takes energy. Add the two supplied bond energies to find that input.",
    "The two HCl molecules form two H–Cl bonds. Subtract the total energy released on formation from the input for the signed change.",
  ],
  "ep-v1-g-observe": [
    "Locate the starting plateau on the trace and record its temperature.",
    "Use the peak during the reaction and subtract the baseline. Ignore the later cooling values when calculating the rise.",
  ],
  "cf-v1-g-cell": [
    "Select the copper and zinc pair and sodium chloride electrolyte in the supplied comparison.",
    "Read the recorded potential difference for that exact pairing and solution. A changed electrolyte or electrode pair requires its own measurement.",
  ],
  "pol-v1-g-links": [
    "Follow the supplied open chain from one end to the other, counting each junction once.",
    "Each additional node after the first extends the chain by one junction. In this condensation model each junction corresponds to one water molecule.",
  ],
  "natural-v1-g-count": [
    "Find each complete nucleotide on one strand of the model. A rung is formed between partners on different strands.",
    "Count four complete units along one strand and four along the other. Add both strand counts to obtain the total.",
  ],
  "purity-v1-g-width": [
    "Locate the start and finish temperatures separately. Both positions are below zero but the finish is warmer.",
    "Subtract the starting reading from the finishing reading, keeping the negative sign in parentheses. The width measures the distance between the two readings.",
  ],
  "gas-tests-v1-g-pop": [
    "Read the record for the action taken, the sound heard and the proposed gas identity.",
    "Select the sound as evidence observed in the test. The gas identity is an inference from that evidence.",
  ],
  "ion-tests-v1-g-flame": [
    "Identify the reported flame colour before looking at the cation names.",
    "Compare lilac with the reference colours for the supplied single-cation samples. The match supports a cation identity within that set.",
  ],
  "instrumental-analysis-v1-g-na": [
    "Record the three line positions from the model on the same scale as the references.",
    "Check every position against each reference. A candidate that matches only the shared line at position 6 cannot explain the entire pattern.",
  ],
  "early-atmosphere-v1-g-graph": [
    "Select reconstruction A and follow the solid oxygen curve. Find 12% on the vertical axis.",
    "Trace horizontally to the curve, then down to the time axis. Read the label in millions of years ago, with older dates on the left.",
  ],
  "greenhouse-v1-g-balance": [
    "Subtract reflected energy from incoming energy to find the energy absorbed in the supplied model.",
    "Subtract the outgoing energy from that absorbed total on the same basis. Equal absorption and loss give zero net gain even at a warm temperature.",
  ],
  "pollution-v1-g-products": [
    "Identify the elements supplied by the methane and oxygen and use the stated complete combustion conditions.",
    "Track methane’s carbon into carbon dioxide and its hydrogen into water. Carbon monoxide and soot would indicate incomplete oxidation.",
  ],
  "cycle-v1-g-ledger": [
    "Use the model arrows to list carbon entering and leaving the atmospheric store. Count the transferred carbon in grams in both totals.",
    "Calculate incoming minus outgoing to find the signed change, then add it to the starting atmospheric store.",
  ],
  "water-v1-g-energy": [
    "Read the total energy and the treated volume for each route in the supplied coastal record.",
    "Divide the energy by the volume for each route separately to obtain kWh/m³. Subtract the route A result from route B.",
  ],
  "bio-v1-g-grade": [
    "Multiply the feed mass by the copper mass fraction to find the copper already present.",
    "Apply the recovery percentage to that copper mass. Account for the unrecovered copper by subtracting the recovered amount from the original inventory.",
  ],
  "lca-v1-g-inventory": [
    "Check that A and B refer to the same service. Use only the energy entries for the matched life-cycle stages.",
    "Sum each route’s energy across those stages in kJ, then subtract the B total from the A total to compare this one measure.",
  ],
  "materials-v1-g-selection": [
    "Read the maximum acceptable density and the minimum acceptable strength as separate limits.",
    "Check each candidate against both limits. A material failing either limit cannot meet the supplied design brief.",
  ],
  "haber-v1-g-nutrients": [
    "Read the nitrogen percentage as a mass fraction of the complete fertiliser mixture, including the other elements.",
    "Convert that percentage to a decimal and multiply by the full 20 kg. Use the same whole mass for each other nutrient calculation.",
  ],
};

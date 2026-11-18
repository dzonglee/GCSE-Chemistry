interface TeachingScenario {
  prompt: string;
  steps: readonly [string, string, string];
}

// These original scenarios are unscored, with no question IDs or saved attempts.
export const standaloneWorkedExamples: Readonly<
  Partial<Record<string, TeachingScenario>>
> = {
  "atomic-models": {
    prompt:
      "Two hypothetical atoms have equal total positive charge. In one it is spread out. In the other it is concentrated in a tiny centre. Most positive test particles pass straight through both. What further observation distinguishes the models?",
    steps: [
      "A straight path can occur in both cases, so this observation alone cannot locate the positive charge.",
      "Compare the tracks of particles that pass very close to the centre. Concentrating charge makes a strong repulsion possible over a very small region.",
      "A few very large turns distinguish the concentrated-centre model. The rarity of those turns fits a very small nucleus.",
    ],
  },
  "periodic-patterns": {
    prompt:
      "One neutral atom has arrangement 2,8,7. A second has 2,7. What stays the same when you place them on the periodic table?",
    steps: [
      "Count electrons in the last occupied shell of each atom. Both have seven, so they occupy the same main group.",
      "Count occupied shells separately. The first has three and the second has two.",
      "Both are Group 7 in the GCSE numbering. The first is in Period 3 and the second is in Period 2.",
    ],
  },
  "periodic-development": {
    prompt:
      "In a fictional periodic table a known element matches the properties of the next-but-one column. The nearer column has no observed member for this row. Which placement gives a prediction?",
    steps: [
      "Compare the known element with the recurring properties of each column. Its properties match the second of the two columns.",
      "Place the known element with the better property match and leave the nearer place vacant. Use the nearer column to predict properties of its missing member.",
      "The vacancy gives a prediction that can be tested when a candidate is found. The pattern is evidence for the placement, and later observations can revise it.",
    ],
  },
  "states-of-matter": {
    prompt:
      "A particle model shows a closely packed sample whose particles move past one another. The sample fills the bottom of a wider container. How would you distinguish it from a gas?",
    steps: [
      "Follow individual particles. Movement past neighbours lets this sample change shape to fit the bottom of its container.",
      "Compare spacing with a gas. The particles in the supplied sample stay close, while a gas disperses throughout the available container.",
      "The model shows a liquid. It changes shape while retaining approximately the same volume.",
    ],
  },
  "ionic-bonding": {
    prompt:
      "A lithium atom and a fluorine atom are shown before ion formation. Lithium loses one electron and fluorine gains it. How do the two changes account for the attraction?",
    steps: [
      "Keep both nuclei unchanged. Lithium now has one fewer electron than proton, and fluorine has one more electron than proton.",
      "Record the two charge imbalances separately as Li⁺ and F⁻. The electron lost by lithium is accounted for in fluorine.",
      "The oppositely charged ions attract electrostatically. Electron transfer explains their formation, and the attraction is the ionic bond.",
    ],
  },
  "ionic-structures": {
    prompt:
      "A diagram crops the edge off an ionic lattice. One ion near the drawn edge appears to have three neighbours, while a labelled interior ion has six. What can you conclude about the bulk?",
    steps: [
      "Check which ions could be missing from the cropped picture. The cut can hide some neighbours of the apparent edge ion.",
      "Use the interior ion to read the neighbour count for this model. Check that the neighbours carry the opposite charge.",
      "Six neighbours describes the interior site shown. A cropped view alone does not establish a different bulk structure.",
    ],
  },
  "small-molecules-properties": {
    prompt:
      "A sealed molecular model of liquid bromine is warmed until it becomes a gas. What changes about the particles you count?",
    steps: [
      "Identify each bromine molecule as a bonded Br₂ pair at the start.",
      "As particles separate, compare the distance between pairs with the distance between the atoms within a pair.",
      "The pairs spread farther apart as intermolecular attractions are overcome. Each pair stays a Br₂ molecule during this physical change.",
    ],
  },
  "structure-and-properties": {
    prompt:
      "A metal strip is bent so layers shift and the strip stays intact. What feature of metallic bonding accounts for this?",
    steps: [
      "Picture positive metal ions surrounded by delocalised electrons. The electrons are distributed across the structure.",
      "When layers shift, positive ions still attract the delocalised electrons at their new positions.",
      "The electrostatic attraction persists as the layers move. This helps a metal deform without breaking apart immediately.",
    ],
  },
  "carbon-structures": {
    prompt:
      "A small drawing of a diamond fragment shows a central carbon with four neighbours and ends at the next ring of atoms. Would the whole crystal contain separate groups of five atoms?",
    steps: [
      "Count the four direct bonds around the selected carbon. This count describes a local arrangement.",
      "Follow bonds beyond those four neighbours. They belong to the same connected structure and lead to more carbon atoms.",
      "The drawing is a crop of a giant covalent lattice. The local group of five drawn atoms is part of the crystal.",
    ],
  },
  graphite: {
    prompt:
      "Graphite leaves a dark mark when rubbed on paper. Which bonds or attractions are most readily overcome in this process?",
    steps: [
      "Follow a sheet across the graphite model. Carbon atoms are joined by strong covalent bonds within that sheet.",
      "Look across the gaps between sheets. Weaker attractions allow sheets or fragments of sheets to slide off more readily.",
      "The mark is consistent with separation between layers. The within-sheet covalent network can remain intact in transferred fragments.",
    ],
  },
  graphene: {
    prompt:
      "A drawing shows two identical graphene sheets placed one above the other. Is the drawing a single graphene sheet, and is its thickness the same as that of one sheet?",
    steps: [
      "Inspect the drawing edge-on. Each graphene sheet consists of one layer of carbon atoms.",
      "Count the separate layers. Their hexagonal in-plane networks do not merge simply because the layers are stacked.",
      "The drawing contains two stacked layers. One graphene sheet is one atom thick.",
    ],
  },
  "carbon-nanotubes": {
    prompt:
      "A cartoon nanotube cylinder is slit lengthwise and unrolled on paper. Which structural feature makes the unrolled picture resemble a graphene sheet?",
    steps: [
      "Follow the wall rather than the empty space inside. The wall is a connected network of carbon atoms.",
      "In the cartoon, unrolling changes the overall shape while retaining the arrangement of hexagons away from the cut.",
      "The unrolled wall resembles a single hexagonal carbon sheet. The slit illustrates the geometry and does not describe an experimental preparation.",
    ],
  },
  "polymer-structures": {
    prompt:
      "Two short pieces of a polymer chain are shown separated in a picture. How can you tell which lines represent bonds along a chain?",
    steps: [
      "Trace the backbone through each piece. A continuous line between atoms represents a covalent connection along that molecule.",
      "Look for an explicit covalent line joining the two pieces. A gap or close spacing alone does not show that the chains are bonded to each other.",
      "The bonds within each backbone join its repeat units. The picture can show neighbouring chain pieces without making them one molecule.",
    ],
  },
  "conservation-of-mass": {
    prompt:
      "A simulated closed reaction vessel has a mass of 86 g before a reaction. In a second, identical setup 3 g of gas leaves through a vent. Compare the final balance readings.",
    steps: [
      "Define what the balance includes: the vessel and everything still inside it.",
      "The closed setup keeps all products. The vented setup loses 3 g from the weighed system, so subtract 3 g from 86 g.",
      "The readings are 86 g and 83 g respectively. Include the escaped 3 g and the full second system still accounts for 86 g.",
    ],
  },
  "measurement-uncertainty": {
    prompt:
      "Four simulated measurements are 8.1 g, 8.3 g, 8.2 g and 8.9 g. The last weighing has a recorded instrument fault. Find the mean of the retained measurements.",
    steps: [
      "Use the recorded fault as the reason to exclude 8.9 g from the calculation and retain the original reading in the record.",
      "Add 8.1 g, 8.3 g and 8.2 g. Divide by three because three readings contributed to the sum.",
      "The retained mean is 24.6 g ÷ 3 = 8.2 g. A large reading alone would call for investigation before exclusion.",
    ],
  },
  "fuel-cell-half-equations": {
    prompt:
      "In an acidic hydrogen fuel-cell diagram, the hydrogen electrode releases 6 electrons in the illustrated reaction packet. How much hydrogen and how many protons does that packet represent?",
    steps: [
      "The acidic oxidation balance is H₂ → 2H⁺ + 2e⁻. A single packet conserves two H atoms and total charge zero.",
      "Six electrons is three times the single-packet amount. Multiply each species amount by three, keeping each formula fixed.",
      "For this packet, 3H₂ → 6H⁺ + 6e⁻. The right side has six H atoms and total charge +6 − 6 = 0.",
    ],
  },
  "interpreting-cell-voltages": {
    prompt:
      "A simulated voltmeter reads +0.74 V with the first electrode on the positive lead. What should it read immediately after swapping the leads on the unchanged cell?",
    steps: [
      "The sign describes the direction of the potential difference relative to the connected leads.",
      "Swap only the leads. The same two electrode potentials now enter the difference in the reverse order.",
      "The new reading is −0.74 V. Reversing connections changes the sign and leaves the magnitude unchanged.",
    ],
  },
  "rates-from-tangents": {
    prompt:
      "On a supplied tangent to a product-volume graph, two readable points are (12 s, 19 cm³) and (28 s, 51 cm³). Find the rate that this tangent represents.",
    steps: [
      "Read the points from the straight tangent. Use the same order for subtracting both coordinates.",
      "The volume rise is 51 − 19 = 32 cm³ over a run of 28 − 12 = 16 s. Divide the rise by the run.",
      "The tangent gradient is +2.0 cm³/s. It represents the instantaneous formation rate at the contact with the curve.",
    ],
  },
  "collision-theory": {
    prompt:
      "In a simulation three encounters have energies of 18, 42 and 49 illustrative units. The energy threshold is 40 units. Only the last encounter has suitable orientation. Which can react?",
    steps: [
      "Compare each energy with 40 units. The 42-unit and 49-unit encounters pass the energy test.",
      "Check orientation as a separate condition for the two encounters that pass. The 42-unit encounter is misaligned.",
      "Only the 49-unit encounter meets both stated conditions. Passing the energy threshold alone does not guarantee a reaction.",
    ],
  },
  "temperature-and-catalysts": {
    prompt:
      "A teaching diagram gives a forward barrier of 55 kJ/mol and a catalysed forward barrier of 38 kJ/mol at the same temperature. What changes for a collision with 46 kJ/mol on this scale?",
    steps: [
      "Compare 46 kJ/mol with the original barrier. It is 9 kJ/mol below the original threshold.",
      "Compare the same collision with the catalysed barrier. It is 8 kJ/mol above that threshold.",
      "The collision can meet the energy requirement along the catalysed pathway. The comparison holds the temperature and collision energy fixed.",
    ],
  },
  "reversible-reactions": {
    prompt:
      "A closed model contains 11 A units and 9 B units. Over one interval, three A become B and three B become A. What does this tell you about net and gross change?",
    steps: [
      "Count forward and reverse events separately. Each direction runs three times in the interval.",
      "For A, the loss of three to B is matched by a gain of three. The two changes for B likewise cancel.",
      "Net changes are zero in that interval even though six events occurred. If the two rates remain equal, the amounts stay constant without needing to be equal.",
    ],
  },
  "changing-equilibrium": {
    prompt:
      "For X₂(g) + Y₂(g) ⇌ 2XY(g), a closed vessel is compressed at constant temperature. Compare the gas-particle counts on each side to predict a pressure-driven shift.",
    steps: [
      "Count gas particles using the coefficients. One X₂ plus one Y₂ gives two gas particles on the left.",
      "The right side also has two gas particles as two XY. Compression increases pressure without changing the stoichiometric count difference.",
      "This idealised example shows no pressure-driven shift on that basis. Either direction changes the identities with the same total gas-particle count.",
    ],
  },
  "rates-practical": {
    prompt:
      "A student compares two simulations using different acid concentrations. One has 12 g of small solid pieces and the other has 12 g of larger pieces. Which variable prevents a fair comparison?",
    steps: [
      "Identify concentration as the variable the student intends to change. The total solid mass is already matched.",
      "Compare the piece sizes. A different size distribution changes exposed surface area even when the total mass is equal.",
      "Use the same piece-size distribution and mass in both simulated runs. Then a rate difference can be attributed to concentration if the other relevant conditions are controlled.",
    ],
  },
  "crude-oil-and-fractions": {
    prompt:
      "In a teaching column, fraction L boils over a lower temperature range than fraction H. Which travels farther towards the cool top before condensing?",
    steps: [
      "Follow the temperature change up the column. The tower is cooler towards the top.",
      "The lower-boiling fraction stays vapour through warmer regions. The higher-boiling fraction condenses while the column is still warmer.",
      "Fraction L travels farther upwards before condensing. Each fraction can contain several hydrocarbons with similar boiling points.",
    ],
  },
  "alkanes-and-combustion": {
    prompt:
      "A model shows a straight chain of three single-bonded carbon atoms. Add the missing H atoms and use the formula to predict the complete combustion products.",
    steps: [
      "Each carbon makes four bonds. The two end carbons each need three H, and the middle one needs two.",
      "The molecule is C₃H₈. Its carbon atoms form carbon dioxide and its hydrogen atoms form water during complete combustion.",
      "One C₃H₈ gives three CO₂ and four H₂O. The products need ten O atoms, supplied by five O₂ molecules.",
    ],
  },
  "cracking-and-alkenes": {
    prompt:
      "In a supplied cracking proposal, C₁₁H₂₄ forms C₇H₁₆ and one other product. Determine the other product’s molecular formula and relate it to a possible structure.",
    steps: [
      "Subtract the seven carbons of the given product from the eleven in the starting molecule. Four carbons remain.",
      "Subtract sixteen hydrogens from twenty-four. The second product must contain eight hydrogens to conserve atoms.",
      "The formula is C₄H₈. It fits a product containing one C=C bond in an open chain. The atom totals alone do not determine the double-bond position.",
    ],
  },
  "alcohols-and-acids": {
    prompt:
      "Compare 1-propanol, CH₃CH₂CH₂OH, with propanoic acid, CH₃CH₂COOH. What changes at the end of the carbon chain?",
    steps: [
      "Count the carbons in both structures. Both contain a chain of three carbon atoms.",
      "Inspect the oxygen attachments at the chain end. The alcohol has a terminal –OH on CH₂. The acid end carbon has one C=O bond and one –OH bond.",
      "The acid’s complete end group is –COOH. The presence of an O–H bond in both structures makes the whole group necessary for identification.",
    ],
  },
  polymers: {
    prompt:
      "In a drawing of a poly(propene) chain, the backbone alternates CH₂ and CH(CH₃). Which atoms belong to one repeating section?",
    steps: [
      "Follow the main chain and look for the shortest pattern that reproduces its substituent positions.",
      "Group one CH₂ and the next CH(CH₃) together. The CH₃ is a side group on the second backbone carbon.",
      "The repeat is –CH₂–CH(CH₃)–. Continue both backbone bonds across the bracket boundaries; the side group stays attached within the bracket.",
    ],
  },
};

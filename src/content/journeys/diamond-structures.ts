import { extendDiamondWriting } from "./diamond-writing";
import type { LearningTask, LessonJourney } from "../types";
import { choice, number } from "./helpers";
const q = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  choice(
    `dn-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Giant covalent structure reasoning: ${id}.`,
  );
const network = q(
  "g-network",
  "How many carbons bond directly to the selected carbon?",
  "Four neighbours, extending in three dimensions",
  {
    "Three neighbours in one flat sheet":
      "That is not the selected diamond site's tetrahedral coordination.",
    "Six neighbours along cube edges":
      "A cubic-looking frame does not make diamond a six-neighbour simple cubic lattice.",
  },
  "Each diamond carbon forms four covalent bonds to four neighbours. The local motif continues into the giant connected structure; it is not a five-atom molecule.",
  "Rotate the view to see links in front and behind.",
);
network.model = {
  kind: "giant-covalent",
  mode: "diamond",
  instruction: "Predict a count. Rotate to inspect.",
};
network.title = "Carbon neighbours";
const energy = q(
  "g-energy",
  "Why does diamond have a very high melting point?",
  "Many strong covalent bonds must be overcome, requiring much energy",
  {
    "Only weak attractions between small molecules are overcome":
      "Diamond does not consist of separate small molecules.",
    "One weak bond must break, requiring little energy":
      "The covalent network has many strong bonds.",
  },
  "The complete chain is giant covalent network → many strong bonds overcome → much energy required.",
  "Name the bond type, extent and energy consequence.",
);
energy.model = {
  kind: "giant-covalent",
  mode: "energy",
  instruction:
    "Choose bond type, extent and energy consequence for the giant network.",
};
energy.title = "Build the energy explanation";
const carriers = q(
  "g-carriers",
  "Pure diamond contains electrons. Why does it still fail to conduct electricity?",
  "It has no mobile charged carriers through the structure",
  {
    "Electrons do not exist in diamond":
      "Every carbon and covalent bond involves electrons.",
    "Every overall-neutral material must fail to conduct":
      "Metals can be overall neutral and still conduct through delocalised electrons.",
  },
  "The bonding electrons are not delocalised through pure diamond. There are no mobile ions or delocalised electrons to carry charge through this network.",
  "Distinguish having electrons from having mobile carriers.",
);
carriers.model = {
  kind: "giant-covalent",
  mode: "carriers",
  instruction:
    "Predict conductivity and the availability of mobile charged carriers.",
};
carriers.title = "Electrons are not always carriers";
const silica = q(
  "g-silica",
  "Si and O are linked through the represented silica solid. Which structure and bond type fit?",
  "Giant covalent network",
  {
    "Separate small SiO₂ molecules":
      "This solid's linked pattern continues through the material.",
    "Ionic just because two elements are present":
      "The presence of two elements does not by itself imply ionic bonding.",
  },
  "Silicon dioxide is a compound with a giant covalent network. A selected silicon links four oxygen neighbours; each bridging oxygen links two silicons. The bulk Si:O ratio is 1:2, not the count of one cropped local motif.",
  "Follow links beyond the selected centre.",
);
silica.model = {
  kind: "giant-covalent",
  mode: "silica",
  instruction: "Follow Si–O links and classify structure extent and bonding.",
};
silica.title = "Recognise a compound network";
const written: LearningTask = {
  id: "dn-v1-p-explain",
  title: "Write the full network explanation",
  prompt:
    "Describe diamond's structure and bonding, then explain its very high melting point. Include the local carbon bonding and the complete bond/energy chain.",
  answer:
    "Diamond has a giant covalent network. Each carbon forms four covalent bonds to other carbons in three dimensions. Many strong covalent bonds must be overcome to disrupt the network, so much energy is needed.",
  rubric: [
    "Giant covalent structure or network.",
    "Four covalent bonds from each carbon to other carbons.",
    "Strong covalent bonds, not weak intermolecular attractions.",
    "Many bonds must be overcome.",
    "Much energy required, linked to very high melting point.",
  ],
  explanation:
    "Separate a description of structure from the causal force/extent/energy explanation. Naming strong forces alone misses the network bond type and the many-bond demand.",
  hint: "Structure → four bonds → strong bonds → many overcome → much energy.",
  purpose:
    "Independent extended description and causal explanation; self-review only.",
};
const comparison: LearningTask = {
  id: "dn-v1-p-compare",
  title: "Compare three bonding explanations",
  prompt:
    "Compare the thermal-change interactions in pure diamond and a neutral small-molecule liquid; then explain why pure diamond and a solid metal differ in electrical conduction.",
  answer:
    "Small-molecule boiling overcomes weaker intermolecular attractions while covalent bonds remain. Diamond's giant network requires many strong covalent bonds to be overcome and much energy. A metal has delocalised electrons that carry charge through its structure; pure diamond lacks mobile charged carriers.",
  rubric: [
    "Weak between-molecule attractions are overcome on small-molecule boiling.",
    "Strong within-molecule covalent bonds remain in that case.",
    "Diamond requires many strong network covalent bonds to be overcome and much energy.",
    "Metal has mobile charged delocalised electrons.",
    "Pure diamond lacks mobile charged carriers; neutrality alone is insufficient.",
  ],
  explanation:
    "Use the actual structures and interactions, then explain the separate charge-carrier difference.",
  hint: "Do not apply the small-molecule boiling explanation to every covalent substance.",
  purpose: "Independent cross-structure transfer; self-review only.",
};
export const diamondStructuresJourney: LessonJourney = {
  version: 1,
  introduction:
    "Look beyond small molecules: inspect diamond's four-neighbour three-dimensional network, explain its energy demand and lack of charge carriers, and recognise silica as a compound network.",
  scopeNote:
    "Common Foundation/combined giant covalent and diamond properties. The network is a finite fragment; graphite, graphene/fullerenes and polymers need separate lessons. Pure-diamond properties are the bounded GCSE model.",
  outcomes: [
    "Recognise a connected giant covalent network and four bonds per diamond carbon.",
    "Explain hardness, high melting and lack of electrical conduction.",
    "Compare network and small-molecule reasoning and identify a compound network.",
  ],
  warmup: [
    q(
      "w-sharing",
      "What does a covalent bond involve?",
      "A shared pair of electrons attracted to both nuclei",
      {
        "Transfer of an entire nucleus":
          "Covalent bonding does not transfer nuclei.",
        "Only a weak attraction between separate molecules":
          "That confuses the bond with a between-molecule attraction.",
      },
      "Covalent bonds hold atoms together through shared-electron attraction.",
      "Recall sharing and both nuclei.",
    ),
    q(
      "w-boiling",
      "What remains intact when a small-molecule liquid boils without reacting?",
      "Covalent bonds within its molecules",
      {
        "Every covalent bond must break":
          "That would not be ordinary molecular boiling.",
        "Only the nuclei, with all molecules destroyed":
          "The molecules themselves remain intact.",
      },
      "Between-molecule attractions are overcome in that case; the network lesson requires a different explanation.",
      "Recall within versus between.",
    ),
  ],
  refresher: [
    q(
      "r-extent",
      "What does giant covalent network mean?",
      "Atoms linked through an extended connected structure",
      {
        "One separate five-atom molecule":
          "A local motif is not the whole structure.",
        "Only one atom with no links":
          "A network contains connections among many atoms.",
      },
      "A finite drawing shows part of a structure that extends through the material.",
      "Follow connections beyond one selected atom.",
    ),
    q(
      "r-four",
      "What is diamond's local carbon coordination?",
      "Four covalently bonded carbon neighbours",
      {
        "Three neighbours only in one sheet":
          "That is not diamond's tetrahedral coordination.",
        "Six neighbours because the drawing looks cubic":
          "Bond connectivity matters, not the outer frame shape.",
      },
      "Every carbon in the bulk diamond model has four covalent bonds in three dimensions.",
      "Count actual bonds, not cube edges.",
    ),
    q(
      "r-energy",
      "Which chain explains high melting for a giant covalent network?",
      "Many strong covalent bonds overcome → much energy required",
      {
        "Weak between-molecule forces → little energy":
          "That is a small-molecule explanation.",
        "No bonds → no energy": "A giant covalent structure has many bonds.",
      },
      "Name the covalent bonds and their strong, extended network.",
      "Force type, extent and energy are separate steps.",
    ),
    q(
      "r-carriers",
      "Do bonding electrons necessarily act as freely moving charge carriers through diamond?",
      "No: they are not delocalised through pure diamond",
      {
        "Yes: any electron must move freely through every solid":
          "Bonding electrons are not automatically delocalised carriers.",
        "No: diamond has no electrons":
          "Electrons are present in its atoms and bonds.",
      },
      "Pure diamond lacks mobile charged carriers, despite containing electrons.",
      "Separate existence from transport through the material.",
    ),
    q(
      "r-hardness",
      "What does hardness mean for the diamond cutting-tool explanation?",
      "Resistance to scratching or cutting",
      {
        "Impossible to fracture under any force":
          "Hardness is not unlimited toughness.",
        "Ability to stretch like a soft metal wire": "That is not hardness.",
      },
      "Diamond's rigid strongly bonded network resists scratching/cutting; it can still fracture.",
      "Use the mechanical property actually measured.",
    ),
  ],
  guided: [network, energy, carriers, silica],
  practice: [
    q(
      "p-extent",
      "Look at the links in this carbon-atom fragment. Which description fits the represented structure?",
      "A connected giant structure, with omitted continuation at cut edges",
      {
        "Separate five-atom molecules":
          "The local neighbours continue to other neighbours.",
        "Exactly sixty-four atoms in every piece of diamond":
          "The finite figure is not a fixed-size molecular formula.",
      },
      "This is a fragment of a connected network, not independent molecular units.",
      "Follow a neighbour's links beyond the selected centre.",
    ),
    number(
      "dn-v1-p-neighbours",
      "From the selected carbon's links in the diagram, how many directly bonded carbon neighbours surround it?",
      4,
      "neighbours",
      "Four links extend around the carbon in three dimensions.",
      "Count direct links, not every visible carbon.",
      "Independent local coordination reading.",
      {
        "3": "A projection can hide one tetrahedral direction.",
        "6": "Do not substitute simple-cubic neighbours for actual bond connectivity.",
      },
    ),
    q(
      "p-energy",
      "Repair: 'diamond melts at high temperature because weak intermolecular forces are strong.'",
      "Diamond has many strong covalent network bonds requiring much energy to overcome",
      {
        "Diamond has weak covalent bonds that require little energy":
          "That would not explain its very high melting point.",
        "Diamond consists of very large separate molecules with only weak links":
          "The structure is an extended covalent network.",
      },
      "Do not use between-small-molecule reasoning for diamond.",
      "Name strong covalent bonds and the many-bond energy demand.",
    ),
    q(
      "p-molecular",
      "Both methane and diamond are covalent. Why does the small-molecule boiling explanation fit methane but not diamond?",
      "Methane has separate molecules; diamond has a giant bonded network",
      {
        "Every covalent substance must have the same structure":
          "Bond type alone does not determine structure extent.",
        "Methane contains only weak covalent bonds":
          "Its within-molecule bonds are strong.",
      },
      "Different structure extent changes which interactions must be overcome.",
      "Compare separate units with an extended network.",
    ),
    q(
      "p-carriers",
      "Repair: 'diamond does not conduct because it contains no electrons.'",
      "It contains bonding electrons but lacks mobile charged carriers through its network",
      {
        "The claim is correct: carbon has no electrons":
          "Carbon contains electrons.",
        "It must conduct because electrons exist":
          "Those electrons are not freely moving carriers through pure diamond.",
      },
      "The carrier condition is mobility through the material, not mere presence.",
      "Use the full carrier explanation.",
    ),
    q(
      "p-neutral",
      "Does diamond's overall neutrality alone explain why it does not conduct?",
      "No: neutral metals conduct; the relevant difference is mobile carriers",
      {
        "Yes: every neutral material is an insulator":
          "Metals are a counterexample.",
        "No: diamond must therefore be an ionic salt":
          "Diamond is a covalent carbon network.",
      },
      "Compare mobile delocalised electrons in a metal with the absence of such carriers in pure diamond.",
      "Use the previous metal lesson as a counterexample.",
    ),
    q(
      "p-cutting",
      "Why is diamond useful on a cutting-tool edge?",
      "Its rigid strong covalent network makes it very hard",
      {
        "Only its lack of electrical conduction makes it cut":
          "Electrical conduction does not by itself explain cutting.",
        "It contains weak layers that slide easily":
          "That does not explain diamond hardness.",
      },
      "Link the strong rigid network to resistance to scratching/cutting.",
      "Choose the property relevant to the use.",
    ),
    q(
      "p-fracture",
      "A diamond sample fractures under a large impact. Does this disprove its high hardness?",
      "No: hardness and resistance to fracture are different properties",
      {
        "Yes: hard materials can never break":
          "Hardness is not unlimited toughness.",
        "No: fracture proves it is a small molecular gas":
          "Breaking a solid does not imply that structure.",
      },
      "Diamond can be hard yet brittle; do not turn high hardness into an indestructibility claim.",
      "Separate scratch resistance from impact fracture.",
    ),
    q(
      "p-silica",
      "The Si/O pattern continues beyond the frame. Must it be ionic just because it contains two elements?",
      "No: silicon dioxide has a giant covalent network",
      {
        "Yes: every compound is ionic": "Compounds can have covalent bonding.",
        "No: the cropped motif is one Si₅O₄ molecule":
          "The fragment has omitted continuation and is not a separate molecule.",
      },
      "The bulk SiO₂ formula expresses a 1:2 atom ratio in the network. Counting one cropped local motif does not give its bulk formula.",
      "Read connectivity and the known silica structure, not only the number of element types.",
    ),
    q(
      "p-boundary",
      "An edge carbon in a cropped network picture has only two drawn links. What should you conclude?",
      "Some continuation bonds are outside the fragment; bulk diamond carbon has four",
      {
        "Carbon at every real diamond surface must have only two bonds forever":
          "The drawing omits continuation and does not model surface chemistry.",
        "Every interior carbon must have only two bonds":
          "The selected interior sites have four connections.",
      },
      "A finite fragment does not determine the full bulk coordination or actual surface termination.",
      "Separate the represented crop from the bulk model.",
    ),
    written,
    comparison,
  ],
  checkForms: [
    [
      number(
        "dn-v1-ca-neighbours",
        "Retrieve the number of covalent carbon neighbours for one interior diamond carbon.",
        4,
        "neighbours",
        "The diamond bulk model has four neighbours per carbon.",
        "Recall the local coordination.",
        "Reserved diamond coordination retrieval.",
      ),
      q(
        "ca-structure",
        "What describes diamond's structure extent?",
        "Giant covalent network",
        {
          "Separate four-carbon molecules":
            "Local coordination is not a molecule size.",
          "Alternating positive and negative carbon ions":
            "That is not the pure-carbon covalent model.",
        },
        "Covalent links extend throughout the network.",
        "Recall network versus molecule.",
      ),
      q(
        "ca-energy",
        "Why is much energy needed to disrupt diamond's structure?",
        "Many strong covalent bonds must be overcome",
        {
          "Only weak attractions between small molecules":
            "Diamond does not have separate small molecular units.",
          "Only one weak bond is present": "It has an extended strong network.",
        },
        "Use type, strength, number and energy together.",
        "Retrieve the complete energy chain.",
      ),
      q(
        "ca-conduct",
        "Which charge-carrier explanation fits pure diamond?",
        "No mobile ions or delocalised electrons through its structure",
        {
          "No electrons of any kind": "Bonding electrons exist.",
          "Positive carbon ions flow through the solid":
            "That is not diamond conduction.",
        },
        "Lack of mobile charged carriers explains the result.",
        "Recall mobile carriers.",
      ),
      q(
        "ca-tool",
        "Which explanation links diamond to a cutting edge?",
        "Strong rigid covalent bonding gives high hardness",
        {
          "A low boiling point allows rapid evaporation":
            "That is not the relevant property.",
          "Neutrality alone makes every material hard":
            "Overall charge does not explain hardness.",
        },
        "Select the structural cause of scratch/cut resistance.",
        "Retrieve property → use.",
      ),
    ],
    [
      q(
        "cb-silica",
        "Silica contains Si and O linked throughout the pictured solid. Which classification fits?",
        "Giant covalent compound",
        {
          "Separate small SiO₂ molecules":
            "The linked structure continues throughout the solid.",
          "Pure carbon metal": "Silica is a silicon/oxygen compound.",
        },
        "A giant covalent network need not be an element.",
        "Recall known silica bonding.",
      ),
      q(
        "cb-crop",
        "Does a picture of sixty-four linked carbon atoms establish the molecular formula C₆₄ for diamond?",
        "No: it is a cropped fragment of an extended network",
        {
          "Yes: every picture is the complete molecule":
            "The drawing is a finite cutout.",
          "No: diamond contains no atoms": "It is made of carbon atoms.",
        },
        "The model's atom count is not a molecular size.",
        "Retrieve fragment versus molecule.",
      ),
      q(
        "cb-melting",
        "Which contrast between small molecular and giant covalent thermal-change explanations is correct?",
        "Small-molecule boiling overcomes intermolecular attractions; giant-network disruption requires strong covalent bonds",
        {
          "Both always overcome only weak intermolecular attractions":
            "A giant covalent network has no separate small units.",
          "Both require breaking every atomic nucleus":
            "Neither is a nuclear change.",
        },
        "Use structure extent to select the correct interaction.",
        "Recall within/between and network.",
      ),
      q(
        "cb-neutral",
        "Why can an overall-neutral metal conduct while pure diamond does not?",
        "Metal has mobile delocalised electrons; pure diamond lacks mobile charged carriers",
        {
          "Neutral metals cannot actually conduct":
            "Neutrality does not prevent internal charge transport.",
          "Diamond contains no charged particles internally":
            "It has positive nuclei and electrons.",
        },
        "The availability of mobile carriers is the difference.",
        "Retrieve the carrier condition.",
      ),
      q(
        "cb-hard",
        "Diamond is very hard. Which further claim is unsupported?",
        "It can never fracture under any force",
        {
          "It resists scratching": "That is the relevant hardness property.",
          "It can be useful on cutting tools":
            "That is a reasonable hardness application.",
        },
        "Hardness is different from unlimited toughness.",
        "Recall the property boundary.",
      ),
    ],
  ],
  reviewForms: [
    [
      number(
        "dn-v1-ra-neighbours",
        "Retrieve diamond's local carbon coordination after a delay.",
        4,
        "neighbours",
        "Four covalent carbon neighbours surround each bulk diamond carbon.",
        "Recall the tetrahedral local motif.",
        "Delayed coordination retrieval with preserved exposure.",
      ),
      q(
        "ra-energy",
        "Retrieve the full high-melting explanation.",
        "Many strong covalent bonds need much energy to overcome",
        {
          "Weak separate-molecule attractions alone":
            "This is the wrong structure explanation.",
          "No bonding electrons are present":
            "Covalent bonds involve electrons.",
        },
        "Keep the many-bond and energy steps explicit.",
        "Retrieve the full chain.",
      ),
      q(
        "ra-carriers",
        "Retrieve why the electrons in pure diamond do not make it conduct.",
        "They are not delocalised mobile carriers throughout the network",
        {
          "They do not exist at all": "Bonding electrons exist.",
          "Neutrality alone prevents every material conducting":
            "Metals are a counterexample.",
        },
        "Use lack of mobile charged carriers.",
        "Recall presence versus mobility.",
      ),
    ],
    [
      q(
        "rb-extent",
        "Retrieve why a highlighted carbon and four neighbours are not a diamond molecule.",
        "Those neighbours continue into the giant connected network",
        {
          "Five is the fixed size of every diamond molecule":
            "A local motif is not a molecular unit.",
          "The highlighted carbon has no bonds":
            "It has four covalent connections.",
        },
        "Follow connections beyond the highlighted motif.",
        "Recall local versus extended structure.",
      ),
      q(
        "rb-use",
        "Retrieve the property that makes diamond useful for cutting tools.",
        "High hardness from its rigid strongly bonded network",
        {
          "Free ions that flow": "That is not the pure-diamond model.",
          "Only a low melting point":
            "That is neither correct nor the cutting explanation.",
        },
        "Connect hardness with resistance to scratching/cutting.",
        "Retrieve property and cause.",
      ),
      q(
        "rb-crop",
        "Retrieve the meaning of missing links at a drawn fragment's edge.",
        "Continuation is omitted; it does not establish lower bulk coordination",
        {
          "The bulk carbon has lost its electrons":
            "The drawing's boundary is not electron removal.",
          "The entire structure contains only those edge atoms":
            "It is only a finite view.",
        },
        "Representational boundaries do not define the entire material.",
        "Recall the model limit.",
      ),
    ],
  ],
};
for (const task of [
  ...diamondStructuresJourney.guided,
  ...diamondStructuresJourney.practice,
])
  task.followUp =
    task.id.includes("carrier") || task.id.includes("neutral")
      ? "dn-v1-r-carriers"
      : task.id.includes("energy") ||
          task.id.includes("molecular") ||
          task.id.includes("compare")
        ? "dn-v1-r-energy"
        : task.id.includes("cutting") || task.id.includes("fracture")
          ? "dn-v1-r-hardness"
          : task.id.includes("neighbour")
            ? "dn-v1-r-four"
            : "dn-v1-r-extent";
const titles: Record<string, string> = {
  "p-extent": "Recognise the connected structure",
  "p-neighbours": "Count local connections",
  "p-energy": "Repair the energy explanation",
  "p-molecular": "Same bond type, different structure",
  "p-carriers": "Presence is not mobility",
  "p-neutral": "Use the neutral-metal counterexample",
  "p-cutting": "Explain the cutting-tool use",
  "p-fracture": "Hard does not mean indestructible",
  "p-silica": "Recognise a compound network",
  "p-boundary": "Interpret the cut edges",
};
for (const task of diamondStructuresJourney.practice)
  task.title ??= titles[task.id.replace("dn-v1-", "")];

for (const task of diamondStructuresJourney.practice) {
  if (
    ["dn-v1-p-extent", "dn-v1-p-neighbours", "dn-v1-p-boundary"].includes(
      task.id,
    )
  )
    task.diamondDiagram = true;
  if (task.id === "dn-v1-p-silica") task.silicaDiagram = true;
}
diamondStructuresJourney.checkForms[1][0].silicaDiagram = true;

extendDiamondWriting(diamondStructuresJourney);

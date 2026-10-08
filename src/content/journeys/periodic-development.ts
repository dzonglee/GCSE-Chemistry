import type { LearningTask, LessonJourney } from "../types";
import { choice as c } from "./helpers";
import { extendPeriodicDevelopmentWriting } from "./periodic-development-writing";
const task = (
  id: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
): LearningTask =>
  c(
    `pd-v1-${id}`,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    `Historical evidence reasoning: ${id}.`,
  );
const gap = task(
  "g-gap",
  "E has properties like C. Where should it go?",
  "Leave a gap between D and E",
  {
    "Put E immediately after D with no gap":
      "E would share a column with B despite their different chemical properties.",
    "Delete E from the evidence":
      "A conflicting result must be explained, not discarded.",
  },
  "Mendeleev left gaps for undiscovered elements so known elements with similar properties could remain together. The puzzle illustrates this reasoning with invented data.",
  "Compare the properties down each column.",
);
gap.title = "A gap can be a prediction";
gap.model = {
  kind: "historical-gap",
  initial: "force",
  instruction: "Keep similar properties in each family.",
};
const prediction = task(
  "g-predict",
  "In the repaired puzzle, what properties are predicted for the gap below B?",
  "A metal that forms +2 ions",
  {
    "A non-metal that forms −1 ions":
      "That prediction matches C and E, the other family.",
    "No properties can ever be predicted":
      "A repeated family pattern supplies a testable prediction, though it is not proof.",
  },
  "The missing member should resemble B's chemical behaviour. Predictions require later measurements; the invented weights do not determine an exact missing weight.",
  "Use the known member above the gap.",
);
prediction.title = "Predict from a chemical family";
prediction.model = {
  kind: "historical-gap",
  initial: "gap",
  instruction: "Use B’s properties to predict the gap.",
};
const order = task(
  "g-order",
  "The supplied exam table gives argon: atomic number 18, relative atomic mass 40; potassium: atomic number 19, relative atomic mass 39. Which comes first in modern order?",
  "Argon, because 18 is less than 19",
  {
    "Potassium, because 39 is less than 40":
      "That is mass order, not modern proton-number order.",
    "They share one cell because the masses are close":
      "Different proton numbers define different elements.",
  },
  "Modern order follows atomic number. The official table's rounded masses illustrate why mass and proton order need not agree. This is a modern counterexample, not a claim that Mendeleev knew undiscovered argon in 1869.",
  "Compare proton counts rather than isotope-weighted masses.",
);
order.title = "When weight order disagrees";
const explain = task(
  "p-explain",
  "Explain how leaving gaps made Mendeleev's table more useful than forcing every known element into strict weight order.",
  "",
  {},
  "Gaps kept chemically similar elements together, predicted undiscovered elements and their properties, and allowed later discoveries to test the proposed pattern.",
  "Connect classification, prediction and later evidence.",
);
explain.answer =
  "Leaving gaps kept elements with similar chemical properties together instead of forcing unlike elements into the same group. Mendeleev predicted undiscovered elements and their properties. Later discoveries with those properties filled the gaps and supported the table.";
delete explain.options;
delete explain.misconceptions;
explain.rubric = [
  "Gaps preserve grouping by similar chemical properties.",
  "They predict undiscovered elements and their properties.",
  "Matching later discoveries provide evidence supporting the table; a mismatch would challenge it.",
];
export const periodicDevelopmentJourney: LessonJourney = {
  version: 1,
  introduction:
    "A useful table must explain chemical patterns, not simply list weights. Compare arrangements, predict a missing element and judge new evidence before connecting historical weight order with modern proton order.",
  outcomes: [
    "Describe early atomic-weight ordering and the problems caused by incomplete knowledge.",
    "Explain Mendeleev's gaps, changes of order and predictions using chemical properties.",
    "Judge supporting or conflicting discoveries and explain mass-order exceptions using isotope abundance.",
  ],
  scopeNote:
    "AQA Chemistry 4.1.2.2 and Trilogy 5.1.2.2; limited Pearson 1.13–1.15 comparison. Classroom letter/weight data are invented. The argon/potassium example uses rounded values from the official AQA table. Dates and extra named historical systems are not the learning target.",
  warmup: [
    task(
      "w-proton",
      "What defines an element's identity?",
      "Its number of protons",
      {
        "Its average atomic mass":
          "Different isotopes contribute to the average without changing element identity.",
        "Its number of neutrons alone":
          "Isotopes can have different neutron counts.",
      },
      "Atomic number is proton count and fixes element identity.",
      "Retrieve the nuclear definition.",
    ),
    task(
      "w-average",
      "Why can relative atomic mass be non-integer?",
      "It is an abundance-weighted average of isotope masses",
      {
        "Each atom has fractional neutrons":
          "Individual neutron counts are whole numbers.",
        "All elements have identical isotope masses":
          "Isotopes differ in mass.",
      },
      "An average does not describe a fractional particle count in an individual atom.",
      "Retrieve the isotope-mixture lesson.",
    ),
  ],
  refresher: [
    task(
      "r-discovery",
      "Why were noble gases absent from Mendeleev's first table?",
      "They had not yet been discovered",
      {
        "They had no protons": "Noble-gas atoms have nuclei with protons.",
        "They cannot be chemical elements":
          "Helium, neon and argon are elements.",
      },
      "Mendeleev published his table before the noble gases were discovered. A later group was added; modern GCSE tables label it Group 0.",
      "A table can only include elements known at the time.",
    ),
    task(
      "r-early",
      "Before subatomic particles were discovered, which measured quantity was used to order early tables?",
      "Atomic weight",
      {
        "Proton number measured in the nucleus":
          "Protons had not yet been discovered.",
        "Number of occupied electron shells":
          "Electron structures were not then known.",
      },
      "Early ordering used atomic weights and observed chemical properties, not modern subatomic explanations.",
      "Keep the historical knowledge available at the time separate from today's explanation.",
    ),
    task(
      "r-gap",
      "Why leave a gap rather than force the next element into it?",
      "To preserve similar chemical properties within a group",
      {
        "To avoid making any predictions":
          "A gap can predict an undiscovered element.",
        "To remove all elements with awkward evidence":
          "Known observations must still be accounted for.",
      },
      "An incomplete table can be more explanatory than a fully filled but chemically inconsistent one.",
      "Compare chemical behaviour down the group.",
    ),
    task(
      "r-test",
      "What should happen if a newly discovered element does not match a predicted gap's properties?",
      "Reconsider the prediction using the new evidence",
      {
        "Ignore its measured properties": "Conflicting evidence matters.",
        "Declare the theory permanently proved":
          "A conflicting result does not prove the prediction.",
      },
      "Predictions are testable; support and refutation depend on measured evidence.",
      "Evidence can challenge as well as support a scientific idea.",
    ),
    task(
      "r-isotopes",
      "Why need atomic-weight order not match proton-number order?",
      "Isotope masses and relative abundances affect the average mass",
      {
        "Proton numbers become fractional":
          "Proton counts remain whole numbers.",
        "Every isotope is a different element":
          "Isotopes of one element share a proton number.",
      },
      "Weighted average mass is not simply a ranking of proton counts.",
      "Separate element identity from isotope mixture.",
    ),
  ],
  guided: [gap, prediction, order],
  practice: [
    task(
      "p-early",
      "Why were early tables incomplete?",
      "Some elements had not yet been discovered",
      {
        "No element had ever been measured":
          "Known elements already had measured weights and properties.",
        "Scientists already knew every proton number":
          "Subatomic explanations came later.",
      },
      "Limited discovery meant the known list did not contain every member of a chemical pattern.",
      "Distinguish missing knowledge from absence of a pattern.",
    ),
    task(
      "p-swap",
      "Two known elements fit chemical families better if their weight order is reversed. What did Mendeleev sometimes do?",
      "Changed the order to match chemical properties",
      {
        "Always kept strict weight order regardless of chemistry":
          "Strict order could put elements in inappropriate groups.",
        "Changed the measured chemical properties":
          "Measurements are evidence, not values to rewrite for convenience.",
      },
      "Chemical properties of elements and their compounds informed the arrangement; strict weight order was not always followed.",
      "Which arrangement explains more of the chemical evidence?",
    ),
    task(
      "p-test",
      "A gap predicts a metal whose compounds resemble its family. A new element has those properties. What follows?",
      "The discovery supports the prediction, without proving every claim forever",
      {
        "The prediction is refuted by agreement": "Agreement supports it.",
        "Every future discovery must agree":
          "New evidence can still revise a scientific model.",
      },
      "Matching discoveries supported Mendeleev's classification. Support is evidence, not an absolute guarantee.",
      "Compare predicted and observed behaviour.",
    ),
    task(
      "p-conflict",
      "A proposed gap predicts +2 compounds; a new candidate consistently forms −1 ions. What is the best response?",
      "Investigate the mismatch before assigning the candidate to the gap",
      {
        "Assign it because its mass is close":
          "Chemical evidence conflicts with the prediction.",
        "Ignore all future measurements": "Further evidence is needed.",
      },
      "A nearby mass alone does not resolve conflicting chemical behaviour.",
      "Test the chemical prediction, not only weight.",
    ),
    task(
      "p-predict",
      "An unfamiliar gap lies in a family of elements making similar chloride compounds. What is a justified prediction?",
      "The missing element should form chemically similar compounds",
      {
        "Its exact discovery date follows from the table":
          "A property pattern cannot predict a discovery date.",
        "It must have identical atomic mass to its neighbours":
          "Elements in a family have different masses.",
      },
      "Mendeleev used patterns in elements and compounds to predict missing members' properties.",
      "Predict behaviour from family evidence.",
    ),
    task(
      "p-isotopes",
      "A lighter average mass element can have a larger proton number than its neighbour. Which explanation is appropriate?",
      "Different isotope masses and abundances affect their average masses",
      {
        "Its proton count is an average fraction":
          "Atomic number is a whole proton count.",
        "All its atoms must have fewer neutrons than all neighbour atoms":
          "An average does not establish every individual isotope comparison.",
      },
      "Average mass depends on isotope composition. It need not increase at every consecutive proton number.",
      "Use weighted averages without inventing individual neutron counts.",
    ),
    task(
      "p-scientist",
      "Which contribution belongs to Dmitri Mendeleev?",
      "Classifying elements with gaps and predicting unknown members",
      {
        "Discovering the neutron":
          "Chadwick's neutron discovery is a different historical development.",
        "Proposing electron energy levels around the nucleus":
          "Bohr's atomic model is a different contribution.",
      },
      "Mendeleev developed periodic classification and predicted missing elements. Do not confuse the history of the table with changes to the atomic model.",
      "Separate classification from atomic structure.",
    ),
    task(
      "p-noble",
      "Why does a modern table contain a noble-gas group that Mendeleev's first table lacked?",
      "Noble gases were discovered later and added as a family",
      {
        "Every noble gas was changed into a metal":
          "They retain distinct noble-gas properties.",
        "Group 0 means these atoms contain zero electrons":
          "The label does not count all electrons; helium has two.",
      },
      "Later discoveries extended the table. Argon was not part of Mendeleev's original known-element set; Group 0 is the modern GCSE convention.",
      "Distinguish discovery history from a group label.",
    ),
    explain,
  ],
  checkForms: [
    [
      task(
        "ca-early",
        "Which problem could strict weight order cause in an incomplete early table?",
        "Chemically unlike elements could fall in the same group",
        {
          "Every chemical family would automatically be correct":
            "Strict weight order did not guarantee chemical grouping.",
          "It measured occupied electron shells directly":
            "Weights do not directly measure electron arrangements.",
        },
        "Incomplete knowledge and strict weight ordering could disrupt chemical families.",
        "Compare ordering with chemical classification.",
      ),
      task(
        "ca-gap",
        "A gap in a chemical family predicts what?",
        "An undiscovered element with properties related to that family",
        {
          "A fractional proton inside every known atom":
            "A missing element is not a fractional particle.",
          "That chemical properties do not matter":
            "The prediction comes from chemical properties.",
        },
        "A gap can be a testable prediction, not merely an empty printed box.",
        "Retrieve how the gap was justified.",
      ),
      task(
        "ca-evidence",
        "A later discovery fills a gap and matches the predicted properties. How does this affect the table?",
        "It supplies supporting evidence",
        {
          "It automatically refutes the table":
            "Agreement supports the prediction.",
          "It removes the need for any future testing":
            "Scientific models remain open to new evidence.",
        },
        "Matching discoveries increased confidence in the predictions.",
        "Compare prediction with measurement.",
      ),
    ],
    [
      task(
        "cb-order",
        "What did Mendeleev sometimes change to keep similar properties together?",
        "The strict atomic-weight order",
        {
          "The measured properties themselves":
            "Observed properties are evidence.",
          "The proton count of each atom":
            "Rearranging a table does not change nuclei.",
        },
        "He sometimes departed from weight order to preserve chemical grouping.",
        "Distinguish arrangement from altering an element.",
      ),
      task(
        "cb-isotope",
        "Later knowledge of which feature explained exceptions to mass ordering?",
        "Isotopes and their relative abundances",
        {
          "Fractional atomic numbers":
            "Atomic numbers remain whole proton counts.",
          "Identical masses for all elements":
            "Different elements have different mass distributions.",
        },
        "Weighted isotope averages explain why mass order is not always proton order.",
        "Retrieve the relative-mass definition.",
      ),
      task(
        "cb-modern",
        "Modern elements X and Y have proton numbers 27 and 28, with average masses 59 and 58. Which comes first?",
        "X, because it has proton number 27",
        {
          "Y, because 58 is less than 59":
            "That follows mass order rather than modern order.",
          "They are isotopes of one element":
            "Different proton numbers mean different elements.",
        },
        "The modern table follows increasing atomic number, regardless of the supplied average-mass reversal.",
        "Use the quantity defining element identity.",
      ),
    ],
  ],
  reviewForms: [
    [
      task(
        "ra-gap",
        "Why were Mendeleev's gaps scientifically useful?",
        "They preserved chemical patterns and made testable predictions",
        {
          "They guaranteed no more elements existed":
            "They predicted missing elements.",
          "They made measured properties unnecessary":
            "The patterns relied on measured properties.",
        },
        "Gaps linked chemical grouping with future tests.",
        "Retrieve both functions of a gap.",
      ),
      task(
        "ra-weight",
        "Did Mendeleev have to follow atomic-weight order strictly?",
        "No; chemical properties sometimes justified changing the order",
        {
          "Yes, even if every family became inconsistent":
            "He sometimes changed strict weight order.",
          "No, because he already used known electron structures":
            "That explanation was not available then.",
        },
        "Historical classification used observed properties rather than known electron structures.",
        "Avoid projecting modern knowledge backwards.",
      ),
    ],
    [
      task(
        "rb-test",
        "A new candidate conflicts with the predicted properties of a gap. What should scientists do?",
        "Investigate and reconsider the prediction or placement",
        {
          "Hide the conflicting observations":
            "Evidence must be accounted for.",
          "Claim agreement proves the table": "The observations disagree.",
        },
        "Conflicting evidence can challenge an arrangement.",
        "Retrieve how predictions are tested.",
      ),
      task(
        "rb-isotope",
        "What explains why relative atomic mass need not follow atomic-number order?",
        "Isotope composition affects average mass",
        {
          "Protons change continuously into fractions":
            "Counts are whole numbers.",
          "Modern order is set by neutron count only":
            "Modern order is proton-number order.",
        },
        "Isotope abundance changes averages without changing element identity.",
        "Separate weighted mass and proton count.",
      ),
    ],
  ],
};
for (const q of [
  ...periodicDevelopmentJourney.guided,
  ...periodicDevelopmentJourney.practice,
])
  q.followUp =
    q.id.includes("isotope") || q.id.includes("order")
      ? "pd-v1-r-isotopes"
      : q.id.includes("test") || q.id.includes("conflict")
        ? "pd-v1-r-test"
        : q.id.includes("noble")
          ? "pd-v1-r-discovery"
          : q.id.includes("early")
            ? "pd-v1-r-early"
            : "pd-v1-r-gap";
extendPeriodicDevelopmentWriting(periodicDevelopmentJourney);

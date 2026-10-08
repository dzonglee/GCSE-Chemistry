import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { StrengthMode } from "../../lib/acid-strength";
import { choice, number } from "./helpers";
const c = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...choice(
    "acid-v1-" + id,
    prompt,
    answer,
    errors,
    explanation,
    hint,
    title,
    model,
  ),
  title,
});
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  model?: TaskModel,
): LearningTask => ({
  ...number(
    "acid-v1-" + id,
    prompt,
    answer,
    unit,
    explanation,
    hint,
    title,
    {},
    model,
  ),
  title,
});
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
): LearningTask => ({
  id: "acid-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (mode: StrengthMode, instruction: string): TaskModel => ({
  kind: "acid-evidence",
  mode,
  instruction,
});
export const acidStrengthJourney: LessonJourney = {
  version: 1,
  introduction:
    "Separate acid strength from concentration, then follow tenfold hydrogen-ion changes.",
  scopeNote:
    "Higher/shared AQA 4.4.2.6 and Trilogy 5.4.2.5; Pearson Combined Higher 3.4–3.5 and 3.7–3.8. Strength concerns the degree of ionisation in aqueous solution. Strong acids ionise completely in the GCSE model; weak acids partly ionise. HCl, nitric and sulfuric are the specification's strong examples; ethanoic, citric and carbonic are weak examples. Dilute/concentrated concerns amount of acid per unit solution volume, not degree of ionisation. There is no universal numerical dilute/concentrated boundary; model records compare with an explicit reference. HCl may be both strong and dilute, and a weak acid may have a higher total acid concentration than a strong one. The acid forms ions; hydrogen atoms or already formed H+ ions are not said to be ionised. In water, H+ is hydrated; the selected actual 3D reference follows HCl + H2O → H3O+ + Cl− with unchanged atomic identities and net charge zero. It is a representative proton-transfer event, not persistent HCl molecules in an equilibrated aqueous solution, full solvent/hydration, a kinetic mechanism or pH calculated from mesh counts. Weak acids establish reversible ionisation equilibria; their ionised fraction changes with concentration, so do not assign a universal fixed percentage or assume exactly one pH unit for every tenfold weak-acid dilution. Lower pH means higher hydrogen-ion concentration. Each whole-unit pH decrease multiplies H+ concentration by ten; a rise divides it by ten. Count the difference in pH units, not the ratio of the pH numbers. Equal pH at comparable temperature means equal hydrogen-ion concentration within the model, not equal acid strength or total acid concentration. Controlled comparison of comparable monoprotic acids at the same total acid concentration/temperature can support a relative-strength claim; pH alone at unknown concentrations cannot. Numerical dilution work states fully ionised monoprotic HCl, negligible water contribution, no reaction/loss and constant temperature; total dissolved acid amount stays fixed while solution volume increases. The selected acid-only range avoids extreme dilution near neutrality, where water contribution matters. Dilution does not change HCl into a weak acid. Sulfuric acid is a strong GCSE example but its second proton dissociation is distinct: do not assume hydrogen-ion concentration is always twice total sulfuric acid concentration. Integer pH-factor tasks do not require logarithms, Ka or equilibrium calculations. pH 7 neutrality is stated at 25 °C and does not mean no ions. The app supplies data rather than certifying laboratory work or prescribing unsupervised experiments. Actual AQA 2018 Higher 09.1/09.2 QP and MS were read: complete ionisation and small amount per unit volume are separate explanation points; 10^-3 to 10^-5 mol/dm³ HCl gives pH 3 to 5. Original questions below are not official examination marking, partial marks, grade estimates or exam-readiness certification. Written explanations remain self-reviewed; reserved and delayed forms use changed demands and deferred feedback.",
  outcomes: [
    "Explain strength and concentration as separate properties.",
    "Use whole-number pH differences for tenfold H+ concentration comparisons.",
    "Interpret stated strong monoprotic acid dilution without changing acid identity.",
    "Evaluate controlled acid comparisons and the limits of pH evidence.",
  ],
  warmup: [
    n(
      "w-scale",
      "Count powers of ten",
      "What is 10 × 10 × 10?",
      1000,
      "",
      "Three factors of ten make 1000.",
      "Multiply one step at a time.",
    ),
    c(
      "w-ph",
      "Recall acidity",
      "At 25 °C, which reading is acidic: pH 4 or pH 9?",
      "pH 4",
      {
        "pH 9": "Alkaline readings are above 7.",
        "Both are neutral": "Neutral is pH 7 in this stated model.",
      },
      "pH 4 is below 7.",
      "Compare each reading with 7.",
    ),
  ],
  refresher: [
    c(
      "r-descriptors",
      "Keep two properties separate",
      "HCl ionises completely but has little acid per unit solution volume. Which description fits?",
      "Strong and dilute",
      {
        "Weak and dilute": "Dilution does not make ionisation partial.",
        "Strong and concentrated":
          "Complete ionisation does not establish a high amount per volume.",
      },
      "Complete ionisation makes it strong; little acid per unit volume makes it dilute.",
      "Ask one question about ionisation and another about amount per volume.",
      m("descriptors", "Predict both properties from the stated evidence."),
    ),
    c(
      "r-factor",
      "One pH step",
      "A sample changes from pH 3 to pH 4. Its H+ concentration…",
      "Decreases by a factor of 10",
      {
        "Increases by a factor of 10":
          "Higher pH means lower H+ concentration.",
        "Decreases by a factor of 4/3": "Do not divide the pH numbers.",
      },
      "A rise of one pH unit divides H+ concentration by ten.",
      "Higher pH, fewer hydrogen ions per volume.",
      m(
        "factors",
        "Move one pH unit at a time and predict the ion-concentration factor.",
      ),
    ),
    n(
      "r-dilution",
      "Stated HCl dilution",
      "A fully ionised monoprotic HCl sample starts at pH 3 and is diluted tenfold at constant temperature, with water contribution negligible. What is its new pH?",
      4,
      "pH",
      "Tenfold lower H+ concentration raises pH by one: 3 + 1 = 4.",
      "Dilution raises pH in this stated acid-only model.",
      m(
        "dilution",
        "Choose the target dilution and predict the resulting reading.",
      ),
    ),
    c(
      "r-comparison",
      "Control concentration",
      "At equal acid concentration and temperature, HCl completely ionises and ethanoic acid partly ionises. Which has more H+ per unit volume?",
      "HCl",
      {
        "Ethanoic acid":
          "Partial ionisation produces less H+ at this controlled concentration.",
        "They must be equal":
          "Equal acid concentration does not imply equal H+ concentration.",
      },
      "The stronger acid provides more H+ for this equal-concentration comparison.",
      "Keep total acid concentration fixed before comparing ionisation.",
      m(
        "comparison",
        "Make separate ion and pH predictions from the supplied comparison.",
      ),
    ),
    c(
      "r-limits",
      "Know what pH proves",
      "An unnamed acid has pH 2, but its total acid concentration is unknown. Does this alone prove it is a strong acid?",
      "No",
      {
        Yes: "pH depends on concentration and ionisation.",
        "It proves the acid is weak":
          "The information does not establish either strength.",
      },
      "pH alone cannot separate acid strength from total acid concentration.",
      "Check whether the acid concentration is controlled.",
      m(
        "evidence",
        "Choose the supported claim and the evidence that supports it.",
      ),
    ),
    c(
      "r-ionisation",
      "Name the substance forming ions",
      "Which explanation correctly describes strong-acid ionisation?",
      "The acid forms ions in water",
      {
        "Hydrogen ions become ionised":
          "Already formed H+ ions are not the acid being ionised.",
        "The acid loses its hydrogen atoms from the system":
          "Hydrogen atoms are conserved and transferred into hydrated ions.",
      },
      "It is the acid that ionises; atomic identities remain in the system.",
      "Do not say H+ ions are ionised.",
    ),
  ],
  guided: [
    {
      ...c(
        "g-descriptors",
        "Strong can be dilute",
        "HCl completely ionises; its amount per volume is small. Choose both descriptors.",
        "Strong and dilute",
        {
          "Weak and dilute":
            "Strength concerns ionisation, not amount per volume.",
          "Strong and concentrated":
            "Complete ionisation does not imply concentrated.",
        },
        "Strong and dilute describe different properties.",
        "Complete ionisation → strong; small amount per volume → dilute.",
        m(
          "descriptors",
          "Predict ionisation strength and the concentration comparison.",
        ),
      ),
      openingHint: true,
    },
    n(
      "g-factor",
      "Count two pH steps",
      "How many times higher is H+ concentration at pH 2 than at pH 4?",
      100,
      "times",
      "Two lower pH units mean 10 × 10 = 100 times higher H+ concentration.",
      "Count the two steps from 4 down to 2.",
      m("factors", "Reach the target pH, then predict direction and factor."),
    ),
    n(
      "g-dilution",
      "Predict strong-acid dilution",
      "Fully ionised monoprotic HCl starts at pH 2 and is diluted tenfold under the stated acid-only conditions. What is its new pH?",
      3,
      "pH",
      "Volume ×10 at fixed acid amount gives H+ concentration ÷10, so pH 2 becomes 3.",
      "Tenfold dilution gives one upward pH step in this specified HCl model.",
      m(
        "dilution",
        "Choose a dilution, then predict pH, concentration and strength.",
      ),
    ),
    c(
      "g-comparison",
      "Compare controlled samples",
      "HCl and ethanoic acid have equal total acid concentration and temperature. HCl completely ionises; ethanoic acid partly ionises. Which has the lower pH?",
      "HCl",
      {
        "Ethanoic acid": "Partial ionisation gives less H+, not more, here.",
        "They must have equal pH":
          "Equal total acid concentration does not imply equal ionisation.",
      },
      "HCl provides more hydrogen ions and has lower pH in this controlled comparison.",
      "More H+ per volume means lower pH.",
      m("comparison", "Predict more hydrogen ions and higher pH separately."),
    ),
    c(
      "g-evidence",
      "Do not infer strength from pH alone",
      "An unnamed acid is pH 2. Its total acid concentration is not supplied. Which claim is justified?",
      "Acid strength is not established",
      {
        "It must be strong": "A concentrated weak acid can have low pH.",
        "It must be dilute":
          "pH alone does not give the total acid concentration.",
      },
      "The measurement establishes acidity, but cannot isolate degree of ionisation.",
      "You need concentration and ionisation evidence.",
      m("evidence", "Distinguish a supported conclusion from an assumption."),
    ),
  ],
  practice: [
    c(
      "p-complete",
      "Define strong",
      "What makes an aqueous acid strong?",
      "Complete ionisation",
      {
        "Always a high acid concentration":
          "Concentration is a different property.",
        "Very low molecular mass":
          "Mass is not the definition of acid strength.",
      },
      "Strength describes the degree of ionisation.",
      "Think about how much of the acid forms ions.",
    ),
    c(
      "p-weak",
      "Recognise a weak example",
      "Which listed acid is weak in the GCSE specification?",
      "Ethanoic acid",
      {
        "Hydrochloric acid": "HCl is a strong-acid example.",
        "Nitric acid": "Nitric acid is a strong-acid example.",
      },
      "Ethanoic acid partly ionises in water.",
      "Recall the complete/partial ionisation distinction.",
    ),
    c(
      "p-concentration",
      "Define concentration",
      "Concentration of acid describes…",
      "Amount of acid per unit solution volume",
      {
        "Fraction of acid ionised": "That concerns degree of ionisation.",
        "The total solution volume alone":
          "Both dissolved amount and volume matter.",
      },
      "Amount divided by solution volume describes acid concentration.",
      "Use amount per volume, not ionisation fraction.",
    ),
    c(
      "p-weak-higher",
      "Weak need not mean dilute",
      "A weak acid sample contains more total acid per unit volume than a stated dilute strong-acid reference. Is this possible?",
      "Yes",
      {
        No: "Strength and concentration are separate descriptors.",
        "Only if it stops being an acid":
          "A partly ionised acid is still acidic.",
      },
      "A weak acid may have high total concentration.",
      "Do not use weak as a synonym for dilute.",
    ),
    w(
      "p-strong-dilute",
      "Explain both descriptors",
      "Explain how hydrochloric acid can be both strong and dilute.",
      "Strong means the acid ionises completely in aqueous solution. Dilute means a small amount of acid per unit solution volume. These describe separate properties.",
      [
        "State complete ionisation of the acid in water.",
        "State small amount of acid per unit solution volume.",
        "Keep strength separate from concentration; do not say H+ ions are ionised.",
      ],
    ),
    c(
      "p-ions",
      "Correct the subject",
      "A student writes: ‘H+ ions ionise completely, so HCl is strong.’ What should be corrected?",
      "The acid ionises to form ions",
      {
        "Nothing: H+ ionisation defines strength":
          "The subject is the acid, not already formed hydrogen ions.",
        "Strong means hydrogen atoms vanish": "Atoms are conserved.",
      },
      "AQA's actual mark scheme rejects saying H+ or hydrogen is ionised.",
      "Identify the substance forming ions.",
    ),
    n(
      "p-fall-three",
      "Three downward steps",
      "How many times higher is H+ concentration at pH 3 than at pH 6?",
      1000,
      "times",
      "6 − 3 = 3 pH units; 10 × 10 × 10 = 1000.",
      "Count the difference, then multiply ten for each step.",
    ),
    n(
      "p-rise-two",
      "State the decrease factor",
      "A sample changes from pH 2 to pH 4. By what factor does its H+ concentration decrease?",
      100,
      "",
      "Two upward pH steps divide H+ concentration by 100.",
      "The factor is positive; direction is already stated.",
    ),
    c(
      "p-rise-one",
      "Keep direction correct",
      "pH increases by one unit. What happens to H+ concentration?",
      "It is divided by 10",
      {
        "It is multiplied by 10": "That would lower pH.",
        "It is divided by 1": "One pH unit is a tenfold change.",
      },
      "Higher pH corresponds to lower H+ concentration.",
      "Use the reverse direction of a downward pH step.",
    ),
    c(
      "p-ratio",
      "Reject a pH-number ratio",
      "A student says pH 2 has twice the H+ concentration of pH 4 because 4 ÷ 2 = 2. What is correct?",
      "pH 2 has 100 times the H+ concentration",
      {
        "pH 2 has twice the concentration":
          "Do not use the ratio of pH numbers.",
        "pH 4 has 100 times the concentration": "The direction is reversed.",
      },
      "The difference is two pH units: 10² = 100, with more H+ at lower pH.",
      "Count whole-unit steps.",
    ),
    c(
      "p-equal-ph",
      "Separate equal pH from equal strength",
      "Two samples have equal pH at the same temperature. Which equality is supported?",
      "Their hydrogen-ion concentrations are equal",
      {
        "Their acid strengths must be equal":
          "Different strength/concentration combinations can give equal pH.",
        "Their total acid amounts must be equal":
          "pH does not give total amount.",
      },
      "Equal pH supports equal H+ concentration within the stated model.",
      "Do not infer total acid concentration or degree of ionisation.",
    ),
    n(
      "p-hcl-two",
      "Read stated concentration powers",
      "Fully ionised monoprotic HCl at 1.0 × 10^-3 mol/dm³ has pH 3. Under comparable acid-only conditions, what is pH at 1.0 × 10^-5 mol/dm³?",
      5,
      "pH",
      "Acid/H+ concentration is 100 times smaller, so pH rises two units: 3 + 2 = 5.",
      "Compare the powers of ten, then raise pH by two.",
    ),
    n(
      "p-volume",
      "Find final solution volume",
      "A stated HCl dilution is hundredfold. Initial solution volume is 20 cm³ and dissolved acid amount stays fixed. What is final solution volume?",
      2000,
      "cm³",
      "A hundredfold dilution increases total solution volume by 100: 20 × 100 = 2000 cm³.",
      "Final volume means total solution, not merely added water.",
    ),
    c(
      "p-amount",
      "Conserve dissolved amount",
      "In a dilution with no reaction, loss or added acid, what happens to total dissolved acid amount?",
      "It stays the same",
      {
        "It decreases tenfold": "Concentration may decrease; amount does not.",
        "It increases with the water": "Water does not add acid.",
      },
      "Dilution adds solvent and increases solution volume while retaining dissolved acid amount.",
      "Separate amount from amount per volume.",
    ),
    c(
      "p-still-strong",
      "Preserve acid identity",
      "Dilute HCl still ionises completely in the stated aqueous model. What happens to its strength?",
      "It remains a strong acid",
      {
        "It becomes a weak acid":
          "Low concentration does not mean partial ionisation.",
        "It becomes an alkali": "Adding water does not make HCl an alkali.",
      },
      "Its concentration changes but the degree-of-ionisation classification remains strong.",
      "Strength is not concentration.",
    ),
    c(
      "p-weak-dilution",
      "Do not overextend HCl arithmetic",
      "A weak acid is diluted tenfold. Its final ionised fraction is not supplied. Must pH rise by exactly one?",
      "No: the ionisation fraction can change",
      {
        "Yes: all acid dilution is identical":
          "Weak-acid equilibrium changes on dilution.",
        "No: every weak acid becomes neutral immediately":
          "Dilution does not imply immediate neutralisation.",
      },
      "Do not apply the stated fully ionised monoprotic HCl shortcut to every weak acid.",
      "Check the model's ionisation assumptions.",
    ),
    c(
      "p-controlled",
      "Interpret a fair comparison",
      "Comparable monoprotic acids A and B have equal total concentration and temperature. A has lower pH. What relative-strength inference is supported?",
      "A ionises to a greater extent",
      {
        "A is proven completely ionised":
          "A relative comparison does not prove completeness.",
        "A must contain more total acid per volume":
          "Total concentration was controlled.",
      },
      "More H+ at equal total acid concentration supports greater ionisation, without proving complete ionisation.",
      "A stronger relative response is not proof of a strong-acid classification.",
    ),
    w(
      "p-uncontrolled",
      "Link both properties to pH",
      "Explain why acid pH depends on both strength and concentration. For strength, compare comparable monoprotic acids at equal total acid concentration and temperature. For concentration, compare the same acid at the same temperature.",
      "pH depends on hydrogen-ion concentration: more H+ per unit volume means lower pH. At the same total acid concentration, the stronger acid ionises to a greater extent, producing more H+ and a lower pH. For the same acid, a higher total acid concentration means more dissolved acid per unit volume, giving more H+ and a lower pH. Strength and concentration are separate properties, and uncontrolled pH alone does not establish strength.",
      [
        "Link higher hydrogen-ion concentration to lower pH.",
        "At equal acid concentration, link greater ionisation to more H+ and lower pH.",
        "For the same acid, link more acid per unit volume to more H+ and lower pH.",
        "Make the causal links clear and keep the comparison controls stated.",
      ],
    ),
    c(
      "p-sulfuric",
      "Keep a strong-acid example qualified",
      "The GCSE specification lists sulfuric acid as strong. Does this alone prove H+ concentration is always exactly twice total sulfuric acid concentration?",
      "No",
      {
        Yes: "Second proton dissociation is distinct and need not be complete.",
        "It proves sulfuric acid is not strong":
          "Do not contradict the specification's strong-acid example.",
      },
      "Sulfuric is a strong GCSE example; do not blindly apply the monoprotic HCl calculation or assume both dissociations are complete.",
      "Check the number of ionisable protons and the stated assumptions.",
    ),
    c(
      "p-neutral",
      "Neutral still has ions",
      "A neutral sample at 25 °C has pH 7. Which statement is correct?",
      "Neither H+ nor OH− is in excess",
      {
        "There are no ions": "Neutral does not mean ion-free.",
        "Only hydrogen ions are present":
          "Neutrality requires neither acid/alkali ion to be in excess.",
      },
      "Neutral solutions contain both hydrogen and hydroxide ions; neither is in excess.",
      "Neutrality is a balance, not an absence.",
    ),
  ],
  checkForms: [
    [
      c(
        "a-descriptors",
        "Separate supplied descriptors",
        "Acid Q partly ionises and has a large amount of acid per unit volume. Which description follows?",
        "Weak and concentrated",
        {
          "Strong and concentrated": "Partial ionisation is weak.",
          "Weak and dilute": "Large amount per volume is concentrated.",
        },
        "Partial ionisation and high amount per volume describe different properties.",
        "Use each piece of evidence.",
      ),
      n(
        "a-factor",
        "Changed four-step comparison",
        "By what factor is H+ concentration higher at pH 1 than at pH 5?",
        10000,
        "times",
        "Four downward units mean 10⁴ = 10000.",
        "Count four factors of ten.",
      ),
      n(
        "a-dilution",
        "Changed initial reading",
        "Fully ionised monoprotic HCl starts at pH 4 and is diluted hundredfold with water contribution negligible. What is final pH?",
        6,
        "pH",
        "One hundredfold decrease in H+ concentration raises pH by two.",
        "Use two upward units.",
      ),
      c(
        "a-fair",
        "Do not prove completeness",
        "At equal total concentration and temperature, comparable monoprotic acids P and Q give pH 3 and pH 5. Which claim follows?",
        "P ionises more than Q, but complete ionisation is not established",
        {
          "P is necessarily completely ionised":
            "The comparison establishes relative extent, not completeness.",
          "Q has more H+": "Higher pH means lower H+ concentration.",
        },
        "Controlled concentration makes the relative-ionisation inference possible.",
        "Separate relative from complete.",
      ),
      w(
        "a-subject",
        "Explain what ionises",
        "Correct this explanation: ‘Hydrogen ions are completely ionised, so the acid is strong.’",
        "The acid ionises completely in aqueous solution to form ions. Already formed hydrogen ions are not the substance being ionised. Hydrogen is conserved and hydrated in water.",
        [
          "Name the acid as the substance ionising.",
          "State complete ionisation in aqueous solution.",
          "Reject saying H+ ions themselves are ionised.",
        ],
      ),
    ],
    [
      c(
        "b-descriptors",
        "Recognise a changed strong-acid example",
        "Which listed acid is a strong-acid example in the GCSE specification?",
        "Nitric acid",
        {
          "Citric acid": "Citric acid is a weak-acid example.",
          "Carbonic acid": "Carbonic acid is a weak-acid example.",
        },
        "Nitric acid is listed as strong; citric and carbonic acids are weak examples.",
        "Use the named strong/weak examples.",
      ),
      n(
        "b-factor",
        "Changed upward comparison",
        "A sample changes from pH 1 to pH 4. By what factor does H+ concentration decrease?",
        1000,
        "",
        "Three upward units divide by 1000.",
        "Keep the stated decrease direction.",
      ),
      n(
        "b-dilution",
        "Changed solution volume",
        "A tenfold HCl dilution retains dissolved acid amount. Initial volume is 35 cm³. What is final total solution volume?",
        350,
        "cm³",
        "35 × 10 = 350 cm³ total solution.",
        "Multiply the initial total volume.",
      ),
      c(
        "b-equal",
        "Equal readings, unknown acids",
        "Unknown acid samples S and T have equal pH at the same temperature. Which conclusion is justified?",
        "Equal H+ concentration; acid strengths remain unestablished",
        {
          "Both must be weak": "Equal pH does not classify strength.",
          "Equal total acid concentration": "Degree of ionisation can differ.",
        },
        "Equal pH supports equal H+ concentration but not total acid concentration or strength.",
        "Distinguish the measured ion concentration from acid properties.",
      ),
      w(
        "b-weak",
        "Explain a dilution limit",
        "Explain why a tenfold dilution of an unspecified weak acid need not give exactly the same pH change as a tenfold HCl dilution in the fully ionised monoprotic model.",
        "The weak acid only partly ionises, and its equilibrium ionised fraction can change when diluted. Its hydrogen-ion concentration therefore need not fall exactly tenfold. The stated HCl shortcut assumes complete ionisation.",
        [
          "State partial ionisation of the weak acid.",
          "Explain that the ionised fraction can change with dilution.",
          "Contrast with the stated complete-ionisation HCl assumption.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "ra-factor",
        "Delayed changed factor",
        "How many times higher is H+ concentration at pH 2 than at pH 5?",
        1000,
        "times",
        "Three lower units mean 1000 times higher H+.",
        "Count the difference.",
      ),
      c(
        "ra-dilution",
        "Delayed identity check",
        "A stated fully ionised HCl sample is diluted. Which property is preserved?",
        "Its strong-acid classification",
        {
          "Its acid concentration": "Adding water lowers concentration.",
          "Its solution volume": "Adding water raises volume.",
        },
        "Complete ionisation remains the strong-acid model while concentration changes.",
        "Keep the descriptors separate.",
      ),
      w(
        "ra-uncontrolled",
        "Delayed strength inference",
        "Acid U gives pH 3 and acid V gives pH 6 at the same temperature, but their acid concentrations are unknown. Explain what the readings establish and what they do not.",
        "U has 1000 times the hydrogen-ion concentration of V in the stated pH model. Unknown total acid concentrations mean these readings alone do not establish which acid ionises more or which acid is stronger.",
        [
          "Three pH units give a 1000-fold H+ difference.",
          "Identify unknown total acid concentrations.",
          "Do not infer acid strength from pH alone.",
        ],
      ),
    ],
    [
      n(
        "rb-dilution",
        "Delayed changed HCl dilution",
        "Fully ionised monoprotic HCl starts at pH 1 and is diluted thousandfold with water contribution negligible. What is final pH?",
        4,
        "pH",
        "Three tenfold decreases in H+ raise pH by three: 1 + 3 = 4.",
        "Count three upward pH steps.",
      ),
      c(
        "rb-concentration",
        "Delayed concentration definition",
        "Which observation directly concerns total acid concentration?",
        "Dissolved acid amount per unit solution volume",
        {
          "Fraction of acid ionised": "That concerns ionisation extent.",
          "Complete ionisation alone": "That does not give amount per volume.",
        },
        "Concentration relates amount to volume.",
        "Keep amount per volume distinct from ionisation.",
      ),
      w(
        "rb-two",
        "Delayed two-descriptor explanation",
        "Explain why ‘weak’ and ‘dilute’ are not interchangeable descriptions of an acid.",
        "Weak means partial ionisation in aqueous solution. Dilute means little acid per unit solution volume. A weak acid can have a high total acid concentration, and a strong acid can be dilute.",
        [
          "State partial ionisation for weak.",
          "State small amount per unit solution volume for dilute.",
          "Give a valid independent combination of strength and concentration.",
        ],
      ),
    ],
  ],
};
const follow: Record<string, string> = {
  "p-complete": "r-descriptors",
  "p-weak": "r-descriptors",
  "p-concentration": "r-descriptors",
  "p-weak-higher": "r-descriptors",
  "p-strong-dilute": "r-descriptors",
  "p-ions": "r-ionisation",
  "p-fall-three": "r-factor",
  "p-rise-two": "r-factor",
  "p-rise-one": "r-factor",
  "p-ratio": "r-factor",
  "p-equal-ph": "r-limits",
  "p-hcl-two": "r-dilution",
  "p-volume": "r-dilution",
  "p-amount": "r-dilution",
  "p-still-strong": "r-descriptors",
  "p-weak-dilution": "r-limits",
  "p-controlled": "r-comparison",
  "p-uncontrolled": "r-limits",
  "p-sulfuric": "r-limits",
  "p-neutral": "r-limits",
};
for (const q of acidStrengthJourney.practice)
  q.followUp = "acid-v1-" + follow[q.id.replace("acid-v1-", "")];
for (const ids of [
  ["acid-v1-r-descriptors", "acid-v1-g-descriptors"],
  ["acid-v1-r-limits", "acid-v1-g-evidence"],
])
  for (const id of ids) {
    const q = [
      ...acidStrengthJourney.refresher,
      ...acidStrengthJourney.guided,
    ].find((q) => q.id === id)!;
    q.exposureAliases = ids.filter((other) => other !== id);
  }
// Conservative aliases also retain exposure from the six preserved original route questions.
for (const [ids, legacy] of [
  [["acid-v1-p-complete"], "ph-and-strong-acids-0"],
  [
    [
      "acid-v1-r-descriptors",
      "acid-v1-g-descriptors",
      "acid-v1-p-strong-dilute",
    ],
    "ph-and-strong-acids-5",
  ],
  [["acid-v1-g-factor", "acid-v1-p-rise-two"], "ph-and-strong-acids-4"],
  [["acid-v1-p-equal-ph", "acid-v1-b-equal"], null],
] as const) {
  for (const id of ids) {
    const q = [
      ...acidStrengthJourney.refresher,
      ...acidStrengthJourney.guided,
      ...acidStrengthJourney.practice,
      ...acidStrengthJourney.checkForms.flat(),
    ].find((q) => q.id === id)!;
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...ids.filter((other) => other !== id),
        ...(legacy ? [legacy] : []),
      ]),
    ];
  }
}

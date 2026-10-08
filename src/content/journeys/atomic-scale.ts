import type { LearningTask, LessonJourney, TaskModel } from "../types";
import { choice as c, number as n } from "./helpers";
// Exact marking is deliberate: an absolute 1e-6 tolerance would accept zero for 1e-10.
const exact = (task: LearningTask): LearningTask => ({
  ...task,
  tolerance: 0,
  inputMode: "text",
});
const prefix = (value: number, initial = -6): TaskModel => ({
  kind: "nano-convert",
  nanometres: value,
  initialExponent: initial,
  instruction:
    "Choose the power of ten for nano. Inspect your proposed conversion.",
});
const scale = (initial: 1 | 10 | 100, target: 1 | 10 | 100): TaskModel => ({
  kind: "atomic-scale",
  initialRadius: initial,
  targetRadius: target,
  instruction: `Set the atom radius to ${target} m. Keep the supplied radius ratio unchanged.`,
});
const form = (
  id: string,
  prompt: string,
  coefficient: number,
  power: number,
  explanation: string,
  hint: string,
  purpose: string,
): LearningTask => ({
  id,
  prompt,
  answer: JSON.stringify({
    coefficient: String(coefficient),
    power: String(power),
  }),
  partLegend: "Standard form: coefficient × 10 to the power",
  parts: [
    {
      id: "coefficient",
      label: "Coefficient (at least 1, less than 10)",
      answer: coefficient,
      inputMode: "decimal",
    },
    { id: "power", label: "Power of 10", answer: power, inputMode: "text" },
  ],
  explanation,
  hint,
  purpose,
});
export const atomicScaleJourney: LessonJourney = {
  version: 1,
  introduction:
    "A magnified nucleus is useful for counting particles but hides the true scale. Convert nanometres, build standard form and enlarge both radii by the same factor.",
  outcomes: [
    "Use nano = 10⁻⁹ and convert nanometres to metres.",
    "Interpret standard form, compare radii by division and distinguish radius from diameter.",
    "Relate atomic and nuclear scale to a physical-object analogy without treating a magnified diagram as a scale drawing.",
  ],
  scopeNote:
    "Typical atomic radius is about 0.1 nm. Nuclear sizes vary and are less than about one ten-thousandth of the atomic radius in the reviewed GCSE description. Numerical comparisons use supplied example sizes; the inset is explicitly magnified. This lesson does not require memorising a particular element's measured radius.",
  warmup: [
    n(
      "as-v1-w-divide",
      "A small circle has radius 2 cm and a large circle has radius 20 cm. How many times larger is the large radius?",
      10,
      "times",
      "20 ÷ 2 = 10. Compare like quantities by division.",
      "Divide the large radius by the small radius.",
      "Checks ratio reasoning before powers of ten.",
      { "18": "Subtraction gives a difference, not how many times larger." },
    ),
    n(
      "as-v1-w-diameter",
      "A circle has radius 3 cm. What is its diameter?",
      6,
      "cm",
      "Diameter = 2 × radius = 6 cm.",
      "The diameter crosses two radii.",
      "Checks radius/diameter distinction before atomic lengths.",
    ),
    c(
      "as-v1-w-small",
      "Which value is smaller?",
      "10⁻¹⁰",
      {
        "10⁻⁸":
          "For these powers, a more negative exponent gives a smaller positive value.",
        "They are equal": "The exponents differ by two powers of ten.",
      },
      "10⁻¹⁰ = 0.0000000001; 10⁻⁸ = 0.00000001.",
      "Think about repeated division by ten.",
      "Checks ordering of small powers without a chemistry-memory demand.",
    ),
  ],
  refresher: [
    c(
      "as-v1-r-boundary",
      "Does concentrating almost all mass in the nucleus mean its radius is almost the atomic radius?",
      "No: most mass is concentrated in a tiny region",
      {
        "Yes: mass fraction and radius fraction are identical":
          "These describe different quantities; a very small region can contain most mass.",
        "Yes: magnified count diagrams prove it":
          "A magnified diagram exaggerates size and cannot establish the radius ratio.",
      },
      "The nucleus contains most mass but occupies only a very small region. Particle diagrams magnify it to show structure.",
      "Separate size from mass and inspect the diagram's scale label.",
      "Repairs the specific inference from mass concentration or a magnified picture to a large nucleus.",
    ),
    c(
      "as-v1-r-prefix",
      "What does the prefix nano mean?",
      "One billionth: 10⁻⁹",
      {
        "One millionth: 10⁻⁶": "That is micro.",
        "One thousandth: 10⁻³": "That is milli.",
      },
      "One nanometre is 10⁻⁹ metre.",
      "Nine divisions by ten give one billionth.",
      "Repairs confusion between nano and other prefixes.",
    ),
    form(
      "as-v1-r-form",
      "Write 0.000000002 m in standard form.",
      2,
      -9,
      "0.000000002 = 2 × 10⁻⁹. The coefficient is at least 1 and less than 10.",
      "Multiply by ten nine times to reach 2; the original power is negative.",
      "Repairs coefficient/exponent representation with a distinct value.",
    ),
    n(
      "as-v1-r-ratio",
      "A large length is 0.004 m and a small length is 0.000002 m. How many times larger is the large length?",
      2000,
      "times",
      "0.004 ÷ 0.000002 = 2000.",
      "Use division with both lengths in metres.",
      "Repairs ratio versus difference using independently supplied values.",
    ),
    n(
      "as-v1-r-mm",
      "Convert 0.003 m to millimetres.",
      3,
      "mm",
      "1 m = 1000 mm, so 0.003 × 1000 = 3 mm.",
      "A metre contains one thousand millimetres.",
      "Repairs metre/millimetre conversion in enlarged analogies.",
    ),
    n(
      "as-v1-r-radius",
      "An atom is modelled as a sphere of diameter 0.24 nm. What is its radius?",
      0.12,
      "nm",
      "Radius is half of diameter: 0.24 ÷ 2 = 0.12 nm.",
      "Centre to edge is half the full width.",
      "Repairs radius/diameter confusion with a new atomic value.",
    ),
  ],
  guided: [
    {
      ...exact(
        n(
          "as-v1-g-nano",
          "A typical atom radius is about 0.1 nm. Convert it to metres.",
          1e-10,
          "m",
          "0.1 × 10⁻⁹ = 1 × 10⁻¹⁰ m. Enter 1e-10 or 0.0000000001.",
          "Nano means 10⁻⁹; multiply 0.1 by that factor.",
          "Links the SI prefix to the typical atomic radius.",
          {
            "1e-9": "That is 1 nm, not 0.1 nm.",
            "0": "An atom is extremely small, but its radius is not zero.",
          },
          prefix(0.1),
        ),
      ),
      title: "Convert the tiny length",
      openingHint: true,
    },
    {
      ...n(
        "as-v1-g-enlarge",
        "For the supplied example, enlarge the atom radius to 100 m. What is the enlarged nucleus radius in millimetres?",
        5,
        "mm",
        "The ratio stays 20 000 : 1. 100 ÷ 20 000 = 0.005 m = 5 mm.",
        "Divide the enlarged atom radius by 20 000, then multiply metres by 1000.",
        "Connects real-object scale with a fixed radius ratio.",
        {
          "0.005":
            "That is the radius in metres; the question asks for millimetres.",
          "10": "The supplied ratio is 20 000, not 10 000.",
        },
        scale(1, 100),
      ),
      title: "Enlarge both radii together",
    },
    {
      ...n(
        "as-v1-g-resize",
        "Now enlarge the same atom radius to 10 m. What is the nucleus radius in millimetres?",
        0.5,
        "mm",
        "10 ÷ 20 000 = 0.0005 m = 0.5 mm. Reducing both enlarged radii tenfold preserves their ratio.",
        "Keep the same ratio; change only the enlarged size.",
        "Fades support and tests proportional resizing.",
        {
          "5": "That belongs to the 100 m atom radius.",
          "0.0005": "That is in metres, not millimetres.",
        },
        scale(100, 10),
      ),
      title: "Keep the ratio when resizing",
    },
  ],
  practice: [
    exact(
      n(
        "as-v1-p-nano",
        "An atomic radius is 0.15 nm. Convert it to metres.",
        1.5e-10,
        "m",
        "0.15 × 10⁻⁹ = 1.5 × 10⁻¹⁰ m.",
        "Multiply the nanometre value by 10⁻⁹.",
        "Independent prefix conversion with a new coefficient.",
        {
          "1.5e-9": "That would be 1.5 nm; check the factor of ten.",
          "0": "A small positive length is not zero.",
        },
      ),
    ),
    form(
      "as-v1-p-standard",
      "Write the radius 0.00000000025 m in standard form.",
      2.5,
      -10,
      "0.00000000025 = 2.5 × 10⁻¹⁰ m.",
      "Count the ×10 steps needed to reach 2.5.",
      "Requires standard-form representation, not only an equivalent numerical value.",
    ),
    n(
      "as-v1-p-ratio",
      "A nanoparticle radius is 3 × 10⁻⁸ m. An atom radius is 1.5 × 10⁻¹⁰ m. How many times larger is the nanoparticle radius?",
      200,
      "times",
      "(3 ÷ 1.5) × 10^(−8 − (−10)) = 2 × 10² = 200.",
      "Divide coefficients and compare the powers; both values are radii in metres.",
      "Transfers the ratio demand from an actual AQA question to original values.",
      {
        "2": "That compares only coefficients and ignores two powers of ten.",
        "100": "You must also divide 3 by 1.5.",
      },
    ),
    n(
      "as-v1-p-diameter",
      "An atom has radius 0.18 nm. What is its diameter?",
      0.36,
      "nm",
      "Diameter = 2 × 0.18 = 0.36 nm.",
      "The full width contains two radii.",
      "Separates radius from diameter using an unfamiliar atomic length.",
    ),
    c(
      "as-v1-p-picture",
      "A textbook draws the nucleus as a clearly visible cluster within an atom. What should you conclude about that picture?",
      "The nucleus is magnified to show particles; it is not a scale drawing",
      {
        "The nucleus occupies about half of every atom":
          "The real nuclear radius is far smaller than the atomic radius.",
        "The drawing measures the exact nuclear radius":
          "A schematic does not provide a measured scale.",
      },
      "A visible cluster helps identify particles but exaggerates relative nuclear size. Use supplied radii for quantitative scale.",
      "Ask whether the drawing is labelled schematic or magnified.",
      "Interprets the limitations of the app's earlier count/3D assets.",
    ),
    n(
      "as-v1-p-analogy",
      "For an example with atom:nucleus radius ratio 25 000 : 1, an enlarged atom has radius 50 m. What is the enlarged nucleus radius in millimetres?",
      2,
      "mm",
      "50 ÷ 25 000 = 0.002 m = 2 mm.",
      "Use this supplied ratio, not the guided example's ratio.",
      "Transfers enlargement to a different supplied nuclear size.",
      {
        "2.5": "Do not reuse the guided ratio of 20 000.",
        "0.002": "That is in metres; convert to millimetres.",
      },
    ),
    exact(
      n(
        "as-v1-p-inverse",
        "A radius is 2 × 10⁻¹⁰ m. What is it in nanometres?",
        0.2,
        "nm",
        "Divide by 10⁻⁹: (2 × 10⁻¹⁰) ÷ 10⁻⁹ = 0.2 nm.",
        "Metres to nanometres reverses the conversion.",
        "Requires inverse SI conversion rather than repeated forward substitution.",
      ),
    ),
    {
      ...n(
        "as-v1-p-explain",
        "A pupil says: 'The nucleus contains almost all the mass, so it must fill almost all the atom.' Explain the error.",
        0,
        "",
        "Mass concentration and occupied size are different. Almost all atomic mass is in a very small nucleus; most of the atom is empty space.",
        "Compare where mass is concentrated with how much space that region occupies.",
        "Requires a causal correction linking size, mass and schematic limitations.",
      ),
      answer:
        "Almost all mass is concentrated in the tiny nucleus, but its radius is much smaller than the atom's. Most atomic space is outside the nucleus.",
      rubric: [
        "The nucleus contains almost all the mass because protons and neutrons are much more massive than electrons.",
        "Its radius is nevertheless extremely small relative to the atom's; mass fraction does not equal size fraction.",
        "A magnified particle diagram cannot be used as a scale measurement.",
      ],
    },
  ],
  checkForms: [
    [
      exact(
        n(
          "as-v1-ca-convert",
          "Convert an atomic radius of 0.12 nm into metres.",
          1.2e-10,
          "m",
          "0.12 × 10⁻⁹ = 1.2 × 10⁻¹⁰ m.",
          "Use the SI nano prefix.",
          "Reserved conversion with a new coefficient.",
        ),
      ),
      form(
        "as-v1-ca-form",
        "Express 0.0000000003 m in standard form.",
        3,
        -10,
        "3 × 10⁻¹⁰ m.",
        "The coefficient must be from 1 up to 10.",
        "Reserved standard-form representation.",
      ),
      n(
        "as-v1-ca-ratio",
        "Given radii 2 × 10⁻¹⁰ m and 4 × 10⁻¹⁵ m, calculate atom radius divided by nucleus radius.",
        50000,
        "times",
        "(2 ÷ 4) × 10⁵ = 50 000.",
        "Divide both the coefficients and the powers.",
        "Reserved unlike-coefficient nuclear ratio.",
      ),
      n(
        "as-v1-ca-diameter",
        "An atom radius is 0.11 nm. Calculate its diameter.",
        0.22,
        "nm",
        "2 × 0.11 = 0.22 nm.",
        "Double the radius.",
        "Reserved geometric interpretation.",
      ),
    ],
    [
      exact(
        n(
          "as-v1-cb-convert",
          "A length is 4 × 10⁻¹⁰ m. Express it in nanometres.",
          0.4,
          "nm",
          "4 × 10⁻¹⁰ ÷ 10⁻⁹ = 0.4 nm.",
          "Reverse the nano conversion.",
          "Alternate reserved inverse conversion.",
        ),
      ),
      form(
        "as-v1-cb-form",
        "Write 0.00000000016 m in standard form.",
        1.6,
        -10,
        "1.6 × 10⁻¹⁰ m.",
        "Keep the coefficient below 10.",
        "Alternate reserved standard-form representation.",
      ),
      n(
        "as-v1-cb-analogy",
        "An example has atom:nucleus radius ratio 30 000 : 1. If the enlarged atom radius is 60 m, find the enlarged nucleus radius in mm.",
        2,
        "mm",
        "60 ÷ 30 000 = 0.002 m = 2 mm.",
        "Divide by the supplied ratio and convert metres to mm.",
        "Alternate reserved physical-object analogy.",
      ),
      c(
        "as-v1-cb-limit",
        "Why can't you measure relative nuclear size from a magnified particle-count diagram?",
        "The nucleus is deliberately enlarged relative to the atom",
        {
          "Most mass means most volume":
            "Mass concentration does not imply a large radius.",
          "All atoms have zero radius": "Atoms have small positive radii.",
        },
        "A schematic count diagram distorts relative size. Supplied measurements are needed.",
        "Inspect the model's scale label.",
        "Alternate reserved model-limit interpretation.",
      ),
    ],
  ],
  reviewForms: [
    [
      exact(
        n(
          "as-v1-ra-convert",
          "Convert 0.28 nm to metres.",
          2.8e-10,
          "m",
          "0.28 × 10⁻⁹ = 2.8 × 10⁻¹⁰ m.",
          "Retrieve the nano factor.",
          "Delayed prefix conversion.",
        ),
      ),
      n(
        "as-v1-ra-ratio",
        "Two radii are 6 × 10⁻⁸ m and 2 × 10⁻¹⁰ m. Find larger divided by smaller.",
        300,
        "times",
        "(6 ÷ 2) × 10² = 300.",
        "Compare both coefficient and power.",
        "Delayed scale ratio with changed coefficients.",
      ),
      n(
        "as-v1-ra-radius",
        "A spherical atom has diameter 0.32 nm. Find its radius.",
        0.16,
        "nm",
        "0.32 ÷ 2 = 0.16 nm.",
        "Radius is half the diameter.",
        "Delayed geometry distinction.",
      ),
    ],
    [
      form(
        "as-v1-rb-form",
        "Write 0.00000000045 m in standard form.",
        4.5,
        -10,
        "4.5 × 10⁻¹⁰ m.",
        "Count decimal-place scaling steps.",
        "Alternate delayed standard-form recall.",
      ),
      n(
        "as-v1-rb-enlarge",
        "For an atom:nucleus radius ratio of 40 000 : 1, enlarge the atom radius to 80 m. Find nuclear radius in millimetres.",
        2,
        "mm",
        "80 ÷ 40 000 = 0.002 m = 2 mm.",
        "Use this supplied ratio.",
        "Alternate delayed enlargement transfer.",
      ),
      c(
        "as-v1-rb-mass",
        "Which statement combines atomic size and mass correctly?",
        "Almost all mass is concentrated in a very small nucleus",
        {
          "The nucleus fills almost all the atom because it is massive":
            "High mass concentration does not imply large radius.",
          "Electrons contain almost all the mass":
            "Electron mass is very small compared with nuclear particles.",
        },
        "The nucleus is tiny relative to the atom but contains almost all its mass.",
        "Separate mass distribution from relative radius.",
        "Alternate delayed size/mass distinction.",
      ),
    ],
  ],
};
for (const task of [
  ...atomicScaleJourney.guided,
  ...atomicScaleJourney.practice,
]) {
  task.followUp =
    task.id.includes("picture") || task.id.includes("explain")
      ? "as-v1-r-boundary"
      : task.id.includes("standard")
        ? "as-v1-r-form"
        : task.id.includes("diameter")
          ? "as-v1-r-radius"
          : task.id.includes("ratio")
            ? "as-v1-r-ratio"
            : task.id.includes("analogy") ||
                task.id.includes("enlarge") ||
                task.id.includes("resize")
              ? "as-v1-r-mm"
              : "as-v1-r-prefix";
}

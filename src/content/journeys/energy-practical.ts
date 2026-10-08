import { temperatureScatter } from "../../lib/temperature-scatter";
import {
  energyEquationGuided,
  energyEquationRecovery,
  energyEquationPractice,
} from "./energy-linear-equation";
import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { PracticalMode } from "../../lib/energy-practical";
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
    "ep-v1-" + id,
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
    "ep-v1-" + id,
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
  id: "ep-v1-" + id,
  title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  purpose: title,
  rubric,
});
const m = (
  mode: PracticalMode,
  instruction: string,
  record?: string,
): TaskModel => ({ kind: "energy-practical", mode, instruction, record });
const graph = (
  points: [number, number][],
  xMax: number,
  yMin: number,
  yMax: number,
  xLabel = "Mass / g",
) => ({ points, xLabel, xMax, yMin, yMax, line: true });
export const practicalJourney: LessonJourney = {
  version: 1,
  introduction:
    "Plan a fair temperature-change investigation, select useful measurements and explain what its data support.",
  scopeNote:
    "Foundation/shared working AQA 8462 4.5.1.1 required practical 4 and AQA 8464 5.5.1.1 temperature-change investigation. Compare acid/metals, acid/carbonates, neutralisation and displacement under specified conditions. This app teaches simulated method planning and data interpretation; it does not certify safe laboratory technique or replace supervised practical experience. The independent variable depends on the stated investigation; do not always choose volume. Relevant controls include initial amounts, concentrations, starting temperatures and apparatus/timing. Measure the initial temperature before mixing; stir for a more uniform solution and record the appropriate reaction-stage maximum or minimum. Later cooling or warming towards room temperature can miss the reaction-stage change. Signed change is extremum minus initial; a requested positive rise or decrease is a magnitude. Insulating cups and lids reduce unwanted energy exchange, without eliminating it. Thermometer resolution differs from accuracy, and a small division does not guarantee a correct value. Repetitions help assess variation and estimate a mean; they do not remove systematic heat loss. Do not silently discard an unusual result without evidence; distinguish ordinary variation, recorded procedural failure and unexplained spread. When initial temperatures differ, compare changes rather than raw peaks. Draw graphs with independent variable and unit horizontally and measured response and unit vertically. Use two points on a best-fit line, matching coordinate differences and the correct gradient unit. Read labelled values on a truncated axis; plot origin does not necessarily mean zero temperature. Extrapolating to zero added mass estimates the initial temperature, not a directly measured new trial. In a supplied neutralisation dataset, intersecting ascending and descending best-fit lines estimate the maximum between observations; the highest sampled mean can be tied. Successive additions to the same cup change total solution volume; temperature rise alone does not give energy in joules or rank released energy across unequal heat capacities and masses. For a fixed acid sample and idealised carbonate-mass investigation, highest temperature rises then levels off once the acid limits further reaction; this is not an assertion that every cumulative-neutralisation graph has a plateau. Fresh AQA 2022 Foundation question 10 and paired mark scheme were read and relevant diagrams visually inspected: method reasoning, gradient 1.6 °C/g, intercept 20.6 °C and idealised limiting-reactant sketch. Questions here use original data and wording; no automatic examiner marks or error-carried-forward claim. Actual AQA practical-handbook table has a tied mean maximum 32.3 °C at 25 and 30 cm³ added; fitted and sampled maxima differ. Limited actual Pearson Combined 7.9/suggested-practical comparison and OpenStax Calorimetry apparatus/measurement-limit reading support the design; full board mapping remains unfinished. No mandatory q=mcΔT, enthalpy or advanced calorimetry is imported. The optional real 3 D cutaway cup is an apparatus reference; mesh counts do not generate temperatures. Written responses are self-reviewed, never automatic evidence of a complete method. Completion does not establish exam readiness. Repeated demands share global exposure; reserved checks and separate seven-day review defer feedback.",
  outcomes: [
    "Identify investigation variables, suitable apparatus and relevant controls.",
    "Select initial and reaction-stage observations and calculate temperature changes.",
    "Interpret repeated measurements and justify data treatment.",
    "Construct scatter observations and a straight best-fit line; use gradients, extrapolated intercepts and estimated maxima.",
    "Evaluate heat exchange and limits of conclusions using evidence.",
  ],
  warmup: [
    n(
      "warm-difference",
      "Find the difference",
      "Calculate29.5−21.0.",
      8.5,
      "",
      "29.5−21.0=8.5.",
      "Subtract the initial value.",
    ),
    n(
      "warm-mean",
      "Calculate a mean",
      "Calculate the mean of 8,9 and 10.",
      9,
      "",
      "(8+9+10)/3=9.",
      "Sum then divide by3.",
    ),
  ],
  refresher: [
    c(
      "r-variables",
      "Link variables to the question",
      "A student varies carbonate mass to investigate the highest temperature reached. Which is the independent variable?",
      "Carbonate mass",
      {
        "Highest temperature": "That is the measured response.",
        "The result we hope for":
          "A desired outcome is not a variable to manipulate.",
      },
      "The independent variable is what the stated investigation deliberately changes.",
      "Read what is varied.",
      m(
        "plan",
        "Choose the variables, apparatus and sequence for the supplied investigation.",
      ),
    ),
    n(
      "r-reading",
      "Choose relevant readings",
      "Initial temperature 21.0 °C; reaction-stage peak 29.5 °C; final cooled reading 26.5 °C. Find the reaction-stage temperature rise.",
      8.5,
      "°C",
      "29.5−21.0=8.5 °C. The final cooled reading misses the peak.",
      "Use peak minus initial.",
      m("observe", "Select readings and predict the signed change."),
    ),
    n(
      "r-mean",
      "Mean the retained data",
      "Three matched rises are 8.2,8.6 and 8.4 °C. No procedural failure is recorded. Find their mean.",
      8.4,
      "°C",
      "25.2/3=8.4 °C; ordinary spread does not justify deleting a trial.",
      "Sum all three then divide by 3.",
      m(
        "repeat",
        "Decide which observations to retain and predict their mean.",
      ),
    ),
    n(
      "r-gradient",
      "Use matching differences",
      "A best-fit line passes through(1 g,23 °C) and(5 g,31 °C). Find its gradient.",
      2,
      "°C/g",
      "(31−23)/(5−1)=8/4=2°C/g.",
      "Change in temperature divided by change in mass.",
      m(
        "graph",
        "Select two fitted-line points and construct a matching gradient triangle.",
      ),
    ),
    c(
      "r-fit",
      "Estimate between samples",
      "Two fitted lines cross between measured added volumes. What does that crossing give?",
      "An estimate of the maximum from the fits",
      {
        "A new measured trial": "Fitting does not create a new observation.",
        "Proof that total solution volume stayed constant":
          "Cumulative additions increase total solution volume.",
      },
      "The intersection estimates a maximum; sampled values and the fitted maximum differ.",
      "Distinguish estimates from observations.",
      m(
        "fit",
        "Place your estimated crossing on the two supplied best-fit lines.",
      ),
    ),
    c(
      "r-limit",
      "Explain the limiting reactant",
      "A fixed acid sample is used with increasing carbonate mass. Why does the idealised highest temperature eventually level off?",
      "Acid limits further reaction",
      {
        "All carbonate must react forever":
          "Extra carbonate cannot react when acid is used up.",
        "Insulation creates more heat":
          "Insulation reduces transfer; it does not create chemical energy.",
      },
      "Once acid is limiting, additional carbonate does not all react. This idealised trend differs from a cumulative neutralisation graph.",
      "Identify the reactant that is used up.",
      m(
        "evaluate",
        "Explain the idealised mass-investigation trend.",
        "excess",
      ),
    ),
    c(
      "r-quality",
      "Evaluate the instrument",
      "Two thermometers have 0.1 °C and 0.5 °C divisions. No calibration data are given. What can smaller divisions establish?",
      "Finer resolution, without a guarantee of accuracy",
      {
        "Guaranteed correct readings":
          "Resolution does not establish calibration or accuracy.",
        "No temperature can be measured":
          "Both are supplied temperature instruments.",
      },
      "Smaller divisions allow finer readings but do not establish how close they are to the true temperature.",
      "Distinguish division size from accuracy.",
      m("evaluate", "Explain the instrument evidence.", "resolution"),
    ),
    c(
      "r-risk",
      "Use the supplied risk assessment",
      "A supervised-school risk assessment identifies eye-splash risk and prescribes protective goggles. Which precaution addresses that risk?",
      "Follow the prescribed eye-protection protocol",
      {
        "Use a balance instead":
          "A balance measures mass, without protecting eyes.",
        "Ignore the protocol after repeating":
          "Repeating does not remove splash risk.",
      },
      "Follow the school's supplied risk assessment and prescribed protection under supervision. The app does not certify a safe unsupervised procedure.",
      "Match the precaution to the identified risk.",
      m("evaluate", "Explain the supplied precaution.", "risk"),
    ),
    c(
      "r-bias",
      "Separate variation and bias",
      "The same apparatus loses energy during every exothermic trial. Does repeating it remove this heat-loss bias?",
      "No; the systematic effect can persist",
      {
        "Yes; all errors average away":
          "Repeating cannot remove the same persistent effect.",
        "Yes; a mean creates extra reaction energy":
          "A statistical calculation does not create energy.",
      },
      "Repetition helps assess random variation but does not remove systematic energy loss.",
      "Consider what stays the same in every trial.",
      m(
        "evaluate",
        "Choose a practical claim and the evidence that supports it.",
        "bias",
      ),
    ),
  ],
  guided: [
    c(
      "g-plan",
      "Choose a fair method",
      "For a carbonate-mass investigation, which set should be controlled?",
      "Initial acid volume, concentration and temperature",
      {
        "The final temperature by force":
          "Final temperature is the measured response.",
        "Carbonate mass":
          "The investigation deliberately changes carbonate mass.",
      },
      "Fix relevant starting conditions while changing the independent variable.",
      "Keep the acid starting conditions matched.",
      m("plan", "Build a method for varying carbonate mass."),
    ),
    n(
      "g-observe",
      "Read the reaction peak",
      "A reaction starts at 20.4 °C and peaks at 28.6 °C before cooling. Find the rise.",
      8.2,
      "°C",
      "28.6−20.4=8.2°C.",
      "Peak minus initial.",
      m(
        "observe",
        "Select the baseline and maximum from the supplied trace.",
        "decimal",
      ),
    ),
    n(
      "g-repeat",
      "Justify retained trials",
      "Rises 7.8,7.9,2.0 °C; trial 3 had a recorded probe-removal failure. Find the mean of the two valid trials.",
      7.85,
      "°C",
      "(7.8+7.9)/2=7.85 °C. The exclusion follows a documented measurement failure.",
      "Use the two valid measurements.",
      m(
        "repeat",
        "Retain measurements using the recorded evidence, then predict the mean.",
        "failed",
      ),
    ),
    n(
      "g-graph",
      "Build a gradient triangle",
      "The supplied fitted line rises from 22.7 °C at 1 g to 28.7 °C at 5 g. Find its gradient.",
      1.5,
      "°C/g",
      "6.0/4.0=1.5°C/g.",
      "Use matching coordinate differences.",
      m(
        "graph",
        "Select two points, construct the triangle and predict the gradient.",
        "decimal",
      ),
    ),
    c(
      "g-fit",
      "Read a fitted maximum",
      "What does the fitted-line intersection estimate?",
      "An estimated maximum at an added volume",
      {
        "A directly measured maximum trial":
          "An intersection can lie between sampled additions.",
        "The energy released in joules": "Temperature is not energy in joules.",
      },
      "Read both axes at the fitted intersection and label it as an estimate.",
      "An estimate is not a new observation.",
      m(
        "fit",
        "Enter the estimated volume and temperature; inspect your purple cross.",
      ),
    ),
    c(
      "g-evidence",
      "Explain stirring",
      "Why stir a reaction solution before taking a representative temperature reading?",
      "To reduce temperature differences within the solution",
      {
        "To create more atoms": "Stirring does not create atoms.",
        "To create additional reaction energy":
          "Stirring does not generate the chemical energy change.",
      },
      "A probe measures locally; stirring makes the solution temperature more uniform.",
      "Think about the probe location.",
      m(
        "evaluate",
        "Link the practical change to its measurement consequence.",
        "stir",
      ),
    ),
  ],
  practice: [
    n(
      "p-rise",
      "Use the peak",
      "Initial 22.4 °C; peak 30.1 °C; final 26.0 °C. Find the rise at the reaction peak.",
      7.7,
      "°C",
      "30.1−22.4=7.7°C.",
      "Ignore subsequent cooling.",
    ),
    n(
      "p-cooling",
      "Keep the sign",
      "Initial 24.0 °C; reaction-stage minimum 17.5 °C. Find the signed temperature change.",
      -6.5,
      "°C",
      "17.5−24.0=−6.5°C.",
      "Minimum minus initial.",
    ),
    c(
      "p-variable",
      "Identify the changed variable",
      "An investigation changes added alkali volume while using a fresh fixed acid sample each run. What is the independent variable?",
      "Added alkali volume",
      {
        "Maximum temperature": "That is measured.",
        "Initial acid volume": "That is fixed.",
      },
      "The variable deliberately changed is added alkali volume.",
      "Read the investigation aim.",
    ),
    c(
      "p-control",
      "Choose relevant controls",
      "A student changes carbonate mass. Which keeps the acid conditions comparable?",
      "Same initial acid volume, concentration and temperature",
      {
        "Same final temperature": "Final temperature must be allowed to vary.",
        "Same carbonate mass in every run":
          "That would prevent investigating the mass effect.",
      },
      "Control relevant starting conditions while varying mass.",
      "Match the initial acid.",
    ),
    c(
      "p-apparatus",
      "Measure the right quantity",
      "Which apparatus directly measures carbonate mass?",
      "A balance",
      {
        "A measuring cylinder": "That measures volume.",
        "A thermometer": "That measures temperature.",
      },
      "Use a balance for mass.",
      "Match instrument and quantity.",
    ),
    c(
      "p-order",
      "Record the baseline first",
      "When should the initial temperature be recorded?",
      "Before adding the second reactant",
      {
        "Only after the solution has cooled":
          "That misses the initial condition.",
        "Only after measuring the peak":
          "A peak does not reveal the starting temperature.",
      },
      "Record a representative pre-mixing temperature before the reaction starts.",
      "Initial means before reaction.",
    ),
    c(
      "p-cover",
      "Reduce unwanted transfer",
      "What does an insulating cup with a lid do?",
      "Reduce unwanted energy exchange with the room",
      {
        "Prevent every possible energy transfer": "Insulation is imperfect.",
        "Make the chemical reaction release more energy by definition":
          "Apparatus choice is not the reaction energy change.",
      },
      "Insulation reduces loss or gain without guaranteeing perfect isolation.",
      "Reduce does not mean eliminate.",
    ),
    c(
      "p-stir",
      "Represent the solution",
      "Why does stirring help a thermometer reading represent the solution?",
      "It reduces spatial temperature differences",
      {
        "It creates atoms": "Atoms are not created by stirring.",
        "It forces every result to be correct":
          "Stirring cannot remove all errors.",
      },
      "The probe senses its local surroundings.",
      "Think about uneven temperature.",
    ),
    n(
      "p-mean",
      "Calculate a repeat mean",
      "Matched rises 5.2,5.6,5.4 °C; no recorded failure. Find the mean.",
      5.4,
      "°C",
      "16.2/3=5.4°C.",
      "Retain all three ordinary readings.",
    ),
    n(
      "p-failure",
      "Use evidence for exclusion",
      "Rises 6.2,6.4,1.0 °C. A recorded spill invalidated trial 3. Find the mean of valid trials.",
      6.3,
      "°C",
      "(6.2+6.4)/2=6.3 °C. Exclusion is justified by the recorded spill.",
      "Use only the two valid trials.",
    ),
    c(
      "p-spread",
      "Investigate an unusual result",
      "Three readings have a large spread, but no failure is recorded. What is the best response?",
      "Retain the record and investigate the cause with further trials",
      {
        "Always delete the highest result":
          "High does not automatically mean invalid.",
        "Declare all three exactly accurate":
          "Spread alone does not establish accuracy.",
      },
      "Keep the evidence and investigate unexplained variation.",
      "Do not silently rewrite the record.",
    ),
    n(
      "p-baselines",
      "Compare temperature changes",
      "Trial 1 starts 19.0 °C and peaks 27.0 °C; trial 2 starts 21.0 °C and peaks 29.0 °C. Find the mean temperature rise.",
      8,
      "°C",
      "Both rises are 8 °C; their mean is 8 °C. Mean peak 28 °C is not a rise.",
      "Subtract each baseline before averaging.",
    ),
    {
      ...n(
        "p-gradient",
        "Read a fitted gradient",
        "Use two labelled points on the supplied fitted line. Find the gradient.",
        1.2,
        "°C/g",
        "(28.6−23.8)/(5−1)=1.2°C/g.",
        "Use matching differences.",
      ),
      practicalGraph: graph(
        [
          [1, 23.8],
          [2, 25],
          [3, 26.2],
          [4, 27.4],
          [5, 28.6],
        ],
        5,
        20,
        32,
      ),
    },
    {
      ...n(
        "p-intercept",
        "Extrapolate the initial temperature",
        "Extend the supplied fitted line to mass 0 g. Estimate the initial temperature.",
        22.6,
        "°C",
        "At 1 g temperature 23.8 °C; the fitted gradient 1.2 °C/g gives 23.8−1.2=22.6 °C at 0 g.",
        "Extend to the labelled y-axis.",
      ),
      practicalGraph: graph(
        [
          [1, 23.8],
          [2, 25],
          [3, 26.2],
          [4, 27.4],
          [5, 28.6],
        ],
        5,
        20,
        32,
      ),
    },
    c(
      "p-unit",
      "Match the gradient unit",
      "Temperature is plotted against added volume in cm³. What is the gradient unit?",
      "°C/cm³",
      {
        "°C/g": "The horizontal axis is volume, not mass.",
        "cm³/°C": "That reverses the quotient.",
      },
      "Vertical-axis unit divided by horizontal-axis unit.",
      "Temperature change divided by volume change.",
    ),
    c(
      "p-axis",
      "Read the labelled scale",
      "The plotted y-axis begins at 20 °C. What temperature does the lower plotted horizontal edge represent?",
      "20°C",
      {
        "0°C": "A graph boundary need not be the numerical origin.",
        "The reaction temperature rise":
          "The axis is labelled temperature, not change.",
      },
      "Read labelled values; a truncated axis still has its stated scale.",
      "Read the bottom label.",
    ),
    c(
      "p-tie",
      "Recognise tied sampled maxima",
      "Added volumes 20,25,30,35 cm³ give mean peaks 31.0,32.3,32.3,31.7 °C. Which sampled volumes have the highest mean peak?",
      "25 and30cm³",
      {
        "Only30cm³": "25cm³ has the same mean.",
        "Only35cm³": "31.7°C is lower.",
      },
      "Both sampled values share the maximum 32.3 °C. A fit may estimate a different location.",
      "Compare all supplied means.",
    ),
    c(
      "p-excess",
      "Apply the limiting reactant",
      "Under idealised matched conditions, carbonate mass increases for a fixed acid sample until carbonate is in excess. What happens to the highest-temperature trend?",
      "It rises then levels off",
      {
        "It must keep rising forever": "Acid limits the amount that can react.",
        "It must fall immediately with the first addition":
          "The given reaction is exothermic.",
      },
      "Once acid is used up, further carbonate cannot produce further reaction with it under the idealised assumptions.",
      "Identify what becomes limiting.",
    ),
    c(
      "p-resolution",
      "Separate resolution and accuracy",
      "A supplied thermometer has 0.1 °C divisions rather than 0.5 °C. No accuracy evidence is given. What is justified?",
      "It has finer resolution, but accuracy is not established",
      {
        "It must be exactly accurate":
          "Division size does not establish accuracy.",
        "It must measure larger temperature changes":
          "Range and resolution are different properties.",
      },
      "Finer divisions allow a finer reading; calibration and other measurement errors still matter.",
      "Smaller divisions do not prove a correct reading.",
    ),
    c(
      "p-risk",
      "Match protection to the stated risk",
      "A supervised-school risk assessment identifies eye-splash risk and prescribes splash-protective goggles. Which response addresses that risk?",
      "Follow the prescribed eye-protection protocol under supervision",
      {
        "Use a balance instead of goggles":
          "A balance measures mass, not eye protection.",
        "Repeat more trials without the prescribed protection":
          "Repeating does not address splash exposure.",
      },
      "Use the supplied school risk assessment and prescribed protection. The app does not establish a safe unsupervised procedure.",
      "Match the precaution to the identified risk.",
    ),
    w(
      "p-plan",
      "Explain a valid method",
      "Plan a supervised-school investigation of how carbonate mass affects the highest temperature. Explain relevant measurements, controls and repeats; do not give chemical-preparation instructions.",
      "Measure a fixed acid volume of fixed concentration, record its starting temperature, and add a known measured carbonate mass to a suitable insulating cup. Stir and record the highest temperature. Repeat with different measured masses while matching acid starting conditions and apparatus. Repeat trials to assess variation and calculate appropriate means. Follow the supplied supervised-school protocol.",
      [
        "Identify carbonate mass as the variable and use a balance.",
        "Measure initial and highest temperature with a thermometer; use a suitable cup and stir.",
        "Control acid volume, concentration, starting temperature and relevant method conditions.",
        "Sequence measurements logically and explain repetitions.",
      ],
    ),
    w(
      "p-bias",
      "Evaluate a persistent error",
      "Explain why repeating an exothermic experiment in the same poorly insulated apparatus may not remove underestimation of the temperature rise.",
      "Energy can leave the reaction mixture and apparatus for the room during each trial, lowering the measured rise. Repeating helps assess random variation and calculate a mean, but the same systematic heat-loss effect can persist. Better insulation and matched measurement timing address the cause.",
      [
        "Link unwanted heat exchange to a smaller measured rise.",
        "Distinguish repeating from removing a persistent systematic effect.",
        "Suggest an improvement tied to the cause.",
      ],
    ),
    w(
      "p-energy",
      "Limit the conclusion",
      "Two reactions in unequal solution amounts have different temperature rises. Explain why the larger rise alone cannot establish which released more total energy.",
      "Temperature change is not itself energy in joules. Solution amount and heat capacity affect how much the temperature changes for a given transfer; reacted amounts and heat exchange also matter. Without controlling these conditions or supplying appropriate data, the larger rise alone cannot rank released energy.",
      [
        "Distinguish temperature and energy.",
        "Identify solution amount or heat capacity as relevant.",
        "State why the supplied comparison does not establish total energy.",
      ],
    ),
  ],
  checkForms: [
    [
      n(
        "a-rise",
        "Independent peak change",
        "Initial 20.8 °C; reaction-stage peak 29.6 °C; final 25.0 °C. Determine the reaction-stage rise.",
        8.8,
        "°C",
        "29.6−20.8=8.8°C.",
        "Use the reaction peak.",
      ),
      n(
        "a-mean",
        "Independent repeat mean",
        "Matched rises 4.3,4.7,4.5 °C with no recorded failures. Find the mean.",
        4.5,
        "°C",
        "13.5/3=4.5°C.",
        "Sum and divide.",
      ),
      {
        ...n(
          "a-gradient",
          "Independent graph gradient",
          "Find the gradient of the supplied best-fit line.",
          1.4,
          "°C/g",
          "(28.4−22.8)/(5−1)=1.4°C/g.",
          "Use two fitted points.",
        ),
        practicalGraph: graph(
          [
            [1, 22.8],
            [2, 24.2],
            [3, 25.6],
            [4, 27],
            [5, 28.4],
          ],
          5,
          20,
          32,
        ),
      },
      c(
        "a-control",
        "Independent method decision",
        "To investigate the effect of carbonate mass, what should be controlled?",
        "Acid volume, concentration and starting temperature",
        {
          "The final temperature": "That is the measured response.",
          "Every carbonate mass must be identical":
            "That prevents investigating mass.",
        },
        "Match acid starting conditions.",
        "Separate changed and controlled quantities.",
      ),
      w(
        "a-written",
        "Independent practical explanation",
        "Explain why recording only a cooled final temperature may underestimate the reaction-stage rise.",
        "The reaction-stage maximum may occur earlier. Subsequent energy transfer to the room lowers the solution temperature, so final minus initial can be smaller than maximum minus initial. Measure and record the maximum during the reaction stage.",
        [
          "Identify the earlier reaction-stage maximum.",
          "Explain cooling through unwanted heat exchange.",
          "Link it to a smaller measured rise.",
        ],
      ),
    ],
    [
      n(
        "b-change",
        "Independent signed change",
        "Initial 25.4 °C; reaction-stage minimum 18.6 °C. Determine the signed temperature change.",
        -6.8,
        "°C",
        "18.6−25.4=−6.8°C.",
        "Final reaction-stage extremum minus initial.",
      ),
      n(
        "b-validmean",
        "Independent evidence-based mean",
        "Rises 9.0,9.4,3.0 °C. Trial 3 has a documented measurement failure. Find the mean of the valid trials.",
        9.2,
        "°C",
        "18.4/2=9.2°C.",
        "Use the valid trials.",
      ),
      {
        ...n(
          "b-intercept",
          "Independent fitted intercept",
          "Extend the supplied best-fit line to added mass 0 g. Estimate the initial temperature.",
          21.4,
          "°C",
          "The gradient 1.1 °C/g gives 22.5−1.1=21.4 °C at 0 g.",
          "Read or extrapolate the labelled axis.",
        ),
        practicalGraph: graph(
          [
            [1, 22.5],
            [2, 23.6],
            [3, 24.7],
            [4, 25.8],
            [5, 26.9],
          ],
          5,
          20,
          32,
        ),
      },
      c(
        "b-volume",
        "Independent total-volume reasoning",
        "Successive alkali additions go into the same acid sample. Which statement is justified?",
        "Total solution volume increases",
        {
          "Total volume remains constant":
            "More solution is added to the same sample.",
          "Temperature is directly energy in joules":
            "These are different quantities.",
        },
        "Cumulative added volume increases total volume.",
        "Track what has been added.",
      ),
      w(
        "b-written",
        "Independent repeats explanation",
        "Explain what repeats help assess and why they do not necessarily remove a systematic heat-loss error.",
        "Repeats reveal variation and support an appropriate mean. A systematic heat-loss effect can persist each time when the same apparatus and timing are used, so averaging does not remove it. Improve insulation and control measurement conditions.",
        [
          "Identify variation or estimating a mean.",
          "Explain persistence of systematic heat loss.",
          "Link an improvement to its cause.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "d-a-rise",
        "Delayed peak change",
        "Initial 22.2 °C; reaction-stage peak 31.4 °C. Find the rise.",
        9.2,
        "°C",
        "31.4−22.2=9.2°C.",
        "Peak minus initial.",
      ),
      n(
        "d-a-gradient",
        "Delayed gradient",
        "A fitted line goes through(2 g,24 °C) and(6 g,29 °C). Find its gradient.",
        1.25,
        "°C/g",
        "5/4=1.25°C/g.",
        "Use matching differences.",
      ),
      w(
        "d-a-plan",
        "Delayed method reasoning",
        "Explain why a carbonate-mass investigation should keep initial acid volume, concentration and temperature matched.",
        "These conditions can affect reacting amount and measured temperature response. Keeping them matched makes a change in carbonate mass a more defensible explanation of observed differences.",
        [
          "Identify relevant controlled starting conditions.",
          "Explain how changing them could confound the comparison.",
        ],
      ),
    ],
    [
      n(
        "d-b-mean",
        "Delayed repeat mean",
        "Three valid matched rises 6.1,6.5,6.3 °C. Find their mean.",
        6.3,
        "°C",
        "18.9/3=6.3°C.",
        "Sum and divide.",
      ),
      n(
        "d-b-intercept",
        "Delayed intercept",
        "A fitted line has gradient 1.3 °C/g and passes through(2 g,24.8 °C). Estimate temperature at 0 g.",
        22.2,
        "°C",
        "24.8−2×1.3=22.2°C.",
        "Subtract the fitted change for 2 g.",
      ),
      w(
        "d-b-limit",
        "Delayed evidence limit",
        "Explain why a fitted-line intersection is not the same thing as a directly measured maximum trial.",
        "The intersection is an estimate based on the fitted trends and can lie between observed added volumes. It does not add a new trial; sampled maxima may be tied or differ from the estimated maximum.",
        [
          "Distinguish an estimate from an observation.",
          "Explain that the estimate can lie between sampled volumes.",
        ],
      ),
    ],
  ],
};
// Appended extension: saved original task indices and sealed forms remain unchanged.
const scatterTask = (
  id: string,
  title: string,
  data: "guided" | "transfer",
): LearningTask => {
  const drawing = temperatureScatter[data],
    initial = data === "guided" ? "24.0" : "22.0";
  return {
    ...w(
      id,
      title,
      "Plot minima; fit to 0 g.",
      `One suitable best-fit line crosses the temperature axis at about ${initial} °C. This is an estimated initial temperature, not a measured zero-mass trial.`,
      [
        "Use salt mass / g horizontally and lowest temperature / °C vertically. Read the printed truncated temperature scale; its bottom is not zero.",
        "Plot all six original mass–temperature pairs accurately, retaining each observation separately from the fit.",
        "Choose two line heights that give a balanced straight best-fit line through the scatter. Do not force it through every point or join successive points.",
        `Extend your straight line to mass = 0 g. Read your own y-intercept and compare with your separate estimate. One suitable reference gives approximately ${initial} °C; other balanced fits and matching graph readings are possible.`,
        "Identify the intercept as an extrapolated estimate of initial temperature, not a directly measured zero-mass trial. Keep the extrapolated part distinct from the measured observations.",
      ],
    ),
    fuelDrawing: drawing,
    hint: "Plot each pair on its original scale. Adjust both ends of a straight fit to balance the scatter, then extend its slope to the temperature axis.",
    referenceResponse: `${drawing.data.note} ${drawing.data.limit} At the printed scale one small temperature square represents 0.4 °C; a reading within half a small square of YOUR drawn intercept is consistent with that line. This is a self-review aid, not an automatic graph marking tolerance. Further interpretation: the lower observed temperatures compared with the estimated initial temperature are consistent with an endothermic process taking energy from the surroundings. Temperature alone is not energy in joules.`,
  };
};
practicalJourney.guided.push(
  scatterTask("g-scatter", "Plot the results", "guided"),
);
practicalJourney.refresher.push(
  scatterTask("r-scatter", "Try the graph again", "guided"),
);
practicalJourney.practice.push(
  scatterTask("p-scatter", "Fresh graph data", "transfer"),
);

const all = [
  ...practicalJourney.warmup,
  ...practicalJourney.refresher,
  ...practicalJourney.guided,
  ...practicalJourney.practice,
  ...practicalJourney.checkForms.flat(),
  ...practicalJourney.reviewForms.flat(),
];
// Readings estimated from a plotted scale permit the stated reading precision.
// Questions supplying exact coordinate pairs retain ordinary numerical marking.
for (const q of all) {
  if (q.practicalGraph) q.tolerance = q.unit === "°C/g" ? 0.05 : 0.25;
}
const alias = (ids: string[], key: string) => {
  for (const t of all)
    if (ids.includes(t.id.replace("ep-v1-", "")))
      t.exposureAliases = [
        ...(t.exposureAliases ?? []),
        "energy-practical:" + key,
        ...ids.map((id) => "ep-v1-" + id),
      ];
};
alias(["r-reading"], "legacy-peak-21-29.5");
alias(["r-variables"], "model-plan-mass");
alias(["g-plan", "p-control", "a-control"], "control-acid-conditions");
alias(["g-repeat"], "model-repeat-failed");
alias(["r-mean"], "model-repeat-initial");
alias(["r-gradient"], "model-gradient-initial");
alias(["g-graph"], "model-gradient-decimal");
alias(["r-bias", "p-bias", "b-written"], "repeat-systematic-bias");
alias(["g-evidence", "p-stir"], "stir-representative");
alias(["p-cover"], "legacy-insulation");
alias(["g-fit", "r-fit", "d-b-limit"], "fitted-not-observed");
for (const task of practicalJourney.practice) {
  task.followUp =
    "ep-v1-" +
    (task.id.includes("excess")
      ? "r-limit"
      : task.id.includes("mean") ||
          task.id.includes("failure") ||
          task.id.includes("spread") ||
          task.id.includes("baselines")
        ? "r-mean"
        : task.id.includes("gradient") ||
            task.id.includes("intercept") ||
            task.id.includes("unit") ||
            task.id.includes("axis")
          ? "r-gradient"
          : task.id.includes("rise") || task.id.includes("cooling")
            ? "r-reading"
            : task.id.includes("tie")
              ? "r-fit"
              : task.id.includes("bias") ||
                  task.id.includes("energy") ||
                  task.id.includes("cover") ||
                  task.id.includes("stir")
                ? "r-bias"
                : "r-variables");
}
practicalJourney.guided[0].openingHint = true;
alias(["g-observe"], "model-observe-decimal");
alias(["p-gradient", "p-intercept"], "practice-line-1.2-22.6");
alias(
  [
    "r-variables",
    "g-plan",
    "p-variable",
    "p-control",
    "p-apparatus",
    "p-order",
    "p-plan",
    "a-control",
    "d-a-plan",
  ],
  "plan-model-demand",
);
alias(
  [
    "r-bias",
    "g-evidence",
    "p-cover",
    "p-stir",
    "p-bias",
    "p-energy",
    "p-excess",
    "r-limit",
    "b-volume",
    "b-written",
    "d-b-limit",
    "r-fit",
    "g-fit",
    "p-tie",
  ],
  "practical-evidence-model-demand",
);

// Preserve direct legacy links as well as shared exposure markers.
for (const [oldId, newIds] of [
  ["energy-practical-0", ["p-cover"]],
  ["energy-practical-1", ["g-plan", "p-control", "a-control"]],
  ["energy-practical-2", ["g-evidence", "p-stir"]],
  ["energy-practical-3", ["p-bias"]],
  ["energy-practical-4", ["r-reading"]],
  ["energy-practical-5", ["r-bias", "b-written"]],
] as [string, string[]][]) {
  for (const id of newIds) {
    const q = all.find((q) => q.id === "ep-v1-" + id)!;
    q.exposureAliases = [...(q.exposureAliases ?? []), oldId];
  }
}

all.find((q) => q.id === "ep-v1-p-resolution")!.followUp = "ep-v1-r-quality";
all.find((q) => q.id === "ep-v1-p-risk")!.followUp = "ep-v1-r-risk";
alias(
  ["r-quality", "p-resolution", "p-risk", "g-evidence"],
  "measurement-quality-model-demand",
);

alias(["r-risk", "p-risk", "g-evidence"], "supplied-risk-model-demand");

practicalJourney.practice.at(-1)!.followUp = "ep-v1-r-scatter";
alias(["g-scatter", "r-scatter"], "scatter-original-a");

// Append only after original mappings: existing task indices, graph data and reserved forms stay intact.
practicalJourney.guided.push(energyEquationGuided);
practicalJourney.refresher.push(energyEquationRecovery);
practicalJourney.practice.push(energyEquationPractice);
practicalJourney.outcomes!.push(
  "Interpret y=mx+c as a linear fitted relationship: m is its constant gradient and c is the extrapolated value at x=0.",
);

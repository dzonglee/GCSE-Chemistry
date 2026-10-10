import type { LearningTask, LessonJourney, TaskModel } from "../types";
import type { RatesMode, RateData } from "../../lib/rate-measurement";
import {
  gasData,
  specimenData,
  reactantData,
  lightData,
  anomalousGas,
  acceleratingData,
} from "../../lib/rate-measurement";
import type { RateDrawingData } from "../../components/RateDrawingInput";
type Model = Extract<TaskModel, { kind: "rate-measurement" }>;
type Task = LearningTask;
const model = (
  mode: RatesMode,
  instruction: string,
  record?: string,
): Model => ({ kind: "rate-measurement", mode, instruction, record });
const n = (
  id: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  m?: Model,
): Task => ({
  id: "rr-v1-" + id,
  title,
  purpose: title,
  prompt,
  answer: String(answer),
  unit,
  explanation,
  hint,
  model: m,
  ...(["r-round", "p-minutes", "A-round"].includes(id)
    ? {
        rounding: {
          kind: "decimal-places" as const,
          digits: id === "A-round" ? 3 : 2,
        },
      }
    : {}),
});
function c(
  id: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  m?: Model,
  graph?: RateData,
): Task {
  const choices = [answer, ...Object.keys(errors)],
    offset = [...id].reduce((s, x) => s + x.charCodeAt(0), 0) % choices.length;
  return {
    id: "rr-v1-" + id,
    title,
    purpose: title,
    prompt,
    answer,
    options: [...choices.slice(offset), ...choices.slice(0, offset)],
    misconceptions: errors,
    explanation,
    hint,
    model: m,
    rateGraph: graph,
  };
}
const w = (
  id: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  drawing?: RateDrawingData,
): Task => ({
  id: "rr-v1-" + id,
  title,
  purpose: title,
  prompt,
  answer,
  explanation: answer,
  hint: rubric[0],
  rubric,
  rateDrawing: drawing,
});
const independentGas: RateData = {
  times: [0, 10, 20, 30, 40, 50, 60],
  values: [0, 18, 31, 40, 46, 46, 46],
  quantity: "Gas collected",
  unit: "cm³",
  max: 60,
  step: 10,
  label:
    "Original reserved constructed gas observations; draw your own supported fit.",
};
export const ratesJourney: LessonJourney = {
  version: 1,
  introduction:
    "Choose the actual interval, measure a change and construct a graph that separates observations from a supported fit.",
  scopeNote:
    "Foundation/shared core, working AQA 8462 4.6.1.1 and selected required-practical interpretation. Specification printed 56, actual specimen Foundation Paper 2 Q 09 (QP 23–26/MS 15–16), and actual 2022 Foundation Q 06 (QP 26/28/29/MS 19–20) read; relevant apparatus, tables, graph and paired marking pages visually inspected. Mean rate is quantity of reactant consumed or product formed divided by actual elapsed time, in g/s or cm³/s. Use differences at nonzero start times; positive reactant consumption can correspond to a falling amount-remaining graph. Mixed minutes/seconds are converted before division and final rounding follows the question. A balance reads the entire weighed boundary: only under stated no-evaporation/no-spray conditions can its loss isolate escaped gas. Retaining gas can preserve total balance mass during a reaction; atoms are not destroyed. Plot every original observation, including an anomaly, and draw a separate justified best-fit curve without moving the original point. Actual specimen MS distinguishes plotting, fit, about 2.1 g at 30 s, completion 100 s and 9.85/150 rounded 0.07 g/s. Constructed fit guidance bands are practice scaffolds, not official examiner tolerances. An interval mean differs from the instantaneous rate indicated by a tangent; Foundation tangent construction/qualitative interpretation is included. HT-only numerical tangent gradients and mol/s need separate Higher teaching. A flat cumulative-product graph retains its final amount while its observed change/time is zero; another limiting reactant may be exhausted while some named reactant remains. Falling light percentage is an indirect cloudiness signal, not calibrated chemical mass/volume; interpret its stated link without inventing an amount rate.1/time is only a relative endpoint index under matching endpoint/geometry, with s⁻¹ units, not g/s. Rate and final product amount are distinct; supplied interval comparisons do not establish all-time speed. Control other relevant variables to isolate an effect; preserve actual observations and measurement limits. Actual OpenStax Chemical Reaction Rates section and falling peroxide/tangent figure support change/time, positive consumption and average versus instantaneous interpretation; advanced concentration-rate expressions, kinetic laws and stoichiometric rate factors are outside this Foundation route. Genuine 3D shows macro measurement apparatus/boundaries with supplied balance digits, not a calculated mass or particle inventory. No practical certification or instructions for unsupervised experiments. Independent stimuli are static; marking is deferred to whole-set submission, exposure global, drawn/written responses self-reviewed and delayed retrieval waits actual seven days. Full combined-course/other-board mapping, whole-course Maths parity and exam readiness remain unfinished.",
  outcomes: [
    "Calculate a mean from actual quantity and time changes with stated units.",
    "Interpret an open balance boundary without confusing total mass with escaped gas.",
    "Plot observations and draw a separate supported curve while retaining anomalies.",
    "Distinguish rate at a moment, an interval mean and final amount.",
    "Interpret indirect signals and controlled comparisons within their stated limits.",
  ],
  warmup: [
    n(
      "warm-seconds",
      "Convert mixed time",
      "How many seconds are in 2 minutes 30 seconds?",
      150,
      "s",
      "2×60+30=150s.",
      "Convert whole minutes and add remaining seconds.",
    ),
    n(
      "warm-change",
      "Read a quantity difference",
      "A reading rises from 10 cm³ to 40 cm³. What is the change?",
      30,
      "cm³",
      "40−10=30cm³.",
      "Subtract beginning from end.",
    ),
  ],
  refresher: [
    n(
      "r-quantity",
      "Use the change",
      "Gas collected rises 20→44 cm³. What quantity formed over that interval?",
      24,
      "cm³",
      "44−20=24 cm³, not the whole 44 cm³.",
      "Use both readings.",
    ),
    n(
      "r-time",
      "Use elapsed time",
      "An interval begins at 10 s and ends at 30 s. How long is it?",
      20,
      "s",
      "30−10=20s.",
      "Final clock reading is not automatically elapsed time.",
    ),
    n(
      "r-rate",
      "Divide change by time",
      "24 cm³ product forms over 20 s. What is its mean formation rate?",
      1.2,
      "cm³/s",
      "24/20=1.2cm³/s.",
      "Quantity change divided by elapsed time.",
    ),
    n(
      "r-consumed",
      "Keep consumption positive",
      "Reactant remaining falls 6→2 g over 20 s. What is its positive mean consumption rate?",
      0.2,
      "g/s",
      "(6−2)/20=0.2 g/s; its plotted remaining-mass change is negative.",
      "Use the amount consumed.",
    ),
    c(
      "r-unit",
      "Read the physical unit",
      "Mass consumed in grams is divided by elapsed seconds. What rate unit follows?",
      "g/s",
      {
        "s/g": "That reverses numerator and denominator.",
        "cm³/s": "The measured quantity is mass, not volume.",
      },
      "Grams per second describes mass change/time.",
      "Follow the stated quantity.",
    ),
    n(
      "r-round",
      "Round only the final rate",
      "A different reaction loses 9.85 g in 150 s. Give its mean rate to TWO decimal places.",
      0.07,
      "g/s",
      "9.85/150≈0.06567 g/s; final two-decimal result 0.07 g/s.",
      "Do not round time or numerator first.",
    ),
    n(
      "r-balance",
      "Subtract balance readings",
      "The same flask and contents weigh 98.4 g then 97.8 g. What measured mass is lost?",
      0.6,
      "g",
      "98.4−97.8=0.6 g. The whole reading is not gas mass.",
      "Keep the weighed boundary the same.",
    ),
    c(
      "r-boundary",
      "Explain the boundary",
      "Only CO₂ escapes the stated porous flask. Why can its balance reading fall?",
      "Gas leaves the weighed flask boundary",
      {
        "Atoms disappear in the reaction":
          "Atoms are conserved across the wider system.",
        "The flask automatically becomes lighter material":
          "The same flask remains on the balance.",
      },
      "Produced gas leaves the weighed boundary; it is not destroyed.",
      "Track where material goes.",
    ),
    c(
      "r-plateau",
      "Keep amount and rate distinct",
      "Collected gas stays 50 cm³ during 40–60 s. What is zero?",
      "The observed change per second",
      {
        "The total gas collected": "50 cm³ remains collected.",
        "Every reactant amount":
          "A plateau does not require all reactants to be absent.",
      },
      "The graph is flat: no further net gas is collected over this interval, while 50 cm³ remains.",
      "Rate concerns change.",
    ),
    c(
      "r-slope",
      "Read steepness rather than height",
      "A product curve rises but becomes less steep. What happens to its formation rate?",
      "It decreases while product continues to accumulate",
      {
        "It must increase because the height rises":
          "Height is accumulated amount, not slope.",
        "It is negative because the curve becomes less steep":
          "Product still increases; the positive slope becomes smaller.",
      },
      "A smaller positive slope means slower product formation.",
      "Compare equal-time changes.",
    ),
    c(
      "r-fit",
      "Retain the anomaly",
      "A point is unusual and repeated measurements support the surrounding trend. What should happen?",
      "Retain the original observation and fit the supported pattern",
      {
        "Move the original point onto the curve": "That changes a measurement.",
        "Force the fit through every unusual point":
          "A supported best fit need not pass through an anomaly.",
      },
      "Observations and the fitted curve are separate evidence.",
      "Do not rewrite data.",
    ),
    c(
      "r-tangent",
      "Separate moment and interval",
      "Which construction represents rate at a specified moment?",
      "A tangent to the curve at that moment",
      {
        "Final graph height": "That is an amount/signal.",
        "One chord over the entire experiment":
          "That represents an interval mean.",
      },
      "A tangent follows the curve locally at the requested point.",
      "Instantaneous concerns one moment.",
    ),
    c(
      "r-signal",
      "Do not invent calibration",
      "A light sensor reports percentage light, but no amount calibration is supplied. Can its slope be called g/s?",
      "No: the light signal is not a calibrated chemical mass",
      {
        "Yes: every falling graph is g/s":
          "Units depend on the measured quantity.",
        "Yes: percentage light equals grams by definition":
          "No such conversion is supplied.",
      },
      "The signal can support the stated qualitative interpretation; percentage points/time are not chemical mass/time.",
      "Read both axis labels and the calibration information.",
    ),
    c(
      "r-final",
      "Separate speed from yield",
      "Two experiments have equal final gas amounts but different early slopes. What can differ?",
      "Their rates despite equal final collected amounts",
      {
        "Their final amounts must differ":
          "The question gives equal final amounts.",
        "Nothing can differ": "Equal yield does not fix speed.",
      },
      "Speed and final collected product are distinct.",
      "Compare slope and plateau height separately.",
    ),
    c(
      "r-controls",
      "Isolate an effect",
      "To isolate concentration effects, what should happen to other relevant variables?",
      "Keep them controlled while changing concentration",
      {
        "Change reactant mass as well without accounting for it":
          "Then two effects are confounded.",
        "Treat measured time as a controlled input":
          "Time-to-endpoint is an observed outcome.",
      },
      "Control relevant temperature, amounts/geometry and measurement conditions.",
      "Distinguish varied, controlled and measured variables.",
    ),
    c(
      "r-endpoint",
      "Use an endpoint index carefully",
      "What does 1/time represent when the same disappearance endpoint and geometry are used?",
      "A relative rate index in s⁻¹",
      {
        "A measured chemical rate in g/s": "No gram quantity is supplied.",
        "A universal rate independent of endpoint":
          "Different endpoint criteria can change the comparison.",
      },
      "Under matching endpoint conditions, shorter time means a larger relative index; it is not a calibrated amount rate.",
      "State the required comparison conditions.",
    ),
  ],
  guided: [
    n(
      "g-interval",
      "Choose the interval",
      "Gas rises 20→44 cm³ during 10–30 s. What is the mean rate over that interval?",
      1.2,
      "cm³/s",
      "(44−20)/(30−10)=1.2cm³/s.",
      "Use both differences.",
      model(
        "interval",
        "Predict quantity changed, actual elapsed time, mean, quantity role and unit independently.",
      ),
    ),
    n(
      "g-mass",
      "Read the balance",
      "Only CO₂ escapes the same porous flask:182.4 g at 0 s,178.4 g at 100 s. What mean escaped-gas rate is inferred?",
      0.04,
      "g/s",
      "(182.4−178.4)/100=0.04 g/s under the stated no-evaporation/no-spray conditions.",
      "Do not divide the total flask reading.",
      model(
        "mass",
        "Interpret the same weighed boundary, actual loss and the conditions for attributing it to gas.",
      ),
    ),
    c(
      "g-plot",
      "Plot and fit",
      "Which original observation must stay plotted even when the supported specimen fit does not pass through it?",
      "60 s / 2.9 g",
      {
        "60 s / 3.25 g":
          "That is constructed curve guidance, not the original observation.",
        "Delete the 60 s observation": "The original remains evidence.",
      },
      "The observed 60 s value is 2.9 g. The separate supported curve must not rewrite it.",
      "Separate observed points from curve knots.",
      model(
        "plot",
        "Plot all original values and independently draw the separate supported curve; use the labelled practice guidance bands.",
      ),
    ),
    c(
      "g-trend",
      "Read the changing slope",
      "The supplied collected-gas graph rises then becomes flat. Which interpretation follows?",
      "Formation slows, then no further net gas is collected",
      {
        "The gas amount becomes zero": "The nonzero plateau remains.",
        "Rate must increase as graph height rises":
          "Height is accumulated amount.",
      },
      "Its equal-time gains decrease, then are zero; final amount and rate are distinct.",
      "Read slope, not only height.",
      model(
        "trend",
        "Classify signal direction, rate trend, equal-time intervals and what the endpoint supports.",
      ),
    ),
    c(
      "g-compare",
      "Compare two claims",
      "A changes 20 cm³ in 10 s; B changes 20 cm³ in 20 s. Both finally collect 50 cm³. Which comparison is supported?",
      "A has the larger stated interval mean; final amounts are equal",
      {
        "A must have more final gas": "Both final amounts are given 50 cm³.",
        "Both interval means are equal": "2 cm³/s differs from 1 cm³/s.",
      },
      "A 20/10=2; B 20/20=1 cm³/s. This says nothing about which is faster at every instant.",
      "Calculate the means and compare final amounts separately.",
      model(
        "compare",
        "Predict both interval rates and the separate final-product claim.",
      ),
    ),
    c(
      "g-evidence",
      "Explain a falling balance",
      "Which explanation respects conservation for the stated open gas-producing flask?",
      "Produced gas leaves the weighed boundary",
      {
        "Atoms are destroyed": "Atoms are conserved across the wider boundary.",
        "All products must leave": "Retained products may remain in the flask.",
      },
      "A balance measures what remains within its weighed boundary.",
      "Track material, not only a reading.",
      model("evidence", "Choose the supported measurement claim and reason."),
    ),
  ],
  practice: [
    n(
      "p-whole",
      "Use a zero start",
      "Gas rises 0→50 cm³ during 0–40 s. What is the whole stated-interval mean?",
      1.25,
      "cm³/s",
      "50/40=1.25 cm³/s; zero start permits using final amount here.",
      "Still identify both endpoints.",
      model(
        "interval",
        "Use the whole stated interval without confusing its mean with instantaneous slope.",
        "whole",
      ),
    ),
    n(
      "p-late",
      "Use a later interval",
      "Gas rises 44→50 cm³ during 30–40 s. What is that interval mean?",
      0.6,
      "cm³/s",
      "6/10=0.6 cm³/s, not 50/40.",
      "Subtract both raw readings.",
      model("interval", "Retain the later interval endpoints.", "late"),
    ),
    n(
      "p-stopped",
      "Use a nonzero plateau",
      "Gas stays 50 cm³ during 40–60 s. What is its observed mean formation rate?",
      0,
      "cm³/s",
      "(50−50)/(60−40)=0 cm³/s;50 cm³ remains collected.",
      "A rate uses change.",
      model(
        "interval",
        "Predict zero interval change without erasing the final gas amount.",
        "stopped",
      ),
    ),
    n(
      "p-consumption",
      "Use reactant consumed",
      "Reactant remaining falls 6→2 g during 10–30 s. What is its positive mean consumption rate?",
      0.2,
      "g/s",
      "(6−2)/(30−10)=0.2g/s.",
      "Consumption is a positive amount used.",
      model(
        "interval",
        "Separate the negative plotted change from positive consumption.",
        "consumption",
      ),
    ),
    n(
      "p-minutes",
      "Convert then round",
      "A reaction loses 9.85 g in 2 minutes 30 seconds. Give its mean rate to TWO decimal places.",
      0.07,
      "g/s",
      "Elapsed 150 s;9.85/150≈0.06567, rounded 0.07 g/s.",
      "Convert mixed time before division.",
      model(
        "interval",
        "Use the actual 150 s and final requested rounding.",
        "minutes",
      ),
    ),
    n(
      "p-offset",
      "Use mixed clock readings",
      "Gas is 12 cm³ at 1min 20 s and 42 cm³ at 2min 20 s. What is the mean over that sampled interval?",
      0.5,
      "cm³/s",
      "Change 30 cm³; elapsed 140−80=60 s;30/60=0.5 cm³/s.",
      "Neither clock reading alone is elapsed time.",
      model(
        "interval",
        "Keep the nonzero beginning clock and quantity.",
        "offset",
      ),
    ),
    n(
      "p-mass-later",
      "Use later balance readings",
      "Only CO₂ escapes the same porous flask:180.8 g at 20 s,178.7 g at 80 s. What mean escaped-gas rate follows?",
      0.035,
      "g/s",
      "(180.8−178.7)/(80−20)=2.1/60=0.035g/s.",
      "Subtract total readings, then divide their elapsed interval.",
      model("mass", "Use the later same-boundary interval.", "later"),
    ),
    n(
      "p-sealed",
      "Report the actual observed loss",
      "The specified closed reacting system reads 182.4 g at 0 s and 100 s. What is its observed balance-loss rate?",
      0,
      "g/s",
      "The observed total loss/time is zero. It does not establish zero chemical reaction rate when gas is retained.",
      "Keep observed loss separate from chemical rate.",
      model(
        "mass",
        "Retain the closed boundary and distinguish what the balance can establish.",
        "sealed",
      ),
    ),
    n(
      "p-evaporation",
      "Keep mixed loss qualified",
      "An open flask loses 0.6 g in 60 s, with both gas escape and solvent evaporation possible. What is the observed balance-loss rate?",
      0.01,
      "g/s",
      "0.6/60=0.01 g/s observed total loss; it cannot isolate chemical gas production.",
      "Calculate the observation, then qualify its interpretation.",
      model(
        "mass",
        "Do not attribute all observed loss to reaction gas.",
        "evaporation",
      ),
    ),
    n(
      "p-spray",
      "Account for spray",
      "Gas and liquid spray escape a flask which loses 0.5 g over 50 s. What is the observed balance-loss rate?",
      0.01,
      "g/s",
      "0.5/50=0.01 g/s observed total loss; droplets prevent isolating gas mass from this reading alone.",
      "Keep the measurement boundary honest.",
      model("mass", "Identify the mixed-loss mechanism.", "spray"),
    ),
    n(
      "p-total",
      "Exclude total apparatus mass",
      "Only CO₂ escapes the same porous flask:95.6→94.7 g during 0–30 s. The flask itself is 60 g. What mean escaped-gas rate follows?",
      0.03,
      "g/s",
      "The relevant change is 0.9 g;0.9/30=0.03 g/s. Neither 60 g nor 95.6 g is the escaped-gas numerator.",
      "The fixed flask cancels from the difference.",
      model(
        "mass",
        "Do not divide the flask or whole reading by time.",
        "total",
      ),
    ),
    {
      ...c(
        "p-plot-clean",
        "Keep the gas plateau",
        "The supplied gas observations reach 50 cm³ at 40 s and stay there. How should a supported fit end?",
        "At a nonzero flat 50 cm³ plateau",
        {
          "At 0 cm³ because reaction stops":
            "Reaction stopping does not remove collected product.",
          "Increasing indefinitely after 40 s":
            "That disagrees with the supplied later observations.",
        },
        "Keep the 50 cm³ plateau while observed further formation is zero.",
        "Read the later observations.",
        model(
          "plot",
          "Plot every observation and draw the separate supported gas curve.",
          "clean",
        ),
      ),
      rateTable: gasData,
    },
    {
      ...c(
        "p-plot-reactant",
        "Retain residual reactant",
        "The supplied remaining-reactant observations end at 1 g because another limiting reactant is exhausted. How should the supported fit end?",
        "At a flat 1 g residual",
        {
          "At zero because every reactant must be gone":
            "The stated named reactant remains.",
          "At a rising 6 g final value":
            "That contradicts the measured decrease.",
        },
        "A limiting reactant can stop further reaction while another named reactant remains.",
        "Keep the observed remaining quantity.",
        model(
          "plot",
          "Plot the falling observations and retain their nonzero residual.",
          "reactant",
        ),
      ),
      rateTable: reactantData,
    },
    {
      ...c(
        "p-plot-light",
        "Use the actual signal axis",
        "What unit belongs on the vertical axis for these supplied light-sensor observations?",
        "Percentage light reaching the sensor",
        {
          "Grams of reactant consumed": "No mass calibration is supplied.",
          "Cubic centimetres of gas collected":
            "The measured signal is light percentage.",
        },
        "The y-axis names the actual measured signal; its numerical values are not gas or reactant amounts.",
        "Do not relabel observations as a different quantity.",
        model(
          "plot",
          "Plot and fit the indirect signal without inventing amount calibration.",
          "light",
        ),
      ),
      rateTable: lightData,
    },
    {
      ...c(
        "p-plot-anomaly",
        "Retain the unusual point",
        "The original 30 s gas observation is 60 cm³, while repeats give 44/45/46 cm³. Which separation is justified?",
        "Plot 60 cm³ as observed; draw the supported fit near 45 cm³",
        {
          "Change the original observation to 45 cm³":
            "That rewrites an observation.",
          "Force the supported curve through 60 cm³":
            "That ignores repeat evidence and surrounding trend.",
        },
        "Keep the original observation and separately justify the best fit from repeated/supporting data.",
        "A fit is not a replacement measurement.",
        model(
          "plot",
          "Preserve the unusual original point and separately edit the supported curve.",
          "anomaly",
        ),
      ),
      rateTable: anomalousGas,
    },
    c(
      "p-trend-reactant",
      "Interpret a falling reactant graph",
      "The supplied remaining-reactant graph falls then flattens at 1 g. What happens to the positive consumption rate?",
      "It slows, then is zero under the stated stopped-reaction conditions",
      {
        "It is negative throughout because the amount falls":
          "Consumed amount/time is conventionally positive.",
        "It increases because 1 g remains":
          "Remaining amount is not its consumption rate.",
      },
      "The magnitude of the falling slope decreases and the curve eventually becomes flat; residual amount remains.",
      "Distinguish remaining quantity and consumption.",
      model(
        "trend",
        "Classify the falling remaining-reactant case.",
        "reactant",
      ),
      reactantData,
    ),
    c(
      "p-trend-light",
      "Interpret the cloudiness signal",
      "Under the stated cloudiness link, the supplied light curve becomes less steep during 40–60 s. What happens to the reaction rate?",
      "It decreases",
      {
        "It must increase because light falls":
          "The magnitude of the signal slope becomes smaller.",
        "It was already zero at 40 s":
          "The supplied signal still changes through 40–60 s.",
      },
      "The actual 2022 paired question/mark scheme identify decreasing rate; the signal falls while becoming less steep.",
      "Use the stated signal link and changing steepness.",
      model(
        "trend",
        "Keep the indirect signal distinct from calibrated amount.",
        "light",
      ),
      lightData,
    ),
    c(
      "p-accelerating",
      "Recognise increasing rate",
      "Which stated equal-time interval has the greatest mean product formation in the exact constructed graph?",
      "The latest interval",
      {
        "The earliest interval": "Its increase is the smallest.",
        "Every interval is equal": "The interval increases grow.",
      },
      "Over equal 10 s intervals, successive amount changes 2,4,6,8,10,12 cm³ grow.",
      "Compare changes over equal durations.",
      model(
        "trend",
        "Do not force every reaction graph to slow down.",
        "accelerating",
      ),
      acceleratingData,
    ),
    n(
      "p-uniform",
      "Read constant interval gains",
      "The exact graph adds 5 cm³ every 10 s throughout the shown interval. What is its mean rate over any one of those intervals?",
      0.5,
      "cm³/s",
      "5/10=0.5 cm³/s throughout the stated constructed interval; no completion plateau is shown.",
      "Equal gains in equal times give equal means.",
      model(
        "trend",
        "Distinguish constant nonzero slope from a flat graph.",
        "uniform",
      ),
    ),
    n(
      "p-trend-plateau",
      "Keep plateau height separate",
      "The supplied gas plateau remains 50 cm³ throughout 40–60 s. What is the observed mean formation rate over that interval?",
      0,
      "cm³/s",
      "Zero quantity change over 20 s gives 0 cm³/s; the height remains 50 cm³.",
      "Slope and height answer different questions.",
      model(
        "trend",
        "Classify the already-flat graph without erasing its amount.",
        "plateau",
      ),
    ),
    c(
      "p-final-yield",
      "Do not substitute yield for rate",
      "A gives 20 cm³/10 s and finally 30 cm³; B gives 15 cm³/10 s and finally 60 cm³. Which final-product claim is true?",
      "B finally collects more product, despite the smaller stated interval mean",
      {
        "A must collect more because its interval mean is larger":
          "A finally has 30 cm³ versus B 60 cm³.",
        "Final amounts are equal": "The supplied plateaus differ.",
      },
      "A mean 2, B mean 1.5 cm³/s; B final 60 versus A 30 cm³. Final amount and rate remain separate.",
      "Compare the two supplied claims.",
      model(
        "compare",
        "Keep faster interval and larger final yield distinct.",
        "yield",
      ),
    ),
    n(
      "p-equal-rates",
      "Compare different raw amounts",
      "A changes 30 cm³ in 15 s; B changes 40 cm³ in 20 s. What is B’s stated interval mean?",
      2,
      "cm³/s",
      "40/20=2 cm³/s, equal to A 30/15.",
      "Amount alone does not determine rate.",
      model(
        "compare",
        "Keep equal means despite different amounts and durations.",
        "equal",
      ),
    ),
    n(
      "p-different-intervals",
      "Use each experiment’s denominator",
      "A changes 24 cm³ in 12 s; B changes 36 cm³ in 6 s. What is B’s interval mean?",
      6,
      "cm³/s",
      "36/6=6 cm³/s; A 24/12=2 cm³/s.",
      "Use each actual elapsed duration.",
      model(
        "compare",
        "Do not compare raw changes or times alone.",
        "different",
      ),
    ),
    n(
      "p-reversed-yield",
      "Read the faster smaller-yield case",
      "A changes 30 cm³ in 30 s, final 80 cm³; B changes 20 cm³ in 5 s, final 50 cm³. What is B’s interval mean?",
      4,
      "cm³/s",
      "20/5=4 cm³/s; B is faster over its stated interval but A finally has more gas.",
      "Compare interval rates separately from final amounts.",
      model(
        "compare",
        "Retain the opposite rate and yield rankings.",
        "reversal",
      ),
    ),
    c(
      "p-sensor-calibration",
      "State what is missing",
      "A light percentage falls, but no chemical amount calibration is supplied. Which numerical inference is justified?",
      "Do not report a calibrated g/s or cm³/s chemical rate",
      {
        "Subtract light percentages and call the result grams":
          "No conversion to grams is supplied.",
        "Treat 24 % light as 24 cm³ gas":
          "No conversion to gas volume is supplied.",
      },
      "The signal has its own quantity/units; a chemical amount-rate conversion requires calibration and a justified relation.",
      "Do not invent an amount.",
      model("evidence", "Judge the missing calibration explicitly.", "sensor"),
    ),
    c(
      "p-endpoint-index",
      "Compare a matched endpoint",
      "With the same disappearance endpoint and geometry, experiment A takes 30 s and B 60 s. What relative 1/time comparison follows?",
      "A has twice B’s relative index; the index has s⁻¹ units",
      {
        "A has half B’s relative index": "1/30 is twice 1/60.",
        "A’s measured mass rate is 2 g/s": "No gram quantity is supplied.",
      },
      "The matched relative endpoint index is inversely proportional to time; it is not a calibrated chemical mass rate.",
      "State both the ratio and the unit limit.",
      model(
        "evidence",
        "Keep the matched endpoint and inverse-time interpretation.",
        "endpoint",
      ),
    ),
    c(
      "p-repeat-evidence",
      "Justify a fit without deleting data",
      "Original 30 s reading 60 cm³ conflicts with repeats 44/45/46 cm³ and the surrounding smooth trend. What is defensible?",
      "Retain the original and justify the fit using supporting repeats",
      {
        "Erase the 60 cm³ observation": "That destroys part of the evidence.",
        "Assume every unusual point is always invalid":
          "A conclusion needs relevant evidence.",
      },
      "The repeat evidence supports a separate fit; the original remains recorded.",
      "Distinguish a supported judgement from silent correction.",
      model(
        "evidence",
        "Retain observations and explain the support for a fit.",
        "anomaly",
      ),
    ),
    c(
      "p-controls",
      "Recognise confounding",
      "An experiment changes both reactant mass and acid concentration. Can it alone isolate the effect of concentration?",
      "No: two changes confound the claimed isolated effect",
      {
        "Yes: ignore reactant mass":
          "Amount/geometry can affect the observed course.",
        "Yes: every experiment is automatically a fair comparison":
          "Other relevant conditions need control.",
      },
      "Change one intended variable and control other relevant conditions to isolate its effect.",
      "Identify what changed and what was measured.",
      model(
        "evidence",
        "Do not turn an unmatched comparison into causal proof.",
        "controls",
      ),
    ),
    c(
      "p-retained-products",
      "Interpret a closed boundary",
      "A specified closed reacting system retains products and its total balance reading stays constant. What follows?",
      "Constant total mass does not prove no reaction",
      {
        "All atoms were destroyed and replaced": "Atoms remain conserved.",
        "A reaction always requires the balance reading to fall":
          "Retained products can preserve the weighed total.",
      },
      "Reaction changes substances; if all matter stays within the weighed boundary, total mass remains conserved.",
      "Separate chemical identity and total boundary mass.",
      model(
        "evidence",
        "Keep the retained-products conservation argument.",
        "sealed",
      ),
    ),
    w(
      "p-explain-interval",
      "Explain the wrong denominator",
      "Explain why 44 cm³/30 s is not the mean formation rate for gas rising 20→44 cm³ during 10–30 s. Distinguish that interval mean from rate at one moment.",
      "The interval product change is 44−20=24 cm³, while elapsed time is 30−10=20 s. Mean 24/20=1.2 cm³/s.44/30 uses product formed before the specified beginning and an inappropriate full clock duration. Rate at one moment is represented by the local tangent, not this finite-interval mean.",
      [
        "Use both raw quantity and time endpoints.",
        "Explain interval mean versus tangent at a moment.",
      ],
    ),
    w(
      "p-explain-boundary",
      "Explain a useful mass-loss measurement",
      "Explain how a porous flask on a balance can measure escaped-gas formation over time, and why the whole balance reading, liquid spray and evaporation must be considered.",
      "The same weighed flask/contents is measured at both times; subtracting readings cancels its fixed mass and gives matter leaving that boundary. Under no-evaporation/no-spray conditions, the loss tracks escaping gas. Porous cotton wool permits gas escape while helping retain droplets. Liquid loss or evaporation would mix contributions, and a sealing boundary could retain produced gas. Divide the appropriate loss by actual elapsed time; atoms are conserved across the wider system.",
      [
        "Identify the same weighed boundary and actual loss.",
        "Qualify gas attribution using closure, spray/evaporation and controls.",
      ],
    ),
    w(
      "p-explain-signal",
      "Explain an indirect signal",
      "Explain what a falling light-percentage curve can show about the stated clouding reaction and what is needed before reporting a calibrated chemical amount rate. Include the limit of a 1/time endpoint index.",
      "With the stated link between cloudiness and light transmission, a falling curve which becomes less steep supports slowing signal change/reaction in the given investigation. Percentage light is not grams or gas volume; calibrated chemical amount and a justified relation are needed for g/s or cm³/s. A matched disappearance endpoint can give a relative 1/time index in s⁻¹, but it is not a measured chemical mass rate and requires the same endpoint/geometry.",
      [
        "Interpret the stated signal relation without relabelling its units.",
        "Explain calibration and the matched endpoint-index limit.",
      ],
    ),
    w(
      "p-draw-fit",
      "Construct the actual specimen plot",
      "Plot every supplied specimen observation, including 60 s/2.9 g, and construct a separate justified best-fit curve. Retain the anomaly rather than rewriting it.",
      "Plot all original coordinates from the supplied table. Draw a smooth supported rise towards 4 g and a flat final region; do not bend the fit towards the unusual 60 s/2.9 g point or erase it. The specimen reference reads about 2.1 g at 30 s and completion near 100 s; appropriate readings depend on your justified fit.",
      [
        "Check actual time/quantity coordinates, axis labels and retained anomaly.",
        "Compare a smooth supported fit and plateau; keep curve and observations distinct.",
      ],
      { kind: "plot-fit", data: specimenData },
    ),
    w(
      "p-draw-tangent",
      "Construct a tangent",
      "Construct a tangent at 20 s on the supplied gas curve. It should touch the curve there and follow its local direction; no numerical tangent gradient is requested.",
      "A suitable straight line touches the curve at 20 s/34 cm³ and follows the local direction on both sides. It is not a chord joining distant observations or a vertical/horizontal amount marker. Compare your line with the local curve near that contact; no examiner mark is awarded.",
      [
        "Check contact at the specified 20 s/34 cm³ point.",
        "Check a straight locally matching tangent rather than a whole-interval chord.",
      ],
      { kind: "tangent", data: gasData, atTime: 20 },
    ),
  ],
  checkForms: [
    [
      n(
        "A-interval",
        "Transfer the interval",
        "Gas rises 12→48 cm³ during 20–40 s. What is the mean over that interval?",
        1.8,
        "cm³/s",
        "36/20=1.8cm³/s.",
        "Use both differences.",
      ),
      n(
        "A-round",
        "Transfer time and rounding",
        "A different reaction loses 7.26 g in 3 minutes 10 seconds. Give its mean rate to THREE decimal places.",
        0.038,
        "g/s",
        "Elapsed 190 s;7.26/190≈0.03821, rounded 0.038 g/s.",
        "Convert mixed time and round the final result.",
      ),
      c(
        "A-compare",
        "Transfer rate and yield",
        "A changes 18 cm³ in 6 s and finally 24 cm³; B changes 18 cm³ in 12 s and finally 48 cm³. Which pair of claims is supported?",
        "A has the larger stated interval mean; B has more final product",
        {
          "A has both the larger mean and final amount":
            "B’s final 48 cm³ exceeds A 24 cm³.",
          "B has both the larger mean and final amount":
            "A 18/6 exceeds B 18/12.",
        },
        "A mean 3, B 1.5 cm³/s; B has the larger final amount.",
        "Compare independent claims.",
      ),
      c(
        "A-signal",
        "Transfer a calibration limit",
        "A sensor reports percentage light decreasing from 90 % to 30 %, with no amount calibration. Which inference is justified?",
        "Do not convert this directly into a calibrated chemical g/s rate",
        {
          "It proves 60 g reactant was consumed":
            "No percentage-to-gram conversion is supplied.",
          "It proves 30 cm³ gas formed":
            "No percentage-to-gas conversion is supplied.",
        },
        "The recorded signal has its own unit and requires calibration for chemical amount conversion.",
        "Read the measurement actually supplied.",
      ),
      w(
        "A-draw",
        "Reserved graph construction",
        "Plot the supplied original gas observations and construct a separate smooth supported best-fit curve. Keep the final nonzero plateau.",
        "Plot all supplied time/gas pairs accurately. A smooth supported curve rises while its slope generally decreases, reaches 46 cm³ near 40 s, then stays flat through 60 s. Keep observations distinct from the fitted curve and retain the actual axis labels/units. This construction is self-reviewed, without examiner marks.",
        [
          "Compare each actual plotted coordinate with the supplied table.",
          "Review the smooth supported curve and nonzero plateau; do not treat height as rate.",
        ],
        { kind: "plot-fit", data: independentGas },
      ),
    ],
    [
      n(
        "B-consumption",
        "Reserved remaining-mass interval",
        "Reactant remaining falls 8→3 g during 20–70 s. What is its positive mean consumption rate?",
        0.1,
        "g/s",
        "(8−3)/(70−20)=5/50=0.1g/s.",
        "Use consumed quantity and actual elapsed interval.",
      ),
      n(
        "B-plateau",
        "Reserved nonzero plateau",
        "Collected gas remains 62 cm³ during 80–120 s. What is the observed mean formation rate?",
        0,
        "cm³/s",
        "Zero change over 40 s gives 0 cm³/s;62 cm³ remains collected.",
        "A flat graph has zero change/time.",
      ),
      {
        ...n(
          "B-graph",
          "Read a reserved interval",
          "Use the supplied collected-gas graph. What is the mean formation rate during 10–20 s?",
          1.3,
          "cm³/s",
          "(31−18)/(20−10)=13/10=1.3cm³/s.",
          "Read both coordinates.",
        ),
        rateGraph: independentGas,
      },
      c(
        "B-fit",
        "Transfer retained evidence",
        "An original unusual observation disagrees with repeats and the surrounding supported pattern. Which action is justified?",
        "Retain the original and draw a separately justified fit",
        {
          "Move the original onto the fit": "That changes the measurement.",
          "Every unusual observation must automatically be discarded":
            "Evidence and stated measurement limits are needed.",
        },
        "The record and supported fit remain distinct.",
        "Explain the role of supporting evidence.",
      ),
      w(
        "B-explain",
        "Reserved boundary explanation",
        "Explain why a falling total flask balance reading can track escaped gas only under qualified conditions, and why a constant closed-system reading does not prove no reaction.",
        "Subtract readings of the same weighed flask/contents; the fixed flask mass cancels. Only when gas escape is the sole relevant loss does balance loss isolate gas mass. Spray or evaporation mixes contributions; retained gas/products can keep the closed weighed total constant during a reaction. Divide the justified gas loss by actual elapsed time and preserve conservation across the wider boundary.",
        [
          "Identify total weighed boundary, actual change and elapsed interval.",
          "Qualify gas attribution and explain retained-products conservation.",
        ],
      ),
    ],
  ],
  reviewForms: [
    [
      n(
        "R-interval",
        "Retrieve a nonzero-start mean",
        "Gas rises 12→48 cm³ during 20–80 s. What is the mean over that interval?",
        0.6,
        "cm³/s",
        "36/60=0.6cm³/s.",
        "Use both endpoint differences.",
      ),
      c(
        "R-compare",
        "Retrieve matched means",
        "A changes 21 cm³ in 7 s; B changes 30 cm³ in 10 s. Both finish with 60 cm³. Which comparison follows?",
        "Equal stated interval means and equal final amounts",
        {
          "A is slower because 21 is smaller than 30": "21/7 equals 30/10.",
          "B must have more final gas": "The final amounts are stated equal.",
        },
        "Both means 3 cm³/s; both final 60 cm³.",
        "Calculate each interval mean.",
      ),
      w(
        "R-tangent",
        "Retrieve moment-versus-interval reasoning",
        "Explain how a tangent at a specified moment differs from the chord/mean over an entire interval. Explain why neither is the final graph height.",
        "A tangent follows the curve locally at the requested time and represents instantaneous rate there. A chord slope uses the quantity change and elapsed time across a finite interval, giving its mean. Graph height is an accumulated amount or measured signal. Different intervals/moments can have different rates even when the final amount is the same.",
        [
          "Distinguish local tangent and finite-interval mean.",
          "Distinguish both rates from graph height/final amount.",
        ],
      ),
    ],
    [
      n(
        "S-time",
        "Retrieve mixed clock endpoints",
        "Gas rises 8→38 cm³ from 1min 30 s to 2min 30 s. What is the sampled interval mean?",
        0.5,
        "cm³/s",
        "Elapsed 150−90=60 s; change 30 cm³; mean 0.5 cm³/s.",
        "Convert both clock readings, then subtract.",
      ),
      c(
        "S-signal",
        "Retrieve the indirect-signal limit",
        "Under the stated cloudiness link a falling light signal becomes less steep, then stays 24 %. What follows?",
        "Signal change slows then stops;24 % is not calibrated gas volume",
        {
          "A zero reaction rate means no light can remain":
            "A nonzero plateau can remain.",
          "24 % light automatically means 24 cm³ gas":
            "No such calibration is supplied.",
        },
        "The observed signal change and its retained level are distinct; amount conversion needs calibration.",
        "Keep signal unit, slope and level separate.",
      ),
      w(
        "S-fit",
        "Retrieve justified plotting and fitting",
        "Explain how to plot an unusual original point, use repeats to justify a separate fit, and report what an indirect signal can establish.",
        "Keep the original measurement at its actual coordinates; do not change it to improve the curve. Relevant repeats and the surrounding pattern can justify a separate supported fit which need not pass through that point. Preserve stated uncertainty and conditions. An indirect signal supports only its justified interpretation; reporting chemical amount/time needs calibration and actual units.",
        [
          "Retain the original and justify a separate supported fit using evidence.",
          "State calibration, units and measurement limits.",
        ],
      ),
    ],
  ],
};
const recovery: Record<string, string> = {
  "p-whole": "r-rate",
  "p-late": "r-time",
  "p-stopped": "r-plateau",
  "p-consumption": "r-consumed",
  "p-minutes": "r-round",
  "p-offset": "r-time",
  "p-mass-later": "r-balance",
  "p-sealed": "r-boundary",
  "p-evaporation": "r-boundary",
  "p-spray": "r-boundary",
  "p-total": "r-balance",
  "p-plot-clean": "r-plateau",
  "p-plot-reactant": "r-consumed",
  "p-plot-light": "r-signal",
  "p-plot-anomaly": "r-fit",
  "p-trend-reactant": "r-consumed",
  "p-trend-light": "r-signal",
  "p-accelerating": "r-slope",
  "p-uniform": "r-slope",
  "p-trend-plateau": "r-plateau",
  "p-final-yield": "r-final",
  "p-equal-rates": "r-rate",
  "p-different-intervals": "r-rate",
  "p-reversed-yield": "r-final",
  "p-sensor-calibration": "r-signal",
  "p-endpoint-index": "r-endpoint",
  "p-repeat-evidence": "r-fit",
  "p-controls": "r-controls",
  "p-retained-products": "r-boundary",
  "p-explain-interval": "r-time",
  "p-explain-boundary": "r-boundary",
  "p-explain-signal": "r-signal",
  "p-draw-fit": "r-fit",
  "p-draw-tangent": "r-tangent",
};
for (const q of ratesJourney.practice)
  q.followUp = "rr-v1-" + recovery[q.id.slice(6)];
const all: Task[] = [
  ...ratesJourney.warmup,
  ...ratesJourney.refresher,
  ...ratesJourney.guided,
  ...ratesJourney.practice,
  ...ratesJourney.checkForms.flat(),
  ...ratesJourney.reviewForms.flat(),
];
const families: Record<string, string[]> = {
  interval: [
    "warm-seconds",
    "warm-change",
    "r-quantity",
    "r-time",
    "r-rate",
    "r-consumed",
    "r-unit",
    "r-round",
    "g-interval",
    "p-whole",
    "p-late",
    "p-stopped",
    "p-consumption",
    "p-minutes",
    "p-offset",
    "p-explain-interval",
    "A-interval",
    "A-round",
    "B-consumption",
    "B-plateau",
    "R-interval",
    "S-time",
  ],
  mass: [
    "r-balance",
    "r-boundary",
    "g-mass",
    "g-evidence",
    "p-mass-later",
    "p-sealed",
    "p-evaporation",
    "p-spray",
    "p-total",
    "p-retained-products",
    "p-explain-boundary",
    "B-explain",
  ],
  plot: [
    "r-fit",
    "g-plot",
    "p-plot-clean",
    "p-plot-reactant",
    "p-plot-light",
    "p-plot-anomaly",
    "p-repeat-evidence",
    "p-draw-fit",
    "A-draw",
    "B-graph",
    "B-fit",
    "S-fit",
  ],
  trend: [
    "r-plateau",
    "r-slope",
    "r-tangent",
    "g-trend",
    "p-trend-reactant",
    "p-trend-light",
    "p-accelerating",
    "p-uniform",
    "p-trend-plateau",
    "p-draw-tangent",
    "B-plateau",
    "R-tangent",
  ],
  compare: [
    "r-final",
    "g-compare",
    "p-final-yield",
    "p-equal-rates",
    "p-different-intervals",
    "p-reversed-yield",
    "A-compare",
    "R-compare",
  ],
  evidence: [
    "r-boundary",
    "r-fit",
    "r-signal",
    "r-controls",
    "r-endpoint",
    "g-evidence",
    "p-sensor-calibration",
    "p-endpoint-index",
    "p-repeat-evidence",
    "p-controls",
    "p-retained-products",
    "p-explain-signal",
    "A-signal",
    "B-fit",
    "B-explain",
    "S-signal",
    "S-fit",
  ],
};
for (const ids of Object.values(families)) {
  const full = ids.map((id) => "rr-v1-" + id);
  for (const q of all)
    if (full.includes(q.id))
      q.exposureAliases = [
        ...new Set([
          ...(q.exposureAliases ?? []),
          ...full.filter((id) => id !== q.id),
        ]),
      ];
}
const exposures: Record<RatesMode, string[]> = {
  interval: families.interval,
  mass: families.mass,
  plot: [...families.plot, ...families.trend],
  trend: [...families.trend, ...families.evidence],
  compare: families.compare,
  evidence: [...families.evidence, ...families.mass],
};
for (const q of all)
  if (q.model?.kind === "rate-measurement")
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...exposures[q.model.mode]
          .map((id) => "rr-v1-" + id)
          .filter((id) => id !== q.id),
      ]),
    ];

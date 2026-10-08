import type { LearningTask, LessonJourney } from "../types";
import { greenhouseRecords, type GreenhouseGiven } from "../../lib/greenhouse";
const id = (s: string) => "greenhouse-v1-" + s;
function choice(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  errors: Record<string, string>,
  explanation: string,
  hint: string,
  record?: string,
  given?: GreenhouseGiven,
): LearningTask {
  const options = [answer, ...Object.keys(errors)],
    n = [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % options.length;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    options: [...options.slice(n), ...options.slice(0, n)],
    misconceptions: errors,
    explanation,
    hint,
    ...(record
      ? {
          model: {
            kind: "greenhouse-investigation" as const,
            mode: greenhouseRecords[record].mode,
            record,
          },
        }
      : {}),
    ...(given ? { greenhouseGiven: given } : {}),
  };
}
function numeric(
  s: string,
  title: string,
  prompt: string,
  answer: number,
  unit: string,
  explanation: string,
  hint: string,
  given?: GreenhouseGiven,
  record?: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer: String(answer),
    inputMode: "decimal",
    tolerance: 0.000001,
    unit,
    explanation,
    hint,
    ...(given ? { greenhouseGiven: given } : {}),
    ...(record
      ? {
          model: {
            kind: "greenhouse-investigation" as const,
            mode: greenhouseRecords[record].mode,
            record,
          },
        }
      : {}),
  };
}
function written(
  s: string,
  title: string,
  prompt: string,
  answer: string,
  rubric: string[],
  hint: string,
): LearningTask {
  return {
    id: id(s),
    title,
    purpose: title,
    prompt,
    answer,
    explanation: answer,
    rubric,
    hint,
  };
}
function ledger(
  s: string,
  title: string,
  incoming: number,
  reflected: number,
  escaping: number,
): LearningTask {
  const absorbed = incoming - reflected,
    net = absorbed - escaping;
  return {
    id: id(s),
    title,
    purpose: title,
    prompt:
      "Find absorbed solar energy and signed net energy gain.",
    answer: JSON.stringify({ absorbed: String(absorbed), net: String(net) }),
    partLegend: "Construct the energy ledger",
    parts: [
      {
        id: "absorbed",
        label: "Absorbed solar energy / units",
        inputMode: "decimal",
        answer: absorbed,
      },
      {
        id: "net",
        label: "Net energy gain / units",
        inputMode: "decimal",
        answer: net,
      },
    ],
    explanation: `${incoming}−${reflected}=${absorbed} absorbed; ${absorbed}−${escaping}=${net} net units. ${net > 0 ? "Earth initially gains energy and warms." : net < 0 ? "Earth initially loses energy and cools." : "No net warming or cooling is implied."} These data do not determine an exact temperature.`,
    hint: "Subtract reflection once; subtract escaping infrared from absorbed sunlight.",
    greenhouseGiven: {
      title: "Original whole-Earth energy ledger",
      note: "Teaching units per equal interval, across the whole-Earth boundary. Given values stay fixed.",
      budget: { incoming, reflected, escaping },
    },
  };
}
const mechanism =
  "Much incoming short-wave solar radiation passes through the atmosphere. The surface absorbs solar energy and emits longer-wavelength infrared. Greenhouse gases absorb some outgoing infrared and emit infrared in all directions; some travels back towards the surface. This reduces net energy escape at a given temperature; infrared still escapes to space.";
const mechanismRubric = [
  "Short-wave solar radiation passes through much of the atmosphere to Earth’s surface.",
  "The surface absorbs solar energy and emits longer-wavelength infrared.",
  "Greenhouse gases absorb some outgoing infrared, rather than reflecting it like mirrors.",
  "Infrared is emitted in all directions, including towards the surface; some energy still escapes.",
];
const waveErrors = {
  "Long-wave in; short-wave out":
    "Earth’s cooler surface emits longer infrared wavelengths than much incoming sunlight.",
  "Sound in and out":
    "The mechanism involves electromagnetic radiation, which travels through space; not sound.",
};
const naturalErrors = {
  "It began only with human industry":
    "Greenhouse gases and natural warming existed before industrial activity.",
  "It prevents any energy leaving Earth":
    "Infrared still escapes, and a stable temperature requires balanced energy input/output.",
};
const warmup = [
  choice(
    "w-gas",
    "Recognise a greenhouse gas",
    "Which named gas contributes to the greenhouse effect?",
    "Methane",
    {
      Nitrogen: "Being abundant does not make N₂ a major infrared absorber.",
      Argon:
        "Monatomic argon is not one of the greenhouse gases required here.",
    },
    "Methane absorbs relevant infrared wavelengths; so do CO₂ and water vapour.",
    "Recall absorption of outgoing infrared.",
  ),
  choice(
    "w-radiation",
    "Identify emitted radiation",
    "A warm Earth surface emits mainly which radiation?",
    "Infrared",
    {
      Sound: "Radiative energy transfer uses electromagnetic waves.",
      "Only visible light":
        "Earth’s ordinary surface temperatures give thermal infrared emission.",
    },
    "The warmed surface emits longer-wavelength infrared.",
    "Compare a cooler surface with the hot Sun.",
  ),
  numeric(
    "w-whole",
    "Find a remainder",
    "100 units of sunlight arrive; 30 are reflected. How many are absorbed?",
    70,
    "units",
    "100−30=70 units absorbed. Reflection is already removed.",
    "Subtract the reflected portion.",
  ),
  numeric(
    "w-net",
    "Read net change",
    "70 units enter after reflection and 70 leave in the same interval. What is the signed net gain?",
    0,
    "units",
    "70−70=0: no net gain or loss.",
    "Incoming after reflection minus outgoing.",
  ),
];
const refresher = [
  choice(
    "r-wave",
    "Wavelengths",
    "Label the two wave paths. Which ordering is correct?",
    "Short-wave in; long-wave out",
    waveErrors,
    "The Sun is hotter and emits much shorter-wave radiation; Earth emits longer infrared.",
    "Compare spacing over the same distance.",
    "wave",
  ),
  choice(
    "r-natural",
    "Build the natural mechanism",
    "Construct the pathway for natural greenhouse warming. Which statement follows?",
    "It helps maintain temperatures suitable for current life",
    naturalErrors,
    "The natural greenhouse effect warms Earth while outgoing energy can still balance incoming energy.",
    "Do not confuse balance with absence of greenhouse gases.",
    "natural",
  ),
  numeric(
    "r-loss",
    "Preserve a negative result",
    "Construct the cooling ledger. What is the signed net gain?",
    -6,
    "units",
    "120−24−102=−6. Stored energy is being lost.",
    "Subtract reflection, then escaping energy.",
    undefined,
    "loss",
  ),
  numeric(
    "r-gain",
    "Find an initial surplus",
    "Construct the reduced-escape ledger. What is the signed net gain?",
    10,
    "units",
    "100−30−60=+10. Earth initially gains energy.",
    "Use the same interval for all three original values.",
    undefined,
    "gain",
  ),
  choice(
    "r-adjust",
    "Follow the adjustment",
    "Complete the initial and later changes. What eventually tends to increase as Earth warms?",
    "Outgoing infrared",
    {
      "Solar input must double": "The stated solar input remains unchanged.",
      "All energy stays forever":
        "A warmer Earth radiates more energy; permanent trapping is the wrong model.",
    },
    "Warming increases outgoing infrared towards a new energy balance.",
    "Separate the immediate imbalance from the later adjustment.",
    "adjustment",
  ),
  choice(
    "r-cattle",
    "Link cattle to methane",
    "Construct the activity→process→gas route. Which gas can more cattle production increase?",
    "Methane",
    {
      "Only oxygen": "Microbial digestion releases CH₄, not oxygen.",
      "Nitrogen only": "Nitrogen abundance does not explain this emission.",
    },
    "Microbes during cattle digestion produce methane.",
    "Consider digestion, not photosynthesis.",
    "cattle",
  ),
  choice(
    "r-landfill",
    "Link waste to methane",
    "Construct the route for organic landfill waste. Which condition supports methane production?",
    "Decomposition with limited oxygen",
    {
      "Complete combustion":
        "Complete combustion converts carbon into CO₂ rather than explaining anaerobic methane production.",
      "Photosynthesis in darkness":
        "Photosynthesis is not the waste-decomposition process.",
    },
    "Microbes can produce methane as organic waste decomposes with limited oxygen.",
    "Follow decomposition in oxygen-poor waste.",
    "landfill",
  ),
  choice(
    "r-mirror",
    "Repair a reflection claim",
    "Evaluate the student claim. Which process replaces mirror reflection?",
    "Absorption and emission of infrared",
    {
      "All visible light destroyed":
        "Not all sunlight is absorbed by greenhouse gases.",
      "Ozone turns into methane": "Ozone depletion is not this mechanism.",
    },
    "Absorbing energy and emitting thermal infrared differs from mirror reflection.",
    "Identify the gas’s interaction with outgoing radiation.",
    "mirror",
  ),
  numeric(
    "r-balance",
    "Construct a balanced ledger",
    "Complete absorbed and net entries. What is the absorbed solar energy?",
    70,
    "units",
    "100−30=70;70−70=0 net. Do not add internal back radiation as extra solar input.",
    "One whole-Earth boundary; count reflection once.",
    undefined,
    "balance",
  ),
];
const guided = [
  choice(
    "g-wave",
    "Wavelengths",
    "Label both radiation paths.",
    "Short-wave in; long-wave out",
    waveErrors,
    "Incoming sunlight includes much shorter-wave visible radiation; Earth emits longer-wave infrared.",
    "More cycles over one distance means shorter wavelength.",
    "wave",
  ),
  choice(
    "g-path",
    "Construct the radiation pathway",
    "Complete all four stages. Which interaction correctly describes greenhouse gases?",
    "They absorb some outgoing infrared",
    {
      "They reflect like mirrors":
        "Absorption and emission are different from reflection.",
      "They absorb all sunlight":
        "Much incoming short-wave radiation reaches the surface.",
    },
    mechanism,
    "Track radiation from the Sun, surface and warmed gases.",
    "pathway",
  ),
  numeric(
    "g-balance",
    "Account for reflected sunlight",
    "Complete the balanced construction. What is the net energy gain?",
    0,
    "units",
    "100−30=70 absorbed; 70−70=0. A warm Earth with greenhouse gases can be balanced.",
    "Balance compares energy per the same interval.",
    undefined,
    "balance",
  ),
  numeric(
    "g-gain",
    "Predict the immediate response",
    "Complete the construction immediately after outgoing energy drops. What is the net gain?",
    10,
    "units",
    "100−30−60=10 units. Initial gain produces warming, not a known ten-degree rise.",
    "Units of energy are not degrees of temperature.",
    undefined,
    "gain",
  ),
  choice(
    "g-enhanced",
    "Explain initial warming and later balance",
    "Complete the change chain. Which explanation follows?",
    "Reduced initial escape; warming raises outgoing towards balance",
    {
      "Energy created by greenhouse gases":
        "The gases redistribute energy; solar input remains the external source here.",
      "Temperature rises forever with no outgoing radiation":
        "Earth continues emitting infrared and a warmer Earth emits more.",
    },
    "More greenhouse absorption can initially reduce escape at the same temperature. Warming increases outgoing energy towards a new balance.",
    "Distinguish initial imbalance from the eventual response.",
    "enhanced",
  ),
  choice(
    "g-fossil",
    "Link combustion to CO₂",
    "Construct the fossil-fuel route. Which gas is produced from fuel carbon?",
    "Carbon dioxide",
    {
      "Methane in every complete combustion":
        "Complete methane combustion makes carbon dioxide and water; unburned gas leaks are a separate source.",
      Oxygen:
        "Oxygen is used during combustion, not made from the fuel carbon.",
    },
    "Combustion oxidises fossil-fuel carbon into CO₂. Increased energy demand can increase these emissions.",
    "Follow carbon through complete combustion.",
    "fossil",
  ),
  choice(
    "g-forest",
    "Explain clearing and burning trees",
    "Construct the forest route. Which pair explains its CO₂ effect?",
    "Carbon released and less uptake by photosynthesis",
    {
      "All tree carbon disappears":
        "Carbon is conserved and can enter atmospheric CO₂.",
      "Oxygen chemically becomes carbon":
        "A reaction does not turn one element into another.",
    },
    "Burning/decomposition releases CO₂; fewer living trees take up less CO₂.",
    "Consider both a source and a reduced sink.",
    "forest",
  ),
  choice(
    "g-ozone",
    "Distinguish two atmospheric processes",
    "Repair the ozone-hole claim. Which radiation is absorbed in the greenhouse mechanism?",
    "Outgoing infrared",
    {
      "Only ultraviolet through an ozone hole":
        "Ozone depletion concerns ultraviolet absorption; greenhouse warming concerns outgoing infrared.",
      "Sound from factories": "Sound is not this radiation mechanism.",
    },
    "Enhanced greenhouse warming differs from ozone depletion; the relevant outgoing radiation is infrared.",
    "Keep UV and infrared mechanisms separate.",
    "ozone",
  ),
];
const practice = [
  choice(
    "p-gases",
    "Name a greenhouse pair",
    "Which pair contains two greenhouse gases?",
    "Carbon dioxide and methane",
    {
      "Nitrogen and oxygen":
        "The major dry-air gases are not the required greenhouse pair.",
      "Argon and nitrogen":
        "Abundance and monatomic gas properties do not establish strong infrared absorption.",
    },
    "CO₂ and CH₄ absorb relevant outgoing infrared; water vapour also contributes.",
    "Distinguish greenhouse gases from the most abundant gases.",
  ),
  choice(
    "p-water",
    "Recognise water vapour",
    "Which additional atmospheric gas is a greenhouse gas?",
    "Water vapour",
    {
      Nitrogen: "N₂ is abundant but not a major greenhouse absorber.",
      Oxygen: "O₂ abundance does not make it the required greenhouse gas.",
    },
    "Water vapour absorbs infrared. Its concentration also depends on temperature and water availability.",
    "Recall all three named gases.",
  ),
  choice(
    "p-abundance",
    "Reject an abundance shortcut",
    "A student says nitrogen causes most greenhouse absorption because it is 78% of dry air. What is wrong?",
    "Abundance alone does not determine infrared absorption",
    {
      "The atmosphere contains no nitrogen":
        "Dry air contains about 78% nitrogen.",
      "All gases absorb every wavelength equally":
        "Different gases interact differently with radiation.",
    },
    "N₂ and O₂ are abundant but are not the major greenhouse gases in this GCSE model.",
    "Ask about absorption, not just percentage.",
  ),
  choice(
    "p-wave",
    "Compare the two paths",
    "Compare incoming solar radiation with surface emission. Which description is correct?",
    "Much solar radiation is shorter-wave; surface emission is longer infrared",
    {
      "Surface emits mainly shorter visible radiation":
        "Earth’s cooler surface emits longer infrared wavelengths.",
      "Both are sound waves": "They are electromagnetic radiation, not sound.",
    },
    "Hot Sun radiation includes much visible light; cooler Earth emits infrared.",
    "Use short/long relative wavelengths.",
  ),
  choice(
    "p-pass",
    "Follow incoming energy",
    "In the greenhouse explanation, what happens to much incoming short-wave radiation?",
    "It passes through the atmosphere to the surface",
    {
      "Greenhouse gases block all of it":
        "The mechanism is not all sunlight being blocked.",
      "It all becomes carbon dioxide":
        "Radiation is energy transfer, not conversion into gas matter.",
    },
    "Much short-wave sunlight reaches and can be absorbed by the surface.",
    "Track the solar path first.",
  ),
  choice(
    "p-surface",
    "Follow absorbed sunlight",
    "What does the warmed surface do after absorbing solar energy?",
    "Emits longer-wavelength infrared",
    {
      "Emits only visible light": "Earth’s surface is far cooler than the Sun.",
      "Stops radiating completely":
        "The surface continuously emits thermal radiation.",
    },
    "Absorbed solar energy warms the surface; it emits infrared.",
    "Name the emitted radiation, not the incoming source.",
  ),
  choice(
    "p-absorb",
    "Choose the gas mechanism",
    "Which interaction describes greenhouse gases?",
    "Absorbing some outgoing infrared",
    {
      "Reflecting all infrared like mirrors":
        "Absorption and thermal emission differ from reflection.",
      "Destroying all incoming sunlight":
        "Much incoming short-wave radiation passes through.",
    },
    "Gases absorb relevant infrared wavelengths and emit infrared.",
    "Avoid the mirror analogy.",
  ),
  choice(
    "p-directions",
    "Explain returning radiation",
    "Why can some infrared travel back towards the surface?",
    "Warmed gases emit infrared in all directions",
    {
      "They emit downwards only":
        "There are multiple directions, including upwards.",
      "No radiation can escape": "Outgoing radiation still reaches space.",
    },
    "Emission in all directions includes both towards the surface and towards space.",
    "Do not turn some returned radiation into permanent imprisonment.",
  ),
  ledger("p-ledger", "Construct a new initial-warming ledger", 160, 40, 100),
  numeric(
    "p-loss",
    "Preserve cooling sign",
    "200 units arrive, 60 are reflected and 148 leave as infrared in the same interval. Calculate signed net energy gain.",
    -8,
    "units",
    "200−60−148=−8 units. Stored energy falls; Earth initially cools.",
    "A negative gain means loss, not an invalid answer.",
    {
      title: "Cooling comparison",
      note: "Original teaching values, equal interval.",
      budget: { incoming: 200, reflected: 60, escaping: 148 },
    },
  ),
  numeric(
    "p-equilibrium",
    "Find outgoing at balance",
    "90 units arrive and 18 are reflected. At energy balance, how many units leave as infrared?",
    72,
    "units",
    "90−18=72 absorbed, so 72 must leave per the same interval at balance.",
    "Absorbed incoming equals outgoing at balance.",
  ),
  numeric(
    "p-fraction",
    "Use the correct denominator",
    "200 units of sunlight arrive and50 are reflected. What percentage of arriving sunlight is absorbed?",
    75,
    "%",
    "150/200×100=75%. The denominator is the original incoming 200, not the reflected 50.",
    "First find absorbed energy, then divide by the whole incoming.",
  ),
  choice(
    "p-internal",
    "Avoid counting energy twice",
    "In a whole-Earth ledger, should infrared emitted back towards the surface be added as new solar input?",
    "No; it is an internal energy transfer",
    {
      "Yes; greenhouse gases create energy":
        "Emission redistributes energy rather than creating extra solar energy.",
      "Yes; add it twice":
        "Internal transfers must not be counted as extra external inputs.",
    },
    "Back radiation transfers energy inside the chosen system. Whole-Earth balance uses external incoming, reflected and outgoing energy.",
    "Keep the boundary fixed.",
  ),
  choice(
    "p-enhance",
    "Predict the first change",
    "More greenhouse absorption initially reduces outgoing infrared at the same temperature. Sunlight stays constant. What is the initial tendency?",
    "Warming",
    {
      Cooling:
        "Reduced escape with unchanged input produces a positive imbalance.",
      "No possible effect":
        "A changed input/output balance changes stored energy.",
    },
    "Less outgoing energy initially escapes than is absorbed, so Earth gains energy and warms.",
    "Compare energy per the same interval.",
  ),
  choice(
    "p-later",
    "Separate later balance from first response",
    "As Earth warms after enhanced absorption, which response can help restore balance?",
    "It emits more outgoing infrared",
    {
      "It stops absorbing sunlight": "The stated sunlight input does not stop.",
      "It stops emitting infrared":
        "Warmer surfaces emit more, not zero, thermal radiation.",
    },
    "A warmer Earth emits more infrared; eventual outgoing energy can balance the absorbed solar input at a higher temperature.",
    "Energy balance may return without returning to the earlier temperature.",
  ),
  choice(
    "p-temperature",
    "Recognise a model limit",
    "A simplified ledger gives +10 energy units. What exact temperature increase does that prove?",
    "No exact temperature increase is determined",
    {
      "Exactly 10°C":
        "Energy units are not degrees; heat capacity, timescale and feedbacks matter.",
      "Exactly 100°C": "The ledger supplies no conversion to degrees.",
    },
    "An energy imbalance establishes the initial tendency; it does not supply a precise final temperature.",
    "Check which quantities and units were actually supplied.",
  ),
  written(
    "p-co2",
    "Explain two CO₂ activities",
    "Name two human activities that can increase atmospheric CO₂ and explain each link.",
    "More fossil-fuel burning oxidises stored fuel carbon to CO₂. Clearing and burning forests releases carbon and leaves fewer trees to remove CO₂ by photosynthesis.",
    [
      "Name fossil-fuel burning and link fuel carbon to emitted CO₂.",
      "Name deforestation and explain carbon release and/or reduced photosynthetic uptake.",
      "Give two distinct activities, not two names for the same fuel.",
    ],
    "Think about a source and a reduced biological sink.",
  ),
  written(
    "p-methane",
    "Explain two methane activities",
    "Name two human activities that can increase atmospheric methane and explain the processes.",
    "Increased cattle production increases methane made by microbes during digestion. More organic landfill waste decomposes with limited oxygen and can release methane.",
    [
      "Link increased cattle production to methane from microbial digestion.",
      "Link increased organic landfill waste to methane from decomposition with limited oxygen.",
      "Distinguish methane sources from complete fossil-fuel combustion producing CO₂.",
    ],
    "Follow digestion and oxygen-poor decomposition.",
  ),
  written(
    "p-population",
    "Build a two-step explanation",
    "Explain how increased population may increase atmospheric methane. Give a demand→activity→gas chain.",
    "A larger population can require more food; increased cattle production can release more methane from microbial digestion. Alternatively, more organic waste can enter landfill and release methane during oxygen-poor decomposition.",
    [
      "Identify greater food demand or more organic waste as a consequence.",
      "Link it to methane-producing cattle production or oxygen-poor landfill decomposition.",
      "Use a supported possibility rather than claiming every person’s activity emits the same amount.",
    ],
    "Population alone is not the chemical process.",
  ),
  written(
    "p-mirror",
    "Repair an incomplete explanation",
    "A student says ‘gases are mirrors reflecting all sunlight and trapping energy forever’. Correct each error.",
    "Much incoming short-wave sunlight passes through the atmosphere. The warmed surface emits longer infrared, which greenhouse gases absorb and emit in all directions. Some reaches the surface and some escapes; energy is not imprisoned forever.",
    [
      "Correct all-sunlight reflection: much short-wave radiation passes through.",
      "Describe surface infrared emission and gas absorption rather than mirror reflection.",
      "State emission in all directions and continuing energy escape.",
    ],
    "Track source, wavelength, interaction and direction.",
  ),
  written(
    "p-mechanism",
    "Write the complete mechanism",
    "Explain how greenhouse gases help maintain temperatures on Earth, using short and long wavelength radiation.",
    mechanism,
    mechanismRubric,
    "Follow sunlight through the atmosphere, the warmed surface, gas absorption and emission.",
  ),
  choice(
    "p-feedback",
    "Qualify water-vapour feedback",
    "Warming can increase atmospheric water vapour, which absorbs infrared. Which interpretation is appropriate?",
    "Water vapour can amplify initial warming as a feedback",
    {
      "It is not a greenhouse gas": "Water vapour absorbs infrared.",
      "It proves human CO₂ has no effect":
        "A temperature-dependent water response does not remove the initial influence of increased CO₂.",
    },
    "Warmer conditions can support more water vapour, adding greenhouse absorption. This is a feedback; local humidity and water availability still matter.",
    "Separate an initial change from a responding process.",
  ),
];
const checkForms: LearningTask[][] = [
  [
    choice(
      "cA-water",
      "Name the additional gas",
      "Which gas also contributes to natural greenhouse warming?",
      "Water vapour",
      {
        Argon: "Argon is not the required greenhouse gas.",
        Nitrogen: "N₂ abundance is not the mechanism.",
      },
      "Water vapour absorbs relevant infrared.",
      "Recall the named greenhouse gases.",
    ),
    choice(
      "cA-wave",
      "Compare sources",
      "Which is generally longer-wavelength in this explanation?",
      "Radiation emitted by Earth’s surface",
      {
        "Much incoming visible sunlight":
          "The cooler surface emits longer infrared.",
        "Sound from factories": "Sound is not the electromagnetic comparison.",
      },
      "Surface thermal emission is infrared, longer than much incoming visible sunlight.",
      "Compare hot Sun and cool Earth.",
    ),
    ledger("cA-ledger", "Construct an independent ledger", 180, 45, 117),
    numeric(
      "cA-balance",
      "Find balanced escape",
      "140 units arrive;35 are reflected. At balance, how many leave as infrared?",
      105,
      "units",
      "140−35=105 absorbed; balanced outgoing 105.",
      "Use absorbed energy.",
    ),
    written(
      "cA-mechanism",
      "Explain independently",
      "Explain natural greenhouse warming using radiation wavelength and interaction.",
      mechanism,
      mechanismRubric,
      "Trace the energy pathway.",
    ),
    written(
      "cA-co2",
      "Link two activities",
      "Describe two human activities increasing atmospheric CO₂, with a process for each.",
      "Fossil-fuel burning releases CO₂ by combustion; deforestation releases carbon and reduces photosynthetic CO₂ uptake.",
      [
        "Link fossil-fuel combustion to CO₂ production.",
        "Link deforestation to carbon release and/or reduced CO₂ uptake.",
        "Explain two distinct human activities.",
      ],
      "Think about stored fuel and forests.",
    ),
    choice(
      "cA-escape",
      "Interpret an initial change",
      "At fixed initial temperature and solar input, stronger infrared absorption reduces escape. What initially follows?",
      "Energy gain and warming",
      {
        "Energy loss and cooling":
          "Less escape with equal input gives a positive imbalance.",
        "No energy can ever leave":
          "Infrared still escapes and emission increases with warming.",
      },
      "The initial imbalance causes warming.",
      "Compare absorbed input and output.",
    ),
    choice(
      "cA-natural",
      "Interpret balanced warmth",
      "A planet with greenhouse gases has equal absorbed incoming and outgoing energy. Which follows?",
      "It can be warm without net warming or cooling",
      {
        "Its temperature must be zero":
          "Balance sets net change, not absolute temperature.",
        "It cannot contain greenhouse gases":
          "Natural greenhouse warming and energy balance can coexist.",
      },
      "A steady energy balance can occur at a warm temperature.",
      "Distinguish temperature from its change.",
    ),
  ],
  [
    choice(
      "cB-pair",
      "Distinguish gas roles",
      "Which pair contains greenhouse gases?",
      "Methane and carbon dioxide",
      {
        "Oxygen and nitrogen":
          "These major dry-air gases are not the required pair.",
        "Argon and oxygen": "This is not the required infrared-absorbing pair.",
      },
      "Methane and carbon dioxide absorb infrared.",
      "Identify the mechanism, not abundance.",
    ),
    choice(
      "cB-process",
      "Distinguish absorption from reflection",
      "Which description correctly identifies the greenhouse-gas interaction?",
      "Absorbs and emits some outgoing infrared",
      {
        "Reflects all sunlight like mirrors":
          "Mirror reflection and absorption/emission are different.",
        "Creates new solar energy": "Gases do not create solar input.",
      },
      "Outgoing infrared is absorbed and emitted; much short-wave input passes through.",
      "Trace wavelengths and interactions.",
    ),
    ledger(
      "cB-ledger",
      "Construct a different independent ledger",
      240,
      60,
      168,
    ),
    numeric(
      "cB-balance",
      "Calculate balanced output",
      "160 units arrive and48 are reflected. What escaping infrared value balances absorbed input?",
      112,
      "units",
      "160−48=112 absorbed; balanced output 112.",
      "Remove reflected sunlight once.",
    ),
    written(
      "cB-mechanism",
      "Explain the energy pathway",
      "Describe how short- and long-wave radiation interact with the surface and greenhouse gases.",
      mechanism,
      mechanismRubric,
      "Name transmission, absorption, surface emission and gas emission.",
    ),
    written(
      "cB-methane",
      "Explain distinct methane sources",
      "Give two human activities increasing atmospheric methane and the process for each.",
      "More cattle production increases microbial methane production during digestion; more organic waste in landfill can produce methane by oxygen-poor decomposition.",
      [
        "Link cattle production to methane from digestion.",
        "Link organic landfill waste to methane from limited-oxygen decomposition.",
        "Give two distinct activities and name CH₄.",
      ],
      "Consider food production and waste.",
    ),
    choice(
      "cB-later",
      "Interpret a later adjustment",
      "After initial greenhouse warming with solar input unchanged, what can help restore energy balance?",
      "Increased outgoing infrared from a warmer Earth",
      {
        "No outgoing radiation ever": "Earth continues emitting infrared.",
        "All solar radiation must be blocked":
          "Unchanged solar input does not require complete blockage.",
      },
      "Warming increases emission towards a new balance.",
      "Distinguish the initial imbalance from its response.",
    ),
    choice(
      "cB-limit",
      "Evaluate a numerical claim",
      "A teaching ledger gives a positive net gain. Does it give an exact final °C rise?",
      "No; additional physical information is needed",
      {
        "Yes; energy units equal degrees":
          "Energy and temperature are different quantities.",
        "Yes; always 100°C": "No such conversion is provided.",
      },
      "A direction of change can be inferred without an exact final temperature.",
      "Check units and missing quantities.",
    ),
  ],
];
const reviewForms: LearningTask[][] = [
  [
    ledger("vA-ledger", "Retrieve a fresh ledger", 150, 30, 111),
    choice(
      "vA-path",
      "Retrieve the solar path",
      "What happens to much short-wave sunlight in the greenhouse model?",
      "Passes through to the surface",
      {
        "All is reflected by gas mirrors":
          "Much short-wave radiation reaches the surface.",
        "All becomes sound": "It remains electromagnetic radiation.",
      },
      "The surface can absorb transmitted short-wave radiation.",
      "Start at the Sun.",
    ),
    choice(
      "vA-methane",
      "Retrieve a methane process",
      "Which activity/process can increase methane?",
      "Organic landfill waste decomposing with limited oxygen",
      {
        "Complete combustion making only methane":
          "Complete combustion makes CO₂ and water.",
        "Forests photosynthesising methane":
          "Photosynthesis does not make methane.",
      },
      "Oxygen-poor organic waste decomposition can make CH₄.",
      "Name the waste condition.",
    ),
    written(
      "vA-explain",
      "Retrieve the whole mechanism",
      "Explain how natural greenhouse gases affect Earth’s temperature using the radiation pathway.",
      mechanism,
      mechanismRubric,
      "Use wavelength, absorption and emission.",
    ),
  ],
  [
    numeric(
      "vB-loss",
      "Retrieve a signed imbalance",
      "130 units arrive; 26 are reflected; 109 leave as infrared in the same interval. What is the net gain?",
      -5,
      "units",
      "130−26−109=−5 units: initial cooling.",
      "Retain the negative sign.",
    ),
    choice(
      "vB-direction",
      "Retrieve gas emission directions",
      "Which direction description fits thermal emission from warmed gases?",
      "All directions, including towards the surface and space",
      {
        "Only downwards": "Upward emission also occurs.",
        "Never any emission":
          "Gases emit infrared rather than keeping energy forever.",
      },
      "Some infrared returns towards the surface while some reaches space.",
      "Avoid permanent trapping.",
    ),
    choice(
      "vB-source",
      "Retrieve a CO₂ activity",
      "Which explanation connects deforestation to increased CO₂?",
      "Carbon released and fewer trees remove CO₂",
      {
        "Oxygen becomes carbon": "Elements are not changed into each other.",
        "All forest carbon vanishes":
          "Carbon is conserved; burning or decomposition can transfer forest carbon into CO₂.",
      },
      "Forest clearance can increase sources and reduce uptake.",
      "Follow release and sinks.",
    ),
    written(
      "vB-enhance",
      "Retrieve initial and later changes",
      "Explain initial warming after stronger greenhouse absorption and how energy balance can later return.",
      "At the same initial temperature and sunlight, less outgoing infrared escapes, producing a positive imbalance. Earth warms, increasing outgoing infrared towards a new balance. The simple ledger does not give an exact temperature rise.",
      [
        "Hold initial temperature and solar input fixed; identify initially reduced outgoing energy.",
        "Link positive imbalance to warming.",
        "Link warming to increased outgoing radiation towards balance; avoid permanent trapping.",
        "Recognise the absence of an exact °C prediction.",
      ],
      "Separate immediate effect, response and model limit.",
    ),
  ],
];
const recovery = [
  "r-natural",
  "r-natural",
  "r-natural",
  "r-wave",
  "r-natural",
  "r-natural",
  "r-mirror",
  "r-natural",
  "r-balance",
  "r-loss",
  "r-balance",
  "r-balance",
  "r-balance",
  "r-adjust",
  "r-adjust",
  "r-adjust",
  "r-natural",
  "r-cattle",
  "r-landfill",
  "r-mirror",
  "r-natural",
  "r-adjust",
];
export const greenhouseRecoveryRoutes: Record<string, string> = {};
practice.forEach((q, i) => {
  q.followUp = id(recovery[i]);
  greenhouseRecoveryRoutes[q.id] = q.followUp;
});
export const allGreenhouseTasks = [
  ...warmup,
  ...refresher,
  ...guided,
  ...practice,
  ...checkForms.flat(),
  ...reviewForms.flat(),
];
export const greenhouseExposureFamilies = {
  wave: ["r-wave", "g-wave", "p-wave", "cA-wave"],
  mechanism: [
    "g-path",
    "p-mechanism",
    "cA-mechanism",
    "cB-mechanism",
    "vA-explain",
  ],
  solar: ["p-pass", "vA-path"],
  surface: ["w-radiation", "p-surface"],
  absorption: ["p-absorb", "g-path", "cB-process"],
  natural: ["r-natural", "cA-natural"],
  water: ["p-water", "cA-water"],
  gasPair: ["p-gases", "cB-pair"],
  methane: ["w-gas", "r-cattle"],
  mirror: ["r-mirror", "p-mirror"],
  directions: ["p-directions", "vB-direction"],
  co2: ["p-co2", "cA-co2"],
  sources: ["g-forest", "vB-source"],
  methaneActivities: ["p-methane", "cB-methane"],
  landfill: ["r-landfill", "vA-methane"],
  enhanced: ["g-enhanced", "p-enhance", "cA-escape"],
  adjust: ["r-adjust", "p-later", "cB-later"],
  limit: ["p-temperature", "cB-limit"],
  budgetGain: ["r-gain", "g-gain"],
  budgetBalance: ["w-whole", "r-balance", "g-balance", "w-net"],
};
for (const family of Object.values(greenhouseExposureFamilies))
  for (const s of family) {
    const q = allGreenhouseTasks.find((q) => q.id === id(s))!;
    q.exposureAliases = [
      ...new Set([
        ...(q.exposureAliases ?? []),
        ...family.filter((o) => o !== s).map(id),
      ]),
    ];
  }
export const greenhouseJourney: LessonJourney = {
  version: 1,
  introduction:
    "Trace radiation, construct energy balances and explain how human activities enhance natural greenhouse warming.",
  scopeNote:
    "AQA Chemistry/Trilogy greenhouse mechanism and gas sources, both tiers. Radiation paths and energy units are original teaching models; no exact temperature or emissions forecast is implied. Full climate-evidence evaluation and footprints follow in their own lesson. Written explanations use self-review, without examiner marks.",
  outcomes: [
    "Name water vapour, carbon dioxide and methane as greenhouse gases.",
    "Explain short-wave transmission, surface absorption/infrared emission, and gas absorption/emission in all directions.",
    "Distinguish absorption from mirror reflection, greenhouse warming from ozone depletion and natural warmth from human enhancement.",
    "Calculate absorbed and net energy across one whole-Earth boundary and infer initial warming, cooling or balance.",
    "Explain initial reduced escape and increased outgoing radiation as Earth warms, without claiming a precise °C rise.",
    "Explain two human activities increasing each of CO₂ and methane; construct demand→activity→process chains.",
  ],
  warmup,
  refresher,
  guided,
  practice,
  checkForms,
  reviewForms,
  practiceGroups: [
    {
      label: "Radiation and gas roles",
      taskIds: practice.slice(0, 8).map((q) => q.id),
    },
    {
      label: "Energy balances and enhancement",
      taskIds: practice.slice(8, 16).map((q) => q.id),
    },
    {
      label: "Sources and complete explanations",
      taskIds: practice.slice(16).map((q) => q.id),
    },
  ],
};

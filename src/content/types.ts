export type Tier = "foundation" | "higher";
export type Course = "combined" | "separate";
export type ModelKind =
  | "atom"
  | "bond"
  | "balance"
  | "moles"
  | "ph"
  | "energy"
  | "rate"
  | "equilibrium"
  | "organic"
  | "chromatography"
  | "electrolysis"
  | "predict";
export interface Question {
  acidMetalReference?: "products" | "electrons";
  metalReactionReference?: boolean;
  concentrationSymbols?: boolean;
  frequencyDisplay?: import("../lib/frequency-display").FrequencyDisplayData;
  nanoSizeRanges?: "learn" | "construct";
  nanoFootprintDiagram?: {
    base: number;
    height: number;
    interactive?: boolean;
  };
  title?: string;
  writtenEquations?: boolean;
  stateSymbolUse?: boolean;
  writtenEquationKind?: "symbol" | "half";
  shortWritten?: boolean;
  conciseHeading?: boolean;
  elementReference?: boolean;
  alkaliReference?: boolean;
  halogenReference?: boolean;
  nobleBoilingPoints?: { element: string; boiling: number }[];
  haberDrawing?: import("../lib/haber-drawing").HaberDrawing;
  haberGiven?: import("../lib/haber").HaberGiven;
  materialsGiven?: import("../lib/materials").MaterialsGiven;
  lcaGiven?: import("../lib/life-cycle").LcaGiven;
  bioGiven?: import("../lib/bio-extraction").BioGiven;
  wasteGiven?: import("../lib/wastewater").WasteGiven;
  waterGiven?: import("../lib/water").WaterGiven;
  cycleGiven?: import("../lib/cycle").CycleGiven;
  pollutionGiven?: import("../lib/pollution").PollutionGiven;
  climateGiven?: import("../lib/climate").ClimateGiven;
  greenhouseGiven?: import("../lib/greenhouse").GreenhouseGiven;
  atmosphereGiven?: import("../lib/early-atmosphere").AtmosphereGiven;
  separationGiven?: import("../lib/separation-investigation").SeparationGiven;
  instrumentalGiven?: import("../lib/instrumental").InstrumentalGiven;
  ionGiven?: import("./journeys/ion-tests").IonGiven;
  gasDrawing?: import("../lib/gas-tests-drawing").GasDrawingData;
  gasGiven?: import("../lib/gas-tests-givens").GasGivenData;
  chromatographyDrawing?: import("../lib/chromatography-drawing").ChromaDrawingData;
  chromatographyGiven?: import("../lib/chromatography-givens").ChromaGivenData;
  tier?: Tier;
  naturalGiven?: import("../lib/natural").NaturalDiagramData;
  purityDrawing?: import("../lib/purity-drawing").PurityDrawingData;
  naturalDrawing?: import("../lib/natural").NaturalDiagramData;
  naturalHelix?: { positions: number; turns: number };
  id: string;
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint: string;
  unit?: string;
  inputMode?: "text" | "decimal" | "numeric";
  tolerance?: number;
  standardForm?: "e";
  acceptedRange?: { min: number; max: number; exclusive: boolean };
  rounding?: { kind: "decimal-places" | "significant-figures"; digits: number };
  misconceptions?: Record<string, string>;
  exposureAliases?: string[];
  parts?: {
    id: string;
    label: string;
    answer: number;
    unit?: string;
    inputMode?: "text" | "decimal" | "numeric";
  }[];
  partLegend?: string;
  arrangement?: number[];
  drawArrangement?: boolean;
  shellDiagram?: number[];
  compactShellDiagram?: boolean;
  compactIonDiagram?: boolean;
  atomDiagram?: "solid" | "pudding" | "nuclear" | "bohr" | "neutrons";
  phMeasurements?: {
    quantity: string;
    unit: string;
    points: { amount: number; ph: number }[];
  };
  practicalGraph?: import("../components/PracticalPlot").PracticalGraphData;
  tangentGraph?: import("../components/TangentPlot").TangentGraph;
  tangentDrawing?: import("../components/TangentPlot").TangentGraph;
  rateGraph?: import("../lib/rate-measurement").RateData;
  rateTable?: import("../lib/rate-measurement").RateData;
  pathwayGiven?: { caseId: string };
  pathwayDrawing?: import("../lib/pathway-board").PathwayDrawingData;
  polymerisationGiven?: {
    groups: import("../lib/polymerisation").FourGroups;
    polymer: boolean;
  };
  polymerisationDrawing?: import("../lib/polymerisation-board").PolymerisationDrawing;
  polyesterDrawing?: import("../lib/polyester").PolyesterDrawingData;
  organicDrawing?: import("../lib/organic-drawing").OrganicDrawingData;
  fuelDrawing?: import("../lib/fuel-drawing").FuelDrawingData;
  alkeneDrawing?: import("../lib/alkene-drawing").AlkeneDrawingData;
  hydrocarbonGiven?: import("../components/HydrocarbonGiven").HydrocarbonGivenData;
  alkaneDrawing?: import("../lib/alkane-drawing").AlkaneDrawingData;
  oilBarDrawing?: import("../lib/oil-bar-drawing").OilBarDrawingData;
  rateDrawing?: import("../components/RateDrawingInput").RateDrawingData;
  voltageData?: import("../components/VoltageComparison").VoltageData;
  voltageMatrix?: boolean;
  cellsComparison?: import("../components/CellsComparison").CellsComparisonData;
  bondReaction?: string;
  profileDrawing?: boolean;
  compactProfileInstructions?: boolean;
  readableShellDiagram?: boolean;
  reactionProfile?: {
    reactant: number;
    product: number;
    peak: number;
    max?: number;
    min?: number;
    step?: number;
    wide?: boolean;
  };
  temperatureTrace?: {
    points: { time: number; temperature: number }[];
    mixedAfter: number;
    min?: number;
    max?: number;
  };
  buretteScale?: { top: number; reading: number; boundaryDescription: string };
  invertedGasScale?: { ticks: number; boundaryDescription: string };
  massReadings?: { label: string; grams: number }[];
  isotopeData?: { mass: number; abundance: number }[];
  abundanceKind?: "percent" | "count";
  halogenResults?: { added: string; halide: string; reaction: boolean }[];
  ionDotCross?: {
    symbol: string;
    charge: number;
    dots: number;
    crosses: number;
    proposed?: boolean;
    shellsOmitted?: boolean;
    showBrackets?: boolean;
  };
  drawDotCross?: { symbol: string };
  ionicSlice?: boolean;
  compactIonicSlice?: boolean;
  diamondDiagram?: boolean;
  graphiteDiagram?: boolean;
  stateParticleDiagram?: "solid" | "liquid" | "gas";
  polymerChainDiagram?: boolean | number;
  polymerRepeatDiagram?: boolean;
  polymerRepeatDrawing?: boolean;
  nanotubeDiagram?: boolean;
  nanotubeMaterialData?:
    boolean | import("../lib/nanotubes").NanotubeMaterialGiven;
  grapheneDiagram?: boolean;
  graphenePanelData?: boolean | import("../lib/graphene").GraphenePanelGiven;
  fullereneDiagram?: { ring: 0 | 1 | 2 };
  silicaDiagram?: boolean;
  metallicDiagram?: boolean | { alloy?: boolean };
  chemicalFormula?: boolean;
  electronEquation?: {
    reaction: import("../lib/half-equations").HalfEquationKey;
    simplest?: boolean;
  };
  drawCovalent?: {
    molecule:
      "H2" | "Cl2" | "HCl" | "O2" | "N2" | "H2O" | "NH3" | "CH4" | "CO2";
  };
  molecularLineDrawing?: {
    molecule: import("../lib/covalent").CovalentMolecule;
  };
  covalentDiagram?: {
    molecule: NonNullable<Question["drawCovalent"]>["molecule"];
    own: number[];
    other: number[];
    unshared: number;
    partnerUnshared: number[];
    proposed?: boolean;
  };
  covalentModel?: {
    molecule: NonNullable<Question["drawCovalent"]>["molecule"];
  };
  referenceResponse?: string;
  rubric?: string[];
  notation?: {
    symbol: string;
    atomicNumber: number;
    massNumber: number;
    annotated?: boolean;
    charge?: number;
  };
}
export interface Lesson {
  slug: string;
  topic: string;
  title: string;
  goal: string;
  tier: Tier;
  course: Course;
  model: ModelKind;
  concept: string;
  questions: Question[];
  checks: Question[];
  prerequisite?: string;
  journey?: LessonJourney;
}
export type LearningStage = "warmup" | "refresher" | "guided" | "practice";
export type WorkbenchState = Record<string, string | number>;
export type TaskModel =
  | {
      kind: "haber-investigation";
      mode: import("../lib/haber").HaberMode;
      record: string;
    }
  | {
      kind: "materials-investigation";
      mode: import("../lib/materials").MaterialsMode;
      record: string;
    }
  | {
      kind: "life-cycle-investigation";
      mode: import("../lib/life-cycle").LcaMode;
      record: string;
    }
  | {
      kind: "bio-extraction-investigation";
      mode: import("../lib/bio-extraction").BioMode;
      record: string;
    }
  | {
      kind: "wastewater-investigation";
      mode: import("../lib/wastewater").WasteMode;
      record: string;
    }
  | {
      kind: "water-investigation";
      mode: import("../lib/water").WaterMode;
      record: string;
    }
  | {
      kind: "carbon-cycle-investigation";
      mode: import("../lib/cycle").CycleMode;
      record: string;
    }
  | {
      kind: "pollution-investigation";
      mode: import("../lib/pollution").PollutionMode;
      record: string;
    }
  | {
      kind: "climate-investigation";
      mode: import("../lib/climate").ClimateMode;
      record: string;
    }
  | {
      kind: "greenhouse-investigation";
      mode: import("../lib/greenhouse").GreenhouseMode;
      record: string;
    }
  | {
      kind: "atmosphere-investigation";
      mode: import("../lib/early-atmosphere").AtmosphereMode;
      record: string;
    }
  | {
      kind: "separation-investigation";
      mode: import("../lib/separation-investigation").SeparationMode;
      record: string;
    }
  | {
      kind: "instrumental-investigation";
      mode: import("../lib/instrumental").InstrumentalMode;
      record: string;
    }
  | {
      kind: "ion-test-investigation";
      mode: import("../lib/ion-tests").IonMode;
      record: string;
    }
  | {
      kind: "gas-test-investigation";
      mode: import("../lib/gas-tests-cases").GasMode;
      record: string;
      focus?: import("../lib/gas-tests-domain").GasFocus;
      instruction?: string;
    }
  | {
      kind: "chromatography-investigation";
      mode: import("../lib/chromatography-cases").ChromatographyMode;
      record: string;
      focus?: import("../lib/chromatography-domain").ChromaFocus;
      instruction?: string;
    }
  | {
      kind: "purity-separation";
      mode: import("../lib/purity-domain").PurityMode;
      record: string;
      focus?: import("../lib/purity-domain").PurityFocus;
      instruction?: string;
    }
  | {
      kind: "natural-polymers";
      mode: import("../lib/natural").NaturalMode;
      record?: string;
      focus?: import("../lib/natural").NaturalFocus;
      instruction?: string;
    }
  | {
      kind: "pathways";
      mode: import("../lib/pathways").PathwayMode;
      record?: string;
      instruction?: string;
    }
  | {
      kind: "polymerisation";
      mode: import("../lib/polymerisation").PolymerisationMode;
      record?: string;
      instruction?: string;
    }
  | {
      kind: "alcohol";
      mode: import("../lib/alcohols").AlcoholMode;
      record?: string;
      instruction?: string;
    }
  | {
      kind: "cracking";
      mode: import("../lib/cracking").CrackingMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "alkanes";
      mode: import("../lib/alkanes").AlkaneMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "crude-oil";
      mode: import("../lib/crude-oil").OilMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "rates-practical";
      mode: import("../lib/rates-practical").PracticalMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "equilibrium-shift";
      mode: import("../lib/equilibrium-shifts").ShiftMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "reversible-equilibrium";
      mode: import("../lib/reversible-equilibrium").ReversibleMode;
      yieldComparison?: true;
      record?: string;
      instruction: string;
    }
  | {
      kind: "temperature-catalysts";
      mode: import("../lib/temperature-catalysts").ThermalMode;
      record?: string;
      instruction: string;
    }
  | {
      kind: "collision-theory";
      mode: import("../lib/collision-theory").CollisionMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "tangent-rates";
      mode: import("../lib/tangent-rates").TangentMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "rate-measurement";
      mode: import("../lib/rate-measurement").RatesMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "cell-voltage";
      mode: import("../lib/cell-voltage").VoltageMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "fuel-half";
      mode: import("../lib/fuel-half").FuelHalfMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "cells-workbench";
      mode: import("../lib/cells-and-fuel-cells").CellsMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "energy-practical";
      mode: import("../lib/energy-practical").PracticalMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "bond-energy";
      mode: import("../lib/bond-energy").BondMode;
      instruction: string;
      record?: string;
    }
  | {
      kind: "reaction-profile";
      mode: "build" | "read" | "arrows" | "catalyst" | "evidence";
      instruction: string;
      record?: string;
    }
  | {
      kind: "thermal-transfer";
      mode: "transfer" | "temperature" | "trace" | "use" | "evidence";
      instruction: string;
      record?: string;
    }
  | {
      kind: "displacement-redox";
      record?: string;
      mode: "combine" | "cancel" | "ledger" | "representation" | "feasibility";
      instruction: string;
    }
  | {
      kind: "titration-technique";
      mode: "reading" | "repeats" | "errors" | "endpoint" | "sequence";
      instruction: string;
    }
  | {
      kind: "acid-evidence";
      mode: "descriptors" | "factors" | "dilution" | "comparison" | "evidence";
      instruction: string;
    }
  | {
      kind: "ph-evidence";
      mode:
        | "classification"
        | "colour"
        | "indicator"
        | "neutralisation"
        | "measurement";
      instruction: string;
    }
  | {
      kind: "electron-redox";
      mode: "electrons" | "cation" | "anion" | "diagnose" | "ionic";
      instruction: string;
    }
  | {
      kind: "aqueous-products";
      mode:
        | "cathode"
        | "products"
        | "transfer"
        | "graph"
        | "investigation"
        | "reading";
      instruction: string;
    }
  | {
      kind: "electrolysis-process";
      mode: "movement" | "conductivity" | "products" | "mixture" | "anode";
      instruction: string;
    }
  | {
      kind: "soluble-salts";
      mode: "method" | "sequence" | "filter" | "cooling" | "purity";
      instruction: string;
    }
  | {
      kind: "acid-neutralisation";
      mode: "pairs" | "products" | "salts" | "identity" | "evidence";
      instruction: string;
    }
  | {
      kind: "metal-extraction";
      mode: "route" | "source" | "oxygen" | "grade" | "decision";
      instruction: string;
    }
  | {
      kind: "oxygen-redox";
      mode: "oxidation" | "transfer" | "agent" | "mass" | "evidence";
      instruction: string;
    }
  | {
      kind: "metal-reactivity";
      mode: "series" | "observations" | "displacement" | "evidence" | "fair";
      instruction: string;
    }
  | {
      kind: "titration-calculations";
      mode: "titre" | "concentration" | "ratio" | "mass" | "volume";
      instruction: string;
    }
  | {
      kind: "empirical-formulae";
      mode: "masses" | "fraction" | "percent" | "molecular" | "experiment";
      instruction: string;
    }
  | {
      kind: "gas-volumes";
      mode: "molar" | "mass" | "ratio" | "remaining" | "phases";
      instruction: string;
    }
  | {
      kind: "molar-concentration";
      mode: "concentration" | "amount" | "mass" | "units" | "sampling";
      instruction: string;
    }
  | {
      kind: "production-pathways";
      mode: "output" | "throughput" | "byproducts" | "conditions" | "decision";
      instruction: string;
    }
  | {
      kind: "theoretical-yield";
      mode: "maximum" | "percentage" | "collected" | "required" | "limited";
      instruction: string;
    }
  | {
      kind: "atom-economy";
      mode: "weighted" | "desired" | "contrast" | "partition";
      instruction: string;
    }
  | {
      kind: "inverse-atom-economy";
      mode: "allocation" | "equation" | "complement" | "solve";
      instruction: string;
    }
  | {
      kind: "percentage-yield";
      mode: "fraction" | "actual" | "reverse" | "collection";
      instruction: string;
    }
  | {
      kind: "limiting-reactants";
      mode: "capacities" | "masses" | "change" | "plateau";
      instruction: string;
    }
  | {
      kind: "balancing-masses";
      mode: "amounts" | "candidates" | "fraction" | "consumed";
      instruction: string;
    }
  | {
      kind: "reacting-masses";
      mode: "ratio" | "forward" | "required" | "conserved";
      instruction: string;
    }
  | {
      kind: "mole-amounts";
      mode: "mass" | "reverse" | "entities" | "inverse";
      instruction: string;
    }
  | {
      kind: "changing-concentration";
      mode: "factors" | "dilution" | "portion" | "target";
      instruction: string;
    }
  | {
      kind: "solution-concentration";
      mode: "unit-rate" | "basis" | "mass" | "volume";
      instruction: string;
    }
  | {
      kind: "measurement-uncertainty";
      mode: "selection" | "spread" | "bias" | "reproduce";
      instruction: string;
    }
  | {
      kind: "mass-conservation";
      mode: "inventory" | "gas" | "oxidation" | "weighted";
      instruction: string;
    }
  | {
      kind: "equation-balancing";
      mode: "ledger" | "molecules" | "identity" | "words";
      instruction: string;
    }
  | {
      kind: "percentage-composition";
      mode: "contribution" | "count-mass" | "sample" | "compare";
      instruction: string;
    }
  | {
      kind: "formula-mass";
      mode: "count" | "mass" | "brackets" | "quantity";
      instruction: string;
    }
  | {
      kind: "nano-properties";
      mode: "subdivide" | "cube" | "scale" | "evidence";
      instruction: string;
    }
  | {
      kind: "state-properties";
      mode: "solid" | "liquid-gas" | "forecast" | "transition";
      instruction: string;
    }
  | {
      kind: "polymer-properties";
      mode: "chain" | "repeat" | "separation" | "phase";
      instruction: string;
    }
  | {
      kind: "nanotube-properties";
      mode: "tube" | "ratio" | "reinforcement" | "electronics";
      instruction: string;
    }
  | {
      kind: "fullerene-properties";
      mode: "cage" | "separation" | "carrier";
      instruction: string;
    }
  | {
      kind: "graphene-properties";
      mode: "sheet" | "electronics" | "composite";
      instruction: string;
    }
  | {
      kind: "graphite-properties";
      mode: "coordination" | "sliding" | "carriers" | "melting";
      instruction: string;
    }
  | {
      kind: "giant-covalent";
      mode: "diamond" | "energy" | "carriers" | "silica";
      instruction: string;
    }
  | {
      kind: "metallic-properties";
      mode: "attraction" | "conduction" | "layers" | "alloy";
      instruction: string;
    }
  | {
      kind: "molecular-properties";
      mode: "boiling" | "conduction" | "trend";
      instruction: string;
    }
  | {
      kind: "covalent-share";
      molecule:
        "H2" | "Cl2" | "HCl" | "O2" | "N2" | "H2O" | "NH3" | "CH4" | "CO2";
      instruction: string;
    }
  | {
      kind: "ionic-formula";
      compound:
        | "sodiumSulfate"
        | "magnesiumHydroxide"
        | "calciumNitrate"
        | "aluminiumSulfate";
      instruction: string;
    }
  | {
      kind: "ionic-lattice";
      instruction: string;
    }
  | {
      kind: "ionic-conduction";
      phase: "solid" | "molten" | "solution";
      instruction: string;
    }
  | {
      kind: "ionic-transfer";
      compound: "NaCl" | "MgCl2" | "MgO" | "Na2O";
      instruction: string;
    }
  | {
      kind: "transition-compare";
      initial: [
        (
          | "melting"
          | "density"
          | "hardness"
          | "strength"
          | "reactivity"
          | "colour"
          | "charge"
        ),
        (
          | "melting"
          | "density"
          | "hardness"
          | "strength"
          | "reactivity"
          | "colour"
          | "charge"
        ),
      ];
      instruction: string;
    }
  | {
      kind: "transition-ion";
      targetCharge: 2 | 3;
      initialElectrons: number;
      instruction: string;
    }
  | {
      kind: "transition-colour";
      instruction: string;
    }
  | {
      kind: "transition-catalyst";
      initial: ["same" | "greater" | "less", "same" | "greater" | "less"];
      instruction: string;
    }
  | {
      kind: "noble-use";
      use: "balloon" | "filament";
      initial: [
        "helium" | "hydrogen" | "argon",
        "density" | "nonflammable" | "both" | "inert",
      ];
      instruction: string;
    }
  | {
      kind: "halogen-particle";
      halogen: "chlorine" | "bromine" | "iodine";
      initial: "atom" | "molecule" | "ion";
      target: "atom" | "molecule" | "ion";
      instruction: string;
    }
  | {
      kind: "halogen-phase";
      halogen: "chlorine" | "bromine" | "iodine";
      initialTemperature: number;
      targetTemperature: number;
      instruction: string;
    }
  | {
      kind: "halogen-displacement";
      initial: [
        "chlorine" | "bromine" | "iodine",
        "chloride" | "bromide" | "iodide",
        "reaction" | "none",
      ];
      target: [
        "chlorine" | "bromine" | "iodine",
        "chloride" | "bromide" | "iodide",
      ];
      instruction: string;
    }
  | {
      kind: "alkali-reaction";
      initial: [
        "lithium" | "sodium" | "potassium",
        "water" | "chlorine" | "oxygen",
      ];
      target: [
        "lithium" | "sodium" | "potassium",
        "water" | "chlorine" | "oxygen",
      ];
      instruction: string;
    }
  | {
      kind: "alkali-water-equation";
      symbol: "Li" | "Na" | "K";
      instruction: string;
    }
  | {
      kind: "historical-gap";
      initial: "force" | "gap";
      instruction: string;
    }
  | {
      kind: "historical-test";
      instruction: string;
    }
  | {
      kind: "periodic-place";
      atomicNumber: number;
      initial: [number, number];
      instruction: string;
    }
  | {
      kind: "isotope-mixture";
      masses: [number, number];
      initialPercent: number;
      targetPercent: number;
      instruction: string;
    }
  | {
      kind: "nano-convert";
      nanometres: number;
      initialExponent: number;
      instruction: string;
    }
  | {
      kind: "atomic-scale";
      initialRadius: 1 | 10 | 100;
      targetRadius: 1 | 10 | 100;
      instruction: string;
    }
  | { kind: "particles" }
  | {
      kind: "atom-build";
      initial: [number, number, number];
      target: [number, number, number];
      instruction: string;
    }
  | {
      kind: "atom-transform";
      operation: "isotope" | "ion";
      initial: [number, number, number];
      target: [number, number, number];
      instruction: string;
    }
  | {
      kind: "shell-place";
      atomicNumber: number;
      initial: [number, number, number, number];
      instruction: string;
    }
  | {
      kind: "scattering";
      initial: ["spread" | "central", "far" | "near" | "head-on"];
      targetApproach: "far" | "near" | "head-on";
      instruction: string;
    };
export interface LearningTask extends Question {
  purpose: string;
  model?: TaskModel;
  openingHint?: boolean;
  followUp?: string;
}
export interface LessonJourney {
  practiceGroups?: { label: string; taskIds: string[] }[];
  version: 1;
  introduction: string;
  outcomes?: string[];
  scopeNote?: string;
  warmup: LearningTask[];
  refresher: LearningTask[];
  guided: LearningTask[];
  practice: LearningTask[];
  checkForms: LearningTask[][];
  reviewForms: LearningTask[][];
}
export interface Topic {
  slug: string;
  title: string;
  symbol: string;
  description: string;
  colour: string;
}

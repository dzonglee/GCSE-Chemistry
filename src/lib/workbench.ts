import {
  initialHaber,
  validHaber,
  validHaberHistory,
  checkHaber,
} from "./haber";
import {
  initialMaterials,
  validMaterials,
  validMaterialsHistory,
  checkMaterials,
} from "./materials";
import { initialLca, validLca, validLcaHistory, checkLca } from "./life-cycle";
import {
  initialBio,
  validBio,
  validBioHistory,
  checkBio,
} from "./bio-extraction";
import {
  initialWaste,
  validWaste,
  validWasteHistory,
  checkWaste,
} from "./wastewater";
import {
  initialWater,
  validWater,
  validWaterHistory,
  checkWater,
} from "./water";
import {
  initialCycle,
  validCycle,
  validCycleHistory,
  checkCycle,
} from "./cycle";
import {
  initialPollution,
  validPollution,
  validPollutionHistory,
  checkPollution,
} from "./pollution";
import {
  initialClimate,
  validClimate,
  validClimateHistory,
  checkClimate,
} from "./climate";
import {
  initialGreenhouse,
  validGreenhouse,
  validGreenhouseHistory,
  checkGreenhouse,
} from "./greenhouse";
import {
  initialAtmosphere,
  validAtmosphere,
  validAtmosphereHistory,
  checkAtmosphere,
} from "./early-atmosphere";
import {
  initialSeparation,
  validSeparation,
  validSeparationHistory,
  checkSeparation,
} from "./separation-investigation";
import {
  initialInstrumental,
  validInstrumental,
  validInstrumentalHistory,
  checkInstrumental,
} from "./instrumental";
import { initialIon, validIon, validIonHistory, checkIon } from "./ion-tests";
import {
  initialGas,
  validGas,
  validGasHistory,
  checkGas,
} from "./gas-tests-domain";
import {
  initialChroma,
  validChroma,
  validChromaHistory,
  checkChroma,
  compatibleChromaCases,
} from "./chromatography-domain";
import {
  initialPurity,
  validPurity,
  validPurityHistory,
  checkPurity,
  compatiblePurityCases,
} from "./purity-domain";
import {
  initialNaturalBoard,
  validNaturalBoard,
  validNaturalHistory,
  checkNaturalBoard,
} from "./natural";
import {
  initialPathwayBoard as initialOrganicPathwayBoard,
  validPathwayBoard as validOrganicPathwayBoard,
  pathwayHistoryStep as organicPathwayHistoryStep,
  checkPathwayBoard as checkOrganicPathwayBoard,
} from "./pathway-board";
import {
  initialPolymerisationBoard,
  validPolymerisationBoard,
  polymerisationHistoryStep,
  checkPolymerisationBoard,
} from "./polymerisation-board";
import {
  initialAlcoholBoard,
  validAlcoholBoard,
  alcoholHistoryStep,
  checkAlcoholBoard,
} from "./alcohol-board";
import {
  initialCrackingBoard,
  validCrackingBoard,
  crackingHistoryStep,
  checkCrackingBoard,
} from "./cracking-board";
import {
  initialAlkaneBoard,
  validAlkaneBoard,
  alkaneHistoryStep,
  checkAlkaneBoard,
} from "./alkane-board";
import {
  initialOilBoard,
  validOilBoard,
  oilHistoryStep,
  checkOilBoard,
} from "./crude-oil-board";
import {
  initialPracticalBoard as initialRatesPracticalBoard,
  validPracticalBoard as validRatesPracticalBoard,
  practicalHistoryStep as ratesPracticalHistoryStep,
  checkPracticalBoard,
} from "./rates-practical-board";
import {
  initialShiftBoard,
  validShiftBoard,
  shiftHistoryStep,
  shiftBoardCheck,
} from "./equilibrium-shift-board";
import {
  initialReversibleBoard,
  validReversibleBoard,
  reversibleHistoryStep,
  reversibleBoardCheck,
} from "./reversible-board";
import {
  initialThermalBoard,
  validThermalBoard,
  thermalHistoryStep,
  thermalBoardCheck,
} from "./thermal-board";
import {
  initialCollisionBoard,
  validCollisionBoard,
  collisionHistoryStep,
  collisionBoardCheck,
} from "./collision-board";
import {
  initialTangentBoard,
  validTangentBoard,
  tangentHistoryStep,
  tangentPrediction,
  tangentDiagnostic,
} from "./tangent-rates";
import {
  initialRatesBoard,
  validRatesBoard,
  ratesHistoryStep,
  ratesPrediction,
} from "./rate-measurement";
import {
  initialVoltageBoard,
  validVoltageBoard,
  voltageHistoryStep,
  voltagePrediction,
} from "./cell-voltage";
import {
  initialFuelHalfBoard,
  validFuelHalfBoard,
  fuelHalfHistoryStep,
  fuelHalfPrediction,
} from "./fuel-half";
import {
  initialPracticalBoard,
  validPracticalBoard,
  practicalPrediction,
  practicalHistoryStep,
} from "./energy-practical";
import {
  initialTechniqueBoard,
  validTechniqueBoard,
  techniquePrediction,
} from "./titration-technique";
import {
  initialStrengthBoard,
  validStrengthBoard,
  strengthPrediction,
} from "./acid-strength";
import { initialPhBoard, validPhBoard, phPrediction } from "./ph-evidence";
import {
  initialHalfBoard,
  validHalfBoard,
  halfPrediction,
} from "./half-equations";
import {
  initialAqueousBoard,
  validAqueousBoard,
  aqueousPrediction,
} from "./aqueous-products";
import {
  initialElectrolysisBoard,
  validElectrolysisBoard,
  electrolysisPrediction,
} from "./electrolysis";
import {
  initialSaltBoard,
  validSaltBoard,
  saltPrediction,
  saltExpected,
} from "./soluble-salts";
import {
  initialAcidBoard,
  validAcidBoard,
  acidPrediction,
} from "./acid-neutralisation";
import {
  initialExtractionBoard,
  validExtractionBoard,
  extractionPrediction,
} from "./metal-extraction";
import {
  initialOxygenBoard,
  validOxygenBoard,
  oxygenPrediction,
} from "./oxygen-redox";
import {
  initialMetalBoard,
  validMetalBoard,
  metalRecords,
  metalPrediction,
} from "./metal-reactivity";
import {
  initialTitrationBoard,
  validTitrationBoard,
  titrationPrediction,
} from "./titration-calculations";
import {
  initialEmpiricalBoard,
  validEmpiricalBoard,
  empiricalPrediction,
} from "./empirical-formulae";
import { initialGasBoard, validGasBoard, gasPrediction } from "./gas-volumes";
import {
  initialMolarBoard,
  validMolarBoard,
  molarPrediction,
} from "./molar-concentration";
import {
  initialPathwayBoard,
  validPathwayBoard,
  pathwayPrediction,
} from "./production-pathways";
import {
  initialTheoryBoard,
  validTheoryBoard,
  theoryPrediction,
} from "./theoretical-yield";
import {
  initialEconomyBoard,
  validEconomyBoard,
  economyPrediction,
} from "./atom-economy";
import {
  initialInverseEconomyBoard,
  validInverseEconomyBoard,
  inverseEconomyPrediction,
} from "./inverse-atom-economy";
import {
  initialYieldBoard,
  validYieldBoard,
  yieldPrediction,
} from "./percentage-yield";
import {
  initialLimitingBoard,
  validLimitingBoard,
  limitingPrediction,
} from "./limiting-reactants";
import {
  initialMassBalanceBoard,
  validMassBalanceBoard,
  massBalancePrediction,
} from "./balancing-masses";
import {
  initialReactingBoard,
  validReactingBoard,
  reactingPrediction,
} from "./reacting-masses";
import {
  initialMoleBoard,
  validMoleBoard,
  molePrediction,
} from "./mole-amounts";
import {
  initialChangeBoard,
  validChangeBoard,
  changePrediction,
} from "./changing-concentration";
import {
  initialConcentrationBoard,
  validConcentrationBoard,
  concentrationPrediction,
} from "./solution-concentration";
import {
  initialMeasurementBoard,
  validMeasurementBoard,
  measurementPrediction,
} from "./measurement-uncertainty";
import {
  initialMassBoard,
  validMassBoard,
  massPrediction,
} from "./mass-conservation";
import {
  initialBalanceBoard,
  validBalanceBoard,
  balancePrediction,
} from "./equation-balancing";
import {
  initialCompositionBoard,
  validCompositionBoard,
  compositionPrediction,
} from "./percentage-composition";
import {
  initialFormulaMassBoard,
  validFormulaMassBoard,
  formulaMassPrediction,
} from "./formula-mass";
import {
  initialNanoBoard,
  validNanoBoard,
  nanoPrediction,
} from "./nanoparticles";
import {
  initialStateBoard,
  validStateBoard,
  statePrediction,
} from "./states-of-matter";
import {
  initialPolymerBoard,
  validPolymerBoard,
  polymerPrediction,
} from "./polymer-structures";
import {
  initialNanotubeBoard,
  validNanotubeBoard,
  nanotubePrediction,
} from "./nanotubes";
import {
  initialFullereneBoard,
  validFullereneBoard,
  fullerenePrediction,
} from "./fullerenes";
import {
  initialGrapheneBoard,
  validGrapheneBoard,
  graphenePrediction,
} from "./graphene";
import {
  initialGraphiteBoard,
  validGraphiteBoard,
  graphitePrediction,
} from "./graphite";
import {
  initialNetworkBoard,
  validNetworkBoard,
  networkPrediction,
} from "./diamond";
import {
  initialMetallicBoard,
  validMetallicBoard,
  metallicPrediction,
} from "./metallic-properties";
import {
  initialMolecularBoard,
  validMolecularBoard,
  molecularPropertyPrediction,
} from "./molecular-properties";
import {
  bondInitial,
  validBondBoard,
  bondCorrect,
  bondHistoryStep,
} from "./bond-energy";
import type { TaskModel, WorkbenchState, LessonJourney } from "@/content/types";
import { tasks } from "@/content/journeys/helpers";
import { firstTwentyArrangement } from "./shells";
import { periodicPosition } from "./periodic-position";
import { waterEquationCounts } from "./alkali";
import { displacement, type Halogen, type Halide } from "./halogens";
import { comparisonStatements, physicalComparisons } from "./transition-metals";
import { transferCells, ionicLedger, ionicCompounds } from "./ionic";
import { ionicPhaseEvidence } from "./ionic-structures";
import { formulaCases, formulaLedger } from "./ionic-formulae";
import { covalentKeys, covalentLedger, covalentMolecules } from "./covalent";
import {
  initialDisplacementBoard,
  validDisplacementBoard,
  displacementPrediction,
} from "./displacement-redox";
import {
  initialEnergyBoard,
  validEnergyBoard,
  energyPrediction,
} from "./energy-transfer";
import {
  initialProfileBoard,
  validProfileBoard,
  profilePrediction,
  profileHistoryStep,
} from "./reaction-profiles";
export const formatCharge = (charge: number) =>
  charge < 0 ? `−${Math.abs(charge)}` : charge > 0 ? `+${charge}` : "0";
export function initialBoard(model: TaskModel): WorkbenchState {
  switch (model.kind) {
    case "haber-investigation":
      return initialHaber(model.mode, model.record);
    case "materials-investigation":
      return initialMaterials(model.mode, model.record);
    case "life-cycle-investigation":
      return initialLca(model.mode, model.record);
    case "bio-extraction-investigation":
      return initialBio(model.mode, model.record);
    case "wastewater-investigation":
      return initialWaste(model.mode, model.record);
    case "water-investigation":
      return initialWater(model.mode, model.record);
    case "carbon-cycle-investigation":
      return initialCycle(model.mode, model.record);
    case "pollution-investigation":
      return initialPollution(model.mode, model.record);
    case "climate-investigation":
      return initialClimate(model.mode, model.record);
    case "greenhouse-investigation":
      return initialGreenhouse(model.mode, model.record);
    case "atmosphere-investigation":
      return initialAtmosphere(model.mode, model.record);
    case "separation-investigation":
      return initialSeparation(model.mode, model.record);
    case "instrumental-investigation":
      return initialInstrumental(model.mode, model.record);
    case "ion-test-investigation":
      return initialIon(model.mode, model.record);
    case "gas-test-investigation":
      return initialGas(model.mode, model.record);
    case "chromatography-investigation":
      return initialChroma(model.mode, model.record);
    case "purity-separation":
      return initialPurity(model.mode, model.record);
    case "natural-polymers":
      return initialNaturalBoard(model.mode, model.record);
    case "pathways":
      return initialOrganicPathwayBoard(model.mode, model.record);
    case "polymerisation":
      return initialPolymerisationBoard(model.mode, model.record);
    case "alcohol":
      return initialAlcoholBoard(model.mode, model.record);
    case "cracking":
      return initialCrackingBoard(model.mode, model.record);
    case "alkanes":
      return initialAlkaneBoard(model.mode, model.record);
    case "crude-oil":
      return initialOilBoard(model.mode, model.record);
    case "rates-practical":
      return initialRatesPracticalBoard(model.mode, model.record);
    case "equilibrium-shift":
      return initialShiftBoard(model.mode, model.record);
    case "reversible-equilibrium":
      return initialReversibleBoard(model.mode, model.record);
    case "temperature-catalysts":
      return initialThermalBoard(model.mode, model.record);
    case "collision-theory":
      return initialCollisionBoard(model.mode, model.record);
    case "tangent-rates":
      return initialTangentBoard(model.mode, model.record);
    case "rate-measurement":
      return initialRatesBoard(model.mode, model.record);
    case "cell-voltage":
      return initialVoltageBoard(model.mode, model.record);
    case "fuel-half":
      return initialFuelHalfBoard(model.mode, model.record);
    case "cells-workbench":
      return initialCellsBoard(model.mode, model.record);
    case "bond-energy":
      return bondInitial(model.mode, model.record);
    case "reaction-profile":
      return initialProfileBoard(model.mode, model.record);
    case "energy-practical":
      return initialPracticalBoard(model.mode, model.record);
    case "thermal-transfer":
      return initialEnergyBoard(model.mode, model.record);
    case "displacement-redox":
      return initialDisplacementBoard(model.mode, model.record);
    case "titration-technique":
      return initialTechniqueBoard(model.mode);
    case "acid-evidence":
      return initialStrengthBoard(model.mode);
    case "ph-evidence":
      return initialPhBoard(model.mode);
    case "electron-redox":
      return initialHalfBoard(model.mode);
    case "aqueous-products":
      return initialAqueousBoard(model.mode);
    case "electrolysis-process":
      return initialElectrolysisBoard(model.mode);
    case "soluble-salts":
      return initialSaltBoard(model.mode);
    case "acid-neutralisation":
      return initialAcidBoard(model.mode);
    case "metal-extraction":
      return initialExtractionBoard(model.mode);
    case "oxygen-redox":
      return initialOxygenBoard(model.mode);
    case "metal-reactivity":
      return initialMetalBoard(model.mode);
    case "titration-calculations":
      return initialTitrationBoard(model.mode);
    case "empirical-formulae":
      return initialEmpiricalBoard(model.mode);
    case "gas-volumes":
      return initialGasBoard(model.mode);
    case "molar-concentration":
      return initialMolarBoard(model.mode);
    case "production-pathways":
      return initialPathwayBoard(model.mode);
    case "theoretical-yield":
      return initialTheoryBoard(model.mode);
    case "atom-economy":
      return initialEconomyBoard(model.mode);
    case "inverse-atom-economy":
      return initialInverseEconomyBoard(model.mode);
    case "percentage-yield":
      return initialYieldBoard(model.mode);
    case "limiting-reactants":
      return initialLimitingBoard(model.mode);
    case "balancing-masses":
      return initialMassBalanceBoard(model.mode);
    case "reacting-masses":
      return initialReactingBoard(model.mode);
    case "mole-amounts":
      return initialMoleBoard(model.mode);
    case "changing-concentration":
      return initialChangeBoard(model.mode);
    case "solution-concentration":
      return initialConcentrationBoard(model.mode);
    case "measurement-uncertainty":
      return initialMeasurementBoard(model.mode);
    case "mass-conservation":
      return initialMassBoard(model.mode);
    case "equation-balancing":
      return initialBalanceBoard(model.mode);
    case "percentage-composition":
      return initialCompositionBoard(model.mode);
    case "formula-mass":
      return initialFormulaMassBoard(model.mode);
    case "nano-properties":
      return initialNanoBoard(model.mode);
    case "state-properties":
      return initialStateBoard(model.mode);
    case "polymer-properties":
      return initialPolymerBoard(model.mode);
    case "nanotube-properties":
      return initialNanotubeBoard(model.mode);
    case "fullerene-properties":
      return initialFullereneBoard(model.mode);
    case "graphene-properties":
      return initialGrapheneBoard(model.mode);
    case "graphite-properties":
      return initialGraphiteBoard(model.mode);
    case "giant-covalent":
      return initialNetworkBoard(model.mode);
    case "metallic-properties":
      return initialMetallicBoard(model.mode);
    case "molecular-properties":
      return initialMolecularBoard(model.mode);
    case "covalent-share":
      return Object.fromEntries(
        covalentKeys(model.molecule).map((key) => [key, 0]),
      );
    case "ionic-formula":
      return { cations: 1, anions: 1 };
    case "ionic-lattice":
      return { focus: "Na+", neighbours: 0 };
    case "ionic-conduction":
      return { conducts: "no", carrier: "electrons" };
    case "ionic-transfer":
      return Object.fromEntries(
        transferCells(model.compound).map((c) => [c.key, 0]),
      );
    case "transition-compare":
      return { first: model.initial[0], second: model.initial[1] };
    case "transition-ion":
      return { electrons: model.initialElectrons };
    case "transition-catalyst":
      return { early: model.initial[0], final: model.initial[1] };
    case "transition-colour":
      return { condition: "dry", colour: "unset" };
    case "noble-use":
      return { gas: model.initial[0], reason: model.initial[1] };
    case "halogen-particle":
      return { representation: model.initial };
    case "halogen-phase":
      return { temperature: model.initialTemperature };
    case "halogen-displacement":
      return {
        added: model.initial[0],
        halide: model.initial[1],
        prediction: model.initial[2],
      };
    case "alkali-reaction":
      return { metal: model.initial[0], partner: model.initial[1] };
    case "alkali-water-equation":
      return { metal: 1, water: 1, hydroxide: 1, hydrogen: 1 };
    case "historical-gap":
      return { arrangement: model.initial };
    case "historical-test":
      return { candidate: "conflict", verdict: "support" };
    case "periodic-place":
      return { group: model.initial[0], period: model.initial[1] };
    case "isotope-mixture":
      return { lightPercent: model.initialPercent };
    case "nano-convert":
      return { exponent: model.initialExponent };
    case "atomic-scale":
      return { radius: model.initialRadius };
    case "particles":
      return { proton: "unplaced", neutron: "unplaced", electron: "unplaced" };
    case "atom-build":
    case "atom-transform":
      return { p: model.initial[0], n: model.initial[1], e: model.initial[2] };
    case "shell-place":
      return Object.fromEntries(
        model.initial.map((count, i) => [`s${i + 1}`, count]),
      );
    case "scattering":
      return { distribution: model.initial[0], approach: model.initial[1] };
  }
}
const integer = (x: unknown, low: number, high: number) =>
  typeof x === "number" && Number.isSafeInteger(x) && x >= low && x <= high;
const oneOf = (x: unknown, values: (string | number)[]) =>
  values.includes(x as string | number);
export function validBoard(
  model: TaskModel,
  board: unknown,
): board is WorkbenchState {
  if (!board || typeof board !== "object" || Array.isArray(board)) return false;
  const b = board as WorkbenchState;
  if (model.kind === "haber-investigation")
    return validHaber(model.mode, b, model.record);
  if (model.kind === "materials-investigation")
    return validMaterials(model.mode, b, model.record);
  if (model.kind === "life-cycle-investigation")
    return validLca(model.mode, b, model.record);
  if (model.kind === "bio-extraction-investigation")
    return validBio(model.mode, b, model.record);
  if (model.kind === "wastewater-investigation")
    return validWaste(model.mode, b, model.record);
  if (model.kind === "water-investigation")
    return validWater(model.mode, b, model.record);
  if (model.kind === "carbon-cycle-investigation")
    return validCycle(model.mode, b, model.record);
  if (model.kind === "pollution-investigation")
    return validPollution(model.mode, b, model.record);
  if (model.kind === "climate-investigation")
    return validClimate(model.mode, b, model.record);
  if (model.kind === "greenhouse-investigation")
    return validGreenhouse(model.mode, b, model.record);
  if (model.kind === "atmosphere-investigation")
    return validAtmosphere(model.mode, b, model.record);
  if (model.kind === "separation-investigation")
    return validSeparation(model.mode, b, model.record);
  if (model.kind === "instrumental-investigation")
    return validInstrumental(model.mode, b, model.record);
  if (model.kind === "ion-test-investigation")
    return validIon(model.mode, b, model.record);
  if (model.kind === "gas-test-investigation")
    return validGas(model.mode, b, model.record);
  // Mixture comparisons contain different numbers of distinct components.
  // Validate the selected record’s exact schema before fixed-size models.
  if (model.kind === "chromatography-investigation")
    return (
      validChroma(model.mode, b) &&
      compatibleChromaCases(model.mode, model.focus ?? "all").includes(
        b.record as string,
      )
    );
  if (model.kind === "purity-separation")
    return (
      validPurity(model.mode, b) &&
      compatiblePurityCases(model.mode, model.focus ?? "all").includes(
        b.record as string,
      )
    );
  if (model.kind === "natural-polymers")
    return validNaturalBoard(model.mode, b);
  if (model.kind === "pathways") return validOrganicPathwayBoard(model.mode, b);
  if (model.kind === "polymerisation")
    return validPolymerisationBoard(model.mode, b);
  if (model.kind === "alcohol") return validAlcoholBoard(model.mode, b);
  if (model.kind === "cracking") return validCrackingBoard(model.mode, b);
  if (model.kind === "alkanes") return validAlkaneBoard(model.mode, b);
  if (model.kind === "crude-oil") return validOilBoard(model.mode, b);
  const keys = Object.keys(initialBoard(model));
  if (Object.keys(b).length !== keys.length || !keys.every((k) => k in b))
    return false;
  switch (model.kind) {
    case "bond-energy":
      return validBondBoard(model.mode, b);
    case "reaction-profile":
      return validProfileBoard(model.mode, b);
    case "rates-practical":
      return validRatesPracticalBoard(model.mode, b);
    case "equilibrium-shift":
      return validShiftBoard(model.mode, b);
    case "reversible-equilibrium":
      return validReversibleBoard(model.mode, b);
    case "temperature-catalysts":
      return validThermalBoard(model.mode, b);
    case "collision-theory":
      return validCollisionBoard(model.mode, b);
    case "tangent-rates":
      return validTangentBoard(model.mode, b);
    case "rate-measurement":
      return validRatesBoard(model.mode, b);
    case "cell-voltage":
      return validVoltageBoard(model.mode, b);
    case "fuel-half":
      return validFuelHalfBoard(model.mode, b);
    case "cells-workbench":
      return validCellsBoard(model.mode, b);
    case "energy-practical":
      return validPracticalBoard(model.mode, b);
    case "thermal-transfer":
      return validEnergyBoard(model.mode, b);
    case "displacement-redox":
      return validDisplacementBoard(model.mode, b);
    case "titration-technique":
      return validTechniqueBoard(model.mode, b);
    case "acid-evidence":
      return validStrengthBoard(model.mode, b);
    case "ph-evidence":
      return validPhBoard(model.mode, b);
    case "electron-redox":
      return validHalfBoard(model.mode, b);
    case "aqueous-products":
      return validAqueousBoard(model.mode, b);
    case "electrolysis-process":
      return validElectrolysisBoard(model.mode, b);
    case "soluble-salts":
      return validSaltBoard(model.mode, b);
    case "acid-neutralisation":
      return validAcidBoard(model.mode, b);
    case "metal-extraction":
      return validExtractionBoard(model.mode, b);
    case "oxygen-redox":
      return validOxygenBoard(model.mode, b);
    case "metal-reactivity":
      return validMetalBoard(model.mode, b);
    case "titration-calculations":
      return validTitrationBoard(model.mode, b);
    case "empirical-formulae":
      return validEmpiricalBoard(model.mode, b);
    case "gas-volumes":
      return validGasBoard(model.mode, b);
    case "molar-concentration":
      return validMolarBoard(model.mode, b);
    case "production-pathways":
      return validPathwayBoard(model.mode, b);
    case "theoretical-yield":
      return validTheoryBoard(model.mode, b);
    case "atom-economy":
      return validEconomyBoard(model.mode, b);
    case "inverse-atom-economy":
      return validInverseEconomyBoard(model.mode, b);
    case "percentage-yield":
      return validYieldBoard(model.mode, b);
    case "limiting-reactants":
      return validLimitingBoard(model.mode, b);
    case "balancing-masses":
      return validMassBalanceBoard(model.mode, b);
    case "reacting-masses":
      return validReactingBoard(model.mode, b);
    case "mole-amounts":
      return validMoleBoard(model.mode, b);
    case "changing-concentration":
      return validChangeBoard(model.mode, b);
    case "solution-concentration":
      return validConcentrationBoard(model.mode, b);
    case "measurement-uncertainty":
      return validMeasurementBoard(model.mode, b);
    case "mass-conservation":
      return validMassBoard(model.mode, b);
    case "equation-balancing":
      return validBalanceBoard(model.mode, b);
    case "percentage-composition":
      return validCompositionBoard(model.mode, b);
    case "formula-mass":
      return validFormulaMassBoard(model.mode, b);
    case "nano-properties":
      return validNanoBoard(model.mode, b);
    case "state-properties":
      return validStateBoard(model.mode, b);
    case "polymer-properties":
      return validPolymerBoard(model.mode, b);
    case "nanotube-properties":
      return validNanotubeBoard(model.mode, b);
    case "fullerene-properties":
      return validFullereneBoard(model.mode, b);
    case "graphene-properties":
      return validGrapheneBoard(model.mode, b);
    case "graphite-properties":
      return validGraphiteBoard(model.mode, b);
    case "giant-covalent":
      return validNetworkBoard(model.mode, b);
    case "metallic-properties":
      return validMetallicBoard(model.mode, b);
    case "molecular-properties":
      return validMolecularBoard(model.mode, b);
    case "covalent-share": {
      const spec = covalentMolecules[model.molecule],
        ledger = covalentLedger(model.molecule, b);
      return (
        keys.every((key) => integer(b[key], 0, 3)) &&
        ledger.centreRemaining >= 0 &&
        ledger.partnerRemaining.every(
          (n, i) =>
            n >= 0 && Number(b[`partner${i}`]) <= spec.partners[i].outer,
        )
      );
    }
    case "ionic-formula":
      return integer(b.cations, 1, 6) && integer(b.anions, 1, 6);
    case "ionic-lattice":
      return (
        oneOf(b.focus, ["Na+", "Cl-"]) && oneOf(b.neighbours, [0, 2, 4, 6, 8])
      );
    case "ionic-conduction":
      return (
        oneOf(b.conducts, ["yes", "no"]) &&
        oneOf(b.carrier, ["fixed", "mobile", "electrons"])
      );
    case "ionic-transfer":
      return (
        keys.every((k) => integer(b[k], 0, 2)) &&
        ionicLedger(model.compound, b).lost.every(
          (n) => n <= ionicCompounds[model.compound].metal.outer,
        )
      );
    case "transition-compare":
      return (
        oneOf(b.first, Object.keys(comparisonStatements)) &&
        oneOf(b.second, Object.keys(comparisonStatements))
      );
    case "transition-ion":
      return integer(b.electrons, 23, 26);
    case "transition-catalyst":
      return (
        oneOf(b.early, ["same", "greater", "less"]) &&
        oneOf(b.final, ["same", "greater", "less"])
      );
    case "transition-colour":
      return (
        oneOf(b.condition, ["dry", "wet"]) &&
        oneOf(b.colour, ["unset", "blue", "pink"])
      );
    case "noble-use":
      return (
        oneOf(b.gas, ["helium", "hydrogen", "argon"]) &&
        oneOf(b.reason, ["density", "nonflammable", "both", "inert"])
      );
    case "halogen-particle":
      return oneOf(b.representation, ["atom", "molecule", "ion"]);
    case "halogen-phase":
      return (
        integer(b.temperature, -120, 220) && Number(b.temperature) % 10 === 0
      );
    case "halogen-displacement":
      return (
        oneOf(b.added, ["chlorine", "bromine", "iodine"]) &&
        oneOf(b.halide, ["chloride", "bromide", "iodide"]) &&
        oneOf(b.prediction, ["reaction", "none"])
      );
    case "alkali-reaction":
      return (
        oneOf(b.metal, ["lithium", "sodium", "potassium"]) &&
        oneOf(b.partner, ["water", "chlorine", "oxygen"])
      );
    case "alkali-water-equation":
      return keys.every((k) => integer(b[k], 0, 6));
    case "historical-gap":
      return oneOf(b.arrangement, ["force", "gap"]);
    case "historical-test":
      return (
        oneOf(b.candidate, ["match", "conflict"]) &&
        oneOf(b.verdict, ["support", "investigate", "proof"])
      );
    case "periodic-place":
      return integer(b.group, 0, 7) && integer(b.period, 1, 4);
    case "isotope-mixture":
      return (
        integer(b.lightPercent, 0, 100) && Number(b.lightPercent) % 5 === 0
      );
    case "nano-convert":
      return integer(b.exponent, -12, -6);
    case "atomic-scale":
      return oneOf(b.radius, [1, 10, 100]);
    case "scattering":
      return (
        oneOf(b.distribution, ["spread", "central"]) &&
        oneOf(b.approach, ["far", "near", "head-on"])
      );
    case "shell-place":
      return (
        keys.every((key, i) => integer(b[key], 0, [2, 8, 8, 2][i])) &&
        keys.reduce((total, key) => total + Number(b[key]), 0) <=
          model.atomicNumber
      );
    case "particles":
      return keys.every((k) => oneOf(b[k], ["unplaced", "nucleus", "shells"]));
    case "atom-build":
      return integer(b.p, 1, 20) && integer(b.n, 0, 30) && integer(b.e, 0, 20);
    case "atom-transform":
      return (
        integer(b.p, 1, 20) &&
        integer(b.n, 0, 30) &&
        integer(b.e, 0, 20) &&
        b.p === model.initial[0] &&
        (model.operation === "isotope"
          ? b.e === model.initial[2]
          : b.n === model.initial[1])
      );
  }
}
export function sameBoard(a: WorkbenchState, b: WorkbenchState) {
  return Object.keys(a).every((k) => a[k] === b[k]);
}
export function validHistory(
  model: TaskModel,
  history: unknown,
): history is WorkbenchState[] {
  if (model.kind === "haber-investigation")
    return validHaberHistory(model.mode, model.record, history);
  if (model.kind === "materials-investigation")
    return validMaterialsHistory(model.mode, model.record, history);
  if (model.kind === "life-cycle-investigation")
    return validLcaHistory(model.mode, model.record, history);
  if (model.kind === "bio-extraction-investigation")
    return validBioHistory(model.mode, model.record, history);
  if (model.kind === "wastewater-investigation")
    return validWasteHistory(model.mode, model.record, history);
  if (model.kind === "water-investigation")
    return validWaterHistory(model.mode, model.record, history);
  if (model.kind === "carbon-cycle-investigation")
    return validCycleHistory(model.mode, model.record, history);
  if (model.kind === "pollution-investigation")
    return validPollutionHistory(model.mode, model.record, history);
  if (model.kind === "climate-investigation")
    return validClimateHistory(model.mode, model.record, history);
  if (model.kind === "greenhouse-investigation")
    return validGreenhouseHistory(model.mode, model.record, history);
  if (model.kind === "atmosphere-investigation")
    return validAtmosphereHistory(model.mode, model.record, history);
  if (model.kind === "separation-investigation")
    return validSeparationHistory(model.mode, model.record, history);
  if (model.kind === "instrumental-investigation")
    return validInstrumentalHistory(model.mode, model.record, history);
  if (model.kind === "ion-test-investigation")
    return validIonHistory(model.mode, model.record, history);
  if (model.kind === "gas-test-investigation")
    return validGasHistory(model.mode, model.record, history);
  if (model.kind === "chromatography-investigation")
    return validChromaHistory(
      model.mode,
      model.record,
      history,
      model.focus ?? "all",
    );
  if (model.kind === "purity-separation")
    return validPurityHistory(
      model.mode,
      model.record,
      history,
      model.focus ?? "all",
    );
  if (model.kind === "natural-polymers")
    return validNaturalHistory(model.mode, history, model.record ?? "initial");
  if (
    !Array.isArray(history) ||
    history.length < 1 ||
    history.length > 500 ||
    !history.every((b) => validBoard(model, b)) ||
    !sameBoard(initialBoard(model), history[0])
  )
    return false;
  return history.every((board, i) => {
    if (i === 0) return true;
    const changed = Object.keys(board).filter(
      (key) => board[key] !== history[i - 1][key],
    );
    if (model.kind === "titration-technique") {
      const previous = history[i - 1];
      if (changed.includes("record"))
        return sameBoard(
          initialTechniqueBoard(model.mode, String(board.record)),
          board,
        );
      if (changed.length !== 1) return false;
      if (model.mode === "repeats" && changed[0] === "selected") {
        const before = String(previous.selected).split(",").filter(Boolean),
          after = String(board.selected).split(",").filter(Boolean);
        return (
          before.filter((id) => !after.includes(id)).length +
            after.filter((id) => !before.includes(id)).length ===
          1
        );
      }
      if (model.mode === "sequence" && changed[0] === "order") {
        const before = String(previous.order).split(","),
          after = String(board.order).split(",");
        const moved = before
          .map((v, j) => (v !== after[j] ? j : -1))
          .filter((j) => j >= 0);
        return (
          moved.length === 2 &&
          moved[1] === moved[0] + 1 &&
          before[moved[0]] === after[moved[1]] &&
          before[moved[1]] === after[moved[0]]
        );
      }
      return true;
    }
    if (model.kind === "bond-energy")
      return bondHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "reaction-profile")
      return profileHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "pathways")
      return organicPathwayHistoryStep(
        model.mode,
        history[i - 1] as Record<string, string>,
        board as Record<string, string>,
      );
    if (model.kind === "polymerisation")
      return polymerisationHistoryStep(
        model.mode,
        history[i - 1] as Record<string, string>,
        board as Record<string, string>,
      );
    if (model.kind === "alcohol")
      return alcoholHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "cracking")
      return crackingHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "alkanes")
      return alkaneHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "crude-oil")
      return oilHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "rates-practical")
      return ratesPracticalHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "equilibrium-shift")
      return shiftHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "reversible-equilibrium")
      return reversibleHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "temperature-catalysts")
      return thermalHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "collision-theory")
      return collisionHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "tangent-rates")
      return tangentHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "rate-measurement")
      return ratesHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "cell-voltage")
      return voltageHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "fuel-half")
      return fuelHalfHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "cells-workbench")
      return cellsHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "energy-practical")
      return practicalHistoryStep(model.mode, history[i - 1], board);
    if (model.kind === "thermal-transfer") {
      if (changed.includes("record"))
        return sameBoard(
          initialEnergyBoard(model.mode, String(board.record)),
          board,
        );
      if (changed.length !== 1) return false;
      if (model.mode === "transfer" && changed[0] === "transfer")
        return (
          Math.abs(Number(board.transfer) - Number(history[i - 1].transfer)) ===
          1
        );
      return true;
    }
    if (model.kind === "displacement-redox") {
      if (changed.includes("record"))
        return sameBoard(
          initialDisplacementBoard(model.mode, String(board.record)),
          board,
        );
      if (changed.length !== 1) return false;
      if (model.mode === "combine" || model.mode === "ledger")
        return (
          Math.abs(
            Number(board[changed[0]]) - Number(history[i - 1][changed[0]]),
          ) === 1
        );
      return true;
    }
    if (model.kind === "acid-evidence") {
      const previous = history[i - 1];
      if (changed.includes("record"))
        return sameBoard(
          initialStrengthBoard(model.mode, String(board.record)),
          board,
        );
      if (
        (model.mode === "factors" && changed.includes("ph")) ||
        (model.mode === "dilution" && changed.includes("steps"))
      )
        return (
          changed.length === 1 &&
          Math.abs(Number(board[changed[0]]) - Number(previous[changed[0]])) ===
            1
        );
      return changed.length === 1;
    }
    if (model.kind === "ph-evidence") {
      const previous = history[i - 1];
      if (changed.includes("record"))
        return sameBoard(
          { ...initialPhBoard(model.mode), record: board.record },
          board,
        );
      if (changed.includes("guess") || changed.includes("point"))
        return (
          changed.length === 1 &&
          Math.abs(Number(board[changed[0]]) - Number(previous[changed[0]])) ===
            1
        );
      return changed.length === 1;
    }
    if (model.kind === "electron-redox") {
      const previous = history[i - 1];
      if (changed.includes("record")) {
        const reset = { ...initialHalfBoard(model.mode), record: board.record };
        return sameBoard(reset, board);
      }
      if (changed.some((k) => ["delta", "a", "b", "c", "d"].includes(k)))
        return (
          changed.length === 1 &&
          Math.abs(Number(board[changed[0]]) - Number(previous[changed[0]])) ===
            1
        );
      return changed.length === 1;
    }
    if (
      model.kind === "aqueous-products" &&
      (model.mode === "graph" || model.mode === "reading")
    ) {
      const previous = history[i - 1],
        field = model.mode === "graph" ? "volume" : "ticks";
      if (changed.includes("record"))
        return (
          board[field] === "0" &&
          changed.every((k) => k === "record" || k === field)
        );
      if (changed.includes(field))
        return (
          changed.length === 1 &&
          Math.abs(Number(board[field]) - Number(previous[field])) === 1
        );
    }
    if (model.kind === "electrolysis-process" && model.mode === "movement") {
      const previous = history[i - 1];
      if (changed.includes("record"))
        return (
          board.position === "0" &&
          changed.every((k) => k === "record" || k === "position")
        );
      if (changed.includes("position"))
        return (
          changed.length === 1 &&
          Math.abs(Number(board.position) - Number(previous.position)) === 1
        );
    }
    if (
      model.kind === "soluble-salts" &&
      model.mode === "sequence" &&
      changed.includes("stage")
    ) {
      const previous = history[i - 1];
      return (
        changed.length === 1 &&
        Number(board.stage) === Number(previous.stage) + 1 &&
        previous.next === saltExpected("sequence", previous).next
      );
    }
    if (model.kind === "acid-neutralisation" && model.mode === "pairs") {
      if (changed.includes("record"))
        return (
          board.steps === "0" &&
          changed.every((k) => k === "record" || k === "steps")
        );
      if (changed.includes("steps"))
        return (
          changed.length === 1 &&
          Number(board.steps) === Number(history[i - 1].steps) + 1
        );
    }
    if (
      model.kind === "oxygen-redox" &&
      (model.mode === "oxidation" || model.mode === "transfer") &&
      changed.includes("oxygen")
    ) {
      return (
        changed.length === 1 &&
        (history[i - 1].oxygen === "unset"
          ? board.oxygen === "1"
          : Math.abs(Number(board.oxygen) - Number(history[i - 1].oxygen)) ===
            1)
      );
    }
    if (model.kind === "metal-reactivity" && model.mode === "series") {
      const previous = history[i - 1];
      if (board.record !== previous.record) {
        return (
          changed.length === 2 &&
          board.order ===
            metalRecords.series[
              String(board.record) as keyof typeof metalRecords.series
            ].metals.join(",")
        );
      }
      const before = String(previous.order).split(","),
        after = String(board.order).split(",");
      const moved = before
        .map((v, j) => (v !== after[j] ? j : -1))
        .filter((j) => j >= 0);
      return (
        changed.length === 1 &&
        changed[0] === "order" &&
        moved.length === 2 &&
        moved[1] === moved[0] + 1 &&
        before[moved[0]] === after[moved[1]] &&
        before[moved[1]] === after[moved[0]]
      );
    }
    return (
      changed.length === 1 &&
      ((model.kind !== "metallic-properties" &&
        model.kind !== "graphite-properties" &&
        model.kind !== "fullerene-properties" &&
        model.kind !== "polymer-properties" &&
        model.kind !== "state-properties") ||
        !["drift", "shift", "gap", "units", "frame"].includes(changed[0]) ||
        Math.abs(
          Number(board[changed[0]]) - Number(history[i - 1][changed[0]]),
        ) === 1) &&
      ((model.kind !== "shell-place" &&
        model.kind !== "ionic-transfer" &&
        model.kind !== "ionic-formula" &&
        model.kind !== "covalent-share") ||
        Math.abs(
          Number(board[changed[0]]) - Number(history[i - 1][changed[0]]),
        ) === 1)
    );
  });
}
export function validTaskModels(journey: LessonJourney, models: unknown) {
  if (!models || typeof models !== "object" || Array.isArray(models))
    return false;
  return Object.entries(models).every(([id, history]) => {
    const model = tasks(journey).find((q) => q.id === id)?.model;
    return model !== undefined && validHistory(model, history);
  });
}
export function checkBoard(
  model: TaskModel,
  b: WorkbenchState,
): { correct: boolean; feedback: string } {
  if (model.kind === "titration-technique") {
    const p = techniquePrediction(model.mode, b);
    return { correct: p.correct, feedback: p.explanation };
  }
  const fail = (feedback: string) => ({ correct: false, feedback });
  const pass = (feedback: string) => ({ correct: true, feedback });
  switch (model.kind) {
    case "bond-energy": {
      const correct = bondCorrect(model.mode, b);
      return {
        correct,
        feedback: correct
          ? "That’s right. Each supplied bond entry, coefficient and signed energy difference agrees."
          : "Keep your proposal. Recount the displayed bonds, compare breaking input with formation release, and check the supplied evidence.",
      };
    }
    case "reaction-profile": {
      const p = profilePrediction(model.mode, b);
      return { correct: p.correct, feedback: p.explanation };
    }
    case "gas-test-investigation": {
      if (!validGas(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original record. Its entries are retained.",
        };
      const result = checkGas(
        model.mode,
        b as Record<string, string>,
        model.focus ?? "all",
      );
      return { correct: result.correct, feedback: result.message };
    }
    case "haber-investigation": {
      if (!validHaber(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This Haber proposal belongs to another source or is unreadable; entries retained.",
        };
      const r = checkHaber(model.mode, b as Record<string, string>);
      return { correct: r.correct, feedback: r.message };
    }
    case "materials-investigation": {
      if (!validMaterials(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This materials proposal belongs to another source or is unreadable; entries retained.",
        };
      const r = checkMaterials(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "life-cycle-investigation": {
      if (!validLca(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This lifecycle proposal belongs to another source or is unreadable; entries retained.",
        };
      const r = checkLca(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "bio-extraction-investigation": {
      if (!validBio(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This copper proposal belongs to another source or is unreadable; entries retained.",
        };
      const r = checkBio(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "wastewater-investigation": {
      if (!validWaste(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "Saved wastewater proposal belongs to a different source or is unreadable; entries retained.",
        };
      const r = checkWaste(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "water-investigation": {
      if (!validWater(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the supplied water record. Its entries are retained.",
        };
      const r = checkWater(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "carbon-cycle-investigation": {
      if (!validCycle(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the supplied carbon record. Its entries are retained.",
        };
      const result = checkCycle(model.mode, b);
      return { correct: result.correct, feedback: result.message };
    }
    case "pollution-investigation": {
      if (!validPollution(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the supplied pollution record. Its entries are retained.",
        };
      const result = checkPollution(model.mode, b);
      return { correct: result.correct, feedback: result.message };
    }
    case "climate-investigation": {
      if (!validClimate(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original climate record. Its entries are retained.",
        };
      const result = checkClimate(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "greenhouse-investigation": {
      if (!validGreenhouse(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original greenhouse record. Its entries are retained.",
        };
      const result = checkGreenhouse(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "atmosphere-investigation": {
      if (!validAtmosphere(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original atmosphere record. Its entries are retained.",
        };
      const result = checkAtmosphere(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "separation-investigation": {
      if (!validSeparation(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original separation record. Its entries are retained.",
        };
      const result = checkSeparation(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "instrumental-investigation": {
      if (!validInstrumental(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original instrumental record. Its entries are retained.",
        };
      const result = checkInstrumental(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "ion-test-investigation": {
      if (!validIon(model.mode, b, model.record))
        return {
          correct: false,
          feedback:
            "This proposal does not belong to the current original ion-test record. Its entries are retained.",
        };
      const result = checkIon(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "chromatography-investigation": {
      const result = checkChroma(
        model.mode,
        b as Record<string, string>,
        model.focus ?? "all",
      );
      return { correct: result.correct, feedback: result.message };
    }
    case "purity-separation": {
      const result = checkPurity(
        model.mode,
        b as Record<string, string>,
        model.focus ?? "all",
      );
      return {
        correct: result.correct,
        feedback: !result.valid
          ? "Complete the asked fields; your entries are retained."
          : result.correct
            ? "The asked fields match this supplied case; unchosen fields have not been checked."
            : "Your proposal is retained. Compare the requested quantity and stated conditions with the supplied evidence.",
      };
    }
    case "natural-polymers": {
      const result = checkNaturalBoard(
        model.mode,
        b as Record<string, string>,
        model.focus,
      );
      return { correct: result.correct, feedback: result.message };
    }
    case "pathways": {
      const result = checkOrganicPathwayBoard(
        model.mode,
        b as Record<string, string>,
      );
      return { correct: result.correct, feedback: result.message };
    }
    case "polymerisation": {
      const r = checkPolymerisationBoard(
        model.mode,
        b as Record<string, string>,
      );
      return { correct: r.correct, feedback: r.message };
    }
    case "alcohol": {
      const result = checkAlcoholBoard(model.mode, b);
      return { correct: result.correct, feedback: result.message };
    }
    case "cracking": {
      const r = checkCrackingBoard(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "alkanes": {
      const result = checkAlkaneBoard(model.mode, b as Record<string, string>);
      return { correct: result.correct, feedback: result.message };
    }
    case "crude-oil": {
      const result = checkOilBoard(model.mode, b);
      return { correct: result.correct, feedback: result.message };
    }
    case "rates-practical": {
      const correct = checkPracticalBoard(model.mode, b);
      return {
        correct,
        feedback: correct
          ? "Your constructed practical predictions agree with the supplied conditions and observations."
          : "Keep your original work. Review the stated controls, units, measurement path and evidence before changing a prediction.",
      };
    }
    case "equilibrium-shift": {
      const r = shiftBoardCheck(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "reversible-equilibrium": {
      const r = reversibleBoardCheck(model.mode, b);
      return { correct: r.correct, feedback: r.message };
    }
    case "temperature-catalysts": {
      const result = thermalBoardCheck(model.mode, b);
      return { correct: result.correct, feedback: result.message };
    }
    case "collision-theory":
      return collisionBoardCheck(model.mode, b);
    case "tangent-rates": {
      const correct = tangentPrediction(model.mode, b);
      return {
        correct,
        feedback: correct
          ? "Your predictions match the supplied teaching case."
          : tangentDiagnostic(model.mode, b),
      };
    }
    case "rate-measurement": {
      const result = ratesPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "cell-voltage": {
      const result = voltagePrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "fuel-half": {
      const result = fuelHalfPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "cells-workbench": {
      const result = cellsPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "energy-practical": {
      const result = practicalPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "thermal-transfer": {
      const result = energyPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "displacement-redox": {
      const result = displacementPrediction(model.mode, b);
      return { correct: result.correct, feedback: result.explanation };
    }
    case "acid-evidence":
      return {
        correct: strengthPrediction(model.mode, b).correct,
        feedback:
          "Separate ionisation from total acid concentration; count whole pH steps and use only the supplied controlled evidence.",
      };
    case "ph-evidence":
      return {
        correct: phPrediction(model.mode, b).correct,
        feedback:
          "Compare supplied pH readings, named indicator intervals, measured observations and calibration evidence.",
      };
    case "electron-redox":
      return {
        correct: halfPrediction(model.mode, b).correct,
        feedback:
          "Conserve every element and signed charge; identify electron loss/gain and unchanged spectators.",
      };
    case "aqueous-products":
      return {
        correct: aqueousPrediction(model.mode, b).correct,
        feedback:
          "Use the supplied phase, reactivity, electrode material and practical evidence; distinguish proportion from correlation and follow the inverted scale.",
      };
    case "electrolysis-process":
      return {
        correct: electrolysisPrediction(model.mode, b).correct,
        feedback:
          "Check ion mobility, electrode polarity, neutral molten products and the supplied extraction conditions.",
      };
    case "soluble-salts":
      return {
        correct: saltPrediction(model.mode, b).correct,
        feedback:
          "Check supplied solubility, preparation sequence, residue/filtrate and retained mother liquor.",
      };
    case "acid-neutralisation":
      return {
        correct: acidPrediction(model.mode, b).correct,
        feedback:
          "Check reacting pairs, products, salt identity and what the supplied evidence supports.",
      };
    case "metal-extraction":
      return {
        correct: extractionPrediction(model.mode, b).correct,
        feedback:
          "Check chemical suitability and named mass or actual-output denominators.",
      };
    case "oxygen-redox":
      return {
        correct: oxygenPrediction(model.mode, b).correct,
        feedback:
          "Check the named substance, conserved oxygen and the stated boundary.",
      };
    case "metal-reactivity":
      return {
        correct: metalPrediction(model.mode, b).correct,
        feedback:
          "Check the metal order, supplied conditions and supported evidence.",
      };
    case "titration-calculations": {
      const r = titrationPrediction(model.mode, b);
      return {
        correct: r.correct,
        feedback: r.correct
          ? "The delivered amount, reacting ratio and named solution quantity agree."
          : "Check delivered volume, coefficient orientation and the original unknown solution volume.",
      };
    }
    case "empirical-formulae": {
      const r = empiricalPrediction(model.mode, b);
      return {
        correct: r.correct,
        feedback: r.correct
          ? "The quantities, whole ratio and evidence agree."
          : "Check each element conversion, common whole-number scaling and measurement evidence.",
      };
    }
    case "gas-volumes": {
      const r = gasPrediction(model.mode, b);
      return {
        correct: r.correct,
        feedback: r.correct
          ? "The gas quantities, physical states and relationship agree."
          : "Check matching gas conditions, units, equation coefficients and unused reactants.",
      };
    }
    case "molar-concentration": {
      const r = molarPrediction(model.mode, b);
      return {
        correct: r.correct,
        feedback: r.correct
          ? "The named amount, final solution volume and relationship agree."
          : "Check the final volume in dm³ and the amount or mass of the named solute.",
      };
    }
    case "production-pathways":
      return pathwayPrediction(model.mode, b);
    case "theoretical-yield":
      return theoryPrediction(model.mode, b);
    case "atom-economy":
      return economyPrediction(model.mode, b);
    case "inverse-atom-economy":
      return inverseEconomyPrediction(model.mode, b);
    case "percentage-yield":
      return yieldPrediction(model.mode, b);
    case "limiting-reactants":
      return limitingPrediction(model.mode, b);
    case "balancing-masses":
      return massBalancePrediction(model.mode, b);
    case "reacting-masses":
      return reactingPrediction(model.mode, b);
    case "mole-amounts":
      return molePrediction(model.mode, b);
    case "changing-concentration":
      return changePrediction(model.mode, b);
    case "solution-concentration":
      return concentrationPrediction(model.mode, b);
    case "measurement-uncertainty":
      return measurementPrediction(model.mode, b);
    case "mass-conservation":
      return massPrediction(model.mode, b);
    case "equation-balancing":
      return balancePrediction(model.mode, b);
    case "percentage-composition":
      return compositionPrediction(model.mode, b);
    case "formula-mass":
      return formulaMassPrediction(model.mode, b);
    case "nano-properties":
      return nanoPrediction(model.mode, b);
    case "state-properties":
      return statePrediction(model.mode, b);
    case "polymer-properties":
      return polymerPrediction(model.mode, b);
    case "nanotube-properties":
      return nanotubePrediction(model.mode, b);
    case "fullerene-properties":
      return fullerenePrediction(model.mode, b);
    case "graphene-properties":
      return graphenePrediction(model.mode, b);
    case "graphite-properties":
      return graphitePrediction(model.mode, b);
    case "giant-covalent":
      return networkPrediction(model.mode, b);
    case "metallic-properties":
      return metallicPrediction(model.mode, b);
    case "molecular-properties":
      return molecularPropertyPrediction(model.mode, b);
    case "covalent-share": {
      const spec = covalentMolecules[model.molecule],
        ledger = covalentLedger(model.molecule, b);
      return ledger.correct
        ? pass(
            `${model.molecule} has ${spec.orders.join(", ")} shared pair${spec.orders.length === 1 && spec.orders[0] === 1 ? "" : "s"} in its bond region${spec.orders.length === 1 ? "" : "s"}. Unshared electrons: ${spec.centre.symbol} ${ledger.centreRemaining}; other atoms ${ledger.partnerRemaining.join(", ")}. Each hydrogen has two electrons around it and the other selected atoms have eight. The molecule retains ${ledger.total} outer electrons; shared electrons count around both atoms but only once in this inventory.`,
          )
        : fail(
            `Your placement is retained: shared-region electron counts ${ledger.shared.join(", ")}; unshared reference-atom electrons ${ledger.centreRemaining}; partner unshared electrons ${ledger.partnerRemaining.join(", ")}. Total ${ledger.displayedTotal} outer electrons is conserved, but this alone does not make the proposed bonds correct. Each bond needs ${spec.orders.join(", ")} complete pair(s), with one electron from each atom per pair in these examples. Hydrogen needs two electrons around it; the other selected atoms need eight.`,
          );
    }
    case "ionic-formula": {
      const spec = formulaCases[model.compound],
        ledger = formulaLedger(
          spec.cation,
          spec.anion,
          Number(b.cations),
          Number(b.anions),
        );
      if (ledger.charge !== 0)
        return fail(
          `Your proposed ${ledger.formula} is retained. Total positive charge ${ledger.positiveCharge}; total negative charge ${ledger.negativeCharge}; net charge ${ledger.charge}. Change numbers of WHOLE ions until the compound is neutral; keep each ion's internal formula unchanged.`,
        );
      if (!ledger.simplest)
        return fail(
          `Your ${ledger.formula} balances charge but is not the simplest whole-ion ratio. Reduce both ion counts by a common factor without changing any ion's internal atoms.`,
        );
      return pass(
        `${ledger.formula} is neutral and uses the simplest whole-ion ratio. Repeated polyatomic ions keep their internal formula inside parentheses; the outside subscript multiplies the whole group. The formula gives an ion ratio, not an isolated molecule.`,
      );
    }
    case "ionic-lattice":
      return b.neighbours === 6
        ? pass(
            "This interior sodium chloride ion has six nearest neighbours of opposite charge: along three perpendicular directions, on both sides. The attraction acts through the giant lattice, not only within separate NaCl pairs. Six is specific to this structure, not a rule for every ionic compound.",
          )
        : fail(
            "Your prediction is retained. This is a 3D fragment, not a flat sheet. Rotate it and count the nearest opposite ions on both sides of each of three perpendicular directions; do not count only the visible front layer.",
          );
    case "ionic-conduction": {
      const expected = ionicPhaseEvidence[model.phase];
      return b.conducts === expected.conducts && b.carrier === expected.carrier
        ? pass(expected.text)
        : fail(
            `Your prediction is retained. ${expected.text} Both conductivity and the particle explanation must agree.`,
          );
    }
    case "ionic-transfer": {
      const s = ionicCompounds[model.compound],
        ledger = ionicLedger(model.compound, b);
      if (ledger.correct)
        return pass(
          `Each ${s.metal.name.toLowerCase()} atom loses ${s.metal.outer} electron${s.metal.outer === 1 ? "" : "s"}; each ${s.nonmetal.name.toLowerCase()} atom gains ${8 - s.nonmetal.outer}. The nuclei stay unchanged, electrons are conserved, and the oppositely charged ions have full outer shells. Their electrostatic attraction is the ionic bond; the transferred electron is not a shared pair.`,
        );
      return fail(
        `Your transfers are retained: metal loss ${ledger.lost.join(", ")}; non-metal gain ${ledger.gained.join(", ")}. Each ${s.metal.name.toLowerCase()} needs to lose ${s.metal.outer}; each ${s.nonmetal.name.toLowerCase()} needs to gain ${8 - s.nonmetal.outer}. Total electron conservation and total charge zero do not alone prove that the required ions have formed. Check the distribution to each atom.`,
      );
    }
    case "transition-compare": {
      const physical = (key: string | number) =>
        physicalComparisons.some((p) => p === key);
      if (b.first === b.second)
        return fail(
          "Choose two DIFFERENT physical comparisons. Repeating one property does not provide a second difference.",
        );
      if (!physical(b.first) || !physical(b.second))
        return fail(
          "These may describe characteristic chemistry, but the question asks for physical differences of the elements. Choose melting point, density, hardness or strength, with the comparison direction stated.",
        );
      return pass(
        "Both are distinct physical comparisons: the selected transition-metal examples generally have higher melting points/densities and are harder/stronger than Group 1 metals. Formation of compounds or different ion charges answers a different kind of question.",
      );
    }
    case "transition-ion":
      return 26 - Number(b.electrons) === model.targetCharge
        ? pass(
            `Iron still has 26 protons. Losing ${model.targetCharge} electrons in total from neutral iron leaves ${26 - model.targetCharge} electrons and charge ${model.targetCharge}+. Different electron counts give Fe²⁺ or Fe³⁺ without changing element identity.`,
          )
        : fail(
            `Your iron particle has 26 protons and ${b.electrons} electrons: charge ${formatCharge(26 - Number(b.electrons))}. For iron(${model.targetCharge === 2 ? "II" : "III"}), remove ${model.targetCharge} electrons from the neutral atom; do not change protons.`,
          );
    case "transition-catalyst":
      return b.early === "greater" && b.final === "same"
        ? pass(
            "At 20 s, the supplied catalysed run has produced 22 cm³ versus 14 cm³. Both completed runs end at 24 cm³. The catalyst increases rate, not the amount from the identical limiting reactant, and is not consumed overall.",
          )
        : fail(
            "Read early and final amounts separately. At 20 s the catalysed run is ahead; at completion both supplied runs reach 24 cm³. Faster production does not mean more final product in this completed reaction.",
          );
    case "transition-colour":
      if (b.colour === "unset")
        return fail(
          "Choose your colour prediction. A blank prediction is not an answer.",
        );
      if (b.condition !== "wet")
        return fail(
          "Your dry-paper prediction is retained. Now select paper after contact with water and predict its colour.",
        );
      return b.colour === "pink"
        ? pass(
            "The supplied cobalt chloride indicator paper changes from blue when dried to pink after contact with water. This concerns a compound on paper, not cobalt metal. Colour depends on the named substance and conditions; it is not one universal colour for cobalt compounds.",
          )
        : fail(
            "Your prediction is retained. In the supplied paper observation, contact with water changes blue paper to pink. Keep the compound and its conditions separate from the appearance of cobalt metal.",
          );
    case "noble-use":
      if (model.use === "balloon") {
        if (b.gas === "hydrogen")
          return fail(
            "Hydrogen is less dense than air, but is flammable. Low density alone does not meet the non-flammable balloon requirement.",
          );
        if (b.gas === "argon")
          return fail(
            "Argon does not burn, but is denser than air. Non-flammability alone does not make a lifting gas.",
          );
        return b.reason === "both"
          ? pass(
              "Helium is less dense than air, so provides lift, and does not burn. These are two distinct reasons; unreactivity alone does not explain lift.",
            )
          : fail(
              "Helium is the suitable gas. Now justify BOTH requirements: lower density for lift and non-flammability for the stated safety requirement.",
            );
      }
      if (b.gas !== "argon")
        return fail(
          "Use the specified argon supply for this filament task. Other inert gases can also protect a filament; this is not a claim that argon is uniquely inert.",
        );
      return b.reason === "inert"
        ? pass(
            "Argon is chemically very unreactive under these conditions. An argon atmosphere prevents oxygen reaching and reacting with the hot filament; its density does not explain this chemical protection.",
          )
        : fail(
            "Argon's relevant property is chemical inertness. Low density or non-flammability alone does not explain protection of the hot filament from oxidation.",
          );
    case "halogen-particle":
      return b.representation === model.target
        ? pass(
            "Two identical atoms form a neutral diatomic halogen molecule. A single atom and a single negative halide ion are different species; a subscript counts atoms, while a superscript shows charge.",
          )
        : fail(
            "Your representation is retained. For the elemental halogen molecule, choose two neutral bonded atoms, not one atom or a single negative halide ion.",
          );
    case "halogen-phase":
      return b.temperature === model.targetTemperature
        ? pass(
            "Compare the supplied melting and boiling points with the temperature. Between them, the substance is liquid; below melting it is solid, above boiling it is gas. The diatomic molecules remain intact during a phase change.",
          )
        : fail(
            `Set the supplied temperature to ${model.targetTemperature} °C before comparing it with the transition values. Do not assume the room-temperature state applies at every temperature.`,
          );
    case "halogen-displacement": {
      const result = displacement(b.added as Halogen, b.halide as Halide);
      if ((b.prediction === "reaction") !== result.reacts)
        return fail(
          "Your prediction conflicts with the reactivity order chlorine > bromine > iodine. The added halogen must be more reactive than the halogen represented by the dissolved halide ions; the metal counter-ion is a spectator.",
        );
      if (b.added !== model.target[0] || b.halide !== model.target[1])
        return fail(
          "That prediction is valid for your chosen mixture. Return to the specified pair to answer this task; compare other mixtures without changing their chemical rules.",
        );
      return pass(
        result.reacts
          ? `A displacement occurs: ${result.equation}. The added halogen gains electrons to form halide ions; the original halide ions become a different halogen molecule.`
          : "No net displacement occurs: the added halogen is not more reactive. A coloured added solution may remain coloured even when there is no displacement.",
      );
    }
    case "alkali-reaction":
      return b.metal === model.target[0] && b.partner === model.target[1]
        ? pass(
            "This is the requested comparison. Use the observed behaviour separately from the products and outer-electron explanation. All three metals have one outer electron; distance and shielding increase down the group.",
          )
        : fail(
            `The displayed chemistry describes your chosen combination. For this task compare ${model.target[0]} with ${model.target[1]}; a different valid reaction does not answer this prediction.`,
          );
    case "alkali-water-equation": {
      const coeffs = [
        Number(b.metal),
        Number(b.water),
        Number(b.hydroxide),
        Number(b.hydrogen),
      ];
      const counts = waterEquationCounts(coeffs);
      const balanced =
        coeffs.every((n) => n > 0) &&
        Object.keys(counts.left).every(
          (k) =>
            counts.left[k as keyof typeof counts.left] ===
            counts.right[k as keyof typeof counts.right],
        );
      if (!balanced)
        return fail(
          "Compare each element on both sides. A hydrogen molecule contains two H atoms; each hydroxide contains one H and one O. Change coefficients, never the formula subscripts.",
        );
      return pass(
        coeffs.every((n, i) => n === [2, 2, 2, 1][i])
          ? "2 metal atoms + 2 water molecules → 2 hydroxide units + 1 hydrogen molecule. Metal, oxygen and hydrogen counts are conserved; the final coefficient 1 is normally omitted."
          : "The equation is balanced. Divide every coefficient by their common factor to give the simplest whole-number ratio 2 : 2 : 2 : 1.",
      );
    }
    case "historical-test":
      if (b.verdict === "proof")
        return fail(
          "A matching discovery can support a prediction, but cannot permanently prove every claim about a table. A mismatch is conflicting evidence.",
        );
      if (b.candidate === "match")
        return b.verdict === "support"
          ? pass(
              "The observed metal and +2-ion behaviour match the predicted family properties. This supports the prediction, without proving every future claim.",
            )
          : fail(
              "These observations agree with the prediction, so they supply supporting evidence. Further tests remain possible.",
            );
      return b.verdict === "investigate"
        ? pass(
            "The non-metal and −1-ion observations conflict with the predicted metal and +2 behaviour. Investigate the evidence and reconsider this candidate's placement or the prediction; do not rewrite observations to fit.",
          )
        : fail(
            "Compare the properties: a non-metal forming −1 ions does not match the predicted metal forming +2 ions. Investigate the mismatch instead of treating it as support.",
          );
    case "historical-gap":
      return b.arrangement === "gap"
        ? pass(
            "Leaving a gap preserves the repeated property pattern. Predict an undiscovered element in the middle family; later measurements can support or challenge that prediction. This classroom puzzle is not Mendeleev's original table.",
          )
        : fail(
            "Strict weight order puts E into the middle column even though its properties match the final family. Leave a gap rather than forcing chemically unlike elements into one family.",
          );
    case "periodic-place": {
      const target = periodicPosition(model.atomicNumber);
      const shells = firstTwentyArrangement(model.atomicNumber);
      if (b.group !== target.group)
        return fail(
          `Use the ${shells.at(-1)} outer ${shells.at(-1) === 1 ? "electron" : "electrons"} for the main-group position. A full outer shell belongs to Group 0, including helium's full two-electron shell. Group and period count different features.`,
        );
      if (b.period !== target.period)
        return fail(
          `The group is right. Count ${shells.length} occupied shells to find the period; do not use the outer-electron count.`,
        );
      return pass(
        `Group ${target.group}, period ${target.period}: ${shells.length} occupied ${shells.length === 1 ? "shell sets" : "shells set"} the period; ${target.group === 0 ? "the full outer shell sets Group 0" : `${shells.at(-1)} outer ${shells.at(-1) === 1 ? "electron sets" : "electrons set"} the main group`}. The position follows electron arrangement, not a neutron or mass-number count.`,
      );
    }
    case "isotope-mixture":
      return b.lightPercent === model.targetPercent
        ? pass(
            `The supplied mixture has ${model.targetPercent}% mass-${model.masses[0]} atoms and ${100 - model.targetPercent}% mass-${model.masses[1]} atoms. Multiply each mass by its percentage, add, then divide by 100. The average is pulled toward the more abundant isotope.`,
          )
        : fail(
            `Set mass-${model.masses[0]} to ${model.targetPercent}%. Its partner makes up the remainder to 100%. An equal average of the two mass numbers is justified only for equal abundances.`,
          );
    case "nano-convert":
      return b.exponent === -9
        ? pass(
            `Nano means 10⁻⁹. Multiply ${model.nanometres} by 10⁻⁹ to convert nanometres into metres; a smaller unit gives a smaller numerical value when expressed in metres.`,
          )
        : fail(
            "Nano means one billionth: 10⁻⁹, not micro (10⁻⁶) or pico (10⁻¹²). Choose the exponent for nano before multiplying the nanometre value.",
          );
    case "atomic-scale":
      return b.radius === model.targetRadius
        ? pass(
            `For this example, the nucleus radius is the atom radius divided by 20 000. At ${model.targetRadius} m, that is ${(model.targetRadius / 20000) * 1000} mm. Both radii have the same enlargement factor; most atomic space is outside the tiny nucleus.`,
          )
        : fail(
            `Set the enlarged atom radius to ${model.targetRadius} m, then divide by 20 000. The ratio is unchanged by enlargement. Radius is centre to edge; diameter is twice the radius.`,
          );
    case "scattering": {
      if (b.distribution !== "central")
        return fail(
          "Spreading positive charge through the atom cannot explain the rare large deflections. Compare a small, concentrated positive centre with the old diffuse model.",
        );
      if (b.approach !== model.targetApproach)
        return fail(
          `Compare the ${model.targetApproach === "far" ? "path far from the centre" : model.targetApproach === "near" ? "path close to the centre" : "head-on path"} with the observation in this task. A chosen path illustrates a possibility, not how frequently it occurs.`,
        );
      return pass(
        model.targetApproach === "far"
          ? "A path far from the tiny centre is nearly straight. The observation that most alpha particles passed through supports an atom that is mostly empty space."
          : model.targetApproach === "near"
            ? "The positive alpha particle is repelled by the concentrated positive nucleus. Close approaches can produce deflection; the nucleus is not negatively charged."
            : "A rare close, head-on approach can turn a positive alpha particle back by electrostatic repulsion. A tiny, massive, positively charged centre explains the surprising large deflections better than diffuse positive material.",
      );
    }
    case "shell-place": {
      const counts = [1, 2, 3, 4].map((i) => Number(b[`s${i}`]));
      const total = counts.reduce((a, n) => a + n, 0);
      if (total !== model.atomicNumber)
        return fail(
          `A neutral atom with atomic number ${model.atomicNumber} needs ${model.atomicNumber} electrons. You have placed ${total}; ${model.atomicNumber - total} remain to place.`,
        );
      const target = firstTwentyArrangement(model.atomicNumber);
      const wrong = counts.findIndex((n, i) => n !== (target[i] ?? 0));
      if (wrong !== -1)
        return fail(
          `The total is right, but shell ${wrong + 1} has ${counts[wrong]} electrons instead of ${target[wrong] ?? 0}. Fill the lowest available energy levels first; move an electron between shells using remove and add.`,
        );
      return pass(
        `Your diagram and ${target.join(",")} represent the same ${total} electrons. There are ${target.length} occupied shells and ${target.at(-1)} outer-shell electron${target.at(-1) === 1 ? "" : "s"}. Empty guide rings are not occupied shells.`,
      );
    }
    case "particles": {
      if (b.proton !== "nucleus")
        return fail(
          "Protons belong in the nucleus, not in electron shells. Move the proton label into the nucleus.",
        );
      if (b.neutron !== "nucleus")
        return fail(
          "Neutrons are nuclear particles. Move the neutron label into the nucleus.",
        );
      if (b.electron !== "shells")
        return fail(
          "Electrons occupy shells outside the nucleus. Move the electron label to the shells.",
        );
      return pass(
        "Protons (+1, relative mass 1) and neutrons (0, relative mass 1) are in the nucleus. Electrons (−1, relative mass about 1/1836) occupy shells.",
      );
    }
    case "atom-build": {
      const [p, n, e] = model.target;
      if (b.p !== p)
        return fail(
          `Changing proton number changes the element. This task needs ${p} protons; restore that element before changing isotope or charge.`,
        );
      if (b.n !== n)
        return fail(
          `Mass number counts protons plus neutrons. Your mass number is ${Number(b.p) + Number(b.n)}; the target is ${p + n}. Adjust neutrons while keeping protons fixed.`,
        );
      if (b.e !== e)
        return fail(
          `Charge is protons minus electrons. Your charge is ${Number(b.p) - Number(b.e)}; the target charge is ${p - e}. Change electrons without changing the nucleus.`,
        );
      return pass(
        `The target has ${p} protons, ${n} neutrons and ${e} electrons: atomic number ${p}, mass number ${p + n}, charge ${p - e > 0 ? "+" : ""}${p - e}.`,
      );
    }
    case "atom-transform": {
      const [p, n, e] = model.target;
      if (b.p !== model.initial[0])
        return fail(
          "Proton number defines the element. This comparison keeps it fixed.",
        );
      if (model.operation === "isotope") {
        if (b.e !== model.initial[2])
          return fail(
            "This isotope comparison keeps both atoms neutral. Change neutrons, not electrons.",
          );
        if (b.n !== n)
          return fail(
            `Your mass number is ${p + Number(b.n)}. The target mass number is ${p + n}; keep ${p} protons and change only neutrons.`,
          );
        return pass(
          `Both atoms have ${p} protons and ${e} electrons. Neutrons changed from ${model.initial[1]} to ${n}, so mass number changed from ${model.initial[0] + model.initial[1]} to ${p + n}. They are isotopes of the same element.`,
        );
      }
      if (b.n !== model.initial[1])
        return fail(
          "Ion formation leaves the nucleus unchanged. Change electrons, not neutrons.",
        );
      if (b.e !== e)
        return fail(
          `The charge is ${p} − ${b.e} = ${formatCharge(p - Number(b.e))}. The target charge is ${formatCharge(p - e)}; transfer electrons while keeping the nucleus fixed.`,
        );
      return pass(
        `${model.initial[2] > e ? "Losing" : "Gaining"} ${Math.abs(model.initial[2] - e)} electron${Math.abs(model.initial[2] - e) === 1 ? "" : "s"} gives charge ${formatCharge(p - e)}. The ${p} protons and ${n} neutrons are unchanged, so element identity and mass number ${p + n} are unchanged.`,
      );
    }
  }
}
import {
  initialCellsBoard,
  validCellsBoard,
  cellsHistoryStep,
  cellsPrediction,
} from "./cells-and-fuel-cells";

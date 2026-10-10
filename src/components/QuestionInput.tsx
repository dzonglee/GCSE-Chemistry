"use client";
import { AcidMetalReference } from "./AcidMetalReference";
import { MetalReactionReference } from "./MetalReactionReference";
import { ConcentrationSymbols } from "./ConcentrationSymbols";
import { NanoFootprintDiagram } from "./NanoFootprintDiagram";
import { MolecularLineConstructionInput } from "./MolecularLineConstructionInput";
import { FirstTwentyReference } from "./FirstTwentyReference";
import { AlkaliReference } from "./AlkaliReference";
import { HalogenReference } from "./HalogenReference";
import { HaberGivenFigure } from "./HaberWorkbench";
import {
  AssessmentEnergyGiven,
  AssessmentWaterEnergy,
  AssessmentServiceGiven,
  AssessmentRecyclingGiven,
} from "./AssessmentGivens";
import { HaberDrawingInput } from "./HaberDrawingInput";
import { MaterialsGivenFigure, MaterialsSource } from "./MaterialsWorkbench";
import { LcaGivenFigure } from "./LcaWorkbench";
import { BioGivenFigure } from "./BioWorkbench";
import { WasteGivenFigure } from "./WasteWorkbench";
import { WaterGivenFigure } from "./WaterWorkbench";
import { CycleGivenFigure } from "./CycleWorkbench";
import { PollutionGivenFigure } from "./PollutionWorkbench";
import { ClimateGivenFigure } from "./ClimateWorkbench";
import { GreenhouseGivenFigure, GreenhouseLedger } from "./GreenhouseWorkbench";
import { AtmosphereEvidence, AtmosphereBar } from "./AtmosphereWorkbench";
import { SeparationEvidence } from "./SeparationWorkbench";
import { InstrumentalGivenFigure } from "./InstrumentalFigures";
import { IonGiven } from "./IonGiven";
import { GasSourceFigure } from "./GasSourceFigure";
import { GasDrawingInput } from "./GasDrawingInput";
import { ChromaGiven, ChromaCoordinateTable } from "./ChromaGiven";
import { ChromaDrawingInput } from "./ChromaDrawingInput";
import { PurityDrawingInput } from "./PurityDrawingInput";
import { NaturalGiven, NaturalDrawingInput } from "./NaturalDrawingInput";
import { NaturalHelixDiagram } from "./NaturalHelixDiagram";
import { PathwayGiven } from "./PathwayReview";
import { PathwayDrawingInput } from "./PathwayDrawingInput";
import { PolymerisationDisplayed } from "./PolymerisationDisplayed";
import { PolymerisationDrawingInput } from "./PolymerisationDrawingInput";
import { PolyesterDrawingInput } from "./PolyesterConstruction";
import { OrganicDrawingInput } from "./OrganicDrawingInput";
import { FuelDrawingInput } from "./FuelDrawingInput";
import { AlkeneDrawingInput } from "./AlkeneDrawingInput";
import { HydrocarbonGiven } from "./HydrocarbonGiven";
import { AlkaneDrawingInput } from "./AlkaneDrawingInput";
import { OilBarDrawingInput } from "./OilBarDrawingInput";
import { TangentPlot } from "./TangentPlot";
import { TangentDrawingInput } from "./TangentDrawingInput";
import { RatePlot, RateDataTable } from "./RatePlot";
import { RateDrawingInput } from "./RateDrawingInput";
import { VoltageComparison, VoltageTable } from "./VoltageComparison";
import { CellsComparison } from "./CellsComparison";
import { PracticalPlot } from "./PracticalPlot";
import { BondReactionDiagram } from "./BondReactionDiagram";
import { ReactionProfile } from "./ReactionProfile";
import { ProfileDrawingInput } from "./ProfileDrawingInput";
import { TemperatureTrace } from "./TemperatureTrace";
import { BuretteScale } from "./BuretteScale";
import { PhMeasurements } from "./PhMeasurements";
import { InvertedGasScale } from "./InvertedGasScale";
import type { Question } from "@/content/types";
import { IonDotCross } from "./IonDotCross";
import { IonConstructionInput } from "./IonConstructionInput";
import { IonicSlice } from "./IonicSlice";
import { StateParticleDiagram } from "./StateParticleDiagram";
import { PolymerChainProjection } from "./PolymerChainProjection";
import { PolymerRepeatDiagram } from "./PolymerRepeatDiagram";
import { PolymerConstructionInput } from "./PolymerConstructionInput";
import { NanotubeProjection } from "./NanotubeProjection";
import { NanotubeMaterialData } from "./NanotubeMaterialData";
import { FullereneProjection } from "./FullereneProjection";
import { GrapheneProjection } from "./GrapheneProjection";
import { GraphenePanelData, GraphenePanelEvidence } from "./GraphenePanelData";
import { GraphiteProjection } from "./GraphiteProjection";
import { DiamondProjection } from "./DiamondProjection";
import { SilicaNetworkDiagram } from "./SilicaNetworkDiagram";
import { MetallicDiagram } from "./MetallicDiagram";
import { CovalentConstructionInput } from "./CovalentConstructionInput";
import { CovalentDiagram } from "./CovalentDiagram";
import { BondModelDiagram } from "./BondModelDiagram";
import { Nuclide } from "./Nuclide";
import { ShellDiagram } from "./ShellDiagram";
import { AtomicModelDiagram } from "./AtomicModelDiagram";
import { roundingLabel } from "@/lib/marking";
import { readArrangement } from "@/lib/shells";
import { FrequencyDisplay } from "./FrequencyDisplay";
type InputProps = {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compactAssessment?: boolean;
  compactNatural?: boolean;
  naturalInstructions?: string;
  compactHistorical?: boolean;
  compactMaterials?: boolean;
  contextLabel?: string;
};
export function QuestionInput(props: InputProps) {
  const originalPolymer = props.question.polymerisationGiven && (
    <PolymerisationDisplayed
      groups={props.question.polymerisationGiven.groups}
      bond={props.question.polymerisationGiven.polymer ? "1" : "2"}
      left={props.question.polymerisationGiven.polymer ? "1" : "0"}
      right={props.question.polymerisationGiven.polymer ? "1" : "0"}
      brackets={props.question.polymerisationGiven.polymer ? "1" : "0"}
      countMark={props.question.polymerisationGiven.polymer ? "n" : "none"}
      label={
        props.contextLabel
          ? `${props.contextLabel}: original supplied structure`
          : "Original supplied structure"
      }
      compact={props.compactAssessment}
    />
  );
  return (
    <>
      {props.question.elementReference && <FirstTwentyReference symbolsOnly />}
      {props.question.alkaliReference && <AlkaliReference />}
      {props.question.halogenReference && <HalogenReference />}
      {props.question.haberGiven &&
        !props.question.parts &&
        (props.compactAssessment ? (
          <div className="haber-assessment-response">
            <ResponseInput {...props} />
            <HaberGivenFigure data={props.question.haberGiven} />
          </div>
        ) : (
          <HaberGivenFigure data={props.question.haberGiven} />
        ))}
      {props.question.materialsGiven &&
        !props.question.parts &&
        (props.compactMaterials ? (
          <MaterialsSource data={props.question.materialsGiven} />
        ) : (
          <MaterialsGivenFigure data={props.question.materialsGiven} />
        ))}
      {props.question.lcaGiven && (
        <div className="lca-data-response">
          <ResponseInput {...props} />
          {props.compactAssessment && props.question.lcaGiven.recycling ? (
            <AssessmentRecyclingGiven
              data={props.question.lcaGiven.recycling}
            />
          ) : (
            <LcaGivenFigure data={props.question.lcaGiven} />
          )}
        </div>
      )}
      {props.question.bioGiven && !props.question.parts && (
        <BioGivenFigure data={props.question.bioGiven} />
      )}
      {props.question.wasteGiven && !props.question.parts && (
        <WasteGivenFigure data={props.question.wasteGiven} />
      )}
      {props.question.waterGiven && !props.question.parts && (
        <WaterGivenFigure data={props.question.waterGiven} />
      )}
      {props.question.cycleGiven && !props.question.parts && (
        <CycleGivenFigure data={props.question.cycleGiven} />
      )}
      {props.question.pollutionGiven && !props.question.parts && (
        <PollutionGivenFigure data={props.question.pollutionGiven} />
      )}
      {props.question.climateGiven && !props.question.parts && (
        <ClimateGivenFigure data={props.question.climateGiven} />
      )}
      {props.question.greenhouseGiven &&
        !(props.compactAssessment && props.question.greenhouseGiven.budget) && (
          <GreenhouseGivenFigure
            data={{
              ...props.question.greenhouseGiven,
              budget: props.question.parts
                ? undefined
                : props.question.greenhouseGiven.budget,
            }}
          />
        )}
      {props.question.atmosphereGiven && (
        <AtmosphereEvidence data={props.question.atmosphereGiven} />
      )}
      {props.question.separationGiven && (
        <SeparationEvidence data={props.question.separationGiven} />
      )}
      {props.question.instrumentalGiven && (
        <InstrumentalGivenFigure
          data={props.question.instrumentalGiven}
          compact={props.compactAssessment}
        />
      )}
      {props.question.ionGiven && <IonGiven data={props.question.ionGiven} />}
      {props.question.gasGiven && (
        <GasSourceFigure data={props.question.gasGiven} />
      )}
      {props.question.chromatographyGiven &&
        (props.compactAssessment ? (
          <div className="chroma-assessment-response">
            <ChromaCoordinateTable data={props.question.chromatographyGiven} />
            <ResponseInput {...props} />
            <ChromaGiven data={props.question.chromatographyGiven} />
          </div>
        ) : (
          <ChromaGiven data={props.question.chromatographyGiven} />
        ))}
      {props.question.naturalGiven && (
        <NaturalGiven
          data={props.question.naturalGiven}
          compact={props.compactNatural}
        />
      )}
      {props.question.naturalHelix && props.compactNatural && (
        <div className="natural-helix-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <NaturalHelixDiagram data={props.question.naturalHelix} compact />
        </div>
      )}
      {props.question.naturalHelix && !props.compactNatural && (
        <NaturalHelixDiagram
          data={props.question.naturalHelix}
          compact={props.compactAssessment}
        />
      )}
      {props.question.pathwayGiven && !props.question.pathwayDrawing && (
        <PathwayGiven {...props.question.pathwayGiven} />
      )}
      {props.question.hydrocarbonGiven && (
        <HydrocarbonGiven {...props.question.hydrocarbonGiven} />
      )}
      {props.question.tangentGraph &&
        (props.compactAssessment ? (
          <div className="tangent-assessment-response">
            <ResponseInput {...props} />
            <TangentPlot graph={props.question.tangentGraph} compact />
          </div>
        ) : (
          <TangentPlot graph={props.question.tangentGraph} />
        ))}
      {props.question.rateGraph && (
        <RatePlot
          data={props.question.rateGraph}
          curve={props.question.rateGraph.values}
          annotation="Supplied graph for this question"
        />
      )}
      {props.question.rateTable && (
        <RateDataTable data={props.question.rateTable} />
      )}
      {props.question.voltageData && (
        <VoltageComparison data={props.question.voltageData} />
      )}
      {props.question.voltageMatrix && <VoltageTable />}
      {props.question.cellsComparison && (
        <CellsComparison {...props.question.cellsComparison} />
      )}
      {props.question.phMeasurements && (
        <div className="ph-measurement-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <PhMeasurements {...props.question.phMeasurements} />
        </div>
      )}
      {props.question.practicalGraph && (
        <PracticalPlot data={props.question.practicalGraph} />
      )}
      {props.question.bondReaction && !props.compactAssessment && (
        <BondReactionDiagram reaction={props.question.bondReaction} />
      )}
      {props.question.reactionProfile && (
        <ReactionProfile profile={props.question.reactionProfile} />
      )}
      {props.question.temperatureTrace && (
        <TemperatureTrace {...props.question.temperatureTrace} />
      )}
      {props.question.buretteScale && (
        <BuretteScale {...props.question.buretteScale} />
      )}
      {props.question.invertedGasScale && (
        <div className="aqueous-scale-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <InvertedGasScale {...props.question.invertedGasScale} />
        </div>
      )}
      {props.question.massReadings && (
        <table className="isotope-data">
          <caption>Supplied mass readings</caption>
          <thead>
            <tr>
              <th scope="col">Reading</th>
              <th scope="col">Mass / g</th>
            </tr>
          </thead>
          <tbody>
            {props.question.massReadings.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.grams}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {props.question.stateParticleDiagram && (
        <div className="state-diagram-response">
          <StateParticleDiagram
            phase={props.question.stateParticleDiagram}
            assessment
          />
          <div>
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {originalPolymer &&
        (props.compactAssessment ? (
          <div className="polymerisation-assessment-response">
            {originalPolymer}
            <ResponseInput {...props} />
          </div>
        ) : (
          originalPolymer
        ))}
      {props.question.nanoFootprintDiagram && (
        <div className="nano-reference-response">
          <div className="question-response-controls">
            <ResponseInput {...props} />
          </div>
          <NanoFootprintDiagram {...props.question.nanoFootprintDiagram} />
        </div>
      )}
      {props.question.acidMetalReference && (
        <div className="acid-metal-response">
          <ResponseInput {...props} />
          <AcidMetalReference
            electrons={props.question.acidMetalReference === "electrons"}
          />
        </div>
      )}
      {props.question.metalReactionReference && (
        <div className="metal-reference-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <MetalReactionReference />
        </div>
      )}
      {props.question.concentrationSymbols && (
        <div className="concentration-symbol-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <ConcentrationSymbols />
        </div>
      )}
      {props.question.frequencyDisplay && (
        <div className="frequency-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <FrequencyDisplay
            data={props.question.frequencyDisplay}
            value={props.value}
          />
        </div>
      )}
      {(props.question.polymerChainDiagram ||
        props.question.polymerRepeatDiagram) && (
        <div className="polymer-reference-response">
          <div>
            <ResponseInput {...props} />
          </div>
          {props.question.polymerChainDiagram ? (
            <PolymerChainProjection
              units={
                typeof props.question.polymerChainDiagram === "number"
                  ? props.question.polymerChainDiagram
                  : undefined
              }
              highlight
              assessment
            />
          ) : (
            <PolymerRepeatDiagram assessment />
          )}
        </div>
      )}
      {(props.question.nanotubeDiagram ||
        props.question.nanotubeMaterialData) && (
        <div className="nanotube-reference-response">
          <div>
            <ResponseInput {...props} />
          </div>
          {props.question.nanotubeDiagram ? (
            <NanotubeProjection highlight assessment />
          ) : (
            <NanotubeMaterialData
              given={
                typeof props.question.nanotubeMaterialData === "object"
                  ? props.question.nanotubeMaterialData
                  : undefined
              }
            />
          )}
        </div>
      )}
      {props.question.ionicSlice && (
        <div className="ionic-slice-response">
          <IonicSlice assessment={props.question.compactIonicSlice} />
          <div>
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {props.question.fullereneDiagram && (
        <div className="fullerene-reference-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <FullereneProjection
            ring={props.question.fullereneDiagram.ring}
            assessment
          />
        </div>
      )}
      {(props.question.grapheneDiagram || props.question.graphenePanelData) && (
        <div className="graphene-reference-response">
          <div>
            <ResponseInput {...props} />
          </div>
          {props.question.grapheneDiagram ? (
            <GrapheneProjection highlight assessment />
          ) : (
            <GraphenePanelData
              compact
              given={
                typeof props.question.graphenePanelData === "object"
                  ? props.question.graphenePanelData
                  : undefined
              }
            />
          )}
        </div>
      )}
      {(props.question.diamondDiagram ||
        props.question.silicaDiagram ||
        props.question.graphiteDiagram) && (
        <div className="network-diagram-response">
          <div>
            <ResponseInput {...props} />
          </div>
          {props.question.diamondDiagram ? (
            <DiamondProjection site={2} highlight assessment />
          ) : props.question.graphiteDiagram ? (
            <GraphiteProjection site={2} highlight assessment />
          ) : (
            <SilicaNetworkDiagram assessment />
          )}
        </div>
      )}
      {props.question.metallicDiagram && (
        <div className="metallic-diagram-response">
          <div>
            <ResponseInput {...props} />
          </div>
          <MetallicDiagram
            {...(typeof props.question.metallicDiagram === "object"
              ? props.question.metallicDiagram
              : {})}
          />
        </div>
      )}
      {props.question.covalentModel && (
        <div className="covalent-diagram-response">
          <BondModelDiagram {...props.question.covalentModel} />
          <div>
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {props.question.covalentDiagram && (
        <div className="covalent-diagram-response">
          <CovalentDiagram {...props.question.covalentDiagram} compact />
          <div>
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {props.question.ionDotCross && (
        <div className="ionic-diagram-response">
          <IonDotCross
            {...props.question.ionDotCross}
            textLegend={props.question.compactIonDiagram}
          />
          <div>
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {props.question.isotopeData && (
        <table className="isotope-data">
          <caption>Supplied isotope data</caption>
          <thead>
            <tr>
              <th scope="col">Mass number</th>
              <th scope="col">
                {props.question.abundanceKind === "count"
                  ? "Number of atoms"
                  : "Percentage abundance (%)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {props.question.isotopeData.map((row) => (
              <tr key={row.mass}>
                <th scope="row">{row.mass}</th>
                <td>{row.abundance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {props.question.atomDiagram && (
        <AtomicModelDiagram
          model={props.question.atomDiagram}
          readable={props.compactAssessment}
          compact={props.compactHistorical}
        />
      )}
      {props.question.halogenResults && (
        <div className="halogen-response">
          <HalogenResults rows={props.question.halogenResults} />
          <ResponseInput {...props} />
        </div>
      )}
      {props.question.shellDiagram && (
        <div className="shell-response">
          <ShellDiagram
            counts={props.question.shellDiagram}
            label="Question electron shell diagram"
            tightView={props.question.compactShellDiagram}
          />
          <div className="shell-fields">
            <ResponseInput {...props} />
          </div>
        </div>
      )}
      {props.question.nobleBoilingPoints && (
        <div className="noble-data-response">
          <table className="noble-boiling-data">
            <caption>Supplied boiling points (°C)</caption>
            <thead>
              <tr>
                <th scope="col">Element</th>
                <th scope="col">Boiling point</th>
              </tr>
            </thead>
            <tbody>
              {props.question.nobleBoilingPoints.map((row) => (
                <tr key={row.element}>
                  <th scope="row">{row.element}</th>
                  <td>{row.boiling}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ResponseInput {...props} />
        </div>
      )}
      {!(props.question.naturalHelix && props.compactNatural) &&
        !(props.question.chromatographyGiven && props.compactAssessment) &&
        !(props.question.polymerisationGiven && props.compactAssessment) &&
        !props.question.lcaGiven &&
        !(
          props.compactAssessment &&
          props.question.haberGiven &&
          !props.question.parts
        ) &&
        !(props.compactAssessment && props.question.tangentGraph) &&
        !props.question.phMeasurements &&
        !props.question.invertedGasScale &&
        !props.question.halogenResults &&
        !props.question.nobleBoilingPoints &&
        !props.question.shellDiagram &&
        !props.question.ionDotCross &&
        !props.question.ionicSlice &&
        !props.question.stateParticleDiagram &&
        !props.question.covalentModel &&
        !props.question.covalentDiagram &&
        !props.question.metallicDiagram &&
        !props.question.diamondDiagram &&
        !props.question.silicaDiagram &&
        !props.question.graphiteDiagram &&
        !props.question.grapheneDiagram &&
        !props.question.graphenePanelData &&
        !props.question.fullereneDiagram &&
        !props.question.nanoFootprintDiagram &&
        !props.question.frequencyDisplay &&
        !props.question.concentrationSymbols &&
        !props.question.metalReactionReference &&
        !props.question.acidMetalReference &&
        !props.question.polymerChainDiagram &&
        !props.question.polymerRepeatDiagram &&
        !props.question.nanotubeDiagram &&
        !props.question.nanotubeMaterialData && <ResponseInput {...props} />}
      {props.compactAssessment &&
        props.question.instrumentalGiven?.spectrum && (
          <details>
            <summary>About these line positions</summary>
            <p>
              Positions 1–12 are schematic teaching positions, not real
              wavelengths to memorise. All references and the unknown use the
              same display positions.
            </p>
          </details>
        )}
      {props.compactAssessment &&
        (props.question.climateGiven?.comparison ||
          props.question.waterGiven?.energy ||
          props.question.lcaGiven?.recycling ||
          props.question.greenhouseGiven?.budget ||
          props.question.pollutionGiven?.equation) && (
          <details>
            <summary>About the supplied data</summary>
            <p>
              {props.question.climateGiven?.note ??
                props.question.waterGiven?.note ??
                props.question.lcaGiven?.note ??
                props.question.greenhouseGiven?.note ??
                props.question.pollutionGiven?.note}
            </p>
          </details>
        )}
      {props.question.graphenePanelData === true && props.compactAssessment && (
        <GraphenePanelEvidence />
      )}
      {props.question.bondReaction && props.compactAssessment && (
        <details className="assessment-supplied-structures">
          <summary>View supplied displayed formulae</summary>
          <BondReactionDiagram reaction={props.question.bondReaction} />
        </details>
      )}
    </>
  );
}
function HalogenResults({
  rows,
}: {
  rows: NonNullable<Question["halogenResults"]>;
}) {
  return (
    <table className="halogen-data">
      <caption>Displacement results</caption>
      <thead>
        <tr>
          <th scope="col">Added</th>
          <th scope="col">Halide</th>
          <th scope="col">Displacement?</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <th scope="row">{row.added}</th>
            <td>{row.halide}</td>
            <td>{row.reaction ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function ResponseInput({
  question,
  value,
  onChange,
  disabled = false,
  compactAssessment,
  contextLabel,
  naturalInstructions,
}: InputProps) {
  if (question.gasDrawing)
    return (
      <GasDrawingInput
        data={question.gasDrawing}
        value={value}
        onChange={onChange}
        readOnly={disabled}
      />
    );
  if (question.chromatographyDrawing)
    return (
      <ChromaDrawingInput
        data={question.chromatographyDrawing}
        value={value}
        onChange={onChange}
        readOnly={disabled}
      />
    );
  if (question.purityDrawing)
    return (
      <PurityDrawingInput
        data={question.purityDrawing}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.naturalDrawing)
    return (
      <NaturalDrawingInput
        data={question.naturalDrawing}
        instructions={naturalInstructions}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.pathwayDrawing)
    return (
      <PathwayDrawingInput
        value={value}
        onChange={onChange}
        drawing={question.pathwayDrawing}
        showGiven={!!question.pathwayGiven}
        disabled={disabled}
      />
    );
  if (question.polymerisationDrawing)
    return (
      <PolymerisationDrawingInput
        value={value}
        onChange={onChange}
        drawing={question.polymerisationDrawing}
        compact={compactAssessment}
        contextLabel={contextLabel}
        disabled={disabled}
      />
    );
  if (question.polyesterDrawing)
    return (
      <PolyesterDrawingInput
        value={value}
        onChange={onChange}
        drawing={question.polyesterDrawing}
        compact={compactAssessment}
        disabled={disabled}
      />
    );
  if (question.organicDrawing)
    return (
      <OrganicDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.organicDrawing}
        contextLabel={contextLabel}
      />
    );
  if (question.fuelDrawing)
    return (
      <FuelDrawingInput
        key={question.id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.fuelDrawing}
        contextLabel={contextLabel}
        compact={compactAssessment}
      />
    );
  if (question.alkeneDrawing)
    return (
      <AlkeneDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.alkeneDrawing}
      />
    );
  if (question.alkaneDrawing)
    return (
      <AlkaneDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.alkaneDrawing}
      />
    );
  if (question.oilBarDrawing)
    return (
      <OilBarDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.oilBarDrawing}
      />
    );
  if (question.tangentDrawing)
    return (
      <TangentDrawingInput
        graph={question.tangentDrawing}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.haberDrawing)
    return (
      <HaberDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.haberDrawing}
        compact={compactAssessment}
      />
    );
  if (question.rateDrawing)
    return (
      <RateDrawingInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        drawing={question.rateDrawing}
      />
    );
  if (question.profileDrawing)
    return (
      <ProfileDrawingInput
        compact={question.compactProfileInstructions}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.polymerRepeatDrawing)
    return (
      <PolymerConstructionInput
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.molecularLineDrawing)
    return (
      <MolecularLineConstructionInput
        question={question}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.drawCovalent)
    return (
      <CovalentConstructionInput
        question={question}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.drawDotCross)
    return (
      <IonConstructionInput
        question={question}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  if (question.rubric)
    return (
      <label
        className={`written-answer${question.shortWritten ? " short-written-answer" : ""}`}
      >
        {question.shortWritten
          ? "Your answer"
          : question.writtenEquations
            ? "Your equations"
            : "Your explanation"}
        <textarea
          aria-label={
            question.shortWritten
              ? "Your answer"
              : question.writtenEquations
                ? "Your equations"
                : "Your explanation"
          }
          rows={question.shortWritten ? 2 : 5}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <small>
          {question.shortWritten && !question.writtenEquationKind
            ? "A short phrase is enough. Compare with the examples when feedback appears; other valid answers can be accepted in manual review."
            : question.id.startsWith("ph-v1-method-") &&
                question.writtenEquations
              ? "Use ion charges and state symbols; type → or ->. Explain conservation and spectators separately. Scientific accuracy is reviewed manually."
              : question.writtenEquations &&
                  question.id.startsWith("ion-tests-v1-write-")
                ? "Use formulas and state symbols; type → or ->. Name spectator ions on a separate line. Scientific accuracy is reviewed manually."
                : question.writtenEquationKind === "half"
                  ? "Use chemical formulas, ion charges and electrons. Balance atoms and charge. You can type → or ->. State symbols are optional for this question. Include any explanation requested."
                  : question.writtenEquationKind === "symbol"
                    ? "Use chemical formulas and coefficients to write a balanced symbol equation. You can type → or ->."
                    : question.writtenEquations
                      ? "Use names for a word equation and formulas for a balanced symbol equation. For ‘both’, write one of each. You can type → or ->."
                      : "Write in your own words. Use the marking points for self-review when feedback appears."}
        </small>
      </label>
    );
  if (question.arrangement) {
    const counts = readArrangement(value);
    return (
      <>
        <label className="numeric-label">
          Your electron arrangement
          <input
            aria-label="Your electron arrangement"
            value={value}
            disabled={disabled}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
            placeholder="Inner shell, next shell, …"
          />
          <small>
            Use whole counts from inner to outer, separated by commas or dots.
            Write occupied shells.
          </small>
        </label>
        {question.drawArrangement && (
          <details className="answer-diagram" open>
            <summary>Your answer as a diagram</summary>
            {counts ? (
              <ShellDiagram
                counts={counts}
                tightView={question.readableShellDiagram}
                textLegend={question.readableShellDiagram}
                omitCentreLabel={question.readableShellDiagram}
                omitShellLabels={question.readableShellDiagram}
                labelFontSize={question.readableShellDiagram ? 14 : undefined}
                label="Your answer diagram, not marked yet"
              />
            ) : (
              <p>
                Enter your shell counts to draw your own diagram. The diagram
                shows what you enter; it does not correct your answer.
              </p>
            )}
          </details>
        )}
      </>
    );
  }
  if (question.parts) {
    let values: Record<string, string> = {};
    let unreadable = false;
    if (value) {
      try {
        const parsed: unknown = JSON.parse(value);
        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.entries(parsed).every(
            ([key, v]) =>
              question.parts!.some((p) => p.id === key) &&
              typeof v === "string",
          )
        ) {
          values = parsed as Record<string, string>;
        } else unreadable = true;
      } catch {
        unreadable = true;
      }
    }
    if (unreadable)
      return (
        <p className="feedback" role="status">
          Saved constructed answer is unreadable. Your original response is
          retained. Use Clear answer to start again; during a check, you can
          leave it unanswered.
        </p>
      );
    return (
      <>
        <div>
          {question.notation && <Nuclide notation={question.notation} />}
        </div>
        {question.haberGiven && (
          <HaberGivenFigure data={question.haberGiven} values={values} />
        )}
        {question.materialsGiven && (
          <MaterialsGivenFigure data={question.materialsGiven} />
        )}
        {question.bioGiven && <BioGivenFigure data={question.bioGiven} />}
        {question.wasteGiven && <WasteGivenFigure data={question.wasteGiven} />}
        {question.waterGiven &&
          (compactAssessment && question.waterGiven.energy ? (
            <AssessmentWaterEnergy data={question.waterGiven.energy} />
          ) : (
            <WaterGivenFigure data={question.waterGiven} />
          ))}
        {question.cycleGiven && (
          <CycleGivenFigure data={question.cycleGiven} values={values} />
        )}
        {question.pollutionGiven && (
          <PollutionGivenFigure
            data={question.pollutionGiven}
            values={values}
            compact={compactAssessment}
          />
        )}
        {question.climateGiven &&
          (compactAssessment && question.climateGiven.comparison ? (
            <AssessmentServiceGiven data={question.climateGiven.comparison} />
          ) : (
            <ClimateGivenFigure data={question.climateGiven} values={values} />
          ))}
        {question.greenhouseGiven?.budget &&
          (compactAssessment ? (
            <AssessmentEnergyGiven data={question.greenhouseGiven.budget} />
          ) : (
            <GreenhouseLedger
              data={question.greenhouseGiven.budget}
              values={values}
              validateProposal={!compactAssessment}
            />
          ))}
        {question.atmosphereGiven?.bar && (
          <AtmosphereBar data={question.atmosphereGiven.bar} values={values} />
        )}
        <fieldset
          className="multipart-answer"
          data-part-count={question.parts.length}
          disabled={disabled}
        >
          <legend>
            {question.partLegend ?? "Complete the particle counts"}
          </legend>
          {question.parts.map((part) => (
            <label key={part.id}>
              {part.label}
              <input
                aria-label={part.label}
                inputMode={part.inputMode === "numeric" ? "numeric" : "text"}
                value={values[part.id] ?? ""}
                onChange={(e) =>
                  onChange(
                    JSON.stringify({ ...values, [part.id]: e.target.value }),
                  )
                }
              />
              {part.unit && <small>{part.unit}</small>}
            </label>
          ))}
        </fieldset>
      </>
    );
  }
  return question.options ? (
    <fieldset className="answers" disabled={disabled}>
      <legend className="sr-only">Choose an answer</legend>
      {question.options.map((option, i) => (
        <label
          key={option}
          className={`answer-option ${value === option ? "selected" : ""}`}
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span className="answer-letter" aria-hidden="true">
            {String.fromCharCode(65 + i)}
          </span>
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  ) : (
    <>
      {question.notation && <Nuclide notation={question.notation} />}
      <label className="numeric-label">
        Your answer
        <div className="numeric-input">
          <input
            aria-label="Your answer"
            autoCapitalize={
              question.chemicalFormula || question.electronEquation
                ? "off"
                : undefined
            }
            spellCheck={
              question.chemicalFormula || question.electronEquation
                ? false
                : undefined
            }
            value={value}
            onChange={(e) => onChange(e.target.value)}
            inputMode={question.inputMode === "numeric" ? "numeric" : "text"}
            autoComplete="off"
            disabled={disabled}
          />
          {question.unit && <span>{question.unit}</span>}
        </div>
        <small>
          {question.electronEquation
            ? question.electronEquation.reaction.startsWith("fuel")
              ? "Use fixed chemical formulas, positive whole-number coefficients and one arrow (-> or →). Type H+ or H⁺ for the ion and e- or e⁻ for electrons. Keep element capitals; optional state symbols must match the supplied account."
              : "Type charged species and one arrow, using -> or →. Use e- or e− for electrons; Cu2+ and Cu^2+ are accepted charge styles. Keep element capitals. Optional state symbols must be appropriate."
            : question.chemicalFormula
              ? "Use correct capitals and parentheses for repeated whole ions. Type digits such as Ca(NO3)2; subscript digits are also accepted."
              : question.rounding
                ? `Write a decimal number to ${roundingLabel(question.rounding)}. Keep any required trailing zero.`
                : "Enter a number only. Fractions and scientific notation are accepted."}
        </small>
      </label>
    </>
  );
}

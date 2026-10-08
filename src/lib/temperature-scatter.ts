import type { FuelDrawingData } from "./fuel-drawing";

/** Original illustrative classroom data, separate from the published exam dataset. */
export const temperatureScatter: Record<
  "guided" | "transfer",
  FuelDrawingData
> = {
  guided: {
    data: {
      title: "Fresh-trial temperature observations A",
      context: "temperature",
      fitKind: "straight",
      xName: "Mass of salt",
      xUnit: "g",
      yName: "Lowest temperature",
      yUnit: "°C",
      points: [
        [2, 22.7],
        [4, 21.1],
        [6, 20.0],
        [8, 18.3],
        [10, 17.0],
        [12, 15.5],
      ],
      xMin: 0,
      xMax: 14,
      xTick: 2,
      yMin: 12,
      yMax: 26,
      yTick: 2,
      targetX: 0,
      estimateRange: [23.8, 24.2],
      trend: "Lowest temperature decreases as added mass increases.",
      limit:
        "The y-intercept extrapolates beyond the measured masses; it is not a measured zero-mass trial.",
      note: "One suitable reference line is T = 24.0 − 0.70m; other balanced straight fits are possible.",
    },
    referenceLine: [22.6, 15.6],
    note: "Supplied illustrative school data: each salt mass dissolves completely in fresh, equal water volumes. Starting temperature, cup, stirring and lowest-temperature measurement method are matched. These are separate trials, not cumulative additions to one cup.",
  },
  transfer: {
    data: {
      title: "Fresh-trial temperature observations B",
      context: "temperature",
      fitKind: "straight",
      xName: "Mass of salt",
      xUnit: "g",
      yName: "Lowest temperature",
      yUnit: "°C",
      points: [
        [3, 20.4],
        [6, 18.2],
        [9, 16.7],
        [12, 14.6],
        [15, 13.1],
        [18, 11.2],
      ],
      xMin: 0,
      xMax: 21,
      xTick: 3,
      yMin: 8,
      yMax: 24,
      yTick: 2,
      targetX: 0,
      estimateRange: [21.8, 22.2],
      trend: "Lowest temperature decreases as added mass increases.",
      limit:
        "A fitted intercept is an estimate beyond the measured masses, not a new measured observation.",
      note: "One suitable reference line is T = 22.0 − 0.60m; other balanced straight fits are possible.",
    },
    referenceLine: [20.2, 11.2],
    note: "Supplied illustrative school data: each salt mass dissolves completely in fresh, equal water volumes. Starting temperature, cup, stirring and lowest-temperature measurement method are matched. These are separate trials, not cumulative additions to one cup.",
  },
};

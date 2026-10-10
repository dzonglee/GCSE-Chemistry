import { ionicBondingJourney } from "../journeys/ionic-bonding";
import { tasks } from "../journeys/helpers";
import type { LabState, LabRun } from "../../lib/experiments/ionic-lab";
export const chapters = [
  {
    label: "Transfer",
    compactTitle: "Make an ion.",
    title: "One electron.\nA different charge.",
    description:
      "Move an outer electron from sodium to chlorine. Then predict sodium’s charge.",
    kicker: "01 / MAKE AN ION",
    colour: "apricot",
  },
  {
    label: "Balance",
    compactTitle: "Balance the charges.",
    title: "Two electrons.\nWhere should they go?",
    description:
      "Magnesium has two outer electrons. Decide how to distribute them between two chlorine atoms.",
    kicker: "02 / FIND THE RATIO",
    colour: "lilac",
  },
  {
    label: "Connect",
    compactTitle: "See the missing depth.",
    title: "Look beyond\nthe flat picture.",
    description:
      "Explore a sodium chloride lattice. The attraction continues in every direction.",
    kicker: "03 / ZOOM OUT",
    colour: "mint",
  },
  {
    label: "Challenge",
    compactTitle: "Build the ions.",
    title: "Your turn\nto build the ions.",
    description:
      "Build a diagram, identify the bond and explain ion formation. Feedback follows all three responses.",
    kicker: "04 / PUT IT TOGETHER",
    colour: "mint",
  },
  {
    label: "Revisit",
    compactTitle: "Rebuild it later.",
    title: "Remember it.\nRebuild it.",
    description:
      "Come back after seven days and retrieve the ideas without the worked models.",
    kicker: "05 / RETRIEVE LATER",
    colour: "lilac",
  },
] as const;
// An optional, model-rich experiment must never make familiar course questions
// look fresh. Conservatively link it to the complete existing ionic journey.
export const experimentExposure = tasks(ionicBondingJourney).map((q) => q.id);
export const forceOptions = [
  {
    id: "shared",
    title: "A shared pair of electrons",
    detail: "The electrons sit between the ions.",
  },
  {
    id: "attraction",
    title: "Electrostatic attraction",
    detail: "Oppositely charged ions attract.",
  },
  {
    id: "protons",
    title: "Protons moving between nuclei",
    detail: "The nuclei swap positive particles.",
  },
];
export function sodiumFeedback(s: LabState["nacl"]) {
  if (s.sent === 0)
    return {
      good: false,
      title: "Try the electron transfer first.",
      detail:
        "The sodium atom is still neutral: 11 protons balance its 11 electrons.",
    };
  if (!s.charge)
    return {
      good: false,
      title: "The electron moved. What about the charge?",
      detail:
        "Compare the 11 positive protons with the 10 remaining negative electrons.",
    };
  if (s.charge !== "1")
    return {
      good: false,
      title: "Losing a negative makes the ion positive.",
      detail:
        "11 protons − 10 electrons gives a charge of +1. The nucleus has not changed.",
    };
  return {
    good: true,
    title: "Exactly. One less electron, a +1 ion.",
    detail:
      "Sodium is now Na⁺ (2,8); chlorine is Cl⁻ (2,8,8). Strong electrostatic attraction between these oppositely charged ions is the ionic bond.",
  };
}
export function magnesiumFeedback(s: LabState["mgcl"]) {
  if (s.transfers.some((n) => n === 2))
    return {
      good: false,
      title: "One chlorine received both electrons.",
      detail:
        "Your proposal gives that chlorine 9 outer electrons; the other still has 7. Return one electron and give it to the other chlorine.",
    };
  if (s.transfers.some((n) => n !== 1))
    return {
      good: false,
      title: "Follow both outer electrons.",
      detail:
        "For the usual ions, magnesium loses two electrons and each chlorine gains one.",
    };
  if (s.ratio !== "2")
    return {
      good: false,
      title: "Balance the charges in the formula.",
      detail:
        "One Mg²⁺ needs two Cl⁻ ions: +2 + (−1) + (−1) = 0. Choose the number of chloride ions per magnesium ion.",
    };
  return {
    good: true,
    title: "Two recipients. One balanced formula.",
    detail:
      "MgCl₂ represents a 1:2 ratio of ions in a giant lattice. It does not mean separate three-atom molecules.",
  };
}
export function latticeFeedback(s: LabState["lattice"]) {
  if (!s.guess)
    return {
      good: false,
      title: "Make a prediction first.",
      detail:
        "Count the neighbours in the plane, then think about the direction into and out of the page.",
    };
  if (s.guess === "4")
    return {
      good: false,
      title: "Four in the plane. Two more in depth.",
      detail:
        "In this sodium chloride structure, the selected ion also has an opposite-charge neighbour above and below that plane.",
    };
  if (s.guess === "8")
    return {
      good: false,
      title: "Check the nearest neighbours.",
      detail:
        "Diagonal ions in this model are farther away. The six nearest opposite-charge neighbours lie along three axes.",
    };
  return {
    good: true,
    title: "Six neighbours, a lattice of attraction.",
    detail:
      "For sodium chloride, four nearest opposite-charge neighbours lie in this plane and two lie out of it. Strong electrostatic attraction acts in all directions throughout the giant lattice.",
  };
}
export function challengePrompts(kind: LabRun["kind"]) {
  return kind === "check"
    ? [
        "Magnesium reacts with oxygen. Show the electron transfer and label the resulting ions.",
        "What holds the ions together in an ionic compound?",
        "Describe what happens when a magnesium atom reacts with an oxygen atom. Refer to electrons.",
      ]
    : [
        "Two sodium atoms react with oxygen. Show the electron transfers and label the resulting ions.",
        "Which interaction is ionic bonding?",
        "Explain why a sodium atom becomes a positive ion when it loses an electron.",
      ];
}
export function drawingCriteria(kind: LabRun["kind"]) {
  return kind === "check"
    ? [
        "Two outer electrons transfer from the magnesium atom to oxygen.",
        "Mg²⁺ has 2,8; O²⁻ has 2,8. Oxygen’s outer shell has six original dots and two transferred crosses.",
        "Square brackets and the correct charges identify both ions. The nuclei and all 20 electrons are retained.",
      ]
    : [
        "Each sodium atom transfers one electron to oxygen: two electrons in total.",
        "Each Na⁺ has 2,8; O²⁻ has 2,8, with six original outer dots and two transferred crosses.",
        "Square brackets and correct charges identify all three ions. The nuclei and all 30 electrons are retained.",
      ];
}
export function writingReference(kind: LabRun["kind"]) {
  return kind === "check"
    ? "Magnesium loses two outer electrons and oxygen gains those two electrons. A positive magnesium ion, Mg²⁺, and a negative oxide ion, O²⁻, form with full outer shells. Their nuclei stay unchanged."
    : "The sodium nucleus still contains 11 protons. Losing one electron leaves 10 electrons, so the positive and negative charges no longer balance: the ion has a charge of +1.";
}

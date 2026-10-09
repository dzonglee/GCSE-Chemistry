import type { Metadata } from "next";
import { IonicLab } from "@/components/experiments/IonicLab";
export const metadata: Metadata = {
  title: "Ionic bonding · An interactive experiment",
  description:
    "Move electrons, build ions and explore a sodium chloride lattice in an experimental interactive chemistry lesson.",
};
export default function Page() {
  return <IonicLab />;
}

import "./haber.css";
import "./materials.css";
import "./life-cycle.css";
import "./bio-extraction.css";
import "./wastewater.css";
import "./water.css";
import "./cycle.css";
import "./pollution.css";
import "./climate.css";
import "./greenhouse.css";
import "./atmosphere.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Shell } from "@/components/Shell";
import "./globals.css";
import "./sample-lesson.css";
import "./condensation.css";
import "./pathways.css";
import "./natural.css";
import "./purity.css";
import "./chromatography.css";
import "./gas-tests.css";
import "./ion-tests.css";
import "./instrumental.css";
import "./separation.css";
const body = localFont({
  src: "./fonts/atkinson-hyperlegible-next-latin-normal.woff2",
  weight: "200 800",
  variable: "--font-body",
  display: "swap",
});
const heading = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "100 900",
  variable: "--font-heading",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
export const metadata: Metadata = {
  title: {
    default: "GCSE Chemistry · Atelier Academy",
    template: "%s · GCSE Chemistry",
  },
  description:
    "Interactive GCSE chemistry lessons, models and practice. Explore particles, test predictions and save learning on your device.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${body.variable} ${heading.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

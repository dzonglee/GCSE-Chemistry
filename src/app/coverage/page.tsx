import Link from "next/link";
import { topics, lessons } from "@/content/curriculum";
export const metadata = { title: "Coverage and sources" };
const practicals = [
  ["1. Prepare a pure, dry soluble salt", "making-soluble-salts"],
  [
    "2. Find reacting volumes by titration (Chemistry only)",
    "titration-practical",
  ],
  ["3. Investigate aqueous electrolysis", "aqueous-electrolysis-products"],
  ["4. Investigate temperature changes", "energy-practical"],
  ["5. Investigate concentration and reaction rate", "rates-practical"],
  ["6. Investigate mixtures using chromatography", "chromatography"],
  ["7. Identify ions (Chemistry only)", "ion-tests"],
  ["8. Analyse and purify water", "potable-water"],
];
export default function Page() {
  const reviewed = lessons.filter((lesson) => lesson.journey);
  const practice = reviewed.reduce(
    (n, lesson) => n + lesson.journey!.practice.length,
    0,
  );
  return (
    <article className="prose">
      <p className="eyebrow">Plan your exam preparation</p>
      <h1>Coverage and sources</h1>
      <p>
        All {reviewed.length} lessons across {topics.length} topics have
        individually authored learning journeys: warm-up, teaching and models,
        independent practice, alternate understanding checks and separate
        delayed reviews. There are {practice} independent practice tasks across
        those lessons. These counts describe activities, not distinct exam
        skills or a grade.
      </p>
      <h2>Course scope</h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link href={`/topics/${topic.slug}`}>{topic.title}</Link> —{" "}
            {lessons.filter((lesson) => lesson.topic === topic.slug).length}{" "}
            lessons
          </li>
        ))}
      </ul>
      <p>
        AQA GCSE Chemistry 8462 and the Chemistry content of Combined Science:
        Trilogy 8464 provide the working baseline. Individual lessons were
        reviewed against specification requirements and selected paired exam
        questions and mark schemes. Pearson comparisons are limited; OCR
        alignment has not been verified. The complete statement-by-statement
        course audit is still in progress.
      </p>
      <p>
        Set your tier and course in <Link href="/preferences">Preferences</Link>
        . Higher and Chemistry-only labels identify additional study
        requirements. Some common lessons offer clearly labelled Higher
        extensions. Match your study to your exact qualification; selecting a
        board does not certify alignment.
      </p>
      <h2>Practical preparation</h2>
      <p>
        These AQA Chemistry practicals have related simulations, methods,
        observations, calculations and evidence questions in the app:
      </p>
      <ul>
        {practicals.map(([name, slug]) => (
          <li key={slug}>
            <Link href={`/lessons/${slug}`}>{name}</Link>
          </li>
        ))}
      </ul>
      <p>
        Simulations help you prepare to explain and evaluate practical work.
        Real apparatus use and laboratory technique require supervised school
        practice.
      </p>
      <h2>Assessment and review</h2>
      <p>
        Each lesson reserves alternate checks and delayed-review questions.
        Helped or previously seen questions count as practice rather than fresh
        independent evidence. Written explanations, extended responses and full
        graph or molecular constructions have review criteria and reference
        responses; they receive no automatic examiner mark.
      </p>
      <p>
        <Link href="/diagnostics">Starting checks</Link> contain two 20-question
        sets. <Link href="/exams">Practice papers</Link> contain eight original
        15-question short sets: four Foundation and four Higher. They do not
        match full official paper length, mark allocation or
        assessment-objective weighting. The longer Foundation
        <Link href="/exams/paper-1-foundation-extended">
          {" "}
          Paper 1 cumulative set
        </Link>
        has 30 deliberately selected questions, including nine written
        self-reviews, diagrams, calculations and practical-method reasoning. The{" "}
        <Link href="/exams/paper-2-foundation-extended">
          Paper 2 cumulative set
        </Link>{" "}
        has 30 questions, including fourteen written or drawn self-reviews,
        chemical-test planning and evidence-based evaluation. Both include
        Chemistry-only topics and retain existing lesson exposure; neither is a
        100-mark official mock. Use full past papers from your awarding body to
        practise timing and compare your work with its mark scheme.
      </p>
      <h2>Official specifications and assessment materials</h2>
      <ul>
        <li>
          <a href="https://www.aqa.org.uk/subjects/science/gcse/chemistry-8462">
            AQA GCSE Chemistry 8462
          </a>
        </li>
        <li>
          <a href="https://www.aqa.org.uk/subjects/science/gcse/combined-science-trilogy-8464">
            AQA Combined Science: Trilogy 8464
          </a>
        </li>
        <li>
          <a href="https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html">
            Pearson Edexcel GCSE Sciences
          </a>
        </li>
        <li>
          <a href="https://www.ocr.org.uk/qualifications/gcse/chemistry-a-gateway-science-j248-from-2016/">
            OCR Chemistry A, Gateway J248
          </a>
        </li>
        <li>
          <a href="https://www.ocr.org.uk/qualifications/gcse/chemistry-b-twenty-first-century-science-suite-j258-from-2016/">
            OCR Chemistry B, Twenty First Century J258
          </a>
        </li>
      </ul>
      <h2>Interpreting models and results</h2>
      <p>
        Models and 3D structures are teaching representations. Each lesson
        explains relevant limits such as schematic particle sizes, supplied
        illustrative data, fixed-temperature comparisons and omitted reaction
        mechanisms. Original graph datasets are not industrial measurements or
        universal physical laws. Completion and software checks cannot establish
        learner mastery, an exam grade or practical competence.
      </p>
    </article>
  );
}

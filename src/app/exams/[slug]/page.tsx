import { notFound } from "next/navigation";
import { papers } from "@/content/assessments";
import { extendedPapers } from "@/content/extended-assessments";
import { AssessmentPage } from "@/components/StudyTools";
export function generateStaticParams() {
  return [...extendedPapers, ...papers].map((a) => ({ slug: a.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = [...extendedPapers, ...papers].find(
    (a) => a.slug === slug,
  );
  if (!assessment) notFound();
  return <AssessmentPage assessment={assessment} />;
}

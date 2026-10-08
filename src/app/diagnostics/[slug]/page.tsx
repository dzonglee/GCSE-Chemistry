import { notFound } from "next/navigation";
import { diagnostics } from "@/content/assessments";
import { AssessmentPage } from "@/components/StudyTools";
export function generateStaticParams() {
  return diagnostics.map((a) => ({ slug: a.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = diagnostics.find((a) => a.slug === slug);
  if (!assessment) notFound();
  return <AssessmentPage assessment={assessment} />;
}

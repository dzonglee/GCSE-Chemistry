import { notFound } from "next/navigation";
import { lessons, lessonBySlug } from "@/content/curriculum";
import { LessonExperience } from "@/components/LessonExperience";
export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: lessonBySlug(slug)?.title ?? "Lesson not found" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (!lesson) notFound();
  return <LessonExperience lesson={lesson} />;
}

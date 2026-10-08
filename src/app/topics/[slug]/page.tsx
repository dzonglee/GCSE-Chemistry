import { notFound } from "next/navigation";
import { topics } from "@/content/curriculum";
import { TopicPage } from "@/components/Course";
export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: topics.find((t) => t.slug === slug)?.title ?? "Topic not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!topics.some((t) => t.slug === slug)) notFound();
  return <TopicPage slug={slug} />;
}

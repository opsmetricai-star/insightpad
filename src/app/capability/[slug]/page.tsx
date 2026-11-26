import { notFound } from "next/navigation";
import ContentPage from "@/components/ContentPage";
import { pages } from "@/content/site";

export function generateStaticParams() {
  return Object.keys(pages).filter((k) => k.startsWith("capability/")).map((k) => ({ slug: k.split("/")[1] }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = pages[`capability/${slug}`];
  return d ? { title: d.title, description: d.lead } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = pages[`capability/${slug}`];
  if (!def) notFound();
  return <ContentPage def={def} />;
}

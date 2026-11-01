import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";
import { getCategoriesWithProjects, getPublishedProject } from "@/lib/content";

// Pages for existing projects are built ahead; new ones (added in the admin) are built on first visit.
export async function generateStaticParams() {
  const groups = await getCategoriesWithProjects();
  return groups.flatMap((g) => g.projects.map((p) => ({ slug: p.slug })));
}
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return {};
  const firstPara = project.description?.split(/\n\s*\n/)[0]?.trim();
  return {
    title: `${project.title} — ${project.category.label} — 23D Studio`,
    description: firstPara?.slice(0, 160) || `${project.title}: ${project.category.label.toLowerCase()} by 23D Studio, Nashik.`,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  return (
    <>
      <ProjectDetail project={project} />
      <Footer />
      <ChatButton />
      {/* key: re-run the scroll animations when moving between projects */}
      <Animations key={slug} />
    </>
  );
}

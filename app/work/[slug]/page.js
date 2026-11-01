import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import Animations from "@/components/Animations";
import { allProjects, getProject } from "@/components/projects";

// Build one static page per project
export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const found = getProject(slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: `${project.title} — ${project.category.label} — 23D Studio`,
    description: project.description[0] || `${project.title}: ${project.category.label.toLowerCase()} by 23D Studio, Nashik.`,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const found = getProject(slug);
  if (!found) notFound();
  return (
    <>
      <ProjectDetail {...found} />
      <Footer />
      <ChatButton />
      {/* key: re-run the scroll animations when moving between projects */}
      <Animations key={slug} />
    </>
  );
}

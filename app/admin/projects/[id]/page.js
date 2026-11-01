import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { projects } from "@/lib/store";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditProject({ params }) {
  await requireAdmin();
  const { id } = await params;
  const project = await projects.get("id", id);
  if (!project) notFound();
  return (
    <>
      <ProjectForm project={project} />
    </>
  );
}

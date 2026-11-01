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
      <h1 className="adm-h1">Edit project</h1>
      <ProjectForm project={project} />
    </>
  );
}

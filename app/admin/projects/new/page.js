import { requireAdmin } from "@/lib/auth";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProject() {
  await requireAdmin();
  return (
    <>
      <ProjectForm />
    </>
  );
}

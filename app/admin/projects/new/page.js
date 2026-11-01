import { requireAdmin } from "@/lib/auth";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NewProject() {
  await requireAdmin();
  return (
    <>
      <h1 className="adm-h1">Add project</h1>
      <ProjectForm />
    </>
  );
}

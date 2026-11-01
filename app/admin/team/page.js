import { requireAdmin } from "@/lib/auth";
import { team } from "@/lib/store";
import TeamManager from "@/components/admin/TeamManager";

export default async function TeamAdmin() {
  await requireAdmin();
  const members = await team.list();
  return (
    <>
      <h1 className="adm-h1">Team</h1>
      <p className="adm-muted">Shown in “Our Team” on the About page, in this order. Portrait photos (about 3:4) look best.</p>
      <TeamManager members={members} />
    </>
  );
}

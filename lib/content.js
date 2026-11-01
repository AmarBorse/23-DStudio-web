import "server-only";
import { projects, team } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";

// Read-only helpers for the public pages (only published projects).

export async function getCategoriesWithProjects() {
  const rows = await projects.list({ published: true });
  return CATEGORIES.map((c) => ({ ...c, projects: rows.filter((p) => p.category === c.id) }));
}

export async function getPublishedProject(slug) {
  const p = await projects.get("slug", slug);
  if (!p || !p.published) return null;
  return { ...p, category: CATEGORIES.find((c) => c.id === p.category) || { id: p.category, label: p.category } };
}

export async function getTeamMembers() {
  return team.list();
}

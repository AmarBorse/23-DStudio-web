import "server-only";
import { projects, team } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { hasPage } from "@/lib/projectRules";

// Read-only helpers for the public pages (only published projects).

export async function getCategoriesWithProjects() {
  const rows = await projects.list({ published: true });
  return CATEGORIES.map((c) => ({ ...c, projects: rows.filter((p) => p.category === c.id) }));
}

export async function getPublishedProject(slug) {
  const p = await projects.get("slug", slug);
  if (!p || !p.published || !hasPage(p) || !p.images?.length) return null;
  return { ...p, category: CATEGORIES.find((c) => c.id === p.category) || { id: p.category, label: p.category } };
}

// Projects that have their own page (for building those pages ahead of time)
export async function getProjectPageSlugs() {
  const rows = await projects.list({ published: true });
  return rows.filter((p) => hasPage(p) && p.images?.length).map((p) => p.slug);
}

export async function getTeamMembers() {
  return team.list();
}

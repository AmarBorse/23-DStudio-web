// Work categories (the tabs on the Work page). The id is stored with each project.
export const CATEGORIES = [
  { id: "visualisation", label: "Architectural Visualisation" },
  { id: "walkthroughs", label: "Architectural Walkthroughs" },
  { id: "vr", label: "Virtual Reality Tours" },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;

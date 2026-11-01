// All projects shown on the Work page and their detail pages (/work/<slug>).
//
// To add a project: add an entry to the right category with a unique slug.
// - images: the first image is the cover (Work page + top of the detail page);
//   any further images are shown one below another on the detail page.
//   w / h are the image's pixel size (keeps the layout steady while it loads).
// - description: optional paragraph(s) under the cover image. TODO: get these from the client.
export const categories = [
  {
    id: "visualisation",
    label: "Architectural Visualisation",
    projects: [
      {
        slug: "bed-room",
        title: "Bed room",
        description: [],
        images: [{ src: "/images/work-bedroom.jpg", w: 980, h: 907, alt: "Interior render of a bedroom with a study desk and warm cove lighting" }],
      },
      {
        slug: "bungalow",
        title: "Bungalow",
        description: [],
        images: [{ src: "/images/work-bungalow.jpg", w: 1048, h: 968, alt: "Exterior render of a white bungalow with a cantilevered balcony among trees" }],
      },
      {
        slug: "012-bungalow",
        title: "012 Bungalow",
        description: [],
        images: [{ src: "/images/work-012-bungalow.jpg", w: 924, h: 855, alt: "Exterior render of a two-storey bungalow with timber fins and a white car" }],
      },
    ],
  },
  {
    id: "walkthroughs",
    label: "Architectural Walkthroughs",
    projects: [
      {
        slug: "shrinathji-old-age-home",
        title: "Shrinathji old age home by TCL",
        description: [],
        images: [{ src: "/images/work-old-age-home.jpg", w: 1415, h: 795, alt: "Exterior render of the Shrinathji old age home with a landscaped lawn" }],
      },
      {
        slug: "row-house-malegaon",
        title: "Row house project in Malegoan",
        description: [],
        images: [{ src: "/images/work-row-house.jpg", w: 1152, h: 647, alt: "Exterior render of row houses with palm trees in Malegaon" }],
      },
    ],
  },
  {
    id: "vr",
    label: "Virtual Reality Tours",
    projects: [
      {
        slug: "town-project",
        title: "Town Project.",
        description: [],
        images: [{ src: "/images/work-town.jpg", w: 1536, h: 827, alt: "Aerial render of a riverside township under clouds" }],
      },
    ],
  },
];

// Flat list in page order, each project knowing its category
export const allProjects = categories.flatMap((c) => c.projects.map((p) => ({ ...p, category: c })));

export function getProject(slug) {
  const project = allProjects.find((p) => p.slug === slug);
  return project ? { project } : null;
}
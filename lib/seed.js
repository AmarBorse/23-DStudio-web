// Starting content, used the first time the local data file is created
// (the same rows are in supabase/schema.sql for the live database).
export const seedProjects = [
  { slug: "bed-room", title: "Bed room", category: "visualisation", images: [{ src: "/images/work-bedroom.jpg", w: 980, h: 907, alt: "Interior render of a bedroom with a study desk and warm cove lighting" }] },
  { slug: "bungalow", title: "Bungalow", category: "visualisation", images: [{ src: "/images/work-bungalow.jpg", w: 1048, h: 968, alt: "Exterior render of a white bungalow with a cantilevered balcony among trees" }] },
  { slug: "012-bungalow", title: "012 Bungalow", category: "visualisation", images: [{ src: "/images/work-012-bungalow.jpg", w: 924, h: 855, alt: "Exterior render of a two-storey bungalow with timber fins and a white car" }] },
  { slug: "shrinathji-old-age-home", title: "Shrinathji old age home by TCL", category: "walkthroughs", images: [{ src: "/images/work-old-age-home.jpg", w: 1415, h: 795, alt: "Exterior render of the Shrinathji old age home with a landscaped lawn" }] },
  { slug: "row-house-malegaon", title: "Row house project in Malegoan", category: "walkthroughs", images: [{ src: "/images/work-row-house.jpg", w: 1152, h: 647, alt: "Exterior render of row houses with palm trees in Malegaon" }] },
  { slug: "town-project", title: "Town Project.", category: "vr", images: [{ src: "/images/work-town.jpg", w: 1536, h: 827, alt: "Aerial render of a riverside township under clouds" }] },
].map((p, i) => ({ description: "", link: "", published: true, sort: i, ...p }));

export const seedTeam = [
  { name: "Gaurav Duse", role: "Founder", photo: "/images/team-gaurav.jpg" },
  { name: "Ritika Yeole", role: "Interior designer", photo: "/images/team-ritika.jpg" },
  { name: "Pratiksha", role: "2d Artist", photo: "/images/team-pratiksha.jpg" },
].map((m, i) => ({ sort: i, ...m }));

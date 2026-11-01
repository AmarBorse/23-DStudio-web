// Small rules shared by the Work page, the project pages and the admin.

// Does the project have its own page on this site?
// Older projects (saved before the "Create a project page" option existed) have a page unless they have a link.
export const hasPage = (p) => (typeof p.has_page === "boolean" ? p.has_page : !p.link);

// Picture on the Work page card: its own card image, or else the project page's main image
export const cardImage = (p) => p.card_image?.src ? p.card_image : p.images?.[0] || null;

// Text under the card
export const cardCaption = (p) => p.caption?.trim() || p.title;

// Where clicking the card goes
export const cardHref = (p) => (hasPage(p) ? `/work/${p.slug}` : p.link || null);

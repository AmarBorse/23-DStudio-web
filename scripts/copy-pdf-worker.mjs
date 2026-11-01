// Copies the PDF reader's worker file into public/ (runs automatically after `npm install`).
// Used by "Fill from a PDF" in the admin project form.
import { copyFileSync, mkdirSync, existsSync } from "fs";

// "legacy" build: works in older browsers too (e.g. an office PC that is not fully updated)
const src = "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs";
if (existsSync(src)) {
  mkdirSync("public/pdfjs", { recursive: true });
  copyFileSync(src, "public/pdfjs/pdf.worker.min.mjs");
}

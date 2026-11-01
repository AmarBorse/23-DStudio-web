import "server-only";
import { revalidatePath } from "next/cache";

// After any change in the admin, refresh the public pages that show it.
export function refreshPublicPages() {
  revalidatePath("/work");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/about");
}

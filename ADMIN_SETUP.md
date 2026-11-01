# Admin panel — setup

The admin lives at **/admin** (e.g. `https://your-site.vercel.app/admin`). From there you can:

- **Projects** — add, edit, hide or delete projects. The form has: Fill from a PDF (optional), basic details
  (name, card caption, service tab, project link), card image, and "Create a project page" (main image,
  description, gallery, page address). Without a project page, clicking the project opens its link directly.
- **Team** — add, edit or remove people in "Our Team" on the About page, with photo and role.
- **Enquiries** — every message sent from the Contact page, newest first. Mark as read, reply by email, delete.

Changes show on the website immediately.

## 1. Create the database (once, about 5 minutes)

1. Go to https://supabase.com, sign up (free) and create a **New project** (region: Mumbai is closest to Nashik).
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, press **Run**.
   This creates the tables, the image storage, and adds the current projects and team.
3. Open **Project Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role** key (under "Project API keys", click reveal) → this is `SUPABASE_SERVICE_ROLE_KEY`
     Keep this key secret. Never put it in the code or share it.

## 2. Add the settings to Vercel

Vercel → your project → **Settings → Environment Variables**, add these four (all environments):

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | the password you will use to log in |
| `SESSION_SECRET` | any long random text (32+ characters) |
| `SUPABASE_URL` | from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |

Then **Deployments → … → Redeploy** so the new settings are used.

## Updates

If your database was set up before the new project form, run `supabase/update-2.sql` once in the Supabase SQL Editor.

## On your computer

Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` and `SESSION_SECRET`.
If you leave the Supabase values empty, everything is saved in a local `.data` folder (not uploaded to GitHub),
which is handy for trying things out.

## Notes

- Photos are resized in the browser to max 2400 px before upload, so large renders are fine.
- Videos: upload them to YouTube or Vimeo and paste the link in "Project link".
- Without the Supabase settings, the live site still works and shows the starting projects and team,
  but saving in the admin and the contact form will not work.

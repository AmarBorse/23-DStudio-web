import { redirect } from "next/navigation";
import { isAdmin, loginConfigured } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="adm-login">
      <h1>23D Studio admin</h1>
      {loginConfigured() ? (
        <LoginForm />
      ) : (
        <p className="adm-error">Admin login is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET to the environment variables.</p>
      )}
    </div>
  );
}

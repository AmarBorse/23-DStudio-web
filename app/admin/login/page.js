import { redirect } from "next/navigation";
import { isAdmin, loginConfigured } from "@/lib/auth";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="adm-login">
      <Image className="adm-login-logo" src="/images/logo-black.png" alt="23D Studio" width={72} height={68} priority />
      <h1>Admin login</h1>
      {loginConfigured() ? (
        <LoginForm />
      ) : (
        <p className="adm-error">Admin login is not set up yet. Add ADMIN_PASSWORD and SESSION_SECRET to the environment variables.</p>
      )}
    </div>
  );
}

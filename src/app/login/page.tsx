import AuthShell from "@/components/auth-shell";
import LoginForm from "@/components/login-form";

export const metadata = { title: "BookNook | Login" };

export default function Page() {
  return <AuthShell variant="login"><LoginForm /></AuthShell>;
}

import AuthShell from "@/components/auth-shell";
import RegisterForm from "@/components/register-form";

export const metadata = { title: "BookNook | Register" };

export default function Page() {
  return <AuthShell variant="register"><RegisterForm /></AuthShell>;
}

import { headers } from "next/headers"; import { redirect } from "next/navigation"; import { auth } from "@/lib/auth";
export default async function PrivatePage({children,path}:{children:React.ReactNode;path:string}){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect(`/login?callbackURL=${encodeURIComponent(path)}`);return <>{children}</>}

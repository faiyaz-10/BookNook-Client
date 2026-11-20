import type { Metadata } from "next"; import "./globals.css"; import Navbar from "@/components/navbar"; import Footer from "@/components/footer"; import Providers from "@/components/providers";
export const metadata:Metadata={title:"BookNook | A Small Online Library",description:"Discover, borrow, and share your next great read."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers><Navbar/>{children}<Footer/></Providers></body></html>}

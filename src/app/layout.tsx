import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Atlas — Antique Illustration Studio",description:"Create consistent antique editorial engravings, one numbered plate at a time."};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}

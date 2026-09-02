import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "PR Guardian — Autonomous AI Code Review",
  description:
    "PR Guardian watches your GitHub repositories and automatically reviews pull requests using AI.",
  keywords: ["code review", "AI", "GitHub", "pull requests", "automation"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-[#030705] text-zinc-100 antialiased font-sans min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Ambient deep green / black gradient backdrop */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        >
          <div className="absolute -top-48 left-1/4 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -right-48 w-[550px] h-[550px] bg-teal-700/8 rounded-full blur-[130px]" />
          <div className="absolute -bottom-48 left-1/3 w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07]" />
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SocketProvider } from "@/components/SocketProvider";
import LiveReviewBanner from "@/components/LiveReviewBanner";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <SessionProvider session={session}>
      <SocketProvider>
        <div className="flex h-screen bg-zinc-950 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar title="PR Guardian Dashboard" />
            <LiveReviewBanner />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SocketProvider>
    </SessionProvider>
  );
}

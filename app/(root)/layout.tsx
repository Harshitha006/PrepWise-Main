import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/sign-in");

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15,15,35,0.95)",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#fff",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}

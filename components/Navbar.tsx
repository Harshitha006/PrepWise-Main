import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth";
import NavbarClient from "./NavbarClient";
import { Zap } from "lucide-react";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="page-container h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-cyber text-sm text-white tracking-wider group-hover:text-cyan-400 transition-colors">
            PREPWISE
          </span>
          <span className="hidden sm:block text-xs text-zinc-600 font-mono ml-1">
            v2.1
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/resume"
            className="text-xs text-zinc-400 hover:text-cyan-400 font-mono transition-colors hidden sm:block"
          >
            Mock Interview
          </Link>
          <Link
            href="/history"
            className="text-xs text-zinc-400 hover:text-cyan-400 font-mono transition-colors hidden sm:block"
          >
            History
          </Link>
          <NavbarClient user={user} />
        </div>
      </div>
    </nav>
  );
}

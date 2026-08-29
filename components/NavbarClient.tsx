"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "@/types/resume";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function NavbarClient({ user }: { user: User | null }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 outline-none cursor-pointer">
        <div className="w-7 h-7 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
          <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <span className="text-xs text-zinc-300 font-mono hidden sm:block max-w-[100px] truncate">
          {user?.name || "User"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#0f0f23]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 w-48"
      >
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white font-mono font-bold truncate">
            {user?.name}
          </p>
          <p className="text-xs text-zinc-500 font-mono truncate">
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="rounded-xl hover:bg-white/5 cursor-pointer text-zinc-300 hover:text-white"
        >
          <Link
            href="/settings"
            className="flex items-center gap-2 font-mono text-xs py-2 px-3"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="rounded-xl hover:bg-red-500/10 cursor-pointer text-red-400 hover:text-red-300 font-mono text-xs py-2 px-3"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

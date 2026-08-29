import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Shield } from "lucide-react";
import SettingsDangerZone from "@/components/SettingsDangerZone";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-6 w-6 text-cyan-400" />
          <h1 className="font-cyber text-2xl text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-cyan-400" />
              <h2 className="font-cyber text-sm text-white">Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  Name
                </label>
                <p className="text-sm text-white font-mono mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  Email
                </label>
                <p className="text-sm text-white font-mono mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  Member Since
                </label>
                <p className="text-sm text-white font-mono mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-purple-400" />
              <h2 className="font-cyber text-sm text-white">Preferences</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-xs font-mono text-zinc-300">Voice Interview Mode</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-xs font-mono text-zinc-300">Theme</span>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                  Dark (Fixed)
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-mono text-zinc-300">AI Model</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                  Gemini 1.5 Flash
                </span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-emerald-400" />
              <h2 className="font-cyber text-sm text-white">Security</h2>
            </div>
            <p className="text-xs font-mono text-zinc-500">
              Your session is secured with Firebase authentication. Session cookies expire after 5 days.
            </p>
          </div>

          <SettingsDangerZone userId={user.id} />
        </div>
      </div>
    </div>
  );
}

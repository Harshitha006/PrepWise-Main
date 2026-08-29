"use client";

import { useState } from "react";
import { clearUserData } from "@/lib/actions/general";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsDangerZone({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  const handleClear = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await clearUserData(userId);
      toast.success("History cleared successfully!");
      setConfirm(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to clear data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-red-500/20">
      <div className="flex items-center gap-3 mb-4">
        <Trash2 className="h-5 w-5 text-red-400" />
        <h2 className="font-cyber text-sm text-white">Danger Zone</h2>
      </div>
      <p className="text-xs font-mono text-zinc-500 mb-6">
        This will permanently delete all your interview history, feedback, and parsed resume data.
      </p>
      
      <button
        onClick={handleClear}
        disabled={loading}
        className={`w-full py-3 rounded-xl border font-mono text-xs transition-all flex items-center justify-center gap-2 ${
          confirm 
            ? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30" 
            : "bg-white/5 border-white/10 text-zinc-400 hover:border-red-500/30 hover:text-red-400"
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : confirm ? (
          <>
            <AlertTriangle className="h-4 w-4" /> Click again to confirm delete
          </>
        ) : (
          "Clear All My Data"
        )}
      </button>
      {confirm && (
        <button 
          onClick={() => setConfirm(false)}
          className="w-full mt-2 text-[10px] text-zinc-600 hover:text-zinc-400 font-mono"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

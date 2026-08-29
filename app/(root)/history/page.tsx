import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewsByUserId } from "@/lib/actions/general";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviews = await getInterviewsByUserId(user.id);

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex items-center gap-3">
        <Clock className="h-6 w-6 text-cyan-400" />
        <h1 className="font-cyber text-2xl text-white">Interview History</h1>
        <span className="text-xs font-mono text-zinc-500 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
          {interviews.length} sessions
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Clock className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 font-mono">No interview history yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {interviews.map((i) => (
            <InterviewCard key={i.id} interview={i} />
          ))}
        </div>
      )}
    </div>
  );
}

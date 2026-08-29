import { getCurrentUser } from "@/lib/actions/auth";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general";
import InterviewCard from "@/components/InterviewCard";
import DashboardHero from "@/components/DashboardHero";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mic, FileText, Clock, TrendingUp, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const myInterviews = await getInterviewsByUserId(user.id);

  return (
    <div className="page-container py-10 space-y-16">
      {/* Hero */}
      <DashboardHero 
        userName={user?.name?.split(" ")[0] || "User"} 
        hasResume={!!(user as any).lastAnalysis}
        stats={{
          sessions: myInterviews.length,
          thisWeek: myInterviews.filter((i) => {
            const d = new Date(i.createdAt);
            const now = new Date();
            const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 7;
          }).length
        }}
      />

      {/* My Interviews */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cyber text-xl text-white tracking-wide">
            Your Interviews
          </h2>
          <Link
            href="/interview"
            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Create new
          </Link>
        </div>
        {myInterviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Mic className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 font-mono text-sm mb-6">
              No interviews yet. Start your first one.
            </p>
            <Link
              href="/interview"
              className="cyber-btn inline-flex items-center gap-2"
            >
              <Mic className="h-4 w-4" /> Generate Interview
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {myInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

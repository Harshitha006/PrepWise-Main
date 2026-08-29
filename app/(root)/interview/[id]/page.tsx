import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewById } from "@/lib/actions/general";
import { redirect, notFound } from "next/navigation";
import Agent from "@/components/Agent";
import { Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id, user.id);
  if (!interview) notFound();

  return (
    <div className="page-container py-10">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400 font-mono transition-colors mb-8"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        {/* Interview Info */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-cyber text-xl text-white mb-2">
                {interview.role}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-zinc-300 capitalize">
                  {interview.type}
                </span>
                <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-zinc-300 capitalize">
                  {interview.level}
                </span>
                <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-zinc-300">
                  {interview.questions.length} questions
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(interview.createdAt)}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/10">
            {interview.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg text-cyan-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <Agent
          username={user.name}
          userId={user.id}
          type="interview"
          interviewId={id}
          questions={interview.questions}
        />
      </div>
    </div>
  );
}

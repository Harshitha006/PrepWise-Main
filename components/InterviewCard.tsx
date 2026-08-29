import Link from "next/link";
import { Calendar, Layers, ChevronRight, MessageSquare } from "lucide-react";
import type { Interview } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import DeleteInterviewButton from "./DeleteInterviewButton";

const COVER_COLORS: Record<string, string> = {
  technical: "from-blue-900/60 via-cyan-900/40 to-blue-900/60",
  behavioral: "from-purple-900/60 via-violet-900/40 to-purple-900/60",
  mixed: "from-emerald-900/60 via-teal-900/40 to-emerald-900/60",
};

const LEVEL_BADGE: Record<string, string> = {
  junior: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  mid: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  senior: "bg-red-500/20 border-red-500/40 text-red-300",
};

export default function InterviewCard({
  interview,
}: {
  interview: Interview;
}) {
  const gradientClass = COVER_COLORS[interview.type] || COVER_COLORS.mixed;
  const levelClass = LEVEL_BADGE[interview.level] || LEVEL_BADGE.mid;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,212,255,0.2)] hover:border-cyan-500/30">
      {/* Cover */}
      <div
        className={`h-32 bg-gradient-to-br ${gradientClass} relative overflow-hidden terminal-scanline bg-cover bg-center`}
        style={{ backgroundImage: `url(${interview.coverImage})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="font-cyber text-6xl text-white tracking-widest">
            AI
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <span
            className={`px-2 py-1 text-xs font-mono border rounded-lg capitalize ${levelClass}`}
          >
            {interview.level}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 text-xs font-mono bg-black/50 border border-white/20 rounded-lg capitalize text-white">
            {interview.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-mono font-bold text-sm mb-3 truncate">
          {interview.role}
        </h3>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {interview.techStack.slice(0, 4).map((tech, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all"
            >
              {tech}
            </span>
          ))}
          {interview.techStack.length > 4 && (
            <span className="px-2 py-1 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-zinc-400">
              +{interview.techStack.length - 4}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mb-5">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            {interview.questions.length} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(interview.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/interview/${interview.id}`}
            className="flex-1 cyber-btn py-2.5 text-sm flex items-center justify-center gap-2"
          >
            Take Interview
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/interview/${interview.id}/feedback`}
            className="ghost-btn py-2.5 px-3 text-sm flex items-center justify-center"
            title="View Feedback"
          >
            <Layers className="h-4 w-4" />
          </Link>
          <DeleteInterviewButton interviewId={interview.id} userId={interview.userId} />
        </div>
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/general";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Star, TrendingUp, AlertCircle,
  CheckCircle, RotateCcw, Brain, MessageSquare,
  Shield, Zap, Target, AlertTriangle
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-black text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs font-mono text-zinc-400 text-center leading-tight">{label}</span>
    </div>
  );
}

function ToneChip({ tone }: { tone: string }) {
  const colors: Record<string, string> = {
    confident: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    assertive: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
    neutral: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300",
    hesitant: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    nervous: "bg-orange-500/20 border-orange-500/40 text-orange-300",
    uncertain: "bg-red-500/20 border-red-500/40 text-red-300",
  };
  return (
    <span className={cn("px-2 py-1 text-xs font-mono border rounded-lg capitalize", colors[tone] || colors.neutral)}>
      {tone}
    </span>
  );
}

function StarBadge({ has, label }: { has: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono",
      has
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-600"
    )}>
      <span>{has ? "✓" : "✗"}</span>
      {label}
    </div>
  );
}

function BehavioralBar({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-zinc-400">{label}</span>
        <span style={{ color }} className="font-bold">{score}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [interview, feedback] = await Promise.all([
    getInterviewById(id, user.id),
    getFeedbackByInterviewId(id, user.id),
  ]);

  if (!interview) notFound();

  if (!feedback) {
    return (
      <div className="page-container py-20 text-center">
        <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
          <h2 className="font-cyber text-xl text-white mb-3">No Feedback Yet</h2>
          <p className="text-zinc-400 font-mono text-sm mb-6">Complete the interview first.</p>
          <Link href={`/interview/${id}`} className="cyber-btn inline-flex items-center gap-2">
            Take Interview
          </Link>
        </div>
      </div>
    );
  }

  const f = feedback as any;
  const totalColor = f.totalScore >= 70 ? "#10b981" : f.totalScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreColors = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#f472b6"];

  return (
    <div className="page-container py-10 space-y-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400 font-mono transition-colors">
        <ChevronLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      {/* Hero Score */}
      <div className="glass-card rounded-3xl p-8 neon-glow text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,212,255,0.2) 0%, transparent 70%)` }}
        />
        <div className="relative z-10">
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider mb-6">Interview Performance Report</p>
          <div className="flex justify-center mb-6">
            <ScoreRing score={f.totalScore} label="Overall Score" color={totalColor} />
          </div>
          <h1 className="font-cyber text-2xl text-white mb-2">{interview.role}</h1>
          <p className="text-zinc-400 font-mono text-sm mb-4 max-w-xl mx-auto">{f.finalAssessment}</p>

          {/* Tone Badge */}
          {f.overallSentiment && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs text-zinc-500 font-mono">Overall Tone:</span>
              <ToneChip tone={f.overallSentiment.tone} />
              <span className={cn(
                "text-xs font-mono px-2 py-1 rounded-lg border",
                f.overallSentiment.label === "positive" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" :
                f.overallSentiment.label === "negative" ? "bg-red-500/20 border-red-500/40 text-red-300" :
                "bg-zinc-500/20 border-zinc-500/40 text-zinc-300"
              )}>
                {f.overallSentiment.label}
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 text-xs font-mono text-zinc-500 mt-4">
            <span>{interview.type} interview</span>
            <span>·</span>
            <span>{interview.level} level</span>
            <span>·</span>
            <span>{formatDate(f.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 4 Key Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Behavioral Score", value: f.behavioralScore, color: "#7c3aed", icon: Brain },
          { label: "Mindset Score", value: f.mindsetScore, color: "#00d4ff", icon: Shield },
          { label: "STAR Usage", value: f.starUsageRate, color: "#10b981", icon: Target },
          { label: "Communication", value: f.overallCommunication?.clarity || 0, color: "#f59e0b", icon: MessageSquare },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 text-center">
            <item.icon className="h-5 w-5 mx-auto mb-3" style={{ color: item.color }} />
            <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs text-zinc-500 font-mono">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Category Scores */}
      <div className="glass-card rounded-2xl p-8">
        <h2 className="font-cyber text-lg text-white mb-6 flex items-center gap-2">
          <Star className="h-5 w-5 text-cyan-400" /> Score Breakdown
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {f.categories?.map((cat: any, i: number) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <ScoreRing score={cat.score} label={cat.name} color={scoreColors[i % scoreColors.length]} />
              <p className="text-xs text-zinc-500 font-mono text-center max-w-[120px]">{cat.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Analysis */}
      {f.overallBehavioral && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-cyber text-lg text-white mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" /> Behavioral Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <BehavioralBar label="Ownership & Responsibility" score={f.overallBehavioral.ownershipScore} />
            <BehavioralBar label="Problem-Solving Mindset" score={f.overallBehavioral.problemSolvingScore} />
            <BehavioralBar label="Adaptability" score={f.overallBehavioral.adaptabilityScore} />
            <BehavioralBar label="Leadership Signals" score={f.overallBehavioral.leadershipScore} />
            <BehavioralBar label="Honesty & Authenticity" score={f.overallBehavioral.honestyScore} />
            <BehavioralBar label="Willingness to Learn" score={f.overallBehavioral.willingnessToLearn} />
          </div>
        </div>
      )}

      {/* Communication Analysis */}
      {f.overallCommunication && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-cyber text-lg text-white mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" /> Communication Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6">
            <BehavioralBar label="Clarity" score={f.overallCommunication.clarity} />
            <BehavioralBar label="Confidence" score={f.overallCommunication.confidence} />
            <BehavioralBar label="Structure" score={f.overallCommunication.structure} />
            <BehavioralBar label="Conciseness" score={f.overallCommunication.conciseness} />
          </div>

          {f.overallCommunication.issues?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-mono text-red-400 uppercase tracking-wider mb-3">Issues Detected</p>
              <div className="flex flex-wrap gap-2">
                {f.overallCommunication.issues.map((issue: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 text-xs font-mono bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl">
                    ⚠ {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {f.overallCommunication.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-3">Communication Strengths</p>
              <div className="flex flex-wrap gap-2">
                {f.overallCommunication.strengths.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Red Flags + Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {f.topRedFlags?.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-cyber text-sm text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Red Flags Detected
            </h3>
            <ul className="space-y-3">
              {f.topRedFlags.map((flag: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-mono text-red-300">
                  <div className="w-5 h-5 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-400 text-xs">!</span>
                  </div>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-cyber text-sm text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Strengths
          </h3>
          <ul className="space-y-3">
            {f.strengths?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-mono text-zinc-300">
                <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-cyber text-sm text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {f.areasToImprove?.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm font-mono text-zinc-300">
                <div className="w-5 h-5 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs">→</span>
                </div>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Per-Answer Analysis */}
      {f.answerAnalyses?.length > 0 && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="font-cyber text-lg text-white mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" /> Answer-by-Answer Breakdown
          </h2>
          <div className="space-y-6">
            {f.answerAnalyses.map((a: any, i: number) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">
                      Question {i + 1}
                    </p>
                    <p className="text-sm text-white font-mono">{a.question}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <div className={cn(
                      "text-xl font-black",
                      a.overallAnswerScore >= 70 ? "text-emerald-400" :
                      a.overallAnswerScore >= 50 ? "text-amber-400" : "text-red-400"
                    )}>
                      {a.overallAnswerScore}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">/100</div>
                  </div>
                </div>

                {/* Tone + Sentiment */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <ToneChip tone={a.sentiment?.tone} />
                  <span className={cn(
                    "px-2 py-1 text-xs font-mono border rounded-lg",
                    a.sentiment?.label === "positive" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" :
                    a.sentiment?.label === "negative" ? "bg-red-500/20 border-red-500/40 text-red-300" :
                    "bg-zinc-500/20 border-zinc-500/40 text-zinc-300"
                  )}>
                    {a.sentiment?.label}
                  </span>
                </div>

                {/* STAR Breakdown */}
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">
                    STAR Method — {a.star?.starScore}/100
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StarBadge has={a.star?.hasSituation} label="Situation" />
                    <StarBadge has={a.star?.hasTask} label="Task" />
                    <StarBadge has={a.star?.hasAction} label="Action" />
                    <StarBadge has={a.star?.hasResult} label="Result" />
                  </div>
                  {a.star?.feedback && (
                    <p className="text-xs text-zinc-500 font-mono mt-2">{a.star.feedback}</p>
                  )}
                </div>

                {/* Behavioral flags */}
                {a.behavioral?.redFlags?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {a.behavioral.redFlags.map((f: string, j: number) => (
                        <span key={j} className="px-2 py-1 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                          ⚠ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {a.behavioral?.positiveSignals?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {a.behavioral.positiveSignals.map((s: string, j: number) => (
                        <span key={j} className="px-2 py-1 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coaching Tip */}
                {a.coachingTip && (
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 mt-3">
                    <p className="text-xs font-mono text-cyan-300">
                      <span className="text-cyan-400 font-bold">💡 Coach: </span>
                      {a.coachingTip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Summary */}
      {f.coachingSummary && (
        <div className="glass-card rounded-2xl p-8 neon-glow">
          <h2 className="font-cyber text-lg text-white mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" /> AI Coach Summary
          </h2>
          <p className="text-sm font-mono text-zinc-300 leading-relaxed">{f.coachingSummary}</p>
        </div>
      )}

      {/* Transcript */}
      {f.transcript?.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-cyber text-sm text-white mb-4">Full Transcript</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {f.transcript.map((msg: any, i: number) => (
              <div key={i} className={cn(
                "p-3 rounded-xl font-mono text-xs",
                msg.role === "interviewer"
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 mr-12"
                  : "bg-purple-500/10 border border-purple-500/20 text-purple-100 ml-12"
              )}>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider mb-1 block",
                  msg.role === "interviewer" ? "text-cyan-400" : "text-purple-400"
                )}>
                  {msg.role}
                </span>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center pb-8">
        <Link href={`/interview/${id}`} className="ghost-btn flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Retake Interview
        </Link>
        <Link href="/interview" className="cyber-btn flex items-center gap-2">
          New Interview
        </Link>
      </div>
    </div>
  );
}

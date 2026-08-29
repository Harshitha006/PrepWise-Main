import { isAuthenticated } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Mic, FileText, TrendingUp, ChevronRight } from "lucide-react";

export default async function LandingPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/dashboard");

  return (
    <div
      className="min-h-screen bg-[#0a0a0f]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(0,212,255,0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 50%)
        `,
      }}
    >
      {/* Nav */}
      <nav className="h-14 border-b border-white/10 flex items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-cyber text-sm text-white tracking-wider">
            PREPWISE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="ghost-btn py-2 px-4 text-xs">
            Sign In
          </Link>
          <Link href="/sign-up" className="cyber-btn py-2 px-4 text-xs">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="page-container py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-cyan-400 font-mono tracking-wider">
            AI INTERVIEW TERMINAL v2.1 ONLINE
          </span>
        </div>

        <h1 className="font-cyber text-5xl sm:text-6xl md:text-7xl text-white mb-6 leading-[0.95]">
          PREP<span className="text-cyan-400">WISE</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 font-mono max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered interview coaching. Resume analysis. Voice mock interviews.
          Land your next role.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="cyber-btn inline-flex items-center gap-2 justify-center"
          >
            <Mic className="h-5 w-5" /> Start Practicing Free
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="ghost-btn inline-flex items-center gap-2 justify-center py-4"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="page-container pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10 border-cyan-500/20",
              title: "Resume Analysis",
              desc: "10-dimension ATS scoring, skill gap detection, and recruiter simulation. Know exactly what to fix.",
            },
            {
              icon: Mic,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
              title: "Voice Interviews",
              desc: "Real-time voice mock interviews using your browser — zero cost, zero setup. Just speak and practice.",
            },
            {
              icon: TrendingUp,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
              title: "AI Feedback",
              desc: "Per-dimension scoring on communication, technical depth, and problem solving. Improve every session.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:border-white/20"
            >
              <div
                className={`w-10 h-10 ${f.bg} border rounded-xl flex items-center justify-center mb-4`}
              >
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-cyber text-sm text-white mb-2">{f.title}</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Row */}
      <section className="page-container pb-24">
        <div className="glass-card rounded-3xl p-8 neon-glow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10+", label: "ATS Dimensions" },
              { value: "100%", label: "Browser Native" },
              { value: "5-Star", label: "AI Feedback" },
              { value: "Free", label: "Zero Cost" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-cyan-400 mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

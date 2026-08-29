"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, FileText, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  userName: string;
  hasResume: boolean;
  stats: {
    sessions: number;
    thisWeek: number;
  };
}

export default function DashboardHero({ userName, hasResume, stats }: DashboardHeroProps) {
  return (
    <section className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden neon-glow">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 50%, rgba(0,212,255,0.15) 0%, transparent 50%),
            radial-gradient(circle at 90% 50%, rgba(124,58,237,0.15) 0%, transparent 50%)
          `,
        }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              hasResume ? "bg-emerald-400" : "bg-amber-400"
            )} />
            <span className="text-xs text-zinc-400 font-mono tracking-wider uppercase">
              {hasResume ? "Identity Verified" : "Verification Required"}
            </span>
          </div>
          <h1 className="font-cyber text-3xl sm:text-4xl text-white mb-3 leading-tight">
            Welcome back,
            <br />
            <span className="text-cyan-400">{userName}</span>
          </h1>
          <p className="text-zinc-400 font-mono text-sm max-w-md">
            {hasResume 
              ? "Your resume is analyzed. You've unlocked tailored mock interviews."
              : "To get started, please upload your resume for ATS analysis and interview tailoring."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          {!hasResume ? (
            <Link
              href="/resume"
              className="cyber-btn flex items-center gap-3 justify-center px-10 py-5"
            >
              <Zap className="h-5 w-5" /> 
              Upload & Analyze Resume
            </Link>
          ) : (
            <>
              <Link
                href="/interview"
                className="cyber-btn flex items-center gap-2 justify-center"
              >
                <Mic className="h-4 w-4" /> Start Interview
              </Link>
              <Link
                href="/resume"
                className="ghost-btn flex items-center gap-2 justify-center"
              >
                <FileText className="h-4 w-4" /> Update Resume
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/10">
        {[
          {
            icon: Mic,
            label: "Sessions",
            value: stats.sessions,
            color: "text-cyan-400",
          },
          {
            icon: FileText,
            label: "This Week",
            value: stats.thisWeek,
            color: "text-purple-400",
          },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <stat.icon
              className={`h-5 w-5 ${stat.color} mx-auto mb-2`}
            />
            <div className={`text-2xl font-black ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Removed the locked warning banner as per user request */}
    </section>
  );
}

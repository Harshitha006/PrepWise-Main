"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mic, Info } from "lucide-react";
import Agent from "@/components/Agent";

interface InterviewFlowGuardProps {
  user: {
    id: string;
    name: string;
  };
}

export default function InterviewFlowGuard({ user }: InterviewFlowGuardProps) {
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const resume = localStorage.getItem(`last_parsed_resume_${user.id}`);
    if (!resume) {
      toast.error("Please upload your resume first to unlock personalized interviews!");
      router.push("/resume");
    } else {
      setHasResume(true);
    }
  }, [router]);

  if (hasResume === null) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
          <Mic className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-mono tracking-wider uppercase">
            INTERVIEW GENERATOR
          </span>
        </div>
        <h1 className="font-cyber text-3xl text-white mb-3">
          Create Your Interview
        </h1>
        <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto">
          Our AI will ask you a few questions about your target role and
          create a personalized interview session based on your resume.
        </p>
      </div>

      {/* How it works */}
      <div className="glass-card rounded-2xl p-5 mb-8 border border-white/10">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono text-zinc-300 font-bold mb-1">
              Personalized for You
            </p>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              Based on your uploaded resume, we've unlocked a tailored
              interview generation flow. Speak or type your answers to
              the next 5 questions.
            </p>
          </div>
        </div>
      </div>

      <Agent username={user.name} userId={user.id} type="generate" />
    </div>
  );
}

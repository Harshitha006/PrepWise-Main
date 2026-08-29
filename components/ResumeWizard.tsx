"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Zap, TrendingUp, BarChart3, Mic } from "lucide-react";
import { toast } from "sonner";
import type { ResumeAnalysisState } from "@/types/resume";

interface ResumeWizardProps {
  userId: string;
  initialAnalysis?: ResumeAnalysisState['parsedResume'] | null;
  initialAts?: ResumeAnalysisState['atsScore'] | null;
}

export default function ResumeWizard({ userId, initialAnalysis, initialAts }: ResumeWizardProps) {
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisState | null>(
    initialAnalysis ? {
      step: 1,
      completed: [true, true, true, true, true],
      parsedResume: initialAnalysis,
      atsScore: initialAts as any,
    } : null
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("targetRole", role);
    formData.append("targetDescription", description);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze resume");

      setAnalysis({
        step: 1,
        completed: [true, true, false, false, false],
        parsedResume: data.analysis.parsedResume,
        atsScore: data.analysis.atsScore,
      });

      // Save to localStorage for interview tailoring
      localStorage.setItem(`last_parsed_resume_${userId}`, JSON.stringify(data.analysis.parsedResume));
      
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error analyzing resume. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-20 text-center neon-glow">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin" />
          <Zap className="absolute inset-0 m-auto h-8 w-8 text-cyan-400 animate-pulse" />
        </div>
        <h2 className="font-cyber text-xl text-white mb-4">Deep Scanning Resume...</h2>
        <p className="text-zinc-500 font-mono text-sm animate-pulse">
          Extracting text, analyzing ATS compatibility, and identifying skill gaps...
        </p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-cyan-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Overall Score</span>
              <BarChart3 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{analysis.atsScore?.overall}%</div>
          </div>
          <div className="glass-card rounded-2xl p-6 border-l-4 border-purple-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">ATS Status</span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div className={`text-xl font-bold uppercase tracking-wider ${analysis.atsScore?.passFail === 'pass' ? 'text-emerald-400' : 'text-red-400'}`}>
              {analysis.atsScore?.passFail}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 border-l-4 border-emerald-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Experience</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">{analysis.parsedResume?.experience.length} Roles</div>
          </div>
          <div className="glass-card rounded-2xl p-6 border-l-4 border-blue-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Skills Found</span>
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white">
              {Object.values(analysis.parsedResume?.skills || {}).flat().length} Total
            </div>
          </div>
        </div>

        {/* ATS Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card rounded-3xl p-8">
            <h3 className="font-cyber text-sm text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              ATS Dimension Breakdown
            </h3>
            <div className="space-y-6">
              {analysis.atsScore?.dimensions.map((dim, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono tracking-wider">
                    <span className="text-zinc-400 uppercase">{dim.name}</span>
                    <span className={dim.score > 70 ? "text-emerald-400" : dim.score > 40 ? "text-amber-400" : "text-red-400"}>
                      {dim.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${dim.score > 70 ? "bg-emerald-500" : dim.score > 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <h3 className="font-cyber text-sm text-white mb-6 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-purple-400" />
              Critical Fixes & Recommendations
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {analysis.atsScore?.dimensions.flatMap(d => d.issues).map((issue, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">{issue}</p>
                </div>
              ))}
              {analysis.atsScore?.dimensions.flatMap(d => d.suggestions).map((sug, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed">{sug}</p>
                </div>
              ))}
              {/* Resume Gaps Section */}
              {(analysis.atsScore as any).resumeGaps?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Target Role Gaps Identified
                  </h4>
                  <div className="space-y-2">
                    {(analysis.atsScore as any).resumeGaps.map((gap: string, i: number) => (
                      <div key={i} className="flex gap-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">{gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/interview"
            className="cyber-btn flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Start Personalized Interview
          </Link>
          <button 
            onClick={() => {
              setAnalysis(null);
              setShowUpload(false);
            }}
            className="ghost-btn"
          >
            Upload New Resume
          </button>
        </div>
      </div>
    );
  }

  if (!showUpload) {
    return (
      <div className="glass-card rounded-3xl p-10 animate-fade-in neon-glow">
        <h2 className="font-cyber text-xl text-white mb-2 text-center">Tell us about your target role</h2>
        <p className="text-zinc-500 font-mono text-xs mb-8 text-center">This helps us analyze your resume specifically for the job.</p>
        
        <div className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Target Job Role (Optional)</label>
            <input 
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Job Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <button 
            onClick={() => setShowUpload(true)}
            className="w-full cyber-btn py-4 flex items-center justify-center gap-2"
          >
            Continue to Upload
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-10 text-center animate-fade-in neon-glow">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Upload className="h-8 w-8 text-purple-400" />
      </div>
      <h2 className="font-cyber text-lg text-white mb-3">Upload Resume PDF</h2>
      <p className="text-zinc-500 font-mono text-xs mb-6 max-w-xs mx-auto">
        Analyzing for: <span className="text-cyan-400">{role || "General Role"}</span>
      </p>
      <label className="cyber-btn cursor-pointer inline-flex items-center gap-2 px-8">
        <FileText className="h-4 w-4" />
        Choose PDF File
        <input 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          onChange={handleFileUpload}
        />
      </label>
      <button 
        onClick={() => setShowUpload(false)}
        className="block mx-auto mt-6 text-[10px] font-mono text-zinc-500 hover:text-white transition-colors"
      >
        ← Back to details
      </button>
    </div>
  );
}

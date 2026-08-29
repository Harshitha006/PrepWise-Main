import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { FileText, Zap } from "lucide-react";
import ResumeWizard from "@/components/ResumeWizard";

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="page-container py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <FileText className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-purple-400 font-mono tracking-wider">
              RESUME ANALYZER
            </span>
          </div>
          <h1 className="font-cyber text-3xl text-white mb-3">
            Analyze Your Resume
          </h1>
          <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto">
            Upload your resume PDF for 10-dimension ATS scoring, skill gap
            analysis, and AI-powered improvement recommendations.
          </p>
        </div>

        {/* Wizard */}
        <ResumeWizard 
          userId={user.id} 
          initialAnalysis={(user as any).lastAnalysis?.parsedResume}
          initialAts={(user as any).lastAnalysis?.atsScore}
        />


      </div>
    </div>
  );
}

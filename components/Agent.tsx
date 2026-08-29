"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSpeech } from "@/hooks/useSpeech";
import type { CallStatus, AgentMessage } from "@/types/interview";
import {
  Mic,
  Phone,
  PhoneOff,
  Volume2,
  Loader2,
  MessageSquare,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentProps {
  username: string;
  userId: string;
  type: "generate" | "interview";
  interviewId?: string;
  questions?: string[];
}

const GENERATE_FLOW = [
  {
    field: "questionsCount",
    prompt: "How many questions would you like for this mock interview? Say a number, or say five for the default.",
  },
  {
    field: "role",
    prompt: "What is the job role you are targeting? You can say skip to base it on your resume.",
  },
  {
    field: "description",
    prompt: "Any specific job description or company you are applying to? Say skip to move on.",
  },
  {
    field: "salary",
    prompt: "What is the expected salary package? This helps set the difficulty level. Say skip if you prefer not to share.",
  },
];

export default function Agent({
  username,
  userId,
  type,
  interviewId,
  questions = [],
}: AgentProps) {
  const router = useRouter();
  const {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    transcript,
    silenceCountdown,
    isSupported,
  } = useSpeech();

  const [callStatus, setCallStatus] = useState<CallStatus>("inactive");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [resolveAnswer, setResolveAnswer] = useState<((val: string) => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep textInput in sync with live transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setTextInput(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: AgentMessage["role"], content: string) => {
    setMessages((prev) => [...prev, { role, content, timestamp: Date.now() }]);
  };

  /**
   * getAnswer — waits for the user's spoken or typed answer.
   *
   * In VOICE mode (type === "interview"):
   *   - startListening() returns a promise that auto-resolves after
   *     SILENCE_TIMEOUT_MS (4 s) of silence or when "Finish Answer" is tapped.
   *
   * In GENERATE mode (type === "generate"):
   *   - Voice starts, but we ALSO watch for a manual text submission.
   *   - Whichever fires first wins.
   */
  const getAnswer = (): Promise<string> => {
    if (type === "interview" && isSupported) {
      // Pure voice — the hook's silence timer drives resolution
      return startListening();
    }

    // generate mode — race voice vs text submit
    return new Promise<string>((resolve) => {
      setResolveAnswer(() => resolve);
      if (isSupported) {
        startListening().then((spokenAnswer) => {
          // Only use this if the text submit hasn't already fired
          setResolveAnswer((current) => {
            if (current) {
              resolve(spokenAnswer);
              return null;
            }
            return null;
          });
        }).catch(() => {});
      }
    });
  };

  const getDefaultAnswer = (field: string) => {
    const defaults: Record<string, string> = {
      questionsCount: "5",
      role: "Based on Resume",
      description: "N/A",
      salary: "N/A",
    };
    return defaults[field] || "skipped";
  };

  /* ─── Interview generation flow ─── */
  const handleGenerateFlow = async () => {
    const greeting = `Hello ${username}! I'm your AI interview coach. I'll ask you ${GENERATE_FLOW.length} quick questions to create a personalized interview. Let's begin.`;
    addMessage("interviewer", greeting);
    await speak(greeting);

    const collected: Record<string, string> = {};

    for (let i = 0; i < GENERATE_FLOW.length; i++) {
      const step = GENERATE_FLOW[i];
      addMessage("interviewer", step.prompt);
      await speak(step.prompt);

      let answer = await getAnswer();
      stopListening();
      setResolveAnswer(null);
      setTextInput("");

      if (!answer || ["skip", "skipped", "n/a", ""].includes(answer.toLowerCase().trim())) {
        answer = getDefaultAnswer(step.field);
      }

      addMessage("candidate", answer);
      collected[step.field] = answer;

      const transition = "Recorded.";
      addMessage("interviewer", transition);
      await speak(transition);
    }

    const finalMessage =
      "I have everything I need. Generating your personalized interview now. This will just take a moment.";
    addMessage("interviewer", finalMessage);
    await speak(finalMessage);

    try {
      let parsedResume = null;
      try {
        const stored = localStorage.getItem(`last_parsed_resume_${userId}`);
        if (stored) parsedResume = JSON.parse(stored);
      } catch {}

      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: collected.role === "Based on Resume" ? "" : collected.role,
          jobDescription: collected.description === "N/A" ? "" : collected.description,
          questionsCount: collected.questionsCount || "5",
          salary: collected.salary === "N/A" ? "" : collected.salary,
          parsedResume,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const doneMessage = "Your interview is ready! Redirecting you to the dashboard now.";
      addMessage("interviewer", doneMessage);
      await speak(doneMessage);
      setCallStatus("finished");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      toast.error("Failed to generate interview. Please try again.");
      setCallStatus("finished");
    }
  };

  /* ─── Live mock interview flow ─── */
  const handleInterviewFlow = async () => {
    const greeting = `Hello ${username}! I'm your AI interviewer today. I'll ask you ${questions.length} questions. After each answer, stay silent for a moment and I'll move to the next question automatically. You can also tap "Finish Answer" anytime to move on. Let's begin.`;
    addMessage("interviewer", greeting);
    await speak(greeting);

    const answers: Array<{ question: string; answer: string; duration: number }> = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionText = `Question ${i + 1} of ${questions.length}: ${q}`;
      addMessage("interviewer", questionText);
      await speak(questionText);

      const startTime = Date.now();
      const answer = await getAnswer(); // resolves via silence timer or "Finish Answer"
      const duration = Math.round((Date.now() - startTime) / 1000);

      addMessage("candidate", answer || "No answer provided.");
      answers.push({ question: q, answer: answer || "No answer provided.", duration });

      if (i < questions.length - 1) {
        const transition = i < questions.length - 2 ? "Proceeding." : "Last question coming up.";
        addMessage("interviewer", transition);
        await speak(transition);
      }
    }

    const closing =
      "That's all the questions. Thank you for your time. Generating your feedback now.";
    addMessage("interviewer", closing);
    await speak(closing);
    setCallStatus("finished");

    try {
      let parsedResume = null;
      try {
        const stored = localStorage.getItem(`last_parsed_resume_${userId}`);
        if (stored) parsedResume = JSON.parse(stored);
      } catch {}

      const transcriptText = answers
        .map((a) => `Interviewer: ${a.question}\nCandidate: ${a.answer}\n[Duration: ${a.duration}s]`)
        .join("\n\n");

      const res = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          userId,
          transcript: transcriptText,
          questions,
          parsedResume,
        }),
      });

      if (!res.ok) throw new Error("Feedback failed");

      toast.success("Feedback generated!");
      router.push(`/interview/${interviewId}/feedback`);
    } catch {
      toast.error("Could not generate feedback. Redirecting to dashboard.");
      router.push("/dashboard");
    }
  };

  const startCall = async () => {
    setCallStatus("connecting");
    await new Promise((r) => setTimeout(r, 800));
    setCallStatus("active");
    if (type === "generate") await handleGenerateFlow();
    else await handleInterviewFlow();
  };

  const endCall = () => {
    stopListening();
    stopSpeaking();
    setCallStatus("finished");
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  // Manual text submit (generate mode only)
  const handleTextSubmit = () => {
    const val = textInput.trim();
    if (!val) return;
    stopListening();
    if (resolveAnswer) {
      resolveAnswer(val);
      setResolveAnswer(null);
    }
    setTextInput("");
  };

  // "Finish Answer" button — for interview mode to manually end recording
  const handleFinishAnswer = () => {
    stopListening();
    // stopListening signals the hook to resolve the promise with whatever was captured
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden neon-glow relative">
      {/* Terminal Header */}
      <div className="bg-black/60 border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                callStatus === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
              )}
            />
          </div>
          <span className="font-mono text-xs text-zinc-400 tracking-wider hidden sm:block">
            PREPWISE INTERVIEW TERMINAL
          </span>
          <span className="font-mono text-xs text-zinc-400 tracking-wider sm:hidden">
            PREPWISE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" />}
          {isListening && <Mic className="h-4 w-4 text-emerald-400 animate-pulse" />}
          <span className="text-xs font-mono text-zinc-500 capitalize">{callStatus}</span>
        </div>
      </div>

      {/* Avatars */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-black/20">
        {/* AI Interviewer */}
        <div
          className={cn(
            "glass-card rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300",
            isSpeaking && "neon-glow"
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 flex items-center justify-center",
                isSpeaking
                  ? "border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                  : "border-cyan-500/30"
              )}
            >
              <span className="text-xl sm:text-2xl">🤖</span>
            </div>
            {isSpeaking && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-white font-bold">AI Interviewer</p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Waiting"}
            </p>
          </div>
        </div>

        {/* Candidate */}
        <div
          className={cn(
            "glass-card rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300",
            isListening && "amethyst-glow"
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border-2 flex items-center justify-center",
                isListening
                  ? "border-purple-400 shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                  : "border-purple-500/30"
              )}
            >
              <span className="text-xl sm:text-2xl">👤</span>
            </div>
            {isListening && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-purple-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-white font-bold truncate max-w-[80px] sm:max-w-none">
              {username}
            </p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              {isListening ? "Recording..." : "You"}
            </p>
          </div>
        </div>
      </div>

      {/* Silence countdown banner */}
      {isListening && silenceCountdown !== null && (
        <div className="mx-4 sm:mx-6 mb-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
          <Timer className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-mono text-amber-300">
            Submitting in {silenceCountdown}s — keep speaking or tap{" "}
            <strong>Finish Answer</strong>
          </span>
        </div>
      )}

      {/* Transcript */}
      <div className="h-44 sm:h-52 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-black/30">
        {messages.length === 0 && callStatus === "inactive" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-600 font-mono text-sm text-center px-4">
              Press the call button to start your{" "}
              {type === "generate" ? "interview creation session" : "mock interview"}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "p-3 rounded-xl font-mono text-xs leading-relaxed",
              msg.role === "interviewer"
                ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 mr-6 sm:mr-8"
                : "bg-purple-500/10 border border-purple-500/20 text-purple-100 ml-6 sm:ml-8"
            )}
          >
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider mb-1 block",
                msg.role === "interviewer" ? "text-cyan-400" : "text-purple-400"
              )}
            >
              {msg.role === "interviewer" ? "AI" : username}
            </span>
            {msg.content}
          </div>
        ))}
        {isListening && transcript && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 ml-6 sm:ml-8">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
              You (live)
            </span>
            <span className="font-mono text-xs text-zinc-300">{transcript}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Text input (generate mode or no-voice fallback) */}
      {callStatus === "active" && type === "generate" && (
        <div className="px-4 sm:px-6 py-3 bg-black/20 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextSubmit(); }}
              placeholder={isSupported ? "Speak or type your answer..." : "Type your answer..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-mono transition-all"
            >
              Send
            </button>
          </div>
          {!isSupported && (
            <p className="text-xs text-amber-400 font-mono mt-2">
              ⚠ Voice not supported. Use Chrome for best experience.
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 bg-black/40 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
        {callStatus === "inactive" && (
          <button
            onClick={startCall}
            className="cyber-btn flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-4"
          >
            <Phone className="h-5 w-5" />
            {type === "generate" ? "Generate Interview" : "Start Interview"}
          </button>
        )}

        {callStatus === "connecting" && (
          <button disabled className="cyber-btn flex items-center gap-3 px-10 py-4 opacity-70">
            <Loader2 className="h-5 w-5 animate-spin" /> Connecting...
          </button>
        )}

        {callStatus === "active" && (
          <>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              {isListening ? (
                <><Mic className="h-4 w-4 text-emerald-400 animate-pulse" /> Listening</>
              ) : isSpeaking ? (
                <><Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" /> AI Speaking</>
              ) : (
                <><MessageSquare className="h-4 w-4" /> Processing</>
              )}
            </div>

            {/* "Finish Answer" — only shown during interview mode while listening */}
            {isListening && type === "interview" && (
              <button
                onClick={handleFinishAnswer}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-xl font-mono text-xs transition-all"
              >
                ✓ Finish Answer
              </button>
            )}

            <button
              onClick={endCall}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 hover:text-red-300 rounded-2xl font-mono text-sm transition-all"
            >
              <PhoneOff className="h-4 w-4" /> End Session
            </button>
          </>
        )}

        {callStatus === "finished" && (
          <div className="flex items-center gap-2 text-sm font-mono text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Session complete. Redirecting...
          </div>
        )}
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";

const sentimentSchema = z.object({
  label: z.enum(["positive", "neutral", "negative"]),
  confidence: z.number().min(0).max(100),
  tone: z.enum(["confident", "hesitant", "nervous", "assertive", "uncertain"]),
});

const communicationSchema = z.object({
  clarity: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  conciseness: z.number().min(0).max(100),
  issues: z.array(z.string()),
  strengths: z.array(z.string()),
});

const behavioralSchema = z.object({
  ownershipScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  adaptabilityScore: z.number().min(0).max(100),
  leadershipScore: z.number().min(0).max(100),
  honestyScore: z.number().min(0).max(100),
  willingnessToLearn: z.number().min(0).max(100),
  redFlags: z.array(z.string()),
  positiveSignals: z.array(z.string()),
});

const starSchema = z.object({
  hasSituation: z.boolean(),
  hasTask: z.boolean(),
  hasAction: z.boolean(),
  hasResult: z.boolean(),
  starScore: z.number().min(0).max(100),
  feedback: z.string(),
});

const answerAnalysisSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  transcript: z.string(),
  sentiment: sentimentSchema,
  communication: communicationSchema,
  behavioral: behavioralSchema,
  star: starSchema,
  overallAnswerScore: z.number().min(0).max(100),
  coachingTip: z.string(),
});

const enhancedFeedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categories: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    comment: z.string(),
  })),
  answerAnalyses: z.array(answerAnalysisSchema),
  overallSentiment: sentimentSchema,
  overallCommunication: communicationSchema,
  overallBehavioral: behavioralSchema,
  mindsetScore: z.number().min(0).max(100),
  behavioralScore: z.number().min(0).max(100),
  starUsageRate: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasToImprove: z.array(z.string()),
  topRedFlags: z.array(z.string()),
  topStrengths: z.array(z.string()),
  finalAssessment: z.string(),
  coachingSummary: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { interviewId, userId, transcript, questions, parsedResume } = await req.json();

    if (!interviewId || !userId || !transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: enhancedFeedbackSchema,
      prompt: `
        You are an expert behavioral interview coach and psychologist with 20 years of experience 
        evaluating candidates for top tech companies.

        Analyze this interview transcript with DEEP behavioral, sentiment, and communication analysis.
        
        IMPORTANT: This transcript was captured via Voice-to-Text. You MUST analyze it as a spoken interview.
        Each answer includes a [Duration: Xs] tag indicating how long the candidate spoke.
        
        Focus heavily on:
        - Verbal confidence and presence.
        - Detection of filler words (um, uh, like, you know).
        - Time management: Answering too quickly (<15s) suggests lack of depth; too slowly (>90s) suggests rambling.
        - Evaluate if the length of the answer [Duration] matches the complexity of the question.
        
        The candidate was NOT allowed to type; every word here was spoken aloud. 
        Evaluate their confidence and verbal fluency accordingly.

        ${parsedResume ? `
        CONTEXT - CANDIDATE RESUME DATA:
        - Summary: ${parsedResume.summary}
        - Experience: ${parsedResume.experience.map((e: any) => `${e.title} at ${e.company}`).join(", ")}
        - Skills: ${Object.values(parsedResume.skills).flat().join(", ")}
        
        Evaluate if the candidate's answers align with their claimed experience and skills.
        ` : ""}

        === TRANSCRIPT ===
        ${transcript}

        === QUESTIONS ASKED ===
        ${JSON.stringify(questions || [])}

        === ANALYSIS INSTRUCTIONS ===

        For EACH candidate answer, analyze:

        1. SENTIMENT ANALYSIS
           - Label: positive/neutral/negative (based on attitude, not content)
           - Tone: confident/hesitant/nervous/assertive/uncertain
           - Look for: filler words (um, uh, like, you know), hedging phrases ("I think maybe", "sort of")
           - Confidence signals: declarative statements, specific examples, no excessive apologizing

        2. COMMUNICATION QUALITY
           - Clarity (0-100): Is the answer easy to understand? No jargon overload?
           - Confidence (0-100): Does the person sound sure of themselves?
           - Structure (0-100): Is there a logical flow? Beginning, middle, end?
           - Conciseness (0-100): Did they get to the point or ramble?
           - Flag issues like:
             * "Rambling detected" — answer > 3 minutes with no clear point
             * "One-word answer" — answer < 15 words
             * "Excessive filler words" — more than 5 filler words
             * "Said I don't know without elaborating" — gave up without attempting
             * "Spoke in we/they instead of I" — not taking personal ownership
             * "No concrete example given" — stayed theoretical

        3. BEHAVIORAL INDICATORS
           - Ownership (0-100): Do they say "I did" vs "we did" or "they caused"?
           - Problem Solving (0-100): Do they describe breaking problems into steps?
           - Adaptability (0-100): Evidence of handling change or unexpected situations?
           - Leadership (0-100): Taking initiative, helping others, driving outcomes?
           - Honesty (0-100): Do they admit mistakes? Avoid fake perfection?
           - Willingness to Learn (0-100): Do they mention what they learned from failures?
           
           Red flags to detect:
           * "Blamed teammates" — shifts responsibility to others
           * "No failure acknowledged" — claims perfection
           * "Said I don't know" without any attempt to reason
           * "Gave theoretical answer to behavioral question"
           * "No result mentioned in story"
           * "Arrogance detected" — dismissive of others' contributions
           
           Positive signals to detect:
           * "Took initiative" — acted without being told
           * "Acknowledged failure with learning" — honest + growth mindset
           * "Used STAR structure" — organized storytelling
           * "Gave specific metrics" — "improved by 30%", "saved 2 hours"
           * "Showed empathy in conflict" — considered others' perspective

        4. STAR METHOD DETECTION
           - Situation: Did they set context? (When/where/what was happening)
           - Task: Did they explain their specific responsibility?
           - Action: Did they describe what THEY personally did? (not the team)
           - Result: Did they share the outcome? Ideally with numbers/learning?
           - STAR Score: 25 points per component present

        5. MINDSET EVALUATION
           Confidence (not arrogance): Speaking clearly without putting others down
           Willingness to learn: Mentioning growth, asking questions, improving
           Honesty: Admitting challenges, not pretending everything was perfect

        6. COACHING TIP
           Give ONE specific, actionable improvement tip per answer.
           Example: "Next time, end your answer with a concrete result — 
           what changed because of your action?"

        === SCORING ===
        - Total Score: weighted (Technical 30%, Behavioral 25%, Communication 25%, Mindset 20%)
        - Be honest. Don't inflate scores. A score of 60 is decent for a fresher.
        - behavioralScore = average of all behavioral indicator scores
        - mindsetScore = average of (confidence + honesty + willingnessToLearn) normalized
        - starUsageRate = percentage of behavioral answers that used STAR structure

        === OUTPUT RULES ===
        - Be specific, not generic
        - Reference actual things they said
        - coachingSummary: 3-4 sentences summarizing the biggest behavioral patterns observed
        - topRedFlags: maximum 3, only real issues found
        - topStrengths: maximum 3, only genuine strengths observed
      `,
    });

    const feedbackDoc = {
      interviewId,
      userId,
      ...object,
      transcript: transcript.split("\n").filter(Boolean).map((line: string) => {
        const isInterviewer = line.startsWith("Interviewer:");
        return {
          role: isInterviewer ? "interviewer" : "candidate",
          content: line.replace(/^(Interviewer:|Candidate:)\s*/, "").trim(),
        };
      }),
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("feedback").add(feedbackDoc);

    return NextResponse.json({ success: true, feedback: feedbackDoc });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

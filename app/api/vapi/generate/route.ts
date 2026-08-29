import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "PrepWise Interview API v2.1",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, jobDescription, userId, parsedResume, questionsCount, salary } = body;

    if (!userId || !parsedResume) {
      return NextResponse.json(
        { error: "Missing required fields (userId or resume)" },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        questions: z.array(z.string()).min(1).max(20),
        inferredLevel: z.enum(["junior", "mid", "senior"]),
        inferredType: z.enum(["technical", "behavioral", "mixed"]),
        inferredTechStack: z.array(z.string()),
      }),
      prompt: `
        You are an expert technical recruiter and interviewer. 
        Your goal is to generate a set of highly personalized interview questions.

        INPUT DATA:
        1. Target Role: ${role || "Based on Resume"}
        2. Job Description: ${jobDescription || "Not provided"}
        3. Target Salary/Level: ${salary || "Not specified"}
        4. Candidate's Resume: ${JSON.stringify(parsedResume)}
        5. Question Count: ${questionsCount || 5}

        === INSTRUCTIONS ===
        - If Target Role/Description are provided, tailor questions heavily to that specific role and the gap between the candidate's resume and the job requirements.
        - If Target Role/Description are NOT provided, base questions entirely on the candidate's Resume, focusing on their primary skills and experience.
        - Use the Target Salary (${salary}) to set the difficulty level.
        - MAINTAIN A NEUTRAL, PROFESSIONAL TONALITY. 
        - AVOID using positive affirmations or filler words like "Great", "Good", "Excellent", "I see", or "Understood" in the questions.
        - The interviewer should be direct and objective, similar to a high-stakes board interview.
        - Generate exactly ${questionsCount || 5} questions.
        - Mix question types: Behavioral, Technical, and Situational.
        - Do NOT number the questions.
      `,
    });

    const docRef = await adminDb.collection("interviews").add({
      userId,
      role: role || "General Interview",
      type: object.inferredType,
      level: object.inferredLevel,
      techStack: object.inferredTechStack,
      questions: object.questions,
      coverImage: `/covers/cover${Math.floor(Math.random() * 4) + 1}.svg`,
      finalized: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, interviewId: docRef.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Generation failed";
    console.error("Generate interview error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

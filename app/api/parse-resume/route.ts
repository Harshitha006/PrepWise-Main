import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  console.log("Resume upload request received");
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const targetRole = formData.get("targetRole") as string;
    const targetDescription = formData.get("targetDescription") as string;

    if (!file || !userId) {
      console.error("Missing file or userId");
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    console.log(`Analyzing file: ${file.name} for user: ${userId} targeting: ${targetRole}`);
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    
    console.log("Sending to Gemini for native PDF analysis...");
    
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        parsedResume: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string().optional(),
          location: z.string().optional(),
          summary: z.string(),
          experience: z.array(
            z.object({
              title: z.string(),
              company: z.string(),
              dates: z.string(),
              bullets: z.array(z.string()),
            })
          ),
          projects: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              tech: z.array(z.string()),
              link: z.string().optional(),
            })
          ),
          education: z.array(
            z.object({
              degree: z.string(),
              institution: z.string(),
              dates: z.string(),
              gpa: z.string().optional(),
            })
          ),
          skills: z.record(z.string(), z.array(z.string())),
        }),
        atsScore: z.object({
          overall: z.number(),
          passFail: z.enum(["pass", "fail"]),
          dimensions: z.array(
            z.object({
              name: z.string(),
              score: z.number(),
              weight: z.number(),
              issues: z.array(z.string()),
              suggestions: z.array(z.string()),
            })
          ),
          resumeGaps: z.array(z.string()),
          summary: z.string(),
        }),
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this resume PDF. 
              
              TARGET JOB DETAILS:
              Role: ${targetRole || "General"}
              Description: ${targetDescription || "Not provided"}

              TASKS:
              1. Parse into structured format. 
              2. Provide ATS scoring (0-100) across 10 dimensions.
              3. Identify specific gaps between the resume and the target job (skills missing, experience lacking, etc.). If no target is provided, identify general industry gaps for their level.
              
              Return the data in the specified JSON format.`,
            },
            {
              type: "file",
              data: base64Data,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
    });

    // Save to Firestore so the dashboard knows the user has a resume
    await adminDb.collection("users").doc(userId).set({
      lastAnalysis: object,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      analysis: object,
    });
  } catch (error: any) {
    console.error("Resume parsing error details:", error);
    return NextResponse.json(
      { error: error?.message || "Analysis failed" },
      { status: 500 }
    );
  }
}

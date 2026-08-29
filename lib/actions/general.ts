"use server";

/**
 * PrepWise General Actions v2.1 (Production Stable)
 */

import { adminDb } from "@/lib/firebaseAdmin";
import type { Interview, InterviewFeedback } from "@/types/resume";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  const snap = await adminDb
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Interview[];
}

export async function getLatestInterviews(userId: string): Promise<Interview[]> {
  // Fetch latest interviews for the user
  const snap = await adminDb
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snap.docs
    .map((doc) => ({ ...doc.data(), id: doc.id } as Interview))
    .filter((i) => i.finalized)
    .slice(0, 6);
}

export async function getInterviewById(
  id: string,
  userId: string
): Promise<Interview | null> {
  const doc = await adminDb.collection("interviews").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data || data.userId !== userId) return null;
  return { ...data, id: doc.id } as Interview;
}

export async function getFeedbackByInterviewId(
  interviewId: string,
  userId: string
): Promise<InterviewFeedback | null> {
  const snap = await adminDb
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data() as InterviewFeedback;
}

export async function deleteInterviewById(
  id: string,
  userId: string
): Promise<void> {
  const interviewDoc = adminDb.collection("interviews").doc(id);
  const interview = await interviewDoc.get();

  if (interview.exists && interview.data()?.userId === userId) {
    const batch = adminDb.batch();
    batch.delete(interviewDoc);

    const feedbackSnap = await adminDb
      .collection("feedback")
      .where("interviewId", "==", id)
      .where("userId", "==", userId)
      .get();

    feedbackSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

export async function clearUserData(userId: string): Promise<void> {
  // Delete interviews
  const interviews = await adminDb
    .collection("interviews")
    .where("userId", "==", userId)
    .get();
  const feedback = await adminDb
    .collection("feedback")
    .where("userId", "==", userId)
    .get();

  const batch = adminDb.batch();
  interviews.docs.forEach((doc) => batch.delete(doc.ref));
  feedback.docs.forEach((doc) => batch.delete(doc.ref));

  // Reset user analysis
  batch.update(adminDb.collection("users").doc(userId), {
    lastAnalysis: null,
    updatedAt: new Date().toISOString(),
  });

  await batch.commit();
}

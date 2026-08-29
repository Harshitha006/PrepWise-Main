"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import type { User } from "@/types/resume";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;
    if (!session) return null;

    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    if (!userData) return null;
    return { ...userData, id: userDoc.id } as User;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getCurrentUser());
}

export async function createSession(idToken: string): Promise<void> {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });
  const cookieStore = await cookies();
  cookieStore.set("__session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
}

export async function createUserRecord(
  uid: string,
  name: string,
  email: string,
  photoURL?: string
): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);
  const existing = await userRef.get();
  if (!existing.exists) {
    await userRef.set({
      name,
      email,
      photoURL: photoURL || null,
      createdAt: new Date().toISOString(),
    });
  }
}
